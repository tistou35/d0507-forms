#!/usr/bin/env python3
# ============================================================
# aip_pubs.py — เอาผลการดึงแผนภูมิมาลงทะเบียนเอกสารเผยแพร่
#
#   python3 tools/aip_pubs.py <manifest id>       เขียนลง publications.json
#   python3 tools/aip_pubs.py <manifest id> -n    ดูว่าจะเปลี่ยนอะไร ไม่เขียน
#
# manifest id ได้จาก log ของ Apps Script ตอนดึงเสร็จ (ตัวเดียวกับที่ aip_merge.py ใช้)
#
# ── ที่มา ────────────────────────────────────────────────────
# หน้าเว็บแท็บ "สนามบินและแผนภูมิ" แสดงหนึ่งแถวต่อหนึ่งสนามบิน
# ไม่ใช่หนึ่งแถวต่อหนึ่งแผนภูมิ — สิบสองสนามบินมี 185 ชุด ลงทีละใบก็อ่านไม่ไหว
# แต่ละแถวจึงลิงก์ไป "โฟลเดอร์" สองอัน: ผังสนามบิน กับ แผนภูมิปฏิบัติการ
#
# ── ทำไมลิงก์ไม่ตายเมื่อเปลี่ยนรอบ ────────────────────────────
# aipAdFolder_ เปลี่ยนแค่ "ชื่อ" โฟลเดอร์ทุกรอบ ไม่ได้สร้างใหม่ id จึงคงเดิม
# ไฟล์ข้างในถูกแทนด้วยของรอบใหม่ คนที่ bookmark ลิงก์ไว้จะได้ของปัจจุบันเสมอ
# นี่คือเหตุผลที่เลือกวิธี "ใช้โฟลเดอร์เดิม เปลี่ยนชื่อ" แทนการสร้างใหม่แล้วลบเก่า
#
# ── สิ่งที่ไฟล์นี้ตั้งใจไม่ทำ ──────────────────────────────────
# ไม่ลบสนามบินที่หายไปจาก manifest และไม่แตะรายการหมวดอื่น
# ทะเบียนเป็นเอกสารควบคุม การหายไปของรายการต้องเป็นการตัดสินใจของคน ไม่ใช่ผลข้างเคียง
# ============================================================
import json, os, re, sys, urllib.request

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(HERE, 'tools'))
from aip_merge import manifest

PUBS = os.path.join(HERE, 'publications.json')


def from_drive(root_id):
    """สรุปรายสนามบินจากโฟลเดอร์จริงใน Drive โดยไม่ผ่านใบส่งงาน

    ใช้เมื่อใบส่งงานยังไม่พร้อม — ของจริงในโฟลเดอร์คือสิ่งที่คนจะเปิดใช้
    นับ "ชุด" ไม่ใช่ "ไฟล์" เพราะหน้าเว็บบอกจำนวนชุด (หลายหน้าคือใบเดียว)
    """
    import urllib.parse
    from gas_push import token, SSLCTX      # Python จาก python.org ต้องชี้ CA เอง
    tk = token()

    def q(query):
        u = ('https://www.googleapis.com/drive/v3/files?q=%s'
             '&fields=files(id,name,mimeType)&pageSize=1000'
             % urllib.parse.quote(query))
        req = urllib.request.Request(u, headers={'Authorization': 'Bearer ' + tk})
        return json.load(urllib.request.urlopen(req, context=SSLCTX, timeout=60))['files']

    FOLDER = 'application/vnd.google-apps.folder'
    ads, eff = {}, ''
    for ad in q("'%s' in parents and mimeType='%s' and trashed=false" % (root_id, FOLDER)):
        parts = ad['name'].split(' ', 1)
        icao = parts[0]
        if len(icao) != 4 or not icao.isalpha():
            continue
        if len(parts) > 1 and not eff:
            eff = parts[1]
        a = {'icao': icao, 'ap': '', 'op': '', 'nap': 0, 'nop': 0}
        for sub in q("'%s' in parents and mimeType='%s' and trashed=false" % (ad['id'], FOLDER)):
            files = q("'%s' in parents and trashed=false" % sub['id'])
            # ชื่อไฟล์คือ "<ชื่อชุด> (AD 2-XXXX-n-m).pdf" — ตัดเลขหน้าออกแล้วนับชุด
            names = {re.sub(r'\s*\(AD\s+2-[A-Z]{4}-[\d-]+\)\.pdf$', '', f['name'], flags=re.I)
                     for f in files}
            if sub['name'] == 'Airport chart':
                a['ap'], a['nap'] = sub['id'], len(names)
            else:
                a['op'], a['nop'] = sub['id'], len(names)
        ads[icao] = a
    return ads, eff


def main(argv):
    if not argv:
        sys.exit('ใช้: aip_pubs.py <manifest id> [-n]\n'
                 '     aip_pubs.py --drive <root folder id> [-n]   อ่านจากโฟลเดอร์ตรง ๆ')
    dry = '-n' in argv

    if argv[0] == '--drive':
        ads, eff_txt = from_drive(argv[1])
        MON = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC']
        m = re.match(r'(\d{1,2})\s+([A-Z]{3})\s+(\d{4})', eff_txt or '')
        eff_iso = ('%s-%02d-%02d' % (m.group(3), MON.index(m.group(2).upper()) + 1,
                                     int(m.group(1)))) if m else ''
        mf = {'issue': {'date': eff_iso, 'text': eff_txt}, 'ads': list(ads.values())}
    else:
        mf = manifest(argv[0])
    ads = {a['icao']: a for a in mf.get('ads', [])}
    if not ads:
        sys.exit('ใบส่งงานไม่มีส่วน ads — อัปเดต AipSync.gs แล้วรัน aipStart ใหม่')

    iss = mf.get('issue', {})
    eff = iss.get('date', '')
    cyc = iss.get('cycle') or ''
    if not cyc:
        # ใบส่งงานเก่าไม่มีรหัสรอบ — คำนวณจากวันมีผล หมุดเดียวกับ tools/airac.py
        from airac import cycles
        from datetime import date as _d
        y, m, d = (int(x) for x in eff.split('-'))
        for c in cycles(y):
            if c[1] == _d(y, m, d):
                cyc = c[0]
                break

    reg = json.load(open(PUBS, encoding='utf-8'))
    hit, miss, changed = 0, [], []
    for p in reg['pubs']:
        if p.get('cat') != 'chart' or not p.get('icao'):
            continue
        a = ads.get(p['icao'])
        if not a:
            miss.append(p['icao'])
            continue
        before = (p.get('airac'), p.get('eff'), p.get('ap'), p.get('op'),
                  p.get('nap'), p.get('nop'))
        p['airac'], p['eff'] = cyc, eff
        p['ap'], p['op'] = a.get('ap', ''), a.get('op', '')
        p['nap'], p['nop'] = a.get('nap', 0), a.get('nop', 0)
        after = (p['airac'], p['eff'], p['ap'], p['op'], p['nap'], p['nop'])
        hit += 1
        if before != after:
            changed.append('%s  AIRAC %s (%s) · ผัง %s ชุด · ปฏิบัติการ %s ชุด'
                           % (p['icao'], cyc, eff, p['nap'], p['nop']))

    print('AIRAC %s (%s) — อัปเดต %d สนามบิน · เปลี่ยนจริง %d%s'
          % (cyc, eff, hit, len(changed), '  [ไม่เขียน]' if dry else ''))
    for c in changed:
        print('   ' + c)
    for m in miss:
        print('  🔴 %s อยู่ในทะเบียนแต่ไม่มีในใบส่งงาน — ไม่ถูกแตะ ตรวจ AIP_ADS ใน AipSync.gs' % m)
    extra = [k for k in ads if not any(p.get('icao') == k for p in reg['pubs'])]
    for k in extra:
        print('  ⚠️ %s ดึงมาแล้วแต่ไม่มีในทะเบียน — เพิ่มใน publications.json เองถ้าต้องการให้ขึ้นหน้าเว็บ' % k)

    if dry:
        return 0
    json.dump(reg, open(PUBS, 'w', encoding='utf-8'), ensure_ascii=False, indent=2)
    print('\nเขียน publications.json แล้ว — ขั้นต่อไป: python3 build.py แล้ว commit')
    print('อย่าลืมอัปโหลดขึ้น Firestore ด้วย ไม่งั้นหน้าเว็บยังเห็นของเดิม')
    return 0


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
