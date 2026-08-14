#!/usr/bin/env python3
"""แปลง firestore.rules ให้เป็นรูปแบบที่พิมพ์ลงคอนโซลได้โดยไม่เพี้ยน

editor ของ Firebase console เติมวงเล็บปิดให้เองเมื่อบรรทัดจบด้วย '{'
พิมพ์โค้ดหลายบรรทัดลงไปตรง ๆ จึงได้วงเล็บเกินทุกครั้ง

ตัวนี้ยุบแต่ละบล็อกให้อยู่บรรทัดเดียว — เปิดและปิดในบรรทัดเดียวกัน
วงเล็บที่ editor เติมจะถูกตัวที่เราพิมพ์เองทับพอดี ผลลัพธ์จึงตรงเป๊ะ

ใช้:  python3 firebase/flatten_rules.py > firebase/firestore.rules.console
"""
import re, sys, os

HERE = os.path.dirname(os.path.abspath(__file__))
src = open(os.path.join(HERE, 'firestore.rules'), encoding='utf-8').read()

# ยุบที่ระดับ 2 — service {} และ match /documents {} ยังอยู่บรรทัดของตัวเอง
# แต่ละ match/function ข้างในจึงได้หนึ่งบรรทัดที่เปิดและปิดครบในตัว
OUTER = 2
out, buf, depth = [], '', 0
for raw in src.split('\n'):
    line = re.sub(r'\s+//.*$', '', raw.strip())
    if not line:
        continue
    if line.startswith('//'):
        if not buf:
            out.append(line)               # คอมเมนต์เก็บไว้เป็นบรรทัดของตัวเอง
        continue
    opens, closes = line.count('{'), line.count('}')
    if not buf and depth < OUTER and opens and not closes:
        out.append(line); depth += opens; continue
    if not buf and depth <= OUTER and closes and not opens:
        depth -= closes; out.append(line); continue
    buf = (buf + ' ' + line).strip() if buf else line
    depth += opens - closes
    if depth <= OUTER:
        out.append('  ' + re.sub(r'\s+', ' ', buf))
        buf = ''

sys.stdout.write('\n'.join(out) + '\n')
