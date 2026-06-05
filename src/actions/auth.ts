"use server";

import { hash } from "bcryptjs";
import { eq } from "drizzle-orm";

import { getDb } from "@/db";
import { users } from "@/db/schema";
import { registerSchema } from "@/lib/validators";
import type { ActionResult } from "@/types/domain";

export async function registerUser(input: unknown): Promise<ActionResult<{ email: string }>> {
  const parsed = registerSchema.safeParse(input);

  if (!parsed.success) {
    return {
      ok: false,
      message: "กรุณาตรวจสอบข้อมูลสมัครสมาชิก",
      fieldErrors: parsed.error.flatten().fieldErrors
    };
  }

  const db = getDb();
  const email = parsed.data.email;

  const existing = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);

  if (existing.length > 0) {
    return {
      ok: false,
      message: "อีเมลนี้ถูกใช้งานแล้ว"
    };
  }

  const passwordHash = await hash(parsed.data.password, 12);

  await db.insert(users).values({
    email,
    passwordHash
  });

  return {
    ok: true,
    data: { email },
    message: "สมัครสมาชิกสำเร็จ"
  };
}
