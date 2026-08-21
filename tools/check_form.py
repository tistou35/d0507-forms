#!/usr/bin/env python3
# ============================================================
# check_form.py — ตรวจความสอดคล้องของฟอร์มหนึ่งใบ ก่อนเอาขึ้นระบบ
#
#   python3 tools/check_form.py SDF
#   python3 tools/check_form.py            # ตรวจทุกใบที่มีนิยามฟอร์ม
#
# ตรวจสามชั้นที่เคยพลาดมาแล้วจริง
#   1. นิยามฟอร์ม  ↔  ทะเบียนเอกสาร   (Issue/Rev ไม่ตรงกัน)
#   2. นิยามฟอร์ม  ↔  แม่แบบ PDF      (ช่องให้คะแนนหายไปจากเอกสาร · token ไม่มีที่มา)
#   3. นิยามฟอร์มเองสมเหตุสมผลไหม     (ค่าตัวเลือกที่ทำ token ไม่ได้ · route อ้างฝ่ายที่ไม่มี)
#
# ออก exit code 1 เมื่อเจอปัญหา — ใช้ต่อใน CI ได้
# ============================================================
import json, os, re, sys, glob

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# token ที่ Code.gs เติมให้เองทุกฟอร์ม ไม่ต้องมีฟิลด์รองรับ
AUTO = {'tracking', 'doc', 'issue', 'rev', 'defRev', 'score',
        'submitter', 'submittedAt', 'delegatedFrom'}

# ค่าตัวเลือกกลายเป็นชื่อ token {{k_<field>_<value>}}
# ขีดกลางใช้ได้ (HS-VVD, NO-GO) — ที่พังคือช่องว่างกับ /
TOKEN_SAFE = re.compile(r'^[A-Za-z0-9_-]+$')


def load(abbr):
    reg = json.load(open(os.path.join(HERE, 'forms_register.json'), encoding='utf-8'))
    d = json.load(open(os.path.join(HERE, 'formdefs', abbr + '.json'), encoding='utf-8'))
    tpl_path = os.path.join(HERE, 'gas', 'Template_%s.gs' % abbr)
    tpl = open(tpl_path, encoding='utf-8').read() if os.path.exists(tpl_path) else None
    if tpl is None:
        tpl = from_tokenmap(abbr)
    entry = next((f for f in reg['forms'] if f['abbr'] == abbr), None)
    return d, entry, tpl


def from_tokenmap(abbr):
    """คืน token ทั้งหมดที่ TokenMap.gs วางไว้ในแม่แบบของใบนี้ เป็นข้อความก้อนเดียว

    ใบรุ่นหลังไม่ได้เขียน Template_<ABBR>.gs อีกแล้ว — แปลง .docx เป็น Google Doc
    ตรง ๆ แล้วหยอด token ตามแผนที่ ตัวตรวจจึงต้องอ่านแผนที่ ไม่ใช่มองหาไฟล์ .gs
    ที่ไม่มีใครเขียนแล้ว ไม่งั้นจะไล่ให้คนทำสิ่งที่เลิกทำไปนานแล้ว
    """
    mp = os.path.join(HERE, 'gas', 'TokenMap.gs')
    if not os.path.exists(mp):
        return None
    m = re.search(r'var TOKEN_MAP = (\{.*\});\s*$', open(mp, encoding='utf-8').read(), re.S)
    if not m:
        return None
    ent = json.loads(m.group(1)).get(abbr)
    if not ent:
        return None
    out = []
    for part in ('byLabel', 'byLine', 'byCell', 'boxes', 'tables', 'approval', 'manual'):
        for x in ent.get(part) or []:
            out.append(x.get('tok', '') if isinstance(x, dict) else str(x))
    return '\n'.join(out)


def check(abbr):
    err, warn = [], []
    try:
        d, entry, tpl = load(abbr)
    except FileNotFoundError as e:
        return ['อ่านไฟล์ไม่ได้: %s' % e], []

    fields = {f['k']: f for s in d.get('sections', []) for f in s.get('fields', [])}
    comp = {c['k'] for c in d.get('compute', [])}
    parties = {p['k'] for p in d.get('parties', [])}
    tabs = {t['k'] for t in (d.get('ui', {}).get('tabs') or [])}

    # ── 1. เทียบกับทะเบียน ──
    if not entry:
        err.append("ทะเบียนไม่มี abbr '%s'" % abbr)
    else:
        for k, label in (('iss', 'Issue'), ('rev', 'Rev'), ('eff', 'Effective')):
            a, b = entry.get(k), d.get({'iss': 'issue', 'rev': 'rev', 'eff': 'eff'}[k])
            if a != b:
                err.append('%s ไม่ตรงกัน — ทะเบียน %r · นิยามฟอร์ม %r '
                           '(ยึดหัวกระดาษใน .docx เป็นหลัก)' % (label, a, b))
        if entry.get('code') and d.get('control') and entry['code'] != d['control']:
            err.append('control code ไม่ตรง — ทะเบียน %r · นิยามฟอร์ม %r'
                       % (entry['code'], d['control']))

    # ── 2. ความสมเหตุสมผลของนิยามฟอร์มเอง ──
    for k, f in fields.items():
        if not TOKEN_SAFE.match(k):
            err.append("ชื่อฟิลด์ '%s' มีอักขระที่ทำ token ไม่ได้" % k)
        for o in f.get('opt', []):
            if not TOKEN_SAFE.match(str(o.get('v', ''))):
                err.append("%s: ค่าตัวเลือก %r มีช่องว่างหรืออักขระพิเศษ — "
                           "จะกลายเป็น {{k_%s_%s}} ที่จับคู่ไม่ได้"
                           % (k, o.get('v'), k, o.get('v')))
        if isinstance(f.get('score'), dict):
            vals = {o['v'] for o in f.get('opt', [])}
            extra = set(f['score']) - vals
            if extra:
                err.append('%s: ให้คะแนนกับค่าที่ไม่มีในตัวเลือก %s' % (k, sorted(extra)))
        if f.get('half') and f.get('type') in ('textarea', 'sign', 'checklist', 'table'):
            warn.append("%s: ตั้ง half กับชนิด '%s' อาจแคบเกินไป" % (k, f['type']))

    for s in d.get('sections', []):
        if s.get('party') and s['party'] not in parties:
            err.append("section %s อ้างฝ่าย '%s' ที่ไม่มีใน parties" % (s['k'], s['party']))
        if tabs and s.get('tab') and s['tab'] not in tabs:
            err.append("section %s อ้างแท็บ '%s' ที่ไม่มีใน ui.tabs" % (s['k'], s['tab']))

    steps = d.get('route', [])
    for r in steps:
        if r.get('party') not in parties:
            err.append("route ขั้น %s อ้างฝ่าย '%s' ที่ไม่มี" % (r.get('step'), r.get('party')))
        ab = r.get('assignedBy')
        if r.get('step', 1) > 1:
            if ab not in ('submitter', 'later'):
                err.append("route ขั้น %s ต้องระบุ assignedBy เป็น 'submitter' หรือ 'later'"
                           % r.get('step'))
            if ab == 'later' and not r.get('pool'):
                err.append("route ขั้น %s ตั้ง assignedBy 'later' แต่ไม่ได้ระบุ pool — "
                           "ใบจะเข้ากองรอที่ไม่มีใครมีสิทธิ์รับ" % r.get('step'))

    # ส่วนของฝ่ายที่ไม่ใช่ขั้นแรก ควรซ่อนจากคนกรอก
    first = steps[0]['party'] if steps else None
    for s in d.get('sections', []):
        if first and s.get('party') and s['party'] != first and not s.get('hideOthers'):
            warn.append("section %s เป็นของฝ่าย '%s' แต่ไม่ได้ตั้ง hideOthers — "
                        "คนกรอกจะเห็นช่องที่ตัวเองแตะไม่ได้" % (s['k'], s['party']))

    # ── 3. เทียบกับแม่แบบ PDF ──
    if tpl is None:
        warn.append('ยังไม่มีแม่แบบ PDF — รัน tools/make_tokenmap.py %s แล้ว importTemplate '
                    'ไม่งั้น PDF จะใช้ฉบับสำรองจาก HTML ซึ่งหน้าตาไม่เหมือนเอกสารควบคุม' % abbr)
    else:
        toks = set(re.findall(r'\{\{([\w-]+)\}\}', tpl))
        # แม่แบบบางใบ (FRAE) สร้าง token ในลูปจากตารางข้อมูลของตัวเอง
        # เช่น '{{k_' + r[0] + '}}' — ชื่อฟิลด์จึงไม่โผล่เป็น token ตรง ๆ
        # ถือว่า "มีในเอกสาร" ถ้าชื่อฟิลด์ปรากฏเป็นสตริงในไฟล์แม่แบบ
        quoted = set(re.findall(r"'([A-Za-z][\w]*)'", tpl))

        for t in sorted(toks):
            if t in AUTO or t in fields or t in comp:
                continue
            base = t[4:] if t.startswith('sig_') else t[2:] if t.startswith('k_') else t
            if t.startswith('sig_'):
                if base not in fields:
                    err.append('แม่แบบใช้ {{%s}} แต่ไม่มีฟิลด์ %s' % (t, base))
                elif fields[base].get('type') != 'sign':
                    err.append('{{%s}} ชี้ไปที่ฟิลด์ที่ไม่ใช่ลายเซ็น' % t)
                continue
            if t.startswith('k_'):
                if base in fields:
                    continue
                head, _, tail = base.rpartition('_')
                if head in fields and any(str(o.get('v')) == tail
                                          for o in fields[head].get('opt', [])):
                    continue
                # ช่องให้เกรดไม่มี opt — ค่าที่ติ๊กได้คือ 1 ถึง max
                # แม่แบบจึงมี {{k_g5_1}}…{{k_g5_5}} หนึ่งช่องต่อหนึ่งเกรด
                if head in fields and fields[head].get('type') in ('grade', 'scale') \
                        and tail.isdigit() and 1 <= int(tail) <= int(fields[head].get('max', 5)):
                    continue
                # รายการตรวจ — หนึ่งช่องต่อ "หนึ่งรายการ × หนึ่งผล" เช่น {{k_checks_T1_S}}
                # ชื่อจึงมีสามท่อน ต้องแยกอีกชั้นแล้วตรวจทั้งรหัสรายการและค่าผล
                h2, _, item = head.rpartition('_') if '_' in head else ('', '', head)
                owner = h2 if h2 in fields else head
                fo = fields.get(owner)
                if fo and fo.get('type') == 'checklist':
                    ids = {str(i.get('id')) for i in fo.get('items', [])}
                    vals = {str(o.get('v')) for o in fo.get('opts', [])}
                    if owner == h2 and item in ids and tail in vals:
                        continue
                    if owner == head and tail in ids:      # แม่แบบบางใบไม่แยกผล
                        continue
                    err.append('แม่แบบใช้ {{%s}} — %s ไม่มีรายการ %r หรือผล %r'
                               % (t, owner, item if owner == h2 else tail, tail))
                    continue
                # ค่าที่คำนวณได้ เช่น {{k_riskLevel_H}} ติ๊กตามระดับที่เมทริกซ์ให้
                if head in comp:
                    continue
                err.append('แม่แบบใช้ {{%s}} ที่ไม่มีฟิลด์หรือค่าตัวเลือกรองรับ' % t)
                continue
            err.append('แม่แบบใช้ {{%s}} ที่ไม่มีที่มา' % t)

        # ทุกช่องที่ให้คะแนนต้องปรากฏในเอกสาร ไม่งั้นคนอ่าน PDF ไม่เห็นว่าติ๊กอะไรไป
        for k, f in fields.items():
            if 'score' not in f:
                continue
            hit = (('k_' + k) in toks
                   or any(t.startswith('k_' + k + '_') for t in toks)
                   or k in quoted)
            if not hit:
                err.append('ช่องให้คะแนน %s ไม่มีในแม่แบบ PDF' % k)

        # ค่าคำนวณที่แม่แบบเรียกใช้ ต้องมีใน compute
        for t in toks:
            if t in comp or t in AUTO or t in fields:
                continue

    return err, warn


def main():
    codes = sys.argv[1:] or sorted(
        os.path.basename(p)[:-5]
        for p in glob.glob(os.path.join(HERE, 'formdefs', '*.json'))
        if not os.path.basename(p).startswith('_'))

    bad = 0
    for abbr in codes:
        err, warn = check(abbr)
        head = '%-6s' % abbr
        if not err and not warn:
            print('%s ✅ ผ่าน' % head)
            continue
        print('%s %s' % (head, '❌ %d ปัญหา' % len(err) if err else '⚠️  ข้อสังเกต'))
        for e in err:
            print('        ❌ %s' % e)
        for w in warn:
            print('        ⚠️  %s' % w)
        if err:
            bad += 1
    if bad:
        print('\nมี %d ฟอร์มที่ยังไม่ผ่าน — แก้ก่อนเอาขึ้นระบบ' % bad)
    sys.exit(1 if bad else 0)


if __name__ == '__main__':
    main()
