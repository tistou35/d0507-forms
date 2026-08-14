# แบบมาตรฐานของฟอร์ม (form definition pattern)

ฟอร์มทุกใบใน `d0507-forms` นิยามด้วย **JSON ไฟล์เดียวต่อฟอร์ม** ใน `formdefs/<ABBR>.json`
ตัวเรนเดอร์ `assets/formkit.js` อ่านไฟล์นี้แล้วสร้างหน้ากรอก ตรวจความถูกต้อง คำนวณคะแนน
เดินลำดับอนุมัติ และส่งออกเอกสารให้เอง

**เพิ่มฟอร์มใหม่ = เพิ่มไฟล์ JSON แล้ว build — ไม่ต้องแตะโค้ด**

---

## 1. โครงระดับบน

```jsonc
{
  "code": "FRAE",                       // ต้องตรงกับ abbr ใน forms_register.json
  "doc": "D-0507-FRAE-001",
  "control": "IM-DRM-304-A",
  "issue": "01", "rev": "00", "eff": "07 JUL 2022",
  "title": { "th": "การประเมินความเสี่ยงก่อนทำการบิน",
             "en": "Flight Risk Assessment and Evaluation" },
  "retain": "OMA A.10",                 // ระยะเก็บรักษาตามคู่มือ

  "parties":  [ … ],   // ใครกรอกส่วนไหน — ดู §2
  "sections": [ … ],   // เนื้อฟอร์ม — ดู §3
  "compute":  [ … ],   // ค่าที่คำนวณเอง — ดู §5
  "gates":    [ … ],   // เงื่อนไขตัดสิน ผ่าน/ไม่ผ่าน — ดู §6
  "route":    [ … ],   // ลำดับอนุมัติ — ดู §7
  "export":   { … }    // ส่งออกเป็นเอกสาร — ดู §8
}
```

---

## 2. `parties` — ใครกรอกส่วนไหน

โจทย์ตั้งต้นข้อหนึ่งคือ “หลาย user กรอกร่วมกันจนจบ” ฟอร์มจึงแบ่งเจ้าของเป็นส่วน ๆ

```jsonc
"parties": [
  { "k": "stu", "n": "นักเรียน",        "auth": "public" },
  { "k": "fi",  "n": "ครูการบิน",       "auth": "role:FI"  },
  { "k": "ht",  "n": "หัวหน้าครูฝึก",   "auth": "role:HT"  }
]
```

| `auth` | ใครกรอกได้ |
|---|---|
| `public` | ใครก็ได้ ไม่ต้อง login (ฝั่งนักเรียน) |
| `role:FI` `role:HT` `role:CMM` `role:ACM` `role:ME` `role:OPS` | ต้อง login และมี role นั้น |
| `assignee` | เฉพาะคนที่ถูกเลือกให้เป็นผู้รับ |

**กติกา** — ส่วนของ party หนึ่ง อีก party แก้ไม่ได้ และ **จะไม่เห็นก่อนที่ตัวเองจะส่ง**
ถ้าตั้ง `"blind": true` ที่ section (ใช้กับ FRAE ที่ OMA กำหนดให้ต่างคนต่างประเมิน)

---

## 3. `sections` — เนื้อฟอร์ม

```jsonc
{
  "k": "B",
  "title": { "th": "ข้อมูลเที่ยวบิน", "en": "Flight information" },
  "party": "fi",
  "blind": false,
  "showIf": "typeOfFlight == 'xc'",     // ไม่ใส่ = แสดงเสมอ
  "tab": "T3",                          // อยู่แท็บไหน — ดู §3.1
  "fields": [ … ]
}
```

### 3.1 `ui` — แท็บและการแสดงผลแบบกระชับ

ฟอร์มยาว ๆ อย่าง FRAE มี 40 ช่อง ถ้าเรียงหน้าเดียวต้องเลื่อนจนหลง
ใส่ `ui.tabs` แล้วผูกแต่ละ section เข้าแท็บด้วย `sec.tab`

```jsonc
"ui": {
  "compact": true,                      // ช่องที่มี score เรนเดอร์เป็นแถวเดียว
  "tabs": [
    { "k": "T1", "th": "ทั่วไป", "en": "General flight" },
    …
  ]
}
```

* section ที่ไม่ระบุ `tab` จะไปอยู่แท็บแรก · แท็บที่ไม่มี section ที่ผ่าน `showIf` จะไม่แสดง
* หัวแท็บบอกคะแนนที่สะสมในแท็บนั้น (`+7`) หรือจำนวนช่องบังคับที่ยังว่าง (สีแดง)
* แถบคะแนนรวมค้างอยู่บนหัวตลอดทุกแท็บ — ป้ายระดับความเสี่ยงมาจาก `gate.short`
* gate ระดับ `stop` แสดงทุกแท็บ · ระดับอื่นแสดงเฉพาะแท็บสุดท้าย
* `route` และปุ่มส่งอยู่แท็บสุดท้าย
* ไม่ใส่ `ui.tabs` = เรนเดอร์แบบหน้าเดียวเหมือนเดิม ไม่ต้องแก้ฟอร์มที่ทำไว้แล้ว

## 4. ชนิดฟิลด์

ครอบคลุมฟอร์มจริงทั้ง 52 ใบที่สำรวจไว้

| `type` | ใช้กับ | ค่าที่เก็บ |
|---|---|---|
| `text` `textarea` `date` `time` `number` `email` `tel` | ทั่วไป | string / number |
| `select` | เลือกอย่างเดียว | `opt[].v` |
| `multi` | เลือกหลายอย่าง | array |
| `check` | ติ๊กเดียว | boolean |
| `checklist` | ฟอร์มตรวจ S/U/N-A | `{ "<itemId>": "S"\|"U"\|"NA" }` |
| `grade` | PCR ให้เกรด 1–5 | number |
| `scale` | ประเมินเป็นระดับ (ดีมาก/ดี/พอใช้) | `opt[].v` |
| `sign` | ลายเซ็น | รูปใน Storage + เวลา + uid |
| `static` | ข้อความเงื่อนไข ไม่ใช่ช่องกรอก (เช่น PWR) | — |
| `table` | แถวซ้ำ (ALR รายวัน · MRF timesheet) | array ของ object |

**ฟิลด์ร่วมทุกชนิด**

```jsonc
{
  "k": "restHours",
  "label": { "th": "ชั่วโมงพักผ่อน 24 ชม.", "en": "Rest in last 24 h" },
  "type": "number",
  "req": true,                    // บังคับกรอก
  "reqIf": "solo == true",        // บังคับเมื่อเข้าเงื่อนไข
  "showIf": "…",                  // แสดงเมื่อเข้าเงื่อนไข
  "hint": { "th": "…" },
  "min": 0, "max": 24,
  "score": { "<8": 3, "<6": 5 }   // ค่าที่ส่งเข้าคะแนนรวม
}
```

**`checklist` และ `grade` มีของเพิ่ม**

```jsonc
{ "type": "checklist", "items": [ { "id":"V1.1", "th":"…", "how":"วิธีตรวจ" } ],
  "onU": "openCAR" }                       // ติ๊ก U แล้วเปิด CAR อัตโนมัติ

{ "type": "grade", "star": true, "max": 5 } // star = safety-critical
```

## 5. `compute` — ค่าที่คำนวณเอง

```jsonc
"compute": [
  { "k": "score",   "op": "sumScore" },                    // รวม score ของทุกฟิลด์
  { "k": "total",   "op": "sum",  "of": ["g1","g2","g3"] },
  { "k": "pct",     "op": "pct",  "of": "total", "max": 35 }
]
```

## 6. `gates` — เงื่อนไขตัดสิน

จุดที่ทำให้ฟอร์มเป็น *ระบบ* ไม่ใช่แค่กระดาษอิเล็กทรอนิกส์

```jsonc
"gates": [
  { "when": "score >= 30", "level": "stop",
    "short": { "th": "EXTREME RISK!" },        // ป้ายสั้นบนแถบคะแนน
    "msg": { "th": "ห้ามทำการบิน — ความเสี่ยงสูงเกินเกณฑ์" } },
  { "when": "score >= 10 && score <= 29", "level": "warn", "require": "route:ht",
    "short": { "th": "HIGH RISK!" },
    "msg": { "th": "ต้องได้รับอนุมัติจากหัวหน้าครูฝึกก่อนออกบิน" } },

  // PCR: ได้เกรดต่ำในข้อ safety-critical = ตกทันที แม้คะแนนรวมจะผ่าน
  { "when": "anyStarBelow(3)", "level": "stop",
    "msg": { "th": "ไม่ผ่าน — ข้อ safety-critical ต่ำกว่าเกณฑ์" } }
]
```

`level`: `stop` = ส่งไม่ได้ · `warn` = ส่งได้แต่บังคับขั้นอนุมัติเพิ่ม · `info` = แจ้งเฉย ๆ

เงื่อนไขที่ทับช่วงกันจะขึ้นพร้อมกันทั้งหมด ถ้าไม่ต้องการให้ซ้อน ต้องปิดช่วงเอง
เช่น `score >= 10 && score <= 29` ไม่ใช่ `score >= 10` เฉย ๆ

## 7. `route` — ลำดับอนุมัติ

```jsonc
"route": [
  { "step": 1, "party": "stu", "sign": true },
  { "step": 2, "party": "fi",  "sign": true, "assignedBy": "submitter" },
  { "step": 3, "party": "ht",  "sign": true, "onlyIf": "score >= 10", "slaDays": 1 }
]
```

- `assignedBy: "submitter"` → ผู้กรอกเลือกผู้รับเอง (ตามที่ตกลงกันเรื่องนักเรียนเลือกครู)
- `onlyIf` → ขั้นนั้นเกิดเฉพาะเมื่อเข้าเงื่อนไข
- `slaDays` → เกินกำหนดแล้วขึ้นเตือน
- ทุกขั้นบังคับตามลำดับ ข้ามไม่ได้

## 8. `export` — ส่งออกเอกสาร

```jsonc
"export": {
  "docx": "D-0507-FRAE-001.docx",       // แม่แบบต้นฉบับในโฟลเดอร์ Manual revision
  "lockUntilComplete": true,            // ครบทุกลายเซ็นก่อนจึงพิมพ์ฉบับสมบูรณ์ได้
  "draftWatermark": "DRAFT",
  "map": { "pic_name": "picName", "score": "score" }   // ช่องในเอกสาร ← ฟิลด์ในฟอร์ม
}
```

---

## 9. ที่เก็บข้อมูล

| ที่ | เก็บอะไร |
|---|---|
| `formDefs/<CODE>` | นิยามฟอร์ม (ไฟล์นี้) — เผยแพร่ตอน build และ sync ขึ้น Firestore |
| `submissions/{id}` | `{ formCode, defRev, status, data{}, computed{}, parties{}, assigneeUid }` |
| `submissions/{id}/events/{}` | log แบบ append-only — แก้ไม่ได้ ลบไม่ได้ → ใช้ทำ `SKILL:editor-note` |
| `tasks/{id}` | คิวงานของผู้รับแต่ละขั้น |

**`defRev`** สำคัญ — record ผูกกับ **เวอร์ชันของนิยามฟอร์มที่ใช้กรอกจริง**
แก้นิยามภายหลังจะไม่ย้อนไปเปลี่ยนของเก่า (ข้อกำหนดของเอกสารควบคุม)

---

## 10. ขั้นตอนเพิ่มฟอร์มใหม่

1. คัดลอก `_TEMPLATE.json` เป็น `formdefs/<ABBR>.json`
2. กรอกหัวเอกสารให้ตรงกับ `.docx` ต้นฉบับ
3. ใส่ `parties` → `sections` → `fields`
4. ใส่ `compute` / `gates` ถ้าฟอร์มมีการคำนวณหรือเงื่อนไขตัดสิน
5. ใส่ `route` ตามลำดับอนุมัติจริง
6. `python3 build.py` — build จะตรวจให้เอง:
   - `code` ต้องมีอยู่ใน `forms_register.json`
   - `party` ที่อ้างใน section/route ต้องมีใน `parties`
   - `showIf` / `when` ต้องอ้างฟิลด์ที่มีจริง
   - ทุก `type` ต้องเป็นชนิดที่รองรับ
7. เปิด `/f/<ABBR>/` เพื่อดูผล
