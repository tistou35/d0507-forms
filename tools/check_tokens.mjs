/* ตรวจว่าแม่แบบของทุกใบมี token ครบตามนิยามฟอร์มหรือไม่
   token ที่หายไป = ค่าที่ผู้กรอกใส่มาจะไม่ขึ้นในเอกสารเลย โดยไม่มีใครรู้
   (เกิดขึ้นจริงเมื่อ importTpl ถูกสั่งทั้งชุด แล้ว token ที่เคยวางด้วยมือในไดรฟ์หายไป) */
import { initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { readFileSync, readdirSync } from 'node:fs';
const key=JSON.parse(readFileSync('serviceAccountKey.json','utf8'));
const cfg=JSON.parse(readFileSync('firebase/config.json','utf8'));
initializeApp({credential:cert(key),projectId:key.project_id});
const ct=await getAuth().createCustomToken(process.env.UID||'GwQFCbOfxrcWFaZglTgMX6LWz7S2');
const r=await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=${cfg.apiKey}`,
  {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({token:ct,returnSecureToken:true})});
const {idToken}=await r.json();
const call=async o=>{const res=await fetch(cfg.gasUrl,{method:'POST',redirect:'follow',
  headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify({idToken,...o})});return res.json();};

const only=process.argv.slice(2);
const defs=readdirSync('formdefs').filter(f=>f.endsWith('.json')&&!f.startsWith('_')).map(f=>f.slice(0,-5));
for (const abbr of (only.length?only:defs)){
  const d=JSON.parse(readFileSync(`formdefs/${abbr}.json`,'utf8'));
  const want=[];
  (d.sections||[]).forEach(s=>(s.fields||[]).forEach(f=>{
    const t=f.type||'text';
    if(t==='static'||t==='scan') return;
    if(t==='sign'){ want.push('sig_'+f.k); return; }
    if(t==='check'||t==='select'||t==='scale'||t==='grade'||t==='checklist'||t==='multi'||t==='riskmatrix'||t==='table') return; // มีรูปแบบ token ของตัวเอง
    want.push(f.k);
  }));
  let res;
  try{ res=await call({action:'tplText',abbr}); }catch(e){ res={ok:false,error:e.message}; }
  if(!res || !res.ok || !res.result){ console.log(`${abbr.padEnd(8)} ⚠ ${(res&&res.error)||'ไม่มีแม่แบบ'}`); continue; }
  const txt=res.result.text;
  const miss=want.filter(k=>txt.indexOf('{{'+k+'}}')<0);
  console.log(`${abbr.padEnd(8)} ${miss.length?'🔴 ขาด '+miss.join(', '):'ครบ ('+want.length+' token)'}`);
}
