# Session 03: Summary

## Key Takeaways

### Services
- Contain business logic and data operations
- Marked with `@Injectable()` decorator
- Injected into controllers and other services
- Promote code reusability and testability

```typescript
@Injectable()
export class TasksService {
  findAll() {
    // Business logic here
  }
}
```

### Dependency Injection

**How it works:**
1. Mark class with `@Injectable()`
2. Add to module's `providers` array
3. Inject via constructor
4. NestJS creates and manages instances

```typescript
// Service
@Injectable()
export class TasksService {}

// Module
@Module({
  providers: [TasksService],
})

// Controller
constructor(private tasksService: TasksService) {}
```

### Custom Providers

Four types of custom providers:

#### 1. useValue - Static Values
```typescript
{
  provide: 'APP_NAME',
  useValue: 'My Application',
}

// Injection
constructor(@Inject('APP_NAME') private appName: string) {}
```

#### 2. useClass - Alternative Implementations
```typescript
{
  provide: 'Logger',
  useClass: ConsoleLoggerService,
}

// Direct injection as the class type
constructor(
  @Inject('Logger') private logger: ConsoleLoggerService
) {}
```

#### 3. useFactory - Dynamic Creation
```typescript
{
  provide: 'TASKS_REPO',
  useFactory: () => {
    return new InMemoryTasksRepository();
  },
}

// With dependencies
{
  provide: 'DB_CONNECTION',
  useFactory: async (config: ConfigService) => {
    return await createConnection(config.get('DB_URL'));
  },
  inject: [ConfigService],
}
```

#### 4. useExisting - Aliases
```typescript
{
  provide: 'AppLogger',
  useExisting: 'Logger',
}

// Both resolve to same instance
constructor(
  @Inject('Logger') private logger: ConsoleLoggerService,
  @Inject('AppLogger') private appLogger: ConsoleLoggerService,
) {
  // logger === appLogger (same instance)
}
```

### The @Inject Decorator

Required when using custom tokens:

```typescript
// Class token - no @Inject needed
constructor(private service: MyService) {}

// String token - @Inject required
constructor(@Inject('TOKEN') private value: any) {}

// Symbol token - @Inject required
constructor(@Inject(MY_TOKEN) private value: any) {}
```

### Modules

Organize application into features:

```typescript
@Module({
  imports: [OtherModule],      // Import modules
  controllers: [TasksController], // Route handlers
  providers: [TasksService],      // Services
  exports: [TasksService],        // Share with other modules
})
export class TasksModule {}
```

**Module types:**
- **Feature Modules**: Organize by feature (tasks, users, etc.)
- **Shared Modules**: Common utilities
- **Global Modules**: Available everywhere (`@Global()`)
- **Dynamic Modules**: Configured at runtime

### Provider Scopes

Three lifecycle scopes:

1. **DEFAULT (Singleton)**: One instance for entire app (default)
2. **REQUEST**: New instance per HTTP request
3. **TRANSIENT**: New instance per injection

```typescript
@Injectable({ scope: Scope.REQUEST })
export class RequestScopedService {}
```

## What We Learned

✅ Services for business logic separation  
✅ Dependency Injection fundamentals  
✅ Custom Providers:
  - useValue for constants
  - useClass for implementations (with direct type injection)
  - useFactory for dynamic creation
  - useExisting for aliases  
✅ @Inject decorator for custom tokens  
✅ Module organization patterns  
✅ Provider scopes and lifecycle  
✅ Best practices for DI and modules  

## Custom Provider Use Cases

| Type | Use Case | Example |
|------|----------|---------|
| useValue | Constants, config, mocks | APP_NAME, feature flags |
| useClass | Swap implementations | Different loggers by env |
| useFactory | Complex creation, async | Database connections |
| useExisting | Aliases, compatibility | Multiple names for same service |

## Best Practices

### Service Design
1. Single Responsibility Principle
2. Inject dependencies, don't create them
3. Keep services testable
4. Use interfaces for contracts

### Module Organization
1. One module per feature
2. Export only what's needed
3. Use barrel exports (index.ts)
4. Keep modules focused

### Provider Configuration
1. Use string constants for tokens
2. Type your injections
3. Document custom providers
4. Prefer useClass for flexibility

### Code Organization
```
feature/
├── dto/
├── entities/
├── interfaces/
├── feature.controller.ts
├── feature.service.ts
├── feature.module.ts
└── index.ts (barrel export)
```

## Common Patterns

### Repository Pattern
```typescript
// Interface
interface ITasksRepository {
  findAll(): Task[];
  findOne(id: number): Task;
}

// Implementation
class InMemoryTasksRepository implements ITasksRepository {}

// Provider
{
  provide: 'TASKS_REPO',
  useClass: InMemoryTasksRepository,
}

// Injection
constructor(
  @Inject('TASKS_REPO') private repo: ITasksRepository
) {}
```

### Service Layer Pattern
```
Controller -> Service -> Repository -> Database
```

### Token Constants
```typescript
export const TOKENS = {
  CONFIG: 'CONFIG',
  LOGGER: 'LOGGER',
  DATABASE: 'DATABASE',
} as const;
```

## Dependency Injection Benefits

1. **Loose Coupling**: Classes don't know how dependencies are created
2. **Testability**: Easy to mock dependencies in tests
3. **Flexibility**: Swap implementations without changing code
4. **Maintainability**: Changes are localized
5. **Lifecycle Management**: Framework handles creation/destruction

## Next Session Preview

In Session 04, we'll explore the NestJS request lifecycle:
- Middleware for request preprocessing
- Guards for authentication/authorization checks
- Interceptors for response transformation and logging
- Exception Filters for centralized error handling
- Pipes for validation and transformation (revisited)
- Understanding execution order
- Building a complete request processing pipeline

## Resources

- [NestJS Providers](https://docs.nestjs.com/providers)
- [NestJS Custom Providers](https://docs.nestjs.com/fundamentals/custom-providers)
- [NestJS Modules](https://docs.nestjs.com/modules)
- [NestJS Injection Scopes](https://docs.nestjs.com/fundamentals/injection-scopes)
- [Dependency Injection Pattern](https://en.wikipedia.org/wiki/Dependency_injection)

## Practice Exercises

1. **Create a Logger Module**:
   - Implement different logger classes (Console, File, Remote)
   - Use useFactory to select based on environment
   - Create aliases with useExisting
   - Test in multiple services

2. **Build a Repository Layer**:
   - Define repository interface
   - Implement InMemory and Mock versions
   - Use useClass to swap implementations
   - Inject into service

3. **Configuration Service**:
   - Create ConfigService with useFactory
   - Load from environment variables
   - Inject ConfigService into other services
   - Validate configuration on startup

## Review Questions

1. What's the purpose of the @Injectable() decorator?
2. How does NestJS know which dependencies to inject?
3. When would you use useFactory instead of useClass?
4. What's the difference between useClass and useExisting?
5. Why do we need @Inject() for custom tokens?
6. What are the three provider scopes?
7. How do you make a provider available to other modules?
8. What's the purpose of the exports array in @Module()?
9. Can useExisting create a new instance? Why or why not?
10. When injecting via a token with useClass, what type can you specify?
