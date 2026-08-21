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
               'public', 'iss', 'rev', 'eff', 'hasDef')
FIELD_TYPES = {'text', 'textarea', 'date', 'time', 'number', 'email', 'tel', 'select',
               'multi', 'check', 'checklist', 'grade', 'scale', 'sign', 'static', 'table', 'file'}


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
                if tok in ('true', 'false', 'anyStarBelow', 'anyBelow', 'filled', 'score', 'has'):
                    continue
                if tok not in keys and tok not in {c2.get('k') for c2 in d.get('compute', [])}:
                    errs.append(f"{name}: เงื่อนไขอ้าง '{tok}' ที่ไม่ใช่ฟิลด์หรือค่าคำนวณ")
        out[c] = d
    return out, errs


CODE_RE = re.compile(r'\b[A-Z]{2}-[A-Z]{2,4}(?:-[A-Z]{2,3})?-\d{3}-[A-Z]\b')


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


def public_view(reg):
    out = []
    for f in reg['forms']:
        if not f.get('public'):
            continue
        g = {k: f[k] for k in PUBLIC_KEEP if k in f}
        if 'r' in g:
            g['r'] = {'stu': g['r'].get('stu', '')}
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
        return re.sub(r'(<a[^>]*data-nav="%s"[^>]*class="([^"]*)")' % re.escape(active),
                      lambda m: m.group(1).replace('class="%s"' % m.group(2),
                                                   'class="%s on"' % m.group(2)), h)
    def mark2(h):  # botnav มี class ตามหลัง data-nav
        return re.sub(r'<a data-nav="%s"' % re.escape(active), '<a class="on" data-nav="%s"' % active, h)
    return (mark(rail).replace('@@BASE@@', base),
            mark2(bot).replace('@@BASE@@', base),
            top.replace('@@BASE@@', base))


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
    ]
    VER = asset_versions()
    for src, out, base, active in pages:
        sub = {'@@REG@@': R, '@@REGPUB@@': P, '@@FBCFG@@': FB, '@@GASURL@@': GAS,
               '@@STATS@@': jsonjs(stats), '@@DEFS@@': jsonjs(defs),
               '@@PUBS@@': jsonjs(PUBS), '@@AIRAC@@': jsonjs(AIRAC)}
        n = emit(src, os.path.join(HERE, out), base, active, sub, VER)
        total += n
        print('  built: %-30s %7d bytes' % (out, n))

    # หน้าฟอร์มรายใบ — หนึ่งโฟลเดอร์ต่อฟอร์ม ได้ URL สะอาดบน static host
    # ฝังเฉพาะข้อมูลที่หน้านั้นใช้ (ฟอร์มสายงานเดียวกัน) ไม่ยัดทะเบียนเต็มทุกหน้า
    SLIM = ('abbr', 'doc', 't', 'th', 'sys', 'st', 'chain', 'public', 'r', 'jot', 'assignTo', 'hasDef')
    for f in reg['forms']:
        rel = [{k: x[k] for k in SLIM if k in x and k not in ('st',)}
               for x in reg['forms'] if x.get('chain') == f.get('chain') and x['abbr'] != f['abbr']][:6]
        mini = {'systems': reg['systems'], 'roles': reg['roles'], 'status': reg['status'],
                'forms': rel, 'lefcount': {'total': len(reg['forms'])}}
        # ฝังเฉพาะฟิลด์ที่เปิดสาธารณะได้ — code / lef / st / note / docx มาจาก Firestore ตอน login
        # guide/blank เปิดสาธารณะได้ — เป็นคำอธิบายว่าฟอร์มครอบคลุมอะไรและฟอร์มเปล่าหน้าตาไหน
        # ต่างจาก note ที่เป็นบันทึกภายใน (มาจาก Firestore ตอน login เท่านั้น)
        fpub = {k: f[k] for k in ('abbr','doc','t','th','sys','chain','public','r','with',
                                  'assignTo','iss','rev','eff','jot','hasDef',
                                  'guide','blank') if k in f}
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
