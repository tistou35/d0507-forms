/* ทดสอบ firestore.rules ของใบเสร็จ (receipts) 37 กรณี ด้วยบัญชี TEST_RC_* แล้วลบทิ้งเอง
   node tools/test_receipts_rules.mjs   ⚠️ อย่ารันระหว่างที่ข้อมูลจาก _seed_rcpt_test.mjs ยังอยู่ — ลบบัญชีชุดเดียวกัน */
import { initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { readFileSync } from 'node:fs';
const key=JSON.parse(readFileSync('serviceAccountKey.json','utf8'));
const cfg=JSON.parse(readFileSync('firebase/config.json','utf8'));
initializeApp({credential:cert(key),projectId:key.project_id});
const db=getFirestore(), auth=getAuth(), P=key.project_id;
const BASE=`https://firestore.googleapis.com/v1/projects/${P}/databases/(default)/documents`;
const U={owner:'TEST_RC_OWNER',fa:'TEST_RC_FA',dlg:'TEST_RC_DLG',oth:'TEST_RC_OTHER'};
const ADMIN='GwQFCbOfxrcWFaZglTgMX6LWz7S2';
await db.doc('users/'+U.owner).set({name:'TEST Owner',roles:['ins'],active:true});
await db.doc('users/'+U.fa).set({name:'TEST FA',roles:['ins'],positions:['FA'],active:true});
await db.doc('users/'+U.dlg).set({name:'TEST Delegate',roles:['ins'],active:true});
await db.doc('users/'+U.oth).set({name:'TEST Other',roles:['ins'],active:true});
const tok={};
for (const [k,uid] of Object.entries({...U,admin:ADMIN})){
  const ct=await auth.createCustomToken(uid);
  const r=await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=${cfg.apiKey}`,
    {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({token:ct,returnSecureToken:true})});
  tok[k]=(await r.json()).idToken;
}
const enc=v=> v===null?{nullValue:null}: typeof v==='string'?{stringValue:v}: Number.isInteger(v)?{integerValue:String(v)}:
  typeof v==='number'?{doubleValue:v}: typeof v==='boolean'?{booleanValue:v}:
  {mapValue:{fields:Object.fromEntries(Object.entries(v).map(([k,x])=>[k,enc(x)]))}};
// write(who, id, fields, {ts:[...], del:[...], create:bool, merge:bool})
async function write(who,id,fields,o={}){
  const name=`projects/${P}/databases/(default)/documents/receipts/${id}`;
  const w={update:{name,fields:Object.fromEntries(Object.entries(fields).map(([k,v])=>[k,enc(v)]))}};
  if(o.merge){ w.updateMask={fieldPaths:[...Object.keys(fields),...(o.del||[])]}; w.currentDocument={exists:true}; }
  if(o.create) w.currentDocument={exists:false};
  if(o.ts) w.updateTransforms=o.ts.map(f=>({fieldPath:f,setToServerValue:'REQUEST_TIME'}));
  const r=await fetch(`https://firestore.googleapis.com/v1/projects/${P}/databases/(default)/documents:commit`,
    {method:'POST',headers:{Authorization:'Bearer '+tok[who],'Content-Type':'application/json'},body:JSON.stringify({writes:[w]})});
  return r.status===200;
}
async function read(who,id){ const r=await fetch(`${BASE}/receipts/${id}`,{headers:{Authorization:'Bearer '+tok[who]}}); return r.status===200; }
async function del(who,id){ const r=await fetch(`${BASE}/receipts/${id}`,{method:'DELETE',headers:{Authorization:'Bearer '+tok[who]}}); return r.status===200; }
const base=(uid,extra={})=>({uid,month:'2026-11',date:'2026-11-10',vendor:'TEST vendor',desc:'TEST receipt',catId:199496,catName:'ค่าเดินทางและที่พัก',
  amount:500,vat:'none',file:{id:'TESTFILE'},...extra});
let pass=0,fail=0; const T=(name,got,want)=>{ const ok=got===want; ok?pass++:fail++; console.log((ok?'✓':'✗ FAIL'),name,'→',got?'allowed':'denied'); };
const R=(n)=>'TEST_RC_'+n;
const created=[];
const mk=async(who,id,f,ts=['createdAt'])=>{ created.push(id); return write(who,id,f,{create:true,ts}); };

T('owner creates draft', await mk('owner',R(1),{...base(U.owner),status:'draft'}), true);
T('owner creates review direct', await mk('owner',R(2),{...base(U.owner),status:'review'},['createdAt','submittedAt']), true);
T('owner create with pay=income', await mk('owner',R(3),{...base(U.owner),status:'draft',pay:'income'}), false);
T('owner create status ok', await mk('owner',R(4),{...base(U.owner),status:'ok'}), false);
T('owner submits draft→review', await write('owner',R(1),{status:'review'},{merge:true,ts:['submittedAt']}), true);
T('owner self-approve', await write('owner',R(1),{status:'ok',pay:'reimb',reviewedBy:U.owner,reviewedByName:'x'},{merge:true,ts:['reviewedAt']}), false);
T('other (non-FA) approves', await write('oth',R(1),{status:'ok',pay:'reimb',reviewedBy:U.oth,reviewedByName:'x'},{merge:true,ts:['reviewedAt']}), false);
T('other reads receipt', await read('oth',R(1)), false);
T('FA approves owner receipt', await write('fa',R(1),{status:'ok',pay:'reimb',reviewedBy:U.fa,reviewedByName:'TEST FA'},{merge:true,ts:['reviewedAt']}), true);
T('FA approves with pay=income', await write('fa',R(2),{status:'ok',pay:'income',reviewedBy:U.fa,reviewedByName:'TEST FA'},{merge:true,ts:['reviewedAt']}), false);
T('FA delegates to owner (self)', await write('fa',R(2),{reviewerUid:U.owner,reviewerName:'o',delegatedBy:U.fa,delegatedByName:'f'},{merge:true,ts:['delegatedAt']}), false);
T('FA delegates to delegate', await write('fa',R(2),{reviewerUid:U.dlg,reviewerName:'TEST Delegate',delegatedBy:U.fa,delegatedByName:'TEST FA'},{merge:true,ts:['delegatedAt']}), true);
T('delegate reads assigned', await read('dlg',R(2)), true);
T('delegate reads unassigned', await read('dlg',R(1)), false);
T('delegate re-delegates', await write('dlg',R(2),{reviewerUid:U.oth,reviewerName:'o',delegatedBy:U.dlg,delegatedByName:'d'},{merge:true,ts:['delegatedAt']}), false);
T('delegate returns without reason', await write('dlg',R(2),{status:'returned',reviewedBy:U.dlg,reviewedByName:'d'},{merge:true,ts:['reviewedAt']}), false);
T('delegate returns with reason', await write('dlg',R(2),{status:'returned',reviewNote:'รูปไม่ชัด',reviewedBy:U.dlg,reviewedByName:'TEST Delegate'},{merge:true,ts:['reviewedAt']}), true);
T('owner edit returned changes reviewer', await write('owner',R(2),{...base(U.owner),status:'draft',reviewNote:'รูปไม่ชัด'},{ts:['updatedAt','createdAt']}), false);
T('owner chooses income on returned', await write('owner',R(2),{status:'ok',pay:'income'},{merge:true,ts:['incomeAt']}), true);
T('owner chooses income on ok (again)', await write('owner',R(2),{status:'ok',pay:'income'},{merge:true,ts:['incomeAt']}), false);
// claim / free
T('owner claims review receipt', await mk('owner',R(5),{...base(U.owner),status:'review'},['createdAt','submittedAt']) && await write('owner',R(5),{status:'claimed',claimId:'TESTCLAIMX',claimTrk:'T'},{merge:true,ts:['claimedAt']}), false);
T('owner claims ok receipt', await write('owner',R(1),{status:'claimed',claimId:'TESTCLAIMX',claimTrk:'MRF-TEST'},{merge:true,ts:['claimedAt']}), true);
T('owner frees claim (no submission) → ok', await write('owner',R(1),{status:'ok'},{merge:true,del:['claimId','claimTrk','claimedAt'],ts:['updatedAt']}), true);
T('FA returns ok (unclaimed) receipt', await write('fa',R(1),{status:'returned',reviewNote:'ขอใบกำกับภาษี',reviewedBy:U.fa,reviewedByName:'TEST FA'},{merge:true,del:['pay'],ts:['reviewedAt']}), true);
// owner edits returned (keeping fields) then delete
const r1=(await db.doc('receipts/'+R(1)).get()).data(); delete r1.createdAt; delete r1.reviewedAt; delete r1.submittedAt;
T('owner edits returned → draft', await write('owner',R(1),{...r1,status:'draft',amount:450},{ts:['updatedAt','createdAt']}).then(async ok=>ok), false /* createdAt must equal old: REQUEST_TIME differs */);
const full=(await db.doc('receipts/'+R(1)).get()).data();
// proper edit: keep createdAt via admin-read value is a Timestamp; REST needs timestampValue
async function editKeep(who,id,patch){
  const cur=(await db.doc('receipts/'+id).get()).data();
  const fields={}; for(const [k,v] of Object.entries({...cur,...patch})){ if(k==='updatedAt')continue;
    fields[k]= v && v.toDate ? {timestampValue:v.toDate().toISOString()} : enc(v); }
  const name=`projects/${P}/databases/(default)/documents/receipts/${id}`;
  const r=await fetch(`https://firestore.googleapis.com/v1/projects/${P}/databases/(default)/documents:commit`,
    {method:'POST',headers:{Authorization:'Bearer '+tok[who],'Content-Type':'application/json'},
     body:JSON.stringify({writes:[{update:{name,fields},updateTransforms:[{fieldPath:'updatedAt',setToServerValue:'REQUEST_TIME'}]}]})});
  return r.status===200;
}
T('owner edits returned → draft (keep createdAt)', await editKeep('owner',R(1),{status:'draft',amount:450}), true);
T('owner withdraws: submit then review→draft', await write('owner',R(1),{status:'review'},{merge:true,ts:['submittedAt']}) && await write('owner',R(1),{status:'draft'},{merge:true,ts:['updatedAt']}), true);
// FA owns receipt — cannot approve own
T('FA creates own receipt', await mk('fa',R(6),{...base(U.fa),status:'review'},['createdAt','submittedAt']), true);
T('FA approves own receipt', await write('fa',R(6),{status:'ok',pay:'reimb',reviewedBy:U.fa,reviewedByName:'f'},{merge:true,ts:['reviewedAt']}), false);
T('FA creates on behalf of owner', await mk('fa',R(7),{...base(U.owner),status:'review',byUid:U.fa,byName:'TEST FA'},['createdAt','submittedAt']), true);
T('FA approves receipt it entered on behalf', await write('fa',R(7),{status:'ok',pay:'reimb',reviewedBy:U.fa,reviewedByName:'f'},{merge:true,ts:['reviewedAt']}), false);
T('admin approves FA-entered receipt', await write('admin',R(7),{status:'ok',pay:'reimb',reviewedBy:ADMIN,reviewedByName:'admin'},{merge:true,ts:['reviewedAt']}), true);
T('owner deletes review receipt', await del('owner',R(5)), false);
T('owner deletes draft', await del('owner',R(1)), true);
// posted
T('owner claims R7', await write('owner',R(7),{status:'claimed',claimId:'TESTCLAIMX',claimTrk:'MRF-TEST'},{merge:true,ts:['claimedAt']}), true);
T('FA (non-admin) marks posted', await write('fa',R(7),{status:'posted',faSerial:'EXP-TEST',postedBy:U.fa},{merge:true,ts:['postedAt']}), false);
T('admin marks posted', await write('admin',R(7),{status:'posted',faSerial:'EXP-TEST',postedBy:ADMIN},{merge:true,ts:['postedAt']}), true);
console.log(`\n${pass} pass · ${fail} fail`);
// cleanup
for (const id of created) await db.doc('receipts/'+id).delete().catch(()=>{});
for (const uid of Object.values(U)){ await db.doc('users/'+uid).delete(); await auth.deleteUser(uid).catch(()=>{}); }
const left=await db.collection('receipts').get(); console.log('receipts left', left.size);
process.exit(0);
