# -*- coding: utf-8 -*-
"""D-0507-PWR-001 ฉบับแก้ไข 03 — เพิ่มความยินยอมและลายเซ็นของผู้ปกครอง

   cd "<โฟลเดอร์ Manual revision>" && python3 d0507-forms/tools/build_pwr.py

ใบเดิมให้ผู้ปกครองแค่ "กรอกข้อมูลติดต่อ" ใน SECTION B แล้วเซ็นแทนผู้เยาว์ในช่อง
ลายเซ็นผู้โดยสาร ไม่มีข้อความยินยอมของตัวเองและไม่มีช่องลงนามแยก อ่านจากใบที่
กรอกเสร็จแล้วจึงแยกไม่ออกว่าใครเซ็น และไม่มีหลักฐานว่าผู้ปกครองยินยอมให้ผู้เยาว์ขึ้นบิน

⚠️ รันได้ครั้งเดียวจากฉบับ Rev 02 (ตาราง 22 แถว) รันซ้ำจะหยุดเองและไม่แตะไฟล์
   เก็บฉบับเดิมไว้ที่ D-0507-PWR-001-rev02-archive.docx และจะไม่เขียนทับถ้ามีอยู่แล้ว
"""
import os, re, shutil, zipfile, html

SRC = OUT = 'D-0507-PWR-001.docx'
ARCHIVE = 'D-0507-PWR-001-rev02-archive.docx'

TRE = re.compile(r'<w:tr\b.*?</w:tr>', re.S)
TCE = re.compile(r'<w:tc>.*?</w:tc>', re.S)
TXE = re.compile(r'(<w:t(?:\s[^>]*)?>)(.*?)(</w:t>)', re.S)

CONSENT = ('☐  GUARDIAN CONSENT — I am the parent or legal guardian of the passenger named in '
           'Section A. I have read clauses 1 to 4 above and I accept them on behalf of the minor. '
           'I consent to the minor participating in this flight as a passenger and I accept all '
           'obligations set out in this waiver.')

GSIG = ['Parent / Legal Guardian Signature',
        '(Required when the passenger is under 18 years of age)',
        'Signature: ___________________________________',
        'Name (Print): ________________________________',
        'Date Signed:  ___ / ___ / ______']
GNOTE = ['For minor passengers only',
         'Leave this block blank if the passenger is 18 years of age or over.', '', '']

ARCHIVING = ('ARCHIVING: Original filed in Administration records. Retain per OMA A.10.  |  '
             'Online: tistou35.github.io/d0507-forms (PWR)  |  AD/PWR/301-D  |  Issue 01 Rev 03')


def esc(s):
    return html.escape(s, quote=False)


def set_cell(tc, texts):
    """ใส่ข้อความลง <w:t> ตามลำดับ ที่เหลือทำให้ว่าง — ไม่ลบ run เพราะ run พก rPr ไว้"""
    i = [0]
    def rep(m):
        k = i[0]; i[0] += 1
        tag = m.group(1)
        if ' ' not in tag:
            tag = '<w:t xml:space="preserve">'
        return tag + esc(texts[k] if k < len(texts) else '') + m.group(3)
    return TXE.sub(rep, tc)


def set_row(tr, per_cell):
    j = [0]
    def rep(m):
        k = j[0]; j[0] += 1
        return set_cell(m.group(0), per_cell[k]) if k < len(per_cell) else m.group(0)
    out = TCE.sub(rep, tr, )
    if j[0] != len(per_cell):
        raise SystemExit('เซลล์ไม่ตรง: แถวมี %d ต้องการ %d' % (j[0], len(per_cell)))
    return out


FOOTER = ('D-0507-PWR-001  |  AD/PWR/301-D  |  Issue 01 Rev 03  |  '
          'EFF: 21 AUG 2026  |  Page ')


def footer_(xml):
    """เขียนบรรทัดท้ายกระดาษใหม่ โดยไม่แตะ run ที่เป็นของฟิลด์เลขหน้า

    ท้ายกระดาษเดิมค้างที่ Rev 00 / AD/PWR/301-A ขณะที่ตัวเอกสารเป็น Rev 02 / -C
    เลขกำกับสองชุดบนใบเดียวคือสิ่งที่ผู้ตรวจสอบเห็นทันที

    ข้อความถูกซอยเป็นหลาย run จากการตรวจคำ ใส่ข้อความทั้งหมดไว้ run แรก
    แล้วล้าง run ที่เหลือ "เฉพาะที่อยู่ก่อนฟิลด์" — run หลังฟิลด์เป็นผลที่ Word
    แคชไว้ ล้างแล้วตัวแปลงของ Drive ตอบ 500 ตรวจเจอตอนสร้าง PDF ฉบับแก้ไข 03
    """
    cut = xml.find('<w:fldChar')
    if cut < 0:
        raise SystemExit('ไม่พบฟิลด์เลขหน้าในท้ายกระดาษ — โครงเปลี่ยนไป')
    head, tail = xml[:cut], xml[cut:]
    i = [0]
    def rep(m):
        k = i[0]; i[0] += 1
        tag = m.group(1) if ' ' in m.group(1) else '<w:t xml:space="preserve">'
        return tag + (esc(FOOTER) if k == 0 else '') + m.group(3)
    return TXE.sub(rep, head) + tail


def main():
    zin = zipfile.ZipFile(SRC)
    doc = zin.read('word/document.xml').decode('utf-8')
    tbl_m = re.search(r'<w:tbl>.*?</w:tbl>', doc, re.S)
    tbl = tbl_m.group(0)
    rows = TRE.findall(tbl)
    if len(rows) != 22:
        raise SystemExit('คาดว่ามี 22 แถว พบ %d — โครงเอกสารเปลี่ยนไป หยุดก่อน' % len(rows))
    if os.path.exists(ARCHIVE):
        raise SystemExit('มี %s อยู่แล้ว — ย้ายออกก่อนถ้าตั้งใจสร้างใหม่' % ARCHIVE)
    shutil.copy(SRC, ARCHIVE)

    head = set_row(rows[2], [['D-0507-PWR-001'], ['Issue 01 / Rev 03'],
                             ['Ref: AD/PWR/301-D | EFF: 21 AUG 2026']])
    consent = set_row(rows[9], [[CONSENT]])          # ยืมโครงแถว ☐ เต็มความกว้าง
    gsig = set_row(rows[20], [GSIG, GNOTE])          # ยืมโครงแถวลายเซ็นสองช่อง
    archiving = set_row(rows[21], [[ARCHIVING]])

    tbl = tbl.replace(rows[2], head, 1)
    tbl = tbl.replace(rows[21], archiving, 1)
    # แทรกความยินยอมและลายเซ็นผู้ปกครองต่อท้าย SECTION B (หลังแถว ID ผู้ปกครอง)
    tbl = tbl.replace(rows[18], rows[18] + consent + gsig, 1)

    doc = doc[:tbl_m.start()] + tbl + doc[tbl_m.end():]
    if len(TRE.findall(tbl)) != 24:
        raise SystemExit('หลังแก้ควรมี 24 แถว พบ %d' % len(TRE.findall(tbl)))

    with zipfile.ZipFile(OUT + '.tmp', 'w', zipfile.ZIP_DEFLATED) as zo:
        for it in zin.infolist():
            data = zin.read(it.filename)
            if it.filename == 'word/document.xml':
                data = doc.encode('utf-8')
            elif it.filename == 'word/header1.xml':
                t = data.decode('utf-8').replace(
                    'PASSENGER WAIVER AND RELEASE FORM   —   CONTROLLED',
                    'PASSENGER WAIVER AND RELEASE FORM   —   AD/PWR/301-D   —   CONTROLLED')
                data = t.encode('utf-8')
            elif it.filename == 'word/footer1.xml':
                data = footer_(data.decode('utf-8')).encode('utf-8')
            zo.writestr(it, data)
    shutil.move(OUT + '.tmp', OUT)
    print('เขียน %s · เก็บฉบับเดิมไว้ที่ %s' % (OUT, ARCHIVE))


main()
