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
    """ช่องเลือกคอร์ส พร้อมรายวิชาของแต่ละคอร์สไว้เติมลงตาราง s7

    เติมชื่อวิชาอย่างเดียว ไม่เติมคะแนน/ผล/วันที่ — สองอย่างนั้นเป็นข้อเท็จจริง
    ที่ต้องมาจาก TrainHub หรือจากผู้ลงนาม ไม่ใช่จากหลักสูตร

    ชื่อวิชาต้องตรงกับที่ prefill ส่งมาเป๊ะ (ตกลงกับ trainhub-spec-63 แล้วว่า
    ส่งชื่อเปล่าไม่มีเลขลำดับนำหน้า) ไม่งั้นเวลาเทียบกันจะดูเหมือนคนละวิชา
    """
    courses = [c for c in (cat.get('courses') or []) if c.get('use')]
    return OD([
        ("k", "reportCourse"), ("type", "select"),
        ("label", OD([("th", "หลักสูตรที่รายงานผล (TrainHub)"),
                      ("en", "Course being reported (TrainHub)")])),
        ("hint", OD([("th", "เลือกแล้วรายวิชาของหลักสูตรนั้นจะขึ้นในตารางด้านล่าง "
                            "· ถ้ามาจากลิงก์ TrainHub ตารางถูกเติมมาแล้ว ไม่ต้องเลือก"),
                     ("en", "Choosing a course fills the subject table below. "
                            "Coming from a TrainHub link, it is already filled.")])),
        ("seedInto", "s7"),
        ("opt", [OD([("v", c['id']),
                     ("n", OD([("th", c['name']), ("en", c['name'])])),
                     ("seed", [OD([("subject", s['name']), ("score", None),
                                   ("result", ""), ("passedOn", "")])
                               for s in c['subjects']])])
                 for c in courses]),
    ])


def main(argv):
    dry = '-n' in argv
    cat = json.load(open(CAT, encoding='utf-8'))
    use = [c for c in (cat.get('courses') or []) if c.get('use')]
    if not use:
        sys.exit('ยังไม่มีหลักสูตรที่ใช้ได้ใน %s' % os.path.relpath(CAT, HERE))

    d = json.load(open(DEF, encoding='utf-8'), object_pairs_hook=OD)
    pick = build(cat)

    s7 = next((s for s in d['sections'] if any(f['k'] == 's7' for f in s.get('fields', []))), None)
    if s7 is None:
        sys.exit('ไม่พบ section ที่มีตาราง s7 ใน EFC.json')

    # บรรทัดบอกหลักสูตรที่กำลังรายงาน — ต้องเห็นคู่กับรายวิชาเสมอ
    # รายชื่อวิชาลอย ๆ โดยไม่บอกว่าของหลักสูตรไหน ตรวจย้อนหลังไม่ได้
    head = OD([
        ("k", "courseHead"), ("type", "static"),
        ("text", OD([("th", "หลักสูตร: {course}\nรายวิชาและผลด้านล่างเป็นของหลักสูตรนี้"),
                     ("en", "Course: {course}\nThe subjects and results below belong to this course")])),
    ])
    keep = [f for f in s7['fields'] if f.get('k') not in ('reportCourse', 'courseHead')]
    s7['fields'] = [pick, head] + keep
    for s in d['sections']:
        if s is not s7:
            s['fields'] = [f for f in s.get('fields', [])
                           if f.get('k') not in ('reportCourse', 'courseHead')]

    print('หลักสูตรที่เลือกได้ %d · รายวิชารวม %d'
          % (len(use), sum(len(c['subjects']) for c in use)))
    for c in use:
        print('   %-52s %2d วิชา' % (c['name'][:52], len(c['subjects'])))
    if dry:
        print('\nไม่ได้เขียนไฟล์ — เอา -n ออกเพื่อเขียนจริง')
        return 0
    json.dump(d, open(DEF, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    open(DEF, 'a', encoding='utf-8').write('\n')
    print('\nเขียน formdefs/EFC.json แล้ว — ขั้นต่อไป: python3 build.py')
    return 0


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
