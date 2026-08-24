/**
 * D-0507 Forms — งานตั้งค่าที่สั่งเองจากหน้า Apps Script
 *
 * ไฟล์นี้ไม่ได้ต่อกับ doPost — ไม่มีใครเรียกจากเว็บได้
 * เป็นงานที่ทำครั้งเดียวตอนตั้งระบบ กดรันจากหน้า Apps Script เท่านั้น
 */

/**
 * สร้างแม่แบบเช็กลิสต์เป็น Google Sheet ไว้ใน <PARENT>/CHECKLIST/
 * วางแบบเดียวกับแม่แบบของฟอร์มอื่น — หัวเอกสารอยู่บน ตารางรายการอยู่ล่าง
 * เอาไว้ร่างเช็กลิสต์ใบใหม่ใน Sheet ก่อนนำเข้าระบบ
 *
 * รันซ้ำได้ — ถ้ามีอยู่แล้วจะไม่สร้างซ้ำ แต่คืน URL ของเดิม
 */
function makeChecklistTemplate() {
  var folder = subFolder_('CHECKLIST');
  var NAME = 'CHECKLIST_TEMPLATE';

  var it = folder.getFilesByName(NAME), ss;
  if (it.hasNext()) {
    ss = SpreadsheetApp.open(it.next());       // มีอยู่แล้ว — จัดรูปแบบใหม่ทับของเดิม
  } else {
    ss = SpreadsheetApp.create(NAME);
    var f = DriveApp.getFileById(ss.getId());
    folder.addFile(f);
    DriveApp.getRootFolder().removeFile(f);    // create วางไว้ที่ My Drive ต้องย้ายเข้าโฟลเดอร์
  }

  var sh = ss.getSheets()[0].setName('เช็กลิสต์');
  sh.setColumnWidth(1, 90).setColumnWidth(2, 420).setColumnWidth(3, 190)
    .setColumnWidth(4, 300);

  var NAVY = '#0D1B2A', GREY = '#F3F4F6';

  // ── หัวเอกสาร ─────────────────────────────────────────────
  sh.getRange('A1:D1').merge().setValue('D-0507 FLIGHT TRAINING CO., LTD.')
    .setBackground(NAVY).setFontColor('#FFFFFF').setFontFamily('Courier New')
    .setFontSize(10).setVerticalAlignment('middle');
  sh.setRowHeight(1, 28);
  sh.getRange('A2:D2').merge().setValue('แม่แบบเช็กลิสต์ · CHECKLIST TEMPLATE')
    .setBackground(NAVY).setFontColor('#FFFFFF').setFontSize(15).setFontWeight('bold')
    .setVerticalAlignment('middle');
  sh.setRowHeight(2, 34);
  sh.getRange('A3:D3').merge()
    .setValue('กรอกหัวเอกสารให้ครบก่อน แล้วจึงพิมพ์รายการที่ต้องทำลงตารางข้างล่าง · '
            + 'หนึ่งบรรทัดต่อหนึ่งรายการ · ขึ้นหมวดใหม่ให้เลือกระดับเป็น "หัวข้อ" '
            + 'แล้วพิมพ์ชื่อหมวดในช่องรายการ · ข้อย่อยให้เลือก "ย่อย" '
            + 'แล้ววางไว้ใต้ข้อหลักที่มันสังกัด')
    .setBackground(GREY).setFontSize(10).setWrap(true).setVerticalAlignment('middle');
  sh.setRowHeight(3, 34);

  // ── ข้อมูลเอกสาร ──────────────────────────────────────────
  var meta = [
    ['รหัสเอกสาร',    'D-0507-XXX-001', 'รหัสจากทะเบียนเอกสาร'],
    ['เลขกำกับ',      'OP-CHK-4XX-A',   'ตัวอักษรท้ายเลื่อนหนึ่งตัวทุกครั้งที่ ฉบับ หรือ แก้ไข เปลี่ยน'],
    ['ฉบับ',          '01',             'ISSUE NO.'],
    ['แก้ไข',         '00',             'REVISION NO.'],
    ['วันที่มีผล',      '23 AUG 2026',    'รูปแบบ DD MMM YYYY'],
    ['ชื่อ (ไทย)',      '',               'ขึ้นเป็นหัวเรื่องบนกระดาษ'],
    ['ชื่อ (อังกฤษ)',   '',               'บรรทัดรองใต้ชื่อไทย'],
    ['การจัดหน้า',     'three',          'one = คอลัมน์เดียว · two = สองคอลัมน์ · three = สามคอลัมน์'],
  ];
  /* ต้องบังคับเป็นข้อความก่อนเขียน ไม่งั้น Sheets แปลงให้เอง —
     ฉบับ '01' กลายเป็น 1 · แก้ไข '00' กลายเป็น 0 · '23 AUG 2026' กลายเป็นวันที่
     ซึ่งผิดรูปแบบเอกสารควบคุมทั้งสามอย่าง และคนที่คัดลอกไปใช้ต่อจะได้ค่าที่ผิด */
  sh.getRange(5, 2, meta.length, 1).setNumberFormat('@');
  /* ล้างกฎตรวจค่าเดิมก่อนเขียน — รันซ้ำหลังเพิ่มตัวเลือกใหม่ กฎเก่าที่ยังค้างอยู่
     จะปฏิเสธค่าที่กำลังจะเขียนลงไป ('three' ไม่ผ่านกฎที่มีแค่ one กับ two) */
  sh.getRange(5, 2, meta.length, 1).clearDataValidations();
  sh.getRange(15, 1, 205, 1).clearDataValidations();   // แถวรายการเริ่มที่ 15
  sh.getRange(5, 1, meta.length, 3).setValues(meta);
  sh.getRange(5, 1, meta.length, 1).setFontWeight('bold').setBackground(GREY);
  sh.getRange(5, 3, meta.length, 1).setFontSize(9).setFontColor('#6B7280');
  sh.getRange(5, 1, meta.length, 3)
    .setBorder(true, true, true, true, true, true, '#D1D5DB', SpreadsheetApp.BorderStyle.SOLID);
  sh.getRange('B12').setDataValidation(SpreadsheetApp.newDataValidation()
    .requireValueInList(['one', 'two', 'three'], true).setAllowInvalid(false).build());

  // ── ตารางรายการ ───────────────────────────────────────────
  var HDR = 14;
  sh.getRange(HDR, 1, 1, 4)
    .setValues([['ระดับ', 'รายการที่ต้องทำ', 'ACTION', 'หมายเหตุ (ไม่ขึ้นบนกระดาษ)']])
    .setFontWeight('bold').setBackground(NAVY).setFontColor('#FFFFFF');
  sh.setFrozenRows(HDR);

  var rows = [
    ['หัวข้อ', 'BEFORE START',      '',               'ตัวอย่าง — ลบออกได้'],
    ['หลัก',  'Pre-flight inspection', 'COMPLETED',   ''],
    ['หลัก',  'Door',               'CLOSE & LOCK',   ''],
    ['หัวข้อ', 'DOCUMENT ONBOARD',  '',               ''],
    ['หลัก',  'Document Onboard',   'ON BOARD',       ''],
    ['ย่อย',  'C of R & C of A',    'Present and Valid', ''],
    ['ย่อย',  'Radio licence',      'Present and Valid', ''],
  ];
  sh.getRange(HDR + 1, 1, rows.length, 4).setValues(rows);
  sh.getRange(HDR + 1, 1, 200, 1).setDataValidation(SpreadsheetApp.newDataValidation()
    .requireValueInList(['หัวข้อ', 'หลัก', 'ย่อย'], true).setAllowInvalid(false).build());
  sh.getRange(HDR, 1, 205, 4)
    .setBorder(true, true, true, true, true, true, '#D1D5DB', SpreadsheetApp.BorderStyle.SOLID);
  sh.getRange(HDR + 1, 2, 205, 2).setWrap(true);
  sh.getRange(HDR + 1, 3, 205, 1).setFontFamily('Courier New').setFontWeight('bold');
  sh.getRange(HDR + 1, 4, 205, 1).setFontSize(9).setFontColor('#6B7280');

  Logger.log('สร้างแล้ว: ' + ss.getUrl());
  return ss.getUrl();
}

/** ลบแถวทดสอบออกจากทะเบียนรายงานเช็กลิสต์ (ใช้ครั้งเดียวหลังทดสอบระบบ) */
function dropChecklistTestRows() {
  var folder = subFolder_('CHECKLIST');
  var it = folder.getFilesByName('CHECKLIST — Records');
  if (!it.hasNext()) { Logger.log('ยังไม่มีทะเบียน'); return 0; }
  var sh = SpreadsheetApp.open(it.next()).getSheets()[0];
  var v = sh.getDataRange().getValues(), n = 0;
  for (var i = v.length - 1; i >= 1; i--) {
    if (/^ทดสอบ.*\(ลบทิ้งได้\)$/.test(String(v[i][5]))) { sh.deleteRow(i + 1); n++; }
  }
  Logger.log('ลบไป ' + n + ' แถว');
  return n;
}


/**
 * ตั้งเอกสารรายงานการใช้อากาศยาน (AUR) ให้เป็นเอกสารควบคุม
 *
 * เอกสารนี้เดิมไม่มีเลขกำกับและวันมีผลพิมพ์อยู่เลย จึงยังเป็นเอกสารควบคุมไม่ได้
 * และชื่อ "AIRCRAFT LOG REPORT FORM" ไปชนกับชื่ออังกฤษที่ทะเบียนใช้เรียก
 * สมุดปกบิน (ALR) อยู่ ทำให้สองใบเรียกชื่อเดียวกัน
 *
 * รันครั้งเดียวจากหน้า Apps Script
 */
function setupAurReport() {
  var ID = '1wmJ-LFTZVyxhK44kufOuuz9_cZ--2mFgn6fcxJ_Yz_w';
  var CODE = 'ME-AUR-301-A', EFF = '24 AUG 2026';
  var TITLE = 'AIRCRAFT UTILISATION REPORT';
  var SUB = 'Utilisation and fuel report for a specified period '
          + '— for external reporting and cost reference';

  var doc = DocumentApp.openById(ID);
  var body = doc.getBody();

  var n = 0;
  n += body.replaceText('AIRCRAFT LOG REPORT FORM', TITLE) ? 1 : 0;

  /* หัวกระดาษอยู่ในส่วน header ไม่ใช่ body — replaceText ที่ body ไม่โดน
     ปล่อยไว้แผ่นเดียวจะอ้างสองรหัส (หัว ME-ALR-301-A · ท้าย ME-AUR-301-A) */
  var hdr = doc.getHeader();
  if (hdr) {
    n += hdr.replaceText('ME-ALR-301-[A-Z]', CODE) ? 1 : 0;
    n += hdr.replaceText('EFF: \\d{1,2} [A-Z]{3} \\d{4}', 'EFF: ' + EFF) ? 1 : 0;
  }
  // คำโปรยเดิมบอกว่าเป็นบันทึกรายวัน ซึ่งขัดกับการใช้งานจริง
  n += body.replaceText(
    'Daily record of aircraft utilisation, defects, and fuel/oil consumption', SUB) ? 1 : 0;

  /* เลขกำกับกับวันมีผลต้องอยู่บนกระดาษ ไม่ใช่อยู่แต่ในทะเบียน
     ไม่งั้นแผ่นที่พิมพ์ออกไปแล้วไม่มีอะไรบอกว่าเป็นฉบับไหน */
  var ftr = doc.getFooter() || doc.addFooter();
  ftr.clear();
  ftr.appendParagraph('D-0507 Flight Training Co., Ltd.  |  ' + TITLE + '  |  '
      + CODE + '  EFF: ' + EFF + '  |  Controlled Copy — Uncontrolled when printed')
     .setAttributes({ FONT_SIZE: 7.5, FOREGROUND_COLOR: '#3A4652',
                      HORIZONTAL_ALIGNMENT: DocumentApp.HorizontalAlignment.CENTER });
  doc.saveAndClose();

  // ชื่อไฟล์ใน Drive ยังเป็นของเอกสารเดิม คนเปิดจากโฟลเดอร์จะหยิบผิดใบ
  DriveApp.getFileById(ID).setName('D-0507-AUR-001');

  var out = 'AUR: แก้ข้อความ ' + n + ' จุด · หัวและท้ายกระดาษเป็น ' + CODE
          + ' EFF ' + EFF + ' · เปลี่ยนชื่อไฟล์เป็น D-0507-AUR-001';
  Logger.log(out);
  return out;
}

