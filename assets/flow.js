/**
 * flow.js — รวมผังงานของฟอร์มหนึ่งใบจากสองแหล่ง แล้ววาดเป็นผังภาพ
 *
 * ── แหล่งข้อมูล ─────────────────────────────────────────────
 * 1. route ในนิยามฟอร์ม (formdefs/<ABBR>.json) — เป็นตัวที่ระบบเดินจริง
 *    ถ้ามี ใช้ตัวนี้เสมอ ไม่ให้อะไรมาเขียนทับ ไม่งั้นผังที่คนอ่านจะไม่ตรงกับ
 *    สิ่งที่เกิดขึ้นจริงตอนกดส่ง ซึ่งเป็นความผิดพลาดที่ตรวจจับได้ยากที่สุด
 * 2. workflows.json — เติมจำนวนวันกับทางเมื่อไม่ผ่าน (ซึ่ง route ไม่ได้เก็บ)
 *    และเป็น "ขั้นตอนตั้งต้นตามสายงาน" ให้ฟอร์มที่ยังไม่มีนิยามฟอร์ม
 *
 * ทุกใบที่ยังไม่มีใครยืนยัน จะติดป้ายว่าเป็นค่าตั้งต้น ไม่ปล่อยให้อ่านแล้ว
 * เข้าใจว่าเป็นขั้นตอนที่ตกลงกันแล้ว
 */
(function (global) {
  'use strict';
  const F = {};

  /* ตำแหน่งย่อ -> ชื่อเต็ม ใช้ทั้งในผังและตาราง */
  F.POS = {
    ACM: 'Accountable Manager', HT: 'หัวหน้าครูการบิน', CMM: 'ผู้จัดการติดตามการปฏิบัติตาม',
    SM: 'ผู้จัดการนิรภัย', CFI: 'หัวหน้าครูการบินภาคอากาศ', FI: 'ครูการบิน',
    FIE: 'ผู้ตรวจสอบครูการบิน', TKI: 'ครูภาคทฤษฎี', ME: 'ช่างอากาศยาน',
    CAMO: 'ผู้มีอำนาจปล่อยอากาศยาน', OPS: 'ฝ่ายปฏิบัติการ', AD: 'ฝ่ายธุรการ',
    PIC: 'ผู้ควบคุมอากาศยาน',
  };
  F.posName = k => F.POS[k] ? (k + ' · ' + F.POS[k]) : k;

  /**
   * คืนผังงานที่พร้อมแสดง
   *   { steps: [{n, by, act, days, sign, reject}], desc, confirmed, src }
   * src = 'route' (มาจากนิยามฟอร์ม) หรือ 'default' (ค่าตั้งต้นตามสายงาน)
   */
  F.resolve = function (form, def, wf, lang) {
    const L = o => (typeof o === 'string' ? o : (o && (o[lang || 'th'] || o.th || o.en)) || '');
    const own = (wf.forms || {})[form.abbr] || {};
    const chain = (wf.defaults || {})[form.chain] || {};
    const route = (def && def.route) || [];

    let steps, src, confirmed;
    if (route.length) {
      src = 'route';
      steps = route.map((r, i) => {
        const p = (def.parties || []).find(x => x.k === r.party) || {};
        return {
          n: i + 1,
          by: r.pool || partyPos(p) || L(p.n) || r.party,
          who: L(p.n) || r.party,
          act: i === 0 ? 'กรอกและส่งฟอร์ม' : 'ตรวจและลงนามอนุมัติ',
          days: pick(own.days, i, r.slaDays),
          sign: r.sign !== false,
          reject: pick(own.reject, i, i === 0 ? 'end' : 'back'),
          onlyIf: r.onlyIf || '',
        };
      });
      confirmed = own.confirmed === true;
    } else {
      src = 'default';
      const list = own.steps || chain.steps || [];
      steps = list.map((s, i) => ({
        n: i + 1, by: s.by, who: s.by, act: s.act,
        days: pick(own.days, i, s.days), sign: s.sign !== false,
        reject: pick(own.reject, i, s.reject || (i === 0 ? 'end' : 'back')), onlyIf: '',
      }));
      confirmed = own.confirmed === true || chain.confirmed === true;
    }
    return {
      steps, src, confirmed,
      desc: own.desc || chain.desc || '',
      total: steps.reduce((t, s) => t + (Number(s.days) || 0), 0),
    };
  };

  function pick(arr, i, fallback) {
    return (Array.isArray(arr) && arr[i] != null) ? arr[i] : fallback;
  }
  /* ฝ่ายที่ผูกกับตำแหน่ง (auth: 'role:mgt' หรือ pool) — เอาไว้แสดงว่าใครรับผิดชอบ */
  function partyPos(p) {
    const m = /^pos:(.+)$/.exec(p.auth || '');
    return m ? m[1] : '';
  }

  F.rejectText = (r, lang) => {
    const th = { back: 'ย้อนกลับให้แก้แล้วส่งใหม่', end: 'ปิดเรื่อง · แจ้งผลผู้ยื่น' };
    const en = { back: 'back for correction', end: 'closed · applicant informed' };
    const M = (lang === 'en') ? en : th;
    if (M[r]) return M[r];
    return (lang === 'en' ? 'go to step ' : 'ไปขั้นที่ ') + r;
  };

  /**
   * ผังงานเป็น SVG — กล่องเรียงลงล่าง มีลูกศรเดินหน้า และลูกศรย้อนเมื่อไม่ผ่าน
   * วาดเองไม่ใช้ไลบรารี เพราะต้องพิมพ์ลงกระดาษ A4 ได้และต้องอยู่ในไฟล์เดียว
   * ตอนส่งออกเป็นชุดเอกสาร
   */
  F.svg = function (flow, opt) {
    opt = opt || {};
    const W = opt.width || 620, BW = 380, BH = 62, GAP = 42, X = 120;
    const n = flow.steps.length;
    const H = 56 + n * (BH + GAP) + 30;
    const esc = s => String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    let out = '';

    out += `<rect x="${X + BW / 2 - 60}" y="8" width="120" height="26" rx="13" fill="#1b3a5c"/>`;
    out += `<text x="${X + BW / 2}" y="26" text-anchor="middle" font-size="12.5" fill="#fff"
              font-weight="700">เริ่ม</text>`;

    flow.steps.forEach((s, i) => {
      const y = 56 + i * (BH + GAP);
      out += `<line x1="${X + BW / 2}" y1="${y - GAP + 4}" x2="${X + BW / 2}" y2="${y - 6}"
                stroke="#1b3a5c" stroke-width="1.6" marker-end="url(#ar)"/>`;
      out += `<rect x="${X}" y="${y}" width="${BW}" height="${BH}" rx="9"
                fill="#fff" stroke="#1b3a5c" stroke-width="1.6"/>`;
      out += `<circle cx="${X + 22}" cy="${y + BH / 2}" r="13" fill="#1b3a5c"/>`;
      out += `<text x="${X + 22}" y="${y + BH / 2 + 4.5}" text-anchor="middle" font-size="12.5"
                fill="#fff" font-weight="700">${s.n}</text>`;
      out += `<text x="${X + 44}" y="${y + 24}" font-size="13" font-weight="700"
                fill="#0d1b2a">${esc(s.by)}</text>`;
      out += `<text x="${X + 44}" y="${y + 42}" font-size="11.5" fill="#456">${esc(cut(s.act, 44))}</text>`;
      if (s.days) {
        out += `<rect x="${X + BW - 66}" y="${y + 12}" width="54" height="20" rx="10"
                  fill="#eaf2fb" stroke="#2a6fbe" stroke-width=".8"/>`;
        out += `<text x="${X + BW - 39}" y="${y + 26}" text-anchor="middle" font-size="10.5"
                  fill="#2a6fbe" font-weight="700">${s.days} วัน</text>`;
      }
      if (s.sign) {
        out += `<text x="${X + BW - 39}" y="${y + 50}" text-anchor="middle" font-size="9.5"
                  fill="#777">ลงนาม</text>`;
      }
      /* ลูกศรย้อนเมื่อไม่ผ่าน — วาดทางซ้ายของกล่อง ไม่ให้ทับเส้นเดินหน้า */
      if (s.reject === 'back' && i > 0) {
        const yb = y + BH / 2, yt = y - GAP - BH / 2;
        out += `<path d="M${X} ${yb} H${X - 46} V${yt} H${X - 4}"
                  fill="none" stroke="#b23" stroke-width="1.3" stroke-dasharray="4 3"
                  marker-end="url(#arr)"/>`;
        out += `<text x="${X - 50}" y="${(yb + yt) / 2}" text-anchor="end" font-size="9.5"
                  fill="#b23" transform="rotate(-90 ${X - 50} ${(yb + yt) / 2})">ไม่ผ่าน</text>`;
      }
    });

    const ey = 56 + n * (BH + GAP);
    out += `<line x1="${X + BW / 2}" y1="${ey - GAP + 4}" x2="${X + BW / 2}" y2="${ey - 6}"
              stroke="#1b3a5c" stroke-width="1.6" marker-end="url(#ar)"/>`;
    out += `<rect x="${X + BW / 2 - 70}" y="${ey}" width="140" height="26" rx="13" fill="#1fa35a"/>`;
    out += `<text x="${X + BW / 2}" y="${ey + 18}" text-anchor="middle" font-size="12.5"
              fill="#fff" font-weight="700">เสร็จ · เก็บเข้าแฟ้ม</text>`;

    return `<svg viewBox="0 0 ${W} ${H}" width="100%" style="max-width:${W}px;height:auto"
      xmlns="http://www.w3.org/2000/svg" font-family="system-ui,-apple-system,sans-serif">
      <defs>
        <marker id="ar" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7"
          orient="auto"><path d="M0 0 L8 4 L0 8 z" fill="#1b3a5c"/></marker>
        <marker id="arr" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="6" markerHeight="6"
          orient="auto"><path d="M0 0 L8 4 L0 8 z" fill="#b23"/></marker>
      </defs>${out}</svg>`;
  };

  function cut(s, n) {
    s = String(s || '');
    return s.length > n ? s.slice(0, n - 1) + '…' : s;
  }

  global.Flow = F;
})(window);
