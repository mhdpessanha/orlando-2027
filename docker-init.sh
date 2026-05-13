#!/bin/sh
set -e

DB_FILE="/app/data/orlando.db"
NEEDS_SEED=false

if [ ! -f "$DB_FILE" ]; then
  echo "📦 Primeira inicialização detectada — banco não existe ainda"
  NEEDS_SEED=true
fi

echo "🔧 Aplicando schema Prisma..."
npx prisma db push --skip-generate --accept-data-loss

if [ "$NEEDS_SEED" = "true" ]; then
  echo "🌱 Rodando seed (usuários, hospedagens, voos, roteiro)..."
  npx tsx prisma/seed.ts
fi

echo "🚀 Subindo servidor Next na porta $PORT..."
exec node server.js
