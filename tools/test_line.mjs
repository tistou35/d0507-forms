/* ทดสอบ gas/Line.gs ในเครื่อง — ไม่แตะ Firestore / LINE / Script Properties จริง
   node tools/test_line.mjs            ทดสอบไฟล์ในรีโป
   node tools/test_line.mjs <file.gs>  ทดสอบไฟล์อื่น (เช่นรุ่นก่อนแก้ เพื่อดูว่าเทสต์จับได้จริง)

   จำลอง
     Firestore REST   runQuery (fieldFilter/compositeFilter AND · orderBy · startAt · limit)
                      GET เอกสาร · list คอลเลกชันย่อย · :commit (lineLog)
     LINE             /v2/bot/message/push · /v2/bot/info
     PropertiesService  ค่าละไม่เกิน 9 KB · รวมไม่เกิน 500 KB (ตามโควตาของ Apps Script)
                        เกิน = throw เหมือนของจริง */
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const FILE = process.argv[2] || fileURLToPath(new URL('../gas/Line.gs', import.meta.url));
const MEMO = fileURLToPath(new URL('../gas/Memo.gs', import.meta.url));
const PROP_MAX = 9 * 1024, PROP_TOTAL = 500 * 1024;
const PROJ = 'projects/test/databases/(default)/documents';

/* ── เวลา: สตริง RFC3339 ทศนิยม 9 หลัก (เหมือน Firestore) ── */
const tsOf = (ms, nanoExtra = 0) => {
  const d = new Date(ms).toISOString();                 // ...sss Z
  return d.slice(0, 19) + '.' + d.slice(20, 23) + String(nanoExtra).padStart(6, '0') + 'Z';
};
const tsKey = s => { const m = /^(.*T\d\d:\d\d:\d\d)(?:\.(\d+))?Z$/.exec(s); return m[1] + '.' + (m[2] || '').padEnd(9, '0'); };
const TS = v => ({ __ts: v });

function makeEnv() {
  const db = {};                        // path → fields (ค่าธรรมดา · เวลาเป็น {__ts})
  const props = {};
  const pushes = [], logs = [];
  let lineOk = true;

  const enc = v => {
    if (v === null || v === undefined) return { nullValue: null };
    if (v && v.__ts) return { timestampValue: v.__ts };
    if (typeof v === 'boolean') return { booleanValue: v };
    if (typeof v === 'number') return Number.isInteger(v) ? { integerValue: String(v) } : { doubleValue: v };
    if (Array.isArray(v)) return { arrayValue: { values: v.map(enc) } };
    if (typeof v === 'object') { const f = {}; for (const k in v) f[k] = enc(v[k]); return { mapValue: { fields: f } }; }
    return { stringValue: String(v) };
  };
  const dec = v => {
    if ('timestampValue' in v) return TS(v.timestampValue);
    if ('stringValue' in v) return v.stringValue;
    if ('booleanValue' in v) return v.booleanValue;
    if ('integerValue' in v) return Number(v.integerValue);
    if ('doubleValue' in v) return v.doubleValue;
    if ('referenceValue' in v) return { __ref: v.referenceValue };
    if ('arrayValue' in v) return (v.arrayValue.values || []).map(dec);
    if ('nullValue' in v) return null;
    if ('mapValue' in v) { const o = {}; const f = v.mapValue.fields || {}; for (const k in f) o[k] = dec(f[k]); return o; }
    throw new Error('dec ' + JSON.stringify(v));
  };
  const get = (o, path) => path.split('.').reduce((a, k) => (a == null ? undefined : a[k]), o);
  const cmp = (a, b) => {                // เทียบค่าแบบ Firestore (เฉพาะชนิดที่ใช้)
    if (a && a.__ts && b && b.__ts) { const x = tsKey(a.__ts), y = tsKey(b.__ts); return x < y ? -1 : x > y ? 1 : 0; }
    if (a && a.__ref !== undefined) a = a.__ref;
    if (b && b.__ref !== undefined) b = b.__ref;
    return a < b ? -1 : a > b ? 1 : 0;
  };
  const same = (a, b) => cmp(a, b) === 0 && (!!(a && a.__ts) === !!(b && b.__ts));
  const test = (doc, f) => {
    const v = f.field.fieldPath === '__name__' ? { __ref: doc.__name } : get(doc.data, f.field.fieldPath), w = dec(f.value);
    if (v === undefined) return false;
    switch (f.op) {
      case 'EQUAL': return same(v, w);
      case 'IN': return w.some(x => same(v, x));
      case 'ARRAY_CONTAINS': return Array.isArray(v) && v.some(x => same(x, w));
      case 'GREATER_THAN': return !!v.__ts === !!w.__ts && cmp(v, w) > 0;
      case 'GREATER_THAN_OR_EQUAL': return !!v.__ts === !!w.__ts && cmp(v, w) >= 0;
      case 'LESS_THAN': return !!v.__ts === !!w.__ts && cmp(v, w) < 0;
      case 'LESS_THAN_OR_EQUAL': return !!v.__ts === !!w.__ts && cmp(v, w) <= 0;
    }
    throw new Error('op ' + f.op);
  };
  const runQuery = q => {
    const coll = q.from[0].collectionId;
    let rows = Object.keys(db).filter(p => { const s = p.split('/'); return s.length === 2 && s[0] === coll; })
      .map(p => ({ __name: PROJ + '/' + p, data: db[p] }));
    const fs = !q.where ? [] : q.where.compositeFilter ? q.where.compositeFilter.filters.map(x => x.fieldFilter) : [q.where.fieldFilter];
    rows = rows.filter(r => fs.every(f => test(r, f)));
    const ord = (q.orderBy || []).map(o => o.field.fieldPath);
    if (!ord.includes('__name__')) ord.push('__name__');
    // Firestore: orderBy บนช่องที่ไม่มีค่า = ไม่รวมเอกสารนั้น
    rows = rows.filter(r => ord.every(k => k === '__name__' || get(r.data, k) !== undefined));
    const key = r => ord.map(k => k === '__name__' ? { __ref: r.__name } : get(r.data, k));
    const kc = (A, B) => { for (let i = 0; i < A.length; i++) { const c = cmp(A[i], B[i]); if (c) return c; } return 0; };
    rows.sort((a, b) => kc(key(a), key(b)));
    if (q.startAt) {
      const cur = q.startAt.values.map(dec);
      rows = rows.filter(r => { const c = kc(key(r).slice(0, cur.length), cur); return q.startAt.before ? c >= 0 : c > 0; });
    }
    if (q.limit) rows = rows.slice(0, q.limit);
    const out = rows.map(r => ({ document: { name: r.__name, fields: enc(r.data).mapValue.fields } }));
    return out.length ? out : [{ readTime: 'x' }];
  };

  const resp = (code, body) => ({ getResponseCode: () => code, getContentText: () => typeof body === 'string' ? body : JSON.stringify(body) });
  const UrlFetchApp = {
    fetch(url, opt = {}) {
      if (url.startsWith('https://api.line.me/v2/bot/message/push') || url === props.LINE_MESSAGING_API_PUSH_URL) {
        const b = JSON.parse(opt.payload); pushes.push({ to: b.to, text: b.messages[0].text });
        return lineOk ? resp(200, {}) : resp(400, { message: 'bad' });
      }
      if (url.startsWith('https://api.line.me/v2/bot/info')) return resp(200, { displayName: 'TEST OA', basicId: '@test' });
      const base = 'https://firestore.googleapis.com/v1/' + PROJ;
      if (!url.startsWith(base)) throw new Error('unexpected fetch ' + url);
      const rest = url.slice(base.length);
      if (rest === ':runQuery') return resp(200, runQuery(JSON.parse(opt.payload).structuredQuery));
      if (rest === ':commit') {
        const w = JSON.parse(opt.payload).writes[0];
        const path = w.update.name.slice(PROJ.length + 1), d = dec({ mapValue: { fields: w.update.fields } });
        (w.updateTransforms || []).forEach(t => { d[t.fieldPath] = TS(tsOf(Date.now())); });
        db[path] = d; if (path.startsWith('lineLog/')) logs.push(d);
        return resp(200, {});
      }
      const [p, qs] = rest.slice(1).split('?');
      if (qs !== undefined) {                     // list คอลเลกชันย่อย
        const pre = p + '/', docs = Object.keys(db).filter(k => k.startsWith(pre) && !k.slice(pre.length).includes('/'))
          .map(k => ({ name: PROJ + '/' + k, fields: enc(db[k]).mapValue.fields }));
        return resp(200, { documents: docs });
      }
      if (!db[p]) return resp(404, {});
      return resp(200, { name: PROJ + '/' + p, fields: enc(db[p]).mapValue.fields });
    },
  };
  const size = () => Object.entries(props).reduce((n, [k, v]) => n + Buffer.byteLength(k) + Buffer.byteLength(v), 0);
  const P = {
    getProperty: k => (k in props ? props[k] : null),
    setProperty(k, v) { v = String(v);
      if (Buffer.byteLength(v) > PROP_MAX) throw new Error('Argument too large: value (' + k + ' ' + Buffer.byteLength(v) + ' bytes)');
      const old = props[k]; props[k] = v;
      if (size() > PROP_TOTAL) { if (old === undefined) delete props[k]; else props[k] = old; throw new Error('Property storage quota exceeded'); }
      return P; },
    setProperties(o) { for (const k in o) if (Buffer.byteLength(String(o[k])) > PROP_MAX) throw new Error('Argument too large: value (' + k + ')');
      for (const k in o) P.setProperty(k, o[k]); return P; },
    deleteProperty(k) { delete props[k]; return P; },
    getProperties: () => Object.assign({}, props),
  };
  const fmt = (d, tz, f) => {
    const b = new Date(d.getTime() + 7 * 3600e3), iso = b.toISOString();
    if (f === 'yyyy-MM-dd') return iso.slice(0, 10);
    if (f === 'u') return String(b.getUTCDay() || 7);
    if (f === 'HH:mm') return iso.slice(11, 16);
    throw new Error('fmt ' + f);
  };
  const triggers = [];
  const ctx = {
    console, JSON, Math, Date, Number, String, Array, Object, isNaN, encodeURIComponent,
    UrlFetchApp,
    PropertiesService: { getScriptProperties: () => P },
    LockService: { getScriptLock: () => ({ tryLock: () => true, releaseLock() {} }) },
    Utilities: { formatDate: fmt, getUuid: () => crypto.randomUUID() },
    Logger: { log: m => { if (process.env.V) console.log('  [Logger]', m); } },
    ScriptApp: { getProjectTriggers: () => triggers, deleteTrigger() {}, newTrigger: () => ({}) },
    cfg_: k => (k === 'FIREBASE_PROJECT' ? 'test' : 'x'),
    adminHeaders_: () => ({}),
  };
  vm.createContext(ctx);
  const memo = readFileSync(MEMO, 'utf8');
  const pick = name => { const i = memo.indexOf('function ' + name + '('); const j = memo.indexOf('\nfunction ', i + 1); return memo.slice(i, j); };
  vm.runInContext(pick('fsFields_') + '\n' + pick('fsVal_'), ctx);
  // fsVal_ ของ Memo.gs คืน timestampValue เป็นสตริง — ตรงกับของจริง
  vm.runInContext(readFileSync(FILE, 'utf8'), ctx);
  return { ctx, db, props, P, pushes, logs, setLine: ok => { lineOk = ok; } };
}

/* ── ข้อมูลตั้งต้น: ระบบเปิดแล้ว ส่งจริง มี token มี LINE ID ทุกคน ── */
const U = n => 'u' + String(n).padStart(3, '0');
const LID = n => 'U' + crypto.createHash('md5').update(String(n)).digest('hex');
function seed(env, nUsers = 1200) {
  const people = {};
  for (let i = 0; i < nUsers; i++) people[U(i)] = { line: LID(i), on: true, name: 'User ' + i };
  people.admin = { line: LID('admin'), on: true, name: 'Admin' };
  env.db['lineConfig/settings'] = { enabled: true, people };
  env.db['staffDirectory/current'] = { list: [{ id: 'admin', name: 'Admin', positions: ['CMM', 'CFI', 'HT', 'SM'] }] };
  env.db['publicDirectory/instructors'] = { list: [] };
  env.db['config/admins'] = { uids: ['admin'] };
  env.props.LINE_CHANNEL_ACCESS_TOKEN = 'x'.repeat(150);
  env.props.LINE_WATERMARK = tsOf(Date.now() - 3600e3);
}
const addTask = (env, id, ms, nano = 0, extra = {}) => {
  env.db['tasks/' + id] = Object.assign({ state: 'open', assigneeUid: extra.to || U(0), assigneeName: 'X', title: 'T ' + id,
    tracking: id, fromUid: 'someone', createdAt: TS(tsOf(ms, nano)) }, extra);
};
const propSizes = env => Object.entries(env.props).map(([k, v]) => [k, Buffer.byteLength(v)]).sort((a, b) => b[1] - a[1]);
const countBy = (arr, f) => arr.reduce((m, x) => { const k = f(x); m[k] = (m[k] || 0) + 1; return m; }, {});

/* ── ตัวทดสอบ ── */
const results = [];
async function T(name, fn) {
  try { await fn(); results.push([name, true, '']); console.log('PASS', name); }
  catch (e) { results.push([name, false, e.message]); console.log('FAIL', name, '—', e.message); }
}
const ok = (c, m) => { if (!c) throw new Error(m); };

await T('1  ackDue: หนังสือเวียนไม่มี expiresOn ยังเตือนคนที่ยังไม่รับทราบ (และไม่เตือนซ้ำรอบเดียวกัน)', () => {
  const e = makeEnv(); seed(e);
  const day = n => new Date(Date.now() + 7 * 3600e3 + n * 864e5).toISOString().slice(0, 10);
  e.db['memos/m1'] = { status: 'issued', circular: true, ackChannel: 'forms', subject: 'S', number: 'N1',
    recipients: [{ uid: U(1), name: 'A' }, { uid: U(2), name: 'B' }], recipientUids: [U(1), U(2)],
    issuedAt: TS(tsOf(Date.now() - 10 * 864e5)), effectiveFrom: day(-3) };
  e.db['memos/m1/acks/' + U(2)] = { at: TS(tsOf(Date.now())) };
  const r = e.ctx.lineDaily(true);
  ok(!r.error, 'error: ' + r.error);
  const ack = e.pushes.filter(p => /ยังไม่ได้รับทราบ/.test(p.text));
  ok(ack.length === 1 && ack[0].to === LID(1), 'ackDue ควรส่งถึง ' + U(1) + ' คนเดียว ได้ ' + ack.length);
  ok(e.pushes.some(p => /สรุปงานค้าง/.test(p.text)), 'weekly ควรมีด้วยเมื่อสั่ง force');
  const before = e.pushes.length; e.ctx.lineDaily(true);
  ok(e.pushes.filter(p => /ยังไม่ได้รับทราบ/.test(p.text)).length === 1, 'รอบเดียวกันไม่ควรเตือนซ้ำ');
  ok(e.pushes.length > before, 'weekly/overdue ยังส่งได้');
});

await T('2  stream: 101 งานเวลาเดียวกันทุกตัว — ครบ 101 ไม่ซ้ำ ภายในสามรอบ', () => {
  const e = makeEnv(); seed(e);
  e.ctx.lineTick();                                         // เปิดสายอื่น (init)
  const t0 = Date.now() - 30e3;
  for (let i = 0; i < 101; i++) addTask(e, 'k' + String(i).padStart(4, '0'), t0, 0, { to: U(i) });
  for (let k = 0; k < 3; k++) { const r = e.ctx.lineTick(); ok(!r.error, 'error: ' + r.error); }
  const c = countBy(e.pushes, p => p.to), n = Object.keys(c).length;
  ok(n === 101, 'ควรได้ 101 คน ได้ ' + n);
  ok(Object.values(c).every(v => v === 1), 'มีคนได้ซ้ำ');
});

await T('3  stream: เวลาเท่ากันคร่อมรอยต่อหน้า (99/100/101) และ 1,050 รายการใน 3 นาที — ไม่ตกหล่น ไม่ซ้ำ', () => {
  const e = makeEnv(); seed(e); e.ctx.lineTick();
  const t0 = Date.now() - 120e3; let n = 0;
  // 1,050 งาน · ทุก 7 ตัวเวลาเท่ากัน · บางตัวต่างกันแค่ระดับนาโนวินาที
  for (let i = 0; i < 1050; i++) addTask(e, 'j' + String(i).padStart(5, '0'), t0 + Math.floor(i / 7), (i % 3) * 100, { to: U(i) }), n++;
  const runs = [];
  for (let k = 0; k < 4; k++) { const r = e.ctx.lineTick(); ok(!r.error, 'error: ' + r.error); runs.push(r.events); }
  const c = countBy(e.pushes, p => p.to);
  ok(Object.keys(c).length === n, 'ควรได้ ' + n + ' ได้ ' + Object.keys(c).length + ' (รอบละ ' + runs.join('/') + ')');
  ok(Object.values(c).every(v => v === 1), 'มีซ้ำ');
  ok(runs[0] === 1000 && runs[1] === 50 && runs[2] === 0, 'ควรเป็น 1000/50/0 ได้ ' + runs.join('/'));
});

await T('4  stream: เอกสาร commit ช้า (เวลาก่อน cursor ในช่วงย้อน) — ทำครั้งเดียว', () => {
  const e = makeEnv(); seed(e); e.ctx.lineTick();
  const t0 = Date.now() - 20e3;
  addTask(e, 'a1', t0); e.ctx.lineTick();
  addTask(e, 'a0-late', t0 - 60e3, 0, { to: U(5) });       // เวลาเก่ากว่า cursor 60 วินาที
  e.ctx.lineTick(); e.ctx.lineTick();
  const c = countBy(e.pushes, p => p.to);
  ok(c[LID(5)] === 1, 'งานที่มาช้าควรได้หนึ่งครั้ง ได้ ' + (c[LID(5)] || 0));
  ok(c[LID(0)] === 1, 'งานแรกต้องไม่ซ้ำ');
});

await T('5  stream: ย้ายจาก LINE_WM_* + LINE_SENT รุ่นเดิม — ไม่ทำซ้ำ และลบของเก่าทิ้ง', () => {
  const e = makeEnv(); seed(e);
  const wm = tsOf(Date.now() - 60e3);
  ['task', 'sub', 'close', 'user', 'memo'].forEach(k => { e.props['LINE_WM_' + k] = wm; });
  addTask(e, 'old1', Date.now() - 90e3);                     // อยู่ในช่วงย้อน และทำไปแล้วตามรุ่นเดิม
  e.props.LINE_SENT = JSON.stringify(['task:old1']);
  addTask(e, 'new1', Date.now() - 10e3, 0, { to: U(7) });
  const r = e.ctx.lineTick(); ok(!r.error, 'error: ' + r.error);
  ok(e.pushes.length === 1 && e.pushes[0].to === LID(7), 'ควรส่งเฉพาะงานใหม่ ได้ ' + e.pushes.length);
  ok(!('LINE_SENT' in e.props) && !('LINE_WM_task' in e.props), 'ควรลบ LINE_SENT / LINE_WM_* ทิ้ง');
});

await T('6  Script Property: ทุกค่าไม่เกิน 9 KB หลังงานจำนวนมาก (LINE_ST_* แบ่งท่อน)', () => {
  const e = makeEnv(); seed(e); e.ctx.lineTick();
  const t0 = Date.now() - 100e3;
  for (let i = 0; i < 1200; i++) addTask(e, 'p' + String(i).padStart(5, '0'), t0 + i * 10, 0, { to: U(i) });
  for (let k = 0; k < 3; k++) { const r = e.ctx.lineTick(); ok(!r.error, 'error: ' + r.error); }
  const big = propSizes(e)[0];
  ok(big[1] <= PROP_MAX, 'ค่าที่ใหญ่สุด ' + big[0] + ' = ' + big[1] + ' bytes');
  ok(Object.keys(countBy(e.pushes, p => p.to)).length === 1200, 'ควรได้ครบ 1200');
  console.log('     ใหญ่สุด:', propSizes(e).slice(0, 3).map(x => x.join(' ')).join(' · '));
});

await T('7  LINE_DONE: หนังสือใกล้หมดอายุ 600 ฉบับ — ไม่เกิน 9 KB ต่อค่า ไม่ส่งซ้ำ และตัดเมื่อหนังสือไม่ issued แล้ว', () => {
  const e = makeEnv(); seed(e);
  const day = n => new Date(Date.now() + 7 * 3600e3 + n * 864e5).toISOString().slice(0, 10);
  for (let i = 0; i < 600; i++) e.db['memos/x' + String(i).padStart(18, '0')] = { status: 'issued', expiresOn: day(20),
    beneficiaryUid: U(i), beneficiaryName: 'B', number: 'N' + i, subject: 'S' };
  let r = e.ctx.lineDaily(true); ok(!r.error, 'error: ' + r.error);
  const ex = () => e.pushes.filter(p => /จะหมดอายุ/.test(p.text)).length;
  ok(ex() === 600 + 600, 'ควรส่ง 600 ฉบับ × (ผู้ได้รับ + HT) = 1200 ได้ ' + ex());   // HT = admin
  r = e.ctx.lineDaily(true); ok(!r.error, 'error: ' + r.error);
  ok(ex() === 1200, 'รอบสองไม่ควรส่งซ้ำ ได้ ' + ex());
  ok(propSizes(e)[0][1] <= PROP_MAX, 'ใหญ่สุด ' + propSizes(e)[0].join(' '));
  for (let i = 0; i < 300; i++) e.db['memos/x' + String(i).padStart(18, '0')].status = 'superseded';
  e.ctx.lineDaily(true);
  const done = e.ctx.linePropGet_(e.P, 'LINE_DONE');
  ok(Array.isArray(done) && done.length === 300, 'ควรเหลือ 300 รายการ ได้ ' + (done && done.length));
  console.log('     LINE_DONE 600 ฉบับ:', propSizes(e).filter(x => x[0].startsWith('LINE_DONE')).map(x => x.join(' ')).join(' · '));
});

await T('8  expiry: เกณฑ์ 30 และ 7 วัน ส่งครั้งเดียวต่อเกณฑ์', () => {
  const e = makeEnv(); seed(e);
  const day = n => new Date(Date.now() + 7 * 3600e3 + n * 864e5).toISOString().slice(0, 10);
  e.db['memos/e1'] = { status: 'issued', expiresOn: day(25), beneficiaryUid: U(3), number: 'E1', subject: 'S' };
  e.ctx.lineDaily(true); e.ctx.lineDaily(true);
  e.db['memos/e1'].expiresOn = day(6); e.ctx.lineDaily(true); e.ctx.lineDaily(true);
  const mine = e.pushes.filter(p => p.to === LID(3) && /จะหมดอายุ/.test(p.text));
  ok(mine.length === 2, 'ควรได้ 2 ครั้ง (30 · 7) ได้ ' + mine.length);
});

await T('9  ข้อความ: บรรทัดที่คำแทนที่ว่างถูกตัด ไม่เหลือบรรทัดว่าง', () => {
  const e = makeEnv();
  const out = e.ctx.lineRender_('A[ผล]\n[หมายเหตุ]\nB [เลขที่]\n[ลิงก์]', { '[ผล]': 'x', '[หมายเหตุ]': '', '[เลขที่]': '1', '[ลิงก์]': 'L' });
  ok(out === 'Ax\nB 1\nL', JSON.stringify(out));
});

const pass = results.filter(r => r[1]).length;
console.log(`\n${pass}/${results.length} ผ่าน · ${FILE.split('/').slice(-2).join('/')}`);
process.exit(pass === results.length ? 0 : 1);
