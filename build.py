#!/usr/bin/env python3
# ============================================================
# d0507-forms — build
#   src/{shell.css,door.html,student.html,staff.html} + forms_register.json
#     -> index.html            ประตูเข้า          (ไม่ต้อง login)
#     -> student/index.html    ฝั่งนักเรียน        (ไม่ต้อง login)
#     -> staff/index.html      ฝั่งเจ้าหน้าที่      (ต้อง login)
#
# กติกา
#   · แก้หน้าเว็บที่ src/ เท่านั้น ห้ามแก้ไฟล์ที่ build แล้ว
#   · ไฟล์นี้เป็นตัวประกอบอย่างเดียว ไม่เก็บ HTML ไว้ข้างใน
#     (d0507-audit เคยเก็บ HTML ใน build.py แล้วมีปัญหา session อื่นเขียนทับ)
#   · ตรวจความถูกต้องหลัง build ให้ดูขนาด "ไฟล์ผลลัพธ์" ไม่ใช่ขนาดไฟล์นี้
# ============================================================
import os, json, re, sys

HERE = os.path.dirname(os.path.abspath(__file__))
SRC  = os.path.join(HERE, 'src')

# ── Firebase: โปรเจกต์เดียวกับ d0507-audit ──────────────────
# origin เดียวกัน (tistou35.github.io) + apiKey เดียวกัน => login ครั้งเดียวใช้ได้ทั้งสอง repo
FIREBASE_CONFIG = '''{
  apiKey: "AIzaSyB_O4vBBOa7-YtGJyPnZ5NLPtQZjWMSJnQ",
  authDomain: "d0507-audit.firebaseapp.com",
  projectId: "d0507-audit",
  storageBucket: "d0507-audit.firebasestorage.app",
  messagingSenderId: "880880454045",
  appId: "1:880880454045:web:a8fe249ca18f1a7a20c774"
}'''

# ฟิลด์ที่ห้ามหลุดไปหน้าสาธารณะเด็ดขาด
PUBLIC_FORBIDDEN = ('code', 'lef', 'st', 'note', 'docx', 'own', 'iss', 'rev')
# ฟิลด์ที่ฝั่งนักเรียนได้เห็น — kw เป็นคำค้นภาษาพูด ไม่ใช่ข้อมูลควบคุม จึงเปิดได้
PUBLIC_KEEP = ('doc', 'abbr', 't', 'th', 'sys', 'jot', 'assignTo', 'r', 'chain', 'kw')


def jsonjs(o):
    """dump เป็น JSON สำหรับฝังใน <script> — กัน '</' ปิดแท็กกลางคัน"""
    return json.dumps(o, ensure_ascii=False, separators=(',', ':')).replace('</', '<\\/')


def public_view(reg):
    """ตัดทะเบียนให้เหลือเฉพาะที่ฝั่งนักเรียนเห็นได้"""
    out = []
    for f in reg['forms']:
        if not f.get('public'):
            continue
        g = {k: f[k] for k in PUBLIC_KEEP if k in f}
        # เหลือเฉพาะคำอธิบายบทบาทของนักเรียน
        if 'r' in g:
            g['r'] = {'stu': g['r'].get('stu', '')}
        leak = [k for k in PUBLIC_FORBIDDEN if k in g]
        if leak:
            sys.exit('ข้อมูลภายในหลุดไปหน้าสาธารณะ: %s -> %s' % (f.get('doc'), leak))
        out.append(g)
    return {'systems': reg['systems'], 'forms': out}


def emit(src_name, outpath, subs):
    t = open(os.path.join(SRC, src_name), encoding='utf-8').read()
    for k, v in subs.items():
        t = t.replace(k, v)
    left = sorted(set(re.findall(r'@@[A-Z_]+@@', t)))
    if left:
        sys.exit('placeholder ยังเหลือใน %s: %s' % (src_name, left))
    d = os.path.dirname(outpath)
    if d:
        os.makedirs(d, exist_ok=True)
    open(outpath, 'w', encoding='utf-8').write(t)
    print('  built: %-28s %7d bytes' % (os.path.relpath(outpath, HERE), os.path.getsize(outpath)))


def main():
    reg = json.load(open(os.path.join(HERE, 'forms_register.json'), encoding='utf-8'))
    css = open(os.path.join(SRC, 'shell.css'), encoding='utf-8').read()
    pub = public_view(reg)

    forms = reg['forms']
    stats = {
        'forms':   len(forms),
        'lef':     reg['lefcount']['unique'],
        'public':  len(pub['forms']),
        'systems': len([k for k in reg['systems'] if k != 'here']),
    }

    print('register: %d ฟอร์ม · สาธารณะ %d · อยู่ใน LEF %d' %
          (stats['forms'], stats['public'], sum(1 for f in forms if f.get('lef'))))

    pages = [
        # (src,            outpath,                     base,   extra subs)
        ('door.html',    os.path.join(HERE, 'index.html'),                '',     {}),
        ('student.html', os.path.join(HERE, 'student', 'index.html'),     '../',  {'@@REGPUB@@': jsonjs(pub)}),
        ('staff.html',   os.path.join(HERE, 'staff',   'index.html'),     '../',  {'@@REG@@': jsonjs(reg),
                                                                                   '@@FBCFG@@': FIREBASE_CONFIG}),
        ('submit.html',  os.path.join(HERE, 'submit',  'index.html'),     '../',  {'@@REGPUB@@': jsonjs(pub),
                                                                                   '@@FBCFG@@': FIREBASE_CONFIG}),
    ]
    for src, out, base, extra in pages:
        subs = {'@@CSS@@': css.replace('@@BASE@@', base),
                '@@BASE@@': base,
                '@@STATS@@': jsonjs(stats)}
        subs.update(extra)
        emit(src, out, subs)

    # GitHub Pages: ไม่ต้องประมวลผลด้วย Jekyll
    open(os.path.join(HERE, '.nojekyll'), 'w').close()

    # ── ตรวจหลัง build ────────────────────────────────────
    errs = []
    idx = open(os.path.join(HERE, 'index.html'), encoding='utf-8').read()
    stu = open(os.path.join(HERE, 'student', 'index.html'), encoding='utf-8').read()
    stf = open(os.path.join(HERE, 'staff', 'index.html'), encoding='utf-8').read()
    sbm = open(os.path.join(HERE, 'submit', 'index.html'), encoding='utf-8').read()

    if 'firebase' in idx.lower():
        errs.append('index.html (ประตูเข้า) ไม่ควรมี Firebase')
    for code in [f['code'] for f in forms if f.get('code')]:
        if code and code in stu:
            errs.append('control code ภายในหลุดในหน้านักเรียน: ' + code)
            break
    if 'List of Effective Forms' in stu or 'ลิงก์ใน LEF' in stu:
        errs.append('สถานะ LEF หลุดในหน้านักเรียน')
    if 'firebase' not in stf.lower():
        errs.append('staff/index.html ต้องมี Firebase')
    for code in [f['code'] for f in forms if f.get('code')]:
        if code and code in sbm:
            errs.append('control code ภายในหลุดในหน้าส่งฟอร์ม: ' + code)
            break
    if errs:
        sys.exit('ตรวจไม่ผ่าน:\n  - ' + '\n  - '.join(errs))
    print('ตรวจผ่าน: ประตูเข้าไม่มี Firebase · หน้านักเรียนไม่มีข้อมูลควบคุมภายใน · หน้าเจ้าหน้าที่มี auth')


if __name__ == '__main__':
    main()
