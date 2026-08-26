/**
 * zip.js — เขียนไฟล์ ZIP แบบเก็บดิบ (store, ไม่บีบอัด) ในเบราว์เซอร์
 *
 * ใช้รวม "ชุดเอกสาร" ของฟอร์มหนึ่งใบ — ฟอร์มเปล่า PDF · ผังงาน · คำอธิบายขั้นตอน
 * ให้ดาวน์โหลดเป็นไฟล์เดียว
 *
 * ── ทำไมเขียนเอง ────────────────────────────────────────────
 * ต้องการแค่รวมไฟล์ไม่กี่ไฟล์ ไม่ต้องบีบอัด (PDF บีบแล้วในตัว) ไลบรารี zip
 * ตัวเล็กที่สุดยังใหญ่กว่าโค้ดนี้หลายเท่า และเว็บนี้โหลดจาก GitHub Pages
 * ที่ไม่มีขั้นตอน build ของ JS — ไฟล์ที่เพิ่มเข้ามาคือไฟล์ที่ผู้ใช้ต้องโหลดจริง
 *
 * ── ข้อจำกัดที่ยอมรับ ───────────────────────────────────────
 * ไม่บีบอัด → ไฟล์ใหญ่เท่าผลรวมของไฟล์ข้างใน (ชุดหนึ่งราว 200–400 KB)
 * ไม่รองรับไฟล์เกิน 4 GB (ZIP64) ซึ่งไม่มีทางเกิดกับชุดเอกสารแบบนี้
 * ชื่อไฟล์เก็บเป็น UTF-8 และตั้งธง bit 11 ไว้ ตัวแตกไฟล์จึงอ่านภาษาไทยถูก
 */
(function (global) {
  'use strict';

  const CRC = (function () {
    const t = new Uint32Array(256);
    for (let n = 0; n < 256; n++) {
      let c = n;
      for (let k = 0; k < 8; k++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
      t[n] = c >>> 0;
    }
    return t;
  })();

  function crc32(buf) {
    let c = 0xFFFFFFFF;
    for (let i = 0; i < buf.length; i++) c = CRC[(c ^ buf[i]) & 0xFF] ^ (c >>> 8);
    return (c ^ 0xFFFFFFFF) >>> 0;
  }

  const enc = new TextEncoder();

  function dosTime(d) {
    return ((d.getHours() << 11) | (d.getMinutes() << 5) | (d.getSeconds() / 2)) & 0xFFFF;
  }
  function dosDate(d) {
    return (((d.getFullYear() - 1980) << 9) | ((d.getMonth() + 1) << 5) | d.getDate()) & 0xFFFF;
  }

  /**
   * files: [{ name, data:Uint8Array } | { name, text:string }]
   * คืน Blob ของไฟล์ zip
   */
  function make(files, when) {
    const now = when || new Date();
    const T = dosTime(now), D = dosDate(now);
    const parts = [], central = [];
    let offset = 0;

    files.forEach(f => {
      const name = enc.encode(f.name);
      const data = f.data instanceof Uint8Array ? f.data : enc.encode(f.text || '');
      const crc = crc32(data);

      const local = new Uint8Array(30 + name.length);
      const lv = new DataView(local.buffer);
      lv.setUint32(0, 0x04034b50, true);
      lv.setUint16(4, 20, true);        // ต้องการเวอร์ชัน 2.0
      lv.setUint16(6, 0x0800, true);    // bit 11 = ชื่อไฟล์เป็น UTF-8
      lv.setUint16(8, 0, true);         // 0 = เก็บดิบ ไม่บีบอัด
      lv.setUint16(10, T, true);
      lv.setUint16(12, D, true);
      lv.setUint32(14, crc, true);
      lv.setUint32(18, data.length, true);
      lv.setUint32(22, data.length, true);
      lv.setUint16(26, name.length, true);
      lv.setUint16(28, 0, true);
      local.set(name, 30);

      parts.push(local, data);

      const cen = new Uint8Array(46 + name.length);
      const cv = new DataView(cen.buffer);
      cv.setUint32(0, 0x02014b50, true);
      cv.setUint16(4, 20, true);
      cv.setUint16(6, 20, true);
      cv.setUint16(8, 0x0800, true);
      cv.setUint16(10, 0, true);
      cv.setUint16(12, T, true);
      cv.setUint16(14, D, true);
      cv.setUint32(16, crc, true);
      cv.setUint32(20, data.length, true);
      cv.setUint32(24, data.length, true);
      cv.setUint16(28, name.length, true);
      cv.setUint32(42, offset, true);
      cen.set(name, 46);
      central.push(cen);

      offset += local.length + data.length;
    });

    const cenSize = central.reduce((n, c) => n + c.length, 0);
    const end = new Uint8Array(22);
    const ev = new DataView(end.buffer);
    ev.setUint32(0, 0x06054b50, true);
    ev.setUint16(8, files.length, true);
    ev.setUint16(10, files.length, true);
    ev.setUint32(12, cenSize, true);
    ev.setUint32(16, offset, true);

    return new Blob(parts.concat(central, [end]), { type: 'application/zip' });
  }

  global.Zip = { make, crc32 };
})(window);
