# ตัวส่งออกไป Google Drive และ Google Sheet

Apps Script Web App ที่รับใบฟอร์ม**ที่จบแล้ว** มาบันทึกลง Drive และ Sheet

เลือก Apps Script แทน Cloud Functions เพราะ **ไม่ต้องขึ้น Blaze และไม่ต้องมี service account key**
และเข้าถึง Docs/Drive/Sheets ได้ตรง จึงทำ PDF จากแม่แบบ `.docx` ต้นฉบับได้

---

## โครงที่จะเกิดขึ้นใน Drive

โฟลเดอร์แม่: <https://drive.google.com/drive/folders/1osUg2ReIT_mqll6BbDSUR-FBAg4zSEp6>

```
โฟลเดอร์แม่/
├── FRAE/
│   ├── FRAE — Records            (Google Sheet)   1 แถวต่อ 1 ใบที่จบแล้ว
│   ├── FRAE_TEMPLATE             (Google Doc)     แม่แบบ PDF — อัปโหลดเอง
│   ├── FRAE-2026-0814-001.pdf
│   └── FRAE-2026-0814-002.pdf
├── ASF/
│   └── …
```

subfolder และ Sheet **สร้างอัตโนมัติครั้งแรกที่มีใบจบ** ไม่ต้องเตรียมล่วงหน้า

**เขียนเมื่อจบเท่านั้น** — จบที่ submit (route ขั้นเดียว) หรือจบทั้ง flow
ระหว่างรออนุมัติไม่เขียน กันเอกสารครึ่ง ๆ กลาง ๆ ปนในแฟ้ม

---

## ติดตั้ง

### 1. สร้างสคริปต์

<https://script.google.com> → **New project** → ตั้งชื่อ `D-0507 Forms Exporter`
ลบโค้ดตัวอย่างทิ้ง แล้ววางเนื้อ **`Code.gs`** ทั้งไฟล์

### 2. ตั้ง Script Properties

Project Settings (เฟือง) → **Script properties** → Add:

| Property | Value |
|---|---|
| `PARENT_FOLDER_ID` | `1osUg2ReIT_mqll6BbDSUR-FBAg4zSEp6` |
| `FIREBASE_API_KEY` | apiKey จาก `firebase/config.json` |
| `FIREBASE_PROJECT` | `d0507-forms` |

เก็บเป็น property ไม่ hardcode ลงไฟล์ เพราะสคริปต์อาจถูกแชร์หรือคัดลอก

### 3. ทดสอบก่อน deploy

เลือกฟังก์ชัน **`testExport`** → Run
ครั้งแรกจะขออนุญาตเข้าถึง Drive/Sheets/Docs — กดอนุญาต

ควรได้: โฟลเดอร์ `FRAE` · Sheet `FRAE — Records` · ไฟล์ `FRAE-TEST-0001.pdf`
(PDF ตอนนี้เป็นฉบับสำรอง เพราะยังไม่มีแม่แบบ — ดู §แม่แบบ PDF)

ลบไฟล์ทดสอบทิ้งได้หลังตรวจแล้ว

### 4. Deploy

**Deploy → New deployment → Web app**

| | |
|---|---|
| Execute as | **Me** |
| Who has access | **Anyone** |

คัดลอก **Web app URL** ที่ได้

⚠️ *Anyone* ไม่ได้แปลว่าใครก็เขียนได้ — สคริปต์บังคับให้ทุก request แนบ
**Firebase ID token** และตรวจกับ Identity Toolkit ว่าเป็นของโปรเจกต์ `d0507-forms` จริง
คนที่ไม่ได้ผ่านหน้าเว็บของเราจะไม่มี token

### 5. ใส่ URL กลับเข้า repo

แก้ `firebase/config.json` ช่อง `gasUrl` แล้ว

```bash
python3 build.py
git add -A && git commit -m "ใส่ URL ตัวส่งออก Drive/Sheet" && git push
```

ถ้ายังว่าง `build.py` จะเตือน และปุ่มส่งออกจะยังไม่ทำงาน

---

## แม่แบบ PDF

ค่าตั้งต้นจะสร้าง PDF สำรองจาก HTML — อ่านได้แต่**หน้าตาไม่ตรงฟอร์มต้นฉบับ**
ถ้าต้องการฉบับที่เหมือนของจริง ทำตามนี้ต่อฟอร์ม

1. อัปโหลด `D-0507-<ABBR>-001.docx` จากโฟลเดอร์ Manual revision เข้า subfolder `<ABBR>`
2. คลิกขวา → **Open with → Google Docs** (Drive แปลงให้เอง)
3. เปลี่ยนชื่อไฟล์ Google Doc เป็น **`<ABBR>_TEMPLATE`**
4. ใส่ placeholder `{{ชื่อฟิลด์}}` ตรงช่องว่างที่ต้องเติม

### กติกา placeholder

| แบบ | ใช้กับ | ตัวอย่าง |
|---|---|---|
| `{{key}}` | ช่องกรอกทั่วไป | `PIC Name: {{picFirst}} {{picLast}}` |
| แทนที่ `☐` ด้วย `{{k_xxx}}` | ช่องติ๊ก — สคริปต์เติม `☑` หรือ `☐` | `{{k_convSigmet}} (5)` |
| `{{tracking}}` `{{doc}}` `{{issue}}` `{{rev}}` `{{defRev}}` `{{score}}` `{{submitter}}` `{{submittedAt}}` | ใส่ให้อัตโนมัติทุกฟอร์ม | |

ชื่อ `key` ต้องตรงกับฟิลด์ใน `formdefs/<ABBR>.json`
placeholder ที่ไม่มีค่าจะถูกแทนด้วยค่าว่าง ไม่ค้างเป็น `{{...}}` ในไฟล์

**การแทน `☐` ด้วย token รักษาเลย์เอาต์เดิมไว้ทั้งหมด** เพราะแทนที่อักขระเดียวในตำแหน่งเดิม
ไม่ได้ย้ายหรือเพิ่มบรรทัด

⚠️ ต้องมี `formdefs/<ABBR>.json` ก่อนจึงจะรู้ว่าช่องติ๊กไหนคู่กับ key ไหน
จึงควรทำ **นิยามฟอร์มก่อน แล้วค่อยทำแม่แบบ**

---

## payload ที่สคริปต์รับ

```jsonc
{
  "idToken": "<Firebase ID token>",
  "submission": {
    "formCode": "FRAE", "tracking": "FRAE-2026-0814-001",
    "status": "complete",                 // ต้องเป็น complete เท่านั้น
    "doc": "D-0507-FRAE-001", "issue": "01", "rev": "00", "defRev": 1,
    "title": "การประเมินความเสี่ยงก่อนทำการบิน",
    "submitterName": "…", "submitterEmail": "…",
    "signedBy": ["…", "…"],
    "computed": { "score": 7 },
    "data": { "picFirst": "…", "totalScore": 7, "decision": "GO" }
  }
}
```

ฝั่งเว็บเรียกผ่าน `D0507.exportSubmission(submission)` ใน `assets/app.js`

---

## เรื่องที่ต้องรู้

**ยิงซ้ำไม่เกิดแถวซ้ำ** — สคริปต์เช็ค `tracking` ในชีตก่อน และไม่สร้าง PDF ทับถ้ามีชื่อเดิมอยู่แล้ว

**คอลัมน์ใหม่ต่อท้าย ไม่เขียนทับ** — เพิ่มฟิลด์ในฟอร์มภายหลังแล้วชีตเดิมยังอ่านได้ตามปกติ

**CORS** — Apps Script เปลี่ยนเส้นทางไป `googleusercontent.com` ทำให้บางเบราว์เซอร์อ่าน response ไม่ได้
ถึงแม้ POST จะถึงปลายทางแล้ว ฝั่งเว็บจึงถือว่า "ส่งแล้ว" และให้เปิดโฟลเดอร์ตรวจเองได้
ถ้าอ่าน response ไม่ได้จะได้ `unconfirmed: true`

**ข้อจำกัดที่ยอมรับไว้** — สคริปต์เชื่อ payload ที่เว็บส่งมา (ไม่ได้อ่านซ้ำจาก Firestore)
เพราะการอ่าน Firestore จากฝั่ง Apps Script ต้องใช้ service account key ซึ่งตั้งใจเลี่ยง
สิ่งที่ยืนยันได้คือ **ผู้ส่งมีตัวตนจริงในโปรเจกต์นี้** และ uid/email ที่ตรวจได้ถูกบันทึกคู่ไว้
ถ้าต้องการความเข้มกว่านี้ ต้องขึ้น Blaze แล้วใช้ Cloud Function อ่านจาก Firestore ตรง

**ลายเซ็น** — ตอนนี้บันทึกในชีตเป็นข้อความ `(ลายเซ็น)` ยังไม่ฝังรูปลงใน PDF
ต้องทำเพิ่มเมื่อถึงขั้นลงนามจริง
