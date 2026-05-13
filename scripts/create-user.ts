import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import readline from "readline/promises";

const prisma = new PrismaClient();

async function ask(rl: readline.Interface, q: string, hide = false) {
  if (!hide) return (await rl.question(q)).trim();
  // password mode: tem que silenciar o stdout
  process.stdout.write(q);
  return new Promise<string>((resolve) => {
    const stdin = process.stdin;
    stdin.setRawMode?.(true);
    stdin.resume();
    stdin.setEncoding("utf8");
    let pw = "";
    const onData = (key: string) => {
      if (key === "\r" || key === "\n") {
        stdin.setRawMode?.(false);
        stdin.pause();
        stdin.off("data", onData);
        process.stdout.write("\n");
        resolve(pw);
      } else if (key === "\x7f") {
        pw = pw.slice(0, -1);
      } else if (key === "\x03") {
        process.exit(1);
      } else {
        pw += key;
      }
    };
    stdin.on("data", onData);
  });
}

async function main() {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

  console.log("\n👤 Criar / atualizar usuário\n");
  const username = (await ask(rl, "username (sem espaços, lowercase): ")).toLowerCase();
  if (!username) { console.log("vazio, abortando"); rl.close(); return; }

  const existing = await prisma.user.findUnique({ where: { username } });
  if (existing) console.log(`  → usuário "${username}" já existe, vamos atualizar a senha`);

  const name = existing ? existing.name : await ask(rl, "nome completo: ");
  const password = await ask(rl, "senha: ", true);
  if (!password || password.length < 6) { console.log("senha muito curta (mín 6)"); rl.close(); return; }

  const passwordHash = await bcrypt.hash(password, 10);

  if (existing) {
    await prisma.user.update({ where: { username }, data: { passwordHash, name } });
    console.log(`✓ senha atualizada pra "${username}"`);
  } else {
    await prisma.user.create({ data: { username, name, passwordHash, color: "ink", role: "member" } });
    console.log(`✓ usuário "${username}" criado`);
  }

  rl.close();
  await prisma.$disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
