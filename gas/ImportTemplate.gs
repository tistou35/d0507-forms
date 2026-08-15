/**
 * ImportTemplate.gs — ทำแม่แบบ PDF จาก .docx ต้นฉบับโดยตรง
 *
 *   importTemplate('VSR')     ทำใบเดียว
 *   importAllTemplates()      ทำทุกใบที่มีใน TokenMap.gs
 *
 * ขั้นตอนที่สคริปต์ทำให้
 *   1. หา D-0507-<ABBR>-001.docx ใน Drive (วางไว้ที่ไหนก็ได้ ชื่อต้องตรง)
 *   2. คัดลอกเข้า subfolder <ABBR> พร้อมแปลงเป็น Google Doc ชื่อ <ABBR>_TEMPLATE
 *      เลย์เอาต์ ตาราง เส้นขอบ สีหัวตาราง เหมือนต้นฉบับทุกอย่าง
 *   3. เติม token ลงในช่องที่จับคู่ได้ — สามแบบตามที่กระดาษวางช่องไว้
 *        byLabel  "Name" | ____              ใส่ในเซลล์ถัดไป
 *        byLine   "Signature: ______"        แทนเส้นประในบรรทัดนั้น
 *        boxes    ☐                          แทนตามลำดับ ถ้าจำนวนตรงกัน
 *   4. ต่อท้ายด้วยตารางส่วนอนุมัติ — ระบบมีขั้นอนุมัติที่กระดาษเดิมไม่มี
 *   5. ต่อท้ายด้วยรายการ token ที่เหลือ ให้คนวางมือแล้วลบบล็อกนั้นทิ้ง
 *
 * ⚠️ ช่องติ๊กจะไม่ถูกแทนอัตโนมัติเมื่อจำนวน ☐ ในเอกสารไม่เท่ากับในนิยามฟอร์ม
 *    ปล่อยให้วางมือดีกว่าวางเลื่อนช่องทั้งใบโดยไม่มีใครรู้
 */

/* ใบที่จะทำเมื่อกด Run โดยไม่เลือกฟังก์ชัน — เมนูเลือกฟังก์ชันในเว็บกดยาก
   แก้บรรทัดนี้แล้ว push ใหม่ ง่ายและแน่นอนกว่า */
var RUN_LIST = ['VSR', 'PWR', 'HIF'];

function importTemplate(abbr) {
  if (!abbr) return RUN_LIST.map(function (a) { return importTemplate(a); });
  var map = TOKEN_MAP[abbr];
  if (!map) throw new Error('ไม่มี ' + abbr + ' ใน TokenMap.gs — รัน tools/make_tokenmap.py ก่อน');

  var src = findDocx_(map.docx);
  var folder = subFolder_(abbr);
  var name = abbr + '_TEMPLATE';

  // ทิ้งของเดิมก่อน จะได้ไม่มีสองไฟล์ชื่อซ้ำให้ makePdf_ เลือกผิดใบ
  var old = folder.getFilesByName(name);
  while (old.hasNext()) old.next().setTrashed(true);

  var docId = copyAsDoc_(src.getId(), name, folder.getId());
  var doc = DocumentApp.openById(docId);
  var res = fillTokens_(doc, map);
  doc.saveAndClose();

  var line = Utilities.formatString('%s — วาง %d · ส่วนอนุมัติ %d · วางมือ %d · %s\n%s',
    abbr, res.placed, res.appended, res.left.length, res.boxNote, doc.getUrl());
  Logger.log(line);
  return { abbr: abbr, url: doc.getUrl(), placed: res.placed, left: res.left };
}

/* ปุ่ม Run ส่งอาร์กิวเมนต์ไม่ได้ — ต้องมีตัวห่อไม่รับพารามิเตอร์ให้เลือกจากเมนู */
function importVSR()  { return importTemplate('VSR'); }
function importPWR()  { return importTemplate('PWR'); }
function importHIF()  { return importTemplate('HIF'); }
function importFRAE() { return importTemplate('FRAE'); }
function importSDF()  { return importTemplate('SDF'); }

function importAllTemplates() {
  var out = [];
  Object.keys(TOKEN_MAP).forEach(function (a) {
    try { out.push(importTemplate(a)); }
    catch (e) { Logger.log('%s ล้มเหลว: %s', a, e.message); out.push({ abbr: a, error: e.message }); }
  });
  return out;
}

/** คัดลอกพร้อมแปลงชนิดไฟล์ — DriveApp ทำไม่ได้ ต้องเรียก Drive REST ตรง ๆ */
function copyAsDoc_(fileId, name, parentId) {
  var res = UrlFetchApp.fetch(
    'https://www.googleapis.com/drive/v3/files/' + fileId + '/copy?supportsAllDrives=true',
    { method: 'post', contentType: 'application/json', muteHttpExceptions: true,
      headers: { Authorization: 'Bearer ' + ScriptApp.getOAuthToken() },
      payload: JSON.stringify({ name: name, parents: [parentId],
                                mimeType: 'application/vnd.google-apps.document' }) });
  if (res.getResponseCode() >= 300)
    throw new Error('คัดลอก/แปลงไฟล์ไม่สำเร็จ: ' + res.getContentText().slice(0, 300));
  return JSON.parse(res.getContentText()).id;
}

/** หาไฟล์ .docx ใน Drive ทั้งบัญชี — ชื่อต้องตรงเป๊ะ */
function findDocx_(name) {
  var it = DriveApp.getFilesByName(name);
  if (!it.hasNext())
    throw new Error('ไม่พบ ' + name + ' ใน Drive — อัปโหลดไฟล์นี้เข้า Drive ก่อน (วางที่ไหนก็ได้)');
  return it.next();
}

function fillTokens_(doc, map) {
  var body = doc.getBody();
  var placed = 0;

  // ที่ make_tokenmap.py จับคู่ไม่ได้ตั้งแต่ต้น ต้องขึ้นรายการด้วย
  // ไม่งั้นช่องพวกนี้หายเงียบ ๆ ทั้งที่เป็นเหตุผลที่ทำบล็อกเตือนนี้ขึ้นมา
  var left = (map.manual || []).map(function (m) { return m.tok + '  ← ' + m.label; });

  // 1) ป้ายในเซลล์ -> ช่องว่างที่คู่กัน (ขวาก่อน แล้วล่าง)
  //    ป้ายซ้ำกันได้ในใบเดียว เช่น PWR มี "Phone Number" ทั้งของผู้โดยสารและผู้ปกครอง
  //    จึงต้องกันเซลล์ที่ใช้ไปแล้ว ไม่งั้นอันหลังไปทับอันแรกหรือหาไม่เจอ
  var usedCells = {};
  (map.byLabel || []).forEach(function (it) {
    var cell = findCellByText_(body, it.label, usedCells);
    var target = cell && nextCell_(cell);
    if (!target) { left.push(it.tok + '  ← ' + it.label + ' (ไม่มีช่องว่างข้างเคียง)'); return; }
    usedCells[cell.key] = true;
    target.setText(it.tok);
    placed++;
  });

  // 2) "ป้าย: ______" -> แทนเส้นประ คงความยาวบรรทัดไว้ให้ใกล้เคียงเดิม
  (map.byLine || []).forEach(function (ln) {
    var pat = escRe_(ln.label) + '\\s*[:：]?\\s*_{3,}';
    var r = body.findText(pat);
    if (!r) { left.push(ln.tok + '  ← ' + ln.label); return; }
    var el = r.getElement().asText();
    var txt = el.getText().slice(r.getStartOffset(), r.getEndOffsetInclusive() + 1);
    var head = txt.replace(/_{3,}\s*$/, '');
    el.deleteText(r.getStartOffset(), r.getEndOffsetInclusive());
    el.insertText(r.getStartOffset(), head + ln.tok);
    placed++;
  });

  // 3) ช่องติ๊ก — แทนตามลำดับเฉพาะเมื่อจำนวนตรงกัน
  var boxes = map.boxes || [], boxNote;
  if (boxes.length && boxes.length === map.boxesInDocx) {
    var i = 0;
    while (i < boxes.length) {
      var rb = body.findText('☐');
      if (!rb) break;
      var eb = rb.getElement().asText();
      eb.deleteText(rb.getStartOffset(), rb.getEndOffsetInclusive());
      eb.insertText(rb.getStartOffset(), boxes[i].tok);
      i++;
    }
    boxNote = 'แทน ☐ แล้ว ' + i + ' ช่อง';
    placed += i;
  } else {
    boxNote = 'ช่องติ๊กวางมือ (นิยามฟอร์ม ' + boxes.length + ' ≠ ☐ ในเอกสาร ' + map.boxesInDocx + ')';
    boxes.forEach(function (b) { left.push(b.tok + '  ← ☐ ' + b.label); });
  }

  // 4) ส่วนอนุมัติ — ระบบมีขั้นนี้ กระดาษเดิมไม่มี จึงต่อท้ายให้
  var appended = appendApproval_(body, map.approval || []);

  // 5) ที่เหลือ บอกให้ชัด ไม่ปล่อยไปเจอเอาตอน PDF ออกมาแล้วช่องว่าง
  if (left.length) {
    body.appendParagraph('').setAttributes(mono_(8));
    body.appendParagraph('⚠️ TOKEN ที่ยังไม่ได้วาง — ' + left.length + ' รายการ')
        .setAttributes(mono_(10, '#C0392B', true));
    body.appendParagraph('คัดลอกไปวางในช่องที่ถูกต้องของเอกสาร แล้วลบบล็อกนี้ทิ้ง')
        .setAttributes(mono_(8.5, '#777777'));
    left.forEach(function (x) { body.appendParagraph(x).setAttributes(mono_(9)); });
  }

  return { placed: placed, appended: appended, left: left, boxNote: boxNote };
}

/** ตารางบันทึกการอนุมัติ ต่อท้ายเอกสาร — หน้าตาเดียวกันทุกใบ */
function appendApproval_(body, ap) {
  if (!ap.length) return 0;
  body.appendParagraph('');
  body.appendParagraph('APPROVAL / การอนุมัติ')
      .setAttributes(mono_(10, '#0D1B2A', true));

  var rows = ap.map(function (f) {
    var lab = f.label + (f.labelTh ? ' / ' + f.labelTh : '');
    return [lab, f.tok];
  });
  var tbl = body.appendTable(rows);
  tbl.setBorderColor('#B9C2CC');
  for (var r = 0; r < tbl.getNumRows(); r++) {
    var row = tbl.getRow(r);
    row.getCell(0).setWidth(180).setAttributes(mono_(9, '#3A4652'));
    row.getCell(1).setWidth(320).setAttributes(mono_(9));
    if (ap[r].sign) row.getCell(1).setAttributes(mono_(9)); // token รูปลายเซ็น
  }
  return ap.length;
}

/**
 * หาเซลล์ที่มีข้อความตรงเป๊ะ ข้ามอันที่จองไปแล้ว
 * เทียบด้วยตำแหน่ง (ตารางที่/แถว/คอลัมน์) ไม่ใช่ตัววัตถุ —
 * getCell() คืน wrapper คนละตัวทุกครั้งแม้เป็นเซลล์เดียวกัน เทียบ === จะไม่มีวันตรง
 */
function findCellByText_(body, text, skip) {
  skip = skip || {};
  for (var i = 0; i < body.getNumChildren(); i++) {
    var ch = body.getChild(i);
    if (ch.getType() !== DocumentApp.ElementType.TABLE) continue;
    var tbl = ch.asTable();
    for (var r = 0; r < tbl.getNumRows(); r++) {
      var row = tbl.getRow(r);
      for (var c = 0; c < row.getNumCells(); c++) {
        if (row.getCell(c).getText().trim() !== text) continue;
        var key = i + ':' + r + ':' + c;
        if (skip[key]) continue;                    // ป้ายซ้ำ — เอาอันถัดไป
        return { tbl: tbl, r: r, c: c, key: key };
      }
    }
  }
  return null;
}

/**
 * ช่องกรอกที่คู่กับป้าย — ขวาก่อน ถ้าขวาไม่ว่างค่อยลงล่าง
 * กระดาษของ D-0507 ใช้ทั้งสองแบบ: บางใบ "ป้าย | ค่า" บางใบป้ายอยู่แถวบน ค่าอยู่แถวล่าง
 * คืนเฉพาะช่องที่ว่างจริง (หรือมีแต่เส้นประ) จะได้ไม่ทับข้อความของเอกสาร
 */
function nextCell_(pos) {
  var cand = [];
  var row = pos.tbl.getRow(pos.r);
  if (pos.c + 1 < row.getNumCells()) cand.push(row.getCell(pos.c + 1));
  if (pos.r + 1 < pos.tbl.getNumRows()) {
    var nx = pos.tbl.getRow(pos.r + 1);
    if (nx.getNumCells() > pos.c) cand.push(nx.getCell(pos.c));
  }
  for (var i = 0; i < cand.length; i++) {
    var t = cand[i].getText().trim();
    if (!t || /^[_\.\s\/\-:☐]*$/.test(t)) return cand[i];
  }
  return null;
}

function escRe_(s) { return String(s).replace(/[.*+?^${}()|[\]\\\/]/g, '\\$&'); }

function mono_(sz, color, bold) {
  var D = DocumentApp.Attribute, a = {};
  a[D.FONT_FAMILY] = 'Courier New';
  a[D.FONT_SIZE] = sz;
  a[D.FOREGROUND_COLOR] = color || '#0D1B2A';
  a[D.BOLD] = !!bold;
  return a;
}
