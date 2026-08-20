#!/usr/bin/env python3
# ============================================================
# gen_efc_subjects.py — สร้างแท็บรายวิชาของ EFC จากโครงหลักสูตรของ TrainHub
#
#   python3 tools/gen_efc_subjects.py          เขียนลง formdefs/EFC.json
#   python3 tools/gen_efc_subjects.py -n       ดูว่าจะได้อะไร ไม่เขียน
#
# ── ทำไมต้องสร้างจากข้อมูล ไม่เขียนมือ ────────────────────────
# แต่ละหลักสูตรมีรายวิชาไม่เหมือนกัน และรายวิชาเปลี่ยนเมื่อหลักสูตรถูกแก้
# ถ้าพิมพ์ไว้ในนิยามฟอร์ม วันที่หลักสูตรเปลี่ยนจะไม่มีใครรู้ว่าต้องตามแก้ตรงไหน
# ที่นี่จึงเก็บรายวิชาไว้ที่เดียว (_TRAINHUB_COURSES.json) แล้วสร้างฟอร์มจากมัน
#
# ── สิ่งที่สร้าง ─────────────────────────────────────────────
# 1 ช่องเลือกหลักสูตรที่จะรายงานผล (reportCourse)
# 2 หนึ่ง section ต่อหนึ่งหลักสูตร แสดงเมื่อเลือกหลักสูตรนั้น (showIf)
#   ข้างในเป็น checklist ที่เปิด score:true — ได้ทั้งคะแนนและผลผ่าน/ไม่ผ่าน
#
# คีย์ที่ได้ในข้อมูลของใบ
#   sub_<course>            { <subjectId>: 'S' | 'U' }        ผลผ่าน/ไม่ผ่าน
#   sub_<course>__score     { <subjectId>: <คะแนน> }          คะแนนรายวิชา
# ============================================================
import json, os, sys, collections

OD = collections.OrderedDict
HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CAT = os.path.join(HERE, 'formdefs', '_TRAINHUB_COURSES.json')
DEF = os.path.join(HERE, 'formdefs', 'EFC.json')

OPTS = [OD([("v", "S"), ("n", OD([("th", "ผ่าน"), ("en", "Satisfied")]))]),
        OD([("v", "U"), ("n", OD([("th", "ไม่ผ่าน"), ("en", "Unsatisfied")]))])]


def build(cat):
    courses = cat.get('courses') or []
    dflt = cat.get('defaultScoreMax') or 100

    pick = OD([
        ("k", "reportCourse"), ("type", "select"), ("req", True),
        ("label", OD([("th", "หลักสูตรที่รายงานผล"), ("en", "Course being reported")])),
        ("hint", OD([("th", "เลือกแล้วรายวิชาของหลักสูตรนั้นจะขึ้นด้านล่าง"),
                     ("en", "Choosing a course shows its subjects below")])),
        ("opt", [OD([("v", c['id']),
                     ("n", OD([("th", c.get('nameTh') or c['name']), ("en", c['name'])]))])
                 for c in courses]),
    ])

    secs = []
    for c in courses:
        items = []
        for s in c.get('subjects') or []:
            it = OD([("id", s['id']),
                     ("th", s.get('nameTh') or s['name']),
                     ("en", s['name'])])
            if s.get('group'):
                it['how'] = s['group']
            items.append(it)
        if not items:
            print('  ⚠️ %s ไม่มีรายวิชา — ข้าม' % c['id'])
            continue
        secs.append(OD([
            ("k", "SUB_" + c['id'].upper()),
            ("tab", "T2"), ("party", "ht"),
            ("showIf", "reportCourse == '%s'" % c['id']),
            ("title", OD([("th", c.get('nameTh') or c['name']), ("en", c['name'])])),
            ("fields", [OD([
                ("k", "sub_" + c['id']), ("type", "checklist"), ("req", True),
                ("label", OD([("th", "คะแนนและผลรายวิชา"),
                              ("en", "Subject score and result")])),
                ("score", True),
                ("scoreMax", c.get('scoreMax') or dflt),
                ("opts", OPTS),
                ("items", items),
            ])]),
        ]))
    return pick, secs


def main(argv):
    dry = '-n' in argv
    cat = json.load(open(CAT, encoding='utf-8'))
    if not (cat.get('courses') or []):
        sys.exit('ยังไม่มีข้อมูลหลักสูตรใน %s\n'
                 'ต้องได้รายการคอร์สและรายวิชาจาก TrainHub ก่อน — ห้ามพิมพ์เอง'
                 % os.path.relpath(CAT, HERE))

    d = json.load(open(DEF, encoding='utf-8'), object_pairs_hook=OD)
    pick, secs = build(cat)

    # ตัดของเดิมที่เคยสร้างไว้ออกก่อน แล้วใส่ชุดใหม่ — จะได้ไม่ค้างของหลักสูตรที่ถูกยกเลิก
    d['sections'] = [s for s in d['sections'] if not str(s.get('k', '')).startswith('SUB_')]
    for s in d['sections']:
        s['fields'] = [f for f in s.get('fields', []) if f.get('k') != 'reportCourse']

    # ช่องเลือกหลักสูตรอยู่ต้นแท็บรายวิชา ก่อนคำอธิบาย
    r = next((s for s in d['sections'] if s.get('k') == 'R'), None)
    if r is None:
        sys.exit('ไม่พบ section R (แท็บรายวิชา) ใน EFC.json')
    r['fields'] = [pick] + [f for f in r['fields'] if f.get('k') != 'reportCourse']

    i = d['sections'].index(r) + 1
    d['sections'][i:i] = secs

    n_sub = sum(len(s['fields'][0]['items']) for s in secs)
    print('หลักสูตร %d · รายวิชารวม %d · section ที่สร้าง %d'
          % (len(pick['opt']), n_sub, len(secs)))
    for s in secs:
        print('   %-16s %2d วิชา  showIf: %s'
              % (s['k'], len(s['fields'][0]['items']), s['showIf']))
    if dry:
        print('\nไม่ได้เขียนไฟล์ — เอา -n ออกเพื่อเขียนจริง')
        return 0
    json.dump(d, open(DEF, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    open(DEF, 'a', encoding='utf-8').write('\n')
    print('\nเขียน formdefs/EFC.json แล้ว — ขั้นต่อไป: python3 build.py')
    print('แล้วอย่าลืม tools/make_tokenmap.py EFC + importTemplate ให้แม่แบบ PDF ตรงกัน')
    return 0


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
