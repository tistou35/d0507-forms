/**
 * D-0507-MRF-001 แบบเบิกค่าใช้จ่ายรายเดือน — ดึงตารางเวลาจาก Flight Logs
 *
 *   action: mrfPull  { month: 'YYYY-MM' }
 *
 * อ่านแท็บ "Flight Log" ของสเปรดชีต Flight Logs (ระบบ AeroFBO เขียนลง) ด้วยสิทธิ์เจ้าของสคริปต์
 * คัดเที่ยวบินของเดือนนั้นที่ชื่อผู้เบิกอยู่ใน Pilot 1 หรือ Pilot 2 แล้วรวมเป็นแถวละหนึ่งวัน
 *   Date · Detail = Flight Log ID ทุกเที่ยวของวันนั้น · Aircraft = ทะเบียน · Type = Flight Type
 *   Flt hrs = Block Time รวมของวัน (H:MM) · Remarks = Remark
 * พร้อมอัตราจาก payRates/<uid> (ผู้ดูแลตั้งรายคน) จำนวนคืนที่พัก และ per diem
 *
 * เปิดได้เฉพาะเที่ยวบินของตัวเอง — ชื่อที่ใช้จับคู่มาจากโปรไฟล์และชื่ออื่นที่ผู้ดูแลตั้งไว้
 * อ่านโปรไฟล์และอัตราด้วย idToken ของผู้เรียก (กติกาเดียวกับหน้าเว็บ) ไม่รับชื่อจากหน้าเว็บ
 * ไม่งั้นใครก็ดึงชั่วโมงบินของคนอื่นมาเบิกได้
 */
var MRF_DEFAULT = {
  logSheet: '1N-gJ3koYT2OiN1V0NWH4-jOifcIwT5IKlFB3D8DkJRs',
  logTab: 'Flight Log',
  preMin: 60,        // เริ่มงานก่อน Engine ON ของเที่ยวแรก
  postMin: 30,       // เลิกงานหลัง Engine OFF ของเที่ยวสุดท้าย
  fullDayHrs: 6,     // ช่วงทำงาน ≥ นี้ = per diem 1 วัน · น้อยกว่า = 0.5
  gapDays: 2         // วันหยุดคั่นไม่เกินนี้ ถือว่าไม่ได้กลับบ้าน — นับคืนต่อเนื่อง
};
var MRF_MON = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];

function mrfNorm_(s) { return String(s || '').toLowerCase().replace(/[^a-z฀-๿]/g, ''); }

/* วันที่ในชีตมีหลายรูป — 19-May-2026 · 2026-07-07 · 7/7/2026 (วัน/เดือน/ปี) · ค่า Date */
function mrfYmd_(v) {
  if (v instanceof Date) return Utilities.formatDate(v, 'Asia/Bangkok', 'yyyy-MM-dd');
  var s = String(v || '').trim(), m;
  if ((m = /^(\d{4})-(\d{1,2})-(\d{1,2})/.exec(s))) return m[1] + '-' + ('0' + m[2]).slice(-2) + '-' + ('0' + m[3]).slice(-2);
  if ((m = /^(\d{1,2})[- ]([A-Za-z]{3})[a-z]*[- ](\d{4})/.exec(s))) {
    var i = MRF_MON.indexOf(m[2].toUpperCase());
    if (i >= 0) return m[3] + '-' + ('0' + (i + 1)).slice(-2) + '-' + ('0' + m[1]).slice(-2);
  }
  if ((m = /^(\d{1,2})\/(\d{1,2})\/(\d{4})/.exec(s))) return m[3] + '-' + ('0' + m[2]).slice(-2) + '-' + ('0' + m[1]).slice(-2);
  return '';
}
function mrfMin_(t) {   // "H:MM" → นาที · ว่าง/ผิดรูป → null
  var m = /^(\d{1,2}):([0-5]\d)/.exec(String(t || '').trim());
  return m ? Number(m[1]) * 60 + Number(m[2]) : null;
}
function mrfHm_(min) { return Math.floor(min / 60) + ':' + ('0' + (min % 60)).slice(-2); }
function mrfDayNo_(ymd) { return Math.round(Date.UTC(+ymd.slice(0, 4), +ymd.slice(5, 7) - 1, +ymd.slice(8, 10)) / 864e5); }

/* ระยะแก้คำ (Levenshtein) — ชื่อที่สะกดต่าง 1 ตัวถือว่าคนเดียวกัน 2–3 ตัวต้องให้ผู้เบิกยืนยัน */
function mrfDist_(a, b) {
  if (a === b) return 0;
  var p = [], c, i, j;
  for (j = 0; j <= b.length; j++) p[j] = j;
  for (i = 1; i <= a.length; i++) {
    c = [i];
    for (j = 1; j <= b.length; j++)
      c[j] = Math.min(p[j] + 1, c[j - 1] + 1, p[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    p = c;
  }
  return p[b.length];
}

/**
 * opts (ส่งกลับมาจากหน้าเว็บเมื่อผู้เบิกตัดสินแล้ว)
 *   decided: true  — ใช้ excl ตามที่ติ๊ก ไม่ใช้ค่าตั้งต้น (ค่าตั้งต้น: แถวทดสอบไม่นับ)
 *   excl:   [key]  — แถวในชีตที่ไม่นับ (key = "r<เลขแถว>")
 *   accept: [ชื่อ] — ชื่อที่ต่าง 2–3 ตัวซึ่งผู้เบิกยืนยันว่าเป็นตัวเอง
 *   reject: [ชื่อ] — ชื่อที่ผู้เบิกบอกว่าไม่ใช่
 * ชื่อที่ยังไม่ได้ตัดสินไม่นับ — นับชั่วโมงบินของคนอื่นมาเบิกผิดหนักกว่าลืมนับของตัวเอง
 */
function mrfPull_(body, who) {
  var month = String(body.month || '');
  if (!/^\d{4}-\d{2}$/.test(month)) throw new Error('เดือนไม่ถูกต้อง (ต้องเป็น YYYY-MM)');
  var tok = body.idToken;
  /* forUid — ผู้ดูแลหรือ FA ทำใบเบิกแทนคนอื่น ตรวจสิทธิ์ที่นี่เอง ไม่พึ่งแค่ rules
     เพราะอ่าน payRates ไม่ได้ก็ยังดึงชั่วโมงบินของคนนั้นได้อยู่ดี */
  var target = who.uid;
  if (body.forUid && body.forUid !== who.uid) {
    if (!mrfProxyOk_(who, tok)) throw new Error('ทำใบเบิกแทนคนอื่นได้เฉพาะผู้ดูแลระบบหรือตำแหน่ง FA');
    target = String(body.forUid);
  }
  var prof = {}, rate = {}, cfg = {};
  try { prof = fsGet_('users/' + target, tok); } catch (e) {}
  try { rate = fsGet_('payRates/' + target, tok); } catch (e) {}
  try { cfg = fsGet_('config/mrf', tok); } catch (e) {}
  var C = {};
  Object.keys(MRF_DEFAULT).forEach(function (k) { C[k] = cfg[k] != null && cfg[k] !== '' ? cfg[k] : MRF_DEFAULT[k]; });
  var arr = function (v) { return Array.isArray(v) ? v.map(String) : []; };
  var decided = body.decided === true, exclSet = {}, acc = {}, rej = {};
  arr(body.excl).forEach(function (k) { exclSet[k] = true; });
  arr(body.accept).forEach(function (n) { acc[mrfNorm_(n)] = true; });
  arr(body.reject).forEach(function (n) { rej[mrfNorm_(n)] = true; });

  var names = [prof.name].concat(rate.aliases || []).filter(function (x) { return x; });
  var want = names.map(mrfNorm_).filter(function (n) { return n; });
  if (!want.length) throw new Error('ยังไม่มีชื่อในโปรไฟล์ — ให้ผู้ดูแลตั้งชื่อก่อน');
  /* 0 = ตรง · 1 = ต่างหนึ่งตัว (นับเลย) · 2–3 = ต้องถาม · อื่น ๆ = ไม่ใช่
     ชื่อสั้นกว่า 8 ตัวอักษรต้องตรงเป๊ะ — ระยะ 2 ในชื่อสั้นเป็นคนละคนได้ง่าย */
  var nameCache = {};
  var nameDist = function (raw) {
    var n = mrfNorm_(raw);
    if (!n || n === 'na') return 99;
    if (nameCache[n] != null) return nameCache[n];
    var best = 99;
    want.forEach(function (w) {
      var d = mrfDist_(n, w);
      if (d > 0 && (n.length < 8 || w.length < 8)) d = 99;
      if (d < best) best = d;
    });
    return (nameCache[n] = best);
  };

  var sh = SpreadsheetApp.openById(C.logSheet).getSheetByName(C.logTab);
  if (!sh) throw new Error('ไม่พบแท็บ "' + C.logTab + '" ในไฟล์ Flight Logs');
  var all = sh.getDataRange().getDisplayValues();
  var H = all[0].map(function (h) { return String(h).replace(/\s+/g, ' ').trim().toLowerCase(); });
  var col = function (name) { return H.indexOf(name.toLowerCase()); };
  var ix = { id: col('Flight Log ID'), date: col('Flight Date'), type: col('Flight Type'), reg: col('Aircraft Registration'),
             on: col('Engine ON'), off: col('Engine OFF'), block: col('Block Time'), flt: col('Flight Time'),
             p1: col('Pilot 1'), p2: col('Pilot 2'), remark: col('Remark') };
  var missing = Object.keys(ix).filter(function (k) { return ix[k] < 0; });
  if (missing.length) throw new Error('ไฟล์ Flight Logs ไม่มีคอลัมน์ที่ต้องใช้: ' + missing.join(', '));

  var warns = [], ask = {}, auto = {}, cand = [], idAll = {};
  for (var r0 = 1; r0 < all.length; r0++) {
    var id0 = String(all[r0][ix.id] || '').trim();
    if (id0) idAll[id0] = (idAll[id0] || 0) + 1;
  }
  for (var r = 1; r < all.length; r++) {
    var row = all[r], ymd = mrfYmd_(row[ix.date]);
    if (!ymd || ymd.slice(0, 7) !== month) continue;
    var hit = '', who1 = '';
    [['P1', row[ix.p1]], ['P2', row[ix.p2]]].forEach(function (pp) {
      if (hit) return;
      var raw = String(pp[1] || '').trim(), d = nameDist(raw), n = mrfNorm_(raw);
      if (d === 0) { hit = pp[0]; who1 = raw; }
      else if (d === 1) { hit = pp[0]; who1 = raw; auto[raw] = (auto[raw] || 0) + 1; }
      else if (d <= 3) {
        if (acc[n]) { hit = pp[0]; who1 = raw; }
        if (!acc[n] && !rej[n]) {
          ask[raw] = ask[raw] || { name: raw, dist: d, n: 0, ids: [] };
          ask[raw].n++; ask[raw].ids.push(String(row[ix.id] || '').trim());
        }
      }
    });
    if (!hit) continue;
    var id = String(row[ix.id] || '').trim(), rem = String(row[ix.remark] || '').trim();
    var on = mrfMin_(row[ix.on]), off = mrfMin_(row[ix.off]);
    var blk = mrfMin_(row[ix.block]), src = 'block';
    if (blk == null && on != null && off != null && off > on) { blk = off - on; src = 'engine'; }
    if (blk == null) { var ft = mrfMin_(row[ix.flt]); blk = ft || 0; src = ft != null ? 'flight' : 'none'; }
    var test = /\btest\b|safe to delete/i.test(rem);
    cand.push({ key: 'r' + (r + 1), id: id, ymd: ymd, type: String(row[ix.type] || '').trim(), reg: String(row[ix.reg] || '').trim(),
                on: on, off: off, blk: blk, src: src, rem: rem.replace(/^\[Crew corrected[^\]]*\]?/i, '').trim(),
                seat: hit, as: who1, test: test,
                out: decided ? !!exclSet['r' + (r + 1)] : test });
  }

  /* ข้อมูลที่ขัดกัน — ให้ผู้เบิกเห็นทั้งสองแถวแล้วติ๊กว่าไม่นับแถวไหน ระบบไม่เลือกให้
     (ยกเว้นแถวทดสอบที่ค่าตั้งต้นไม่นับ แต่ติ๊กกลับมานับได้) */
  var conflicts = [], byId = {};
  cand.forEach(function (f) { (byId[f.id] = byId[f.id] || []).push(f); });
  /* ID ซ้ำนับทั้งชีต — แถวอีกแถวอาจเป็นของคนอื่นหรือเดือนอื่น ผู้เบิกเห็นเฉพาะแถวของตัวเองให้เลือก
     แต่ต้องรู้ว่ามีแถวอื่นใช้ ID เดียวกัน เพราะเป็นเที่ยวบินเดียวกันที่ถูกบันทึกซ้ำได้ */
  var dupIds = {};
  Object.keys(byId).forEach(function (id) {
    if (byId[id].length > 1 || (id && idAll[id] > 1)) {
      dupIds[id] = true;
      var other = (idAll[id] || 0) - byId[id].length;
      conflicts.push({ kind: 'dup', label: 'Flight Log ID ซ้ำ ' + id + (other > 0 ? ' — อีก ' + other + ' แถวในชีตที่ไม่ใช่ของคุณใช้ ID นี้' : ''),
                       other: other, rows: byId[id] });
    }
  });
  var tests = cand.filter(function (f) { return f.test && !dupIds[f.id]; });
  if (tests.length) conflicts.push({ kind: 'test', label: 'Remark ระบุว่าเป็นรายการทดสอบ', rows: tests });
  var sorted = cand.slice().sort(function (a, b) { return a.ymd < b.ymd ? -1 : a.ymd > b.ymd ? 1 : (a.on || 0) - (b.on || 0); });
  for (var q = 0; q < sorted.length; q++) for (var q2 = q + 1; q2 < sorted.length; q2++) {
    var A1 = sorted[q], B1 = sorted[q2];
    if (B1.ymd !== A1.ymd) break;
    if (A1.id === B1.id) continue;      // อยู่ในกลุ่ม ID ซ้ำแล้ว
    if (A1.on != null && A1.off != null && B1.on != null && B1.off != null && B1.on < A1.off && A1.on < B1.off)
      conflicts.push({ kind: 'overlap', label: 'เวลาบินทับกัน ' + A1.id + ' กับ ' + B1.id, rows: [A1, B1] });
  }

  var mine = sorted.filter(function (f) { return !f.out; });
  mine.forEach(function (f) {
    if (f.src === 'flight') warns.push(f.id + ' (' + f.ymd + ') ไม่มี Block Time และ Engine ON/OFF — ใช้ Flight Time ' + mrfHm_(f.blk) + ' แทน');
    if (f.src === 'none') warns.push(f.id + ' (' + f.ymd + ') ไม่มีทั้ง Block Time, Engine ON/OFF และ Flight Time — นับ 0 ชม.');
  });

  var days = [], byDay = {};
  mine.forEach(function (f) {
    var d = byDay[f.ymd];
    if (!d) { d = byDay[f.ymd] = { ymd: f.ymd, f: [] }; days.push(d); }
    d.f.push(f);
  });
  var uniq = function (a) { return a.filter(function (x, i) { return x && a.indexOf(x) === i; }); };
  var perDiem = 0, sheet = [];
  days.forEach(function (d) {
    var fl = d.f, blk = fl.reduce(function (a, f) { return a + (f.blk || 0); }, 0);
    /* per diem นับจากเที่ยวที่มีเวลา Engine ON/OFF เท่านั้น — ไม่มีเวลาเลยทั้งวัน = ไม่นับ
       (เดิมให้ 0.5 ผู้ควบคุมเอกสารสั่งให้ไม่นับ เพราะพิสูจน์ช่วงทำงานไม่ได้) */
    var timed = fl.filter(function (f) { return f.on != null && f.off != null; });
    var pd = 0;
    if (timed.length) {
      var s0 = Math.min.apply(null, timed.map(function (f) { return f.on; })) - C.preMin;
      var s1 = Math.max.apply(null, timed.map(function (f) { return f.off; })) + C.postMin;
      pd = s1 - s0 >= C.fullDayHrs * 60 ? 1 : 0.5;
      d.duty = mrfHm_(s0) + '–' + mrfHm_(s1);
    } else warns.push(d.ymd + ' ไม่มีเวลา Engine ON/OFF — ไม่นับ per diem วันนี้');
    perDiem += pd;
    sheet.push({ date: d.ymd, detail: fl.map(function (f) { return f.id; }).join(', '),
                 place: uniq(fl.map(function (f) { return f.reg; })).join(' / '),
                 type: uniq(fl.map(function (f) { return f.type; })).join(' / ') || 'FLT',
                 flt: mrfHm_(blk), gnd: '', remark: uniq(fl.map(function (f) { return f.rem; })).join('; ').slice(0, 120),
                 src: 'flightlog', pd: pd, duty: d.duty || '' });
  });

  // คืนที่พัก — วันทำงานที่หยุดคั่นไม่เกิน gapDays วันถือเป็นช่วงเดียวกัน · คืนของช่วง = วันสุดท้าย − วันแรก
  var nights = 0, stays = [];
  var dn = days.map(function (d) { return mrfDayNo_(d.ymd); });
  for (var a = 0; a < dn.length;) {
    var b = a;
    while (b + 1 < dn.length && dn[b + 1] - dn[b] - 1 <= C.gapDays) b++;
    nights += dn[b] - dn[a];
    stays.push(days[a].ymd.slice(8) + (b > a ? '–' + days[b].ymd.slice(8) : ''));
    a = b + 1;
  }

  var pub = function (f) {
    return { key: f.key, id: f.id, date: f.ymd, reg: f.reg, type: f.type, as: f.as, seat: f.seat,
             on: f.on == null ? '' : mrfHm_(f.on), off: f.off == null ? '' : mrfHm_(f.off),
             blk: mrfHm_(f.blk), src: f.src, rem: f.rem.slice(0, 80), test: f.test, out: f.out };
  };
  var num = function (v) { return v === '' || v == null || isNaN(Number(v)) ? null : Number(v); };
  return {
    month: month, flights: mine.length, days: days.length, names: names,
    sheet: sheet, nights: nights, stays: stays, perDiemDays: perDiem,
    conflicts: conflicts.map(function (c) { return { kind: c.kind, label: c.label, other: c.other || 0, rows: c.rows.map(pub) }; }),
    ask: Object.keys(ask).map(function (k) { return ask[k]; }),
    auto: Object.keys(auto).map(function (k) { return { name: k, n: auto[k] }; }),
    accepted: arr(body.accept), excluded: sorted.filter(function (f) { return f.out; }).map(pub),
    rates: { flt: num(rate.fltRate), gnd: num(rate.gndRate), accom: num(rate.accomRate),
             perDiem: rate.perDiem === true, perDiemRate: num(rate.perDiemRate) },
    rule: { preMin: C.preMin, postMin: C.postMin, fullDayHrs: C.fullDayHrs, gapDays: C.gapDays },
    warns: warns
  };
}

function mrfProxyOk_(who, tok) {
  try {
    var adm = fsGet_('config/admins', tok);
    if ((adm.uids || []).indexOf(who.uid) >= 0) return true;
  } catch (e) {}
  try {
    var me = fsGet_('users/' + who.uid, tok);
    return me.active !== false && (me.positions || []).indexOf('FA') >= 0
        && (me.roles || []).some(function (r) { return ['ins', 'mnt', 'ops', 'mgt', 'sms'].indexOf(r) >= 0; });
  } catch (e) { return false; }
}

/* ชื่อนักบินทั้งหมดใน Flight Log พร้อมจำนวนเที่ยว — ผู้ดูแลใช้ใส่ชื่อที่สะกดต่าง (ผู้ดูแลระบบเท่านั้น) */
function mrfNames_(body, who) {
  var admins = {};
  try { admins = fsGet_('config/admins', body.idToken); } catch (e) { throw new Error('ตรวจสิทธิ์ผู้ดูแลไม่ได้'); }
  if ((admins.uids || []).indexOf(who.uid) < 0) throw new Error('ต้องเป็นผู้ดูแลระบบ');
  var cfg = {}; try { cfg = fsGet_('config/mrf', body.idToken); } catch (e) {}
  var sh = SpreadsheetApp.openById(cfg.logSheet || MRF_DEFAULT.logSheet).getSheetByName(cfg.logTab || MRF_DEFAULT.logTab);
  var all = sh.getDataRange().getDisplayValues();
  var H = all[0].map(function (h) { return String(h).replace(/\s+/g, ' ').trim().toLowerCase(); });
  var p1 = H.indexOf('pilot 1'), p2 = H.indexOf('pilot 2'), n = {};
  for (var r = 1; r < all.length; r++) [all[r][p1], all[r][p2]].forEach(function (x) {
    x = String(x || '').trim(); if (x && x !== '-' && x.toUpperCase() !== 'N/A') n[x] = (n[x] || 0) + 1;
  });
  return Object.keys(n).sort().map(function (k) { return { name: k, n: n[k] }; });
}
