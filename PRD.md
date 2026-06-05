# PRD: Expense Tracker

## 1. Product Summary

Expense Tracker คือ web app สำหรับบันทึกรายรับรายจ่ายส่วนตัว เหมาะสำหรับ demo การใช้ AI ช่วยวางแผนก่อน coding ด้วยแนวทาง spec-driven development

เป้าหมายของ demo คือโชว์ flow ที่ใช้งานได้จริง ตั้งแต่ login, เพิ่มรายการ, ดู dashboard, และตรวจสอบงบประมาณรายเดือน โดย deploy ผ่าน Vercel และใช้ Neon PostgreSQL เป็น database

## 2. Objectives

- ช่วยผู้ใช้บันทึกรายรับรายจ่ายประจำวัน
- แสดงภาพรวมการเงินส่วนตัวแบบเข้าใจง่าย
- ช่วยตรวจสอบว่ายอดใช้จ่ายใกล้เกินงบรายเดือนหรือไม่
- ใช้เป็นตัวอย่างการเปลี่ยน idea ให้เป็น spec ก่อนเริ่ม coding

## 3. Target Users

- ผู้ใช้ทั่วไปที่ต้องการติดตามค่าใช้จ่ายส่วนตัว
- ผู้เรียนหรือผู้พัฒนา software ที่ต้องการเห็นตัวอย่าง AI-assisted planning ก่อนสร้าง web app

## 4. MVP Scope

MVP ต้องทำให้ผู้ใช้สามารถ:

1. สมัครสมาชิกและเข้าสู่ระบบ
2. เพิ่ม แก้ไข ลบ รายรับรายจ่าย
3. เลือกหมวดหมู่ของรายการ
4. ดูรายการทั้งหมดพร้อม filter เบื้องต้น
5. ดู dashboard สรุปรายรับ รายจ่าย ยอดคงเหลือ และสัดส่วนรายจ่ายตามหมวดหมู่
6. ตั้งงบรายเดือน และเห็นสถานะว่าใช้เงินเกินงบหรือไม่

## 5. Out of Scope

รายการต่อไปนี้ยังไม่อยู่ใน demo version:

- Admin dashboard
- Google / Apple login
- OCR อ่านใบเสร็จ
- แนบรูปใบเสร็จ
- Export PDF / Excel
- Bank API integration
- Push notification
- AI financial advisor
- Multi-currency

## 6. Recommended Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | Next.js, React, TypeScript |
| Styling | Tailwind CSS |
| Backend | Next.js API Routes / Server Actions |
| Database | Neon PostgreSQL |
| ORM | Drizzle ORM or Prisma |
| Auth | Auth.js or simple email/password auth for demo |
| Deployment | Vercel |
| Charts | Recharts |

## 7. Core User Journey

1. User registers or logs in
2. User lands on dashboard
3. User adds income, such as salary
4. User adds expenses, such as food or transport
5. Dashboard updates totals and charts
6. User sets monthly budget
7. System shows budget status

## 8. Functional Requirements

### FR-001 Authentication

Users can register, login, logout, and access only their own financial data.

### FR-002 Transaction Management

Users can create, read, update, and delete income or expense transactions.

Each transaction must include:

- Type: income or expense
- Amount
- Category
- Date
- Optional note

### FR-003 Category Management

The app provides default categories and allows users to create custom categories.

Default expense categories:

- Food
- Transport
- Shopping
- Bills
- Health
- Other

Default income categories:

- Salary
- Freelance
- Bonus
- Other

### FR-004 Dashboard

Dashboard shows:

- Total income for selected month
- Total expense for selected month
- Remaining balance
- Expense breakdown by category
- Recent transactions
- Budget status

### FR-005 Budget Planning

Users can set one monthly budget. The system shows whether total monthly expense is within budget, near limit, or over budget.

## 9. Non-functional Requirements

- Response time should feel fast for demo usage
- All user data must be scoped by authenticated user id
- App must run on Vercel
- Database must run on Neon PostgreSQL
- UI must be responsive for mobile and desktop
- MVP should remain small enough to explain in class

## 10. Success Criteria

The demo is successful when:

- A new user can login and create transactions
- Dashboard changes after adding transactions
- Budget status is calculated correctly
- The app can be deployed publicly on Vercel
- The project has clear spec files before implementation begins

## 11. Key Product Decision

For this learning demo, the goal is not to build every possible personal finance feature. The goal is to demonstrate a working, understandable product flow driven by clear planning artifacts before coding.

