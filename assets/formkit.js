/* ============================================================
   formkit.js — ตัวเรนเดอร์ฟอร์มตามแบบมาตรฐาน
   อ่านนิยามจาก formdefs/<CODE>.json (สเปกที่ formdefs/_SCHEMA.md)
   แล้วสร้างหน้ากรอก ตรวจความถูกต้อง คำนวณ เดิน gate และลำดับอนุมัติ

   เพิ่มฟอร์มใหม่ = เพิ่มไฟล์ JSON ไม่ต้องแตะไฟล์นี้
   ============================================================ */
(function (global) {
  'use strict';

  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g,
    c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  /* รับได้ทั้ง {th,en} และสตริงเปล่า ๆ · ขาดคำแปลก็ยังได้ข้อความ ไม่ใช่ช่องว่าง */
  const L = (o, lang) => typeof o === 'string' ? o
    : (o && (o[lang || 'th'] || o.th || o.en)) || '';

  /* ข้อความของตัวเรนเดอร์เอง — ที่ไม่ได้มาจากนิยามฟอร์ม */
  const UI = {
    yes:        { th: 'ใช่', en: 'Yes' },
    readonly:   { th: 'อ่านอย่างเดียว', en: 'read only' },
    blind:      { th: 'ส่วนนี้ถูกซ่อนไว้จนกว่าคุณจะส่งส่วนของตัวเอง — ตามข้อกำหนดที่ให้แต่ละฝ่ายประเมินอย่างอิสระ',
                  en: 'Hidden until you submit your own part — each party assesses independently.' },
    rowAdd:     { th: 'เพิ่มแถว', en: 'Add row' },
    rowDel:     { th: 'ลบแถวที่', en: 'Delete row' },
    clearSign:  { th: 'ล้างลายเซ็น', en: 'Clear signature' },
    route:      { th: 'ลำดับอนุมัติ', en: 'Approval route' },
    step:       { th: 'ขั้นที่', en: 'Step' },
    mustSign:   { th: 'ต้องลงนาม', en: 'Signature required' },
    noSign:     { th: 'ไม่ต้องลงนาม', en: 'No signature' },
    within:     { th: 'ภายใน', en: 'within' },
    days:       { th: 'วัน', en: 'days' },
    riskTotal:  { th: 'คะแนนความเสี่ยงรวม', en: 'Total risk score' },
    scoreTotal: { th: 'คะแนนรวม', en: 'Total score' },
    scoreAuto:  { th: 'คำนวณอัตโนมัติจากคำตอบ', en: 'Calculated automatically from your answers' },
    answered:   { th: 'ตอบแล้ว', en: 'Answered' },
    sections:   { th: 'ส่วนของฟอร์ม', en: 'Form sections' },
    stMiss:     { th: n => 'ยังไม่ครบ ' + n + ' ช่อง', en: n => n + ' field' + (n > 1 ? 's' : '') + ' still empty' },
    stScore:    { th: n => 'ได้ ' + n + ' คะแนน', en: n => n + ' risk point' + (n > 1 ? 's' : '') },
    stDone:     { th: 'ตอบครบแล้ว', en: 'Complete' },
    stIdle:     { th: 'ยังไม่ได้กรอก', en: 'Not started' },
    badFormat:  { th: 'รูปแบบไม่ตรงตัวอย่าง', en: 'Format does not match the example' },
    limit:      { th: 'เพดาน', en: 'limit' },
    fillFirst:  { th: n => 'กรอกช่องบังคับในหน้านี้ให้ครบก่อน — เหลืออีก ' + n + ' ช่อง (ที่ทำเครื่องหมายไว้)',
                  en: n => 'Complete the required fields on this page first — ' + n + ' left (marked below)' },
  };
  const T = (k, lang, arg) => {
    const v = L(UI[k], lang);
    return typeof v === 'function' ? v(arg) : v;
  };

  /* ── ตัวประเมินเงื่อนไข ──────────────────────────────────
     รองรับเท่าที่สเปกต้องใช้: เปรียบเทียบ ค่าคงที่ && || และ
     ฟังก์ชันช่วย anyStarBelow(n) · ไม่ใช้ eval กับข้อมูลผู้ใช้ */
  const OPS = ['>=', '<=', '==', '!=', '>', '<'];
  function evalCond(expr, ctx) {
    if (!expr) return true;
    if (expr.includes('||')) return expr.split('||').some(p => evalCond(p.trim(), ctx));
    if (expr.includes('&&')) return expr.split('&&').every(p => evalCond(p.trim(), ctx));

    const fn = expr.match(/^(\w+)\(([^)]*)\)$/);
    if (fn) {
      const arg = fn[2].trim().replace(/^['"]|['"]$/g, '');
      if (fn[1] === 'anyStarBelow') return ctx.__anyStarBelow(Number(arg));
      if (fn[1] === 'anyBelow') return ctx.__anyBelow(Number(arg));
      if (fn[1] === 'filled') return ctx[arg] !== undefined && ctx[arg] !== '' && ctx[arg] !== null;
      return false;
    }
    /* "evType has other" — ใช้กับ multi ที่เก็บเป็น array
       ไม่มีตัวนี้ก็เขียนเงื่อนไข "ติ๊กข้อนี้ไหม" กับช่องเลือกหลายค่าไม่ได้เลย */
    const hasM = expr.match(/^(\w+)\s+has\s+(.+)$/);
    if (hasM) {
      const v = ctx[hasM[1]];
      const want = hasM[2].trim().replace(/^['"]|['"]$/g, '');
      return Array.isArray(v) ? v.indexOf(want) >= 0 : String(v) === want;
    }

    for (const op of OPS) {
      const i = expr.indexOf(op);
      if (i < 0) continue;
      const lhs = expr.slice(0, i).trim();
      let rhs = expr.slice(i + op.length).trim().replace(/^['"]|['"]$/g, '');
      let a = ctx[lhs];
      let b = rhs === 'true' ? true : rhs === 'false' ? false :
              (rhs !== '' && !isNaN(Number(rhs))) ? Number(rhs) : rhs;
      if (typeof b === 'number') a = Number(a);
      switch (op) {
        case '>=': return a >= b; case '<=': return a <= b;
        case '>':  return a > b;  case '<':  return a < b;
        case '==': return a == b; case '!=': return a != b;
      }
    }
    return !!ctx[expr.trim()];
  }

  /* ── คะแนนของฟิลด์ — "<8": 3 แปลว่า ถ้าค่าน้อยกว่า 8 ได้ 3 คะแนน ── */
  function fieldScore(f, v) {
    if (!f.score || v === undefined || v === '' || v === null) return 0;
    if (typeof f.score === 'number') return v ? f.score : 0;
    let s = 0;
    for (const key of Object.keys(f.score)) {
      const pts = f.score[key];
      const m = key.match(/^(>=|<=|>|<|==)?(.+)$/);
      const op = m[1] || '==';
      const raw = m[2];
      const b = isNaN(Number(raw)) ? raw : Number(raw);
      const a = typeof b === 'number' ? Number(v) : v;
      const hit = op === '<' ? a < b : op === '>' ? a > b :
                  op === '<=' ? a <= b : op === '>=' ? a >= b : a == b;
      if (hit) s += pts;
    }
    return s;
  }

  function FormKit(def, opts) {
    opts = opts || {};
    this.def = def;
    // ไม่ได้ส่งมาก็ตามภาษาที่ผู้ใช้เลือกไว้ทั้งเว็บ
    this.lang = opts.lang || (global.D0507 && global.D0507.lang) || 'th';
    this.data = opts.data || {};
    this.party = opts.party || null;          // party ที่ผู้ใช้ปัจจุบันกรอกได้
    this.readonly = !!opts.readonly;
    this.onChange = opts.onChange || function () {};
    this.fields = {};
    (def.sections || []).forEach(s => (s.fields || []).forEach(f => { this.fields[f.k] = f; f.__sec = s; }));

    // ค่าตั้งต้น — ใส่ตอนสร้าง ไม่ใช่ตอนเรนเดอร์
    // จะได้นับเป็น "ตอบแล้ว" และติดไปกับใบที่ส่งออกแม้ผู้กรอกไม่ได้แตะช่องนั้น
    Object.keys(this.fields).forEach(k => {
      if (this.data[k] !== undefined) return;
      const f = this.fields[k];
      if (f.prefill === 'today') this.data[k] = todayISO();
      else if (f.prefill === 'now') this.data[k] = clockHM();
      else if (f.def !== undefined) this.data[k] = f.def;
    });
  }

  /* วันที่ของเครื่องผู้ใช้ ไม่ใช่ UTC — toISOString() จะเพี้ยนไปหนึ่งวัน
     ที่ไทย (UTC+7) ทุกครั้งที่กรอกก่อนเจ็ดโมงเช้า */
  const p2 = n => String(n).padStart(2, '0');
  function todayISO(d) {
    d = d || new Date();
    return d.getFullYear() + '-' + p2(d.getMonth() + 1) + '-' + p2(d.getDate());
  }
  function clockHM(d) {
    d = d || new Date();
    return p2(d.getHours()) + ':' + p2(d.getMinutes());
  }
  /* แถวของ field ชนิด table — เติมให้ครบ rows ขั้นต่ำเสมอ
     กระดาษพิมพ์แถวว่างไว้ให้เขียน หน้าจอจึงควรมีแถวว่างรออยู่เท่ากัน ไม่ใช่เริ่มจากศูนย์ */
  function tableRows(f, v) {
    const arr = Array.isArray(v) ? v.slice() : [];
    const min = f.rows || 1;
    while (arr.length < min) arr.push({});
    return arr;
  }

  /* ISO -> DD/MM/YYYY · ช่อง <input type="date"> แสดงตาม locale ของเบราว์เซอร์
     ซึ่งบังคับไม่ได้ จึงต้องมีบรรทัดกำกับว่าวันที่ที่เลือกคือวันไหนกันแน่ */
  function dmy(iso) {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(iso || ''));
    return m ? m[3] + '/' + m[2] + '/' + m[1] : '';
  }
  /* {YYYYMM} ในตัวอย่างที่แสดงในช่อง — ให้เป็นเดือนปัจจุบันเสมอ ไม่ค้างเป็นเดือนเก่า */
  function ph(s) {
    const d = new Date();
    return String(s || '').replace(/\{YYYYMM\}/g, d.getFullYear() + p2(d.getMonth() + 1));
  }

  /* ── mask: ใส่ตัวคั่นให้อัตโนมัติระหว่างพิมพ์ ──────────────
     "AAAA-999999-999"   A = ตัวอักษร (แปลงเป็นตัวใหญ่) · 9 = ตัวเลข · อื่น ๆ = ตัวคั่น

     กลุ่มที่ยาวไม่คงที่รองรับได้ — พิมพ์ตัวที่ไม่เข้าคลาสปัจจุบันเมื่อไร
     ให้ข้ามไปตัวคั่นถัดไป  เช่น AS แล้วพิมพ์ 2 ต่อ ได้ AS-2 ทันที
     ตัวคั่นโผล่พร้อมตัวถัดไป ไม่ค้างเป็น "AS-" ให้ลบทิ้งเอง */
  function maskVal(mask, raw) {
    if (!mask) return raw;
    const src = String(raw == null ? '' : raw).replace(/[^A-Za-z0-9]/g, '');
    const cls = m => m === 'A' ? /[A-Za-z]/ : m === '9' ? /[0-9]/ : null;
    let out = '', mi = 0, si = 0;
    while (si < src.length && mi < mask.length) {
      const c = cls(mask[mi]);
      if (!c) { out += mask[mi]; mi++; continue; }
      if (c.test(src[si])) {
        out += mask[mi] === 'A' ? src[si].toUpperCase() : src[si];
        si++; mi++; continue;
      }
      let nx = -1;
      for (let j = mi + 1; j < mask.length; j++) if (!cls(mask[j])) { nx = j; break; }
      if (nx < 0) break;                 // ไม่มีตัวคั่นเหลือแล้ว — ตัวที่พิมพ์เกินมาทิ้งไป
      mi = nx;
    }
    return out;
  }

  FormKit.prototype.ctx = function () {
    const c = Object.assign({}, this.data, this.computed());
    const self = this;
    // เกรดที่ยังไม่ได้ให้ ไม่นับว่าต่ำกว่าเกณฑ์ — ไม่งั้นฟอร์มเปล่าจะขึ้นว่าไม่ผ่านทันที
    const below = (n, starOnly) => Object.keys(self.fields).some(k => {
      const f = self.fields[k];
      if (f.type !== 'grade' || (starOnly && !f.star)) return false;
      return self.data[k] !== undefined && self.data[k] !== '' && Number(self.data[k]) < n;
    });
    c.__anyStarBelow = n => below(n, true);
    c.__anyBelow = n => below(n, false);
    return c;
  };

  FormKit.prototype.computed = function () {
    const out = {};
    let sum = 0;
    for (const k of Object.keys(this.fields)) sum += fieldScore(this.fields[k], this.data[k]);
    out.score = sum;
    for (const c of this.def.compute || []) {
      if (c.op === 'sumScore') out[c.k] = sum;
      else if (c.op === 'sum') out[c.k] = (c.of || []).reduce((a, k) => a + (Number(this.data[k]) || 0), 0);
      else if (c.op === 'pct') out[c.k] = c.max ? Math.round((Number(out[c.of] ?? this.data[c.of]) || 0) / c.max * 100) : 0;
      else if (c.op === 'count') out[c.k] = (c.of || []).filter(k => this.data[k]).length;
      else if (c.op === 'mul')
        out[c.k] = (c.of || []).reduce((a, k) => a * (Number(this.data[k]) || 0), 1);
      /* ตารางเปิดสองแกน — ใช้กับเมทริกซ์ความเสี่ยงที่ไม่ใช่ผลคูณ
         เมทริกซ์ใน HIF ถ่วงน้ำหนักความรุนแรงมากกว่าโอกาส
         คะแนน 8 เป็นได้ทั้งส้ม (รุนแรง4×โอกาส2) และเขียว (รุนแรง2×โอกาส4)
         ใช้สูตรคูณแล้วแบ่งช่วงจึงให้ผลผิดจากเอกสาร */
      else if (c.op === 'matrix') {
        const row = c.table && c.table[this.data[(c.of || [])[0]]];
        const col = Number(this.data[(c.of || [])[1]]);
        out[c.k] = (row && row[col - 1]) || '';
      }
    }
    return out;
  };

  /* gate ที่กำลังทำงานอยู่ตอนนี้ */
  FormKit.prototype.gates = function () {
    const ctx = this.ctx();
    return (this.def.gates || []).filter(g => evalCond(g.when, ctx));
  };
  FormKit.prototype.blocked = function () { return this.gates().some(g => g.level === 'stop'); };

  /* ตรวจฟิลด์บังคับเฉพาะส่วนที่ party นี้รับผิดชอบ
     ส่ง secs มาได้เพื่อตรวจเฉพาะบางส่วน (ใช้นับตัวเลขค้างบนหัว tab) */
  FormKit.prototype.validate = function (secs) {
    const ctx = this.ctx(), miss = [];
    for (const s of secs || this.def.sections || []) {
      if (this.party && s.party !== this.party) continue;
      if (!evalCond(s.showIf, ctx)) continue;
      for (const f of s.fields || []) {
        if (!evalCond(f.showIf, ctx)) continue;
        const need = f.req || (f.reqIf && evalCond(f.reqIf, ctx));
        const v = this.data[f.k];
        const empty = v === undefined || v === '' || v === null ||
                      (Array.isArray(v) && !v.length) ||
                      (f.type === 'checklist' && Object.keys(v || {}).length <
                        (f.items || []).length);
        if (need && empty) miss.push({ k: f.k, label: L(f.label, this.lang) });
      }
    }
    return miss;
  };

  /* ── แท็บ ──────────────────────────────────────────────
     ฟอร์มยาว ๆ อย่าง FRAE มี 40 ช่อง ถ้าเรียงหน้าเดียวต้องเลื่อนจนหลง
     แบ่งเป็นแท็บแล้วให้คะแนนรวมค้างอยู่บนหัวตลอด จะได้เห็นผลของทุกการติ๊ก */
  FormKit.prototype.filled = function (f) {
    const v = this.data[f.k];
    if (v === undefined || v === null || v === '') return false;
    if (Array.isArray(v)) return v.length > 0;
    if (f.type === 'checklist') return Object.keys(v || {}).length > 0;
    return true;
  };

  FormKit.prototype.tabs = function (ctx) {
    const defs = (this.def.ui && this.def.ui.tabs) || [];
    if (!defs.length) return null;
    ctx = ctx || this.ctx();
    const live = (this.def.sections || []).filter(s => evalCond(s.showIf, ctx));
    return defs.map(t => {
      const secs = live.filter(s => (s.tab || defs[0].k) === t.k)
        .filter(s => !(s.hideOthers && this.party && s.party !== this.party));
      let sc = 0, ans = 0, tot = 0;
      secs.forEach(s => (s.fields || []).forEach(f => {
        if (f.type === 'static' || !evalCond(f.showIf, ctx)) return;
        sc += fieldScore(f, this.data[f.k]);
        tot++;
        if (this.filled(f)) ans++;
      }));
      const miss = this.validate(secs).length;
      // สถานะที่หัวแท็บต้องบอกให้ตรง ไม่ใช่เขียวไว้ก่อน
      //   miss    ยังมีช่องบังคับว่าง        · warn  ตอบแล้วและมีคะแนน
      //   done    ตอบแล้วแต่ไม่มีคะแนน       · idle  ยังไม่ได้แตะเลย
      const st = miss ? 'miss' : !ans ? 'idle' : sc ? 'warn' : 'done';
      return { k: t.k, n: L(t, this.lang), secs: secs,
               score: sc, miss: miss, ans: ans, tot: tot, st: st };
    }).filter(t => t.secs.length);
  };

  /* ระดับความเสี่ยงที่ใช้ระบายสี — เอาจาก gate ที่แรงที่สุดที่ทำงานอยู่ */
  FormKit.prototype.band = function () {
    const g = this.gates();
    const top = g.find(x => x.level === 'stop') || g.find(x => x.level === 'warn') || g[0];
    return { lv: top ? (top.level === 'info' ? 'ok' : top.level) : 'ok',
             n: top && top.short ? L(top.short, this.lang) : '' };
  };

  /* ── เรนเดอร์ ─────────────────────────────────────────── */

  /* แถวแบบกระชับ — ใช้กับช่องที่มีคะแนน จะได้ไม่กินความสูงช่องละ 3 บรรทัด
     คืน null เมื่อไม่เข้าเงื่อนไข ให้กลับไปใช้ตัวเรนเดอร์ปกติ */
  FormKit.prototype.row = function (f) {
    if (!(this.def.ui && this.def.ui.compact) || !f.score) return null;
    const v = this.data[f.k];
    const ro = this.readonly || (this.party && f.__sec.party !== this.party);
    const dis = ro ? ' aria-disabled="true"' : '';
    const flag = (this.flagged || []).indexOf(f.k) >= 0 ? ' bad' : '';
    const lab = esc(L(f.label, this.lang));

    if (f.type === 'check' && typeof f.score === 'number') {
      return `<div class="fk-row chk${flag}" data-fk="${esc(f.k)}" data-toggle="${esc(f.k)}"
        role="checkbox" aria-checked="${!!v}" tabindex="${ro ? -1 : 0}"${dis}>
        <span class="box"></span><span class="t">${lab}</span>
        <span class="pt">${f.score}</span></div>`;
    }
    if ((f.type === 'select' || f.type === 'scale') && typeof f.score === 'object') {
      const opts = (f.opt || []).map(o =>
        `<button type="button" class="fk-opt" data-k="${esc(f.k)}" data-v="${esc(o.v)}"
           aria-pressed="${v == o.v}"${ro ? ' disabled' : ''}>${esc(L(o.n, this.lang) || o.v)}
           <em>${f.score[o.v] || 0}</em></button>`).join('');
      return `<div class="fk-row col${flag}" data-fk="${esc(f.k)}">
        <span class="t">${lab}${f.req ? ' <span style="color:var(--red-500)">*</span>' : ''}</span>
        <div class="fk-opts sm">${opts}</div></div>`;
    }
    return null;
  };

  FormKit.prototype.field = function (f) {
    const v = this.data[f.k];
    const ro = this.readonly || (this.party && f.__sec.party !== this.party);
    const dis = ro ? ' disabled' : '';
    const id = 'fk_' + f.k;
    const lab = L(f.label, this.lang);
    const star = f.star ? ' <span class="star" title="safety-critical">★</span>' : '';
    let body = '';

    switch (f.type) {
      case 'static':
        return `<div class="fk-f"><div class="fk-static">${L(f.text || f.label, this.lang)}</div></div>`;

      case 'textarea':
        body = `<textarea id="${id}" data-k="${esc(f.k)}"${dis}>${esc(v || '')}</textarea>`; break;

      case 'select':
        body = `<div class="fk-opts">` + (f.opt || []).map(o =>
          `<button type="button" class="fk-opt" data-k="${esc(f.k)}" data-v="${esc(o.v)}"
             aria-pressed="${v == o.v}"${dis}>${esc(L(o.n, this.lang) || o.v)}</button>`).join('') + `</div>`;
        break;

      case 'multi': {
        const arr = Array.isArray(v) ? v : [];
        body = `<div class="fk-opts">` + (f.opt || []).map(o =>
          `<button type="button" class="fk-opt" data-multi="${esc(f.k)}" data-v="${esc(o.v)}"
             aria-pressed="${arr.includes(o.v)}"${dis}>${esc(L(o.n, this.lang) || o.v)}</button>`).join('') + `</div>`;
        break;
      }

      case 'check':
        body = `<div class="fk-opts"><button type="button" class="fk-opt" data-toggle="${esc(f.k)}"
          aria-pressed="${!!v}"${dis}>${esc(L(f.on, this.lang) || T('yes', this.lang))}</button></div>`;
        break;

      case 'scale':
        body = `<div class="fk-opts">` + (f.opt || []).map(o =>
          `<button type="button" class="fk-opt" data-k="${esc(f.k)}" data-v="${esc(o.v)}"
             aria-pressed="${v == o.v}"${dis}>${esc(L(o.n, this.lang) || o.v)}</button>`).join('') + `</div>`;
        break;

      case 'grade': {
        const mx = f.max || 5;
        body = `<div class="fk-grade">` + Array.from({ length: mx }, (_, i) => i + 1).map(n =>
          `<button type="button" data-k="${esc(f.k)}" data-v="${n}"
             aria-pressed="${Number(v) === n}"${dis}>${n}</button>`).join('') + `</div>`;
        break;
      }

      case 'checklist': {
        const st = v || {};
        /* ตารางให้คะแนน — หัวข้อเป็นแถว ตัวเลือกเป็นคอลัมน์
           จำนวนคอลัมน์ตั้งได้: FTR ใช้ 3 (ผ่าน/ไม่ผ่าน/ไม่ได้ทดสอบ)
           EFC ใช้ 2 · SEF กับ EFM ใช้ 6 (Excellent…N/A) ตามที่กระดาษวางไว้
           ไม่ระบุ = S/U/NA แบบเดิม ฟอร์มที่ทำไว้ก่อนหน้าจึงไม่ต้องแก้ */
        const cols = f.opts || [{ v: 'S' }, { v: 'U' }, { v: 'NA' }];
        body = (f.items || []).map(it => `
          <div class="fk-item">
            <span class="txt">${it.id ? `<span class="id">${esc(it.id)}</span>` : ''}${esc(L(it, this.lang) || it.th || '')}
              ${it.how ? `<span class="id" style="color:var(--g-500);margin-top:3px">${esc(it.how)}</span>` : ''}</span>
            <span class="fk-suna${cols.length > 3 ? ' many' : ''}">${cols.map(c =>
              `<button type="button" data-cl="${esc(f.k)}" data-item="${esc(it.id)}" data-v="${esc(c.v)}"
                 aria-pressed="${st[it.id] === c.v}"${dis}>${esc(c.n ? L(c.n, this.lang) : c.v)}</button>`).join('')}</span>
          </div>`).join('');
        break;
      }

      case 'sign':
        body = `<div class="fk-signwrap"><canvas class="fk-sign" data-sign="${esc(f.k)}"></canvas>
          ${ro ? '' : `<button type="button" class="fb sm" data-clearsign>${esc(T('clearSign', this.lang))}</button>`}</div>`;
        break;

      /* แถวซ้ำ — DRC รายการเอกสารที่รับ · MOC แผนดำเนินการ
         ค่าเก็บเป็น array ของ object ทุกแถวมีคีย์ตาม cols[].k
         แถวว่างทั้งแถวไม่นับเป็นข้อมูล ตอนส่งออกจึงไม่กินบรรทัดในเอกสาร */
      case 'table': {
        const cols = f.cols || [];
        const rows = tableRows(f, v);
        const head = cols.map(c =>
          `<th${c.w ? ` style="width:${esc(c.w)}"` : ''}>${esc(L(c.label, this.lang))}</th>`).join('');
        const body_ = rows.map((row, ri) => `<tr>${cols.map(c => {
          const cv = row[c.k] == null ? '' : row[c.k];
          const t = ['number', 'date', 'time'].includes(c.type) ? c.type : 'text';
          return `<td><input type="${t}" data-tk="${esc(f.k)}" data-tr="${ri}" data-tc="${esc(c.k)}"
            value="${esc(cv)}"${ro ? ' disabled' : ''}></td>`;
        }).join('')}${ro ? '' : `<td class="fk-trm"><button type="button" class="fb sm"
            data-tdel="${esc(f.k)}" data-tr="${ri}"
            aria-label="${esc(T('rowDel', this.lang))} ${ri + 1}">×</button></td>`}</tr>`).join('');
        body = `<div class="fk-tw"><table class="fk-tbl"><thead><tr>${head}${ro ? '' : '<th></th>'}</tr></thead>
          <tbody>${body_}</tbody></table></div>`
          + (ro || (f.max && rows.length >= f.max) ? '' :
            `<button type="button" class="fb sm" data-tadd="${esc(f.k)}">+ ${esc(T('rowAdd', this.lang))}</button>`);
        break;
      }

      default: {
        const t = ['number', 'date', 'time', 'email', 'tel'].includes(f.type) ? f.type : 'text';
        const rng = (f.min !== undefined ? ` min="${f.min}"` : '') + (f.max !== undefined ? ` max="${f.max}"` : '')
          // ชั่วโมงบินเป็นทศนิยม ถ้าไม่ใส่ step เบราว์เซอร์จะตีว่า 1.5 ไม่ถูกต้อง
          + (f.step !== undefined ? ` step="${f.step}"` : '');
        const hint = f.ph ? ` placeholder="${esc(ph(f.ph))}"` : '';
        body = `<input id="${id}" type="${t}" data-k="${esc(f.k)}" value="${esc(v == null ? '' : v)}"${rng}${hint}${dis}>`;
        if (f.type === 'date' && v) body += `<p class="fk-dmy">${esc(dmy(v))}</p>`;
        if (f.pattern && v && !new RegExp('^(?:' + f.pattern + ')$').test(v))
          body += `<p class="fk-soft">${esc(T('badFormat', this.lang))}${f.ph ? ' — ' + esc(ph(f.ph)) : ''}</p>`;
      }
    }

    const bad = (this.flagged || []).indexOf(f.k) >= 0 ? ' bad' : '';
    return `<div class="fk-f${bad}" data-fk="${esc(f.k)}">
      <label for="${id}">${esc(lab)}${f.req ? ' <span style="color:var(--red-500)">*</span>' : ''}${star}</label>
      ${f.hint ? `<p class="hint">${esc(L(f.hint, this.lang))}</p>` : ''}
      ${body}</div>`;
  };

  FormKit.prototype.gateHtml = function (g) {
    return `<div class="fk-gate ${esc(g.level)}">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"
        stroke-linejoin="round"><path d="M12 3l9.5 17H2.5z"/><path d="M12 9.5v4.5"/>
        <circle cx="12" cy="16.8" r=".9" fill="currentColor" stroke="none"/></svg>
      <span>${esc(L(g.msg, this.lang))}</span></div>`;
  };

  FormKit.prototype.sectionHtml = function (s, ctx) {
    const mine = !this.party || s.party === this.party;
    // hideOthers = ฝ่ายอื่นไม่ต้องเห็นส่วนนี้เลย ต่างจาก blind ที่ยังขึ้นกล่องอธิบาย
    // ใช้กับส่วนอนุมัติ — คนกรอกไม่ต้องเห็นช่องที่ตัวเองแตะไม่ได้
    if (s.hideOthers && !mine) return '';
    const pn = (this.def.parties || []).find(p => p.k === s.party);
    const hidden = s.blind && !mine;
    return `<section class="fk-sec">
      <header><h3>${esc(L(s.title, this.lang))}</h3>
        <span class="party${mine ? '' : ' locked'}">${esc(pn ? L(pn.n, this.lang) : s.party || '')}${mine ? '' : ' · ' + esc(T('readonly', this.lang))}</span>
      </header>
      ${s.desc ? `<p class="desc">${esc(L(s.desc, this.lang))}</p>` : ''}
      ${hidden
        ? `<p class="fk-static">${esc(T('blind', this.lang))}</p>`
        : this.fieldsHtml(s, ctx)}
    </section>`;
  };

  /* ช่องที่ตั้ง half:true จะจับคู่กันเป็นสองคอลัมน์
     ใช้กับคู่ที่อ่านคู่กันถึงจะเข้าใจ เช่น เวลาออก–เวลาถึง */
  FormKit.prototype.fieldsHtml = function (s, ctx) {
    const live = (s.fields || []).filter(f => evalCond(f.showIf, ctx));
    let out = '', pair = [];
    const flush = () => {
      if (!pair.length) return;
      out += `<div class="fk-2col">${pair.join('')}</div>`;
      pair = [];
    };
    for (const f of live) {
      const html = this.row(f) || this.field(f);
      if (f.half) { pair.push(html); if (pair.length === 2) flush(); }
      else { flush(); out += html; }
    }
    flush();
    return out;
  };

  FormKit.prototype.routeHtml = function (ctx) {
    if (!(this.def.route || []).length) return '';
    return `<h3 style="font-family:var(--font-display);font-size:17px;margin:22px 0 10px">${esc(T('route', this.lang))}</h3>
      <div class="fk-route">` + this.def.route.filter(r => evalCond(r.onlyIf, ctx)).map(r => {
        const p = (this.def.parties || []).find(x => x.k === r.party);
        return `<div class="fk-step"><span class="k">${esc(T('step', this.lang))} ${r.step}</span>
          <span class="v">${esc(p ? L(p.n, this.lang) : r.party)}</span>
          <span class="m">${esc(T(r.sign ? 'mustSign' : 'noSign', this.lang))}${r.slaDays
            ? ' · ' + esc(T('within', this.lang)) + ' ' + r.slaDays + ' ' + esc(T('days', this.lang)) : ''}</span></div>`;
      }).join('') + `</div>`;
  };

  FormKit.prototype.render = function (el) {
    const ctx = this.ctx(), c = this.computed();
    /* แถบบนหัวแสดงตัวเลขที่ต้องเห็นตลอดขณะกรอก
       ฟอร์มที่มีคะแนนรวม (FRAE) ใช้ score · ฟอร์มอื่นระบุเองที่ ui.headline (SDF ใช้ชั่วโมง FTL) */
    const hl = this.def.ui && this.def.ui.headline;
    const scored = !!hl || (this.def.compute || []).some(x => x.k === 'score' || x.op === 'sumScore');
    const tabs = this.tabs(ctx);
    const other = this.lang === 'th' ? 'en' : 'th';
    let html = '';

    if (tabs) {
      if (!tabs.some(t => t.k === this.tab)) this.tab = tabs[0].k;
      const i = tabs.findIndex(t => t.k === this.tab), cur = tabs[i], last = i === tabs.length - 1;
      const b = this.band();

      const ans = tabs.reduce((a, t) => a + t.ans, 0);
      const tot = tabs.reduce((a, t) => a + t.tot, 0);
      const pct = tot ? Math.round(ans / tot * 100) : 0;

      // แถบคะแนน + ป้ายแท็บ ค้างอยู่บนหัวตลอด ไม่ว่าจะเลื่อนไปไหน
      html += `<div class="fk-tabwrap">
        ${scored ? `<div class="fk-bar ${b.lv}">
          <span class="n">${hl ? esc(String(c[hl.value] === undefined ? 0 : c[hl.value])) : c.score}</span>
          <span class="lbl">${hl
            ? `<b>${esc(L(hl, this.lang))}</b><br>${esc(T('limit', this.lang))} ${esc(String(hl.of))}`
            : `<b>${esc(T('riskTotal', this.lang))}</b><br>${esc(T('riskTotal', other))}`}</span>
          ${b.n ? `<span class="band">${esc(b.n)}</span>` : ''}
          <span class="prog"><span class="pct">${esc(T('answered', this.lang))} ${ans}/${tot}</span>
            <span class="tr"><i style="width:${pct}%"></i></span></span>
        </div>` : ''}
        <nav class="fk-tabbar" role="tablist" aria-label="${esc(T('sections', this.lang))}">` + tabs.map((t, n) => {
          const on = t.k === this.tab;
          const tag = t.miss ? `<span class="b">${t.miss}</span>`
                    : t.score ? `<span class="b">+${t.score}</span>`
                    : t.st === 'done' ? `<span class="b tick" aria-hidden="true">✓</span>` : '';
          const say = t.miss ? T('stMiss', this.lang, t.miss)
                    : t.score ? T('stScore', this.lang, t.score)
                    : T(t.st === 'done' ? 'stDone' : 'stIdle', this.lang);
          return `<button type="button" role="tab" class="fk-tab ${t.st}" data-tab="${esc(t.k)}"
             aria-selected="${on}" tabindex="${on ? 0 : -1}"
             aria-label="${n + 1}. ${esc(t.n)} — ${say}">
             <span class="i">${n + 1}</span><span class="nm">${esc(t.n)}</span>${tag}</button>`;
        }).join('') + `</nav></div>`;

      // gate ระดับ stop ต้องเห็นทุกแท็บ ที่เหลือรวมไว้หน้าสรุป
      for (const g of this.gates()) {
        if (g.level === 'stop' || last) html += this.gateHtml(g);
      }

      html += cur.secs.map(s => this.sectionHtml(s, ctx)).join('');
      if (last) html += this.routeHtml(ctx);

      if (this.flagged && this.flagged.length)
        html += `<div class="fk-gate warn"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
          stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l9.5 17H2.5z"/>
          <path d="M12 9.5v4.5"/><circle cx="12" cy="16.8" r=".9" fill="currentColor" stroke="none"/></svg>
          <span>${esc(T('fillFirst', this.lang, this.flagged.length))}</span></div>`;

      html += `<div class="fk-nav">
        ${i > 0 ? `<button type="button" class="fb" data-go="${esc(tabs[i - 1].k)}">← ${esc(tabs[i - 1].n)}</button>` : '<span></span>'}
        ${!last ? `<button type="button" class="big pri" data-go="${esc(tabs[i + 1].k)}">${esc(tabs[i + 1].n)} →</button>` : '<span></span>'}
      </div>`;

    } else {
      for (const g of this.gates()) html += this.gateHtml(g);
      if (scored) {
        const b = this.band();
        html += `<div class="fk-score ${b.lv}"><span class="n">${c.score}</span>
          <span><b style="font-size:14.5px">${esc(T('scoreTotal', this.lang))}</b><br>
          <span style="font-size:12.5px;color:var(--g-500)">${esc(T('scoreAuto', this.lang))}</span></span></div>`;
      }
      html += (this.def.sections || []).filter(s => evalCond(s.showIf, ctx))
        .map(s => this.sectionHtml(s, ctx)).join('');
      html += this.routeHtml(ctx);
    }

    el.innerHTML = html;
    this.bind(el);
  };

  FormKit.prototype.set = function (k, v) { this.data[k] = v; this.onChange(k, v, this); };

  FormKit.prototype.bind = function (el) {
    const self = this;
    const rerender = () => self.render(el);

    el.querySelectorAll('input[data-k],textarea[data-k]').forEach(i => {
      const f = self.fields[i.dataset.k] || {};
      if (f.mask) i.addEventListener('input', () => {
        const v = maskVal(f.mask, i.value);
        if (v !== i.value) i.value = v;      // เขียนทับในช่องเลย ไม่ rerender — กัน focus หลุด
        self.data[i.dataset.k] = v;
      });
      i.addEventListener('change', () => {
        const raw = f.mask ? maskVal(f.mask, i.value) : i.value;
        self.set(i.dataset.k, i.type === 'number' ? Number(raw) : raw);
        rerender();
      });
    });

    // ตารางแถวซ้ำ — เขียนค่าลงช่องโดยไม่ rerender ระหว่างพิมพ์ กัน focus หลุดเหมือน mask
    el.querySelectorAll('input[data-tk]').forEach(i =>
      i.addEventListener('change', () => {
        const k = i.dataset.tk, ri = Number(i.dataset.tr);
        const f = self.fields[k] || {};
        const arr = tableRows(f, self.data[k]).map(r => Object.assign({}, r));
        arr[ri][i.dataset.tc] = i.type === 'number' ? Number(i.value) : i.value;
        self.set(k, arr); rerender();
      }));

    el.querySelectorAll('[data-tadd]').forEach(b =>
      b.addEventListener('click', () => {
        const k = b.dataset.tadd, f = self.fields[k] || {};
        self.set(k, tableRows(f, self.data[k]).concat([{}])); rerender();
      }));

    el.querySelectorAll('[data-tdel]').forEach(b =>
      b.addEventListener('click', () => {
        const k = b.dataset.tdel, f = self.fields[k] || {};
        const arr = tableRows(f, self.data[k]).slice();
        arr.splice(Number(b.dataset.tr), 1);
        // ไม่ให้เหลือศูนย์แถว ไม่งั้นตารางหายไปทั้งอันจนไม่รู้ว่ายังมีช่องนี้อยู่
        self.set(k, arr.length ? arr : [{}]); rerender();
      }));

    el.querySelectorAll('.fk-opt[data-k],.fk-grade button[data-k]').forEach(b =>
      b.addEventListener('click', () => {
        const raw = b.dataset.v;
        self.set(b.dataset.k, isNaN(Number(raw)) ? raw : Number(raw));
        rerender();
      }));

    el.querySelectorAll('[data-multi]').forEach(b =>
      b.addEventListener('click', () => {
        const k = b.dataset.multi;
        const arr = Array.isArray(self.data[k]) ? self.data[k].slice() : [];
        const i = arr.indexOf(b.dataset.v);
        i < 0 ? arr.push(b.dataset.v) : arr.splice(i, 1);
        self.set(k, arr); rerender();
      }));

    el.querySelectorAll('[data-toggle]').forEach(b => {
      if (b.getAttribute('aria-disabled') === 'true') return;
      const flip = () => { self.set(b.dataset.toggle, !self.data[b.dataset.toggle]); rerender(); };
      b.addEventListener('click', flip);
      // แถวกระชับเป็น div ไม่ใช่ปุ่ม จึงต้องผูกคีย์บอร์ดเอง
      if (b.getAttribute('role') === 'checkbox')
        b.addEventListener('keydown', e => {
          if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); flip(); }
        });
    });

    // เปลี่ยนแท็บ — ขึ้นหัวฟอร์มทุกครั้ง จะได้ไม่ค้างกลางหน้าเดิม
    // viaKey เท่านั้นที่ย้าย focus — ถ้า focus ทุกครั้งที่คลิก
    // ป้ายจะขึ้นวงแหวน focus ค้างไว้ทั้งที่ผู้ใช้ใช้เมาส์
    const go = (k, viaKey) => {
      const list = self.tabs();
      const from = list.findIndex(t => t.k === self.tab);
      const to   = list.findIndex(t => t.k === k);
      // ถอยหลังหรือกลับที่เดิมได้เสมอ — บล็อกเฉพาะการเดินหน้าข้ามช่องบังคับ
      if (to > from && from >= 0) {
        const miss = self.validate(list[from].secs);
        if (miss.length) {
          self.flagged = miss.map(m => m.k);
          rerender();
          const bad = el.querySelector('.fk-f.bad, .fk-row.bad');
          if (bad) bad.scrollIntoView({ block: 'center', behavior: 'smooth' });
          return;
        }
      }
      self.flagged = null;
      self.tab = k;
      rerender();
      const sel = el.querySelector('.fk-tab[aria-selected="true"]');
      if (sel) {
        // บนมือถือแถบป้ายเลื่อนแนวนอน ป้ายที่เลือกอาจอยู่นอกจอ — ดึงเข้ามาเสมอ
        if (sel.scrollIntoView) sel.scrollIntoView({ block: 'nearest', inline: 'nearest' });
        if (viaKey) sel.focus({ preventScroll: true });
      }
      const top = el.getBoundingClientRect().top + window.scrollY - 76;
      window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
    };
    el.querySelectorAll('[data-tab],[data-go]').forEach(b =>
      b.addEventListener('click', () => go(b.dataset.tab || b.dataset.go)));

    // ลูกศรซ้าย/ขวา · Home · End ตามแบบ tablist มาตรฐาน
    const strip = Array.from(el.querySelectorAll('.fk-tab'));
    strip.forEach((b, i) => b.addEventListener('keydown', e => {
      const j = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: strip.length - 1 }[e.key];
      if (j === undefined) return;
      e.preventDefault();
      go(strip[(j + strip.length) % strip.length].dataset.tab, true);
    }));

    el.querySelectorAll('[data-cl]').forEach(b =>
      b.addEventListener('click', () => {
        const k = b.dataset.cl;
        const cur = Object.assign({}, self.data[k] || {});
        // กดค่าเดิมซ้ำ = ยกเลิก — ตารางช่องเดียว (ASF ที่ครูติ๊กยืนยันทีละข้อ)
        // ถ้าไม่มีทางถอน กดพลาดครั้งเดียวก็ลบไม่ได้ กลายเป็นการรับรองที่ไม่ได้ตั้งใจ
        if (cur[b.dataset.item] === b.dataset.v) delete cur[b.dataset.item];
        else cur[b.dataset.item] = b.dataset.v;
        self.set(k, cur); rerender();
      }));

    el.querySelectorAll('canvas[data-sign]').forEach(cv => bindSign(cv, self, rerender));
  };

  /* ลายเซ็นด้วยนิ้ว / Apple Pencil */
  function bindSign(cv, fk, rerender) {
    const dpr = window.devicePixelRatio || 1;
    const r = cv.getBoundingClientRect();
    cv.width = r.width * dpr; cv.height = r.height * dpr;
    const g = cv.getContext('2d');
    g.scale(dpr, dpr); g.lineWidth = 2; g.lineCap = 'round'; g.strokeStyle = '#0D1B2A';

    // ทุกครั้งที่เรนเดอร์ใหม่ canvas จะว่าง — วาดลายเซ็นเดิมกลับมา
    // ไม่งั้นพอเปลี่ยนแท็บกลับมาจะดูเหมือนลายเซ็นหาย ทั้งที่ข้อมูลยังอยู่
    const prev = fk.data[cv.dataset.sign];
    if (prev && String(prev).indexOf('data:image') === 0) {
      const im = new Image();
      im.onload = () => g.drawImage(im, 0, 0, r.width, r.height);
      im.src = prev;
    }

    const clear = cv.parentElement && cv.parentElement.querySelector('[data-clearsign]');
    if (clear) clear.addEventListener('click', () => {
      g.clearRect(0, 0, r.width, r.height);
      delete fk.data[cv.dataset.sign];
      fk.onChange(cv.dataset.sign, undefined, fk);
      if (rerender) rerender();
    });

    let drawing = false;
    const pt = e => {
      const b = cv.getBoundingClientRect();
      const t = e.touches ? e.touches[0] : e;
      return [t.clientX - b.left, t.clientY - b.top];
    };
    const down = e => { e.preventDefault(); drawing = true; const [x, y] = pt(e); g.beginPath(); g.moveTo(x, y); };
    const move = e => { if (!drawing) return; e.preventDefault(); const [x, y] = pt(e); g.lineTo(x, y); g.stroke(); };
    // ต้องผ่าน set() ไม่ใช่เขียน data ตรง ๆ — ไม่งั้นหน้าไม่รู้ว่าลงนามแล้ว
    // ปุ่มส่งจะยังปิดอยู่ทั้งที่เซ็นเสร็จแล้ว
    const up = () => {
      if (!drawing) return;
      drawing = false;
      fk.set(cv.dataset.sign, cv.toDataURL('image/png'));
      // ต้องวาดใหม่ด้วย ไม่งั้นป้ายบนหัวแท็บยังนับว่าช่องลงนามว่างอยู่
      // (ลายเซ็นถูกวาดกลับจากข้อมูลตอนเรนเดอร์ จึงไม่หาย)
      if (rerender) rerender();
    };
    cv.addEventListener('pointerdown', down); cv.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  }

  FormKit.evalCond = evalCond;
  FormKit.L = L;
  global.FormKit = FormKit;
})(window);
