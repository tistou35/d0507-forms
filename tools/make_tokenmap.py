#!/usr/bin/env python3
# ============================================================
# make_tokenmap.py — สร้างแผนที่ token จากนิยามฟอร์ม + .docx ต้นฉบับ
#
#   python3 tools/make_tokenmap.py            # ทุกใบที่มีนิยามฟอร์ม
#   python3 tools/make_tokenmap.py VSR HIF
#   python3 tools/make_tokenmap.py -v VSR     # บอกเหตุผลที่จับคู่ไม่ได้
#
# ผลลัพธ์: gas/TokenMap.gs  — ข้อมูลที่ ImportTemplate.gs ใช้เติม token
# ลงใน Google Doc ที่แปลงมาจาก .docx โดยตรง เลย์เอาต์จึงตรงต้นฉบับ 100%
#
# แผนที่มีสามส่วน เพราะกระดาษวางช่องกรอกไว้สามแบบ
#   byLabel  ป้ายอยู่ในเซลล์ ช่องกรอกอยู่เซลล์ถัดไป -> "Name" | ____
#   byLine   ป้ายกับเส้นประอยู่บรรทัดเดียวกันในเซลล์ -> "Signature: ______"
#   boxes    ช่องติ๊ก ☐ เรียงตามลำดับที่ปรากฏ
#
# ที่จับคู่ไม่ได้จะถูกส่งต่อไปให้ ImportTemplate.gs พิมพ์ท้ายเอกสาร
# ให้คนวางมือ — ดีกว่าเดาแล้ววางผิดช่องโดยไม่มีใครรู้
# ============================================================
import json, os, re, sys, glob, unicodedata

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DOCX = os.path.dirname(HERE)          # โฟลเดอร์ Manual revision

_ovp = os.path.join(HERE, 'formdefs', '_TOKENMAP_OVERRIDES.json')
OVERRIDES = json.load(open(_ovp, encoding='utf-8')) if os.path.exists(_ovp) else {}

# คำพ้องความหมาย — กระดาษกับนิยามฟอร์มเรียกของเดียวกันคนละชื่อ
SYN = {
    'signature': ['sign', 'signed', 'ลายเซ็น', 'ลงชื่อ'],
    'name':      ['ชื่อ', 'print'],
    'date':      ['วันที่', 'dated'],
    'comment':   ['remark', 'ความเห็น', 'หมายเหตุ'],
    'other':     ['อื่น', 'specify', 'ระบุ'],
}
STOP = {'the', 'of', 'a', 'to', 'if', 'no', 'or', 'and', 'optional', 'please', 'print'}


def norm(s):
    """ตัดเครื่องหมายและช่องว่างออก เทียบป้ายในเอกสารกับป้ายในนิยามฟอร์ม"""
    s = unicodedata.normalize('NFKC', str(s or '')).lower()
    s = re.sub(r'\(.*?\)', ' ', s)                 # ตัดวงเล็บอธิบาย
    s = re.sub(r'[^a-z0-9฀-๿]+', ' ', s)
    return s.strip()


def norm_full(s):
    """เหมือน norm แต่เก็บข้อความในวงเล็บไว้

    PWR มีทั้ง "ID / Passport No." และ "ID / Passport No. (Guardian)"
    ถ้าตัดวงเล็บทิ้งสองอันนี้จะกลายเป็นอันเดียวกัน แล้ววาง token ผิดแถว
    """
    s = unicodedata.normalize('NFKC', str(s or '')).lower()
    s = re.sub(r'[^a-z0-9฀-๿]+', ' ', s)
    return s.strip()


def words(s):
    """ชุดคำสำหรับให้คะแนนความใกล้เคียง รวมคำพ้องเข้าไปด้วย"""
    w = set(x for x in norm(s).split() if x and x not in STOP)
    for key, alts in SYN.items():
        if w & ({key} | set(alts)):
            w |= {key}
    return w


# คำที่กว้างเกินกว่าจะชี้ชัดได้ด้วยตัวเอง — "Name" เฉย ๆ ตรงกับได้หลายช่อง
GENERIC = {'name', 'date', 'time', 'signature', 'no', 'other'}


def score(a, b):
    """สัดส่วนคำที่ทับกัน — 1.0 คือเหมือนกันทุกคำ

    b คือป้ายบนกระดาษ มักสั้นกว่าป้ายในนิยามฟอร์ม ("Other" กับ "Other — specify")
    ถ้าคำของ b อยู่ใน a ครบและไม่ได้กว้างจนชี้ชัดไม่ได้ ให้ถือว่าใกล้เคียงมาก
    """
    wa, wb = words(a), words(b)
    if not wa or not wb: return 0.0
    base = len(wa & wb) / max(len(wa), len(wb))
    if wb <= wa and not wb <= GENERIC:
        return max(base, 0.8)
    return base


def docx_parts(path):
    """คืน (เซลล์ทั้งหมดตามลำดับ, บรรทัดที่มีเส้นประให้กรอก)"""
    import docx
    d = docx.Document(path)
    cells, lines = [], []
    for t in d.tables:
        for r in t.rows:
            seen = []
            for c in r.cells:
                if c._element in seen: continue
                seen.append(c._element)
                txt = c.text.strip()
                cells.append(txt)
                # "Signature: _______" / "☐ Other: ______" — ป้ายกับเส้นประอยู่ด้วยกัน
                # ไม่บังคับว่าต้องเต็มบรรทัด เพราะบางใบวางไว้กลางประโยครวมกับช่องติ๊ก
                for ln in txt.split('\n'):
                    for m in re.finditer(r'([^\n:：_☐]{2,40}?)\s*[:：]\s*(_{3,})', ln):
                        lines.append((m.group(1).strip(), m.group(2)))
                    m = re.match(r'^\s*([^_:：]{2,60}?)\s*(_{4,})\s*$', ln)   # ไม่มีโคลอน
                    if m: lines.append((m.group(1).strip(), m.group(2)))
    return cells, lines


def field_anchor(f):
    """ข้อความที่ใช้ค้นหาในเอกสาร — ชนิดช่องบอกใบ้ได้ว่าป้ายในกระดาษน่าจะเขียนว่าอะไร"""
    lab = (f.get('label') or {}).get('en') or ''
    if f.get('type') == 'sign' and 'sign' not in lab.lower():
        lab += ' signature'
    return lab


def build(abbr, verbose=False):
    fp = os.path.join(HERE, 'formdefs', abbr + '.json')
    dp = os.path.join(DOCX, 'D-0507-%s-001.docx' % abbr)
    if not os.path.exists(fp): return None, ['ไม่มีนิยามฟอร์ม'], None
    if not os.path.exists(dp): return None, ['ไม่มี .docx ต้นฉบับ'], None

    d = json.load(open(fp, encoding='utf-8'))
    # ส่วนอนุมัติเป็นของที่ระบบเพิ่มเข้ามา กระดาษเดิมส่วนใหญ่ไม่มี
    # จับคู่ไม่ได้เป็นเรื่องปกติ ต้องต่อท้ายเอกสารให้เอง ไม่ใช่ค้างไว้ให้วางมือ
    apParty = (d.get('route') or [{}, {}])[1].get('party') if len(d.get('route') or []) > 1 else None
    fields = []
    for s in d.get('sections', []):
        for f in s.get('fields', []):
            f = dict(f, _ap=(s.get('party') == apParty and apParty))
            fields.append(f)
    cells, lines = docx_parts(dp)
    short = [c for c in cells if c and len(c) < 90]
    # เก็บสองชั้น: ชั้นเต็มไว้แยกป้ายที่ต่างกันแค่วงเล็บ ชั้นย่อไว้จับคู่หลวม ๆ
    cellfull, cellset = {}, {}
    for c in short: cellfull.setdefault(norm_full(c), c)
    for c in short: cellset.setdefault(norm(c), c)
    # ป้ายเดียวกันโผล่ได้หลายที่ ("Phone Number" ของผู้โดยสารและของผู้ปกครอง)
    # จับคู่ได้เท่าจำนวนที่มีจริง ฝั่ง Apps Script จะไล่หาอันถัดไปเอง
    avail = {}
    for c in short: avail[c] = avail.get(c, 0) + 1

    by_label, by_line, boxes, unmatched, approval = [], [], [], [], []
    used_lines = set()

    def take(c):
        """จองเซลล์นี้ไว้หนึ่งครั้ง คืน True ถ้ายังเหลือให้จอง"""
        if avail.get(c, 0) <= 0: return False
        avail[c] -= 1
        return True

    for f in fields:
        if f.get('type') == 'static':
            continue
        tok = '{{sig_%s}}' % f['k'] if f.get('type') == 'sign' else '{{%s}}' % f['k']

        # ช่องติ๊กและตัวเลือก — เก็บไว้ใส่แทน ☐ ตามลำดับ
        if f.get('type') == 'check':
            boxes.append({'tok': '{{k_%s}}' % f['k'], 'label': (f.get('label') or {}).get('en') or ''})
            continue
        if f.get('type') in ('select', 'multi') and f.get('opt'):
            for o in f['opt']:
                boxes.append({'tok': '{{k_%s_%s}}' % (f['k'], o['v']),
                              'label': (o.get('n') or {}).get('en') or o['v']})
            continue

        # เกรด 1–5 — กระดาษพิมพ์เป็น ☐ ห้าช่องต่อหนึ่งหัวข้อ แล้วมีช่องเขียนเกรดต่อท้าย
        if f.get('type') == 'grade':
            for n in range(1, (f.get('max') or 5) + 1):
                boxes.append({'tok': '{{k_%s_%s}}' % (f['k'], n),
                              'label': '%s = %d' % ((f.get('label') or {}).get('en') or f['k'], n)})
            continue

        # ตารางให้คะแนน — หนึ่งข้อได้ ☐ เท่าจำนวนคอลัมน์ เรียงซ้ายไปขวาเหมือนกระดาษ
        if f.get('type') == 'checklist':
            opts = f.get('opts') or [{'v': 'S'}, {'v': 'U'}, {'v': 'NA'}]
            for it in f.get('items') or []:
                for o in opts:
                    boxes.append({'tok': '{{k_%s_%s_%s}}' % (f['k'], it['id'], o['v']),
                                  'label': '%s · %s' % (it.get('en') or it['id'],
                                                        (o.get('n') or {}).get('en') or o['v'])})
            continue

        # แถวซ้ำ — token ต่อช่อง ต่อแถว ตามที่ flatten_ แตกไว้ฝั่ง Apps Script
        if f.get('type') == 'table':
            for r in range(1, (f.get('rows') or 1) + 1):
                for c in f.get('cols') or []:
                    unmatched.append({
                        'tok': '{{%s_%d_%s}}' % (f['k'], r, c['k']),
                        'label': '%s แถว %d · %s' % ((f.get('label') or {}).get('en') or f['k'],
                                                     r, (c.get('label') or {}).get('en') or c['k']),
                        'labelTh': '', 'sign': False})
            continue

        lab_en, lab_th = (f.get('label') or {}).get('en'), (f.get('label') or {}).get('th')
        en, th = norm(lab_en), norm(lab_th)
        anchor = field_anchor(f)

        # 1) ป้ายตรงเป๊ะ — ลองแบบเก็บวงเล็บก่อน แล้วค่อยแบบตัดวงเล็บ
        hit = next((cellfull[x] for x in (norm_full(lab_en), norm_full(lab_th))
                    if x and x in cellfull and avail.get(cellfull[x], 0) > 0), None)
        if not hit:
            hit = next((cellset[x] for x in (en, th)
                        if x and x in cellset and avail.get(cellset[x], 0) > 0), None)
        if hit and take(hit):
            by_label.append({'label': hit, 'tok': tok})
            continue

        # 2) บรรทัดเส้นประในเซลล์ — "Signature: ______"
        best, bs = None, 0.55
        for i, (lab, _und) in enumerate(lines):
            if i in used_lines: continue
            s = max(score(anchor, lab), score((f.get('label') or {}).get('th') or '', lab))
            if s > bs: best, bs = i, s
        if best is not None:
            lab, und = lines[best]
            used_lines.add(best)
            by_line.append({'label': lab, 'und': len(und), 'tok': tok})
            continue

        # 3) เซลล์ที่ใกล้เคียงพอ — ไม่ใช่ตรงเป๊ะแต่ชัดว่าอันเดียวกัน
        best, bs = None, 0.7
        for orig in cellset.values():
            if avail.get(orig, 0) <= 0: continue
            s = max(score(anchor, orig), score(lab_th or '', orig))
            if s > bs: best, bs = orig, s
        if best and take(best):
            by_label.append({'label': best, 'tok': tok})
            continue

        rec = {'tok': tok, 'label': (f.get('label') or {}).get('en') or f['k'],
               'labelTh': (f.get('label') or {}).get('th') or '',
               'sign': f.get('type') == 'sign'}
        (approval if f.get('_ap') else unmatched).append(rec)

    n_box_docx = sum(c.count('☐') for c in cells)

    ov = OVERRIDES.get(abbr) or {}
    for lab, tok in (ov.get('labels') or {}).items():
        by_label = [b for b in by_label if b['label'] != lab and b['tok'] != tok]
        by_label.append({'label': lab, 'tok': tok})
    skip = set(ov.get('skip') or [])
    if skip:
        boxes = [b for b in boxes if b['tok'] not in skip]
        unmatched = [u for u in unmatched if u['tok'] not in skip]
    if ov.get('boxes'):
        # เรียงเองตามที่ ☐ อยู่จริงในกระดาษ — ที่ไม่ได้ระบุถือว่าไม่มีช่องให้ติ๊ก
        want = ov['boxes']
        known = {b['tok']: b for b in boxes}
        boxes = [known.get(t, {'tok': t, 'label': ''}) for t in want]

    return {
        'abbr': abbr,
        'docx': 'D-0507-%s-001.docx' % abbr,
        'byLabel': by_label,
        'byLine': by_line,
        'boxes': boxes,
        'boxesInDocx': n_box_docx,
        'approval': approval,
        'manual': unmatched,
    }, unmatched, lines


def main():
    argv = [a for a in sys.argv[1:] if not a.startswith('-')]
    verbose = '-v' in sys.argv
    codes = argv or sorted(
        os.path.basename(p)[:-5]
        for p in glob.glob(os.path.join(HERE, 'formdefs', '*.json'))
        if not os.path.basename(p).startswith('_'))

    maps, report = {}, []
    for a in codes:
        m, note, lines = build(a, verbose)
        if not m:
            report.append('%-6s ข้าม — %s' % (a, note[0])); continue
        maps[a] = m
        auto = len(m['byLabel']) + len(m['byLine'])
        warn = ''
        if len(m['boxes']) != m['boxesInDocx']:
            warn = '  ⚠️ ช่องติ๊กในนิยามฟอร์ม %d ≠ ☐ ในเอกสาร %d' % (len(m['boxes']), m['boxesInDocx'])
        report.append('%-6s วางอัตโนมัติ %2d (เซลล์ %d · เส้นประ %d) · ต่อท้ายส่วนอนุมัติ %d · วางมือ %d · ช่องติ๊ก %d%s'
                      % (a, auto, len(m['byLabel']), len(m['byLine']),
                         len(m['approval']), len(note), len(m['boxes']), warn))
        if note:
            report.append('       ต้องวางมือ: ' + ', '.join(x['label'] for x in note[:6])
                          + (' …อีก %d' % (len(note) - 6) if len(note) > 6 else ''))
        if verbose and lines:
            report.append('       เส้นประในเอกสาร: ' + ' · '.join(l for l, _ in lines))

    out = os.path.join(HERE, 'gas', 'TokenMap.gs')
    with open(out, 'w', encoding='utf-8') as fh:
        fh.write('/**\n * TokenMap.gs — สร้างอัตโนมัติจาก tools/make_tokenmap.py\n'
                 ' * อย่าแก้ด้วยมือ · แก้ที่นิยามฟอร์มแล้วรันเครื่องมือใหม่\n'
                 ' *\n'
                 ' * byLabel  ป้ายในเซลล์ -> token ที่ใส่ในเซลล์ถัดไปทางขวา\n'
                 ' * byLine   "ป้าย: ______" ในเซลล์ -> แทนเส้นประด้วย token\n'
                 ' * boxes    token ช่องติ๊ก เรียงตามลำดับที่ ☐ ปรากฏ\n'
                 ' * manual   จับคู่ไม่ได้ ต้องวางมือ — สคริปต์พิมพ์ไว้ท้ายเอกสาร\n */\n')
        fh.write('var TOKEN_MAP = ' + json.dumps(maps, ensure_ascii=False, indent=2) + ';\n')

    print('\n'.join(report))
    print('\nเขียน gas/TokenMap.gs — %d ฟอร์ม' % len(maps))


if __name__ == '__main__':
    main()
