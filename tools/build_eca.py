# -*- coding: utf-8 -*-
"""สร้าง D-0507-ECA-001.docx ฉบับแก้ไข 01 โดยแก้ข้อความในโครงเดิม

   cd "<โฟลเดอร์ Manual revision>" && python3 d0507-forms/tools/build_eca.py

⚠️ รันได้ครั้งเดียวจากฉบับ Rev 00 — สคริปต์คาดว่าตารางมี 25 แถวและจะหยุดถ้าไม่ใช่
   รันซ้ำกับฉบับที่แก้แล้ว (24 แถว) จะขึ้นข้อความเตือนแล้วออก ไม่ทำลายไฟล์
   ถ้าต้องแก้เนื้อหาอีก ให้กู้ฉบับ Rev 00 จาก archive ก่อน หรือแก้เอกสารตรง ๆ

ไม่สร้างเอกสารใหม่จากศูนย์ — เก็บ <w:tr> เดิมทุกแถวไว้ เพราะสีพื้น เส้นขอบ
ความกว้างคอลัมน์ และระยะขอบเซลล์อยู่ในนั้นทั้งหมด สร้างใหม่แล้วต้องไล่ตั้งเองทุกค่า
และจะเพี้ยนจากฉบับก่อนโดยไม่มีใครสังเกต
"""
import os, re, shutil, sys, zipfile, html

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from eca_content import FI, TKI, HEAD, PURPOSE, starnote, NOTE

SRC = 'D-0507-ECA-001.docx'
OUT = 'D-0507-ECA-001.docx'
ARCHIVE = 'D-0507-ECA-001-rev00-archive.docx'

TRE = re.compile(r'<w:tr\b.*?</w:tr>', re.S)
TCE = re.compile(r'<w:tc>.*?</w:tc>', re.S)
TXE = re.compile(r'(<w:t(?:\s[^>]*)?>)(.*?)(</w:t>)', re.S)


def esc(s):
    return html.escape(s, quote=False)


def set_cell(tc, texts):
    """ใส่ข้อความลง <w:t> ตามลำดับ ที่เหลือทำให้ว่าง

    ไม่ลบ run ทิ้ง เพราะ run พก rPr (ฟอนต์ ขนาด สี ตัวหนา) ไว้
    ลบแล้วต้องสร้างใหม่ให้เหมือนเดิม ซึ่งพลาดง่ายกว่าปล่อยให้ว่าง
    """
    i = [0]
    def rep(m):
        k = i[0]; i[0] += 1
        v = texts[k] if k < len(texts) else ''
        open_tag = m.group(1)
        if ' ' not in open_tag:                      # ต้องมี xml:space ไม่งั้น Word ตัดช่องว่างท้าย
            open_tag = '<w:t xml:space="preserve">'
        return open_tag + esc(v) + m.group(3)
    return TXE.sub(rep, tc)


def set_row(tr, per_cell):
    """per_cell = list ของ list ข้อความ หนึ่งชุดต่อหนึ่งเซลล์"""
    j = [0]
    def rep(m):
        k = j[0]; j[0] += 1
        return set_cell(m.group(0), per_cell[k]) if k < len(per_cell) else m.group(0)
    out = TCE.sub(rep, tr)
    if j[0] != len(per_cell):
        raise SystemExit('เซลล์ไม่ตรง: แถวมี %d ต้องการ %d' % (j[0], len(per_cell)))
    return out


def main():
    zin = zipfile.ZipFile(SRC)
    doc = zin.read('word/document.xml').decode('utf-8')
    tbl_m = re.search(r'<w:tbl>.*?</w:tbl>', doc, re.S)
    tbl = tbl_m.group(0)
    rows = TRE.findall(tbl)
    if len(rows) != 25:
        raise SystemExit('คาดว่ามี 25 แถว พบ %d — โครงเอกสารเปลี่ยนไป หยุดก่อน' % len(rows))
    # เก็บฉบับเดิม *หลัง* ตรวจแล้วเท่านั้น และห้ามเขียนทับของที่มีอยู่
    # เดิมคัดลอกก่อนตรวจ พอรันซ้ำกับฉบับที่แก้แล้ว ฉบับก่อนหน้าถูกทับหายไปเลย
    # ทั้งที่บรรทัดถัดมาจะหยุดเองอยู่แล้ว — ลำดับผิดสองบรรทัด เสียเอกสารควบคุมหนึ่งฉบับ
    if os.path.exists(ARCHIVE):
        raise SystemExit('มี %s อยู่แล้ว — ย้ายออกก่อนถ้าตั้งใจสร้างใหม่' % ARCHIVE)
    shutil.copy(SRC, ARCHIVE)

    new = list(rows)
    new[2] = set_row(rows[2], [[h] for h in HEAD])
    new[3] = set_row(rows[3], [['PURPOSE: ', PURPOSE]])
    new[5] = set_row(rows[5], [['★ = Safety-critical area. ',
                                starnote('FI', 'Safety and Airmanship')]])
    for n, area in enumerate(FI):
        new[7 + n] = set_row(rows[7 + n], [[v] for v in area])
    new[15] = set_row(rows[15], [['★ = Safety-critical area. ',
                                  starnote('TKI', 'Delivery')]])
    for n, area in enumerate(TKI):                       # TKI 6 หัวข้อ แถวเดิมมี 7
        new[17 + n] = set_row(rows[17 + n], [[v] for v in area])
    new[24] = set_row(rows[24], [['NOTE: ', NOTE]])
    drop = {23}                                          # แถวเกินของภาค B — D.2.9.5 มี 6 หัวข้อ
    out_rows = [r for i, r in enumerate(new) if i not in drop]

    body = tbl
    for old, rep in zip(rows, new):
        if old != rep:
            body = body.replace(old, rep, 1)
    body = body.replace(new[23], '', 1)                   # ตัดแถวที่เกิน
    doc = doc[:tbl_m.start()] + body + doc[tbl_m.end():]

    left = len(TRE.findall(body))
    if left != 24:
        raise SystemExit('หลังแก้ควรเหลือ 24 แถว พบ %d' % left)

    with zipfile.ZipFile(OUT + '.tmp', 'w', zipfile.ZIP_DEFLATED) as zo:
        for it in zin.infolist():
            data = zin.read(it.filename)
            if it.filename == 'word/document.xml':
                data = doc.encode('utf-8')
            elif it.filename in ('word/header1.xml', 'word/footer1.xml'):
                t = data.decode('utf-8')
                t = t.replace('IM-ECA-301-A', 'IM-ECA-301-B')
                t = t.replace('Issue 01 Rev 00', 'Issue 01 Rev 01')
                t = t.replace('Issue 01 / Rev 00', 'Issue 01 / Rev 01')
                t = t.replace('D.2.9.1', 'D.2.9.5')
                data = t.encode('utf-8')
            zo.writestr(it, data)
    shutil.move(OUT + '.tmp', OUT)
    print('เขียน %s · เก็บฉบับเดิมไว้ที่ %s' % (OUT, ARCHIVE))
    print('แถว %d · FI %d หัวข้อ · TKI %d หัวข้อ' % (left, len(FI), len(TKI)))


main()
