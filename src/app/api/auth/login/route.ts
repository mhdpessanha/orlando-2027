import { NextResponse } from "next/server";
import { verifyCredentials, createSession, COOKIE_NAME } from "@/lib/auth";

// Constrói URL absoluta a partir do Host header (não do req.url, que no standalone
// usa o hostname de bind do servidor — pode ser 0.0.0.0, que o Safari recusa)
function buildUrl(req: Request, path: string): URL {
  const host = req.headers.get("host") || "localhost:3000";
  const proto = req.headers.get("x-forwarded-proto") || "http";
  return new URL(path, `${proto}://${host}`);
}

export async function POST(req: Request) {
  const form = await req.formData();
  const username = String(form.get("username") || "");
  const password = String(form.get("password") || "");
  const from = String(form.get("from") || "/");

  const user = await verifyCredentials(username, password);
  if (!user) {
    const url = buildUrl(req, "/login");
    url.searchParams.set("error", "1");
    if (from && from !== "/") url.searchParams.set("from", from);
    return NextResponse.redirect(url, { status: 303 });
  }

  const { token, expiresAt } = await createSession(user.id);

  const response = NextResponse.redirect(buildUrl(req, from || "/"), { status: 303 });
  response.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: expiresAt,
    path: "/",
  });
  return response;
}
