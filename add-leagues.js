const fs = require('fs');

let c = fs.readFileSync('src/config/seededData.ts', 'utf8');

// 1. Add Eredivisie and Liga Portugal to League Type
c = c.replace(
  'league: "EPL" | "La Liga" | "Serie A" | "Bundesliga" | "Ligue 1";',
  'league: "EPL" | "La Liga" | "Serie A" | "Bundesliga" | "Ligue 1" | "Eredivisie" | "Liga Portugal";'
);

// 2. Add League Info
c = c.replace(
  '"Ligue 1": { name: "Ligue 1", color: "#64748B", emoji: "🇫🇷" },',
  `"Ligue 1": { name: "Ligue 1", color: "#64748B", emoji: "🇫🇷" },\n  "Eredivisie": { name: "Eredivisie", color: "#f97316", emoji: "🇳🇱" },\n  "Liga Portugal": { name: "Liga Portugal", color: "#16a34a", emoji: "🇵🇹" },`
);

// 3. Add Clubs Data for Eredivisie and Liga Portugal
const newClubs = `  // Eredivisie (18)
  { id: "psv", name: "PSV Eindhoven", shortName: "PSV", league: "Eredivisie", primaryColor: "#dc2626", secondaryColor: "#ffffff", reputation: 83, stadium: "Philips Stadion", capacity: 35119, transferBudget: 35000000, wageBudget: 1500000, bankBalance: 52500000, ticketPrice: 40, stadiumCondition: 92, sponsorships: [] },
  { id: "feyenoord", name: "Feyenoord", shortName: "Feyenoord", league: "Eredivisie", primaryColor: "#dc2626", secondaryColor: "#ffffff", reputation: 82, stadium: "De Kuip", capacity: 51117, transferBudget: 30000000, wageBudget: 1400000, bankBalance: 49000000, ticketPrice: 42, stadiumCondition: 78, sponsorships: [] },
  { id: "ajax", name: "AFC Ajax", shortName: "Ajax", league: "Eredivisie", primaryColor: "#dc2626", secondaryColor: "#ffffff", reputation: 84, stadium: "Johan Cruyff Arena", capacity: 55865, transferBudget: 40000000, wageBudget: 1700000, bankBalance: 59500000, ticketPrice: 45, stadiumCondition: 94, sponsorships: [] },
  { id: "az", name: "AZ Alkmaar", shortName: "AZ", league: "Eredivisie", primaryColor: "#dc2626", secondaryColor: "#ffffff", reputation: 77, stadium: "AFAS Stadion", capacity: 19500, transferBudget: 18000000, wageBudget: 900000, bankBalance: 31500000, ticketPrice: 35, stadiumCondition: 95, sponsorships: [] },
  { id: "twente", name: "FC Twente", shortName: "Twente", league: "Eredivisie", primaryColor: "#dc2626", secondaryColor: "#ffffff", reputation: 76, stadium: "De Grolsch Veste", capacity: 30205, transferBudget: 15000000, wageBudget: 850000, bankBalance: 29750000, ticketPrice: 33, stadiumCondition: 88, sponsorships: [] },
  { id: "sparta", name: "Sparta Rotterdam", shortName: "Sparta", league: "Eredivisie", primaryColor: "#dc2626", secondaryColor: "#ffffff", reputation: 72, stadium: "Het Kasteel", capacity: 10599, transferBudget: 7000000, wageBudget: 500000, bankBalance: 17500000, ticketPrice: 28, stadiumCondition: 82, sponsorships: [] },
  { id: "utrecht", name: "FC Utrecht", shortName: "Utrecht", league: "Eredivisie", primaryColor: "#dc2626", secondaryColor: "#ffffff", reputation: 74, stadium: "Stadion Galgenwaard", capacity: 23750, transferBudget: 10000000, wageBudget: 700000, bankBalance: 24500000, ticketPrice: 32, stadiumCondition: 79, sponsorships: [] },
  { id: "heerenveen", name: "SC Heerenveen", shortName: "Heerenveen", league: "Eredivisie", primaryColor: "#1e3a8a", secondaryColor: "#ffffff", reputation: 73, stadium: "Abe Lenstra Stadion", capacity: 27224, transferBudget: 9000000, wageBudget: 600000, bankBalance: 21000000, ticketPrice: 30, stadiumCondition: 84, sponsorships: [] },
  { id: "goaheadeagles", name: "Go Ahead Eagles", shortName: "GA Eagles", league: "Eredivisie", primaryColor: "#facc15", secondaryColor: "#dc2626", reputation: 71, stadium: "De Adelaarshorst", capacity: 9909, transferBudget: 6000000, wageBudget: 450000, bankBalance: 15750000, ticketPrice: 25, stadiumCondition: 72, sponsorships: [] },
  { id: "nec", name: "NEC Nijmegen", shortName: "NEC", league: "Eredivisie", primaryColor: "#dc2626", secondaryColor: "#16a34a", reputation: 72, stadium: "Goffertstadion", capacity: 12500, transferBudget: 7000000, wageBudget: 480000, bankBalance: 16800000, ticketPrice: 27, stadiumCondition: 70, sponsorships: [] },
  { id: "pec", name: "PEC Zwolle", shortName: "Zwolle", league: "Eredivisie", primaryColor: "#1e3a8a", secondaryColor: "#ffffff", reputation: 70, stadium: "MAC³PARK Stadion", capacity: 14000, transferBudget: 5000000, wageBudget: 400000, bankBalance: 14000000, ticketPrice: 24, stadiumCondition: 81, sponsorships: [] },
  { id: "fortuna", name: "Fortuna Sittard", shortName: "Fortuna", league: "Eredivisie", primaryColor: "#facc15", secondaryColor: "#16a34a", reputation: 70, stadium: "Fortuna Sittard Stadion", capacity: 12800, transferBudget: 6000000, wageBudget: 420000, bankBalance: 14700000, ticketPrice: 26, stadiumCondition: 75, sponsorships: [] },
  { id: "heracles", name: "Heracles Almelo", shortName: "Heracles", league: "Eredivisie", primaryColor: "#000000", secondaryColor: "#ffffff", reputation: 70, stadium: "Erve Asito", capacity: 12080, transferBudget: 5000000, wageBudget: 400000, bankBalance: 14000000, ticketPrice: 25, stadiumCondition: 88, sponsorships: [] },
  { id: "rkc", name: "RKC Waalwijk", shortName: "RKC", league: "Eredivisie", primaryColor: "#facc15", secondaryColor: "#1e3a8a", reputation: 69, stadium: "Mandemakers Stadion", capacity: 7500, transferBudget: 4000000, wageBudget: 350000, bankBalance: 12250000, ticketPrice: 22, stadiumCondition: 65, sponsorships: [] },
  { id: "almere", name: "Almere City FC", shortName: "Almere", league: "Eredivisie", primaryColor: "#dc2626", secondaryColor: "#000000", reputation: 68, stadium: "Yanmar Stadion", capacity: 4501, transferBudget: 3000000, wageBudget: 300000, bankBalance: 10500000, ticketPrice: 20, stadiumCondition: 70, sponsorships: [] },
  { id: "willemii", name: "Willem II", shortName: "Willem II", league: "Eredivisie", primaryColor: "#dc2626", secondaryColor: "#1e3a8a", reputation: 71, stadium: "Koning Willem II Stadion", capacity: 14700, transferBudget: 6000000, wageBudget: 450000, bankBalance: 15750000, ticketPrice: 26, stadiumCondition: 80, sponsorships: [] },
  { id: "nac", name: "NAC Breda", shortName: "NAC Breda", league: "Eredivisie", primaryColor: "#facc15", secondaryColor: "#000000", reputation: 71, stadium: "Rat Verlegh Stadion", capacity: 19000, transferBudget: 6500000, wageBudget: 480000, bankBalance: 16800000, ticketPrice: 28, stadiumCondition: 85, sponsorships: [] },
  { id: "groningen", name: "FC Groningen", shortName: "Groningen", league: "Eredivisie", primaryColor: "#16a34a", secondaryColor: "#ffffff", reputation: 73, stadium: "Euroborg", capacity: 22550, transferBudget: 8000000, wageBudget: 550000, bankBalance: 19250000, ticketPrice: 30, stadiumCondition: 90, sponsorships: [] },

  // Liga Portugal (18)
  { id: "sporting", name: "Sporting CP", shortName: "Sporting", league: "Liga Portugal", primaryColor: "#16a34a", secondaryColor: "#ffffff", reputation: 84, stadium: "Estádio José Alvalade", capacity: 50095, transferBudget: 45000000, wageBudget: 1600000, bankBalance: 56000000, ticketPrice: 42, stadiumCondition: 90, sponsorships: [] },
  { id: "benfica", name: "SL Benfica", shortName: "Benfica", league: "Liga Portugal", primaryColor: "#dc2626", secondaryColor: "#ffffff", reputation: 85, stadium: "Estádio da Luz", capacity: 64642, transferBudget: 50000000, wageBudget: 1800000, bankBalance: 63000000, ticketPrice: 45, stadiumCondition: 95, sponsorships: [] },
  { id: "porto", name: "FC Porto", shortName: "Porto", league: "Liga Portugal", primaryColor: "#1d4ed8", secondaryColor: "#ffffff", reputation: 85, stadium: "Estádio do Dragão", capacity: 50033, transferBudget: 45000000, wageBudget: 1700000, bankBalance: 59500000, ticketPrice: 44, stadiumCondition: 94, sponsorships: [] },
  { id: "braga", name: "SC Braga", shortName: "Braga", league: "Liga Portugal", primaryColor: "#dc2626", secondaryColor: "#ffffff", reputation: 80, stadium: "Estádio Municipal de Braga", capacity: 30286, transferBudget: 20000000, wageBudget: 1000000, bankBalance: 35000000, ticketPrice: 35, stadiumCondition: 96, sponsorships: [] },
  { id: "guimaraes", name: "Vitória de Guimarães", shortName: "Vitória SC", league: "Liga Portugal", primaryColor: "#ffffff", secondaryColor: "#000000", reputation: 77, stadium: "Estádio D. Afonso Henriques", capacity: 30000, transferBudget: 12000000, wageBudget: 750000, bankBalance: 26250000, ticketPrice: 30, stadiumCondition: 85, sponsorships: [] },
  { id: "moreirense", name: "Moreirense FC", shortName: "Moreirense", league: "Liga Portugal", primaryColor: "#16a34a", secondaryColor: "#ffffff", reputation: 73, stadium: "Parque Joaquim de Almeida Freitas", capacity: 6153, transferBudget: 6000000, wageBudget: 400000, bankBalance: 14000000, ticketPrice: 22, stadiumCondition: 70, sponsorships: [] },
  { id: "arouca", name: "FC Arouca", shortName: "Arouca", league: "Liga Portugal", primaryColor: "#facc15", secondaryColor: "#1d4ed8", reputation: 72, stadium: "Estádio Municipal de Arouca", capacity: 5000, transferBudget: 5000000, wageBudget: 350000, bankBalance: 12250000, ticketPrice: 20, stadiumCondition: 75, sponsorships: [] },
  { id: "famalicao", name: "FC Famalicão", shortName: "Famalicão", league: "Liga Portugal", primaryColor: "#1d4ed8", secondaryColor: "#ffffff", reputation: 75, stadium: "Estádio Municipal 22 de Junho", capacity: 5307, transferBudget: 10000000, wageBudget: 600000, bankBalance: 21000000, ticketPrice: 25, stadiumCondition: 80, sponsorships: [] },
  { id: "casapia", name: "Casa Pia AC", shortName: "Casa Pia", league: "Liga Portugal", primaryColor: "#000000", secondaryColor: "#ffffff", reputation: 72, stadium: "Estádio Pina Manique", capacity: 2574, transferBudget: 5000000, wageBudget: 350000, bankBalance: 12250000, ticketPrice: 20, stadiumCondition: 65, sponsorships: [] },
  { id: "farense", name: "SC Farense", shortName: "Farense", league: "Liga Portugal", primaryColor: "#000000", secondaryColor: "#ffffff", reputation: 71, stadium: "Estádio de São Luís", capacity: 12000, transferBudget: 4500000, wageBudget: 300000, bankBalance: 10500000, ticketPrice: 22, stadiumCondition: 68, sponsorships: [] },
  { id: "rioave", name: "Rio Ave FC", shortName: "Rio Ave", league: "Liga Portugal", primaryColor: "#16a34a", secondaryColor: "#ffffff", reputation: 73, stadium: "Estádio dos Arcos", capacity: 9065, transferBudget: 6000000, wageBudget: 420000, bankBalance: 14700000, ticketPrice: 24, stadiumCondition: 77, sponsorships: [] },
  { id: "gilvicente", name: "Gil Vicente FC", shortName: "Gil Vicente", league: "Liga Portugal", primaryColor: "#dc2626", secondaryColor: "#ffffff", reputation: 73, stadium: "Estádio Cidade de Barcelos", capacity: 12504, transferBudget: 5500000, wageBudget: 400000, bankBalance: 14000000, ticketPrice: 23, stadiumCondition: 82, sponsorships: [] },
  { id: "estoril", name: "GD Estoril Praia", shortName: "Estoril", league: "Liga Portugal", primaryColor: "#facc15", secondaryColor: "#1d4ed8", reputation: 73, stadium: "Estádio António Coimbra da Mota", capacity: 8015, transferBudget: 6000000, wageBudget: 450000, bankBalance: 15750000, ticketPrice: 25, stadiumCondition: 80, sponsorships: [] },
  { id: "estrela", name: "CF Estrela da Amadora", shortName: "Estrela", league: "Liga Portugal", primaryColor: "#dc2626", secondaryColor: "#16a34a", reputation: 71, stadium: "Estádio José Gomes", capacity: 9288, transferBudget: 4000000, wageBudget: 320000, bankBalance: 11200000, ticketPrice: 20, stadiumCondition: 70, sponsorships: [] },
  { id: "boavista", name: "Boavista FC", shortName: "Boavista", league: "Liga Portugal", primaryColor: "#000000", secondaryColor: "#ffffff", reputation: 74, stadium: "Estádio do Bessa", capacity: 28263, transferBudget: 7000000, wageBudget: 500000, bankBalance: 17500000, ticketPrice: 28, stadiumCondition: 85, sponsorships: [] },
  { id: "santaclara", name: "CD Santa Clara", shortName: "Santa Clara", league: "Liga Portugal", primaryColor: "#dc2626", secondaryColor: "#ffffff", reputation: 71, stadium: "Estádio de São Miguel", capacity: 13277, transferBudget: 4500000, wageBudget: 350000, bankBalance: 12250000, ticketPrice: 22, stadiumCondition: 73, sponsorships: [] },
  { id: "nacional", name: "CD Nacional", shortName: "Nacional", league: "Liga Portugal", primaryColor: "#000000", secondaryColor: "#ffffff", reputation: 71, stadium: "Estádio da Madeira", capacity: 5132, transferBudget: 4000000, wageBudget: 320000, bankBalance: 11200000, ticketPrice: 20, stadiumCondition: 75, sponsorships: [] },
  { id: "avs", name: "AVS Futebol SAD", shortName: "AVS", league: "Liga Portugal", primaryColor: "#dc2626", secondaryColor: "#ffffff", reputation: 69, stadium: "Estádio do CD Aves", capacity: 8560, transferBudget: 3000000, wageBudget: 250000, bankBalance: 8750000, ticketPrice: 18, stadiumCondition: 78, sponsorships: [] },
];`;

c = c.replace(
  '// Serie A (20)',
  newClubs + '\n\n  // Serie A (20)'
);

fs.writeFileSync('src/config/seededData.ts', c);
console.log('seededData updated with Eredivisie & Liga Portugal clubs.');
