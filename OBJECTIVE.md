# NestJS Course Objectives (One-Pager, 9 Sessions)

ภาพรวมคอร์ส
- สร้าง REST API ที่พร้อมใช้งานจริงด้วย NestJS (โปรเจกต์ Tasks API)
- เข้าใจสถาปัตยกรรม, โครงสร้างโปรเจกต์, และแนวทางที่ทดสอบได้
- ครอบคลุมตั้งแต่ Controllers/DTO/Validation → Services/DI → Middleware/Security → Database → Auth → Config/Cache → Testing → Deploy

เป้าหมายโดยรวมเมื่อจบคอร์ส
- ออกแบบและพัฒนาแอป NestJS แบบแยกเลเยอร์ชัดเจน, ขยายต่อได้ง่าย
- ใช้ Custom Providers เปลี่ยน implementation ได้โดยไม่แตะ consumer
- เชื่อมต่อฐานข้อมูลด้วย TypeORM และจัดการ schema ด้วยแนวทางที่ปลอดภัย
- ป้องกันระบบด้วย JWT + RBAC และจัดการ lifecycle ของคำขอด้วย Guards/Interceptors/Filters
- บริหารค่าคอนฟิกด้วย @nestjs/config และใช้ cache แบบโปรแกรมมิ่งให้เหมาะกับงาน
- เขียน Unit/E2E tests เพื่อความเชื่อมั่นคุณภาพ
- เตรียมระบบสำหรับ Deploy ด้วย Docker และ CI/CD เบื้องต้น

เป้าหมายรายคาบ (Objectives per Session)
1) Intro & Anatomy
- เข้าใจภาพรวม NestJS, แนวคิดหลัก (Controller/Provider/Module)
- ใช้ Nest CLI สร้างโปรเจกต์และโครงไฟล์พื้นฐาน
- รันและสร้าง endpoint แรก (Hello/Health)

2) Controllers, DTOs, Validation
- ออกแบบ REST routes และจัดการ params/query/body อย่างถูกต้อง
- สร้าง DTO พร้อม validation ด้วย class-validator
- เปิดใช้ ValidationPipe (whitelist, transform) ระดับ global

3) Services, Modules, DI + Custom Providers
- แยก business logic ไป Services และจัดโมดูลให้เป็นระบบ
- เข้าใจ DI/Provider tokens และการฉีดด้วย @Inject
- ใช้ Custom Providers: useValue, useClass, useFactory, useExisting
  - เดโม: @Inject('Logger') เป็น ConsoleLoggerService และ alias 'AppLogger'

4) Middleware, Guards, Interceptors, Filters
- เข้าใจ Request lifecycle และจุด hook ที่เหมาะสม
- เขียน Middleware (preprocess/log), Guards (authn/authz), Interceptors (transform), Filters (error shape)
- ออกแบบ error/response ให้สม่ำเสมอ

5) Database + TypeORM
- เชื่อม Postgres ด้วย TypeOrmModule.forRoot
- สร้าง Entities/Repositories และทำ CRUD
- แนวทาง Migrations/Schema management (ไม่ใช้ synchronize ใน production)

6) Auth (JWT) & Roles
- สร้าง signup/login และออก JWT (access token)
- ใช้ JwtGuard ป้องกัน endpoint และ RolesGuard เพื่อ RBAC
- แนวทางจัดเก็บ secret/expiry อย่างปลอดภัย

7) Config & Cache (เรียบง่าย)
- แยก AppConfigModule และใช้ ConfigModule.forRoot({ isGlobal: true, envFilePath })
- อ่านค่า .env ตรงๆ ด้วย ConfigService.get ใน main.ts และ services
- ใช้ AppCacheService (แยก service) เพื่อ get/set/wrap/del cache แบบโปรแกรมมิ่ง และออกแบบการ invalidation อย่างง่าย
- ไม่ใช้ CacheInterceptor/Swagger/Logging ขั้นสูง

8) Testing (Unit/E2E)
- ตั้งค่า Jest และเขียน Unit tests สำหรับ Services/Controllers (mock providers)
- เขียน E2E tests ด้วย Supertest ให้ผ่าน flow จริง
- จัดโครง describe/it และกำหนดเกณฑ์ coverage เบื้องต้น

9) Advanced & Deploy
- Dockerize แอป (multi-stage) + docker-compose สำหรับ api/db
- จัดการ ENV สำหรับคอนเทนเนอร์
- แนะนำ Microservices/WebSocket (แนวคิด + demo เล็ก)
- ตั้ง CI พื้นฐานด้วย GitHub Actions (lint/test/build)