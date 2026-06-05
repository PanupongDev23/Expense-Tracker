import { z } from "zod";

export const transactionTypeSchema = z.enum(["income", "expense"]);

export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .email("กรุณากรอกอีเมลให้ถูกต้อง")
  .max(255, "อีเมลยาวเกินไป");

export const passwordSchema = z
  .string()
  .min(8, "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร")
  .max(100, "รหัสผ่านยาวเกินไป");

export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema
});

export const loginSchema = registerSchema;

export const categoryInputSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "กรุณากรอกชื่อหมวดหมู่")
    .max(60, "ชื่อหมวดหมู่ยาวเกินไป"),
  type: transactionTypeSchema
});

export const monthSchema = z.string().regex(/^\d{4}-\d{2}$/, "เดือนต้องอยู่ในรูปแบบ YYYY-MM");

export const budgetInputSchema = z.object({
  month: monthSchema,
  amount: z.coerce
    .number({ error: "กรุณากรอกงบประมาณเป็นตัวเลข" })
    .positive("งบประมาณต้องมากกว่า 0")
    .max(999_999_999, "งบประมาณสูงเกินไป")
});

export const transactionInputSchema = z.object({
  type: transactionTypeSchema,
  amount: z.coerce
    .number({ error: "กรุณากรอกจำนวนเงินเป็นตัวเลข" })
    .positive("จำนวนเงินต้องมากกว่า 0")
    .max(999_999_999, "จำนวนเงินสูงเกินไป"),
  categoryId: z.uuid("หมวดหมู่ไม่ถูกต้อง"),
  transactionDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "วันที่ไม่ถูกต้อง"),
  note: z
    .string()
    .trim()
    .max(280, "โน้ตยาวเกินไป")
    .optional()
    .transform((value) => (value ? value : null))
});

export const idSchema = z.uuid("รหัสข้อมูลไม่ถูกต้อง");
