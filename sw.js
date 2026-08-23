/* สร้างโดย build.py — อย่าแก้ไฟล์นี้เอง แก้ที่ write_sw() ใน build.py

   ทำไมต้องมี: นักบินเปิดใบทดสอบการบินตอนอยู่บนเครื่อง ไม่มีเน็ต
   ถ้าไม่แคชหน้าไว้ เปิดไม่ขึ้นเลย ไม่ใช่แค่ส่งไม่ได้

   หน้า HTML ใช้เครือข่ายก่อนแล้วค่อยตกมาที่แคช — จะได้ไม่ค้างรุ่นเก่าเมื่อออนไลน์
   asset ใช้แคชก่อนเพราะติด ?v= อยู่แล้ว เปลี่ยนเนื้อไฟล์เมื่อไร URL เปลี่ยนตาม */
const CACHE = 'd0507-fd8dfc8bfa';
const FILES = [
  "fill/",
  "cl/",
  "pubs/",
  "all/",
  "",
  "assets/app.css?v=9dcf3fc0",
  "assets/app.js?v=dceb4ebf",
  "assets/formkit.js?v=777fa7e9"
];

self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES).catch(() => {})));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks =>
    Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))
  ).then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET') return;
  const url = new URL(r.url);
  if (url.origin !== location.origin) return;      // firebase/gstatic จัดการเอง

  const isDoc = r.mode === 'navigate' || (r.headers.get('accept') || '').includes('text/html');
  if (isDoc) {
    e.respondWith(
      fetch(r).then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(r, copy));
        return res;
      }).catch(() => caches.match(r).then(m => m
        // ไม่มีตัวตรงกับ query — /fill/?c=FTR ที่ยังไม่เคยเปิดต้องเปิดได้เหมือนกัน
        // ตัวหน้าเป็นไฟล์เดียวกันทุกใบ อ่าน ?c= จาก location เอง
        || caches.match(r, { ignoreSearch: true })))
    );
    return;
  }
  e.respondWith(caches.match(r).then(m => m || fetch(r).then(res => {
    if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(r, copy)); }
    return res;
  })));
});
