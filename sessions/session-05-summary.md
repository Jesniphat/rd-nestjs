# Session 05 – สรุปและ Checklist

จำให้ขึ้นใจ
- TypeORM integrate กับ Nest แบบแน่นด้วย @nestjs/typeorm
- Dev ใช้ synchronize: true ได้ แต่ Production ใช้ Migrations
- Repository ช่วย CRUD ได้สะดวก

Checklist
- [ ] ต่อ Postgres ด้วย Docker แล้ว
- [ ] Entity/Repository ทำงานครบ CRUD
- [ ] ConfigModule ใช้งานกับ TypeORM ได้

การบ้าน
- เพิ่ม field status (enum: 'todo' | 'doing' | 'done')
- เพิ่ม filter ค้นหาตาม status