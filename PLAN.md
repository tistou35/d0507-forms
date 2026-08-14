# d0507-forms — แผนงาน

**Repo:** `tistou35/d0507-forms` → https://tistou35.github.io/d0507-forms/
**Firebase:** โปรเจกต์ของตัวเอง **แยกจาก `d0507-audit`** (ตัดสินใจ 01 AUG 2026)
**อัปเดต:** 01 AUG 2026

---

## 1. สถานะ

### เสร็จแล้ว — ขึ้นเว็บจริงและใช้งานได้

| | |
|---|---|
| โครง 8 เส้นทาง | `/` `/all/` `/f/<ABBR>/` ×52 `/fill/` `/submit/` `/queue/` `/admin/register/` `/staff-login/` |
| ทะเบียนกลาง | `forms_register.json` 52 ฟอร์ม จาก match 3 ช่องทาง |
| ค้นหาข้ามระบบ | รองรับภาษาไทยที่ไม่มีช่องว่างระหว่างคำ · `kw` 33/52 ฟอร์ม |
| แบบมาตรฐานฟอร์ม | `formdefs/_SCHEMA.md` + `assets/formkit.js` — 16 ชนิดฟิลด์ |
| ความปลอดภัยข้อมูล | ไฟล์ที่ host มีแค่ชุดสาธารณะ · ทะเบียนเต็มอยู่ Firestore |
| Responsive | bottom nav บนจอ < 1000px |

### รอทำ

- **Firebase Console** — ยังไม่ได้สร้างโปรเจกต์ (ดู `firebase/README.md`)
- **นิยามฟอร์ม** — `formdefs/` ยังมีแต่ `_SCHEMA.md` และ `_TEMPLATE.json`
- **โฟลว์ส่งฟอร์ม** — โค้ดพร้อม แต่ต้องเปิด Anonymous Auth ก่อน
- **DOCX export** — ยังไม่ทำ (ใช้ `.docx` ในโฟลเดอร์ Manual revision เป็นแม่แบบ)

---

## 2. ผลของการแยก Firebase project

| | |
|---|---|
| **Login** | คนละระบบ — เข้าที่นี่แล้วยังต้องเข้า `d0507-audit` อีกรอบ |
| **คิวงาน** | รวมงาน CAR จากระบบตรวจมาแสดง**ไม่ได้** · เมนู "งานตรวจสอบ" เป็นลิงก์ออกเฉย ๆ |
| **ทะเบียนผู้ใช้** | ต้องทำ `users/{uid}` สองที่ · uid คนละตัว |
| **ข้อดี** | rules ที่นี่แก้ยังไงก็ไม่กระทบระบบตรวจ · พังก็พังแค่ระบบเดียว |

ถ้าอยากได้คิวงานรวมกลับมาในอนาคต ต้องทำ Cloud Function sync ข้ามโปรเจกต์ — ซับซ้อนกว่ามาก

---

## 3. ลำดับงานถัดไป

| # | งาน | ต้องมีอะไรก่อน |
|---|---|---|
| 1 | สร้าง Firebase project + ใส่ `firebase/config.json` | เข้า Console ได้ |
| 2 | เปิด Google / Email / Anonymous auth + Authorized domain | 1 |
| 3 | วาง `firestore.rules` (แก้ `staffEmails()` ก่อน) | 1 |
| 4 | รัน `seed.mjs` — `users` + `publicDirectory` + `registry/current` | 2, 3 |
| 5 | **นิยามฟอร์มใบแรก: FRAE** ตาม `_SCHEMA.md` | 4 |
| 6 | ทดสอบโฟลว์นักเรียนส่ง → task ของครู ครบวงจร | 5 |
| 7 | นิยามฟอร์มที่เหลือทีละใบ | 6 |
| 8 | DOCX export ด้วย docxtemplater | 7 |
| 9 | App Check + Trigger Email extension | 6 |

**ข้อ 1–4 เป็นคอขวด** — ต้องคนที่เข้า Firebase Console ได้

---

## 4. ลำดับที่แนะนำสำหรับการใส่ฟอร์ม

เริ่มจากใบที่ใช้แบบมาตรฐานครบทุกส่วน แล้วใบที่เหลือจะลอกแบบได้

| ลำดับ | ฟอร์ม | ใช้ความสามารถอะไร |
|---|---|---|
| 1 | **FRAE** | กรอกสองฝ่ายแบบ `blind` · `compute` คะแนน · `gates` เหลือง/แดง · `route` 3 ขั้น |
| 2 | **PCR-FI** | `grade` 1–5 + ดาว safety-critical · `anyStarBelow(3)` · คำนวณ % |
| 3 | **ASF** | `route` 3 ขั้น + `assignedBy: submitter` |
| 4 | **BCK** | `checklist` + ลงนาม 2 ฝ่าย |
| 5 | **VSR / HIF** | ฟอร์มสั้น ไม่ระบุชื่อได้ |
| 6 | **SAC / SSC / VAC** | `checklist` S/U/NA + `onU: openCAR` |
| 7 | **ALR / MRF** | `table` แถวซ้ำ (ยังไม่ได้ทำใน formkit) |

**`table` ยังเป็นช่องว่างใน formkit** — ตอนนี้แสดงข้อความบอกไว้ ต้องเขียนเพิ่มก่อนถึงลำดับ 7

---

## 5. งานเอกสารที่ค้างอยู่ (คนละเรื่องกับเว็บ)

จากการ match 3 ช่องทาง — ฟอร์มที่ไม่มีปัญหาเลยมีแค่ **11 จาก 52 ใบ**

| จำนวน | ปัญหา |
|---|---|
| 7 | ลิงก์ใน LEF ชี้ฟอร์มผิดใบ (จากลิงก์เลื่อนหนึ่งแถว รวม 21 จุดในสามคู่มือ) |
| 6 | **มีสองฉบับ** — ระบบภายนอกและ Jotform · LEF ชี้ไปฉบับ Jotform |
| 14 | ใช้บน Jotform แต่ไม่มีในคู่มือเลย (training record ทั้งชุด) |
| 8 | มีเอกสารแต่ยังไม่อยู่ใน LEF |
| 6 | LEF กับฟอร์มยังไม่ตรงกัน (ระบุ Online แต่ไม่มีฟอร์ม / ไม่ใส่ลิงก์ / เป็น PDF) |

ต้องทำเป็น `SKILL: editor-note` + revision log ผ่าน @reviewer / @legal / @docsupport
กระทบทั้ง OMA · OMM · TM

---

## 6. คำถามค้าง

- **ฟอนต์ไทยประจำแบรนด์** — Interstate และ Ocean Sans ไม่มีอักษรไทยเลย (252 glyphs, THAI = 0)
  ตอนนี้ fallback `Noto Sans Thai → IBM Plex Sans Thai → Sarabun → Leelawadee UI → Thonburi`
  ถ้าไม่เลือกและฝังฟอนต์ไทยจริง หน้าตาจะต่างกันระหว่าง Mac / Windows / iPad
- **สามระบบภายนอกมี login ของตัวเองไหม** — ถ้ามี ควรบอกผู้ใช้ที่ปุ่มว่าจะต้อง login ซ้ำ
- **`forms_register.json` อยู่ใน repo สาธารณะ** — มี control code และสถานะ LEF ครบ
  ถ้าจะปิดจริงต้องเอาออกจาก repo หรือเปลี่ยนเป็น private (Pages จะใช้ไม่ได้ถ้าบัญชีฟรี)
- **6 ฟอร์มที่มีสองฉบับ** — ต้องเลือกว่าฉบับไหนคือฉบับควบคุม แล้วปิดอีกฉบับ
