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

function mrfPull_(body, who) {
  var month = String(body.month || '');
  if (!/^\d{4}-\d{2}$/.test(month)) throw new Error('เดือนไม่ถูกต้อง (ต้องเป็น YYYY-MM)');
  var tok = body.idToken;
  var prof = {}, rate = {}, cfg = {};
  try { prof = fsGet_('users/' + who.uid, tok); } catch (e) {}
  try { rate = fsGet_('payRates/' + who.uid, tok); } catch (e) {}
  try { cfg = fsGet_('config/mrf', tok); } catch (e) {}
  var C = {};
  Object.keys(MRF_DEFAULT).forEach(function (k) { C[k] = cfg[k] != null && cfg[k] !== '' ? cfg[k] : MRF_DEFAULT[k]; });

  var names = [prof.name].concat(rate.aliases || []).filter(function (x) { return x; });
  var want = {}; names.forEach(function (n) { want[mrfNorm_(n)] = n; });
  if (!Object.keys(want).length) throw new Error('ยังไม่มีชื่อในโปรไฟล์ — ให้ผู้ดูแลตั้งชื่อก่อน');

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

  var warns = [], near = {}, seenId = {}, mine = [];
  for (var r = 1; r < all.length; r++) {
    var row = all[r], ymd = mrfYmd_(row[ix.date]);
    if (!ymd || ymd.slice(0, 7) !== month) continue;
    var p1 = row[ix.p1], p2 = row[ix.p2], hit = want[mrfNorm_(p1)] ? 'P1' : want[mrfNorm_(p2)] ? 'P2' : '';
    if (!hit) {
      // ชื่อคล้าย (คำแรกตรงกัน) แต่สะกดต่าง — บอกให้ผู้ดูแลเพิ่มเป็นชื่ออื่น ไม่จับคู่เอง
      [p1, p2].forEach(function (p) {
        var f = mrfNorm_(String(p).split(/\s+/)[0]);
        names.forEach(function (n) { if (f && f.length > 2 && mrfNorm_(String(n).split(/\s+/)[0]) === f) near[p] = true; });
      });
      continue;
    }
    var id = String(row[ix.id] || '').trim(), rem = String(row[ix.remark] || '').trim();
    if (/\btest\b|safe to delete/i.test(rem)) { warns.push(id + ' (' + ymd + ') เป็นรายการทดสอบ — ไม่นับ'); continue; }
    if (seenId[id]) warns.push('Flight Log ID ซ้ำ: ' + id + ' — ตรวจในไฟล์ Flight Logs');
    seenId[id] = true;
    var on = mrfMin_(row[ix.on]), off = mrfMin_(row[ix.off]);
    var blk = mrfMin_(row[ix.block]);
    if (blk == null && on != null && off != null && off > on) blk = off - on;
    if (blk == null) {
      var ft = mrfMin_(row[ix.flt]);
      warns.push(id + ' (' + ymd + ') ไม่มี Block Time' + (ft != null ? ' — ใช้ Flight Time ' + row[ix.flt] + ' แทน' : ' — นับ 0 ชม.'));
      blk = ft || 0;
    }
    mine.push({ id: id, ymd: ymd, type: String(row[ix.type] || '').trim(), reg: String(row[ix.reg] || '').trim(),
                on: on, off: off, blk: blk, rem: rem.replace(/^\[Crew corrected[^\]]*\]?/i, '').trim(), seat: hit });
  }
  Object.keys(near).forEach(function (n) {
    warns.push('พบชื่อ "' + n + '" ในเดือนนี้ที่ไม่ได้นับ — ถ้าเป็นคนเดียวกับผู้เบิก ให้ผู้ดูแลเพิ่มเป็นชื่ออื่นในหน้าตั้งค่าระบบ › อัตราค่าตอบแทน');
  });

  // แถวละหนึ่งวัน เรียงตามวันที่ แล้วตามเวลา Engine ON
  mine.sort(function (a, b) { return a.ymd < b.ymd ? -1 : a.ymd > b.ymd ? 1 : (a.on || 0) - (b.on || 0); });
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
    // เที่ยวบินทับเวลากันของคนเดียวกัน = ข้อมูลผิด ชั่วโมงจะนับซ้ำ
    for (var i = 1; i < fl.length; i++) {
      if (fl[i].on != null && fl[i - 1].off != null && fl[i].on < fl[i - 1].off)
        warns.push(fl[i - 1].id + ' กับ ' + fl[i].id + ' (' + d.ymd + ') เวลาทับกัน — ชั่วโมงอาจนับซ้ำ');
    }
    var ons = fl.map(function (f) { return f.on; }).filter(function (x) { return x != null; });
    var offs = fl.map(function (f) { return f.off; }).filter(function (x) { return x != null; });
    var pd = 0.5;
    if (ons.length && offs.length) {
      var span = (Math.max.apply(null, offs) + C.postMin) - (Math.min.apply(null, ons) - C.preMin);
      pd = span >= C.fullDayHrs * 60 ? 1 : 0.5;
      d.duty = mrfHm_(Math.min.apply(null, ons) - C.preMin) + '–' + mrfHm_(Math.max.apply(null, offs) + C.postMin);
    } else warns.push(d.ymd + ' ไม่มีเวลา Engine ON/OFF — นับ per diem 0.5 วัน');
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

  var num = function (v) { return v === '' || v == null || isNaN(Number(v)) ? null : Number(v); };
  return {
    month: month, flights: mine.length, days: days.length, names: names,
    sheet: sheet, nights: nights, stays: stays, perDiemDays: perDiem,
    rates: { flt: num(rate.fltRate), gnd: num(rate.gndRate), accom: num(rate.accomRate),
             perDiem: rate.perDiem === true, perDiemRate: num(rate.perDiemRate) },
    rule: { preMin: C.preMin, postMin: C.postMin, fullDayHrs: C.fullDayHrs, gapDays: C.gapDays },
    warns: warns
  };
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
