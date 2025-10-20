---
marp: true
paginate: true
theme: default
class: lead
title: "NestJS End-to-End Course (9 Sessions)"
description: "จากพื้นฐานสู่ Production พร้อม Live Coding และ Workshop"
---
# คอร์ส NestJS แบบครบถ้วน (9 Sessions)

- ทำโปรเจกต์จริง: Tasks API
- Live Coding + Workshop ทุก Session
- การบ้าน + Checklist ปิดท้าย
- ไม่มี GraphQL

notes: |
  เกริ่นภาพรวมและย้ำโฟกัสที่ REST + Auth + DB + Testing + Deploy

---

## แผนคอร์ส (9 Sessions)

1) Intro & Anatomy
2) Controllers/DTO/Validation
3) Services/Modules/DI + Custom Providers
4) Middleware/Guards/Interceptors/Filters
5) Database + TypeORM
6) Auth (JWT) & Roles
7) Config/Cache
8) Testing (Unit/E2E)
9) Advanced & Deploy (Docker & CI/CD)

---

## สิ่งที่ผู้เรียนควรเตรียม

- Node.js LTS, npm, Nest CLI
- VS Code + ESLint + Prettier
- Postman/Insomnia
- Docker Desktop (Postgres)
- Git + GitHub

notes: |
  ตรวจสอบการติดตั้ง CLI และ Node ล่วงหน้าจะช่วยประหยัดเวลา

---

## โปรเจกต์ตัวอย่าง: Tasks API

- CRUD งาน (title, description, status)
- Validation ด้วย DTO + Pipes
- Auth: Signup/Login, JWT
- DB: Postgres + TypeORM
- Testing: Unit + E2E
- Deploy: Docker + แนวทาง CI

---

# Session 01: Intro & Anatomy

## วัตถุประสงค์

- เข้าใจสถาปัตยกรรม NestJS
- ใช้ Nest CLI สร้างโปรเจกต์แรก
- main.ts, app.module.ts, แนวคิด Module/Controller/Provider

---

## ทำไมต้อง NestJS

- TypeScript-first & Opinionated
- Modular + DI Container
- Decorators-driven
- รองรับหลาย transport (REST, WebSocket, Microservices)

---

## Anatomy โดยสรุป

- main.ts: bootstrap + global pipes/filters/interceptors
- app.module.ts: root module
- feature modules: tasks/, auth/, users/
- controllers vs services vs repositories

---

## Live Coding

- nest new tasks-api
- npm run start:dev
- HealthController: GET /health -> { status: 'ok' }

---

## Workshop

- /ping -> { message: 'pong' }
- เพิ่ม global prefix /api (option)

---

# Session 02: Controllers/DTO/Validation

## วัตถุประสงค์

- Routing ใน Controller
- DTO + class-validator + ValidationPipe

---

## Controllers & Routing

- @Controller, @Get/@Post/@Patch/@Delete
- @Param/@Query/@Body
- ParseIntPipe, DefaultValuePipe

---

## DTO & Validation

- ติดตั้ง class-validator/transformer
- ValidationPipe { whitelist, transform }
- ตัวอย่าง: @IsString(), @IsNotEmpty(), @IsOptional()

---

## Live Coding

- TasksController + DTOs
- CRUD (in-memory) ที่ controller
- ทดสอบ POST/PATCH/GET/DELETE

---

## Workshop

- เพิ่ม search: GET /tasks?search=keyword

---

# Session 03: Services/Modules/DI + Custom Providers

## วัตถุประสงค์

- แยก logic ไป Service
- เข้าใจ DI/Providers/Tokens
- Custom Providers: useValue/useClass/useFactory/useExisting

---

## DI Concepts

- Provider = สิ่งที่ถูก inject
- Token = กุญแจอ้างอิง provider
- @Inject(token) ระบุ provider ที่ต้องการ

---

## Custom Providers (ตัวอย่างชัด)

- useValue: APP_NAME
- useClass: Logger -> ConsoleLoggerService (inject ตรง @Inject('Logger') เป็น ConsoleLoggerService)
- useFactory: in-memory repo
- useExisting: AppLogger -> Logger (alias)

---

## Live Coding

- ประกาศ providers ทั้ง 4 แบบใน TasksModule
- Service inject: repo/logger/appName
- Controller inject: appLogger (alias)

---

## Workshop

- เพิ่ม MY_TIMEZONE: useValue('Asia/Bangkok')
- สลับ Dev/Prod logger ด้วย useClass
- ให้ factory รับ APP_NAME ผ่าน inject

---

# Session 04: Middleware/Guards/Interceptors/Filters

## วัตถุประสงค์

- เข้าใจ Request lifecycle และจุด hook

---

## Lifecycle (ย่อ)

Client -> Middleware -> Guards -> Interceptors -> Controller -> Service
<- Interceptors(resp) <- Exception Filters

---

## กลไกสำคัญ

- Middleware: logging, preprocess
- Guards: Authn/Authz
- Interceptors: logging/transform/cache
- Filters: รูปแบบ error กลาง

---

## Live Coding

- LoggerMiddleware
- Mock AuthGuard (header x-demo-auth)
- LoggingInterceptor + HttpExceptionFilter

---

## Workshop

- TransformInterceptor -> { data, meta }
- Guard เฉพาะ POST/PATCH/DELETE

---

# Session 05: Database + TypeORM

## วัตถุประสงค์

- เชื่อม Postgres
- Entity/Repository + CRUD

---

## เตรียม DB

- docker-compose: postgres:15
- ENV: DB_HOST/PORT/USER/PASS/NAME
- Dev: synchronize: true (Prod หลีกเลี่ยง)

---

## Entities & Repository

- @Entity/@PrimaryGeneratedColumn/@Column
- TypeOrmModule.forFeature([Task])
- @InjectRepository(Task) repo: Repository `<Task>`

---

## Live Coding

- Task entity + repository
- ผูก TasksService กับ repo
- ทดสอบ CRUD

---

## Workshop

- status enum
- filter by status

---

# Session 06: Auth (JWT) & Roles

## วัตถุประสงค์

- Signup/Login + JWT
- ป้องกัน endpoint ด้วย JwtGuard
- RolesGuard

---

## Flow

- Signup -> hash password (bcrypt)
- Login -> JWT access_token
- แนบ Authorization: Bearer `<token>`
- JwtGuard -> req.user
- @Roles + RolesGuard

---

## Live Coding

- UsersService (mock)
- /auth: signup, login
- ใส่ JwtGuard/ RolesGuard ให้ /tasks

---

## Workshop

- จำกัด POST/PATCH/DELETE เฉพาะ role 'user'
- พูดถึง refresh token (แนวคิด)

---

# Session 07: Config, Caching

## วัตถุประสงค์

- จัดการ ENV/Config
- Cache เพิ่มประสิทธิภาพ

---

## Config

- @nestjs/config + .env per environment
- ConfigModule.forRoot({ isGlobal: true })
- ConfigService.get('PORT') และ schema validation (แนวคิด)

---

## Caching

- CacheModule.register({ isGlobal: true })
- CacheInterceptor ระดับ route/global
- ข้อควรระวังเรื่อง invalidation

---

## Live Coding

- เพิ่ม .env + ConfigModule
- CacheInterceptor กับ GET /tasks

---

## Workshop

- TTL cache เฉพาะ endpoint
- เพิ่ม description/summary ให้ endpoints ใน Swagger

---

# Session 08: Testing (Unit/E2E)

## วัตถุประสงค์

- Unit test (Service/Controller)
- E2E test ด้วย Supertest
- Mock providers

---

## Testing แนวคิด

- Unit vs E2E
- TestingModule, provider overrides
- จัดโครง describe/it

---

## Live Coding

- Unit test: TasksService
- E2E: GET /health
- Controller test: mock service

---

## Workshop

- เพิ่ม e2e case: POST /tasks
- ตั้ง coverage เป้าหมายขั้นต่ำ

---

# Session 09: Advanced & Deploy (Deploy-only)

## วัตถุประสงค์

- Dockerize + Compose
- แนวทาง CI/CD

---

## Dockerize

- Multi-stage Dockerfile
- docker-compose.prod.yml (api + db)
- ENV management

---

<!-- Removed: Microservices & WebSocket (Intro) section for deploy-only focus -->

---

## CI/CD แนวทาง

- actions/checkout, setup-node
- npm ci, lint, test, build
- แยก workflow per branch

---

## Live Coding

- Dockerfile + compose
- workflow ตัวอย่าง CI

---

## Workshop

- เพิ่ม cache steps npm
- ปรับ ENV สำหรับ container

---

# Best Practices (สรุปรวม)

- แยก layer ชัดเจน: Controller/Service/Data
- DTO + ValidationPipe กับทุก input
- token/abstract สำหรับ providers เพื่อสลับ implementation
- ไม่ใช้ synchronize: true ใน production (ใช้ migrations)
- มี unit test สำหรับ service หลัก + e2e พื้นฐาน
- จัดเก็บ secrets ใน ENV/secret manager

---

# Export เป็น PowerPoint

- ติดตั้ง: npm i -g @marp-team/marp-cli
- คำสั่ง:
  - marp slides/slides.md -o slides/NestJS-Course.pptx
