#!/usr/bin/env python3
# ============================================================
# d0507-forms — build
#
#   src/*.html + src/_partials.html + forms_register.json + formdefs/*.json
#     -> index.html                 หน้าหลัก (ปรับตามสถานะ login)
#     -> all/                       คลังฟอร์มรวม
#     -> f/<ABBR>/                  หน้าฟอร์มรายใบ — สร้างทุกใบตอน build (แชร์ลิงก์ได้)
#     -> fill/                      หน้ากรอกฟอร์มตามแบบมาตรฐาน (formkit)
#     -> submit/                    หน้าส่งฟอร์มฝั่งนักเรียน (เลือกผู้รับ + อีเมลสำเนา)
#     -> queue/                     คิวงานของฉัน
#     -> admin/register/            ทะเบียน LEF (เจ้าหน้าที่)
#     -> admin/setup/               ตั้งค่าระบบ — บทบาท · ผู้รับฟอร์ม · อัปโหลดทะเบียน
#     -> admin/forms/               จัดการฟอร์ม — เวอร์ชัน · log · เปิด-ปิด
#     -> staff-login/               หน้าเข้าสู่ระบบ
#
# กติกา
#   · แก้หน้าเว็บที่ src/ · แก้สไตล์ที่ assets/app.css · แก้ตัวเรนเดอร์ที่ assets/formkit.js
#   · ไฟล์นี้เป็นตัวประกอบอย่างเดียว ไม่เก็บ HTML ไว้ข้างใน
#   · ตรวจหลัง build ให้ดูขนาด "ไฟล์ผลลัพธ์" ไม่ใช่ขนาดไฟล์นี้
# ============================================================
import os, json, re, sys, glob, shutil, hashlib

HERE = os.path.dirname(os.path.abspath(__file__))
SRC  = os.path.join(HERE, 'src')
DEFS = os.path.join(HERE, 'formdefs')

# ── Firebase ────────────────────────────────────────────────
# d0507-forms เป็น "คนละโปรเจกต์" กับ d0507-audit (ตัดสินใจ 01 AUG 2026)
# แปลว่า Auth และ Firestore แยกขาดจากกัน — ผู้ใช้ต้อง login แยกสองระบบ
# ใส่ค่าจริงที่ firebase/config.json แล้ว build ใหม่
CFG_PATH = os.path.join(HERE, 'firebase', 'config.json')


FB_KEYS = ('apiKey', 'authDomain', 'projectId', 'storageBucket', 'messagingSenderId', 'appId')


def firebase_config():
    raw = json.load(open(CFG_PATH, encoding='utf-8'))
    cfg = {k: raw[k] for k in FB_KEYS if k in raw}
    todo = [k for k, v in cfg.items() if 'REPLACE_ME' in str(v)]
    body = ',\n'.join('  %s: "%s"' % (k, v) for k, v in cfg.items())
    return '{\n' + body + '\n}', todo, raw.get('gasUrl', '')

PUBLIC_FORBIDDEN = ('code', 'lef', 'st', 'note', 'docx', 'own', 'jotDup')
PUBLIC_KEEP = ('doc', 'abbr', 't', 'th', 'sys', 'jot', 'assignTo', 'r', 'chain', 'kw',
               'public', 'iss', 'rev', 'eff', 'hasDef', 'kind', 'next', 'refs', 'flow')
FIELD_TYPES = {'text', 'textarea', 'date', 'time', 'number', 'email', 'tel', 'select',
               'multi', 'check', 'checklist', 'grade', 'scale', 'sign', 'static', 'table', 'file', 'riskmatrix'}


def jsonjs(o):
    return json.dumps(o, ensure_ascii=False, separators=(',', ':')).replace('</', '<\\/')


def load_defs():
    """อ่านนิยามฟอร์มและตรวจตามสเปกใน formdefs/_SCHEMA.md"""
    out, errs = {}, []
    for p in sorted(glob.glob(os.path.join(DEFS, '*.json'))):
        name = os.path.basename(p)
        if name.startswith('_'):
            continue
        d = json.load(open(p, encoding='utf-8'))
        c = d.get('code')
        if not c:
            errs.append(f'{name}: ไม่มี code'); continue
        parties = {x['k'] for x in d.get('parties', [])}
        keys = set()
        for s in d.get('sections', []):
            if s.get('party') and s['party'] not in parties:
                errs.append(f"{name}: section {s.get('k')} อ้าง party '{s['party']}' ที่ไม่มีใน parties")
            for f in s.get('fields', []):
                keys.add(f.get('k'))
                if f.get('type', 'text') not in FIELD_TYPES:
                    errs.append(f"{name}: ฟิลด์ {f.get('k')} ใช้ type '{f.get('type')}' ที่ยังไม่รองรับ")
        for r in d.get('route', []):
            if r.get('party') not in parties:
                errs.append(f"{name}: route ขั้น {r.get('step')} อ้าง party '{r.get('party')}' ที่ไม่มี")
        exprs = [s.get('showIf') for s in d.get('sections', [])] \
              + [g.get('when') for g in d.get('gates', [])] \
              + [f.get('showIf') for s in d.get('sections', []) for f in s.get('fields', [])] \
              + [f.get('reqIf') for s in d.get('sections', []) for f in s.get('fields', [])]
        for expr in exprs:
            # ตัดค่าคงที่ในเครื่องหมายคำพูดทิ้งก่อน มิฉะนั้น 'GO' จะถูกนับเป็นชื่อฟิลด์
            bare = re.sub(r"'[^']*'|\"[^\"]*\"", ' ', expr or '')
            for tok in re.findall(r'\b([a-zA-Z_]\w*)\b', bare):
                if tok in ('true', 'false', 'anyStarBelow', 'anyBelow', 'countBelow', 'filled', 'score', 'has'):
                    continue
                if tok not in keys and tok not in {c2.get('k') for c2 in d.get('compute', [])}:
                    errs.append(f"{name}: เงื่อนไขอ้าง '{tok}' ที่ไม่ใช่ฟิลด์หรือค่าคำนวณ")
        out[c] = d
    return out, errs


CODE_RE = re.compile(r'\b[A-Z]{2}-[A-Z]{2,4}(?:-[A-Z]{2,3})?-\d{3}-[A-Z]\b')


def check_statics(defs):
    """ข้อความคงที่ที่อ้างเลขกำกับหรือฉบับ ต้องตรงกับหัวของนิยามฟอร์มนั้น

    PWR บอกผู้โดยสารว่า "ข้อความที่ท่านกำลังยอมรับคือฉบับนี้" ก่อนให้กดยอมรับ
    ถ้าแก้เอกสารแล้วลืมแก้ข้อความนี้ หน้าเว็บจะอ้างฉบับที่ถูกแทนไปแล้ว
    ซึ่งแย่กว่าไม่บอกเลย เพราะเป็นการยืนยันสิ่งที่ไม่จริงให้คนนอกองค์กรอ่าน
    """
    for code, d in defs.items():
        want = {k: str(d.get(k) or '') for k in ('control', 'issue', 'rev', 'eff')}
        for sec in d.get('sections', []):
            for f in sec.get('fields', []):
                if f.get('type') != 'static':
                    continue
                txt = ' '.join(str(v) for v in (f.get('text') or {}).values())
                if want['control'] and want['control'] not in txt:
                    if re.search(r'\b[A-Z]{2}[/-][A-Z]{2,4}[/-]\d{3}-?[A-Z]?\b', txt):
                        sys.exit("%s: ข้อความ %s อ้างเลขกำกับที่ไม่ใช่ %s"
                                 % (code, f['k'], want['control']))
                if want['control'] and want['control'] in txt:
                    for lbl, key in (('Issue', 'issue'), ('Rev', 'rev')):
                        m = re.search(lbl + r'\s*(\d+)', txt)
                        if m and m.group(1) != want[key]:
                            sys.exit("%s: ข้อความ %s เขียน %s %s แต่นิยามฟอร์มเป็น %s"
                                     % (code, f['k'], lbl, m.group(1), want[key]))
                    if want['eff'] and want['eff'] not in txt:
                        sys.exit("%s: ข้อความ %s อ้างเลขกำกับแต่ไม่ได้ระบุวันมีผล %s"
                                 % (code, f['k'], want['eff']))


def check_blanks(reg):
    """ทุกใบต้องมีฟอร์มเปล่าให้ดาวน์โหลด ถ้าไม่มีต้องบอกว่าทำไม

    เงียบไว้แล้วคนเปิดหน้าฟอร์มจะไม่เจอปุ่ม แล้วไม่รู้ว่าเป็นเพราะยังไม่ได้ทำ
    หรือเพราะใบนี้ไม่มีฟอร์มเปล่า
    """
    miss = []
    for f in reg['forms']:
        if f.get('blank'):
            path = os.path.join(HERE, f['blank'])
            if not os.path.exists(path):
                sys.exit('%s: ทะเบียนชี้ %s แต่ไม่มีไฟล์ — รัน tools/make_blank.py %s'
                         % (f['doc'], f['blank'], f['abbr']))
            continue
        why = 'ไม่มี .docx ต้นฉบับ' if not f.get('docx') else 'มี .docx แต่ยังไม่ได้ทำ'
        miss.append('%s (%s)' % (f['abbr'], why))
    if miss:
        print('  ⚠️ ยังไม่มีฟอร์มเปล่า %d ใบ: %s' % (len(miss), ' · '.join(miss)))


def check_guide(reg):
    """guide ถูกฝังลงหน้าฟอร์มสาธารณะ แต่ code ไม่ใช่ข้อมูลสาธารณะ

    เลขกำกับยังเลื่อนตัวอักษรทุกครั้งที่ ISSUE หรือ REVISION เปลี่ยน
    เขียนไว้ใน guide จึงเน่าเงียบ ๆ ให้อ้างเลขเอกสารที่คงที่แทน
    """
    known = {f['abbr'] for f in reg['forms']}
    for f in reg['forms']:
        for g in (f.get('guide') or {}).get('items', []):
            bad = CODE_RE.findall(' '.join(str(v) for v in g.values()))
            if bad:
                sys.exit('guide ของ %s อ้างเลขกำกับ %s — ให้ใช้เลขเอกสารแทน'
                         % (f['abbr'], bad))
            if g.get('fa') and g['fa'] not in known:
                sys.exit('guide ของ %s ชี้ไปฟอร์ม %s ที่ไม่มีในทะเบียน'
                         % (f['abbr'], g['fa']))


def check_status(reg, defs):
    """สถานะในทะเบียนต้องตรงกับของจริง

    'noform' แปลว่ายังไม่มีฟอร์มออนไลน์ ถ้ามีนิยามฟอร์มแล้วก็ไม่จริงอีกต่อไป
    สถานะที่ค้างอยู่จะทำให้หน้าเว็บบอกผู้ใช้ผิดว่าใบนี้ยังกรอกออนไลน์ไม่ได้
    เคยเกิดกับ PCR-TKI และ RTR มาแล้วทั้งคู่ — ตรวจให้ดังตั้งแต่ build
    """
    for f in reg['forms']:
        if f.get('kind') == 'ref':
            if f['abbr'] in defs:
                sys.exit("%s: เป็นเอกสารอ้างอิงแต่มี formdefs/%s.json — "
                         "เลือกอย่างใดอย่างหนึ่ง" % (f['doc'], f['abbr']))
            if not f.get('blank'):
                sys.exit("%s: เป็นเอกสารอ้างอิงแต่ไม่มี blank: ให้เปิดอ่าน "
                         "— หน้าเว็บจะไม่มีอะไรให้กดเลย" % f['doc'])
            continue
        if f.get('st') == 'noform' and f['abbr'] in defs:
            sys.exit("%s: สถานะเป็น 'noform' แต่มี formdefs/%s.json แล้ว "
                     "— แก้สถานะในทะเบียน" % (f['doc'], f['abbr']))
        if f.get('st') == 'ok' and f.get('sys') == 'here' \
                and f['abbr'] not in defs and not f.get('jot'):
            sys.exit("%s: สถานะเป็น 'ok' แต่ไม่มีทั้งนิยามฟอร์มและลิงก์ Jotform "
                     "— กรอกที่ไหนไม่ได้เลย" % f['doc'])


# บทบาทที่ "อยู่นอกองค์กร ณ ตอนที่กรอก" — นักเรียน ผู้โดยสาร ผู้สมัครเป็นครู
# หน้าที่ของ ops/mgt ไม่เคยออกหน้าสาธารณะ เพราะเขียนถึงสายอนุมัติภายใน
PUBLIC_ROLES = ('stu', 'ins')


def public_view(reg):
    out = []
    for f in reg['forms']:
        if not f.get('public'):
            continue
        g = {k: f[k] for k in PUBLIC_KEEP if k in f}
        if 'r' in g:
            # เดิมบังคับเป็น {'stu': r.get('stu','')} ใบที่ไม่มีหน้าที่ฝั่งนักเรียน
            # (DRC · EFM) จึงได้สตริงว่าง แล้วไปโผล่เป็นการ์ดที่ไม่บอกว่าคนนอก
            # จะกดไปทำอะไร
            who = next((r for r in PUBLIC_ROLES if str(g['r'].get(r, '')).strip()), None)
            if not who:
                sys.exit(
                    "%s: public: true แต่ไม่มีหน้าที่ของ %s สักบทบาท — คนนอกจะเห็น"
                    "การ์ดเปล่า ๆ ใส่หน้าที่ให้บทบาทใดบทบาทหนึ่ง หรือตั้ง public: false"
                    % (f.get('doc') or f.get('abbr'), ' / '.join(PUBLIC_ROLES)))
            g['r'] = {who: g['r'][who]}
        leak = [k for k in PUBLIC_FORBIDDEN if k in g]
        if leak:
            sys.exit('ข้อมูลภายในหลุดไปหน้าสาธารณะ: %s -> %s' % (f.get('doc'), leak))
        out.append(g)
    return {'systems': reg['systems'], 'forms': out, 'roles': reg['roles'],
            'status': reg['status'], 'lefcount': {'total': len(reg['forms'])}}


def partials(active, base):
    """ดึง rail / botnav / topbar จาก _partials.html แล้วตั้ง active"""
    src = open(os.path.join(SRC, '_partials.html'), encoding='utf-8').read()
    def block(tag):
        m = re.search(r'<!-- ===== %s ===== -->(.*?)(?=<!-- =====|\Z)' % tag, src, re.S)
        return m.group(1).strip()
    rail, bot, top = block('RAIL'), block('BOTNAV'), block('TOPBAR')
    def mark(h):
        # rail เขียน class ไว้ก่อน data-nav เสมอ — รูปแบบเดิมมองหา class ที่ตามหลัง
        # จึงไม่เคยเข้าคู่กับอะไรเลย เมนูฝั่งซ้ายเลยไม่เคยไฮไลต์หน้าที่เปิดอยู่
        return re.sub(r'<a class="([^"]*)" data-nav="%s"' % re.escape(active),
                      lambda m: '<a class="%s on" data-nav="%s"' % (m.group(1), active), h)
    def mark2(h):  # botnav มี class ตามหลัง data-nav
        return re.sub(r'<a data-nav="%s"' % re.escape(active), '<a class="on" data-nav="%s"' % active, h)
    return (mark(rail).replace('@@BASE@@', base),
            mark2(bot).replace('@@BASE@@', base),
            top.replace('@@BASE@@', base))


def write_sw(ver, base):
    """สร้าง sw.js พร้อมรายชื่อไฟล์ที่ต้องแคช — ต้องสร้างตอน build เท่านั้น

    ชื่อไฟล์ asset ติด ?v=<hash> ทุกตัว รายชื่อจึงเปลี่ยนทุกครั้งที่แก้โค้ด
    เขียน sw.js ด้วยมือแล้วจะแคชของเก่าค้างไว้โดยไม่มีใครรู้ — ผู้ใช้ที่เคย
    เปิดหน้าไว้จะได้ตัวเรนเดอร์เก่าคู่กับนิยามฟอร์มใหม่ตลอดไป

    ชื่อแคชผูกกับ hash รวม เปลี่ยนโค้ดเมื่อไรแคชเก่าถูกลบทิ้งทั้งชุด
    """
    shell = ['fill/', 'cl/', 'pubs/', 'all/', '']
    assets = ['app.css', 'app.js', 'formkit.js']
    files = [base + p for p in shell] + \
            [base + 'assets/' + a + '?v=' + ver[a] for a in assets if a in ver]
    stamp = hashlib.sha1(('|'.join(files)).encode()).hexdigest()[:10]
    js = """/* สร้างโดย build.py — อย่าแก้ไฟล์นี้เอง แก้ที่ write_sw() ใน build.py

   ทำไมต้องมี: นักบินเปิดใบทดสอบการบินตอนอยู่บนเครื่อง ไม่มีเน็ต
   ถ้าไม่แคชหน้าไว้ เปิดไม่ขึ้นเลย ไม่ใช่แค่ส่งไม่ได้

   หน้า HTML ใช้เครือข่ายก่อนแล้วค่อยตกมาที่แคช — จะได้ไม่ค้างรุ่นเก่าเมื่อออนไลน์
   asset ใช้แคชก่อนเพราะติด ?v= อยู่แล้ว เปลี่ยนเนื้อไฟล์เมื่อไร URL เปลี่ยนตาม */
const CACHE = 'd0507-%s';
const FILES = %s;

self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES).catch(() => {})));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks =>
    Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))
  ).then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET') return;
  const url = new URL(r.url);
  if (url.origin !== location.origin) return;      // firebase/gstatic จัดการเอง

  const isDoc = r.mode === 'navigate' || (r.headers.get('accept') || '').includes('text/html');
  if (isDoc) {
    e.respondWith(
      fetch(r).then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(r, copy));
        return res;
      }).catch(() => caches.match(r).then(m => m
        // ไม่มีตัวตรงกับ query — /fill/?c=FTR ที่ยังไม่เคยเปิดต้องเปิดได้เหมือนกัน
        // ตัวหน้าเป็นไฟล์เดียวกันทุกใบ อ่าน ?c= จาก location เอง
        || caches.match(r, { ignoreSearch: true })))
    );
    return;
  }
  e.respondWith(caches.match(r).then(m => m || fetch(r).then(res => {
    if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(r, copy)); }
    return res;
  })));
});
""" % (stamp, json.dumps(files, ensure_ascii=False, indent=2))
    path = os.path.join(HERE, 'sw.js')
    with open(path, 'w', encoding='utf-8') as fh:
        fh.write(js)
    return len(js)


def asset_versions():
    """?v=<hash ของเนื้อไฟล์> ต่อท้าย asset ทุกตัว

    GitHub Pages แคช .js/.css ไว้ ถ้าไม่ติดเลขกำกับ ผู้ใช้จะได้ตัวเรนเดอร์เก่า
    มาคู่กับนิยามฟอร์มใหม่ — ฟอร์มจะแสดงผิดโดยไม่มีอะไรฟ้อง
    """
    out = {}
    for name in os.listdir(os.path.join(HERE, 'assets')):
        p = os.path.join(HERE, 'assets', name)
        if os.path.isfile(p):
            out[name] = hashlib.sha1(open(p, 'rb').read()).hexdigest()[:8]
    return out


def emit(src_name, outpath, base, active, subs, ver=None):
    t = open(os.path.join(SRC, src_name), encoding='utf-8').read()
    rail, bot, top = partials(active, base)
    t = t.replace('@@RAIL@@', rail).replace('@@BOTNAV@@', bot).replace('@@TOPBAR@@', top)
    for k, v in subs.items():
        t = t.replace(k, v)
    t = t.replace('@@BASE@@', base)
    for name, h in (ver or {}).items():
        t = t.replace('assets/%s"' % name, 'assets/%s?v=%s"' % (name, h))
    left = sorted(set(re.findall(r'@@[A-Z_]+@@', t)))
    if left:
        sys.exit('placeholder ยังเหลือใน %s: %s' % (src_name, left))
    d = os.path.dirname(outpath)
    if d:
        os.makedirs(d, exist_ok=True)
    open(outpath, 'w', encoding='utf-8').write(t)
    return os.path.getsize(outpath)


def main():
    reg = json.load(open(os.path.join(HERE, 'forms_register.json'), encoding='utf-8'))
    defs, errs = load_defs()
    if errs:
        sys.exit('นิยามฟอร์มไม่ผ่านการตรวจ:\n  - ' + '\n  - '.join(errs))
    known = {f['abbr'] for f in reg['forms']}
    for c in defs:
        if c not in known:
            sys.exit("formdefs/%s.json: code '%s' ไม่มีใน forms_register.json" % (c, c))

    # ฟอร์มไหนมีนิยามแล้ว — ใช้ตัดสินว่าปุ่มพาไปหน้ากรอกหรือระบบเดิม
    for f in reg['forms']:
        f['hasDef'] = f['abbr'] in defs

    # ทะเบียนเช็กลิสต์และเอกสารเผยแพร่ — คนละชุดกับฟอร์ม
    pubs_path = os.path.join(HERE, 'publications.json')
    PUBS = json.load(open(pubs_path, encoding='utf-8')) if os.path.exists(pubs_path) else {'pubs': []}
    PUBS = {k: v for k, v in PUBS.items() if not k.startswith('_')}
    sys.path.insert(0, os.path.join(HERE, 'tools'))
    from airac import table as airac_table
    AIRAC = airac_table(10)

    check_guide(reg)
    check_blanks(reg)
    check_statics(defs)
    check_status(reg, defs)
    pub = public_view(reg)
    # ⚠️ ทุกหน้าที่ host แบบสาธารณะฝังได้เฉพาะ pub — ทะเบียนเต็มอยู่ Firestore เท่านั้น
    FB, todo, GAS = firebase_config()
    R, P = jsonjs(pub), jsonjs(pub)
    stats = {'forms': len(reg['forms']), 'lef': reg['lefcount']['unique'],
             'public': len(pub['forms']), 'systems': len([k for k in reg['systems'] if k != 'here']),
             'defs': len(defs)}

    print('register: %d ฟอร์ม · สาธารณะ %d · มีนิยามฟอร์มแล้ว %d' %
          (stats['forms'], stats['public'], stats['defs']))
    if not GAS:
        print('  หมายเหตุ: ยังไม่ได้ใส่ gasUrl — การส่งออกไป Drive/Sheet จะยังไม่ทำงาน')
    if todo:
        print('\n  ⚠️  firebase/config.json ยังไม่ได้ใส่ค่าจริง: %s' % ', '.join(todo))
        print('     เว็บจะทำงานเฉพาะส่วนสาธารณะ — login / คิวงาน / ส่งฟอร์ม จะยังใช้ไม่ได้')
        print('     สร้างโปรเจกต์ใหม่แล้วคัดลอก config มาวาง จากนั้น build ใหม่\n')

    # ลบผลลัพธ์เดิมที่ build ไม่ได้ผลิตแล้ว กันไฟล์ตกค้างซึ่งอาจมีข้อมูลรุ่นเก่า
    for stale in ('f', 'staff', 'student'):
        p = os.path.join(HERE, stale)
        if os.path.isdir(p):
            shutil.rmtree(p)

    total = 0
    pages = [
        ('home.html',        'index.html',                     '',      'home'),
        ('all.html',         'all/index.html',                 '../',   'all'),
        ('queue.html',       'queue/index.html',               '../',   'queue'),
        ('register.html',    'admin/register/index.html',      '../../', 'register'),
        ('staff-login.html', 'staff-login/index.html',         '../',   ''),
        ('setup.html',       'admin/setup/index.html',          '../../', 'setup'),
        ('forms-admin.html', 'admin/forms/index.html',          '../../', 'fadmin'),
        ('fill.html',        'fill/index.html',                '../',   'all'),
        ('submit.html',      'submit/index.html',              '../',   'all'),
        ('approve.html',     'approve/index.html',             '../',   'queue'),
        ('approvals.html',   'admin/approvals/index.html',     '../../','aprv'),
        ('pubs.html',        'pubs/index.html',                '../',   'pubs'),
        ('checklists.html',  'admin/checklists/index.html',    '../../','pubs'),
        ('cl.html',          'cl/index.html',                  '../',   'pubs'),
        ('drc.html',         'admin/drc/index.html',           '../../','drc'),
    ]
    VER = asset_versions()
    # sw.js อยู่ราก path ในนั้นจึงอ้างอิงจากตำแหน่งตัวเอง ไม่ใช่ base ของแต่ละหน้า
    print('  built: %-30s %7d bytes' % ('sw.js', write_sw(VER, '')))
    for src, out, base, active in pages:
        sub = {'@@REG@@': R, '@@REGPUB@@': P, '@@FBCFG@@': FB, '@@GASURL@@': GAS,
               '@@STATS@@': jsonjs(stats), '@@DEFS@@': jsonjs(defs),
               '@@PUBS@@': jsonjs(PUBS), '@@AIRAC@@': jsonjs(AIRAC)}
        n = emit(src, os.path.join(HERE, out), base, active, sub, VER)
        total += n
        print('  built: %-30s %7d bytes' % (out, n))

    # หน้าฟอร์มรายใบ — หนึ่งโฟลเดอร์ต่อฟอร์ม ได้ URL สะอาดบน static host
    # ฝังเฉพาะข้อมูลที่หน้านั้นใช้ (ฟอร์มสายงานเดียวกัน) ไม่ยัดทะเบียนเต็มทุกหน้า
    SLIM = ('abbr', 'doc', 't', 'th', 'sys', 'st', 'chain', 'public', 'r', 'jot',
            'assignTo', 'hasDef', 'kind', 'flow')
    for f in reg['forms']:
        # ใบที่โยงกันตามลำดับการทำงาน อาจอยู่คนละสายงาน — EFM เป็นสาย QA
        # ส่วน PCR เป็นสาย IM แต่ต่อกันเป็นขั้นตอนเดียวกันของครูหนึ่งคน
        near = set(f.get('next') or []) | set(f.get('refs') or []) | {
            x['abbr'] for x in reg['forms'] if f['abbr'] in (x.get('next') or [])}
        rel = [{k: x[k] for k in SLIM if k in x and k not in ('st',)}
               for x in reg['forms']
               if x['abbr'] != f['abbr']
               and (x.get('chain') == f.get('chain') or x['abbr'] in near)][:8]
        mini = {'systems': reg['systems'], 'roles': reg['roles'], 'status': reg['status'],
                'forms': rel, 'lefcount': {'total': len(reg['forms'])}}
        # ฝังเฉพาะฟิลด์ที่เปิดสาธารณะได้ — code / lef / st / note / docx มาจาก Firestore ตอน login
        # guide/blank เปิดสาธารณะได้ — เป็นคำอธิบายว่าฟอร์มครอบคลุมอะไรและฟอร์มเปล่าหน้าตาไหน
        # ต่างจาก note ที่เป็นบันทึกภายใน (มาจาก Firestore ตอน login เท่านั้น)
        fpub = {k: f[k] for k in ('abbr','doc','t','th','sys','chain','public','r','with',
                                  'assignTo','iss','rev','eff','jot','hasDef',
                                  'guide','blank','kind','next','refs','flow') if k in f}
        # ใบที่อยู่ก่อนหน้าคำนวณจาก next ของใบอื่น จะได้ไม่ต้องกรอกสองที่ให้ขัดกันเอง
        fpub['prev'] = [x['abbr'] for x in reg['forms'] if f['abbr'] in (x.get('next') or [])]
        if not fpub['prev']:
            del fpub['prev']
        sub = {'@@REG@@': jsonjs(mini), '@@FBCFG@@': FB, '@@GASURL@@': GAS, '@@FORM@@': jsonjs(fpub),
               '@@FTITLE@@': (f.get('th') or f.get('t') or f['abbr']).replace('"', "'")}
        total += emit('form.html', os.path.join(HERE, 'f', f['abbr'], 'index.html'),
                      '../../', 'all', sub, VER)
    print('  built: %-30s %d หน้า' % ('f/<ABBR>/', len(reg['forms'])))

    # ทะเบียนเต็มสำหรับอัปโหลดขึ้น Firestore (registry/current) — ไม่ได้ถูก host
    with open(os.path.join(HERE, 'firebase', 'registry.json'), 'w', encoding='utf-8') as fh:
        json.dump({'forms': reg['forms'], 'status': reg['status'],
                   'lefcount': dict(reg['lefcount'], total=len(reg['forms']))},
                  fh, ensure_ascii=False, indent=1)
    print('  wrote: firebase/registry.json  (อัปโหลดด้วย seed.mjs)')

    open(os.path.join(HERE, '.nojekyll'), 'w').close()

    # ── ตรวจหลัง build ────────────────────────────────────
    rd = lambda p: open(os.path.join(HERE, p), encoding='utf-8').read()
    errs = []
    codes = [f['code'] for f in reg['forms'] if f.get('code')]
    notes = [f['note'][:24] for f in reg['forms'] if f.get('note')]
    for page in ('index.html', 'all/index.html', 'queue/index.html',
                 'admin/register/index.html', 'submit/index.html',
                 'f/FRAE/index.html', 'f/MTC/index.html'):
        s = rd(page)
        hit = [c for c in codes if c in s] + [n for n in notes if n in s]
        if hit:
            errs.append('ข้อมูลควบคุมถูกฝังในไฟล์ที่ host: %s -> %s' % (page, hit[:3]))
    if 'firebase' not in rd('index.html').lower():
        errs.append('index.html ต้องมี Firebase (ใช้ตัดสินว่า login แล้วหรือยัง)')
    if 'assets/app.css' not in rd('index.html'):
        errs.append('index.html ไม่ได้ลิงก์ assets/app.css')
    if not os.path.isfile(os.path.join(HERE, 'f', 'FRAE', 'index.html')):
        errs.append('ไม่ได้สร้างหน้าฟอร์มรายใบ')
    if errs:
        sys.exit('ตรวจไม่ผ่าน:\n  - ' + '\n  - '.join(errs))

    print('รวม %d ไฟล์ · %.0f KB' % (len(pages) + len(reg['forms']), total / 1024))
    print('ตรวจผ่าน: ทุกหน้าลิงก์ stylesheet ร่วม · หน้าฟอร์มรายใบครบ · ไม่มี placeholder ค้าง')


if __name__ == '__main__':
    main()
