# Session 07 – โค้ดทำตาม (Config แบบพื้นฐาน + Cache แยก Service, get/set เท่านั้น)

เป้าหมายคาบนี้

- ใช้ @nestjs/config อ่านค่าจาก .env ตรงๆ ด้วย ConfigService (ไม่ใช้ registerAs, ไม่ใช้ Joi)
- แยก “CacheService” ออกมาเป็นไฟล์ของตัวเอง แล้วให้ feature services เรียกใช้ผ่านเมธอด get/set/del หรือ wrap
- ไม่ใช้ CacheInterceptor, ไม่ใช้ Swagger/Logging ขั้นสูง

แพ็กเกจที่ใช้

```bash
npm i @nestjs/config
npm i @nestjs/cache-manager
# (ตัวเลือก Production) npm i cache-manager ioredis cache-manager-ioredis-yet
```

โครงไฟล์ที่จะทำตาม

- .env
- src/app.module.ts
- src/main.ts
- src/common/app-cache.service.ts        ← แยก cache service ตรงนี้
- src/tasks/tasks.service.ts              ← เรียกใช้ AppCacheService
- src/tasks/tasks.controller.ts

หมายเหตุ

- โค้ดชุดนี้ใช้ in-memory cache เหมาะสำหรับ Dev/Workshop; Production ควรใช้ Redis และออกแบบ TTL/key ให้เหมาะ

---
## Configuration

#### 1) สร้างไฟล์ .development.env (ตัวอย่าง)
```
PORT=3000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=5432
DB_USER=nest
DB_PASS=nest
DB_NAME=tasks

JWT_SECRET=dev_secret
```

#### 2) แยก AppConfigModule
```ts
// src/config/app-config.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.development.env',
    }),
  ],
  exports: [ConfigModule],
})
export class AppConfigModule {}
```

#### 3) ใช้ AppConfigModule ใน AppModule
```ts
// src/app.module.ts
import { Module } from '@nestjs/common';
import { AppConfigModule } from './config/app-config.module';

@Module({
  imports: [AppConfigModule],
})
export class AppModule {}
```

#### 4) อ่านค่า .env โดยตรงใน main.ts
```ts
// src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  const config = app.get(ConfigService);
  const port = Number(config.get('PORT') ?? 3000);
  await app.listen(port);
  console.log(`Server running on http://localhost:${port}`);
}
bootstrap();
```

#### 5) ใช้ config ใน service ต่างๆ
ใน Services สามารถ inject ConfigService ได้โดยตรง เพื่ออ่านค่าจาก .env ตามต้องการ เช่น DATABASE_USER, DB_USER หรือปรับ TTL ของ cache แบบ runtime

ตัวอย่าง (ตัดตอนจาก TasksService)
```ts
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppCacheService } from '../common/app-cache.service';

@Injectable()
export class TasksService {
  constructor(
    private readonly config: ConfigService,
    private readonly cache: AppCacheService,
  ) {}

  private defaultTtlMs() {
    return Number(this.config.get('CACHE_TTL_MS') ?? 5000);
  }

  private dbUser() {
    return (
      this.config.get<string>('DATABASE_USER') ??
      this.config.get<string>('DB_USER') ??
      'unknown'
    );
  }

  async findAll() {
    const ttl = this.defaultTtlMs();
    const dbUser = this.dbUser();
    return this.cache.wrap('tasks:all', ttl, async () => {
      // ปกติอ่านจาก DB/Repository; เดโมนี้แค่คืนข้อมูลจำลอง
      return [{ id: 1, title: 'Learn NestJS', description: `(dbUser=${dbUser})` }];
    });
  }
}
```

---

## Cache

#### 1) แยก Cache Service ออกมา

```ts
// src/common/app-cache.service.ts
import { Inject, Injectable } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';

@Injectable()
export class AppCacheService {
  constructor(@Inject(CACHE_MANAGER) private readonly cache: Cache) {}

  async get<T>(key: string): Promise<T | undefined> {
    return (await this.cache.get(key)) as T | undefined;
  }

  async set<T>(key: string, value: T, ttlMs?: number): Promise<void> {
    await this.cache.set(key, value, ttlMs);
  }

  async del(key: string): Promise<void> {
    await this.cache.del(key);
  }

  // ตัวช่วยยอดนิยม: ถ้ามีใน cache คืนเลย, ถ้าไม่มีก็เรียก factory สร้าง/เก็บ/คืนค่า
  async wrap<T>(key: string, ttlMs: number, factory: () => Promise<T>): Promise<T> {
    const hit = await this.get<T>(key);
    if (hit !== undefined) return hit;
    const fresh = await factory();
    await this.set(key, fresh, ttlMs);
    return fresh;
  }
}
```

---

#### 2) ใช้ Cache ผ่าน Service ที่แยกไว้

```ts
// src/tasks/tasks.service.ts
import { Injectable } from '@nestjs/common';
import { AppCacheService } from '../common/app-cache.service';

type Task = { id: number; title: string; description?: string };

// เดโม data in-memory
let seq = 1;
const store: Task[] = [];

@Injectable()
export class TasksService {
  constructor(private readonly cache: AppCacheService) {}

  private listKey() {
    return 'tasks:all';
  }
  private byIdKey(id: number) {
    return `tasks:id:${id}`;
  }

  findAll() {
    return this.cache.wrap<Task[]>(this.listKey(), 5_000, async () => {
      // ปกติจะอ่านจาก DB/Repository
      return [...store];
    });
  }

  async findOne(id: number) {
    return this.cache.wrap<Task | undefined>(this.byIdKey(id), 5_000, async () => {
      return store.find((t) => t.id === id);
    });
  }

  async create(input: Omit<Task, 'id'>) {
    const task: Task = { id: seq++, ...input };
    store.push(task);

    // invalidation อย่างง่าย
    await this.cache.del(this.listKey());
    await this.cache.set(this.byIdKey(task.id), task, 5_000);

    return task;
  }

  async update(id: number, input: Partial<Omit<Task, 'id'>>) {
    const idx = store.findIndex((t) => t.id === id);
    if (idx === -1) return undefined;

    store[idx] = { ...store[idx], ...input };

    // invalidation
    await this.cache.del(this.listKey());
    await this.cache.set(this.byIdKey(id), store[idx], 5_000);

    return store[idx];
  }

  async remove(id: number) {
    const before = store.length;
    const next = store.filter((t) => t.id !== id);
    store.length = 0;
    store.push(...next);

    // invalidation
    await this.cache.del(this.listKey());
    await this.cache.del(this.byIdKey(id));

    return store.length < before;
  }
}
```

---

#### 3) Controller เรียก service ตรงๆ

```ts
// src/tasks/tasks.controller.ts
import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { TasksService } from './tasks.service';

@Controller('tasks')
export class TasksController {
  constructor(private readonly tasks: TasksService) {}

  @Get()
  findAll() {
    return this.tasks.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.tasks.findOne(id);
  }

  @Post()
  create(@Body() body: { title: string; description?: string }) {
    return this.tasks.create(body);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() body: Partial<{ title: string; description?: string }>) {
    return this.tasks.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.tasks.remove(id);
  }
}
```

---

#### 4) เชื่อม AppCacheService เข้า Module (ตัวอย่างใน TasksModule)

```ts
// src/tasks/tasks.module.ts
import { Module } from '@nestjs/common';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { AppCacheService } from '../common/app-cache.service';

@Module({
  controllers: [TasksController],
  providers: [TasksService, AppCacheService],
})
export class TasksModule {}
```

---

#### 5) หมายเหตุสำหรับ Redis (ตัวเลือก Production)

```ts
// src/app.module.ts (แนวคิด registerAsync สำหรับ Redis)
CacheModule.registerAsync({
  isGlobal: true,
  useFactory: async () => ({
    // store: (await import('cache-manager-ioredis-yet')).default,
    // host: 'localhost',
    // port: 6379,
    ttl: 10_000,
  }),
});
```

Workshop แนะนำ

- เพิ่ม ENV ใหม่เช่น APP_NAME แล้วอ่านด้วย ConfigService.get('APP_NAME')
- สร้างเมธอด cache.delByPrefix(prefix: string) ใน AppCacheService (ถ้าต้องการล้าง key ทั้งกลุ่ม)
- ออกแบบ key naming convention เช่น tasks:all, tasks🆔{id}
- วางแผน invalidation อย่างง่าย (หลัง create/update/delete ให้ลบ listKey และ key รายการที่เกี่ยวข้อง)

Tips & Troubleshooting

- ถ้า Cache ไม่ทำงาน ตรวจว่า import CacheModule เป็น global หรือ provider ถูกใส่ใน module แล้ว
- ถ้า Config อ่านค่าไม่ได้ ตรวจ .env อยู่ที่ root และชื่อ key ตรงกับที่เรียกใน ConfigService
- In-memory cache ใช้ดีใน Dev/Single instance เท่านั้น (Prod ใช้ Redis)
