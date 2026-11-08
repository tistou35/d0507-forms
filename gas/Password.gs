/**
 * ตั้งรหัสผ่านชั่วคราวให้ผู้ใช้ — ผู้ดูแลระบบเท่านั้น
 *
 * ทำที่นี่เพราะการตั้งรหัสให้บัญชีของคนอื่นต้องใช้ Firebase Admin API (accounts:update)
 * เบราว์เซอร์ของผู้ดูแลทำเองไม่ได้ · สคริปต์เรียกด้วยสิทธิ์ของเจ้าของสคริปต์
 * (scope cloud-platform ใน appsscript.json — scope identitytoolkit อย่างเดียวไม่พอ ได้ "insufficient authentication scopes"
 *  เจ้าของต้องกดอนุญาตหนึ่งครั้ง ดู grantPasswordAccess)
 *
 * ขั้นตอน
 *   1) ผู้เรียกต้องอยู่ใน config/admins — อ่านด้วย token ของผู้เรียกเอง (กติกาเดียวกับหน้าเว็บ)
 *   2) ตั้งรหัส
 *   3) บันทึก adminLog ด้วย token ของผู้เรียก — กติกาบังคับว่าผู้บันทึกต้องเป็นตัวเองและเป็นผู้ดูแล
 * ไม่เก็บรหัสผ่านไว้ที่ใด ทั้งใน log และใน Firestore
 *
 * เข้าสู่ระบบด้วย Google ยังใช้ได้ตามเดิม — รหัสนี้ใช้กับการเข้าด้วยอีเมลเท่านั้น
 */
function setTempPw_(body, who) {
  var uid = String(body.uid || '');
  var pw = String(body.password || '');
  if (!/^[A-Za-z0-9_-]{6,128}$/.test(uid)) throw new Error('uid ไม่ถูกต้อง');
  if (pw.length < 8 || pw.length > 64 || /\s/.test(pw)) throw new Error('รหัสชั่วคราวต้องยาว 8–64 ตัว ไม่มีช่องว่าง');

  var admins = {};
  try { admins = fsGet_('config/admins', body.idToken); } catch (e) { throw new Error('ตรวจสิทธิ์ผู้ดูแลไม่ได้: ' + e.message); }
  if ((admins.uids || []).indexOf(who.uid) < 0) throw new Error('ต้องเป็นผู้ดูแลระบบ');
  if (uid === who.uid) throw new Error('ตั้งรหัสชั่วคราวให้บัญชีตัวเองไม่ได้ — เปลี่ยนรหัสของตัวเองที่เมนูบนหน้าเว็บ');

  var res = UrlFetchApp.fetch('https://identitytoolkit.googleapis.com/v1/projects/' + cfg_('FIREBASE_PROJECT') + '/accounts:update', {
    method: 'post', contentType: 'application/json', muteHttpExceptions: true,
    headers: adminHeaders_(),
    payload: JSON.stringify({ localId: uid, password: pw }) });
  if (res.getResponseCode() !== 200) {
    var msg = res.getContentText().slice(0, 400);
    var why = '';
    try { why = JSON.parse(res.getContentText()).error.message; } catch (e) { why = msg; }
    if (/insufficient.*scope/i.test(msg))
      throw new Error('สคริปต์ยังไม่ได้รับอนุญาตให้ตั้งรหัส — เจ้าของสคริปต์ต้องรัน grantPasswordAccess หนึ่งครั้ง (' + why + ')');
    throw new Error('ตั้งรหัสไม่สำเร็จ (' + res.getResponseCode() + '): ' + why);
  }

  var logged = true;
  try {
    fsCreate_('adminLog', body.idToken, {
      action: 'pwtemp', targetUid: uid, targetName: String(body.targetName || ''), targetEmail: String(body.targetEmail || ''),
      detail: 'ตั้งรหัสผ่านชั่วคราว · ต้องเปลี่ยนเมื่อเข้าสู่ระบบด้วยอีเมลครั้งถัดไป', byUid: who.uid, byName: String(body.byName || who.email) });
  } catch (e) { logged = false; }
  return { set: true, logged: logged };
}

/**
 * รวมบัญชี — คนเดียวกันมีบัญชีอีเมลของระบบ และเข้าด้วย Google อีกอีเมลหนึ่ง จึงได้สองบัญชี
 * ผูก Google นั้นเข้ากับบัญชีที่ใช้อยู่ เข้าด้วย Google ครั้งถัดไปจะได้ uid เดิม บทบาท ลายเซ็น และงานครบ
 *
 * ไม่ย้ายบันทึกข้อมูล เพราะใบที่ส่งแล้วและหนังสือที่ลงนามแล้วเป็นบันทึกควบคุม ห้ามเปลี่ยนชื่อผู้ทำย้อนหลัง
 * จึงรวมได้เฉพาะบัญชี Google ที่ยังไม่มีอะไรในระบบ และเป็นแค่บทบาทนักเรียนที่ระบบตั้งให้เอง
 * Firebase ให้หนึ่ง Google ผูกได้บัญชีเดียว ต้องลบบัญชีเดิมก่อนจึงผูกได้
 *
 * body.dry = true ตรวจอย่างเดียว ไม่แก้อะไร
 */
function mergeAccount_(body, who) {
  var keepUid = String(body.keepUid || '');
  var email = String(body.email || '').trim().toLowerCase();
  if (!/^[A-Za-z0-9_-]{6,128}$/.test(keepUid)) throw new Error('uid ไม่ถูกต้อง');
  if (!/^[^@\s]+@[^@\s]+$/.test(email)) throw new Error('อีเมลไม่ถูกต้อง');

  var admins = {};
  try { admins = fsGet_('config/admins', body.idToken); } catch (e) { throw new Error('ตรวจสิทธิ์ผู้ดูแลไม่ได้: ' + e.message); }
  var adminUids = admins.uids || [];
  if (adminUids.indexOf(who.uid) < 0) throw new Error('ต้องเป็นผู้ดูแลระบบ');

  var keep = acctLookup_({ localId: [keepUid] });
  if (!keep) throw new Error('ไม่พบบัญชีปลายทาง');
  var drop = acctLookup_({ email: [email] });
  if (!drop) throw new Error('ไม่พบบัญชีของ ' + email + ' — เจ้าตัวต้องเข้าสู่ระบบด้วย Google นี้หนึ่งครั้งก่อน');

  var provs = drop.providerUserInfo || [];
  var g = provs.filter(function (x) { return x.providerId === 'google.com'; })[0];
  var profile = null;
  try { profile = fsGet_('users/' + drop.localId, body.idToken); }
  catch (e) { if (e.message.indexOf('ไม่พบ') !== 0) throw e; }
  var roles = (profile && profile.roles) || [];

  var blocks = [];
  if (drop.localId === keepUid) blocks.push('เป็นบัญชีเดียวกันอยู่แล้ว');
  if (drop.localId === who.uid) blocks.push('เป็นบัญชีที่คุณกำลังใช้งานอยู่');
  if (adminUids.indexOf(drop.localId) >= 0) blocks.push('บัญชีนี้เป็นผู้ดูแลระบบ');
  if (!g || provs.length !== 1) blocks.push('รวมได้เฉพาะบัญชีที่เข้าด้วย Google อย่างเดียว');
  if ((keep.providerUserInfo || []).some(function (x) { return x.providerId === 'google.com'; }))
    blocks.push('บัญชีปลายทางผูก Google อื่นไว้แล้ว');
  if (roles.some(function (r) { return r !== 'stu'; })) blocks.push('บัญชีนี้มีบทบาทเจ้าหน้าที่: ' + roles.join(', '));
  acctRefs_(drop.localId, body.idToken).forEach(function (n) { blocks.push('มีบันทึกในระบบแล้ว: ' + n); });

  var info = { keepEmail: keep.email || '', keepUid: keepUid, dropEmail: drop.email || email, dropUid: drop.localId,
               dropName: drop.displayName || (profile && profile.name) || '', blocks: blocks, merged: false };
  if (body.dry) return info;
  if (blocks.length) throw new Error('รวมไม่ได้ — ' + blocks.join(' · '));

  var del = acctCall_('accounts:delete', { localId: drop.localId });
  if (del.code !== 200) throw new Error('ลบบัญชีเดิมไม่สำเร็จ (' + del.code + '): ' + del.why);
  var link = acctCall_('accounts:update', { localId: keepUid, linkProviderUserInfo: {
    providerId: 'google.com', rawId: g.rawId, email: g.email || drop.email || email,
    displayName: g.displayName || '', photoUrl: g.photoUrl || '' } });
  if (link.code !== 200)
    throw new Error('ลบบัญชี Google เดิมแล้วแต่ผูกไม่สำเร็จ (' + link.code + '): ' + link.why + ' — ให้เจ้าตัวเข้าด้วย Google อีกครั้งแล้วรวมใหม่');

  if (profile) UrlFetchApp.fetch('https://firestore.googleapis.com/v1/projects/' + cfg_('FIREBASE_PROJECT') +
    '/databases/(default)/documents/users/' + drop.localId,
    { method: 'delete', headers: { Authorization: 'Bearer ' + body.idToken }, muteHttpExceptions: true });

  info.merged = true; info.logged = true;
  try {
    fsCreate_('adminLog', body.idToken, {
      action: 'merge', targetUid: keepUid, targetName: String(body.targetName || ''), targetEmail: keep.email || '',
      detail: 'ผูก Google ' + (drop.email || email) + ' เข้ากับบัญชีนี้ · ลบบัญชีเดิม ' + drop.localId,
      byUid: who.uid, byName: String(body.byName || who.email) });
  } catch (e) { info.logged = false; }
  return info;
}

function acctCall_(method, payload) {
  var res = UrlFetchApp.fetch('https://identitytoolkit.googleapis.com/v1/projects/' + cfg_('FIREBASE_PROJECT') + '/' + method, {
    method: 'post', contentType: 'application/json', muteHttpExceptions: true,
    headers: adminHeaders_(), payload: JSON.stringify(payload) });
  var why = '', json = {};
  try { json = JSON.parse(res.getContentText()); why = (json.error && json.error.message) || ''; } catch (e) { why = res.getContentText().slice(0, 300); }
  return { code: res.getResponseCode(), json: json, why: why };
}

function acctLookup_(q) {
  var r = acctCall_('accounts:lookup', q);
  if (r.code !== 200) throw new Error('ค้นบัญชีไม่สำเร็จ (' + r.code + '): ' + r.why);
  return (r.json.users || [])[0] || null;
}

/* บัญชีนี้มีอะไรอยู่ในระบบบ้าง — คืนชื่อรายการที่พบ ถามทีละอย่างหยุดที่แถวแรก */
function acctRefs_(uid, idToken) {
  var url = 'https://firestore.googleapis.com/v1/projects/' + cfg_('FIREBASE_PROJECT') + '/databases/(default)/documents:runQuery';
  return [
    ['submissions', 'submitterUid', 'EQUAL', 'ใบที่ส่ง'],
    ['tasks', 'assigneeUid', 'EQUAL', 'งานที่ได้รับ'],
    ['memos', 'createdBy', 'EQUAL', 'บันทึกข้อความที่จัดทำ'],
    ['memos', 'beneficiaryUid', 'EQUAL', 'หนังสือแต่งตั้ง'],
    ['memos', 'signers.proposer.uid', 'EQUAL', 'บันทึกข้อความที่เป็นผู้เสนอ'],
    ['memos', 'signers.endorser.uid', 'EQUAL', 'บันทึกข้อความที่เป็นผู้สั่งการ'],
    ['memos', 'recipientUids', 'ARRAY_CONTAINS', 'หนังสือเวียนที่ต้องรับทราบ']
  ].filter(function (q) {
    var res = UrlFetchApp.fetch(url, { method: 'post', contentType: 'application/json', muteHttpExceptions: true,
      headers: { Authorization: 'Bearer ' + idToken },
      payload: JSON.stringify({ structuredQuery: { from: [{ collectionId: q[0] }], limit: 1,
        where: { fieldFilter: { field: { fieldPath: q[1] }, op: q[2], value: { stringValue: uid } } } } }) });
    if (res.getResponseCode() !== 200) throw new Error('ตรวจ ' + q[3] + ' ไม่ได้ (' + res.getResponseCode() + ')');
    return JSON.parse(res.getContentText()).some(function (r) { return r.document; });
  }).map(function (q) { return q[3]; });
}

/* เพิ่มเอกสารใหม่ใน Firestore ด้วย token ของผู้เรียก · ช่อง at = เวลาเซิร์ฟเวอร์ */
function fsCreate_(coll, idToken, data) {
  var base = 'projects/' + cfg_('FIREBASE_PROJECT') + '/databases/(default)/documents';
  var id = Utilities.getUuid().replace(/-/g, '').slice(0, 20);
  var fields = {};
  Object.keys(data).forEach(function (k) { fields[k] = { stringValue: String(data[k]) }; });
  var res = UrlFetchApp.fetch('https://firestore.googleapis.com/v1/' + base + ':commit', {
    method: 'post', contentType: 'application/json', muteHttpExceptions: true,
    headers: { Authorization: 'Bearer ' + idToken },
    payload: JSON.stringify({ writes: [{
      update: { name: base + '/' + coll + '/' + id, fields: fields },
      updateTransforms: [{ fieldPath: 'at', setToServerValue: 'REQUEST_TIME' }],
      currentDocument: { exists: false } }] }) });
  if (res.getResponseCode() !== 200) throw new Error('บันทึก ' + coll + ' ไม่ได้ (' + res.getResponseCode() + ')');
}

/**
 * รันหนึ่งครั้งจากหน้าแก้ไข Apps Script (เจ้าของสคริปต์) เพื่อกดอนุญาต scope cloud-platform
 * แล้วตรวจว่าเรียก Firebase Admin API ได้จริง — อ่านข้อมูลบัญชีของผู้ดูแลคนแรกหนึ่งบัญชี ไม่แก้อะไร
 */
function grantPasswordAccess() {
  var res = UrlFetchApp.fetch('https://identitytoolkit.googleapis.com/v1/projects/' + cfg_('FIREBASE_PROJECT') + '/accounts:query', {
    method: 'post', contentType: 'application/json', muteHttpExceptions: true,
    headers: adminHeaders_(),
    payload: JSON.stringify({ returnUserInfo: false }) });
  Logger.log('Firebase Admin API: %s %s', res.getResponseCode(), res.getContentText().slice(0, 400));
  if (res.getResponseCode() !== 200) {
    var why = res.getContentText().slice(0, 400);
    try { why = JSON.parse(res.getContentText()).error.message; } catch (e) {}
    throw new Error('ยังเรียกไม่ได้ (' + res.getResponseCode() + '): ' + why);
  }
  return 'พร้อมใช้ — ตั้งรหัสชั่วคราวจากหน้าตั้งค่าระบบได้แล้ว';
}

/* token ของเจ้าของสคริปต์ออกในนามโปรเจกต์ Cloud ที่ Apps Script สร้างเอง ซึ่งไม่ได้เปิด Identity Toolkit API
   x-goog-user-project ให้คิดโควตาและตรวจ API กับโปรเจกต์ Firebase แทน (เจ้าของต้องมีสิทธิ์ในโปรเจกต์นั้น) */
function adminHeaders_() {
  return { Authorization: 'Bearer ' + ScriptApp.getOAuthToken(), 'x-goog-user-project': cfg_('FIREBASE_PROJECT') };
}
