"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="min-h-screen flex items-center justify-center bg-ink-50 px-4">
      <div className="max-w-md w-full bg-white border border-mk-200 rounded-2xl p-6 animate-fadeIn">
        <div className="text-3xl mb-2">⚠️</div>
        <h1 className="font-display text-2xl text-mk-900 mb-2">Algo deu errado</h1>
        <p className="text-sm text-ink-800 mb-2">{error.message || "Erro desconhecido."}</p>
        {error.digest && (
          <p className="text-xs text-ink-400 font-mono mb-4 break-all">digest: {error.digest}</p>
        )}
        <div className="flex gap-2 mt-4">
          <button
            onClick={reset}
            className="bg-ep-600 hover:bg-ep-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
          >
            tentar novamente
          </button>
          <a
            href="/"
            className="bg-ink-100 hover:bg-ink-200 text-ink-900 px-4 py-2 rounded-lg text-sm font-medium transition"
          >
            voltar pro início
          </a>
        </div>
      </div>
    </main>
  );
}
