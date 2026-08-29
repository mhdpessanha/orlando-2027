import { requireUser } from "@/lib/auth";
import SectionHeader from "@/components/SectionHeader";
import {
  passagens,
  hospedagens,
  ingressos,
  carros,
  wallets,
  giftCards,
  saldoMilhas,
  itensPendentes,
  totalWallets,
  totalGiftCards,
  totalUSDDisponivel,
  totalLATAMFamilia,
  tudoAzulUsado,
  saldoTudoAzulRestante,
  pendentePoly,
} from "@/lib/financeiro";

function fmt(n: number) {
  return n.toLocaleString("pt-BR");
}

function fmtUSD(n: number) {
  return `US$${n.toLocaleString("pt-BR")}`;
}

export default async function FinanceiroPage() {
  await requireUser();

  const totalHospUSD =
    hospedagens.reduce((s, h) => s + (h.valorUSD ?? 0), 0);
  const totalHospPago =
    hospedagens.reduce((s, h) => s + (h.pago ?? 0), 0);

  return (
    <main className="space-y-6 animate-fadeIn">
      <div className="pt-2">
        <h1 className="font-display text-3xl font-medium text-ink-900">Financeiro</h1>
        <p className="text-sm text-ink-500 mt-1">Atualizado em 07/06/2026</p>
      </div>

      {/* ── Resumo ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
          <p className="text-xs font-medium text-amber-700 tracking-wide uppercase">⚠️ Pendente urgente</p>
          <p className="font-display text-2xl font-semibold text-amber-900 mt-1">{fmtUSD(pendentePoly)}</p>
          <p className="text-xs text-amber-700 mt-0.5">Saldo Polynesian · vence 27/10/2026</p>
        </div>
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4">
          <p className="text-xs font-medium text-emerald-700 tracking-wide uppercase">💵 Disponível (USD)</p>
          <p className="font-display text-2xl font-semibold text-emerald-900 mt-1">{fmtUSD(totalUSDDisponivel)}</p>
          <p className="text-xs text-emerald-700 mt-0.5">
            {fmtUSD(totalWallets)} em contas · {fmtUSD(totalGiftCards)} em gift cards
          </p>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
          <p className="text-xs font-medium text-blue-700 tracking-wide uppercase">🎯 TudoAzul restante</p>
          <p className="font-display text-2xl font-semibold text-blue-900 mt-1">{fmt(saldoTudoAzulRestante)} pts</p>
          <p className="text-xs text-blue-700 mt-0.5">{fmt(tudoAzulUsado)} pts já usados</p>
        </div>
      </div>

      {/* ── O que já foi garantido ──────────────────────────── */}
      <section className="bg-white border border-ink-100 rounded-2xl p-5 space-y-5">
        <SectionHeader title="O que já foi garantido" />

        {/* Passagens */}
        <div>
          <h3 className="text-xs font-semibold text-ink-500 uppercase tracking-wide mb-2">✈️ Passagens aéreas</h3>
          <div className="bg-ink-50 rounded-xl p-4">
            <div className="flex items-start justify-between flex-wrap gap-2">
              <div>
                <p className="text-sm font-medium text-ink-900">
                  {passagens.pessoas} pessoas · {passagens.programa} via Delta
                </p>
                <p className="text-xs text-ink-500 mt-0.5">
                  GIG → ATL → MCO (ida) · MCO → ATL → GIG (volta)
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-ink-900">
                  {fmt(passagens.totalMilhasUsadas)} milhas
                </p>
                <p className="text-xs text-ink-500">
                  {fmt(passagens.milhasPorPessoa)} × {passagens.pessoas} pess.
                </p>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-ink-200">
              <p className="text-xs text-ink-500">
                💡 Preço atual de mercado: ~{fmt(passagens.precoMercadoAtual)} milhas/pessoa — você emitiu por{" "}
                <span className="font-semibold text-emerald-700">
                  {Math.round((1 - passagens.milhasPorPessoa / passagens.precoMercadoAtual) * 100)}% menos
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Hospedagem */}
        <div>
          <h3 className="text-xs font-semibold text-ink-500 uppercase tracking-wide mb-2">🏨 Hospedagem</h3>
          <div className="space-y-2">
            {hospedagens.map((h, i) => (
              <div
                key={i}
                className={`rounded-xl p-4 border ${
                  h.status === "pago"
                    ? "bg-emerald-50 border-emerald-100"
                    : h.status === "parcial"
                    ? "bg-amber-50 border-amber-200"
                    : "bg-ink-50 border-ink-100"
                }`}
              >
                <div className="flex items-start justify-between gap-2 flex-wrap">
                  <div>
                    <p className="text-sm font-medium text-ink-900">{h.nome}</p>
                    <p className="text-xs text-ink-500 mt-0.5">{h.periodo} · {h.tipo}</p>
                    {h.obs && <p className="text-xs text-amber-700 mt-0.5">ℹ️ {h.obs}</p>}
                    {h.confirmacao && (
                      <p className="text-xs text-ink-400 mt-0.5">Conf. {h.confirmacao}</p>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    {h.valorUSD != null && (
                      <>
                        <p className="text-sm font-semibold text-ink-900">{fmtUSD(h.valorUSD)}</p>
                        {h.status === "parcial" && (
                          <p className="text-xs text-amber-700">
                            {fmtUSD(h.pago ?? 0)} pago · {fmtUSD(h.pendente ?? 0)} faltam
                          </p>
                        )}
                        {h.prazo && (
                          <p className="text-xs text-amber-600 font-medium">vence {h.prazo}</p>
                        )}
                      </>
                    )}
                    {h.valorBRL != null && (
                      <>
                        <p className="text-sm font-semibold text-ink-900">
                          R${h.valorBRL.toLocaleString("pt-BR")}
                        </p>
                        {h.parcelamento && (
                          <p className="text-xs text-ink-500">{h.parcelamento}</p>
                        )}
                      </>
                    )}
                    <span
                      className={`inline-block text-[10px] px-2 py-0.5 rounded-full mt-1 font-medium ${
                        h.status === "pago"
                          ? "bg-emerald-100 text-emerald-700"
                          : h.status === "parcial"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-ink-100 text-ink-600"
                      }`}
                    >
                      {h.status === "pago" ? "✅ Quitado" : h.status === "parcial" ? "⚠️ Parcial" : "🔒 Reservado"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-2 bg-ink-50 rounded-lg px-4 py-2 flex justify-between items-center">
            <span className="text-xs text-ink-500">Total hospedagem (USD)</span>
            <div className="text-right">
              <span className="text-sm font-semibold text-ink-900">{fmtUSD(totalHospPago)} pagos</span>
              <span className="text-xs text-amber-700 ml-2">· {fmtUSD(pendentePoly)} pendentes</span>
            </div>
          </div>
        </div>

        {/* Ingressos */}
        <div>
          <h3 className="text-xs font-semibold text-ink-500 uppercase tracking-wide mb-2">🎟️ Ingressos</h3>
          <div className="space-y-2">
            {ingressos.map((ing, i) => (
              <div key={i} className="bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3 flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-ink-900">{ing.nome}</p>
                  <p className="text-xs text-ink-500">{ing.para}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-blue-900">{fmt(ing.pontos)} pts</p>
                  <p className="text-xs text-blue-600">{ing.programa}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Carros */}
        <div>
          <h3 className="text-xs font-semibold text-ink-500 uppercase tracking-wide mb-2">🚗 Carros</h3>
          <div className="bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3 flex justify-between items-center flex-wrap gap-2">
            <div>
              <p className="text-sm font-medium text-ink-900">
                {carros.veiculos.join(" · ")}
              </p>
              <p className="text-xs text-ink-500">
                {carros.empresa} · {carros.periodo} · Retirada {carros.retirada} → Devolução {carros.devolucao}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-blue-900">{fmt(carros.pontos)} pts</p>
              <p className="text-xs text-blue-600">{carros.programa}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Dinheiro & Gift Cards ───────────────────────────── */}
      <div className="grid md:grid-cols-2 gap-4">
        <section className="bg-white border border-ink-100 rounded-2xl p-5">
          <SectionHeader title="💵 Contas disponíveis" />
          <div className="space-y-2 mt-3">
            {wallets.map((w) => (
              <div key={w.nome} className="flex justify-between items-center py-1.5 border-b border-ink-50 last:border-0">
                <span className="text-sm text-ink-700">{w.nome}</span>
                <span className="text-sm font-medium text-ink-900">{fmtUSD(w.valorUSD)}</span>
              </div>
            ))}
            <div className="flex justify-between items-center pt-2 border-t border-ink-200">
              <span className="text-sm font-semibold text-ink-700">Total</span>
              <span className="text-sm font-bold text-emerald-700">{fmtUSD(totalWallets)}</span>
            </div>
          </div>
          <div className="mt-3 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
            <p className="text-xs text-amber-700">
              ⚠️ {fmtUSD(pendentePoly)} comprometidos com saldo do Polynesian
            </p>
            <p className="text-xs text-emerald-700 mt-0.5">
              → Sobra livre: <strong>{fmtUSD(totalWallets - pendentePoly)}</strong>
            </p>
          </div>
        </section>

        <section className="bg-white border border-ink-100 rounded-2xl p-5">
          <SectionHeader title="🎁 Gift Cards" />
          <div className="space-y-2 mt-3">
            {giftCards.map((g) => (
              <div key={g.nome} className="flex justify-between items-center py-1.5 border-b border-ink-50 last:border-0">
                <span className="text-sm text-ink-700">{g.nome}</span>
                <span className="text-sm font-medium text-ink-900">{fmtUSD(g.valorUSD)}</span>
              </div>
            ))}
            <div className="flex justify-between items-center pt-2 border-t border-ink-200">
              <span className="text-sm font-semibold text-ink-700">Total</span>
              <span className="text-sm font-bold text-emerald-700">{fmtUSD(totalGiftCards)}</span>
            </div>
          </div>
        </section>
      </div>

      {/* ── Saldo de Milhas ─────────────────────────────────── */}
      <section className="bg-white border border-ink-100 rounded-2xl p-5">
        <SectionHeader title="🎯 Saldo de Milhas e Pontos" />
        <div className="grid sm:grid-cols-3 gap-3 mt-3">
          {/* TudoAzul */}
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
            <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide">TudoAzul</p>
            <p className="font-display text-2xl font-semibold text-blue-900 mt-1">
              {fmt(1_094_000)}
            </p>
            <p className="text-xs text-blue-500 mt-0.5">Murilo</p>
            <div className="mt-2 pt-2 border-t border-blue-200 text-xs text-blue-600 space-y-0.5">
              <p>Usado: {fmt(tudoAzulUsado)} pts</p>
              <p className="font-medium">Sobra: {fmt(saldoTudoAzulRestante)} pts</p>
            </div>
          </div>

          {/* LATAM */}
          <div className="bg-red-50 border border-red-100 rounded-xl p-4">
            <p className="text-xs font-semibold text-red-600 uppercase tracking-wide">LATAM — família</p>
            <p className="font-display text-2xl font-semibold text-red-900 mt-1">
              {fmt(totalLATAMFamilia)}
            </p>
            <div className="mt-2 pt-2 border-t border-red-200 text-xs text-red-600 space-y-0.5">
              {saldoMilhas
                .filter((m) => m.programa === "LATAM")
                .map((m) => (
                  <p key={m.titular}>
                    {m.titular}: {fmt(m.saldo)}
                  </p>
                ))}
            </div>
          </div>

          {/* Livelo */}
          <div className="bg-purple-50 border border-purple-100 rounded-xl p-4">
            <p className="text-xs font-semibold text-purple-600 uppercase tracking-wide">Livelo</p>
            <p className="font-display text-2xl font-semibold text-purple-900 mt-1">
              {fmt(275_000)}
            </p>
            <p className="text-xs text-purple-500 mt-0.5">Murilo</p>
            <div className="mt-2 pt-2 border-t border-purple-200 text-xs text-purple-600">
              <p>Conversível para LATAM se necessário</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Pendente ────────────────────────────────────────── */}
      <section className="bg-white border border-ink-100 rounded-2xl p-5">
        <SectionHeader title="🔲 Ainda falta comprar / resolver" />
        <div className="space-y-1 mt-3">
          {itensPendentes.map((item, i) => (
            <div
              key={i}
              className={`flex items-start gap-3 py-2.5 border-b border-ink-50 last:border-0`}
            >
              <div className="mt-0.5">
                {item.prioridade === "alta" ? (
                  <span className="text-xs px-1.5 py-0.5 rounded-md bg-red-100 text-red-700 font-medium">alta</span>
                ) : item.prioridade === "media" ? (
                  <span className="text-xs px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-700 font-medium">média</span>
                ) : (
                  <span className="text-xs px-1.5 py-0.5 rounded-md bg-ink-100 text-ink-500 font-medium">baixa</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-ink-900">{item.nome}</p>
                {item.obs && <p className="text-xs text-ink-500 mt-0.5">{item.obs}</p>}
              </div>
              <div className="text-right shrink-0">
                {item.estimativa && (
                  <p className="text-sm font-medium text-ink-700">{item.estimativa}</p>
                )}
                {item.prazo && (
                  <p className="text-xs text-amber-600 font-medium">até {item.prazo}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Rolo Gabi ───────────────────────────────────────── */}
      <section className="bg-ink-50 border border-ink-100 rounded-2xl p-5">
        <h2 className="text-sm font-semibold text-ink-700 mb-3">📋 O "rolo" com Gabi e Gabriel</h2>
        <p className="text-sm text-ink-600 leading-relaxed">
          Murilo cobre a alimentação do grupo na parte Disney e adianta itens em nome do grupo. Gabi e Gabriel
          ressarciam em <strong>BRL parcelado</strong>, a acertar separadamente:
        </p>
        <ul className="mt-3 space-y-1.5 text-sm text-ink-600">
          <li>
            · <strong>Polynesian quarto Gabi:</strong> US$2.940 total — US$735 pago · US$2.205 pendente (vence 27/10/2026)
          </li>
          <li>
            · <strong>Alimentação Disney:</strong> a quantificar (Murilo cobre e acerta depois)
          </li>
          <li>
            · <strong>Ingressos Gabriel:</strong> a definir após entrevista de visto (09/06/2026)
          </li>
        </ul>
      </section>
    </main>
  );
}
