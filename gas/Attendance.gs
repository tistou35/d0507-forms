/**
 * ใบสรุปการเข้าเรียนของคาบ (D-0507-ARF-001 · TM 1.2.2)
 *
 * ผู้เข้าเรียนลงชื่อรายคนผ่าน QR (ใบ ARF หนึ่งคนหนึ่งใบ ลงแค่แถวในชีต ไม่มี PDF รายคน)
 * เอกสารของคาบคือใบนี้ — ข้อมูลคาบ รายชื่อผู้ลงชื่อพร้อมเวลาและลายเซ็น และครูรับรอง
 * หน้าตาตามฉบับกระดาษ D-0507-ARF-001.docx (tools/build_arf.py)
 *
 * อ่านทุกอย่างจาก Firestore ด้วย token ของผู้เรียก ไม่รับเนื้อหาจากหน้าเว็บ
 * ทำได้เฉพาะครูผู้เปิดคาบหรือผู้ดูแลระบบ และเฉพาะคาบที่ปิดแล้ว (รายชื่อไม่ขยับอีก)
 */
function attPdf_(body, who) {
  var id = String(body.sessionId || '');
  if (!/^[A-Za-z0-9_-]{6,64}$/.test(id)) throw new Error('รหัสคาบไม่ถูกต้อง');
  var ses = fsGet_('attSessions/' + id, body.idToken);
  ses.id = id;
  var admins = {};
  try { admins = fsGet_('config/admins', body.idToken); } catch (e) {}
  if (ses.insUid !== who.uid && (admins.uids || []).indexOf(who.uid) < 0)
    throw new Error('ออกใบสรุปได้เฉพาะครูผู้เปิดคาบหรือผู้ดูแลระบบ');
  if (ses.status !== 'closed') throw new Error('ต้องปิดคาบก่อน');

  var rows = attRows_(id, body.idToken);
  // คาบทดสอบขึ้นต้น TEST- ให้ dropTest เก็บกวาดได้เหมือนใบทดสอบอื่น
  var name = (ses.test ? 'TEST-' : '') + 'ARF-' + String(ses.sesDate || '').replace(/-/g, '') + '-' +
             id.slice(0, 6).toUpperCase() + '.pdf';
  var folder = subFolder_('ARF');
  var old = folder.getFilesByName(name);
  while (old.hasNext()) old.next().setTrashed(true);
  var pdf = folder.createFile(Utilities.newBlob(attHtml_(ses, rows), 'text/html', 'x.html')
    .getAs('application/pdf').setName(name));
  return { id: pdf.getId(), url: pdf.getUrl(), name: name, count: rows.length };
}

/* ใบลงชื่อของคาบ เรียงตามเวลาลงชื่อ */
function attRows_(id, idToken) {
  var url = 'https://firestore.googleapis.com/v1/projects/' + cfg_('FIREBASE_PROJECT') +
            '/databases/(default)/documents:runQuery';
  var res = UrlFetchApp.fetch(url, { method: 'post', contentType: 'application/json', muteHttpExceptions: true,
    headers: { Authorization: 'Bearer ' + idToken },
    payload: JSON.stringify({ structuredQuery: { from: [{ collectionId: 'submissions' }],
      where: { fieldFilter: { field: { fieldPath: 'sessionId' }, op: 'EQUAL', value: { stringValue: id } } } } }) });
  if (res.getResponseCode() !== 200) throw new Error('อ่านรายชื่อผู้ลงชื่อไม่ได้ (' + res.getResponseCode() + ')');
  return JSON.parse(res.getContentText()).filter(function (r) { return r.document; })
    .map(function (r) { return fsFields_(r.document.fields || {}); })
    .sort(function (a, b) { return String(a.submittedAt).localeCompare(String(b.submittedAt)); });
}

function attHtml_(ses, rows) {
  var esc = function (x) {
    return String(x === undefined || x === null ? '' : x)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  };
  var tz = 'Asia/Bangkok';
  var hm = function (t) { return t ? Utilities.formatDate(new Date(t), tz, 'HH:mm') : ''; };
  var img = function (v) { return /^data:image\//.test(String(v || '')) ? '<img src="' + v + '">' : ''; };
  var MODE = { classroom: 'Classroom', video: 'Video call', elearning: 'E-learning' };
  var TYPE = { STUDENT: 'Student', STAFF: 'Staff', OTHER: 'Other' };
  var out = {};
  (ses.excluded || []).forEach(function (x) { out[x.uid] = true; });
  var code = 'IM-ARF-301-B', iss = 'ISSUE NO. 01/REVISION NO. 01', eff = '10 NOV 2026';

  var box = function (on, label) { return (on ? '☒' : '☐') + '&nbsp;' + label; };
  var kept = 0;
  var trs = rows.map(function (r, i) {
    var d = r.data || {}, x = out[r.submitterUid];
    if (!x) kept++;
    return '<tr' + (x ? ' class="x"' : '') + '><td class="c">' + (i + 1) + '</td><td>' + esc(d.attName || r.submitterName) +
      (r.guest ? '<div class="gn">ลงชื่อโดยไม่เข้าสู่ระบบ · Signed without an account</div>' : '') +
      (x ? '<div class="xn">ครูไม่รับรอง · Not certified by instructor</div>' : '') + '</td>' +
      '<td class="c">' + esc(TYPE[d.attType] || d.attType || '') + '</td><td class="c">' + esc(hm(r.submittedAt)) +
      '</td><td class="s">' + img(d.attSign) + '</td></tr>';
  }).join('') || '<tr><td colspan="5" class="c" style="color:#999">ไม่มีผู้ลงชื่อ · No attendees</td></tr>';

  return '<html><head><meta charset="utf-8"><style>' +
    '@page{size:A4;margin:14mm 16mm}' +
    'body{font-family:Arial,Helvetica,sans-serif;font-size:8.5pt;color:#1a1a1a;margin:0}' +
    '.hd{display:table;width:100%;background:#f5f5f5}.hd>div{display:table-cell;padding:6px 8px;vertical-align:top}' +
    '.co{font-size:10pt;font-weight:bold;color:#1F3864}.g{color:#777;font-size:7.5pt}.r{text-align:right}' +
    // ตัวแปลง HTML → PDF ของ Drive ทิ้งสีพื้น แถบหัวข้อจึงใช้ตัวอักษรสีกรมกับเส้นใต้แทนพื้นกรม
    '.band{color:#1F3864;font-size:13pt;font-weight:bold;padding:6px 0 3px;margin-top:8px;border-bottom:3px solid #1F3864}' +
    '.bsub{color:#2E75B6;font-size:8pt;padding:3px 0}' +
    '.sec{color:#1F3864;font-size:9pt;font-weight:bold;padding:3px 0;margin-top:10px;border-bottom:1.5px solid #1F3864}' +
    'table{width:100%;border-collapse:collapse}td,th{border:1px solid #bfbfbf;padding:4px 6px;vertical-align:middle;font-size:9pt}' +
    'td.l,th{background:#f5f5f5;color:#777;font-size:7.5pt;font-weight:bold;text-align:left}' +
    'td.c{text-align:center}td.s{height:30px;text-align:center}td.s img{max-height:28px;max-width:100%}' +
    'tr.x td{color:#999;text-decoration:line-through}.xn{text-decoration:none;color:#b42318;font-size:7pt}' +
    '.gn{color:#9a6700;font-size:7pt}' +
    '.decl{background:#D6E4F7;color:#555;font-style:italic;padding:6px 8px;margin-top:6px}' +
    '.cert{page-break-inside:avoid}.cert td.s{height:46px}.cert td.s img{max-height:44px}' +
    '.ft{margin-top:12px;color:#777;font-size:6.5pt;border-top:1px solid #ddd;padding-top:4px}' +
    '</style></head><body>' +
    '<div class="hd"><div><div class="co">D-0507 Flight Training Co., Ltd.</div><div class="g">Approved Training Organisation (ATO)</div></div>' +
    '<div class="r g">' + code + '&nbsp;&nbsp;&nbsp;EFF: ' + eff + '<br><i>' + iss + '<br>Instruction (IM) · TM 1.2.2</i></div></div>' +
    '<div class="band">ATTENDANCE RECORD</div>' +
    '<div class="bsub">One sheet per session · Attendees signed online at the end of the session (QR) · Time = server time of signing</div>' +
    '<div class="sec">SESSION DETAILS</div><table>' +
    '<tr><td class="l">Course</td><td>' + esc(ses.course) + '</td><td class="l">Subject / Lesson</td><td>' + esc(ses.subject) + '</td></tr>' +
    '<tr><td class="l">Topic / Content covered</td><td colspan="3">' + esc(ses.topic) + '</td></tr>' +
    '<tr><td class="l">Date</td><td>' + esc(docDate_(ses.sesDate)) + '</td><td class="l">Time From – To · Duration</td><td>' +
      esc((ses.sesStart || '') + ' – ' + (ses.sesEnd || '')) + (ses.hours ? ' · ' + esc(ses.hours) + ' hrs' : '') + '</td></tr>' +
    '<tr><td class="l">Delivery</td><td>' + ['classroom', 'video', 'elearning'].map(function (k) { return box(ses.mode === k, MODE[k]); }).join('&nbsp;&nbsp; ') +
      '</td><td class="l">Location / Platform</td><td>' + esc(ses.location) + '</td></tr>' +
    '<tr><td class="l">Instructor Name</td><td>' + esc(ses.insName) + '</td><td class="l">Instructor Position</td><td>' + esc(ses.insPos) + '</td></tr>' +
    '</table>' +
    '<div class="sec">ATTENDEES</div><table><tr><th style="width:6%">No.</th><th style="width:37%">Attendee Name</th>' +
    '<th style="width:17%">Student / Staff / Other</th><th style="width:12%">Time</th><th>Signature</th></tr>' + trs + '</table>' +
    '<div class="cert"><div class="sec">INSTRUCTOR CERTIFICATION</div>' +
    '<div class="decl">I certify that the persons listed above attended this session in full, except any entry marked as not certified.</div>' +
    '<table style="margin-top:4px"><tr><th style="width:45%">Instructor Signature</th><th>Date</th><th>Total Attendees</th></tr>' +
    '<tr><td class="s">' + img(ses.insSign) + '<div>' + esc(ses.insName) + '</div></td><td class="c">' +
      esc(ses.closedAt ? Utilities.formatDate(new Date(ses.closedAt), tz, 'dd MMM yyyy HH:mm').toUpperCase() : '') +
      '</td><td class="c">' + kept + '</td></tr></table></div>' +
    '<div class="ft">D-0507 Flight Training Co., Ltd. | ATTENDANCE RECORD | ' + code + ' ' + iss + ' EFF: ' + eff +
      ' | Session ' + esc(ses.id || '') + ' · issued by the D-0507 Forms system | Controlled Copy — Uncontrolled when printed</div>' +
    '</body></html>';
}
