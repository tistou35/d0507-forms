#!/usr/bin/env python3
# ============================================================
# aip_charts.py — ดึงแผนภูมิการบินจาก eAIP ของ CAAT (aip.caat.or.th)
#
#   python3 tools/aip_charts.py list VTBD          ดูว่าสนามบินนี้มี chart อะไรบ้าง
#   python3 tools/aip_charts.py list VTBD approach  กรองเฉพาะที่ชื่อมีคำนี้
#   python3 tools/aip_charts.py ads                 รายชื่อสนามบินทั้งหมดในรอบปัจจุบัน
#   python3 tools/aip_charts.py resolve             อัปเดตลิงก์ใน publications.json ให้เป็นรอบปัจจุบัน
#   python3 tools/aip_charts.py resolve 2609        อัปเดตเป็นรอบที่ระบุ (เตรียมล่วงหน้า)
#
# ── เรื่องที่ต้องรู้ก่อนแก้ไฟล์นี้ ───────────────────────────
# eAIP เก็บ chart เป็นไฟล์เลขล้วน  graphics/299080.pdf  ไม่มีชื่อในชื่อไฟล์
# และ "เลขไฟล์เปลี่ยนเมื่อ chart ถูกแก้" — วัดจริงแล้ว 33 จาก 126 ใบของ VTBD
# เปลี่ยนเลขระหว่างรอบ 2601 กับ 2608 ทั้งที่ชื่อ chart เหมือนเดิม
#
# ที่อันตรายกว่านั้น: เลขเก่ายังเปิดได้ในโฟลเดอร์ของรอบใหม่ (ตอบ 200 เป็น PDF ปกติ)
# ถ้าเก็บเลขไฟล์ไว้ในทะเบียน จะได้ chart ฉบับที่ถูกยกเลิกแล้ว โดยไม่มี error อะไรเตือน
# เปิดดูก็เห็นเป็น chart ที่ดูปกติทุกอย่าง
#
# ทะเบียนจึงเก็บ "icao + ชื่อ chart" เป็นตัวระบุตัวตน ไม่เก็บเลขไฟล์
# แล้วให้เครื่องมือนี้ resolve เลขใหม่ทุกครั้งที่รอบเปลี่ยน
# ============================================================
import json, os, re, ssl, sys, urllib.request
from html.parser import HTMLParser

try:
    import certifi
    SSLCTX = ssl.create_default_context(cafile=certifi.where())
except ImportError:
    SSLCTX = None

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(HERE, 'tools'))
from airac import current, cycles

SITE = 'https://aip.caat.or.th'
PUBS = os.path.join(HERE, 'publications.json')


def cycle_date(code=None):
    """คืน (รหัสรอบ, วันมีผลแบบ YYYY-MM-DD) — ไม่ระบุ = รอบที่ใช้อยู่"""
    if not code:
        c = current()
        return c[0], c[1].isoformat()
    m = re.match(r'^(\d{2})(\d{2})$', str(code))
    if not m:
        sys.exit('รหัสรอบต้องเป็นเลขสี่หลัก เช่น 2608')
    for c in cycles(2000 + int(m.group(1))):
        if c[0] == str(code):
            return c[0], c[1].isoformat()
    sys.exit('ไม่มีรอบ %s' % code)


def fetch(url):
    req = urllib.request.Request(url, headers={'User-Agent': 'D-0507 doc control'})
    with urllib.request.urlopen(req, context=SSLCTX, timeout=60) as r:
        return r.read().decode('utf-8', 'replace')


class Rows(HTMLParser):
    """เก็บข้อความกับลิงก์ graphics ที่อยู่ในแถวเดียวกันของตาราง"""
    def __init__(self):
        super().__init__()
        self.rows, self.cur, self.txt = [], None, []

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag == 'tr':
            self.cur, self.txt = {'href': None}, []
        elif tag == 'a' and self.cur is not None:
            h = a.get('href', '')
            if 'graphics' in h and h.lower().endswith('.pdf'):
                self.cur['href'] = h

    def handle_data(self, d):
        if self.cur is not None:
            self.txt.append(d)

    def handle_endtag(self, tag):
        if tag == 'tr' and self.cur is not None:
            if self.cur['href']:
                # ตัดหาง TACLO;... ที่ระบบเขาใส่มาท้ายชื่อ
                t = re.sub(r'TACLO.*$', '', ' '.join(self.txt))
                t = re.sub(r'\s+', ' ', t).strip(' -;')
                self.cur['name'] = t
                self.rows.append(self.cur)
            self.cur = None


def charts(icao, date):
    """chart ทั้งหมดของสนามบินหนึ่งแห่งในรอบที่กำหนด — {ชื่อ: URL เต็ม}"""
    base = '%s/%s-AIRAC/html/' % (SITE, date)
    html = fetch(base + 'eAIP/VT-AD-2.%s-en-GB.html' % icao)
    p = Rows(); p.feed(html)
    out = {}
    for r in p.rows:
        num = r['href'].split('/')[-1]
        out.setdefault(r['name'], '%s/%s-AIRAC/graphics/%s' % (SITE, date, num))
    return out


def aerodromes(date):
    html = fetch('%s/%s-AIRAC/html/eAIP/VT-menu-en-GB.html' % (SITE, date))
    return sorted(set(re.findall(r'VT-AD-2\.([A-Z]{4})-en-GB\.html', html)))


def cmd_list(args):
    code, date = cycle_date(args[1] if len(args) > 2 and args[1].isdigit() else None)
    icao = next(a for a in args if re.match(r'^[A-Z]{4}$', a))
    kw = [a for a in args[1:] if not re.match(r'^[A-Z]{4}$|^\d{4}$', a)]
    cs = charts(icao, date)
    print('%s · AIRAC %s (%s) · %d ใบ\n' % (icao, code, date, len(cs)))
    for n, u in cs.items():
        if kw and not all(k.lower() in n.lower() for k in kw):
            continue
        print('  %-72s %s' % (n[:72], u.split('/')[-1]))


def cmd_ads(args):
    code, date = cycle_date(args[1] if len(args) > 1 else None)
    ads = aerodromes(date)
    print('AIRAC %s · %d สนามบิน' % (code, len(ads)))
    for i in range(0, len(ads), 12):
        print('  ' + ' '.join(ads[i:i + 12]))


def cmd_resolve(args):
    code, date = cycle_date(args[1] if len(args) > 1 else None)
    reg = json.load(open(PUBS, encoding='utf-8'))
    todo = [p for p in reg['pubs'] if p.get('cat') == 'chart' and p.get('icao')]
    if not todo:
        print('ยังไม่มีรายการแผนภูมิในทะเบียน — เพิ่ม {icao, chart} ใน publications.json ก่อน')
        return
    cache, ok, miss = {}, 0, []
    for p in todo:
        icao = p['icao']
        if icao not in cache:
            cache[icao] = charts(icao, date)
        # จับคู่ด้วยชื่อเต็มก่อน ไม่เจอค่อยหาแบบมีคำนั้นอยู่ในชื่อ
        want = p.get('chart', '')
        url = cache[icao].get(want)
        if not url:
            hits = [n for n in cache[icao] if want and want.lower() in n.lower()]
            if len(hits) == 1:
                url = cache[icao][hits[0]]
                p['chart'] = hits[0]          # เก็บชื่อเต็มไว้ใช้รอบหน้า
            elif len(hits) > 1:
                miss.append('%s · "%s" ตรงหลายใบ (%d) — ต้องระบุให้เจาะจงกว่านี้'
                            % (icao, want, len(hits)))
                continue
        if not url:
            miss.append('%s · ไม่พบ "%s" ในรอบ %s — อาจถูกยกเลิกหรือเปลี่ยนชื่อ'
                        % (icao, want, code))
            continue
        p['airac'], p['file'], p['resolvedAt'] = code, url, date
        ok += 1

    json.dump(reg, open(PUBS, 'w', encoding='utf-8'), ensure_ascii=False, indent=2)
    print('AIRAC %s (%s) — อัปเดตลิงก์แล้ว %d/%d' % (code, date, ok, len(todo)))
    for m in miss:
        print('  🔴 ' + m)
    if miss:
        print('\nที่ขึ้น 🔴 ต้องแก้เอง — ปล่อยไว้แปลว่าทะเบียนชี้ไปฉบับของรอบก่อน')


if __name__ == '__main__':
    a = sys.argv[1:]
    if not a: sys.exit(__doc__ or 'ใช้: aip_charts.py list|ads|resolve')
    {'list': cmd_list, 'ads': cmd_ads, 'resolve': cmd_resolve}.get(
        a[0], lambda _: sys.exit('ไม่รู้จักคำสั่ง %s' % a[0]))(a)
