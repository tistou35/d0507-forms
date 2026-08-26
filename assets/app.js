/* ============================================================
   app.js — โค้ดร่วมทุกหน้าของ d0507-forms
   · auth (โปรเจกต์ Firebase ของ d0507-forms เอง — แยกจาก d0507-audit)
   · ตัวจับคู่คำค้นที่รองรับภาษาไทย (ไม่มีช่องว่างระหว่างคำ)
   · ตัวช่วยเรื่องปลายทางของฟอร์ม
   ============================================================ */
(function (g) {
  'use strict';

  const A = {};
  A.esc = s => String(s == null ? '' : s).replace(/[&<>"']/g,
    c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  A.user = null;
  A.roles = [];
  A.reg = null;        // ตั้งค่าโดยหน้าเว็บ — เริ่มจากชุดสาธารณะ
  A.full = false;      // true เมื่อโหลดทะเบียนเต็มจาก Firestore สำเร็จ
  A.isStaff = () => !!A.user && !A.user.isAnonymous;
  /* admin = แก้ทะเบียน นิยามฟอร์ม ผังผู้อนุมัติ ตั้งค่าระบบได้
     รายชื่ออยู่ที่ config/admins — ยังไม่มีเอกสารนั้น = เจ้าหน้าที่ทุกคนเป็น admin ชั่วคราว
     (ต้องตรงกับ rules ไม่งั้นหน้าจอโชว์ปุ่มที่กดแล้วโดนปฏิเสธ) */
  A.admins = null;
  A.isAdmin = () => A.isStaff() && (A.admins === null || !A.admins.length
                                    || A.admins.indexOf(A.user.uid) >= 0);

  /* ── auth ─────────────────────────────────────────────── */
  A.initAuth = function (cfg, onChange) {
    if (!g.firebase) return;
    if (!firebase.apps.length) firebase.initializeApp(cfg);
    A.db = firebase.firestore();
    /* เขียนตอนไม่มีเน็ตได้ แล้ว Firestore ส่งเองเมื่อสัญญาณกลับมา
       นักบินกรอกใบทดสอบการบินบนเครื่อง กดส่งตอนยังไม่มีสัญญาณ ใบต้องไม่หาย
       ล้มเหลวได้สองทางที่ยอมรับได้: เปิดหลายแท็บ (แท็บแรกได้สิทธิ์) หรือ
       เบราว์เซอร์ไม่รองรับ — ทั้งสองกรณีระบบยังทำงานปกติเมื่อมีเน็ต */
    if (!A._persist) {
      A._persist = A.db.enablePersistence({ synchronizeTabs: true })
        .then(() => { A.offlineReady = true; })
        .catch(e => {
          A.offlineReady = false;
          console.warn('[offline] เก็บข้อมูลในเครื่องไม่ได้ — ต้องมีเน็ตตอนส่ง', e.code || e.message);
        });
    }
    firebase.auth().onAuthStateChanged(async u => {
      A.user = (u && !u.isAnonymous) ? u : null;
      A.roles = [];
      if (A.user) {
        try {
          const d = await A.db.collection('users').doc(A.user.uid).get();
          if (d.exists && Array.isArray(d.data().roles)) A.roles = d.data().roles;
        } catch (e) { /* ยังไม่มี users/{uid} หรือ rule ไม่อนุญาต */ }
      }
      A.admins = null;
      if (A.user) {
        try {
          const d = await A.db.collection('config').doc('admins').get();
          A.admins = (d.exists && d.data().uids) || [];
        } catch (e) { A.admins = null; }
      }
      A.full = false;
      if (A.user && A.reg) await A.hydrate();
      A.paintAuth();
      if (onChange) onChange(A.user, A.roles);
    });
  };
  /* ทะเบียนเต็ม (มี control code · สถานะ LEF · หมายเหตุ) อ่านได้เฉพาะเจ้าหน้าที่
     เก็บที่ registry/current ใน Firestore ไม่ฝังในไฟล์ที่ host แบบสาธารณะ
     mutate ออบเจ็กต์เดิมเพื่อให้หน้าที่อ้างถึงอยู่แล้วเห็นค่าใหม่ทันที */
  A.hydrate = async function () {
    try {
      const d = await A.db.collection('registry').doc('current').get();
      if (!d.exists) return;
      const full = d.data();
      if (full.forms) { A.reg.forms.length = 0; full.forms.forEach(f => A.reg.forms.push(f)); }
      if (full.status) Object.assign(A.reg.status, full.status);
      if (full.lefcount) Object.assign(A.reg.lefcount, full.lefcount);
      A.full = true;
    } catch (e) { /* ยังไม่ได้อัปโหลดทะเบียน หรือ rule ไม่อนุญาต — ใช้ชุดสาธารณะต่อไป */ }
  };

  A.login  = () => firebase.auth().signInWithPopup(new firebase.auth.GoogleAuthProvider()).catch(e => alert(e.message));
  A.loginEmail = (em, pw) => firebase.auth().signInWithEmailAndPassword(em, pw).catch(e => alert(e.message));
  A.signup = (em, pw) => firebase.auth().createUserWithEmailAndPassword(em, pw).catch(e => alert(e.message));
  A.logout = () => firebase.auth().signOut();

  /* แถบผู้ใช้ + ซ่อนเมนูของเจ้าหน้าที่เมื่อยังไม่ login */
  A.paintAuth = function () {
    const box = document.getElementById('authbox');
    const base = (g.BASE || '');
    if (box) {
      box.innerHTML = A.isStaff()
        ? `<span class="acct"><span class="av">${A.esc((A.user.displayName || A.user.email || '?').slice(0, 2).toUpperCase())}</span>
             <span class="who"><b>${A.esc(A.user.displayName || A.user.email)}</b>
             <span>${A.roles.length ? A.esc(A.roleNames().join(' · ')) : A.esc(A.t('noRole'))}</span></span></span>
           <a class="acct" href="#" onclick="D0507.logout();return false" style="padding:0 16px">
             <span class="who"><b>${A.esc(A.t('signOut'))}</b><span>${A.esc(A.t('signOutSub'))}</span></span></a>`
        : `<a class="acct" href="${base}staff-login/?next=${
             encodeURIComponent(location.pathname + location.search)}" style="padding:0 16px">
             <span class="who"><b>${A.esc(A.t('signIn'))}</b><span>${A.esc(A.t('signInSub'))}</span></span></a>`;
    }
    document.querySelectorAll('.staffonly').forEach(el => el.classList.toggle('hide', !A.isStaff()));
    document.querySelectorAll('.adminonly').forEach(el => el.classList.toggle('hide', !A.isAdmin()));
  };

  A.ROLE_N = {
    stu: { th: 'นักเรียน', en: 'Student' },
    ins: { th: 'ครูการบิน / ครูภาคทฤษฎี', en: 'Flight / theoretical knowledge instructor' },
    mnt: { th: 'ช่างอากาศยาน', en: 'Aircraft maintenance' },
    ops: { th: 'ฝ่ายปฏิบัติการ', en: 'Flight operations' },
    mgt: { th: 'ฝ่ายบริหาร', en: 'Management' },
  };
  A.roleNames = () => A.roles.map(r => A.L(A.ROLE_N[r]) || r);

  /* คนหนึ่งคนถือได้หลายตำแหน่ง — ครูที่เป็นผู้จัดการฝ่ายมาตรฐานด้วย, ช่างที่ทำ
     dispatch ด้วย users/{uid}.roles จึงเป็น array มาแต่แรก แต่หน้าหลักเดิม
     หยิบแค่ roles[0] ทั้งที่ป้ายบอกว่า "ตามบทบาท A · B" — เห็นแค่ครึ่งเดียว
     ของงานตัวเอง สองตัวนี้คือจุดเดียวที่ทั้งระบบใช้ตัดสินว่า "ของฉัน" คืออะไร */
  A.myRoles = () => A.roles.filter(r => A.ROLE_N[r]);

  /* หน้าที่ของ f สำหรับคนคนนี้ ถ้าถือหลายตำแหน่งและมีหน้าที่ต่างกันในใบเดียวกัน
     ให้ขึ้นชื่อตำแหน่งกำกับ จะได้รู้ว่ากำลังกรอกในฐานะอะไร
     roles ที่ส่งเข้ามาว่าง = ยังไม่ login ให้ใช้มุมนักเรียน */
  A.dutyFor = function (f, roles) {
    if (!f || !f.r) return '';
    /* ยังไม่ login = ชุดสาธารณะ ซึ่ง build.py เหลือหน้าที่ไว้บทบาทเดียวอยู่แล้ว
       ใช้บทบาทที่ติดมากับใบนั้น ไม่ใช่เดาว่าเป็น stu เสมอ — PWR เป็นของผู้โดยสาร
       EFM เป็นของผู้สมัครเป็นครู ไม่ใช่ของนักเรียนทั้งคู่ */
    const rr = (roles && roles.length ? roles : Object.keys(f.r)).filter(r => f.r[r]);
    if (!rr.length) return '';
    if (rr.length === 1) return f.r[rr[0]];
    const seen = [];
    rr.forEach(r => { if (seen.indexOf(f.r[r]) < 0) seen.push(f.r[r]); });
    if (seen.length === 1) return seen[0];
    return rr.map(r => (A.L(A.ROLE_N[r]) || r) + ': ' + f.r[r]).join(' · ');
  };

  /* ── ภาษา ──────────────────────────────────────────────
     เอกสารควบคุมของ CAAT เป็นภาษาอังกฤษ แต่คนกรอกอ่านไทย
     จึงต้องสลับได้ โดยที่ทะเบียนและนิยามฟอร์มเก็บทั้งสองภาษาไว้ในไฟล์เดียว

     L() รับได้ทั้ง {th,en} และสตริงเปล่า ๆ (ของเก่าที่ยังไม่ได้แปลง)
     และ fallback ไปภาษาที่มีเสมอ — ไม่มีทางได้ช่องว่างเพราะขาดคำแปล */
  A.LANGS = ['th', 'en'];
  A.lang = 'th';
  try {
    const s = localStorage.getItem('d0507_lang');
    if (A.LANGS.indexOf(s) >= 0) A.lang = s;
  } catch (e) { /* โหมดส่วนตัวปิด localStorage ไว้ — ใช้ค่าตั้งต้น */ }

  A.L = (o, lang) => typeof o === 'string' ? o
    : (o && (o[lang || A.lang] || o.th || o.en)) || '';
  A.t = (k, lang) => A.L(A.T[k], lang) || k;
  A.other = () => A.lang === 'th' ? 'en' : 'th';
  A.nm = f => A.lang === 'en' ? (f.t || f.th || f.abbr) : (f.th || f.t || f.abbr);
  /* ทะเบียนเก็บอังกฤษไว้ใน key แยก (n/en, d/den) ไม่ใช่ {th,en} — ของเดิมก่อนมีระบบสองภาษา */
  A.n2 = (o, k) => !o ? '' : (A.lang === 'en' ? (o[(k || 'n') === 'n' ? 'en' : 'den'] || o[k || 'n']) : o[k || 'n']) || '';

  A.T = {
    langTh:     { th: 'ไทย', en: 'ไทย' },
    langEn:     { th: 'EN', en: 'EN' },
    signIn:     { th: 'เข้าสู่ระบบเจ้าหน้าที่', en: 'Staff sign in' },
    signInSub:  { th: 'Staff sign in', en: 'เจ้าหน้าที่' },
    signOut:    { th: 'ออก', en: 'Sign out' },
    signOutSub: { th: 'Sign out', en: 'ออกจากระบบ' },
    noRole:     { th: 'ยังไม่ได้กำหนดบทบาท', en: 'No role assigned yet' },
    helpTitle:  { th: 'ไม่รู้ว่าต้องใช้ฟอร์มไหน?', en: 'Not sure which form you need?' },
    helpBody:   { th: 'พิมพ์สิ่งที่อยากทำในช่องค้นหา ระบบจะหาให้ข้ามทุกระบบ',
                  en: 'Type what you want to do in the search box — it looks across every system.' },
    notFound:   { th: 'ไม่พบฟอร์มนี้', en: 'Form not found' },
    navPubs:    { th: 'เช็กลิสต์และเอกสาร', en: 'Checklists · Publications' },
    pubs:       { th: 'เช็กลิสต์และเอกสาร', en: 'Checklists & publications' },
    pubsSub:    { th: 'เอกสารที่ต้องพิมพ์ไปใช้ — ระบบคุมว่าฉบับไหนเป็นฉบับปัจจุบัน แผนภูมิการบินคุมตามรอบ AIRAC',
                  en: 'Documents you print and carry — the system tracks which edition is current. Charts follow the AIRAC cycle.' },
    printList:  { th: 'พิมพ์รายการ', en: 'Print list' },
    noDefTitle: { th: 'ฟอร์มนี้ยังไม่ได้ใส่ช่องกรอก', en: 'This form has no fields yet' },
    noDefBody:  { th: 'โครงระบบและตัวเรนเดอร์พร้อมแล้ว รอใส่นิยามฟอร์มที่',
                  en: 'The system and renderer are ready — waiting on a form definition at' },
    noDefBody2: { th: 'ตามแบบมาตรฐานใน', en: 'following the standard in' },
    noDefBody3: { th: '— เพิ่มไฟล์แล้ว build ก็ใช้ได้ทันที ไม่ต้องแก้โค้ด',
                  en: '— add the file, rebuild, and it works. No code change needed.' },
    backToForm: { th: 'กลับหน้าฟอร์ม', en: 'Back to form' },
    incomplete: { th: 'ยังกรอกไม่ครบ', en: 'Still incomplete' },
    send:       { th: 'ส่งฟอร์ม', en: 'Submit form' },
    cancel:     { th: 'ยกเลิก', en: 'Cancel' },
    docCode:    { th: 'รหัสเอกสาร', en: 'Doc code' },
    issueRev:   { th: 'ฉบับ / แก้ไข', en: 'Issue / Rev' },
    effective:  { th: 'วันที่มีผล', en: 'Effective' },

    /* เมนูและแบรนด์ — คู่ไทย/อังกฤษที่แสดงพร้อมกันสองบรรทัด
       data-t  = ภาษาที่เลือก (บรรทัดหลัก) · data-t2 = อีกภาษา (บรรทัดรอง) */
    brand:      { th: 'ระบบฟอร์มออนไลน์', en: 'Forms & Approvals' },
    menu:       { th: 'เมนู', en: 'Menu' },
    navHome:    { th: 'หน้าหลัก', en: 'Home' },
    navAll:     { th: 'คลังฟอร์ม', en: 'All forms' },
    navQueue:   { th: 'งานของฉัน', en: 'My queue' },
    navReg:     { th: 'ทะเบียนเอกสาร', en: 'Register · LEF' },
    navRegSh:   { th: 'ทะเบียน', en: 'Register' },
    navForms:   { th: 'จัดการฟอร์ม', en: 'Form management' },
    navSetup:   { th: 'ตั้งค่าระบบ', en: 'Admin setup' },
    navAprv:    { th: 'ผังผู้อนุมัติ', en: 'Approvals' },
    navAudit:   { th: 'งานตรวจสอบ', en: 'Audit' },
    navDrc:     { th: 'แจกจ่ายเอกสาร', en: 'Distribution · DRC' },
    auditNote:  { th: 'Audit ↗ login แยก', en: 'งานตรวจสอบ ↗ แยก login' },
    searchPh:   { th: 'ค้นหาฟอร์ม', en: 'Search forms' },
    thisSystem: { th: 'ระบบนี้', en: 'This system' },
    allForms:   { th: 'คลังฟอร์ม', en: 'All forms' },
    allFormsN:  { th: n => 'ฟอร์มทั้งหมด ' + n + ' ฟอร์ม', en: n => n + ' form' + (n === 1 ? '' : 's') },
    allSub:     { th: 'รายการเดียว กรองได้ตามกลุ่มผู้ใช้ ระบบที่ฟอร์มอยู่ และสถานะเอกสาร',
                  en: 'One list — filter by user group, host system, and document status.' },
    searchAll:  { th: 'ค้นหา — ชื่อฟอร์ม รหัสเอกสาร หรือสิ่งที่อยากทำ',
                  en: 'Search — form name, doc code, or what you want to do' },
    viewAs:     { th: 'มุมมอง', en: 'View' },
    viewCard:   { th: 'การ์ด', en: 'Cards' },
    viewTable:  { th: 'ตาราง', en: 'Table' },
    allGroups:  { th: 'ทุกกลุ่ม', en: 'All groups' },
    allSystems: { th: 'ทุกระบบ', en: 'All systems' },
    allStatus:  { th: 'ทุกสถานะ', en: 'All statuses' },
    stIssue:    { th: 'เฉพาะที่มีปัญหา', en: 'Issues only' },
    stInLef:    { th: 'อยู่ใน LEF', en: 'In LEF' },
    stNotLef:   { th: 'ยังไม่อยู่ใน LEF', en: 'Not in LEF' },
    viewStaff:  { th: 'มุมมองเจ้าหน้าที่ — เห็นทั้งทะเบียน', en: 'Staff view — the whole register' },
    viewPublic: { th: 'มุมมองสาธารณะ — เฉพาะฟอร์มของนักเรียน', en: 'Public view — student forms only' },
    noMatch:    { th: 'ไม่พบฟอร์มที่ตรงเงื่อนไข', en: 'No form matches these filters' },
    colName:    { th: 'ชื่อฟอร์ม', en: 'Form name' },
    colGroup:   { th: 'กลุ่มผู้ใช้', en: 'User group' },
    colSystem:  { th: 'ระบบ', en: 'System' },
    colStatus:  { th: 'สถานะ', en: 'Status' },
    openIn:     { th: 'เปิดใน', en: 'Open in' },
    goAudit:    { th: 'ไปงานตรวจสอบ', en: 'Go to Audit' },

    /* หน้าหลัก — เดิมเขียนเป็นข้อความไทยตรง ๆ ใน home.html ปุ่มสลับภาษา
       จึงเปลี่ยนได้แต่เมนู เนื้อหากลางหน้ายังเป็นไทยหมด */
    hiName:     { th: n => 'สวัสดี ' + n + ' — วันนี้ต้องทำอะไร?',
                  en: n => 'Hello ' + n + ' — what do you need today?' },
    hiAnon:     { th: 'จะทำอะไรวันนี้?', en: 'What do you need today?' },
    subStaff:   { th: 'ค้นหาฟอร์ม เปิดงานที่รออยู่ หรือดูทะเบียนเอกสาร',
                  en: 'Search forms, open what is waiting on you, or read the register.' },
    subAnon:    { th: 'เลือกฟอร์มที่ต้องการได้เลย — ไม่ต้องเข้าสู่ระบบ',
                  en: 'Pick the form you need — no sign-in required.' },
    allBtnN:    { th: n => 'ดูฟอร์มทั้งหมด ' + n + ' ฟอร์ม', en: n => 'See all ' + n + ' forms' },
    qPhStaff:   { th: 'เช่น ‘ต้องยื่นแผนการบิน’ · ชื่อฟอร์ม หรือรหัสเอกสาร',
                  en: 'e.g. “file a flight plan” · form name or doc code' },
    qPhAnon:    { th: 'เช่น ‘พรุ่งนี้จะบินกับครู’ หรือ ‘อยากดูผลการฝึกของตัวเอง’',
                  en: 'e.g. “flying with an instructor tomorrow” or “see my training record”' },
    intentHd:   { th: 'บอกเราว่าคุณต้องการทำอะไร', en: 'Tell us what you need to do' },
    intentSub:  { th: 'ค้นข้ามทุกระบบ', en: 'Searches every connected system' },
    waitHd:     { th: 'งานที่รอคุณ', en: 'Waiting on you' },
    seeAll:     { th: 'ดูทั้งหมด →', en: 'See all →' },
    beforeHd:   { th: 'ขั้นตอนก่อนออกบิน', en: 'Before every flight' },
    yourForms:  { th: 'ฟอร์มของคุณ', en: 'Your forms' },
    byRoles:    { th: r => 'ตามบทบาท ' + r, en: r => 'By role · ' + r },
    commonHd:   { th: 'ฟอร์มที่ใช้บ่อย', en: 'Frequently used' },
    noRoleNote: { th: 'ยังไม่ได้กำหนดบทบาทให้บัญชีนี้ — แสดงฟอร์มที่กรอกในระบบนี้',
                  en: 'No role set on this account — showing forms hosted here' },
    /* ชุดสาธารณะไม่ใช่ "ฟอร์มของนักเรียน" ล้วน — มีใบของผู้โดยสาร (PWR)
       และใบรับเอกสารที่ใครก็ลงนามได้ (DRC) รวมอยู่ด้วย */
    openHd:     { th: 'ฟอร์มที่เปิดให้ทุกคน', en: 'Open to everyone' },
    openNote:   { th: n => n + ' ฟอร์ม · นักเรียน ผู้โดยสาร และผู้มาติดต่อ ใช้ได้โดยไม่ต้องเข้าสู่ระบบ',
                  en: n => n + ' forms · students, passengers and visitors — no sign-in required' },
    moreN:      { th: n => 'อีก ' + n + ' ฟอร์ม →', en: n => n + ' more →' },
    hitsN:      { th: (h, s) => 'ตรงกับคำค้น · ' + h + ' รายการ ข้าม ' + s + ' ระบบ',
                  en: (h, s) => h + ' match' + (h === 1 ? '' : 'es') + ' across ' + s + ' system' + (s === 1 ? '' : 's') },
    noHits:     { th: 'ไม่พบฟอร์มที่ตรงกับคำค้น', en: 'Nothing matched that search' },
    seeAllForms:{ th: 'ดูฟอร์มทั้งหมด', en: 'See all forms' },
    hereForm:   { th: 'ฟอร์มในระบบนี้', en: 'Form in this system' },
    openTask:   { th: 'เปิดงาน', en: 'Open' },
    noTasks:    { th: 'ไม่มีงานค้าง', en: 'Nothing waiting' },
    noTasksSub: { th: 'งานที่ถูกส่งถึงคุณจะมาโผล่ที่นี่', en: 'Anything routed to you shows up here' },
    queueDown:  { th: 'คิวงานยังไม่พร้อมใช้', en: 'Queue unavailable' },
    queueRules: { th: 'ยังไม่ได้วาง Security Rules ชุดใหม่ — ดู firebase/README.md',
                  en: 'Security rules not deployed yet — see firebase/README.md' },
    step1:      { th: 'ขั้นที่ 1', en: 'Step 1' },
    step1v:     { th: 'นักเรียนกรอกประเมินความเสี่ยง', en: 'The student fills in the risk assessment' },
    step1m:     { th: 'ต่างคนต่างกรอก ไม่เห็นคำตอบของอีกฝ่าย',
                  en: 'Each side answers alone — neither sees the other’s answers' },
    step2:      { th: 'ขั้นที่ 2', en: 'Step 2' },
    step2v:     { th: 'ครูกรอกฝั่งครู', en: 'The instructor fills in the instructor side' },
    step2m:     { th: 'ระบบรวมคะแนนความเสี่ยงให้อัตโนมัติ', en: 'The system totals the risk score' },
    step3:      { th: 'ขั้นที่ 3', en: 'Step 3' },
    step3v:     { th: 'ครูลงนามยืนยัน', en: 'The instructor signs' },
    step3m:     { th: 'จุดที่เอกสารกลายเป็นบันทึกควบคุม',
                  en: 'The point where the sheet becomes a controlled record' },
    step4:      { th: 'ขั้นที่ 4', en: 'Step 4' },
    step4v:     { th: 'ฝ่ายปฏิบัติการออกใบอนุญาต', en: 'Operations issues the release' },
    step4m:     { th: 'ต้องมีผลประเมินที่ผ่านแล้วแนบเสมอ',
                  en: 'A passed assessment must always be attached' },
    inSystem:   { th: 'อยู่ในระบบ', en: 'Hosted in' },
    confirmed:  { th: 'ยืนยันแล้ว', en: 'Confirmed' },
    whenWho:    { th: 'ฟอร์มนี้ใช้เมื่อไร · ใครเกี่ยวข้อง', en: 'When to use it · who is involved' },
    ctrlStatus: { th: 'สถานะเอกสารควบคุม', en: 'Controlled document status' },
    related:    { th: 'ฟอร์มที่เกี่ยวข้องในสายงานเดียวกัน', en: 'Related forms in the same chain' },
    noOnline:   { th: 'ยังไม่มีฟอร์มออนไลน์', en: 'No online form yet' },
    backToAll:  { th: 'กลับคลังฟอร์ม', en: 'Back to all forms' },
    noFields:   { th: 'ฟอร์มนี้ยังไม่มีช่องกรอกในระบบ — รอใส่ข้อมูลตามแบบมาตรฐาน',
                  en: 'This form has no fields in the system yet — waiting on a definition.' },
    withWhom:   { th: 'ทำร่วมกับ', en: 'Filled with' },
    sendTo:     { th: 'ส่งถึง', en: 'Sent to' },
    chain:      { th: 'สายงาน', en: 'Chain' },
    flowTitle:  { th: 'ลำดับการออกใบ', en: 'Where this form sits' },
    flowPrev:   { th: 'ออกก่อนใบนี้', en: 'Comes after' },
    flowNext:   { th: 'ออกต่อจากใบนี้', en: 'Leads to' },
    flowRefs:   { th: 'เกณฑ์ที่ใบนี้อ้างอิง', en: 'Criteria this form cites' },
    inLef:      { th: 'อยู่ใน LEF', en: 'In LEF' },
    notInLef:   { th: 'ยังไม่อยู่ใน LEF', en: 'Not in LEF yet' },
    srcFile:    { th: 'ไฟล์ต้นฉบับ', en: 'Source file' },
    docOwner:   { th: 'เจ้าของเอกสาร', en: 'Document owner' },
    jotDup:     { th: 'Jotform ฉบับซ้ำ', en: 'Duplicate Jotform' },
    sysOK:      { th: 'ยืนยันระบบ', en: 'System confirmed' },
    ctrlCode:   { th: 'Control code', en: 'Control code' },
    doFill:     { th: 'กรอกฟอร์ม', en: 'Fill in the form' },
    doSend:     { th: 'ส่งฟอร์ม', en: 'Submit the form' },
    doOpen:     { th: 'เปิดฟอร์ม', en: 'Open the form' },

    /* หน้าตรวจทานก่อนส่ง และผลการส่ง */
    reviewTitle: { th: 'ตรวจทานก่อนส่ง', en: 'Review before submitting' },
    reviewSub:   { th: 'ใบนี้เป็นเอกสารควบคุม — ส่งแล้วแก้ไม่ได้',
                   en: 'This is a controlled record — it cannot be edited after submission.' },
    goBack:      { th: 'กลับไปแก้', en: 'Go back and edit' },
    confirmSend: { th: 'ยืนยันและส่ง', en: 'Confirm and submit' },
    signed:      { th: 'ลงนามแล้ว', en: 'signed' },
    goesToApproval: { th: 'ส่งแล้วจะเข้าคิวรออนุมัติ', en: 'Goes to the approval queue' },
    goesToPool:  { th: 'ส่งแล้วเข้ากองรออนุมัติ ระบบจับคู่ผู้อนุมัติให้ภายหลัง',
                   en: 'Goes to the approval pool — an approver is matched afterwards' },
    endsHere:    { th: 'ส่งแล้วจบทันที บันทึกลงแฟ้มเลย', en: 'Complete on submit — filed immediately' },
    sending:     { th: 'กำลังส่ง…', en: 'Submitting…' },
    sentComplete:{ th: 'ส่งเรียบร้อยและบันทึกลงแฟ้มแล้ว', en: 'Submitted and filed' },
    sentPending: { th: 'ส่งเรียบร้อย — รอผู้มีอำนาจลงนามอนุมัติ',
                   en: 'Submitted — waiting for authorisation' },
    trackingNo:  { th: 'เลขที่ใบ', en: 'Record no.' },
    sendFailed:  { th: 'ส่งไม่สำเร็จ — ข้อมูลที่กรอกยังอยู่ในหน้านี้ ยังไม่หาย',
                   en: 'Submission failed — your answers are still on this page' },
    exportFailed:{ th: 'บันทึกลง Drive/Sheet ไม่สำเร็จ (ใบถูกบันทึกในระบบแล้ว):',
                   en: 'Could not write to Drive/Sheet (the record itself was saved):' },
    /* ใบที่ถูกเปิดมาจากระบบอื่น ระบบนั้นรอผลอยู่ ถ้าแจ้งกลับไม่ถึงต้องบอกผู้กรอก
       เพราะฝั่งโน้นจะยังเห็นว่า "ยังไม่ได้ลงนาม" ทั้งที่ลงนามไปแล้ว */
    extNotified: { th: 'แจ้งกลับระบบต้นทางเรียบร้อยแล้ว',
                   en: 'The system that sent you here has been told' },
    extNotifyFailed:{ th: 'ใบถูกบันทึกแล้ว แต่แจ้งกลับระบบต้นทางไม่สำเร็จ — โปรดแจ้งเลขที่ใบนี้กับเจ้าหน้าที่',
                   en: 'Saved, but the system that sent you here was not reached — please quote this record number to staff' },
    tryAgain:    { th: 'ลองส่งอีกครั้ง', en: 'Try again' },
    ticked:      { th: 'ติ๊กไว้', en: 'Ticked' },

    /* หน้าอนุมัติ */
    mustSignIn:  { th: 'ต้องเข้าสู่ระบบก่อน — หน้านี้เป็นของเจ้าหน้าที่', en: 'Staff sign-in required' },
    adminOnly:   { th: 'หน้านี้สำหรับผู้ดูแลระบบเท่านั้น',
                   en: 'This page is for system administrators only' },
    adminOnlySub:{ th: 'บัญชีของคุณยังไม่อยู่ในรายชื่อผู้ดูแลระบบ — ติดต่อผู้ดูแลเพื่อขอสิทธิ์',
                   en: 'Your account is not in the administrator list — ask an administrator for access.' },
    loading:     { th: 'กำลังโหลด…', en: 'Loading…' },
    noTask:      { th: 'ไม่ได้ระบุงานที่จะอนุมัติ — เข้าจากหน้าคิวงาน', en: 'No task specified — open it from your queue' },
    taskGone:    { th: 'ไม่พบงานนี้แล้ว อาจถูกดำเนินการไปแล้ว', en: 'Task not found — it may already be handled' },
    notYours:    { th: 'งานนี้ไม่ได้อยู่ในคิวของคุณ', en: 'This task is not assigned to you' },
    subGone:     { th: 'ไม่พบใบที่อ้างถึง', en: 'The referenced record no longer exists' },
    noDef:       { th: 'ฟอร์มนี้ยังไม่มีนิยามในระบบ', en: 'No form definition for this record' },
    approvalRequest: { th: 'คำขออนุมัติ', en: 'Approval request' },
    submittedBy: { th: 'ผู้ส่ง', en: 'Submitted by' },
    history:     { th: 'ประวัติการดำเนินการ', en: 'History' },
    blockedByGate: { th: 'ใบนี้ติดเงื่อนไขที่ห้ามผ่าน — อนุมัติไม่ได้', en: 'Blocked by a stop condition — cannot approve' },
    doApprove:   { th: 'อนุมัติ', en: 'Approve' },
    doDelegate:  { th: 'มอบหมายต่อ', en: 'Delegate' },
    doReject:    { th: 'ตีกลับ', en: 'Send back' },
    backToQueue: { th: 'กลับคิวงาน', en: 'Back to queue' },
    confirmApprove: { th: 'ตรวจทานก่อนอนุมัติ', en: 'Review before approving' },
    approveSub:  { th: 'อนุมัติแล้วใบจะถูกบันทึกลงแฟ้มทันที แก้ไม่ได้',
                   en: 'Once approved the record is filed immediately and cannot be edited.' },
    delegateSub: { th: 'เลือกผู้ที่จะอนุมัติแทน — ระบบจะย้ายงานไปคิวของเขาและแจ้งเตือนให้',
                   en: 'Choose who approves instead — the task moves to their queue and they are notified.' },
    rejectSub:   { th: 'ตีกลับให้ผู้ส่งแก้ไข ต้องระบุเหตุผล',
                   en: 'Send back for correction — a reason is required.' },
    noDelegate:  { th: 'ไม่มีผู้รับช่วงต่อในรายชื่อ — ต้องเพิ่มที่หน้าตั้งค่าระบบก่อน',
                   en: 'No one else available — add them in Admin setup first.' },
    reason:      { th: 'เหตุผล (ถ้ามี)', en: 'Reason (optional)' },
    reasonRequired: { th: 'เหตุผลที่ตีกลับ', en: 'Reason for sending back' },
    working:     { th: 'กำลังดำเนินการ…', en: 'Working…' },
    approved:    { th: 'อนุมัติแล้วและบันทึกลงแฟ้มเรียบร้อย', en: 'Approved and filed' },
    rejectedDone:{ th: 'ตีกลับเรียบร้อย — แจ้งผู้ส่งแล้ว', en: 'Sent back to the submitter' },
    delegated:   { th: 'มอบหมายต่อเรียบร้อย', en: 'Delegated' },
    actionFailed:{ th: 'ดำเนินการไม่สำเร็จ', en: 'Action failed' },
    poolTitle:   { th: 'กองรออนุมัติ', en: 'Approval pool' },
    poolSub:     { th: 'ใบที่ส่งมาโดยยังไม่ระบุผู้อนุมัติ — คุณมีสิทธิ์รับไปดำเนินการได้',
                   en: 'Submitted without a named approver — you are eligible to take these.' },
    fromWho:     { th: 'จาก', en: 'From' },
    claim:       { th: 'รับงานนี้', en: 'Take this' },
    limit:       { th: 'เพดาน', en: 'limit' },
    sendToWho:   { th: 'ส่งให้ครูการบินท่านใดลงนาม', en: 'Which instructor should authorise this?' },
    sendToWhoHint:{ th: 'ใบจะเข้าคิวงานของท่านนั้นทันทีที่ส่ง', en: 'It goes straight into their queue when you submit.' },
    noRecipient: { th: 'ยังไม่มีรายชื่อผู้รับฟอร์มในระบบ — ผู้ดูแลต้องตั้งค่าที่หน้าตั้งค่าระบบก่อน',
                   en: 'No recipients configured yet — an admin must set this up in Admin setup.' },
    needLoginTitle:{ th: 'ใบนี้ต้องเข้าสู่ระบบก่อนจึงจะส่งได้', en: 'Sign in required to submit this record' },
    needLoginSub: { th: 'เอกสารควบคุมต้องมีผู้รับผิดชอบที่ระบุตัวได้',
                    en: 'A controlled record must have an identifiable owner.' },
    needLoginBody:{ th: 'ใบนี้จบทันทีที่ส่ง ไม่มีขั้นอนุมัติต่อ จึงต้องเป็นเจ้าหน้าที่ที่เข้าสู่ระบบแล้วเป็นผู้ส่ง — หรือเลือกผู้ทำการประเมินเป็น Student เพื่อให้ครูการบินลงนามอนุญาต',
                    en: 'This record is complete on submission with no approval step, so it must be filed by a signed-in staff member — or set the assessor to Student so an instructor authorises it.' },
  };

  /* ── ผังผู้อนุมัติ ──────────────────────────────────────
     ใครอนุมัติฟอร์มไหนมาจาก config/approvals ที่ admin ตั้งได้
     ไม่ใช่ค่าที่ฝังตอน build — ย้ายตำแหน่งหรือเปลี่ยนคนไม่ต้อง build ใหม่
     อ่านไม่ได้ (ยังไม่ล็อกอิน หรือยังไม่เคยตั้ง) ก็ตกกลับไปใช้ค่าในนิยามฟอร์ม */
  A.APPROVALS = null;
  A.loadApprovals = async function () {
    if (A.APPROVALS) return A.APPROVALS;
    try {
      const d = await A.db.collection('config').doc('approvals').get();
      A.APPROVALS = (d.exists && d.data().byForm) || {};
    } catch (e) { A.APPROVALS = {}; }
    return A.APPROVALS;
  };
  /* คืนกติกาอนุมัติของฟอร์มหนึ่งใบ — def ใช้เป็นค่าสำรองเมื่อยังไม่ได้ตั้งใน config */
  A.approvalOf = function (abbr, def, regEntry) {
    const cfg = (A.APPROVALS || {})[abbr];
    if (cfg) return cfg;
    const step = def && (def.route || [])[1];
    if (!step) return { mode: 'none', position: '' };
    return {
      mode: step.assignedBy === 'submitter' ? 'pick' : 'pool',
      position: step.pool || (regEntry && regEntry.assignTo) || '',
      // ค่าตั้งต้นไม่มอบต่อ — ผู้ดูแลตั้งเองในหน้า Admin
      // เดาแทนไม่ได้ งานอนุมัติที่ไปถึงคนผิดตำแหน่งแย่กว่างานที่ค้างอยู่
      delegateTo: '',
      escalateDays: 2, rejectDays: 7,
    };
  };

  /* ── ทำงานตอนไม่มีเน็ต ─────────────────────────────────────
     นักบินเปิดใบทดสอบการบินบนเครื่องที่ไม่มีสัญญาณ ถ้าไม่แคชหน้าไว้
     หน้าจะเปิดไม่ขึ้นเลย ไม่ใช่แค่ส่งไม่ได้ */
  A.online = navigator.onLine;
  A.onNet = [];                      // หน้าเว็บลงทะเบียนไว้ให้เรียกเมื่อเน็ตเปลี่ยน
  function netChanged() {
    A.online = navigator.onLine;
    A.onNet.forEach(fn => { try { fn(A.online); } catch (e) { /* หน้าหนึ่งพังต้องไม่ลามหน้าอื่น */ } });
  }
  addEventListener('online', netChanged);
  addEventListener('offline', netChanged);

  if ('serviceWorker' in navigator && location.protocol !== 'file:') {
    // scope เป็นรากของเว็บ ลงทะเบียนหน้าไหนก็ได้ ครอบทุกหน้า
    const swUrl = new URL((g.BASE || '') + 'sw.js', location).href;
    navigator.serviceWorker.register(swUrl, { scope: new URL(g.BASE || '', location).href })
      .catch(e => console.warn('[sw] ลงทะเบียนไม่สำเร็จ — หน้าจะใช้ได้เฉพาะตอนมีเน็ต', e.message));
  }

  /* ร่างที่ยังกรอกไม่เสร็จ — เก็บในเครื่อง ไม่ได้ส่งไปไหน
     ลงจากเครื่องแล้วมากรอกต่อได้ และปิดแท็บไปก็ไม่หาย */
  A.draftKey = code => 'd0507.draft.' + code;
  A.draftSave = function (code, data) {
    try { localStorage.setItem(A.draftKey(code),
      JSON.stringify({ at: Date.now(), data: data })); } catch (e) { /* เต็มก็ข้ามไป */ }
  };
  A.draftLoad = function (code) {
    try {
      const raw = localStorage.getItem(A.draftKey(code));
      if (!raw) return null;
      const o = JSON.parse(raw);
      // ร่างเก่าเกิน 30 วันน่าจะเป็นของเที่ยวบินอื่นไปแล้ว อย่าเอามาเติมให้สับสน
      if (!o || !o.data || Date.now() - (o.at || 0) > 30 * 864e5) return null;
      return o;
    } catch (e) { return null; }
  };
  A.draftClear = code => { try { localStorage.removeItem(A.draftKey(code)); } catch (e) {} };

  A.onLang = [];               // หน้าเว็บลงทะเบียนไว้ให้เรียกเมื่อเปลี่ยนภาษา

  A.setLang = function (l) {
    if (A.LANGS.indexOf(l) < 0 || l === A.lang) return;
    A.lang = l;
    try { localStorage.setItem('d0507_lang', l); } catch (e) { /* ไม่เก็บก็ยังใช้ได้ */ }
    A.paintLang();
    A.paintAuth();
    A.onLang.forEach(fn => { try { fn(l); } catch (e) { console.error(e); } });
  };

  A.paintLang = function () {
    document.documentElement.lang = A.lang;
    document.querySelectorAll('[data-lang]').forEach(b =>
      b.setAttribute('aria-pressed', b.dataset.lang === A.lang));
    document.querySelectorAll('[data-t]').forEach(el => { el.textContent = A.t(el.dataset.t); });
    // บรรทัดรองแสดงอีกภาษาเสมอ — ป้ายเมนูจึงอ่านได้ทั้งสองภาษาโดยไม่ต้องเพิ่มคำแปลซ้ำ
    document.querySelectorAll('[data-t2]').forEach(el => { el.textContent = A.t(el.dataset.t2, A.other()); });
  };

  function bindLang() {
    document.querySelectorAll('[data-lang]').forEach(b =>
      b.addEventListener('click', () => A.setLang(b.dataset.lang)));
    A.paintLang();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bindLang);
  else bindLang();

  /* ── ค้นหา ─────────────────────────────────────────────
     ภาษาไทยไม่มีช่องว่างระหว่างคำ จึงเช็คสองทาง:
       1) คำสำคัญของฟอร์มอยู่ในประโยคที่พิมพ์ไหม
       2) คำที่พิมพ์อยู่ในข้อมูลฟอร์มไหม                    */
  A.score = function (f, q) {
    const keys = [f.abbr, f.doc, f.code, f.t, f.th].concat(f.kw || [])
      .filter(Boolean).map(x => String(x).toLowerCase());
    let s = 0;
    for (const k of keys) if (k.length >= 2 && q.includes(k)) s += (k.length >= 4 ? 3 : 1);
    const hay = keys.join(' ');
    for (const w of q.split(/\s+/)) if (w.length >= 2 && hay.includes(w)) s += 1;
    return s;
  };
  A.search = function (forms, q, n) {
    q = (q || '').trim().toLowerCase();
    if (!q) return [];
    return forms.map(f => ({ f, s: A.score(f, q) })).filter(x => x.s > 0)
      .sort((a, b) => b.s - a.s).slice(0, n || 6).map(x => x.f);
  };

  /* ── ปลายทางของฟอร์ม ─────────────────────────────────── */
  A.sysOf = (reg, f) => reg.systems[f.sys] || reg.systems.here;
  A.target = function (reg, f) {
    const base = (g.BASE || '');
    const s = A.sysOf(reg, f);
    if (f.sys === 'audit') return { url: base + '../d0507-audit/', label: A.t('goAudit'), ext: false };
    if (f.sys !== 'here' && s.url) return { url: s.url, label: A.t('openIn') + ' ' + A.n2(s), ext: true };
    if (f.hasDef) return { url: base + 'fill/?c=' + encodeURIComponent(f.abbr), label: A.t('doFill'), ext: false };
    if (f.assignTo) return { url: base + 'submit/?f=' + encodeURIComponent(f.abbr), label: A.t('doSend'), ext: false };
    if (f.jot) return { url: 'https://form.jotform.com/' + encodeURIComponent(f.jot), label: A.t('doOpen'), ext: true };
    return null;
  };
  A.formUrl = f => (g.BASE || '') + 'f/' + encodeURIComponent(f.abbr) + '/';

  /* ── วันที่ พ.ศ. ──────────────────────────────────────── */
  const DAY = ['วันอาทิตย์','วันจันทร์','วันอังคาร','วันพุธ','วันพฤหัสบดี','วันศุกร์','วันเสาร์'];
  const MON = ['มกราคม','กุมภาพันธ์','มีนาคม','เมษายน','พฤษภาคม','มิถุนายน',
               'กรกฎาคม','สิงหาคม','กันยายน','ตุลาคม','พฤศจิกายน','ธันวาคม'];
  A.today = function () {
    const n = new Date();
    return `${DAY[n.getDay()]}ที่ ${n.getDate()} ${MON[n.getMonth()]} ${n.getFullYear() + 543}`;
  };

  /* ── ส่งออกไป Google Drive + Sheet ────────────────────
     เรียกเมื่อใบ "จบ" เท่านั้น — จบที่ submit หรือจบทั้ง flow
     ปลายทางคือ Apps Script Web App (ดู gas/README.md)

     หมายเหตุเรื่อง CORS: Apps Script เปลี่ยนเส้นทางไป googleusercontent.com
     ทำให้บางเบราว์เซอร์อ่าน response ไม่ได้ ถึงแม้ POST จะถึงปลายทางแล้ว
     จึงถือว่า "ส่งแล้ว" เมื่อ fetch ไม่ throw และให้ผู้ใช้เปิดโฟลเดอร์ตรวจเองได้ */
  A.GAS_URL = '';        // ตั้งค่าโดย build.py จาก firebase/config.json

  /* เรียกงานฝั่ง Apps Script ที่ไม่ใช่การส่งออกใบฟอร์ม (เช่น ดึงแผนภูมิ AIP)
     ตัวนี้ต้องอ่าน response ให้ได้จริง ต่างจาก exportSubmission ที่ยอมรับว่าอ่านไม่ได้ */
  A.gas = async function (action, extra) {
    if (!A.GAS_URL) return { ok: false, error: 'ยังไม่ได้ตั้ง URL ของตัวส่งออก' };
    const u = firebase.auth().currentUser;
    if (!u) return { ok: false, error: 'ต้องเข้าสู่ระบบก่อน' };
    try {
      const res = await fetch(A.GAS_URL, {
        method: 'POST', redirect: 'follow',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(Object.assign({ idToken: await u.getIdToken(), action }, extra || {})),
      });
      const out = await res.json();
      return out.ok ? { ok: true, result: out.result } : { ok: false, error: out.error };
    } catch (e) {
      return { ok: false, error: e.message };
    }
  };

  A.exportSubmission = async function (submission) {
    if (!A.GAS_URL) return { ok: false, error: 'ยังไม่ได้ตั้ง URL ของตัวส่งออก' };
    if (submission.status !== 'complete')
      return { ok: false, error: 'ใบนี้ยังไม่จบ — ส่งออกเมื่อจบเท่านั้น' };
    const u = firebase.auth().currentUser;
    if (!u) return { ok: false, error: 'ต้องเข้าสู่ระบบก่อน' };
    const idToken = await u.getIdToken();
    try {
      // text/plain เพื่อเลี่ยง preflight ที่ Apps Script ไม่ตอบ
      const res = await fetch(A.GAS_URL, {
        method: 'POST', redirect: 'follow',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ idToken, submission }),
      });
      const out = await res.json();
      return out.ok ? Object.assign({ ok: true, sent: true }, out.result)
                    : { ok: false, error: out.error };
    } catch (e) {
      // อ่าน response ไม่ได้ แต่ POST ออกไปแล้ว
      return { ok: true, sent: true, unconfirmed: true, note: e.message };
    }
  };

  /* การ์ดฟอร์มมาตรฐาน — ใช้ร่วมทุกหน้า */
  A.card = function (reg, f, duty) {
    const s = A.sysOf(reg, f);
    const badge = f.sys === 'here' ? `<span class="ext here">${A.esc(A.t('thisSystem'))}</span>`
                                   : `<span class="ext">${A.esc(A.n2(s))}</span>`;
    const st = reg.status[f.st];
    const warn = (A.isStaff() && st && st.lv !== 'ok') ? `<span class="tag ${st.lv}">${A.esc(A.n2(st))}</span>` : '';
    return `<a class="fcard" href="${A.formUrl(f)}">
      <div class="row"><span class="tile ${f.sys === 'here' ? 'sky' : 'gry'}">${A.esc(f.abbr.slice(0, 4))}</span>
        <span><span class="ti">${A.esc(A.nm(f))}</span><span class="en">${A.esc(A.lang === 'en' ? (f.th || '') : (f.t || ''))}</span></span></div>
      ${duty ? `<div class="duty">${A.esc(duty)}</div>` : ''}
      <div class="meta">${f.doc ? `<span class="code">${A.esc(f.doc)}</span>` : ''}${badge}${warn}</div></a>`;
  };

  g.D0507 = A;
})(window);
