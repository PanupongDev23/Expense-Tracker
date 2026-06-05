import { NextResponse, type NextRequest } from "next/server";

import { isDemoMode } from "@/lib/demo-mode";

function getRequestOrigin(request: NextRequest) {
  const fallbackUrl = new URL(request.url);
  const host = request.headers.get("host") ?? fallbackUrl.host;
  const protocol = request.headers.get("x-forwarded-proto") ?? fallbackUrl.protocol.replace(":", "");

  return `${protocol}://${host}`;
}

export function GET(request: NextRequest) {
  if (!isDemoMode()) {
    return NextResponse.redirect(new URL("/login", getRequestOrigin(request)));
  }

  const response = NextResponse.redirect(new URL("/dashboard", getRequestOrigin(request)));

  response.cookies.set("expense-demo-session", "true", {
    httpOnly: true,
    maxAge: 60 * 60 * 8,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production"
  });

  return response;
}
