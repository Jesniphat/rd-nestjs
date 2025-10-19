# Session 01: Code Examples

## Project Setup

### Creating a New NestJS Project

```bash
# Install NestJS CLI
npm install -g @nestjs/cli

# Create a new project
nest new hello-nestjs

# Navigate to the project
cd hello-nestjs

# Start the development server
npm run start:dev
```

## Basic Application Structure

### main.ts - Application Entry Point

```typescript
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS if needed
  app.enableCors();
  
  // Set global prefix for all routes
  app.setGlobalPrefix('api');
  
  const port = process.env.PORT || 3000;
  await app.listen(port);
  
  console.log(`Application is running on: http://localhost:${port}`);
}
bootstrap();
```

### app.module.ts - Root Module

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

### app.controller.ts - Basic Controller

```typescript
import { Controller, Get, Param, Query } from '@nestjs/common';
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

  @Get('info')
  getInfo(): object {
    return this.appService.getInfo();
  }

  @Get('search')
  search(@Query('q') query: string): object {
    return { query, results: [] };
  }
}
```

### app.service.ts - Basic Service

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

  getInfo(): object {
    return {
      name: 'NestJS Application',
      version: '1.0.0',
      description: 'A progressive Node.js framework',
      timestamp: new Date().toISOString(),
    };
  }
}
```

## Creating a Products Module

Let's create a complete feature module for products.

### Generate Module Files

```bash
# Generate all files at once
nest generate resource products --no-spec

# Or generate individually
nest generate module products
nest generate controller products
nest generate service products
```

### products/products.module.ts

```typescript
import { Module } from '@nestjs/common';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';

@Module({
  controllers: [ProductsController],
  providers: [ProductsService],
  exports: [ProductsService], // Export if other modules need it
})
export class ProductsModule {}
```

### products/products.controller.ts

```typescript
import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { ProductsService } from './products.service';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  findAll() {
    return this.productsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(+id);
  }

  @Post()
  create(@Body() createProductDto: any) {
    return this.productsService.create(createProductDto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateProductDto: any) {
    return this.productsService.update(+id, updateProductDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productsService.remove(+id);
  }
}
```

### products/products.service.ts

```typescript
import { Injectable } from '@nestjs/common';

interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
}

@Injectable()
export class ProductsService {
  private products: Product[] = [
    { id: 1, name: 'Laptop', price: 999, description: 'High-performance laptop' },
    { id: 2, name: 'Mouse', price: 25, description: 'Wireless mouse' },
    { id: 3, name: 'Keyboard', price: 75, description: 'Mechanical keyboard' },
  ];

  findAll(): Product[] {
    return this.products;
  }

  findOne(id: number): Product | undefined {
    return this.products.find(product => product.id === id);
  }

  create(product: Omit<Product, 'id'>): Product {
    const newProduct = {
      id: this.products.length + 1,
      ...product,
    };
    this.products.push(newProduct);
    return newProduct;
  }

  update(id: number, updateData: Partial<Product>): Product | undefined {
    const index = this.products.findIndex(p => p.id === id);
    if (index === -1) {
      return undefined;
    }
    this.products[index] = { ...this.products[index], ...updateData };
    return this.products[index];
  }

  remove(id: number): boolean {
    const index = this.products.findIndex(p => p.id === id);
    if (index === -1) {
      return false;
    }
    this.products.splice(index, 1);
    return true;
  }
}
```

### Update app.module.ts to Import ProductsModule

```typescript
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProductsModule } from './products/products.module';

@Module({
  imports: [ProductsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

## Testing the Endpoints

### Using cURL

```bash
# Get all products
curl http://localhost:3000/products

# Get a specific product
curl http://localhost:3000/products/1

# Create a new product
curl -X POST http://localhost:3000/products \
  -H "Content-Type: application/json" \
  -d '{"name":"Monitor","price":299,"description":"27-inch 4K monitor"}'

# Update a product
curl -X PUT http://localhost:3000/products/1 \
  -H "Content-Type: application/json" \
  -d '{"price":899}'

# Delete a product
curl -X DELETE http://localhost:3000/products/3
```

### Using HTTP File (VS Code REST Client)

Create a file `test.http`:

```http
### Get all products
GET http://localhost:3000/products

### Get product by ID
GET http://localhost:3000/products/1

### Create new product
POST http://localhost:3000/products
Content-Type: application/json

{
  "name": "Monitor",
  "price": 299,
  "description": "27-inch 4K monitor"
}

### Update product
PUT http://localhost:3000/products/1
Content-Type: application/json

{
  "price": 899
}

### Delete product
DELETE http://localhost:3000/products/3
```

## Advanced Controller Examples

### Using Multiple Decorators

```typescript
import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete,
  Param, 
  Query, 
  Body,
  HttpCode,
  HttpStatus,
  Header
} from '@nestjs/common';

@Controller('advanced')
export class AdvancedController {
  @Get()
  @Header('Cache-Control', 'max-age=3600')
  getCached() {
    return { message: 'This response is cached' };
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() data: any) {
    return { message: 'Resource created', data };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    // Delete logic here
  }

  @Get('search')
  search(
    @Query('q') query: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return {
      query,
      page,
      limit,
      results: [],
    };
  }
}
```

## Exception Handling

```typescript
import { Controller, Get, Param, NotFoundException } from '@nestjs/common';
import { ProductsService } from './products.service';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get(':id')
  findOne(@Param('id') id: string) {
    const product = this.productsService.findOne(+id);
    
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    
    return product;
  }
}
```

## Async Operations

```typescript
import { Injectable } from '@nestjs/common';

@Injectable()
export class ProductsService {
  async findAll(): Promise<Product[]> {
    // Simulate async operation (e.g., database query)
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(this.products);
      }, 100);
    });
  }

  async findOne(id: number): Promise<Product | undefined> {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(this.products.find(p => p.id === id));
      }, 100);
    });
  }
}
```

## Running and Testing

```bash
# Development mode with hot reload
npm run start:dev

# Production mode
npm run build
npm run start:prod

# Run tests
npm run test

# Run e2e tests
npm run test:e2e
```

## Common CLI Commands Reference

```bash
# Create a new project
nest new project-name

# Generate resources
nest generate module users
nest generate controller users
nest generate service users
nest generate resource users

# Short form
nest g mo users
nest g co users
nest g s users
nest g res users

# Generate with directory structure
nest g res users/admin

# Generate without test files
nest g s users --no-spec

# Get help
nest --help
nest generate --help
```

## Exercise

Create a simple blog API with the following:

1. Create a `posts` module
2. Implement CRUD operations for blog posts
3. Each post should have: id, title, content, author, createdAt
4. Add endpoints for:
   - GET /posts - List all posts
   - GET /posts/:id - Get single post
   - POST /posts - Create new post
   - PUT /posts/:id - Update post
   - DELETE /posts/:id - Delete post
5. Test all endpoints using cURL or Postman

## Solution Skeleton

```typescript
// posts/posts.service.ts
interface Post {
  id: number;
  title: string;
  content: string;
  author: string;
  createdAt: Date;
}

@Injectable()
export class PostsService {
  private posts: Post[] = [];

  findAll(): Post[] {
    return this.posts;
  }

  findOne(id: number): Post | undefined {
    // Implement
  }

  create(post: Omit<Post, 'id' | 'createdAt'>): Post {
    // Implement
  }

  update(id: number, updateData: Partial<Post>): Post | undefined {
    // Implement
  }

  remove(id: number): boolean {
    // Implement
  }
}
```

This completes the code examples for Session 01!
