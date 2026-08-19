#!/usr/bin/env python3
# ============================================================
# make_blank.py — ทำ PDF ฟอร์มเปล่าจาก .docx ต้นฉบับ เก็บไว้ใน blank/
#
#   python3 tools/make_blank.py EFM          ทำใบเดียว
#   python3 tools/make_blank.py EFM BCK ECA  ทำหลายใบ
#   python3 tools/make_blank.py --all        ทำทุกใบที่ทะเบียนมี blank: ระบุไว้
#
# ── ทำไมต้องมีฟอร์มเปล่า ─────────────────────────────────────
# ฟอร์มที่ย้ายไปกรอกในระบบอื่น (เช่น EFM ไปทำใน d0507.361vision.org)
# ยังต้องเปิดดูหน้าตาเอกสารได้จากที่นี่ เพราะที่นี่คือทะเบียนเอกสารควบคุม
# ไม่งั้นคนต้องไปรื้อไฟล์ .docx เอง ซึ่งเปิดบนมือถือไม่ได้และไม่รู้ว่าฉบับไหนจริง
#
# ── ทำไมเก็บไฟล์ไว้ในรีโป ไม่ใช่ Drive ────────────────────────
# ฟอร์มเปล่าเปลี่ยนเมื่อออก Issue/Rev ใหม่เท่านั้น ไม่ได้เปลี่ยนบ่อย
# เก็บในรีโปแปลว่าเวอร์ชันของไฟล์เดินคู่กับทะเบียน ย้อนดูได้ว่าฉบับไหนหน้าตาอย่างไร
# และหน้าเว็บไม่ต้องพึ่งสิทธิ์การแชร์ของ Drive ซึ่งบัญชีนี้ถูกนโยบายปิดไว้บางส่วน
#
# ── วิธีแปลง ─────────────────────────────────────────────────
# เครื่องนี้ไม่มี LibreOffice จึงยืม Drive แปลงให้: อัปโหลด .docx แบบสั่งแปลง
# เป็น Google Doc แล้ว export เป็น PDF จากนั้นลบไฟล์ชั่วคราวทิ้ง
# ต้องเขียน metadata ทับด้วย ไม่งั้นชื่อเรื่องใน PDF จะเป็นชื่อไฟล์ชั่วคราว
# ซึ่งโผล่เป็นชื่อแท็บตอนเปิด และดูไม่ได้สำหรับเอกสารควบคุม
# ============================================================
import json, os, sys, urllib.request

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(HERE, 'tools'))
from gas_push import token, SSLCTX

DOCX_DIR = os.path.dirname(HERE)          # โฟลเดอร์ Manual revision
OUT = os.path.join(HERE, 'blank')
REG = os.path.join(HERE, 'forms_register.json')
GDOC = 'application/vnd.google-apps.document'
DOCX = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'


def api(url, tk, data=None, ctype=None, method=None):
    h = {'Authorization': 'Bearer ' + tk}
    if ctype:
        h['Content-Type'] = ctype
    req = urllib.request.Request(url, data=data, headers=h, method=method)
    return urllib.request.urlopen(req, context=SSLCTX, timeout=300)


def convert(path, tk):
    """.docx -> PDF ผ่าน Drive — คืนไบต์ของ PDF"""
    meta = json.dumps({'name': '_tmp_blank', 'mimeType': GDOC}).encode()
    body = (b'--x\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n' + meta
            + b'\r\n--x\r\nContent-Type: ' + DOCX.encode() + b'\r\n\r\n'
            + open(path, 'rb').read() + b'\r\n--x--')
    fid = json.load(api('https://www.googleapis.com/upload/drive/v3/files'
                        '?uploadType=multipart&fields=id', tk, body,
                        'multipart/related; boundary=x'))['id']
    try:
        return api('https://www.googleapis.com/drive/v3/files/%s/export'
                   '?mimeType=application/pdf' % fid, tk).read()
    finally:
        try:
            api('https://www.googleapis.com/drive/v3/files/' + fid, tk, method='DELETE')
        except Exception:
            print('   ⚠️ ลบไฟล์ชั่วคราวใน Drive ไม่สำเร็จ — ลบเองที่ _tmp_blank')


def stamp(pdf_path, f):
    """เขียน metadata ให้เป็นของเอกสารจริง ไม่ใช่ชื่อไฟล์ชั่วคราว"""
    from pypdf import PdfReader, PdfWriter
    w = PdfWriter(clone_from=pdf_path)
    w.add_metadata({
        '/Title': '%s %s (blank)' % (f['doc'], f.get('t') or f['abbr']),
        '/Subject': 'ISSUE NO. %s/REVISION NO. %s%s'
                    % (f.get('iss', '--'), f.get('rev', '--'),
                       ' · EFF ' + f['eff'] if f.get('eff') else ''),
        '/Author': 'D-0507 Flight Training Co., Ltd.',
        '/Keywords': '%s, blank form, controlled document' % f['abbr'],
    })
    with open(pdf_path, 'wb') as fh:
        w.write(fh)
    return len(PdfReader(pdf_path).pages)


def main(argv):
    if not argv:
        sys.exit(__doc__ or 'ใช้: make_blank.py <ABBR> [ABBR ...] | --all')
    reg = json.load(open(REG, encoding='utf-8'))
    by = {f['abbr']: f for f in reg['forms']}
    want = ([f['abbr'] for f in reg['forms'] if f.get('blank')]
            if argv[0] == '--all' else argv)

    os.makedirs(OUT, exist_ok=True)
    tk = token()
    bad = 0
    for a in want:
        f = by.get(a)
        if not f:
            print('🔴 %s ไม่มีในทะเบียน' % a); bad += 1; continue
        src = os.path.join(DOCX_DIR, f.get('docx') or '')
        if not f.get('docx') or not os.path.exists(src):
            print('🔴 %s ไม่มีไฟล์ต้นฉบับ %s' % (a, f.get('docx') or '(ไม่ระบุ)')); bad += 1; continue
        out = os.path.join(OUT, a + '.pdf')
        try:
            pdf = convert(src, tk)
            if pdf[:4] != b'%PDF':
                raise RuntimeError('ผลลัพธ์ไม่ใช่ PDF')
            open(out, 'wb').write(pdf)
            n = stamp(out, f)
            print('✅ %-9s %d หน้า · %.0f KB · blank/%s.pdf' % (a, n, len(pdf) / 1024, a))
            if f.get('blank') != 'blank/%s.pdf' % a:
                print('   ⚠️ ทะเบียนยังไม่ได้ตั้ง "blank": "blank/%s.pdf" — ใส่เองแล้วรัน build.py' % a)
        except Exception as e:
            print('🔴 %-9s %s' % (a, e)); bad += 1
    return 1 if bad else 0


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
