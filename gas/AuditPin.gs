/**
 * PIN ชั่วคราวของ Audit Portal — โปรเจกต์ Firebase d0507-audit (คนละโปรเจกต์กับระบบฟอร์ม)
 *
 * ผู้ดูแลทีมตรวจตั้ง PIN ให้บัญชีของคนอื่นได้ รวมถึงบัญชีที่มีอยู่แล้ว (เช่นบัญชีที่เข้าด้วย Google)
 * เบราว์เซอร์ทำเองไม่ได้ เพราะต้องใช้ Firebase Admin API (accounts:update) — ใช้สิทธิ์ของเจ้าของสคริปต์
 * ผ่าน scope cloud-platform ที่อนุญาตไว้แล้วสำหรับ Password.gs
 *
 * ขั้นตอน
 *   1) ตรวจ idToken ของผู้เรียกกับโปรเจกต์ d0507-audit (ไม่ใช่โปรเจกต์ฟอร์ม)
 *   2) ผู้เรียกต้องเป็นผู้ดูแลทีม — BOOT หรือ team/{email} ที่ active และมีตำแหน่ง admin
 *      อ่านด้วย token ของผู้เรียกเอง จึงอยู่ภายใต้ Security Rules ของ audit เหมือนหน้าเว็บ
 *   3) ไม่มีบัญชี → สร้างด้วยอีเมล + PIN · มีบัญชี → ตั้งรหัสเป็น PIN (การเข้าด้วย Google ยังใช้ได้)
 * หน้าเว็บตั้ง team/{email}.mustChange = true เอง เจ้าตัวเข้าด้วย PIN แล้วต้องตั้งใหม่ก่อนใช้งาน
 * ไม่เก็บ PIN ไว้ที่ใด
 */
var AUDIT_PROJECT = 'd0507-audit';
var AUDIT_API_KEY = 'AIzaSyB_O40YpkQJJQIpx8gWNdiC9XrZ1o9SlHs';   // ค่าสาธารณะเดียวกับในหน้าเว็บของ Audit Portal
var AUDIT_BOOT = ['tistou35@gmail.com'];                         // ต้องตรงกับ BOOT ใน account_page.html และ rules

function auditTempPin_(body) {
  var r = UrlFetchApp.fetch('https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=' + AUDIT_API_KEY, {
    method: 'post', contentType: 'application/json', muteHttpExceptions: true,
    payload: JSON.stringify({ idToken: body.idToken }) });
  if (r.getResponseCode() !== 200) throw new Error('idToken ของ Audit Portal ไม่ผ่านการตรวจสอบ — เข้าสู่ระบบใหม่');
  var me = (JSON.parse(r.getContentText()).users || [])[0];
  if (!me || !me.email) throw new Error('ต้องเข้าสู่ระบบด้วยบัญชีที่มีอีเมล');
  var myEmail = me.email.toLowerCase();

  if (AUDIT_BOOT.indexOf(myEmail) < 0) {
    var t = auditDoc_('team/' + encodeURIComponent(myEmail), body.idToken);
    if (!t || t.active === false || (t.roles || []).indexOf('admin') < 0) throw new Error('ต้องเป็นผู้ดูแลทีมตรวจ');
  }

  var email = String(body.email || '').trim().toLowerCase();
  var pin = String(body.pin || '');
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) throw new Error('อีเมลไม่ถูกต้อง');
  if (!/^\d{8}$/.test(pin)) throw new Error('PIN ต้องเป็นตัวเลข 8 หลัก');
  if (email === myEmail) throw new Error('ตั้ง PIN ให้บัญชีตัวเองไม่ได้ — ตั้งเองที่ บัญชีของฉัน');

  var look = auditAcct_('accounts:lookup', { email: [email] });
  if (look.code !== 200) throw new Error('ค้นบัญชีไม่สำเร็จ (' + look.code + '): ' + look.why);
  var u = (look.json.users || [])[0];
  if (!u) {
    var c = auditAcct_('accounts', { email: email, password: pin });
    if (c.code !== 200) throw new Error('สร้างบัญชีไม่สำเร็จ (' + c.code + '): ' + c.why);
    return { set: true, created: true };
  }
  if (u.disabled) throw new Error('บัญชีนี้ถูกปิดใช้งานใน Firebase');
  var up = auditAcct_('accounts:update', { localId: u.localId, password: pin });
  if (up.code !== 200) {
    if (/insufficient.*scope/i.test(up.why)) throw new Error('สคริปต์ยังไม่ได้รับอนุญาต — เจ้าของสคริปต์ต้องรัน grantPasswordAccess หนึ่งครั้ง (' + up.why + ')');
    throw new Error('ตั้ง PIN ไม่สำเร็จ (' + up.code + '): ' + up.why);
  }
  return { set: true, created: false,
           google: (u.providerUserInfo || []).some(function (x) { return x.providerId === 'google.com'; }) };
}

function auditAcct_(method, payload) {
  var res = UrlFetchApp.fetch('https://identitytoolkit.googleapis.com/v1/projects/' + AUDIT_PROJECT + '/' + method, {
    method: 'post', contentType: 'application/json', muteHttpExceptions: true,
    headers: { Authorization: 'Bearer ' + ScriptApp.getOAuthToken(), 'x-goog-user-project': AUDIT_PROJECT },
    payload: JSON.stringify(payload) });
  var why = '', json = {};
  try { json = JSON.parse(res.getContentText()); why = (json.error && json.error.message) || ''; } catch (e) { why = res.getContentText().slice(0, 300); }
  return { code: res.getResponseCode(), json: json, why: why };
}

/* อ่านเอกสารใน Firestore ของ d0507-audit ด้วย token ของผู้เรียก · ไม่พบคืน null */
function auditDoc_(path, idToken) {
  var res = UrlFetchApp.fetch('https://firestore.googleapis.com/v1/projects/' + AUDIT_PROJECT + '/databases/(default)/documents/' + path,
    { headers: { Authorization: 'Bearer ' + idToken }, muteHttpExceptions: true });
  if (res.getResponseCode() === 404) return null;
  if (res.getResponseCode() !== 200) throw new Error('ตรวจสิทธิ์ผู้ดูแลทีมไม่ได้ (' + res.getResponseCode() + ')');
  return fsFields_(JSON.parse(res.getContentText()).fields || {});
}
