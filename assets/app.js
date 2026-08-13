/* ============================================================
   app.js — โค้ดร่วมทุกหน้าของ d0507-forms
   · auth (โปรเจกต์ d0507-audit — login ครั้งเดียวใช้ได้ทั้งสอง repo)
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

  /* ── auth ─────────────────────────────────────────────── */
  A.initAuth = function (cfg, onChange) {
    if (!g.firebase) return;
    if (!firebase.apps.length) firebase.initializeApp(cfg);
    A.db = firebase.firestore();
    firebase.auth().onAuthStateChanged(async u => {
      A.user = (u && !u.isAnonymous) ? u : null;
      A.roles = [];
      if (A.user) {
        try {
          const d = await A.db.collection('users').doc(A.user.uid).get();
          if (d.exists && Array.isArray(d.data().roles)) A.roles = d.data().roles;
        } catch (e) { /* ยังไม่มี users/{uid} หรือ rule ไม่อนุญาต */ }
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
             <span>${A.roles.length ? A.esc(A.roleNames().join(' · ')) : 'ยังไม่ได้กำหนดบทบาท'}</span></span></span>
           <a class="acct" href="#" onclick="D0507.logout();return false" style="padding:0 16px">
             <span class="who"><b>ออก</b><span>Sign out</span></span></a>`
        : `<a class="acct" href="${base}staff-login/" style="padding:0 16px">
             <span class="who"><b>เข้าสู่ระบบเจ้าหน้าที่</b><span>Staff sign in</span></span></a>`;
    }
    document.querySelectorAll('.staffonly').forEach(el => el.classList.toggle('hide', !A.isStaff()));
  };

  A.ROLE_N = { stu: 'นักเรียน', ins: 'ครูการบิน / ครูภาคทฤษฎี', mnt: 'ช่างอากาศยาน',
               ops: 'ฝ่ายปฏิบัติการ', mgt: 'ฝ่ายบริหาร' };
  A.roleNames = () => A.roles.map(r => A.ROLE_N[r] || r);

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
    if (f.sys === 'audit') return { url: base + '../d0507-audit/', label: 'ไปงานตรวจสอบ', ext: false };
    if (f.sys !== 'here' && s.url) return { url: s.url, label: 'เปิดใน ' + s.n, ext: true };
    if (f.hasDef) return { url: base + 'fill/?c=' + encodeURIComponent(f.abbr), label: 'กรอกฟอร์ม', ext: false };
    if (f.assignTo) return { url: base + 'submit/?f=' + encodeURIComponent(f.abbr), label: 'ส่งฟอร์ม', ext: false };
    if (f.jot) return { url: 'https://form.jotform.com/' + encodeURIComponent(f.jot), label: 'เปิดฟอร์ม', ext: true };
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

  /* การ์ดฟอร์มมาตรฐาน — ใช้ร่วมทุกหน้า */
  A.card = function (reg, f, duty) {
    const s = A.sysOf(reg, f);
    const badge = f.sys === 'here' ? '<span class="ext here">ระบบนี้</span>'
                                   : `<span class="ext">${A.esc(s.n)}</span>`;
    const st = reg.status[f.st];
    const warn = (A.isStaff() && st && st.lv !== 'ok') ? `<span class="tag ${st.lv}">${A.esc(st.n)}</span>` : '';
    return `<a class="fcard" href="${A.formUrl(f)}">
      <div class="row"><span class="tile ${f.sys === 'here' ? 'sky' : 'gry'}">${A.esc(f.abbr.slice(0, 4))}</span>
        <span><span class="ti">${A.esc(f.th || f.t)}</span><span class="en">${A.esc(f.t)}</span></span></div>
      ${duty ? `<div class="duty">${A.esc(duty)}</div>` : ''}
      <div class="meta">${f.doc ? `<span class="code">${A.esc(f.doc)}</span>` : ''}${badge}${warn}</div></a>`;
  };

  g.D0507 = A;
})(window);
