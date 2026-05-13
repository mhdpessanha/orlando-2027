import { NextResponse } from "next/server";
import { verifyCredentials, createSession, COOKIE_NAME } from "@/lib/auth";

export async function POST(req: Request) {
  const form = await req.formData();
  const username = String(form.get("username") || "");
  const password = String(form.get("password") || "");
  const from = String(form.get("from") || "/");

  const user = await verifyCredentials(username, password);
  if (!user) {
    const url = new URL("/login", req.url);
    url.searchParams.set("error", "1");
    if (from && from !== "/") url.searchParams.set("from", from);
    return NextResponse.redirect(url, { status: 303 });
  }

  const { token, expiresAt } = await createSession(user.id);

  const response = NextResponse.redirect(new URL(from || "/", req.url), { status: 303 });
  response.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: expiresAt,
    path: "/",
  });
  return response;
}
