#!/usr/bin/env python3
# ============================================================
# airac.py — รอบ AIRAC สำหรับคุมอายุแผนภูมิการบิน (approach chart ฯลฯ)
#
#   python3 tools/airac.py            # รอบปัจจุบันและอีก 8 รอบข้างหน้า
#   python3 tools/airac.py 2026       # ทุกรอบของปี 2026
#
# AIRAC คือรอบประกาศข้อมูลการบินของ ICAO — มีผลทุก 28 วัน ตรงกับวันพฤหัสบดี
# ยึดหมุดจาก AIRAC 2001 = 02 JAN 2020 แล้วนับทีละ 28 วัน
# ตรวจกับตารางที่ประกาศจริงได้: 2301 = 26 JAN 2023 · 2401 = 25 JAN 2024
#                              2501 = 23 JAN 2025 · 2601 = 22 JAN 2026
#
# ทำไมต้องคุม: chart ที่หมดรอบแล้วคือข้อมูลการบินที่ล้าสมัย
# ถือขึ้นเครื่องไปใช้เป็นเรื่องความปลอดภัยโดยตรง ไม่ใช่แค่เอกสารไม่อัปเดต
# ============================================================
import sys
from datetime import date, timedelta

ANCHOR = date(2020, 1, 2)      # AIRAC 2001
STEP = timedelta(days=28)


def cycles(year):
    """ทุกรอบที่ 'เริ่มมีผล' ภายในปีนั้น — คืน (ชื่อรอบ, วันเริ่ม, วันสิ้นสุด)"""
    d, out, n = ANCHOR, [], 0
    while d.year < year:
        d += STEP
    while d.year == year:
        n += 1
        out.append(('%02d%02d' % (year % 100, n), d, d + STEP - timedelta(days=1)))
        d += STEP
    return out


def current(on=None):
    """รอบที่ใช้อยู่ ณ วันที่กำหนด"""
    on = on or date.today()
    for c in cycles(on.year):
        if c[1] <= on <= c[2]:
            return c
    # ต้นปีอาจยังอยู่ในรอบสุดท้ายของปีก่อน
    for c in cycles(on.year - 1):
        if c[1] <= on <= c[2]:
            return c
    return None


def upcoming(n=8, on=None):
    on = on or date.today()
    out, y = [], on.year
    while len(out) < n + 1:
        out += [c for c in cycles(y) if c[2] >= on]
        y += 1
    return out[:n + 1]


def table(n=8, on=None):
    """ข้อมูลสำหรับฝังในหน้าเว็บ — วันที่เป็น ISO ให้ JS อ่านง่าย"""
    return [{'c': c[0], 'from': c[1].isoformat(), 'to': c[2].isoformat()}
            for c in upcoming(n, on)]


if __name__ == '__main__':
    if len(sys.argv) > 1 and sys.argv[1].isdigit() and len(sys.argv[1]) == 4:
        rows = cycles(int(sys.argv[1]))
    else:
        rows = upcoming(8)
    cur = current()
    for c, a, b in rows:
        mark = '  ← ใช้อยู่ตอนนี้' if cur and c == cur[0] else ''
        print('AIRAC %s   %s → %s%s' % (c, a.strftime('%d %b %Y').upper(),
                                        b.strftime('%d %b %Y').upper(), mark))
