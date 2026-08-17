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
var AIP_MANIFEST = 'AIP_MANIFEST.json';  // ใบส่งงานให้ tools/aip_merge.py
var AIP_RECEIPT = 'AIP_MERGED.json';     // ใบเสร็จที่ aip_merge.py เขียนกลับมา
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
/* ⚠️ ตรรกะตรงนี้ต้องตรงกับ tools/aip_name.py เป๊ะ ๆ
   Apps Script เป็นคนตั้งชื่อและจัดชุด · Python เป็นคนรวมไฟล์ตามชุดนั้น
   ถ้าสองฝั่งจัดชุดไม่เหมือนกัน จะรวมผิดใบโดยไม่มีอะไรเตือน
   แก้ที่ไหนต้องแก้อีกที่เสมอ แล้วรัน  python3 tools/aip_name.py  ให้ชนศูนย์ */
var AIP_KINDS = [
  [/Aerodrome Chart/i,                        'Aerodrome Chart',   'Airport chart'],
  [/Aircraft Parking\/Docking/i,              'Parking',           'Airport chart'],
  [/Aerodrome Ground Movement/i,              'Ground Movement',   'Airport chart'],
  [/Aerodrome Obstacle/i,                     'Obstacle',          'Airport chart'],
  [/Precision Approach Terrain/i,             'Terrain',           'Airport chart'],
  [/\(SID\)/i,                                'SID',               'Chart'],
  [/\(STAR\)/i,                               'STAR',              'Chart'],
  [/Instrument Approach Chart/i,              'IAP',               'Chart'],
  [/VFR\s+ENTRY\s+AND\s+EXIT/i,               'VFR Entry & Exit',  'Chart'],
  [/VFR\s+ENTRY/i,                            'VFR Entry',         'Chart'],
  [/VFR\s+EXIT/i,                             'VFR Exit',          'Chart'],
  [/VFR\s+OVERFLY/i,                          'VFR Overfly',       'Chart'],
  [/VFR/i,                                    'VFR',               'Chart']
];

/* หัวชื่อที่ซ้ำกับ kind อยู่แล้ว — ตัดได้โดยไม่เสียตัวแยกใบ */
var AIP_LEAD = new RegExp(
  '^\\s*(Standard Departure Chart\\s*-\\s*Instrument\\s*\\(SID\\)' +
  '|Standard Arrival Chart\\s*-\\s*Instrument\\s*\\(STAR\\)' +
  '|Instrument Approach Chart' +
  '|Aerodrome Chart' +
  '|Aircraft Parking/Docking Chart' +
  '|Aerodrome Ground Movement Chart' +
  '|Aerodrome Obstacle Chart[^-]*' +
  '|Precision Approach Terrain Chart[^-]*' +
  '|VFR\\s+ENTRY\\s+AND\\s+EXIT\\s+PROCEDURE' +
  '|VFR\\s+ENTRY\\s+PROCEDURE' +
  '|VFR\\s+EXIT\\s+PROCEDURE' +
  '|VFR\\s+OVERFLY\\s+PROCEDURE' +
  ')\\s*', 'i');

/* วงเล็บที่แปลว่า "หน้าถัดไปของใบเดิม" ไม่ใช่ใบใหม่ */
var AIP_CONT = /\((Verso|Tabular description[^)]*|Radio[^)]*|Waypoint[^)]*|Continued[^)]*|Page \d+[^)]*)\)/i;

/**
 * ชื่อไฟล์และชื่อชุดจากชื่อแผนภูมิ
 * "Standard Departure Chart - Instrument (SID) - ICAO - RNAV RWY 21L - ALBOS3C ... AD 2-VTBD-6-1"
 *   -> { sub:'Chart', set:'VTBD SID RNAV RWY 21L ALBOS3C', ref:'6-1',
 *        name:'VTBD SID RNAV RWY 21L ALBOS3C (AD 2-VTBD-6-1).pdf' }
 *
 * สิ่งที่ห้ามตัดทิ้ง เพราะตัดแล้วสองใบที่ต่างกันจริงจะชื่อเดียวกัน:
 *   · รหัสจุดบังคับตัวแรก — VTBD มี SID RNAV RWY 21L สองใบ (ALBOS3C กับ DOSBU3C)
 *   · คำว่า LIGHT AIRCRAFT / HELICOPTER — ชื่อเหมือนกันหมดยกเว้นคำนี้
 *   · ENTRY กับ EXIT ของ VTUV — เป็นคนละใบ
 */
function aipName_(icao, raw) {
  var kind = 'Chart', sub = 'Chart';
  for (var i = 0; i < AIP_KINDS.length; i++) {
    if (AIP_KINDS[i][0].test(raw)) { kind = AIP_KINDS[i][1]; sub = AIP_KINDS[i][2]; break; }
  }
  var page = '', ref = '';
  var pm = raw.match(/AD\s+2-[A-Z]{4}-([\d-]+)\s*$/);
  var body = raw;
  if (pm) { page = pm[0].trim(); ref = pm[1]; body = raw.slice(0, pm.index); }

  body = body.replace(AIP_CONT, '');          // ตัวขยายบอกหน้า ไม่ใช่ตัวแยกใบ

  var desc = body.replace(AIP_LEAD, '')
                 .replace(/^\s*-?\s*ICAO\s*-?\s*/i, '')
                 // "FOR LIGHT AIRCRAFT CHART - " -> "Light Aircraft "
                 .replace(/^\s*FOR\s+(.*?)\s*CHART\s*-?\s*/i, function (m, g) {
                   return g.toLowerCase().replace(/\b\w/g, function (c) {
                     return c.toUpperCase(); }) + ' ';
                 })
                 .replace(/^\s*CHART\s*-?\s*/i, '');

  // SID/STAR: เก็บรหัสจุดบังคับตัวแรกเป็นตัวแยก แล้วตัดที่เหลือ (VTBD ลากมาสิบเอ็ดชื่อ)
  var desig = '';
  if (kind === 'SID' || kind === 'STAR') {
    var dm = desc.match(/\b([A-Z]{2,5}\d[A-Z])\b/);
    if (dm) { desig = dm[1]; desc = desc.slice(0, dm.index); }
  }
  desc = desc.replace(/\s+/g, ' ').replace(/^[\s\-,]+|[\s\-,]+$/g, '');
  if (desig) desc = (desc + ' ' + desig).replace(/^\s+/, '');

  var clean = function (s) {
    return s.replace(/[\\\/:*?"<>|]/g, '-').replace(/\s+/g, ' ').trim();
  };
  var set = clean(icao + ' ' + kind + (desc ? ' ' + desc : '')).slice(0, 150);
  return { sub: sub, set: set, ref: ref,
           name: clean(set + (page ? ' (' + page + ')' : '')).slice(0, 180) + '.pdf' };
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
    out.push({ icao: icao, title: txt, url: url, sub: nm.sub, name: nm.name,
               set: nm.set, ref: nm.ref });
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
      // เก็บ id ไว้ให้ tools/aip_merge.py หยิบไปรวมทีหลัง
      it.fileId = file.getId();
      it.folderId = sub.getId();
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
  aipManifest_(st);

  Logger.log('เสร็จ — %s/%s ใบ · ผิดพลาด %s', st.done, st.items.length, st.fail.length);
  st.fail.slice(0, 10).forEach(function (m) { Logger.log('  🔴 ' + m); });
  Object.keys(folders).forEach(function (k) { Logger.log('  %s  %s', k, folders[k]); });
}

/**
 * ── ใบส่งงานให้ฝั่ง Python ──────────────────────────────────
 * Apps Script รวม PDF ไม่ได้ (ไม่มีความสามารถนี้ในตัว) การรวมหน้าจึงทำที่
 * tools/aip_merge.py ซึ่งใช้ pypdf  ไฟล์นี้คือสิ่งที่ส่งต่อระหว่างสองฝั่ง
 *
 * ทำไมต้องมี แทนที่จะให้ Python อ่านชื่อไฟล์ใน Drive แล้วเดาเอง:
 * การจัดชุดต้องเหมือนกันทั้งสองฝั่ง ถ้าให้ต่างคนต่างแยกจากชื่อไฟล์
 * วันหนึ่งที่ตรรกะสองฝั่งไม่ตรงกัน จะรวมข้ามใบโดยไม่มีอะไรเตือน
 * ที่นี่จึงบอกตรง ๆ ว่าไฟล์ id ไหนอยู่ชุดไหน หน้าที่เท่าไร เรียงแล้ว
 *
 * ยังไม่รัน Python ก็ใช้งานได้ — แค่ได้ไฟล์แยกหน้าเหมือนเดิม ไม่ใช่ของเสีย
 */
function aipManifest_(st) {
  var sets = {};
  st.items.forEach(function (it) {
    if (!it.fileId) return;                 // ใบที่ดาวน์โหลดไม่สำเร็จ
    var k = it.icao + '|' + it.sub + '|' + it.set;
    if (!sets[k]) sets[k] = { icao: it.icao, sub: it.sub, set: it.set,
                              folderId: it.folderId, files: [] };
    // ใส่ url ต้นทางมาด้วย เพราะฝั่ง Python อ่านไฟล์ใน Drive ไม่ได้ (สโคป drive.file)
    // ต้องไปโหลดจาก aip.caat.or.th ใหม่ — เป็นแหล่งเดียวกับที่ไฟล์นี้โหลดมา
    sets[k].files.push({ id: it.fileId, name: it.name, ref: it.ref,
                         title: it.title, url: it.url });
  });

  // เรียงหน้าแบบตัวเลข — เรียงแบบตัวอักษรจะได้ 6-10 มาก่อน 6-9
  var key = function (r) {
    return (r || '').split('-').map(function (x) { return parseInt(x, 10) || 0; });
  };
  var list = [];
  Object.keys(sets).forEach(function (k) {
    var s = sets[k];
    s.files.sort(function (a, b) {
      var x = key(a.ref), y = key(b.ref);
      for (var i = 0; i < Math.max(x.length, y.length); i++) {
        if ((x[i] || 0) !== (y[i] || 0)) return (x[i] || 0) - (y[i] || 0);
      }
      return 0;
    });
    list.push(s);
  });
  list.sort(function (a, b) { return a.set < b.set ? -1 : a.set > b.set ? 1 : 0; });

  var root = aipRoot_();
  var doc = { issue: st.issue, generatedAt: st.finishedAt, rootId: root.getId(),
              files: st.done, sets: list.length, data: list };
  var it2 = root.getFilesByName(AIP_MANIFEST), s = JSON.stringify(doc);
  var f = it2.hasNext() ? it2.next() : root.createFile(AIP_MANIFEST, s, MimeType.PLAIN_TEXT);
  f.setContent(s);
  // แชร์แบบลิงก์ เพราะ token ของ tools/ มีสโคปแค่ drive.file
  // อ่านไฟล์ที่ Apps Script สร้างผ่าน Drive API ไม่ได้ ต้องดึงผ่านลิงก์แทน
  f.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

  var multi = list.filter(function (x) { return x.files.length > 1; }).length;
  Logger.log('ใบส่งงาน %s — %s ชุด (รวมหน้าได้ %s ชุด)', AIP_MANIFEST, list.length, multi);
  Logger.log('ขั้นต่อไป:  python3 tools/aip_merge.py %s', f.getId());
}

/**
 * เก็บกวาดหลัง aip_merge.py รวมไฟล์เสร็จ — ทิ้งหน้าเดี่ยวที่ถูกแทนแล้ว
 *
 * ทำไมต้องเป็น Apps Script ที่ลบ ไม่ใช่ Python:
 * Python ลบได้เฉพาะไฟล์ที่ตัวเองสร้าง (สโคป drive.file) ไฟล์หน้าเดี่ยว
 * เป็นของ Apps Script จึงต้องให้ฝั่งนี้ลบ
 *
 * ปลอดภัยเพราะลบตาม "ใบเสร็จ" ที่ Python เขียนไว้เท่านั้น — ถ้ารวมไม่สำเร็จ
 * ไม่มีใบเสร็จ ก็ไม่มีอะไรถูกลบ เหลือไฟล์แยกหน้าไว้ใช้ได้ตามเดิม
 */
function aipTidy() {
  var root = aipRoot_(), it = root.getFilesByName(AIP_RECEIPT), rcs = [];
  while (it.hasNext()) rcs.push(it.next());
  if (!rcs.length) { Logger.log('ยังไม่มีใบเสร็จ %s — ยังไม่ได้รวมไฟล์', AIP_RECEIPT); return; }
  // รันซ้ำหลายรอบจะมีใบเสร็จหลายใบชื่อเดียวกัน — เอาใบล่าสุดเสมอ
  rcs.sort(function (a, b) { return b.getDateCreated() - a.getDateCreated(); });
  var rc = JSON.parse(rcs[0].getBlob().getDataAsString());
  var st = aipRead_();
  if (st && st.issue && rc.issueDate !== st.issue.date) {
    Logger.log('🔴 ใบเสร็จเป็นของฉบับ %s แต่ตอนนี้ใช้ %s — ไม่ลบอะไร',
               rc.issueDate, st.issue.date);
    return;
  }
  var gone = 0, miss = 0;
  (rc.trash || []).forEach(function (id) {
    try { DriveApp.getFileById(id).setTrashed(true); gone++; }
    catch (e) { miss++; }           // ลบไปแล้วรอบก่อน — ไม่ใช่ปัญหา
  });
  rcs.forEach(function (f) { f.setTrashed(true); });   // ใช้แล้วทิ้ง กันลบซ้ำรอบหน้า
  Logger.log('เก็บกวาดแล้ว — ทิ้ง %s ใบ (ข้าม %s) · รวมเหลือ %s ไฟล์',
             gone, miss, rc.merged);
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
 * ── กดครั้งเดียวตอนติดตั้ง ──────────────────────────────────
 * ตั้ง trigger รายวัน แล้วเริ่มดึงรอบปัจจุบันทันที
 * หลังจากนี้ไม่ต้องมากดอีก ระบบจะดึงเองทุกครั้งที่ CAAT เปลี่ยนฉบับ
 *
 * เลือกฟังก์ชันนี้ในตัวแก้ไข Apps Script แล้วกด Run
 * ครั้งแรกจะขึ้นหน้าขออนุญาตเข้าถึง Drive — กดอนุญาต
 *
 * ใช้เวลาราวครึ่งชั่วโมง (356 ใบ แบ่งทำรอบละ 5 นาที) ปิดหน้าต่างได้เลย
 * ดูความคืบหน้าด้วย aipStatus()
 */
function aipSetup() {
  var has = ScriptApp.getProjectTriggers().some(function (t) {
    return t.getHandlerFunction() === 'aipDaily';
  });
  if (has) Logger.log('มี trigger รายวันอยู่แล้ว');
  else {
    ScriptApp.newTrigger('aipDaily').timeBased().everyDays(1).atHour(3).create();
    Logger.log('ตั้ง trigger รายวันแล้ว (ตีสาม) — เฝ้าวันเปลี่ยนฉบับให้เอง');
  }
  aipStart();
}

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
