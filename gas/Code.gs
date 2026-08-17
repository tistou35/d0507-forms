/**
 * D-0507 Forms — ตัวส่งออกไป Google Drive และ Google Sheet
 * Apps Script Web App · deploy แบบ "Execute as: Me" + "Who has access: Anyone"
 *
 * โครงที่สร้างให้อัตโนมัติ
 *   <PARENT_FOLDER>/
 *     <ABBR>/                              ← subfolder ชื่อเดียวกับตัวย่อฟอร์ม
 *       <ABBR> — Records          (Sheet)  ← 1 แถวต่อ 1 ใบที่จบแล้ว
 *       <ABBR>_TEMPLATE           (Doc)    ← แม่แบบ PDF (อัปโหลดเอง ดู README)
 *       <tracking>.pdf                     ← ฉบับสมบูรณ์ของแต่ละใบ
 *
 * เขียนเมื่อ "จบ" เท่านั้น — จบที่ submit หรือจบทั้ง flow
 * ระหว่างรออนุมัติไม่เขียน กันเอกสารครึ่ง ๆ กลาง ๆ ปนในแฟ้ม
 */

// ── ตั้งค่า ─────────────────────────────────────────────────
// ใส่ค่าที่ Project Settings → Script Properties (อย่า hardcode ลงไฟล์นี้)
//   PARENT_FOLDER_ID   1osUg2ReIT_mqll6BbDSUR-FBAg4zSEp6
//   FIREBASE_API_KEY   apiKey ของโปรเจกต์ d0507-forms
//   FIREBASE_PROJECT   d0507-forms
function cfg_(k) {
  var v = PropertiesService.getScriptProperties().getProperty(k);
  if (!v) throw new Error('ยังไม่ได้ตั้ง Script Property: ' + k);
  return v;
}

// ── จุดรับ POST ─────────────────────────────────────────────
function doPost(e) {
  try {
    var body = JSON.parse(e.postData.contents);
    var who = verifyToken_(body.idToken);          // ตรวจว่า token มาจากโปรเจกต์เราจริง

    /* งานดึงแผนภูมิ AIP — เจ้าหน้าที่ที่ล็อกอินแล้วเท่านั้น
       เว็บแอปนี้เปิดแบบ ANYONE_ANONYMOUS เพราะนักเรียนต้องส่งฟอร์มได้
       แต่ปุ่มนี้ลบและเขียนทับไฟล์กว่า 350 ใบใน Drive ปล่อยให้ใครก็กดได้ไม่ได้
       นักเรียนที่ล็อกอินแบบ anonymous จึงต้องกันออกด้วย ไม่ใช่แค่ "มี token" */
    if (body.action === 'aipSync' || body.action === 'aipStatus') {
      if (who.anonymous) throw new Error('ต้องเข้าสู่ระบบเจ้าหน้าที่ก่อน');
      if (body.action === 'aipStatus') return json_({ ok: true, result: aipStatusJson_() });
      var msg = aipBegin_();
      return json_({ ok: true, result: { note: msg, status: aipStatusJson_() } });
    }

    var out = exportSubmission_(body.submission, who);
    return json_({ ok: true, result: out });
  } catch (err) {
    return json_({ ok: false, error: String(err && err.message || err) });
  }
}

function doGet() {
  return json_({ ok: true, service: 'D-0507 Forms exporter', at: new Date().toISOString() });
}

function json_(o) {
  return ContentService.createTextOutput(JSON.stringify(o))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * ตรวจ Firebase ID token ผ่าน Identity Toolkit
 * ได้ทั้งการยืนยันว่า token ยังไม่หมดอายุ และว่าเป็นของโปรเจกต์นี้จริง
 * (นักเรียนที่ล็อกอินแบบ anonymous ก็มี token จึงใช้กติกาเดียวกัน)
 */
function verifyToken_(idToken) {
  if (!idToken) throw new Error('ไม่มี idToken');
  var res = UrlFetchApp.fetch(
    'https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=' + cfg_('FIREBASE_API_KEY'),
    { method: 'post', contentType: 'application/json',
      payload: JSON.stringify({ idToken: idToken }), muteHttpExceptions: true });
  if (res.getResponseCode() !== 200) throw new Error('idToken ไม่ผ่านการตรวจสอบ');
  var u = (JSON.parse(res.getContentText()).users || [])[0];
  if (!u) throw new Error('ไม่พบผู้ใช้ของ idToken นี้');
  return {
    uid: u.localId,
    email: u.email || '',
    anonymous: !u.email,
  };
}

// ── ตัวช่วยเรื่องโฟลเดอร์ / ชีต ─────────────────────────────
function subFolder_(abbr) {
  var parent = DriveApp.getFolderById(cfg_('PARENT_FOLDER_ID'));
  var it = parent.getFoldersByName(abbr);
  return it.hasNext() ? it.next() : parent.createFolder(abbr);
}

function recordSheet_(folder, abbr, headers) {
  var name = abbr + ' — Records';
  var it = folder.getFilesByName(name), ss;
  if (it.hasNext()) {
    ss = SpreadsheetApp.open(it.next());
  } else {
    ss = SpreadsheetApp.create(name);
    // SpreadsheetApp.create วางไฟล์ไว้ที่ My Drive — ย้ายเข้า subfolder
    var f = DriveApp.getFileById(ss.getId());
    folder.addFile(f);
    DriveApp.getRootFolder().removeFile(f);
  }
  var sh = ss.getSheets()[0];
  if (sh.getLastRow() === 0) {
    sh.appendRow(headers);
    sh.getRange(1, 1, 1, headers.length).setFontWeight('bold')
      .setBackground('#0D1B2A').setFontColor('#ffffff');
    sh.setFrozenRows(1);
  }
  return { ss: ss, sh: sh };
}

/** ถ้ามีหัวคอลัมน์ใหม่ที่ชีตยังไม่มี ให้ต่อท้าย ไม่เขียนทับของเดิม */
function alignHeaders_(sh, headers) {
  var cur = sh.getRange(1, 1, 1, Math.max(1, sh.getLastColumn())).getValues()[0]
    .filter(function (x) { return x !== ''; });
  var add = headers.filter(function (h) { return cur.indexOf(h) < 0; });
  if (add.length) {
    sh.getRange(1, cur.length + 1, 1, add.length).setValues([add])
      .setFontWeight('bold').setBackground('#0D1B2A').setFontColor('#ffffff');
    cur = cur.concat(add);
  }
  return cur;
}

// ── ส่งออกหนึ่งใบ ───────────────────────────────────────────
function exportSubmission_(s, who) {
  if (!s || !s.formCode) throw new Error('payload ไม่มี formCode');
  if (!s.tracking) throw new Error('payload ไม่มี tracking');
  if (s.status !== 'complete') throw new Error('ใบนี้ยังไม่จบ — ส่งออกเมื่อจบเท่านั้น');

  var abbr = String(s.formCode).replace(/[^A-Za-z0-9\-]/g, '');
  var folder = subFolder_(abbr);

  // ── 1. แถวในชีต ──
  var flat = flatten_(s.data || {});
  var base = ['เลขที่', 'วันที่บันทึก', 'Doc code', 'Issue/Rev', 'defRev',
              'ผู้ส่ง', 'อีเมลผู้ส่ง', 'สถานะ', 'ผู้ลงนาม', 'PDF'];
  var extra = Object.keys(flat);
  var r = recordSheet_(folder, abbr, base.concat(extra));
  var headers = alignHeaders_(r.sh, base.concat(extra));

  // ── 2. PDF ──
  var pdf = makePdf_(folder, abbr, s);

  var byKey = {
    'เลขที่': s.tracking,
    'วันที่บันทึก': new Date(),
    'Doc code': s.doc || '',
    'Issue/Rev': (s.issue || '') + '/' + (s.rev || ''),
    'defRev': s.defRev || '',
    'ผู้ส่ง': s.submitterName || '',
    'อีเมลผู้ส่ง': s.submitterEmail || '',
    'สถานะ': s.status,
    'ผู้ลงนาม': (s.signedBy || []).join(', '),
    'PDF': pdf ? pdf.getUrl() : '',
  };
  Object.keys(flat).forEach(function (k) { byKey[k] = flat[k]; });

  // กันบันทึกซ้ำถ้ายิงมาสองครั้ง
  var trkCol = headers.indexOf('เลขที่') + 1;
  if (trkCol > 0 && r.sh.getLastRow() > 1) {
    var col = r.sh.getRange(2, trkCol, r.sh.getLastRow() - 1, 1).getValues();
    for (var i = 0; i < col.length; i++) {
      if (String(col[i][0]) === String(s.tracking)) {
        return { duplicate: true, tracking: s.tracking,
                 sheet: r.ss.getUrl(), pdf: pdf ? pdf.getUrl() : '', folder: folder.getUrl() };
      }
    }
  }

  r.sh.appendRow(headers.map(function (h) { return byKey[h] === undefined ? '' : byKey[h]; }));

  return { tracking: s.tracking, sheet: r.ss.getUrl(),
           pdf: pdf ? pdf.getUrl() : '', folder: folder.getUrl(),
           verifiedUid: who.uid, verifiedEmail: who.email };
}

/**
 * YYYY-MM-DD -> DD MMM YYYY ตามรูปแบบวันที่ของเอกสารควบคุม (OMA style guide)
 * ค่าที่เว็บเก็บเป็น ISO เพราะ <input type="date"> ให้มาแบบนั้น
 */
var MON_ = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
function docDate_(v) {
  var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(v || ''));
  return m ? m[3] + ' ' + MON_[Number(m[2]) - 1] + ' ' + m[1] : v;
}

/** รับ ISO datetime ด้วย (เวลาที่ส่ง) — คืนรูปแบบวันที่ของเอกสารควบคุม */
function docStamp_(v) {
  var d = v ? new Date(v) : new Date();
  if (isNaN(d.getTime())) return String(v || '');
  return ('0' + d.getDate()).slice(-2) + ' ' + MON_[d.getMonth()] + ' ' + d.getFullYear();
}

/** แผ่คำตอบให้เป็นคอลัมน์เดียว — checklist และ array กลายเป็นข้อความอ่านได้ */
function flatten_(data) {
  var out = {};
  Object.keys(data).forEach(function (k) {
    var v = data[k];
    if (v === null || v === undefined) { out[k] = ''; return; }

    /* ตารางแถวซ้ำ — แตกเป็น <key>_<แถว>_<คอลัมน์> เริ่มนับที่ 1 ให้ตรงเลขแถวบนกระดาษ
       ถ้าปล่อยเป็นก้อนเดียว DRC จะได้เอกสารทั้งแปดบรรทัดยัดในช่องเดียว */
    if (Array.isArray(v) && v.length && typeof v[0] === 'object') {
      v.forEach(function (row, i) {
        Object.keys(row || {}).forEach(function (c) {
          var cv = row[c];
          out[k + '_' + (i + 1) + '_' + c] = typeof cv === 'string' ? docDate_(cv) : (cv == null ? '' : cv);
        });
      });
      out[k] = v.length;                       // ไว้ใช้เป็นจำนวนแถวที่กรอกจริง
      return;
    }
    if (Array.isArray(v)) { out[k] = v.join(', '); return; }

    /* checklist — แตกเป็น <key>_<ข้อ> เพื่อให้แม่แบบอ้างทีละข้อได้
       ส่วนช่องติ๊กของแต่ละข้อสร้างใน ticks_ */
    if (typeof v === 'object') {
      Object.keys(v).forEach(function (i) { out[k + '_' + i] = v[i]; });
      out[k] = Object.keys(v).map(function (i) { return i + '=' + v[i]; }).join(' · ');
      return;
    }
    if (typeof v === 'string' && v.indexOf('data:image') === 0) { out[k] = '(ลายเซ็น)'; return; }
    out[k] = typeof v === 'string' ? docDate_(v) : v;
  });
  return out;
}

// ── PDF ─────────────────────────────────────────────────────
/**
 * ถ้ามีแม่แบบ <ABBR>_TEMPLATE (Google Doc) ใน subfolder จะใช้แม่แบบนั้น
 * แทนค่า {{key}} ด้วยคำตอบ แล้ว export เป็น PDF — ได้หน้าตาตรงฟอร์มต้นฉบับ
 * ถ้ายังไม่มีแม่แบบ จะสร้าง PDF สำรองจาก HTML เพื่อให้ระบบเดินต่อได้
 */
function makePdf_(folder, abbr, s) {
  var name = s.tracking + '.pdf';
  var old = folder.getFilesByName(name);
  if (old.hasNext()) return old.next();          // มีแล้ว ไม่สร้างซ้ำ

  var tpl = folder.getFilesByName(abbr + '_TEMPLATE');
  var blob;
  if (tpl.hasNext()) {
    var copy = tpl.next().makeCopy(s.tracking + ' (working)', folder);
    var doc = DocumentApp.openById(copy.getId());
    var b = doc.getBody();
    var data = s.data || {};
    var flat = flatten_(data);
    // ค่าคำนวณทุกตัว ไม่ใช่แค่ score — SDF ใช้ t7 / t28 / t365 ในแม่แบบ
    // ถ้าดึงเฉพาะ score ช่องสรุปชั่วโมงในเอกสารจะว่างโดยไม่มีอะไรฟ้อง
    // ติ๊กจากค่าคำนวณด้วย — HIF ติ๊กระดับความเสี่ยง High/Medium/Low ที่มาจากตาราง
    // ไม่ใช่ช่องที่ผู้กรอกเลือกเอง ถ้าไม่รวมตรงนี้ ช่องติ๊กในเอกสารจะว่างเสมอ
    var all = Object.assign({}, flat, ticks_(Object.assign({}, data, s.computed || {})),
                            s.computed || {}, {
      tracking: s.tracking, doc: s.doc || '', issue: s.issue || '', rev: s.rev || '',
      defRev: s.defRev || '', submitter: s.submitterName || '',
      submittedAt: docStamp_(s.submittedAt),
      score: (s.computed && s.computed.score) || 0,
      delegatedFrom: s.delegatedFrom || '',
    });
    // ลายเซ็นต้องทำก่อนล้าง token ที่เหลือ มิฉะนั้น {{sig_…}} จะถูกลบไปก่อน
    signatures_(b, data);

    // หัวและท้ายกระดาษเป็นคนละส่วนกับเนื้อ — replaceText บน body ไม่แตะให้
    // ถ้าลืม จะเห็น {{submittedAt}} ค้างอยู่ท้ายทุกหน้าของเอกสารจริง
    var parts = [b];
    try { var hd = doc.getHeader(); if (hd) parts.push(hd); } catch (e) {}
    try { var ft = doc.getFooter(); if (ft) parts.push(ft); } catch (e) {}

    parts.forEach(function (part) {
      Object.keys(all).forEach(function (k) {
        part.replaceText('\\{\\{' + k + '\\}\\}', String(all[k]));
      });
      // ช่องติ๊กที่ผู้กรอกไม่ได้แตะเลยจะไม่มีใน data — ต้องเป็น ☐ ไม่ใช่ช่องว่าง
      part.replaceText('\\{\\{k_[a-zA-Z0-9_\\-]+\\}\\}', '☐');
      part.replaceText('\\{\\{[a-zA-Z0-9_]+\\}\\}', '');   // token อื่นที่เหลือให้ว่างไว้
    });
    doc.saveAndClose();
    blob = copy.getAs('application/pdf').setName(name);
    copy.setTrashed(true);
  } else {
    blob = Utilities.newBlob(fallbackHtml_(abbr, s), 'text/html', 'x.html')
      .getAs('application/pdf').setName(name);
  }
  return folder.createFile(blob);
}

/**
 * token ช่องติ๊ก — แทนที่อักขระเดียวในตำแหน่งเดิม เลย์เอาต์จึงไม่ขยับ
 *   {{k_s1Thunder}}        ช่องติ๊กเดี่ยว        → ☑ เมื่อ data.s1Thunder เป็นจริง
 *   {{k_s1Icing_moderate}} ตัวเลือกในกลุ่ม      → ☑ เมื่อ data.s1Icing === 'moderate'
 */
function ticks_(data) {
  var TICK = '☑', BOX = '☐', out = {};
  Object.keys(data).forEach(function (k) {
    var v = data[k];
    if (typeof v === 'boolean') { out['k_' + k] = v ? TICK : BOX; return; }
    // เกรดเก็บเป็นตัวเลข ไม่ใช่สตริง — ถ้าเช็คแค่ string ช่องติ๊กเกรดของ PCR จะว่างทั้งใบ
    if (typeof v === 'number') { out['k_' + k + '_' + v] = TICK; return; }
    if (typeof v === 'string' && v && v.indexOf('data:image') !== 0) {
      out['k_' + k + '_' + v] = TICK;               // ตัวที่เลือก
    }
    if (Array.isArray(v)) v.forEach(function (x) {
      if (typeof x !== 'object') out['k_' + k + '_' + x] = TICK;
    });
    /* checklist — หนึ่งข้อหนึ่งแถว หลายคอลัมน์ ต้องได้ ☑ ตรงคอลัมน์ที่เลือก
       token: k_<field>_<ข้อ>_<ค่า>  เช่น k_teach_TheCourseAsA_excellent */
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      Object.keys(v).forEach(function (i) {
        if (v[i]) out['k_' + k + '_' + i + '_' + v[i]] = TICK;
      });
    }
  });
  return out;
}

/**
 * ฝังรูปลายเซ็นแทน {{sig_<key>}}
 * ค่าที่เว็บส่งมาเป็น data URL จาก canvas ใน formkit.js
 * ตัวที่ไม่มีลายเซ็นปล่อยให้ตัวล้าง token จัดการต่อ
 */
function signatures_(b, data) {
  Object.keys(data).forEach(function (k) {
    var v = data[k];
    if (typeof v !== 'string' || v.indexOf('data:image') !== 0) return;
    var blob;
    try {
      var m = v.match(/^data:([^;]+);base64,(.*)$/);
      if (!m) return;
      blob = Utilities.newBlob(Utilities.base64Decode(m[2]), m[1], k + '.png');
    } catch (err) { return; }

    var tok = '\\{\\{sig_' + k + '\\}\\}';
    var r = b.findText(tok);
    while (r) {
      var el = r.getElement().asText();
      el.deleteText(r.getStartOffset(), r.getEndOffsetInclusive());
      var img = el.getParent().asParagraph().insertInlineImage(0, blob);
      var w = 150, h = img.getHeight() * w / img.getWidth();
      img.setWidth(w).setHeight(Math.round(h));
      r = b.findText(tok);
    }
  });
}

function fallbackHtml_(abbr, s) {
  var esc = function (x) {
    return String(x === undefined || x === null ? '' : x)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  };
  var flat = flatten_(s.data || {});
  var rows = Object.keys(flat).map(function (k) {
    return '<tr><td class="k">' + esc(k) + '</td><td>' + esc(flat[k]) + '</td></tr>';
  }).join('');
  return '<html><head><meta charset="utf-8"><style>' +
    'body{font-family:Sarabun,Arial,sans-serif;font-size:11pt;margin:28px}' +
    'h1{font-size:15pt;margin:0}.sub{color:#555;font-size:9pt}' +
    '.band{background:#0D1B2A;color:#fff;padding:10px 14px;margin:14px 0 0}' +
    'table{width:100%;border-collapse:collapse;margin-top:10px}' +
    'td{border-bottom:1px solid #ddd;padding:6px 8px;vertical-align:top}' +
    'td.k{width:38%;color:#555}' +
    '.warn{background:#fef3d8;border-left:4px solid #E8A020;padding:10px 14px;margin-top:16px;font-size:9pt}' +
    '</style></head><body>' +
    '<div class="band"><h1>' + esc(s.title || abbr) + '</h1>' +
    '<div class="sub" style="color:#cfe0f5">D-0507 Flight Training Co., Ltd.</div></div>' +
    '<p class="sub">' + esc(s.doc || abbr) + ' · Issue ' + esc(s.issue) + '/Rev ' + esc(s.rev) +
    ' · defRev ' + esc(s.defRev) + ' · เลขที่ ' + esc(s.tracking) + '</p>' +
    '<table>' + rows + '</table>' +
    '<div class="warn"><b>ยังไม่ได้ติดตั้งแม่แบบของฟอร์มนี้</b><br>' +
    'อัปโหลด ' + esc(abbr) + '_TEMPLATE (Google Doc) เข้าโฟลเดอร์ ' + esc(abbr) +
    ' เพื่อให้ PDF มีหน้าตาตรงกับฟอร์มต้นฉบับ</div>' +
    '</body></html>';
}

// ── ทดสอบจากใน editor โดยไม่ต้องยิงจากเว็บ ──────────────────
/** ใบตัวอย่างที่คะแนนรวม 7 = MODERATE — ใช้ทั้งทดสอบและดูหน้าตา PDF */
function sampleFrae_() {
  return {
    formCode: 'FRAE', tracking: 'FRAE-TEST-0001', status: 'complete',
    doc: 'D-0507-FRAE-001', issue: '01', rev: '00', defRev: 1,
    title: 'การประเมินความเสี่ยงก่อนทำการบิน',
    submitterName: 'ทดสอบ ระบบ', submitterEmail: 'test@example.com',
    submittedAt: '14 AUG 2026',
    signedBy: ['ทดสอบ ระบบ'],
    computed: { score: 7 },
    data: {
      picFirst: 'ทดสอบ', picLast: 'ระบบ', evalDate: '2026-08-14',
      flightNo: 'AS-202608-4',
      aircraftReg: 'HS-VVD', flightType: 'VFR',
      s1AfterMx: true,                       // 1
      s1Icing: 'none', s1PrevFlight: '3rd',  // 0 + 2
      s2Fatigue: true,                       // 3
      s3Runway: 'wet',                       // 1
      s5Runway: 'dry',                       // 0
      s3Night: false, s3Wind: false,
      decision: 'GO',
      mitigation: 'เลื่อนเวลาออกเดินทางเป็นช่วงบ่าย และพักก่อนบิน 2 ชั่วโมง',
      fiName: 'ครูการบิน ตัวอย่าง', fiDate: '2026-08-14',
      fiComment: 'อนุญาต — ให้ทบทวนแผนสำรองก่อนขึ้นบิน',
    },
  };
}

function testExport() {
  var out = exportSubmission_(sampleFrae_(), { uid: 'test', email: 'editor@local' });
  Logger.log(JSON.stringify(out, null, 2));
}

/** สร้างแม่แบบแล้วออกใบตัวอย่างทันที — ใช้ดูหน้าตา PDF จริงในครั้งเดียว */
function testFraeTemplate() {
  Logger.log('แม่แบบ: ' + buildFraeTemplate());
  var folder = subFolder_('FRAE');
  var old = folder.getFilesByName('FRAE-TEST-0001.pdf');
  while (old.hasNext()) old.next().setTrashed(true);   // ให้สร้างใหม่ทุกครั้ง
  testExport();
}
