/* ============================================================
   idscan.js — ถ่ายรูปพาสปอร์ตหรือบัตรประชาชนแล้วถอดข้อความมากรอกให้

   หลักที่ห้ามเปลี่ยน
   · รูปอยู่ในเครื่องผู้กรอกเท่านั้น ไม่อัปโหลด ไม่เก็บ ไม่แนบไปกับใบ
     ปิดหน้าต่างเมื่อไรรูปหายทันที (canvas ถูกล้าง · object URL ถูกคืน)
     บัตรประชาชนไทยพิมพ์ศาสนาไว้บนบัตร ซึ่งเป็นข้อมูลอ่อนไหวตาม PDPA ม.26
     การเก็บรูปบัตรจึงดึงข้อมูลชั้นนั้นเข้าระบบทั้งที่ใบนี้ไม่ได้ถาม
   · สิ่งที่เก็บคือ "ข้อความในช่อง" เท่าที่กระดาษถามอยู่แล้ว ไม่มีอะไรเพิ่ม
   · อ่านได้แล้วยังต้องให้คนยืนยันก่อนใส่ และแก้ทับได้ทุกช่อง
     OCR ผิดได้เสมอ ใบนี้เป็นเอกสารที่มีผลผูกพันทางกฎหมาย

   อ่านอะไรได้
   · พาสปอร์ต — แถบ MRZ สองบรรทัดล่างสุด (TD3) และแบบ TD2/TD1
     มีเลขตรวจสอบในตัว อ่านผิดจับได้ทันที จึงเป็นทางที่ไว้ใจได้ที่สุด
   · บัตรประชาชนไทย — ไม่มี MRZ อ่านเฉพาะเลข 13 หลัก (มี checksum)
     กับบรรทัดภาษาอังกฤษบนบัตร (Name / Last name / Date of Birth)
     ไม่ลง Thai OCR เพราะถ่ายกลางแดดริมลานจอดแล้วชื่อไทยพลาดบ่อยกว่าพิมพ์เอง
   ============================================================ */
(function (g) {
  'use strict';

  const TESS_JS = 'https://cdn.jsdelivr.net/npm/tesseract.js@5.1.1/dist/tesseract.min.js';
  const TESS_LANG = 'https://tessdata.projectnaptha.com/4.0.0_fast';   // eng ~1.9 MB

  const S = {};
  const L = (o, lang) => (o && (lang === 'en' ? o.en : o.th)) || '';
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g,
    c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  /* ── เลขตรวจสอบของ MRZ (ICAO Doc 9303) ─────────────────
     ตัวเลข = ค่าตัวเอง · A–Z = 10–35 · '<' = 0 · ถ่วงน้ำหนัก 7,3,1 วนไป */
  function mrzCheck(s) {
    const w = [7, 3, 1];
    let sum = 0;
    for (let i = 0; i < s.length; i++) {
      const c = s[i];
      let v = 0;
      if (c >= '0' && c <= '9') v = c.charCodeAt(0) - 48;
      else if (c >= 'A' && c <= 'Z') v = c.charCodeAt(0) - 55;
      sum += v * w[i % 3];
    }
    return String(sum % 10);
  }

  /* YYMMDD ของ MRZ ไม่มีศตวรรษ
       วันเกิด   ต้องเป็นอดีตเสมอ ปีที่ตกหลังวันนี้จึงเป็นของศตวรรษก่อน (74 → 1974)
       วันหมดอายุ อยู่ในศตวรรษนี้เสมอ เอกสารที่หมดอายุไปแล้วก็ยังเป็น 20xx (12 → 2012)
                 ไม่ดันไปเป็น 2112 เพราะพาสปอร์ตมีอายุไม่เกินสิบปี */
  function mrzDate(s, future) {
    if (!/^\d{6}$/.test(s)) return '';
    const yy = +s.slice(0, 2), mm = +s.slice(2, 4), dd = +s.slice(4, 6);
    if (mm < 1 || mm > 12 || dd < 1 || dd > 31) return '';
    const cy = new Date().getFullYear() % 100;
    const full = (!future && yy > cy) ? 1900 + yy : 2000 + yy;
    const p2 = n => String(n).padStart(2, '0');
    return `${full}-${p2(mm)}-${p2(dd)}`;
  }

  const clean = s => String(s || '').toUpperCase()
    .replace(/[«»]/g, '<').replace(/[^A-Z0-9<]/g, '');

  /* ชื่อในบรรทัดแรกของ MRZ: SURNAME<<GIVEN<NAMES<<<<< */
  function mrzName(seg) {
    const [sur, giv] = seg.split('<<');
    const sp = s => (s || '').replace(/</g, ' ').replace(/\s+/g, ' ').trim();
    return { surname: sp(sur), given: sp(giv) };
  }

  /** อ่าน MRZ จากข้อความที่ OCR ได้ — รองรับ TD3 (2×44) · TD2 (2×36) · TD1 (3×30) */
  function parseMRZ(text) {
    const lines = String(text || '').split(/\r?\n/).map(clean).filter(x => x.length >= 28);
    // TD3 / TD2 — สองบรรทัดยาวเท่ากัน บรรทัดแรกขึ้นต้นด้วยชนิดเอกสาร
    for (let i = 0; i + 1 < lines.length; i++) {
      for (const n of [44, 36]) {
        const a = lines[i], b = lines[i + 1];
        if (Math.abs(a.length - n) > 2 || Math.abs(b.length - n) > 2) continue;
        if (!/^[A-Z<][A-Z<]/.test(a)) continue;
        const l1 = a.padEnd(n, '<').slice(0, n), l2 = b.padEnd(n, '<').slice(0, n);
        const nm = mrzName(l1.slice(5));
        const docNo = l2.slice(0, 9).replace(/</g, '');
        const out = {
          kind: 'mrz', docType: l1.slice(0, 1), issuer: l1.slice(2, 5).replace(/</g, ''),
          surname: nm.surname, given: nm.given, docNo,
          nationality: l2.slice(10, 13).replace(/</g, ''),
          dob: mrzDate(l2.slice(13, 19), false),
          sex: (l2[20] === 'M' || l2[20] === 'F') ? l2[20] : '',
          expiry: mrzDate(l2.slice(21, 27), true),
          checks: {
            docNo: mrzCheck(l2.slice(0, 9)) === l2[9],
            dob:   mrzCheck(l2.slice(13, 19)) === l2[19],
            expiry: mrzCheck(l2.slice(21, 27)) === l2[27],
          },
        };
        if (out.docNo && (out.checks.docNo || out.checks.dob)) return out;
      }
    }
    // TD1 — สามบรรทัด 30 ตัว ชื่ออยู่บรรทัดสุดท้าย
    for (let i = 0; i + 2 < lines.length; i++) {
      const [a, b, c] = [lines[i], lines[i + 1], lines[i + 2]].map(x => x.padEnd(30, '<').slice(0, 30));
      if (a.length !== 30 || !/^[A-Z<]/.test(a)) continue;
      const nm = mrzName(c);
      const docNo = a.slice(5, 14).replace(/</g, '');
      const out = {
        kind: 'mrz', docType: a.slice(0, 1), issuer: a.slice(2, 5).replace(/</g, ''),
        surname: nm.surname, given: nm.given, docNo,
        nationality: b.slice(15, 18).replace(/</g, ''),
        dob: mrzDate(b.slice(0, 6), false),
        sex: (b[7] === 'M' || b[7] === 'F') ? b[7] : '',
        expiry: mrzDate(b.slice(8, 14), true),
        checks: { docNo: mrzCheck(a.slice(5, 14)) === a[14],
                  dob: mrzCheck(b.slice(0, 6)) === b[6],
                  expiry: mrzCheck(b.slice(8, 14)) === b[14] },
      };
      if (out.docNo && (out.checks.docNo || out.checks.dob)) return out;
    }
    return null;
  }

  /* ── บัตรประชาชนไทย ────────────────────────────────────
     เลข 13 หลักมีหลักตรวจสอบของตัวเอง (มอก. เดียวกับที่กรมการปกครองใช้)
       ผลรวมของหลักที่ 1–12 คูณด้วย 13 ลงมาถึง 2 · (11 − ผลรวม mod 11) mod 10 = หลักที่ 13 */
  function thaiIdOk(id) {
    if (!/^\d{13}$/.test(id)) return false;
    let sum = 0;
    for (let i = 0; i < 12; i++) sum += (+id[i]) * (13 - i);
    return ((11 - (sum % 11)) % 10) === +id[12];
  }

  const MON = { JAN: 1, FEB: 2, MAR: 3, APR: 4, MAY: 5, JUN: 6, JUL: 7, AUG: 8, SEP: 9, OCT: 10, NOV: 11, DEC: 12 };

  function parseThaiId(text) {
    const raw = String(text || '');
    /* เลข 13 หลัก — บนบัตรพิมพ์เว้นวรรคเป็นกลุ่ม (1 2345 67890 12 3)
       ไล่ทีละบรรทัดก่อน แล้วค่อยไล่ทั้งหน้ารวมกัน เพราะ OCR ตัดบรรทัดไม่ตรงบ้าง
       ตัวคัดกรองจริงคือหลักตรวจสอบ เลขที่ OCR อ่านพลาดหนึ่งหลักจะไม่ผ่าน */
    let id = '';
    const find = d => {
      for (let i = 0; i + 13 <= d.length; i++) {
        const t = d.slice(i, i + 13);
        // หลักแรกของเลขประจำตัวประชาชนเป็น 1–8 เท่านั้น ใช้กันเลขอื่นที่บังเอิญผ่านหลักตรวจสอบ
        if (t[0] >= '1' && t[0] <= '8' && thaiIdOk(t)) return t;
      }
      return '';
    };
    /* ไล่ทีละบรรทัดเท่านั้น ไม่รวมทั้งหน้าเป็นสายเดียว — เคยลองแล้วได้เลขที่เกิดจาก
       ตัวเลขของสองบรรทัดต่อกันจนบังเอิญผ่านหลักตรวจสอบ (ผ่านได้ 1 ใน 11 โดยสุ่ม) */
    for (const line of raw.split(/\r?\n/)) {
      id = find(line.replace(/\D/g, ''));
      if (id) break;
    }
    // บรรทัดภาษาอังกฤษบนบัตร
    const given = (raw.match(/Name\s+(?:Mr\.?|Mrs\.?|Miss|Ms\.?)?\s*([A-Za-z][A-Za-z' -]{1,40})/i) || [])[1] || '';
    const sur   = (raw.match(/Last\s*name\s+([A-Za-z][A-Za-z' -]{1,40})/i) || [])[1] || '';
    let dob = '';
    const m = raw.match(/Date\s*of\s*Birth\s+(\d{1,2})\s*([A-Za-z]{3})[a-z.]*\s*(\d{4})/i);
    if (m) {
      const mm = MON[m[2].toUpperCase()];
      let yy = +m[3];
      if (yy > 2400) yy -= 543;                 // เผื่อ OCR หยิบบรรทัด พ.ศ. มา
      if (mm) dob = `${yy}-${String(mm).padStart(2, '0')}-${String(+m[1]).padStart(2, '0')}`;
    }
    if (!id && !given && !dob) return null;
    return { kind: 'thid', docNo: id, given: given.trim(), surname: sur.trim(), dob,
             checks: { docNo: !!id } };
  }

  /* ── เตรียมรูปก่อนส่งให้ OCR ───────────────────────────
     ย่อ/ขยายให้กว้างราว 1,600 px · เทาแล้วดึงคอนทราสต์
     ภาพจากกล้องมือถือกลางแดดมักสว่างจัดจนตัวอักษรจาง ไม่ทำขั้นนี้แล้วอ่านไม่ออก */
  function prep(src, crop) {
    const cv = document.createElement('canvas');
    const sw = src.videoWidth || src.naturalWidth || src.width;
    const sh = src.videoHeight || src.naturalHeight || src.height;
    const cx = crop ? Math.round(sw * crop.x) : 0, cy = crop ? Math.round(sh * crop.y) : 0;
    const cw = crop ? Math.round(sw * crop.w) : sw, ch = crop ? Math.round(sh * crop.h) : sh;
    const scale = Math.min(3, Math.max(1, 1600 / cw));
    cv.width = Math.round(cw * scale); cv.height = Math.round(ch * scale);
    const x = cv.getContext('2d', { willReadFrequently: true });
    x.drawImage(src, cx, cy, cw, ch, 0, 0, cv.width, cv.height);
    const im = x.getImageData(0, 0, cv.width, cv.height), d = im.data;
    let lo = 255, hi = 0;
    for (let i = 0; i < d.length; i += 4) {
      const y = (d[i] * 299 + d[i + 1] * 587 + d[i + 2] * 114) / 1000;
      d[i] = d[i + 1] = d[i + 2] = y;
      if (y < lo) lo = y; if (y > hi) hi = y;
    }
    const span = Math.max(1, hi - lo);
    for (let i = 0; i < d.length; i += 4) {
      const y = Math.max(0, Math.min(255, (d[i] - lo) * 255 / span));
      d[i] = d[i + 1] = d[i + 2] = y;
    }
    x.putImageData(im, 0, 0);
    return cv;
  }

  function wipe(cv) {
    if (!cv) return;
    const x = cv.getContext('2d');
    if (x) x.clearRect(0, 0, cv.width, cv.height);
    cv.width = cv.height = 1;
  }

  /* ── ตัวอ่าน ───────────────────────────────────────────
     โหลด tesseract.js เมื่อกดปุ่มเท่านั้น ไม่ถ่วงหน้ากรอกของคนที่พิมพ์เอง */
  let worker = null, loading = null;
  function loadScript(src) {
    return new Promise((res, rej) => {
      if (document.querySelector(`script[src="${src}"]`)) return res();
      const s = document.createElement('script');
      s.src = src; s.onload = () => res(); s.onerror = () => rej(new Error('โหลดตัวอ่านไม่สำเร็จ'));
      document.head.appendChild(s);
    });
  }
  async function getWorker(onProgress) {
    if (worker) return worker;
    if (!loading) loading = (async () => {
      await loadScript(TESS_JS);
      const w = await Tesseract.createWorker('eng', 1, {
        langPath: TESS_LANG,
        logger: m => { if (onProgress && m.status) onProgress(m); },
      });
      worker = w;
      return w;
    })();
    return loading;
  }

  async function ocr(cv, mrzMode) {
    const w = await getWorker();
    await w.setParameters(mrzMode
      ? { tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789<', tessedit_pageseg_mode: '6' }
      : { tessedit_char_whitelist: '', tessedit_pageseg_mode: '3' });
    const r = await w.recognize(cv);
    return (r && r.data && r.data.text) || '';
  }

  /** อ่านหนึ่งภาพ — ลอง MRZ ก่อน (แถบล่างของหน้าข้อมูล) แล้วค่อยลองบัตรไทย */
  async function readImage(src, say) {
    say('mrzBand');
    let band = prep(src, { x: 0, y: 0.62, w: 1, h: 0.38 });
    let got = parseMRZ(await ocr(band, true));
    wipe(band);
    if (!got) {
      say('mrzFull');
      const full = prep(src, null);
      got = parseMRZ(await ocr(full, true));
      if (!got) { say('thai'); got = parseThaiId(await ocr(full, false)); }
      wipe(full);
    }
    return got;
  }

  /* ── หน้าต่างถ่ายรูป ───────────────────────────────────── */
  const TXT = {
    title:   { th: 'ถ่ายรูปเอกสารเพื่อกรอกให้', en: 'Scan a document to fill the form' },
    sub:     { th: 'พาสปอร์ต (แถบสองบรรทัดล่างสุด) หรือบัตรประชาชนไทย', en: 'Passport (the two lines at the bottom) or Thai ID card' },
    privacy: { th: 'รูปอยู่ในเครื่องของท่านเท่านั้น ระบบอ่านข้อความแล้วทิ้งรูปทันที — ไม่ส่งรูปขึ้นระบบ ไม่เก็บภาพบัตรประชาชนหรือพาสปอร์ตไว้ที่ใด และไม่แนบไปกับใบที่ส่ง',
               en: 'The photo stays on your device. The text is read and the image is discarded at once — no image is uploaded, stored, or attached to the submitted record.' },
    shoot:   { th: 'ถ่ายรูป', en: 'Capture' },
    pick:    { th: 'เลือกรูปจากเครื่อง', en: 'Choose a photo' },
    again:   { th: 'ถ่ายใหม่', en: 'Retake' },
    use:     { th: 'ใส่ค่าเหล่านี้', en: 'Use these values' },
    close:   { th: 'ปิด', en: 'Close' },
    starting:{ th: 'กำลังเปิดกล้อง…', en: 'Starting the camera…' },
    loading: { th: 'กำลังโหลดตัวอ่าน (ครั้งแรกใช้เวลาสักครู่)…', en: 'Loading the reader (first time takes a moment)…' },
    mrzBand: { th: 'กำลังอ่านแถบ MRZ…', en: 'Reading the MRZ band…' },
    mrzFull: { th: 'กำลังอ่านทั้งหน้า…', en: 'Reading the whole page…' },
    thai:    { th: 'กำลังอ่านบัตรประชาชน…', en: 'Reading the ID card…' },
    none:    { th: 'อ่านไม่ออก — ลองใหม่โดยให้เอกสารเต็มกรอบ ไม่เอียง ไม่มีเงาทับ หรือพิมพ์เองได้เลย',
               en: 'Could not read it. Fill the frame, keep it straight and free of shadow, or just type the details instead.' },
    nocam:   { th: 'เปิดกล้องไม่ได้ — เลือกรูปจากเครื่องแทนได้', en: 'The camera is unavailable — choose a photo instead.' },
    checkOk: { th: 'เลขตรวจสอบถูกต้อง', en: 'Check digits valid' },
    checkNo: { th: 'เลขตรวจสอบไม่ผ่าน — ทานค่ากับเอกสารก่อนใช้', en: 'Check digit failed — verify against the document' },
    verify:  { th: 'ทานกับเอกสารจริงก่อนกดใส่ค่า แก้ทับได้ทุกช่องหลังจากนั้น', en: 'Check against the document before using these. Every field stays editable.' },
    fName:   { th: 'ชื่อ-นามสกุล', en: 'Full name' },
    fDob:    { th: 'วันเกิด', en: 'Date of birth' },
    fDoc:    { th: 'เลขเอกสาร', en: 'Document number' },
  };

  function styles() {
    if (document.getElementById('idscan-css')) return;
    const st = document.createElement('style');
    st.id = 'idscan-css';
    st.textContent = `
#idscan{border:0;border-radius:12px;padding:0;max-width:560px;width:calc(100% - 24px);margin:auto;
  background:var(--surface,#fff);color:var(--fg-1,#0d1b2a);box-shadow:0 20px 60px rgba(13,27,42,.35)}
#idscan::backdrop{background:rgba(13,27,42,.6)}
#idscan .dh{background:var(--navy-900,#0d1b2a);color:#fff;padding:14px 18px}
#idscan .dh h3{margin:0;font-size:16.5px;font-weight:700;color:#fff}
#idscan .dh p{margin:3px 0 0;font-size:12.5px;color:rgba(255,255,255,.72)}
#idscan .db{padding:14px 18px}
#idscan .df{padding:12px 18px;border-top:1px solid var(--g-100,#e6e9ee);display:flex;gap:8px;
  flex-wrap:wrap;justify-content:flex-end}
#idscan .stage{position:relative;background:#111;border-radius:10px;overflow:hidden;aspect-ratio:3/2}
#idscan video,#idscan canvas.shot{width:100%;height:100%;object-fit:cover;display:block}
#idscan .guide{position:absolute;inset:8% 6%;border:2px dashed rgba(255,255,255,.85);border-radius:8px;
  pointer-events:none}
#idscan .guide i{position:absolute;left:0;right:0;bottom:0;height:30%;border-top:2px dashed rgba(255,255,255,.85);
  background:rgba(255,255,255,.10);font-style:normal;color:#fff;font-size:11px;display:grid;place-items:center}
#idscan .pdpa{margin:10px 0 0;font-size:12px;line-height:1.55;color:var(--fg-2,#44506180);
  background:var(--g-50,#f5f7fa);border-radius:8px;padding:9px 11px}
#idscan .msg{margin:10px 0 0;font-size:13px;color:var(--fg-2,#445061);min-height:18px}
#idscan .msg.bad{color:var(--red-600,#b3261e)}
#idscan .res{margin:10px 0 0;border:1px solid var(--border-light,#e6e9ee);border-radius:10px;overflow:hidden}
#idscan .res div{display:flex;justify-content:space-between;gap:12px;padding:8px 11px;font-size:13.5px;
  border-bottom:1px solid var(--g-100,#eef1f5)}
#idscan .res div:last-child{border-bottom:0}
#idscan .res span{color:var(--g-600,#5b6675)}
#idscan .res b{font-weight:600;text-align:right}
#idscan .chk{font-size:12px;margin-top:6px}
#idscan .chk.ok{color:var(--green-600,#1b7f4b)} #idscan .chk.no{color:var(--red-600,#b3261e)}
#idscan .btn{min-height:40px;padding:0 14px;border-radius:8px;border:1px solid var(--navy-900,#0d1b2a);
  background:var(--navy-900,#0d1b2a);color:#fff;font-size:13.5px;font-weight:600;cursor:pointer;
  font-family:inherit;display:inline-grid;place-items:center}
#idscan .btn.sec{background:var(--surface,#fff);color:var(--navy-900,#0d1b2a);border-color:var(--border-med,#c9d1db)}
#idscan .btn[disabled]{opacity:.5;cursor:not-allowed}`;
    document.head.appendChild(st);
  }

  /** เปิดหน้าต่าง คืนค่าที่อ่านได้เมื่อผู้กรอกกดใส่ค่า — ยกเลิกคืน null
      opt = { lang } */
  S.open = function (opt) {
    opt = opt || {};
    const lang = opt.lang || 'th';
    const t = k => L(TXT[k], lang);
    styles();

    let d = document.getElementById('idscan');
    if (!d) { d = document.createElement('dialog'); d.id = 'idscan'; document.body.appendChild(d); }
    d.innerHTML = `
      <div class="dh"><h3>${esc(t('title'))}</h3><p>${esc(t('sub'))}</p></div>
      <div class="db">
        <div class="stage"><video playsinline muted autoplay></video><div class="guide"><i>MRZ</i></div></div>
        <p class="pdpa">${esc(t('privacy'))}</p>
        <p class="msg"></p>
        <div class="out"></div>
      </div>
      <div class="df">
        <label class="btn sec" style="position:relative;overflow:hidden">
          <input type="file" accept="image/*" capture="environment"
                 style="position:absolute;inset:0;opacity:0;cursor:pointer">${esc(t('pick'))}</label>
        <button class="btn sec" data-close type="button">${esc(t('close'))}</button>
        <button class="btn" data-shoot type="button">${esc(t('shoot'))}</button>
      </div>`;

    const vid = d.querySelector('video');
    const msg = d.querySelector('.msg');
    const out = d.querySelector('.out');
    const shoot = d.querySelector('[data-shoot]');
    const pick = d.querySelector('input[type=file]');
    let stream = null, busy = false, found = null, shotCv = null;

    const say = (k, bad) => { msg.textContent = TXT[k] ? t(k) : String(k); msg.className = 'msg' + (bad ? ' bad' : ''); };

    function stop() {
      if (stream) { stream.getTracks().forEach(x => x.stop()); stream = null; }
      if (vid) vid.srcObject = null;
      wipe(shotCv); shotCv = null;
    }

    return new Promise(resolve => {
      const done = v => { stop(); d.close(); resolve(v || null); };
      d.querySelector('[data-close]').onclick = () => done(null);
      d.addEventListener('close', () => { stop(); }, { once: true });

      (async () => {
        say('starting');
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: { ideal: 'environment' }, width: { ideal: 1920 } }, audio: false });
          vid.srcObject = stream;
          say('');
        } catch (e) {
          // ไม่มีกล้องหรือไม่ให้สิทธิ์ — เอาปุ่มถ่ายรูปออกไปเลย ไม่ใช่ปล่อยปุ่มที่กดแล้วไม่เกิดอะไร
          say('nocam', true);
          shoot.style.display = 'none';
          d.querySelector('.stage').style.display = 'none';
        }
      })();

      async function run(src) {
        if (busy) return;
        busy = true; shoot.disabled = true; out.innerHTML = '';
        try {
          say('loading');
          await getWorker();
          found = await readImage(src, say);
          if (!found) { say('none', true); return; }
          const name = [found.given, found.surname].filter(Boolean).join(' ');
          const okAll = Object.values(found.checks || {}).every(Boolean);
          out.innerHTML = `<div class="res">
              ${name ? `<div><span>${esc(t('fName'))}</span><b>${esc(name)}</b></div>` : ''}
              ${found.dob ? `<div><span>${esc(t('fDob'))}</span><b>${esc(found.dob)}</b></div>` : ''}
              ${found.docNo ? `<div><span>${esc(t('fDoc'))}</span><b>${esc(found.docNo)}</b></div>` : ''}
            </div>
            <p class="chk ${okAll ? 'ok' : 'no'}">${esc(okAll ? t('checkOk') : t('checkNo'))}</p>
            <p class="chk">${esc(t('verify'))}</p>`;
          say('');
          if (stream) shoot.textContent = t('again');
          const use = document.createElement('button');
          use.type = 'button'; use.className = 'btn'; use.textContent = t('use');
          use.onclick = () => done({ name, dob: found.dob || '', docNo: found.docNo || '',
                                     sex: found.sex || '', nationality: found.nationality || '',
                                     expiry: found.expiry || '', kind: found.kind });
          d.querySelector('.df').appendChild(use);
        } catch (e) {
          say((e && e.message) || String(e), true);
        } finally {
          busy = false; shoot.disabled = !stream;
        }
      }

      shoot.onclick = () => {
        if (!stream) return;
        const cv = document.createElement('canvas');
        cv.width = vid.videoWidth; cv.height = vid.videoHeight;
        cv.getContext('2d').drawImage(vid, 0, 0);
        wipe(shotCv); shotCv = cv;
        run(cv);
      };

      pick.onchange = () => {
        const f = pick.files && pick.files[0];
        if (!f) return;
        const url = URL.createObjectURL(f);
        const img = new Image();
        img.onload = () => { run(img).then(() => URL.revokeObjectURL(url)); };
        img.onerror = () => { URL.revokeObjectURL(url); say('none', true); };
        img.src = url;
        pick.value = '';
      };

      d.showModal();
    });
  };

  /* เปิดไว้ให้ทดสอบตัวถอดค่าโดยไม่ต้องมีกล้อง */
  S.parseMRZ = parseMRZ;
  S.parseThaiId = parseThaiId;
  S.thaiIdOk = thaiIdOk;
  S.mrzCheck = mrzCheck;

  g.IDScan = S;
})(window);
