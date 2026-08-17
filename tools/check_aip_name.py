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


def gs_source():
    """ตัดเฉพาะส่วนตั้งชื่อออกมาจากไฟล์จริง"""
    src = open(GS, encoding='utf-8').read()
    a = src.index('var AIP_KINDS')
    b = src.index('/* ── ตาราง AD 2.24')
    return src[a:b]


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
    pairs = []
    for a in AD:
        for raw in charts(a, date):
            pairs.append([a, raw])
    print('AIRAC %s · เทียบ %d ชื่อ' % (code, len(pairs)))

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
