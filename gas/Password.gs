/**
 * ตั้งรหัสผ่านชั่วคราวให้ผู้ใช้ — ผู้ดูแลระบบเท่านั้น
 *
 * ทำที่นี่เพราะการตั้งรหัสให้บัญชีของคนอื่นต้องใช้ Firebase Admin API (accounts:update)
 * เบราว์เซอร์ของผู้ดูแลทำเองไม่ได้ · สคริปต์เรียกด้วยสิทธิ์ของเจ้าของสคริปต์
 * (scope identitytoolkit ใน appsscript.json — เจ้าของต้องกดอนุญาตหนึ่งครั้ง ดู grantPasswordAccess)
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
  if (!/^[A-Za-z0-9]{6,128}$/.test(uid)) throw new Error('uid ไม่ถูกต้อง');
  if (pw.length < 8 || pw.length > 64 || /\s/.test(pw)) throw new Error('รหัสชั่วคราวต้องยาว 8–64 ตัว ไม่มีช่องว่าง');

  var admins = {};
  try { admins = fsGet_('config/admins', body.idToken); } catch (e) { throw new Error('ตรวจสิทธิ์ผู้ดูแลไม่ได้: ' + e.message); }
  if ((admins.uids || []).indexOf(who.uid) < 0) throw new Error('ต้องเป็นผู้ดูแลระบบ');
  if (uid === who.uid) throw new Error('ตั้งรหัสชั่วคราวให้บัญชีตัวเองไม่ได้ — เปลี่ยนรหัสของตัวเองที่เมนูบนหน้าเว็บ');

  var res = UrlFetchApp.fetch('https://identitytoolkit.googleapis.com/v1/projects/' + cfg_('FIREBASE_PROJECT') + '/accounts:update', {
    method: 'post', contentType: 'application/json', muteHttpExceptions: true,
    headers: { Authorization: 'Bearer ' + ScriptApp.getOAuthToken() },
    payload: JSON.stringify({ localId: uid, password: pw }) });
  if (res.getResponseCode() !== 200) {
    var msg = res.getContentText().slice(0, 300);
    if (res.getResponseCode() === 403 || /insufficient|scope/i.test(msg))
      throw new Error('สคริปต์ยังไม่ได้รับอนุญาตให้ตั้งรหัส — เจ้าของสคริปต์ต้องเปิด Apps Script แล้วรัน grantPasswordAccess หนึ่งครั้ง');
    throw new Error('ตั้งรหัสไม่สำเร็จ (' + res.getResponseCode() + '): ' + msg);
  }

  var logged = true;
  try {
    fsCreate_('adminLog', body.idToken, {
      action: 'pwtemp', targetUid: uid, targetName: String(body.targetName || ''), targetEmail: String(body.targetEmail || ''),
      detail: 'ตั้งรหัสผ่านชั่วคราว · ต้องเปลี่ยนเมื่อเข้าสู่ระบบด้วยอีเมลครั้งถัดไป', byUid: who.uid, byName: String(body.byName || who.email) });
  } catch (e) { logged = false; }
  return { set: true, logged: logged };
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
 * รันหนึ่งครั้งจากหน้าแก้ไข Apps Script (เจ้าของสคริปต์) เพื่อกดอนุญาต scope identitytoolkit
 * แล้วตรวจว่าเรียก Firebase Admin API ได้จริง — อ่านข้อมูลบัญชีของผู้ดูแลคนแรกหนึ่งบัญชี ไม่แก้อะไร
 */
function grantPasswordAccess() {
  var res = UrlFetchApp.fetch('https://identitytoolkit.googleapis.com/v1/projects/' + cfg_('FIREBASE_PROJECT') + '/accounts:query', {
    method: 'post', contentType: 'application/json', muteHttpExceptions: true,
    headers: { Authorization: 'Bearer ' + ScriptApp.getOAuthToken() },
    payload: JSON.stringify({ returnUserInfo: false }) });
  Logger.log('Firebase Admin API: %s %s', res.getResponseCode(), res.getContentText().slice(0, 200));
  if (res.getResponseCode() !== 200) throw new Error('ยังเรียกไม่ได้ — บัญชีเจ้าของสคริปต์ต้องมีสิทธิ์ในโปรเจกต์ Firebase');
  return 'พร้อมใช้ — ตั้งรหัสชั่วคราวจากหน้าตั้งค่าระบบได้แล้ว';
}
