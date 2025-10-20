# Session 02 – สรุปและ Checklist

จำให้ขึ้นใจ
- ใช้ DTO + class-validator เพื่อป้องกัน input ไม่พึงประสงค์
- ValidationPipe ช่วย whitelist/transform
- Controller จัดการเส้นทาง + รับ/ส่งข้อมูล

Checklist
- [ ] ตั้งค่า ValidationPipe global แล้ว
- [ ] สร้าง DTO สำหรับ Create/Update
- [ ] สร้าง CRUD routes สำเร็จ

การบ้าน
- เพิ่ม Query filter: GET /tasks?search=keyword (ค้นหาตาม title/description)