import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global DTO validation
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  // อ่านค่า env โดยตรงผ่าน ConfigService (ไม่ใช้ registerAs/Joi)
  const config = app.get(ConfigService);
  const port = Number(config.get('PORT') ?? 3000);

  await app.listen(port);
  // eslint-disable-next-line no-console
  console.log(`Server running on http://localhost:${port}`);
}
bootstrap();
