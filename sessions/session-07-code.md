# Session 07: Code Examples

Complete testing examples for NestJS applications.

## Unit Testing Services
```typescript
describe('TasksService', () => {
  let service: TasksService;
  let repository: Repository<Task>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        TasksService,
        {
          provide: getRepositoryToken(Task),
          useValue: {
            find: jest.fn(),
            save: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get(TasksService);
    repository = module.get(getRepositoryToken(Task));
  });

  it('should find all tasks', async () => {
    const tasks = [{ id: 1, title: 'Test' }];
    jest.spyOn(repository, 'find').mockResolvedValue(tasks);
    
    expect(await service.findAll()).toEqual(tasks);
  });
});
```

## E2E Testing
```typescript
describe('TasksController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/tasks (GET)', () => {
    return request(app.getHttpServer())
      .get('/tasks')
      .expect(200)
      .expect((res) => {
        expect(Array.isArray(res.body)).toBe(true);
      });
  });
});
```
