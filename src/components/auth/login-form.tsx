"use client";

import Link from "next/link";
import { LogIn } from "lucide-react";
import { signIn } from "next-auth/react";
import { FormEvent, useState, useTransition } from "react";

type LoginFormProps = {
  registered: boolean;
};

export function LoginForm({ registered }: LoginFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");

    startTransition(async () => {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false
      });

      if (!result?.ok) {
        setError("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
        return;
      }

      window.location.href = "/dashboard";
    });
  }

  return (
    <section className="rounded-lg border border-[#dedfd8] bg-white p-6 shadow-sm">
      <div>
        <p className="text-sm font-medium text-[#67715f]">ยินดีต้อนรับกลับ</p>
        <h1 className="mt-1 text-2xl font-semibold text-[#151813]">เข้าสู่ระบบ</h1>
      </div>

      {registered ? (
        <div className="mt-4 rounded-md border border-[#c9dfd4] bg-[#eef8f2] px-3 py-2 text-sm font-medium text-[#205b45]">
          สมัครสมาชิกสำเร็จ กรุณาเข้าสู่ระบบ
        </div>
      ) : null}

      {error ? (
        <div className="mt-4 rounded-md border border-[#f0c9c2] bg-[#fff2ef] px-3 py-2 text-sm font-medium text-[#9c2f1b]">
          {error}
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
        </label>
        <label className="block">
          <span className="text-sm font-semibold text-[#151813]">รหัสผ่าน</span>
          <input
            className="mt-1 h-11 w-full rounded-md border border-[#d9dbd2] px-3 text-sm outline-none transition focus:border-[#205b45] focus:ring-2 focus:ring-[#c9dfd4]"
            type="password"
            name="password"
            autoComplete="current-password"
            required
          />
        </label>
        <button
          className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-[#205b45] px-4 text-sm font-semibold text-white transition hover:bg-[#184835] disabled:opacity-70"
          type="submit"
          disabled={isPending}
        >
          <LogIn size={18} />
          {isPending ? "กำลังเข้าสู่ระบบ" : "เข้าสู่ระบบ"}
        </button>
      </form>

      <p className="mt-5 text-center text-sm text-[#67715f]">
        ยังไม่มีบัญชี?{" "}
        <Link className="font-semibold text-[#205b45] hover:underline" href="/register">
          สมัครสมาชิก
        </Link>
      </p>
    </section>
  );
}
