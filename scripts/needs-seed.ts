import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

let needsSeed = false;
try {
  const count = await prisma.user.count();
  needsSeed = count === 0;
} catch {
  // se a query falhou (tabela não existe etc), assume que precisa seed
  needsSeed = true;
}

await prisma.$disconnect();
process.exit(needsSeed ? 0 : 1);
