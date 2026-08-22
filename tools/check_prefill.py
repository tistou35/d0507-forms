#!/usr/bin/env python3
# ============================================================
# check_prefill.py — ตรวจค่าตั้งต้นที่ระบบอื่นจะส่งเข้าฟอร์ม
#
#   python3 tools/check_prefill.py PCR-FI payload.json     ตรวจแล้วพิมพ์ลิงก์
#   python3 tools/check_prefill.py PCR-FI -                อ่าน JSON จาก stdin
#   python3 tools/check_prefill.py --doc                   ตรวจ docs/ANNUAL_EVAL.md
#
# ── ทำไมต้องมี ───────────────────────────────────────────────
# ลิงก์ prefill ทิ้งคีย์ที่ไม่รู้จัก "เงียบ ๆ" โดยตั้งใจ — ส่งเกินมาแล้วไม่พัง
# ข้อดีคือระบบต้นทางอัปเดตก่อนได้ ข้อเสียคือพิมพ์ชื่อคีย์ผิดก็เงียบเหมือนกัน
# ฝั่งส่งจะเห็นแค่ช่องว่างเปล่าแล้วเดาไม่ถูกว่าพลาดตรงไหน ไฟล์นี้ทำให้มันดัง
#
# --doc ตรวจอีกชั้น: ตารางคีย์ใน docs/ANNUAL_EVAL.md ต้องตรงกับนิยามฟอร์มจริง
# สัญญาข้อมูลที่เน่าเงียบ ๆ อันตรายกว่าไม่มีสัญญา เพราะอีกฝั่งเขียนโค้ดตามมัน
# ============================================================
import base64, json, os, re, sys

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SITE = 'https://tistou35.github.io/d0507-forms'


def load(code):
    p = os.path.join(HERE, 'formdefs', code + '.json')
    if not os.path.exists(p):
        sys.exit('ไม่มีนิยามฟอร์ม %s' % code)
    return json.load(open(p, encoding='utf-8'))


def fields(d):
    """คีย์ทั้งหมดที่ฟอร์มรับ พร้อมชนิดและตัวเลือกที่อนุญาต"""
    out = {}
    for sec in d.get('sections', []):
        for f in sec.get('fields', []):
            out[f['k']] = f
    return out


def sendable(d):
    """คีย์ที่ระบบต้นทางส่งมาได้จริง

    บล็อกลายเซ็นถูกตัดทั้งบล็อก ไม่ใช่แค่ช่อง sign — ชื่อและวันที่ข้าง ๆ
    เป็นของคนที่กำลังเซ็น ณ ตอนนั้น ส่งมาล่วงหน้าคือการกรอกแทนเขา
    """
    out = {}
    for sec in d.get('sections', []):
        if any(f.get('type') == 'sign' for f in sec.get('fields', [])):
            continue
        for f in sec.get('fields', []):
            if f.get('type') == 'static':      # ข้อความอธิบาย ไม่ใช่ช่องกรอก
                continue
            out[f['k']] = f
    return out


def check(code, o):
    d = load(code)
    F = fields(d)
    # คีย์ที่ฟอร์มรับไว้เฉย ๆ เพื่อส่งต่อ ไม่ใช่ช่องกรอก (เช่น กุญแจของระบบอื่น)
    thru = {p['k'] if isinstance(p, dict) else p for p in (d.get('passthrough') or [])}
    err, warn = [], []
    for k, v in o.items():
        if k in thru:
            continue
        f = F.get(k)
        if not f:
            near = [x for x in F if x.lower().startswith(k[:3].lower())]
            err.append('คีย์ %r ไม่มีในฟอร์ม%s' % (k, ('  ใกล้เคียง: ' + ', '.join(near[:4])) if near else ''))
            continue
        t = f.get('type')
        if t == 'sign':
            err.append('คีย์ %r เป็นช่องลายเซ็น — ฝั่งรับตัดทิ้งเสมอ อย่าส่งมา' % k)
        elif f.get('opt'):
            ok = [str(x['v']) for x in f['opt']]
            if str(v) not in ok:
                err.append('คีย์ %r ค่า %r ไม่อยู่ในตัวเลือก: %s' % (k, v, ' '.join(ok)))
        elif t == 'date' and not re.fullmatch(r'\d{4}-\d{2}-\d{2}', str(v)):
            err.append('คีย์ %r ต้องเป็น YYYY-MM-DD ไม่ใช่ %r' % (k, v))
        elif t == 'grade':
            mx = f.get('max', 5)
            if not (isinstance(v, (int, float)) and 1 <= v <= mx):
                err.append('คีย์ %r ต้องเป็นเกรด 1–%s ไม่ใช่ %r' % (k, mx, v))
            elif f.get('star') and v < 3:
                warn.append('คีย์ %r เป็นข้อ safety-critical ได้ %s — ฟอร์มจะตัดว่าไม่ผ่านทันที' % (k, v))
        elif t == 'number' and not isinstance(v, (int, float)):
            err.append('คีย์ %r ต้องเป็นตัวเลข ไม่ใช่ %r' % (k, v))
        elif t == 'table' and not isinstance(v, list):
            err.append('คีย์ %r ต้องเป็นรายการแถว' % k)
    for k, f in sendable(d).items():
        if f.get('req') and k not in o and not f.get('showIf'):
            warn.append('ช่องบังคับ %r ไม่ได้ส่งมา — ผู้กรอกต้องกรอกเอง' % k)
    return err, warn


def link(code, o):
    raw = json.dumps(o, ensure_ascii=False, separators=(',', ':')).encode('utf-8')
    return '%s/fill/?c=%s&p=%s' % (SITE, code,
                                   base64.urlsafe_b64encode(raw).decode().rstrip('='))


def check_doc():
    """ตารางคีย์ในสัญญาต้องมีอยู่จริงในนิยามฟอร์ม และต้องครบ

    อ่านเฉพาะช่องแรกของตาราง markdown ที่เป็นชื่อคีย์ตัวเดียว
    ค่า enum อยู่ช่องขวาและมี backtick เหมือนกัน กวาดทั้งบรรทัดจะได้ขยะมา
    """
    p = os.path.join(HERE, 'docs', 'ANNUAL_EVAL.md')
    md = open(p, encoding='utf-8').read()
    body = md[md.index('## 4.'):md.index('## 5.')]
    bad = 0
    inherit = set()
    for code in ('PCR-FI', 'PCR-TKI', 'EFC'):
        F, S = fields(load(code)), sendable(load(code))
        blk = re.search(r'### %s —.*?(?=\n### |\Z)' % re.escape(code), body, re.S)
        if not blk:
            print('  🔴 ไม่พบหัวข้อ %s ในสัญญา' % code); bad += 1; continue
        txt = blk.group(0)
        keys = set()
        for line in txt.splitlines():
            cells = [c.strip() for c in line.split('|')]
            head = cells[1] if len(cells) > 2 else ''
            m = re.fullmatch(r'`([a-z][A-Za-z0-9]*)`', head)
            if m:
                keys.add(m.group(1))
                continue
            # ช่วงแบบ `g1`…`g7` — เขียนย่อไว้ในช่องแรกเหมือนกัน
            m = re.fullmatch(r'`([a-z]+)(\d+)`…`([a-z]+)(\d+)`', head.replace(' ', ''))
            if m:
                keys |= {'%s%d' % (m.group(1), i)
                         for i in range(int(m.group(2)), int(m.group(4)) + 1)}
        # หัวข้อที่เขียนว่า "เหมือน X ยกเว้น" สืบคีย์จากใบก่อนหน้า แล้วหักที่ระบุว่าไม่มี
        if re.search(r'เหมือน\s+\S+\s+ยกเว้น', txt):
            # "ไม่มี `a` `b` และ `c` — เหตุผล"  ตัวคั่นเป็นเว้นวรรคหรือ "และ" ก็ได้
            drop = {k for seg in re.findall(r'ไม่มี\s+((?:`[^`]+`|\s|และ)+)', txt)
                    for k in re.findall(r'`([a-z][A-Za-z0-9]*)`', seg)}
            keys |= (inherit - drop)
        inherit = keys
        miss = sorted(k for k in keys if k not in F)
        gap = sorted(k for k in S if k not in keys)
        if miss:
            print('  🔴 %s สัญญาอ้างคีย์ที่ไม่มีในฟอร์ม: %s' % (code, ' '.join(miss))); bad += 1
        if gap:
            print('  🔴 %s ฟอร์มมีช่องที่สัญญาไม่ได้บอก: %s' % (code, ' '.join(gap))); bad += 1
        if not miss and not gap:
            print('  ✅ %-8s สัญญากับนิยามฟอร์มตรงกันครบ %d คีย์' % (code, len(keys)))
    return bad


def main(argv):
    if not argv:
        sys.exit(__doc__ or 'ใช้: check_prefill.py <ABBR> <payload.json|->  |  --doc')
    if argv[0] == '--doc':
        return 1 if check_doc() else 0
    code = argv[0]
    src = argv[1] if len(argv) > 1 else '-'
    o = json.load(sys.stdin if src == '-' else open(src, encoding='utf-8'))
    err, warn = check(code, o)
    for w in warn:
        print('  ⚠️  ' + w)
    for e in err:
        print('  🔴 ' + e)
    if err:
        return 1
    print('\nส่งได้ %d คีย์ — เปิดลิงก์นี้แล้วเทียบกับหน้าจอ อย่าเชื่อว่าผ่านเพราะไม่มีข้อความเตือน\n'
          % len(o))
    print(link(code, o))
    return 0


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
