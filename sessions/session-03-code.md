# Session 03: Code Examples

## Simple Custom Providers Demo

This example demonstrates all four types of custom providers in a minimal, beginner-friendly way.

### Project Setup

```bash
# Create a new module for our demo
nest generate module tasks
nest generate controller tasks
nest generate service tasks
```

### Console Logger Service

First, let's create a simple logger service:

```typescript
// tasks/console-logger.service.ts
import { Injectable } from '@nestjs/common';

@Injectable()
export class ConsoleLoggerService {
  log(message: string, context?: string) {
    const timestamp = new Date().toISOString();
    const ctx = context ? `[${context}]` : '';
    console.log(`${timestamp} [LOG] ${ctx} ${message}`);
  }

  error(message: string, trace?: string, context?: string) {
    const timestamp = new Date().toISOString();
    const ctx = context ? `[${context}]` : '';
    console.error(`${timestamp} [ERROR] ${ctx} ${message}`);
    if (trace) {
      console.error(trace);
    }
  }

  warn(message: string, context?: string) {
    const timestamp = new Date().toISOString();
    const ctx = context ? `[${context}]` : '';
    console.warn(`${timestamp} [WARN] ${ctx} ${message}`);
  }
}
```

### In-Memory Repository

```typescript
// tasks/in-memory-tasks.repository.ts
export interface Task {
  id: number;
  title: string;
  description: string;
  completed: boolean;
}

export class InMemoryTasksRepository {
  private tasks: Task[] = [
    { id: 1, title: 'Learn NestJS', description: 'Complete the course', completed: false },
    { id: 2, title: 'Build API', description: 'Create REST API', completed: false },
  ];

  findAll(): Task[] {
    return this.tasks;
  }

  findById(id: number): Task | undefined {
    return this.tasks.find(task => task.id === id);
  }

  create(task: Omit<Task, 'id'>): Task {
    const newTask = {
      id: this.tasks.length + 1,
      ...task,
    };
    this.tasks.push(newTask);
    return newTask;
  }

  update(id: number, task: Partial<Task>): Task | undefined {
    const index = this.tasks.findIndex(t => t.id === id);
    if (index === -1) return undefined;
    
    this.tasks[index] = { ...this.tasks[index], ...task };
    return this.tasks[index];
  }

  delete(id: number): boolean {
    const index = this.tasks.findIndex(t => t.id === id);
    if (index === -1) return false;
    
    this.tasks.splice(index, 1);
    return true;
  }
}
```

### Tasks Module with Custom Providers

Here's the complete module demonstrating all four custom provider types:

```typescript
// tasks/tasks.module.ts
import { Module } from '@nestjs/common';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { ConsoleLoggerService } from './console-logger.service';
import { InMemoryTasksRepository } from './in-memory-tasks.repository';

@Module({
  controllers: [TasksController],
  providers: [
    TasksService,
    
    // 1. useValue - Static constant
    {
      provide: 'APP_NAME',
      useValue: 'Task Management System',
    },
    
    // 2. useClass - Provide ConsoleLoggerService with custom token
    // This allows direct injection as ConsoleLoggerService type
    {
      provide: 'Logger',
      useClass: ConsoleLoggerService,
    },
    
    // 3. useFactory - Create repository dynamically
    {
      provide: 'TASKS_REPO',
      useFactory: () => {
        // Could check environment and return different implementations
        console.log('Creating InMemoryTasksRepository via factory');
        return new InMemoryTasksRepository();
      },
    },
    
    // 4. useExisting - Create an alias for the Logger
    // 'AppLogger' and 'Logger' will resolve to the same instance
    {
      provide: 'AppLogger',
      useExisting: 'Logger',
    },
  ],
})
export class TasksModule {}
```

### Tasks Service with Custom Provider Injection

```typescript
// tasks/tasks.service.ts
import { Injectable, Inject } from '@nestjs/common';
import { ConsoleLoggerService } from './console-logger.service';
import { InMemoryTasksRepository, Task } from './in-memory-tasks.repository';

@Injectable()
export class TasksService {
  constructor(
    // Inject APP_NAME (useValue)
    @Inject('APP_NAME') private readonly appName: string,
    
    // Inject Logger as ConsoleLoggerService (useClass)
    // Note: We can specify the class type because we used useClass
    @Inject('Logger') private readonly logger: ConsoleLoggerService,
    
    // Inject repository (useFactory)
    @Inject('TASKS_REPO') private readonly tasksRepo: InMemoryTasksRepository,
  ) {
    this.logger.log(`TasksService initialized for ${this.appName}`, 'TasksService');
  }

  findAll(): Task[] {
    this.logger.log('Fetching all tasks', 'TasksService');
    return this.tasksRepo.findAll();
  }

  findOne(id: number): Task | undefined {
    this.logger.log(`Fetching task with ID: ${id}`, 'TasksService');
    const task = this.tasksRepo.findById(id);
    
    if (!task) {
      this.logger.warn(`Task with ID ${id} not found`, 'TasksService');
    }
    
    return task;
  }

  create(task: Omit<Task, 'id'>): Task {
    this.logger.log(`Creating new task: ${task.title}`, 'TasksService');
    return this.tasksRepo.create(task);
  }

  update(id: number, task: Partial<Task>): Task | undefined {
    this.logger.log(`Updating task with ID: ${id}`, 'TasksService');
    return this.tasksRepo.update(id, task);
  }

  remove(id: number): boolean {
    this.logger.log(`Removing task with ID: ${id}`, 'TasksService');
    return this.tasksRepo.delete(id);
  }

  getAppName(): string {
    return this.appName;
  }
}
```

### Tasks Controller with useExisting Injection

```typescript
// tasks/tasks.controller.ts
import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete, 
  Body, 
  Param, 
  ParseIntPipe,
  Inject,
  HttpCode,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { ConsoleLoggerService } from './console-logger.service';
import { Task } from './in-memory-tasks.repository';

@Controller('tasks')
export class TasksController {
  constructor(
    private readonly tasksService: TasksService,
    
    // Inject using the alias 'AppLogger' (useExisting)
    // This resolves to the same instance as 'Logger'
    @Inject('AppLogger') private readonly logger: ConsoleLoggerService,
  ) {
    this.logger.log('TasksController initialized', 'TasksController');
  }

  @Get()
  findAll(): Task[] {
    this.logger.log('GET /tasks - Finding all tasks', 'TasksController');
    return this.tasksService.findAll();
  }

  @Get('app-info')
  getAppInfo() {
    return {
      appName: this.tasksService.getAppName(),
      version: '1.0.0',
      endpoints: ['GET /tasks', 'POST /tasks', 'GET /tasks/:id'],
    };
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Task {
    this.logger.log(`GET /tasks/${id} - Finding task`, 'TasksController');
    const task = this.tasksService.findOne(id);
    
    if (!task) {
      this.logger.error(`Task ${id} not found`, undefined, 'TasksController');
      throw new NotFoundException(`Task with ID ${id} not found`);
    }
    
    return task;
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createTaskDto: Omit<Task, 'id'>): Task {
    this.logger.log('POST /tasks - Creating new task', 'TasksController');
    return this.tasksService.create(createTaskDto);
  }

  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTaskDto: Partial<Task>,
  ): Task {
    this.logger.log(`PUT /tasks/${id} - Updating task`, 'TasksController');
    const task = this.tasksService.update(id, updateTaskDto);
    
    if (!task) {
      this.logger.error(`Task ${id} not found for update`, undefined, 'TasksController');
      throw new NotFoundException(`Task with ID ${id} not found`);
    }
    
    return task;
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number): void {
    this.logger.log(`DELETE /tasks/${id} - Removing task`, 'TasksController');
    const deleted = this.tasksService.remove(id);
    
    if (!deleted) {
      this.logger.error(`Task ${id} not found for deletion`, undefined, 'TasksController');
      throw new NotFoundException(`Task with ID ${id} not found`);
    }
  }
}
```

### Testing the Custom Providers

Create a test file to verify the setup:

```http
### Get all tasks
GET http://localhost:3000/tasks

### Get app info (shows APP_NAME from useValue)
GET http://localhost:3000/tasks/app-info

### Get task by ID
GET http://localhost:3000/tasks/1

### Create a new task
POST http://localhost:3000/tasks
Content-Type: application/json

{
  "title": "Test Custom Providers",
  "description": "Understanding useValue, useClass, useFactory, useExisting",
  "completed": false
}

### Update a task
PUT http://localhost:3000/tasks/1
Content-Type: application/json

{
  "completed": true
}

### Delete a task
DELETE http://localhost:3000/tasks/2
```

### Verify the Logger Instance is Shared

Add this method to verify that both 'Logger' and 'AppLogger' are the same instance:

```typescript
// Add to tasks.service.ts
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class TasksService {
  constructor(
    @Inject('APP_NAME') private readonly appName: string,
    @Inject('Logger') private readonly logger: ConsoleLoggerService,
    @Inject('TASKS_REPO') private readonly tasksRepo: InMemoryTasksRepository,
    @Inject('AppLogger') private readonly appLogger: ConsoleLoggerService, // Add this
  ) {
    // Verify they're the same instance
    console.log('Logger === AppLogger?', this.logger === this.appLogger); // true
    this.logger.log(`TasksService initialized for ${this.appName}`, 'TasksService');
  }
}
```

## Advanced Custom Provider Examples

### useFactory with Dependencies

```typescript
// config/config.service.ts
@Injectable()
export class ConfigService {
  get(key: string): string {
    return process.env[key] || '';
  }
}

// database/database.providers.ts
export const databaseProviders = [
  {
    provide: 'DATABASE_CONNECTION',
    useFactory: async (config: ConfigService): Promise<any> => {
      const host = config.get('DB_HOST');
      const port = config.get('DB_PORT');
      const database = config.get('DB_NAME');
      
      // Simulate async database connection
      return new Promise((resolve) => {
        setTimeout(() => {
          console.log(`Connected to database at ${host}:${port}/${database}`);
          resolve({ host, port, database, connected: true });
        }, 1000);
      });
    },
    inject: [ConfigService], // Inject ConfigService into the factory
  },
];

// database/database.module.ts
@Module({
  providers: [...databaseProviders, ConfigService],
  exports: [...databaseProviders],
})
export class DatabaseModule {}
```

### useFactory with Environment-Based Selection

```typescript
// logger/logger.providers.ts
export const loggerProviders = [
  {
    provide: 'LOGGER',
    useFactory: () => {
      const env = process.env.NODE_ENV || 'development';
      
      if (env === 'production') {
        return new ProductionLogger(); // Writes to file
      } else if (env === 'test') {
        return new MockLogger(); // No output
      } else {
        return new ConsoleLoggerService(); // Console output
      }
    },
  },
];
```

### Custom Token Constants

For better maintainability, define tokens as constants:

```typescript
// constants/injection-tokens.ts
export const INJECTION_TOKENS = {
  APP_NAME: 'APP_NAME',
  LOGGER: 'Logger',
  APP_LOGGER: 'AppLogger',
  TASKS_REPO: 'TASKS_REPO',
  DATABASE_CONNECTION: 'DATABASE_CONNECTION',
} as const;

// Usage in module
import { INJECTION_TOKENS } from './constants/injection-tokens';

@Module({
  providers: [
    {
      provide: INJECTION_TOKENS.APP_NAME,
      useValue: 'Task Management System',
    },
    {
      provide: INJECTION_TOKENS.LOGGER,
      useClass: ConsoleLoggerService,
    },
  ],
})
export class TasksModule {}

// Usage in service
constructor(
  @Inject(INJECTION_TOKENS.APP_NAME) private readonly appName: string,
  @Inject(INJECTION_TOKENS.LOGGER) private readonly logger: ConsoleLoggerService,
) {}
```

### Symbol Tokens

For even better type safety, use Symbol tokens:

```typescript
// constants/injection-tokens.ts
export const LOGGER_TOKEN = Symbol('LOGGER');
export const REPO_TOKEN = Symbol('REPOSITORY');

// Module
@Module({
  providers: [
    {
      provide: LOGGER_TOKEN,
      useClass: ConsoleLoggerService,
    },
  ],
})
export class AppModule {}

// Service
constructor(
  @Inject(LOGGER_TOKEN) private logger: ConsoleLoggerService,
) {}
```

## Complete Working Example Summary

The example demonstrates:

1. **useValue**: `'APP_NAME'` provides a static string constant
2. **useClass**: `'Logger'` provides ConsoleLoggerService, allowing direct injection as `ConsoleLoggerService` type
3. **useFactory**: `'TASKS_REPO'` creates InMemoryTasksRepository dynamically
4. **useExisting**: `'AppLogger'` is an alias for `'Logger'`, both resolve to the same instance

The service injects:
- `@Inject('APP_NAME')` as `string`
- `@Inject('Logger')` as `ConsoleLoggerService` (direct class injection via token)
- `@Inject('TASKS_REPO')` as `InMemoryTasksRepository`

The controller injects:
- `@Inject('AppLogger')` as `ConsoleLoggerService` (same instance as 'Logger')

This simple example clearly shows all four custom provider types in action!

## Running the Example

```bash
# Start the application
npm run start:dev

# Watch the console logs to see:
# - Factory creation message
# - Service initialization with APP_NAME
# - Controller initialization
# - Logger messages from both service and controller

# Test the endpoints
curl http://localhost:3000/tasks
curl http://localhost:3000/tasks/app-info
```

You'll see the logger working throughout the application, proving that the custom providers are correctly configured and injected!
