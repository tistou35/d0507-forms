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
import json, os, sys, urllib.request

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(HERE, 'tools'))
from aip_merge import manifest

PUBS = os.path.join(HERE, 'publications.json')


def main(argv):
    if not argv:
        sys.exit('ใช้: aip_pubs.py <manifest id> [-n]')
    dry = '-n' in argv
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
