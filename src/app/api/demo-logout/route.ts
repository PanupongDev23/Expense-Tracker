import { NextResponse } from "next/server";

export function POST() {
  const response = NextResponse.json({ ok: true });

  response.cookies.set("expense-demo-session", "", {
    httpOnly: true,
    maxAge: 0,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production"
  });

  return response;
}
