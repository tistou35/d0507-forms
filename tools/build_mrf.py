#!/usr/bin/env python3
# ============================================================
# build_mrf.py — เขียน D-0507-MRF-001.docx (Monthly Reimbursement Form) ฉบับกระดาษ
#
#   python3 tools/build_mrf.py
#
# ── ทำไม ─────────────────────────────────────────────────────
# ฉบับ Rev 00 มีแต่ค่าบินและค่าภาคพื้นอัตราเดียว ส่วนระบบคิดค่าตอบแทนแยกตามภารกิจ
# (เจ้าของเครื่อง D0507 / BSC) พร้อมค่าเดินทาง เบี้ยเลี้ยง ค่าแรงรายวัน per diem และ
# ภาษีหัก ณ ที่จ่ายเฉพาะส่วนที่ไม่มีใบเสร็จ (CLAUDE.md แถว 87–93) — ทั้งหมดนั้นไม่มีบรรทัด
# บนกระดาษ ต้องพิมพ์ในบล็อก ADDITIONAL ท้ายเอกสาร และป้าย "Total × 0.97" บนกระดาษ
# ผิดจากวิธีคิดจริง
#
# ฉบับนี้:
#   - ตารางเวลามีคอลัมน์ Mission
#   - ส่วนที่ 3 เป็นตารางเดียว แถวคือรายการ คอลัมน์คือภารกิจ (จำนวน × อัตรา = ยอด)
#     คนที่ไม่เคยกรอกอ่านได้ทันทีว่าเงินแต่ละบาทมาจากไหน และใช้แยกเรียกเก็บจาก BSC ได้
#   - ส่วนที่ 5 สรุปเป็น A–E บอกตรง ๆ ว่าส่วนไหนถูกหัก 3% ส่วนไหนไม่ถูก
#   - ลงนามเป็นตาราง บทบาท | ชื่อ | ลายเซ็น | วันที่ (rowFill วางค่าได้ตรงช่อง)
#   - ไม่มี ☐ บนกระดาษ — ค่าที่เป็นตัวเลือก (Pay basis · Return trip) พิมพ์เป็นข้อความ
#     จำนวน ☐ จึงไม่ต้องเท่ากับนิยามฟอร์ม
#
# ป้ายทุกช่องตรงกับ formdefs/MRF.json และ _TOKENMAP_OVERRIDES.json — แก้ป้ายที่นี่
# ต้องแก้ที่นั่นด้วย ไม่งั้นค่าไม่ลงช่อง
#
# เนื้อหาเปลี่ยนจาก Rev 00 → ISSUE 01 / REVISION 01 · เลขกำกับ AD-MRF-301-B
# (ฉบับ Rev 00 ไม่มีเลขกำกับ ตัวอักษร B เพราะเป็นฉบับพิมพ์ที่สอง ตามกฎใน CLAUDE.md)
# ============================================================
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import docx
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.shared import Mm, Pt, RGBColor

from build_app import (add_table, band, gap, no_borders, section, shade, write,
                       NAVY, LBL_BG, DECL_BG, HEAD_BG, GREY)
from build_arf import set_grid

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(os.path.dirname(HERE), 'D-0507-MRF-001.docx')

CODE, EFF, ISSREV = 'AD-MRF-301-B', '27 NOV 2026', 'ISSUE NO. 01/REVISION NO. 01'
ROWS = 22
TOT_BG, SUB_BG, NA_BG = 'E8EEF7', 'F2F6FB', 'EDEDED'

HOW = ('Online: D-0507 Forms portal → choose the month and press Fetch — the timesheet, your rates and '
       'receipts verified by FA are filled in for you.   On paper: one line per working day · hours as 1:30 or 1.5 · '
       'Mission = aircraft owner (D0507 = school aircraft · BSC = customer aircraft) · attach every receipt.')


def cell(t, r, c, text=' ', size=7.5, bold=False, color='1A1A1A', bg='FFFFFF', align=None, italic=False):
    x = t.rows[r].cells[c]
    shade(x, bg)
    write(x, text, size, bold, color, italic=italic, align=align)
    return x


def tall(x, pt):
    x.paragraphs[0].paragraph_format.space_after = Pt(pt)


def note(doc, text):
    p = doc.add_paragraph()
    r = p.add_run(text)
    r.font.name = 'Arial'; r.font.size = Pt(6.5); r.italic = True
    r.font.color.rgb = RGBColor.from_string(GREY)
    p.paragraph_format.space_before = Pt(1); p.paragraph_format.space_after = Pt(3)


def build():
    doc = docx.Document()
    s = doc.sections[0]
    s.page_width, s.page_height = Mm(210), Mm(297)
    s.left_margin = s.right_margin = Mm(16)
    s.top_margin, s.bottom_margin = Mm(12), Mm(12)
    st = doc.styles['Normal']
    st.font.name = 'Arial'; st.font.size = Pt(8)
    R = WD_ALIGN_PARAGRAPH.RIGHT
    CE = WD_ALIGN_PARAGRAPH.CENTER

    # ── หัวเอกสาร ──
    t = add_table(doc, 1, 2, [104, 74]); set_grid(t, [104, 74]); no_borders(t)
    c = t.rows[0].cells[0]
    shade(c, HEAD_BG)
    p = write(c, 'D-0507 Flight Training Co., Ltd.', 10, True, NAVY)
    r = p.add_run('\nApproved Training Organisation (ATO)')
    r.font.name = 'Arial'; r.font.size = Pt(7.5); r.font.color.rgb = RGBColor.from_string(GREY)
    p = write(t.rows[0].cells[1], CODE + '    EFF: ' + EFF, 7.5, False, GREY, align=R)
    r = p.add_run('\n' + ISSREV + '\nD-0507-MRF-001  ·  Administration (AD) / Finance')
    r.font.name = 'Arial'; r.font.size = Pt(7); r.italic = True
    r.font.color.rgb = RGBColor.from_string(GREY)
    gap(doc, 2)
    band(doc, 'MONTHLY REIMBURSEMENT FORM', HOW)
    gap(doc, 2)

    # ── ส่วนที่ 1 ──
    section(doc, 'SECTION 1 — CLAIMANT')
    w = [30, 59, 30, 59]
    t = add_table(doc, 4, 4, w); set_grid(t, w)
    rows = [('Claimant Name', 'Position'), ('Month / Year', 'Email'),
            ('Bank Name & Account No.', 'Prepared on behalf by'), ('Pay Basis', 'Return Trip Paid')]
    for i, (a, b) in enumerate(rows):
        cell(t, i, 0, a, 7, True, GREY, LBL_BG); tall(cell(t, i, 1), 3)
        cell(t, i, 2, b, 7, True, GREY, LBL_BG); tall(cell(t, i, 3), 3)
    note(doc, 'Pay Basis: Hourly (flight instruction) or Daily (Flt Ops / engineer).   '
              'Return Trip Paid: set by the administrator or FA — the claimant does not choose it.')

    # ── ส่วนที่ 2 ──
    section(doc, 'SECTION 2 — MONTHLY TIMESHEET')
    w = [8, 16, 14, 40, 20, 22, 13, 17, 28]
    head = ['No.', 'Date', 'Mission', 'Detail / Flight Log ID', 'Aircraft / Room', 'Type',
            'Flt Hrs', 'Gnd / Sim / Work Hrs', 'Remarks']
    t = add_table(doc, ROWS + 2, len(w), w); set_grid(t, w)
    for j, h in enumerate(head):
        cell(t, 0, j, h, 6.5, True, GREY, LBL_BG, align=CE if j in (0, 6, 7) else None)
    for i in range(1, ROWS + 1):
        bg = 'FFFFFF' if i % 2 else 'FAFAFA'
        for j in range(len(w)):
            x = cell(t, i, j, str(i) if j == 0 else ' ', 6.5, False, GREY, bg, align=CE if j == 0 else None)
            tall(x, 4.5)
    last = ROWS + 1
    for j in range(len(w)):
        cell(t, last, j, ' ', 7, True, NAVY, TOT_BG)
    m = t.rows[last].cells[0].merge(t.rows[last].cells[5])
    shade(m, TOT_BG); write(m, 'TOTAL HOURS', 7, True, NAVY, align=R)
    note(doc, 'Type: FLT flight · SIM simulator · GND ground / briefing · GS ground school (TKI) · DUTY working day (Flt Ops / engineer).   '
              'Mission blank = taken from the aircraft registration (HS-VVD → D0507 · HS-BSC → BSC).')

    # ── ส่วนที่ 3 ── ขึ้นหน้าใหม่: หน้า 1 คือ "ทำงานอะไรไปบ้าง" หน้า 2 คือ "คิดเงินอย่างไร" อ่านจบในหน้าเดียว
    from docx.enum.text import WD_BREAK
    doc.add_paragraph().add_run().add_break(WD_BREAK.PAGE)
    section(doc, 'SECTION 3 — PAY BY MISSION (aircraft owner)')
    w = [36, 22, 15, 16, 19, 15, 16, 19, 20]
    head = ['Item', 'Basis', 'Qty', 'Rate', 'Amount', 'Qty', 'Rate', 'Amount', 'Total (Baht)']
    items = [('Flight instruction', 'hours × Baht/hr'),
             ('Travel', 'trips × Baht/trip'),
             ('Allowance', 'days × Baht/day'),
             ('Daily wage (Flt Ops / engineer)', 'days × Baht/day')]
    t = add_table(doc, len(items) + 3, len(w), w); set_grid(t, w)
    for j in range(len(w)):
        cell(t, 0, j, ' ', 6.5, True, GREY, LBL_BG)
    for a, b, txt in ((2, 4, 'D0507 — school aircraft'), (5, 7, 'BSC — customer aircraft')):
        m = t.rows[0].cells[a].merge(t.rows[0].cells[b])
        shade(m, HEAD_BG); write(m, txt, 7, True, NAVY, align=CE)
    for j, h in enumerate(head):
        cell(t, 1, j, h, 6.5, True, GREY, LBL_BG, align=None if j < 2 else CE)
    for i, (a, b) in enumerate(items, 2):
        cell(t, i, 0, a, 7, True, NAVY, LBL_BG)
        cell(t, i, 1, b, 6.5, False, GREY, 'FFFFFF', italic=True)
        for j in range(2, len(w)):
            tall(cell(t, i, j, ' ', 7, j == len(w) - 1, '1A1A1A', SUB_BG if j == len(w) - 1 else 'FFFFFF', align=R), 2)
    sub = len(items) + 2
    cell(t, sub, 0, 'Subtotal by mission', 7, True, NAVY, TOT_BG)
    for j in range(1, len(w)):
        cell(t, sub, j, ' ', 7, True, NAVY, TOT_BG, align=R)
    gap(doc, 2)

    w = [88, 30, 30, 30]
    t = add_table(doc, 2, 4, w); set_grid(t, w)
    for j, h in enumerate(['', 'Hours', 'Rate (Baht / hr)', 'Amount (Baht)']):
        cell(t, 0, j, h, 6.5, True, GREY, LBL_BG, align=CE)
    cell(t, 1, 0, 'Ground / Simulator instruction (one rate for all missions)', 7, True, NAVY, LBL_BG)
    for j in range(1, 4):
        tall(cell(t, 1, j, ' ', 7, j == 3, '1A1A1A', SUB_BG if j == 3 else 'FFFFFF', align=R), 2)
    gap(doc, 2)

    w = [148, 30]
    t = add_table(doc, 1, 2, w); set_grid(t, w)
    cell(t, 0, 0, 'TOTAL PAY — Section 3  (subtotal by mission + ground / simulator)', 7.5, True, NAVY, TOT_BG)
    tall(cell(t, 0, 1, ' ', 7.5, True, NAVY, TOT_BG, align=R), 2)
    note(doc, 'A day with both missions pays travel, allowance and daily wage once, at the higher rate, charged to that mission.   '
              'Travel is paid on the first day of each stay (a break of up to 2 days counts as the same stay).')

    # ── ส่วนที่ 4 ──
    section(doc, 'SECTION 4 — ACCOMMODATION, PER DIEM & EXPENSES')
    w = [58, 26, 30, 30, 34]
    t = add_table(doc, 4, 5, w); set_grid(t, w)
    for j, h in enumerate(['Item', 'Qty', 'Rate (Baht)', 'Amount (Baht)', 'Note']):
        cell(t, 0, j, h, 6.5, True, GREY, LBL_BG, align=None if j in (0, 4) else CE)
    rows = [('Accommodation — flat rate', 'nights × flat rate'),
            ('Accommodation — actual (receipted)', 'attach receipts'),
            ('Per diem', 'days × rate, if entitled')]
    for i, (a, b) in enumerate(rows, 1):
        cell(t, i, 0, a, 7, True, NAVY, LBL_BG)
        for j in (1, 2, 3):
            tall(cell(t, i, j, ' ', 7, False, '1A1A1A', NA_BG if (i == 2 and j < 3) else 'FFFFFF', align=R), 2)
        cell(t, i, 4, b, 6.5, False, GREY, 'FFFFFF', italic=True)
    gap(doc, 2)

    w = [8, 74, 14, 24, 26, 32]
    t = add_table(doc, 7, 6, w); set_grid(t, w)
    for j, h in enumerate(['#', 'Description', 'Qty', 'Unit (Baht)', 'Amount (Baht)', 'Remarks']):
        cell(t, 0, j, h, 6.5, True, GREY, LBL_BG, align=CE if j in (0, 2) else None)
    for i in range(1, 6):
        bg = 'FFFFFF' if i % 2 else 'FAFAFA'
        for j in range(6):
            tall(cell(t, i, j, str(i) if j == 0 else ' ', 6.5, False, GREY, bg, align=CE if j == 0 else None), 2.2)
    for j in range(6):
        cell(t, 6, j, ' ', 7, True, NAVY, SUB_BG, align=R if j == 4 else None)
    m = t.rows[6].cells[0].merge(t.rows[6].cells[3])
    shade(m, SUB_BG); write(m, 'Total Expenses', 7, True, NAVY, align=R)
    gap(doc, 2)

    w = [148, 30]
    t = add_table(doc, 1, 2, w); set_grid(t, w)
    cell(t, 0, 0, 'TOTAL — Section 4  (accommodation + per diem + expenses)', 7.5, True, NAVY, TOT_BG)
    tall(cell(t, 0, 1, ' ', 7.5, True, NAVY, TOT_BG, align=R), 2)
    note(doc, 'More receipts: continue on a separate sheet.   Receipts must be in the company name where possible.')

    # ── ส่วนที่ 5 ──
    section(doc, 'SECTION 5 — SUMMARY')
    w = [148, 30]
    lines = [('A.  Pay subject to 3% withholding tax  —  Section 3 + flat accommodation + per diem + receipts paid as income', LBL_BG),
             ('B.  Receipted expenses  —  not subject to withholding tax', LBL_BG),
             ('C.  TOTAL CLAIM  (A + B)', SUB_BG),
             ('D.  Withholding tax 3%  (A × 3%)', LBL_BG),
             ('E.  NET PAYMENT  (C − D)', TOT_BG)]
    t = add_table(doc, len(lines), 2, w); set_grid(t, w)
    for i, (a, bg) in enumerate(lines):
        big = a.startswith(('C.', 'E.'))
        cell(t, i, 0, a, 7.5 if big else 7, big, NAVY, bg)
        tall(cell(t, i, 1, ' ', 8 if big else 7.5, big, NAVY, bg if big else 'FFFFFF', align=R), 2)

    # ── ส่วนที่ 6 ──
    gap(doc, 2)
    section(doc, 'SECTION 6 — SIGNATURES')
    w = [40, 58, 50, 30]
    t = add_table(doc, 4, 4, w); set_grid(t, w)
    for j, h in enumerate(['Role', 'Name', 'Signature', 'Date']):
        cell(t, 0, j, h, 6.5, True, GREY, LBL_BG)
    for i, a in enumerate(['Claimant', 'Verified by (Admin)', 'Approved by'], 1):
        cell(t, i, 0, a, 7, True, NAVY, LBL_BG)
        for j in (1, 2, 3):
            tall(cell(t, i, j), 14)
    note(doc, 'The claimant certifies that the work and expenses above are true and were incurred on company business.')

    # ── ท้ายกระดาษ ──
    fp = doc.sections[0].footer.paragraphs[0]
    fp.alignment = WD_ALIGN_PARAGRAPH.LEFT
    r = fp.add_run('D-0507 Flight Training Co., Ltd.  |  MONTHLY REIMBURSEMENT FORM  |  ' + CODE + '  '
                   + ISSREV + '  EFF: ' + EFF + '  |  Controlled Copy — Uncontrolled when printed')
    r.font.name = 'Arial'; r.font.size = Pt(6.5)
    r.font.color.rgb = RGBColor.from_string(GREY)

    doc.save(OUT)
    print('เขียน', os.path.basename(OUT), '·', CODE, '· EFF', EFF)


if __name__ == '__main__':
    build()
