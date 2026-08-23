/**
 * D-0507 Forms — เก็บสำเนารายงานเช็กลิสต์ลง Drive
 *
 * โครงที่สร้างให้อัตโนมัติ
 *   <PARENT_FOLDER>/
 *     CHECKLIST/
 *       CHECKLIST — Records            (Sheet)  ← 1 แถวต่อ 1 รายงาน
 *       <DOC>/                                  ← แยกตามรหัสเอกสารเช็กลิสต์
 *         <DOC>_<วันที่>_<เวลา>_<ผู้ทำ>.pdf
 *
 * เก็บเฉพาะ "รายงาน" — แผ่นที่มีชื่อผู้ทำและวันที่กำกับ
 * กระดาษเปล่าและแบบฟอร์มไม่เก็บ เพราะไม่ได้บันทึกว่าใครทำอะไร
 * เก็บไว้ก็เป็นแฟ้มที่เต็มไปด้วยแผ่นว่างจนหาของจริงไม่เจอ
 */

// ── จุดรับงาน — เรียกจาก doPost ใน Code.gs ──────────────────
function checklistReport_(body, who) {
  if (!who || !who.email) throw new Error('ต้องเข้าสู่ระบบก่อน');

  var meta = body.meta || {};
  if (!meta.by || !meta.date) throw new Error('รายงานต้องมีชื่อผู้ทำและวันที่');
  if (!body.html) throw new Error('ไม่มีหน้ากระดาษมาด้วย');
  var doc = String(body.doc || '').trim();
  if (!doc) throw new Error('ไม่มีรหัสเอกสาร');

  var root = subFolder_('CHECKLIST');
  var folder = childFolder_(root, doc);

  var name = [doc, meta.date, String(meta.time || '').replace(':', ''), meta.by]
    .filter(String).join('_').replace(/[\\/:*?"<>|]/g, '-') + '.pdf';

  var pdf = Utilities.newBlob(body.html, 'text/html', name).getAs('application/pdf').setName(name);
  var file = folder.createFile(pdf);

  /* ทะเบียนรายงาน — ให้ค้นได้ว่าเช็กลิสต์ใบไหนถูกทำเมื่อไร โดยไม่ต้องเปิด PDF ทีละใบ
     แถวชี้ไปที่ไฟล์ ไม่ได้เก็บเนื้อหาซ้ำ ตัวจริงคือ PDF ที่มีเลขกำกับเอกสารอยู่บนหน้า */
  var rs = recordSheet_(root, 'CHECKLIST — Records', [
    'บันทึกเมื่อ', 'รหัสเอกสาร', 'เลขกำกับ', 'ฉบับ/แก้ไข', 'ชื่อเช็กลิสต์',
    'ผู้ทำเช็กลิสต์', 'ทะเบียนอากาศยาน', 'วันที่', 'เวลา', 'ทำแล้ว/ทั้งหมด',
    'หมายเหตุ', 'ไฟล์ PDF', 'บันทึกโดย (บัญชี)']);
  var title = (body.title && (body.title.th || body.title.en)) || doc;
  rs.sh.appendRow([
    new Date(), doc, body.code || '',
    (body.issue || '') + ' / ' + (body.rev || ''), title,
    meta.by, meta.ac || '', meta.date, meta.time || '',
    (body.done == null ? '' : body.done + ' / ' + body.total),
    meta.note || '', file.getUrl(), who.email]);

  return { url: file.getUrl(), sheetUrl: rs.ss.getUrl(), name: name };
}

/** โฟลเดอร์ลูกชื่อ name ใต้ parent — มีอยู่แล้วก็ใช้ของเดิม */
function childFolder_(parent, name) {
  var it = parent.getFoldersByName(name);
  return it.hasNext() ? it.next() : parent.createFolder(name);
}
