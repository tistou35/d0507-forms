# Firebase — สิ่งที่ต้องกดเองใน Console

โปรเจกต์ **`d0507-audit`** (ใช้ร่วมกับ repo `d0507-audit`)
ผมทำจากที่นี่ไม่ได้ เพราะ Firebase CLI ต้องยืนยันตัวตนผ่านเบราว์เซอร์

ทำตามลำดับ — ข้อ 1–3 จำเป็นก่อนหน้า `/staff/` จะจัดกลุ่มตามบทบาทได้จริง
ข้อ 4–6 จำเป็นก่อนเปิดโฟลว์ “นักเรียนเลือกครู”

---

## 1. วาง Security Rules

Console → **Firestore Database → Rules** → วางเนื้อไฟล์ `firestore.rules` ทับของเดิม → **Publish**

**ก่อน publish ให้แก้รายชื่อทีมในฟังก์ชัน `staffEmails()`** — ตอนนี้มีแค่ `tistou35@gmail.com`
รายชื่อนี้ต้องตรงกับที่ใช้ใน Storage rules ของ `d0507-audit` ด้วย

⚠️ Rules ชุดนี้ปิดท้ายด้วย `match /{document=**} { allow read, write: if false; }`
ถ้า `d0507-audit` ใช้ collection อื่นนอกจาก `audits` `plans` `library` **จะพังทันที**
ผมตรวจโค้ดแล้วพบแค่ 3 ตัวนี้ แต่ควรทดสอบก่อน:

```bash
npm i -g firebase-tools
firebase login
firebase emulators:start --only firestore
```

---

## 2. หา uid ของแต่ละคน

Console → **Authentication → Users** → คอลัมน์ User UID
คนที่ยังไม่เคย login จะยังไม่มี uid — ให้เขา login ที่ https://tistou35.github.io/d0507-forms/staff/ ก่อนหนึ่งครั้ง

## 3. รัน seed

```bash
npm i firebase-admin
# Console → Project settings → Service accounts → Generate new private key
export GOOGLE_APPLICATION_CREDENTIALS=./serviceAccountKey.json

# แก้รายชื่อในตัวแปร PEOPLE ที่หัวไฟล์ seed.mjs ก่อน
node firebase/seed.mjs --dry     # ดูก่อน
node firebase/seed.mjs           # เขียนจริง
```

สร้าง `users/{uid}` (บทบาท) และ `publicDirectory/instructors` (รายชื่อครูให้นักเรียนเลือก)

**`serviceAccountKey.json` ห้าม commit** — อยู่ใน `.gitignore` แล้ว
seed จะหยุดเองถ้าตรวจพบอีเมลหรือเบอร์โทรหลุดเข้า `publicDirectory`

---

## 4. เปิด Anonymous Auth

Console → **Authentication → Sign-in method → Anonymous → Enable**

ใช้ให้ฝั่งนักเรียนส่งฟอร์มได้โดยไม่ต้องสมัคร และได้ uid ชั่วคราวไว้ทำ rate limit
ไม่เปิดข้อนี้ ฝั่งนักเรียนจะส่งฟอร์มไม่ได้ (เปิดดูได้ตามปกติ)

## 5. เปิด App Check

Console → **App Check → Apps → เลือก web app → reCAPTCHA v3 → Register**
แล้ว **Firestore → Enforce**

กันบอทยิงฟอร์มสาธารณะ ควรเปิด **หลัง**ทดสอบข้อ 4 ผ่านแล้ว ไม่งั้นจะแยกไม่ออกว่าพังเพราะอะไร

## 6. ติดตั้ง Trigger Email extension

Console → **Extensions → Trigger Email from Firestore → Install**

| ตั้งค่า | ค่า |
|---|---|
| Email documents collection | `mail` |
| SMTP connection URI | ของผู้ให้บริการที่ใช้ (SendGrid / Gmail SMTP / อื่น ๆ) |
| Default FROM address | เช่น `no-reply@d0507.co.th` |

ใช้ส่งสำเนาแบบประเมินไปให้นักเรียนตามที่ตกลงกันไว้
ต้องมีบัญชี SMTP ก่อน — ถ้ายังไม่มี ให้ข้ามข้อนี้ไปก่อน ระบบจะยังบันทึกลง Firestore ได้ แต่ไม่ส่งอีเมล

---

## ตรวจว่าครบแล้ว

| ทดสอบ | ผลที่ควรได้ |
|---|---|
| เปิด `/staff/` ทั้งที่ login `d0507-audit` อยู่ | เข้าได้เลย ไม่ต้อง login ซ้ำ |
| ดูแถบผู้ใช้มุมขวาบนของ `/staff/` | ขึ้นบทบาทจริง ไม่ใช่ “ยังไม่ได้กำหนดบทบาท” |
| เปิด `d0507-audit` ทำงานตรวจตามปกติ | ต้องใช้ได้เหมือนเดิม (ยืนยันว่า rules ใหม่ไม่ทำพัง) |
| เปิด `/student/` | ตัวเลือกครูขึ้นรายชื่อจาก `publicDirectory/instructors` |
