#!/bin/sh
set -e

# Aplica schema (idempotente, seguro rodar sempre)
echo "🔧 Aplicando schema Prisma..."
npx prisma db push --skip-generate --accept-data-loss

# Roda seed apenas se não houver usuários no banco
# (mais robusto que checar arquivo .db, que pode existir vazio/parcial)
if npx tsx scripts/needs-seed.ts; then
  echo "🌱 Banco vazio, rodando seed (usuários, voos, hospedagens, roteiro, dicas)..."
  npx tsx prisma/seed.ts
else
  echo "📦 Banco já populado, pulando seed"
fi

echo "🚀 Subindo servidor Next na porta $PORT..."
exec node server.js
