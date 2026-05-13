import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { destroySession, COOKIE_NAME } from "@/lib/auth";

function reqInfo(req: Request) {
  const host = req.headers.get("host") || "localhost:3000";
  const proto = req.headers.get("x-forwarded-proto") || "http";
  return { host, proto, isHttps: proto === "https" };
}

function buildUrl(req: Request, path: string): URL {
  const { host, proto } = reqInfo(req);
  return new URL(path, `${proto}://${host}`);
}

export async function POST(req: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (token) await destroySession(token);

  const { isHttps } = reqInfo(req);

  const response = NextResponse.redirect(buildUrl(req, "/login"), { status: 303 });
  response.cookies.set(COOKIE_NAME, "", {
    httpOnly: true,
    secure: isHttps,
    sameSite: "lax",
    expires: new Date(0),
    maxAge: 0,
    path: "/",
  });
  return response;
}
