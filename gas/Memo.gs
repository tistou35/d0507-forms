/**
 * บันทึกข้อความภายใน — PDF
 *
 * อ่านตัวหนังสือจาก Firestore เอง ด้วย idToken ของผู้เรียก (ผ่าน security rules ตัวเดียวกับหน้าเว็บ)
 * ไม่รับเนื้อหาจากเบราว์เซอร์ — ไม่งั้นเจ้าหน้าที่คนไหนก็ส่งข้อความอะไรมาก็ได้
 * แล้วได้ PDF ที่มีเลขที่และลายเซ็นเหมือนหนังสือที่ออกจริง
 *
 * สองฉบับต่อหนังสือหนึ่งเรื่อง
 *   proposed  ผู้เสนอลงนามแล้ว รอผู้สั่งการ — ผู้สั่งการใช้หน้า 1 เป็นพื้นหลังตอนวางบล็อกสั่งการ
 *   final     ผู้สั่งการลงนามแล้ว — บล็อกสั่งการวางเป็นภาพลอยที่ตำแหน่งเดียวกับที่ลากไว้
 * หน้ากระดาษ A4 ขอบบน 54 pt ซ้าย 64 pt — หน้าเว็บคำนวณตำแหน่งบล็อกจากขอบชุดเดียวกัน
 * เก็บที่ <PARENT>/MEMO/<ปี พ.ศ.>/ · สร้างซ้ำได้ ของเดิมย้ายลงถังขยะ
 */
var MEMO_PAGE = { w: 595.28, h: 841.89, top: 54, bottom: 54, left: 64, right: 64 };
/* Helvetica ไม่มีใน Google Docs — ใช้ Arial ซึ่งความกว้างตัวอักษรเท่ากันทุกตัว */
var MEMO_FONT = { Helvetica: 'Arial', Arial: 'Arial', Courier: 'Courier New' };

function memoPdf_(body) {
  var id = String(body.memoId || '');
  if (!/^[A-Za-z0-9_-]{1,64}$/.test(id)) throw new Error('memoId ไม่ถูกต้อง');
  var m = fsGet_('memos/' + id, body.idToken);
  var finalSt = ['issued', 'declined', 'superseded', 'expired'];
  if (m.status !== 'proposed' && finalSt.indexOf(m.status) < 0)
    throw new Error('ยังไม่มีผู้เสนอลงนาม (สถานะ ' + m.status + ')');
  if (!m.number || !m.issuedAt) throw new Error('หนังสือไม่มีเลขที่หรือวันที่ออก');
  var stage = m.status === 'proposed' ? 'proposed' : 'final';
  var r = m.render || {}, S = m.signers || {}, P = S.proposer || {}, E = S.endorser || {};

  var tz = 'Asia/Bangkok';
  var issued = new Date(m.issuedAt);
  var issueLong = Utilities.formatDate(issued, tz, 'dd MMM yyyy').toUpperCase();
  var issueYmd = Utilities.formatDate(issued, tz, 'yyyy-MM-dd');
  var signedAt = Utilities.formatDate(issued, tz, 'dd MMM yyyy HH:mm').toUpperCase() + ' (UTC+7)';
  // วันมีผลก่อนวันที่ออก = ออกหนังสือยืนยันย้อนหลัง · ตัดสินที่นี่จากวันที่ลงนามจริง
  var retro = m.effectiveFrom && m.effectiveFrom < issueYmd ? (r.retro || '') : '';

  var name = String(m.number).replace(/[\/\\]/g, '_') + (stage === 'proposed' ? ' (awaiting endorsement)' : '');
  var doc = DocumentApp.create(name);
  var b = doc.getBody();
  b.setPageWidth(MEMO_PAGE.w).setPageHeight(MEMO_PAGE.h)
   .setMarginTop(MEMO_PAGE.top).setMarginBottom(MEMO_PAGE.bottom)
   .setMarginLeft(MEMO_PAGE.left).setMarginRight(MEMO_PAGE.right);
  var F = MEMO_FONT[m.font] || 'Arial';
  var first = b.getParagraphs()[0], used = false;
  var para = function (t, o) {
    o = o || {};
    var p;
    if (!used && t) { first.setText(t); p = first; used = true; }   // ใช้ย่อหน้าแรกที่ Docs ใส่มา — ไม่ให้มีบรรทัดว่างบนสุด
    else p = b.appendParagraph(t || ' ');
    p.setFontFamily(F).setFontSize(o.size || 10.5).setBold(!!o.bold).setItalic(!!o.italic)
     .setSpacingAfter(o.after == null ? 6 : o.after).setSpacingBefore(0).setIndentStart(0).setIndentFirstLine(0)
     .setLineSpacing(o.line || 1.1);
    p.setAlignment(o.center ? DocumentApp.HorizontalAlignment.CENTER : DocumentApp.HorizontalAlignment.LEFT);
    p.setForegroundColor(o.color || '#000000');
    return p;
  };
  var anchor = null;
  if (m.test) anchor = para('TEST — NOT A VALID MEMORANDUM', { bold: true, center: true, color: '#B91C1C' });
  var org = para('D-0507 FLIGHT TRAINING CO., LTD.', { bold: true, center: true, size: 13, after: 0 });
  anchor = anchor || org;
  para('Approved Training Organisation', { center: true, size: 9, after: 10, color: '#444444' });
  para('INTERNAL MEMORANDUM', { bold: true, center: true, size: 15, after: 10 });

  var who = function (x) { return [x.title, x.name].filter(function (v) { return v; }).join(' — '); };
  var rows = [['No.', m.number], ['Date of issue', issueLong], ['From', who(P)], ['To', who(E)]];
  if (r.cc) rows.push(['CC', r.cc]);
  rows.push(['Subject', m.subject || '']);
  rows.push(['Purpose', r.purpose || '']);
  if (r.reference) rows.push(['Reference', r.reference]);
  if (r.circ) rows.push(['Circulation', r.circ]);
  rows = rows.map(function (x) { return [x[0], String(x[1] || '—')]; });   // ช่องว่างแทรกไม่ได้
  var t = b.appendTable(rows);
  t.setBorderColor('#999999').setBorderWidth(0.75);
  for (var i = 0; i < t.getNumRows(); i++) {
    for (var j = 0; j < 2; j++) {
      var c = t.getRow(i).getCell(j);
      c.setPaddingTop(3).setPaddingBottom(3).setPaddingLeft(5).setPaddingRight(5);
      var tx = c.editAsText(); tx.setFontFamily(F).setFontSize(9.5).setItalic(false);
      if (j === 0) { tx.setBold(true); c.setBackgroundColor('#F2F2F2'); }
      else tx.setBold(rows[i][0] === 'No.' || rows[i][0] === 'Subject');   // ตัวหนาเฉพาะเลขที่และเรื่อง
    }
  }
  t.setColumnWidth(0, 92);
  para('', { after: 4 });

  if (retro) {
    var rt = b.appendTable([[retro]]);
    rt.setBorderColor('#B45309').setBorderWidth(1.5);
    var rc = rt.getRow(0).getCell(0);
    rc.setBackgroundColor('#FFF7ED').setPaddingTop(6).setPaddingBottom(6).setPaddingLeft(8).setPaddingRight(8);
    rc.editAsText().setFontFamily(F).setFontSize(9.5).setBold(false);
    para('', { after: 4 });
  }

  (m.body || []).forEach(function (p, k) { para((k + 1) + '.  ' + p, { after: 8, line: 1.15 }); });
  if (r.validity) para(r.validity, { bold: true, after: 6 });
  if (r.note) para(r.note, { italic: true, size: 9.5, after: 14 });

  // ผู้เสนอ
  para('', { after: 2 });
  if (m.proposerSig && /^data:image\/png;base64,/.test(m.proposerSig)) {
    var img = b.appendParagraph(' ').setSpacingAfter(0).appendInlineImage(pngBlob_(m.proposerSig));
    var w = img.getWidth(), h = img.getHeight(), sc = Math.min(1, 160 / w, 54 / h);
    img.setWidth(Math.round(w * sc)).setHeight(Math.round(h * sc));
  }
  para('______________________________', { after: 0 });
  para(P.name || '', { bold: true, after: 0 });
  para(P.title || '', { after: 4 });
  para('Proposed and signed electronically on ' + signedAt + ' in the D-0507 Forms system. ' +
       'The date of issue is the time of this signature and cannot be altered.', { size: 8, color: '#555555', after: 0 });

  // ผู้รับทราบ/สั่งการ
  var en = m.endorsement || {};
  if (stage === 'proposed') {
    para('Awaiting endorsement by ' + who(E) + '.', { size: 8, color: '#B45309', after: 0 });
  } else if (m.endorsementImg && /^data:image\/png;base64,/.test(m.endorsementImg)) {
    // ภาพลอยเหนือข้อความ ผูกกับย่อหน้าแรกของหน้า 1 (ซึ่งเริ่มที่ขอบบนและขอบซ้ายพอดี)
    var bw = Number(en.w) || 250, bh = Number(m.endorsementH) || 120;
    var pi = anchor.addPositionedImage(pngBlob_(m.endorsementImg));
    // ขนาดภาพใน Docs เป็นพิกเซล (1 px = 0.75 pt) ส่วนตำแหน่งเป็นพอยต์ — แปลงให้กว้างเท่าที่ลากไว้จริง
    pi.setWidth(Math.round(bw / 0.75)).setHeight(Math.round(bh / 0.75))
      .setLeftOffset((Number(en.x) || 0) - MEMO_PAGE.left).setTopOffset((Number(en.y) || 0) - MEMO_PAGE.top)
      .setLayout(DocumentApp.PositionedLayout.ABOVE_TEXT);
  } else if (m.endorsedAt) {
    // ยังไม่มีภาพบล็อก — พิมพ์เป็นข้อความต่อท้ายแทน ข้อมูลครบเท่ากัน
    var ed = Utilities.formatDate(new Date(m.endorsedAt), tz, 'dd MMM yyyy HH:mm').toUpperCase() + ' (UTC+7)';
    para('', { after: 6 });
    para(en.action || '', { bold: true, after: 2 });
    if (en.text) para(en.text, { after: 4 });
    para(who(E) + ' — signed electronically on ' + ed, { size: 8.5, after: 0 });
  }
  doc.saveAndClose();

  var file = DriveApp.getFileById(doc.getId());
  var pdf = file.getAs('application/pdf').setName(name + '.pdf');
  var folder = memoFolder_(m.year || Utilities.formatDate(issued, tz, 'yyyy') * 1 + 543, !!m.test);
  var old = folder.getFilesByName(name + '.pdf');
  while (old.hasNext()) old.next().setTrashed(true);
  var out = folder.createFile(pdf);
  file.setTrashed(true);                            // Doc ชั่วคราว — ฉบับที่เก็บคือ PDF
  var res = { id: out.getId(), url: out.getUrl(), name: out.getName(), stage: stage };
  // ตรวจด้วยการเปิดไฟล์: bytes:true คืน PDF มาด้วย · ฉบับทดสอบ discard:true แล้วทิ้งไฟล์ทันที
  if (body.bytes) res.bytes = Utilities.base64Encode(out.getBlob().getBytes());
  if (body.discard && m.test) {
    // ฉบับทดสอบ: ทิ้งทุกไฟล์ของเลขนี้ในโฟลเดอร์ TEST (รวมฉบับรอสั่งการ) — ใช้ได้กับ test เท่านั้น
    var base = String(m.number).replace(/[\/\\]/g, '_'), all = folder.getFiles(), n = 0;
    while (all.hasNext()) { var f = all.next(); if (f.getName().indexOf(base) === 0) { f.setTrashed(true); n++; } }
    res.discarded = n;
  }
  return res;
}

/* PDF ที่สร้างไว้แล้วของหนังสือหนึ่งฉบับ — ใช้เป็นพื้นหลังตอนผู้สั่งการวางบล็อก
   คืนเฉพาะไฟล์ที่ id ตรงกับที่บันทึกในเอกสาร (อ่านด้วยสิทธิ์ของผู้เรียก) ไม่ใช่ไฟล์อะไรก็ได้ */
function memoPdfBytes_(body) {
  var id = String(body.memoId || '');
  if (!/^[A-Za-z0-9_-]{1,64}$/.test(id)) throw new Error('memoId ไม่ถูกต้อง');
  var m = fsGet_('memos/' + id, body.idToken);
  var ref = m.status === 'proposed' ? m.pdfProposed : m.pdf;
  if (!ref || !ref.id) throw new Error('ยังไม่มี PDF');
  var f = DriveApp.getFileById(ref.id);
  if (f.isTrashed()) throw new Error('ไฟล์ PDF ถูกย้ายลงถังขยะแล้ว');
  return { name: f.getName(), bytes: Utilities.base64Encode(f.getBlob().getBytes()) };
}

function pngBlob_(dataUrl) {
  return Utilities.newBlob(Utilities.base64Decode(String(dataUrl).split(',')[1]), 'image/png', 'img.png');
}

function memoFolder_(yearBE, test) {
  var top = subFolder_('MEMO');
  var nm = test ? 'TEST' : String(yearBE);
  var it = top.getFoldersByName(nm);
  return it.hasNext() ? it.next() : top.createFolder(nm);
}

/* ── Firestore REST ด้วย idToken ของผู้เรียก ──────────────────
   กติกาการอ่านเหมือนในหน้าเว็บทุกอย่าง — สคริปต์ไม่ได้สิทธิ์เกินคนที่กด */
function fsGet_(path, idToken) {
  var url = 'https://firestore.googleapis.com/v1/projects/' + cfg_('FIREBASE_PROJECT') +
            '/databases/(default)/documents/' + path;
  var res = UrlFetchApp.fetch(url, { headers: { Authorization: 'Bearer ' + idToken }, muteHttpExceptions: true });
  if (res.getResponseCode() === 404) throw new Error('ไม่พบ ' + path);
  if (res.getResponseCode() !== 200) throw new Error('อ่าน ' + path + ' ไม่ได้ (' + res.getResponseCode() + ')');
  return fsFields_(JSON.parse(res.getContentText()).fields || {});
}
function fsFields_(f) { var o = {}; Object.keys(f).forEach(function (k) { o[k] = fsVal_(f[k]); }); return o; }
function fsVal_(v) {
  if ('stringValue' in v) return v.stringValue;
  if ('integerValue' in v) return Number(v.integerValue);
  if ('doubleValue' in v) return v.doubleValue;
  if ('booleanValue' in v) return v.booleanValue;
  if ('timestampValue' in v) return v.timestampValue;
  if ('nullValue' in v) return null;
  if ('mapValue' in v) return fsFields_(v.mapValue.fields || {});
  if ('arrayValue' in v) return (v.arrayValue.values || []).map(fsVal_);
  return null;
}
