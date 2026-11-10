/**
 * แจ้งเตือนผ่าน LINE — "มีงานใหม่รอคุณ"
 *
 * แบบเดียวกับ D0507 Dispatch (ARCHIVE › NOTIFICATIONS):
 *   - ส่งผ่าน LINE Official Account ของโรงเรียน ทีละคน (push) ไม่ใช่กลุ่ม
 *     แต่ละคนได้เฉพาะงานของตัวเอง เอาใครออกคือลบแถวเดียวในหน้าตั้งค่า
 *   - token อยู่ใน Script Property LINE_CHANNEL_ACCESS_TOKEN เท่านั้น
 *     ห้ามอยู่ในหน้าเว็บที่นักเรียนเปิดอ่านซอร์สได้
 *   - ยังไม่มี token = ไม่มีอะไรออกจากระบบ แต่ทุกข้อความที่ "จะส่ง" ถูกเขียนลง
 *     บันทึก (lineLog) พร้อมเหตุผลว่าทำไมไม่ได้ส่ง พอใส่ token แล้วก็ไม่มีกองค้าง
 *     ยิงย้อนหลังใส่ทุกคนพร้อมกัน เพราะนับต่อจากจุดที่ตรวจไปแล้ว
 *
 * ต่างจาก Dispatch ตรงที่ไม่ได้ให้เบราว์เซอร์เป็นคนส่ง — Dispatch ส่งจากเครื่องที่กดปุ่ม
 * เครื่องที่ไม่มีรายชื่อจึงไม่แจ้งใครเลย ที่นี่ตัวตั้งเวลาของสคริปต์ (lineTick ทุก 1 นาที)
 * อ่านงานใหม่ใน tasks เอง ไม่ว่าใบนั้นถูกส่งจากหน้าไหน เครื่องไหน หรือคนที่ไม่ได้ล็อกอิน
 *
 * อ่าน/เขียน Firestore ด้วยสิทธิ์ของเจ้าของสคริปต์ (adminHeaders_ ใน Password.gs)
 * เพราะงานใหม่ต้องอ่านได้แม้ไม่มีใครเปิดหน้าเว็บอยู่ ส่วนคำสั่งจากหน้าเว็บทุกตัวตรวจ
 * ผู้ดูแลจาก config/admins ด้วย token ของผู้เรียกก่อนเสมอ
 *
 * ที่เก็บ
 *   lineConfig/settings   ค่าตั้ง + LINE user ID รายคน (ผู้ดูแลอ่าน/เขียนเท่านั้น)
 *   lineLog/<id>          บันทึกทุกข้อความ ส่งแล้วหรือไม่ได้ส่ง (ผู้ดูแลอ่านได้ ไม่มีใครแก้)
 *   Script Properties     LINE_CHANNEL_ACCESS_TOKEN · LINE_WATERMARK · LINE_SENT · LINE_LAST
 */

/* ที่ส่ง push — ตั้งทับได้ด้วย Script Property LINE_MESSAGING_API_PUSH_URL เหมือน Dispatch (LINE เคยย้าย endpoint) */
function linePushUrl_() {
  return PropertiesService.getScriptProperties().getProperty('LINE_MESSAGING_API_PUSH_URL')
    || 'https://api.line.me/v2/bot/message/push';
}
var LINE_OVERLAP_MS = 3 * 60 * 1000;   // อ่านย้อนเผื่อเวลาเครื่องคลาด แล้วกันซ้ำด้วย LINE_SENT

var LINE_DEFAULTS = {
  enabled: false,
  events: { task: true, pool: true, ack: true },
  templates: {
    task: 'D-0507 · งานใหม่รอคุณ\n[เรื่อง]\nเลขที่ [เลขที่] · จาก [จาก]\n[ลิงก์]',
    pool: 'D-0507 · งานใหม่ในกองรอ [กองรอ]\n[เรื่อง]\nเลขที่ [เลขที่] · จาก [จาก]\nกดรับงาน: [ลิงก์]',
    ack:  'D-0507 · หนังสือเวียนรอรับทราบ\n[เรื่อง]\nเลขที่ [เลขที่]\n[ลิงก์]',
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
function lineDb_() {
  return 'projects/' + cfg_('FIREBASE_PROJECT') + '/databases/(default)/documents';
}
function lineGet_(path) {
  var res = UrlFetchApp.fetch('https://firestore.googleapis.com/v1/' + lineDb_() + '/' + path,
    { headers: adminHeaders_(), muteHttpExceptions: true });
  if (res.getResponseCode() === 404) return null;
  if (res.getResponseCode() !== 200) throw new Error('อ่าน ' + path + ' ไม่ได้ (' + res.getResponseCode() + ')');
  return fsFields_(JSON.parse(res.getContentText()).fields || {});
}
function lineEnc_(v) {
  if (v === null || v === undefined) return { nullValue: null };
  if (typeof v === 'boolean') return { booleanValue: v };
  if (typeof v === 'number') return Number.isInteger(v) ? { integerValue: String(v) } : { doubleValue: v };
  if (Array.isArray(v)) return { arrayValue: { values: v.map(lineEnc_) } };
  if (typeof v === 'object') {
    var f = {}; Object.keys(v).forEach(function (k) { f[k] = lineEnc_(v[k]); });
    return { mapValue: { fields: f } };
  }
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

function lineSettings_() {
  var s = lineGet_('lineConfig/settings') || {};
  return {
    enabled: s.enabled === true,
    events: Object.assign({}, LINE_DEFAULTS.events, s.events || {}),
    templates: Object.assign({}, LINE_DEFAULTS.templates, s.templates || {}),
    people: s.people || {},
  };
}

/* งานที่สร้างหลังจุดที่ตรวจไปแล้ว เรียงตามเวลาสร้าง */
function lineNewTasks_(sinceIso) {
  var res = UrlFetchApp.fetch('https://firestore.googleapis.com/v1/' + lineDb_() + ':runQuery', {
    method: 'post', contentType: 'application/json', muteHttpExceptions: true, headers: adminHeaders_(),
    payload: JSON.stringify({ structuredQuery: {
      from: [{ collectionId: 'tasks' }],
      where: { fieldFilter: { field: { fieldPath: 'createdAt' }, op: 'GREATER_THAN', value: { timestampValue: sinceIso } } },
      orderBy: [{ field: { fieldPath: 'createdAt' }, direction: 'ASCENDING' }],
      limit: 100 } }) });
  if (res.getResponseCode() !== 200) throw new Error('อ่านงานใหม่ไม่ได้ (' + res.getResponseCode() + '): ' + res.getContentText().slice(0, 200));
  return JSON.parse(res.getContentText()).filter(function (r) { return r.document; }).map(function (r) {
    var o = fsFields_(r.document.fields || {});
    o.id = r.document.name.split('/').pop();
    return o;
  });
}

/* ── ข้อความ ───────────────────────────────────────────────── */
function lineEvent_(t) {
  if (t.kind === 'ack') return 'ack';
  return t.state === 'pool' ? 'pool' : 'task';
}
function lineFields_(t, ev) {
  var base = linePortal_();
  var link = ev === 'pool' ? base + 'queue/'
    : t.app === 'memo' ? base + 'memo/?id=' + encodeURIComponent(t.memoId || '')
    : base + 'approve/?t=' + encodeURIComponent(t.id);
  return {
    '[เรื่อง]': String(t.title || t.formCode || '—'),
    '[ฟอร์ม]': String(t.formCode || '—'),
    '[เลขที่]': String(t.tracking || '—'),
    '[จาก]': String(t.fromName || '—'),
    '[กองรอ]': String(t.pool || '—'),
    '[หมายเหตุ]': String(t.note || ''),
    '[ลิงก์]': link,
  };
}
function lineRender_(tpl, f) {
  var out = String(tpl || '');
  Object.keys(f).forEach(function (k) { out = out.split(k).join(f[k]); });
  return out.replace(/[ \t]+\n/g, '\n').replace(/[ \t]{2,}/g, ' ').trim().slice(0, 4900);
}

/* ใครได้ข้อความของงานนี้ — คืน [{uid, name}] */
function lineWho_(t, ev, dir) {
  if (ev !== 'pool') return t.assigneeUid ? [{ uid: t.assigneeUid, name: t.assigneeName || '' }] : [];
  return dir.filter(function (p) { return (p.recv || []).indexOf(t.pool) >= 0; })
            .map(function (p) { return { uid: p.id, name: p.name || '' }; });
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

/**
 * ตัวตั้งเวลา — ทุก 1 นาที
 * ไม่มี LINE_WATERMARK = ยังไม่ได้เปิดระบบ (ผู้ดูแลกด "เปิดตัวตั้งเวลา" ในหน้าตั้งค่า)
 */
function lineTick() {
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(2000)) return { skipped: 'กำลังทำงานอยู่' };
  var P = PropertiesService.getScriptProperties();
  var sum = { tasks: 0, sent: 0, dry: 0, at: new Date().toISOString() };
  try {
    var wm = P.getProperty('LINE_WATERMARK');
    if (!wm) return { skipped: 'ยังไม่ได้เปิดระบบ' };
    var since = new Date(new Date(wm).getTime() - LINE_OVERLAP_MS).toISOString();
    var rows = lineNewTasks_(since);
    var seen = JSON.parse(P.getProperty('LINE_SENT') || '[]');
    var fresh = rows.filter(function (t) { return seen.indexOf(t.id) < 0; });
    if (fresh.length) {
      var S = lineSettings_(), token = !!lineToken_(), dir = null, prof = {};
      // LINE ID ที่เจ้าตัวกรอกเองในโปรไฟล์ (staffDirectory) ใช้เมื่อผู้ดูแลยังไม่ได้ใส่ให้
      try { ((lineGet_('staffDirectory/current') || {}).list || []).forEach(function (x) {
        if (/^U[0-9a-f]{32}$/i.test(x.lineUserId || '')) prof[x.id] = x.lineUserId; }); } catch (e) {}
      fresh.forEach(function (t) {
        seen.push(t.id);
        if (t.state !== 'open' && t.state !== 'pool') return;   // ปิดไปแล้วก่อนถึงรอบตรวจ
        var ev = lineEvent_(t);
        if (ev === 'pool' && !dir) { var d = lineGet_('publicDirectory/instructors'); dir = (d && d.list) || []; }
        var text = lineRender_(S.templates[ev], lineFields_(t, ev));
        var who = lineWho_(t, ev, dir || []);
        sum.tasks++;
        if (!who.length) {
          lineLog_({ taskId: t.id, event: ev, toUid: '', toName: '', sent: false, test: false, text: text,
                     reason: ev === 'pool' ? 'ไม่มีใครถือตำแหน่ง ' + (t.pool || '—') + ' ในรายชื่อผู้รับฟอร์ม' : 'งานไม่ได้ระบุผู้รับ' });
          return;
        }
        who.forEach(function (w) {
          if (w.uid && w.uid === t.fromUid) return;          // งานที่ส่งถึงตัวเอง ไม่ต้องบอก
          var p = Object.assign({}, S.people[w.uid] || {});
          if (!p.line && prof[w.uid]) p.line = prof[w.uid];
          var why = !S.enabled ? 'ปิดการส่งจริงอยู่ (ทดลอง — บันทึกอย่างเดียว)'
            : !S.events[ev] ? 'ปิดการแจ้งเตือนประเภทนี้ไว้'
            : !p.line ? 'ยังไม่มี LINE user ID ของคนนี้'
            : p.on === false ? 'ปิดการแจ้งเตือนของคนนี้ไว้'
            : !token ? 'ยังไม่ได้ตั้ง LINE_CHANNEL_ACCESS_TOKEN' : '';
          var r = why ? { ok: false, reason: why } : linePush_(p.line, text);
          if (r.ok) sum.sent++; else sum.dry++;
          lineLog_({ taskId: t.id, event: ev, toUid: w.uid, toName: w.name || p.name || '', sent: r.ok,
                     test: false, text: text, reason: r.reason });
        });
      });
    }
    // ขยับจุดที่ตรวจแล้วไปที่งานล่าสุดที่เห็น (ไม่ใช่ "ตอนนี้" — งานที่ commit ช้าจะได้ไม่หลุด)
    if (rows.length) {
      var last = rows[rows.length - 1].createdAt;
      if (last && new Date(last).getTime() > new Date(wm).getTime()) P.setProperty('LINE_WATERMARK', last);
    }
    P.setProperty('LINE_SENT', JSON.stringify(seen.slice(-400)));
    P.setProperty('LINE_LAST', JSON.stringify(sum));
    return sum;
  } catch (e) {
    sum.error = String(e && e.message || e);
    P.setProperty('LINE_LAST', JSON.stringify(sum));
    return sum;
  } finally { lock.releaseLock(); }
}

/* ── คำสั่งจากหน้าตั้งค่า (ผู้ดูแลระบบเท่านั้น) ────────────────── */
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
    return {
      tokenSet: !!token,
      bot: bot && { name: bot.displayName || '', id: bot.basicId || '', error: bot.error || '' },
      trigger: ScriptApp.getProjectTriggers().some(function (t) { return t.getHandlerFunction() === 'lineTick'; }),
      watermark: P.getProperty('LINE_WATERMARK') || '',
      last: JSON.parse(P.getProperty('LINE_LAST') || 'null'),
      importable: !!P.getProperty('FLIGHTPLAN_EXEC_URL'),
    };
  }

  // เปิด/ปิดตัวตั้งเวลา — เปิดครั้งแรกเริ่มนับจาก "ตอนนี้" งานเก่าไม่ถูกส่งย้อนหลัง
  if (op === 'trigger') {
    ScriptApp.getProjectTriggers().forEach(function (t) { if (t.getHandlerFunction() === 'lineTick') ScriptApp.deleteTrigger(t); });
    if (body.on) {
      if (!P.getProperty('LINE_WATERMARK')) P.setProperty('LINE_WATERMARK', new Date().toISOString());
      ScriptApp.newTrigger('lineTick').timeBased().everyMinutes(1).create();
    }
    return { trigger: !!body.on, watermark: P.getProperty('LINE_WATERMARK') || '' };
  }

  if (op === 'run') return lineTick();

  // ส่งทดสอบถึงคนเดียว — ไม่สนสวิตช์ส่งจริง เพราะคนกดปุ่มทดสอบตั้งใจให้ส่ง
  if (op === 'test') {
    var to = String(body.line || '');
    if (!/^U[0-9a-f]{32}$/.test(to)) throw new Error('LINE user ID ต้องขึ้นต้นด้วย U ตามด้วยตัวอักษร 32 ตัว');
    var text = String(body.text || 'ทดสอบการแจ้งเตือนจาก D-0507 Forms').slice(0, 1000);
    var res = linePush_(to, text);
    lineLog_({ taskId: '', event: 'test', toUid: String(body.uid || ''), toName: String(body.name || ''),
               sent: res.ok, test: true, text: text, reason: res.reason, byUid: who.uid });
    return res;
  }

  // ตั้ง token — รับเข้าอย่างเดียว ไม่มีทางอ่านกลับ
  if (op === 'token') {
    var tk = String(body.token || '').trim();
    if (body.clear) { P.deleteProperty('LINE_CHANNEL_ACCESS_TOKEN'); return { tokenSet: false }; }
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
    return { people: (j.settings.recipients || []).filter(function (r) { return /^U[0-9a-f]{32}$/.test(String(r.lineUserId || '')); })
      .map(function (r) { return { name: String(r.name || ''), line: String(r.lineUserId), role: r.role || '', active: r.active !== false }; }) };
  }

  throw new Error('ไม่รู้จักคำสั่ง: ' + op);
}
