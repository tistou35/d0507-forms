#!/usr/bin/env python3
# ============================================================
# share_edit_doc.py — ตั้งสิทธิ์ให้ต้นฉบับที่แก้ไขได้ "ใครมีลิงก์ก็เปิดอ่านได้
#                     แต่แก้ไม่ได้"
#
#   python3 tools/share_edit_doc.py --check    ดูสิทธิ์ปัจจุบันของทุกแฟ้ม
#   python3 tools/share_edit_doc.py            ตั้งเป็น anyone/reader ให้ครบ
#
# ── ทำไม ─────────────────────────────────────────────────────
# ปุ่ม "เปิด ↗" ในหน้าเช็กลิสต์ชี้ไปที่ต้นฉบับตัวเดียวกับปุ่ม "แก้ต้นฉบับ ✎"
# แบบอ่านอย่างเดียว จะได้ไม่ต้องทำ PDF แยกอีกฉบับที่วันหนึ่งจะไม่ตรงกับต้นฉบับ
# คนที่เปิดอ่านไม่ได้ล็อกอิน Google ของบริษัท แฟ้มจึงต้องเปิดให้ลิงก์อ่านได้
#
# ── สิ่งที่ตรวจเจอตอนทำ ──────────────────────────────────────
# ต้นฉบับของ C172M/N/S เดิมอยู่ใต้ _Quality Assurance (QA)/D0507/Forms
# ซึ่งตั้งไว้ที่ anyone = writer แปลว่าใครก็ตามที่ได้ลิงก์ไป
# "แก้เช็กลิสต์ห้องนักบินได้" โดยไม่ต้องล็อกอิน
#
# ลดสิทธิ์ที่ตัวไฟล์ไม่ได้ — Drive ห้ามตั้งต่ำกว่าที่สืบทอดจากโฟลเดอร์แม่
# และลดที่โฟลเดอร์ Forms ก็ไม่ได้ เพราะ token ของเรามีสโคป drive.file
# แตะได้เฉพาะไฟล์ที่แอปนี้สร้างเอง ส่วนโฟลเดอร์นั้นคนอื่นสร้างไว้
#
# ทางออกคือ "ย้ายออกมา" — ต้นฉบับทุกฉบับย้ายมาไว้ในโฟลเดอร์ของเราเอง
# (D-0507 Checklist sources) ซึ่งไม่ได้แชร์ แล้วตั้งสิทธิ์ทีละไฟล์เป็น reader
# ⚠️ โฟลเดอร์ Forms ยังเป็น anyone = writer อยู่ ใบฟอร์มและแผ่นบันทึกที่
#    ระบบออกไปเก็บไว้ในนั้นยังแก้ได้ด้วยลิงก์ — ต้องแก้เองในหน้าเว็บ Drive
# ============================================================
import json
import urllib.parse
import os
import sys
import urllib.error
import urllib.request

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(HERE, 'tools'))
from gas_push import token, SSLCTX  # noqa: E402

FOLDER_NAME = 'D-0507 Checklist sources'
PUBS = os.path.join(HERE, 'publications.json')
REG = os.path.join(HERE, 'forms_register.json')


def api(url, tk, data=None, method=None):
    h = {'Authorization': 'Bearer ' + tk}
    if data is not None:
        h['Content-Type'] = 'application/json'
    req = urllib.request.Request(url, data=data, headers=h, method=method)
    return urllib.request.urlopen(req, context=SSLCTX, timeout=120)


def sources():
    """ทุกแฟ้มที่หน้าเว็บชี้ไปว่าเป็นต้นฉบับ — ทั้งฝั่งเช็กลิสต์และฝั่งทะเบียนฟอร์ม"""
    out = []
    pubs = json.load(open(PUBS, encoding='utf-8'))
    for p in pubs['pubs']:
        if p.get('edit'):
            out.append((p.get('th') or p.get('t') or p['id'], p['edit']))
    reg = json.load(open(REG, encoding='utf-8'))
    for f in reg['forms']:
        if f.get('edit'):
            out.append((f['doc'], f['edit']))
    return out


def perms(fid, tk):
    r = json.load(api('https://www.googleapis.com/drive/v3/files/%s/permissions'
                      '?fields=permissions(id,type,role)' % fid, tk))
    return r['permissions']


def link_perm(ps):
    return next((p for p in ps if p['type'] == 'anyone'), None)


def set_reader(fid, tk):
    """ตั้งลิงก์ของ "แฟ้มนี้" ให้เป็นอ่านอย่างเดียว คืนสถานะก่อนหน้า"""
    cur = link_perm(perms(fid, tk))
    was = cur['role'] if cur else 'ไม่มี'
    if cur and cur['role'] == 'reader':
        return was, True
    if cur:
        # ลดสิทธิ์ของลิงก์เดิม ไม่ได้ลบทิ้งแล้วสร้างใหม่ — ลิงก์ที่แจกไปแล้วยังใช้ได้
        api('https://www.googleapis.com/drive/v3/files/%s/permissions/%s' % (fid, cur['id']),
            tk, json.dumps({'role': 'reader'}).encode(), 'PATCH')
    else:
        api('https://www.googleapis.com/drive/v3/files/%s/permissions' % fid, tk,
            json.dumps({'type': 'anyone', 'role': 'reader',
                        'allowFileDiscovery': False}).encode(), 'POST')
    after = link_perm(perms(fid, tk))
    return was, bool(after and after['role'] == 'reader')


def parents_of(fid, tk):
    return json.load(api('https://www.googleapis.com/drive/v3/files/%s?fields=parents'
                         % fid, tk)).get('parents', [])


def name_of(fid, tk):
    return json.load(api('https://www.googleapis.com/drive/v3/files/%s?fields=name'
                         % fid, tk))['name']


def dest_folder(tk):
    """โฟลเดอร์ของเราเอง — ไม่ได้แชร์ จึงไม่มีสิทธิ์สืบทอดมากดทับ"""
    q = ("mimeType='application/vnd.google-apps.folder' and trashed=false and name='%s'"
         % FOLDER_NAME)
    r = json.load(api('https://www.googleapis.com/drive/v3/files?q=%s&fields=files(id)'
                      % urllib.parse.quote(q), tk))
    if not r['files']:
        sys.exit('ไม่พบโฟลเดอร์ %s' % FOLDER_NAME)
    return r['files'][0]['id']


def move_in(fid, dest, tk):
    """ย้ายเข้าโฟลเดอร์ของเรา คืน True ถ้าย้ายจริง (อยู่แล้วคืน False)"""
    pars = parents_of(fid, tk)
    if pars == [dest]:
        return False
    api('https://www.googleapis.com/drive/v3/files/%s?addParents=%s&removeParents=%s'
        % (fid, dest, ','.join(pars)), tk, b'{}', 'PATCH')
    return True


def main():
    tk = token()
    check = '--check' in sys.argv
    dest = dest_folder(tk)
    moved = fixed = already = 0
    for name, fid in sources():
        cur = link_perm(perms(fid, tk))
        where = parents_of(fid, tk)
        outside = where != [dest]
        if cur and cur['role'] == 'reader' and not outside:
            already += 1
            print('   %-32s reader · อยู่ในโฟลเดอร์ต้นฉบับแล้ว' % name[:32])
            continue
        if check:
            print('   %-32s %-10s %s' % (
                name[:32], (cur['role'] if cur else 'ส่วนตัว'),
                'ต้องย้ายออกจากโฟลเดอร์ที่แชร์ไว้' if outside else 'ตั้ง reader ได้เลย'))
            continue
        try:
            if outside and move_in(fid, dest, tk):
                moved += 1
            was, ok = set_reader(fid, tk)
        except urllib.error.HTTPError as e:
            msg = json.loads(e.read().decode())['error']['message']
            print('   ⚠️ %-32s ทำไม่ได้ — %s' % (name[:32], msg[:70]))
            continue
        print('   %s %-32s %-10s → reader%s'
              % ('✅' if ok else '❌', name[:32], was, ' · ย้ายแล้ว' if outside else ''))
        fixed += 1
    print('\nถูกต้องอยู่แล้ว %d · ย้าย %d · ตั้งสิทธิ์ %d' % (already, moved, fixed))


if __name__ == '__main__':
    main()
