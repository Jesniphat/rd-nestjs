# Session 05: Database Integration with TypeORM

## Overview
This session covers database integration using TypeORM, one of the most popular ORMs for TypeScript. We'll learn how to set up database connections, define entities, implement the repository pattern, and perform CRUD operations.

## Learning Objectives
- Understand ORM concepts and TypeORM fundamentals
- Set up database connection in NestJS
- Define entities and relationships
- Use the Repository pattern for data access
- Implement CRUD operations with database
- Work with migrations
- Learn database best practices

## What is TypeORM?

TypeORM is an ORM (Object-Relational Mapping) library that runs in Node.js and can be used with TypeScript and JavaScript. It supports multiple databases including PostgreSQL, MySQL, MariaDB, SQLite, and MongoDB.

### Key Features
- Support for both Active Record and Data Mapper patterns
- Entity and column mapping
- Database-agnostic (works with multiple databases)
- Migrations and schema synchronization
- Eager and lazy loading
- Transaction support
- Query builder

## Installation

```bash
# TypeORM and NestJS integration
npm install @nestjs/typeorm typeorm

# Database driver (choose one)
npm install pg           # PostgreSQL
npm install mysql2       # MySQL
npm install sqlite3      # SQLite
```

## Database Setup

### Configuration

```typescript
// app.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'password',
      database: 'nestjs_db',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true, // Don't use in production!
    }),
  ],
})
export class AppModule {}
```

### Environment-Based Configuration

```typescript
TypeOrmModule.forRoot({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  entities: [__dirname + '/**/*.entity{.ts,.js}'],
  synchronize: process.env.NODE_ENV !== 'production',
  logging: process.env.NODE_ENV !== 'production',
})
```

## Defining Entities

### Basic Entity

```typescript
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ unique: true })
  email: string;

  @Column()
  age: number;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

### Column Types

```typescript
@Entity()
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar', { length: 200 })
  name: string;

  @Column('text', { nullable: true })
  description: string;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @Column('int', { default: 0 })
  stock: number;

  @Column('simple-array')
  tags: string[];

  @Column('simple-json')
  metadata: { key: string; value: string }[];
}
```

## Relationships

### One-to-Many / Many-to-One

```typescript
@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @OneToMany(() => Task, task => task.user)
  tasks: Task[];
}

@Entity()
export class Task {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @ManyToOne(() => User, user => user.tasks)
  user: User;
}
```

### Many-to-Many

```typescript
@Entity()
export class Post {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @ManyToMany(() => Category, category => category.posts)
  @JoinTable()
  categories: Category[];
}

@Entity()
export class Category {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @ManyToMany(() => Post, post => post.categories)
  categories: Post[];
}
```

## Repository Pattern

### Setting Up Repository

```typescript
// users.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from './entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [UsersService],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
```

### Using Repository in Service

```typescript
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  findOne(id: number): Promise<User> {
    return this.usersRepository.findOneBy({ id });
  }

  async create(user: Partial<User>): Promise<User> {
    const newUser = this.usersRepository.create(user);
    return this.usersRepository.save(newUser);
  }

  async update(id: number, user: Partial<User>): Promise<User> {
    await this.usersRepository.update(id, user);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.usersRepository.delete(id);
  }
}
```

## CRUD Operations

### Find Operations

```typescript
// Find all
const users = await this.usersRepository.find();

// Find with conditions
const activeUsers = await this.usersRepository.find({
  where: { isActive: true },
});

// Find with relations
const usersWithTasks = await this.usersRepository.find({
  relations: ['tasks'],
});

// Find one
const user = await this.usersRepository.findOne({
  where: { email: 'john@example.com' },
});

// Find or fail
const user = await this.usersRepository.findOneOrFail({
  where: { id: 1 },
});
```

### Create and Save

```typescript
// Create entity instance
const user = this.usersRepository.create({
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@example.com',
  age: 30,
});

// Save to database
await this.usersRepository.save(user);

// Or in one step
const user = await this.usersRepository.save({
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@example.com',
  age: 30,
});
```

### Update

```typescript
// Update by ID
await this.usersRepository.update(1, { age: 31 });

// Update with conditions
await this.usersRepository.update(
  { isActive: false },
  { isActive: true },
);
```

### Delete

```typescript
// Delete by ID
await this.usersRepository.delete(1);

// Delete with conditions
await this.usersRepository.delete({ isActive: false });

// Soft delete
await this.usersRepository.softDelete(1);
```

## Migrations

### Why Migrations?

- Version control for database schema
- Safe deployment to production
- Team collaboration
- Rollback capability

### Creating Migrations

```bash
# Generate migration from entity changes
npm run typeorm migration:generate -- -n CreateUsersTable

# Create empty migration
npm run typeorm migration:create -- -n AddEmailToUsers

# Run migrations
npm run typeorm migration:run

# Revert last migration
npm run typeorm migration:revert
```

### Migration Example

```typescript
import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateUsersTable1234567890 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'user',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'firstName',
            type: 'varchar',
          },
          {
            name: 'lastName',
            type: 'varchar',
          },
          {
            name: 'email',
            type: 'varchar',
            isUnique: true,
          },
        ],
      }),
      true,
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('user');
  }
}
```

## Best Practices

1. **Never use synchronize in production** - Use migrations instead
2. **Use transactions for complex operations**
3. **Index frequently queried columns**
4. **Use relations wisely** - Avoid N+1 queries
5. **Validate data** - Use DTOs with validation
6. **Handle errors gracefully**
7. **Use connection pooling**
8. **Keep entities focused** - Single responsibility

## Summary

In this session, we covered:
- TypeORM basics and installation
- Database connection setup
- Entity definition and decorators
- Relationships (One-to-Many, Many-to-Many)
- Repository pattern
- CRUD operations
- Migrations for schema management
- Best practices

## Next Session Preview

In Session 06, we'll explore:
- Authentication with JWT
- Passport integration
- Login and registration
- Password hashing
- Role-based authorization
- Security best practices
