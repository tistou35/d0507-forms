#!/usr/bin/env python3
# ============================================================
# aip_name.py — แปลงชื่อ chart ดิบของ eAIP เป็นชื่อไฟล์ และจัดเป็นชุด
#
#   python3 tools/aip_name.py            ตรวจทุกสนามบิน — ต้องไม่มีชื่อชนกัน
#   python3 tools/aip_name.py VTBD       ดูผลของสนามบินเดียว
#
# ── ทำไมต้องมีไฟล์นี้แยก ─────────────────────────────────────
# eAIP ตั้งชื่อ chart ยาวมากและใส่รายชื่อจุดบังคับต่อท้าย เช่น
#   Standard Departure Chart - Instrument (SID) - ICAO - RNAV RWY 21L
#   - ALBOS3C BONVO3C NOBER4C ... AD 2-VTBD-6-9
# ถ้าตัดหางทิ้งหมดเพื่อให้ชื่อสั้น จะเหลือ "VTBD SID RNAV RWY 21L"
# ซึ่ง VTBD มีสองใบที่ต่างกันจริง (กลุ่ม ALBOS3C กับกลุ่ม DOSBU3C)
#
# ที่อันตรายกว่า: "VFR ENTRY AND EXIT ... FOR LIGHT AIRCRAFT" กับ
# "... FOR HELICOPTER" ใช้ชื่อเดียวกันทุกตัวอักษรยกเว้นคำนั้น
# ตัดพลาดแล้วไฟล์ทับกันเงียบๆ — นักบินเครื่องเล็กเปิดได้ chart เฮลิคอปเตอร์
# โดยไม่มีอะไรบอกว่าผิด
#
# กติกาจึงเป็น: ตัดได้เฉพาะส่วนที่ซ้ำกับ kind อยู่แล้ว
# ส่วนที่ทำให้ chart ต่างใบกัน ต้องอยู่ในชื่อเสมอ
# แล้วปิดท้ายด้วยการตรวจว่าไม่มีชื่อชนกัน (check() ด้านล่าง)
# ============================================================
import re, sys, os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# หน้าอ้างอิงท้ายชื่อ  "AD 2-VTBD-6-9"  ใช้บอกลำดับหน้าในชุด
PAGEREF = re.compile(r'AD\s+2-([A-Z]{4})-([\d-]+)\s*$', re.I)

# ตัวขยายในวงเล็บที่บอกว่า "นี่คือหน้าถัดไปของใบเดิม" ไม่ใช่ใบใหม่
#
# สำรวจของจริงทั้ง 12 สนามบินแล้ว วงเล็บมีอยู่ห้าแบบเท่านั้น:
#   หน้าต่อ  Verso · Tabular description [N] · Waypoint list table
#            Radio communication failure table · Fix and point list table
#   ไม่ใช่   (SID) (STAR) — เป็นชนิดของแผนภูมิ
#            (NORTH) (SOUTH) — เป็นคนละใบจริง ๆ (VTUK มีทั้งคู่)
#
# ใช้กฎ "ลงท้ายด้วย table" ครอบไว้ด้วย เพราะหน้าตารางเป็นภาคผนวกของแผนภูมิเสมอ
# และรอบหน้า CAAT อาจเพิ่มตารางชื่อใหม่ที่ยังไม่เคยเห็น
CONT = re.compile(r'\((Verso|Tabular description[^)]*|Continued[^)]*|'
                  r'Page \d+[^)]*|[^)]*\btable)\)', re.I)

# ชนิด chart — เรียงจากเจาะจงไปกว้าง ตัวแรกที่ตรงคือคำตอบ
# (kind, โฟลเดอร์ย่อย)
KINDS = [
    (r'Aerodrome Chart',              'Aerodrome Chart',   'Airport chart'),
    (r'Aircraft Parking/Docking',     'Parking',           'Airport chart'),
    (r'Aerodrome Ground Movement',    'Ground Movement',   'Airport chart'),
    (r'Aerodrome Obstacle',           'Obstacle',          'Airport chart'),
    (r'Precision Approach Terrain',   'Terrain',           'Airport chart'),
    (r'\(SID\)',                      'SID',               'Chart'),
    (r'\(STAR\)',                     'STAR',              'Chart'),
    (r'Instrument Approach Chart',    'IAP',               'Chart'),
    (r'VFR\s+ENTRY\s+AND\s+EXIT',     'VFR Entry & Exit',  'Chart'),
    (r'VFR\s+ENTRY',                  'VFR Entry',         'Chart'),
    (r'VFR\s+EXIT',                   'VFR Exit',          'Chart'),
    (r'VFR\s+OVERFLY',                'VFR Overfly',       'Chart'),
    (r'VFR',                          'VFR',               'Chart'),
]

# คำนำหน้าที่ซ้ำกับ kind แล้ว — ตัดออกได้โดยไม่เสียตัวแยก
LEAD = re.compile(
    r'^\s*(Standard Departure Chart\s*-\s*Instrument\s*\(SID\)'
    r'|Standard Arrival Chart\s*-\s*Instrument\s*\(STAR\)'
    r'|Instrument Approach Chart'
    r'|Aerodrome Chart'
    r'|Aircraft Parking/Docking Chart'
    r'|Aerodrome Ground Movement Chart'
    r'|Aerodrome Obstacle Chart[^-]*'
    r'|Precision Approach Terrain Chart[^-]*'
    r'|VFR\s+ENTRY\s+AND\s+EXIT\s+PROCEDURE'
    r'|VFR\s+ENTRY\s+PROCEDURE'
    r'|VFR\s+EXIT\s+PROCEDURE'
    r'|VFR\s+OVERFLY\s+PROCEDURE'
    r')\s*', re.I)

# รหัสจุดบังคับ เช่น ALBOS3C  BONVO3C  HHN3C  — ห้าตัวอักษร+เลข+อักษร
DESIG = re.compile(r'\b([A-Z]{2,5}\d[A-Z])\b')


def page_key(ref):
    """เรียงหน้าแบบตัวเลข — '6-10' ต้องมาหลัง '6-9' ไม่ใช่ก่อน"""
    return tuple(int(x) for x in ref.split('-') if x.isdigit())


def parse(icao, raw):
    """แยกชื่อดิบเป็นส่วนประกอบ — คืน dict"""
    m = PAGEREF.search(raw)
    ref = m.group(2) if m else ''
    body = raw[:m.start()] if m else raw

    cont = CONT.search(body)
    part = cont.group(1).strip() if cont else ''
    body = CONT.sub('', body)

    kind, folder = 'Chart', 'Chart'
    for pat, k, f in KINDS:
        if re.search(pat, raw, re.I):
            kind, folder = k, f
            break

    d = LEAD.sub('', body)
    d = re.sub(r'^\s*-?\s*ICAO\s*-?\s*', '', d, count=1, flags=re.I)
    # "FOR LIGHT AIRCRAFT CHART - RWY 21L/21R" → "Light Aircraft RWY 21L/21R"
    # คำว่า LIGHT AIRCRAFT / HELICOPTER ต้องอยู่ ตัดทิ้งแล้วสองใบนี้ทับกัน
    d = re.sub(r'^\s*FOR\s+(.*?)\s*CHART\s*-?\s*', lambda m: m.group(1).title() + ' ',
               d, count=1, flags=re.I)
    d = re.sub(r'^\s*CHART\s*-?\s*', '', d, count=1, flags=re.I)

    # SID/STAR: เก็บรหัสจุดบังคับตัวแรกไว้เป็นตัวแยก แล้วตัดที่เหลือ
    desig = ''
    if kind in ('SID', 'STAR'):
        hit = DESIG.search(d)
        if hit:
            desig = hit.group(1)
            d = d[:hit.start()]

    # ต้นทางพิมพ์ไม่สม่ำเสมอ — VTBU หน้า 8-9 เขียน "RWY 18" ส่วน 8-10 เขียน "RWY18"
    # ทั้งที่เป็นแผนภูมิใบเดียวกัน ปล่อยไว้จะแยกเป็นสองชุด แล้วได้ชุดที่มีแต่หน้าตาราง
    # ไม่มีหน้าแผนภูมิ  (มี 5 แห่งในรอบ 2608)
    d = re.sub(r'\bRWY(\d)', r'RWY \1', d)

    d = re.sub(r'\s+', ' ', d).strip(' -,')
    if desig:
        d = (d + ' ' + desig).strip()

    # อักขระต้องห้ามในชื่อไฟล์ — ต้องล้างแบบเดียวกับ clean() ใน AipSync.gs
    # "RWY 21L/21R" มีทับ ปล่อยไว้จะได้ชื่อโฟลเดอร์ซ้อนแทนชื่อไฟล์
    name = re.sub(r'\s+', ' ',
                  re.sub(r'[\\/:*?"<>|]', '-', '%s %s %s' % (icao, kind, d))).strip()[:150]
    return {'icao': icao, 'raw': raw, 'kind': kind, 'folder': folder,
            'detail': d, 'part': part, 'ref': ref, 'name': name}


def sets(icao, chart_map):
    """จัดชุด — คืน [{name, folder, pages:[(ref, ชื่อดิบ, url)]}] เรียงหน้าแล้ว"""
    grp = {}
    for raw, url in chart_map.items():
        p = parse(icao, raw)
        g = grp.setdefault(p['name'], {'name': p['name'], 'folder': p['folder'],
                                       'kind': p['kind'], 'pages': []})
        g['pages'].append((p['ref'], raw, url, p['part']))
    for g in grp.values():
        g['pages'].sort(key=lambda t: page_key(t[0]))
    return sorted(grp.values(), key=lambda g: g['name'])


AD = ['VTBD', 'VTBU', 'VTUU', 'VTUD', 'VTUW', 'VTUI',
      'VTUV', 'VTUL', 'VTPP', 'VTUK', 'VTPH', 'VTUQ']


def check(only=None):
    from aip_charts import charts, cycle_date
    code, date = cycle_date()
    tot_f = tot_s = 0
    bad = []
    for a in (only or AD):
        cm = charts(a, date)
        ss = sets(a, cm)
        tot_f += len(cm); tot_s += len(ss)
        print('\n%s · %d ไฟล์ → %d ชุด' % (a, len(cm), len(ss)))
        for g in ss:
            n = len(g['pages'])
            if only or n > 3:
                print('   %-52s %d หน้า  [%s]'
                      % (g['name'][:52], n, ','.join(p[0] for p in g['pages'])))
            refs = [p[0] for p in g['pages']]
            # ── กฎที่วัดจากของจริงทั้ง 356 ใบแล้วเป็นจริงทุกใบ ──────────
            # ชุดเดียวกันต้องไม่มีหน้าเลขซ้ำ — ซ้ำ = จับผิดชุด
            if len(set(refs)) != len(refs):
                bad.append('%s · %s หน้าซ้ำ %s' % (a, g['name'], refs))
            # เลขหน้าในชุดต้องเรียงติดกัน — ชุดคือแผนภูมิหนึ่งใบกับภาคผนวกที่พิมพ์ต่อกัน
            # ถ้าโหว่ แปลว่าจับมารวมข้ามใบ หรือมีหน้าที่ควรอยู่ด้วยแต่ตกไปอยู่ชุดอื่น
            k = [page_key(r) for r in refs]
            if len(k) > 1 and any(k[i + 1][-1] - k[i][-1] != 1 for i in range(len(k) - 1)):
                bad.append('%s · %s เลขหน้าไม่ติดกัน %s' % (a, g['name'], refs))
            # ต้องมีหน้าแผนภูมิ ไม่ใช่มีแต่ภาคผนวก — เคยเจอตอน VTBU พิมพ์ RWY18/RWY 18
            # ไม่ตรงกัน แล้วหน้าตารางหลุดไปตั้งชุดใหม่ของตัวเอง
            if all(p[3] for p in g['pages']):
                bad.append('%s · %s มีแต่ภาคผนวก ไม่มีหน้าแผนภูมิ' % (a, g['name']))
    print('\nรวม %d ไฟล์ → %d ชุด' % (tot_f, tot_s))
    for b in bad:
        print('  🔴 ' + b)
    print('ชื่อชนกัน: %d' % len(bad))
    return not bad


if __name__ == '__main__':
    a = [x for x in sys.argv[1:] if re.match(r'^[A-Z]{4}$', x)]
    sys.exit(0 if check(a or None) else 1)
