import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { destroySession, COOKIE_NAME } from "@/lib/auth";

export async function POST(req: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (token) await destroySession(token);

  const response = NextResponse.redirect(new URL("/login", req.url), { status: 303 });
  response.cookies.set(COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: new Date(0),
    maxAge: 0,
    path: "/",
  });
  return response;
}
