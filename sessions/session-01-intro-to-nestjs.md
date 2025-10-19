# Session 01: Introduction to NestJS

## Overview
This session introduces NestJS, a progressive Node.js framework for building efficient and scalable server-side applications. We'll explore the core concepts, set up a development environment, and create our first NestJS application.

## Learning Objectives
By the end of this session, you will be able to:
- Understand what NestJS is and its key benefits
- Explain the core architecture and design principles
- Set up a NestJS development environment
- Create and run a basic NestJS application
- Navigate the project structure
- Create simple endpoints using controllers

## What is NestJS?

NestJS is a framework for building efficient, scalable Node.js server-side applications. It uses progressive JavaScript, is built with and fully supports TypeScript, and combines elements of Object-Oriented Programming (OOP), Functional Programming (FP), and Functional Reactive Programming (FRP).

### Key Features
- **TypeScript First**: Built with TypeScript, providing strong typing and modern JavaScript features
- **Modular Architecture**: Organize your application into reusable modules
- **Dependency Injection**: Built-in IoC (Inversion of Control) container
- **Decorators**: Extensive use of TypeScript decorators for clean, declarative code
- **CLI Tools**: Powerful command-line interface for scaffolding and development
- **Testing Support**: First-class testing utilities out of the box
- **Platform Agnostic**: Works with Express (default) or Fastify

### Why Choose NestJS?

1. **Enterprise-Ready**: Built with best practices and design patterns
2. **Scalable**: Modular architecture supports growing applications
3. **Developer Experience**: Excellent tooling and documentation
4. **TypeScript**: Type safety reduces bugs and improves maintainability
5. **Familiar Patterns**: If you know Angular, you'll feel at home
6. **Active Community**: Large ecosystem and regular updates

## Core Concepts

### Architecture Overview

NestJS applications are organized around several key building blocks:

#### 1. Controllers
Controllers handle incoming HTTP requests and return responses to the client. They define the routes and HTTP methods for your API endpoints.

```typescript
@Controller('users')
export class UsersController {
  @Get()
  findAll() {
    return 'This returns all users';
  }
}
```

#### 2. Providers (Services)
Providers contain business logic and can be injected into controllers or other providers. They're the heart of your application's functionality.

```typescript
@Injectable()
export class UsersService {
  findAll() {
    // Business logic here
    return [];
  }
}
```

#### 3. Modules
Modules organize your application into cohesive blocks of functionality. Every application has at least one root module.

```typescript
@Module({
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
```

#### 4. Decorators
Decorators are special functions that add metadata to classes, methods, or properties. NestJS uses decorators extensively for configuration.

Common decorators:
- `@Module()` - Define a module
- `@Controller()` - Define a controller
- `@Injectable()` - Mark a class as injectable
- `@Get()`, `@Post()`, `@Put()`, `@Delete()` - HTTP method decorators

### Dependency Injection

NestJS has a built-in dependency injection system that manages the creation and lifecycle of providers. This makes code more testable and maintainable.

```typescript
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}
  
  @Get()
  findAll() {
    return this.usersService.findAll();
  }
}
```

The `UsersService` is automatically injected by NestJS - you don't need to manually create instances.

## Setting Up Your Environment

### Prerequisites
- Node.js (v16 or higher recommended)
- npm or yarn package manager
- A code editor (VS Code recommended)
- Basic TypeScript knowledge

### Installing NestJS CLI

The NestJS CLI is a powerful tool for creating and managing NestJS projects.

```bash
# Install NestJS CLI globally
npm install -g @nestjs/cli

# Verify installation
nest --version
```

### Creating Your First Project

```bash
# Create a new project
nest new my-first-app

# Navigate to project directory
cd my-first-app

# Start development server
npm run start:dev
```

The `start:dev` command starts the application in watch mode, automatically reloading when you make changes.

## Project Structure

Let's explore the files created by the CLI:

```
my-first-app/
├── src/
│   ├── app.controller.ts       # Basic controller
│   ├── app.controller.spec.ts  # Controller tests
│   ├── app.module.ts           # Root module
│   ├── app.service.ts          # Basic service
│   └── main.ts                 # Application entry point
├── test/
│   ├── app.e2e-spec.ts        # E2E tests
│   └── jest-e2e.json          # E2E test config
├── nest-cli.json              # NestJS CLI config
├── package.json               # Dependencies
├── tsconfig.json              # TypeScript config
└── tsconfig.build.json        # Build TypeScript config
```

### Key Files Explained

**main.ts** - Application bootstrap
```typescript
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
}
bootstrap();
```

**app.module.ts** - Root module
```typescript
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

**app.controller.ts** - Basic controller
```typescript
import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
```

**app.service.ts** - Basic service
```typescript
import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }
}
```

## Creating Your First Endpoint

Let's create a simple greeting endpoint:

### Step 1: Update the Controller

```typescript
import { Controller, Get, Param } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('greet/:name')
  greet(@Param('name') name: string): string {
    return this.appService.greet(name);
  }
}
```

### Step 2: Update the Service

```typescript
import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }

  greet(name: string): string {
    return `Hello, ${name}! Welcome to NestJS.`;
  }
}
```

### Step 3: Test Your Endpoint

```bash
# Make sure your app is running
npm run start:dev

# Test in browser or curl
curl http://localhost:3000/greet/John
# Output: Hello, John! Welcome to NestJS.
```

## NestJS CLI Commands

The CLI provides many helpful commands:

```bash
# Generate a controller
nest generate controller users

# Generate a service
nest generate service users

# Generate a module
nest generate module users

# Generate a complete resource (module, controller, service)
nest generate resource users

# Short form
nest g co users    # controller
nest g s users     # service
nest g mo users    # module
nest g res users   # resource
```

## Best Practices

1. **Follow the Module Pattern**: Group related functionality into modules
2. **Keep Controllers Thin**: Move business logic to services
3. **Use DTOs**: Define Data Transfer Objects for type safety
4. **Leverage TypeScript**: Use types and interfaces
5. **Write Tests**: Use the generated test files
6. **Use Environment Variables**: Don't hardcode configuration
7. **Follow Naming Conventions**: Use descriptive, consistent names

## Common Patterns

### Feature Module Pattern
```
users/
├── dto/
│   ├── create-user.dto.ts
│   └── update-user.dto.ts
├── entities/
│   └── user.entity.ts
├── users.controller.ts
├── users.service.ts
└── users.module.ts
```

### Separation of Concerns
- **Controllers**: Routing and request/response handling
- **Services**: Business logic and data manipulation
- **Repositories**: Database access (we'll cover this later)
- **DTOs**: Data validation and transformation

## Troubleshooting

### Common Issues

**Port Already in Use**
```bash
# Change port in main.ts
await app.listen(3001);
```

**Module Not Found**
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

**TypeScript Errors**
- Ensure your tsconfig.json is correctly configured
- Check for proper imports and exports
- Verify decorator usage

## Summary

In this session, we covered:
- What NestJS is and why it's useful
- Core architectural concepts (controllers, providers, modules)
- Setting up a development environment
- Project structure and key files
- Creating basic endpoints
- NestJS CLI commands
- Best practices and common patterns

## Additional Resources

- [Official NestJS Documentation](https://docs.nestjs.com/)
- [NestJS GitHub Repository](https://github.com/nestjs/nest)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [NestJS Discord Community](https://discord.gg/nestjs)

## Next Session Preview

In the next session, we'll dive deeper into:
- Controllers and routing
- Working with DTOs
- Request validation
- Pipes and transformations
- HTTP method handlers
