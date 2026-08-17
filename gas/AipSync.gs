/**
 * AipSync.gs — ดึงแผนภูมิการบินจาก eAIP ของ CAAT เข้า Drive ตามรอบ AIRAC
 *
 *   aipStart()    เริ่มรอบใหม่ (สร้างคิว + ตั้ง trigger เดินงานเอง)
 *   aipStatus()   ดูความคืบหน้า
 *   aipStop()     ยกเลิกกลางคัน
 *   aipDaily()    ตัวที่ trigger รายวันเรียก — เริ่มให้เองเมื่อถึงรอบใหม่
 *
 * ── วิธีเข้าถึงเอกสาร ────────────────────────────────────────
 * เข้าหน้าแรก aip.caat.or.th อ่านตาราง "Currently Effective Issue" แล้วใช้
 * วันที่จากลิงก์นั้นตรง ๆ ไม่ใช้วันที่ที่เราคำนวณเอง — เพื่อรับประกันว่าเป็น
 * ฉบับที่ CAAT ประกาศว่าใช้อยู่จริง ณ ตอนที่ดึง
 * แต่ยังคำนวณเทียบไว้ด้วย ถ้าไม่ตรงกันจะเตือน (แปลว่าตารางรอบเปลี่ยนไปจากเดิม)
 *
 * ── ทำไมต้องแบ่งรอบทำ ───────────────────────────────────────
 * 12 สนามบินมีแผนภูมิรวม ~356 ใบ ดาวน์โหลดทีเดียวไม่ทันเวลาที่ Apps Script ให้
 * (6 นาที) จึงเก็บคิวไว้ในไฟล์ JSON บน Drive แล้วเดินทีละชุด
 * มี trigger เรียกซ้ำจนครบ แล้วลบ trigger ตัวเองทิ้ง
 *
 * ── เรื่องลิงก์ ─────────────────────────────────────────────
 * ใช้โฟลเดอร์เดิมแล้วเปลี่ยนชื่อวันที่ ไม่สร้างใหม่ เพราะ Drive คง ID ไว้ตอน
 * เปลี่ยนชื่อ ลิงก์ที่วางในเว็บแอปจึงไม่พังทุกรอบ
 * ไฟล์ในโฟลเดอร์ลบของเก่าทิ้งในรอบเดียวกับที่ใส่ของใหม่ จึงไม่มีจังหวะที่สองรอบ
 * อยู่ด้วยกัน — กันหยิบผิดฉบับ
 */

var AIP_SITE = 'https://aip.caat.or.th';
var AIP_ADS = ['VTBD', 'VTBU', 'VTUU', 'VTUD', 'VTUW', 'VTUI',
               'VTUV', 'VTUL', 'VTPP', 'VTUK', 'VTPH', 'VTUQ'];
var AIP_STATE = 'AIP_SYNC_STATE.json';   // ไฟล์คิวใน subfolder AIP
var AIP_BUDGET_MS = 4.5 * 60 * 1000;     // หยุดก่อนโดนตัดที่ 6 นาที

/* ── โฟลเดอร์ ─────────────────────────────────────────────── */
function aipRoot_() {
  var parent = DriveApp.getFolderById(cfg_('PARENT_FOLDER_ID'));
  var it = parent.getFoldersByName('AIP Charts');
  return it.hasNext() ? it.next() : parent.createFolder('AIP Charts');
}

/** โฟลเดอร์ของสนามบิน — มีอยู่แล้วก็เปลี่ยนแค่ชื่อ ID เดิมลิงก์เดิม */
function aipAdFolder_(icao, effText) {
  var root = aipRoot_(), want = icao + ' ' + effText, found = null;
  var it = root.getFolders();
  while (it.hasNext()) {
    var f = it.next();
    if (f.getName() === icao || f.getName().indexOf(icao + ' ') === 0) { found = f; break; }
  }
  if (!found) return root.createFolder(want);
  if (found.getName() !== want) found.setName(want);
  return found;
}

function aipSub_(folder, name) {
  var it = folder.getFoldersByName(name);
  return it.hasNext() ? it.next() : folder.createFolder(name);
}

/* ── อ่านหน้าเว็บ ──────────────────────────────────────────── */
function aipFetch_(url) {
  var r = UrlFetchApp.fetch(url, { muteHttpExceptions: true,
    headers: { 'User-Agent': 'D-0507 document control' } });
  if (r.getResponseCode() !== 200)
    throw new Error('โหลดไม่ได้ (' + r.getResponseCode() + ') ' + url);
  return r.getContentText();
}

/**
 * ฉบับที่ใช้อยู่จริงตามที่ CAAT ประกาศ — อ่านจากตาราง Currently Effective Issue
 * คืน { date: '2026-08-06', text: '06 AUG 2026', amdt: 'AIRAC AIP AMDT 08/26' }
 */
function aipCurrentIssue_() {
  var html = aipFetch_(AIP_SITE + '/');
  var i = html.search(/Currently\s+Effective\s+Issue/i);
  if (i < 0) throw new Error('หน้าแรกไม่มีหัวข้อ Currently Effective Issue — โครงเว็บอาจเปลี่ยน');
  var next = html.search(/Next\s+Issues/i);
  var block = html.slice(i, next > i ? next : i + 4000);

  var m = block.match(/(\d{4}-\d{2}-\d{2})-AIRAC\/html\/index-en-GB\.html/);
  if (!m) throw new Error('หาลิงก์ของฉบับที่ใช้อยู่ไม่เจอ');
  var date = m[1];

  var t = block.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ');
  var dm = t.match(/(\d{1,2}\s+[A-Z]{3}\s+\d{4})/);
  var am = t.match(/AIRAC\s+AIP\s+AMDT\s+\d{2}\/\d{2}/i);

  // เทียบกับที่เราคำนวณ ถ้าต่างกันแปลว่าตารางรอบไม่เป็นไปตามที่เข้าใจ
  var calc = aipCycleOn_(new Date());
  if (calc && calc.date !== date)
    Logger.log('⚠️ วันที่เว็บ (%s) ไม่ตรงกับที่คำนวณ (%s) — ยึดของเว็บ', date, calc.date);

  return { date: date, text: dm ? dm[1] : date, amdt: am ? am[0] : '',
           cycle: calc && calc.date === date ? calc.cycle : '' };
}

/** รอบ AIRAC ที่ครอบวันนี้ — หมุดเดียวกับ tools/airac.py */
function aipCycleOn_(when) {
  var anchor = Date.UTC(2020, 0, 2), CYC = 28 * 86400000;
  var t = anchor, y = when.getUTCFullYear(), n = 0, start = null;
  while (new Date(t + CYC - 1) < when) t += CYC;
  start = t;
  var yr = new Date(start).getUTCFullYear(), s2 = anchor;
  while (new Date(s2).getUTCFullYear() < yr) s2 += CYC;
  n = Math.round((start - s2) / CYC) + 1;
  return { cycle: String(yr % 100) + ('0' + n).slice(-2),
           date: new Date(start).toISOString().slice(0, 10) };
}

/* ── แยกชนิดและตั้งชื่อไฟล์ ────────────────────────────────── */
var AIP_KINDS = [
  [/Aerodrome Chart/i,                        'Aerodrome Chart',   'Airport chart'],
  [/Aircraft Parking\/Docking/i,              'Parking',           'Airport chart'],
  [/Aerodrome Ground Movement/i,              'Ground Movement',   'Airport chart'],
  [/Aerodrome Obstacle/i,                     'Obstacle',          'Airport chart'],
  [/Precision Approach Terrain/i,             'Terrain',           'Airport chart'],
  [/\(SID\)/i,                                'SID',               'Chart'],
  [/\(STAR\)/i,                               'STAR',              'Chart'],
  [/Instrument Approach Chart/i,              'IAP',               'Chart'],
  [/VFR ENTRY AND EXIT/i,                     'VFR Entry & Exit',  'Chart'],
  [/VFR OVERFLY/i,                            'VFR Overfly',       'Chart'],
  [/VFR/i,                                    'VFR',               'Chart']
];

/**
 * ชื่อไฟล์จากชื่อแผนภูมิ
 * "Standard Departure Chart - Instrument (SID) - ICAO - RNAV RWY 21L - ALBOS3C AD 2-VTBD-6-1"
 *   -> { sub:'Chart', name:'VTBD SID RNAV RWY 21L ALBOS3C (AD 2-VTBD-6-1)' }
 * เก็บเลขหน้าไว้ท้ายชื่อ เพราะหลายใบชื่อเหมือนกันเป๊ะ ต่างกันแค่หน้า
 */
function aipName_(icao, raw) {
  var kind = 'Chart', sub = 'Chart';
  for (var i = 0; i < AIP_KINDS.length; i++) {
    if (AIP_KINDS[i][0].test(raw)) { kind = AIP_KINDS[i][1]; sub = AIP_KINDS[i][2]; break; }
  }
  var page = '';
  var pm = raw.match(/AD\s+2-[A-Z]{4}-[\d-]+\s*$/);
  if (pm) { page = pm[0].trim(); raw = raw.slice(0, pm.index); }

  // ตัดหัวชนิด และคำว่า ICAO ที่คั่นอยู่ เหลือแต่ส่วนที่บอกว่าใบไหน
  var desc = raw
    .replace(/^.*?\(SID\)|^.*?\(STAR\)/i, '')
    .replace(/^(Instrument Approach Chart|Aerodrome Chart|Aircraft Parking\/Docking Chart|Aerodrome Ground Movement Chart|Aerodrome Obstacle Chart|Precision Approach Terrain Chart|VFR[A-Z\s]*CHART)/i, '')
    .replace(/-?\s*ICAO\s*-?/i, ' ')
    .replace(/\s+/g, ' ').replace(/^[\s-]+|[\s-]+$/g, '');

  /* ตัดรายชื่อ waypoint ออก — SID ของ VTBD ลากมาสิบเอ็ดชื่อ (ALBOS3C BONVO3C ...)
     ทำให้ชื่อไฟล์ยาวเกินอ่าน และไม่ได้ช่วยแยกใบ เพราะเลขหน้าแยกให้อยู่แล้ว
     เก็บวงเล็บขยายความไว้ ("Tabular description 1") เพราะนั่นคือสิ่งที่แยกใบจริง */
  var quals = (desc.match(/\([^)]*\)/g) || []).join(' ');
  var cut = desc.search(/\b[A-Z]{4,5}\d[A-Z]\b/);
  if (cut > 0) desc = desc.slice(0, cut);
  desc = (desc.replace(/\([^)]*\)/g, '').replace(/[\s-]+$/, '') + ' ' + quals)
    .replace(/\s+/g, ' ').replace(/^[\s-]+|[\s-]+$/g, '');

  var name = (icao + ' ' + kind + (desc ? ' ' + desc : '') + (page ? ' (' + page + ')' : ''))
    .replace(/[\\\/:*?"<>|]/g, '-').replace(/\s+/g, ' ').trim();
  return { sub: sub, name: name.slice(0, 180) + '.pdf' };
}

/* ── ตาราง AD 2.24 ของสนามบินหนึ่งแห่ง ─────────────────────── */
function aipCharts_(icao, date) {
  var base = AIP_SITE + '/' + date + '-AIRAC/html/';
  var html = aipFetch_(base + 'eAIP/VT-AD-2.' + icao + '-en-GB.html');
  var out = [], seen = {};
  // แต่ละแถวของตารางที่มีลิงก์ไป graphics/*.pdf
  var rows = html.split(/<tr[\s>]/i);
  for (var i = 1; i < rows.length; i++) {
    var r = rows[i];
    var hm = r.match(/href="([^"]*graphics\/[^"]+\.pdf)"/i);
    if (!hm) continue;
    var txt = r.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ')
               .replace(/TACLO[\s\S]*$/, '').replace(/\s+/g, ' ').trim();
    if (!txt) continue;
    var url = base + hm[1].replace(/^(\.\.\/)+/, '');
    url = url.replace('/html/graphics/', '/graphics/');
    var nm = aipName_(icao, txt);
    var key = nm.sub + '/' + nm.name;
    if (seen[key]) continue;                 // ลิงก์ซ้ำในหน้าเดียว
    seen[key] = true;
    out.push({ icao: icao, title: txt, url: url, sub: nm.sub, name: nm.name });
  }
  return out;
}

/* ── คิวงาน ───────────────────────────────────────────────── */
function aipStateFile_() {
  var root = aipRoot_(), it = root.getFilesByName(AIP_STATE);
  return it.hasNext() ? it.next() : null;
}
function aipRead_() {
  var f = aipStateFile_();
  return f ? JSON.parse(f.getBlob().getDataAsString()) : null;
}
function aipWrite_(st) {
  var f = aipStateFile_(), s = JSON.stringify(st);
  if (f) f.setContent(s); else aipRoot_().createFile(AIP_STATE, s, MimeType.PLAIN_TEXT);
}

/* ── เริ่มรอบใหม่ ─────────────────────────────────────────── */
function aipStart() {
  var iss = aipCurrentIssue_();
  Logger.log('ฉบับที่ใช้อยู่: %s (%s) %s', iss.text, iss.date, iss.amdt);

  var items = [];
  AIP_ADS.forEach(function (icao) {
    try {
      var cs = aipCharts_(icao, iss.date);
      Logger.log('  %s — %s ใบ', icao, cs.length);
      items = items.concat(cs);
    } catch (e) { Logger.log('  %s ❌ %s', icao, e.message); }
  });

  var st = { issue: iss, items: items, i: 0, done: 0, fail: [],
             links: {}, cleaned: {}, startedAt: new Date().toISOString() };
  aipWrite_(st);
  Logger.log('คิวรวม %s ใบ — เริ่มดาวน์โหลด', items.length);
  aipEnsureTrigger_();
  aipStep();
}

function aipEnsureTrigger_() {
  var has = ScriptApp.getProjectTriggers().some(function (t) {
    return t.getHandlerFunction() === 'aipStep';
  });
  if (!has) ScriptApp.newTrigger('aipStep').timeBased().everyMinutes(5).create();
}
function aipClearTrigger_() {
  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (t.getHandlerFunction() === 'aipStep') ScriptApp.deleteTrigger(t);
  });
}

/* ── เดินคิวทีละชุด ───────────────────────────────────────── */
function aipStep() {
  var st = aipRead_();
  if (!st || st.i >= st.items.length) { aipFinish_(st); return; }
  var t0 = Date.now(), eff = st.issue.text;

  while (st.i < st.items.length && Date.now() - t0 < AIP_BUDGET_MS) {
    var it = st.items[st.i];
    try {
      var folder = aipAdFolder_(it.icao, eff);
      // ล้างของรอบก่อนครั้งเดียวต่อสนามบิน ก่อนใส่ใบแรกของสนามบินนั้น
      if (!st.cleaned[it.icao]) {
        ['Airport chart', 'Chart'].forEach(function (s) {
          var sub = aipSub_(folder, s), fs = sub.getFiles();
          while (fs.hasNext()) fs.next().setTrashed(true);
        });
        st.cleaned[it.icao] = true;
      }
      var sub = aipSub_(folder, it.sub);
      var blob = UrlFetchApp.fetch(it.url, { muteHttpExceptions: true }).getBlob();
      var file = sub.createFile(blob.setName(it.name));
      file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      st.links[it.icao + '|' + it.title] = file.getUrl();
      st.done++;
    } catch (e) {
      st.fail.push(it.icao + ' · ' + it.name + ' — ' + e.message);
    }
    st.i++;
  }
  aipWrite_(st);
  Logger.log('คืบหน้า %s/%s (ผิดพลาด %s)', st.i, st.items.length, st.fail.length);
  if (st.i >= st.items.length) aipFinish_(st);
}

function aipFinish_(st) {
  aipClearTrigger_();
  if (!st) { Logger.log('ไม่มีงานค้าง'); return; }
  st.finishedAt = new Date().toISOString();
  aipWrite_(st);

  // ลิงก์โฟลเดอร์ของแต่ละสนามบิน — อันนี้คือของที่เอาไปวางในเว็บแอป
  var folders = {};
  AIP_ADS.forEach(function (icao) {
    try {
      var f = aipAdFolder_(icao, st.issue.text);
      f.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      folders[icao] = f.getUrl();
    } catch (e) {}
  });
  st.folders = folders;
  aipWrite_(st);

  Logger.log('เสร็จ — %s/%s ใบ · ผิดพลาด %s', st.done, st.items.length, st.fail.length);
  st.fail.slice(0, 10).forEach(function (m) { Logger.log('  🔴 ' + m); });
  Object.keys(folders).forEach(function (k) { Logger.log('  %s  %s', k, folders[k]); });
}

/* ── ดูสถานะ / ยกเลิก ─────────────────────────────────────── */
function aipStatus() {
  var st = aipRead_();
  if (!st) { Logger.log('ยังไม่เคยเริ่ม'); return; }
  Logger.log('ฉบับ %s (%s) · %s/%s ใบ · ผิดพลาด %s%s',
    st.issue.text, st.issue.amdt, st.i, st.items.length, st.fail.length,
    st.finishedAt ? ' · เสร็จแล้ว' : ' · กำลังทำ');
  st.fail.slice(0, 20).forEach(function (m) { Logger.log('  🔴 ' + m); });
}

function aipStop() { aipClearTrigger_(); Logger.log('หยุดแล้ว — เรียก aipStep() เองเพื่อทำต่อ'); }

/**
 * ตัวที่ trigger รายวันเรียก — เริ่มดึงเองเมื่อ CAAT เปลี่ยนฉบับที่ใช้อยู่
 * ตั้ง trigger รายวันชี้มาที่ฟังก์ชันนี้ครั้งเดียว แล้วปล่อยได้เลย
 */
function aipDaily() {
  var iss = aipCurrentIssue_(), st = aipRead_();
  if (st && !st.finishedAt) { Logger.log('รอบก่อนยังไม่เสร็จ — เดินต่อ'); aipEnsureTrigger_(); return; }
  if (st && st.issue && st.issue.date === iss.date) {
    Logger.log('ยังเป็นฉบับเดิม (%s) ไม่ต้องทำอะไร', iss.text); return;
  }
  Logger.log('ฉบับใหม่ %s — เริ่มดึง', iss.text);
  aipStart();
}
