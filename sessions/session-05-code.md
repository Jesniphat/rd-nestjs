# Session 05 – โค้ดทำตาม (Database + TypeORM)

Docker Postgres

```yaml
# docker-compose.yml (วางที่ root)
version: '3.8'
services:
  db:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: root
      MYSQL_DATABASE: tasks
      MYSQL_USER: nest
      MYSQL_PASSWORD: nest
    ports: ['3306:3306']
    volumes: ['mysqldata:/var/lib/mysql']
volumes:
  mysqldata:
```

รันฐานข้อมูล

```bash
docker compose up -d
```

ติดตั้ง TypeORM + pg

```bash
npm i @nestjs/typeorm typeorm pg @nestjs/config
```

ConfigModule และ TypeORM

```ts
// src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TasksModule } from './tasks/tasks.module';
import { Task } from './tasks/entities/task.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST || 'localhost',
      port: +(process.env.DB_PORT || 3600),
      username: process.env.DB_USER || 'nest',
      password: process.env.DB_PASS || 'nest',
      database: process.env.DB_NAME || 'tasks',
      entities: [Task],
      synchronize: true, // dev เท่านั้น
    }),
    TasksModule,
  ],
})
export class AppModule {}
```

สร้าง Entity

```ts
// src/tasks/entities/task.entity.ts
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Task {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 200 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description?: string;
}
```

เชื่อม Repository เข้า Module

```ts
// src/tasks/tasks.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { Task } from './entities/task.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Task])],
  controllers: [TasksController],
  providers: [TasksService],
})
export class TasksModule {}
```

ใช้ Repository ใน Service

```ts
// src/tasks/tasks.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Task } from './entities/task.entity';
import { Repository } from 'typeorm';

@Injectable()
export class TasksService {
  constructor(@InjectRepository(Task) private repo: Repository<Task>) {}

  findAll() {
    return this.repo.find();
  }
  findOne(id: number) {
    return this.repo.findOne({ where: { id } });
  }
  create(data: Partial<Task>) {
    const entity = this.repo.create(data);
    return this.repo.save(entity);
  }
  async update(id: number, data: Partial<Task>) {
    await this.repo.update(id, data);
    return this.findOne(id);
  }
  async remove(id: number) {
    await this.repo.delete(id);
    return true;
  }
}
```

ปรับ DTO ใช้เดิมได้ และ Controller เดิมใช้ได้
ทดสอบ CRUD กับ DB จริง
