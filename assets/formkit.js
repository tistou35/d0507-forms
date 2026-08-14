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
  const L = (o, lang) => (o && (o[lang || 'th'] || o.th || o.en)) || '';

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
      if (fn[1] === 'filled') return ctx[arg] !== undefined && ctx[arg] !== '' && ctx[arg] !== null;
      return false;
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
    this.lang = opts.lang || 'th';
    this.data = opts.data || {};
    this.party = opts.party || null;          // party ที่ผู้ใช้ปัจจุบันกรอกได้
    this.readonly = !!opts.readonly;
    this.onChange = opts.onChange || function () {};
    this.fields = {};
    (def.sections || []).forEach(s => (s.fields || []).forEach(f => { this.fields[f.k] = f; f.__sec = s; }));
  }

  FormKit.prototype.ctx = function () {
    const c = Object.assign({}, this.data, this.computed());
    const self = this;
    c.__anyStarBelow = n => Object.keys(self.fields).some(k => {
      const f = self.fields[k];
      return f.type === 'grade' && f.star && self.data[k] !== undefined && Number(self.data[k]) < n;
    });
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
      const secs = live.filter(s => (s.tab || defs[0].k) === t.k);
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
    const lab = esc(L(f.label, this.lang));

    if (f.type === 'check' && typeof f.score === 'number') {
      return `<div class="fk-row chk" data-fk="${esc(f.k)}" data-toggle="${esc(f.k)}"
        role="checkbox" aria-checked="${!!v}" tabindex="${ro ? -1 : 0}"${dis}>
        <span class="box"></span><span class="t">${lab}</span>
        <span class="pt">${f.score}</span></div>`;
    }
    if ((f.type === 'select' || f.type === 'scale') && typeof f.score === 'object') {
      const opts = (f.opt || []).map(o =>
        `<button type="button" class="fk-opt" data-k="${esc(f.k)}" data-v="${esc(o.v)}"
           aria-pressed="${v == o.v}"${ro ? ' disabled' : ''}>${esc(L(o.n, this.lang) || o.v)}
           <em>${f.score[o.v] || 0}</em></button>`).join('');
      return `<div class="fk-row col" data-fk="${esc(f.k)}">
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
          aria-pressed="${!!v}"${dis}>${esc(L(f.on, this.lang) || 'ใช่')}</button></div>`;
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
        body = (f.items || []).map(it => `
          <div class="fk-item">
            <span class="txt"><span class="id">${esc(it.id)}</span>${esc(L(it, this.lang) || it.th || '')}
              ${it.how ? `<span class="id" style="color:var(--g-500);margin-top:3px">${esc(it.how)}</span>` : ''}</span>
            <span class="fk-suna">${['S', 'U', 'NA'].map(x =>
              `<button type="button" data-cl="${esc(f.k)}" data-item="${esc(it.id)}" data-v="${x}"
                 aria-pressed="${st[it.id] === x}"${dis}>${x}</button>`).join('')}</span>
          </div>`).join('');
        break;
      }

      case 'sign':
        body = `<div class="fk-signwrap"><canvas class="fk-sign" data-sign="${esc(f.k)}"></canvas>
          ${ro ? '' : '<button type="button" class="fb sm" data-clearsign>ล้างลายเซ็น</button>'}</div>`;
        break;

      case 'table':
        body = `<div class="fk-static">ตารางแถวซ้ำ — จะเปิดใช้เมื่อใส่ข้อมูลฟอร์มที่ต้องใช้
          (ALR รายวัน · MRF timesheet)</div>`;
        break;

      default: {
        const t = ['number', 'date', 'time', 'email', 'tel'].includes(f.type) ? f.type : 'text';
        const rng = (f.min !== undefined ? ` min="${f.min}"` : '') + (f.max !== undefined ? ` max="${f.max}"` : '');
        body = `<input id="${id}" type="${t}" data-k="${esc(f.k)}" value="${esc(v == null ? '' : v)}"${rng}${dis}>`;
      }
    }

    return `<div class="fk-f" data-fk="${esc(f.k)}">
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
    const pn = (this.def.parties || []).find(p => p.k === s.party);
    const hidden = s.blind && !mine;
    return `<section class="fk-sec">
      <header><h3>${esc(L(s.title, this.lang))}</h3>
        <span class="party${mine ? '' : ' locked'}">${esc(pn ? pn.n : s.party || '')}${mine ? '' : ' · อ่านอย่างเดียว'}</span>
      </header>
      ${s.desc ? `<p class="desc">${esc(L(s.desc, this.lang))}</p>` : ''}
      ${hidden
        ? `<p class="fk-static">ส่วนนี้ถูกซ่อนไว้จนกว่าคุณจะส่งส่วนของตัวเอง —
           ตามข้อกำหนดที่ให้แต่ละฝ่ายประเมินอย่างอิสระ</p>`
        : (s.fields || []).filter(f => evalCond(f.showIf, ctx))
            .map(f => this.row(f) || this.field(f)).join('')}
    </section>`;
  };

  FormKit.prototype.routeHtml = function (ctx) {
    if (!(this.def.route || []).length) return '';
    return `<h3 style="font-family:var(--font-display);font-size:17px;margin:22px 0 10px">ลำดับอนุมัติ</h3>
      <div class="fk-route">` + this.def.route.filter(r => evalCond(r.onlyIf, ctx)).map(r => {
        const p = (this.def.parties || []).find(x => x.k === r.party);
        return `<div class="fk-step"><span class="k">ขั้นที่ ${r.step}</span>
          <span class="v">${esc(p ? p.n : r.party)}</span>
          <span class="m">${r.sign ? 'ต้องลงนาม' : 'ไม่ต้องลงนาม'}${r.slaDays ? ' · ภายใน ' + r.slaDays + ' วัน' : ''}</span></div>`;
      }).join('') + `</div>`;
  };

  FormKit.prototype.render = function (el) {
    const ctx = this.ctx(), c = this.computed();
    const scored = (this.def.compute || []).some(x => x.k === 'score' || x.op === 'sumScore');
    const tabs = this.tabs(ctx);
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
          <span class="n">${c.score}</span>
          <span class="lbl"><b>คะแนนความเสี่ยงรวม</b><br>Total risk score</span>
          ${b.n ? `<span class="band">${esc(b.n)}</span>` : ''}
          <span class="prog"><span class="pct">ตอบแล้ว ${ans}/${tot}</span>
            <span class="tr"><i style="width:${pct}%"></i></span></span>
        </div>` : ''}
        <nav class="fk-tabbar" role="tablist" aria-label="ส่วนของฟอร์ม">` + tabs.map((t, n) => {
          const on = t.k === this.tab;
          const tag = t.miss ? `<span class="b">${t.miss}</span>`
                    : t.score ? `<span class="b">+${t.score}</span>`
                    : t.st === 'done' ? `<span class="b tick" aria-hidden="true">✓</span>` : '';
          const say = t.miss ? `ยังไม่ครบ ${t.miss} ช่อง`
                    : t.score ? `ได้ ${t.score} คะแนน`
                    : t.st === 'done' ? 'ตอบครบแล้ว' : 'ยังไม่ได้กรอก';
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

      html += `<div class="fk-nav">
        ${i > 0 ? `<button type="button" class="fb" data-go="${esc(tabs[i - 1].k)}">← ${esc(tabs[i - 1].n)}</button>` : '<span></span>'}
        ${!last ? `<button type="button" class="big pri" data-go="${esc(tabs[i + 1].k)}">${esc(tabs[i + 1].n)} →</button>` : '<span></span>'}
      </div>`;

    } else {
      for (const g of this.gates()) html += this.gateHtml(g);
      if (scored) {
        const b = this.band();
        html += `<div class="fk-score ${b.lv}"><span class="n">${c.score}</span>
          <span><b style="font-size:14.5px">คะแนนรวม</b><br>
          <span style="font-size:12.5px;color:var(--g-500)">คำนวณอัตโนมัติจากคำตอบ</span></span></div>`;
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

    el.querySelectorAll('input[data-k],textarea[data-k]').forEach(i =>
      i.addEventListener('change', () => { self.set(i.dataset.k, i.type === 'number' ? Number(i.value) : i.value); rerender(); }));

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
        cur[b.dataset.item] = b.dataset.v;
        self.set(k, cur); rerender();
      }));

    el.querySelectorAll('canvas[data-sign]').forEach(cv => bindSign(cv, self));
  };

  /* ลายเซ็นด้วยนิ้ว / Apple Pencil */
  function bindSign(cv, fk) {
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
    });

    let drawing = false;
    const pt = e => {
      const b = cv.getBoundingClientRect();
      const t = e.touches ? e.touches[0] : e;
      return [t.clientX - b.left, t.clientY - b.top];
    };
    const down = e => { e.preventDefault(); drawing = true; const [x, y] = pt(e); g.beginPath(); g.moveTo(x, y); };
    const move = e => { if (!drawing) return; e.preventDefault(); const [x, y] = pt(e); g.lineTo(x, y); g.stroke(); };
    const up = () => { if (!drawing) return; drawing = false; fk.data[cv.dataset.sign] = cv.toDataURL('image/png'); };
    cv.addEventListener('pointerdown', down); cv.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  }

  FormKit.evalCond = evalCond;
  FormKit.L = L;
  global.FormKit = FormKit;
})(window);
