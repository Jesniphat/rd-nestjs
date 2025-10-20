# Session 03 – โค้ดทำตาม (ฉบับง่ายมาก: Services, DI, Modules + Custom Providers)

เป้าหมาย: สาธิต Custom Providers ทีละแบบด้วยโค้ดสั้น อ่านง่าย และใช้ได้จริง
- useValue: ค่าคงที่
- useClass: map token -> class โดยตรง (สาธิต inject ตรงๆ ด้วย @Inject('Logger') เป็น ConsoleLoggerService)
- useFactory: ประกอบ object จากฟังก์ชัน (in-memory repo)
- useExisting: ทำ alias ไปยัง provider เดิม (สาธิต inject ผ่าน Controller)

โครงสร้าง (อย่างง่าย)
- src/app.module.ts
- src/tasks/tasks.module.ts
- src/tasks/tasks.service.ts
- src/tasks/tasks.controller.ts

หมายเหตุ
- ใช้ string token ตรงๆ: 'APP_NAME', 'Logger', 'TASKS_REPO', 'AppLogger'
- แยกบทบาทให้เห็นภาพ: Service ฉีด 'Logger' โดยตรง (useClass), Controller ฉีด 'AppLogger' (useExisting)

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

ขั้นที่ 2) TasksModule ประกาศ Custom Providers ครบทั้ง 4 แบบ
```ts
// src/tasks/tasks.module.ts
import { Module } from '@nestjs/common';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';

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
  controllers: [TasksController],
  providers: [
    TasksService,
    AppNameProvider,          // useValue
    LoggerProvider,           // useClass
    TasksRepoFactoryProvider, // useFactory
    LoggerAliasProvider,      // useExisting (alias ของ 'Logger')
  ],
  exports: [TasksService],
})
export class TasksModule {}
```

ขั้นที่ 3) Service: สาธิต “inject useClass โดยตรง” ด้วย @Inject('Logger') เป็น ConsoleLoggerService
```ts
// src/tasks/tasks.service.ts
import { Inject, Injectable } from '@nestjs/common';
import { ConsoleLoggerService } from './tasks.module'; // นำเข้า class ที่ใช้กับ useClass

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
}
```

ขั้นที่ 4) Controller: สาธิต “inject useExisting (alias)” ด้วย @Inject('AppLogger')
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

สรุปทวนทีละประเด็น (พร้อมแผนการอธิบายในคลาส)
- useValue
  - Provider: provide('APP_NAME', 'Tasks API')
  - Inject: @Inject('APP_NAME') appName: string
- useClass
  - Provider: provide('Logger', useClass: ConsoleLoggerService)
  - Inject: @Inject('Logger') logger: ConsoleLoggerService
  - ชี้ให้เห็นว่าอนาคตสามารถสลับเป็น ProdLoggerService ได้ง่าย โดยแก้ useClass เพียงจุดเดียว
- useFactory
  - Provider: provide('TASKS_REPO', useFactory: () => in-memory repo)
  - Inject: @Inject('TASKS_REPO') repo
- useExisting
  - Provider: provide('AppLogger', useExisting: 'Logger')
  - Inject: @Inject('AppLogger') appLogger (ชี้ให้นักเรียนเห็นว่าเป็น instance เดียวกับ 'Logger' ไม่ได้สร้างใหม่)