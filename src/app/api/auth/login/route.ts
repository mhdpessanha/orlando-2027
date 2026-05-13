import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { verifyCredentials, createSession, COOKIE_NAME } from "@/lib/auth";

export async function POST(req: Request) {
  const form = await req.formData();
  const username = String(form.get("username") || "");
  const password = String(form.get("password") || "");
  const from = String(form.get("from") || "/");

  const user = await verifyCredentials(username, password);
  if (!user) {
    const params = new URLSearchParams();
    params.set("error", "1");
    if (from && from !== "/") params.set("from", from);
    redirect(`/login?${params.toString()}`);
  }

  const { token, expiresAt } = await createSession(user.id);

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: expiresAt,
    path: "/",
  });

  redirect(from || "/");
}
