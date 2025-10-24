# Session 03: Services/Modules/Dependency Injection (+ Custom Providers)

วัตถุประสงค์

- แยก Business logic ไปไว้ที่ Service
- เข้าใจการเรียกใช้ httpService ในการ call api ต่างๆ
- เข้าใจ Dependency Injection และ Provider
- ใช้ Custom Providers: useValue, useClass, useFactory, useExisting
- เข้าใจ Injection Tokens และการฉีดด้วย @Inject

หัวข้อ

- Providers, @Injectable(), DI container
- Services และการ reuse
- Custom Providers
  - Value providers: useValue
  - Class providers: useClass (สลับ implementation ตาม env)
  - Factory providers: useFactory (รับพารามิเตอร์ผ่าน inject)
  - Alias providers: useExisting (ทำชื่อเล่นให้ provider ที่มีอยู่)
- Injection tokens (string/symbol) และการใช้ @Inject()
- หลักการ Single Responsibility และ Module boundaries
- ใช้ HttpModule ในการ Inject httpService เพื่อเรียก 3th api

เวลา (120 นาที)

- 25 นาที อธิบาย DI/Providers + Custom Providers overview
- 65 นาที Live Coding: ย้าย logic ไป TaskService + เพิ่ม providers 4 แบบ
- 30 นาที Workshop + Q&A

Workshop

- ให้ผู้เรียนสร้าง provider "APP_NAME" แบบ useValue
- เพิ่ม CacheService ที่สลับ useClass ระหว่าง InMemory/Noop ตาม NODE_ENV
- สร้าง TasksRepository แบบ in-memory ผ่าน useFactory และ alias เป็น 'TasksRepository'
