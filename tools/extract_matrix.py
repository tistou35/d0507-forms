#!/usr/bin/env python3
# ============================================================
# extract_matrix.py — ดึงตารางให้คะแนนจาก .docx มาเป็น JSON
#
#   python3 tools/extract_matrix.py SEF
#
# ใช้กับใบที่เป็นตาราง "หัวข้อ | ☐ | ☐ | ☐ …" ยาว ๆ (EFM · EFC · SEF)
# พิมพ์เองทีละแถวเสี่ยงตกหล่นและสลับลำดับ ซึ่งกว่าจะรู้ก็ตอนเทียบกระดาษแล้ว
#
# กติกาที่ใช้แยกแถว
#   แถวที่ช่องแรกมีข้อความ ที่เหลือเป็น ☐ ล้วน  -> หัวข้อประเมินหนึ่งข้อ
#   แถวที่มีช่องเดียว                          -> หัวข้อกลุ่ม
#   แถวแรกที่ช่องหลัง ๆ ไม่ใช่ ☐                -> ชื่อคอลัมน์ (ตัวเลือกคะแนน)
# ============================================================
import docx, json, re, sys, os

DOCX = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


def cells(row):
    seen, out = [], []
    for c in row.cells:
        if c._element in seen: continue
        seen.append(c._element)
        out.append(re.sub(r'\s+', ' ', c.text.strip()))
    return out


def slug(s, n=1):
    w = re.sub(r'[^a-z0-9 ]', '', s.lower()).split()
    return ''.join(x[:1].upper() + x[1:] for x in w[:4]) or ('i%d' % n)


def extract(abbr):
    d = docx.Document(os.path.join(DOCX, 'D-0507-%s-001.docx' % abbr))
    out = []
    for ti, t in enumerate(d.tables):
        cols, group, items = None, None, []
        for r in t.rows:
            cs = cells(r)
            box = [c for c in cs[1:] if c]
            if len(cs) == 1 or not box:
                if cs and cs[0]:
                    group = cs[0]
                continue
            if all(c == '☐' for c in box):
                items.append({'group': group, 'label': cs[0].rstrip(':'), 'n': len(box)})
            elif cols is None and len(box) >= 2:
                cols = cs[1:]
        if items:
            out.append({'table': ti, 'cols': cols, 'items': items})
    return out


if __name__ == '__main__':
    for a in sys.argv[1:]:
        print('=' * 60, a)
        for blk in extract(a):
            print('table %d · คอลัมน์ %s · %d ข้อ' % (blk['table'], blk['cols'], len(blk['items'])))
            g = None
            for it in blk['items']:
                if it['group'] != g:
                    g = it['group']; print('  [%s]' % g)
                print('    %-28s %s' % (slug(it['label']), it['label'][:80]))
