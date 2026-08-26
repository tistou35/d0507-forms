/**
 * D-0507 Forms — เปิดบัญชีเจ้าหน้าที่ใหม่
 *
 * ── ทำไมต้องทำฝั่งเซิร์ฟเวอร์ ────────────────────────────────
 * createUserWithEmailAndPassword() ในเบราว์เซอร์ "สลับ" ผู้ใช้ที่ล็อกอินอยู่
 * ไปเป็นบัญชีที่เพิ่งสร้าง ผู้ดูแลที่กดเพิ่มคนจึงหลุดออกจากบัญชีตัวเองทันที
 * แล้วเขียน users/{uid} ต่อไม่ได้เพราะกลายเป็นคนอื่นไปแล้ว
 *
 * ตัวนี้เรียก Identity Toolkit จากฝั่งนี้แทน เบราว์เซอร์จึงยังเป็นผู้ดูแลคนเดิม
 * และเอา uid ที่ได้ไปเขียนโปรไฟล์กับบทบาทต่อได้เลย
 *
 * ── ใครเรียกได้ ─────────────────────────────────────────────
 * เจ้าหน้าที่ที่ล็อกอินแล้วเท่านั้น — นักเรียนที่ล็อกอินแบบ anonymous ถูกกันออก
 * (เว็บแอปนี้เปิด ANYONE_ANONYMOUS เพราะนักเรียนต้องส่งฟอร์มได้)
 *
 * ⚠️ ไม่ได้ตั้งบทบาทให้ที่นี่ — คืนแค่ uid ส่วน users/{uid} เขียนจากเบราว์เซอร์
 *    ด้วยสิทธิ์ของผู้ดูแลตามกฎใน firestore.rules ที่เดียว ไม่ให้มีสองทางเขียน
 */

/** สร้างบัญชีอีเมล/รหัสผ่าน คืน uid · ถ้ามีอีเมลนี้อยู่แล้วคืน uid เดิม */
function createStaff_(email, password) {
  email = String(email || '').trim().toLowerCase();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) throw new Error('อีเมลไม่ถูกต้อง');
  /* 6 ตัวอักษรคือขั้นต่ำที่ Firebase ยอมรับ และเป็นรหัสตั้งต้นที่ต้องบอกกันด้วยปาก
     หรือพิมพ์ใส่กระดาษส่งให้ จึงจำกัดเป็นตัวอักษรกับตัวเลขล้วน — เครื่องหมาย
     พิเศษทำให้อ่านผิดและพิมพ์ผิดตอนส่งต่อ เจ้าตัวเปลี่ยนเป็นอะไรก็ได้ทีหลัง */
  if (!/^[A-Za-z0-9]{6,}$/.test(String(password || '')))
    throw new Error('รหัสผ่านตั้งต้นต้องเป็นตัวอักษรและตัวเลขล้วน อย่างน้อย 6 ตัว');

  var key = cfg_('FIREBASE_API_KEY');
  var res = UrlFetchApp.fetch(
    'https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=' + key,
    { method: 'post', contentType: 'application/json', muteHttpExceptions: true,
      payload: JSON.stringify({ email: email, password: password, returnSecureToken: false }) });
  var out = JSON.parse(res.getContentText());

  if (out.error) {
    /* อีเมลซ้ำไม่ใช่ความผิดพลาด — ผู้ดูแลมักกดเพิ่มคนที่เคยมีบัญชีแล้ว
       เพื่อจะตั้งบทบาทให้ คืน uid เดิมไปให้เขียนโปรไฟล์ทับได้ */
    if (out.error.message === 'EMAIL_EXISTS') {
      return { uid: lookupUid_(email), email: email, created: false };
    }
    throw new Error(idpMsg_(out.error.message));
  }
  return { uid: out.localId, email: email, created: true };
}

/** หา uid จากอีเมล — ใช้ตอนบัญชีมีอยู่แล้ว */
function lookupUid_(email) {
  var res = UrlFetchApp.fetch(
    'https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=' + cfg_('FIREBASE_API_KEY'),
    { method: 'post', contentType: 'application/json', muteHttpExceptions: true,
      payload: JSON.stringify({ email: [email] }) });
  var out = JSON.parse(res.getContentText());
  if (!out.users || !out.users.length) throw new Error('มีอีเมลนี้อยู่แล้วแต่หา uid ไม่เจอ');
  return out.users[0].localId;
}

/** ข้อความจาก Identity Toolkit เป็นรหัสภาษาอังกฤษ — แปลให้คนกรอกอ่านรู้เรื่อง */
function idpMsg_(code) {
  var M = {
    INVALID_EMAIL: 'อีเมลไม่ถูกต้อง',
    WEAK_PASSWORD: 'รหัสผ่านสั้นเกินไป — ต้องอย่างน้อย 6 ตัวอักษร',
    OPERATION_NOT_ALLOWED: 'โปรเจกต์ยังไม่ได้เปิดวิธีล็อกอินด้วยอีเมล/รหัสผ่าน '
      + '— เปิดที่ Firebase Console › Authentication › Sign-in method',
    TOO_MANY_ATTEMPTS_TRY_LATER: 'สร้างถี่เกินไป รอสักครู่แล้วลองใหม่',
  };
  return M[String(code).split(' :')[0]] || ('สร้างบัญชีไม่สำเร็จ: ' + code);
}
