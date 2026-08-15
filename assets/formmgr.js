/* ============================================================
   formmgr.js — วงจรชีวิตของนิยามฟอร์ม
   สเปกอยู่ที่ formdefs/_MANAGEMENT.md · รูปร่างฟอร์มอยู่ที่ _SCHEMA.md

   เก็บที่ Firestore:
     formDefs/{code}                  รุ่นที่ใช้อยู่ + สถานะ
     formDefs/{code}/versions/{n}     สำเนาแช่แข็งของทุกรุ่นที่ publish
     formDefs/{code}/events/{id}      log แก้ไข append-only
   ============================================================ */
(function (g) {
  'use strict';

  const M = {};
  const FIELD_TYPES = ['text','textarea','date','time','number','email','tel','select',
                       'multi','check','checklist','grade','scale','sign','static','table'];
  const REASONS = ['Regulatory','Operational','Clarity','Correction'];
  const STATUS = { draft:'ร่าง', published:'ใช้งานอยู่', disabled:'ปิดใช้งาน' };

  M.FIELD_TYPES = FIELD_TYPES; M.REASONS = REASONS; M.STATUS = STATUS;

  /* ── ตรวจนิยามตามสเปก — ใช้ทั้งตอนนำเข้าและก่อน publish ── */
  M.validate = function (def, knownCodes) {
    const e = [];
    if (!def || typeof def !== 'object') return ['ไม่ใช่ออบเจ็กต์'];
    if (!def.code) e.push('ไม่มี code');
    else if (knownCodes && !knownCodes.includes(def.code))
      e.push(`code "${def.code}" ไม่มีในทะเบียนฟอร์ม`);
    if (!def.title || !(def.title.th || def.title.en)) e.push('ไม่มี title');

    const parties = new Set((def.parties || []).map(p => p.k));
    if (!parties.size) e.push('ต้องมี parties อย่างน้อย 1 ราย');
    for (const p of def.parties || []) {
      if (!p.auth) e.push(`party "${p.k}" ไม่ได้ระบุ auth`);
      else if (p.auth !== 'public' && p.auth !== 'assignee' && !/^role:/.test(p.auth))
        e.push(`party "${p.k}" auth "${p.auth}" ไม่ถูกต้อง`);
    }

    const keys = new Set(), computed = new Set((def.compute || []).map(c => c.k));
    for (const s of def.sections || []) {
      if (s.party && !parties.has(s.party))
        e.push(`section ${s.k || '?'} อ้าง party "${s.party}" ที่ไม่มี`);
      for (const f of s.fields || []) {
        if (!f.k) { e.push(`section ${s.k || '?'} มีฟิลด์ที่ไม่มี k`); continue; }
        if (keys.has(f.k)) e.push(`ฟิลด์ซ้ำ: ${f.k}`);
        keys.add(f.k);
        const t = f.type || 'text';
        if (!FIELD_TYPES.includes(t)) e.push(`ฟิลด์ ${f.k} ใช้ type "${t}" ที่ยังไม่รองรับ`);
        if ((t === 'select' || t === 'multi' || t === 'scale') && !(f.opt || []).length)
          e.push(`ฟิลด์ ${f.k} เป็น ${t} แต่ไม่มี opt`);
        if (t === 'checklist' && !(f.items || []).length)
          e.push(`ฟิลด์ ${f.k} เป็น checklist แต่ไม่มี items`);
      }
    }
    if (!keys.size) e.push('ยังไม่มีฟิลด์ใดเลย');

    for (const r of def.route || []) {
      if (!parties.has(r.party)) e.push(`route ขั้น ${r.step} อ้าง party "${r.party}" ที่ไม่มี`);
    }
    if (!(def.route || []).length) e.push('ต้องมี route อย่างน้อย 1 ขั้น');

    // เงื่อนไขต้องอ้างของที่มีจริง
    const refs = []
      .concat((def.sections || []).map(s => s.showIf))
      .concat((def.sections || []).flatMap(s => (s.fields || []).flatMap(f => [f.showIf, f.reqIf])))
      .concat((def.gates || []).map(x => x.when))
      .concat((def.route || []).map(x => x.onlyIf));
    const KNOWN_TOK = ['true','false','anyStarBelow','anyBelow','filled','score','has'];
    for (const expr of refs) {
      // ตัดค่าในเครื่องหมายคำพูดออกก่อน — "decCat == 'other'" ไม่ได้อ้างฟิลด์ชื่อ other
      // เคยพลาดแบบเดียวกันมาแล้วที่ build.py กับ "decision == 'GO'"
      const bare = String(expr || '').replace(/'[^']*'|"[^"]*"/g, ' ');
      for (const tok of bare.match(/[a-zA-Z_]\w*/g) || []) {
        if (KNOWN_TOK.includes(tok)) continue;
        if (!keys.has(tok) && !computed.has(tok))
          e.push(`เงื่อนไขอ้าง "${tok}" ที่ไม่ใช่ฟิลด์หรือค่าคำนวณ`);
      }
    }
    for (const gt of def.gates || []) {
      if (!['stop','warn','info'].includes(gt.level))
        e.push(`gate "${gt.when}" ใช้ level "${gt.level}" ที่ไม่ถูกต้อง`);
    }
    return [...new Set(e)];
  };

  /* ── เทียบสองรุ่น เพื่อสรุปว่าแก้อะไรลง log ── */
  M.diff = function (oldDef, newDef) {
    const keysOf = d => new Set((d.sections || []).flatMap(s => (s.fields || []).map(f => f.k)));
    const a = keysOf(oldDef || {}), b = keysOf(newDef || {});
    const added = [...b].filter(k => !a.has(k));
    const removed = [...a].filter(k => !b.has(k));
    const changed = [];
    const fld = (d, k) => (d.sections || []).flatMap(s => s.fields || []).find(f => f.k === k);
    for (const k of [...b].filter(x => a.has(x))) {
      if (JSON.stringify(fld(oldDef, k)) !== JSON.stringify(fld(newDef, k))) changed.push(k);
    }
    const part = [];
    for (const s of ['parties','compute','gates','route','export']) {
      if (JSON.stringify((oldDef || {})[s] || null) !== JSON.stringify((newDef || {})[s] || null)) part.push(s);
    }
    return { added, removed, changed, sections: part };
  };

  M.diffText = function (d) {
    const p = [];
    if (d.added.length)    p.push('เพิ่ม ' + d.added.join(', '));
    if (d.removed.length)  p.push('เอาออก ' + d.removed.join(', '));
    if (d.changed.length)  p.push('แก้ ' + d.changed.join(', '));
    if (d.sections.length) p.push('ปรับ ' + d.sections.join(', '));
    return p.join(' · ') || 'ไม่มีการเปลี่ยนแปลงในเนื้อฟอร์ม';
  };

  /* ── อ่าน ── */
  M.list = async function (db) {
    const s = await db.collection('formDefs').get();
    return s.docs.map(d => d.data());
  };
  M.get = async function (db, code) {
    const d = await db.collection('formDefs').doc(code).get();
    return d.exists ? d.data() : null;
  };
  M.versions = async function (db, code) {
    const s = await db.collection('formDefs').doc(code).collection('versions')
      .orderBy('defRev', 'desc').get();
    return s.docs.map(d => d.data());
  };
  M.events = async function (db, code, n) {
    const s = await db.collection('formDefs').doc(code).collection('events')
      .orderBy('at', 'desc').limit(n || 50).get();
    return s.docs.map(d => d.data());
  };

  const stamp = () => firebase.firestore.FieldValue.serverTimestamp();

  M.log = function (db, code, ev) {
    return db.collection('formDefs').doc(code).collection('events')
      .add(Object.assign({ at: stamp() }, ev));
  };

  /* ── นำเข้า / สร้างเป็นร่าง ── */
  M.saveDraft = async function (db, user, def, note) {
    const cur = await M.get(db, def.code);
    const body = Object.assign({}, def, {
      status: 'draft',
      defRev: cur ? (cur.defRev || 0) : 0,
      issue: def.issue || (cur && cur.issue) || '01',
      rev:   def.rev   || (cur && cur.rev)   || '00',
      updatedAt: stamp(), updatedBy: user.email,
    });
    if (!cur) { body.createdAt = stamp(); body.createdBy = user.email; }
    await db.collection('formDefs').doc(def.code).set(body, { merge: true });
    await M.log(db, def.code, {
      by: user.email, action: cur ? 'imported' : 'created',
      changeNote: note || (cur ? 'นำเข้านิยามทับร่างเดิม' : 'สร้างนิยามฟอร์มครั้งแรก'),
      diff: M.diff(cur, def), toDefRev: body.defRev,
    });
    return body;
  };

  /* ── publish รุ่นใหม่ ──
     bump: 'none' คงเลขเอกสาร · 'rev' แก้ไข +1 · 'issue' ออกฉบับใหม่ */
  M.publish = async function (db, user, code, opts) {
    const cur = await M.get(db, code);
    if (!cur) throw new Error('ยังไม่มีนิยามฟอร์มนี้');
    if (!opts.changeNote || !opts.changeNote.trim()) throw new Error('ต้องระบุว่าแก้อะไร');
    if (!REASONS.includes(opts.reason)) throw new Error('ต้องเลือกเหตุผลของการแก้ไข');

    const errs = M.validate(cur, opts.knownCodes);
    if (errs.length) throw new Error('นิยามยังไม่ผ่านการตรวจ:\n· ' + errs.join('\n· '));

    const prev = await M.versions(db, code);
    const fromIssueRev = `${cur.issue}/${cur.rev}`;
    let issue = cur.issue, rev = cur.rev;
    if (opts.bump === 'rev')   rev = String(Number(rev) + 1).padStart(2, '0');
    if (opts.bump === 'issue') { issue = String(Number(issue) + 1).padStart(2, '0'); rev = '00'; }

    const defRev = (cur.defRev || 0) + 1;
    const snapshot = Object.assign({}, cur, {
      defRev, issue, rev, status: 'published',
      publishedAt: stamp(), publishedBy: user.email,
      changeNote: opts.changeNote.trim(), reason: opts.reason,
    });
    delete snapshot.updatedAt; delete snapshot.updatedBy;

    // สำเนาแช่แข็ง — rules ห้ามแก้ห้ามลบ
    await db.collection('formDefs').doc(code).collection('versions')
      .doc(String(defRev)).set(snapshot);
    await db.collection('formDefs').doc(code).set(snapshot, { merge: true });
    await M.log(db, code, {
      by: user.email, action: 'published',
      fromDefRev: cur.defRev || 0, toDefRev: defRev,
      fromIssueRev, toIssueRev: `${issue}/${rev}`,
      bump: opts.bump, changeNote: opts.changeNote.trim(), reason: opts.reason,
      diff: M.diff(prev.length ? prev[0] : null, cur),
    });
    return snapshot;
  };

  /* ── เปิด / ปิดใช้งาน ──
     ปิดแล้วเริ่มใบใหม่ไม่ได้ แต่ใบที่ค้างอยู่ต้องเดินต่อจนจบ */
  M.setStatus = async function (db, user, code, status, note) {
    if (!STATUS[status]) throw new Error('สถานะไม่ถูกต้อง');
    const cur = await M.get(db, code);
    if (!cur) throw new Error('ยังไม่มีนิยามฟอร์มนี้');
    if (status === 'published' && !(cur.defRev > 0))
      throw new Error('ยังไม่เคย publish — กด "ออกเวอร์ชันใหม่" ก่อน');
    await db.collection('formDefs').doc(code).set({
      status, statusAt: stamp(), statusBy: user.email }, { merge: true });
    await M.log(db, code, {
      by: user.email, action: status === 'disabled' ? 'disabled' : 'enabled',
      fromStatus: cur.status, toStatus: status,
      changeNote: note || (status === 'disabled' ? 'ปิดใช้งานฟอร์ม' : 'เปิดใช้งานฟอร์ม'),
    });
  };

  /* ── editor note ตามรูปแบบใน CLAUDE.md ── */
  M.editorNote = function (code, ev) {
    const d = ev.at && ev.at.toDate ? ev.at.toDate() : new Date();
    const D = String(d.getDate()).padStart(2,'0') + ' ' +
      ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'][d.getMonth()] +
      ' ' + d.getFullYear();
    return [
      'EDITOR NOTE',
      'Form:        ' + code,
      'Version:     ' + (ev.fromIssueRev || '—') + '  →  ' + (ev.toIssueRev || '—') +
        '   (defRev ' + (ev.fromDefRev ?? '—') + ' → ' + (ev.toDefRev ?? '—') + ')',
      'Change:      ' + (ev.changeNote || '—'),
      'Detail:      ' + (ev.diff ? M.diffText(ev.diff) : '—'),
      'Reason:      ' + (ev.reason || '—'),
      'Changed by:  ' + (ev.by || '—') + ' on ' + D,
      'Approved by: Pending',
    ].join('\n');
  };

  g.FormMgr = M;
})(window);
