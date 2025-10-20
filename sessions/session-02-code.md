# Session 02 – โค้ดทำตาม (Controllers, DTO, Validation)

ติดตั้ง validator

```bash
npm i class-validator class-transformer
```

เปิด ValidationPipe global

```ts
// src/main.ts
import { ValidationPipe } from '@nestjs/common';
// ...
app.useGlobalPipes(new ValidationPipe());
```

สร้าง Tasks module + controller + service (service ไว้ใช้ session 03 แต่เริ่มโครงไว้ได้)

```bash
nest g module tasks
nest g controller tasks
nest g service tasks
```

กำหนด DTO

```ts
// src/tasks/dto/create-task.dto.ts
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateTaskDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;
}
```

```ts
// src/tasks/dto/update-task.dto.ts
import { IsOptional, IsString } from 'class-validator';

export class UpdateTaskDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;
}
```

สร้าง Controller (ชั่วคราวใช้ in-memory array ที่ controller เพื่อโชว์ validation ก่อน; จะย้ายไป service ใน session 03)

```ts
// src/tasks/tasks.controller.ts
import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

type Task = { id: number; title: string; description?: string };

@Controller('tasks')
export class TasksController {
  private tasks: Task[] = [];
  private idSeq = 1;

  @Get()
  findAll() {
    return this.tasks;
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    const task = this.tasks.find(t => t.id === Number(id));
    return task ?? { message: 'not found' };
  }

  @Post()
  create(@Body() dto: CreateTaskDto) {
    const task: Task = { id: this.idSeq++, ...dto };
    this.tasks.push(task);
    return task;
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateTaskDto) {
    const idx = this.tasks.findIndex(t => t.id === Number(id));
    if (idx === -1) return { message: 'not found' };
    this.tasks[idx] = { ...this.tasks[idx], ...dto };
    return this.tasks[idx];
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    this.tasks = this.tasks.filter(t => t.id !== Number(id));
    return { deleted: true };
  }
}
```

ทดสอบ:

- POST /tasks { "title": "Read NestJS docs" }
- PATCH /tasks/1 { "description": "important" }
- GET /tasks
