# Session 01: Summary

## Key Takeaways

### What is NestJS?
- Progressive Node.js framework for building server-side applications
- Built with TypeScript, supports modern JavaScript
- Combines OOP, FP, and FRP paradigms
- Inspired by Angular architecture
- Production-ready with built-in best practices

### Core Concepts

1. **Controllers**
   - Handle HTTP requests and return responses
   - Define routes using decorators (@Get, @Post, etc.)
   - Keep business logic minimal (delegate to services)

2. **Providers (Services)**
   - Injectable classes marked with @Injectable()
   - Contain business logic
   - Managed by NestJS dependency injection system

3. **Modules**
   - Organize application into cohesive units
   - Every app has at least one root module
   - Use @Module() decorator to define

4. **Dependency Injection**
   - NestJS automatically creates and manages provider instances
   - Inject dependencies through constructor
   - Promotes loose coupling and testability

### Getting Started

```bash
# Install CLI
npm install -g @nestjs/cli

# Create project
nest new project-name

# Start development
npm run start:dev
```

### Project Structure

```
src/
├── main.ts              # Entry point
├── app.module.ts        # Root module
├── app.controller.ts    # Root controller
└── app.service.ts       # Root service
```

### Essential Commands

```bash
# Generate resources
nest generate module users
nest generate controller users
nest generate service users

# Short form
nest g mo users
nest g co users
nest g s users
```

### First Endpoint Example

```typescript
@Controller('hello')
export class HelloController {
  @Get()
  sayHello(): string {
    return 'Hello, NestJS!';
  }

  @Get(':name')
  greet(@Param('name') name: string): string {
    return `Hello, ${name}!`;
  }
}
```

### Best Practices

1. Use modules to organize your code
2. Keep controllers thin - move logic to services
3. Leverage TypeScript for type safety
4. Follow consistent naming conventions
5. Use dependency injection for loose coupling
6. Write tests for your code

### Common Decorators

- `@Module()` - Define a module
- `@Controller()` - Define a controller
- `@Injectable()` - Mark a class as a provider
- `@Get()`, `@Post()`, `@Put()`, `@Delete()` - HTTP methods
- `@Param()` - Extract route parameters
- `@Query()` - Extract query parameters
- `@Body()` - Extract request body

## What We Learned

✅ NestJS fundamentals and philosophy  
✅ Core architectural building blocks  
✅ Setting up development environment  
✅ Creating your first NestJS application  
✅ Understanding project structure  
✅ Basic routing and controllers  
✅ Dependency injection basics  
✅ CLI commands for scaffolding  

## Next Session Preview

In Session 02, we'll explore:
- Advanced controller concepts
- Data Transfer Objects (DTOs)
- Request validation with class-validator
- Pipes for data transformation
- Working with different HTTP methods
- Handling request data (params, query, body)

## Resources

- [NestJS Documentation](https://docs.nestjs.com/)
- [NestJS CLI Documentation](https://docs.nestjs.com/cli/overview)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [NestJS GitHub](https://github.com/nestjs/nest)
- [NestJS Discord](https://discord.gg/nestjs)

## Practice Exercises

1. Create a new NestJS project
2. Generate a `books` module with controller and service
3. Implement CRUD endpoints for books
4. Test all endpoints using Postman or cURL
5. Experiment with different HTTP methods
6. Add error handling for non-existent resources

## Questions for Review

1. What are the three main building blocks of a NestJS application?
2. What is the purpose of the @Injectable() decorator?
3. How does dependency injection work in NestJS?
4. What's the difference between a controller and a service?
5. What command would you use to generate a new controller?
6. Why is TypeScript important in NestJS?
