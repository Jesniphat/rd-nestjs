# Session 04: Middleware, Guards, Interceptors, Exception Filters

วัตถุประสงค์
- เข้าใจ Request lifecycle และจุด hook ต่างๆ
- ใช้งาน Middleware, Guards, Interceptors
- จัดการ Error ด้วย Exception Filters

หัวข้อ
- Middleware: ก่อนเข้าระบบ routing
- Guards: ตัดสินว่าขอผ่านไหม (เช่น auth)
- Interceptors: ดัก request/response (logging/transform/cache)
- Exception Filters: จัดรูปแบบ error สม่ำเสมอ

เวลา (120 นาที)
- 25 นาที อธิบาย lifecycle + โครงสร้าง
- 65 นาที Live Coding: LoggerMiddleware, AuthGuard mock, Transform & Logging Interceptor, HttpExceptionFilter
- 30 นาที Workshop + Q&A