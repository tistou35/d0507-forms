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
# ต้นฉบับของ C172M/N/S ถูกตั้งไว้ที่ anyone = writer มาก่อนแล้ว
# แปลว่าใครก็ตามที่ได้ลิงก์ไป "แก้เช็กลิสต์ห้องนักบินได้" โดยไม่ต้องล็อกอิน
# ตัวนี้ลดลงมาเป็น reader — แก้ได้เฉพาะคนที่ถูกเพิ่มชื่อไว้เท่านั้น
# ============================================================
import json
import os
import sys
import urllib.request

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(HERE, 'tools'))
from gas_push import token, SSLCTX  # noqa: E402

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


def main():
    """ตั้งสิทธิ์ที่ "โฟลเดอร์" ไม่ใช่ที่ไฟล์

    Drive ไม่ยอมให้ตั้งสิทธิ์ของไฟล์ต่ำกว่าที่สืบทอดมาจากโฟลเดอร์แม่
    (403 Cannot modify a permission ... less than the inherited access)
    ต้นฉบับของ C172 ทุกใบอยู่ในโฟลเดอร์ของตัวเองที่ตั้งไว้ที่ anyone = writer
    จึงต้องลดที่โฟลเดอร์ ซึ่งแต่ละโฟลเดอร์มีไฟล์เดียวคือเอกสารนั้นเอง
    """
    tk = token()
    check = '--check' in sys.argv
    # รากของไดรฟ์ต้องไม่ถูกแตะเด็ดขาด — เปิดลิงก์ที่รากคือเปิดทั้งไดรฟ์ 976 แฟ้ม
    root = json.load(api('https://www.googleapis.com/drive/v3/files/root?fields=id', tk))['id']
    folders, loose = {}, []
    for name, fid in sources():
        pars = parents_of(fid, tk) or [None]
        # วางไว้ที่รากไดรฟ์ = ไม่มีโฟลเดอร์ให้ลด ตั้งที่ตัวไฟล์เองได้เลย
        # (ตั้งที่รากไม่ได้เด็ดขาด นั่นคือเปิดทั้งไดรฟ์)
        if pars == [root] or pars == [None]:
            loose.append((name, fid))
            continue
        for par in pars:
            if par != root:
                folders.setdefault(par, []).append(name)

    fixed = already = 0
    for par, names in sorted(folders.items(), key=lambda x: str(x[0])):
        if par is None:
            print('   ⚠️ %s — ไม่มีโฟลเดอร์แม่ ข้าม' % ', '.join(names))
            continue

        fname = name_of(par, tk)
        cur = link_perm(perms(par, tk))
        now = cur['role'] if cur else 'ไม่มีลิงก์สาธารณะ'
        if cur and cur['role'] == 'reader':
            already += 1
            print('   %-30s %-22s ถูกต้องแล้ว (%d ฉบับ)' % (fname[:30], now, len(names)))
            continue
        if check:
            print('   %-30s %-22s → ควรเป็น reader (%d ฉบับ)' % (fname[:30], now, len(names)))
            continue
        was, ok = set_reader(par, tk)
        print('   %s %-30s %-14s → reader (%d ฉบับ)'
              % ('✅' if ok else '❌', fname[:30], was, len(names)))
        fixed += 1

    for name, fid in loose:
        was, ok = set_reader(fid, tk)
        if was == 'reader':
            already += 1
            print('   %-30s reader                 ถูกต้องแล้ว (ตั้งที่ไฟล์)' % name[:30])
        else:
            print('   %s %-30s %-14s → reader (ตั้งที่ไฟล์)'
                  % ('✅' if ok else '❌', name[:30], was))
            fixed += 1
    print('\nถูกต้องอยู่แล้ว %d · แก้ไป %d' % (already, fixed))


if __name__ == '__main__':
    main()
