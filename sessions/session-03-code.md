# Session 03 – โค้ดทำตาม (ฉบับง่ายมาก: Services, DI, Modules + Custom Providers + HttpModule)

เป้าหมาย: สาธิต Custom Providers ทีละแบบด้วยโค้ดสั้น อ่านง่าย และใช้ได้จริง

- useValue: ค่าคงที่
- useClass: map token -> class โดยตรง (สาธิต inject ตรงๆ ด้วย @Inject('Logger') เป็น ConsoleLoggerService)
- useFactory: ประกอบ object จากฟังก์ชัน (in-memory repo)
- useExisting: ทำ alias ไปยัง provider เดิม (สาธิต inject ผ่าน Controller)
- HttpModule & HttpService: เรียก external API ด้วย Axios wrapper ของ NestJS

โครงสร้าง (อย่างง่าย)

- src/app.module.ts
- src/tasks/tasks.module.ts
- src/tasks/tasks.service.ts
- src/tasks/tasks.controller.ts
- src/tasks/external-api.service.ts (เพิ่มใหม่: สาธิต HttpService)

หมายเหตุ

- ใช้ string token ตรงๆ: 'APP_NAME', 'Logger', 'TASKS_REPO', 'AppLogger'
- แยกบทบาทให้เห็นภาพ: Service ฉีด 'Logger' โดยตรง (useClass), Controller ฉีด 'AppLogger' (useExisting)
- HttpModule: นำเข้าเพื่อใช้ HttpService สำหรับเรียก external API

ติดตั้ง Dependencies

```bash
npm install @nestjs/axios axios
```

สร้างไฟล์ด้วย NestJS CLI

```bash
# สร้าง module, service, controller พร้อมกันด้วยคำสั่งเดียว (แนะนำ)
nest g resource tasks --no-spec

# หรือสร้างทีละไฟล์
nest g module tasks
nest g service tasks --no-spec
nest g controller tasks --no-spec

# สร้าง ExternalApiService
nest g service tasks/external-api --no-spec --flat
```

**หมายเหตุ:**

- `nest g resource` จะสร้างทั้ง module, controller, service, DTO และ entity พร้อมกัน
- `--no-spec` = ไม่สร้างไฟล์ test
- `--flat` = ไม่สร้าง folder ใหม่ (สร้างในโฟลเดอร์เดียวกัน)
- หลังจากใช้ CLI แล้ว ให้แก้ไขโค้ดตามตัวอย่างด้านล่าง

ขั้นที่ 1) AppModule นำเข้า TasksModule

```ts
// src/app.module.ts
import { Module } from '@nestjs/common';
import { TasksModule } from './tasks/tasks.module';

@Module({
  imports: [TasksModule],
})
export class AppModule {}
```

ขั้นที่ 2) TasksModule ประกาศ Custom Providers ครบทั้ง 4 แบบ + นำเข้า HttpModule

```ts
// src/tasks/tasks.module.ts
import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { ExternalApiService } from './external-api.service';

/**
 * 1) useValue: ค่าคงที่
 */
const AppNameProvider = {
  provide: 'APP_NAME',
  useValue: 'Tasks API',
};

/**
 * 2) useClass: ผูก token -> class โดยตรง
 *    - Service จะ inject ด้วย @Inject('Logger') เป็น ConsoleLoggerService โดยตรง
 */
export class ConsoleLoggerService {
  log(message: string) {
    console.log('[LOG]', message);
  }
}

const LoggerProvider = {
  provide: 'Logger',
  useClass: ConsoleLoggerService,
};

/**
 * 3) useFactory: ประกอบ repository แบบ in-memory เรียบง่าย
 */
const TasksRepoFactoryProvider = {
  provide: 'TASKS_REPO',
  useFactory: () => {
    let id = 1;
    const items: Array<{ id: number; title: string; description?: string }> = [];

    return {
      findAll: () => items,
      findOne: (taskId: number) => items.find((t) => t.id === taskId),
      create: (data: { title: string; description?: string }) => {
        const task = { id: id++, ...data };
        items.push(task);
        return task;
      },
      update: (
        taskId: number,
        data: Partial<{ title: string; description?: string }>
      ) => {
        const idx = items.findIndex((t) => t.id === taskId);
        if (idx === -1) return undefined;
        items[idx] = { ...items[idx], ...data };
        return items[idx];
      },
      remove: (taskId: number) => {
        const before = items.length;
        const after = items.filter((t) => t.id !== taskId);
        items.length = 0;
        items.push(...after);
        return after.length < before;
      },
    };
  },
};

/**
 * 4) useExisting: ทำ alias ให้ Logger เดิม (ไม่สร้าง instance ใหม่)
 *    - Controller จะ inject ผ่าน @Inject('AppLogger')
 */
const LoggerAliasProvider = {
  provide: 'AppLogger',
  useExisting: 'Logger',
};

@Module({
  imports: [
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
    }),
  ],
  controllers: [TasksController],
  providers: [
    TasksService,
    ExternalApiService,       // เพิ่ม Service ที่ใช้ HttpService
    AppNameProvider,          // useValue
    LoggerProvider,           // useClass
    TasksRepoFactoryProvider, // useFactory
    LoggerAliasProvider,      // useExisting (alias ของ 'Logger')
  ],
  exports: [TasksService],
})
export class TasksModule {}
```

ขั้นที่ 3) ExternalApiService: สาธิตการใช้ HttpService เรียก external API

```ts
// src/tasks/external-api.service.ts
import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class ExternalApiService {
  constructor(private readonly httpService: HttpService) {}

  /**
   * ตัวอย่าง: ดึงข้อมูล user จาก JSONPlaceholder API
   */
  async getUser(userId: number) {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`https://jsonplaceholder.typicode.com/users/${userId}`)
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching user:', error.message);
      throw error;
    }
  }

  /**
   * ตัวอย่าง: ดึง todos ทั้งหมด
   */
  async getAllTodos() {
    try {
      const response = await firstValueFrom(
        this.httpService.get('https://jsonplaceholder.typicode.com/todos')
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching todos:', error.message);
      throw error;
    }
  }

  /**
   * ตัวอย่าง: สร้าง post ใหม่
   */
  async createPost(data: { title: string; body: string; userId: number }) {
    try {
      const response = await firstValueFrom(
        this.httpService.post('https://jsonplaceholder.typicode.com/posts', data)
      );
      return response.data;
    } catch (error) {
      console.error('Error creating post:', error.message);
      throw error;
    }
  }
}
```

ขั้นที่ 4) Service: สาธิต "inject useClass โดยตรง" ด้วย @Inject('Logger') เป็น ConsoleLoggerService

```ts
// src/tasks/tasks.service.ts
import { Inject, Injectable } from '@nestjs/common';
import { ConsoleLoggerService } from './tasks.module'; // นำเข้า class ที่ใช้กับ useClass
import { ExternalApiService } from './external-api.service';

type Task = { id: number; title: string; description?: string };
type TasksRepo = {
  findAll: () => Task[];
  findOne: (id: number) => Task | undefined;
  create: (data: Omit<Task, 'id'>) => Task;
  update: (id: number, data: Partial<Omit<Task, 'id'>>) => Task | undefined;
  remove: (id: number) => boolean;
};

@Injectable()
export class TasksService {
  constructor(
    @Inject('TASKS_REPO') private readonly repo: TasksRepo, // useFactory
    @Inject('Logger') private readonly logger: ConsoleLoggerService, // useClass → inject ตรงเป็น ConsoleLoggerService
    @Inject('APP_NAME') private readonly appName: string, // useValue
    private readonly externalApi: ExternalApiService, // inject ExternalApiService
  ) {}

  findAll() {
    this.logger.log(`${this.appName} -> findAll`);
    return this.repo.findAll();
  }

  findOne(id: number) {
    this.logger.log(`${this.appName} -> findOne(${id})`);
    return this.repo.findOne(id);
  }

  create(data: Omit<Task, 'id'>) {
    this.logger.log(`${this.appName} -> create("${data.title}")`);
    return this.repo.create(data);
  }

  update(id: number, data: Partial<Omit<Task, 'id'>>) {
    this.logger.log(`${this.appName} -> update(${id})`);
    return this.repo.update(id, data);
  }

  remove(id: number) {
    this.logger.log(`${this.appName} -> remove(${id})`);
    return this.repo.remove(id);
  }

  /**
   * ตัวอย่างการใช้ ExternalApiService
   */
  async getExternalUser(userId: number) {
    this.logger.log(`${this.appName} -> getExternalUser(${userId})`);
    return this.externalApi.getUser(userId);
  }

  async getExternalTodos() {
    this.logger.log(`${this.appName} -> getExternalTodos()`);
    return this.externalApi.getAllTodos();
  }
}
```

ขั้นที่ 5) Controller: สาธิต "inject useExisting (alias)" ด้วย @Inject('AppLogger') + เพิ่ม endpoints สำหรับ external API

```ts
// src/tasks/tasks.controller.ts
import { Body, Controller, Get, Inject, Param, ParseIntPipe, Post } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { ConsoleLoggerService } from './tasks.module';

@Controller('tasks')
export class TasksController {
  constructor(
    private readonly tasks: TasksService,
    @Inject('AppLogger') private readonly appLogger: ConsoleLoggerService, // useExisting → alias ของ 'Logger'
  ) {}

  @Get()
  findAll() {
    this.appLogger.log('Controller -> GET /tasks');
    return this.tasks.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    this.appLogger.log(`Controller -> GET /tasks/${id}`);
    return this.tasks.findOne(id) ?? { message: 'not found' };
  }

  @Post()
  create(@Body() body: { title: string; description?: string }) {
    this.appLogger.log('Controller -> POST /tasks');
    return this.tasks.create(body);
  }

  /**
   * ตัวอย่าง: เรียกข้อมูลจาก external API
   */
  @Get('external/user/:userId')
  async getExternalUser(@Param('userId', ParseIntPipe) userId: number) {
    this.appLogger.log(`Controller -> GET /tasks/external/user/${userId}`);
    return this.tasks.getExternalUser(userId);
  }

  @Get('external/todos')
  async getExternalTodos() {
    this.appLogger.log('Controller -> GET /tasks/external/todos');
    return this.tasks.getExternalTodos();
  }
}
```

```ts
// src/tasks/tasks.controller.ts
import { Body, Controller, Get, Inject, Param, ParseIntPipe, Post } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { ConsoleLoggerService } from './tasks.module';

@Controller('tasks')
export class TasksController {
  constructor(
    private readonly tasks: TasksService,
    @Inject('AppLogger') private readonly appLogger: ConsoleLoggerService, // useExisting → alias ของ 'Logger'
  ) {}

  @Get()
  findAll() {
    this.appLogger.log('Controller -> GET /tasks');
    return this.tasks.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    this.appLogger.log(`Controller -> GET /tasks/${id}`);
    return this.tasks.findOne(id) ?? { message: 'not found' };
  }

  @Post()
  create(@Body() body: { title: string; description?: string }) {
    this.appLogger.log('Controller -> POST /tasks');
    return this.tasks.create(body);
  }
}
```

ทดสอบ API

```bash
# ทดสอบ CRUD ปกติ
curl http://localhost:3000/tasks
curl http://localhost:3000/tasks -X POST -H "Content-Type: application/json" -d '{"title":"Test Task","description":"Test Description"}'

# ทดสอบเรียก external API
curl http://localhost:3000/tasks/external/user/1
curl http://localhost:3000/tasks/external/todos
```

สรุปทวนทีละประเด็น (พร้อมแผนการอธิบายในคลาส)

1. **useValue**

   - Provider: provide('APP_NAME', 'Tasks API')
   - Inject: @Inject('APP_NAME') appName: string
   - ใช้สำหรับ: ค่าคงที่, config values
2. **useClass**

   - Provider: provide('Logger', useClass: ConsoleLoggerService)
   - Inject: @Inject('Logger') logger: ConsoleLoggerService
   - ชี้ให้เห็นว่าอนาคตสามารถสลับเป็น ProdLoggerService ได้ง่าย โดยแก้ useClass เพียงจุดเดียว
   - ใช้สำหรับ: การสลับ implementation ของ service
3. **useFactory**

   - Provider: provide('TASKS_REPO', useFactory: () => in-memory repo)
   - Inject: @Inject('TASKS_REPO') repo
   - ใช้สำหรับ: สร้าง object ที่ซับซ้อน, dynamic configuration
4. **useExisting**

   - Provider: provide('AppLogger', useExisting: 'Logger')
   - Inject: @Inject('AppLogger') appLogger
   - ชี้ให้นักเรียนเห็นว่าเป็น instance เดียวกับ 'Logger' ไม่ได้สร้างใหม่
   - ใช้สำหรับ: สร้าง alias, shared instance
5. **HttpModule & HttpService**

   - Import: HttpModule.register({ timeout: 5000, maxRedirects: 5 })
   - Inject: HttpService ใน ExternalApiService
   - ใช้ firstValueFrom() เพื่อแปลง Observable เป็น Promise
   - ใช้สำหรับ: เรียก REST API, integration กับ external services
   - ข้อดี: มี interceptors, retry logic, timeout configuration built-in

**จุดสำคัญที่ควรเน้นกับนักเรียน:**

- HttpService return เป็น Observable (RxJS) ต้องใช้ firstValueFrom() แปลงเป็น Promise
- การ config HttpModule ด้วย timeout และ maxRedirects
- Error handling เมื่อเรียก external API
- การแยก concerns: ExternalApiService รับผิดชอบเฉพาะการเรียก API
- TasksService orchestrate logic โดยเรียกใช้ ExternalApiService
