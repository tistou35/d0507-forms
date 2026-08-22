#!/usr/bin/env python3
# ============================================================
# check_tpl.py — แม่แบบ Google Doc เก่ากว่า .docx ต้นฉบับหรือเปล่า
#
#   python3 tools/check_tpl.py
#
# แม่แบบถูกสร้างจาก .docx ครั้งเดียวแล้วอยู่อย่างนั้น ถ้าออกฉบับแก้ไขแล้วไม่ได้
# สร้างแม่แบบใหม่ ใบที่ระบบออกให้จะยังเป็นหน้าตาของฉบับเก่า — ดูปกติทุกอย่าง
# ไม่มี error กว่าจะรู้ก็ตอนมีคนเปิด PDF เทียบกับเอกสาร เกิดกับ PWR มาแล้ว
#
# นิยามฟอร์มก็นับด้วย — เพิ่มช่องใหม่แล้วแม่แบบไม่มี token ให้วาง ค่าที่กรอก
# จะหายไปเงียบ ๆ เหมือนกัน
#
# เทียบ "ชุด token จริง" กับตอนสร้างแม่แบบ ไม่ใช่วันแก้ไฟล์ — แก้ gate หรือ
# ข้อความช่วยไม่กระทบ token สักตัว ถ้าเตือนด้วยวันที่จะไล่ให้สร้างใหม่ทั้งที่
# ไม่มีอะไรเปลี่ยน แล้วคนจะเลิกเชื่อคำเตือน
# ============================================================
import datetime, json, os, sys, urllib.parse, urllib.request

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DOCX = os.path.dirname(HERE)
sys.path.insert(0, os.path.join(HERE, 'tools'))
from gas_push import token, SSLCTX


def drive_templates(tk):
    u = ('https://www.googleapis.com/drive/v3/files?q=' + urllib.parse.quote(
         "name contains '_TEMPLATE' and mimeType='application/vnd.google-apps.document' "
         "and trashed=false") + '&fields=files(id,name,modifiedTime)&pageSize=200')
    fs = json.load(urllib.request.urlopen(
        urllib.request.Request(u, headers={'Authorization': 'Bearer ' + tk}),
        context=SSLCTX, timeout=90))['files']
    out = {}
    for f in fs:
        if not f['name'].endswith('_TEMPLATE'):
            continue
        a = f['name'][:-len('_TEMPLATE')]
        if a not in out or f['modifiedTime'] > out[a]['modifiedTime']:
            out[a] = f
    return out


def tokens_at(rev, abbr):
    """ชุด token ของใบนี้ใน gas/TokenMap.gs ณ commit หนึ่ง (None ถ้าอ่านไม่ได้)"""
    import re, subprocess
    r = subprocess.run(['git', 'show', '%s:gas/TokenMap.gs' % rev],
                       capture_output=True, text=True, cwd=HERE)
    if r.returncode:
        return None
    m = re.search(r'var TOKEN_MAP = (\{.*\});\s*$', r.stdout, re.S)
    if not m:
        return None
    e = json.loads(m.group(1)).get(abbr)
    if not e:
        return None
    out = set()
    for part in ('byLabel', 'byLine', 'byCell', 'boxes', 'tables', 'approval', 'manual'):
        for x in e.get(part) or []:
            out.add(x.get('tok', '') if isinstance(x, dict) else str(x))
    return out


def commit_before(when):
    """commit สุดท้ายของ gas/TokenMap.gs ก่อนเวลาที่ให้"""
    import subprocess
    r = subprocess.run(['git', 'log', '-1', '--format=%H',
                        '--before=' + when.isoformat(), '--', 'gas/TokenMap.gs'],
                       capture_output=True, text=True, cwd=HERE)
    return r.stdout.strip() or None


def mtime(path):
    return (datetime.datetime.fromtimestamp(os.path.getmtime(path)).astimezone()
            if os.path.exists(path) else None)


def main():
    reg = json.load(open(os.path.join(HERE, 'forms_register.json'), encoding='utf-8'))
    tpls = drive_templates(token())
    stale, ok, none, unknown, unused = [], 0, [], [], []
    for f in reg['forms']:
        t = tpls.get(f['abbr'])
        # ใบที่ย้ายไปกรอกในระบบอื่นแล้ว ระบบนี้ไม่ได้ออก PDF ให้ แม่แบบที่ค้างอยู่
        # จึงไม่มีใครใช้ — เตือนว่าเก่าก็ไม่มีประโยชน์ บอกว่าเป็นของค้างดีกว่า
        if t and f.get('sys') not in (None, '', 'here'):
            unused.append('%s (%s)' % (f['abbr'], f['sys']))
            continue
        if not t:
            if f.get('kind') != 'ref':
                none.append(f['abbr'])
            continue
        made = datetime.datetime.fromisoformat(
            t['modifiedTime'].replace('Z', '+00:00')).astimezone()
        newer = []
        m = mtime(os.path.join(DOCX, f.get('docx') or ''))
        if m and m > made + datetime.timedelta(minutes=2):
            newer.append('.docx แก้ %s' % m.strftime('%d %b %H:%M'))

        # นิยามฟอร์มเปลี่ยนไม่ได้แปลว่าแม่แบบเก่าเสมอ — แก้ gate หรือข้อความช่วย
        # ไม่กระทบ token สักตัว เทียบชุด token จริงกับตอนที่สร้างแม่แบบแทนวันแก้ไฟล์
        # ไม่งั้นจะไล่ให้คนสร้างแม่แบบใหม่ทั้งที่ไม่มีอะไรเปลี่ยน แล้วคนจะเลิกเชื่อ
        old_rev = commit_before(made)
        now_tok = tokens_at('HEAD', f['abbr'])
        was_tok = tokens_at(old_rev, f['abbr']) if old_rev else None
        if was_tok is None:
            # ไม่มี TokenMap.gs ใน git ก่อนวันที่สร้างแม่แบบ เทียบไม่ได้
            # "เทียบไม่ได้" ไม่ใช่ "ไม่มีปัญหา" — ต้องบอก ไม่ใช่ปล่อยผ่านเงียบ ๆ
            unknown.append((f['abbr'], made.strftime('%d %b %H:%M'), len(now_tok or ())))
        elif now_tok is not None and now_tok != was_tok:
            d1, d2 = sorted(now_tok - was_tok), sorted(was_tok - now_tok)
            newer.append('token เปลี่ยน %d → %d%s%s'
                         % (len(was_tok), len(now_tok),
                            ' +' + ' '.join(d1[:3]) if d1 else '',
                            ' −' + ' '.join(d2[:3]) if d2 else ''))
        if newer:
            stale.append((f['abbr'], made.strftime('%d %b %H:%M'), newer))
        elif not any(a == f['abbr'] for a, _, _ in unknown):
            ok += 1

    for a, made, why in stale:
        print('🔴 %-9s แม่แบบสร้าง %s · %s' % (a, made, ' · '.join(why)))
    for a, made, n in unknown:
        print('❔ %-9s แม่แบบสร้าง %s — เก่ากว่าประวัติ TokenMap ใน git เทียบไม่ได้ '
              '(ตอนนี้มี %d token) เปิดดูด้วยตาหรือสร้างใหม่ให้แน่ใจ' % (a, made, n))
    if unused:
        print('💤 แม่แบบค้างอยู่แต่ไม่มีใครใช้ (ใบย้ายไประบบอื่นแล้ว): %s' % ' · '.join(sorted(unused)))
    if none:
        print('⚠️  ยังไม่มีแม่แบบ: %s' % ' '.join(sorted(none)))
    print('\nแม่แบบเป็นฉบับปัจจุบัน %d ใบ · ต้องสร้างใหม่ %d ใบ · เทียบไม่ได้ %d ใบ'
          % (ok, len(stale), len(unknown)))
    if stale:
        print('สร้างใหม่: ตั้ง RUN_LIST ใน gas/ImportTemplate.gs เป็น %s'
              % json.dumps([a for a, _, _ in stale]))
        print('แล้ว push + Run · อย่าลืมอัปโหลด .docx ฉบับปัจจุบันขึ้น Drive ก่อน')
    return 1 if (stale or unknown) else 0


if __name__ == '__main__':
    sys.exit(main())
