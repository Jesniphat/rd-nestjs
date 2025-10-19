---
marp: true
theme: default
paginate: true
backgroundColor: #fff
---

# NestJS Course
## Building Production-Ready Applications

8-Session Comprehensive Training

---

# Course Overview

## What We'll Cover
- **Session 01**: Introduction to NestJS
- **Session 02**: Controllers, DTOs, and Validation
- **Session 03**: Services, Dependency Injection, and Modules
- **Session 04**: Middleware, Guards, Interceptors, and Filters
- **Session 05**: Database Integration with TypeORM
- **Session 06**: Authentication and Authorization
- **Session 07**: Testing
- **Session 08**: Advanced Topics and Deployment

---

# Session 01: Introduction to NestJS

## Objectives
- Understand what NestJS is and its benefits
- Learn the core architecture and design principles
- Set up a NestJS development environment
- Create your first NestJS application
- Explore the project structure

---

# Session 01: What is NestJS?

## Key Points
- Progressive Node.js framework for building efficient, scalable server-side applications
- Built with TypeScript (also supports JavaScript)
- Combines elements of OOP, FP, and FRP
- Inspired by Angular architecture
- Production-ready out of the box

## Why NestJS?
- Type safety with TypeScript
- Modular architecture
- Built-in dependency injection
- Strong CLI tooling
- Extensive ecosystem

<!-- Speaker Notes:
Emphasize the benefits of using NestJS over Express.js:
- Better code organization
- Enterprise-ready patterns
- Reduced boilerplate
- Easy testing
-->

---

# Session 01: Core Concepts

## Architecture Building Blocks
- **Controllers**: Handle incoming requests and return responses
- **Providers**: Business logic and services
- **Modules**: Organize application structure
- **Decorators**: Add metadata to classes and methods
- **Dependency Injection**: Manage dependencies automatically

<!-- Speaker Notes:
Draw parallels to Angular for those familiar with it.
Explain how these concepts work together to create maintainable applications.
-->

---

# Session 01: Setting Up

## Installation Steps
```bash
# Install NestJS CLI globally
npm i -g @nestjs/cli

# Create new project
nest new project-name

# Start development server
npm run start:dev
```

## Project Structure
- `src/main.ts` - Application entry point
- `src/app.module.ts` - Root module
- `src/app.controller.ts` - Basic controller
- `src/app.service.ts` - Basic service

---

# Session 01: Demo - First Endpoint

## Creating a Simple Endpoint

```typescript
@Controller('hello')
export class HelloController {
  @Get()
  sayHello(): string {
    return 'Hello, NestJS!';
  }
}
```

## Workshop
- Create a new NestJS project
- Add a custom endpoint
- Test using browser or Postman

---

# Session 02: Controllers, DTOs, and Validation

## Objectives
- Master controller concepts and routing
- Handle different HTTP methods
- Work with request data (params, query, body)
- Implement DTOs for type safety
- Add validation to incoming data
- Use pipes for data transformation

---

# Session 02: Controllers Deep Dive

## HTTP Methods
```typescript
@Controller('users')
export class UsersController {
  @Get()           // GET /users
  @Get(':id')      // GET /users/:id
  @Post()          // POST /users
  @Put(':id')      // PUT /users/:id
  @Patch(':id')    // PATCH /users/:id
  @Delete(':id')   // DELETE /users/:id
}
```

<!-- Speaker Notes:
Explain RESTful conventions and when to use each HTTP method.
Discuss idempotency and safe methods.
-->

---

# Session 02: Request Data

## Accessing Request Data
```typescript
@Get(':id')
findOne(@Param('id') id: string) {
  return `User ${id}`;
}

@Get()
findAll(@Query('role') role?: string) {
  return `Users with role: ${role}`;
}

@Post()
create(@Body() createUserDto: CreateUserDto) {
  return createUserDto;
}
```

---

# Session 02: DTOs and Validation

## Data Transfer Objects
```typescript
import { IsString, IsEmail, IsInt, Min } from 'class-validator';

export class CreateUserDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsInt()
  @Min(18)
  age: number;
}
```

## Enable Validation
```typescript
app.useGlobalPipes(new ValidationPipe());
```

<!-- Speaker Notes:
Explain the importance of input validation for security and data integrity.
Show examples of validation errors returned to clients.
-->

---

# Session 02: Pipes

## Built-in Pipes
- `ValidationPipe` - Validates request data
- `ParseIntPipe` - Converts string to integer
- `ParseBoolPipe` - Converts string to boolean
- `ParseArrayPipe` - Converts to array
- `ParseUUIDPipe` - Validates UUID format

## Usage Example
```typescript
@Get(':id')
findOne(@Param('id', ParseIntPipe) id: number) {
  return this.usersService.findOne(id);
}
```

---

# Session 02: Workshop

## Hands-on Exercise
1. Create a `TasksController` with CRUD endpoints
2. Define `CreateTaskDto` and `UpdateTaskDto` with validation
3. Add validation rules:
   - Title must be a string (max 100 chars)
   - Description is optional
   - Status must be enum: OPEN, IN_PROGRESS, DONE
4. Test validation errors with invalid data

---

# Session 03: Services, Dependency Injection, and Modules

## Objectives
- Understand the service layer and business logic
- Learn dependency injection fundamentals
- Master custom providers (useValue, useClass, useFactory, useExisting)
- Practice direct injection with @Inject decorator
- Organize code with modules
- Understand provider scopes

---

# Session 03: Services

## What are Services?
- Contain business logic
- Reusable across controllers
- Injectable providers
- Single Responsibility Principle

```typescript
@Injectable()
export class TasksService {
  private tasks: Task[] = [];

  findAll(): Task[] {
    return this.tasks;
  }

  create(task: Task): Task {
    this.tasks.push(task);
    return task;
  }
}
```

---

# Session 03: Dependency Injection

## How It Works
```typescript
@Controller('tasks')
export class TasksController {
  constructor(private tasksService: TasksService) {}

  @Get()
  findAll() {
    return this.tasksService.findAll();
  }
}
```

## Benefits
- Loose coupling
- Easy testing (mock dependencies)
- Better code organization
- Automatic instance management

<!-- Speaker Notes:
Explain how NestJS IoC container manages the lifecycle of providers.
Discuss the Singleton pattern (default scope).
-->

---

# Session 03: Custom Providers - useValue

## Static Values
```typescript
const configProvider = {
  provide: 'APP_NAME',
  useValue: 'Task Management System',
};

@Module({
  providers: [configProvider],
})
export class AppModule {}

// Usage
constructor(@Inject('APP_NAME') private appName: string) {}
```

## Use Cases
- Configuration constants
- Feature flags
- Static data

---

# Session 03: Custom Providers - useClass

## Class-based Providers
```typescript
// Define the service
@Injectable()
export class ConsoleLoggerService {
  log(message: string) {
    console.log(`[LOG]: ${message}`);
  }
}

// Provide with custom token
const loggerProvider = {
  provide: 'Logger',
  useClass: ConsoleLoggerService,
};

// Direct injection of the class via token
constructor(
  @Inject('Logger') private logger: ConsoleLoggerService
) {}
```

<!-- Speaker Notes:
Emphasize that you can inject the class type directly when using a token with useClass.
This is different from interface-based tokens where you'd use the interface type.
-->

---

# Session 03: Custom Providers - useFactory

## Dynamic Provider Creation
```typescript
const tasksRepoProvider = {
  provide: 'TASKS_REPO',
  useFactory: () => {
    const isProd = process.env.NODE_ENV === 'production';
    return isProd ? new DatabaseRepo() : new InMemoryRepo();
  },
};

// With dependencies
const dbProvider = {
  provide: 'DB_CONNECTION',
  useFactory: async (config: ConfigService) => {
    return await createConnection(config.get('DB_URL'));
  },
  inject: [ConfigService],
};
```

---

# Session 03: Custom Providers - useExisting

## Aliasing Providers
```typescript
const appLoggerProvider = {
  provide: 'AppLogger',
  useExisting: 'Logger',  // References the 'Logger' token
};

@Module({
  providers: [
    { provide: 'Logger', useClass: ConsoleLoggerService },
    { provide: 'AppLogger', useExisting: 'Logger' },
  ],
})
export class TasksModule {}

// Multiple names for same instance
constructor(@Inject('AppLogger') private logger: ConsoleLoggerService) {}
```

<!-- Speaker Notes:
Explain that useExisting creates an alias, not a new instance.
Both tokens resolve to the same singleton instance.
-->

---

# Session 03: Demo - Custom Providers

## Complete Example
```typescript
@Module({
  providers: [
    TasksService,
    { provide: 'APP_NAME', useValue: 'Task Manager' },
    { provide: 'Logger', useClass: ConsoleLoggerService },
    { 
      provide: 'TASKS_REPO',
      useFactory: () => new InMemoryTasksRepository(),
    },
    { provide: 'AppLogger', useExisting: 'Logger' },
  ],
})
export class TasksModule {}
```

---

# Session 03: Modules

## Module Organization
```typescript
@Module({
  imports: [UsersModule, AuthModule],
  controllers: [TasksController],
  providers: [TasksService],
  exports: [TasksService],  // Make available to other modules
})
export class TasksModule {}
```

## Best Practices
- One module per feature
- Export only what's needed
- Use barrel exports (index.ts)
- Keep modules focused and cohesive

---

# Session 03: Workshop

## Hands-on Exercise
1. Create a `TasksModule` with custom providers:
   - `APP_NAME` using useValue
   - `Logger` using useClass (ConsoleLoggerService)
   - `TASKS_REPO` using useFactory
   - `AppLogger` using useExisting
2. Inject `@Inject('Logger')` as `ConsoleLoggerService` in service
3. Inject `@Inject('AppLogger')` in controller
4. Test that both injections work and share the same instance

---

# Session 04: Middleware, Guards, Interceptors, and Filters

## Objectives
- Understand the NestJS request lifecycle
- Implement middleware for preprocessing
- Use guards for authentication/authorization
- Apply interceptors for response transformation
- Handle errors with exception filters
- Learn practical use cases for each

---

# Session 04: Request Lifecycle

## Order of Execution
1. **Middleware** - First line of defense
2. **Guards** - Permission checks
3. **Interceptors (before)** - Pre-processing
4. **Pipes** - Validation/transformation
5. **Controller Handler** - Business logic
6. **Interceptors (after)** - Post-processing
7. **Exception Filters** - Error handling

<!-- Speaker Notes:
Draw a diagram showing the request flow.
Explain how each layer can short-circuit the request.
-->

---

# Session 04: Middleware

## Creating Middleware
```typescript
@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    console.log(`${req.method} ${req.url}`);
    next();
  }
}

// Apply in module
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware)
      .forRoutes('*');
  }
}
```

## Use Cases
- Logging
- CORS
- Body parsing
- Session management

---

# Session 04: Guards

## Authentication Guard
```typescript
@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const token = request.headers.authorization;
    
    if (!token) {
      throw new UnauthorizedException();
    }
    
    return this.validateToken(token);
  }
}

// Usage
@UseGuards(AuthGuard)
@Get('profile')
getProfile() {
  return { user: 'data' };
}
```

---

# Session 04: Role-Based Guards

## Authorization Example
```typescript
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.get<string[]>('roles', context.getHandler());
    if (!roles) return true;

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    
    return roles.some(role => user.roles?.includes(role));
  }
}

// Custom decorator
export const Roles = (...roles: string[]) => SetMetadata('roles', roles);
```

---

# Session 04: Interceptors

## Response Transformation
```typescript
@Injectable()
export class TransformInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map(data => ({
        success: true,
        timestamp: new Date().toISOString(),
        data,
      }))
    );
  }
}

// Response format
{
  "success": true,
  "timestamp": "2024-01-15T10:30:00.000Z",
  "data": { /* actual data */ }
}
```

---

# Session 04: Logging Interceptor

## Performance Monitoring
```typescript
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const now = Date.now();
    const request = context.switchToHttp().getRequest();
    
    return next.handle().pipe(
      tap(() => {
        const duration = Date.now() - now;
        console.log(`${request.method} ${request.url} - ${duration}ms`);
      })
    );
  }
}
```

---

# Session 04: Exception Filters

## Custom Error Handling
```typescript
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();
    const status = exception.getStatus();

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: exception.message,
    });
  }
}
```

---

# Session 04: Workshop

## Hands-on Exercise
1. Create a `LoggerMiddleware` that logs all requests
2. Implement an `AuthGuard` that checks for a Bearer token
3. Create a `TransformInterceptor` to wrap all responses
4. Build an `HttpExceptionFilter` for consistent error format
5. Apply them to your TasksController
6. Test the complete request lifecycle

---

# Session 05: Database Integration with TypeORM

## Objectives
- Understand ORM concepts and TypeORM basics
- Set up database connection
- Define entities and relationships
- Use the Repository pattern
- Implement CRUD operations
- Work with migrations
- Learn best practices

---

# Session 05: What is TypeORM?

## Key Features
- Supports multiple databases (PostgreSQL, MySQL, SQLite, etc.)
- Active Record and Data Mapper patterns
- Migrations and schema synchronization
- Eager and lazy loading
- Transaction support
- TypeScript decorators

## Installation
```bash
npm install @nestjs/typeorm typeorm pg
```

<!-- Speaker Notes:
Explain the difference between Active Record and Data Mapper.
Discuss why TypeORM is popular in the NestJS ecosystem.
-->

---

# Session 05: Database Setup

## Configuration
```typescript
@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'user',
      password: 'password',
      database: 'nestjs_db',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true,  // Don't use in production
    }),
  ],
})
export class AppModule {}
```

---

# Session 05: Defining Entities

## Entity Example
```typescript
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ unique: true })
  email: string;

  @Column()
  age: number;

  @Column({ default: true })
  isActive: boolean;
}
```

---

# Session 05: Relationships

## One-to-Many Example
```typescript
@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToMany(() => Task, task => task.user)
  tasks: Task[];
}

@Entity()
export class Task {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @ManyToOne(() => User, user => user.tasks)
  user: User;
}
```

---

# Session 05: Repository Pattern

## Using Repositories
```typescript
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  async findOne(id: number): Promise<User> {
    return this.usersRepository.findOne({ where: { id } });
  }

  async create(user: CreateUserDto): Promise<User> {
    const newUser = this.usersRepository.create(user);
    return this.usersRepository.save(newUser);
  }
}
```

---

# Session 05: CRUD Operations

## Complete Service
```typescript
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  findAll() {
    return this.usersRepository.find({ relations: ['tasks'] });
  }

  findOne(id: number) {
    return this.usersRepository.findOneBy({ id });
  }

  create(createUserDto: CreateUserDto) {
    const user = this.usersRepository.create(createUserDto);
    return this.usersRepository.save(user);
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return this.usersRepository.update(id, updateUserDto);
  }

  remove(id: number) {
    return this.usersRepository.delete(id);
  }
}
```

---

# Session 05: Migrations

## Why Migrations?
- Version control for database schema
- Safe deployment to production
- Team collaboration
- Rollback capability

## Creating Migrations
```bash
# Generate migration
npm run typeorm migration:generate -- -n CreateUsers

# Run migrations
npm run typeorm migration:run

# Revert migration
npm run typeorm migration:revert
```

<!-- Speaker Notes:
Emphasize never using synchronize: true in production.
Always use migrations for schema changes.
-->

---

# Session 05: Workshop

## Hands-on Exercise
1. Set up PostgreSQL/SQLite database
2. Create `User` and `Task` entities with relationship
3. Implement `UsersService` with CRUD operations
4. Create `UsersController` with all endpoints
5. Test CRUD operations
6. Try eager/lazy loading
7. Create a migration for your schema

---

# Session 06: Authentication and Authorization

## Objectives
- Understand authentication vs. authorization
- Implement JWT-based authentication
- Integrate Passport.js
- Create login and registration endpoints
- Implement role-based access control (RBAC)
- Secure routes with guards
- Learn security best practices

---

# Session 06: Authentication vs Authorization

## Authentication
- **Who are you?**
- Verifying user identity
- Login with credentials
- Session/token management

## Authorization
- **What can you do?**
- Checking permissions
- Role-based access
- Resource-level permissions

<!-- Speaker Notes:
Use real-world examples like building security (authentication = badge scan, authorization = floor access).
-->

---

# Session 06: JWT Basics

## What is JWT?
- JSON Web Token
- Stateless authentication
- Three parts: Header.Payload.Signature
- Self-contained (includes user data)

## JWT Structure
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.
eyJ1c2VySWQiOjEsInVzZXJuYW1lIjoiam9obiJ9.
SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
```

## Installation
```bash
npm install @nestjs/jwt @nestjs/passport passport passport-jwt
npm install -D @types/passport-jwt
```

---

# Session 06: Auth Module Setup

## Module Structure
```typescript
@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.register({
      secret: 'your-secret-key',  // Use env variable
      signOptions: { expiresIn: '1h' },
    }),
  ],
  providers: [AuthService, JwtStrategy],
  controllers: [AuthController],
})
export class AuthModule {}
```

---

# Session 06: Auth Service

## Login Logic
```typescript
@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(username: string, password: string) {
    const user = await this.usersService.findByUsername(username);
    if (user && await bcrypt.compare(password, user.password)) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = { username: user.username, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
```

---

# Session 06: JWT Strategy

## Passport Strategy
```typescript
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: 'your-secret-key',
    });
  }

  async validate(payload: any) {
    return { userId: payload.sub, username: payload.username };
  }
}
```

---

# Session 06: Auth Controller

## Login Endpoint
```typescript
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    const user = await this.authService.validateUser(
      loginDto.username,
      loginDto.password,
    );
    
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    
    return this.authService.login(user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }
}
```

---

# Session 06: Role-Based Access Control

## User Roles
```typescript
export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
  MODERATOR = 'moderator',
}

@Entity()
export class User {
  // ... other fields
  
  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER,
  })
  role: UserRole;
}
```

---

# Session 06: Roles Decorator and Guard

## Custom Decorator
```typescript
export const Roles = (...roles: UserRole[]) => SetMetadata('roles', roles);
```

## Roles Guard
```typescript
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);
    
    if (!requiredRoles) return true;
    
    const { user } = context.switchToHttp().getRequest();
    return requiredRoles.some(role => user.role === role);
  }
}
```

---

# Session 06: Protecting Routes

## Usage Example
```typescript
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminController {
  @Get('users')
  @Roles(UserRole.ADMIN)
  getAllUsers() {
    return this.usersService.findAll();
  }

  @Delete('users/:id')
  @Roles(UserRole.ADMIN)
  deleteUser(@Param('id') id: number) {
    return this.usersService.remove(id);
  }
}
```

---

# Session 06: Security Best Practices

## Key Points
- Never store passwords in plain text (use bcrypt)
- Use environment variables for secrets
- Set appropriate token expiration
- Implement refresh tokens for long sessions
- Use HTTPS in production
- Validate all input data
- Implement rate limiting
- Log authentication attempts

<!-- Speaker Notes:
Discuss common security vulnerabilities and how to prevent them.
Mention OWASP Top 10.
-->

---

# Session 06: Workshop

## Hands-on Exercise
1. Install required packages (jwt, passport)
2. Create `AuthModule`, `AuthService`, `AuthController`
3. Implement registration endpoint with password hashing
4. Implement login endpoint returning JWT
5. Create `JwtStrategy` for token validation
6. Protect routes with `JwtAuthGuard`
7. Add roles to users and implement `RolesGuard`
8. Test authentication flow with Postman

---

# Session 07: Testing

## Objectives
- Understand testing importance and types
- Set up Jest testing environment
- Write unit tests for services
- Write unit tests for controllers
- Implement integration tests
- Create end-to-end (E2E) tests
- Mock dependencies
- Measure test coverage

---

# Session 07: Why Testing?

## Benefits
- Catch bugs early
- Safe refactoring
- Documentation
- Confidence in deployments
- Better design

## Testing Pyramid
1. **Unit Tests** (Most) - Test individual functions/classes
2. **Integration Tests** (Medium) - Test module interactions
3. **E2E Tests** (Least) - Test complete workflows

<!-- Speaker Notes:
Explain the cost/benefit of each testing level.
More unit tests, fewer E2E tests.
-->

---

# Session 07: Jest Setup

## NestJS comes with Jest configured

```json
{
  "jest": {
    "moduleFileExtensions": ["js", "json", "ts"],
    "rootDir": "src",
    "testRegex": ".*\\.spec\\.ts$",
    "transform": {
      "^.+\\.(t|j)s$": "ts-jest"
    },
    "collectCoverageFrom": [
      "**/*.(t|j)s"
    ],
    "coverageDirectory": "../coverage",
    "testEnvironment": "node"
  }
}
```

---

# Session 07: Unit Testing Services

## Example Service Test
```typescript
describe('TasksService', () => {
  let service: TasksService;
  let repository: Repository<Task>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        {
          provide: getRepositoryToken(Task),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<TasksService>(TasksService);
    repository = module.get<Repository<Task>>(getRepositoryToken(Task));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
```

---

# Session 07: Testing Service Methods

## Testing findAll
```typescript
describe('findAll', () => {
  it('should return an array of tasks', async () => {
    const tasks = [
      { id: 1, title: 'Task 1', status: 'OPEN' },
      { id: 2, title: 'Task 2', status: 'DONE' },
    ];

    jest.spyOn(repository, 'find').mockResolvedValue(tasks as Task[]);

    const result = await service.findAll();

    expect(result).toEqual(tasks);
    expect(repository.find).toHaveBeenCalled();
  });
});

describe('create', () => {
  it('should create and return a task', async () => {
    const createTaskDto = { title: 'New Task', description: 'Test' };
    const task = { id: 1, ...createTaskDto, status: 'OPEN' };

    jest.spyOn(repository, 'create').mockReturnValue(task as Task);
    jest.spyOn(repository, 'save').mockResolvedValue(task as Task);

    const result = await service.create(createTaskDto);

    expect(result).toEqual(task);
    expect(repository.create).toHaveBeenCalledWith(createTaskDto);
    expect(repository.save).toHaveBeenCalledWith(task);
  });
});
```

---

# Session 07: Unit Testing Controllers

## Controller Test Setup
```typescript
describe('TasksController', () => {
  let controller: TasksController;
  let service: TasksService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TasksController],
      providers: [
        {
          provide: TasksService,
          useValue: {
            findAll: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<TasksController>(TasksController);
    service = module.get<TasksService>(TasksService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
```

---

# Session 07: Testing Controller Endpoints

## Testing GET endpoint
```typescript
describe('findAll', () => {
  it('should return an array of tasks', async () => {
    const tasks = [{ id: 1, title: 'Task 1' }];
    jest.spyOn(service, 'findAll').mockResolvedValue(tasks);

    const result = await controller.findAll();

    expect(result).toEqual(tasks);
    expect(service.findAll).toHaveBeenCalled();
  });
});

describe('create', () => {
  it('should create a new task', async () => {
    const createTaskDto = { title: 'New Task', description: 'Test' };
    const task = { id: 1, ...createTaskDto };
    
    jest.spyOn(service, 'create').mockResolvedValue(task);

    const result = await controller.create(createTaskDto);

    expect(result).toEqual(task);
    expect(service.create).toHaveBeenCalledWith(createTaskDto);
  });
});
```

---

# Session 07: E2E Testing

## E2E Test Setup
```typescript
describe('TasksController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
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

---

# Session 07: E2E CRUD Tests

## Complete E2E Flow
```typescript
describe('Tasks CRUD (e2e)', () => {
  let createdTaskId: number;

  it('should create a task', () => {
    return request(app.getHttpServer())
      .post('/tasks')
      .send({ title: 'E2E Task', description: 'Test task' })
      .expect(201)
      .expect((res) => {
        createdTaskId = res.body.id;
        expect(res.body.title).toBe('E2E Task');
      });
  });

  it('should get the created task', () => {
    return request(app.getHttpServer())
      .get(`/tasks/${createdTaskId}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.id).toBe(createdTaskId);
      });
  });

  it('should delete the task', () => {
    return request(app.getHttpServer())
      .delete(`/tasks/${createdTaskId}`)
      .expect(200);
  });
});
```

---

# Session 07: Mocking Dependencies

## Different Mocking Strategies
```typescript
// Mock entire module
jest.mock('./users.service');

// Mock specific function
jest.spyOn(service, 'findOne').mockResolvedValue(user);

// Mock with custom implementation
const mockRepository = {
  find: jest.fn().mockResolvedValue([]),
  findOne: jest.fn().mockImplementation((id) => 
    Promise.resolve({ id, name: 'Test' })
  ),
};

// Using useValue in providers
{
  provide: UsersService,
  useValue: {
    findAll: jest.fn(),
  },
}
```

---

# Session 07: Test Coverage

## Running Coverage
```bash
# Run tests with coverage
npm run test:cov

# Coverage report shows:
# - Statement coverage
# - Branch coverage
# - Function coverage
# - Line coverage
```

## Coverage Goals
- Aim for 80%+ coverage
- 100% for critical business logic
- Don't chase 100% everywhere
- Focus on meaningful tests

<!-- Speaker Notes:
Discuss code coverage vs. test quality.
High coverage doesn't guarantee good tests.
-->

---

# Session 07: Workshop

## Hands-on Exercise
1. Write unit tests for `TasksService`:
   - Test all CRUD methods
   - Mock the repository
2. Write unit tests for `TasksController`:
   - Test all endpoints
   - Mock the service
3. Write E2E tests:
   - Test complete CRUD flow
   - Test validation errors
4. Run coverage report
5. Aim for 80%+ coverage

---

# Session 08: Advanced Topics and Deployment

## Objectives
- Application configuration management
- Error handling strategies
- Performance optimization techniques
- Docker containerization
- Deployment to production
- Monitoring and logging
- Best practices and patterns

---

# Session 08: Configuration Management

## Environment Variables
```typescript
// Installation
npm install @nestjs/config

// app.module.ts
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV}`,
    }),
  ],
})
export class AppModule {}

// Usage
@Injectable()
export class AppService {
  constructor(private configService: ConfigService) {}

  getDatabaseUrl() {
    return this.configService.get<string>('DATABASE_URL');
  }
}
```

---

# Session 08: Configuration Schema Validation

## Validate Environment Variables
```typescript
import * as Joi from 'joi';

ConfigModule.forRoot({
  validationSchema: Joi.object({
    NODE_ENV: Joi.string()
      .valid('development', 'production', 'test')
      .default('development'),
    PORT: Joi.number().default(3000),
    DATABASE_URL: Joi.string().required(),
    JWT_SECRET: Joi.string().required(),
  }),
});
```

<!-- Speaker Notes:
Emphasize the importance of validating configuration at startup.
Fail fast if critical config is missing.
-->

---

# Session 08: Error Handling

## Global Exception Filter
```typescript
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    const status = exception instanceof HttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    const message = exception instanceof HttpException
      ? exception.getResponse()
      : 'Internal server error';

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message,
    });
  }
}
```

---

# Session 08: Custom Business Exceptions

## Domain-Specific Errors
```typescript
export class TaskNotFoundException extends NotFoundException {
  constructor(taskId: number) {
    super(`Task with ID ${taskId} not found`);
  }
}

export class TaskAlreadyCompletedException extends BadRequestException {
  constructor(taskId: number) {
    super(`Task with ID ${taskId} is already completed`);
  }
}

// Usage
async findOne(id: number) {
  const task = await this.repository.findOne({ where: { id } });
  if (!task) {
    throw new TaskNotFoundException(id);
  }
  return task;
}
```

---

# Session 08: Performance Optimization

## Techniques
1. **Caching** - Cache frequent queries
2. **Database Indexing** - Speed up queries
3. **Pagination** - Limit response size
4. **Compression** - Reduce bandwidth
5. **Connection Pooling** - Reuse DB connections

```typescript
// Compression
import * as compression from 'compression';
app.use(compression());

// Pagination
@Get()
async findAll(@Query('page') page = 1, @Query('limit') limit = 10) {
  const skip = (page - 1) * limit;
  return this.repository.find({ skip, take: limit });
}
```

---

# Session 08: Docker Setup

## Dockerfile
```dockerfile
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:18-alpine AS production

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY --from=builder /app/dist ./dist

EXPOSE 3000
CMD ["node", "dist/main"]
```

---

# Session 08: Docker Compose

## Multi-Container Setup
```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgres://user:pass@db:5432/mydb
    depends_on:
      - db

  db:
    image: postgres:14
    environment:
      POSTGRES_USER: user
      POSTGRES_PASSWORD: pass
      POSTGRES_DB: mydb
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

---

# Session 08: Production Best Practices

## Checklist
- [ ] Use environment variables for configuration
- [ ] Enable CORS appropriately
- [ ] Set up proper logging
- [ ] Implement health checks
- [ ] Use HTTPS
- [ ] Set security headers (Helmet)
- [ ] Rate limiting
- [ ] Database migrations (not synchronize)
- [ ] Monitor application performance
- [ ] Set up error tracking (Sentry, etc.)

<!-- Speaker Notes:
Go through each item explaining why it's important.
Share real-world examples of what happens when these are missed.
-->

---

# Session 08: Health Checks

## Implementing Health Checks
```typescript
// Installation
npm install @nestjs/terminus

// health.controller.ts
@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private db: TypeOrmHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      () => this.db.pingCheck('database'),
    ]);
  }
}
```

---

# Session 08: Logging

## Production Logging
```typescript
// Custom logger
import { Logger } from '@nestjs/common';

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);

  doSomething() {
    this.logger.log('Starting operation');
    try {
      // ... operation
      this.logger.log('Operation completed');
    } catch (error) {
      this.logger.error('Operation failed', error.stack);
      throw error;
    }
  }
}
```

---

# Session 08: Deployment Strategies

## Options
1. **Traditional VPS** (DigitalOcean, Linode)
2. **Platform as a Service** (Heroku, Railway)
3. **Container Orchestration** (Kubernetes, Docker Swarm)
4. **Serverless** (AWS Lambda, Google Cloud Functions)

## CI/CD
- GitHub Actions
- GitLab CI
- Jenkins
- CircleCI

<!-- Speaker Notes:
Discuss pros/cons of each deployment option.
Show a simple GitHub Actions workflow example.
-->

---

# Session 08: GitHub Actions Example

## Simple CI/CD Pipeline
```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm test
      
      - name: Build
        run: npm run build
      
      - name: Deploy
        run: echo "Deploy to your server"
```

---

# Session 08: Workshop

## Final Project
1. Add ConfigModule to your application
2. Create comprehensive error handling
3. Implement health checks endpoint
4. Create a Dockerfile for your app
5. Write docker-compose.yml with database
6. Build and run your app in Docker
7. Add production-ready logging
8. Create a simple deployment script

---

# Course Summary

## What We've Learned
- ✅ NestJS fundamentals and architecture
- ✅ Controllers, DTOs, and validation
- ✅ Services, DI, modules, and custom providers
- ✅ Request lifecycle components
- ✅ Database integration with TypeORM
- ✅ Authentication and authorization
- ✅ Comprehensive testing
- ✅ Production deployment

---

# Next Steps

## Continue Learning
- Explore microservices with NestJS
- Learn advanced patterns (CQRS, Event Sourcing)
- Integrate with message queues (RabbitMQ, Kafka)
- Build real-time apps with WebSockets
- Contribute to NestJS ecosystem

## Resources
- [NestJS Docs](https://docs.nestjs.com)
- [NestJS Discord](https://discord.gg/nestjs)
- [GitHub Examples](https://github.com/nestjs/nest)

---

# Thank You!

## Questions?

Ready to build amazing applications with NestJS! 🚀

Contact: [your-email@example.com]
Repository: [github.com/your-org/nestjs-course]
