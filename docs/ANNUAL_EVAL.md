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
