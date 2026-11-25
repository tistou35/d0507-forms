/**
 * ใบเสร็จค่าใช้จ่าย — เก็บระหว่างเดือน แล้วดึงเข้า D-0507-MRF-001 ส่วนที่ 4 ตอนสิ้นเดือน
 *
 *   rcptUpload { b64, mime, name, month }  → { fileId, name, size, mime }
 *   rcptGet    { id }                      → { b64, mime, name }   (เปิดดูรูป/PDF ของใบเสร็จ)
 *   rcptDel    { fileId }                  → { ok }                 (ทิ้งไฟล์ของใบเสร็จที่ยังเป็นร่าง)
 *
 * ไฟล์อยู่ที่ Forms/MRF/Receipts/<YYYY-MM> และ **ไม่เปิดแชร์แบบใครมีลิงก์ก็ดูได้**
 * (ต่างจากไฟล์แนบของฟอร์มทั่วไป) — ใบเสร็จมีชื่อ ที่อยู่ และยอดเงินของคน
 * จึงเปิดดูผ่าน rcptGet เท่านั้น ซึ่งอ่าน receipts/<id> ด้วย token ของผู้เรียก
 * ใครอ่านเอกสารนั้นได้ตาม firestore.rules (เจ้าของ · ผู้ดูแล · ฝ่ายปฏิบัติการ/บริหารที่ตรวจใบเบิก)
 * ก็เปิดไฟล์ได้ ใครอ่านไม่ได้ก็เปิดไม่ได้ — กติกามีที่เดียว ไม่ต้องเขียนซ้ำในสคริปต์
 */
var RCPT_MAX = 8 * 1024 * 1024;

function rcptFolder_(month) {
  var mrf = subFolder_('MRF');
  var it = mrf.getFoldersByName('Receipts');
  var top = it.hasNext() ? it.next() : mrf.createFolder('Receipts');
  var it2 = top.getFoldersByName(month);
  return it2.hasNext() ? it2.next() : top.createFolder(month);
}

function rcptUpload_(body, who) {
  if (who.anonymous) throw new Error('ต้องเข้าสู่ระบบก่อน');
  var month = String(body.month || '');
  if (!/^\d{4}-\d{2}$/.test(month)) throw new Error('เดือนไม่ถูกต้อง');
  var mime = String(body.mime || '');
  if (!/^(image\/(jpeg|png|webp|heic|heif)|application\/pdf)$/.test(mime)) throw new Error('รับเฉพาะรูปภาพหรือ PDF');
  var bytes = Utilities.base64Decode(String(body.b64 || ''));
  if (!bytes.length) throw new Error('ไม่มีข้อมูลไฟล์');
  if (bytes.length > RCPT_MAX) throw new Error('ไฟล์ใหญ่เกิน 8 MB');
  var stamp = Utilities.formatDate(new Date(), 'Asia/Bangkok', 'yyyyMMdd-HHmmss');
  var safe = String(body.name || 'receipt').replace(/[\\\/:*?"<>|]/g, '-').slice(0, 80);
  var f = rcptFolder_(month).createFile(Utilities.newBlob(bytes, mime, 'RCPT-' + stamp + '-' + who.uid.slice(0, 6) + '-' + safe));
  f.setDescription('uid:' + who.uid);           // เจ้าของไฟล์ — ใช้ตอนทิ้งไฟล์ที่ยังไม่ผูกกับใบเสร็จ
  return { fileId: f.getId(), name: safe, size: bytes.length, mime: mime };
}

function rcptGet_(body, who) {
  var id = String(body.id || '');
  if (!/^[A-Za-z0-9]{4,40}$/.test(id)) throw new Error('ไม่ระบุใบเสร็จ');
  var r = fsGet_('receipts/' + id, body.idToken);      // rules ตัดสินว่าผู้เรียกเห็นใบนี้ได้ไหม
  var fid = r.file && r.file.id;
  if (!fid) throw new Error('ใบเสร็จนี้ไม่มีไฟล์แนบ');
  var f = DriveApp.getFileById(fid);
  var blob = f.getBlob();
  return { b64: Utilities.base64Encode(blob.getBytes()), mime: blob.getContentType(), name: f.getName() };
}

function rcptDel_(body, who) {
  if (who.anonymous) throw new Error('ต้องเข้าสู่ระบบก่อน');
  var fid = String(body.fileId || '');
  if (!fid) throw new Error('ไม่ระบุไฟล์');
  var f = DriveApp.getFileById(fid);
  if (f.getDescription() !== 'uid:' + who.uid) throw new Error('ไม่ใช่ไฟล์ของคุณ');
  /* ไฟล์ที่ผูกกับใบเสร็จที่เข้าใบเบิกแล้ว ทิ้งไม่ได้ — เป็นหลักฐานของใบเบิกนั้น
     ค้นทุกใบเสร็จของผู้เรียกที่ใช้ไฟล์นี้ (ไม่เชื่อ id ที่หน้าเว็บส่งมาอย่างเดียว) */
  var url = 'https://firestore.googleapis.com/v1/projects/' + cfg_('FIREBASE_PROJECT') +
            '/databases/(default)/documents:runQuery';
  var res = UrlFetchApp.fetch(url, { method: 'post', contentType: 'application/json', muteHttpExceptions: true,
    headers: { Authorization: 'Bearer ' + body.idToken },
    payload: JSON.stringify({ structuredQuery: { from: [{ collectionId: 'receipts' }],
      where: { fieldFilter: { field: { fieldPath: 'uid' }, op: 'EQUAL', value: { stringValue: who.uid } } } } }) });
  if (res.getResponseCode() !== 200) throw new Error('ตรวจใบเสร็จไม่ได้ (' + res.getResponseCode() + ')');
  var used = JSON.parse(res.getContentText()).filter(function (r) { return r.document; })
    .map(function (r) { return fsFields_(r.document.fields || {}); })
    .filter(function (r) { return r.file && r.file.id === fid && r.status !== 'draft'; });
  if (used.length) throw new Error('ไฟล์นี้เป็นหลักฐานของใบเสร็จที่อยู่ในใบเบิกแล้ว ลบไม่ได้');
  f.setTrashed(true);
  return { ok: true };
}
