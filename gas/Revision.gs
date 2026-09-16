/**
 * Revision.gs — ฉบับร่างของต้นฉบับเอกสารควบคุม ระหว่างรออนุมัติการแก้ไข
 *
 *   revDraft    คัดลอกต้นฉบับที่ใช้อยู่เป็นฉบับร่าง ให้คนขอแก้ไขเข้าไปแก้
 *   revPromote  อนุมัติแล้ว — ติดป้าย APPROVED เปิดให้อ่าน (ต้นฉบับทำใหม่ตอนปิดงาน)
 *   revReject   ไม่อนุมัติ — ติดป้ายที่ฉบับร่าง เก็บไว้เป็นหลักฐาน ไม่ลบ
 *
 * ── ทำไมไม่แก้ต้นฉบับตรง ๆ แล้วรออนุมัติ ────────────────────
 * ต้นฉบับบน Google Docs คือตัวเดียวกับที่ปุ่ม "เปิด" แสดงให้ทุกคนอ่าน และเป็น
 * ต้นทางของฟอร์มเปล่า PDF ถ้าแก้ตรงนั้นก่อนอนุมัติ ช่วงที่รอ ทุกคนจะเห็นและ
 * พิมพ์ฉบับที่ยังไม่ได้รับอนุมัติไปใช้ และถ้าไม่อนุมัติ ไม่มีฉบับเดิมให้ถอยกลับ
 * แก้ในสำเนาแทน ฉบับที่ใช้อยู่จึงไม่ขยับจนกว่าจะอนุมัติ
 *
 * ── ทำไมอยู่ฝั่งนี้ ─────────────────────────────────────────
 * ต้นฉบับส่วนใหญ่สร้างจากเครื่องมือในรีโป ซึ่งถือสิทธิ์ drive.file (แตะได้แค่ไฟล์
 * ที่ตัวเองสร้าง) สคริปต์นี้รันเป็นเจ้าของไดรฟ์ จึงคัดลอกและย้ายได้ทุกไฟล์
 *
 * ไม่ได้ใช้ DocumentApp แก้ข้อความ (เลขกำกับ/Issue/Rev) ในฉบับร่าง เพราะจะเพิ่ม
 * สิทธิ์ documents ให้โปรเจกต์ web app ที่ deploy อยู่ต้องขออนุญาตใหม่ทั้งตัว
 * การเลื่อนเลขกำกับทำตอนปิดงานในรีโป (tools/revision_close.py) ซึ่งเป็นที่ที่
 * .docx ฉบับจริงอยู่อยู่แล้ว
 */

var REV_DRAFTS = 'D-0507 Revision drafts';

/* โฟลเดอร์ฉบับร่าง อยู่ที่รากของไดรฟ์ ข้าง ๆ D-0507 Checklist sources
   ห้ามอยู่ใต้ PARENT_FOLDER_ID — โฟลเดอร์นั้น (_Quality Assurance (QA)/D0507/Forms)
   แชร์ไว้แบบ anyone = writer ไฟล์ข้างในสืบทอดสิทธิ์นั้นทั้งหมด และตั้งให้ต่ำกว่าที่
   สืบทอดมาไม่ได้ ฉบับร่างและฉบับที่ถูกแทนจะกลายเป็นของที่ใครได้ลิงก์ก็แก้ได้
   (เกิดจริงครั้งแรกที่ทดสอบ — setSharing ล้ม จึงรู้) โฟลเดอร์ที่เคยสร้างไว้ใต้นั้นย้ายออกให้ */
function revFolder_(name) {
  var root = DriveApp.getRootFolder();
  var it = DriveApp.getFoldersByName(name);
  while (it.hasNext()) {
    var f = it.next();
    var ps = f.getParents(), atRoot = false;
    while (ps.hasNext()) if (ps.next().getId() === root.getId()) atRoot = true;
    if (!atRoot) f.moveTo(root);
    return f;
  }
  return root.createFolder(name);
}

/** ต้องเป็น Google Doc เท่านั้น — กันไม่ให้ปุ่มนี้กลายเป็นเครื่องคัดลอกไฟล์อะไรก็ได้ในไดรฟ์ */
function revDoc_(id) {
  if (!/^[A-Za-z0-9_-]{20,}$/.test(String(id || ''))) throw new Error('รหัสไฟล์ไม่ถูกต้อง');
  var f = DriveApp.getFileById(id);
  if (f.getMimeType() !== MimeType.GOOGLE_DOCS) throw new Error('ไม่ใช่ Google Doc: ' + f.getName());
  return f;
}

function revName_(s) { return String(s || '').replace(/[\r\n]+/g, ' ').slice(0, 180); }

function revDraft_(body) {
  var live = revDoc_(body.liveId);
  var copy = live.makeCopy(revName_(body.name) || ('DRAFT — ' + live.getName()),
                           revFolder_(REV_DRAFTS));
  return { draftId: copy.getId(), url: 'https://docs.google.com/document/d/' + copy.getId() + '/edit' };
}

/**
 * อนุมัติแล้ว — ติดป้ายฉบับร่างและเปิดให้อ่านได้ ยังไม่แตะต้นฉบับที่ใช้อยู่
 *
 * เดิมตรงนี้ย้ายฉบับร่างขึ้นแทนต้นฉบับทันที ทดสอบแล้วได้ฟอร์มเปล่าที่พิมพ์เลขกำกับ
 * QA-DRF-301-A ขณะที่ .docx และทะเบียนเป็น -B — ฉบับร่างคัดลอกมาจากฉบับเดิม
 * เลขกำกับกับวันมีผลในตัวมันจึงเป็นของเก่า ส่วนการเลื่อนเลขเกิดใน .docx ตอนปิดงาน
 * ต้นฉบับบน Docs ที่เผยแพร่จึงต้องสร้างจาก .docx ที่เลื่อนเลขแล้ว (tools/revision_close.py)
 * ไม่ใช่จากฉบับร่างตรง ๆ
 *
 * ต้นฉบับเดิมจึงคงใช้อยู่จนปิดงาน ซึ่งถูกต้องตามหลักด้วย — ฉบับเดิมยังมีผล
 * จนกว่าฉบับใหม่จะออกพร้อมเลขกำกับและวันมีผลของตัวเอง
 *
 * เปิด "ใครมีลิงก์ก็อ่านได้" เพื่อให้เครื่องมือปิดงานดาวน์โหลดได้ (สิทธิ์ drive.file
 * ของรีโปมองไม่เห็นไฟล์ที่สคริปต์นี้สร้าง) — อ่านได้อย่างเดียว เนื้อหาอนุมัติแล้ว
 */
function revPromote_(body) {
  var draft = revDoc_(body.draftId);
  if (draft.getName().indexOf('APPROVED — ') !== 0)
    draft.setName('APPROVED — ' + draft.getName().replace(/^DRAFT — /, ''));
  var shared = true;
  try { draft.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW); }
  catch (e) { shared = false; }
  return { draftId: draft.getId(), shared: shared };
}

function revReject_(body) {
  var draft = revDoc_(body.draftId);
  if (draft.getName().indexOf('REJECTED — ') !== 0) draft.setName('REJECTED — ' + draft.getName());
  return { ok: true };
}
