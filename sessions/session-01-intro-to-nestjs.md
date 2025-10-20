# Session 01: แนะนำ NestJS และโครงสร้างโปรเจกต์ (Intro & Anatomy)

วัตถุประสงค์
- เข้าใจภาพรวม NestJS และสถาปัตยกรรม
- ใช้งาน Nest CLI สร้างโปรเจกต์แรก
- เข้าใจ Modules / Controllers / Providers เบื้องต้น
- รันและทดสอบ API แรก

หัวข้อ
- ทำไม NestJS: DX, TypeScript, Opinionated Architecture, Testability
- โครงสร้างโฟลเดอร์: app.module, main.ts, controllers, providers
- Nest CLI พื้นฐาน: new, generate, start, test
- สร้าง HealthController

เวลาโดยประมาณ (120 นาที)
- 20 นาที บรรยายแนวคิด + Anatomy
- 60 นาที Live Coding: สร้างโปรเจกต์ + HealthController
- 20 นาที Workshop: สร้าง Ping/Pong endpoint
- 20 นาที Q&A + Recap

Workshop
- ให้ผู้เรียนเพิ่ม GET /ping -> { message: 'pong' }
- เพิ่ม/ใช้ ConfigService เบื้องต้น (hardcode ก่อน)

สิ่งที่ต้องมี
- Node.js LTS, npm, Nest CLI, VS Code, Postman/Insomnia

อ่านเพิ่มเติม
- https://docs.nestjs.com/