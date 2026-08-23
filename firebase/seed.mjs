#!/usr/bin/env node
/**
 * seed.mjs — สร้าง users/{uid}, publicDirectory/instructors และ registry/current
 *          ในโปรเจกต์ Firebase ของ d0507-forms (คนละโปรเจกต์กับ d0507-audit)
 *
 * ใช้ครั้งเดียวตอนตั้งระบบ และรันซ้ำได้ทุกครั้งที่มีคนเข้า/ออก
 *
 *   npm i firebase-admin
 *   # ดาวน์โหลด service account key จาก
 *   #   Firebase Console → Project settings → Service accounts → Generate new private key
 *   export GOOGLE_APPLICATION_CREDENTIALS=./serviceAccountKey.json
 *   node firebase/seed.mjs --dry     # ดูก่อนว่าจะเขียนอะไร
 *   node firebase/seed.mjs           # เขียนจริง
 *
 * ⚠️ ห้าม commit serviceAccountKey.json เข้า repo (มีใน .gitignore แล้ว)
 */
import { initializeApp, applicationDefault } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { readFileSync, existsSync } from 'node:fs';

const DRY = process.argv.includes('--dry');

/* ────────────────────────────────────────────────────────────
   1. บุคลากร — แก้รายชื่อที่นี่
      uid  หาได้จาก Firebase Console → Authentication → Users
      roles: stu | ins | mnt | ops | mgt   (ตรงกับ forms_register.json)
      cert:  ตำแหน่งที่จะโชว์ในตัวเลือกผู้รับฝั่งนักเรียน
      pickable: true = ให้นักเรียนเลือกเป็นผู้รับฟอร์มได้
      recv:  รับฟอร์มที่ assignTo ตรงกับค่าไหนได้บ้าง — FI | CMM | ACM
             (FRAE/PWR ส่งถึง FI · SEF ส่งถึง CMM · APF ส่งถึง ACM)
   ──────────────────────────────────────────────────────────── */
const PEOPLE = [
  {
    uid:   'GwQFCbOfxrcWFaZglTgMX6LWz7S2',   // ดึงจาก Firebase Auth 23 AUG 2026
    email: 'tistou35@gmail.com',
    name:  'ธนวัฒน์ ว.',
    cert:  'FI · หัวหน้าฝ่ายปฏิบัติการการบิน',
    roles: ['ins', 'mgt'],
    recv:  ['FI'],
    pickable: true,
    active: true,
  },
  // {
  //   uid: '…', email: '…', name: 'สมชาย ค.',
  //   cert: 'FI · Chief Flight Instructor', roles: ['ins'], recv: ['FI'], pickable: true, active: true,
  // },
  // {
  //   uid: '…', email: '…', name: 'ผู้จัดการฝ่ายกำกับมาตรฐาน',
  //   cert: 'CMM · Compliance Monitoring Manager', roles: ['mgt'], recv: ['CMM'], pickable: true, active: true,
  // },
];

/* ──────────────────────────────────────────────────────────── */

const app = initializeApp({ credential: applicationDefault() });
const db = getFirestore(app);

function checkPeople() {
  const errs = [];
  const seen = new Set();
  for (const p of PEOPLE) {
    if (!p.uid || p.uid.startsWith('REPLACE')) errs.push(`${p.email}: ยังไม่ได้ใส่ uid จริง`);
    if (seen.has(p.uid)) errs.push(`uid ซ้ำ: ${p.uid}`);
    seen.add(p.uid);
    if (!Array.isArray(p.roles) || !p.roles.length) errs.push(`${p.email}: ไม่มี roles`);
    for (const r of p.roles || []) {
      if (!['stu', 'ins', 'mnt', 'ops', 'mgt'].includes(r)) errs.push(`${p.email}: role ไม่รู้จัก "${r}"`);
    }
  }
  return errs;
}

async function main() {
  const errs = checkPeople();
  if (errs.length) {
    console.error('ข้อมูลไม่ถูกต้อง:\n  - ' + errs.join('\n  - '));
    process.exit(1);
  }

  // users/{uid} — ข้อมูลเต็ม อ่านได้เฉพาะเจ้าตัวกับเจ้าหน้าที่
  const users = PEOPLE.map(p => ({
    path: `users/${p.uid}`,
    data: {
      email: p.email, name: p.name, cert: p.cert,
      roles: p.roles, active: p.active !== false,
      updatedAt: FieldValue.serverTimestamp(),
    },
  }));

  // publicDirectory/instructors — อ่านได้ทั้งโลก
  // ⚠️ ใส่ได้แค่ id / ชื่อ / ตำแหน่ง — ห้ามมีอีเมลหรือเบอร์โทร
  const instructors = PEOPLE
    .filter(p => p.pickable && p.active !== false && Array.isArray(p.recv) && p.recv.length)
    .map(p => ({ id: p.uid, name: p.name, role: p.cert, recv: p.recv }));

  const leak = instructors.filter(i => /@|\d{9,}/.test(JSON.stringify(i)));
  if (leak.length) {
    console.error('publicDirectory มีอีเมลหรือเบอร์โทรหลุด:', leak);
    process.exit(1);
  }

  console.log(`users:                 ${users.length} คน`);
  console.log(`publicDirectory:       ${instructors.length} คนให้เลือกเป็นผู้รับ`);
  console.log(instructors.map(i => `  · ${i.name} — ${i.role}  [รับ: ${i.recv.join(', ')}]`).join('\n'));
  for (const need of ['FI', 'CMM', 'ACM']) {
    if (!instructors.some(i => i.recv.includes(need)))
      console.warn(`  ⚠ ยังไม่มีใครรับฟอร์มที่ส่งถึง ${need} — ฟอร์มนั้นจะส่งไม่ได้`);
  }

  /* ทะเบียนต้องถูกนับใน --dry ด้วย — ของเดิม return ก่อนถึงบล็อกที่เขียนทะเบียน
     สรุปจึงบอกแค่จำนวนคน แล้วคนอ่านนึกว่าไม่ได้แตะทะเบียน ทั้งที่การรันจริง
     เขียนทับ registry/current ทั้งก้อน ซึ่งเป็นสิ่งที่เจ้าหน้าที่ทุกคนเห็น */
  const regPath = new URL('./registry.json', import.meta.url);
  const hasReg = existsSync(regPath);
  const reg = hasReg ? JSON.parse(readFileSync(regPath, 'utf8')) : null;
  if (hasReg) {
    const kinds = reg.forms.reduce((a, f) => (a[f.kind || 'form'] = (a[f.kind || 'form'] || 0) + 1, a), {});
    console.log(`registry/current:      ${reg.forms.length} ฟอร์ม `
      + `(ใบให้กรอก ${kinds.form || 0} · เอกสารอ้างอิง ${kinds.ref || 0})`);
    console.log(`  · มีฟอร์มเปล่า ${reg.forms.filter(f => f.blank).length} ใบ`
      + ` · มีแม่แบบ Google Doc ${reg.forms.filter(f => f.tpl).length} ใบ`);
  } else {
    console.warn('  ⚠ ไม่พบ firebase/registry.json — รัน python3 build.py ก่อน');
  }

  if (DRY) { console.log('\n--dry: ไม่ได้เขียนอะไร'); return; }

  const batch = db.batch();
  for (const u of users) batch.set(db.doc(u.path), u.data, { merge: true });
  batch.set(db.doc('publicDirectory/instructors'),
            { list: instructors, updatedAt: FieldValue.serverTimestamp() });

  // ทะเบียนฉบับเต็ม — เว็บสาธารณะฝังไม่ได้ จึงอ่านจาก Firestore หลัง login
  if (hasReg) {
    batch.set(db.doc('registry/current'),
              Object.assign({}, reg, { updatedAt: FieldValue.serverTimestamp() }));
  }

  await batch.commit();
  console.log('\nเขียนเรียบร้อย');
}

main().catch(e => { console.error(e); process.exit(1); });
