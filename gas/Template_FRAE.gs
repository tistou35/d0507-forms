/**
 * สร้างแม่แบบ PDF ของ FRAE เป็น Google Doc โดยตรง
 * เรียก buildFraeTemplate() จาก editor ครั้งเดียว — ได้ไฟล์ FRAE_TEMPLATE ใน subfolder FRAE
 *
 * ทำแบบนี้แทนการอัปโหลด .docx แล้วแปลงมือ เพราะ
 *   · ช่องติ๊กผูกกับ key ใน formdefs/FRAE.json ตั้งแต่ตอนสร้าง ไม่มีทางใส่ผิดช่อง
 *   · สร้างใหม่ได้ทุกเมื่อเมื่อฟอร์มออก revision ใหม่ ไม่ต้องไล่แก้มือทีละช่อง
 *
 * เลย์เอาต์ตาม D-0507-FRAE-001 Issue 01/Rev 00 (07 JUL 2022)
 * คะแนนในวงเล็บคือน้ำหนักจริงจากเอกสาร ตรงกับ formdefs/FRAE.json
 */

var FRAE = {
  code: 'FRAE',
  doc: 'D-0507-FRAE-001',
  issue: '01',
  rev: '00',
  titleEn: 'FLIGHT RISK ASSESSMENT AND EVALUATION',
  titleTh: 'การประเมินความเสี่ยงก่อนทำการบิน',

  // [key, ข้อความอังกฤษตามเอกสาร, คะแนน]
  // { sel:key, t:หัวข้อ, opt:[[ค่า, ข้อความ, คะแนน], …] } = เลือกได้อย่างเดียวในกลุ่ม
  sections: [
    { n: '1', t: 'GENERAL FLIGHT', rows: [
      ['s1Sigmet',    'Convective sigmet (red) penetration', 5],
      ['s1Thunder',   'Thunderstorm penetration', 100],
      ['s1Freezing',  'Possible freezing rain / fog', 100],
      ['s1Autopilot', 'Autopilot INOPS', 2],
      ['s1AfterMx',   'First flight after maintenance', 1],
      { sel: 's1Icing', t: 'Forecast or report icing', opt: [
        ['none', 'None', 0], ['light', 'Light', 5],
        ['moderate', 'Moderate', 50], ['severe', 'Severe SLD', 100] ] },
      { sel: 's1PrevFlight', t: 'Previous flight from today', opt: [
        ['1st', '1st', 0], ['2nd', '2nd', 1], ['3rd', '3rd', 2], ['gt3', 'More than 3rd', 2] ] },
    ]},

    { n: '2', t: 'HUMAN FACTOR', rows: [
      ['s2NotCurrent', 'Not 90-day current', 3],
      ['s2Fatigue',    'Fatigue or inadequate rest', 3],
      ['s2AfterWork',  'Going to fly immediately after workday', 1],
      ['s2Illness',    'Illness, cold, flu', 3],
      ['s2Personal',   'Personal relationship issue', 3],
      ['s2Business',   'Business issue', 3],
      ['s2Hunger',     'Starving or eating less food', 1],
    ]},

    { n: '3', t: 'DEPARTURE', rows: [
      ['s3Wind',       'Wind / gust > 20 kt', 3],
      ['s3Crosswind',  'Crosswind > 12 kt / runway width < 50 ft', 3],
      ['s3Night',      'Night operation', 2],
      ['s3Precip',     'Precipitation', 1],
      ['s3MaxWeight',  'Near maximum take-off weight', 1],
      ['s3Terrain',    'Steep terrain nearby', 1],
      { sel: 's3Runway', t: 'Runway condition', opt: [
        ['dry', 'Dry', 0], ['wet', 'Wet', 1], ['standing', 'Standing water', 2],
        ['soft', 'Soft field', 3], ['short', 'Runway < 2,000 ft', 1] ] },
      ['s3Wx',         'Ceilings < 500 ft and/or visibility < 1 SM', 2],
    ]},

    { n: '4', t: 'ENROUTE', rows: [
      ['s4Water',       'Water crossing beyond glide distance', 5],
      ['s4Mountain',    'Mountain range crossing beyond glide distance', 5],
      ['s4NightIMC',    'Night or ground-level IMC', 2],
      ['s4LowPressure', 'Passing within 75 NM of a low-pressure system', 1],
    ]},

    { n: '5', t: 'DESTINATION', rows: [
      ['s5Wind',       'Wind / gust > 20 kt', 2],
      ['s5Crosswind',  'Crosswind > 12 kt / runway width < 50 ft', 3],
      ['s5Night',      'Night operation', 1],
      ['s5Precip',     'Precipitation', 1],
      ['s5Terrain',    'Steep terrain nearby', 1],
      ['s5Windshear',  'Low level windshear', 5],
      ['s5Temp',       'Temperature < 0 °C', 1],
      ['s5Spread',     'Temperature / dewpoint spread < 3 °C', 1],
      ['s5Unfamiliar', 'Unfamiliar airport', 1],
      ['s5NoTower',    'No operating tower', 1],
      ['s5NoRadar',    'No radar coverage for approach', 1],
      ['s5Fuel',       'Less than 1 hr 30 min fuel at destination', 1],
      { sel: 's5Runway', t: 'Runway condition', opt: [
        ['dry', 'Dry', 0], ['wet', 'Wet', 1], ['standing', 'Standing water', 3],
        ['soft', 'Soft field', 3], ['short', 'Runway < 2,000 ft', 1] ] },
      ['s5Wx',         'Ceilings < 500 ft and/or visibility < 1 SM', 3],
    ]},
  ],

  bands: [
    ['0 – 4',   'GOOD TO GO'],
    ['5 – 9',   'MODERATE. Consider an alternative to mitigate some risk item.'],
    ['10 – 29', 'HIGH RISK! Have a serious alternative plan. Consult with FI or another pilot.'],
    ['> 29',         'EXTREME RISK! Wait for conditions to change.'],
  ],
};

var NAVY = '#0D1B2A', SKY = '#4A90D9', GREY = '#666666', LINE = '#C7CED6';

// ── จุดเรียกใช้ ─────────────────────────────────────────────
function buildFraeTemplate() {
  var folder = subFolder_(FRAE.code);
  var name = FRAE.code + '_TEMPLATE';

  // มีของเดิมอยู่ ให้ทิ้งลงถังก่อน จะได้ไม่มีสองไฟล์ชื่อซ้ำให้ makePdf_ เลือกผิด
  var old = folder.getFilesByName(name);
  while (old.hasNext()) old.next().setTrashed(true);

  var doc = DocumentApp.create(name);
  var b = doc.getBody();
  b.setMarginTop(36).setMarginBottom(36).setMarginLeft(40).setMarginRight(40);
  b.clear();

  head_(b);
  info_(b);
  FRAE.sections.forEach(function (s) { section_(b, s); });
  total_(b);
  bands_(b);
  sigBlock_(b);
  footer_(doc);

  doc.saveAndClose();

  // DocumentApp.create วางไฟล์ที่ My Drive — ย้ายเข้า subfolder
  var file = DriveApp.getFileById(doc.getId());
  folder.addFile(file);
  DriveApp.getRootFolder().removeFile(file);

  Logger.log('สร้างแม่แบบแล้ว: ' + doc.getUrl());
  return doc.getUrl();
}

// ── ชิ้นส่วนของเอกสาร ───────────────────────────────────────
function head_(b) {
  var p = b.appendParagraph('D-0507 FLIGHT TRAINING CO., LTD.');
  p.setAttributes(attr_({ SZ: 9, C: SKY, BOLD: true, SPACE_AFTER: 2 }));

  p = b.appendParagraph(FRAE.titleTh);
  p.setAttributes(attr_({ SZ: 16, C: NAVY, BOLD: true, SPACE_AFTER: 1 }));

  p = b.appendParagraph(FRAE.titleEn);
  p.setAttributes(attr_({ SZ: 10, C: GREY, BOLD: true, SPACE_AFTER: 8 }));

  p = b.appendParagraph(FRAE.doc + '  ·  ISSUE NO. ' + FRAE.issue + '/REVISION NO. ' + FRAE.rev);
  p.setAttributes(attr_({ SZ: 8.5, C: GREY, SPACE_AFTER: 10 }));
}

function info_(b) {
  var t = b.appendTable([
    ['PIC / STUDENT NAME', '{{picFirst}} {{picLast}}', 'DATE', '{{evalDate}}'],
    ['AIRCRAFT REG.', '{{aircraftReg}}', 'TYPE OF FLIGHT', '{{flightType}}'],
    ['ASSESSED BY', '{{k_role_PIC}} PIC    {{k_role_Student}} STUDENT', 'RECORD NO.', '{{tracking}}'],
  ]);
  styleTable_(t);
  for (var r = 0; r < 3; r++) {
    label_(t.getCell(r, 0)); label_(t.getCell(r, 2));
    value_(t.getCell(r, 1)); value_(t.getCell(r, 3));
  }
  t.setColumnWidth(0, 116).setColumnWidth(1, 190).setColumnWidth(2, 92).setColumnWidth(3, 118);
  gap_(b, 8);
}

function section_(b, s) {
  var p = b.appendParagraph('SECTION ' + s.n + '  —  ' + s.t);
  p.setAttributes(attr_({ SZ: 10, C: '#FFFFFF', BOLD: true, SPACE_BEFORE: 6, SPACE_AFTER: 0 }));
  p.setBackgroundColor(NAVY);

  var rows = s.rows.map(function (r) {
    if (r.sel) {
      var opts = r.opt.map(function (o) {
        return '{{k_' + r.sel + '_' + o[0] + '}} ' + o[1] + ' (' + o[2] + ')';
      }).join('    ');
      return ['', r.t + '\n' + opts, ''];
    }
    return ['{{k_' + r[0] + '}}', r[1], '(' + r[2] + ')'];
  });

  var t = b.appendTable(rows);
  styleTable_(t);
  for (var i = 0; i < rows.length; i++) {
    cell_(t.getCell(i, 0), { SZ: 11, C: NAVY, ALIGN: DocumentApp.HorizontalAlignment.CENTER });
    cell_(t.getCell(i, 1), { SZ: 9.5, C: NAVY });
    cell_(t.getCell(i, 2), { SZ: 9, C: SKY, BOLD: true, ALIGN: DocumentApp.HorizontalAlignment.RIGHT });
  }
  t.setColumnWidth(0, 26).setColumnWidth(1, 448).setColumnWidth(2, 42);
  gap_(b, 4);
}

function total_(b) {
  var t = b.appendTable([['TOTAL RISK SCORE', '{{score}}'], ['GO / NO-GO', '{{decision}}']]);
  styleTable_(t);
  label_(t.getCell(0, 0)); label_(t.getCell(1, 0));
  cell_(t.getCell(0, 1), { SZ: 15, C: NAVY, BOLD: true });
  cell_(t.getCell(1, 1), { SZ: 12, C: NAVY, BOLD: true });
  t.setColumnWidth(0, 160).setColumnWidth(1, 356);
  gap_(b, 6);
}

function bands_(b) {
  var t = b.appendTable(FRAE.bands.map(function (x) { return [x[0], x[1]]; }));
  styleTable_(t);
  for (var i = 0; i < FRAE.bands.length; i++) {
    cell_(t.getCell(i, 0), { SZ: 9, C: NAVY, BOLD: true,
      ALIGN: DocumentApp.HorizontalAlignment.CENTER });
    cell_(t.getCell(i, 1), { SZ: 9, C: GREY });
  }
  t.setColumnWidth(0, 66).setColumnWidth(1, 450);

  var p = b.appendParagraph('MITIGATION: {{mitigation}}');
  p.setAttributes(attr_({ SZ: 9, C: NAVY, SPACE_BEFORE: 8, SPACE_AFTER: 10 }));
}

function sigBlock_(b) {
  // ครูการบินลงนามเฉพาะกรณีผู้ประเมินเป็นนักเรียน — ถ้าเป็น PIC ช่องขวาจะว่าง
  var t = b.appendTable([
    ['PIC / STUDENT', 'AUTHORISING FI / HT  (นักเรียนเท่านั้น)'],
    ['{{sig_picSign}}', '{{sig_fiSign}}'],
    ['{{picFirst}} {{picLast}}', '{{fiName}}'],
    ['DATE  {{evalDate}}', 'DATE  {{fiDate}}'],
    ['', '{{fiComment}}'],
  ]);
  styleTable_(t);
  for (var r = 0; r < 5; r++) for (var c = 0; c < 2; c++) {
    var spec = r === 0 ? { SZ: 8.5, C: SKY, BOLD: true }
             : r === 1 ? { SZ: 9, C: NAVY }
             : r === 2 ? { SZ: 10, C: NAVY, BOLD: true }
             : { SZ: 8.5, C: GREY };
    cell_(t.getCell(r, c), spec);
    if (r === 1) t.getCell(r, c).setPaddingTop(14).setPaddingBottom(14);
  }
  t.setColumnWidth(0, 258).setColumnWidth(1, 258);
}

function footer_(doc) {
  var f = doc.addFooter();
  var p = f.appendParagraph(
    'D-0507 Flight Training Co., Ltd.  ·  ' + FRAE.doc +
    '  ·  Issue ' + FRAE.issue + '/Rev ' + FRAE.rev +
    '  ·  Controlled copy  ·  {{submittedAt}}');
  p.setAttributes(attr_({ SZ: 7.5, C: GREY }));
}

// ── ตัวช่วยจัดรูปแบบ ────────────────────────────────────────
function attr_(o) {
  var D = DocumentApp.Attribute, a = {};
  a[D.FONT_FAMILY] = 'Sarabun';
  if (o.SZ !== undefined)   a[D.FONT_SIZE] = o.SZ;
  if (o.C)                  a[D.FOREGROUND_COLOR] = o.C;
  if (o.BOLD !== undefined) a[D.BOLD] = o.BOLD;
  if (o.ALIGN)              a[D.HORIZONTAL_ALIGNMENT] = o.ALIGN;
  if (o.SPACE_BEFORE !== undefined) a[D.SPACING_BEFORE] = o.SPACE_BEFORE;
  if (o.SPACE_AFTER !== undefined)  a[D.SPACING_AFTER] = o.SPACE_AFTER;
  a[D.LINE_SPACING] = 1.15;
  return a;
}

function styleTable_(t) {
  t.setBorderColor(LINE).setBorderWidth(0.5);
  var A = DocumentApp.Attribute, a = {};
  a[A.PADDING_TOP] = 3; a[A.PADDING_BOTTOM] = 3;
  a[A.PADDING_LEFT] = 6; a[A.PADDING_RIGHT] = 6;
  t.setAttributes(a);
}

function cell_(c, spec) {
  c.getChild(0).asParagraph().setAttributes(attr_(spec));
}

function label_(c) { cell_(c, { SZ: 8.5, C: SKY, BOLD: true }); }
function value_(c) { cell_(c, { SZ: 10, C: NAVY }); }

function gap_(b, pts) {
  b.appendParagraph('').setAttributes(attr_({ SZ: 1, SPACE_AFTER: pts }));
}
