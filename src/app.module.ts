import { Module } from '@nestjs/common';
import { AppConfigModule } from './config/app-config.module';

@Module({
  imports: [
    // ตั้งค่า config แยกไว้ที่ AppConfigModule
    AppConfigModule,
  ],
})
export class AppModule {}
