# Session 04: Summary

## Key Takeaways

### Request Lifecycle Order

```
1. Middleware          → Request preprocessing
2. Guards              → Authorization checks
3. Interceptors (pre)  → Before handler
4. Pipes              → Validation/transformation
5. Controller Handler  → Business logic
6. Interceptors (post) → After handler
7. Exception Filters   → Error handling
```

### Middleware

**Purpose**: Request preprocessing, logging, CORS

```typescript
@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    console.log(`${req.method} ${req.url}`);
    next();
  }
}

// Apply in module
configure(consumer: MiddlewareConsumer) {
  consumer.apply(LoggerMiddleware).forRoutes('*');
}
```

### Guards

**Purpose**: Authentication, authorization

```typescript
@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    return this.validateRequest(request);
  }
}

// Usage
@UseGuards(AuthGuard)
@Get()
findAll() {}
```

### Interceptors

**Purpose**: Transform response, logging, caching

```typescript
@Injectable()
export class TransformInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler) {
    return next.handle().pipe(
      map(data => ({
        success: true,
        data,
        timestamp: new Date().toISOString(),
      })),
    );
  }
}

// Usage
@UseInterceptors(TransformInterceptor)
```

### Exception Filters

**Purpose**: Centralized error handling

```typescript
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const status = exception.getStatus();
    
    response.status(status).json({
      statusCode: status,
      message: exception.message,
      timestamp: new Date().toISOString(),
    });
  }
}

// Usage
@UseFilters(HttpExceptionFilter)
```

## When to Use Each

| Component | Use Case | Examples |
|-----------|----------|----------|
| Middleware | Request/Response processing | Logging, CORS, Auth |
| Guards | Authorization | Role checks, API keys |
| Interceptors | Data transformation | Response wrapping, logging |
| Filters | Error handling | Consistent error format |

## Scope Options

All components can be applied at three levels:

```typescript
// Global (main.ts)
app.useGlobalGuards(new AuthGuard());
app.useGlobalInterceptors(new LoggingInterceptor());
app.useGlobalFilters(new HttpExceptionFilter());

// Controller level
@Controller('tasks')
@UseGuards(AuthGuard)
@UseInterceptors(LoggingInterceptor)
export class TasksController {}

// Method level
@Get()
@UseGuards(AuthGuard)
findAll() {}
```

## Best Practices

1. **Keep components focused** - Single responsibility
2. **Use appropriate scope** - Global vs local
3. **Order matters** - Understand execution order
4. **Handle errors gracefully** - Filters for consistency
5. **Log important events** - Middleware and interceptors
6. **Validate early** - Guards and pipes

## Common Patterns

### Authentication Pipeline
```typescript
Middleware (extract token) 
  → Guard (validate token) 
  → Handler
```

### Response Transformation
```typescript
Handler 
  → Interceptor (transform) 
  → Client
```

### Error Handling
```typescript
Any layer 
  → Exception 
  → Filter (format) 
  → Client
```

## What We Learned

✅ Request lifecycle and execution order  
✅ Middleware for preprocessing  
✅ Guards for authorization  
✅ Interceptors for transformation  
✅ Exception filters for error handling  
✅ Combining components  
✅ Best practices  

## Next Session Preview

In Session 05, we'll explore:
- Database integration with TypeORM
- Defining entities and relationships
- Repository pattern for data access
- CRUD operations with database
- Database migrations
- Best practices for database design

## Resources

- [NestJS Middleware](https://docs.nestjs.com/middleware)
- [NestJS Guards](https://docs.nestjs.com/guards)
- [NestJS Interceptors](https://docs.nestjs.com/interceptors)
- [NestJS Exception Filters](https://docs.nestjs.com/exception-filters)
- [NestJS Request Lifecycle](https://docs.nestjs.com/faq/request-lifecycle)

## Practice Exercises

1. Create a request logging system with middleware and interceptors
2. Implement role-based access control with guards
3. Build a response caching interceptor
4. Create custom exception filters for different error types
5. Combine all components in a complete authentication pipeline

## Review Questions

1. What is the execution order of the request lifecycle?
2. When would you use middleware vs guards?
3. How do interceptors differ from middleware?
4. What's the purpose of exception filters?
5. Can guards modify the response? Why or why not?
6. How do you apply components globally?
7. What's the difference between @Catch() and @Catch(HttpException)?
8. Can you have multiple guards on one endpoint?
