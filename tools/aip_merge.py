#!/usr/bin/env python3
# ============================================================
# aip_merge.py — รวมแผนภูมิที่เป็นชุดเดียวกันให้เหลือไฟล์เดียว
#
#   python3 tools/aip_merge.py <manifest id>       ทำจริง
#   python3 tools/aip_merge.py <manifest id> -n    ลองดูเฉย ๆ ไม่แตะ Drive
#
# manifest id ได้จาก log ของ Apps Script ตอน aipStart/aipDaily ทำเสร็จ
#
# ── ทำไมต้องรวม ─────────────────────────────────────────────
# eAIP แยกแผนภูมิใบเดียวออกเป็นหลายไฟล์ตามหน้ากระดาษ เช่น
#   VFR ENTRY AND EXIT ... RWY 21L/21R
#   VFR ENTRY AND EXIT ... RWY 21L/21R (Verso)
#   VFR ENTRY AND EXIT ... RWY 21L/21R (Tabular description 1..3)
# ทั้งห้าไฟล์คือแผนภูมิใบเดียวกัน  356 ไฟล์ยุบเหลือ 185 ชุด
#
# ── ทำไมงานนี้ไม่ได้อยู่ใน Apps Script ────────────────────────
# Apps Script รวม PDF ไม่ได้ ไม่มีความสามารถนี้ในตัว จึงแบ่งกันทำ:
#   Apps Script  ดึงไฟล์ตามรอบ AIRAC เอง + เขียนใบส่งงาน (AIP_MANIFEST.json)
#   ไฟล์นี้      รวมหน้า + อัปโหลดกลับ + เขียนใบเสร็จ (AIP_MERGED.json)
#   aipTidy()    อ่านใบเสร็จแล้วทิ้งไฟล์หน้าเดี่ยวที่ถูกแทนแล้ว
#
# ไม่รันไฟล์นี้ก็ยังใช้งานได้ — ได้ไฟล์แยกหน้าเหมือนเดิม ไม่ใช่ของเสีย
# นี่คือเหตุผลที่ให้ Apps Script เป็นคนดึง ไม่ใช่ให้ไฟล์นี้ดึงเอง
#
# ── ข้อจำกัดสิทธิ์ที่กำหนดรูปร่างของโค้ดนี้ ──────────────────
# token ใน ~/.clasprc.json มีสโคป drive.file เท่านั้น แปลว่า
#   · อ่านเนื้อไฟล์ที่ Apps Script สร้าง "ไม่ได้"  → จึงไปโหลดจาก aip.caat.or.th ใหม่
#   · ลบไฟล์ของ Apps Script "ไม่ได้"             → จึงให้ aipTidy() เป็นคนลบ
#   · เขียนไฟล์ใหม่ลงโฟลเดอร์เดิม "ได้"          → อัปโหลดตัวที่รวมแล้วได้ตรงที่
# ============================================================
import io, json, os, ssl, sys, urllib.request, urllib.parse

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(HERE, 'tools'))
from gas_push import token, SSLCTX

try:
    from pypdf import PdfWriter, PdfReader
except ImportError:
    sys.exit('ต้องมี pypdf ก่อน:  pip3 install pypdf')

DRIVE = 'https://www.googleapis.com/drive/v3/files'
UPLOAD = 'https://www.googleapis.com/upload/drive/v3/files'


def get(url, tk=None, tries=3):
    h = {'User-Agent': 'D-0507 doc control'}
    if tk:
        h['Authorization'] = 'Bearer ' + tk
    last = None
    for _ in range(tries):
        try:
            req = urllib.request.Request(url, headers=h)
            return urllib.request.urlopen(req, context=SSLCTX, timeout=90).read()
        except Exception as e:
            last = e
    raise last


def manifest(fid):
    """อ่านใบส่งงานผ่านลิงก์สาธารณะ — Drive API อ่านไม่ได้เพราะสโคปเป็น drive.file"""
    raw = get('https://drive.google.com/uc?export=download&id=' + fid)
    if raw[:1] not in (b'{', b'['):
        sys.exit('ไฟล์ %s ไม่ใช่ JSON — ตรวจว่าแชร์แบบ "ทุกคนที่มีลิงก์" แล้วหรือยัง' % fid)
    return json.loads(raw.decode('utf-8'))


def upload(tk, name, parent, data):
    meta = json.dumps({'name': name, 'parents': [parent]})
    b = b'--x\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n' \
        + meta.encode() + b'\r\n--x\r\nContent-Type: application/pdf\r\n\r\n' \
        + data + b'\r\n--x--'
    req = urllib.request.Request(UPLOAD + '?uploadType=multipart&fields=id', data=b,
                                 headers={'Authorization': 'Bearer ' + tk,
                                          'Content-Type': 'multipart/related; boundary=x'})
    return json.load(urllib.request.urlopen(req, context=SSLCTX, timeout=180))['id']


def share(tk, fid):
    req = urllib.request.Request(
        '%s/%s/permissions' % (DRIVE, fid), method='POST',
        data=json.dumps({'role': 'reader', 'type': 'anyone'}).encode(),
        headers={'Authorization': 'Bearer ' + tk, 'Content-Type': 'application/json'})
    urllib.request.urlopen(req, context=SSLCTX, timeout=60)


def merge(parts):
    """ต่อหน้าตามลำดับที่ใบส่งงานจัดไว้ — ไม่จัดลำดับเองซ้ำ"""
    w = PdfWriter()
    for b in parts:
        for p in PdfReader(io.BytesIO(b)).pages:
            w.add_page(p)
    out = io.BytesIO()
    w.write(out)
    return out.getvalue()


def local_manifest(icaos):
    """สร้างใบส่งงานเองจาก eAIP โดยไม่แตะ Drive — ใช้ทดสอบก่อนรันจริง
    ตรรกะจัดชุดมาจาก aip_name.py ซึ่งต้องตรงกับ aipName_ ใน AipSync.gs"""
    from aip_charts import charts, cycle_date
    from aip_name import sets, AD
    code, date = cycle_date()
    data = []
    for a in (icaos or AD):
        for g in sets(a, charts(a, date)):
            data.append({'icao': a, 'sub': g['folder'], 'set': g['name'],
                         'folderId': None,
                         'files': [{'id': None, 'ref': r, 'title': t, 'url': u}
                                   for r, t, u, _ in g['pages']]})
    return {'issue': {'text': 'AIRAC ' + code, 'date': date}, 'rootId': None,
            'files': sum(len(s['files']) for s in data), 'sets': len(data),
            'data': data}


def main(argv):
    if not argv:
        sys.exit('ใช้:  aip_merge.py <manifest id> [-n]\n'
                 '     aip_merge.py --local [VTUQ ...]    ทดสอบจาก eAIP ตรง ๆ ไม่แตะ Drive')

    if argv[0] == '--local':
        import re
        mf = local_manifest([x for x in argv[1:] if re.match(r'^[A-Z]{4}$', x)])
        dry = True                    # โหมดนี้ไม่มี folderId ให้เขียนอยู่แล้ว
    else:
        fid, dry = argv[0], '-n' in argv
        mf = manifest(fid)
    iss = mf.get('issue', {})
    data = mf['data']
    multi = [s for s in data if len(s['files']) > 1]
    print('ฉบับ %s (%s) · %d ไฟล์ → %d ชุด · ต้องรวม %d ชุด%s'
          % (iss.get('text', '?'), iss.get('date', '?'), mf.get('files', 0),
             len(data), len(multi), '  [ลองดูเฉย ๆ]' if dry else ''))

    tk = None if dry else token()
    trash, merged, fail = [], 0, []

    for s in multi:
        title = s['set']
        try:
            parts = [get(f['url'], tries=3) if f.get('url') else None
                     for f in s['files']]
            # ใบส่งงานรุ่นแรกไม่ได้เก็บ url ไว้ — ดึงจาก eAIP ตามชื่อแทน
            if any(p is None for p in parts):
                raise RuntimeError('ใบส่งงานไม่มี url ของหน้า — อัปเดต AipSync.gs แล้วรันใหม่')
            for i, p in enumerate(parts):
                if p[:4] != b'%PDF':
                    raise RuntimeError('หน้า %s ไม่ใช่ PDF' % s['files'][i]['ref'])
            out = merge(parts)
            n = len(PdfReader(io.BytesIO(out)).pages)
            if n < len(parts):
                raise RuntimeError('รวมแล้วได้ %d หน้า น้อยกว่าไฟล์ต้นทาง %d' % (n, len(parts)))
            print('   %-52s %d ไฟล์ → %d หน้า  %.0f KB'
                  % (title[:52], len(parts), n, len(out) / 1024))
            if not dry:
                nid = upload(tk, title + '.pdf', s['folderId'], out)
                share(tk, nid)
                trash += [f['id'] for f in s['files']]
            merged += 1
        except Exception as e:
            fail.append('%s — %s' % (title, e))

    print('\nรวมสำเร็จ %d/%d ชุด' % (merged, len(multi)))
    for m in fail:
        print('  🔴 ' + m)

    if dry:
        print('\nยังไม่ได้แตะ Drive — เอา -n ออกเพื่อทำจริง')
        return 0 if not fail else 1
    if fail:
        # ไม่เขียนใบเสร็จเมื่อมีชุดที่รวมไม่ผ่าน — aipTidy จะได้ไม่ลบต้นฉบับทิ้ง
        print('\nไม่เขียนใบเสร็จ เพราะยังมีชุดที่รวมไม่ผ่าน — ต้นฉบับทุกใบยังอยู่ครบ')
        return 1

    root = mf.get('rootId')
    if not root:
        sys.exit('ใบส่งงานไม่มี rootId — อัปเดต AipSync.gs แล้วรัน aipStart ใหม่')
    rc = {'issueDate': iss.get('date'), 'issue': iss.get('text'),
          'merged': merged, 'trash': trash}
    upload(tk, 'AIP_MERGED.json', root, json.dumps(rc).encode())
    print('เขียนใบเสร็จแล้ว — ขั้นสุดท้าย: เรียก aipTidy() ใน Apps Script เพื่อทิ้ง %d ไฟล์เดิม'
          % len(trash))
    return 0


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
