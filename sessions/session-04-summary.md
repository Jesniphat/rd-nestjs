# Session 04 – สรุปและ Checklist

จำให้ขึ้นใจ
- Middleware = ก่อนเข้ากระบวนการ routing
- Guards = ตัดสินผ่าน/ไม่ผ่าน (เช่น Auth)
- Interceptors = ดัก/เปลี่ยนแปลง request/response
- Filters = รูปแบบ error กลาง

Checklist
- [ ] Global LoggingInterceptor ทำงานแล้ว
- [ ] AuthGuard (mock) กับบาง endpoint
- [ ] Global HttpExceptionFilter

การบ้าน
- เพิ่ม TransformInterceptor เปลี่ยน response ให้มี { data: ..., meta: ... }