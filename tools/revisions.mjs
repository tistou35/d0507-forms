#!/usr/bin/env node
/**
 * revisions.mjs — อ่าน/ปิดรายการใน Firestore revisions ให้ tools/revision_close.py
 *
 *   node tools/revisions.mjs list [state]         พิมพ์ JSON (ค่าตั้งต้น state = approved)
 *   node tools/revisions.mjs close <id> [edit]    ตั้ง state = closed พร้อม id ต้นฉบับใหม่
 *
 * แยกเป็น node เพราะ firebase-admin อยู่ฝั่งนี้แล้ว (seed.mjs) Python ในเครื่องไม่มีไลบรารี Google
 * ใช้ cert() อ่านกุญแจตรง ไม่ใช้ applicationDefault() — ตัวนั้นเซ็นผ่าน IAM API ซึ่งปิดอยู่ในโปรเจกต์
 */
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = join(dirname(fileURLToPath(import.meta.url)), '..');
const key = JSON.parse(readFileSync(process.env.GOOGLE_APPLICATION_CREDENTIALS || join(HERE, 'serviceAccountKey.json'), 'utf8'));
initializeApp({ credential: cert(key), projectId: key.project_id });
const db = getFirestore();

const [cmd, arg] = process.argv.slice(2);
if (cmd === 'list') {
  const qs = await db.collection('revisions').where('state', '==', arg || 'approved').get();
  const out = qs.docs.map(d => {
    const x = d.data();
    for (const k of Object.keys(x)) if (x[k] && typeof x[k].toDate === 'function') x[k] = x[k].toDate().toISOString();
    return Object.assign({ id: d.id }, x);
  });
  process.stdout.write(JSON.stringify(out));
} else if (cmd === 'close' && arg) {
  const editId = process.argv[4] || '';
  await db.collection('revisions').doc(arg).update({ state: 'closed', editId,
    closedAt: FieldValue.serverTimestamp(), closedBy: 'tools/revision_close.py' });
  process.stdout.write('closed ' + arg + '\n');
} else {
  console.error('ใช้: revisions.mjs list [state] | close <id>');
  process.exit(1);
}
