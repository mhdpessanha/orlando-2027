import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// Para criar usuários, rode `npm run create-user` depois do seed inicial.
// Os usuários abaixo são criados com senha temporária "trocar123" — TODOS devem trocar no primeiro login (a gente implementa isso depois).
const DEFAULT_PASSWORD = "trocar123";

const ADULTS = [
  { username: "murilo",  name: "Murilo",  color: "ep",  role: "admin",  birthday: "1996-03-01" },
  { username: "joana",   name: "Joana",   color: "mk",  role: "admin",  birthday: "1997-01-11" },
  { username: "gabi",    name: "Gabi",    color: "ds",  role: "member", birthday: "1990-11-19" },
  { username: "gustavo", name: "Gustavo", color: "us",  role: "member", birthday: "1994-08-16" },
  { username: "gabriel", name: "Gabriel", color: "ink", role: "member", birthday: "2008-05-09" },
];

// Crianças: entram como User pra reusar a infra (cor, futuras Interest, etc),
// mas não logam (passwordHash vazio é bloqueado em verifyCredentials).
const CHILDREN = [
  { username: "bernardo", name: "Bernardo", color: "hs",   birthday: "2025-05-10" as string | null },
  { username: "olivia",   name: "Olívia",   color: "ak",   birthday: "2022-07-16" as string | null },
  { username: "lucas",    name: "Lucas",    color: "epic", birthday: "2021-07-14" as string | null },
];

const TRIP = {
  title: "Orlando 2027",
  description: "A viagem da família",
  startDate: utc("2027-01-07"),
  endDate:   utc("2027-01-24"),
};

const ACCS = [
  {
    name: "Disney's Animal Kingdom Lodge — Kidani Village",
    shortName: "Kidani Village",
    checkIn:  utc("2027-01-08"),
    checkOut: utc("2027-01-10"),
    address: "3701 Osceola Pkwy, Bay Lake, FL",
    type: "dvc",
    confirmation: "611091807316",
    notes: "DVC · 2 Bedroom Villa - Savanna View\nVista pra savana ideal. Sanaa pra almoço/jantar dá pra ir andando.\n\n• Lava-seca compartilhado gratuito\n• SEM serviço de limpeza diário",
  },
  {
    name: "Disney's Polynesian Villas & Bungalows",
    shortName: "Polynesian",
    checkIn:  utc("2027-01-10"),
    checkOut: utc("2027-01-16"),
    address: "1600 Seven Seas Dr, Orlando, FL",
    type: "dvc",
    confirmation: "612258052666",
    notes: "DVC · monorail loop · 2 quartos Deluxe Studio - Resort View\n\n• Quarto Murilo: 612258052666\n• Quarto Gabriel: 612630731158\n\nTrader Sam's, 'Ohana, Capt. Cook's pra almoço rápido.\n\n• Lava-seca compartilhado gratuito\n• SEM serviço de limpeza diário",
  },
  {
    name: "Vista Cay Resort (Airbnb)",
    shortName: "Vista Cay",
    checkIn:  utc("2027-01-16"),
    checkOut: utc("2027-01-24"),
    address: "5081 Vista Cay Ct, Orlando, FL",
    type: "rental",
    confirmation: "HMPMX9Q4HD",
    notes: "Townhome de 3 andares · reserva via Airbnb · perto do Universal e do International Drive.\nCarro alugado essencial nesse trecho.\n\n• Lava-seca dentro de casa\n• SEM serviço de limpeza diário",
  },
];

const FLIGHTS = [
  // Ida — 7/8 jan. Galeão → Atlanta → Orlando. Codeshare LATAM/Delta (comprado pela LATAM, operado pela Delta)
  {
    direction: "outbound", segment: 1, airline: "LATAM · Delta", flightNumber: "LA 6348 / DL 60",
    fromAirport: "GIG", toAirport: "ATL",
    departure: utcDT("2027-01-07", "21:05"), arrival: utcDT("2027-01-08", "05:18"),
    notes: "Voo noturno · operado pela Delta · horários em horário local de cada aeroporto",
  },
  {
    direction: "outbound", segment: 2, airline: "LATAM · Delta", flightNumber: "LA 6406 / DL 1213",
    fromAirport: "ATL", toAirport: "MCO",
    departure: utcDT("2027-01-08", "08:15"), arrival: utcDT("2027-01-08", "09:47"),
    notes: "Conexão · operado pela Delta · chega Orlando no fim da manhã",
  },
  // Volta — 24 jan tarde.
  {
    direction: "return", segment: 1, airline: "LATAM · Delta", flightNumber: "LA 8754 / DL 1372",
    fromAirport: "MCO", toAirport: "ATL",
    departure: utcDT("2027-01-24", "16:10"), arrival: utcDT("2027-01-24", "17:47"),
    notes: "Sai Orlando final da tarde · operado pela Delta",
  },
  {
    direction: "return", segment: 2, airline: "LATAM · Delta", flightNumber: "LA 6347 / DL 61",
    fromAirport: "ATL", toAirport: "GIG",
    departure: utcDT("2027-01-24", "21:00"), arrival: utcDT("2027-01-25", "08:20"),
    notes: "Voo noturno de volta · operado pela Delta · chega no GIG dia 25 cedo",
  },
];

// Roteiro detalhado — extraído do doc do Roteiro Viagem 2027
const ITINERARY: { date: string; parkCode: string; accShort: string; earlyEntry?: boolean; extendedEvening?: boolean; parkOpen?: string; parkClose?: string; notes?: string }[] = [
  { date: "2027-01-07", parkCode: "travel", accShort: "",                notes: "Embarque GIG 21:05 (DL60) · voo noturno" },
  { date: "2027-01-08", parkCode: "travel", accShort: "Kidani Village", notes: "Chegada Orlando MCO 09:47 · ônibus privado pro AKL · descanso, conhecer hotel · jantar no quarto (vista savana)" },
  { date: "2027-01-09", parkCode: "ak",     accShort: "Kidani Village", parkOpen: "08:00", parkClose: "20:00", earlyEntry: true, notes: "Animal Kingdom dia completo · Safari + Avatar + shows · adultos: Everest e Flight of Passage" },
  { date: "2027-01-10", parkCode: "mk",     accShort: "Polynesian",     parkOpen: "08:00", parkClose: "23:00", notes: "Checkout AKL (Bell Services + app) · Magic Kingdom foco 100% crianças · final da tarde mudança Polynesian (monorail/barco) · jantar no hotel" },
  { date: "2027-01-11", parkCode: "ep",     accShort: "Polynesian",     parkOpen: "09:00", parkClose: "22:00", notes: "🎂 Aniversário da Joana! · café 'Ohana com Lilo e Stitch · EPCOT passeio leve (chegamos no monorail) · jantar Tutto Italia ou World Showcase" },
  { date: "2027-01-12", parkCode: "ep",     accShort: "Polynesian",     parkOpen: "09:00", parkClose: "22:00", notes: "EPCOT segundo dia · atrações Frozen, Remy, Journey of Water · adultos: Guardians + Test Track · Garden Grill com Mickey" },
  { date: "2027-01-13", parkCode: "mk",     accShort: "Polynesian",     parkOpen: "08:00", parkClose: "23:00", notes: "Magic Kingdom dia das princesas · almoço Cinderella's Royal Table dentro do castelo · Fantasyland completa" },
  { date: "2027-01-14", parkCode: "hs",     accShort: "Polynesian",     parkOpen: "08:30", parkClose: "21:00", notes: "Hollywood Studios via Skyliner (saindo do Riviera) · café Topolino's Terrace com Mickey · Toy Story Land · adultos: Tower of Terror, Rock n Roller, Rise of the Resistance · jantar Roundup Rodeo BBQ" },
  { date: "2027-01-15", parkCode: "off",    accShort: "Polynesian",     notes: "Dia livre Disney · ingresso sobrando, sem obrigação de usar · decidir conforme energia e clima das crianças" },
  { date: "2027-01-16", parkCode: "ds",     accShort: "Vista Cay",      notes: "Café leve + checkout Polynesian · buscar carros Alamo 11:30 (Disney Car Care) · almoço Earl of Sandwich (Disney Springs) · checkin Vista Cay · 17h/18h missa Murilo e Joana · Walmart compras" },
  { date: "2027-01-17", parkCode: "off",    accShort: "Vista Cay",      notes: "Domingo (antevéspera de feriado) · opções: SeaWorld, Discovery Cove, Peppa Pig + Legoland, Compras, Kennedy Space Center" },
  { date: "2027-01-18", parkCode: "off",    accShort: "Vista Cay",      notes: "Feriado MLK Day (parques Disney lotam) · mesmas opções do dia 17" },
  { date: "2027-01-19", parkCode: "us",     accShort: "Vista Cay",      parkOpen: "09:00", parkClose: "22:00", notes: "Universal Studios · Minion Land, DreamWorks, ET, Diagon Alley · adultos: Mummy, Gringotts, MIB, Transformers · jantar Five Guys no CityWalk" },
  { date: "2027-01-20", parkCode: "epic",   accShort: "Vista Cay",      parkOpen: "09:00", parkClose: "22:00", notes: "Epic Universe (parque novo 2025) · Express Pass incluso dia todo · How to Train Your Dragon, Nintendo World (Mario, Donkey Kong), Harry Potter Ministry, Stardust Racers, Monstros" },
  { date: "2027-01-21", parkCode: "ioa",    accShort: "Vista Cay",      parkOpen: "09:00", parkClose: "22:00", notes: "Opção A: Islands of Adventure com Express Pass · Seuss Landing, Jurassic playground, Hogsmeade · jantar Marvel · Opção B: dia de compras se cansados" },
  { date: "2027-01-22", parkCode: "off",    accShort: "Vista Cay",      notes: "Primeiro dia de compras · Outlet + Dezerland · grupos pras compras · OU Islands se não foi quinta" },
  { date: "2027-01-23", parkCode: "off",    accShort: "Vista Cay",      notes: "Último dia de compras · fechar malas · 17h/18h missa Murilo e Joana · pode repetir qualquer parque Universal (ingresso ilimitado 14 dias)" },
  { date: "2027-01-24", parkCode: "travel", accShort: "Vista Cay",      notes: "Volta · checkout Vista Cay · almoço por perto · devolver carros 11:30 MCO · sala VIP · voo noturno 21:00" },
];

// Dicas, atrações e refeições previstas por dia — extraído do doc
const TIPS: { date: string; category: string; title: string; priority?: number; notes?: string }[] = [
  // Geral / dia da chegada
  { date: "2027-01-08", category: "todo", title: "Gabi: lembrar de levar a Magic Band", priority: 3 },
  { date: "2027-01-08", category: "tip", title: "Ônibus privado do MCO pro AKL", priority: 2 },

  // 09/01 - Animal Kingdom
  { date: "2027-01-09", category: "dining", title: "Café da manhã Boma (AKL)", priority: 3 },
  { date: "2027-01-09", category: "attraction", title: "Kilimanjaro Safari", priority: 3 },
  { date: "2027-01-09", category: "attraction", title: "Na'vi River Journey (Avatar)", priority: 2, notes: "Tranquilo, ok pras crianças" },
  { date: "2027-01-09", category: "attraction", title: "Avatar Flight of Passage", priority: 3, notes: "Atração TOP · adultos · Lightning Lane essencial" },
  { date: "2027-01-09", category: "attraction", title: "Expedition Everest", priority: 2, notes: "Adultos" },
  { date: "2027-01-09", category: "show", title: "Bluey's Big Play", priority: 1 },
  { date: "2027-01-09", category: "show", title: "Finding Nemo: The Big Blue and Beyond", priority: 1 },
  { date: "2027-01-09", category: "show", title: "Festival of the Lion King", priority: 2 },
  { date: "2027-01-09", category: "dining", title: "Jantar: Sanaa (AKL, vista savana) ou Disney Springs ou Tusker House (com Mickey)", priority: 2 },
  { date: "2027-01-09", category: "tip", title: "Alimentação primeira semana Disney já incluída no valor", priority: 1 },
  { date: "2027-01-09", category: "tip", title: "Lightning Lane estratégica já incluso pros dias Disney", priority: 1 },

  // 10/01 - Magic Kingdom + mudança Polynesian
  { date: "2027-01-10", category: "todo", title: "Fechar malas, pedir Bell Services AKL", priority: 3 },
  { date: "2027-01-10", category: "todo", title: "Checkout AKL pelo app", priority: 3 },
  { date: "2027-01-10", category: "todo", title: "Levar mochilas pro Magic Kingdom (já com bagagens guardadas)", priority: 2 },
  { date: "2027-01-10", category: "tip", title: "Magic Kingdom: foco 100% nas crianças", priority: 2 },
  { date: "2027-01-10", category: "tip", title: "Mudança Polynesian via monorail ou barco no final da tarde", priority: 2 },
  { date: "2027-01-10", category: "dining", title: "Jantar no hotel Polynesian", priority: 1 },

  // 11/01 - EPCOT + ANIVERSÁRIO JOANA
  { date: "2027-01-11", category: "tip", title: "🎂 Aniversário da Joana!", priority: 3 },
  { date: "2027-01-11", category: "dining", title: "Café 'Ohana (com Lilo e Stitch)", priority: 3 },
  { date: "2027-01-11", category: "tip", title: "EPCOT passeio leve · vamos pelo monorail", priority: 2 },
  { date: "2027-01-11", category: "dining", title: "Jantar Tutto Italia (ou outro no World Showcase)", priority: 3 },

  // 12/01 - EPCOT
  { date: "2027-01-12", category: "dining", title: "Café no hotel Polynesian", priority: 1 },
  { date: "2027-01-12", category: "attraction", title: "Journey of Water (Moana)", priority: 2 },
  { date: "2027-01-12", category: "attraction", title: "Mission: Space Playground", priority: 1 },
  { date: "2027-01-12", category: "attraction", title: "Remy's Ratatouille Adventure", priority: 2 },
  { date: "2027-01-12", category: "attraction", title: "Frozen Ever After", priority: 2 },
  { date: "2027-01-12", category: "attraction", title: "Journey Into Imagination", priority: 1 },
  { date: "2027-01-12", category: "attraction", title: "Guardians of the Galaxy: Cosmic Rewind", priority: 3, notes: "Adultos · virtual queue ou Lightning Lane" },
  { date: "2027-01-12", category: "attraction", title: "Test Track", priority: 2, notes: "Adultos" },
  { date: "2027-01-12", category: "dining", title: "Garden Grill (almoço ou jantar) · com Mickey & Amigos · pratos leves", priority: 3 },

  // 13/01 - Magic Kingdom + Cinderella's Royal Table
  { date: "2027-01-13", category: "dining", title: "Café leve no Polynesian (quick service)", priority: 1 },
  { date: "2027-01-13", category: "dining", title: "Almoço Cinderella's Royal Table — dentro do castelo, com as princesas!", priority: 3, notes: "ADR muito difícil · prioridade máxima na abertura (09/nov)" },
  { date: "2027-01-13", category: "attraction", title: "Prince Charming Regal Carrousel", priority: 1 },
  { date: "2027-01-13", category: "attraction", title: "Dumbo the Flying Elephant", priority: 2 },
  { date: "2027-01-13", category: "attraction", title: "The Many Adventures of Winnie the Pooh", priority: 2 },
  { date: "2027-01-13", category: "attraction", title: "It's a Small World", priority: 1 },
  { date: "2027-01-13", category: "show", title: "Mickey's PhilharMagic", priority: 1 },
  { date: "2027-01-13", category: "attraction", title: "The Magic Carpets of Aladdin", priority: 1 },
  { date: "2027-01-13", category: "attraction", title: "Peter Pan's Flight", priority: 2 },

  // 14/01 - Hollywood Studios
  { date: "2027-01-14", category: "dining", title: "Café Topolino's Terrace (Riviera) — com Mickey", priority: 3, notes: "Vamos pro Riviera pra pegar Skyliner depois" },
  { date: "2027-01-14", category: "tip", title: "Ida via Skyliner saindo do Riviera", priority: 2 },
  { date: "2027-01-14", category: "attraction", title: "Mickey & Minnie's Runaway Railway", priority: 3 },
  { date: "2027-01-14", category: "attraction", title: "Toy Story Land · Slinky Dog, Alien Saucers, Toy Story Mania", priority: 3 },
  { date: "2027-01-14", category: "show", title: "Disney Junior Play & Dance!", priority: 1 },
  { date: "2027-01-14", category: "attraction", title: "Tower of Terror", priority: 3, notes: "Adultos · top do parque" },
  { date: "2027-01-14", category: "attraction", title: "Rock 'n' Roller Coaster", priority: 3, notes: "Adultos" },
  { date: "2027-01-14", category: "attraction", title: "Rise of the Resistance", priority: 3, notes: "Adultos · Galaxy's Edge · Lightning Lane essencial" },
  { date: "2027-01-14", category: "dining", title: "Jantar Roundup Rodeo BBQ — Quarto do Andy (sem personagens)", priority: 2 },

  // 15/01 - Dia livre Disney
  { date: "2027-01-15", category: "tip", title: "Dia livre Disney · ingresso sobrando, sem obrigação de usar", priority: 2 },
  { date: "2027-01-15", category: "tip", title: "Decidir conforme energia e clima das crianças", priority: 2 },
  { date: "2027-01-15", category: "dining", title: "Ideia: Crystal Palace (Magic Kingdom, com Pooh & amigos)", priority: 1 },
  { date: "2027-01-15", category: "dining", title: "Ideia: Grand Floridian Cafe (hotel ao lado, leve e bem falado)", priority: 1 },

  // 16/01 - Mudança Vista Cay
  { date: "2027-01-16", category: "todo", title: "Café leve e despedida do Polynesian", priority: 2 },
  { date: "2027-01-16", category: "todo", title: "Checkout Polynesian", priority: 3 },
  { date: "2027-01-16", category: "todo", title: "Buscar carros Alamo 11:30 (Disney Car Care Center)", priority: 3 },
  { date: "2027-01-16", category: "dining", title: "Almoço Earl of Sandwich (Disney Springs)", priority: 2 },
  { date: "2027-01-16", category: "todo", title: "Checkin Vista Cay — townhome de 3 andares", priority: 3 },
  { date: "2027-01-16", category: "tip", title: "Murilo e Joana — missa 17h ou 18h", priority: 2 },
  { date: "2027-01-16", category: "todo", title: "Compras Walmart pra semana", priority: 2 },
  { date: "2027-01-16", category: "tip", title: "Segunda semana: maior parte das refeições em casa", priority: 1 },

  // 17/01 - Opções domingo
  { date: "2027-01-17", category: "tip", title: "Opção 1: SeaWorld · golfinhos, orcas, Vila Sésamo, montanhas-russas (adultos)", priority: 1 },
  { date: "2027-01-17", category: "tip", title: "Opção 2: Discovery Cove · all-inclusive, arraias, aviário, rio lento", priority: 1, notes: "Nado com golfinhos NÃO permite menores de 6 anos" },
  { date: "2027-01-17", category: "tip", title: "Opção 3: Peppa Pig + Legoland · 1h de Orlando · ideal pra crianças até 8 anos", priority: 1 },
  { date: "2027-01-17", category: "tip", title: "Opção 4: Descanso + Compras · Outlet, Walmart, departamentos", priority: 1 },
  { date: "2027-01-17", category: "tip", title: "Opção 5: Kennedy Space Center · parque da NASA", priority: 1 },

  // 18/01 - Feriado MLK
  { date: "2027-01-18", category: "tip", title: "Feriado nacional MLK Day · Disney provavelmente lotado", priority: 2 },
  { date: "2027-01-18", category: "tip", title: "Mesmas opções do dia 17 (SeaWorld, Discovery Cove, Peppa, Compras, Kennedy)", priority: 1 },

  // 19/01 - Universal Studios
  { date: "2027-01-19", category: "tip", title: "Avaliar se Express Pass vale a pena (Universal Studios)", priority: 2, notes: "Não incluso · só pros dias Islands e Epic já tem incluso" },
  { date: "2027-01-19", category: "attraction", title: "Minion Land", priority: 2 },
  { date: "2027-01-19", category: "attraction", title: "DreamWorks Land", priority: 2 },
  { date: "2027-01-19", category: "attraction", title: "E.T. Adventure", priority: 2 },
  { date: "2027-01-19", category: "attraction", title: "Harry Potter — Diagon Alley", priority: 3 },
  { date: "2027-01-19", category: "attraction", title: "Revenge of the Mummy", priority: 2, notes: "Adultos" },
  { date: "2027-01-19", category: "attraction", title: "Escape from Gringotts", priority: 3, notes: "Adultos" },
  { date: "2027-01-19", category: "attraction", title: "Men in Black: Alien Attack", priority: 2, notes: "Adultos" },
  { date: "2027-01-19", category: "attraction", title: "Transformers: The Ride 3D", priority: 2, notes: "Adultos" },
  { date: "2027-01-19", category: "dining", title: "Jantar Five Guys (CityWalk)", priority: 1 },
  { date: "2027-01-19", category: "tip", title: "Passeio tranquilo · voltar cedo pra casa", priority: 1 },

  // 20/01 - Epic Universe
  { date: "2027-01-20", category: "tip", title: "Express Pass incluso · usar pra valer", priority: 3 },
  { date: "2027-01-20", category: "attraction", title: "How to Train Your Dragon — Isle of Berk", priority: 3 },
  { date: "2027-01-20", category: "attraction", title: "Super Nintendo World — Mario Kart Ride", priority: 3 },
  { date: "2027-01-20", category: "attraction", title: "Super Nintendo World — Donkey Kong Mine-Cart Madness", priority: 3 },
  { date: "2027-01-20", category: "attraction", title: "Harry Potter — Battle at the Ministry", priority: 3, notes: "Adultos" },
  { date: "2027-01-20", category: "attraction", title: "Constellation Carrousel (Celestial Park)", priority: 1 },
  { date: "2027-01-20", category: "attraction", title: "Stardust Racers", priority: 2, notes: "Adultos" },
  { date: "2027-01-20", category: "attraction", title: "Dark Universe — área dos monstros", priority: 2, notes: "Adultos" },

  // 21/01 - Islands of Adventure (ou compras)
  { date: "2027-01-21", category: "tip", title: "Express Pass incluso", priority: 3 },
  { date: "2027-01-21", category: "tip", title: "Estratégia: vir aqui na quinta evita pegar pior dia (sexta) e libera jantar Marvel", priority: 2 },
  { date: "2027-01-21", category: "attraction", title: "Seuss Landing", priority: 2 },
  { date: "2027-01-21", category: "attraction", title: "Jurassic Park — playground", priority: 2 },
  { date: "2027-01-21", category: "attraction", title: "Harry Potter — Hogsmeade", priority: 3 },
  { date: "2027-01-21", category: "dining", title: "Jantar com heróis Marvel · Capitão América, Homem Aranha, X-Men", priority: 3 },
  { date: "2027-01-21", category: "tip", title: "Plano B (se cansados): dia de compras · Outlet, Michaels, Farmácias, Florida Mall, Crayola", priority: 1 },

  // 22/01 - Compras
  { date: "2027-01-22", category: "todo", title: "Dia de compras no Outlet (do lado de casa)", priority: 2 },
  { date: "2027-01-22", category: "tip", title: "Dezerland (do lado do Outlet) · arcade, cama elástica, kart pras crianças", priority: 1 },
  { date: "2027-01-22", category: "tip", title: "Dividir grupos pras compras render", priority: 1 },
  { date: "2027-01-22", category: "tip", title: "Plano B: Islands se não foi quinta (ingresso permite ilimitado em 14 dias)", priority: 1 },

  // 23/01 - Último dia compras
  { date: "2027-01-23", category: "todo", title: "Últimas compras — dividir tarefas (Outlet, Farmácias, Michaels, Walmart, departamentos)", priority: 3 },
  { date: "2027-01-23", category: "todo", title: "Fechar as malas", priority: 3 },
  { date: "2027-01-23", category: "tip", title: "Quem quiser pode repetir qualquer parque Universal", priority: 1 },
  { date: "2027-01-23", category: "tip", title: "Murilo e Joana — missa 17h ou 18h", priority: 2 },

  // 24/01 - Volta
  { date: "2027-01-24", category: "todo", title: "Checkout Vista Cay", priority: 3 },
  { date: "2027-01-24", category: "todo", title: "Almoço por perto", priority: 2 },
  { date: "2027-01-24", category: "todo", title: "Devolver carros Alamo 11:30 no MCO", priority: 3 },
  { date: "2027-01-24", category: "tip", title: "Sala VIP no aeroporto", priority: 2 },
];

// Reservas já compradas — ingressos e carros
const RESERVATIONS = [
  {
    type: "ticket",
    name: "Disney 7 Day Base Ticket",
    date: utc("2027-01-09"),
    location: "Walt Disney World",
    partySize: 8,
    notes: "Ingresso base de 7 dias para os 4 parques Disney · sem Park Hopper",
  },
  {
    type: "ticket",
    name: "Universal Three Parks Adventure",
    date: utc("2027-01-17"),
    location: "Universal Orlando",
    partySize: 8,
    notes: "Universal Studios + Islands of Adventure + Volcano Bay",
  },
  {
    type: "car",
    name: "Alamo — Carro Murilo (Ford Expedition Max / Jeep Wagoneer L)",
    date: utc("2027-01-16"),
    time: "11:30",
    location: "Disney Car Care Center",
    confirmation: "2109172844COUNT",
    notes: "FORD EXPEDITION MAX, JEEP WAGONEER L OR SIMILAR\n\n• Retirada: Disney Car Care Center · 16/01 às 11:30\n• Devolução: MCO · 24/01 às 11:30",
  },
  {
    type: "car",
    name: "Alamo — Carro Gustavo (Nissan Rogue)",
    date: utc("2027-01-16"),
    time: "11:30",
    location: "Disney Car Care Center",
    confirmation: "2109172848COUNT",
    notes: "NISSAN ROGUE OR SIMILAR\n\n• Retirada: Disney Car Care Center · 16/01 às 11:30\n• Devolução: MCO · 24/01 às 11:30",
  },
];

// Eventos / marcos de preparação
const EVENTS = [
  { title: "Conferir validade dos passaportes",     date: utc("2026-06-01"), category: "document",  description: "Bernardo, Olívia e Lucas precisam ter no mínimo 6 meses de validade", status: "pending" },
  { title: "ESTA pra todos",                         date: utc("2026-10-08"), category: "document",  description: "ESTA dura 2 anos · solicitar de novo se estiver vencendo", status: "pending" },
  { title: "Abertura de ADRs (60 dias do check-in)", date: utc("2026-11-09"), category: "booking",   description: "Janela pra reservar restaurantes pros primeiros 10 dias da viagem", status: "pending" },
  { title: "Comprar ingressos dos parques",          date: utc("2026-09-01"), category: "shopping",  description: "Disney 7 Day + Universal 3 Parks Adventure", status: "done" },
  { title: "Modificar / confirmar reservas DVC",     date: utc("2026-07-01"), category: "booking",   description: "Kidani 8-10 jan, Polynesian 10-16 jan", status: "done" },
  { title: "Configurar Lightning Lane Multi Pass",   date: utc("2027-01-01"), category: "booking",   description: "7 dias antes da primeira visita a cada parque", status: "pending" },
  { title: "Comprar seguro viagem",                  date: utc("2026-12-01"), category: "shopping",  description: "Todos os 8 viajantes", status: "pending" },
  { title: "Reservar carro alugado (Alamo)",         date: utc("2026-10-01"), category: "shopping",  description: "2 carros: Expedition/Wagoneer + Nissan Rogue · Disney Car Care Center → MCO", status: "done" },
  { title: "Autorização de viagem dos menores",      date: utc("2026-11-01"), category: "document",  description: "Olívia, Bernardo, Lucas · cartório · vale 2 anos", status: "pending" },
];

function utc(s: string) {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

function utcDT(date: string, time: string) {
  const [y, mo, d] = date.split("-").map(Number);
  const [h, mi] = time.split(":").map(Number);
  return new Date(Date.UTC(y, mo - 1, d, h, mi));
}

async function main() {
  console.log("🌟 Seeding Orlando 2027…");

  // users (adultos)
  const hash = await bcrypt.hash(DEFAULT_PASSWORD, 10);
  for (const u of ADULTS) {
    const birthday = u.birthday ? utc(u.birthday) : null;
    await prisma.user.upsert({
      where: { username: u.username },
      update: { name: u.name, color: u.color, role: u.role, kind: "adult", birthday },
      create: { username: u.username, name: u.name, color: u.color, role: u.role, passwordHash: hash, kind: "adult", birthday },
    });
  }
  console.log(`  ✓ ${ADULTS.length} adultos (senha temporária: "${DEFAULT_PASSWORD}")`);

  // crianças (sem login)
  for (const c of CHILDREN) {
    const birthday = c.birthday ? utc(c.birthday) : null;
    await prisma.user.upsert({
      where: { username: c.username },
      update: { name: c.name, color: c.color, kind: "child", needsTravelAuth: true, birthday },
      create: {
        username: c.username,
        name: c.name,
        color: c.color,
        role: "member",
        passwordHash: "",
        kind: "child",
        needsTravelAuth: true,
        birthday,
      },
    });
  }
  console.log(`  ✓ ${CHILDREN.length} crianças (sem login)`);

  // trip
  await prisma.trip.upsert({
    where: { id: 1 },
    update: TRIP,
    create: { id: 1, ...TRIP },
  });
  console.log("  ✓ trip");

  // accommodations
  await prisma.accommodation.deleteMany({});
  const accMap = new Map<string, string>();
  for (const a of ACCS) {
    const created = await prisma.accommodation.create({ data: a });
    accMap.set(a.shortName, created.id);
  }
  console.log(`  ✓ ${ACCS.length} hospedagens`);

  // flights
  await prisma.flight.deleteMany({});
  for (const f of FLIGHTS) {
    await prisma.flight.create({ data: f });
  }
  console.log(`  ✓ ${FLIGHTS.length} segmentos de voo`);

  // days
  await prisma.day.deleteMany({});
  const dayByDate = new Map<string, string>();
  for (const d of ITINERARY) {
    const date = utc(d.date);
    const created = await prisma.day.create({
      data: {
        date,
        parkCode: d.parkCode,
        accommodationId: d.accShort ? accMap.get(d.accShort) ?? null : null,
        earlyEntry: !!d.earlyEntry,
        extendedEvening: !!d.extendedEvening,
        parkOpen: d.parkOpen ?? null,
        parkClose: d.parkClose ?? null,
        notes: d.notes ?? null,
      },
    });
    dayByDate.set(d.date, created.id);
  }
  console.log(`  ✓ ${ITINERARY.length} dias do roteiro`);

  // reservations
  await prisma.reservation.deleteMany({});
  for (const r of RESERVATIONS) {
    const isoDate = r.date.toISOString().slice(0, 10);
    await prisma.reservation.create({
      data: { ...r, dayId: dayByDate.get(isoDate) ?? null },
    });
  }
  console.log(`  ✓ ${RESERVATIONS.length} reservas (ingressos + carros)`);

  // tips per day
  await prisma.tip.deleteMany({});
  let tipsCount = 0;
  for (const t of TIPS) {
    const dayId = dayByDate.get(t.date);
    if (!dayId) { console.warn(`  ⚠ tip sem dia correspondente: ${t.date} — ${t.title}`); continue; }
    await prisma.tip.create({
      data: {
        dayId,
        category: t.category,
        title: t.title,
        notes: t.notes ?? null,
        priority: t.priority ?? 0,
      },
    });
    tipsCount++;
  }
  console.log(`  ✓ ${tipsCount} dicas/atrações/refeições`);

  // events
  await prisma.event.deleteMany({});
  for (const e of EVENTS) {
    await prisma.event.create({ data: e });
  }
  console.log(`  ✓ ${EVENTS.length} eventos`);

  console.log("\n✨ Tudo pronto! Acesse http://localhost:3000 e faça login com qualquer username acima.\n");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
