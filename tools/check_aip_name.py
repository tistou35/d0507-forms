#!/usr/bin/env python3
# ============================================================
# check_aip_name.py — พิสูจน์ว่า aipName_() ใน AipSync.gs กับ aip_name.py
#                     จัดชุดเหมือนกันทุกชื่อ
#
#   python3 tools/check_aip_name.py
#
# ทำไมต้องมี: Apps Script เป็นคนตั้งชื่อและจัดชุด · Python เป็นคนรวมไฟล์ตามชุดนั้น
# ถ้าวันหนึ่งแก้ตรรกะฝั่งเดียว จะรวมข้ามใบโดยไม่มี error อะไรเลย
# ได้ PDF ที่เปิดได้ หน้าครบ ดูเหมือนปกติ แต่เป็นแผนภูมิคนละใบปนกัน
#
# วิธีตรวจ: ดึงโค้ดจริงจาก gas/AipSync.gs มารันด้วย node แล้วเทียบผลตรง ๆ
# ไม่ใช่เขียนตรรกะขึ้นใหม่มาเทียบ — นั่นจะตรวจได้แค่ว่าตัวเองคิดตรงกับตัวเอง
#
# รันทุกครั้งที่แตะ aipName_ หรือ parse() — ต้องได้ "ตรงกันทุกชื่อ"
# ============================================================
import json, os, re, subprocess, sys

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(HERE, 'tools'))
from aip_name import parse, AD
from aip_charts import charts, cycle_date

GS = os.path.join(HERE, 'gas', 'AipSync.gs')


def gs_source(a='var AIP_KINDS', b='/* ── ตาราง AD 2.24'):
    """ตัดโค้ดจริงออกมาจากไฟล์ — ไม่เขียนตรรกะขึ้นใหม่มาเทียบ"""
    src = open(GS, encoding='utf-8').read()
    return src[src.index(a):src.index(b, src.index(a))]


def check_extract(icao, date):
    """เทียบ "ตัวอ่านตาราง" ไม่ใช่แค่ตัวตั้งชื่อ

    บทเรียน: ครั้งหนึ่งสองฝั่งอ่านได้ 32 แถวเท่ากันทั้งคู่ แต่ฝั่ง Apps Script
    ได้ชื่อที่มีเศษ HTML ปนมา (id="ID_1967371" row_id="">) เพราะ split กิน "<tr "
    ไปด้วยแล้วเหลือแอตทริบิวต์ค้างหัวก้อน
    การนับจำนวนแถวจับไม่ได้เลย ต้องเทียบตัวข้อความถึงจะเห็น
    """
    from aip_charts import fetch, charts
    html = fetch('https://aip.caat.or.th/%s-AIRAC/html/eAIP/VT-AD-2.%s-en-GB.html'
                 % (date, icao))
    js = ("var AIP_SITE='https://aip.caat.or.th';"
          "var html=require('fs').readFileSync('/dev/stdin','utf8');"
          "function aipFetch_(){return html;}"
          # สตับต้องคืนชื่อไม่ซ้ำ ไม่งั้น seen[] ใน aipCharts_ ยุบทุกแถวเหลือแถวเดียว
          "function aipName_(i,r){return {sub:'x',set:r,ref:'',name:r};}\n"
          + gs_source('function aipCharts_(', '/* ── คิวงาน')
          + "console.log(JSON.stringify(aipCharts_('%s','%s').map(function(o){return o.title;})));"
          % (icao, date))
    p = subprocess.run(['node', '-e', js], input=html, capture_output=True, text=True)
    if p.returncode:
        return ['node ล้มเหลว: ' + p.stderr[:300]]
    gs = json.loads(p.stdout)
    py = list(charts(icao, date))
    bad = []
    if len(gs) != len(py):
        bad.append('%s อ่านได้ไม่เท่ากัน — gs %d แถว · py %d แถว' % (icao, len(gs), len(py)))
    for g, y in zip(sorted(gs), sorted(py)):
        if g != y:
            bad.append('%s ข้อความต่างกัน\n     py %r\n     gs %r' % (icao, y[:88], g[:88]))
            break
    return bad


def run_node(pairs):
    js = gs_source() + '''
var inp = JSON.parse(require('fs').readFileSync(0, 'utf8'));
console.log(JSON.stringify(inp.map(function (p) {
  var r = aipName_(p[0], p[1]);
  return [r.set, r.ref, r.sub];
})));
'''
    p = subprocess.run(['node', '-e', js], input=json.dumps(pairs),
                       capture_output=True, text=True)
    if p.returncode:
        sys.exit('node ล้มเหลว:\n' + p.stderr[:800])
    return json.loads(p.stdout)


def main():
    code, date = cycle_date()

    print('AIRAC %s · เทียบตัวอ่านตาราง %d สนามบิน' % (code, len(AD)))
    ext = []
    for a in AD:
        ext += check_extract(a, date)
    if ext:
        print('🔴 ตัวอ่านตารางไม่ตรงกัน')
        for e in ext[:10]:
            print('  ' + e)
        return 1
    print('✅ อ่านตารางได้ข้อความตรงกันทุกสนามบิน')

    pairs = []
    for a in AD:
        for raw in charts(a, date):
            pairs.append([a, raw])
    print('เทียบตัวตั้งชื่อ %d ชื่อ' % len(pairs))

    js = run_node(pairs)
    bad = []
    for (icao, raw), j in zip(pairs, js):
        p = parse(icao, raw)
        if [p['name'], p['ref'], p['folder']] != j:
            bad.append('%s\n     py %r\n     gs %r' % (raw[:90],
                       [p['name'], p['ref'], p['folder']], j))

    if bad:
        print('🔴 ไม่ตรงกัน %d ชื่อ' % len(bad))
        for b in bad[:15]:
            print('  ' + b)
        return 1
    print('✅ ตรงกันทุกชื่อ — Apps Script กับ Python จัดชุดเหมือนกัน')
    return 0


if __name__ == '__main__':
    sys.exit(main())
