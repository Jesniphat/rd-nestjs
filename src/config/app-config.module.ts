import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

/**
 * AppConfigModule
 * - แยกการตั้งค่า @nestjs/config ออกมาอยู่โมดูลของตัวเอง
 * - ชี้ไฟล์ .env ที่ต้องการด้วย envFilePath (เช่น '.development.env')
 * - Export ConfigModule เพื่อให้โมดูลอื่นสามารถ inject ConfigService ได้
 */
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
