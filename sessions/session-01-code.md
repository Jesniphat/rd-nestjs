# Session 01 – โค้ดทำตาม (Intro & Anatomy)

เริ่มโปรเจกต์
```bash
npm i -g @nestjs/cli
nest new tasks-api
cd tasks-api
npm run start:dev
```

สร้าง HealthController
```bash
nest g controller health
```

src/health/health.controller.ts
```ts
import { Controller, Get } from '@nestjs/common';

@Controller('health')
export class HealthController {
  @Get()
  check() {
    return { status: 'ok', time: new Date().toISOString() };
  }
}
```

ผูก HealthModule (CLI สร้างให้แล้ว) กับ AppModule ถ้ายังไม่ถูก import
```ts
// src/app.module.ts
import { Module } from '@nestjs/common';
import { HealthModule } from './health/health.module';

@Module({
  imports: [HealthModule],
})
export class AppModule {}
```

ทดสอบ
- GET http://localhost:3000/health

Workshop: สร้าง /ping
```bash
nest g controller ping
```

src/ping/ping.controller.ts
```ts
import { Controller, Get } from '@nestjs/common';

@Controller('ping')
export class PingController {
  @Get()
  pong() {
    return { message: 'pong' };
  }
}
```