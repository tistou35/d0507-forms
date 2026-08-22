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

    /* ── ไฟล์แนบ ─────────────────────────────────────────────
       บางฟอร์มไม่ได้ให้กรอกผลทีละหัวข้อ แต่แนบรายงานที่ออกจากระบบอื่นมาแทน
       (EFC แนบรายงานรายวิชาจาก TrainHub)

       ทำไมไม่เก็บใน Firestore: เอกสารหนึ่งใบจำกัด 1 MiB ไฟล์รายงานใหญ่กว่านั้น
       ทำไมไม่ผ่าน Firebase Storage: ระบบนี้เก็บเอกสารทุกอย่างไว้ที่ Drive อยู่แล้ว
       ไฟล์แนบต้องอยู่ที่เดียวกับ PDF ของใบนั้น ไม่งั้นตอนตรวจสอบต้องไล่หาสองที่ */
    if (body.action === 'attach') {
      if (who.anonymous && !body.code) throw new Error('ไม่ได้ระบุฟอร์ม');
      return json_({ ok: true, result: attach_(body, who) });
    }

    /* ลงทะเบียนใบที่ยังไม่จบ — ผู้โดยสารเป็น anonymous ก็เรียกได้
       ไม่เขียน PDF ไม่เขียน Records แตะแค่ดัชนีสถานะ */
    if (body.action === 'register') {
      return json_({ ok: true, result: registerPending_(body) });
    }

    var out = exportSubmission_(body.submission, who);
    return json_({ ok: true, result: out });
  } catch (err) {
    return json_({ ok: false, error: String(err && err.message || err) });
  }
}

/* ── จุดถามสถานะสำหรับระบบภายนอก ────────────────────────────
   GET ?api=pwr&ref=A1B2C3D4,B2C3D4E5&key=<ความลับ>

   คืนเฉพาะสถานะกับเวลา ไม่มีชื่อ ไม่มีเลขบัตร ไม่มีอีเมล — ระบบที่ถามมี
   รายชื่อผู้โดยสารของตัวเองอยู่แล้ว ส่ง PII กลับไปอีกไม่ได้เพิ่มอะไร
   นอกจากทำให้ข้อมูลอ่อนไหวอยู่สองที่

   key ต้องมาจาก Script Property PWR_STATUS_KEY — ไม่ได้ตั้ง = ปิดสนิท
   ไม่ใช่เปิดโล่ง ผู้เรียกเป็น backend ของอีกฝั่ง (UrlFetchApp) ความลับจึงเก็บได้จริง
   ถ้าเรียกจากเบราว์เซอร์ ความลับจะอยู่ใน bundle แล้วไม่มีความหมาย */
var API_MAX_REF_ = 50;

function doGet(e) {
  var q = (e && e.parameter) || {};
  if (!q.api) {
    return json_({ ok: true, service: 'D-0507 Forms exporter', at: new Date().toISOString() });
  }
  try {
    if (String(q.api).toLowerCase() !== 'pwr') throw new Error('ไม่รู้จัก api นี้');
    var want = PropertiesService.getScriptProperties().getProperty('PWR_STATUS_KEY');
    if (!want) throw new Error('ยังไม่ได้เปิดใช้งาน');
    if (String(q.key || '') !== want) throw new Error('ไม่ได้รับอนุญาต');

    var refs = String(q.ref || '').split(',')
      .map(function (x) { return x.trim(); })
      .filter(function (x) { return x.length > 0 && x.length <= 64; });
    if (!refs.length) throw new Error('ต้องระบุ ref อย่างน้อยหนึ่งตัว');
    if (refs.length > API_MAX_REF_) {
      throw new Error('ถามได้ครั้งละไม่เกิน ' + API_MAX_REF_ + ' ref');
    }

    var sh = indexSheet_('PWR');
    var rows = sh.getLastRow() > 1
      ? sh.getRange(2, 1, sh.getLastRow() - 1, IDX_HEAD_.length).getValues() : [];
    var by = {};
    rows.forEach(function (r) { by[String(r[0])] = r; });

    var out = {};
    refs.forEach(function (ref) {
      var r = by[ref];
      if (!r) { out[ref] = { ref: ref, status: 'none' }; return; }
      out[ref] = {
        ref: ref,
        tracking: String(r[1] || ''),
        status: String(r[2] || 'none'),
        submittedAt: r[3] ? new Date(r[3]).toISOString() : null,
        signedAt: r[4] ? new Date(r[4]).toISOString() : null,
        pdfUrl: String(r[5] || '') || null,
      };
    });
    return json_({ ok: true, result: out });
  } catch (err) {
    return json_({ ok: false, error: String(err && err.message || err) });
  }
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

/** เปิดหรือสร้างชีตชื่อ name ในโฟลเดอร์ พร้อมหัวคอลัมน์ */
function recordSheet_(folder, name, headers) {
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

/* ── ดัชนีสถานะสำหรับระบบภายนอก ──────────────────────────────
   ระบบวางแผนการบินต้องรู้ว่าผู้โดยสารคนไหนเซ็นแล้ว แต่มันไม่มีทางรู้เลขที่ของเรา
   (ผู้โดยสารกรอกในเบราว์เซอร์ตัวเอง แอปนั้นไม่เห็นผลลัพธ์) ใบจึงพก ref ของมันเข้ามา
   แล้วถามกลับด้วย ref

   ทำไมต้องมีชีตนี้แยกจาก "<ABBR> — Records": Records เขียนตอนใบ "จบ" เท่านั้น
   PWR มีสองขั้น (ผู้โดยสารเซ็น แล้ว HT เซ็น) ช่วงรอ HT ใบอยู่ใน Firestore ที่เดียว
   ตัวส่งออกมองไม่เห็น ถ้าตอบจาก Records อย่างเดียว คนที่กรอกเสร็จแล้วจะถูกรายงานว่า
   "ยังไม่กรอก" แล้วเจ้าหน้าที่จะไปตามคนที่ทำเสร็จแล้ว

   ชีตนี้จึงเป็นแหล่งข้อมูลที่สอง ซึ่งมีโอกาสเพี้ยนจาก Firestore ได้
   ทิศทางที่ยอมให้เพี้ยนคือ "ยังไม่กรอก" เสมอ — รายงานว่าเสร็จทั้งที่ยังไม่เสร็จ
   อันตรายกว่ามาก เพราะจะมีคนขึ้นเครื่องโดยไม่มีหนังสือสละสิทธิ์ */
var IDX_HEAD_ = ['ref', 'tracking', 'status', 'submittedAt', 'signedAt', 'pdfUrl'];

function indexSheet_(abbr) {
  var folder = subFolder_(abbr);
  var r = recordSheet_(folder, abbr + ' — Index', IDX_HEAD_);   // ชื่อเต็ม ไม่ใช่ตัวย่อ
  return r.sh;
}

/** หาแถวของ ref (คืนเลขแถวจริงในชีต หรือ 0 ถ้าไม่มี) */
function indexRow_(sh, ref) {
  if (sh.getLastRow() < 2) return 0;
  var col = sh.getRange(2, 1, sh.getLastRow() - 1, 1).getValues();
  for (var i = 0; i < col.length; i++) {
    if (String(col[i][0]) === String(ref)) return i + 2;
  }
  return 0;
}

/** ผู้โดยสารกดส่ง — ยังไม่จบ แต่ต้องให้ระบบภายนอกเห็นว่ากรอกแล้ว */
function registerPending_(body) {
  var abbr = String(body.formCode || '').replace(/[^A-Za-z0-9\-]/g, '');
  var ref = String(body.ref || '').trim();
  var trk = String(body.tracking || '').trim();
  if (!abbr || !ref || !trk) throw new Error('register ต้องมี formCode, ref และ tracking');
  if (ref.length > 64) throw new Error('ref ยาวเกินไป');

  var sh = indexSheet_(abbr);
  var row = indexRow_(sh, ref);
  if (row) {
    // ยิงซ้ำ หรือผู้โดยสารกรอกใหม่ทับของเดิม — เขียนทับเฉพาะที่ยังไม่จบ
    if (String(sh.getRange(row, 3).getValue()) === 'complete') {
      return { ref: ref, status: 'complete', note: 'มีใบที่จบแล้วสำหรับ ref นี้ ไม่เขียนทับ' };
    }
    sh.getRange(row, 2, 1, 3).setValues([[trk, 'pending', new Date()]]);
  } else {
    sh.appendRow([ref, trk, 'pending', new Date(), '', '']);
  }
  return { ref: ref, tracking: trk, status: 'pending' };
}

/** HT เซ็นแล้ว ใบจบ — เลื่อนสถานะในดัชนีให้ตรง */
function indexComplete_(abbr, ref, trk, pdfUrl) {
  if (!ref) return;
  var sh = indexSheet_(abbr);
  var row = indexRow_(sh, ref);
  if (!row) { sh.appendRow([ref, trk, 'complete', '', new Date(), pdfUrl || '']); return; }
  sh.getRange(row, 2).setValue(trk);
  sh.getRange(row, 3).setValue('complete');
  sh.getRange(row, 5).setValue(new Date());
  sh.getRange(row, 6).setValue(pdfUrl || '');
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
  var r = recordSheet_(folder, abbr + ' — Records', base.concat(extra));
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

  // ใบที่พก ref ของระบบอื่นมา ต้องบอกระบบนั้นว่าจบแล้ว ไม่งั้นบอร์ดจะค้างเหลืองตลอดไป
  var ref = (s.data || {}).ref;
  if (ref) {
    try { indexComplete_(abbr, ref, s.tracking, pdf ? pdf.getUrl() : ''); }
    catch (err) { /* ใบจบไปแล้ว ดัชนีพลาดไม่ควรทำให้การส่งออกล้ม */ }
  }

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
        /* ชื่อวิชาพร้อมผล — กระดาษมีคอลัมน์เดียวสำหรับ "Subject / Course Content"
           จึงต้องรวมชื่อกับผลไว้ในช่องเดียว ให้อ่านได้ว่าผ่านด้วยอะไร

           มีผลสอบท้ายวิชา      → "ชื่อวิชา [(90): pass]"
           ไม่มีผลสอบท้ายวิชา
           แต่สอบท้ายคอร์สผ่าน  → "ชื่อวิชา [Completed]"
           นอกนั้น              → ชื่อวิชาเปล่า ๆ ไม่เติมอะไรที่ไม่มีหลักฐานรองรับ */
        out[k + '_' + (i + 1) + '_shown'] = rowShown_(row, data);
        out[k + '_' + (i + 1) + '_mark'] = rowMark_(row, data);
      });
      out[k] = v.length;                       // ไว้ใช้เป็นจำนวนแถวที่กรอกจริง
      return;
    }
    if (Array.isArray(v)) { out[k] = v.join(', '); return; }

    /* ไฟล์แนบ — ในเอกสารต้องเห็น "ชื่อไฟล์" ไม่ใช่ id หรือขนาด
       ถ้าปล่อยให้ตกไปเข้าเงื่อนไข checklist ข้างล่าง จะได้ข้อความแบบ
       id=1AbC · name=report.pdf · size=204800 พิมพ์ลงเอกสารควบคุม */
    if (v && typeof v === 'object' && v.id && v.name) {
      out[k] = v.name;
      out[k + '_url'] = v.url || '';
      out[k + '_id'] = v.id;
      return;
    }

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

    /* ขยายตารางตามจำนวนข้อมูลก่อนแทนค่า — ตารางใน Word ขยายเองไม่ได้
       แต่ Apps Script แทรกแถวตอนสร้างเอกสารได้ แม่แบบจึงมีแถวตัวอย่างแค่แถวเดียว */
    expandRows_(b, data);

    parts.forEach(function (part) {
      Object.keys(all).forEach(function (k) {
        part.replaceText('\\{\\{' + k + '\\}\\}', String(all[k]));
      });
      // ช่องติ๊กที่ผู้กรอกไม่ได้แตะเลยจะไม่มีใน data — ต้องเป็น ☐ ไม่ใช่ช่องว่าง
      part.replaceText('\\{\\{k_[a-zA-Z0-9_\\-]+\\}\\}', '☐');
      part.replaceText('\\{\\{[a-zA-Z0-9_]+\\}\\}', '');   // token อื่นที่เหลือให้ว่างไว้
    });
    overflowNote_(b, data);
    dropEmptyRows_(b);
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


/**
 * รับไฟล์แนบเข้าโฟลเดอร์ของฟอร์มนั้น — คืนข้อมูลย่อไว้เก็บในใบ
 *
 * เก็บแค่ id/ชื่อ/ขนาดไว้ใน Firestore ตัวไฟล์อยู่ Drive ที่เดียวกับ PDF ของใบ
 * ตั้งชื่อไฟล์นำหน้าด้วยรหัสฟอร์มและเวลา จะได้เรียงตามลำดับและไม่ทับกัน
 */
function attach_(body, who) {
  var MAX = 12 * 1024 * 1024;                 // 12 MB — เผื่อ base64 พองขึ้น ~33%
  var name = String(body.name || 'attachment');
  var b64 = String(body.b64 || '');
  if (!b64) throw new Error('ไม่มีข้อมูลไฟล์');

  var bytes = Utilities.base64Decode(b64);
  if (bytes.length > MAX)
    throw new Error('ไฟล์ใหญ่เกิน ' + Math.round(MAX / 1048576) + ' MB (ได้มา ' +
                    Math.round(bytes.length / 1048576 * 10) / 10 + ' MB)');

  var code = String(body.code || 'MISC').replace(/[^A-Za-z0-9_-]/g, '');
  var folder = subFolder_(code);
  var sub = folder.getFoldersByName('Attachments');
  sub = sub.hasNext() ? sub.next() : folder.createFolder('Attachments');

  var stamp = Utilities.formatDate(new Date(), 'Asia/Bangkok', 'yyyyMMdd-HHmmss');
  var safe = name.replace(/[\\\/:*?"<>|]/g, '-').slice(0, 120);
  var blob = Utilities.newBlob(bytes, body.mime || 'application/octet-stream',
                               code + '-' + stamp + '-' + safe);
  var f = sub.createFile(blob);
  try {
    f.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  } catch (e) {
    // บางบัญชีปิดการแชร์แบบลิงก์ไว้ — ไฟล์ยังอยู่ เจ้าหน้าที่เปิดผ่าน Drive ได้
  }
  Logger.log('แนบไฟล์ %s (%s ไบต์) โดย %s', f.getName(), bytes.length, who.email || 'anonymous');
  return { id: f.getId(), name: name, size: bytes.length, url: f.getUrl() };
}


/**
 * ชื่อวิชาพร้อมผลสอบ สำหรับคอลัมน์เดียวบนกระดาษ
 *
 * ── ทำไมต้องเป็นรายการที่อนุญาต ไม่ใช่การอนุมานจากคะแนน ──────
 * TrainHub ส่ง result มา 5 สถานะ และสองในนั้นมาพร้อม score เป็น null เหมือนกัน
 *   Completed  วิชานี้ไม่มีชุดข้อสอบของตัวเอง และดูวิดีโอครบแล้ว
 *   รอสอบ      มีข้อสอบ ดูวิดีโอครบ แต่ยังไม่ได้สอบเลยสักครั้ง
 *
 * ถ้าตัดสินจาก "ไม่มีคะแนน" อย่างเดียว รอสอบ จะถูกพิมพ์เป็น [Completed]
 * กลายเป็นบันทึกว่าเรียนจบวิชานั้นแล้ว ทั้งที่ยังไม่เคยสอบ
 * เป็นเอกสารที่ CAAT ตรวจ จึงต้องดูค่าที่ระบบต้นทางบอกมาตรง ๆ เท่านั้น
 *
 * สถานะที่ไม่รู้จักตกไปที่ "ชื่อวิชาเปล่า" เสมอ — ถ้า TrainHub เพิ่มสถานะใหม่
 * แล้วไม่มีใครบอก เอกสารจะเงียบไว้ ดีกว่าพิมพ์สิ่งที่ไม่จริง
 */
function rowShown_(row, data) {
  var name = String((row || {}).subject || (row || {}).learner || '').trim();
  if (!name) return '';
  var m = rowMark_(row, data);
  return m ? name + ' ' + m : name;
}

/**
 * เฉพาะส่วนผลสอบ สำหรับคอลัมน์ที่สองของตาราง — คืน '' เมื่อไม่มีผลที่ยืนยันได้
 *
 * ── ทำไมต้องเป็นรายการที่อนุญาต ไม่ใช่การอนุมานจากคะแนน ──────
 * TrainHub ส่ง result มา 5 สถานะ และสองในนั้นมาพร้อม score เป็น null เหมือนกัน
 *   Completed  วิชานั้นไม่มีชุดข้อสอบของตัวเอง และดูวิดีโอครบแล้ว
 *   รอสอบ      มีข้อสอบ ดูวิดีโอครบ แต่ยังไม่เคยสอบเลยสักครั้ง
 *
 * ถ้าตัดสินจาก "ไม่มีคะแนน" อย่างเดียว รอสอบ จะถูกพิมพ์เป็น [Completed]
 * กลายเป็นบันทึกว่าเรียนจบวิชานั้นแล้ว ทั้งที่ยังไม่เคยสอบ
 * เป็นเอกสารที่ CAAT ตรวจ จึงต้องดูค่าที่ระบบต้นทางบอกมาตรง ๆ เท่านั้น
 *
 * สถานะที่ไม่รู้จักคืนค่าว่างเสมอ — ถ้า TrainHub เพิ่มสถานะใหม่แล้วไม่มีใครบอก
 * ช่องผลจะว่างไว้ ดีกว่าพิมพ์สิ่งที่ไม่จริง
 */
function rowMark_(row, data) {
  row = row || {}; data = data || {};
  var res = String(row.result || '').trim();
  var sc = row.score;
  var hasScore = sc !== null && sc !== undefined && sc !== '';

  /* สถานะที่ต้นทางบอกว่ายังไม่จบ — ไม่พิมพ์อะไรเลย ต้องเช็กก่อนทุกกรณี
     รวมถึงกรณีที่มีเกรดติดมาแล้ว แต่ระบบยังถือว่ายังไม่จบ */
  if (/^(รอสอบ|ยังไม่จบ)$/.test(res)) return '';

  /* เกรดตัวอักษร A–F จากระบบบันทึกการฝึกภาคอากาศ (FTMS)
     เกณฑ์ผ่านที่เจ้าของงานกำหนด: C ขึ้นไปถือว่าผ่าน
     ที่นั่นไม่มีช่องผ่าน/ไม่ผ่านแยกต่างหาก เกรดคือผลโดยตรง จึงตัดสินจากเกรดได้
     ต่างจากฝั่ง TrainHub ที่เป็นเปอร์เซ็นต์และมีช่องผลมาให้ */
  var L = String(sc == null ? '' : sc).trim().toUpperCase();
  if (/^[A-F]$/.test(L)) return '[(' + L + '): ' + ('ABC'.indexOf(L) >= 0 ? 'pass' : 'fail') + ']';

  if (res === 'ผ่าน')    return hasScore ? '[(' + sc + '): pass]' : '[pass]';
  if (res === 'ไม่ผ่าน')  return hasScore ? '[(' + sc + '): fail]' : '[fail]';
  if (/^completed$/i.test(res)) return '[Completed]';

  /* ไม่มีผลจากต้นทางเลย (แถวที่คนกรอกเองจากรายวิชาที่ระบบเติมให้)
     ใช้กติกาที่เจ้าของงานกำหนด — จบด้วยการสอบท้ายคอร์ส/ท้ายขั้นที่ผ่านแล้ว */
  if (!res && !hasScore) {
    var ct = String(data.examType || '');
    var done = (ct === 'endcourse' || ct === 'endflight' || ct === 'stage')
               && String(data.result || '') === 'passed';
    return done ? '[Completed]' : '';
  }
  return '';                          // สถานะที่ยังไม่รู้จัก
}


/**
 * ลบแถวตารางที่ว่างเปล่าหลังแทนค่าแล้ว
 *
 * ตารางใน Word ขยายเองไม่ได้ แม่แบบจึงต้องเผื่อแถวไว้เกินจำนวนจริง
 * (EFC เผื่อ 18 แถวสำหรับรายวิชา แต่หลักสูตรส่วนใหญ่มี 5–15 วิชา)
 * ถ้าไม่ลบ จะได้เอกสารที่มีแถวว่างต่อท้ายทุกใบ ดูเหมือนกรอกไม่ครบ
 *
 * ลบเฉพาะแถวที่ "ทุกช่องว่างหมด" — แถวที่มีข้อความคงที่อย่างหัวตาราง
 * หรือช่องติ๊ก ☐ ที่ยังไม่ได้ติ๊ก จะไม่ถูกแตะ เพราะไม่ได้ว่าง
 * เก็บอย่างน้อยหนึ่งแถวไว้เสมอ ตารางที่ไม่มีแถวเลยทำให้เอกสารเสีย
 */
function dropEmptyRows_(body) {
  var tables = body.getTables(), gone = 0;
  for (var t = 0; t < tables.length; t++) {
    var tb = tables[t];
    for (var r = tb.getNumRows() - 1; r >= 1; r--) {
      if (tb.getNumRows() <= 1) break;
      var row = tb.getRow(r), blank = true;
      for (var c = 0; c < row.getNumCells(); c++) {
        if (row.getCell(c).getText().replace(/\s/g, '') !== '') { blank = false; break; }
      }
      if (blank) { tb.removeRow(r); gone++; }
    }
  }
  if (gone) Logger.log('ลบแถวว่างในเอกสาร %s แถว', gone);
}


/**
 * เตือนเมื่อข้อมูลมีมากกว่าที่กระดาษรองรับ
 *
 * ตารางใน Word ขยายเองไม่ได้ แม่แบบเผื่อแถวไว้จำนวนหนึ่ง (EFC เผื่อ 18 แถว)
 * ถ้าหลักสูตรไหนมีวิชามากกว่านั้น แถวส่วนเกินจะไม่ถูกพิมพ์ และไม่มีอะไรบอก
 * เอกสารจะดูสมบูรณ์ทั้งที่ขาดข้อมูล ซึ่งอันตรายกว่าเอกสารที่ขาดแล้วรู้ตัว
 *
 * นับ token ที่แม่แบบมีจริง เทียบกับจำนวนแถวข้อมูล แล้วเขียนบรรทัดเตือนลงเอกสาร
 * ให้คนที่เปิดอ่านเห็น ไม่ใช่แค่ขึ้นใน log ที่ไม่มีใครดู
 */
function overflowNote_(body, data) {
  var txt = body.getText();
  Object.keys(data || {}).forEach(function (k) {
    var v = data[k];
    if (!Array.isArray(v) || !v.length || typeof v[0] !== 'object') return;
    var slots = 0;
    for (var i = 1; i <= 200; i++) {
      if (txt.indexOf('{{' + k + '_' + i + '_') >= 0) slots = i; else if (i > 1) break;
    }
    if (!slots || v.length <= slots) return;
    var over = v.length - slots;
    body.appendParagraph('⚠️ มีข้อมูลเกินที่เอกสารรองรับ ' + over + ' รายการ ' +
      '(ตาราง ' + k + ' มี ' + v.length + ' แถว แต่แบบฟอร์มพิมพ์ได้ ' + slots + ') ' +
      '— ต้องแนบต่อท้ายหรือขยายแบบฟอร์ม')
      .setAttributes({ FOREGROUND_COLOR: '#B42318', BOLD: true, FONT_SIZE: 9 });
    Logger.log('🔴 %s มี %s แถว เกินที่แม่แบบรองรับ %s', k, v.length, slots);
  });
}


/**
 * ขยายตารางให้มีแถวเท่าจำนวนข้อมูลจริง — เรียกก่อนแทนค่า token
 *
 * ── ทำไมถึงทำแบบนี้ ─────────────────────────────────────────
 * ตารางใน Word ขยายเองไม่ได้ วิธีเดิมคือเผื่อแถวไว้ในแม่แบบ (EFC เผื่อ 18)
 * แล้วลบแถวที่ไม่ได้ใช้ทิ้ง ซึ่งมีเพดานตายตัว หลักสูตรที่ยาวกว่านั้นจะขาด
 *
 * Apps Script แทรกแถวตอนสร้างเอกสารได้ แม่แบบจึงเก็บแถวตัวอย่างไว้แถวเดียว
 * ที่เขียน {{key_1_...}} แล้วให้ตัวนี้ทำสำเนาเป็น {{key_2_...}} ไปจนครบจำนวนข้อมูล
 * ได้ตารางที่ยาวเท่าที่ข้อมูลมีจริง ไม่มีเพดาน ไม่มีแถวว่างเหลือ
 *
 * สำเนามาจากแถวเดิม รูปแบบ เส้นขอบ ความกว้างคอลัมน์จึงเหมือนกันทั้งหมด
 */
function expandRows_(body, data) {
  var TOK = /\{\{([A-Za-z0-9]+)_1_([A-Za-z0-9]+)\}\}/;
  var tables = body.getTables();
  for (var t = 0; t < tables.length; t++) {
    var tb = tables[t];
    for (var r = 0; r < tb.getNumRows(); r++) {
      var row = tb.getRow(r), txt = row.getText(), m = txt.match(TOK);
      if (!m) continue;
      var key = m[1], arr = data ? data[key] : null;
      if (!Array.isArray(arr) || arr.length < 2) continue;

      /* แม่แบบที่เผื่อแถวไว้แล้ว (มี {{key_2_...}} เขียนไว้ในเอกสาร) ห้ามขยาย
         ไม่งั้นจะได้แถวสำเนาทับซ้อนกับแถวที่มีอยู่ ข้อมูลชุดเดียวโผล่สองรอบ
         ของจริงที่ต้องกัน: DRC เผื่อ 8 แถว · MOC เผื่อ 3–5 แถวในสี่ตาราง
         แม่แบบพวกนั้นใช้วิธีเดิมคือลบแถวว่างทิ้งตอนท้าย ซึ่งยังทำงานได้ปกติ */
      if (body.getText().indexOf('{{' + key + '_2_') >= 0) continue;

      // แทรกจากท้ายมาหน้า ตำแหน่งของแถวต้นแบบจึงไม่ขยับระหว่างทาง
      for (var i = arr.length; i >= 2; i--) {
        var copy = tb.insertTableRow(r + 1, row.copy());
        copy.replaceText('\\{\\{' + key + '_1_', '{{' + key + '_' + i + '_');
      }
      Logger.log('ขยายตาราง %s เป็น %s แถว', key, arr.length);
      r += arr.length - 1;            // ข้ามแถวที่เพิ่งสร้าง
    }
  }
}
