#!/usr/bin/env node
/**
 * make_blank_tpl.mjs — ทำฟอร์มเปล่าจาก <ABBR>_TEMPLATE ใน Drive
 *
 *   GOOGLE_APPLICATION_CREDENTIALS=./serviceAccountKey.json \
 *     node tools/make_blank_tpl.mjs FTR [ABBR…]
 *   … --all      ทำทุกใบที่มีแม่แบบในทะเบียน
 *
 * ── ต่างจาก make_blank.py อย่างไร ────────────────────────────
 * make_blank.py แปลงจาก .docx ต้นฉบับกระดาษ — เป็นคนละฉบับกับที่ระบบใช้จริง
 * ตัวนี้ทำจากแม่แบบที่ระบบใช้ออก PDF จริง คนที่พิมพ์ไปเขียนด้วยมือจึงได้
 * กระดาษหน้าตาเดียวกับใบที่ระบบออกให้ ไม่ใช่คนละแบบ
 *
 * ฝั่ง Apps Script (BlankForm.gs) เป็นคนตัดบล็อก APPROVAL / การอนุมัติ
 * และแทนโทเคนด้วยช่องว่าง / ☐ — ที่นี่แค่สั่งแล้วเขียนไฟล์ลง blank/
 *
 * ── ทำไมต้องมี idToken ──────────────────────────────────────
 * ตัวส่งออกรับเฉพาะคำขอที่มี token ของโปรเจกต์ Firebase นี้ ไม่งั้นใครก็สั่งได้
 * สคริปต์นี้จึงออก custom token จาก service account แล้วแลกเป็น idToken
 */
import { initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = join(dirname(fileURLToPath(import.meta.url)), '..');
const REG = JSON.parse(readFileSync(join(HERE, 'forms_register.json'), 'utf8'));
const API_KEY = 'AIzaSyCVR8EiBJDT4Qr3KZ2DRPhmFzUksHTwAjg';
const UID = 'GwQFCbOfxrcWFaZglTgMX6LWz7S2';
const GAS = (readFileSync(join(HERE, 'fill', 'index.html'), 'utf8')
  .match(/GAS_URL='([^']+)'/) || [])[1];

let args = process.argv.slice(2);
if (!args.length) {
  console.error('ใช้: node tools/make_blank_tpl.mjs FTR [ABBR…]  |  --all');
  process.exit(1);
}
if (args[0] === '--all') args = REG.forms.filter(f => f.tpl).map(f => f.abbr);

/* ต้องใช้ cert() ไม่ใช่ applicationDefault() — การออก custom token ต้องเซ็นด้วย
   private key ในไฟล์คีย์ ถ้าใช้ ADC จะไปเรียก IAM Service Account Credentials API
   ซึ่งโปรเจกต์นี้ไม่ได้เปิดไว้ แล้วล้มด้วย 403 */
const KEY = process.env.GOOGLE_APPLICATION_CREDENTIALS
  || join(HERE, 'serviceAccountKey.json');
const app = initializeApp({ credential: cert(KEY) });
const custom = await getAuth(app).createCustomToken(UID);
const res = await fetch(
  'https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=' + API_KEY,
  { method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token: custom, returnSecureToken: true }) });
const { idToken, error } = await res.json();
if (!idToken) { console.error('แลก idToken ไม่ได้:', error); process.exit(1); }

let ok = 0, fail = 0;
for (const abbr of args) {
  const f = REG.forms.find(x => x.abbr === abbr);
  if (!f) { console.log(`⚠️  ${abbr}: ไม่มีในทะเบียน`); fail++; continue; }
  if (!f.tpl) { console.log(`⚠️  ${abbr}: ยังไม่มีแม่แบบ Google Doc`); fail++; continue; }
  try {
    const r = await fetch(GAS, {
      method: 'POST', redirect: 'follow',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ idToken, action: 'blankForm', abbr }),
    });
    const out = await r.json();
    if (!out.ok) throw new Error(out.error);
    const R = out.result;
    // ตรวจจากผลจริงที่ปลายทางส่งกลับมา ไม่ใช่เชื่อว่าโค้ดฝั่งโน้นทำถูก
    if (R.tokensLeft) throw new Error(`ยังมีโทเคนค้าง ${R.tokensLeft} ตัว`);
    if (R.approvalLeft) throw new Error('ยังมีบล็อก APPROVAL ค้างอยู่');
    const buf = Buffer.from(R.pdf, 'base64');
    const path = join(HERE, 'blank', abbr + '.pdf');
    writeFileSync(path, buf);
    console.log(`✅ ${abbr.padEnd(8)} ${(buf.length / 1024).toFixed(0).padStart(4)} KB · `
      + `ช่องติ๊ก ${R.boxes} · ตัดส่วนอนุมัติ ${R.cutApproval} ชิ้น · ไม่มีโทเคนค้าง`);
    ok++;
  } catch (e) {
    console.log(`❌ ${abbr.padEnd(8)} ${e.message}`);
    fail++;
  }
}
console.log(`\nสำเร็จ ${ok} · ไม่สำเร็จ ${fail}`);
process.exit(fail ? 1 : 0);
