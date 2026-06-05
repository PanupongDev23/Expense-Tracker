"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { UserPlus } from "lucide-react";
import { FormEvent, useState, useTransition } from "react";

import { registerUser } from "@/actions/auth";

export function RegisterForm() {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]> | undefined>();
  const [isPending, startTransition] = useTransition();

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    setFieldErrors(undefined);

    const formData = new FormData(event.currentTarget);
    const input = {
      email: String(formData.get("email") ?? ""),
      password: String(formData.get("password") ?? "")
    };

    startTransition(async () => {
      const result = await registerUser(input);

      if (!result.ok) {
        setMessage(result.message);
        setFieldErrors(result.fieldErrors);
        return;
      }

      router.push("/login?registered=1");
    });
  }

  return (
    <section className="rounded-lg border border-[#dedfd8] bg-white p-6 shadow-sm">
      <div>
        <p className="text-sm font-medium text-[#67715f]">เริ่มต้นติดตามการเงิน</p>
        <h1 className="mt-1 text-2xl font-semibold text-[#151813]">สมัครสมาชิก</h1>
      </div>

      {message ? (
        <div className="mt-4 rounded-md border border-[#f0c9c2] bg-[#fff2ef] px-3 py-2 text-sm font-medium text-[#9c2f1b]">
          {message}
        </div>
      ) : null}

      <form className="mt-6 space-y-4" onSubmit={onSubmit}>
        <label className="block">
          <span className="text-sm font-semibold text-[#151813]">อีเมล</span>
          <input
            className="mt-1 h-11 w-full rounded-md border border-[#d9dbd2] px-3 text-sm outline-none transition focus:border-[#205b45] focus:ring-2 focus:ring-[#c9dfd4]"
            type="email"
            name="email"
            autoComplete="email"
            required
          />
          {fieldErrors?.email ? <p className="mt-1 text-xs font-medium text-[#9c2f1b]">{fieldErrors.email[0]}</p> : null}
        </label>
        <label className="block">
          <span className="text-sm font-semibold text-[#151813]">รหัสผ่าน</span>
          <input
            className="mt-1 h-11 w-full rounded-md border border-[#d9dbd2] px-3 text-sm outline-none transition focus:border-[#205b45] focus:ring-2 focus:ring-[#c9dfd4]"
            type="password"
            name="password"
            autoComplete="new-password"
            required
            minLength={8}
          />
          {fieldErrors?.password ? (
            <p className="mt-1 text-xs font-medium text-[#9c2f1b]">{fieldErrors.password[0]}</p>
          ) : null}
        </label>
        <button
          className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-[#205b45] px-4 text-sm font-semibold text-white transition hover:bg-[#184835] disabled:opacity-70"
          type="submit"
          disabled={isPending}
        >
          <UserPlus size={18} />
          {isPending ? "กำลังสมัครสมาชิก" : "สมัครสมาชิก"}
        </button>
      </form>

      <p className="mt-5 text-center text-sm text-[#67715f]">
        มีบัญชีอยู่แล้ว?{" "}
        <Link className="font-semibold text-[#205b45] hover:underline" href="/login">
          เข้าสู่ระบบ
        </Link>
      </p>
    </section>
  );
}
