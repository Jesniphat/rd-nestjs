# Session 07 – โค้ดทำตาม (Config แบบแยกโมดูล + อ่าน .env ตรงด้วย ConfigService)

เป้าหมายคาบนี้: แยก AppConfigModule สำหรับตั้งค่า @nestjs/config และสาธิตการอ่านค่า .env ตรงๆ ผ่��น ConfigService.get(), โดยระบุไฟล์ env ชัดเจนด้วย envFilePath ไม่ใช้ registerAs/Joi/Swagger/Logging ขั้นสูง

## 1) สร้างไฟล์ .development.env (ตัวอย่าง)
```
PORT=3000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=5432
DB_USER=nest
DB_PASS=nest
DB_NAME=tasks

JWT_SECRET=dev_secret
```

## 2) แยก AppConfigModule
```ts
// src/config/app-config.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.development.env',
    }),
  ],
  exports: [ConfigModule],
})
export class AppConfigModule {}
```

## 3) ใช้ AppConfigModule ใน AppModule
```ts
// src/app.module.ts
import { Module } from '@nestjs/common';
import { AppConfigModule } from './config/app-config.module';

@Module({
  imports: [AppConfigModule],
})
export class AppModule {}
```

## 4) อ่านค่า .env โดยตรงใน main.ts
```ts
// src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  const config = app.get(ConfigService);
  const port = Number(config.get('PORT') ?? 3000);
  await app.listen(port);
  console.log(`Server running on http://localhost:${port}`);
}
bootstrap();
```

หมายเหตุ
- ค่าใน runtime environment (เช่น export PORT=4000) จะ override ค่าจากไฟล์ .env ตามพฤติกรรม dotenv
- สามารถเปลี่ยน envFilePath ได้ตาม environment ที่สอน เช่น '.test.env', '.prod.env'
- ขั้นถัดไป (optional): แยก CacheService เพื่อหุ้ม get/set/del (ไม่ใช้ CacheInterceptor)