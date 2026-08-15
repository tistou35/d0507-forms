# แผนระบบอนุมัติ + แจ้งเตือน LINE

---

## สิ่งที่ระบบเดิมทำไว้แล้ว — เอามาใช้ให้ตรงกัน

อ่านจาก Flight Plan web app (`d0507-app/next`) ปุ่ม **NOTIFICATIONS**
คำอธิบายของปุ่มเขียนไว้ตรงมาก: *"LINE notifications — who gets them and what they say"*

โครงข้อมูลที่เขาใช้

```jsonc
{
  "enabled": true,
  "recipients": [ { "id": "…", "name": "…", "lineUserId": "U…", "role": "…", "active": true } ],
  "events":    { "submitted": true, "confirmed": true, "cancel": true, "retime": true },
  "templates": {
    "confirmed": "Flight Plan [No.] [Reg.] depart time [dep. time] is confirmed",
    "cancel":    "Flight Plan [No.] [Reg.] depart time [dep. time] is CANCELLED [note]",
    "retime":    "Flight Plan [No.] [Reg.] has been revised — new departure time [dep. time]"
  }
}
```

**สามอย่างที่ยึดตามของเดิม**

| เรื่อง | ของเดิม | เหตุผลที่ตาม |
|---|---|---|
| ตัวแทนในข้อความ | `[No.]` `[Reg.]` `[PIC]` — วงเล็บเหลี่ยม | คนเดิมแก้ข้อความเป็นอยู่แล้ว ไม่ต้องเรียนสองแบบ |
| ข้อมูลผู้รับ | `{ id, name, lineUserId, role, active }` | ปิด–เปิดคนได้โดยไม่ต้องลบทิ้ง |
| เปิด–ปิดรายเหตุการณ์ | `events` แยกแต่ละอย่าง | ไม่ใช่เปิดหมดหรือปิดหมด |

เขาเก็บใน `localStorage` เพราะเป็นแอปเครื่องเดียว — **ของเราต้องเก็บใน Firestore**
เพราะผู้อนุมัติเปิดจากคนละเครื่องคนละคน

---

## ส่วนที่ 1 · ตำแหน่งในองค์กร

ตอนนี้ใช้ `recv: ['FI','HT','CMM','ACM']` ปนกันระหว่าง "ตำแหน่ง" กับ "รับฟอร์มประเภทไหน"
แยกให้ชัด — **ตำแหน่งคือความจริงขององค์กร ส่วนใครอนุมัติฟอร์มไหนคือกติกาที่ตั้งได้**

ตำแหน่งตาม OMA

| รหัส | ตำแหน่ง |
|---|---|
| `ACM` | Accountable Manager |
| `HT` | Head of Training |
| `CMM` | Compliance Monitoring Manager |
| `SM` | Safety Manager |
| `CFI` | Chief Flight Instructor |
| `FI` | Flight Instructor |
| `TKI` | Theoretical Knowledge Instructor |
| `ME` | Maintenance Engineer |
| `OPS` | Operations / Dispatch |
| `AD` | Administration |

คนหนึ่งมีได้หลายตำแหน่ง — HT ที่เป็น FI ด้วยเป็นเรื่องปกติ

**เก็บที่** `staffDirectory/current`

```jsonc
{ "list": [ {
    "id": "<uid>",
    "name": "ธนวัฒน์ ว.",
    "positions": ["HT", "FI"],
    "lineUserId": "U1234…",        // ว่างได้ = ไม่ได้รับแจ้งเตือน LINE
    "email": "…",                  // สำหรับแจ้งเตือนสำรอง
    "active": true
} ] }
```

> ⚠️ **`lineUserId` เป็นข้อมูลส่วนบุคคล** — คอลเลกชันนี้ต้องอ่านได้เฉพาะเจ้าหน้าที่
> ต่างจาก `publicDirectory` ที่โลกอ่านได้ (มีแค่ชื่อกับตำแหน่ง ไม่มีอีเมล ไม่มี LINE ID)
> ฝั่งนักเรียนยังใช้ `publicDirectory` ต่อไป ระบบสร้างให้อัตโนมัติจาก `staffDirectory`

---

## ส่วนที่ 2 · ใครอนุมัติฟอร์มไหน

Admin ตั้งที่หน้าตั้งค่าระบบ — **ผูกกับตำแหน่ง ไม่ใช่ผูกกับคน**
คนลาออกหรือย้ายตำแหน่ง ไม่ต้องไล่แก้ทุกฟอร์ม

**เก็บที่** `config/approvals`

```jsonc
{ "byForm": {
    "SDF":  { "position": "HT",  "mode": "pool" },
    "ASF":  { "position": "FI",  "mode": "pool" },
    "FRAE": { "position": "FI",  "mode": "pick" },
    "SEF":  { "position": "CMM", "mode": "pool" },
    "APF":  { "position": "ACM", "mode": "pool" }
} }
```

| `mode` | ความหมาย |
|---|---|
| `pick` | ผู้ส่งเลือกคนเองตอนส่ง (FRAE — นักเรียนเลือกครู) |
| `pool` | ส่งไปก่อน เข้ากองรอ ใครที่มีตำแหน่งนั้นกดรับได้ (SDF) |
| `none` | ไม่ต้องอนุมัติ จบที่ส่ง |

ค่านี้**แทนที่** `assignTo` ในทะเบียนและ `route[].pool` ในนิยามฟอร์ม
นิยามฟอร์มยังกำหนด *ว่ามีขั้นอนุมัติไหม* ส่วน *ใครอนุมัติ* มาจากที่นี่ — แก้ได้โดยไม่ต้อง build ใหม่

---

## ส่วนที่ 3 · ข้อความแจ้งเตือน

**เก็บที่** `config/notify`

```jsonc
{
  "enabled": true,
  "events": { "assigned": true, "claimed": false, "approved": true,
              "rejected": true, "delegated": true, "overdue": true },
  "templates": {
    "assigned":  "📋 [Form] [No.]\nจาก [From]\nรอ [Position] อนุมัติ\n[Link]",
    "delegated": "🔁 [Form] [No.]\n[By] มอบหมายต่อให้ [To]\n[Note]\n[Link]",
    "approved":  "✅ [Form] [No.] อนุมัติแล้วโดย [By]\n[Link]",
    "rejected":  "↩️ [Form] [No.] ถูกตีกลับโดย [By]\nเหตุผล: [Note]\n[Link]",
    "overdue":   "⏰ [Form] [No.] ค้างเกิน [Days] วัน\nรอ [Position]\n[Link]"
  }
}
```

**ตัวแทนที่ใช้ได้** — วงเล็บเหลี่ยมเหมือนระบบเดิม

| ตัวแทน | ความหมาย | ตัวอย่าง |
|---|---|---|
| `[Form]` | ชื่อฟอร์ม | แบบแจ้งข้อมูลด้วยตนเอง |
| `[Code]` | รหัสเอกสาร | D-0507-SDF-001 |
| `[No.]` | เลขที่ใบ | SDF-20260815-9ZBV |
| `[From]` | ผู้ส่ง | ธนวัฒน์ ว. |
| `[By]` | ผู้ทำรายการ | ครูสมชาย |
| `[To]` | ผู้รับมอบหมายต่อ | ครูสมหญิง |
| `[Position]` | ตำแหน่งที่ต้องอนุมัติ | HT |
| `[Note]` | เหตุผล / ความเห็น | ชั่วโมงไม่ตรงกับ LOG ME |
| `[Days]` | จำนวนวันที่ค้าง | 2 |
| `[Link]` | ลิงก์เปิดงาน | https://…/approve/?t=… |
| `[Date]` | วันที่ | 15 AUG 2026 |

---

## ส่วนที่ 4 · เส้นทางการส่ง

```
เว็บ  →  Firestore (notifyQueue)  →  Apps Script  →  LINE Messaging API
```

**ทำไมไม่ยิงจากเว็บตรง ๆ** — channel access token ห้ามอยู่ในหน้าเว็บ
ใครเปิด DevTools ก็เอาไปส่งข้อความในนามบริษัทได้

Apps Script มี token อยู่ใน Script Property อยู่แล้ว และมี trigger รายนาทีได้
เว็บแค่เขียนคิว → Apps Script อ่านคิวแล้วยิง → บันทึกผลกลับ

```jsonc
// notifyQueue/{id}
{ "event": "assigned", "toUid": "…", "lineUserId": "U…",
  "vars": { "Form": "…", "No.": "…", "Link": "…" },
  "state": "pending",          // pending → sent | failed | skipped
  "createdAt": …, "sentAt": …, "error": "" }
```

เก็บไว้เป็น log ในตัว — ตอบได้ว่าใครได้รับอะไรเมื่อไร ซึ่งเอกสารควบคุมต้องการ

---

## ส่วนที่ 5 · สิ่งที่คุณต้องทำก่อน (ผมทำแทนไม่ได้)

**LINE Notify ปิดบริการไปแล้ว 31 มี.ค. 2568** ต้องใช้ Messaging API

1. [LINE Developers Console](https://developers.line.biz) → สร้าง **Provider** และ **Messaging API channel**
   ต้องใช้ LINE Business ID และยืนยันเบอร์โทรของคุณ
2. คัดลอก **Channel access token (long-lived)** → ใส่เป็น Script Property `LINE_TOKEN`
3. เปิด Channel → ปิด *Auto-reply* และ *Greeting* (ไม่งั้นบอทตอบอัตโนมัติกวน)
4. ให้ผู้อนุมัติทุกคน **เพิ่มบอทเป็นเพื่อน** ผ่าน QR code ในหน้า Console

**การเก็บ LINE user ID** — สองทาง

| วิธี | ข้อดี | ข้อเสีย |
|---|---|---|
| **Webhook อ่านอัตโนมัติ** — ผู้อนุมัติทักบอทหนึ่งครั้ง ระบบจดให้ | ไม่มีใครต้องคัดลอกอะไร | ต้องตั้ง webhook URL เพิ่ม |
| **กรอกมือ** ในหน้าตั้งค่าระบบ | ทำได้เลย ไม่ต้องตั้งอะไรเพิ่ม | ต้องหา userId ของตัวเองมาก่อน |

แนะนำ **กรอกมือก่อน** เพราะมีคนไม่กี่คน แล้วค่อยเพิ่ม webhook ทีหลังถ้าคนเยอะขึ้น
ช่อง `lineUserId` จึงอยู่ในหน้าตั้งค่าระบบตั้งแต่แรก

---

## ลำดับการทำ

| ขั้น | งาน | ต้องรออะไร |
|---|---|---|
| 1 | ตำแหน่ง + LINE user ID ในหน้าตั้งค่าระบบ | — |
| 2 | ผังผู้อนุมัติรายฟอร์ม (`config/approvals`) | — |
| 3 | ตัวแก้ข้อความแจ้งเตือน + ปุ่มดูตัวอย่าง | — |
| 4 | ให้ระบบส่ง/อนุมัติอ่านผังแทน `assignTo` ที่ฝังใน build | ขั้น 2 |
| 5 | คิวแจ้งเตือน + Apps Script ยิง LINE | คุณให้ token |
| 6 | เตือนงานค้างเกินกำหนด (trigger รายวัน) | ขั้น 5 |

ขั้น 1–4 ทำได้เลยโดยไม่ต้องรอ LINE — และมีประโยชน์ในตัวมันเองแม้ยังไม่มีแจ้งเตือน

---

## เรื่องที่ต้องตัดสินใจ

1. **ตำแหน่งข้างต้นครบไหม** — ผมประมาณจาก OMA ถ้าองค์กรใช้ชื่ออื่นบอกได้
2. **ASF ให้ FI อนุมัติ** — ปกติรายงานนิรภัยส่ง Safety Manager ยืนยันว่าตั้งใจให้ FI จริง
3. **ตีกลับแล้วไปไหนต่อ** — กลับหาผู้ส่งให้แก้ใบเดิม หรือปิดใบแล้วให้ส่งใหม่
4. **ค้างนานแค่ไหนถึงเตือน** — `slaDays` ตอนนี้ตั้งไว้ 1 วันทุกฟอร์ม
