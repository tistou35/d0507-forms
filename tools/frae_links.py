#!/usr/bin/env python3
# ============================================================
# frae_links.py — ทำลิงก์ใบประเมินความเสี่ยงก่อนบิน (FRAE) ที่กรอกไว้ให้แล้ว
#                 จากรายการเที่ยวบินในสมุดบันทึกการบินของ AeroFBO
#
#   python3 tools/frae_links.py              พิมพ์ตารางและลิงก์
#   python3 tools/frae_links.py --html       ออกเป็นหน้า HTML ให้กดจากมือถือ
#
# ── ทำอะไร ───────────────────────────────────────────────────
# เติมช่องที่รู้อยู่แล้วจากสมุดบันทึก — ชื่อ PIC · วันที่ · เลขเที่ยวบิน · ทะเบียน
# และคำตอบชุด "อากาศดี" ตามที่ผู้ควบคุมเอกสารกำหนด (ช่องความเสี่ยงทั้ง 36 ช่อง
# ปล่อยว่าง · น้ำแข็ง none · ทางวิ่งแห้งทั้งสองสนาม · VFR · GO)
#
# ── สิ่งที่ "ไม่" ทำ ──────────────────────────────────────────
# ไม่เซ็นแทนใคร ใบที่ได้ยังขาดลายเซ็น PIC และลายเซ็นครูการบินผู้อนุญาต
# เจ้าตัวต้องเปิดลิงก์ ตรวจว่าตรงกับที่บินจริง แล้วเซ็นเอง — ลายเซ็นคือสิ่งที่
# ทำให้เอกสารนี้เป็นหลักฐาน ไม่ใช่ข้อมูลที่กรอกไว้
#
# ── วันที่สองชนิด อย่าสับสน ─────────────────────────────────
#   evalDate      วันที่ประเมิน = วันที่บิน — ตั้งให้ตรงกับสมุดบันทึกแล้ว
#                 เป็นช่องที่บอกว่าใบนี้เป็นของเที่ยวบินวันไหน
#   วันที่บันทึก   เวลาที่ระบบออกให้ตอนกดส่ง (submittedAt) เป็นหลักฐานว่า
#                 บันทึกนี้ถูกสร้างขึ้นเมื่อไรจริง ๆ ระบบออกให้เองที่เซิร์ฟเวอร์
#                 เครื่องมือนี้ไม่ได้ยุ่งกับมันและยุ่งไม่ได้
#
# ช่องมาตรการปล่อยว่างไว้ให้ PIC เขียนเอง ตามที่ผู้ควบคุมเอกสารสั่ง
#
# ── คะแนนความเสี่ยง ─────────────────────────────────────────
# มาจากลำดับเที่ยวบินของวันนั้นอย่างเดียว (เที่ยวแรก 0 · ที่สอง 1 · ที่สามขึ้นไป 2)
# เพราะช่องอื่นปล่อยว่างหมด — อยู่ในช่วง 0–3 ตามที่กำหนด
# ============================================================
import base64
import json
import os
import sys
from collections import defaultdict

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SITE = 'https://tistou35.github.io/d0507-forms/'
DEF = os.path.join(HERE, 'formdefs', 'FRAE.json')

# คัดจาก https://indyzz.com/aerofbo/flight-log.php — สองหน้า
# รูปแบบ: เลขที่เที่ยวบิน · วันที่ · ทะเบียน · ชื่อ · นามสกุล
LOG = """
LOG-202608-8  19-Aug-2026 HS-VVD Thapphawut Whangpurikul
LOG-202608-7  18-Aug-2026 HS-VVD Thapphawut Whangpurikul
LOG-202608-6  17-Aug-2026 HS-VVD Thapphawut Whangpurikul
LOG-202608-5  16-Aug-2026 HS-VVD Thapphawut Whangpurikul
LOG-202608-4  15-Aug-2026 HS-VVD Thapphawut Whangpurikul
LOG-202608-3  02-Aug-2026 HS-VVD Thapphawut Whangpurikul
LOG-202608-2  01-Aug-2026 HS-VVD Thapphawut Whangpurikul
LOG-202608-1  01-Aug-2026 HS-VVD Thapphawut Whangpurikul
LOG-202607-13 31-Jul-2026 HS-VVD Thapphawut Whangpurikul
LOG-202607-12 30-Jul-2026 HS-VVD Thapphawut Whangpurikul
LOG-202607-11 21-Jul-2026 HS-BSC Nantawat Deeaum
LOG-202607-10 20-Jul-2026 HS-BSC Nantawat Deeaum
LOG-202607-9  20-Jul-2026 HS-BSC Nantawat Deeaum
LOG-202607-8  20-Jul-2026 HS-BSC Nantawat Deeaum
LOG-202607-7  17-Jul-2026 HS-BSC Nantawat Deeaum
LOG-202607-6  17-Jul-2026 HS-BSC Nantawat Deeaum
LOG-202607-5  16-Jul-2026 HS-BSC Nantawat Deeaum
LOG-202607-16 09-Jul-2026 HS-BSC Nantawat Deeaum
LOG-202607-15 09-Jul-2026 HS-BSC Nantawat Deeaum
LOG-202607-14 09-Jul-2026 HS-BSC Nantawat Deeaum
LOG-202607-4  08-Jul-2026 HS-VVD Thapphawut Whangpurikul
LOG-202607-3  08-Jul-2026 HS-VVD Thapphawut Whangpurikul
LOG-202607-2  07-Jul-2026 HS-VVD Thapphawut Whangpurikul
LOG-202607-1  07-Jul-2026 HS-VVD Thapphawut Whangpurikul
LOG-202604-2  21-Apr-2026 HS-BSC Nantawat Deeaum
LOG-202604-1  21-Apr-2026 HS-BSC Nantawat Deeaum
"""

# สั่งไว้ว่าไม่ต้องทำสี่ใบนี้
SKIP = {'LOG-202608-9', 'LOG-202608-10', 'LOG-202608-11', 'LOG-202608-12'}

MON = {m: i + 1 for i, m in enumerate(
    ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
     'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'])}
NTH = ['1st', '2nd', '3rd', 'gt3']
NTH_SCORE = {'1st': 0, '2nd': 1, '3rd': 2, 'gt3': 2}


def regs_allowed():
    d = json.load(open(DEF, encoding='utf-8'))
    return [o['v'] for s in d['sections'] for f in s.get('fields', [])
            if f['k'] == 'aircraftReg' for o in f['opt']]


def rows():
    out = []
    for ln in LOG.strip().split('\n'):
        p = ln.split()
        if p[0] in SKIP:
            continue
        dd, mm, yy = p[1].split('-')
        out.append({'no': p[0], 'date': '%s-%02d-%02d' % (yy, MON[mm], int(dd)),
                    'reg': p[2], 'first': p[3], 'last': ' '.join(p[4:])})
    # ลำดับเที่ยวของวัน — เรียงตามเลขท้ายของเลขที่เที่ยวบินภายในวันเดียวกัน
    by = defaultdict(list)
    for r in out:
        by[r['date']].append(r)
    for rs in by.values():
        rs.sort(key=lambda x: int(x['no'].rsplit('-', 1)[1]))
        for i, r in enumerate(rs):
            r['nth'] = NTH[min(i, 3)]
            r['score'] = NTH_SCORE[r['nth']]
    return out


def link(r):
    o = {'role': 'PIC', 'picFirst': r['first'], 'picLast': r['last'],
         'evalDate': r['date'], 'flightNo': r['no'], 'aircraftReg': r['reg'],
         'flightType': 'VFR',
         's1Icing': 'none', 's1PrevFlight': r['nth'],
         's3Runway': 'dry', 's5Runway': 'dry', 'decision': 'GO'}
    p = base64.urlsafe_b64encode(
        json.dumps(o, ensure_ascii=False).encode()).decode()
    return SITE + 'fill/?c=FRAE&p=' + p


def main():
    allowed = regs_allowed()
    L = rows()
    bad = [r for r in L if r['reg'] not in allowed]
    if bad:
        sys.exit('ทะเบียนที่ฟอร์มไม่มี: %s — เพิ่มใน formdefs/FRAE.json ก่อน'
                 % ' · '.join(sorted({r['reg'] for r in bad})))

    if '--html' in sys.argv:
        by = defaultdict(list)
        for r in L:
            by[r['first'] + ' ' + r['last']].append(r)
        parts = ['<meta charset="utf-8"><title>ลิงก์ใบประเมินความเสี่ยงย้อนหลัง</title>',
                 '<style>body{font-family:system-ui;max-width:760px;margin:24px auto;padding:0 16px}'
                 'h2{margin:22px 0 8px;font-size:17px}a{display:block;padding:9px 0;'
                 'border-bottom:1px solid #eee;text-decoration:none;color:#1a4f8a}'
                 'b{font-family:ui-monospace,monospace}span{color:#777;font-size:13px}</style>',
                 '<h1 style="font-size:20px">ใบประเมินความเสี่ยงก่อนบิน — กรอกไว้ให้แล้ว รอลงนาม</h1>',
                 '<p style="color:#555;font-size:14px">เปิดลิงก์ของเที่ยวบินตัวเอง '
                 'ตรวจว่าข้อมูลตรงกับที่บินจริง แล้วเซ็นชื่อ · จากนั้นครูการบินเซ็นอนุญาตต่อในคิวงาน</p>']
        for who, rs in by.items():
            parts.append('<h2>%s · %d เที่ยว</h2>' % (who, len(rs)))
            for r in rs:
                parts.append('<a href="%s"><b>%s</b> <span>%s · %s · คะแนน %d</span></a>'
                             % (link(r), r['no'], r['date'], r['reg'], r['score']))
        out = os.path.join(HERE, 'frae-links.html')
        open(out, 'w', encoding='utf-8').write('\n'.join(parts))
        print('เขียน %s · %d เที่ยว' % (out, len(L)))
        return

    print('%-15s %-11s %-8s %-24s %-5s %s' %
          ('เที่ยวบิน', 'วันที่', 'ทะเบียน', 'นักบิน', 'ลำดับ', 'คะแนน'))
    for r in L:
        print('%-15s %-11s %-8s %-24s %-5s %d' %
              (r['no'], r['date'], r['reg'], r['first'] + ' ' + r['last'],
               r['nth'], r['score']))
        print('    %s' % link(r))
    print('\nรวม %d เที่ยว · ข้ามตามที่สั่ง %d ใบ · คะแนนสูงสุด %d'
          % (len(L), len(SKIP), max(r['score'] for r in L)))


if __name__ == '__main__':
    main()
