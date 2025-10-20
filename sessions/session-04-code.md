# Session 04 – โค้ดทำตาม (Middleware/Guards/Interceptors/Filters)

Middleware
```bash
nest g middleware common/logger
```

```ts
// src/common/logger.middleware.ts
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, _res: Response, next: NextFunction) {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
    next();
  }
}
```

ผูก Middleware
```ts
// src/app.module.ts
import { Module, MiddlewareConsumer } from '@nestjs/common';
import { TasksModule } from './tasks/tasks.module';
import { LoggerMiddleware } from './common/logger.middleware';

@Module({ imports: [TasksModule] })
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
```

Guard (mock)
```bash
nest g guard auth
```

```ts
// src/auth/auth.guard.ts
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(ctx: ExecutionContext): boolean {
    const req = ctx.switchToHttp().getRequest();
    // mock เงื่อนไข
    return req.headers['x-demo-auth'] === 'allow';
  }
}
```

ใช้งานที่ Controller ระดับ route
```ts
// src/tasks/tasks.controller.ts (ตัวอย่าง)
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';

@UseGuards(AuthGuard)
@Post()
create(@Body() dto: CreateTaskDto) {
  return this.tasksService.create(dto);
}
```

Interceptor (Logging + Transform)
```bash
nest g interceptor common/logging
```

```ts
// src/common/logging.interceptor.ts
import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable, tap } from 'rxjs';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(_ctx: ExecutionContext, next: CallHandler): Observable<any> {
    const start = Date.now();
    return next.handle().pipe(tap(() => console.log(`Handled in ${Date.now() - start}ms`)));
  }
}
```

Global interceptor
```ts
// src/main.ts
import { LoggingInterceptor } from './common/logging.interceptor';
app.useGlobalInterceptors(new LoggingInterceptor());
```

Exception Filter
```bash
nest g filter common/http-exception
```

```ts
// src/common/http-exception.filter.ts
import { ArgumentsHost, Catch, ExceptionFilter, HttpException } from '@nestjs/common';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse();
    const req = ctx.getRequest();
    const status = exception.getStatus();
    const response = exception.getResponse();

    res.status(status).json({
      statusCode: status,
      path: req.url,
      error: typeof response === 'string' ? response : (response as any).message,
      timestamp: new Date().toISOString(),
    });
  }
}
```

Global filter
```ts
// src/main.ts
import { HttpExceptionFilter } from './common/http-exception.filter';
app.useGlobalFilters(new HttpExceptionFilter());
```