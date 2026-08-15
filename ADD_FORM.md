# วิธีเพิ่มฟอร์มใหม่เข้าระบบ

ขั้นตอนที่ใช้จริงกับ **FRAE** และ **SDF** ทำซ้ำได้กับฟอร์มที่เหลือ

เวลาที่ใช้ต่อฟอร์ม ~1–2 ชั่วโมง ส่วนใหญ่หมดไปกับการอ่าน `.docx` ให้ครบ ไม่ใช่การเขียนโค้ด

---

## หลักสองข้อที่ทำให้ไม่พลาด

**1 · `.docx` คือความจริง ไม่ใช่ทะเบียน**
ทะเบียน `forms_register.json` เคยผิดมาแล้ว — SDF ระบุ Rev 00 / 10 FEB 2021
แต่หัวกระดาษจริงคือ Rev 01 / 22 JUN 2026 · เจอ Issue/Rev ไม่ตรง ให้แก้ทะเบียนตามเอกสาร

**2 · ตรวจด้วยการเปิดไฟล์ผลลัพธ์ ไม่ใช่ดู log**
บั๊กสี่ตัวในโปรเจกต์นี้โผล่เฉพาะตอนเปิด PDF จริงดู — log เขียนว่าสำเร็จทุกครั้ง
`{{submittedAt}}` ค้างท้ายหน้า · ช่องสรุปชั่วโมงว่าง · ป้ายแท็บไม่อัปเดตหลังลงนาม · ปุ่มส่งไม่ได้ต่อสายไว้

---

## ขั้นตอน

### 1 · อ่านเอกสารต้นฉบับ

```bash
python3 - <<'PY'
import docx
d = docx.Document('../D-0507-<ABBR>-001.docx')
s = d.sections[0]
for t in s.header.tables:
    for r in t.rows: print('HEADER', ' | '.join(c.text.strip() for c in r.cells))
for t in s.footer.tables:
    for r in t.rows: print('FOOTER', ' | '.join(c.text.strip() for c in r.cells))
for i, t in enumerate(d.tables):
    print('--- ตาราง', i, '---')
    for r in t.rows:
        seen, cells = set(), []
        for c in r.cells:
            if c._element in seen: continue
            seen.add(c._element); cells.append(c.text.strip().replace('\n',' / '))
        print('  ', ' | '.join(cells))
PY
```

เก็บให้ครบ: **control code · Issue/Rev · EFF** จากหัวกระดาษ · ทุกช่องกรอก · ทุกช่องติ๊กพร้อมน้ำหนักคะแนน ·
ข้อความคำรับรองแบบคำต่อคำ · ช่องลงนามมีกี่ฝ่าย

### 2 · เขียนนิยามฟอร์ม

สร้าง `formdefs/<ABBR>.json` ตามสเปกใน [`formdefs/_SCHEMA.md`](formdefs/_SCHEMA.md)

โครงที่ใช้ซ้ำได้ทุกใบ

```jsonc
{
  "code": "<ABBR>", "doc": "D-0507-<ABBR>-001", "control": "<จากหัวกระดาษ>",
  "issue": "01", "rev": "01", "eff": "22 JUN 2026",
  "title": { "th": "…", "en": "…" },

  "ui": {
    "compact": true,                       // ช่องที่มีคะแนนเป็นแถวเดียว
    "tabs": [ { "k": "T1", "th": "…", "en": "…" }, … ],
    "headline": { "value": "t7", "of": 28, "th": "…", "en": "…" }   // ฟอร์มที่ไม่มีคะแนนรวม
  },

  "parties": [
    { "k": "dec", "n": {…}, "auth": "public"   },   // ผู้กรอก
    { "k": "app", "n": {…}, "auth": "role:mgt" }    // ผู้อนุมัติ
  ],
  "sections": [ … ],
  "compute":  [ … ],
  "gates":    [ … ],
  "route": [
    { "step": 1, "party": "dec", "sign": true },
    { "step": 2, "party": "app", "sign": true,
      "assignedBy": "later", "pool": "HT", "canDelegate": true, "slaDays": 1 }
  ],
  "export": { "docx": "D-0507-<ABBR>-001.docx", "lockUntilComplete": true }
}
```

**ที่ต้องระวัง**

| เรื่อง | กติกา |
|---|---|
| ค่าตัวเลือก `opt[].v` | อักษร ตัวเลข `_` `-` เท่านั้น — ช่องว่างและ `/` ทำให้ token พัง |
| คะแนน | อยู่ใน `score` อย่างเดียว **ห้ามพิมพ์ซ้ำในป้าย** ตัวเรนเดอร์แสดงให้เอง |
| ช่วงของ gate | ปิดช่วงเสมอ `score >= 10 && score <= 29` ไม่งั้นขึ้นซ้อนกันหลายอัน |
| ส่วนของผู้อนุมัติ | ใส่ `"hideOthers": true` — คนกรอกไม่ต้องเห็นช่องที่ตัวเองแตะไม่ได้ |
| ผู้อนุมัติ | `assignedBy` เป็น `submitter` (ผู้ส่งเลือกเอง) หรือ `later` + `pool` (เข้ากองรอ) |
| ช่องที่อ่านคู่กัน | `"half": true` ทั้งคู่ → วางซ้ายขวา |
| วันที่ | `"prefill": "today"` |
| ชั่วโมง | `"step": "0.1"` ไม่งั้นเบราว์เซอร์ไม่รับทศนิยม |

### 3 · build แล้วดูของจริงในเบราว์เซอร์

```bash
python3 build.py && python3 -m http.server 8765
```

เปิด `http://localhost:8765/fill/?c=<ABBR>` แล้วตรวจด้วยตา

- [ ] ทุกแท็บมีเนื้อหา ป้ายบนหัวแท็บนับเลขถูก
- [ ] gate ขึ้นตรงช่วง — ลองค่าที่ทำให้ **ผ่าน / เตือน / ห้ามส่ง** อย่างละครั้ง
- [ ] ช่องบังคับยังไม่ครบ → ข้ามแท็บไปข้างหน้าไม่ได้
- [ ] ลงนามแล้วปุ่มส่งเปิด และป้ายแท็บเปลี่ยนเป็น ✓
- [ ] สลับ EN แล้วไม่มีคำไทยตกค้างในส่วนของฟอร์ม

### 4 · เขียนแม่แบบ PDF

สร้าง `gas/Template_<ABBR>.gs` ลอกโครงจาก `Template_SDF.gs`
ใช้ตัวช่วยร่วมที่อยู่ใน `Template_FRAE.gs` ได้เลย (`attr_` `styleTable_` `cell_` `label_` `value_` `gap_`)

> ⚠️ **Apps Script ใช้ global namespace เดียวทั้งโปรเจกต์** — ตั้งชื่อฟังก์ชันใหม่ให้ไม่ซ้ำไฟล์อื่น
> เคยชนกันมาแล้วที่ `signatures_` แล้วทับกันเงียบ ๆ ไม่มี error

**token ที่ใช้ได้**

| แบบ | ผล |
|---|---|
| `{{key}}` | ค่าที่กรอก |
| `{{k_key}}` | ☑ / ☐ ช่องติ๊กเดี่ยว |
| `{{k_key_value}}` | ☑ เฉพาะตัวที่เลือก |
| `{{sig_key}}` | ฝังรูปลายเซ็นจริง |
| `{{t7}}` `{{score}}` … | ค่าคำนวณจาก `compute` |
| `{{tracking}} {{doc}} {{issue}} {{rev}} {{submittedAt}}` | เติมให้อัตโนมัติ |

### 5 · ตรวจอัตโนมัติ

```bash
python3 tools/check_form.py <ABBR>
```

จับสิ่งที่ตาคนมองข้าม — Issue/Rev ไม่ตรงทะเบียน · ช่องให้คะแนนหายจากแม่แบบ ·
token ไม่มีที่มา · `assignedBy later` ที่ลืมใส่ `pool` · ส่วนผู้อนุมัติที่ลืม `hideOthers`

**ต้องผ่านก่อนไปขั้นถัดไป**

### 6 · เอาขึ้น Apps Script

1. เปิด [โปรเจกต์ Apps Script](https://script.google.com) → **+ → Script** → ตั้งชื่อ `Template_<ABBR>`
2. วางเนื้อไฟล์ → `⌘S`
3. เลือกฟังก์ชัน `build<Abbr>Template` → **Run** → ดู Execution log ว่าได้ URL ของแม่แบบ
4. ถ้าแก้ `Code.gs` ด้วย → **นับบรรทัดยืนยันก่อน deploy**

> 🔴 **การวางโค้ดใน Apps Script ล้มเหลวเงียบ ๆ ได้** เกิดขึ้นแล้วสองครั้งในโปรเจกต์นี้
> กด `⌘↓` ดูเลขบรรทัดสุดท้าย เทียบกับ `wc -l` ของไฟล์ต้นทาง ก่อนกด Deploy เสมอ

5. **Deploy → Manage deployments → ✏️ → Version: New version → Deploy**
   ห้ามสร้าง deployment ใหม่ — URL จะเปลี่ยน แล้ว `gasUrl` ใน config จะชี้ผิด

### 7 · ทดสอบครบวงจรบนเว็บจริง

รอ GitHub Pages ขึ้นไฟล์ใหม่ก่อน

```bash
H=$(python3 -c "import hashlib;print(hashlib.sha1(open('assets/formkit.js','rb').read()).hexdigest()[:8])")
until curl -s "https://tistou35.github.io/d0507-forms/fill/?c=<ABBR>" | grep -q "formkit.js?v=$H"; do sleep 5; done
```

แล้วเดินทั้งเส้น: กรอก → ตรวจทาน → ส่ง → คิวงาน → อนุมัติ → **เปิด PDF ที่ได้จริง**

- [ ] ทุกช่องที่กรอกไปปรากฏใน PDF
- [ ] ช่องติ๊กเป็น ☑/☐ ไม่ใช่ `true`/ว่าง
- [ ] วันที่เป็น `DD MMM YYYY`
- [ ] ลายเซ็นเป็นรูป ไม่ใช่ข้อความ
- [ ] ท้ายหน้าไม่มี `{{...}}` ค้าง
- [ ] Drive มีครบ: `<ABBR>/` · `<ABBR> — Records` · `<ABBR>_TEMPLATE` · ไฟล์ PDF

### 8 · commit

```bash
python3 tools/check_form.py && python3 build.py && git add -A && git commit && git push
```

ข้อความ commit เขียนว่า**แก้อะไรเพราะอะไร** โดยเฉพาะบั๊กที่เจอระหว่างทาง

---

## ลำดับที่แนะนำสำหรับฟอร์มที่เหลือ

เรียงตามความถี่การใช้และความซับซ้อน

| ลำดับ | ฟอร์ม | เหตุผล |
|---|---|---|
| 1 | **PWR** ใบสละสิทธิ์ผู้โดยสาร | สั้น มีลายเซ็นเดียว ไม่มีอนุมัติ |
| 2 | **ASF** แจ้งเหตุนิรภัย | เข้ากองรอแบบ SDF · ต่อกับ SMS |
| 3 | **CAR** ขอให้แก้ไข | มีวงจรตอบกลับ ใช้ปุ่มตีกลับที่ทำไว้แล้ว |
| 4 | **PCR-FI / PCR-TKI** | ใช้ `grade` + `anyStarBelow` ที่ formkit รองรับแล้ว |
| 5 | **ALR / MRF** | ต้องทำชนิด `table` (แถวซ้ำ) ก่อน — ยังไม่มี |

ฟอร์มที่อยู่ในระบบอื่น (`sys` ไม่ใช่ `here`) ไม่ต้องทำ — ลิงก์ออกไปอย่างเดียว

---

## สิ่งที่ยังไม่มีในระบบ

| อะไร | ต้องทำเมื่อ |
|---|---|
| ชนิด `table` แถวซ้ำ | ทำ ALR หรือ MRF |
| แจ้งเตือน LINE | เปิด LINE Official Account + Messaging API แล้ว |
| ทดสอบปุ่มมอบหมายต่อ | มีผู้อนุมัติคนที่สองในระบบ |
| แนบไฟล์ | ฟอร์มที่ต้องแนบรูปหรือเอกสาร |
