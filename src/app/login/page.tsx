import { redirect } from "next/navigation";
import { getCurrentUser, safeRedirectPath } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; error?: string }>;
}) {
  const sp = await searchParams;
  const from = safeRedirectPath(sp.from);
  const error = sp.error;

  const user = await getCurrentUser();
  if (user) redirect(from);

  return (
    <main className="min-h-screen flex items-center justify-center bg-ink-50 px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8 animate-fadeIn">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-ep-100 mb-4">
            <span className="text-2xl">✨</span>
          </div>
          <h1 className="font-display text-4xl text-ep-900 mb-1">Orlando 2027</h1>
          <p className="text-ink-600 text-sm">a viagem da família</p>
        </div>

        <form
          action="/api/auth/login"
          method="POST"
          className="bg-white rounded-2xl border border-ink-200 p-6 space-y-4 animate-fadeIn"
        >
          <input type="hidden" name="from" value={from} />

          <div>
            <label className="block text-sm font-medium text-ink-800 mb-1.5">Usuário</label>
            <input
              name="username"
              type="text"
              required
              autoFocus
              autoComplete="username"
              className="w-full rounded-lg border border-ink-200 px-3 py-2.5 text-ink-900 focus:outline-none focus:ring-2 focus:ring-ep-400 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-ink-800 mb-1.5">Senha</label>
            <input
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="w-full rounded-lg border border-ink-200 px-3 py-2.5 text-ink-900 focus:outline-none focus:ring-2 focus:ring-ep-400 focus:border-transparent"
            />
          </div>

          {error && (
            <div className="bg-mk-50 text-mk-900 text-sm rounded-lg px-3 py-2">
              Usuário ou senha incorretos.
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-ep-600 hover:bg-ep-800 text-white font-medium rounded-lg py-2.5 transition-colors"
          >
            Entrar
          </button>
        </form>

        <p className="text-center text-xs text-ink-400 mt-6">
          área restrita · família + amigos
        </p>
      </div>
    </main>
  );
}
