# 🏰 Orlando 2027

Site privado da viagem de janeiro de 2027 pra Orlando. Hospedado em casa, exposto via Cloudflare Tunnel, com login simples por usuário e senha.

## Stack

- **Next.js 15** (App Router, Server Actions)
- **TypeScript**
- **Prisma + SQLite** (banco em arquivo, fácil de backup — é só `cp data/orlando.db`)
- **Tailwind CSS** com paleta personalizada por parque
- **bcryptjs** + cookies HTTP-only pra auth (sem libs gigantes tipo Auth.js)
- **Docker + Cloudflare Tunnel** pra deploy

## Funcionalidades do MVP

- 🏠 **Dashboard** com countdown ticking, stats, próximo evento crítico e prévia do roteiro
- 🗺️ **Roteiro** dia a dia, cada dia com parque, hospedagem, horários, reservas, dicas/atrações (com checklist)
- 🎟️ **Reservas** filtrável por tipo (restaurante, voo, ingresso, etc), com códigos de confirmação destacados, CRUD completo
- ✈️ **Voos** com ida/volta e conexão em Atlanta
- 🏨 **Hospedagens** com check-in/out, confirmação e notas
- 🔔 **Eventos** com checklist de marcos importantes (ESTA, abertura de ADRs, pagamentos)
- 🔒 **Login** por usuário/senha, sessão de 30 dias em cookie HTTP-only

## Setup local (desenvolvimento)

```bash
# 1. instalar dependências
npm install

# 2. criar .env (copia o exemplo)
cp .env.example .env

# 3. inicializar o banco
npm run db:push
npm run db:seed

# 4. rodar em dev
npm run dev
```

Acesse http://localhost:3000 e faça login com qualquer username (`murilo`, `joana`, `gabi`, `gustavo`, `gabriel`) — a senha temporária criada pelo seed é `trocar123`.

**Antes de expor pra internet:** rode `npm run create-user` pra trocar a senha de cada usuário pra uma senha real.

## Deploy no Mac Mini

### 1. Configurar Cloudflare Tunnel

No painel da Cloudflare:

1. Vai em **Zero Trust** (sidebar) → **Networks** → **Tunnels**
2. Cria um tunnel novo, escolhe **Cloudflared** como connector
3. Dá um nome (ex: `homeserver`) e copia o **tunnel token** (linha bem longa começando com `eyJ...`)
4. Na aba **Public Hostname** desse tunnel, adiciona:
   - **Subdomain**: `orlando`
   - **Domain**: `pessanhaserver.com.br`
   - **Service**: `http://app:3000` (o nome do serviço no docker-compose)
5. Salva

### 2. (Opcional, recomendado) Cloudflare Access pra controle de acesso extra

Mesmo com login no site, dá pra colocar uma camada na frente pelo Cloudflare Access — só emails autorizados conseguem chegar no site:

1. Em **Zero Trust** → **Access** → **Applications** → **Add an application** → **Self-hosted**
2. Nome: "Orlando 2027", domínio: `orlando.pessanhaserver.com.br`
3. Em **Policies**, cria uma policy "Allow" com:
   - **Selector**: Emails
   - **Value**: os 5 emails dos viajantes
4. Salva

Agora qualquer acesso ao subdomínio cai numa tela de OTP por email do Cloudflare antes de chegar no app. Belt and suspenders.

### 3. Subir no Mac Mini

No Mac Mini (com Docker Desktop ou OrbStack rodando):

```bash
# clona o repo
git clone git@github.com:murilo/orlando-2027.git
cd orlando-2027

# cria o .env de produção (vazio é OK — o compose já tem o que precisa)
touch .env

# build + up
docker compose up -d --build

# inicializa o banco dentro do container
docker compose exec app sh -c "npx prisma db push && npx tsx prisma/seed.ts"

# troca a senha de cada usuário (rode 5x, uma pra cada pessoa)
docker compose exec app sh -c "npx tsx scripts/create-user.ts"
```

Acessa em https://orlando.pessanhaserver.com.br. Pronto. ✨

### Backups do banco

O SQLite fica em `./data/orlando.db` no Mac Mini. Pra backup, basta copiar esse arquivo:

```bash
# backup manual
cp data/orlando.db ~/backups/orlando-$(date +%Y%m%d).db

# ou cron diário
echo "0 3 * * * cp /caminho/orlando-2027/data/orlando.db ~/backups/orlando-\$(date +\%Y\%m\%d).db" | crontab -
```

### Atualizar versão

```bash
git pull
docker compose up -d --build
```

O banco não é apagado entre rebuilds (fica no volume `./data`).

## Estrutura do projeto

```
src/
├── app/
│   ├── page.tsx               # dashboard
│   ├── login/
│   ├── roteiro/               # lista de dias
│   │   └── [date]/            # detalhe do dia (a tela mais rica)
│   ├── reservas/              # lista + CRUD
│   │   ├── nova/
│   │   └── [id]/
│   ├── voos/
│   ├── hospedagens/
│   ├── eventos/
│   └── api/auth/              # login/logout
├── components/                # Nav, CountdownHero, ParkBadge, etc
├── lib/                       # prisma, auth, parks, dates, actions
└── middleware.ts              # protege rotas
```

## Próximos passos (pós-MVP)

- [ ] CRUD de voos pela UI (hoje só edita via seed/Prisma Studio)
- [ ] CRUD de hospedagens pela UI
- [ ] CRUD de eventos pela UI
- [ ] Notificações por Telegram (você já tem o bot do monitor DVC)
- [ ] Upload de docs (passaportes, vistos, ESTA)
- [ ] Tela "minha turma" — quem é cada um, com avatar
- [ ] Comentários por dia/reserva
- [ ] Crowd calendar dos parques (API do queue-times)
- [ ] Lista de compras compartilhada
- [ ] Split de despesas
- [ ] Galeria de fotos (durante e pós-viagem)

## Dúvidas e ajustes

Pra editar dados sem mexer no código: rode `npm run db:studio` em dev pra abrir o Prisma Studio. Em produção, dá pra rodar dentro do container com `docker compose exec app sh -c "npx prisma studio"` e fazer port-forward.
