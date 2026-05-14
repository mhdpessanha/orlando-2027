import { NextResponse } from "next/server";
import { verifyCredentials, createSession, COOKIE_NAME, safeRedirectPath } from "@/lib/auth";

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
  const form = await req.formData();
  const username = String(form.get("username") || "");
  const password = String(form.get("password") || "");
  const from = safeRedirectPath(String(form.get("from") || "/"));

  const user = await verifyCredentials(username, password);
  if (!user) {
    const url = buildUrl(req, "/login");
    url.searchParams.set("error", "1");
    if (from !== "/") url.searchParams.set("from", from);
    return NextResponse.redirect(url, { status: 303 });
  }

  const { token, expiresAt } = await createSession(user.id);
  const { isHttps } = reqInfo(req);

  const response = NextResponse.redirect(buildUrl(req, from), { status: 303 });
  response.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: isHttps,
    sameSite: "lax",
    expires: expiresAt,
    path: "/",
  });
  return response;
}
