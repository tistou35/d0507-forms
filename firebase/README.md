# Firebase — ตั้งค่าโปรเจกต์ใหม่สำหรับ d0507-forms

**d0507-forms ใช้ Firebase โปรเจกต์ของตัวเอง แยกขาดจาก `d0507-audit`** (ตัดสินใจ 01 AUG 2026)

ผมทำจากที่นี่ไม่ได้ เพราะ Firebase CLI ต้องยืนยันตัวตนผ่านเบราว์เซอร์
ทำตามลำดับ — ข้อ 1–4 ทำให้ระบบใช้งานได้ · ข้อ 5–7 เปิดโฟลว์ส่งฟอร์มของนักเรียน

---

## ผลของการแยกโปรเจกต์ — รู้ไว้ก่อน

| | ผล |
|---|---|
| **Login** | คนละระบบ — เข้า d0507-forms แล้วยังต้องเข้า d0507-audit อีกรอบ |
| **คิวงาน** | รวมงาน CAR จากระบบตรวจมาแสดงที่นี่ **ไม่ได้** คนละฐานข้อมูล |
| **ทะเบียนผู้ใช้** | ต้องทำ `users/{uid}` สองที่ (uid ก็คนละตัวด้วย) |
| **ข้อดี** | rules ที่นี่แก้ยังไงก็ **ไม่กระทบระบบตรวจ** เลย · เผลอพังก็พังแค่ระบบเดียว |

---

## 1. สร้างโปรเจกต์

Firebase Console → **Add project** → ตั้งชื่อเช่น `d0507-forms`

- **Firestore Database** → Create → **Production mode** → location **`asia-southeast1`**
  (ที่เดียวกับ d0507-audit — ย้ายทีหลังไม่ได้)
- **Blaze plan** — จำเป็นถ้าจะใช้ Trigger Email extension (ข้อ 7)
  ถ้ายังไม่ใช้อีเมล อยู่ Spark ก่อนได้

## 2. เพิ่ม Web App แล้วคัดลอก config

Project settings → **Your apps → Web (`</>`)** → ตั้งชื่อ `d0507-forms-web` → Register

คัดลอกค่าจาก `firebaseConfig` มาวางทับใน **`firebase/config.json`** ของ repo นี้ แล้ว

```bash
python3 build.py
git add -A && git commit -m "ใส่ Firebase config ของโปรเจกต์ d0507-forms" && git push
```

ถ้ายังไม่ใส่ `build.py` จะเตือนและเว็บจะทำงานเฉพาะส่วนสาธารณะ (เปิดฟอร์มได้ แต่ login ไม่ได้)

## 3. เปิดวิธีเข้าสู่ระบบ + Authorized domain

Authentication → **Get started** → Sign-in method:

- **Google** → Enable
- **Email/Password** → Enable
- **Anonymous** → Enable *(จำเป็นสำหรับให้นักเรียนส่งฟอร์มโดยไม่ต้องสมัคร)*

Authentication → Settings → **Authorized domains** → Add domain → **`tistou35.github.io`**
*(ข้อนี้ลืมไม่ได้ ไม่งั้น login จากเว็บจริงจะไม่ผ่าน)*

## 4. วาง Security Rules

Firestore → **Rules** → วางเนื้อ `firestore.rules` ทับ → **Publish**

**แก้ `staffEmails()` ให้ครบทุกคนก่อน** — ตอนนี้มีแค่ `tistou35@gmail.com`

โปรเจกต์นี้แยกจากระบบตรวจแล้ว **เผลอ publish ผิดก็ไม่กระทบงานตรวจ** แต่ถ้าจะให้ชัวร์:

```bash
npm i -g firebase-tools && firebase login
firebase emulators:start --only firestore
```

---

## 5. หา uid ของแต่ละคน

ให้ทุกคน login ที่ https://tistou35.github.io/d0507-forms/staff-login/ หนึ่งครั้งก่อน
แล้วดู uid ที่ Authentication → Users

*(uid ที่นี่เป็นคนละตัวกับใน d0507-audit — คนละโปรเจกต์)*

## 6. รัน seed

```bash
npm i firebase-admin
# Project settings → Service accounts → Generate new private key
export GOOGLE_APPLICATION_CREDENTIALS=./serviceAccountKey.json

# แก้รายชื่อในตัวแปร PEOPLE ที่หัวไฟล์ seed.mjs ก่อน
node firebase/seed.mjs --dry     # ดูก่อนว่าจะเขียนอะไร
node firebase/seed.mjs           # เขียนจริง
```

เขียนสามอย่าง:
- `users/{uid}` — บทบาทของแต่ละคน
- `publicDirectory/instructors` — รายชื่อผู้รับฟอร์ม (ชื่อ + ตำแหน่ง + recv เท่านั้น ไม่มีอีเมล)
- `registry/current` — ทะเบียนฟอร์มฉบับเต็ม (control code · สถานะ LEF · หมายเหตุ)

**`serviceAccountKey.json` ห้าม commit** — อยู่ใน `.gitignore` แล้ว
seed จะหยุดเองถ้าตรวจพบอีเมลหรือเบอร์โทรหลุดเข้า `publicDirectory`

## 7. เปิด App Check และอีเมล (ทำทีหลังได้)

- **App Check** → Apps → เลือก web app → reCAPTCHA v3 → Register → Firestore → **Enforce**
  ควรเปิด **หลัง**ทดสอบข้อ 3–6 ผ่านแล้ว ไม่งั้นแยกไม่ออกว่าพังเพราะอะไร
- **Extensions → Trigger Email from Firestore** — collection `mail` · ต้องมีบัญชี SMTP
  ไม่ติดตั้งก็ได้ ระบบจะบันทึกลง Firestore ตามปกติแต่ไม่ส่งอีเมล

---

## ตรวจว่าครบแล้ว

| ทดสอบ | ผลที่ควรได้ |
|---|---|
| เปิด `/` โดยไม่ login | เห็นฟอร์มนักเรียน 9 ใบ · ค้นหาได้ |
| เข้าสู่ระบบที่ `/staff-login/` | เข้าได้ · แถบบนขึ้นชื่อและบทบาท |
| เปิด `/admin/register/` | เห็นทะเบียนครบ 52 ใบพร้อมสถานะควบคุม |
| เปิด `/f/MTC/` หลัง login | เห็น control code และหมายเหตุ (ก่อน login ต้องไม่เห็น) |
| เปิด `/submit/?f=FRAE` | มีรายชื่อผู้รับให้เลือก · กดส่งได้ |
