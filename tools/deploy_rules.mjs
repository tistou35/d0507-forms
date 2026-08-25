#!/usr/bin/env node
/**
 * deploy_rules.mjs — วาง firebase/firestore.rules ขึ้นโปรเจกต์จริง
 *
 *   GOOGLE_APPLICATION_CREDENTIALS=./serviceAccountKey.json \
 *     node tools/deploy_rules.mjs [--dry]
 *
 * ── ทำไมไม่ใช้ firebase CLI ─────────────────────────────────
 * CLI ต้อง `firebase login` ซึ่งเป็นการล็อกอินด้วยเบราว์เซอร์ของคน
 * เครื่องที่รันอัตโนมัติจึงใช้ไม่ได้ ตัวนี้ยิง Firebase Rules API ตรง ๆ
 * ด้วย service account ที่มีอยู่แล้ว (ตัวเดียวกับที่ seed.mjs ใช้)
 *
 * ── ทำสองขั้น ───────────────────────────────────────────────
 * 1. สร้าง ruleset ใหม่ (เก็บไว้เฉย ๆ ยังไม่มีผล)
 * 2. ชี้ release 'cloud.firestore' ไปที่ ruleset นั้น — ตรงนี้ถึงมีผลจริง
 * แยกสองขั้นเพราะ ruleset ที่ผิดจะล้มตั้งแต่ขั้นแรก โดยที่ของเดิมยังทำงานอยู่
 */
import { GoogleAuth } from 'google-auth-library';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = join(dirname(fileURLToPath(import.meta.url)), '..');
const PROJECT = JSON.parse(readFileSync(join(HERE, 'firebase', 'config.json'), 'utf8')).projectId;
const RULES = join(HERE, 'firebase', 'firestore.rules');
const DRY = process.argv.includes('--dry');

const auth = new GoogleAuth({
  keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS || join(HERE, 'serviceAccountKey.json'),
  scopes: ['https://www.googleapis.com/auth/cloud-platform'],
});
const client = await auth.getClient();
const API = `https://firebaserules.googleapis.com/v1/projects/${PROJECT}`;

const src = readFileSync(RULES, 'utf8');
console.log(`โปรเจกต์ ${PROJECT} · กฎ ${src.split('\n').length} บรรทัด · ${(src.length / 1024).toFixed(1)} KB`);

// ของเดิมที่ใช้อยู่ — ไว้เทียบว่าเปลี่ยนอะไรจริงไหม
const rel = await client.request({ url: `${API}/releases/cloud.firestore` }).catch(() => null);
const cur = rel && rel.data && rel.data.rulesetName;
if (cur) {
  const old = await client.request({ url: `https://firebaserules.googleapis.com/v1/${cur}` });
  const oldSrc = old.data.source.files[0].content;
  if (oldSrc === src) { console.log('เหมือนที่ใช้อยู่แล้วทุกตัวอักษร — ไม่ต้องวางใหม่'); process.exit(0); }
  console.log(`ของเดิม ${cur.split('/').pop()} · ${oldSrc.split('\n').length} บรรทัด`);
}
if (DRY) { console.log('--dry: ไม่ได้วางอะไร'); process.exit(0); }

const made = await client.request({
  url: `${API}/rulesets`, method: 'POST',
  data: { source: { files: [{ name: 'firestore.rules', content: src }] } },
});
const name = made.data.name;
console.log('สร้าง ruleset', name.split('/').pop());

await client.request({
  url: `${API}/releases/cloud.firestore`, method: 'PATCH',
  data: { release: { name: `projects/${PROJECT}/releases/cloud.firestore`, rulesetName: name } },
});

// ตรวจจากปลายทาง ไม่ใช่เชื่อว่า PATCH สำเร็จแล้วต้องถูก
const after = await client.request({ url: `${API}/releases/cloud.firestore` });
if (after.data.rulesetName !== name) {
  console.error('❌ วางแล้วแต่ release ยังชี้ไปที่', after.data.rulesetName);
  process.exit(1);
}
console.log('✅ ใช้งานจริงแล้ว —', name.split('/').pop());
