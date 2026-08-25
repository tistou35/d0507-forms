#!/usr/bin/env python3
# ============================================================
# make_edit_doc.py — ทำ "ต้นฉบับที่แก้ไขได้" บน Google Docs
#                    ให้เช็กลิสต์ในหน้าเช็กลิสต์และเอกสารเผยแพร่
#
#   python3 tools/make_edit_doc.py PCK VAC SAC SSC
#   python3 tools/make_edit_doc.py --ops        ทุกใบในแท็บที่ไม่ใช่เครื่องบิน
#   python3 tools/make_edit_doc.py --check      ดูว่าใบไหนยังไม่มีต้นฉบับ
#
# ── ทำไม ─────────────────────────────────────────────────────
# เช็กลิสต์ของเครื่องบิน (NPC / EPC) มีปุ่ม "แก้ต้นฉบับ ✎" ให้เจ้าหน้าที่กดเข้าไป
# แก้บน Google Docs ได้ทันที ส่วนเช็กลิสต์ปฏิบัติการ — บรีฟ ซ่อมบำรุง ตรวจสอบ —
# มีแต่ PDF ให้เปิดอ่าน ใครจะแก้ต้องไปหาไฟล์ .docx เอง ซึ่งคนที่ไม่ได้ถือรีโป
# ทำไม่ได้เลย ทั้งที่เป็นเอกสารที่แก้บ่อยกว่าเช็กลิสต์เครื่องบินเสียอีก
#
# ── สิ่งที่ทำ ────────────────────────────────────────────────
# อัปโหลด .docx ต้นฉบับขึ้น Drive แบบสั่งแปลงเป็น Google Doc แล้ว "เก็บไว้"
# (ต่างจาก make_blank.py ที่แปลงเสร็จแล้วลบทิ้ง เพราะต้องการแค่ PDF)
# จากนั้นเขียน id ลง publications.json ช่อง edit — หน้าเว็บอ่านช่องนั้นเอง
#
# ⚠️ แก้บน Google Docs แล้ว .docx ในรีโปจะไม่ตามไปด้วยเอง
#    ตามกฎของโครงการ ".docx คือฉบับจริง" — แก้เสร็จต้องดาวน์โหลดกลับมาทับ
#    แล้วเลื่อนตัวอักษรท้ายเลขกำกับ และทำ PDF ใหม่ด้วย make_blank.py
# ============================================================
import json
import urllib.parse
import os
import sys
import urllib.request

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(HERE, 'tools'))
from gas_push import token, SSLCTX  # noqa: E402

SRC_DIR = os.path.dirname(HERE)
PUBS = os.path.join(HERE, 'publications.json')
REG = os.path.join(HERE, 'forms_register.json')
GDOC = 'application/vnd.google-apps.document'
DOCX = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
FOLDER_NAME = 'D-0507 Checklist sources'


def api(url, tk, data=None, ctype=None, method=None):
    h = {'Authorization': 'Bearer ' + tk}
    if ctype:
        h['Content-Type'] = ctype
    req = urllib.request.Request(url, data=data, headers=h, method=method)
    return urllib.request.urlopen(req, context=SSLCTX, timeout=300)


def folder_id(tk):
    """โฟลเดอร์รวมต้นฉบับ — ไม่ให้ไปกองปนกับไฟล์อื่นในไดรฟ์"""
    q = ("mimeType='application/vnd.google-apps.folder' and trashed=false and name='%s'"
         % FOLDER_NAME)
    r = json.load(api('https://www.googleapis.com/drive/v3/files?q=%s&fields=files(id)'
                      % urllib.parse.quote(q), tk))
    if r['files']:
        return r['files'][0]['id']
    meta = json.dumps({'name': FOLDER_NAME,
                       'mimeType': 'application/vnd.google-apps.folder'}).encode()
    return json.load(api('https://www.googleapis.com/drive/v3/files?fields=id', tk,
                         meta, 'application/json'))['id']


def upload(path, name, parent, tk):
    """อัปโหลด .docx แล้วให้ Drive แปลงเป็น Google Doc — คืน id ที่เก็บไว้ใช้ต่อ"""
    meta = json.dumps({'name': name, 'mimeType': GDOC, 'parents': [parent]}).encode()
    body = (b'--x\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n' + meta
            + b'\r\n--x\r\nContent-Type: ' + DOCX.encode() + b'\r\n\r\n'
            + open(path, 'rb').read() + b'\r\n--x--')
    return json.load(api('https://www.googleapis.com/upload/drive/v3/files'
                         '?uploadType=multipart&fields=id', tk, body,
                         'multipart/related; boundary=x'))['id']


def docx_of(pub, reg):
    """หาไฟล์ .docx ต้นฉบับของรายการนี้

    publications.json ไม่ได้เก็บชื่อไฟล์ .docx ไว้ แต่ blank: ชี้ไปที่ blank/<ABBR>.pdf
    ซึ่งตัวย่อตรงกับทะเบียนฟอร์ม — ใช้ตรงนั้นเชื่อมกลับไปหา .docx
    """
    f = pub.get('file') or ''
    if not f.startswith('blank/'):
        return None, None
    abbr = os.path.basename(f)[:-4]
    row = next((x for x in reg['forms'] if x['abbr'] == abbr), None)
    if not row or not row.get('docx'):
        return abbr, None
    p = os.path.join(SRC_DIR, row['docx'])
    return abbr, (p if os.path.exists(p) else None)


def main():
    args = sys.argv[1:]
    pubs = json.load(open(PUBS, encoding='utf-8'))
    reg = json.load(open(REG, encoding='utf-8'))
    ac_cats = {k for k, c in pubs['cats'].items() if c.get('tab') == 'ac'}

    if '--ops' in args:
        targets = [p for p in pubs['pubs']
                   if p.get('cat') not in ac_cats and p.get('cat') != 'chart']
    elif '--check' in args or not args:
        print('%-10s %-9s %-42s %s' % ('หมวด', 'ตัวย่อ', 'ชื่อ', 'ต้นฉบับแก้ไขได้'))
        for p in pubs['pubs']:
            if p.get('cat') == 'chart':
                continue
            abbr, path = docx_of(p, reg)
            print('%-10s %-9s %-42s %s' % (
                p.get('cat'), abbr or '—', (p.get('t') or '')[:42],
                'มีแล้ว' if p.get('edit') else ('ทำได้' if path else 'ไม่มี .docx')))
        return
    else:
        want = {a.upper() for a in args}
        targets = [p for p in pubs['pubs'] if (docx_of(p, reg)[0] or '') in want]

    if not targets:
        sys.exit('ไม่มีรายการที่ตรง')

    tk = token()
    parent = folder_id(tk)
    done = 0
    for p in targets:
        abbr, path = docx_of(p, reg)
        if p.get('edit'):
            print('   %-9s มีต้นฉบับอยู่แล้ว — ข้าม' % abbr)
            continue
        if not path:
            print('   %-9s ไม่มีไฟล์ .docx ต้นฉบับ — ข้าม' % (abbr or p.get('t')))
            continue
        fid = upload(path, '%s — %s' % (abbr, p.get('t') or ''), parent, tk)
        p['edit'] = fid
        done += 1
        print('   ✅ %-9s %s' % (abbr, fid))

    if done:
        json.dump(pubs, open(PUBS, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
        print('\nเขียน publications.json แล้ว %d รายการ — รัน python3 build.py ต่อ' % done)
    else:
        print('\nไม่มีอะไรต้องทำ')


if __name__ == '__main__':
    main()
