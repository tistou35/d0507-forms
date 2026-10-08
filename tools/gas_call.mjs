/* เรียก action ของตัวส่งออก (Apps Script) ในนามผู้ดูแล — ใช้ในเครื่องมือตรวจ/ซ่อม
   node tools/gas_call.mjs '<json body>'   เช่น '{"action":"importTpl","abbr":"EFC"}'
   ⚠️ importTpl ต้องส่ง abbr เสมอ ไม่ส่ง = สร้างแม่แบบใหม่ทุกใบ (เคยพลาดมาแล้ว) */
import { initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { readFileSync } from 'node:fs';
const key=JSON.parse(readFileSync('serviceAccountKey.json','utf8'));
const cfg=JSON.parse(readFileSync('firebase/config.json','utf8'));
initializeApp({credential:cert(key),projectId:key.project_id});
const body=JSON.parse(process.argv[2]||'{}');
if(body.action==='importTpl' && !body.abbr){ console.error('importTpl ต้องระบุ abbr — ไม่ส่งคำสั่งนี้'); process.exit(2); }
const ct=await getAuth().createCustomToken(process.env.UID||'GwQFCbOfxrcWFaZglTgMX6LWz7S2');
const r=await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=${cfg.apiKey}`,
  {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({token:ct,returnSecureToken:true})});
const {idToken}=await r.json();
for (let i=0;i<6;i++){
  const res=await fetch(cfg.gasUrl,{method:'POST',redirect:'follow',
    headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify({idToken,...body})});
  const t=await res.text();
  let parsed=null;
  try{ parsed=JSON.parse(t); }catch(e){}
  if(parsed){
    // รอให้เขียนลง stdout เสร็จก่อนจบ — คำตอบที่มี PDF ใหญ่ ถ้า exit ทันทีจะถูกตัดกลางทาง
    await new Promise(res=>process.stdout.write(JSON.stringify(parsed)+'\n', res));
    process.exit(0);
  }
  await new Promise(r=>setTimeout(r,8000));   // ระหว่างสลับ version ตอบเป็น HTML
}
console.error('ตัวส่งออกไม่ตอบเป็น JSON'); process.exit(1);
