#!/usr/bin/env python3
# ============================================================
# gas_push.py — ดึง/ส่งไฟล์ Apps Script ผ่าน API โดยตรง
#
#   python3 tools/gas_push.py pull            # ดูของที่อยู่บนคลาวด์ตอนนี้
#   python3 tools/gas_push.py push            # ส่ง gas/*.gs ขึ้นทั้งหมด
#   python3 tools/gas_push.py push Code ImportTemplate
#
# ทำไมไม่ใช้ clasp: ~/.clasprc.json ที่เครื่องนี้เป็นรูปแบบใหม่ที่ clasp 2.4.2
# อ่านไม่ออก แต่ refresh token ในนั้นยังใช้ได้ เลยเรียก API เองตรง ๆ
#
# ⚠️ push เขียนทับไฟล์บนคลาวด์ทั้งโปรเจกต์ — pull มาดูก่อนเสมอ
#    ถ้ามีใครแก้บนเว็บไว้แล้วยังไม่ได้ดึงลงมา จะหายทันที
# ============================================================
import json, os, sys, glob, ssl, urllib.request, urllib.parse

# Python จาก python.org ไม่ได้ผูกกับ keychain ของ macOS — ต้องชี้ CA เอง
try:
    import certifi
    SSLCTX = ssl.create_default_context(cafile=certifi.where())
except ImportError:
    SSLCTX = None

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
GAS = os.path.join(HERE, 'gas')
SCRIPT_ID = '1XqpRo5myjz5lYEkvXEbdgOONEJus2w5emTeSchMgKOFOEADu8L5Ia-rH'  # D-0507 Forms Exporter
RC = os.path.expanduser('~/.clasprc.json')


def token():
    """แลก refresh token เป็น access token ใหม่ทุกครั้ง ไม่พึ่ง expiry ที่เก็บไว้"""
    if not os.path.exists(RC):
        sys.exit('ไม่พบ ~/.clasprc.json — รัน clasp login ก่อน')
    t = json.load(open(RC))
    t = t.get('tokens', {}).get('default') or t.get('token') or t
    body = urllib.parse.urlencode({
        'client_id': t['client_id'], 'client_secret': t['client_secret'],
        'refresh_token': t['refresh_token'], 'grant_type': 'refresh_token',
    }).encode()
    r = urllib.request.urlopen('https://oauth2.googleapis.com/token', body, context=SSLCTX)
    return json.load(r)['access_token']


def api(method, path, payload=None):
    req = urllib.request.Request(
        'https://script.googleapis.com/v1/projects/' + path, method=method,
        data=json.dumps(payload).encode() if payload is not None else None,
        headers={'Authorization': 'Bearer ' + token(),
                 'Content-Type': 'application/json'})
    try:
        return json.load(urllib.request.urlopen(req, context=SSLCTX))
    except urllib.error.HTTPError as e:
        sys.exit('API %s: %s' % (e.code, e.read().decode()[:400]))


def pull():
    files = api('GET', SCRIPT_ID + '/content')['files']
    for f in sorted(files, key=lambda x: x['name']):
        print('%-20s %-12s %6d บรรทัด' % (f['name'], f['type'],
                                          f['source'].count('\n') + 1))
    return files


def push(only=None):
    remote = {f['name']: f for f in api('GET', SCRIPT_ID + '/content')['files']}

    files = []
    for p in sorted(glob.glob(os.path.join(GAS, '*.gs'))):
        name = os.path.basename(p)[:-3]
        if only and name not in only:
            # ไม่ได้เลือกไฟล์นี้ — ส่งของเดิมบนคลาวด์กลับไป ไม่ใช่ตัดทิ้ง
            if name in remote: files.append(remote[name])
            continue
        files.append({'name': name, 'type': 'SERVER_JS',
                      'source': open(p, encoding='utf-8').read()})

    mf = os.path.join(GAS, 'appsscript.json')
    if os.path.exists(mf):
        files.append({'name': 'appsscript', 'type': 'JSON',
                      'source': open(mf, encoding='utf-8').read()})
    elif 'appsscript' in remote:
        files.append(remote['appsscript'])

    # ไฟล์บนคลาวด์ที่ไม่มีในเครื่อง เก็บไว้ ไม่ลบให้โดยไม่บอก
    have = {f['name'] for f in files}
    for n, f in remote.items():
        if n not in have:
            files.append(f)
            print('  คงไว้ (ไม่มีในเครื่อง): ' + n)

    api('PUT', SCRIPT_ID + '/content', {'files': files})
    for f in files:
        print('%-20s %6d บรรทัด' % (f['name'], f['source'].count('\n') + 1))
    print('\nส่งขึ้นแล้ว %d ไฟล์' % len(files))


if __name__ == '__main__':
    cmd = sys.argv[1] if len(sys.argv) > 1 else 'pull'
    if cmd == 'pull': pull()
    elif cmd == 'push': push(sys.argv[2:] or None)
    else: sys.exit('ใช้: gas_push.py pull|push [ชื่อไฟล์...]')
