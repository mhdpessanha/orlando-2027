// Dados financeiros da viagem Orlando 2027
// Atualizado: 07/06/2026

export const passagens = {
  pessoas: 7, // todos exceto Gabriel
  milhasPorPessoa: 217_202,
  totalMilhasUsadas: 7 * 217_202, // 1.520.414
  programa: "LATAM",
  precoMercadoAtual: 450_000, // por pessoa, junho/2026
  status: "emitido" as const,
};

export interface Hospedagem {
  nome: string;
  periodo: string;
  tipo: string;
  valorUSD?: number;
  valorBRL?: number;
  pago?: number;
  pendente?: number;
  prazo?: string;
  parcelamento?: string;
  status: "pago" | "parcial" | "reservado";
  obs?: string;
  confirmacao?: string;
}

export const hospedagens: Hospedagem[] = [
  {
    nome: "Animal Kingdom Villas – Kidani Village",
    periodo: "08–10 jan",
    tipo: "DVC (2BR Savana)",
    valorUSD: 2_162,
    pago: 2_162,
    pendente: 0,
    status: "pago",
  },
  {
    nome: "Polynesian Village Resort – Quarto Murilo",
    periodo: "10–16 jan",
    tipo: "DVC Deluxe Studio",
    valorUSD: 2_940,
    pago: 1_585,
    pendente: 1_355,
    prazo: "27/10/2026",
    status: "parcial",
  },
  {
    nome: "Polynesian Village Resort – Quarto Gabi",
    periodo: "10–16 jan",
    tipo: "DVC Deluxe Studio",
    valorUSD: 2_940,
    pago: 735,
    pendente: 2_205,
    prazo: "27/10/2026",
    status: "parcial",
    obs: "Gabi reembolsa em BRL",
  },
  {
    nome: "Vista Cay Resort",
    periodo: "16–24 jan",
    tipo: "Townhome 3 quartos / Hoteis.com",
    valorBRL: 13_297,
    parcelamento: "12x",
    status: "reservado",
    confirmacao: "72075013906304",
  },
];

export interface Ingresso {
  nome: string;
  para: string;
  pontos: number;
  programa: string;
}

export const ingressos: Ingresso[] = [
  {
    nome: "Disney 7-Day Base Ticket",
    para: "7 pessoas (exceto Gabriel)",
    pontos: 280_000,
    programa: "TudoAzul",
  },
  {
    nome: "Universal Three Parks Adventure",
    para: "7 pessoas (exceto Gabriel)",
    pontos: 167_000,
    programa: "TudoAzul",
  },
];

export const carros = {
  periodo: "16–24 jan",
  veiculos: ["Ford Expedition Max (ou similar)", "Nissan Rogue (ou similar)"],
  pontos: 440_000,
  programa: "TudoAzul",
  empresa: "Alamo",
  retirada: "Car Care Center",
  devolucao: "MCO",
};

// Total TudoAzul já usado: 440k + 280k + 167k = 887k
export const tudoAzulUsado = carros.pontos + ingressos.reduce((s, i) => s + i.pontos, 0);

export interface Wallet {
  nome: string;
  valorUSD: number;
}

export const wallets: Wallet[] = [
  { nome: "Cash", valorUSD: 700 },
  { nome: "Wise", valorUSD: 1_793 },
  { nome: "Astropay", valorUSD: 2_116 },
  { nome: "Santander Global", valorUSD: 360 },
];

export interface GiftCard {
  nome: string;
  valorUSD: number;
}

export const giftCards: GiftCard[] = [
  { nome: "Disney Gift Card", valorUSD: 3_200 },
  { nome: "Walmart", valorUSD: 400 },
  { nome: "Carter's", valorUSD: 150 },
  { nome: "Five Guys", valorUSD: 100 },
  { nome: "Olive Garden", valorUSD: 100 },
  { nome: "Cinnabon", valorUSD: 50 },
];

export const totalWallets = wallets.reduce((s, w) => s + w.valorUSD, 0);
export const totalGiftCards = giftCards.reduce((s, g) => s + g.valorUSD, 0);
export const totalUSDDisponivel = totalWallets + totalGiftCards;

export interface SaldoMilhas {
  programa: string;
  titular: string;
  saldo: number;
  cor: string;
}

export const saldoMilhas: SaldoMilhas[] = [
  { programa: "TudoAzul", titular: "Murilo", saldo: 1_094_000, cor: "blue" },
  { programa: "LATAM", titular: "Murilo", saldo: 243_000, cor: "red" },
  { programa: "LATAM", titular: "Pai", saldo: 364_000, cor: "red" },
  { programa: "LATAM", titular: "Mãe", saldo: 201_000, cor: "red" },
  { programa: "Livelo", titular: "Murilo", saldo: 275_000, cor: "purple" },
];

export const totalLATAMFamilia = saldoMilhas
  .filter((m) => m.programa === "LATAM")
  .reduce((s, m) => s + m.saldo, 0); // 808.000

export const saldoTudoAzulRestante = 1_094_000 - tudoAzulUsado; // ~207.000

// Saldo pendente Poly (vence 27/10/2026)
export const pendentePoly = hospedagens.reduce((s, h) => s + (h.pendente ?? 0), 0); // 3.560

export interface ItemPendente {
  nome: string;
  estimativa?: string;
  prazo?: string;
  prioridade: "alta" | "media" | "baixa";
  obs?: string;
}

export const itensPendentes: ItemPendente[] = [
  {
    nome: "Saldo Polynesian Village Resort",
    estimativa: "US$3.560",
    prazo: "27/10/2026",
    prioridade: "alta",
    obs: "US$1.355 (Murilo) + US$2.205 (Gabi)",
  },
  {
    nome: "Ingressos Gabriel (Disney + Universal)",
    estimativa: "~US$600–800",
    prioridade: "alta",
    obs: "Condicionado à aprovação do visto — entrevista 09/06/2026",
  },
  {
    nome: "SeaWorld ou Discovery Cove (18/jan)",
    prioridade: "media",
    obs: "Decisão ainda em aberto",
  },
  {
    nome: "Legoland + Peppa Pig (17/jan)",
    prioridade: "media",
  },
  {
    nome: "Kennedy Space Center (Gabi/Gustavo/Lucas — 18/jan)",
    prioridade: "media",
  },
  {
    nome: "Lightning Lane (2–3 dias Disney)",
    prioridade: "media",
    obs: "Preços 2027 não divulgados ainda",
  },
  {
    nome: "Universal Express Pass",
    prioridade: "media",
    obs: "Preços 2027 não divulgados ainda",
  },
  {
    nome: "Memory Maker",
    estimativa: "~US$200",
    prioridade: "media",
    obs: "Comprar antes da viagem",
  },
  {
    nome: "Seguro viagem",
    prioridade: "media",
    obs: "Cotando Mastercard Assist",
  },
  {
    nome: "Transfer MCO → Kidani (chegada)",
    prioridade: "baixa",
  },
];
