# หลักสูตรสอน NestJS แบบเป็นคอร์สราย Session (พร้อมสไลด์ + ไฟล์โค้ดทำตาม)

หลักสูตรนี้ออกแบบให้ครอบคลุมเนื้อหาสำคัญของ NestJS ตั้งแต่พื้นฐานจนถึงระดับ Production โดยแต่ละ Session จะมี:
- เนื้อหา (ไฟล์ md) สำหรับการสอน
- โค้ดทำตามสำหรับ Live Coding (ไฟล์ md)
- สรุปย่อ/Checklist หลังเรียน (ไฟล์ md)
- สไลด์รวมทั้งหมดใช้สอนในคลาส (slides/slides.md – ใช้ Marp แปลงเป็น PowerPoint)

ภาพรวมโครงการตัวอย่าง: เราจะพัฒนา “Tasks API” แบบค่อยเป็นค่อยไป (เพิ่มฟีเจอร์ในทุก Session) เริ่มจาก REST, DTO/Validation, Services/DI (Custom Providers), Middleware/Guards, เชื่อมฐานข้อมูลด้วย TypeORM, ทำ Auth (JWT), ตั้งค่า Config/Logging/Cache/Swagger, เขียน Unit/E2E tests และปิดท้ายด้วย Advanced & Deploy

โครงสร้างไฟล์
- sessions/
  - session-01-intro-to-nestjs.md
  - session-01-code.md
  - session-01-summary.md
  - …
- slides/
  - slides.md (ไฟล์สไลด์รูปแบบ Marp – export เป็น .pptx ได้)
- SUMMARY.md (สรุปรวมทุก session + ลิงก์)

วิธีใช้งานสไลด์ให้เป็น PowerPoint
1) ติดตั้ง Marp CLI (ต้องมี Node.js)
   - npm i -g @marp-team/marp-cli
2) แปลงเป็น PowerPoint:
   - marp slides/slides.md -o slides/NestJS-Course.pptx

ข้อเสนอแนะการสอน
- รูปแบบการสอน: 30% อธิบายแนวคิด + 60% Live Coding + 10% Q&A
- ในทุก Session มี “จุดหยุด” ให้ผู้เรียนลงมือทำ (Pair/Individual)
- เตรียม Docker (สำหรับ Postgres) และ Postman/Insomnia สำหรับทดสอบ API
- ใช้ Git แท็ก/สาขาตาม Session เพื่อย้อนดูโค้ดได้ง่าย

ตารางหัวข้อโดยสรุป (9 Sessions)
1) Intro & Project Anatomy + Nest CLI
2) Controllers, Routing, DTOs, Validation, Pipes
3) Providers/Services, Modules, Dependency Injection + Custom Providers
4) Middleware, Guards, Interceptors, Exception Filters
5) Database (Postgres) + TypeORM + Repository + Migrations
6) Authentication (Passport, JWT), Authorization (Roles/Guards)
7) Config, Logging, Caching, Swagger (OpenAPI)
8) Testing (Unit + E2E) ด้วย Jest/Supertest
9) Advanced & Deploy: Docker & CI/CD

หมายเหตุการปรับหลักสูตร:
- ตัดหัวข้อ GraphQL ออก (ไม่มี GraphQL ภายในคอร์ส)
- คืน Session 7: Config/Logging/Cache/Swagger และจัด Testing เป็น Session 8, Advanced & Deploy เป็น Session 9

ก่อนเริ่มคอร์ส
- ติดตั้ง: Node.js LTS, npm, Nest CLI (npm i -g @nestjs/cli), Docker Desktop
- เครื่องมือแนะนำ: VS Code + Extensions (ESLint, Prettier), Insomnia/Postman
- สร้างโฟลเดอร์ทำงาน เช่น nestjs-course/