#!/usr/bin/env node
/**
 * push_registry.mjs — อัปโหลดเฉพาะ registry/current จาก firebase/registry.json
 *
 *   node tools/push_registry.mjs [--dry]
 *
 * ทำไมไม่ใช้ firebase/seed.mjs: ตัวนั้นเขียน publicDirectory/instructors ทับทั้งก้อน
 * ด้วยรายชื่อที่ hardcode ไว้ (1 คน) ส่วนรายชื่อจริงตอนนี้มาจากหน้าตั้งค่าระบบ (4 คน)
 * รันแล้วผู้รับฟอร์มจะหายไปสามคน ใบที่ส่งถึง CMM / ACM จะส่งไม่ได้ทันที
 */
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = join(dirname(fileURLToPath(import.meta.url)), '..');
const key = JSON.parse(readFileSync(process.env.GOOGLE_APPLICATION_CREDENTIALS || join(HERE, 'serviceAccountKey.json'), 'utf8'));
initializeApp({ credential: cert(key), projectId: key.project_id });

const reg = JSON.parse(readFileSync(join(HERE, 'firebase', 'registry.json'), 'utf8'));
const roles = (reg.roles || []).map(r => r.k).join(' · ');
console.log(`registry/current: ${reg.forms.length} ฟอร์ม · บทบาท ${roles}`);
if (process.argv.includes('--dry')) { console.log('--dry: ไม่ได้เขียน'); process.exit(0); }
await getFirestore().doc('registry/current').set(Object.assign({}, reg, { updatedAt: FieldValue.serverTimestamp() }));
console.log('เขียนแล้ว');
