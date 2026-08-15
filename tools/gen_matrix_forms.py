#!/usr/bin/env python3
# ============================================================
# gen_matrix_forms.py — สร้างนิยามฟอร์มของใบที่เป็นตารางให้คะแนนยาว ๆ
#
#   python3 tools/gen_matrix_forms.py          # เขียน EFM · EFC · SEF
#
# ใบสามใบนี้มีหัวข้อประเมินรวมกันเกือบ 200 ข้อ ถ้าพิมพ์เองจะตกหล่นแน่
# จึงอ่านจาก .docx โดยตรง หัวข้อและลำดับจึงตรงกระดาษเสมอ
#
# ส่วนหัวเอกสาร ผู้กรอก ลำดับอนุมัติ และ gate เขียนมือ (ตัดสินใจไม่ได้จากตาราง)
# ส่วนรายการหัวข้อดึงอัตโนมัติ — รันใหม่เมื่อ .docx เปลี่ยน
# ============================================================
import json, os, re, sys

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(HERE, 'tools'))
from extract_matrix import extract, slug


def items(abbr, table, prefix=''):
    """หัวข้อในตารางหนึ่ง พร้อม id ที่ไม่ชนกันข้ามส่วน"""
    blk = next(b for b in extract(abbr) if b['table'] == table)
    out, seen = [], {}
    for i, it in enumerate(blk['items'], 1):
        base = prefix + slug(it['label'], i)
        n = seen.get(base, 0) + 1
        seen[base] = n
        out.append({'id': base if n == 1 else '%s%d' % (base, n),
                    'th': it['label'], 'en': it['label'], 'group': it['group']})
    return out


def split_groups(its):
    """แบ่งเป็นช่วง ๆ ตามหัวข้อกลุ่มที่กระดาษขึ้นไว้"""
    out, cur = [], None
    for it in its:
        if cur is None or it['group'] != cur['group']:
            cur = {'group': it['group'], 'items': []}
            out.append(cur)
        cur['items'].append({k: it[k] for k in ('id', 'th', 'en')})
    return out


SCALE6 = [
    {'v': 'excellent', 'n': {'th': 'ดีมาก', 'en': 'Excellent'}},
    {'v': 'verygood',  'n': {'th': 'ดี', 'en': 'Very good'}},
    {'v': 'good',      'n': {'th': 'ค่อนข้างดี', 'en': 'Good'}},
    {'v': 'fair',      'n': {'th': 'พอใช้', 'en': 'Fair'}},
    {'v': 'poor',      'n': {'th': 'ต้องปรับปรุง', 'en': 'Poor'}},
    {'v': 'na',        'n': {'th': 'ไม่เกี่ยวข้อง', 'en': 'N/A'}},
]
SCALE6_SEF = [
    {'v': 'excellent', 'n': {'th': 'ดีมาก', 'en': 'Excellent'}},
    {'v': 'good',      'n': {'th': 'ดี', 'en': 'Good'}},
    {'v': 'fair',      'n': {'th': 'พอใช้', 'en': 'Fair'}},
    {'v': 'poor',      'n': {'th': 'ต้องปรับปรุง', 'en': 'Poor'}},
    {'v': 'verypoor',  'n': {'th': 'ต้องปรับปรุงมาก', 'en': 'Very poor'}},
    {'v': 'na',        'n': {'th': 'ไม่เกี่ยวข้อง', 'en': 'N/A'}},
]
SU3 = [
    {'v': 'S',  'n': {'th': 'ผ่าน', 'en': 'Satisfied'}},
    {'v': 'U',  'n': {'th': 'ไม่ผ่าน', 'en': 'Not satisfied'}},
    {'v': 'NA', 'n': {'th': 'ยกเว้น', 'en': 'Exempt'}},
]
SU2 = [
    {'v': 'S', 'n': {'th': 'ผ่าน', 'en': 'Satisfied'}},
    {'v': 'U', 'n': {'th': 'ไม่ผ่าน', 'en': 'Unsatisfied'}},
]


def sign(k, th, en):
    return {'k': k, 'type': 'sign', 'req': True, 'label': {'th': th, 'en': en}}


def txt(k, th, en, **kw):
    d = {'k': k, 'type': kw.pop('type', 'text'), 'label': {'th': th, 'en': en}}
    d.update(kw)
    return d


# ── EFM ────────────────────────────────────────────────────
def efm():
    secs = [{
        'k': 'A', 'tab': 'T1', 'party': 'ev',
        'title': {'th': 'ข้อมูลการประเมิน', 'en': 'Evaluation details'},
        'fields': [
            txt('evalDate', 'วันที่', 'Date', type='date', req=True, prefill='today', half=True),
            txt('trainee', 'ชื่อผู้รับการประเมิน', 'Trainee name', req=True, half=True),
            txt('trainType', 'ประเภทการฝึก', 'Type of training', type='select', req=True, opt=[
                {'v': 'ground',      'n': {'th': 'ภาคพื้น', 'en': 'Ground'}},
                {'v': 'flight',      'n': {'th': 'ภาคอากาศ', 'en': 'Flight'}},
                {'v': 'simulator',   'n': {'th': 'เครื่องฝึกบินจำลอง', 'en': 'Simulator'}},
                {'v': 'recurrent',   'n': {'th': 'ทบทวน', 'en': 'Recurrent'}},
                {'v': 'progressive', 'n': {'th': 'ตรวจความก้าวหน้า / ตรวจมาตรฐาน',
                                           'en': 'Progressive / standard check'}}]),
            txt('subject', 'วิชา / ภารกิจ', 'Subject / mission', req=True, half=True),
            txt('classNo', 'รุ่น / ชั้นเรียน', 'Class', half=True),
        ]}]

    # ตารางที่ 1 — ประเมินการสอน 6 ระดับ
    secs.append({
        'k': 'B', 'tab': 'T2', 'party': 'ev',
        'title': {'th': 'ประเมินการสอนและเนื้อหา', 'en': 'Teaching and content evaluation'},
        'fields': [{
            'k': 'teach', 'type': 'checklist', 'req': True,
            'label': {'th': 'ให้ระดับแต่ละหัวข้อ', 'en': 'Rate each criterion'},
            'opts': SCALE6,
            'items': [{k: it[k] for k in ('id', 'th', 'en')} for it in items('EFM', 1, 't')]}]})

    # ตารางที่ 2 — ประเมินภาคอากาศ ผ่าน/ไม่ผ่าน/ยกเว้น แบ่งเป็นกลุ่มตามกระดาษ
    for i, g in enumerate(split_groups(items('EFM', 2, 'f')), 1):
        secs.append({
            'k': 'F%d' % i, 'tab': 'T3', 'party': 'ev',
            'title': {'th': g['group'], 'en': g['group']},
            'fields': [{
                'k': 'f%d' % i, 'type': 'checklist',
                'label': {'th': 'ผลการประเมิน', 'en': 'Result'},
                'opts': SU3, 'items': g['items']}]})

    secs.append({
        'k': 'Z', 'tab': 'T4', 'party': 'ev',
        'title': {'th': 'สรุปและลงนาม', 'en': 'Overall assessment and signature'},
        'fields': [
            txt('overall', 'ผลประเมินโดยรวม', 'Overall assessment', type='select', req=True, opt=[
                {'v': 'excellent', 'n': {'th': 'ดีมาก', 'en': 'Excellent'}},
                {'v': 'verygood',  'n': {'th': 'ดี', 'en': 'Very good'}},
                {'v': 'good',      'n': {'th': 'ค่อนข้างดี', 'en': 'Good'}},
                {'v': 'fair',      'n': {'th': 'พอใช้', 'en': 'Fair'}},
                {'v': 'poor',      'n': {'th': 'ต้องปรับปรุง', 'en': 'Poor'}}]),
            txt('evComment', 'ความเห็นเพิ่มเติม', 'Comments', type='textarea'),
            txt('evName', 'ชื่อผู้ประเมิน', 'Evaluator name', req=True, half=True),
            txt('evDate', 'วันที่', 'Date', type='date', req=True, prefill='today', half=True),
            sign('evSign', 'ลายเซ็นผู้ประเมิน', 'Evaluator signature'),
        ]})

    return {
        'code': 'EFM', 'doc': 'D-0507-EFM-001', 'control': 'QA-EFM-301-B',
        'issue': '01', 'rev': '00', 'eff': '20 NOV 2024',
        'title': {'th': 'แบบประเมินความคืบหน้า', 'en': 'Progress and Evaluation Form'},
        'retain': 'OMA A.10',
        'ui': {'compact': True, 'tabs': [
            {'k': 'T1', 'th': 'ข้อมูล', 'en': 'Details'},
            {'k': 'T2', 'th': 'การสอน', 'en': 'Teaching'},
            {'k': 'T3', 'th': 'ภาคอากาศ', 'en': 'Flight items'},
            {'k': 'T4', 'th': 'สรุป', 'en': 'Summary'}]},
        'parties': [
            {'k': 'ev', 'n': {'th': 'ผู้ประเมิน', 'en': 'Evaluator'}, 'auth': 'role:ins'},
            {'k': 'ht', 'n': {'th': 'หัวหน้าครูฝึก', 'en': 'Head of Training'}, 'auth': 'role:mgt'}],
        'sections': secs + [{
            'k': 'HT', 'tab': 'T4', 'party': 'ht', 'hideOthers': True,
            'title': {'th': 'หัวหน้าครูฝึกรับรอง', 'en': 'Head of Training endorsement'},
            'fields': [
                txt('htName', 'ชื่อหัวหน้าครูฝึก', 'Head of Training name', req=True, half=True),
                txt('htDate', 'วันที่', 'Date', type='date', req=True, half=True),
                txt('htComment', 'ความเห็น', 'Comment', type='textarea'),
                sign('htSign', 'ลายเซ็นหัวหน้าครูฝึก', 'Head of Training signature')]}],
        'gates': [{
            'when': "overall == 'poor'", 'level': 'warn',
            'short': {'th': 'ต้องปรับปรุง', 'en': 'POOR'},
            'msg': {'th': 'ผลประเมินอยู่ในระดับต้องปรับปรุง — ต้องวางแผนฝึกเพิ่มเติมและระบุในความเห็นก่อนส่ง',
                    'en': 'Rated Poor — record an additional training plan in the comments before submitting.'}}],
        'route': [
            {'step': 1, 'party': 'ev', 'sign': True},
            {'step': 2, 'party': 'ht', 'sign': True, 'assignedBy': 'later', 'pool': 'HT',
             'canDelegate': True, 'slaDays': 5}],
        'export': {'docx': 'D-0507-EFM-001.docx', 'lockUntilComplete': True},
    }


# ── EFC ────────────────────────────────────────────────────
def efc():
    secs = [{
        'k': 'A', 'tab': 'T1', 'party': 'ht',
        'title': {'th': 'ข้อมูลนักเรียนและหลักสูตร', 'en': 'Student and course'},
        'fields': [
            txt('stuName', 'ชื่อนักเรียน', 'Student name', req=True, half=True),
            txt('course', 'หลักสูตรที่เข้ารับการฝึก', 'Course attended', req=True, half=True),
            txt('courseType', 'ประเภทหลักสูตร', 'Type of course', type='select', req=True, opt=[
                {'v': 'ground', 'n': {'th': 'ภาคพื้น', 'en': 'Ground course'}},
                {'v': 'flight', 'n': {'th': 'ภาคอากาศ', 'en': 'Flight training'}}]),
            txt('completeDate', 'วันที่จบหลักสูตร', 'Completion date',
                type='date', req=True, prefill='today', half=True),
            txt('lastLogDate', 'วันที่บันทึกการบินล่าสุด', 'Last flight log date', type='date', half=True),
        ]}, {
        'k': 'B', 'tab': 'T1', 'party': 'ht',
        'title': {'th': 'ผลการสอบ', 'en': 'Examination result'},
        'fields': [
            txt('examType', 'ประเภทการสอบ', 'Type of exam', type='select', req=True, opt=[
                {'v': 'afterclass', 'n': {'th': 'ท้ายคาบเรียน', 'en': 'After class'}},
                {'v': 'stage',      'n': {'th': 'จบขั้นการฝึก', 'en': 'Stage exam'}},
                {'v': 'endcourse',  'n': {'th': 'จบหลักสูตร', 'en': 'End-of-course'}},
                {'v': 'progressive','n': {'th': 'ความก้าวหน้าภาคอากาศ', 'en': 'Flight progressive'}},
                {'v': 'endflight',  'n': {'th': 'จบหลักสูตรภาคอากาศ', 'en': 'End-of-course flight'}}]),
            txt('examScore', 'คะแนนที่ได้', 'Exam score', type='number', req=True, min=0, half=True),
            txt('totalScore', 'คะแนนเต็ม', 'Total score', type='number', req=True, min=1, half=True),
            txt('result', 'ผล', 'Result', type='select', req=True, opt=[
                {'v': 'passed',    'n': {'th': 'ผ่าน', 'en': 'Passed'}},
                {'v': 'notpassed', 'n': {'th': 'ไม่ผ่าน', 'en': 'Not passed'}},
                {'v': 'repeat',    'n': {'th': 'ต้องเรียนซ้ำ', 'en': 'Repeat'}}]),
        ]}]

    for i, g in enumerate(split_groups(items('EFC', 2, 's')), 1):
        secs.append({
            'k': 'S%d' % i, 'tab': 'T2', 'party': 'ht',
            'title': {'th': g['group'], 'en': g['group']},
            'fields': [{
                'k': 's%d' % i, 'type': 'checklist',
                'label': {'th': 'ผลรายวิชา', 'en': 'Result by subject'},
                'opts': SU2, 'items': g['items']}]})

    secs.append({
        'k': 'Z', 'tab': 'T3', 'party': 'ht',
        'title': {'th': 'ลงนาม', 'en': 'Signature'},
        'fields': [
            txt('htComment', 'ความเห็น', 'Comment', type='textarea'),
            txt('htName', 'ชื่อหัวหน้าครูฝึก', 'Head of Training name', req=True, half=True),
            txt('htDate', 'วันที่', 'Date', type='date', req=True, prefill='today', half=True),
            sign('htSign', 'ลายเซ็นหัวหน้าครูฝึก', 'Head of Training signature'),
        ]})

    return {
        'code': 'EFC', 'doc': 'D-0507-EFC-001', 'control': 'IM-EFC-303-A',
        'issue': '01', 'rev': '00', 'eff': '20 AUG 2020',
        'title': {'th': 'รายงานจบหลักสูตรหรือจบขั้นการฝึก', 'en': 'End of Course / Stage Report'},
        'retain': 'OMA A.10',
        'ui': {'compact': True, 'tabs': [
            {'k': 'T1', 'th': 'หลักสูตรและผลสอบ', 'en': 'Course & exam'},
            {'k': 'T2', 'th': 'รายวิชา', 'en': 'Subjects'},
            {'k': 'T3', 'th': 'ลงนาม', 'en': 'Sign'}]},
        'parties': [
            {'k': 'ht', 'n': {'th': 'หัวหน้าครูฝึก', 'en': 'Head of Training'}, 'auth': 'role:mgt'}],
        'sections': secs,
        'compute': [{'k': 'pct', 'op': 'pct', 'of': 'examScore', 'max': 100}],
        'gates': [{
            'when': "result == 'notpassed'", 'level': 'warn',
            'short': {'th': 'ไม่ผ่าน', 'en': 'NOT PASSED'},
            'msg': {'th': 'ไม่ผ่าน — ต้องระบุแผนการสอบซ่อมหรือเรียนซ้ำในความเห็นก่อนปิดรายงาน',
                    'en': 'Not passed — record the re-sit or repeat plan in the comments before closing.'}}],
        'route': [{'step': 1, 'party': 'ht', 'sign': True}],
        'export': {'docx': 'D-0507-EFC-001.docx', 'lockUntilComplete': True},
    }


# ── SEF ────────────────────────────────────────────────────
def sef():
    secs = [{
        'k': 'A', 'tab': 'T1', 'party': 'stu',
        'title': {'th': 'ข้อมูลการประเมิน', 'en': 'Evaluation details'},
        'desc': {'th': 'นักเรียนประเมินครูผู้สอน — ข้อมูลใช้เพื่อพัฒนาการสอน ไม่เปิดเผยชื่อผู้ประเมินต่อครู',
                 'en': 'Student evaluation of the instructor. Used to improve teaching; the evaluator is not identified to the instructor.'},
        'fields': [
            txt('insName', 'ชื่อครูผู้สอน', 'Instructor name', req=True, half=True),
            txt('evalDate', 'วันที่ประเมิน', 'Evaluation date',
                type='date', req=True, prefill='today', half=True),
            txt('groundClass', 'ชั้นเรียนภาคพื้น', 'Ground training class', half=True),
            txt('flightClass', 'ชั้นเรียนภาคอากาศ', 'Flight training class', half=True),
        ]}]

    tabmap = {0: 'T2', 1: 'T3', 2: 'T4'}
    for i, g in enumerate(split_groups(items('SEF', 1, 'p'))):
        secs.append({
            'k': 'P%d' % (i + 1), 'tab': tabmap.get(i, 'T4'), 'party': 'stu',
            'title': {'th': g['group'], 'en': g['group']},
            'fields': [{
                'k': 'p%d' % (i + 1), 'type': 'checklist',
                'label': {'th': 'ให้ระดับแต่ละหัวข้อ', 'en': 'Rate each criterion'},
                'opts': SCALE6_SEF, 'items': g['items']}]})

    secs.append({
        'k': 'Z', 'tab': 'T5', 'party': 'stu',
        'title': {'th': 'ตนเองและลงนาม', 'en': 'Self-assessment and signature'},
        'fields': [
            txt('ownEffort', 'ความตั้งใจของตนเองในการฝึกครั้งนี้', 'My effort in this training was',
                type='select', req=True, opt=[
                    {'v': 'excellent', 'n': {'th': 'ดีมาก', 'en': 'Excellent'}},
                    {'v': 'good',      'n': {'th': 'ดี', 'en': 'Good'}},
                    {'v': 'fair',      'n': {'th': 'พอใช้', 'en': 'Fair'}},
                    {'v': 'poor',      'n': {'th': 'ต้องปรับปรุง', 'en': 'Poor'}},
                    {'v': 'verypoor',  'n': {'th': 'ต้องปรับปรุงมาก', 'en': 'Very poor'}}]),
            txt('suggest', 'ข้อเสนอแนะเพิ่มเติม', 'Additional comments', type='textarea'),
            txt('stuName', 'ชื่อนักเรียน', 'Student name', req=True, half=True),
            sign('stuSign', 'ลายเซ็นนักเรียน', 'Student signature'),
        ]})

    return {
        'code': 'SEF', 'doc': 'D-0507-SEF-001', 'control': 'IM-SEF-301-A',
        'issue': '01', 'rev': '00', 'eff': '20 AUG 2020',
        'title': {'th': 'แบบประเมินครูผู้สอนโดยนักเรียน', 'en': 'Student Evaluation Form'},
        'retain': 'OMA A.10',
        'ui': {'compact': True, 'tabs': [
            {'k': 'T1', 'th': 'ข้อมูล', 'en': 'Details'},
            {'k': 'T2', 'th': 'เรียนด้วยตนเอง', 'en': 'Self-study'},
            {'k': 'T3', 'th': 'ภาคพื้น', 'en': 'Ground'},
            {'k': 'T4', 'th': 'ภาคอากาศ', 'en': 'Flight'},
            {'k': 'T5', 'th': 'สรุป', 'en': 'Summary'}]},
        'parties': [
            {'k': 'stu', 'n': {'th': 'นักเรียน', 'en': 'Student'}, 'auth': 'public'},
            {'k': 'cmm', 'n': {'th': 'ผู้จัดการฝ่ายควบคุมคุณภาพ', 'en': 'Compliance Monitoring Manager'},
             'auth': 'role:mgt'}],
        'sections': secs + [{
            'k': 'QA', 'tab': 'T5', 'party': 'cmm', 'hideOthers': True,
            'title': {'th': 'สำหรับฝ่ายควบคุมคุณภาพ', 'en': 'For Compliance Monitoring use'},
            'fields': [
                txt('cmmName', 'ผู้รับแบบประเมิน', 'Received by', req=True, half=True),
                txt('cmmDate', 'วันที่รับ', 'Date received', type='date', req=True, half=True),
                txt('cmmAction', 'การดำเนินการ', 'Action taken', type='textarea'),
                sign('cmmSign', 'ลายเซ็นผู้รับ', 'Signature')]}],
        'route': [
            {'step': 1, 'party': 'stu', 'sign': True},
            {'step': 2, 'party': 'cmm', 'sign': True, 'assignedBy': 'later', 'pool': 'CMM',
             'canDelegate': True, 'slaDays': 7}],
        'export': {'docx': 'D-0507-SEF-001.docx', 'lockUntilComplete': True},
    }


if __name__ == '__main__':
    for fn in (efm, efc, sef):
        d = fn()
        p = os.path.join(HERE, 'formdefs', d['code'] + '.json')
        json.dump(d, open(p, 'w', encoding='utf-8'), ensure_ascii=False, indent=2)
        n = sum(len(f.get('items', [])) for s in d['sections'] for f in s['fields'])
        print('%-5s %d ส่วน · %d หัวข้อประเมิน · %s' % (d['code'], len(d['sections']), n, p))
