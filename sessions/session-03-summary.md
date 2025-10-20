# Session 03 – สรุปและ Checklist (เพิ่ม Custom Providers)

จำให้ขึ้นใจ
- Service เป็นที่อยู่ของ Business Logic และฉีด dependencies ผ่าน DI
- Custom Providers:
  - useValue: ค่าคงที่/Config
  - useClass: เลือก implementation ต่างกันตามบริบท
  - useFactory: ประกอบ instance จาก dependencies อื่น
  - useExisting: ตั้งชื่อ alias ให้ provider เดิม (ไม่สร้าง instance ใหม่)
- ใช้ Injection Tokens (string/symbol) คู่กับ @Inject เพื่ออ้างอิง provider

Checklist
- [ ] สร้าง TOKENS กลางสำหรับอ้างอิง provider
- [ ] เพิ่ม APP_NAME ด้วย useValue
- [ ] เพิ่ม CacheService ด้วย useClass ที่สลับตาม NODE_ENV
- [ ] เพิ่ม TasksRepository ด้วย useFactory และ alias ด้วย useExisting
- [ ] Controller/Service ใช้งาน provider ใหม่ได้ถูกต้อง

การบ้าน
- สร้าง Dynamic Module เล็กๆ (เช่น LoggerModule.forRoot({ level })) ที่คืนค่า provider แบบ useValue/useFactory