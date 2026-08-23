# Annual Eval → ใบควบคุม

สัญญาข้อมูลระหว่างเมนู **Annual Eval** ในระบบบันทึกการฝึก (`d0507.361vision.org`)
กับระบบฟอร์มออนไลน์ (`d0507-forms`)

**สถานะ:** ตกลงแล้ว 21 AUG 2026 · ฝั่งระบบบันทึกการฝึกยังไม่ได้สร้างปุ่มส่ง

---

## 1. ทำไมไม่ออก EFM ทุกใบ

OMA D.2.9 แยกการตรวจสมรรถนะครูออกเป็นสามชั้น และระบุใบบันทึกไว้ตรง ๆ

| ชั้น | คืออะไร | ใบบันทึก |
|------|---------|----------|
| Tier 1 | In-House IPC — ATO ตรวจเอง | `IM-PCR-FI-301-A` / `IM-PCR-TKI-302-A` |
| Tier 2 | LPC+ — CAAT examiner ต่ออายุ licence | ใบ CAAT **และ** PCR |
| Tier 3 | AoC — CAAT FIE ต่ออายุ FI certificate | ใบ CAAT **และ** PCR |

สามบรรทัดที่ปิดทางไม่ให้ใบอื่นมาแทน PCR

> *"The three tiers are **independent** requirements."* — D.2.9
> *"An LPC+ result **does not replace the ATO PCR record**. After every LPC+ the FI
>  shall complete form IM-PCR-FI-301-A…"* — D.2.9.3
> *"Internal standardisation checks… **do not substitute** statutory Proficiency Checks."* — D.2.8

ถ้าแม้แต่ผลตรวจของ CAAT examiner ยังแทน PCR ไม่ได้ แบบประเมินภายในก็แทนไม่ได้

ส่วน **EFM** มีงานของมันอยู่แล้วใน OMA — ประเมิน *ผู้สมัคร* หลัง practical introduction
และ standardisation ก่อนตัดสินใจจ้าง (ไม่ผ่าน = จบกระบวนการ / ผ่าน = Employed)
ซึ่งตรงกับที่ตัวใบมีช่อง "Trainee Name" และคำถามสไตล์นักเรียนประเมินการสอน
รหัสก็บอกอยู่ — `QA-` คือสายประกันคุณภาพ ส่วนการประเมินความสามารถครูเป็นสาย `IM-` ทั้งแถบ

---

## 1.5 ครูหนึ่งคนเดินผ่านใบอะไรบ้าง

EFM กับ PCR ไม่ได้แข่งกัน — อยู่คนละจุดของเส้นเดียวกัน EFM เป็นประตูเข้า
PCR เป็นการตรวจซ้ำตลอดอายุการทำงาน ที่ผ่านมาไม่มีอะไรบอกความสัมพันธ์นี้
เพราะ EFM อยู่สายงาน `training` (กับใบของนักเรียน) ส่วน PCR อยู่ `standardisation`
หน้าเว็บจึงไม่เคยแสดงสองใบนี้ด้วยกันเลย

```
ผู้สมัคร
  │
  ├─ practical introduction + standardisation
  │
  └─→ QA-EFM-301-B ─ ประเมินผู้สมัคร ─→ ไม่ผ่าน: จบกระบวนการ
                          │
                          └─ ผ่าน: จ้าง
                               │
                               ├─→ IM-STR-301-B ─ อบรมมาตรฐานครู (D.2.8)
                               │        │
                               │        └─→ PCR  tier = t1initial
                               │             ก่อนปฏิบัติหน้าที่ครั้งแรก
                               │
                               └─ ประจำการ
                                    ├─ ประจำปี ............ PCR  t1annual
                                    ├─ กลับจากหยุด >90 วัน . PCR  t1postabs
                                    ├─ HT สั่งตรวจ ......... PCR  t1directed
                                    ├─ หลัง LPC+ ของ CAAT .. PCR  t2lpc   (D.2.9.3)
                                    └─ หลัง AoC ของ CAAT ... PCR  t3aoc
                                         │
                                         └─ ไม่ผ่าน
                                              └─→ IM-RTR-301-A ─ อบรมแก้ไข (D.2.7/D.2.8)
                                                       └─→ PCR  t1postcor  ตรวจซ้ำ
```

`IM-ECA-301-B` ไม่ได้อยู่ในเส้นนี้ — เป็นเกณฑ์ให้เกรดที่ PCR ทั้งสองใบอ้างถึง
ไม่ใช่ใบที่ใครกรอก

### ทำไมไม่ยุบ EFM กับ PCR เป็นใบเดียว

| | EFM | PCR |
|---|---|---|
| ตัวคนที่ถูกประเมิน | ผู้สมัคร ยังไม่ใช่พนักงาน | ครูประจำการ |
| ผลที่ออก | จ้าง / ไม่จ้าง | ผ่าน / ผ่านแบบมีเงื่อนไข / ไม่ผ่าน |
| สายเอกสาร | `QA-` ประกันคุณภาพ | `IM-` มาตรฐานการฝึก |
| ออกกี่ครั้ง | ครั้งเดียวตอนรับเข้า | ทุกปีและทุกครั้งที่มีเหตุ |
| ข้อบังคับ | ไม่มีข้อกำหนดความถี่ | D.2.9 กำหนดความถี่และกำหนดส่ง |

ที่สำคัญที่สุดคือ D.2.9.3 บอกว่าแม้ผลตรวจของ CAAT examiner ยังไม่แทน PCR
ใบประเมินภายในจึงแทนไม่ได้ — ถ้ายุบเป็นใบเดียว ATO จะไม่มีระเบียนที่คู่มือเรียกหา

### ที่ทำไว้ในระบบแล้ว

ทะเบียนเอกสารเก็บลำดับนี้เป็นข้อมูล ไม่ใช่แค่คำบรรยาย — แต่ละใบมี

- `next` ใบที่ต้องออกต่อจากใบนี้
- `refs` เอกสารเกณฑ์ที่ใบนี้อ้างอิง
- `flow` คำอธิบายสั้น ๆ ว่าใบนี้อยู่ตรงไหนของขั้นตอน

ใบที่อยู่ *ก่อนหน้า* คำนวณจาก `next` ของใบอื่น จะได้ไม่ต้องกรอกสองที่ให้ขัดกันเอง
หน้าฟอร์มแสดงเป็นบล็อก **ลำดับการออกใบ** พร้อมลิงก์ไปใบนั้น ๆ ข้ามสายงานได้
— เปิดหน้า EFM แล้วเห็นทางไป STR · เปิด PCR-FI แล้วเห็นว่ามาจาก STR หรือ RTR
และเห็นว่าเกณฑ์อยู่ที่ ECA

---

## 2. ด้านไหนออกใบอะไร

| ด้านใน Annual Eval | ใบที่ออก | หมายเหตุ |
|---|---|---|
| id ในแอป | ด้าน | ใบที่ออก | `tier` / `ipcType` |
|---|---|---|---|
| `ground` | Ground Training | `IM-PCR-TKI-302-A` | ตามเหตุที่ตรวจ |
| `flight` | Flight Training | `IM-PCR-FI-301-A` | ตามเหตุที่ตรวจ |
| `simulator` | Simulator Training | `IM-PCR-FI-301-A` | ใส่รหัส FTD/FNPT ใน `acReg` |
| `recurrent` | Recurrent Training | `IM-PCR-FI-301-A` | `t1postabs` |
| `progressive` | Progressive / Standard Check | `IM-PCR-FI-301-A` | `t1annual` |
| — | ประเมินผู้สมัครก่อนจ้าง | `QA-EFM-301-B` | บทบาทเดิมของ EFM ตาม OMA |

⚠️ **"Recurrent" ในเมนูคือการตรวจสมรรถนะการบินหลังขาด current** ไม่ใช่การไปนั่งเรียน
ตรงกับ Post-Absence IPC ใน D.2.9 ("Return from absence exceeding 90 days") จึงออก PCR-FI

⚠️ **ครูที่ "เข้ารับ" การอบรมทบทวนเป็นคนละเรื่อง และไม่ได้อยู่ในเมนูนี้**
OMA D.2.7 บรรทัด 8624–8625 ระบุว่า *"A completed IM-RTR-301-A shall be produced for
every refresher training event"* — ใบที่ต้องออกคือ **`IM-RTR-301-A`** ไม่ใช่ EFC
ส่วน EFC เป็นรายงานจบหลักสูตรของผู้เข้ารับการฝึกที่บันทึกใน TrainHub เป็นคนละสาย

---

## 3. รูปแบบลิงก์

```
https://tistou35.github.io/d0507-forms/fill/?c=<ABBR>&p=<payload>
```

`payload` = JSON → UTF-8 → base64url (`+`→`-`, `/`→`_`)

```js
const p = btoa(String.fromCharCode(...new TextEncoder().encode(JSON.stringify(o))))
            .replace(/\+/g,'-').replace(/\//g,'_');
```

กติกาที่ฝั่งรับบังคับไว้แล้ว — ไม่ต้องทำอะไรเพิ่ม

- ช่องชนิด `sign` ถูกตัดทิ้งเสมอ **ลิงก์ปลอมลายเซ็นไม่ได้** ไม่ว่าใครสร้าง
- ค่าที่ส่งมาเป็นแค่ *ค่าตั้งต้น* ผู้กรอกแก้ได้ทุกช่องก่อนส่ง
- คีย์ที่ไม่มีในนิยามฟอร์มถูกทิ้งเงียบ ๆ ส่งเกินมาไม่พัง
- PCR เป็นฟอร์มเจ้าหน้าที่ ต้องล็อกอินก่อน — ค่าถูกเก็บข้ามการล็อกอินให้แล้ว

---

## 4. คีย์ที่ส่งได้

### PCR-FI — `?c=PCR-FI`

| คีย์ | ชนิด | ค่า |
|---|---|---|
| `insName` | text | ชื่อครู |
| `certNo` | text | เลขที่ใบรับรอง CAAT |
| `checkDate` | date | `YYYY-MM-DD` |
| `duration` | number | ชั่วโมง ทศนิยม 1 ตำแหน่ง |
| `conductor` | text | ชื่อผู้ตรวจ |
| `tier` | enum | `t1annual` `t1initial` `t1postcor` `t1postabs` `t1directed` `t2lpc` `t3aoc` |
| `acReg` | text | แบบ/ทะเบียนอากาศยาน — Simulator ใส่รหัส FTD |
| `venue` | text | สนามบิน / พื้นที่ฝึก |
| `combined` | enum | `yes` `no` |
| `g1`…`g7` | 1–5 | บรีฟก่อนบิน · สาธิต · บรรยาย · ดูแลนักเรียน · **ความปลอดภัย ★** · บรีฟหลังบิน · เอกสาร |
| `result` | enum | `pass` `marginal` `fail` `unsat` |
| `remarks` | text | **ใส่ที่มาไว้บรรทัดแรก** (ดูข้อ 5) |
| `followup` | text | บังคับเมื่อ `result` ไม่ใช่ `pass` |
| `recheckDue` | date | กำหนดตรวจซ้ำ ถ้ามี |
| `correctiveInit` | enum | `yes` `no` — เปิดการอบรมแก้ไขมาตรฐาน D.2.8 แล้วหรือยัง |
| `htNotified` | date | วันที่แจ้ง HT — ใช้เมื่อ `correctiveInit` = `yes` |

ด้านไหน → `tier` อะไร

| ด้าน | `tier` |
|---|---|
| Progressive / Standard Check ประจำปี | `t1annual` |
| ครูใหม่ ก่อนปฏิบัติหน้าที่ครั้งแรก | `t1initial` |
| หลังการอบรมแก้ไขมาตรฐาน D.2.8 | `t1postcor` |
| Recurrent — กลับจากหยุดเกิน 90 วัน / ขาด current | `t1postabs` |
| Simulator / Flight — ระบุเหตุตามข้างบน | ตามเหตุ ไม่ใช่ตามด้าน |
| HT สั่งตรวจ (พบข้อกังวลด้านความปลอดภัย หรือผลตรวจสอบภายใน) | `t1directed` |

### PCR-TKI — `?c=PCR-TKI`

เหมือน PCR-FI ยกเว้น

| คีย์ | ชนิด | ค่า |
|---|---|---|
| `ipcType` | enum | `annual` `initial` `postcor` `postabs` `directed` — **ไม่มี Tier 2/3** |
| `subject` | text | วิชา / โมดูลที่สอน |
| `students` | number | จำนวนนักเรียนในชั้น |
| `g1`…`g6` | 1–5 | วางแผนบทเรียน · **การถ่ายทอด ★** · การมีส่วนร่วม · วัดผล · บริหารชั้นเรียน · เอกสาร |

ไม่มี `tier` `acReg` `combined` และ `g7` — ครูภาคทฤษฎีไม่มี Tier 2/3 และประเมิน 6 ข้อ

### EFC — `?c=EFC`

**ไม่ใช่ปลายทางของเมนู Annual Eval** — ใช้กับ TrainHub และ FTMS สำหรับรายงานจบหลักสูตร
บันทึกคีย์ไว้ที่นี่เพื่อให้ `check_prefill.py --doc` ตรวจสัญญาได้ครบทั้งสามใบในที่เดียว

| คีย์ | ชนิด | ค่า |
|---|---|---|
| `stuName` | text | ชื่อผู้เข้ารับการฝึก |
| `course` | text | ชื่อหลักสูตร |
| `courseType` | enum | `ground` `flight` |
| `studyFrom` | date | เริ่มเรียน |
| `studyTo` | date | จบเรียน |
| `learningHours` | number | ชั่วโมงที่นับให้ — ป้ายเปลี่ยนเป็นชั่วโมงบินเมื่อ `courseType` = `flight` |
| `completeDate` | date | วันที่จบ |
| `lastLogDate` | date | วันบินล่าสุด |
| `reportCourse` | enum | รหัสหลักสูตร TrainHub (UUID) — ใช้เมื่อ `courseType` ไม่ใช่ `flight` |
| `examType` | enum | `afterclass` `stage` `endcourse` `progressive` `endflight` |
| `examScore` | number | คะแนนที่ได้ |
| `totalScore` | number | คะแนนเต็ม |
| `result` | enum | `passed` `notpassed` `repeat` |
| `s7` | table | รายวิชา/บทเรียน — แถวละ `{subject, score, result, passedOn}` ขยายได้ไม่จำกัด |

---

## 5. ที่มาของข้อมูล

PCR ไม่มีช่องแยกสำหรับอ้างอิงระเบียนต้นทาง เพราะการเพิ่มช่องต้องแก้ `.docx`
ซึ่งจะเลื่อนรหัสเป็น `-B` แล้ว OMA บรรทัด 8892 / 9023 / 9026 ที่อ้าง `-A` จะกลายเป็นเลขที่ไม่มีอยู่จริง
ให้ใส่ที่มาเป็นบรรทัดแรกของ `remarks` แทน รูปแบบคงที่เพื่อให้ค้นย้อนหลังได้

```
ที่มา: Annual Eval · <ระบบ> · ระเบียน <id> · <DD MMM YYYY>
```

ตัวอย่าง

```
ที่มา: Annual Eval · d0507.361vision.org · ระเบียน AE-2026-0142 · 21 AUG 2026
```

---

## 6. ตัวอย่างเต็ม

```js
const o = {
  insName:'สมชาย ใจดี', certNo:'FI-2019-0447',
  checkDate:'2026-08-21', duration:1.5, conductor:'CFI สุรชัย',
  tier:'t1annual', acReg:'HS-DKA / C172S', venue:'VTBD — พื้นที่ฝึกตะวันออก',
  combined:'no',
  g1:4, g2:4, g3:3, g4:4, g5:5, g6:4, g7:4,
  result:'pass',
  remarks:'ที่มา: Annual Eval · d0507.361vision.org · ระเบียน AE-2026-0142 · 21 AUG 2026'
};
const p = btoa(String.fromCharCode(...new TextEncoder().encode(JSON.stringify(o))))
            .replace(/\+/g,'-').replace(/\//g,'_');
open('https://tistou35.github.io/d0507-forms/fill/?c=PCR-FI&p='+p);
```

---

## 6.5 การแปลงคะแนนจากระบบบันทึกการฝึกเป็นเกรด 1–5

### ทุกด้านต้องเก็บครบทั้ง 7 หัวข้อ (FI) / 6 หัวข้อ (TKI)

OMA D.2.9.2 เขียน "Conduct — Flight Instructor (FI) IPC" ไว้ **ชุดเดียว** แล้วใช้กับ
IPC ทั้งห้าประเภท ตารางประเภท IPC ในคู่มือระบุแค่ *ความถี่* กับ *กำหนดส่ง* ไม่ได้แยกวิธีตรวจ

| ขั้นตอนที่คู่มือบังคับ | ป้อนหัวข้อ |
|---|---|
| Ground assessment: pre-flight briefing observation | `g1` |
| In-flight observation — conductor เป็นผู้สังเกตหรือ **สมมติเป็นนักเรียน** | `g2` `g3` `g4` `g5` |
| Post-flight debrief observation | `g6` |
| Documentation review — FRAE, AFM, student training records | `g7` |

ทุกใบต้องให้เกรด 3 ขึ้นไป **ทุกข้อ** จึงจะผ่าน (D.2.9.5) ฟอร์มจึงตั้ง `g1`…`g7` เป็นช่องบังคับ
ด้านที่ไม่ได้สังเกตการสอนเลยจะกรอกใบนี้ไม่ครบ — และถ้ากรอกครบโดยไม่ได้สังเกตจริง
ก็เป็นการรับรองสิ่งที่ไม่ได้ตรวจ **ด้านที่ออก PCR-FI ต้องสังเกตการสอนเสมอ**

### กติกาการยุบ

1. จับข้อย่อยเข้ากลุ่มตามคอลัมน์ *Elements Assessed* ใน D.2.9.5
2. เกรดของหัวข้อ = **ค่าต่ำสุด**ของข้อในกลุ่ม ไม่ใช่ค่าเฉลี่ย
   ค่าเฉลี่ยกลบข้อที่แย่ ซึ่งเป็นสิ่งที่กฎในคู่มือตั้งใจจับ — ครูที่ 18 ข้อเต็มแต่ TEM ตก
   เฉลี่ยได้ 4.8 ทั้งที่คู่มือบอกว่าตกทันที
3. ข้อที่เป็น N/A หรือ Exempt **ตัดออกก่อนหาค่าต่ำสุด** ไม่ใช่นับเป็น 0
4. ถ้าทั้งกลุ่มเป็น N/A **อย่าส่งคีย์นั้นมา** ปล่อยว่างให้ผู้ตรวจกรอกเอง
   ส่งค่ากลาง ๆ มาแทนคือการเดาแทนผู้ตรวจ

### ตารางแปลงสเกล

| สเกลต้นทาง | → เกรด | เหตุผล |
|---|---|---|
| Excellent | 5 | |
| Very Good | 4 | |
| Good | 3 | ตรงกับ "Meets ATO standard consistently" |
| Fair | 2 | ตรงกับ "Below standard in isolated elements" |
| Poor | 1 | ตกทันทีตาม D.2.9.5 |
| N/A | ตัดทิ้ง | |
| Satisfied | 3 | |
| Not Satisfied | 2 | |
| Exempt | ตัดทิ้ง | |

สเกลสามระดับ **ไม่ควรแตะเกรด 1 กับ 5** — สองค่านั้นมีผลทางกฎ (1 = ตกทันที · 5 = Exceptional)
ข้อมูลต้นทางสามระดับไม่มีความละเอียดพอจะแยกได้ ผลข้างเคียงคือกฎ "เกรด 1 = ตกทันที"
จะไม่มีวันถูกกระตุ้นจากส่วนภาคอากาศ ผู้ตรวจต้องเป็นคนตั้งเอง — ตั้งใจให้เป็นแบบนั้น

### จับกลุ่ม — PCR-FI (จากระบบบันทึกการฝึก Part 2)

`Gr.n` = กลุ่มที่ n ใน Part 2 · `T#n` = ข้อที่ n ในกลุ่ม "Flight Teaching Skill & Evaluation"

| หัวข้อ | Elements Assessed (คำในคู่มือ) | แหล่งข้อมูล |
|---|---|---|
| `g1` Pre-flight Briefing | Lesson structure, objectives stated, **weather covered**, **emergency procedures**, student preparation confirmed | Gr.1 Planning of Flight (7) · Gr.5 Meteorology (2) · Gr.8 Emergency Equipment & Procedures (2) · T#5 Maneuvering Planning |
| `g2` Demonstration and Technique | Accuracy of manoeuvre, ATO standard technique, correct airspeed / altitude management | Gr.12 Flying — Smooth Handling, Accuracy (22) · T#2 Demonstration & Guidance |
| `g3` Instructional Patter | Clarity, correct sequence, standard phraseology, appropriate pace, absence of negative habits | T#1 Instructing / Communication · T#3 Draw the Attention · T#8 Inflight Teaching Atmosphere · T#9 Ghosting Control |
| `g4` Student Management | Recognition of errors, intervention timing and method, correction technique | T#4 Intervene the Student · T#6 Error Detection · T#7 Distraction Technique · T#10 Immediate Change of Teaching · T#12 Acceptable Envelope of Fault |
| `g5` ★ Safety and Airmanship | TEM application, situational awareness, **decision-making**, go-around judgment | Gr.14 Airmanship (5): Discipline · Skill & Proficiency · Knowledge · Situational Awareness · Judgment — บวก Gr.10 Judgment & Efficiency (2) |
| `g6` Post-flight Debrief | Structure, specific feedback, improvement actions identified, student motivation maintained | Gr.13 Debrief (6): Declaration of Result · Reason of Result · Rating & Performance · Guidance for Next Step · Balancing · Pleasant Atmosphere — บวก T#11 Inflight 'End of Training' |
| `g7` Documentation | Accuracy and completeness of FRAE, AFM, student training records | **ไม่มีในระบบต้นทาง** — ปล่อยว่าง |

**กลุ่มที่ไม่ได้ใช้ให้เกรด** — Gr.2 ATC Procedures · Gr.3 Route Procedures · Gr.4 Communications ·
Gr.6 Technical Questions · Gr.7 Company Regulations · Gr.9 Crew's Cooperation · Gr.11 Aircraft Systems

กลุ่มเหล่านี้วัดความสามารถของ *นักบิน* ไม่ใช่ของ *ครู* คู่มือมีเจ็ดหัวข้อสำหรับครูและไม่มีหัวข้อไหน
ถามว่าครูรู้ระบบอากาศยานดีแค่ไหน ยัดเข้าไปให้ครบทุกกลุ่มคือการสร้างความละเอียดที่เกณฑ์ไม่ได้เรียกหา
ให้เป็นข้อมูลประกอบที่ผู้ตรวจอ่าน ไม่ใช่ตัวกำหนดเกรด

### ช่องว่างที่รู้แล้ว — TEM ไม่มีข้อถามตรง ๆ

D.2.9.5 ระบุ `g5` ว่าครอบ *"TEM application, situational awareness, decision-making,
go-around judgment"* แต่ Gr.14 Airmanship ในระบบต้นทางมีห้าข้อคือ Discipline ·
Skill & Proficiency · Knowledge · **Situational Awareness** · **Judgment**

สองข้อหลังตรงกับ situational awareness และ decision-making ส่วน **TEM กับ go-around
judgment ไม่มีข้อถามตรง ๆ** ถูกกลืนอยู่ใน Judgment กับ Situational Awareness
ถ้าผู้ตรวจสอบภายนอกถามว่า "ประเมิน TEM ตรงไหน" คำตอบตอนนี้คือ "โดยนัย"

ตัวกันที่ทำไว้แล้ว — ฟอร์มแสดงเกณฑ์จากคู่มือใต้ทุกหัวข้อที่ให้เกรด ผู้ตรวจที่กำลังให้
เกรด `g5` จะเห็นคำว่า TEM และ go-around อยู่ตรงหน้า ไม่ใช่เห็นแค่คำว่า "Airmanship"
แล้วนึกเอาเอง · ถ้าจะปิดช่องว่างนี้ให้สนิทต้องเพิ่มข้อในระบบต้นทาง

Gr.13 Debrief ครอบครบทั้งสี่ element ของ `g6` ไม่มีช่องว่าง

### ⚠️ ค่าต่ำสุดกับหัวข้อ safety-critical

`g5` เป็นข้อ ★ ที่ได้ 2 แล้วตกทันที ถ้าดึงค่าต่ำสุดจาก 7 ข้อ (Airmanship 5 + Judgment 2)
ข้อเดียวที่ Not Satisfied จะทำให้ทั้งใบตก ซึ่ง *เข้มกว่า* ที่คู่มือตั้งใจ — คู่มือให้ผู้ตรวจ
ตัดสินหัวข้อ Airmanship เป็นภาพรวมหนึ่งเกรด ไม่ได้ให้ไล่หาข้อที่แย่ที่สุดจากรายการย่อย

ยังใช้ค่าต่ำสุดตามเดิม เพราะกฎทั้งชุดใน D.2.9.5 อ่านแบบ "ต่ำสุด" ไม่ใช่ "เฉลี่ย"
แต่ต้องมีตัวกัน — **ทุกหัวข้อที่ได้ต่ำกว่า 3 ให้ระบุชื่อข้อย่อยที่เป็นเหตุไว้ใน `remarks`**

```
g5 = 2 จาก "Go-around judgment" (Not Satisfied) — Airmanship ข้ออื่นผ่านทั้งหมด
```

**ถ้ามีหลายข้อได้ค่าต่ำสุดเท่ากัน ให้ใส่ครบทุกข้อ** ไม่ใช่หยิบข้อแรกที่เจอ
ผู้ตรวจที่เห็นว่ามีสามข้อไม่ผ่านจะตัดสินต่างจากที่เห็นว่ามีข้อเดียว

```
g5 = 2 จาก "Judgment", "Situational Awareness" (Not Satisfied)
```

ไม่งั้นผู้ตรวจจะเห็นแค่ "ไม่ผ่าน — ข้อความปลอดภัย" แล้วไม่รู้ว่ามาจากไหน
จะเชื่อตามหรือแก้เป็น 3 ก็ตัดสินไม่ได้ทั้งคู่ · เรื่องนี้ใช้กับ `g2` ด้วยที่ดึงจาก 22 ข้อ

### ต้องเขียนวิธียุบไว้ในใบด้วย

ต่อจากบรรทัด "ที่มา:" ใน `remarks` เพราะผู้ตรวจกำลังจะเซ็นรับรองเกรดเหล่านี้
ถ้าไม่บอกว่ามันถูกยุบมาอย่างไร เขาจะเซ็นทับความคลาดเคลื่อนโดยไม่รู้ตัว

```
เกรดยุบจากแบบประเมิน 19 ข้อ โดยใช้ค่าต่ำสุดในแต่ละหัวข้อ (N/A ตัดออก)
```

---

## 7. สิ่งที่ระบบฟอร์มบังคับเอง — อย่าทำซ้ำฝั่งส่ง

- **★ ตกอัตโนมัติ** — PCR-FI `g5` หรือ PCR-TKI `g2` ต่ำกว่า 3 คือไม่ผ่านทันที แม้คะแนนรวมถึงเกณฑ์
- **เกณฑ์ผ่าน** — ต้องได้ 3 ขึ้นไป *ทุกข้อ* ต่ำกว่านั้นระบบเตือนให้พิจารณา Marginal / Fail
- **ลายเซ็นสองฝ่าย** — ผู้ตรวจลงนามก่อน แล้วส่งให้ครูรับทราบภายใน 2 วัน
- ผลไม่ผ่านจะเปิดการอบรมแก้ไขมาตรฐานตาม D.2.8 (`IM-RTR-301-A`)
