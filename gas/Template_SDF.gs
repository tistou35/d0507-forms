/**
 * แม่แบบ PDF ของ SDF — เรียก buildSdfTemplate() ครั้งเดียวจาก editor
 * ได้ไฟล์ SDF_TEMPLATE ใน subfolder SDF
 *
 * เลย์เอาต์ตาม D-0507-SDF-001 · AD-SDF-301-A · ISSUE 01 / REV 01 (EFF 22 JUN 2026)
 * ชื่อ token ตรงกับ key ใน formdefs/SDF.json ทุกตัว
 *
 * ⚠ ส่วน "APPROVAL" ท้ายเอกสารไม่มีในต้นฉบับกระดาษ — เพิ่มเพราะกระบวนการออนไลน์
 *   กำหนดให้มีผู้อนุมัติ ถ้าจะให้ตรงต้นฉบับเป๊ะ ต้องออก revision ใหม่ของเอกสารควบคุม
 */

var SDF = {
  code: 'SDF',
  doc: 'D-0507-SDF-001',
  control: 'AD-SDF-301-A',
  issue: '01',
  rev: '01',
  eff: '22 JUN 2026',
  titleEn: 'SELF DECLARATION FORM',
  titleTh: 'แบบแจ้งข้อมูลด้วยตนเอง',
  sub: 'Administration (AD) — D-0507 ATO',

  applies: [
    ['away2w',   'Flight Instructor who left the company for more than 2 weeks'],
    ['dualDuty', 'Flight Instructor or Student with dual duty as air personnel'],
    ['otherFly', 'Flight Instructor or Student with other flying (recreational or aviation-related)'],
  ],
  youAre: [['instructor', 'Instructor'], ['student', 'Current Student'], ['alumni', 'Alumni / Recurrent']],

  ftl: [
    ['h7',      'Past 7 consecutive days',   '28 hr max'],
    ['h28',     'Past 28 consecutive days',  '100 hr max'],
    ['h365',    'Past 365 consecutive days', '1,000 hr max'],
    ['planned', 'Planned flight hours with D-0507 today', ''],
  ],

  ftlConfirm: "FTL Compliance Confirmation: I confirm the totals above include hours from ALL " +
    "operators. After today's planned duty with D-0507, my flight hours will not exceed the FTL " +
    "limits: 7 days ≤ 28 hr / 28 days ≤ 100 hr / 365 days ≤ 1,000 hr. I understand that " +
    "inaccurate declaration is a regulatory offence under Thai civil aviation law.",

  declaration: 'I hereby declare that my duty has occurred on the date stated above and that my ' +
    'latest flight time and cumulative rolling period hours are as recorded. I confirm compliance ' +
    'with the requirements regarding Flight Time and Flight Duty Period under TCAR ORO.FTL. My ' +
    'cumulative flight hours from all operators do not exceed the FTL limits for any rolling 7-day, ' +
    '28-day, or 365-day period. I am responsible for ensuring adequate rest before training or ' +
    'working with D-0507. I certify that the above details are correct and true in all respects. ' +
    'By signing this document, I acknowledge that I hold personal legal responsibility for the ' +
    'accuracy of this declaration.',
};

// ── จุดเรียกใช้ ─────────────────────────────────────────────
function buildSdfTemplate() {
  var folder = subFolder_(SDF.code);
  var name = SDF.code + '_TEMPLATE';
  var old = folder.getFilesByName(name);
  while (old.hasNext()) old.next().setTrashed(true);

  var doc = DocumentApp.create(name);
  var b = doc.getBody();
  b.setMarginTop(36).setMarginBottom(36).setMarginLeft(40).setMarginRight(40);
  b.clear();

  sdfHead_(b);
  sdfApplies_(b);
  sdfBand_(b, 'A   PERSONAL DETAILS');
  sdfPersonal_(b);
  sdfBand_(b, 'B   RECENT FLIGHT DATA');
  sdfFlight_(b);
  sdfBand_(b, 'C   FTL CUMULATIVE HOURS — ALL OPERATORS');
  sdfFtl_(b);
  sdfBand_(b, 'D   DECLARATION');
  sdfDeclare_(b);
  sdfApproval_(b);
  sdfFoot_(doc);

  doc.saveAndClose();
  var file = DriveApp.getFileById(doc.getId());
  folder.addFile(file);
  DriveApp.getRootFolder().removeFile(file);

  Logger.log('สร้างแม่แบบ SDF แล้ว: ' + doc.getUrl());
  return doc.getUrl();
}

// ── ชิ้นส่วน ────────────────────────────────────────────────
function sdfHead_(b) {
  var p = b.appendParagraph('D-0507 FLIGHT TRAINING CO., LTD.');
  p.setAttributes(attr_({ SZ: 9, C: SKY, BOLD: true, SPACE_AFTER: 2 }));

  p = b.appendParagraph(SDF.titleTh);
  p.setAttributes(attr_({ SZ: 16, C: NAVY, BOLD: true, SPACE_AFTER: 1 }));

  p = b.appendParagraph(SDF.titleEn + '  ·  ' + SDF.sub);
  p.setAttributes(attr_({ SZ: 10, C: GREY, BOLD: true, SPACE_AFTER: 8 }));

  p = b.appendParagraph(SDF.doc + '  ·  ' + SDF.control +
    '  ·  ISSUE ' + SDF.issue + ' / REV ' + SDF.rev + '  ·  EFF ' + SDF.eff);
  p.setAttributes(attr_({ SZ: 8.5, C: GREY, SPACE_AFTER: 10 }));
}

function sdfBand_(b, txt) {
  var p = b.appendParagraph(txt);
  p.setAttributes(attr_({ SZ: 10, C: '#FFFFFF', BOLD: true, SPACE_BEFORE: 8, SPACE_AFTER: 0 }));
  p.setBackgroundColor(NAVY);
}

function sdfApplies_(b) {
  var rows = [['THIS FORM APPLIES FOR:']];
  SDF.applies.forEach(function (a) { rows.push(['{{k_applyFor_' + a[0] + '}}  ' + a[1]]); });
  var t = b.appendTable(rows);
  styleTable_(t);
  cell_(t.getCell(0, 0), { SZ: 9, C: SKY, BOLD: true });
  for (var i = 1; i < rows.length; i++) cell_(t.getCell(i, 0), { SZ: 9.5, C: NAVY });
  gap_(b, 6);
}

function sdfPersonal_(b) {
  var you = SDF.youAre.map(function (y) {
    return '{{k_youAre_' + y[0] + '}}  ' + y[1];
  }).join('     ');
  var t = b.appendTable([
    ['YOU ARE', you],
    ['NAME', '{{name}}'],
    ['LICENCE NO.', '{{licence}}'],
    ['EMAIL', '{{email}}'],
  ]);
  styleTable_(t);
  for (var r = 0; r < 4; r++) { label_(t.getCell(r, 0)); value_(t.getCell(r, 1)); }
  t.setColumnWidth(0, 108).setColumnWidth(1, 408);
  gap_(b, 6);
}

function sdfFlight_(b) {
  var t = b.appendTable([
    ['DATE OF LATEST FLIGHT', 'LATEST 24 HR FLIGHT HOURS', 'LAST FLIGHT TIME (DEP → ARR)'],
    ['{{lastFlightDate}}', '{{last24}} hr(s)', '{{depTime}}  →  {{arrTime}}'],
  ]);
  styleTable_(t);
  for (var c = 0; c < 3; c++) {
    label_(t.getCell(0, c));
    cell_(t.getCell(1, c), { SZ: 10.5, C: NAVY, BOLD: true,
      ALIGN: DocumentApp.HorizontalAlignment.CENTER });
  }
  gap_(b, 6);
}

function sdfFtl_(b) {
  var p = b.appendParagraph(
    'Declare total flight hours from ALL operators combined (D-0507, airlines, other ATOs, and ' +
    'private operations). Do not include simulated flight or ground training time.');
  p.setAttributes(attr_({ SZ: 8.5, C: GREY, SPACE_BEFORE: 4, SPACE_AFTER: 4 }));

  var rows = [['ROLLING PERIOD', 'HOURS (ALL OPERATORS)', 'FTL LIMIT']];
  SDF.ftl.forEach(function (f) { rows.push([f[1], '{{' + f[0] + '}} hr(s)', f[2]]); });
  // แถวสรุปที่ระบบคำนวณให้ — จุดที่ผู้อนุมัติดูจริง ไม่ต้องบวกเอง
  rows.push(['TOTAL INCLUDING TODAY — 7 days',   '{{t7}} hr(s)',   'of 28']);
  rows.push(['TOTAL INCLUDING TODAY — 28 days',  '{{t28}} hr(s)',  'of 100']);
  rows.push(['TOTAL INCLUDING TODAY — 365 days', '{{t365}} hr(s)', 'of 1,000']);

  var t = b.appendTable(rows);
  styleTable_(t);
  for (var i = 0; i < rows.length; i++) {
    var head = i === 0, tot = i >= 5;
    cell_(t.getCell(i, 0), { SZ: head ? 8.5 : 9.5, C: head ? SKY : NAVY, BOLD: head || tot });
    cell_(t.getCell(i, 1), { SZ: head ? 8.5 : 10, C: head ? SKY : NAVY, BOLD: !head,
      ALIGN: DocumentApp.HorizontalAlignment.CENTER });
    cell_(t.getCell(i, 2), { SZ: head ? 8.5 : 9, C: head ? SKY : GREY, BOLD: head,
      ALIGN: DocumentApp.HorizontalAlignment.CENTER });
  }
  t.setColumnWidth(0, 268).setColumnWidth(1, 138).setColumnWidth(2, 110);

  p = b.appendParagraph('* Required fields. Include hours from every employer. ' +
    'Data will be cross-checked against LOG ME logbook records.');
  p.setAttributes(attr_({ SZ: 8, C: GREY, SPACE_BEFORE: 3, SPACE_AFTER: 6 }));

  var c = b.appendTable([['{{k_ftlConfirm}}  ' + SDF.ftlConfirm]]);
  styleTable_(c);
  cell_(c.getCell(0, 0), { SZ: 8.5, C: NAVY, BOLD: true });
  gap_(b, 4);
}

function sdfDeclare_(b) {
  var t = b.appendTable([[SDF.declaration]]);
  styleTable_(t);
  cell_(t.getCell(0, 0), { SZ: 9, C: NAVY });
  gap_(b, 4);

  var s = b.appendTable([
    ['SIGNATURE', 'DATE SIGNED'],
    ['{{sig_decSign}}', '{{decDate}}'],
    ['{{name}}', 'RECORD NO.  {{tracking}}'],
  ]);
  styleTable_(s);
  for (var r = 0; r < 3; r++) for (var c = 0; c < 2; c++) {
    cell_(s.getCell(r, c), r === 0 ? { SZ: 8.5, C: SKY, BOLD: true }
      : r === 1 ? { SZ: 10, C: NAVY } : { SZ: 9, C: NAVY, BOLD: r === 2 && c === 0 });
    if (r === 1) s.getCell(r, c).setPaddingTop(14).setPaddingBottom(14);
  }
  s.setColumnWidth(0, 310).setColumnWidth(1, 206);
  gap_(b, 6);
}

function sdfApproval_(b) {
  sdfBand_(b, 'E   APPROVAL');
  var t = b.appendTable([
    ['APPROVED BY', '{{apName}}', 'DATE', '{{apDate}}'],
    ['COMMENT', '{{apComment}}', '', ''],
    ['SIGNATURE', '{{sig_apSign}}', '', ''],
  ]);
  styleTable_(t);
  for (var r = 0; r < 3; r++) {
    label_(t.getCell(r, 0)); label_(t.getCell(r, 2));
    value_(t.getCell(r, 1)); value_(t.getCell(r, 3));
  }
  t.getCell(2, 1).setPaddingTop(14).setPaddingBottom(14);
  t.setColumnWidth(0, 100).setColumnWidth(1, 250).setColumnWidth(2, 60).setColumnWidth(3, 106);

  // ผู้อนุมัติที่ได้รับมอบหมายต่อ — ว่างไว้ถ้าไม่มีการ delegate
  var p = b.appendParagraph('Delegated from: {{delegatedFrom}}');
  p.setAttributes(attr_({ SZ: 8, C: GREY, SPACE_BEFORE: 4 }));
}

function sdfFoot_(doc) {
  var f = doc.addFooter();
  var p = f.appendParagraph(
    'D-0507 Flight Training Co., Ltd.  ·  ' + SDF.doc + '  ·  ' + SDF.control +
    '  ·  Issue ' + SDF.issue + '/Rev ' + SDF.rev +
    '  ·  Controlled copy  ·  {{submittedAt}}');
  p.setAttributes(attr_({ SZ: 7.5, C: GREY }));
}
