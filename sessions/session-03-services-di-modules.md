# Session 03: Services, Dependency Injection, and Modules

## Overview
This session explores the service layer, dependency injection, and module organization in NestJS. We'll learn how to structure business logic, understand NestJS's powerful dependency injection system, and master custom providers including useValue, useClass, useFactory, and useExisting.

## Learning Objectives
By the end of this session, you will be able to:
- Separate business logic into services
- Understand dependency injection fundamentals
- Create and use custom providers (useValue, useClass, useFactory, useExisting)
- Inject providers using custom tokens with @Inject
- Organize applications with modules
- Understand provider scopes and lifecycle
- Apply best practices for code organization

## Services and Business Logic

### What are Services?

Services are classes that contain business logic and can be injected into controllers or other services. They follow the Single Responsibility Principle and make code more maintainable and testable.

### Creating a Service

```typescript
import { Injectable } from '@nestjs/common';

@Injectable()
export class TasksService {
  private tasks = [];

  findAll() {
    return this.tasks;
  }

  create(task: any) {
    this.tasks.push(task);
    return task;
  }
}
```

The `@Injectable()` decorator marks the class as a provider that can be managed by the NestJS dependency injection system.

### Why Separate Business Logic?

1. **Reusability**: Services can be used by multiple controllers
2. **Testability**: Easier to test business logic in isolation
3. **Maintainability**: Changes to logic don't affect routing
4. **Single Responsibility**: Controllers handle HTTP, services handle logic

## Dependency Injection

### What is Dependency Injection?

Dependency Injection (DI) is a design pattern where a class receives its dependencies from external sources rather than creating them itself. NestJS has a built-in IoC (Inversion of Control) container that manages this for you.

### How It Works

```typescript
// Service
@Injectable()
export class TasksService {
  findAll() {
    return [];
  }
}

// Controller
@Controller('tasks')
export class TasksController {
  constructor(private tasksService: TasksService) {}
  
  @Get()
  findAll() {
    return this.tasksService.findAll();
  }
}

// Module
@Module({
  controllers: [TasksController],
  providers: [TasksService],
})
export class TasksModule {}
```

NestJS automatically:
1. Creates an instance of `TasksService`
2. Injects it into `TasksController`
3. Manages the lifecycle (singleton by default)

### Benefits of DI

- **Loose Coupling**: Classes don't create their dependencies
- **Easy Testing**: Mock dependencies in tests
- **Flexibility**: Swap implementations easily
- **Lifecycle Management**: Framework handles object creation and destruction

## Custom Providers

NestJS provides several ways to create providers beyond simple classes. Custom providers give you fine-grained control over how dependencies are created and injected.

### Provider Syntax

The standard syntax:
```typescript
providers: [TasksService]
```

Is shorthand for:
```typescript
providers: [
  {
    provide: TasksService,
    useClass: TasksService,
  }
]
```

### useValue - Static Values

Use `useValue` to provide constants, configuration, or mock implementations.

```typescript
const appNameProvider = {
  provide: 'APP_NAME',
  useValue: 'Task Management System',
};

@Module({
  providers: [appNameProvider],
})
export class AppModule {}
```

**Injection:**
```typescript
constructor(@Inject('APP_NAME') private appName: string) {
  console.log(this.appName); // 'Task Management System'
}
```

**Use Cases:**
- Configuration constants
- Feature flags
- Static data
- Mock objects in testing

### useClass - Alternative Implementations

Use `useClass` to provide a class implementation for a token. This allows you to inject the actual class type when using a custom token.

```typescript
@Injectable()
export class ConsoleLoggerService {
  log(message: string) {
    console.log(`[LOG]: ${message}`);
  }
  
  error(message: string) {
    console.error(`[ERROR]: ${message}`);
  }
}

const loggerProvider = {
  provide: 'Logger',
  useClass: ConsoleLoggerService,
};

@Module({
  providers: [loggerProvider],
})
export class AppModule {}
```

**Direct Injection with Type:**
```typescript
// You can inject the specific class type
constructor(
  @Inject('Logger') private logger: ConsoleLoggerService
) {
  this.logger.log('Service initialized');
}
```

**Use Cases:**
- Swapping implementations based on environment
- Providing alternative implementations
- Interface-based programming
- Strategy pattern

### useFactory - Dynamic Creation

Use `useFactory` to create providers dynamically at runtime.

```typescript
const tasksRepoProvider = {
  provide: 'TASKS_REPO',
  useFactory: () => {
    const isProd = process.env.NODE_ENV === 'production';
    return isProd 
      ? new DatabaseTasksRepository() 
      : new InMemoryTasksRepository();
  },
};
```

**With Dependencies:**
```typescript
const dbConnectionProvider = {
  provide: 'DB_CONNECTION',
  useFactory: async (config: ConfigService) => {
    const dbUrl = config.get('DATABASE_URL');
    return await createConnection(dbUrl);
  },
  inject: [ConfigService],
};
```

**Use Cases:**
- Conditional provider creation
- Async initialization
- Complex object creation
- Dependency-based configuration

### useExisting - Aliases

Use `useExisting` to create an alias for an existing provider. Both tokens will resolve to the same instance.

```typescript
const appLoggerProvider = {
  provide: 'AppLogger',
  useExisting: 'Logger',
};

@Module({
  providers: [
    { provide: 'Logger', useClass: ConsoleLoggerService },
    { provide: 'AppLogger', useExisting: 'Logger' },
  ],
})
export class AppModule {}
```

**Both injections get the same instance:**
```typescript
constructor(
  @Inject('Logger') private logger: ConsoleLoggerService,
  @Inject('AppLogger') private appLogger: ConsoleLoggerService,
) {
  // logger === appLogger (same instance)
}
```

**Use Cases:**
- Creating aliases for better naming
- Backward compatibility
- Sharing singletons across different tokens
- Interface segregation

## The @Inject Decorator

When using custom tokens (strings or symbols), you must use the `@Inject()` decorator:

```typescript
// Without custom token (direct class injection)
constructor(private tasksService: TasksService) {}

// With custom token (string)
constructor(@Inject('APP_NAME') private appName: string) {}

// With custom token (symbol)
const LOGGER = Symbol('LOGGER');
constructor(@Inject(LOGGER) private logger: LoggerService) {}

// With custom token, typed as the class
constructor(
  @Inject('Logger') private logger: ConsoleLoggerService
) {}
```

## Modules

Modules organize your application into cohesive blocks of functionality.

### Module Structure

```typescript
@Module({
  imports: [OtherModule],        // Import other modules
  controllers: [TasksController], // HTTP route handlers
  providers: [TasksService],      // Injectable providers
  exports: [TasksService],        // Make available to other modules
})
export class TasksModule {}
```

### Module Properties

- **imports**: Other modules whose exports you need
- **controllers**: Controllers defined in this module
- **providers**: Providers instantiated by this module
- **exports**: Providers that should be available to other modules

### Feature Modules

Organize code by feature:

```
tasks/
├── dto/
│   ├── create-task.dto.ts
│   └── update-task.dto.ts
├── entities/
│   └── task.entity.ts
├── tasks.controller.ts
├── tasks.service.ts
└── tasks.module.ts
```

### Shared Modules

Create shared modules for common functionality:

```typescript
@Module({
  providers: [LoggerService, ConfigService],
  exports: [LoggerService, ConfigService],
})
export class SharedModule {}

// Use in other modules
@Module({
  imports: [SharedModule],
  // Now LoggerService and ConfigService are available
})
export class TasksModule {}
```

### Global Modules

Make a module globally available:

```typescript
@Global()
@Module({
  providers: [ConfigService],
  exports: [ConfigService],
})
export class ConfigModule {}
```

Now `ConfigService` is available everywhere without importing the module.

## Provider Scopes

NestJS providers have three scopes:

### DEFAULT (Singleton)

One instance shared across the entire application (default behavior).

```typescript
@Injectable()
export class TasksService {
  // Same instance for all consumers
}
```

### REQUEST

New instance created for each request.

```typescript
@Injectable({ scope: Scope.REQUEST })
export class RequestScopedService {
  // New instance per HTTP request
}
```

Use when you need request-specific data.

### TRANSIENT

New instance created each time it's injected.

```typescript
@Injectable({ scope: Scope.TRANSIENT })
export class TransientService {
  // New instance for each injection
}
```

## Best Practices

### Service Organization

1. **Single Responsibility**: Each service should have one clear purpose
2. **Dependency Injection**: Inject dependencies, don't create them
3. **Interface Segregation**: Keep interfaces small and focused
4. **Avoid Circular Dependencies**: Restructure if needed

### Module Organization

1. **Feature Modules**: One module per feature
2. **Shared Module**: For common utilities
3. **Core Module**: For singleton services (config, auth)
4. **Barrel Exports**: Use index.ts for clean imports

```typescript
// users/index.ts
export * from './users.service';
export * from './users.controller';
export * from './users.module';
export * from './dto';

// Import from other modules
import { UsersService } from './users';
```

### Provider Best Practices

1. **Use String Tokens Consistently**: Define constants for tokens
2. **Type Your Injections**: Always specify the type
3. **Document Custom Providers**: Explain why they exist
4. **Prefer useClass**: More flexible than useValue
5. **Use Factories for Complexity**: When creation logic is complex

## Summary

In this session, we covered:
- Services for business logic separation
- Dependency Injection fundamentals
- Custom Providers:
  - useValue for static values
  - useClass for implementations
  - useFactory for dynamic creation
  - useExisting for aliases
- Direct injection with @Inject decorator
- Module organization and structure
- Provider scopes (Singleton, Request, Transient)
- Best practices for services and modules

## Next Session Preview

In Session 04, we'll explore:
- Request lifecycle in NestJS
- Middleware for request preprocessing
- Guards for authentication/authorization
- Interceptors for response transformation
- Exception Filters for error handling
- Practical examples and use cases
