# Session 08 – โค้ดทำตาม (Testing)

Unit test service
```ts
// src/tasks/tasks.service.spec.ts
import { Test } from '@nestjs/testing';
import { TasksService } from './tasks.service';

describe('TasksService', () => {
  let service: TasksService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [TasksService],
    }).compile();
    service = module.get(TasksService);
  });

  it('creates and finds a task', () => {
    const t = service.create({ title: 'A' });
    expect(service.findOne(t.id)?.title).toBe('A');
  });
});
```

E2E test
```ts
// test/app.e2e-spec.ts
import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('App E2E', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const module = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = module.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /health', async () => {
    await request(app.getHttpServer()).get('/health').expect(200);
  });
});
```

รันทดสอบ
```bash
npm run test
npm run test:e2e
```