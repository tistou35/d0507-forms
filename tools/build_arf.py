#!/usr/bin/env python3
# ============================================================
# build_arf.py — เขียน D-0507-ARF-001.docx (Attendance Record) ฉบับกระดาษ
#
#   python3 tools/build_arf.py
#
# ── ทำไม ─────────────────────────────────────────────────────
# TM 1.2.2 สั่งให้ลงเวลาเรียนด้วย QR ที่ครูผู้สอนเปิดให้ตอนจบคาบ และ TM 5.6 / LEF
# อ้าง IM-ARF-301-A ซึ่งเป็น Jotform "D0507 record" (93281549887475) ที่ไม่มีไฟล์ .docx
# ฉบับนั้นให้แต่ละคนเลือกหลักสูตรและพิมพ์ชื่อวิชาเอง ไม่มีครูผู้สอน ไม่มีคาบเรียน
# วิชาเดียวกันจึงถูกบันทึกเป็น "060" บ้าง "Navigation" บ้าง และตอบไม่ได้ว่าคาบไหนใครเข้า
#
# ฉบับนี้เป็นใบของคาบเรียน — หัวใบคือข้อมูลคาบที่ครูกรอกครั้งเดียว ตารางคือผู้เข้าเรียน
# ที่ลงชื่อเอง และปิดท้ายด้วยครูรับรอง ระบบออนไลน์เก็บแบบเดียวกัน (attSessions + ใบ ARF
# รายคน) และพิมพ์ใบสรุปคาบหน้าตาเดียวกับใบนี้ ฉบับกระดาษใช้เมื่อระบบใช้ไม่ได้
#
# เนื้อหาเปลี่ยนจากฉบับ -A (Jotform) จึงเป็น ISSUE 01 / REVISION 01 และเลื่อนเป็น -B
# ============================================================
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import docx
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.shared import Mm, Pt, RGBColor

from build_app import (add_table, band, field_block, gap, no_borders, section, shade, write,
                       NAVY, LBL_BG, DECL_BG, HEAD_BG, GREY)
from docx.oxml import OxmlElement
from docx.oxml.ns import qn


def set_grid(t, widths):
    """ความกว้างคอลัมน์ต้องอยู่ใน w:tblGrid ด้วย — Google Docs อ่านจากตรงนั้น ไม่ได้อ่านจากแต่ละช่อง
    ไม่ตั้ง = แบ่งเท่ากันทุกคอลัมน์ ช่องชื่อผู้เข้าเรียนจะแคบเท่าช่องลำดับ"""
    g = t._tbl.tblGrid
    for c in list(g):
        g.remove(c)
    for w in widths:
        e = OxmlElement('w:gridCol'); e.set(qn('w:w'), str(int(w * 56.7))); g.append(e)

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(os.path.dirname(HERE), 'D-0507-ARF-001.docx')

CODE, EFF, ISSREV = 'IM-ARF-301-B', '10 NOV 2026', 'ISSUE NO. 01/REVISION NO. 01'
ROWS = 18
CERTIFY = ('I certify that the persons listed above attended this session in full, '
           'except any entry I have struck through and initialled.')


def build():
    doc = docx.Document()
    s = doc.sections[0]
    s.page_width, s.page_height = Mm(210), Mm(297)
    s.left_margin = s.right_margin = Mm(16)
    s.top_margin, s.bottom_margin = Mm(14), Mm(14)
    st = doc.styles['Normal']
    st.font.name = 'Arial'; st.font.size = Pt(8.5)

    # ── หัวเอกสาร ──
    t = add_table(doc, 1, 2, [104, 74])
    set_grid(t, [104, 74])
    no_borders(t)
    c = t.rows[0].cells[0]
    shade(c, HEAD_BG)
    p = write(c, 'D-0507 Flight Training Co., Ltd.', 10, True, NAVY)
    r = p.add_run('\nApproved Training Organisation (ATO)')
    r.font.name = 'Arial'; r.font.size = Pt(7.5); r.font.color.rgb = RGBColor.from_string(GREY)
    c2 = t.rows[0].cells[1]
    p = write(c2, CODE + '    EFF: ' + EFF, 7.5, False, GREY, align=WD_ALIGN_PARAGRAPH.RIGHT)
    r = p.add_run('\n' + ISSREV + '\nInstruction (IM)  ·  TM 1.2.2')
    r.font.name = 'Arial'; r.font.size = Pt(7); r.italic = True
    r.font.color.rgb = RGBColor.from_string(GREY)
    gap(doc)

    band(doc, 'ATTENDANCE RECORD',
         'One sheet per session  ·  Attendees sign at the end of the session  ·  '
         'Online: scan the QR code shown by the instructor')
    gap(doc)

    # ── ข้อมูลคาบเรียน (ครูกรอกครั้งเดียว) ──
    section(doc, 'SESSION DETAILS — completed by the instructor')
    field_block(doc, [
        [('Course:', 1), ('Subject / Lesson:', 1)],
        [('Topic / Content covered:', 1)],
        [('Date:', 1), ('Time From – To  ·  Duration (hrs):', 1)],
        [('Delivery:  ☐ Classroom   ☐ Video call   ☐ E-learning', 1), ('Location / Platform:', 1)],
        [('Instructor Name:', 1), ('Instructor Position:', 1)],
    ])
    gap(doc)

    # ── ผู้เข้าเรียน ──
    section(doc, 'ATTENDEES — sign at the end of the session')
    widths = [10, 66, 30, 22, 50]
    t = add_table(doc, ROWS + 1, 5, widths)
    set_grid(t, widths)
    for j, h in enumerate(['No.', 'Attendee Name', 'Student / Staff / Other', 'Time', 'Signature']):
        c = t.rows[0].cells[j]
        shade(c, LBL_BG); write(c, h, 7.5, True, GREY)
    for i in range(1, ROWS + 1):
        bg = 'FFFFFF' if i % 2 else 'FAFAFA'
        for j in range(5):
            c = t.rows[i].cells[j]
            shade(c, bg)
            write(c, str(i) if j == 0 else ' ', 7.5, False, GREY,
                  align=WD_ALIGN_PARAGRAPH.CENTER if j == 0 else None)
            c.paragraphs[0].paragraph_format.space_after = Pt(5)
    p = doc.add_paragraph()
    r = p.add_run('More attendees: continue on a second sheet with the same session details.')
    r.font.name = 'Arial'; r.font.size = Pt(6.5); r.italic = True
    r.font.color.rgb = RGBColor.from_string(GREY)
    p.paragraph_format.space_before = Pt(1); p.paragraph_format.space_after = Pt(4)

    # ── ครูรับรอง ──
    section(doc, 'INSTRUCTOR CERTIFICATION')
    t = add_table(doc, 1, 1)
    c = t.rows[0].cells[0]
    shade(c, DECL_BG); write(c, CERTIFY, 7.5, False, GREY, italic=True)
    gap(doc, 2)
    t = add_table(doc, 2, 3, [80, 49, 49])
    set_grid(t, [80, 49, 49])
    for j, lab in enumerate(['Instructor Signature:', 'Date:', 'Total Attendees:']):
        c = t.rows[0].cells[j]
        shade(c, LBL_BG); write(c, lab, 7.5, True, NAVY)
        c2 = t.rows[1].cells[j]
        shade(c2, 'FFFFFF'); write(c2, ' ')
        c2.paragraphs[0].paragraph_format.space_after = Pt(9)

    # ── ท้ายกระดาษ ──
    fp = doc.sections[0].footer.paragraphs[0]
    fp.alignment = WD_ALIGN_PARAGRAPH.LEFT
    r = fp.add_run('D-0507 Flight Training Co., Ltd.  |  ATTENDANCE RECORD  |  ' + CODE + '  '
                   + ISSREV + '  EFF: ' + EFF + '  |  Controlled Copy — Uncontrolled when printed')
    r.font.name = 'Arial'; r.font.size = Pt(6.5)
    r.font.color.rgb = RGBColor.from_string(GREY)

    doc.save(OUT)
    print('เขียน', os.path.basename(OUT), '·', CODE, '· EFF', EFF)


if __name__ == '__main__':
    build()
