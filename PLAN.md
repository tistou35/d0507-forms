# d0507-forms — แผนงาน

**Repo:** `tistou35/d0507-forms` → `https://tistou35.github.io/d0507-forms/`
**Firebase:** โปรเจกต์ `d0507-audit` เดิม (ใช้ร่วม — login ครั้งเดียวใช้ได้ทั้งสอง repo เพราะ origin เดียวกัน)
**สถานะ:** วางแผน · ยังไม่เขียนโค้ดหน้าเว็บ
**อัปเดต:** 31 JUL 2026

---

## 1. ที่ทำไปแล้วในโฟลเดอร์นี้

| ไฟล์ | สถานะ |
|---|---|
| `forms_register.json` | ✅ ทะเบียน 52 ฟอร์ม พร้อมฟิลด์ `sys` `public` `assignTo` `sysConfirm` |
| `assets/fonts/Interstate-Bold.otf` · `Ocean_Sans_Std_Book.ttf` | ✅ ฟอนต์แบรนด์จาก design handoff |
| `assets/logo.svg` | ✅ |
| `src/` | ว่าง — ยังไม่เขียน |
| `build.py` | ยังไม่เขียน |

**ยังไม่ได้ `git init`** และยังไม่ได้ push อะไร

---

## 2. โครงไฟล์ที่จะเป็น

```
d0507-forms/                     ← repo root = ที่ GitHub Pages เสิร์ฟ
├── index.html                   build → หน้าประตูเข้า (นักเรียน / เจ้าหน้าที่)
├── student/index.html           build → ฝั่งนักเรียน   ไม่ต้อง login
├── staff/index.html             build → ฝั่งเจ้าหน้าที่ ต้อง login
├── assets/
│   ├── fonts/                   Interstate-Bold.otf · Ocean_Sans_Std_Book.ttf
│   └── logo.svg
├── src/                         ← แก้ที่นี่เท่านั้น ไม่แก้ไฟล์ที่ build แล้ว
│   ├── shell.css                design tokens + component ทั้งหมด
│   ├── door.html
│   ├── student.html
│   └── staff.html
├── forms_register.json          ← แหล่งข้อมูลกลาง แก้แล้ว build
├── build.py
├── .nojekyll
└── PLAN.md · HANDOFF.md
```

**กติกาเดียวกับ d0507-audit:** แก้ที่ `src/` เท่านั้น · ไฟล์ที่ build แล้วห้ามแก้มือ

### บทเรียนจาก d0507-audit ที่ต้องเลี่ยง

`d0507-audit/HANDOFF.md` มีกฎเช็กว่า “ถ้า `index.html` เหลือหลักหน่วย KB แปลว่า build.py โดนทับ”
ตอนแยก portal ออกจาก build.py ทำให้ build.py เหลือ 4.9 KB → เข้าเงื่อนไขพอดี → อีก session restore ทับ (commit `095d6f8`)

repo นี้จึงตั้งกฎตั้งแต่แรกว่า **build.py เป็นตัวประกอบอย่างเดียว ไม่เก็บ HTML ไว้ข้างใน** และเขียนกฎตรวจไว้ที่
`HANDOFF.md` ให้ตรวจขนาด **ไฟล์ผลลัพธ์** ไม่ใช่ขนาด build.py

---

## 3. Build pipeline

`build.py` อ่าน `src/*` + `forms_register.json` แล้วแทน placeholder:

| Placeholder | ค่า |
|---|---|
| `@@CSS@@` | เนื้อ `src/shell.css` (inline เข้าไปในหน้า ไม่ใช้ไฟล์แยก) |
| `@@BASE@@` | path กลับไป root — `''` สำหรับ `index.html`, `'../'` สำหรับ `student/` และ `staff/` |
| `@@FBCFG@@` | `FIREBASE_CONFIG` โปรเจกต์ `d0507-audit` |
| `@@REG@@` | `forms_register.json` (escape `</` → `<\/`) |
| `@@REGPUB@@` | เฉพาะฟอร์ม `public:true` — **ฝั่งนักเรียนได้แค่ชุดนี้ ไม่มีรหัสควบคุมภายในหรือสถานะ LEF** |
| `@@STATS@@` | ตัวเลขสรุปสำหรับหน้าประตู |

build ต้อง **error ถ้ามี placeholder เหลือ** และ **error ถ้า `@@REGPUB@@` มีฟิลด์ที่ไม่ควรหลุดสาธารณะ**
(`code`, `lef`, `st`, `note`) — กันข้อมูลภายในรั่วโดยไม่ตั้งใจ

ฟอนต์เสิร์ฟเป็นไฟล์จาก `assets/fonts/` (ไม่ inline base64 แบบ mockup) เพราะ browser cache ได้และไฟล์เล็กลง

---

## 4. สามหน้า — ขอบเขตของแต่ละหน้า

### 4.1 `/` ประตูเข้า
- static ล้วน ไม่มี Firebase
- สองการ์ด: นักเรียน (ไม่ต้อง login) · เจ้าหน้าที่ (login)
- จำทางเลือกใน `localStorage` แล้วเด้งเข้าประตูเดิมครั้งถัดไป · เลือกใหม่ที่ `/?pick=1`
- ตัวเลขบนการ์ดคำนวณจาก register ตอน build

### 4.2 `/student/` ฝั่งนักเรียน — ไม่ต้อง login
**ทำได้**
- intent finder ค้นข้ามทุกระบบ (ดู §6 synonym index)
- ฟอร์ม 9 ใบที่ `public:true`
- ฟอร์มที่อยู่ระบบภายนอกแสดงป้ายบอกและลิงก์ออกไป
- ขั้นตอนก่อนออกบิน (เนื้อหาคงที่)
- ฟอร์มที่มี `assignTo` → เลือกผู้รับตอนกรอก + กรอกอีเมลตัวเอง → หน้ารับเรื่อง + ส่งสำเนาทางอีเมล

**ห้ามมีเด็ดขาด**
- รหัส control code ภายใน · สถานะ LEF · เนื้อหาคู่มือ · อีเมลบุคลากร
- ตัวเลือกครูดึงจาก `publicDirectory/instructors` ซึ่งมีแค่ **ชื่อกับตำแหน่ง**

**Firebase ที่ต้องใช้** (แก้จากที่เคยสรุปว่าไม่ต้องใช้เลย)
- Anonymous Auth → ได้ uid ชั่วคราวไว้ทำ rate limit
- App Check (reCAPTCHA v3)
- rule: `create` อย่างเดียวบน `submissions` · อ่านไม่ได้ · แก้ไม่ได้

### 4.3 `/staff/` ฝั่งเจ้าหน้าที่ — ต้อง login
- Firebase Auth เดียวกับ audit → **ไม่ต้อง login ซ้ำ**
- rail: หน้าหลัก · คลังฟอร์ม 52 · ติดตามงานของฉัน · รออนุมัติ · ระบบเชื่อมโยง · ทะเบียน LEF · **งานตรวจสอบ → `../d0507-audit/`**
- คิวงานอ่านจาก `tasks/` where `assignee == uid` — **รวมงาน CAR จากฝั่ง audit ด้วย** แล้ว deep-link ข้ามไป
- ทะเบียน LEF เต็ม 52 แถว + filter + สถานะควบคุม
- จัดฟอร์มตามกลุ่มผู้ใช้ 5 กลุ่มจาก `users/{uid}.roles`

---

## 5. ลำดับงาน

| # | งาน | ต้องมีอะไรก่อน |
|---|---|---|
| 1 | `src/shell.css` — design tokens + component จาก design handoff | — |
| 2 | `build.py` + `.nojekyll` + `HANDOFF.md` | 1 |
| 3 | `/` ประตูเข้า | 2 |
| 4 | `/staff/` แบบอ่านอย่างเดียว (ทะเบียน + คลังฟอร์ม + ระบบเชื่อมโยง) | 2 · Firebase config |
| 5 | `git init` + commit แรก + push | 3, 4 |
| 6 | `/student/` แบบอ่านอย่างเดียว (ยังไม่มีการส่งฟอร์ม) | 4 |
| 7 | synonym index ไทย/อังกฤษ → intent finder ใช้งานได้จริง | 6 |
| 8 | `users/{uid}` + `publicDirectory/instructors` + Rules | ต้องเข้า Firebase Console |
| 9 | Anonymous Auth + App Check + Trigger Email extension | 8 |
| 10 | โฟลว์ “นักเรียนส่ง → task ของครู” ใบแรก (FRAE) | 9 |
| 11 | คิวงานรวม `tasks/` + deep-link ไป CAR ฝั่ง audit | 8 |

ข้อ 1–7 ทำได้เลยโดยไม่ต้องแตะ Firebase Console
ข้อ 8 เป็นคอขวด — ต้องคนที่เข้า Console ได้

---

## 6. Synonym index — หัวใจของ intent finder

ฟอร์ม 52 ใบชื่อเป็นรหัสอย่าง `IM-DRM-304-A` ไม่มีทางที่นักเรียนจะหาเจอ
ต้องเพิ่มฟิลด์ `kw` (คำค้น ไทย+อังกฤษ) ต่อฟอร์มใน register แล้วให้ intent finder จับคู่แบบหลวม ไม่ใช่ตรงตัว

ตัวอย่าง
```json
"kw": ["จะบิน","ก่อนบิน","ประเมินความเสี่ยง","เสี่ยง","fit to fly",
       "risk","frae","preflight","พรุ่งนี้บิน","พานักเรียนบิน"]
```

ผลลัพธ์ต้องบอกด้วยว่าฟอร์มอยู่ระบบไหน — “ฟอร์มในระบบนี้” / “เปิดในระบบ Dispatch” / “เปิดใน AeroFBO”

---

## 7. งานที่ต้องให้คนอื่นยืนยัน — ทำก่อนลงรายละเอียดฟอร์ม

### 7.1 🔴 ยืนยันว่าฟอร์ม 6 ใบนี้อยู่ระบบไหนจริง

ทะเบียนบอกว่าชี้ไป Jotform แต่จากที่แจ้งมา ใช้งานจริงอยู่ในระบบอื่น — ในทะเบียนติดธง `sysConfirm: true` ไว้แล้ว

| Doc | Control code | ทะเบียนเดิมบอก | น่าจะอยู่จริงที่ |
|---|---|---|---|
| D-0507-FPL-001 | OP-FPL-301-3 | Jotform 93194090184459 | ระบบ Dispatch |
| D-0507-EFM-001 | QA-EFM-301-B | Jotform 200178588209461 | ระบบบันทึกการฝึก |
| D-0507-GSP-001 | IM-GSP-301-B | Jotform 212454638036455 | ระบบบันทึกการฝึก (Gradeslip) |
| D-0507-AFM-001 | OP-AFM-301-B | Jotform 221334919954059 | AeroFBO |
| D-0507-MTC-001 | ME-MTC-306-A | Jotform 230023273391042 | AeroFBO |
| D-0507-APP-001 | AD-APP-302-B | Jotform 221220820577045 | AeroFBO |

**ถ้ายืนยันแล้วว่าอยู่ระบบอื่นจริง = LEF ในคู่มือชี้ผิดที่** เป็นข้อบกพร่องคนละเรื่องกับลิงก์เลื่อน 21 จุด
และถ้าใช้ทั้งสองที่พร้อมกัน = ฟอร์มควบคุมใบเดียวมีสองฉบับ ซึ่งหนักกว่า → ต้องเลือกให้เหลือฉบับเดียว

### 7.2 ต้องเข้า Firebase Console
- สร้าง `users/{uid}` ให้บุคลากรแต่ละคน พร้อม `roles[]`
- สร้าง `publicDirectory/instructors` (ชื่อ + ตำแหน่ง ไม่มีอีเมล)
- วาง Security Rules ชุดใหม่ (ร่างอยู่ใน `D-0507_Forms_Portal_PLAN.md` §2.6) — **ต้องทดสอบด้วย emulator ก่อน**
- เปิด Anonymous Auth · เปิด App Check (reCAPTCHA v3) · ติดตั้ง Trigger Email extension
- เพิ่ม `tistou35.github.io` ใน Authorized domains — **มีอยู่แล้ว** ไม่ต้องทำ

### 7.3 คำถามค้าง
- สามระบบภายนอกมี login ของตัวเองหรือไม่ · ถ้ามี ต้องบอกผู้ใช้ที่ปุ่มว่าจะต้อง login ซ้ำ
- ฟอนต์ไทยประจำแบรนด์ — Interstate และ Ocean Sans **ไม่มีอักษรไทยเลย** (252 glyphs, THAI = 0)
  ตอนนี้ fallback เป็น `Noto Sans Thai → IBM Plex Sans Thai → Sarabun → Leelawadee UI → Thonburi`
  ถ้าไม่เลือกและฝังฟอนต์ไทยจริง หน้าตาจะต่างกันระหว่าง Mac / Windows / iPad
- ชื่อโดเมน — ถ้าจะย้ายไป `d0507.361vision.org` ต้อง **ย้ายทั้ง d0507-forms และ d0507-audit พร้อมกัน**
  ไม่งั้นคนละ origin → single sign-on พัง

---

## 8. สถานะ d0507-audit ที่ทิ้งไว้ — ⚠️ ยังไม่ commit

มี session อื่นทำงานใน repo นั้นอยู่ (commit `81b1e71`, `095d6f8`, `68d0b76`) จึง**หยุดแตะแล้ว**
working tree ตอนนี้ยังมีการแก้ของผมค้างอยู่ ยังไม่ได้ commit และ **ไม่ควร `git checkout` ทับ**
เพราะอาจมีงานที่ยังไม่ commit ของ session นั้นอยู่ด้วย

| ไฟล์ | ผมทำอะไร |
|---|---|
| `index.html` | build ใหม่ = Audit Portal · **byte-identical กับ HEAD** |
| `template.html` | คืนลิงก์กลับ portal เป็น `href="../"` (HEAD เป็น `../audit/`) |
| `iac/ vendor/ safety/ surveillance/ aerodrome/ index.html` | build ใหม่ · ต่างจาก HEAD แค่บรรทัดลิงก์กลับนั้นบรรทัดเดียว |
| `audit/` `forms/` | ลบ (โฟลเดอร์ที่ผมสร้างเมื่อวาน) |
| `door.html` `portal_forms.html` `forms_register.json` `build.py.bak` | ลบ — **ย้ายมาอยู่ repo นี้แล้ว** |
| `portal_audit.html` | ลบ + `git rm --cached` (build.py เก็บ PORTAL ไว้ในตัวเองอยู่แล้ว จะเหลือสองสำเนาไม่ดี) |
| `build.py` | **ไม่แตะ** — เป็นเวอร์ชันที่ session อื่น restore ไว้ |

**ให้ session ที่ทำ d0507-audit ตัดสินใจ** ว่าจะ commit การลบนี้ (ตามที่ตกลงกันว่า audit เหลือแค่งานตรวจ)
หรือจะ `git restore` กลับ — ผมจะไม่แตะอีกจนกว่าจะบอก
