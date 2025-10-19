# Session 02: Controllers, DTOs, and Validation

## Overview
This session dives deep into controllers, the entry point for handling HTTP requests in NestJS. We'll learn how to work with request data, implement Data Transfer Objects (DTOs), and add validation to ensure data integrity.

## Learning Objectives
By the end of this session, you will be able to:
- Master controller routing and HTTP methods
- Extract data from requests (params, query, body)
- Create and use Data Transfer Objects (DTOs)
- Implement validation using class-validator
- Use built-in pipes for data transformation
- Handle different response types and status codes
- Implement proper error handling

## Controllers Deep Dive

### What are Controllers?

Controllers are responsible for handling incoming requests and returning responses to the client. They act as the interface between the HTTP layer and your application's business logic.

### Basic Controller Structure

```typescript
import { Controller, Get } from '@nestjs/common';

@Controller('users')
export class UsersController {
  @Get()
  findAll() {
    return 'This action returns all users';
  }
}
```

The `@Controller('users')` decorator:
- Defines the route prefix for all routes in this controller
- Routes in this controller will be prefixed with `/users`

### HTTP Method Decorators

NestJS provides decorators for all standard HTTP methods:

```typescript
import { Controller, Get, Post, Put, Patch, Delete } from '@nestjs/common';

@Controller('users')
export class UsersController {
  @Get()           // GET /users
  findAll() {}

  @Get(':id')      // GET /users/:id
  findOne() {}

  @Post()          // POST /users
  create() {}

  @Put(':id')      // PUT /users/:id
  update() {}

  @Patch(':id')    // PATCH /users/:id
  partialUpdate() {}

  @Delete(':id')   // DELETE /users/:id
  remove() {}
}
```

## Working with Request Data

### Route Parameters

Extract dynamic values from the URL path:

```typescript
import { Controller, Get, Param } from '@nestjs/common';

@Controller('users')
export class UsersController {
  @Get(':id')
  findOne(@Param('id') id: string) {
    return `This action returns user #${id}`;
  }

  @Get(':userId/posts/:postId')
  getUserPost(
    @Param('userId') userId: string,
    @Param('postId') postId: string,
  ) {
    return `User ${userId}, Post ${postId}`;
  }

  // Get all params as an object
  @Get(':id/details')
  getDetails(@Param() params: any) {
    return `User ID: ${params.id}`;
  }
}
```

### Query Parameters

Extract query string parameters:

```typescript
import { Controller, Get, Query } from '@nestjs/common';

@Controller('users')
export class UsersController {
  @Get()
  findAll(
    @Query('role') role?: string,
    @Query('active') active?: string,
  ) {
    return `Filtering by role: ${role}, active: ${active}`;
  }

  // Get all query params
  @Get('search')
  search(@Query() query: any) {
    return { searchParams: query };
  }
}
```

Example requests:
- `/users?role=admin&active=true`
- `/users/search?q=john&limit=10`

### Request Body

Extract data from the request body:

```typescript
import { Controller, Post, Body } from '@nestjs/common';

@Controller('users')
export class UsersController {
  @Post()
  create(@Body() createUserDto: any) {
    return `Creating user: ${JSON.stringify(createUserDto)}`;
  }

  // Extract specific fields
  @Post('login')
  login(
    @Body('email') email: string,
    @Body('password') password: string,
  ) {
    return { email, password };
  }
}
```

### Headers

Access request headers:

```typescript
import { Controller, Get, Headers } from '@nestjs/common';

@Controller('users')
export class UsersController {
  @Get()
  findAll(@Headers('authorization') auth: string) {
    return `Authorization: ${auth}`;
  }

  // Get all headers
  @Get('info')
  getInfo(@Headers() headers: any) {
    return headers;
  }
}
```

## Data Transfer Objects (DTOs)

DTOs are TypeScript classes that define the shape of data being transferred. They provide type safety and can be used for validation.

### Why Use DTOs?

1. **Type Safety**: Catch errors at compile time
2. **Validation**: Ensure data meets requirements
3. **Documentation**: Self-documenting code
4. **Maintainability**: Centralized data structures

### Creating DTOs

```typescript
// create-user.dto.ts
export class CreateUserDto {
  name: string;
  email: string;
  age: number;
  role?: string; // Optional field
}

// update-user.dto.ts
export class UpdateUserDto {
  name?: string;
  email?: string;
  age?: number;
  role?: string;
}
```

### Using DTOs in Controllers

```typescript
import { Controller, Post, Body } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';

@Controller('users')
export class UsersController {
  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    // TypeScript knows the shape of createUserDto
    return {
      message: 'User created',
      user: createUserDto,
    };
  }
}
```

## Validation

### Setting Up Validation

Install required packages:

```bash
npm install class-validator class-transformer
```

Enable validation globally in `main.ts`:

```typescript
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,          // Strip properties not in DTO
    forbidNonWhitelisted: true, // Throw error if extra properties
    transform: true,           // Auto-transform payloads to DTO instances
  }));
  
  await app.listen(3000);
}
bootstrap();
```

### Validation Decorators

```typescript
import { 
  IsString, 
  IsEmail, 
  IsInt, 
  IsOptional,
  Min, 
  Max, 
  Length,
  IsEnum,
  IsBoolean,
  IsDate,
  IsArray,
  ValidateNested
} from 'class-validator';

export class CreateUserDto {
  @IsString()
  @Length(2, 50)
  name: string;

  @IsEmail()
  email: string;

  @IsInt()
  @Min(18)
  @Max(120)
  age: number;

  @IsOptional()
  @IsString()
  @Length(0, 200)
  bio?: string;

  @IsEnum(['admin', 'user', 'moderator'])
  role: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
```

### Common Validation Decorators

**String Validation**
- `@IsString()` - Must be a string
- `@Length(min, max)` - String length between min and max
- `@MinLength(min)` - Minimum length
- `@MaxLength(max)` - Maximum length
- `@IsEmail()` - Valid email format
- `@IsUrl()` - Valid URL format
- `@Matches(pattern)` - Match regex pattern

**Number Validation**
- `@IsInt()` - Must be an integer
- `@IsNumber()` - Must be a number
- `@Min(value)` - Minimum value
- `@Max(value)` - Maximum value
- `@IsPositive()` - Must be positive
- `@IsNegative()` - Must be negative

**Boolean and Date**
- `@IsBoolean()` - Must be boolean
- `@IsDate()` - Must be a date

**Array and Object**
- `@IsArray()` - Must be an array
- `@ArrayMinSize(min)` - Array minimum size
- `@ArrayMaxSize(max)` - Array maximum size
- `@ValidateNested()` - Validate nested object

**General**
- `@IsOptional()` - Field is optional
- `@IsEnum(enum)` - Must be one of enum values
- `@IsDefined()` - Must be defined
- `@IsNotEmpty()` - Must not be empty

### Custom Validation Messages

```typescript
export class CreateUserDto {
  @IsString({ message: 'Name must be a string' })
  @Length(2, 50, { message: 'Name must be between 2 and 50 characters' })
  name: string;

  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string;

  @IsInt({ message: 'Age must be an integer' })
  @Min(18, { message: 'You must be at least 18 years old' })
  age: number;
}
```

### Validation Error Response

When validation fails, NestJS returns a structured error:

```json
{
  "statusCode": 400,
  "message": [
    "Name must be between 2 and 50 characters",
    "Please provide a valid email address",
    "You must be at least 18 years old"
  ],
  "error": "Bad Request"
}
```

## Pipes

Pipes are classes that transform or validate data before it reaches the route handler.

### Built-in Pipes

```typescript
import { 
  Controller, 
  Get, 
  Param, 
  Query,
  ParseIntPipe,
  ParseBoolPipe,
  ParseArrayPipe,
  ParseUUIDPipe,
  DefaultValuePipe
} from '@nestjs/common';

@Controller('users')
export class UsersController {
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    // id is automatically converted to number
    return `User #${id}`;
  }

  @Get()
  findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('active', ParseBoolPipe) active?: boolean,
  ) {
    return { page, limit, active };
  }

  @Get('by-uuid/:id')
  findByUuid(@Param('id', ParseUUIDPipe) id: string) {
    return `User with UUID: ${id}`;
  }
}
```

### Pipe Options

```typescript
@Get(':id')
findOne(
  @Param('id', new ParseIntPipe({ errorHttpStatusCode: 404 }))
  id: number,
) {
  return `User #${id}`;
}
```

## Response Handling

### Status Codes

```typescript
import { Controller, Post, HttpCode, HttpStatus } from '@nestjs/common';

@Controller('users')
export class UsersController {
  @Post()
  @HttpCode(HttpStatus.CREATED) // 201
  create() {
    return { message: 'User created' };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT) // 204
  remove(@Param('id') id: string) {
    // Delete user
  }
}
```

### Custom Headers

```typescript
import { Controller, Get, Header } from '@nestjs/common';

@Controller('users')
export class UsersController {
  @Get()
  @Header('Cache-Control', 'max-age=3600')
  findAll() {
    return [];
  }
}
```

### Redirects

```typescript
import { Controller, Get, Redirect } from '@nestjs/common';

@Controller('users')
export class UsersController {
  @Get('old-endpoint')
  @Redirect('/users/new-endpoint', 301)
  oldEndpoint() {}

  // Dynamic redirect
  @Get('docs')
  @Redirect()
  getDocs(@Query('version') version: string) {
    if (version && version === '5') {
      return { url: 'https://docs.example.com/v5' };
    }
    return { url: 'https://docs.example.com' };
  }
}
```

## Best Practices

1. **Use DTOs for all request bodies**
2. **Enable validation globally**
3. **Use appropriate HTTP methods and status codes**
4. **Keep controllers thin** - delegate to services
5. **Use pipes for data transformation**
6. **Provide meaningful error messages**
7. **Use TypeScript types everywhere**
8. **Group related routes in modules**

## Summary

In this session, we covered:
- Controllers and routing in depth
- Extracting request data (params, query, body, headers)
- Creating and using DTOs
- Implementing validation with class-validator
- Using built-in pipes for transformation
- Handling responses and status codes
- Best practices for API design

## Next Session Preview

In Session 03, we'll explore:
- Services and business logic
- Dependency Injection in detail
- Custom Providers (useValue, useClass, useFactory, useExisting)
- Direct injection with @Inject decorator
- Module organization
- Provider scopes
