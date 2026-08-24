/**
 * D-0507 Forms — ทำฟอร์มเปล่าจากแม่แบบ PDF ของแต่ละใบ
 *
 * เดิมฟอร์มเปล่ามาจาก .docx ต้นฉบับกระดาษ ซึ่งเป็นคนละฉบับกับที่ระบบใช้จริง
 * พอแม่แบบถูกแก้ให้ใช้งานได้จริงแล้ว ฟอร์มเปล่าควรมาจากแม่แบบตัวเดียวกัน
 * คนที่พิมพ์ไปเขียนด้วยมือจะได้กระดาษหน้าตาเดียวกับใบที่ระบบออกให้
 *
 * ── สองอย่างที่ต้องเอาออกก่อนพิมพ์ ──────────────────────────
 * 1. บล็อก "APPROVAL / การอนุมัติ" ท้ายเอกสาร
 *    เป็นกล่องรวมโทเคนที่ appendApproval_() เติมไว้กันช่องตกหล่นตอนออก PDF
 *    ไม่ใช่ส่วนของฟอร์มกระดาษ — บนใบเปล่ามันซ้ำกับช่องที่มีอยู่แล้วข้างบน
 *    และชวนให้คนกรอกเซ็นสองที่
 * 2. โทเคน {{...}} ทุกตัว
 *    {{k_...}} = ช่องติ๊ก → ☐   ·   ที่เหลือ → เว้นว่างไว้ให้เขียน
 */

/** ทำฟอร์มเปล่าจากแม่แบบ คืน PDF เป็น base64 */
function blankForm_(abbr) {
  abbr = String(abbr || '').replace(/[^A-Za-z0-9\-]/g, '');
  if (!abbr) throw new Error('ไม่ได้ระบุตัวย่อฟอร์ม');

  var folder = subFolder_(abbr);
  var it = folder.getFilesByName(abbr + '_TEMPLATE');
  if (!it.hasNext()) throw new Error(abbr + ': ยังไม่มีแม่แบบ ' + abbr + '_TEMPLATE ใน Drive');

  // ทำสำเนาก่อนเสมอ — แม่แบบตัวจริงต้องไม่ถูกแตะ
  var copy = it.next().makeCopy(abbr + '_BLANK_tmp', folder);
  try {
    var doc = DocumentApp.openById(copy.getId());
    var body = doc.getBody();

    var cut = dropApproval_(body);
    var box = blankTokens_(body);
    /* ส่งข้อความที่เหลือกลับไปด้วย ให้ฝั่งที่สั่งตรวจได้เองว่าไม่มีโทเคนค้าง
       และไม่มีบล็อกอนุมัติหลงเหลือ — ตรวจจากผลจริง ไม่ใช่เชื่อว่าโค้ดทำถูก */
    var left = body.getText();
    doc.saveAndClose();

    var pdf = DriveApp.getFileById(copy.getId()).getAs('application/pdf');
    return { abbr: abbr, cutApproval: cut, boxes: box,
             tokensLeft: (left.match(/\{\{/g) || []).length,
             approvalLeft: /APPROVAL \/ การอนุมัติ|ADDITIONAL \/ เพิ่มเติม/.test(left) ? 1 : 0,
             pdf: Utilities.base64Encode(pdf.getBytes()) };
  } finally {
    DriveApp.getFileById(copy.getId()).setTrashed(true);   // สำเนาชั่วคราว ไม่เก็บไว้
  }
}

/**
 * ลบหัวข้อ APPROVAL / การอนุมัติ (หรือ ADDITIONAL / เพิ่มเติม) พร้อมตารางที่ตามมา
 * คืนจำนวนย่อหน้า+ตารางที่ตัดออก · 0 = ไม่มีบล็อกนี้ในแม่แบบ
 */
function dropApproval_(body) {
  var HEAD = ['APPROVAL / การอนุมัติ', 'ADDITIONAL / เพิ่มเติม'];
  var n = body.getNumChildren(), at = -1;
  for (var i = 0; i < n; i++) {
    var el = body.getChild(i);
    if (el.getType() !== DocumentApp.ElementType.PARAGRAPH) continue;
    var t = el.asParagraph().getText().trim();
    if (HEAD.indexOf(t) >= 0) { at = i; break; }
  }
  if (at < 0) return 0;

  /* บล็อกนี้มักอยู่ท้ายเอกสาร ถ้าลบจนหมด Docs จะฟ้องว่าลบย่อหน้าสุดท้ายไม่ได้
     เติมย่อหน้าว่างปิดท้ายไว้ก่อน แล้วค่อยลบ — จะได้เหลือชิ้นสุดท้ายให้เสมอ */
  body.appendParagraph('');

  /* ตัดจากหัวข้อลงไปจนจบตารางที่ตามมาหนึ่งตาราง — ไม่ตัดรวดไปถึงท้ายเอกสาร
     เพราะบางใบมีหมายเหตุต่อท้ายที่ยังต้องอยู่บนกระดาษ */
  var cut = 0, seenTable = false;
  while (at < body.getNumChildren() - 1) {          // เว้นชิ้นสุดท้ายไว้เสมอ
    var c = body.getChild(at), ct = c.getType();
    if (ct === DocumentApp.ElementType.TABLE) {
      if (seenTable) break;                 // ตารางที่สอง = ของส่วนอื่น
      seenTable = true;
    } else if (ct === DocumentApp.ElementType.PARAGRAPH) {
      if (seenTable && c.asParagraph().getText().trim()) break;   // ข้อความจริงหลังตาราง
    } else {
      break;
    }
    body.removeChild(c);
    cut++;
  }
  // เอกสารต้องเหลืออย่างน้อยหนึ่งย่อหน้า ไม่งั้น Docs ฟ้อง
  if (body.getNumChildren() === 0) body.appendParagraph('');
  return cut;
}


/** {{k_...}} → ☐  ·  โทเคนอื่น → ว่าง */
function blankTokens_(body) {
  var boxes = 0;
  var txt = body.getText();
  var m = txt.match(/\{\{k_[^}]+\}\}/g);
  boxes = m ? m.length : 0;
  body.replaceText('\\{\\{k_[^}]+\\}\\}', '☐');
  body.replaceText('\\{\\{[^}]+\\}\\}', '');
  return boxes;
}
