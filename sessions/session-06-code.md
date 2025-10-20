# Session 06 – โค้ดทำตาม (Auth + Authorization)

ติดตั้งแพ็กเกจ

```bash
npm install @nestjs/jwt
// npm i @nestjs/passport passport passport-local passport-jwt jsonwebtoken bcrypt
// npm i -D @types/passport-local @types/passport-jwt
```

UsersModule (อย่างง่าย)

```bash
nest g module users
nest g service users
```

```ts
// src/users/users.service.ts (mock DB: ภายหลังเชื่อมจริง)
import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

type User = { id: number; username: string; passwordHash: string; roles: string[] };

@Injectable()
export class UsersService {
  private users: User[] = [];
  private idSeq = 1;

  async create(username: string, password: string) {
    const passwordHash = await bcrypt.hash(password, 10);
    const user: User = { id: this.idSeq++, username, passwordHash, roles: ['user'] };
    this.users.push(user);
    return user;
  }

  findByUsername(username: string) {
    return this.users.find(u => u.username === username);
  }

  async validate(username: string, password: string) {
    const user = this.findByUsername(username);
    if (!user) return null;
    const ok = await bcrypt.compare(password, user.passwordHash);
    return ok ? user : null;
  }
}
```

AuthModule

```bash
nest g module auth
nest g service auth
nest g controller auth
nest g guard roles
```

```ts

import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';

@Module({
  imports: [
    UsersModule,
    JwtModule.register({
      global: true,
      secret: 'some-secret',
      signOptions: { expiresIn: '60s' },
    }),
  ],
  providers: [AuthService],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}

```

```ts
// src/auth/auth.service.ts
import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
// import * as jwt from 'jsonwebtoken';

@Injectable()
export class AuthService {
  constructor(private users: UsersService, private jwtService: JwtService) {}

  async signup(username: string, password: string) {
    return this.users.create(username, password);
  }

  async login(user: { id: number; username: string; roles: string[] }) {
    const payload = { sub: user.id, username: user.username, roles: user.roles };
    const token = await this.jwtService.signAsync(payload);
    return { access_token: token };
  }
}
```

Local login

```ts
// src/auth/auth.controller.ts
import { Body, Controller, Post, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';

@Controller('auth')
export class AuthController {
  constructor(private auth: AuthService, private users: UsersService) {}

  @Post('signup')
  async signup(@Body() body: { username: string; password: string }) {
    const user = await this.auth.signup(body.username, body.password);
    return { id: user.id, username: user.username };
  }

  @Post('login')
  async login(@Body() body: { username: string; password: string }) {
    const user = await this.users.validate(body.username, body.password);
    if (!user) throw new UnauthorizedException('invalid credentials');
    return this.auth.login(user);
  }
}
```

Jwt Guard แบบง่าย

```ts

// src/auth/jwt.guard.ts
import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';


@Injectable()
export class JwtGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException();
    }
    try {
      const payload = await this.jwtService.verifyAsync(
        token,
        {
          secret: 'some-secret'
        }
      );
      // 💡 We're assigning the payload to the request object here
      // so that we can access it in our route handlers
      request['user'] = payload;
    } catch {
      throw new UnauthorizedException();
    }
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
```

Roles Decorator + Guard

```ts
// src/auth/roles.decorator.ts
import { SetMetadata } from '@nestjs/common';
export const ROLES_KEY = 'roles';
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
```

```ts
// src/auth/roles.guard.ts
import { CanActivate, ExecutionContext, Injectable, ForbiddenException, Reflector } from '@nestjs/common';
import { ROLES_KEY } from './roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}
  canActivate(ctx: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      ctx.getHandler(),
      ctx.getClass(),
    ]);
    if (!required || required.length === 0) return true;
    const req = ctx.switchToHttp().getRequest();
    const user = req.user as { roles?: string[] };
    if (!user?.roles?.some(r => required.includes(r))) {
      throw new ForbiddenException();
    }
    return true;
  }
}
```

ป้องกันบาง endpoint

```ts
// src/tasks/tasks.controller.ts
import { UseGuards } from '@nestjs/common';
import { JwtGuard } from '../auth/jwt.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';

@UseGuards(JwtGuard, RolesGuard)
@Roles('user')
@Post()
create(@Body() dto: CreateTaskDto) {
  return this.tasksService.create(dto);
}
```

ทดสอบ

- POST /auth/signup
- POST /auth/login -> access_token
- แนบ Authorization: Bearer `<token>` แล้วเรียก POST /tasks
