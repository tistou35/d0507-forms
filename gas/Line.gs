/**
 * แจ้งเตือนผ่าน LINE
 *
 * แบบเดียวกับ D0507 Dispatch (ARCHIVE › NOTIFICATIONS):
 *   - ส่งผ่าน LINE Official Account ของโรงเรียน ทีละคน (push) ไม่ใช่กลุ่ม
 *     แต่ละคนได้เฉพาะเรื่องของตัวเอง เอาใครออกคือลบแถวเดียวในหน้าตั้งค่า
 *   - token อยู่ใน Script Property LINE_CHANNEL_ACCESS_TOKEN เท่านั้น
 *     ห้ามอยู่ในหน้าเว็บที่นักเรียนเปิดอ่านซอร์สได้
 *   - ยังไม่มี token / ยังไม่เปิดส่งจริง = ไม่มีอะไรออกจากระบบ แต่ทุกข้อความที่ "จะส่ง"
 *     ลงบันทึก (lineLog) พร้อมเหตุผล พอเปิดใช้ก็ไม่มีกองค้างยิงย้อนหลัง
 *     เพราะทุกสายนับต่อจากจุดที่ตรวจไปแล้ว
 *
 * ต่างจาก Dispatch ตรงที่ไม่ได้ให้เบราว์เซอร์เป็นคนส่ง — ตัวตั้งเวลาของสคริปต์อ่าน Firestore เอง
 * ด้วยสิทธิ์เจ้าของสคริปต์ (adminHeaders_ ใน Password.gs) ใบส่งจากเครื่องไหนก็แจ้งได้
 *
 *   lineTick  ทุก 1 นาที  เหตุการณ์ที่เพิ่งเกิด
 *             task · pool · ack     งานใหม่ใน tasks
 *             nobody                งานเข้ากองรอที่ไม่มีใครถือตำแหน่ง → ผู้ดูแล
 *             result                ใบที่ฉันส่ง อนุมัติ / ไม่อนุมัติ → ผู้ส่ง
 *             frae                  FRAE NO-GO หรือคะแนนถึงเกณฑ์ → CFI + ผู้ดูแล
 *             safety                VSR · HIF เข้ามา → SM + ผู้ดูแล (ไม่มีชื่อผู้รายงาน)
 *             signup                ผู้ใช้สมัครเองเข้ามาใหม่ → ผู้ดูแล
 *             memoNo                บันทึกข้อความไม่อนุมัติ → ผู้จัดทำ + ผู้เสนอ
 *   lineDaily ทุกวัน 08:00 (เวลาไทย)
 *             overdue               งานค้างเกิน N วัน → คนที่งานค้างอยู่ (รวมเป็นข้อความเดียวต่อคน)
 *             weekly                วันจันทร์ สรุปงานค้างทั้งระบบ → ผู้ดูแล + CMM
 *             expiry                หนังสือแต่งตั้ง/มอบหมาย ใกล้หมดอายุ 30 และ 7 วัน → ผู้ได้รับ + HT
 *             ackDue                หนังสือเวียนถึงวันตอบรับแล้วยังไม่รับทราบ → คนที่ยังไม่รับทราบ
 *
 * ที่เก็บ
 *   lineConfig/settings   ค่าตั้ง + LINE user ID รายคน (ผู้ดูแลอ่าน/เขียนเท่านั้น)
 *   lineLog/<id>          บันทึกทุกข้อความ ส่งแล้วหรือไม่ได้ส่ง (ผู้ดูแลอ่านได้ ไม่มีใครแก้)
 *   Script Properties     LINE_CHANNEL_ACCESS_TOKEN · LINE_WATERMARK (เปิดระบบแล้ว) · LINE_LAST · LINE_DAILY_*
 *                         LINE_ST_<สาย>#n/#0.. สถานะของแต่ละสาย · LINE_DONE#n/#0.. เรื่องรายวันที่ส่งแล้ว
 *                         (แบ่งเป็นท่อนละไม่เกิน 8,000 ตัวอักษร — Script Property หนึ่งค่ารับได้ 9 KB)
 */

/* ที่ส่ง push — ตั้งทับได้ด้วย Script Property LINE_MESSAGING_API_PUSH_URL เหมือน Dispatch (LINE เคยย้าย endpoint) */
function linePushUrl_() {
  return PropertiesService.getScriptProperties().getProperty('LINE_MESSAGING_API_PUSH_URL')
    || 'https://api.line.me/v2/bot/message/push';
}
var LINE_OVERLAP_MS = 3 * 60 * 1000;   // อ่านย้อนเผื่อเอกสารที่ commit ช้า กันซ้ำด้วยรายการ ids ของสาย
var LINE_PAGE = 100;                    // เอกสารต่อหน้าของ runQuery
var LINE_MAX_PAGES = 10;                // ต่อสายต่อรอบ — เกินนี้ค้าง cursor ไว้ทำต่อรอบหน้า ไม่ตกหล่น
var LINE_IDS_CAP = 300;                 // ids ในช่วงย้อนที่จำไว้กันซ้ำ เกินนี้ตัดเก่าทิ้งแล้วยกพื้น (lo) ขึ้น
var LINE_LATE_PAGES = Math.ceil(LINE_IDS_CAP / LINE_PAGE) + 1;
var LINE_CHUNK = 8000;                  // ตัวอักษรต่อท่อน (ASCII) · ขีดจำกัด 9 KB ต่อค่า
var LINE_ID_RE = /^U[0-9a-f]{32}$/i;

var LINE_DEFAULTS = {
  enabled: false,
  overdueDays: 3,
  fraeScore: 10,
  events: { task: true, pool: true, ack: true, nobody: true, result: true, frae: true, safety: true,
            signup: true, memoNo: true, overdue: true, weekly: true, expiry: true, ackDue: true },
  templates: {
    task:    'D-0507 · งานใหม่รอคุณ\n[เรื่อง]\nเลขที่ [เลขที่] · จาก [จาก]\n[ลิงก์]',
    pool:    'D-0507 · งานใหม่ในกองรอ [กองรอ]\n[เรื่อง]\nเลขที่ [เลขที่] · จาก [จาก]\nกดรับงาน: [ลิงก์]',
    ack:     'D-0507 · หนังสือเวียนรอรับทราบ\n[เรื่อง]\nเลขที่ [เลขที่]\n[ลิงก์]',
    nobody:  'D-0507 · ⚠ งานเข้ากองรอ [กองรอ] แต่ไม่มีใครถือตำแหน่งนี้\n[เรื่อง]\nเลขที่ [เลขที่] · จาก [จาก]\nโยกงานได้ที่: [ลิงก์]',
    result:  'D-0507 · ใบของคุณ[ผล]\n[เรื่อง]\nเลขที่ [เลขที่] · โดย [โดย]\n[หมายเหตุ]\n[ลิงก์]',
    frae:    'D-0507 · ⚠ FRAE [ตัดสินใจ] · คะแนนความเสี่ยง [คะแนน]\n[นักบิน] · [ทะเบียน] · [วันที่]\nเลขที่ [เลขที่]\n[ลิงก์]',
    safety:  'D-0507 · รายงานนิรภัยใหม่ — [ฟอร์ม]\nเลขที่ [เลขที่]\n[ลิงก์]',
    signup:  'D-0507 · ผู้ใช้ใหม่สมัครเข้ามา ยังเป็นบทบาทนักเรียน\n[ชื่อ] · [อีเมล]\nกำหนดบทบาทได้ที่: [ลิงก์]',
    memoNo:  'D-0507 · บันทึกข้อความไม่อนุมัติ\n[เรื่อง]\nเลขที่ [เลขที่] · โดย [โดย]\n[หมายเหตุ]\n[ลิงก์]',
    overdue: 'D-0507 · งานค้างของคุณ [จำนวน] รายการ\n[รายการ]\n[ลิงก์]',
    weekly:  'D-0507 · สรุปงานค้างประจำสัปดาห์\n[รายการ]\n[ลิงก์]',
    expiry:  'D-0507 · หนังสือ [เลขที่] จะหมดอายุใน [เหลือ] วัน ([วันหมดอายุ])\n[ชื่อ] — [เรื่อง]\n[ลิงก์]',
    ackDue:  'D-0507 · หนังสือเวียนยังไม่ได้รับทราบ (ครบกำหนด [วันที่])\n[เรื่อง]\nเลขที่ [เลขที่]\n[ลิงก์]',
  },
  people: {},
};

function lineToken_() {
  var p = PropertiesService.getScriptProperties();
  return p.getProperty('LINE_CHANNEL_ACCESS_TOKEN') || p.getProperty('LINE_CHANNEL_TOKEN') || '';
}
function linePortal_() {
  return PropertiesService.getScriptProperties().getProperty('PORTAL_URL') || 'https://tistou35.github.io/d0507-forms/';
}

/* ── Firestore ด้วยสิทธิ์เจ้าของสคริปต์ ─────────────────────── */
function lineDb_() { return 'projects/' + cfg_('FIREBASE_PROJECT') + '/databases/(default)/documents'; }
function lineGet_(path) {
  var res = UrlFetchApp.fetch('https://firestore.googleapis.com/v1/' + lineDb_() + '/' + path,
    { headers: adminHeaders_(), muteHttpExceptions: true });
  if (res.getResponseCode() === 404) return null;
  if (res.getResponseCode() !== 200) throw new Error('อ่าน ' + path + ' ไม่ได้ (' + res.getResponseCode() + ')');
  return fsFields_(JSON.parse(res.getContentText()).fields || {});
}
function lineList_(path) {   // เอกสารทั้งหมดในคอลเลกชันย่อย (ใช้กับ acks)
  var out = [], tok = '';
  do {
    var res = UrlFetchApp.fetch('https://firestore.googleapis.com/v1/' + lineDb_() + '/' + path + '?pageSize=300' +
      (tok ? '&pageToken=' + encodeURIComponent(tok) : ''), { headers: adminHeaders_(), muteHttpExceptions: true });
    if (res.getResponseCode() !== 200) throw new Error('อ่าน ' + path + ' ไม่ได้ (' + res.getResponseCode() + ')');
    var j = JSON.parse(res.getContentText());
    (j.documents || []).forEach(function (d) { out.push(d.name.split('/').pop()); });
    tok = j.nextPageToken || '';
  } while (tok);
  return out;
}
/* runQuery — where เป็นรายการ [field, op, value] ต่อกันด้วย AND
   เรียง field แล้วตามด้วย __name__ เสมอ เวลาเท่ากันจึงมีลำดับตายตัว ใช้เป็น cursor ได้
   field = null → เรียงตาม __name__ อย่างเดียว (ไม่ต้องมี composite index เมื่อมีตัวกรองช่องอื่น)
   after = [ค่า field, ชื่อเอกสารเต็ม] หรือ [ชื่อเอกสารเต็ม] เมื่อ field = null — เริ่มหลังเอกสารนั้น */
function lineEncV_(v) {
  if (Array.isArray(v)) return { arrayValue: { values: v.map(lineEncV_) } };
  if (v && v.ts) return { timestampValue: v.ts };
  return typeof v === 'boolean' ? { booleanValue: v } : { stringValue: String(v) };
}
function lineQueryPage_(coll, where, field, after, limit) {
  var f = (where || []).map(function (w) { return { fieldFilter: { field: { fieldPath: w[0] }, op: w[1], value: lineEncV_(w[2]) } }; });
  var q = { from: [{ collectionId: coll }], limit: limit || LINE_PAGE };
  if (f.length === 1) q.where = f[0];
  if (f.length > 1) q.where = { compositeFilter: { op: 'AND', filters: f } };
  q.orderBy = (field ? [{ field: { fieldPath: field }, direction: 'ASCENDING' }] : [])
    .concat([{ field: { fieldPath: '__name__' }, direction: 'ASCENDING' }]);
  if (after) q.startAt = { before: false, values: field
    ? [{ timestampValue: after[0] }, { referenceValue: after[1] }] : [{ referenceValue: after[0] }] };
  var res = UrlFetchApp.fetch('https://firestore.googleapis.com/v1/' + lineDb_() + ':runQuery', {
    method: 'post', contentType: 'application/json', muteHttpExceptions: true, headers: adminHeaders_(),
    payload: JSON.stringify({ structuredQuery: q }) });
  if (res.getResponseCode() !== 200) throw new Error('อ่าน ' + coll + ' ไม่ได้ (' + res.getResponseCode() + '): ' + res.getContentText().slice(0, 200));
  return JSON.parse(res.getContentText()).filter(function (r) { return r.document; }).map(function (r) {
    var o = fsFields_(r.document.fields || {}); o.id = r.document.name.split('/').pop(); o._name = r.document.name; return o;
  });
}
/* อ่านทีละหน้าจนหมดหรือครบ maxPages · more = ยังมีเหลือ */
function lineQueryAll_(coll, where, field, after, maxPages) {
  var out = [], cur = after || null, pages = 0;
  while (true) {
    var rows = lineQueryPage_(coll, where, field, cur, LINE_PAGE);
    out = out.concat(rows); pages++;
    if (rows.length < LINE_PAGE) return { rows: out, more: false };
    if (maxPages && pages >= maxPages) return { rows: out, more: true };
    var last = rows[rows.length - 1];
    cur = field ? [last[field], last._name] : [last._name];
  }
}
function lineQuery_(coll, where) { return lineQueryAll_(coll, where, null, null, 0).rows; }

/* ค่าเวลาจาก Firestore เป็นมิลลิวินาที (ใช้ตัดช่วงย้อน ไม่ได้ใช้เป็น cursor — cursor ใช้สตริงเดิมทุกตัวอักษร) */
function lineMs_(ts) { var t = new Date(ts).getTime(); return isNaN(t) ? 0 : t; }

/* Script Property ที่ยาวเกิน 9 KB — แบ่งเป็นท่อน เขียนพร้อมกันด้วย setProperties */
function linePropGet_(P, key) {
  var n = Number(P.getProperty(key + '#n') || 0);
  var raw = '';
  if (n) { for (var i = 0; i < n; i++) raw += P.getProperty(key + '#' + i) || ''; }
  else raw = P.getProperty(key) || '';
  if (!raw) return null;
  try { return JSON.parse(raw); } catch (e) { return null; }
}
function linePropSet_(P, key, obj) {
  var s = JSON.stringify(obj), parts = [];
  for (var i = 0; i < s.length; i += LINE_CHUNK) parts.push(s.slice(i, i + LINE_CHUNK));
  if (!parts.length) parts.push('');
  var old = Number(P.getProperty(key + '#n') || 0), m = {};
  parts.forEach(function (p, i) { m[key + '#' + i] = p; });
  m[key + '#n'] = String(parts.length);
  P.setProperties(m);
  for (var j = parts.length; j < old; j++) P.deleteProperty(key + '#' + j);
  if (P.getProperty(key) !== null) P.deleteProperty(key);
}

function lineEnc_(v) {
  if (v === null || v === undefined) return { nullValue: null };
  if (typeof v === 'boolean') return { booleanValue: v };
  if (typeof v === 'number') return Number.isInteger(v) ? { integerValue: String(v) } : { doubleValue: v };
  if (Array.isArray(v)) return { arrayValue: { values: v.map(lineEnc_) } };
  if (typeof v === 'object') { var f = {}; Object.keys(v).forEach(function (k) { f[k] = lineEnc_(v[k]); }); return { mapValue: { fields: f } }; }
  return { stringValue: String(v) };
}
function lineLog_(row) {
  var base = lineDb_(), fields = {};
  Object.keys(row).forEach(function (k) { fields[k] = lineEnc_(row[k]); });
  var id = Utilities.getUuid().replace(/-/g, '').slice(0, 20);
  UrlFetchApp.fetch('https://firestore.googleapis.com/v1/' + base + ':commit', {
    method: 'post', contentType: 'application/json', muteHttpExceptions: true, headers: adminHeaders_(),
    payload: JSON.stringify({ writes: [{ update: { name: base + '/lineLog/' + id, fields: fields },
      updateTransforms: [{ fieldPath: 'at', setToServerValue: 'REQUEST_TIME' }],
      currentDocument: { exists: false } }] }) });
}

/* ── บริบทที่ทุกสายใช้ร่วมกัน (อ่านครั้งเดียวต่อรอบ) ──────────── */
function lineCtx_() {
  var s = lineGet_('lineConfig/settings') || {};
  var S = {
    enabled: s.enabled === true,
    overdueDays: Number(s.overdueDays) > 0 ? Number(s.overdueDays) : LINE_DEFAULTS.overdueDays,
    fraeScore: Number(s.fraeScore) > 0 ? Number(s.fraeScore) : LINE_DEFAULTS.fraeScore,
    events: Object.assign({}, LINE_DEFAULTS.events, s.events || {}),
    templates: Object.assign({}, LINE_DEFAULTS.templates, s.templates || {}),
    people: s.people || {},
  };
  var sd = ((lineGet_('staffDirectory/current') || {}).list || []);
  var pd = ((lineGet_('publicDirectory/instructors') || {}).list || []);
  var admins = ((lineGet_('config/admins') || {}).uids || []);
  var names = {}, prof = {};
  sd.concat(pd).forEach(function (x) { if (x.id && x.name && !names[x.id]) names[x.id] = x.name; });
  sd.forEach(function (x) { if (LINE_ID_RE.test(x.lineUserId || '')) prof[x.id] = x.lineUserId; });
  return { S: S, token: !!lineToken_(), sd: sd, pd: pd, admins: admins, names: names, prof: prof,
           sum: { events: 0, sent: 0, dry: 0 } };
}
/* ผู้ถือตำแหน่ง — รายชื่อผู้รับฟอร์ม (recv) และตำแหน่งในโปรไฟล์ (positions) */
function lineHolders_(ctx, pos) {
  var m = {};
  ctx.pd.forEach(function (p) { if ((p.recv || []).indexOf(pos) >= 0) m[p.id] = p.name || ''; });
  ctx.sd.forEach(function (p) { if ((p.positions || []).indexOf(pos) >= 0 && p.active !== false) m[p.id] = m[p.id] || p.name || ''; });
  return Object.keys(m).map(function (u) { return { uid: u, name: m[u] }; });
}
function lineAdmins_(ctx) { return ctx.admins.map(function (u) { return { uid: u, name: ctx.names[u] || 'ผู้ดูแลระบบ' }; }); }
function lineUnion_() {
  var seen = {}, out = [];
  Array.prototype.slice.call(arguments).forEach(function (L) { (L || []).forEach(function (w) {
    if (!w || !w.uid) return;
    if (seen[w.uid]) { if (!seen[w.uid].name && w.name) seen[w.uid].name = w.name; return; }
    seen[w.uid] = { uid: w.uid, name: w.name || '' }; out.push(seen[w.uid]); }); });
  return out;
}

/* ── ข้อความ ───────────────────────────────────────────────── */
function lineRender_(tpl, f) {
  // ทีละบรรทัด — บรรทัดที่มีแต่คำแทนที่ซึ่งว่าง (เช่น [หมายเหตุ] ที่ไม่มีหมายเหตุ) ตัดทิ้ง ไม่เหลือบรรทัดว่าง
  return String(tpl || '').split('\n').map(function (line) {
    var had = false, out = line;
    Object.keys(f).forEach(function (k) {
      if (out.indexOf(k) < 0) return;
      had = true; out = out.split(k).join(f[k] === undefined || f[k] === null ? '' : String(f[k]));
    });
    return (had && !out.trim()) ? null : out.replace(/[ \t]{2,}/g, ' ').replace(/[ \t]+$/, '');
  }).filter(function (l) { return l !== null; }).join('\n').replace(/\n{3,}/g, '\n\n').trim().slice(0, 4900);
}
function lineDay_(d) { return Utilities.formatDate(d || new Date(), 'Asia/Bangkok', 'yyyy-MM-dd'); }
function lineLong_(ymd) {
  var M = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
  var m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(ymd || ''));
  return m ? m[3] + ' ' + M[+m[2] - 1] + ' ' + m[1] : String(ymd || '—');
}
function lineDaysTo_(ymd) {
  var a = new Date(lineDay_() + 'T00:00:00Z').getTime(), b = new Date(String(ymd).slice(0, 10) + 'T00:00:00Z').getTime();
  return Math.round((b - a) / 864e5);
}

/* ── ส่งหนึ่งข้อความถึงหนึ่งคน · ไม่ throw คืนเหตุผลแทน ───────── */
function linePush_(to, text) {
  var token = lineToken_();
  if (!token) return { ok: false, reason: 'ยังไม่ได้ตั้ง LINE_CHANNEL_ACCESS_TOKEN' };
  try {
    var res = UrlFetchApp.fetch(linePushUrl_(), { method: 'post', contentType: 'application/json', muteHttpExceptions: true,
      headers: { Authorization: 'Bearer ' + token },
      payload: JSON.stringify({ to: to, messages: [{ type: 'text', text: text }] }) });
    var c = res.getResponseCode();
    if (c >= 200 && c < 300) return { ok: true, reason: '' };
    return { ok: false, reason: 'LINE ตอบ ' + c + ': ' + res.getContentText().slice(0, 200) };
  } catch (e) { return { ok: false, reason: String(e && e.message || e) }; }
}

/* ส่งข้อความเดียวถึงหลายคน บันทึกทีละคน · skipUid = คนที่ทำเรื่องนี้เอง ไม่ต้องบอกตัวเอง */
function lineSend_(ctx, ev, who, fields, ref, skipUid) {
  var S = ctx.S, text = lineRender_(S.templates[ev], fields);
  ctx.sum.events++;
  if (!who.length) {
    lineLog_({ ref: ref || '', event: ev, toUid: '', toName: '', sent: false, test: false, text: text, reason: 'ไม่มีผู้รับ' });
    return;
  }
  who.forEach(function (w) {
    if (skipUid && w.uid === skipUid) return;
    var p = S.people[w.uid] || {}, line = p.line || ctx.prof[w.uid] || '';
    var why = !S.enabled ? 'ปิดการส่งจริงอยู่ (ทดลอง — บันทึกอย่างเดียว)'
      : !S.events[ev] ? 'ปิดการแจ้งเตือนประเภทนี้ไว้'
      : !line ? 'ยังไม่มี LINE user ID ของคนนี้'
      : p.on === false ? 'ปิดการแจ้งเตือนของคนนี้ไว้'
      : !ctx.token ? 'ยังไม่ได้ตั้ง LINE_CHANNEL_ACCESS_TOKEN' : '';
    // ปิดทั้งประเภทไว้ ไม่ต้องลงบันทึก — ไม่งั้นบันทึกจะเต็มไปด้วยเรื่องที่ผู้ดูแลตั้งใจปิด
    if (S.enabled && !S.events[ev]) return;
    var r = why ? { ok: false, reason: why } : linePush_(line, text);
    if (r.ok) ctx.sum.sent++; else ctx.sum.dry++;
    lineLog_({ ref: ref || '', event: ev, toUid: w.uid, toName: w.name || p.name || ctx.names[w.uid] || '',
               sent: r.ok, test: false, text: text, reason: r.reason });
  });
}

/* ── สายเหตุการณ์ ─────────────────────────────────────────────
   สถานะของแต่ละสาย (LINE_ST_<k>) = { ts, name, ids, lo }
     ts · name   cursor — เอกสารล่าสุดที่ทำแล้ว ตามลำดับ (field, __name__) · เวลาเท่ากันก็ไม่ตกหล่น
     ids         [[id, ms]] ของเอกสารที่ทำแล้วในช่วงย้อน LINE_OVERLAP_MS กันทำซ้ำ
     lo          พื้นของช่วงย้อน (ms) — ยกขึ้นเมื่อ ids เกิน LINE_IDS_CAP ของที่ต่ำกว่านั้นถือว่าทำแล้ว
   ① ช่วงย้อน [max(ts − ย้อน, lo), ts] — เอกสารที่ commit ช้ากว่าที่อ่านไปแล้ว ทำเฉพาะที่ไม่อยู่ใน ids
   ② ไปข้างหน้า หลัง cursor ทีละหน้า สูงสุด LINE_MAX_PAGES หน้า เกินนี้ cursor ค้างไว้ รอบหน้าทำต่อ
   ไม่มีสถานะ = เพิ่งเปิดสายนี้ เริ่มนับจาก "ตอนนี้" ไม่ไล่ของเก่า */
function lineStateGet_(P, k) {
  var st = linePropGet_(P, 'LINE_ST_' + k);
  if (st) return st;
  // ย้ายจากรูปแบบเดิม (LINE_WM_<k> + LINE_SENT) — ids เดิมไม่มีเวลา ใช้เวลาของจุดที่ตรวจแล้วแทน
  var wm = P.getProperty('LINE_WM_' + k) || (k === 'task' ? P.getProperty('LINE_WATERMARK') : '');
  if (!wm) return null;
  var old = []; try { old = JSON.parse(P.getProperty('LINE_SENT') || '[]'); } catch (e) {}
  var ms = lineMs_(wm);
  return { ts: wm, name: '', lo: 0, ids: old.map(function (x) { return x.indexOf(':') < 0 ? 'task:' + x : x; })
    .filter(function (x) { return x.indexOf(k + ':') === 0; }).map(function (x) { return [x.slice(k.length + 1), ms]; }) };
}
function lineStream_(P, k, coll, field, fn) {
  var st = lineStateGet_(P, k);
  if (!st) { linePropSet_(P, 'LINE_ST_' + k, { ts: new Date().toISOString(), name: '', ids: [], lo: 0 }); return { init: true, n: 0 }; }
  var seen = {}, n = 0;
  st.ids.forEach(function (x) { seen[x[0]] = 1; });
  var take = function (r) {
    if (seen[r.id]) return;
    seen[r.id] = 1; st.ids.push([r.id, lineMs_(r[field])]); n++;
    try { fn(r); } catch (e) { Logger.log('line ' + k + ':' + r.id + ': ' + e); }
  };
  // ① ช่วงย้อน
  var low = Math.max(lineMs_(st.ts) - LINE_OVERLAP_MS, st.lo || 0);
  lineQueryAll_(coll, [[field, 'GREATER_THAN_OR_EQUAL', { ts: new Date(low).toISOString() }],
                       [field, 'LESS_THAN_OR_EQUAL', { ts: st.ts }]], field, null, LINE_LATE_PAGES).rows.forEach(take);
  // ② ไปข้างหน้า
  var fw = lineQueryAll_(coll, [[field, 'GREATER_THAN_OR_EQUAL', { ts: st.ts }]], field,
                         st.name ? [st.ts, st.name] : null, LINE_MAX_PAGES);
  fw.rows.forEach(function (r) { take(r); if (r[field]) { st.ts = r[field]; st.name = r._name; } });
  // ③ ids เก็บเฉพาะในช่วงย้อน ไม่เกิน cap — ตัดของเก่าแล้วยกพื้นขึ้นเหนือของที่ตัด
  var cut = lineMs_(st.ts) - LINE_OVERLAP_MS;
  st.ids = st.ids.filter(function (x) { return x[1] >= cut; }).sort(function (a, b) { return a[1] - b[1]; });
  if (st.ids.length > LINE_IDS_CAP) {
    var drop = st.ids.splice(0, st.ids.length - LINE_IDS_CAP);
    st.lo = Math.max(st.lo || 0, drop[drop.length - 1][1] + 1);
  }
  linePropSet_(P, 'LINE_ST_' + k, st);
  return { n: n, more: fw.more };
}

function lineOnTask_(ctx, t) {
  if (t.state !== 'open' && t.state !== 'pool') return;      // ปิดไปแล้วก่อนถึงรอบตรวจ
  var base = linePortal_();
  var ev = t.kind === 'ack' ? 'ack' : t.state === 'pool' ? 'pool' : 'task';
  var f = { '[เรื่อง]': t.title || t.formCode || '—', '[ฟอร์ม]': t.formCode || '—', '[เลขที่]': t.tracking || '—',
            '[จาก]': t.fromName || '—', '[กองรอ]': t.pool || '—', '[หมายเหตุ]': t.note || '',
            '[ลิงก์]': ev === 'pool' ? base + 'queue/'
              : t.app === 'memo' ? base + 'memo/?id=' + encodeURIComponent(t.memoId || '')
              : base + 'approve/?t=' + encodeURIComponent(t.id) };
  if (ev === 'pool') {
    var h = lineHolders_(ctx, t.pool);
    if (!h.length) { f['[ลิงก์]'] = base + 'admin/subs/'; return lineSend_(ctx, 'nobody', lineAdmins_(ctx), f, 'task:' + t.id); }
    return lineSend_(ctx, 'pool', h, f, 'task:' + t.id, t.fromUid);
  }
  lineSend_(ctx, ev, t.assigneeUid ? [{ uid: t.assigneeUid, name: t.assigneeName || '' }] : [], f, 'task:' + t.id, t.fromUid);
}

/* ใบที่ปิดแล้ว — แจ้งผู้ส่งเฉพาะเมื่อคนตัดสินไม่ใช่ตัวเขาเอง (ใบขั้นเดียวที่ปิดตอนส่งไม่ต้องบอก) */
function lineOnClosed_(ctx, s) {
  if (s.status !== 'complete' && s.status !== 'rejected') return;
  if (!s.submitterUid || s.formCode === 'VSR' || s.formCode === 'ARF') return;
  var ch = s.chain || [], last = ch[ch.length - 1] || {};
  if (!last.byUid || last.byUid === s.submitterUid) return;
  lineSend_(ctx, 'result', [{ uid: s.submitterUid, name: s.submitterName || '' }], {
    '[ผล]': last.action === 'adminClose' ? 'ถูกปิดโดยผู้ดูแลระบบ' : s.status === 'complete' ? 'อนุมัติแล้ว' : 'ไม่อนุมัติ',
    '[เรื่อง]': s.title || s.formCode || '—', '[ฟอร์ม]': s.formCode || '—', '[เลขที่]': s.tracking || '—',
    '[โดย]': last.byName || s.closedBy || '—', '[หมายเหตุ]': last.note ? 'หมายเหตุ: ' + last.note : '',
    '[ลิงก์]': linePortal_() + 'view/?id=' + encodeURIComponent(s.id) }, 'sub:' + s.id);
}

/* ใบที่เพิ่งส่งเข้ามา — FRAE ความเสี่ยงสูง · รายงานนิรภัย */
function lineOnSubmitted_(ctx, s) {
  var link = linePortal_() + 'view/?id=' + encodeURIComponent(s.id), d = s.data || {};
  if (s.formCode === 'FRAE') {
    var score = Number((s.computed || {}).score || 0), dec = String(d.decision || '');
    if (dec !== 'NO-GO' && score < ctx.S.fraeScore) return;
    return lineSend_(ctx, 'frae', lineUnion_(lineHolders_(ctx, 'CFI'), lineAdmins_(ctx)), {
      '[ตัดสินใจ]': dec || '—', '[คะแนน]': score, '[นักบิน]': [d.picFirst, d.picLast].join(' ').trim() || s.submitterName || '—',
      '[ทะเบียน]': d.aircraftReg || '—', '[วันที่]': lineLong_(d.evalDate), '[เลขที่]': s.tracking || '—', '[ลิงก์]': link,
      '[เรื่อง]': s.title || 'FRAE', '[ฟอร์ม]': 'FRAE' }, 'sub:' + s.id, s.submitterUid);
  }
  if (s.formCode === 'VSR' || s.formCode === 'HIF') {
    // ไม่ใส่ชื่อผู้รายงาน — VSR ต้องรายงานได้โดยไม่เปิดเผยตัว (ICAO Doc 9859)
    return lineSend_(ctx, 'safety', lineUnion_(lineHolders_(ctx, 'SM'), lineAdmins_(ctx)), {
      '[ฟอร์ม]': s.formCode === 'VSR' ? 'VSR รายงานนิรภัยโดยสมัครใจ' : 'HIF รายงานการชี้บ่งอันตราย',
      '[เลขที่]': s.tracking || '—', '[ลิงก์]': link, '[เรื่อง]': s.formCode }, 'sub:' + s.id);
  }
}

function lineOnUser_(ctx, u) {
  if (!u.self || u.test) return;
  var roles = u.roles || [];
  if (roles.some(function (r) { return r !== 'stu'; })) return;
  lineSend_(ctx, 'signup', lineAdmins_(ctx), { '[ชื่อ]': u.name || '(ไม่มีชื่อ)', '[อีเมล]': u.email || '—',
    '[ลิงก์]': linePortal_() + 'admin/setup/#users' }, 'user:' + u.id);
}

function lineOnMemo_(ctx, m) {
  if (m.status !== 'declined' || m.test) return;
  var sg = m.signers || {}, en = sg.endorser || {}, e = m.endorsement || {};
  lineSend_(ctx, 'memoNo', lineUnion_([{ uid: m.createdBy, name: '' }], [{ uid: (sg.proposer || {}).uid, name: (sg.proposer || {}).name || '' }]), {
    '[เรื่อง]': m.subject || '—', '[เลขที่]': m.number || '—', '[โดย]': en.name || '—',
    '[หมายเหตุ]': e.text || e.note ? 'สั่งการ: ' + (e.text || e.note) : '',
    '[ลิงก์]': linePortal_() + 'memo/?id=' + encodeURIComponent(m.id) }, 'memo:' + m.id, en.uid);
}

/**
 * ตัวตั้งเวลา — ทุก 1 นาที
 * ไม่มี LINE_WATERMARK = ยังไม่ได้เปิดระบบ (ผู้ดูแลกดเปิดตัวตั้งเวลาในหน้าตั้งค่า)
 */
function lineTick() {
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(2000)) return { skipped: 'กำลังทำงานอยู่' };
  var P = PropertiesService.getScriptProperties(), ctx = null;
  var sum = { at: new Date().toISOString() };
  try {
    if (!P.getProperty('LINE_WATERMARK')) return { skipped: 'ยังไม่ได้เปิดระบบ' };
    var get = function () { return ctx || (ctx = lineCtx_()); }, more = false;
    [['task',  'tasks',       'createdAt',   function (t) { lineOnTask_(get(), t); }],
     ['sub',   'submissions', 'submittedAt', function (s) { lineOnSubmitted_(get(), s); }],
     ['close', 'submissions', 'closedAt',    function (s) { lineOnClosed_(get(), s); }],
     ['user',  'users',       'createdAt',   function (u) { lineOnUser_(get(), u); }],
     ['memo',  'memos',       'endorsedAt',  function (m) { lineOnMemo_(get(), m); }]].forEach(function (x) {
      if (lineStream_(P, x[0], x[1], x[2], x[3]).more) more = true;
    });
    // ย้ายรูปแบบเดิมเสร็จแล้ว ลบของเก่าที่อาจยาวเกิน 9 KB ทิ้ง
    ['LINE_SENT', 'LINE_WM_task', 'LINE_WM_sub', 'LINE_WM_close', 'LINE_WM_user', 'LINE_WM_memo'].forEach(function (k) {
      if (P.getProperty(k) !== null) P.deleteProperty(k); });
    var tst = linePropGet_(P, 'LINE_ST_task');
    if (tst && tst.ts) P.setProperty('LINE_WATERMARK', tst.ts);
    if (ctx) Object.assign(sum, ctx.sum); else Object.assign(sum, { events: 0, sent: 0, dry: 0 });
    if (more) sum.more = true;
    P.setProperty('LINE_LAST', JSON.stringify(sum));
    return sum;
  } catch (e) {
    sum.error = String(e && e.message || e);
    P.setProperty('LINE_LAST', JSON.stringify(sum));
    return sum;
  } finally { lock.releaseLock(); }
}

/**
 * รายวัน 08:00 — งานค้าง · สรุปรายสัปดาห์ (วันจันทร์) · หนังสือใกล้หมดอายุ · หนังสือเวียนครบกำหนด
 * force = สั่งจากปุ่มในหน้าตั้งค่า (ส่งซ้ำในวันเดียวกันได้ สำหรับทดลอง)
 */
function lineDaily(force) {
  force = force === true;
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(5000)) return { skipped: 'กำลังทำงานอยู่' };
  var P = PropertiesService.getScriptProperties(), today = lineDay_();
  var sum = { at: new Date().toISOString(), daily: true };
  try {
    if (!force && P.getProperty('LINE_DAILY_DAY') === today) return { skipped: 'วันนี้ส่งไปแล้ว' };
    var ctx = lineCtx_(), S = ctx.S, base = linePortal_();
    var done = linePropGet_(P, 'LINE_DONE');
    if (!Array.isArray(done)) { try { done = JSON.parse(P.getProperty('LINE_DONE') || '[]'); } catch (e) { done = []; } }
    var live = {};   // หนังสือที่ยังต้องจำว่าส่งแล้ว — ใช้ตัด LINE_DONE ไม่ให้โตไม่สิ้นสุด
    var ms = function (v) { return v ? new Date(v).getTime() : 0; };
    var age = function (v) { return Math.max(0, Math.floor((Date.now() - ms(v)) / 864e5)); };

    // ① งานค้างเกิน N วัน — รวมเป็นข้อความเดียวต่อคน
    var open = lineQuery_('tasks', [['state', 'IN', ['open', 'pool']]]).filter(function (t) { return t.kind !== 'ack' && !t.test; });
    var mine = {};
    open.forEach(function (t) {
      if (t.state !== 'open' || !t.assigneeUid || age(t.createdAt) < S.overdueDays) return;
      (mine[t.assigneeUid] = mine[t.assigneeUid] || { name: t.assigneeName || '', list: [] }).list.push(t);
    });
    Object.keys(mine).forEach(function (u) {
      var L = mine[u].list.sort(function (a, b) { return ms(a.createdAt) - ms(b.createdAt); });
      var lines = L.slice(0, 8).map(function (t) { return '• ' + (t.title || t.formCode) + ' (' + (t.tracking || '—') + ') — ' + age(t.createdAt) + ' วัน'; });
      if (L.length > 8) lines.push('และอีก ' + (L.length - 8) + ' รายการ');
      lineSend_(ctx, 'overdue', [{ uid: u, name: mine[u].name }], { '[จำนวน]': L.length, '[รายการ]': lines.join('\n'),
        '[ลิงก์]': base + 'queue/' }, 'overdue:' + today);
    });

    // ② วันจันทร์ — สรุปทั้งระบบถึงผู้ดูแลและ CMM
    if (Utilities.formatDate(new Date(), 'Asia/Bangkok', 'u') === '1' || force) {
      var pool = open.filter(function (t) { return t.state === 'pool'; });
      var nob = pool.filter(function (t) { return !lineHolders_(ctx, t.pool).length; });
      var late = open.filter(function (t) { return age(t.createdAt) >= 7; });
      var old = open.slice().sort(function (a, b) { return ms(a.createdAt) - ms(b.createdAt); }).slice(0, 5);
      var txt = ['งานเปิดอยู่ ' + open.length + ' · ในกองรอ ' + pool.length + ' · ไม่มีผู้รับ ' + nob.length + ' · ค้างเกิน 7 วัน ' + late.length]
        .concat(old.length ? ['ค้างนานสุด:'] : [])
        .concat(old.map(function (t) { return '• ' + (t.title || t.formCode) + ' — ' + (t.assigneeName || ('กองรอ ' + (t.pool || '—'))) + ' · ' + age(t.createdAt) + ' วัน'; }));
      lineSend_(ctx, 'weekly', lineUnion_(lineAdmins_(ctx), lineHolders_(ctx, 'CMM')), { '[รายการ]': txt.join('\n'),
        '[ลิงก์]': base + 'admin/setup/#pending' }, 'weekly:' + today);
    }

    // ③ หนังสือแต่งตั้ง/มอบหมายใกล้หมดอายุ — 30 และ 7 วันก่อน ครั้งเดียวต่อเกณฑ์
    lineQuery_('memos', [['status', 'EQUAL', 'issued']]).forEach(function (m) {
      if (m.test) return;
      live[m.id] = 1;
      var left = m.expiresOn ? lineDaysTo_(m.expiresOn) : -1;
      if (m.expiresOn) [30, 7].forEach(function (th) {
        var key = 'x:' + m.id + ':' + th;
        if (left < 0 || left > th || (th === 30 && left <= 7) || done.indexOf(key) >= 0) return;
        done.push(key);
        lineSend_(ctx, 'expiry', lineUnion_(m.beneficiaryUid ? [{ uid: m.beneficiaryUid, name: m.beneficiaryName || '' }] : [], lineHolders_(ctx, 'HT')), {
          '[เลขที่]': m.number || '—', '[เหลือ]': left, '[วันหมดอายุ]': lineLong_(m.expiresOn),
          '[ชื่อ]': m.beneficiaryName || '—', '[เรื่อง]': m.subject || '—',
          '[ลิงก์]': base + 'memo/?id=' + encodeURIComponent(m.id) }, 'memo:' + m.id);
      });

      // ④ หนังสือเวียนที่ให้รับทราบในระบบฟอร์ม — ครบกำหนดแล้วยังไม่รับทราบ (วันครบกำหนด และอีก 3 วัน)
      if (m.circular && m.ackChannel === 'forms' && (m.recipientUids || []).length) {
        var iss = m.issuedAt ? Utilities.formatDate(new Date(m.issuedAt), 'Asia/Bangkok', 'yyyy-MM-dd') : '';
        if (!iss) return;
        var due = (m.effectiveFrom && m.effectiveFrom > iss) ? m.effectiveFrom
          : Utilities.formatDate(new Date(new Date(iss + 'T00:00:00+07:00').getTime() + 7 * 864e5), 'Asia/Bangkok', 'yyyy-MM-dd');
        var past = -lineDaysTo_(due);
        var round = past >= 3 ? 2 : past >= 0 ? 1 : 0, key2 = 'a:' + m.id + ':' + round;
        if (!round || done.indexOf(key2) >= 0) return;
        done.push(key2);
        var acked = lineList_('memos/' + m.id + '/acks');
        var who = (m.recipients || []).filter(function (r) { return r.uid && acked.indexOf(r.uid) < 0; })
          .map(function (r) { return { uid: r.uid, name: r.name || '' }; });
        if (who.length) lineSend_(ctx, 'ackDue', who, { '[เรื่อง]': m.subject || '—', '[เลขที่]': m.number || '—',
          '[วันที่]': lineLong_(due), '[ลิงก์]': base + 'queue/' }, 'memo:' + m.id);
      }
    });

    // จำเฉพาะของหนังสือที่ยัง issued อยู่ — หมดอายุ/ถูกแทนแล้วไม่ต้องจำ · แบ่งท่อนเมื่อยาวเกิน 8,000 ตัวอักษร
    linePropSet_(P, 'LINE_DONE', done.filter(function (x) { return live[String(x).split(':')[1]]; }));
    if (!force) P.setProperty('LINE_DAILY_DAY', today);
    Object.assign(sum, ctx.sum);
    P.setProperty('LINE_DAILY_LAST', JSON.stringify(sum));
    return sum;
  } catch (e) {
    sum.error = String(e && e.message || e);
    P.setProperty('LINE_DAILY_LAST', JSON.stringify(sum));
    return sum;
  } finally { lock.releaseLock(); }
}
function lineDailyTrigger() { return lineDaily(false); }

/* ── คำสั่งจากหน้าตั้งค่า (ผู้ดูแลระบบเท่านั้น) ────────────────── */
function lineTriggers_() {
  var h = {}; ScriptApp.getProjectTriggers().forEach(function (t) { h[t.getHandlerFunction()] = true; });
  return { tick: !!h.lineTick, daily: !!h.lineDailyTrigger };
}
function lineAdmin_(body, who) {
  var admins = {};
  try { admins = fsGet_('config/admins', body.idToken); } catch (e) { throw new Error('ตรวจสิทธิ์ผู้ดูแลไม่ได้: ' + e.message); }
  if ((admins.uids || []).indexOf(who.uid) < 0) throw new Error('ต้องเป็นผู้ดูแลระบบ');
  var P = PropertiesService.getScriptProperties();
  var op = String(body.op || 'status');

  if (op === 'status') {
    var bot = null, token = lineToken_();
    if (token) {
      try {
        var r = UrlFetchApp.fetch('https://api.line.me/v2/bot/info', { headers: { Authorization: 'Bearer ' + token }, muteHttpExceptions: true });
        bot = r.getResponseCode() === 200 ? JSON.parse(r.getContentText()) : { error: 'LINE ตอบ ' + r.getResponseCode() };
      } catch (e) { bot = { error: String(e.message || e) }; }
    }
    var tg = lineTriggers_();
    return {
      tokenSet: !!token,
      bot: bot && { name: bot.displayName || '', id: bot.basicId || '', error: bot.error || '' },
      trigger: tg.tick && tg.daily, tick: tg.tick, daily: tg.daily,
      watermark: P.getProperty('LINE_WATERMARK') || '',
      last: JSON.parse(P.getProperty('LINE_LAST') || 'null'),
      lastDaily: JSON.parse(P.getProperty('LINE_DAILY_LAST') || 'null'),
      importable: !!P.getProperty('FLIGHTPLAN_EXEC_URL'),
    };
  }

  // เปิด/ปิดตัวตั้งเวลาทั้งสองตัว — เปิดครั้งแรกเริ่มนับจาก "ตอนนี้" ของเก่าไม่ถูกส่งย้อนหลัง
  if (op === 'trigger') {
    ScriptApp.getProjectTriggers().forEach(function (t) {
      if (['lineTick', 'lineDailyTrigger'].indexOf(t.getHandlerFunction()) >= 0) ScriptApp.deleteTrigger(t); });
    if (body.on) {
      if (!P.getProperty('LINE_WATERMARK')) P.setProperty('LINE_WATERMARK', new Date().toISOString());
      ScriptApp.newTrigger('lineTick').timeBased().everyMinutes(1).create();
      ScriptApp.newTrigger('lineDailyTrigger').timeBased().everyDays(1).atHour(8).inTimezone('Asia/Bangkok').create();
    }
    return Object.assign({ watermark: P.getProperty('LINE_WATERMARK') || '' }, lineTriggers_());
  }

  if (op === 'run') return lineTick();
  if (op === 'daily') return lineDaily(true);

  // ส่งทดสอบถึงคนเดียว — ไม่สนสวิตช์ส่งจริง เพราะคนกดปุ่มทดสอบตั้งใจให้ส่ง
  if (op === 'test') {
    var to = String(body.line || '');
    if (!LINE_ID_RE.test(to)) throw new Error('LINE user ID ต้องขึ้นต้นด้วย U ตามด้วยตัวอักษร 32 ตัว');
    var text = String(body.text || 'ทดสอบการแจ้งเตือนจาก D-0507 Forms').slice(0, 1000);
    var res = linePush_(to, text);
    lineLog_({ ref: '', event: 'test', toUid: String(body.uid || ''), toName: String(body.name || ''),
               sent: res.ok, test: true, text: text, reason: res.reason, byUid: who.uid });
    return res;
  }

  // ตั้ง token — รับเข้าอย่างเดียว ไม่มีทางอ่านกลับ
  if (op === 'token') {
    if (body.clear) { P.deleteProperty('LINE_CHANNEL_ACCESS_TOKEN'); return { tokenSet: false }; }
    var tk = String(body.token || '').trim();
    if (tk.length < 100 || /\s/.test(tk)) throw new Error('ไม่ใช่ channel access token ของ LINE (ยาวกว่า 100 ตัว ไม่มีช่องว่าง)');
    var chk = UrlFetchApp.fetch('https://api.line.me/v2/bot/info', { headers: { Authorization: 'Bearer ' + tk }, muteHttpExceptions: true });
    if (chk.getResponseCode() !== 200) throw new Error('LINE ไม่รับ token นี้ (' + chk.getResponseCode() + ') — ไม่ได้บันทึก');
    P.setProperty('LINE_CHANNEL_ACCESS_TOKEN', tk);
    var info = JSON.parse(chk.getContentText());
    return { tokenSet: true, bot: { name: info.displayName || '', id: info.basicId || '' } };
  }

  // รายชื่อที่ D0507 Dispatch เก็บไว้แล้ว (ชื่อ + LINE user ID) ให้หน้าเว็บจับคู่กับผู้ใช้
  // ไม่บันทึกอะไร — ผู้ดูแลเลือกเองว่าจะใช้แถวไหน
  if (op === 'import') {
    var url = P.getProperty('FLIGHTPLAN_EXEC_URL');
    if (!url) throw new Error('ยังไม่ได้ตั้ง FLIGHTPLAN_EXEC_URL');
    var rr = UrlFetchApp.fetch(url + (url.indexOf('?') < 0 ? '?' : '&') + 'api=notify', { muteHttpExceptions: true, followRedirects: true });
    var j = {}; try { j = JSON.parse(rr.getContentText()); } catch (e) {}
    if (!j.ok || !j.settings) throw new Error('อ่านรายชื่อจาก Dispatch ไม่ได้ (' + rr.getResponseCode() + ')');
    return { people: (j.settings.recipients || []).filter(function (r) { return LINE_ID_RE.test(String(r.lineUserId || '')); })
      .map(function (r) { return { name: String(r.name || ''), line: String(r.lineUserId), role: r.role || '', active: r.active !== false }; }) };
  }

  throw new Error('ไม่รู้จักคำสั่ง: ' + op);
}
