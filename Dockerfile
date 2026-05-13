FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install --no-audit --no-fund

FROM node:20-alpine AS builder
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
RUN npm run build

FROM node:20-alpine AS runner
RUN apk add --no-cache openssl
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs

# Next.js standalone output
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Prisma schema, seed, scripts e package.json (precisamos pra init)
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/scripts ./scripts
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json

# node_modules completo: traz tsx e prisma CLI pro init + create-user
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules

# Script de inicialização
COPY --chown=nextjs:nodejs docker-init.sh ./docker-init.sh
RUN chmod +x ./docker-init.sh

# Diretório de dados (volume) com ownership correto
RUN mkdir -p /app/data && chown -R nextjs:nodejs /app/data
VOLUME /app/data

USER nextjs
EXPOSE 3000
CMD ["./docker-init.sh"]
