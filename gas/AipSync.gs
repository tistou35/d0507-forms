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
/* หยุดก่อนโดนตัดที่ 6 นาที และต้องจบก่อน trigger รอบถัดไป (ทุก 5 นาที) ด้วย
   เดิมตั้งไว้ 4.5 นาที เหลือขอบแค่ 30 วินาที ตัวถัดไปจึงซ้อนเข้ามาบ่อย
   ลดเหลือ 3.5 นาที ให้มีเวลาเซฟ state และปล่อยล็อกทัน */
var AIP_BUDGET_MS = 3.5 * 60 * 1000;

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

/**
 * ฉบับถัดไปตามที่ CAAT ประกาศ — อ่านจากตาราง Next Issues
 * คืน { date: '2026-09-03', text: '03 SEP 2026' } หรือ null ถ้ายังไม่ประกาศ
 */
function aipNextIssue_() {
  var html = aipFetch_(AIP_SITE + '/');
  var i = html.search(/Next\s+Issues/i);
  if (i < 0) return null;
  var block = html.slice(i, i + 6000);
  var m = block.match(/(\d{4}-\d{2}-\d{2})-AIRAC\/html\/index-en-GB\.html/);
  var t = block.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ');
  var dm = t.match(/(\d{1,2}\s+[A-Z]{3}\s+\d{4})/);
  if (!m && !dm) return null;
  var date = m ? m[1] : null;
  if (!date && dm) {                       // มีแต่ข้อความ ยังไม่มีลิงก์
    var MON = { JAN:0,FEB:1,MAR:2,APR:3,MAY:4,JUN:5,
                JUL:6,AUG:7,SEP:8,OCT:9,NOV:10,DEC:11 };
    var p = dm[1].split(/\s+/);
    var d2 = new Date(Date.UTC(+p[2], MON[p[1].toUpperCase()], +p[0]));
    date = d2.toISOString().slice(0, 10);
  }
  return { date: date, text: dm ? dm[1] : date };
}

/** เวลา n นาฬิกาตามเวลาไทยของวันที่กำหนด — คืนเป็น Date จริง */
function aipAtLocal_(ymd, hour) {
  var p = ymd.split('-');
  // เวลาไทยคือ UTC+7 — 03:00 ไทย = 20:00 UTC ของเมื่อวาน
  return new Date(Date.UTC(+p[0], +p[1] - 1, +p[2], hour - 7, 0, 0));
}

/**
 * ตั้งนาฬิกาปลุกครั้งเดียวสำหรับฉบับถัดไป
 *
 * ไม่ใช้ trigger รายวัน เพราะใน 28 วันมีวันที่ต้องทำงานจริงแค่วันเดียว
 * อีก 27 วันคือปลุกมาดูแล้วนอนต่อ
 */
function aipSchedule_(when, why) {
  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (t.getHandlerFunction() === 'aipWake') ScriptApp.deleteTrigger(t);
  });
  var now = Date.now();
  if (when.getTime() < now + 60000) when = new Date(now + 5 * 60000);
  ScriptApp.newTrigger('aipWake').timeBased().at(when).create();
  Logger.log('ตั้งเวลาตื่นถัดไป %s (%s)',
    Utilities.formatDate(when, 'Asia/Bangkok', 'dd MMM yyyy HH:mm'), why);
}

/**
 * ── ตัวที่นาฬิกาปลุกเรียก ────────────────────────────────────
 * ตื่นตีสามของวัน Effective date แล้ว "ตรวจก่อนดึง"
 *
 * ทำไมต้องตรวจ ไม่ดึงเลย:
 * รอบ AIRAC มีผลเวลา 0000 UTC ซึ่งตรงกับ 07:00 เวลาไทย
 * ตีสามของวัน Effective date จึงเป็น 20:00 UTC ของเมื่อวาน — ยังไม่ถึงเวลามีผล
 * ถ้าดึงเลยตอนนั้นจะได้ฉบับเก่ามาทั้งชุด โดยที่ทุกอย่างดูปกติ ไม่มี error
 * และ CAAT เองก็อาจอัปเดตหน้าเว็บช้ากว่านั้นอีก
 *
 * จึงตื่นมาดูว่าเว็บพลิกเป็นฉบับใหม่แล้วหรือยัง ยังไม่พลิกก็นอนต่ออีกสองชั่วโมง
 * ยอมตื่นเก้อไม่กี่ครั้ง ดีกว่าได้แผนภูมิหมดอายุไปอยู่บนเครื่อง
 */
function aipWake() {
  var iss = aipCurrentIssue_(), st = aipRead_();
  var had = st && st.issue ? st.issue.date : null;

  if (had && iss.date === had) {
    var p = PropertiesService.getScriptProperties();
    var n = (+p.getProperty('AIP_WAIT') || 0) + 1;
    if (n > 8) {                       // ตื่นเก้อ 8 ครั้ง = ราว 16 ชั่วโมง
      p.deleteProperty('AIP_WAIT');
      Logger.log('🔴 เลยวัน Effective date มา 16 ชม. แล้วเว็บยังเป็นฉบับ %s ' +
                 '— ตรวจ aip.caat.or.th ด้วยตัวเอง', iss.text);
      var nx = aipNextIssue_();
      if (nx) aipSchedule_(aipAtLocal_(nx.date, 3), 'ฉบับ ' + nx.text);
      return;
    }
    p.setProperty('AIP_WAIT', String(n));
    Logger.log('เว็บยังเป็นฉบับ %s — ตื่นดูใหม่อีก 2 ชม. (ครั้งที่ %s)', iss.text, n);
    aipSchedule_(new Date(Date.now() + 2 * 3600000), 'รอเว็บพลิกฉบับ');
    return;
  }

  PropertiesService.getScriptProperties().deleteProperty('AIP_WAIT');
  Logger.log('เว็บพลิกเป็นฉบับ %s แล้ว — เริ่มดึง', iss.text);
  aipStart();
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

/* วงเล็บที่แปลว่า "หน้าถัดไปของใบเดิม" ไม่ใช่ใบใหม่ — ต้องตรงกับ CONT ใน aip_name.py
   ของจริงมีห้าแบบ: Verso · Tabular description [N] · Waypoint list table ·
   Radio communication failure table · Fix and point list table
   ส่วน (SID) (STAR) คือชนิดแผนภูมิ และ (NORTH) (SOUTH) คือคนละใบจริง ๆ
   กฎ "ลงท้ายด้วย table" ครอบตารางชื่อใหม่ที่อาจโผล่มารอบหน้า */
var AIP_CONT = /\((Verso|Tabular description[^)]*|Continued[^)]*|Page \d+[^)]*|[^)]*\btable)\)/i;

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
  /* ต้นทางพิมพ์ไม่สม่ำเสมอ — VTBU หน้า 8-9 เขียน "RWY 18" ส่วน 8-10 เขียน "RWY18"
     ทั้งที่เป็นแผนภูมิใบเดียวกัน ปล่อยไว้จะแยกเป็นสองชุด แล้วได้ชุดที่มีแต่หน้าตาราง
     ไม่มีหน้าแผนภูมิ (มี 5 แห่งในรอบ 2608) */
  desc = desc.replace(/\bRWY(\d)/g, 'RWY $1');

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

    /* split กิน "<tr " ไปด้วย เหลือแอตทริบิวต์ที่เหลือของแท็บนั้นค้างหัวก้อน
       เช่น  id="ID_1967371" row_id="">  ซึ่ง <[^>]+> ลบไม่ออกเพราะไม่มี < นำหน้า
       ถ้าไม่ตัดทิ้ง เศษนี้จะกลายเป็นส่วนหนึ่งของชื่อแผนภูมิทุกใบ
       และเป็นบั๊กที่ "นับแถวได้เท่ากัน" จับไม่ได้ — ต้องดูตัวข้อความถึงจะเห็น */
    var gt = r.indexOf('>');
    if (gt >= 0) r = r.slice(gt + 1);

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
  /* กันสั่งเริ่มซ้อนกับตัวที่กำลังเดินคิวอยู่ — เริ่มใหม่จะเขียนทับ state
     ตัวที่กำลังเดินอยู่จะยังถือ state เก่าในหน่วยความจำแล้วเซฟทับกลับ ตำแหน่งเพี้ยน */
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(1000)) {
    Logger.log('🔴 มีงานดึงทำงานอยู่ — ถ้าจะเริ่มใหม่จริง ให้ aipStop() ก่อน');
    return;
  }
  lock.releaseLock();

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

  var nx = null;
  try { nx = aipNextIssue_(); } catch (e) {}
  var st = { issue: iss, next: nx, items: items, i: 0, done: 0, fail: [],
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
  /* กันสองตัวเดินคิวพร้อมกัน — trigger ยิงทุก 5 นาที แต่รอบหนึ่งใช้ได้ถึง 4.5 นาที
     เหลือขอบแค่ 30 วินาที ตัวถัดไปจึงซ้อนเข้ามาได้ง่าย ๆ
     ซ้อนแล้วทั้งคู่อ่าน state ก้อนเดียวกัน แล้วดาวน์โหลดรายการเดิมซ้ำทั้งชุด
     (ของจริงเคยได้ VTBD 212 ไฟล์ ทั้งที่มี 125 ใบ)
     ตัวที่จับล็อกไม่ได้ให้ถอยเงียบ ๆ เดี๋ยว trigger รอบหน้ามาต่อเอง */
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(1000)) { Logger.log('มีตัวเดินคิวทำงานอยู่ — ข้ามรอบนี้'); return; }
  try {
    aipStepLocked_();
  } finally {
    lock.releaseLock();
  }
}

function aipStepLocked_() {
  var st = aipRead_();
  if (!st || st.i >= st.items.length) { aipFinish_(st); return; }
  var t0 = Date.now(), eff = st.issue.text, sinceSave = 0;

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

      /* มีชื่อนี้อยู่แล้วก็ข้าม — ทำให้รันซ้ำได้โดยไม่เกิดไฟล์ซ้ำ
         จำเป็นเพราะ execution ที่ถูกตัดกลางคันจะทำให้ st.i ย้อนกลับไปจุดที่เซฟล่าสุด
         แล้วรายการช่วงนั้นถูกดาวน์โหลดใหม่ ล็อกกันได้แค่การทำพร้อมกัน ไม่ได้กันการทำซ้ำ */
      var ex = sub.getFilesByName(it.name);
      if (ex.hasNext()) {
        var old = ex.next();
        it.fileId = old.getId(); it.folderId = sub.getId();
        st.done++; st.i++; sinceSave++;
        continue;
      }

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
    /* เซฟระหว่างทาง — เดิมเขียนหลังจบลูปอย่างเดียว
       ถูกตัดกลางคันทีไรความคืบหน้าหายทั้งก้อน แล้วเริ่มดาวน์โหลดซ้ำจากจุดเดิม */
    if (++sinceSave >= 25) { aipWrite_(st); sinceSave = 0; }
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

  // ตั้งนาฬิกาปลุกของฉบับถัดไปทันทีที่ดึงรอบนี้เสร็จ — ไม่มีวันไหนต้องปลุกเปล่า
  try {
    var nx = aipNextIssue_();
    if (nx && nx.date > st.issue.date) aipSchedule_(aipAtLocal_(nx.date, 3), 'ฉบับ ' + nx.text);
    else {
      // CAAT ยังไม่ประกาศฉบับถัดไป — กลับมาดูอีกทีอีกเจ็ดวัน
      aipSchedule_(new Date(Date.now() + 7 * 86400000), 'ยังไม่ประกาศฉบับถัดไป');
    }
  } catch (e) { Logger.log('🔴 ตั้งเวลาตื่นถัดไปไม่สำเร็จ: %s', e.message); }

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
  /* อ่านจากโฟลเดอร์จริงใน Drive ไม่ใช่จากสิ่งที่คิวจดไว้
     เคยทำแบบเชื่อคิว (it.fileId) แล้วได้ manifest ว่างเปล่าทั้งที่ไฟล์ครบ 356 ใบ
     เพราะ state หลุดระหว่างทาง ซึ่งเป็นเรื่องที่เกิดได้เสมอกับงานยาวหลายรอบ trigger
     ของจริงในโฟลเดอร์คือสิ่งที่คนจะเปิดใช้ manifest จึงต้องบรรยายของจริง

     ชื่อไฟล์เป็น "<ชื่อชุด> (AD 2-XXXX-n-m).pdf" อยู่แล้ว จึงแยกกลับเป็นชุดกับเลขหน้าได้ */
  var urlOf = {};
  (st && st.items || []).forEach(function (it) { if (it.name) urlOf[it.name] = it.url; });

  var sets = {}, root = aipRoot_(), fol = root.getFolders();
  while (fol.hasNext()) {
    var ad = fol.next(), icao = ad.getName().split(' ')[0];
    if (!/^[A-Z]{4}$/.test(icao)) continue;
    ['Airport chart', 'Chart'].forEach(function (subName) {
      var it2 = ad.getFoldersByName(subName);
      if (!it2.hasNext()) return;
      var sub = it2.next(), fid = sub.getId(), fs = sub.getFiles();
      while (fs.hasNext()) {
        var f = fs.next(), nm = f.getName();
        var m = nm.match(/^(.*?)\s*\(AD\s+2-[A-Z]{4}-([\d-]+)\)\.pdf$/i);
        var setName = m ? m[1] : nm.replace(/\.pdf$/i, '');
        var ref = m ? m[2] : '';
        var k = icao + '|' + subName + '|' + setName;
        if (!sets[k]) sets[k] = { icao: icao, sub: subName, set: setName,
                                  folderId: fid, files: [] };
        // url ต้นทางใส่มาด้วยถ้ายังมีในคิว — ฝั่ง Python อ่านไฟล์ใน Drive ไม่ได้
        // (สโคป drive.file) ต้องไปโหลดจาก aip.caat.or.th ใหม่ ซึ่งเป็นแหล่งเดียวกัน
        sets[k].files.push({ id: f.getId(), name: nm, ref: ref, url: urlOf[nm] || '' });
      }
    });
  }

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

  /* สรุปรายสนามบินสำหรับหน้าเว็บ — หนึ่งแถวต่อหนึ่งสนามบิน ไม่ใช่ต่อหนึ่งแผนภูมิ
     ลิงก์ชี้ที่โฟลเดอร์ ไม่ใช่ไฟล์ เพราะ aipAdFolder_ เปลี่ยนแค่ชื่อทุกรอบ
     id โฟลเดอร์จึงคงเดิม ลิงก์ในเว็บไม่ตายเมื่อเปลี่ยนรอบ */
  var ads = {};
  list.forEach(function (s) {
    var a = ads[s.icao] || (ads[s.icao] = { icao: s.icao, ap: '', op: '', nap: 0, nop: 0 });
    if (s.sub === 'Airport chart') { a.ap = s.folderId; a.nap++; }
    else { a.op = s.folderId; a.nop++; }
  });
  /* พยายามแชร์ แต่ล้มเหลวไม่เป็นไร — โฟลเดอร์รับสิทธิ์ตกทอดจากโฟลเดอร์แม่อยู่แล้ว
     (ทดสอบเปิดแบบไม่ล็อกอินผ่านทั้งสามระดับ) บางบัญชี/โดเมนปิดการแชร์แบบลิงก์ไว้
     แล้ว setSharing จะโยน "Access denied: DriveApp" ซึ่งไม่ควรทำให้ทั้งงานล้ม
     รวบเป็นบรรทัดเดียว ไม่ใช่ 24 บรรทัด */
  var shareFail = 0;
  Object.keys(ads).forEach(function (k) {
    ['ap', 'op'].forEach(function (f) {
      if (!ads[k][f]) return;
      try {
        DriveApp.getFolderById(ads[k][f])
          .setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      } catch (e) { shareFail++; }
    });
  });
  if (shareFail) Logger.log('ตั้งค่าแชร์โฟลเดอร์ไม่ได้ %s อัน — ใช้สิทธิ์ที่ตกทอดจากโฟลเดอร์แม่แทน', shareFail);

  var doc = { issue: st.issue, generatedAt: st.finishedAt, rootId: root.getId(),
              files: st.done, sets: list.length,
              ads: Object.keys(ads).map(function (k) { return ads[k]; }),
              data: list };
  var it2 = root.getFilesByName(AIP_MANIFEST), s = JSON.stringify(doc);
  var f = it2.hasNext() ? it2.next() : root.createFile(AIP_MANIFEST, s, MimeType.PLAIN_TEXT);
  f.setContent(s);
  /* พยายามแชร์แบบลิงก์ เพราะ token ของ tools/ มีสโคปแค่ drive.file
     อ่านไฟล์ที่ Apps Script สร้างผ่าน Drive API ไม่ได้ ต้องดึงผ่านลิงก์แทน
     แชร์ไม่ได้ก็ไม่ล้ม — ไฟล์รับสิทธิ์ตกทอดจากโฟลเดอร์แม่ได้เหมือนกัน
     เดิมบรรทัดนี้ไม่มี try/catch เลยทำให้ aipRemanifest ตายทั้งงานทั้งที่ใบส่งงานเขียนเสร็จแล้ว */
  try {
    f.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  } catch (e) {
    Logger.log('ตั้งค่าแชร์ใบส่งงานไม่ได้ (%s) — ถ้า Python อ่านไม่ออก ให้แชร์ไฟล์นี้เอง', e.message);
  }

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

/**
 * ── สถานะสำหรับหน้าเว็บ ─────────────────────────────────────
 * หน้า "สนามบินและแผนภูมิ" ถามตัวนี้ ไม่ได้อ่านจาก Firestore
 * เพราะสถานะการดึงเป็นของฝั่งนี้อยู่แล้ว เก็บซ้ำอีกที่มีแต่จะไม่ตรงกัน
 */
function aipStatusJson_() {
  var st = aipRead_();
  if (!st) return { started: false };
  var ads = [];
  try {
    var root = aipRoot_(), it = root.getFilesByName(AIP_MANIFEST);
    if (it.hasNext()) ads = JSON.parse(it.next().getBlob().getDataAsString()).ads || [];
  } catch (e) {}
  return {
    started: true,
    issue: st.issue,                      // { date, text, amdt }
    next: st.next || null,                // ฉบับถัดไปที่ CAAT ประกาศ
    i: st.i, total: st.items.length, done: st.done,
    fail: st.fail.length, failFirst: st.fail.slice(0, 3),
    finishedAt: st.finishedAt || '',
    ads: ads,
  };
}

/**
 * ตั้งคิวแล้วปล่อยให้ trigger เดินต่อ — ไม่ดึงยาวคาไว้ใน request
 * ปุ่มบนหน้าเว็บเรียกตัวนี้ จะได้ตอบกลับเร็ว แล้วให้หน้าเว็บถามสถานะเอาเอง
 */
function aipBegin_() {
  var st = aipRead_();
  if (st && !st.finishedAt) { aipEnsureTrigger_(); return 'กำลังดึงอยู่แล้ว'; }
  var iss = aipCurrentIssue_(), items = [];
  AIP_ADS.forEach(function (icao) {
    try { items = items.concat(aipCharts_(icao, iss.date)); }
    catch (e) { Logger.log('%s ❌ %s', icao, e.message); }
  });
  var nx = null;
  try { nx = aipNextIssue_(); } catch (e) {}
  aipWrite_({ issue: iss, next: nx, items: items, i: 0, done: 0, fail: [],
              links: {}, cleaned: {}, startedAt: new Date().toISOString() });
  aipEnsureTrigger_();
  return 'เริ่มแล้ว — ' + items.length + ' ใบ';
}

/**
 * สร้างใบส่งงานใหม่จากไฟล์ที่มีอยู่ใน Drive — ไม่ดาวน์โหลดอะไรเพิ่ม
 * ใช้เมื่อดึงครบแล้วแต่ใบส่งงานออกมาว่างหรือไม่ครบ
 */
function aipRemanifest() {
  var st = aipRead_();
  if (!st) { Logger.log('ไม่มีสถานะการดึง — เรียก aipSetup() ก่อน'); return; }
  if (!st.finishedAt) st.finishedAt = new Date().toISOString();
  aipManifest_(st);
}

/* ── ดูสถานะ / ยกเลิก ─────────────────────────────────────── */
function aipStatus() {
  var st = aipRead_();
  if (!st) { Logger.log('ยังไม่เคยเริ่ม'); return; }
  Logger.log('ฉบับ %s (%s) · %s/%s ใบ · ผิดพลาด %s%s',
    st.issue.text, st.issue.amdt, st.i, st.items.length, st.fail.length,
    st.finishedAt ? ' · เสร็จแล้ว' : ' · กำลังทำ');
  st.fail.slice(0, 20).forEach(function (m) { Logger.log('  🔴 ' + m); });

  var wake = ScriptApp.getProjectTriggers().filter(function (t) {
    return t.getHandlerFunction() === 'aipWake';
  });
  Logger.log(wake.length ? 'นาฬิกาปลุกถัดไป: ตั้งไว้แล้ว'
                         : '⚠️ ไม่มีนาฬิกาปลุก — เรียก aipArm() เพื่อตั้งใหม่');
  try {
    var nx = aipNextIssue_();
    if (nx) Logger.log('CAAT ประกาศฉบับถัดไป: %s', nx.text);
  } catch (e) {}
}

/**
 * ตั้งนาฬิกาปลุกใหม่โดยไม่ต้องดึงอะไร — ใช้เมื่อ trigger หาย
 * (เช่น ย้ายโปรเจกต์ หรือเผลอลบ trigger ทิ้ง)
 */
function aipArm() {
  var nx = aipNextIssue_(), st = aipRead_();
  if (!nx) { Logger.log('CAAT ยังไม่ประกาศฉบับถัดไป — ตั้งไว้อีกเจ็ดวัน');
             aipSchedule_(new Date(Date.now() + 7 * 86400000), 'รอประกาศ'); return; }
  if (st && st.issue && nx.date <= st.issue.date) {
    Logger.log('ฉบับถัดไป (%s) ยังไม่ใหม่กว่าที่ดึงไว้ — ตั้งไว้อีกเจ็ดวัน', nx.text);
    aipSchedule_(new Date(Date.now() + 7 * 86400000), 'รอประกาศ'); return;
  }
  aipSchedule_(aipAtLocal_(nx.date, 3), 'ฉบับ ' + nx.text);
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
  // ของเดิมเคยปลุกทุกวัน — ไม่ต้องแล้ว ใช้นาฬิกาปลุกตามวันจริงแทน
  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (t.getHandlerFunction() === 'aipDaily') ScriptApp.deleteTrigger(t);
  });
  aipStart();     // aipFinish_ จะตั้งเวลาตื่นของฉบับถัดไปให้เองตอนดึงเสร็จ
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

/**
 * ทดสอบตัวคำนวณเวลาโดยไม่แตะ Drive และไม่ตั้ง trigger
 * ดูว่าอ่านวันจากเว็บได้ถูก และจะตื่นตอนไหนจริง ๆ
 */
function aipDryRun() {
  var cur = aipCurrentIssue_(), nx = aipNextIssue_();
  Logger.log('ใช้อยู่:     %s (%s) %s', cur.text, cur.date, cur.amdt);
  Logger.log('ถัดไป:      %s', nx ? nx.text + ' (' + nx.date + ')' : '— ยังไม่ประกาศ');
  if (!nx) return;
  var w = aipAtLocal_(nx.date, 3);
  Logger.log('จะตื่น:     %s เวลาไทย',
    Utilities.formatDate(w, 'Asia/Bangkok', 'dd MMM yyyy HH:mm'));
  Logger.log('เทียบ UTC:  %s — รอบมีผล 0000 UTC ของ %s',
    Utilities.formatDate(w, 'UTC', 'dd MMM yyyy HH:mm'), nx.date);
  Logger.log('ตอนตื่นถ้าเว็บยังไม่พลิก จะนอนต่อทีละ 2 ชม. (สูงสุด 8 ครั้ง) แล้วค่อยดึง');
}
