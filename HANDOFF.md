# HANDOFF — d0507-forms

ระบบฟอร์มออนไลน์ของ D-0507 Flight Training Co., Ltd.
คู่กับ `d0507-audit` (งานตรวจสอบภายใน) — คนละ repo แต่ใช้ Firebase โปรเจกต์เดียวกัน

---

## กติกาของ repo นี้

1. **แก้หน้าเว็บที่ `src/` เท่านั้น** — `index.html`, `student/`, `staff/` เป็นไฟล์ที่ build แล้ว ห้ามแก้มือ
2. **`build.py` เป็นตัวประกอบอย่างเดียว ไม่เก็บ HTML ไว้ข้างใน**
   *(บทเรียนจาก d0507-audit: เคยเก็บ HTML ไว้ใน build.py แล้ว session อื่นเข้าใจผิดว่าไฟล์โดนย่อ จึง restore ทับ)*
3. **ตรวจหลัง build ให้ดูขนาดไฟล์ผลลัพธ์ ไม่ใช่ขนาด `build.py`**
   ค่าอ้างอิงปัจจุบัน — `index.html` ~29 KB · `student/index.html` ~43 KB · `staff/index.html` ~88 KB
   ถ้าเล็กกว่านี้มากแปลว่า `src/` หรือ `forms_register.json` ผิดปกติ
4. **แก้ข้อมูลฟอร์มที่ `forms_register.json` แล้ว build** ไม่ต้องแตะโค้ดหน้าเว็บ

```bash
python3 build.py
```

---

## โครงไฟล์

```
index.html              build ← src/door.html        ประตูเข้า      ไม่ต้อง login
student/index.html      build ← src/student.html     ฝั่งนักเรียน    ไม่ต้อง login
staff/index.html        build ← src/staff.html       ฝั่งเจ้าหน้าที่  ต้อง login
src/shell.css           design tokens + component ทั้งหมด (inline เข้าไปตอน build)
assets/fonts/           Interstate-Bold.otf · Ocean_Sans_Std_Book.ttf
assets/logo.svg
forms_register.json     ทะเบียน 52 ฟอร์ม — แหล่งข้อมูลกลาง
build.py
```

### placeholder ที่ build.py แทนค่า

| | ใช้ที่ | ค่า |
|---|---|---|
| `@@CSS@@` | ทุกหน้า | เนื้อ `src/shell.css` |
| `@@BASE@@` | ทุกหน้า | `''` ที่ราก · `'../'` ในโฟลเดอร์ย่อย |
| `@@STATS@@` | ทุกหน้า | ตัวเลขสรุปจากทะเบียน |
| `@@REG@@` | staff | ทะเบียนเต็ม 52 ฟอร์ม |
| `@@REGPUB@@` | student | **เฉพาะฟอร์ม `public:true` และเฉพาะฟิลด์ที่ปลอดภัย** |
| `@@FBCFG@@` | staff | `FIREBASE_CONFIG` |

build จะ **หยุดทันที** ถ้ามี placeholder เหลือ หรือมีฟิลด์ต้องห้ามหลุดไปหน้าสาธารณะ

### ด่านตรวจอัตโนมัติหลัง build

- `index.html` ต้อง **ไม่มี** Firebase
- `student/index.html` ต้องไม่มี control code ภายใน และไม่มีสถานะ LEF
- `staff/index.html` ต้องมี auth

---

## Authentication

ใช้ Firebase โปรเจกต์ **`d0507-audit`** ตัวเดิม (config ฝังใน `build.py`)

ทั้งสอง repo อยู่บนโดเมน `tistou35.github.io` เหมือนกัน → **origin เดียวกัน** →
Firebase Auth เก็บ session ต่อ origin → **login ครั้งเดียวใช้ได้ทั้งสอง repo**

⚠️ ถ้าย้ายไปโดเมนของตัวเอง (เช่น `d0507.361vision.org`) **ต้องย้ายทั้งสอง repo พร้อมกัน**
ไม่งั้นคนละ origin → single sign-on พัง ต้อง login สองรอบ

---

## สถานะปัจจุบัน (31 JUL 2026)

### ทำได้แล้ว
- ประตูเข้า จำทางเลือกใน `localStorage` · เลือกใหม่ที่ `/?pick=1`
- ฝั่งนักเรียน: ฟอร์ม 9 ใบ · ค้นหาภาษาพูด · ขั้นตอนก่อนออกบิน · ระบบเชื่อมโยง
- ฝั่งเจ้าหน้าที่: login · ทะเบียน 52 ฟอร์ม + filter · คลังฟอร์มตามกลุ่มผู้ใช้ 5 กลุ่ม ·
  สถานะทะเบียน · ระบบเชื่อมโยง · ลิงก์ไป Audit Portal
- ค้นหาข้ามระบบ — ผลลัพธ์บอกด้วยว่าฟอร์มอยู่ระบบไหน

**ค้นหาภาษาไทย** — ภาษาไทยไม่มีช่องว่างระหว่างคำ ตัดคำด้วย whitespace จึงใช้ไม่ได้
`scoreOf()` จึงเช็คสองทาง: คำสำคัญของฟอร์มอยู่ในประโยคที่พิมพ์ไหม + คำที่พิมพ์อยู่ในข้อมูลฟอร์มไหม
คำสำคัญอยู่ที่ฟิลด์ `kw` ในทะเบียน (ใส่แล้ว 33/52 ฟอร์ม · สาธารณะครบ 9/9)
**เพิ่มฟอร์มใหม่ต้องใส่ `kw` ด้วย ไม่งั้นค้นด้วยภาษาพูดไม่เจอ**

### ยังไม่ทำ
- คิวงาน / การอนุมัติ / ลายเซ็น — ปุ่ม “เปิดฟอร์ม” ยังพาไป Jotform หรือระบบภายนอกเดิม
- โฟลว์ “นักเรียนเลือกครู → ระบบจับคู่เป็น task ของครู” + ส่งสำเนาทางอีเมล
- ฝั่งนักเรียนยัง **ไม่มี Firebase** เลย เมื่อทำโฟลว์ส่งฟอร์มจะต้องเพิ่ม
  Anonymous Auth + App Check + rule แบบ create-only
- `users/{uid}.roles` — โค้ดอ่านแล้ว แต่ยังไม่มี document และยังไม่มี rule
  ถ้าอ่านไม่ได้จะ fallback แสดงทุกกลุ่มพร้อมข้อความบอก

---

## 🔴 ค้างไว้ ต้องยืนยันก่อนไปต่อ

ฟอร์ม 6 ใบติดธง `sysConfirm: true` — ทะเบียนบอกว่าชี้ไป Jotform
แต่น่าจะใช้งานจริงอยู่ในระบบภายนอก

| Doc | Control code | น่าจะอยู่จริงที่ |
|---|---|---|
| D-0507-FPL-001 | OP-FPL-301-3 | ระบบ Dispatch |
| D-0507-EFM-001 | QA-EFM-301-B | ระบบบันทึกการฝึก |
| D-0507-GSP-001 | IM-GSP-301-B | ระบบบันทึกการฝึก (Gradeslip) |
| D-0507-AFM-001 | OP-AFM-301-B | AeroFBO |
| D-0507-MTC-001 | ME-MTC-306-A | AeroFBO |
| D-0507-APP-001 | AD-APP-302-B | AeroFBO |

ถ้ายืนยันว่าอยู่ระบบอื่นจริง = **LEF ในคู่มือชี้ผิดที่** (คนละเรื่องกับลิงก์เลื่อน 21 จุด)
ถ้าใช้ทั้งสองที่พร้อมกัน = ฟอร์มควบคุมใบเดียวมีสองฉบับ ต้องเลือกให้เหลือฉบับเดียว

**ฟอนต์ไทย** — Interstate และ Ocean Sans **ไม่มีอักษรไทยเลย** (252 glyphs, THAI = 0)
ตอนนี้ fallback เป็น `Noto Sans Thai → IBM Plex Sans Thai → Sarabun → Leelawadee UI → Thonburi`
ถ้าไม่เลือกและฝังฟอนต์ไทยจริง หน้าตาจะต่างกันระหว่าง Mac / Windows / iPad

---

## เอกสารที่เกี่ยวข้อง

- `PLAN.md` — แผนงาน repo นี้ ลำดับ 11 ขั้น
- `../D-0507_Forms_Portal_PLAN.md` — แผนใหญ่ · §2.6 มีร่าง Security Rules
