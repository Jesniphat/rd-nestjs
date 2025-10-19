# Session 02: Code Examples

## Setup

```bash
# Install validation packages
npm install class-validator class-transformer
```

## Enable Global Validation

### main.ts

```typescript
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable global validation
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));
  
  await app.listen(3000);
}
bootstrap();
```

## Complete Tasks Example

### Generate Module

```bash
nest generate resource tasks --no-spec
# Choose REST API
# Generate CRUD entry points? Yes
```

### tasks/dto/create-task.dto.ts

```typescript
import { IsString, IsOptional, IsEnum, Length, MaxLength } from 'class-validator';

export enum TaskStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  DONE = 'DONE',
}

export class CreateTaskDto {
  @IsString({ message: 'Title must be a string' })
  @Length(3, 100, { message: 'Title must be between 3 and 100 characters' })
  title: string;

  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'Description cannot exceed 500 characters' })
  description?: string;

  @IsEnum(TaskStatus, { message: 'Status must be OPEN, IN_PROGRESS, or DONE' })
  status: TaskStatus;
}
```

### tasks/dto/update-task.dto.ts

```typescript
import { PartialType } from '@nestjs/mapped-types';
import { CreateTaskDto } from './create-task.dto';

// PartialType makes all properties optional
export class UpdateTaskDto extends PartialType(CreateTaskDto) {}
```

### tasks/dto/filter-task.dto.ts

```typescript
import { IsOptional, IsEnum, IsString } from 'class-validator';
import { TaskStatus } from './create-task.dto';

export class FilterTaskDto {
  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;

  @IsOptional()
  @IsString()
  search?: string;
}
```

### tasks/entities/task.entity.ts

```typescript
import { TaskStatus } from '../dto/create-task.dto';

export class Task {
  id: number;
  title: string;
  description?: string;
  status: TaskStatus;
  createdAt: Date;
  updatedAt: Date;
}
```

### tasks/tasks.service.ts

```typescript
import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { FilterTaskDto } from './dto/filter-task.dto';
import { Task } from './entities/task.entity';
import { TaskStatus } from './dto/create-task.dto';

@Injectable()
export class TasksService {
  private tasks: Task[] = [];
  private idCounter = 1;

  create(createTaskDto: CreateTaskDto): Task {
    const task: Task = {
      id: this.idCounter++,
      ...createTaskDto,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.tasks.push(task);
    return task;
  }

  findAll(filterDto?: FilterTaskDto): Task[] {
    let tasks = this.tasks;

    if (filterDto) {
      if (filterDto.status) {
        tasks = tasks.filter(task => task.status === filterDto.status);
      }
      if (filterDto.search) {
        tasks = tasks.filter(task =>
          task.title.toLowerCase().includes(filterDto.search.toLowerCase()) ||
          task.description?.toLowerCase().includes(filterDto.search.toLowerCase())
        );
      }
    }

    return tasks;
  }

  findOne(id: number): Task {
    const task = this.tasks.find(t => t.id === id);
    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }
    return task;
  }

  update(id: number, updateTaskDto: UpdateTaskDto): Task {
    const task = this.findOne(id); // This will throw if not found
    const index = this.tasks.findIndex(t => t.id === id);
    
    const updatedTask = {
      ...task,
      ...updateTaskDto,
      updatedAt: new Date(),
    };
    
    this.tasks[index] = updatedTask;
    return updatedTask;
  }

  remove(id: number): void {
    const task = this.findOne(id); // This will throw if not found
    this.tasks = this.tasks.filter(t => t.id !== id);
  }
}
```

### tasks/tasks.controller.ts

```typescript
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { FilterTaskDto } from './dto/filter-task.dto';

@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createTaskDto: CreateTaskDto) {
    return this.tasksService.create(createTaskDto);
  }

  @Get()
  findAll(@Query() filterDto: FilterTaskDto) {
    return this.tasksService.findAll(filterDto);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.tasksService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTaskDto: UpdateTaskDto,
  ) {
    return this.tasksService.update(id, updateTaskDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number) {
    this.tasksService.remove(id);
  }
}
```

### tasks/tasks.module.ts

```typescript
import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';

@Module({
  controllers: [TasksController],
  providers: [TasksService],
})
export class TasksModule {}
```

## Testing the API

### Create test.http file

```http
### Create a task
POST http://localhost:3000/tasks
Content-Type: application/json

{
  "title": "Learn NestJS",
  "description": "Complete the NestJS course",
  "status": "OPEN"
}

### Create task with validation error
POST http://localhost:3000/tasks
Content-Type: application/json

{
  "title": "ab",
  "status": "INVALID_STATUS"
}

### Get all tasks
GET http://localhost:3000/tasks

### Get tasks by status
GET http://localhost:3000/tasks?status=OPEN

### Search tasks
GET http://localhost:3000/tasks?search=nestjs

### Get task by ID
GET http://localhost:3000/tasks/1

### Update task
PATCH http://localhost:3000/tasks/1
Content-Type: application/json

{
  "status": "IN_PROGRESS"
}

### Delete task
DELETE http://localhost:3000/tasks/1
```

## Advanced DTO Examples

### Nested Validation

```typescript
import { IsString, ValidateNested, IsArray } from 'class-validator';
import { Type } from 'class-transformer';

class AddressDto {
  @IsString()
  street: string;

  @IsString()
  city: string;

  @IsString()
  country: string;
}

export class CreateUserDto {
  @IsString()
  name: string;

  @ValidateNested()
  @Type(() => AddressDto)
  address: AddressDto;

  @IsArray()
  @IsString({ each: true })
  tags: string[];
}
```

### Custom Validators

```typescript
import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

export function IsStrongPassword(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isStrongPassword',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          if (typeof value !== 'string') return false;
          
          // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
          const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
          return regex.test(value);
        },
        defaultMessage(args: ValidationArguments) {
          return 'Password must be at least 8 characters with uppercase, lowercase, and number';
        },
      },
    });
  };
}

// Usage
export class CreateUserDto {
  @IsString()
  username: string;

  @IsStrongPassword()
  password: string;
}
```

### Conditional Validation

```typescript
import { IsString, IsOptional, ValidateIf } from 'class-validator';

export class CreateTaskDto {
  @IsString()
  title: string;

  @ValidateIf(o => o.status === 'DONE')
  @IsString()
  completionNotes?: string;
}
```

## Response Transformation

### Response DTO

```typescript
// response/task-response.dto.ts
import { Exclude, Expose } from 'class-transformer';

export class TaskResponseDto {
  @Expose()
  id: number;

  @Expose()
  title: string;

  @Expose()
  status: string;

  @Exclude()
  internalData: string; // Won't be included in response

  constructor(partial: Partial<TaskResponseDto>) {
    Object.assign(this, partial);
  }
}
```

### Using Response DTO

```typescript
import { ClassSerializerInterceptor, UseInterceptors } from '@nestjs/common';

@Controller('tasks')
@UseInterceptors(ClassSerializerInterceptor)
export class TasksController {
  @Get()
  findAll() {
    const tasks = this.tasksService.findAll();
    return tasks.map(task => new TaskResponseDto(task));
  }
}
```

## Error Handling Examples

### Custom Exception

```typescript
import { HttpException, HttpStatus } from '@nestjs/common';

export class TaskNotFoundException extends HttpException {
  constructor(id: number) {
    super(
      {
        statusCode: HttpStatus.NOT_FOUND,
        message: `Task with ID ${id} was not found`,
        error: 'Task Not Found',
      },
      HttpStatus.NOT_FOUND,
    );
  }
}

// Usage
const task = this.tasks.find(t => t.id === id);
if (!task) {
  throw new TaskNotFoundException(id);
}
```

### Built-in Exceptions

```typescript
import {
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';

// Examples
throw new BadRequestException('Invalid input data');
throw new NotFoundException('Resource not found');
throw new UnauthorizedException('Please login first');
throw new ForbiddenException('You do not have permission');
throw new ConflictException('Resource already exists');
```

## Testing with cURL

```bash
# Create a task
curl -X POST http://localhost:3000/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Learn NestJS",
    "description": "Complete course",
    "status": "OPEN"
  }'

# Get all tasks
curl http://localhost:3000/tasks

# Get task by ID
curl http://localhost:3000/tasks/1

# Update task
curl -X PATCH http://localhost:3000/tasks/1 \
  -H "Content-Type: application/json" \
  -d '{"status": "DONE"}'

# Delete task
curl -X DELETE http://localhost:3000/tasks/1

# Test validation error
curl -X POST http://localhost:3000/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "title": "ab",
    "status": "INVALID"
  }'
```

## Exercise

Create a **Users API** with the following requirements:

1. **DTOs**:
   - CreateUserDto: name (2-50 chars), email (valid email), age (18-120), role (enum: user/admin)
   - UpdateUserDto: all fields optional
   - FilterUserDto: role, minAge, maxAge

2. **Endpoints**:
   - POST /users - Create user
   - GET /users - Get all users (with filtering)
   - GET /users/:id - Get user by ID
   - PATCH /users/:id - Update user
   - DELETE /users/:id - Delete user

3. **Validation**:
   - All fields must be validated
   - Custom error messages
   - Return 404 when user not found

4. **Testing**:
   - Test all endpoints
   - Test validation errors
   - Test filtering

This completes Session 02 code examples!
