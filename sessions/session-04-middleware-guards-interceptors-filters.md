# Session 04: Middleware, Guards, Interceptors, and Filters

## Overview
This session explores the NestJS request lifecycle and the powerful mechanisms available for processing requests and responses. We'll learn how to use middleware, guards, interceptors, and exception filters to build robust, maintainable applications.

## Learning Objectives
By the end of this session, you will be able to:
- Understand the complete NestJS request lifecycle
- Implement middleware for request preprocessing
- Create guards for authentication and authorization
- Use interceptors for response transformation and logging
- Handle errors with exception filters
- Understand the execution order of each component
- Build a complete request processing pipeline

## Request Lifecycle

Understanding the order in which NestJS processes requests is crucial:

```
Incoming Request
    ↓
1. Middleware
    ↓
2. Guards
    ↓
3. Interceptors (before)
    ↓
4. Pipes
    ↓
5. Controller Handler
    ↓
6. Service
    ↓
7. Interceptors (after)
    ↓
8. Exception Filters (if error)
    ↓
Outgoing Response
```

Each layer can:
- Transform the request/response
- Short-circuit the pipeline (stop execution)
- Add functionality (logging, caching, etc.)

## Middleware

Middleware functions execute before the route handler. They have access to the request and response objects and can:
- Execute code
- Make changes to request/response
- End the request-response cycle
- Call the next middleware

### Creating Middleware

```typescript
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
  }
}
```

### Applying Middleware

```typescript
import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';

@Module({
  // ...
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware)
      .forRoutes('*'); // Apply to all routes
  }
}
```

### Middleware for Specific Routes

```typescript
configure(consumer: MiddlewareConsumer) {
  consumer
    .apply(LoggerMiddleware)
    .forRoutes('tasks'); // Only /tasks routes
    
  // Multiple routes
  consumer
    .apply(AuthMiddleware)
    .forRoutes('tasks', 'users');
    
  // Exclude specific routes
  consumer
    .apply(AuthMiddleware)
    .exclude(
      { path: 'auth/login', method: RequestMethod.POST },
      { path: 'auth/register', method: RequestMethod.POST },
    )
    .forRoutes('*');
}
```

### Functional Middleware

```typescript
export function logger(req: Request, res: Response, next: NextFunction) {
  console.log(`Request...`);
  next();
}

// Apply
consumer.apply(logger).forRoutes('*');
```

## Guards

Guards determine whether a request should be handled by the route handler. They're executed after middleware but before interceptors and pipes.

### Creating a Guard

```typescript
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const token = request.headers.authorization;
    
    if (!token) {
      return false;
    }
    
    return this.validateToken(token);
  }
  
  private validateToken(token: string): boolean {
    // Token validation logic
    return token === 'valid-token';
  }
}
```

### Using Guards

```typescript
// Global guard
app.useGlobalGuards(new AuthGuard());

// Controller level
@Controller('tasks')
@UseGuards(AuthGuard)
export class TasksController {}

// Method level
@Get()
@UseGuards(AuthGuard)
findAll() {}
```

### Role-Based Guard

```typescript
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.get<string[]>('roles', context.getHandler());
    
    if (!roles) {
      return true;
    }
    
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    
    return roles.some(role => user?.roles?.includes(role));
  }
}

// Custom decorator
export const Roles = (...roles: string[]) => SetMetadata('roles', roles);

// Usage
@Get('admin')
@Roles('admin')
@UseGuards(RolesGuard)
adminOnly() {}
```

## Interceptors

Interceptors can transform the result returned from a function or extend the basic function behavior.

### Creating an Interceptor

```typescript
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const now = Date.now();
    const request = context.switchToHttp().getRequest();
    
    return next
      .handle()
      .pipe(
        tap(() => {
          const duration = Date.now() - now;
          console.log(`${request.method} ${request.url} - ${duration}ms`);
        }),
      );
  }
}
```

### Response Transformation

```typescript
import { map } from 'rxjs/operators';

@Injectable()
export class TransformInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map(data => ({
        success: true,
        timestamp: new Date().toISOString(),
        data,
      })),
    );
  }
}
```

### Using Interceptors

```typescript
// Global
app.useGlobalInterceptors(new LoggingInterceptor());

// Controller level
@Controller('tasks')
@UseInterceptors(LoggingInterceptor)
export class TasksController {}

// Method level
@Get()
@UseInterceptors(TransformInterceptor)
findAll() {}
```

### Timeout Interceptor

```typescript
import { timeout } from 'rxjs/operators';

@Injectable()
export class TimeoutInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(timeout(5000)); // 5 second timeout
  }
}
```

## Exception Filters

Exception filters handle exceptions thrown during request processing.

### Creating an Exception Filter

```typescript
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';

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

### Catch All Exceptions

```typescript
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.message
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

### Using Exception Filters

```typescript
// Global
app.useGlobalFilters(new HttpExceptionFilter());

// Controller level
@Controller('tasks')
@UseFilters(HttpExceptionFilter)
export class TasksController {}

// Method level
@Get()
@UseFilters(HttpExceptionFilter)
findAll() {}
```

## Combining Everything

Example of a complete request processing pipeline:

```typescript
// Middleware
@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    console.log('1. Middleware: Request logged');
    next();
  }
}

// Guard
@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    console.log('2. Guard: Checking authentication');
    return true;
  }
}

// Interceptor
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    console.log('3. Interceptor: Before handler');
    return next.handle().pipe(
      tap(() => console.log('5. Interceptor: After handler')),
    );
  }
}

// Controller
@Controller('tasks')
@UseGuards(AuthGuard)
@UseInterceptors(LoggingInterceptor)
@UseFilters(HttpExceptionFilter)
export class TasksController {
  @Get()
  findAll() {
    console.log('4. Handler: Processing request');
    return [];
  }
}
```

Output:
```
1. Middleware: Request logged
2. Guard: Checking authentication
3. Interceptor: Before handler
4. Handler: Processing request
5. Interceptor: After handler
```

## Best Practices

1. **Middleware**: Use for request logging, CORS, body parsing
2. **Guards**: Use for authentication and authorization
3. **Interceptors**: Use for response transformation, logging, caching
4. **Filters**: Use for centralized error handling
5. **Keep them focused**: Each component should have one responsibility
6. **Order matters**: Understand the execution order
7. **Global vs Local**: Choose the appropriate scope

## Summary

In this session, we covered:
- The NestJS request lifecycle and execution order
- Middleware for request preprocessing
- Guards for authentication/authorization
- Interceptors for transformation and logging
- Exception Filters for error handling
- Combining all components in a pipeline
- Best practices for each component

## Next Session Preview

In Session 05, we'll explore:
- Database integration with TypeORM
- Defining entities and relationships
- Repository pattern
- CRUD operations with database
- Migrations
- Best practices for database design
