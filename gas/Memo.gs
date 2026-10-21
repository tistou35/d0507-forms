/**
 * บันทึกข้อความภายใน — PDF ของฉบับที่ออกแล้ว
 *
 * อ่านตัวหนังสือจาก Firestore เอง ด้วย idToken ของผู้เรียก (ผ่าน security rules ตัวเดียวกับหน้าเว็บ)
 * ไม่รับเนื้อหาจากเบราว์เซอร์ — ไม่งั้นเจ้าหน้าที่คนไหนก็ส่งข้อความอะไรมาก็ได้
 * แล้วได้ PDF ที่มีเลขที่และลายเซ็นเหมือนหนังสือที่ออกจริง
 *
 * ทำได้เฉพาะฉบับที่ status = issued (หรือถูกแทน/หมดอายุภายหลัง) ร่างไม่มี PDF
 * เก็บที่ <PARENT>/MEMO/<ปี พ.ศ.>/<เลขที่>.pdf · สร้างซ้ำได้ ของเดิมย้ายลงถังขยะ
 */
function memoPdf_(body) {
  var id = String(body.memoId || '');
  if (!/^[A-Za-z0-9_-]{1,64}$/.test(id)) throw new Error('memoId ไม่ถูกต้อง');
  var m = fsGet_('memos/' + id, body.idToken);
  if (['issued', 'superseded', 'expired'].indexOf(m.status) < 0)
    throw new Error('ยังไม่ได้ออกหนังสือฉบับนี้ (สถานะ ' + m.status + ')');
  if (!m.number || !m.issuedAt) throw new Error('หนังสือไม่มีเลขที่หรือวันที่ออก');
  var r = m.render || {};

  var tz = 'Asia/Bangkok';
  var issued = new Date(m.issuedAt);
  var issueLong = Utilities.formatDate(issued, tz, 'dd MMM yyyy').toUpperCase();
  var issueYmd = Utilities.formatDate(issued, tz, 'yyyy-MM-dd');
  var signedAt = Utilities.formatDate(issued, tz, 'dd MMM yyyy HH:mm').toUpperCase() + ' (UTC+7)';
  // วันมีผลก่อนวันที่ออก = ออกหนังสือยืนยันย้อนหลัง · ตัดสินที่นี่จากวันที่ลงนามจริง
  var retro = m.effectiveFrom && m.effectiveFrom < issueYmd ? (r.retro || '') : '';

  var name = String(m.number).replace(/[\/\\]/g, '_');
  var doc = DocumentApp.create(name);
  var b = doc.getBody();
  b.setMarginTop(54).setMarginBottom(54).setMarginLeft(64).setMarginRight(64);
  var F = 'Times New Roman';
  var para = function (t, o) {
    o = o || {};
    var p = b.appendParagraph(t || ' ');
    p.setFontFamily(F).setFontSize(o.size || 11).setBold(!!o.bold).setItalic(!!o.italic)
     .setSpacingAfter(o.after == null ? 6 : o.after).setSpacingBefore(0);
    if (o.center) p.setAlignment(DocumentApp.HorizontalAlignment.CENTER);
    if (o.color) p.setForegroundColor(o.color);
    return p;
  };
  var first = b.getParagraphs()[0];                 // ย่อหน้าว่างที่ DocumentApp ใส่มาให้ — ลบตอนท้าย
  if (m.test) para('TEST — NOT A VALID MEMORANDUM', { bold: true, center: true, color: '#B91C1C' });
  para('D-0507 FLIGHT TRAINING CO., LTD.', { bold: true, center: true, size: 13, after: 0 });
  para('Approved Training Organisation', { center: true, size: 9, after: 10, color: '#444444' });
  para('INTERNAL MEMORANDUM', { bold: true, center: true, size: 15, after: 10 });

  var rows = [
    ['No.', m.number],
    ['Date of issue', issueLong],
    ['From', (m.signer.title || '') + (m.signer.name ? ' — ' + m.signer.name : '')],
    ['To', m.beneficiaryName || ''],
    ['CC', r.cc || ''],
    ['Subject', m.subject || ''],
    ['Purpose', r.purpose || ''],
    ['Reference', r.reference || ''],
  ];
  rows = rows.map(function (x) { return [x[0], String(x[1] || '—')]; });   // ช่องว่างแทรกไม่ได้
  var t = b.appendTable(rows);
  t.setBorderColor('#999999').setBorderWidth(0.75);
  for (var i = 0; i < t.getNumRows(); i++) {
    for (var j = 0; j < 2; j++) {
      var c = t.getRow(i).getCell(j);
      c.setPaddingTop(3).setPaddingBottom(3).setPaddingLeft(5).setPaddingRight(5);
      var tx = c.editAsText(); tx.setFontFamily(F).setFontSize(10);
      if (j === 0) { tx.setBold(true); c.setBackgroundColor('#F2F2F2'); }
      if (j === 1) tx.setBold(i === 0 || i === 5);    // ตัวหนาเฉพาะเลขที่และเรื่อง
    }
  }
  t.setColumnWidth(0, 92);
  para('', { after: 4 });

  if (retro) {
    var rt = b.appendTable([[retro]]);
    rt.setBorderColor('#B45309').setBorderWidth(1.5);
    var rc = rt.getRow(0).getCell(0);
    rc.setBackgroundColor('#FFF7ED').setPaddingTop(6).setPaddingBottom(6).setPaddingLeft(8).setPaddingRight(8);
    rc.editAsText().setFontFamily(F).setFontSize(10);
    para('', { after: 4 });
  }

  (m.body || []).forEach(function (p, k) {
    var q = para((k + 1) + '.  ' + p, { after: 8 });
    q.setLineSpacing(1.15);
  });
  if (r.validity) para(r.validity, { bold: true, after: 6 });
  if (r.note) para(r.note, { italic: true, size: 10, after: 18 });

  if (m.signature && /^data:image\/png;base64,/.test(m.signature)) {
    var png = Utilities.newBlob(Utilities.base64Decode(m.signature.split(',')[1]), 'image/png', 'sig.png');
    var img = b.appendParagraph(' ').setSpacingAfter(0).appendInlineImage(png);
    var w = img.getWidth(), h = img.getHeight(), s = Math.min(1, 170 / w, 62 / h);
    img.setWidth(Math.round(w * s)).setHeight(Math.round(h * s));
  }
  para('______________________________', { after: 0 });
  para(m.signer.name || '', { bold: true, after: 0 });
  para(m.signer.title || '', { after: 6 });
  para('Signed electronically on ' + signedAt + ' in the D-0507 Forms system. ' +
       'The date of issue is the time of signature and cannot be altered.', { size: 8.5, color: '#555555', after: 0 });
  try { first.removeFromParent(); } catch (e) {}
  doc.saveAndClose();

  var file = DriveApp.getFileById(doc.getId());
  var pdf = file.getAs('application/pdf').setName(name + '.pdf');
  var folder = memoFolder_(m.year || Utilities.formatDate(issued, tz, 'yyyy') * 1 + 543, !!m.test);
  var old = folder.getFilesByName(name + '.pdf');
  while (old.hasNext()) old.next().setTrashed(true);
  var out = folder.createFile(pdf);
  file.setTrashed(true);                            // Doc ชั่วคราว — ฉบับที่เก็บคือ PDF
  var res = { id: out.getId(), url: out.getUrl(), name: out.getName() };
  // ตรวจด้วยการเปิดไฟล์: bytes:true คืน PDF มาด้วย · ฉบับทดสอบ discard:true แล้วทิ้งไฟล์ทันที
  if (body.bytes) res.bytes = Utilities.base64Encode(out.getBlob().getBytes());
  if (body.discard && m.test) { out.setTrashed(true); res.discarded = true; }
  return res;
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
