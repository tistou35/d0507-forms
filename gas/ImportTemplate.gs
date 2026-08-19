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
 *   4. วาง token ลงตารางแถวซ้ำ โดยจับคู่จากหัวคอลัมน์
 *   5. ต่อท้ายด้วยตารางส่วนอนุมัติ — ระบบมีขั้นอนุมัติที่กระดาษเดิมไม่มี
 *   6. ต่อท้ายด้วยรายการ token ที่เหลือ ให้คนวางมือแล้วลบบล็อกนั้นทิ้ง
 *
 * ⚠️ ช่องติ๊กจะไม่ถูกแทนอัตโนมัติเมื่อจำนวน ☐ ในเอกสารไม่เท่ากับในนิยามฟอร์ม
 *    ปล่อยให้วางมือดีกว่าวางเลื่อนช่องทั้งใบโดยไม่มีใครรู้
 */

/* ใบที่จะทำเมื่อกด Run โดยไม่เลือกฟังก์ชัน — เมนูเลือกฟังก์ชันในเว็บกดยาก
   แก้บรรทัดนี้แล้ว push ใหม่ ง่ายและแน่นอนกว่า */
var RUN_LIST = ['EFC'];

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
  /* ช่องจริงที่กระดาษไม่มีที่ให้ ต้องต่อท้ายเป็นตาราง ไม่ใช่แค่ขึ้นรายการให้วางมือ
     ไม่งั้นสิ่งที่ผู้กรอกเขียนไว้จะไม่ไปถึงเอกสารเลย เช่น EFM ที่ช่องความเห็น
     ของผู้ประเมินหายทั้งช่อง ทั้งที่กรอกมาแล้ว */
  var extra = (map.manual || []).slice();
  var left = [];

  /* รายการ "ยังไม่ได้วาง" ต้องไม่เป็น token ที่ใช้งานได้เอง
     ไม่งั้นตอนออกเอกสาร ตัวแทนค่าจะไปเติมให้ในบล็อกเตือนนั้นเลย
     เคยเกิดกับ EFM — ลายเซ็นผู้ประเมินไปโผล่หน้าสุดท้ายในบล็อกเตือน
     แทนที่จะอยู่ในช่องลายเซ็น แล้วดูเผิน ๆ เหมือนเอกสารมีลายเซ็นครบ */
  var inert = function (s) { return s.replace(/\{\{/g, '⟦').replace(/\}\}/g, '⟧'); };

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

  // 1b) เซลล์ที่มีทั้งป้ายและเส้นประอยู่ในตัวเอง ("Aircraft Type: ______")
  //     ต้องแทนเส้นประในเซลล์นั้น ไม่ใช่เขียนลงเซลล์ข้าง ๆ ซึ่งเป็นป้ายของช่องถัดไป
  (map.byCell || []).forEach(function (it) {
    var cell = findCellByText_(body, it.cell, usedCells);
    if (!cell) { left.push(it.tok + '  ← ' + it.cell); return; }
    usedCells[cell.key] = true;
    cell.tbl.getRow(cell.r).getCell(cell.c).setText(it.head + it.tok);
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
  /* map.boxesPartial = กระดาษมี ☐ มากกว่าที่ฟอร์มใช้ และช่องที่เหลือไม่มีใครติ๊กแล้ว
     ตัวสร้าง TokenMap ตรวจลำดับ N ช่องแรกเทียบกระดาษให้แล้วก่อนตั้งธงนี้
     ไม่ใช่การปิดตัวกัน แต่เป็นการบอกว่า "จำนวนไม่เท่ากันโดยตั้งใจ" */
  var boxes = map.boxes || [], boxNote;
  if (boxes.length && (boxes.length === map.boxesInDocx || map.boxesPartial)) {
    var i = 0;
    while (i < boxes.length) {
      var rb = body.findText('☐');
      if (!rb) break;
      var eb = rb.getElement().asText();
      eb.deleteText(rb.getStartOffset(), rb.getEndOffsetInclusive());
      eb.insertText(rb.getStartOffset(), boxes[i].tok);
      i++;
    }
    boxNote = 'แทน ☐ แล้ว ' + i + ' ช่อง'
            + (map.boxesPartial ? ' (จาก ' + map.boxesInDocx + ' ☐ ที่เหลือปล่อยว่างตามตั้งใจ)' : '');
    placed += i;
  } else {
    boxNote = 'ช่องติ๊กวางมือ (นิยามฟอร์ม ' + boxes.length + ' ≠ ☐ ในเอกสาร ' + map.boxesInDocx + ')';
    boxes.forEach(function (b) { left.push(b.tok + '  ← ☐ ' + b.label); });
  }

  // 4) ตารางแถวซ้ำ — หาตารางที่หัวคอลัมน์ตรงกัน แล้ววาง token ทีละช่อง
  (map.tables || []).forEach(function (t) {
    var hit = findTableByHead_(body, t.cols);
    if (!hit) {
      for (var r = 1; r <= t.rows; r++)
        t.cols.forEach(function (c) {
          left.push('{{' + t.k + '_' + r + '_' + c.k + '}}  ← ' + t.label + ' แถว ' + r + ' · ' + c.head);
        });
      return;
    }
    // แถวข้อมูลเริ่มถัดจากหัวตาราง และมีเท่าที่กระดาษพิมพ์ไว้จริง
    var n = Math.min(t.rows, hit.tbl.getNumRows() - hit.headRow - 1);
    for (var i = 0; i < n; i++) {
      var row = hit.tbl.getRow(hit.headRow + 1 + i);
      t.cols.forEach(function (c, j) {
        var ci = hit.colIdx[j];
        if (ci == null || ci >= row.getNumCells()) return;
        var cell = row.getCell(ci), cur = cell.getText().trim();
        if (cur && !/^[_\.\s\/\-:]*$/.test(cur)) return;   // ช่องเลขลำดับ ฯลฯ อย่าไปทับ
        cell.setText('{{' + t.k + '_' + (i + 1) + '_' + c.k + '}}');
        placed++;
      });
    }
    for (var r2 = n + 1; r2 <= t.rows; r2++)
      t.cols.forEach(function (c) {
        left.push('{{' + t.k + '_' + r2 + '_' + c.k + '}}  ← ' + t.label + ' แถว ' + r2 + ' (กระดาษมีไม่พอ)');
      });
  });

  // 6) ส่วนอนุมัติ + ช่องที่กระดาษไม่มีที่ให้ — ต่อท้ายเป็นตาราง
  var appended = appendApproval_(body, map.approval || [], extra);

  // 7) ที่เหลือ บอกให้ชัด ไม่ปล่อยไปเจอเอาตอน PDF ออกมาแล้วช่องว่าง
  if (left.length) {
    body.appendParagraph('').setAttributes(mono_(8));
    body.appendParagraph('⚠️ TOKEN ที่ยังไม่ได้วาง — ' + left.length + ' รายการ')
        .setAttributes(mono_(10, '#C0392B', true));
    body.appendParagraph('เขียน ⟦…⟧ แทน {{…}} ไว้กัน token ทำงานเอง — ตอนวางให้เปลี่ยนกลับเป็นปีกกาคู่')
        .setAttributes(mono_(8.5, '#777777'));
    left.forEach(function (x) { body.appendParagraph(inert(x)).setAttributes(mono_(9)); });
  }

  return { placed: placed, appended: appended, left: left, boxNote: boxNote };
}

/**
 * หาตารางในเอกสารที่หัวคอลัมน์ตรงกับ cols ที่นิยามฟอร์มบอกไว้
 * คืนดัชนีคอลัมน์จริงด้วย เพราะกระดาษมักมีคอลัมน์ "#" นำหน้าที่ฟอร์มไม่มี
 * ต้องเจอครบทุกคอลัมน์จึงจะถือว่าใช่ — เจอครึ่งเดียวแล้ววางจะเลื่อนทั้งตาราง
 */
function findTableByHead_(body, cols) {
  var norm = function (s) {
    return String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
  };
  for (var i = 0; i < body.getNumChildren(); i++) {
    var ch = body.getChild(i);
    if (ch.getType() !== DocumentApp.ElementType.TABLE) continue;
    var tbl = ch.asTable();
    for (var r = 0; r < Math.min(tbl.getNumRows(), 3); r++) {
      var row = tbl.getRow(r), heads = [];
      for (var c = 0; c < row.getNumCells(); c++) heads.push(norm(row.getCell(c).getText()));
      var idx = cols.map(function (col) {
        var want = norm(col.head);
        for (var k = 0; k < heads.length; k++)
          if (heads[k] && (heads[k] === want || heads[k].indexOf(want) === 0 || want.indexOf(heads[k]) === 0))
            return k;
        return null;
      });
      if (idx.every(function (x) { return x != null; })
          && new Set(idx).size === idx.length
          && tbl.getNumRows() > r + 1)
        return { tbl: tbl, headRow: r, colIdx: idx };
    }
  }
  return null;
}

/**
 * ตารางต่อท้ายเอกสาร — ส่วนอนุมัติ และช่องที่กระดาษไม่มีที่ให้
 * extra คือช่องจริงที่จับคู่กับกระดาษไม่ได้ ต้องขึ้นเอกสารด้วย
 * ไม่งั้นสิ่งที่ผู้กรอกเขียนไว้จะหายไปเฉย ๆ โดยไม่มีใครรู้
 */
function appendApproval_(body, ap, extra) {
  extra = extra || [];
  if (!ap.length && !extra.length) return 0;
  body.appendParagraph('');
  body.appendParagraph(ap.length ? 'APPROVAL / การอนุมัติ' : 'ADDITIONAL / เพิ่มเติม')
      .setAttributes(mono_(10, '#0D1B2A', true));

  var rows = ap.concat(extra).map(function (f) {
    var lab = f.label + (f.labelTh ? ' / ' + f.labelTh : '');
    return [lab, f.tok];
  });
  var tbl = body.appendTable(rows);
  tbl.setBorderColor('#B9C2CC');
  for (var r = 0; r < tbl.getNumRows(); r++) {
    var row = tbl.getRow(r);
    row.getCell(0).setWidth(180).setAttributes(mono_(9, '#3A4652'));
    row.getCell(1).setWidth(320).setAttributes(mono_(9));
  }
  return rows.length;
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
