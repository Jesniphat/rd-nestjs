# Session 02: Summary

## Key Takeaways

### Controllers
- Handle incoming HTTP requests and return responses
- Use decorators to define routes and HTTP methods
- Keep business logic in services, not controllers
- Extract data from request using decorators

### HTTP Methods
```typescript
@Get()      // Read (list or single)
@Post()     // Create
@Put()      // Full update
@Patch()    // Partial update
@Delete()   // Remove
```

### Extracting Request Data

```typescript
@Param('id')           // Route parameters (/users/:id)
@Query('search')       // Query strings (?search=value)
@Body()                // Request body (JSON)
@Headers('auth')       // HTTP headers
```

### Data Transfer Objects (DTOs)

**Benefits:**
- Type safety
- Validation
- Self-documenting code
- Maintainability

**Example:**
```typescript
export class CreateTaskDto {
  title: string;
  description?: string;
  status: string;
}
```

### Validation

**Setup:**
```bash
npm install class-validator class-transformer
```

**Enable globally:**
```typescript
app.useGlobalPipes(new ValidationPipe({
  whitelist: true,
  forbidNonWhitelisted: true,
  transform: true,
}));
```

**Common decorators:**
- `@IsString()` - Must be string
- `@IsEmail()` - Valid email
- `@IsInt()` - Integer
- `@Min(value)` / `@Max(value)` - Number range
- `@Length(min, max)` - String length
- `@IsEnum(enum)` - Enum value
- `@IsOptional()` - Optional field

### Pipes

Transform and validate data:

```typescript
@Param('id', ParseIntPipe) id: number
@Query('active', ParseBoolPipe) active: boolean
@Param('id', ParseUUIDPipe) id: string
```

### Response Handling

```typescript
@HttpCode(HttpStatus.CREATED)  // 201
@HttpCode(HttpStatus.NO_CONTENT)  // 204
@Header('Cache-Control', 'max-age=3600')
@Redirect('/new-url', 301)
```

### Error Handling

```typescript
throw new NotFoundException('Task not found');
throw new BadRequestException('Invalid data');
throw new UnauthorizedException('Please login');
```

## What We Learned

✅ Advanced controller routing  
✅ Working with request data (params, query, body, headers)  
✅ Creating and using DTOs  
✅ Implementing validation with class-validator  
✅ Using built-in pipes for transformation  
✅ Handling different response types  
✅ Error handling with exceptions  
✅ Best practices for API design  

## Validation Best Practices

1. **Always validate input** - Never trust client data
2. **Use DTOs for all request bodies** - Type safety and validation
3. **Provide meaningful error messages** - Help clients understand issues
4. **Enable whitelist** - Strip unknown properties
5. **Transform data** - Auto-convert types when possible
6. **Validate at the boundary** - As early as possible

## Common Patterns

### DTO Organization
```
dto/
├── create-task.dto.ts
├── update-task.dto.ts
├── filter-task.dto.ts
└── task-response.dto.ts
```

### Reusing DTOs
```typescript
// UpdateDto inherits from CreateDto but makes all fields optional
export class UpdateTaskDto extends PartialType(CreateTaskDto) {}
```

### Status Enums
```typescript
export enum TaskStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  DONE = 'DONE',
}
```

## Validation Error Response

```json
{
  "statusCode": 400,
  "message": [
    "Title must be between 3 and 100 characters",
    "Status must be OPEN, IN_PROGRESS, or DONE"
  ],
  "error": "Bad Request"
}
```

## Next Session Preview

In Session 03, we'll learn:
- Services and business logic separation
- Dependency Injection deep dive
- Custom Providers:
  - useValue for constants
  - useClass for alternative implementations
  - useFactory for dynamic creation
  - useExisting for aliases
- Direct injection with @Inject decorator
- Module organization strategies
- Provider scopes and lifecycle

## Resources

- [NestJS Controllers](https://docs.nestjs.com/controllers)
- [NestJS Pipes](https://docs.nestjs.com/pipes)
- [class-validator Documentation](https://github.com/typestack/class-validator)
- [class-transformer Documentation](https://github.com/typestack/class-transformer)
- [HTTP Status Codes](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status)

## Practice Exercises

1. Create a complete CRUD API for a **Products** resource:
   - Add validation for all fields
   - Implement filtering by category and price range
   - Add proper error handling
   - Test all endpoints

2. Implement custom validation:
   - Create a custom password strength validator
   - Validate phone number format
   - Ensure end date is after start date

3. Practice with DTOs:
   - Create nested DTOs with validation
   - Use PartialType for update DTOs
   - Implement response transformation

## Review Questions

1. What's the difference between @Param and @Query?
2. Why should we use DTOs instead of plain objects?
3. What does the whitelist option do in ValidationPipe?
4. How do pipes help with data transformation?
5. When should you use @Patch vs @Put?
6. How do you provide custom validation error messages?
7. What's the purpose of ParseIntPipe?
8. How do you handle 404 errors in NestJS?
