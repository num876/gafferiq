/* eslint-disable */
export interface Club {
  id: string;
  name: string;
  shortName: string;
  league: "EPL" | "La Liga" | "Serie A" | "Bundesliga" | "Ligue 1";
  primaryColor: string;
  secondaryColor: string;
  reputation: number; // 1-100
  stadium: string;
  capacity: number;
  transferBudget: number; // in Euros
  wageBudget: number; // in Euros per week
}

let _seed = 12345;
export function setSeed(seed: number) {
  _seed = seed;
}

export function prng() {
  var t = _seed += 0x6D2B79F5;
  t = Math.imul(t ^ t >>> 15, t | 1);
  t ^= t + Math.imul(t ^ t >>> 7, t | 61);
  return ((t ^ t >>> 14) >>> 0) / 4294967296;
}

export interface Player {
  id: string;
  clubId: string;
  name: string;
  position: "GK" | "DEF" | "MID" | "ATT";
  age: number;
  nationality: string;
  nationalityFlag: string;
  // Attributes (1-99)
  pace: number;
  shooting: number;
  passing: number;
  dribbling: number;
  defending: number;
  physical: number;
  mental: number;
  stamina: number;
  overall: number;
  potential: number;
  wage: number; // per week
  value: number; // market value
  morale: number; // 1-100
  personality: "Leader" | "Professional" | "Temperamental" | "Maverick" | "Model Citizen";
  contractExpiry: number; // remaining years (1-5)
  injuryStatus: "Fit" | "Injured" | "Suspended";
  // Seasonal stats
  goals: number;
  assists: number;
  ratingHistory: number[];
  trainingFocus?: "Balanced" | "Attacking" | "Defensive" | "Fitness" | "Tactical";
  isTransferListed?: boolean;
  isAcademy?: boolean;
  sharpness?: number;
  transferOffers?: { clubId: string; amount: number; }[];
  onLoanFrom?: string;
  loanDuration?: number; // months or seasons remaining
}

export const LEAGUE_INFO = {
  EPL: { name: "English Premier League", color: "#6B21A8", emoji: "🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
  "La Liga": { name: "La Liga", color: "#EA580C", emoji: "🇪🇸" },
  "Serie A": { name: "Serie A", color: "#1D4ED8", emoji: "🇮🇹" },
  Bundesliga: { name: "Bundesliga", color: "#DC2626", emoji: "🇩🇪" },
  "Ligue 1": { name: "Ligue 1", color: "#64748B", emoji: "🇫🇷" },
};

export const TOP_PLAYER_OVERRIDES: Record<string, { overall: number, potential: number }> = {
  "Erling Haaland": { overall: 91, potential: 95 },
  "Kylian Mbappé": { overall: 91, potential: 94 },
  "Jude Bellingham": { overall: 90, potential: 94 },
  "Vinícius Júnior": { overall: 90, potential: 94 },
  "Rodri": { overall: 91, potential: 91 },
  "Kevin De Bruyne": { overall: 91, potential: 91 },
  "Harry Kane": { overall: 90, potential: 90 },
  "Mohamed Salah": { overall: 89, potential: 89 },
  "Alisson": { overall: 89, potential: 89 },
  "Virgil van Dijk": { overall: 89, potential: 89 },
  "Ruben Dias": { overall: 89, potential: 90 },
  "Rúben Dias": { overall: 89, potential: 90 },
  "Bernardo Silva": { overall: 88, potential: 88 },
  "Bukayo Saka": { overall: 88, potential: 92 },
  "Martin Ødegaard": { overall: 88, potential: 91 },
  "William Saliba": { overall: 88, potential: 92 },
  "Declan Rice": { overall: 87, potential: 90 },
  "Cole Palmer": { overall: 87, potential: 92 },
  "Son Heung-min": { overall: 87, potential: 87 },
  "Phil Foden": { overall: 88, potential: 92 },
  "Bruno Fernandes": { overall: 87, potential: 87 },
  "Antoine Griezmann": { overall: 88, potential: 88 },
  "Federico Valverde": { overall: 88, potential: 90 },
  "Thibaut Courtois": { overall: 90, potential: 90 },
  "Antonio Rüdiger": { overall: 88, potential: 88 },
  "Aurélien Tchouaméni": { overall: 86, potential: 90 },
  "Eduardo Camavinga": { overall: 85, potential: 91 },
  "Robert Lewandowski": { overall: 88, potential: 88 },
  "Lamine Yamal": { overall: 85, potential: 95 },
  "Pedri": { overall: 86, potential: 91 },
  "Gavi": { overall: 84, potential: 90 },
  "Frenkie de Jong": { overall: 87, potential: 88 },
  "Lautaro Martínez": { overall: 89, potential: 90 },
  "Nicolò Barella": { overall: 87, potential: 89 },
  "Alessandro Bastoni": { overall: 87, potential: 90 },
  "Rafael Leão": { overall: 86, potential: 90 },
  "Mike Maignan": { overall: 87, potential: 89 },
  "Theo Hernández": { overall: 86, potential: 88 },
  "Khvicha Kvaratskhelia": { overall: 86, potential: 90 },
  "Victor Osimhen": { overall: 87, potential: 89 },
  "Jamal Musiala": { overall: 88, potential: 94 },
  "Florian Wirtz": { overall: 88, potential: 94 },
  "Leroy Sané": { overall: 86, potential: 86 },
  "Joshua Kimmich": { overall: 87, potential: 87 },
  "Manuel Neuer": { overall: 87, potential: 87 },
  "Alejandro Grimaldo": { overall: 86, potential: 86 },
  "Jeremie Frimpong": { overall: 86, potential: 89 },
  "Xavi Simons": { overall: 85, potential: 91 },
  "Gianluigi Donnarumma": { overall: 87, potential: 90 },
  "Ousmane Dembélé": { overall: 86, potential: 86 },
  "Achraf Hakimi": { overall: 85, potential: 87 },
  "Warren Zaïre-Emery": { overall: 82, potential: 92 },
  "Marquinhos": { overall: 87, potential: 88 }
};

export const CLUBS_DATA: Club[] = [
  // EPL (20)
  { id: "mancity", name: "Manchester City", shortName: "Man City", league: "EPL", primaryColor: "#7dd3fc", secondaryColor: "#1e3a8a", reputation: 92, stadium: "Etihad Stadium", capacity: 53400, transferBudget: 150000000, wageBudget: 4200000 },
  { id: "arsenal", name: "Arsenal", shortName: "Arsenal", league: "EPL", primaryColor: "#ef4444", secondaryColor: "#ffffff", reputation: 90, stadium: "Emirates Stadium", capacity: 60700, transferBudget: 110000000, wageBudget: 3500000 },
  { id: "liverpool", name: "Liverpool", shortName: "Liverpool", league: "EPL", primaryColor: "#b91c1c", secondaryColor: "#facc15", reputation: 90, stadium: "Anfield", capacity: 61200, transferBudget: 95000000, wageBudget: 3800000 },
  { id: "chelsea", name: "Chelsea", shortName: "Chelsea", league: "EPL", primaryColor: "#1d4ed8", secondaryColor: "#ffffff", reputation: 85, stadium: "Stamford Bridge", capacity: 40300, transferBudget: 130000000, wageBudget: 3400000 },
  { id: "manunited", name: "Manchester United", shortName: "Man United", league: "EPL", primaryColor: "#dc2626", secondaryColor: "#000000", reputation: 87, stadium: "Old Trafford", capacity: 74300, transferBudget: 100000000, wageBudget: 4000000 },
  { id: "tottenham", name: "Tottenham Hotspur", shortName: "Tottenham", league: "EPL", primaryColor: "#0f172a", secondaryColor: "#ffffff", reputation: 84, stadium: "Tottenham Hotspur Stadium", capacity: 62850, transferBudget: 85000000, wageBudget: 2800000 },
  { id: "newcastle", name: "Newcastle United", shortName: "Newcastle", league: "EPL", primaryColor: "#000000", secondaryColor: "#ffffff", reputation: 83, stadium: "St. James' Park", capacity: 52300, transferBudget: 90000000, wageBudget: 2500000 },
  { id: "astonvilla", name: "Aston Villa", shortName: "Aston Villa", league: "EPL", primaryColor: "#7c2d12", secondaryColor: "#93c5fd", reputation: 82, stadium: "Villa Park", capacity: 42640, transferBudget: 75000000, wageBudget: 2200000 },
  { id: "westham", name: "West Ham United", shortName: "West Ham", league: "EPL", primaryColor: "#881337", secondaryColor: "#06b6d4", reputation: 79, stadium: "London Stadium", capacity: 62500, transferBudget: 50000000, wageBudget: 1800000 },
  { id: "brighton", name: "Brighton & Hove Albion", shortName: "Brighton", league: "EPL", primaryColor: "#2563eb", secondaryColor: "#ffffff", reputation: 80, stadium: "Amex Stadium", capacity: 31800, transferBudget: 60000000, wageBudget: 1500000 },
  { id: "crystalpalace", name: "Crystal Palace", shortName: "Crystal Palace", league: "EPL", primaryColor: "#1d4ed8", secondaryColor: "#dc2626", reputation: 76, stadium: "Selhurst Park", capacity: 25400, transferBudget: 40000000, wageBudget: 1400000 },
  { id: "fulham", name: "Fulham", shortName: "Fulham", league: "EPL", primaryColor: "#ffffff", secondaryColor: "#000000", reputation: 76, stadium: "Craven Cottage", capacity: 29600, transferBudget: 35000000, wageBudget: 1300000 },
  { id: "bournemouth", name: "Bournemouth", shortName: "Bournemouth", league: "EPL", primaryColor: "#ef4444", secondaryColor: "#000000", reputation: 75, stadium: "Vitality Stadium", capacity: 11300, transferBudget: 30000000, wageBudget: 1100000 },
  { id: "brentford", name: "Brentford", shortName: "Brentford", league: "EPL", primaryColor: "#e11d48", secondaryColor: "#ffffff", reputation: 75, stadium: "Gtech Community Stadium", capacity: 17250, transferBudget: 32000000, wageBudget: 1100000 },
  { id: "everton", name: "Everton", shortName: "Everton", league: "EPL", primaryColor: "#1d4ed8", secondaryColor: "#ffffff", reputation: 75, stadium: "Goodison Park", capacity: 39572, transferBudget: 20000000, wageBudget: 1400000 },
  { id: "wolves", name: "Wolverhampton Wanderers", shortName: "Wolves", league: "EPL", primaryColor: "#eab308", secondaryColor: "#000000", reputation: 75, stadium: "Molineux Stadium", capacity: 32000, transferBudget: 28000000, wageBudget: 1200000 },
  { id: "nottingham", name: "Nottingham Forest", shortName: "Nottingham F", league: "EPL", primaryColor: "#dc2626", secondaryColor: "#ffffff", reputation: 74, stadium: "The City Ground", capacity: 30400, transferBudget: 35000000, wageBudget: 1350000 },
  { id: "leicester", name: "Leicester City", shortName: "Leicester", league: "EPL", primaryColor: "#1e40af", secondaryColor: "#facc15", reputation: 74, stadium: "King Power Stadium", capacity: 32260, transferBudget: 25000000, wageBudget: 1200000 },
  { id: "ipswich", name: "Ipswich Town", shortName: "Ipswich", league: "EPL", primaryColor: "#2563eb", secondaryColor: "#ffffff", reputation: 71, stadium: "Portman Road", capacity: 29670, transferBudget: 22000000, wageBudget: 900000 },
  { id: "southampton", name: "Southampton", shortName: "Southampton", league: "EPL", primaryColor: "#ef4444", secondaryColor: "#ffffff", reputation: 72, stadium: "St Mary's Stadium", capacity: 32380, transferBudget: 20000000, wageBudget: 1000000 },

  // La Liga (20)
  { id: "realmadrid", name: "Real Madrid", shortName: "Real Madrid", league: "La Liga", primaryColor: "#ffffff", secondaryColor: "#facc15", reputation: 95, stadium: "Santiago Bernabéu", capacity: 81000, transferBudget: 180000000, wageBudget: 4800000 },
  { id: "barcelona", name: "FC Barcelona", shortName: "Barcelona", league: "La Liga", primaryColor: "#991b1b", secondaryColor: "#1e3a8a", reputation: 92, stadium: "Spotify Camp Nou", capacity: 99350, transferBudget: 60000000, wageBudget: 3900000 },
  { id: "atletico", name: "Atlético Madrid", shortName: "Atlético", league: "La Liga", primaryColor: "#dc2626", secondaryColor: "#1d4ed8", reputation: 87, stadium: "Cívitas Metropolitano", capacity: 70460, transferBudget: 80000000, wageBudget: 3000000 },
  { id: "real_sociedad", name: "Real Sociedad", shortName: "R. Sociedad", league: "La Liga", primaryColor: "#2563eb", secondaryColor: "#ffffff", reputation: 82, stadium: "Reale Arena", capacity: 39500, transferBudget: 35000000, wageBudget: 1500000 },
  { id: "athletic_bilbao", name: "Athletic Club Bilbao", shortName: "Athletic", league: "La Liga", primaryColor: "#dc2626", secondaryColor: "#ffffff", reputation: 82, stadium: "San Mamés", capacity: 53280, transferBudget: 45000000, wageBudget: 1600000 },
  { id: "girona", name: "Girona", shortName: "Girona", league: "La Liga", primaryColor: "#ef4444", secondaryColor: "#ffffff", reputation: 80, stadium: "Montilivi", capacity: 14600, transferBudget: 28000000, wageBudget: 1200000 },
  { id: "betis", name: "Real Betis", shortName: "Real Betis", league: "La Liga", primaryColor: "#16a34a", secondaryColor: "#ffffff", reputation: 80, stadium: "Benito Villamarín", capacity: 60720, transferBudget: 25000000, wageBudget: 1400000 },
  { id: "villarreal", name: "Villarreal", shortName: "Villarreal", league: "La Liga", primaryColor: "#eab308", secondaryColor: "#1d4ed8", reputation: 80, stadium: "Estadio de la Cerámica", capacity: 23000, transferBudget: 30000000, wageBudget: 1350000 },
  { id: "sevilla", name: "Sevilla FC", shortName: "Sevilla", league: "La Liga", primaryColor: "#ef4444", secondaryColor: "#ffffff", reputation: 80, stadium: "Ramón Sánchez-Pizjuán", capacity: 43880, transferBudget: 18000000, wageBudget: 1500000 },
  { id: "valencia", name: "Valencia CF", shortName: "Valencia", league: "La Liga", primaryColor: "#ffffff", secondaryColor: "#f97316", reputation: 78, stadium: "Mestalla", capacity: 49430, transferBudget: 12000000, wageBudget: 1200000 },
  { id: "osasuna", name: "Osasuna", shortName: "Osasuna", league: "La Liga", primaryColor: "#dc2626", secondaryColor: "#1e3a8a", reputation: 75, stadium: "El Sadar", capacity: 23576, transferBudget: 10000000, wageBudget: 850000 },
  { id: "getafe", name: "Getafe CF", shortName: "Getafe", league: "La Liga", primaryColor: "#1d4ed8", secondaryColor: "#ffffff", reputation: 74, stadium: "Coliseum Alfonso Pérez", capacity: 16500, transferBudget: 11000000, wageBudget: 900000 },
  { id: "celta", name: "Celta Vigo", shortName: "Celta", league: "La Liga", primaryColor: "#bae6fd", secondaryColor: "#ffffff", reputation: 75, stadium: "Abanca-Balaídos", capacity: 29000, transferBudget: 14000000, wageBudget: 950000 },
  { id: "mallorca", name: "RCD Mallorca", shortName: "Mallorca", league: "La Liga", primaryColor: "#dc2626", secondaryColor: "#000000", reputation: 74, stadium: "Son Moix", capacity: 23010, transferBudget: 12000000, wageBudget: 800000 },
  { id: "rayo", name: "Rayo Vallecano", shortName: "Rayo", league: "La Liga", primaryColor: "#ffffff", secondaryColor: "#dc2626", reputation: 74, stadium: "Vallecas", capacity: 14700, transferBudget: 8000000, wageBudget: 750000 },
  { id: "laspalmas", name: "UD Las Palmas", shortName: "Las Palmas", league: "La Liga", primaryColor: "#eab308", secondaryColor: "#2563eb", reputation: 73, stadium: "Gran Canaria", capacity: 32400, transferBudget: 10000000, wageBudget: 700000 },
  { id: "alaves", name: "Deportivo Alavés", shortName: "Alavés", league: "La Liga", primaryColor: "#2563eb", secondaryColor: "#ffffff", reputation: 73, stadium: "Mendizorrotza", capacity: 19840, transferBudget: 9000000, wageBudget: 720000 },
  { id: "leganes", name: "CD Leganés", shortName: "Leganés", league: "La Liga", primaryColor: "#2563eb", secondaryColor: "#ffffff", reputation: 70, stadium: "Butarque", capacity: 12450, transferBudget: 7000000, wageBudget: 600000 },
  { id: "valladolid", name: "Real Valladolid", shortName: "Valladolid", league: "La Liga", primaryColor: "#a855f7", secondaryColor: "#ffffff", reputation: 71, stadium: "José Zorrilla", capacity: 27618, transferBudget: 8000000, wageBudget: 650000 },
  { id: "espanyol", name: "RCD Espanyol", shortName: "Espanyol", league: "La Liga", primaryColor: "#3b82f6", secondaryColor: "#ffffff", reputation: 72, stadium: "Stage Front Stadium", capacity: 40000, transferBudget: 9000000, wageBudget: 780000 },

  // Serie A (20)
  { id: "inter", name: "Inter Milan", shortName: "Inter", league: "Serie A", primaryColor: "#000000", secondaryColor: "#2563eb", reputation: 91, stadium: "San Siro", capacity: 75817, transferBudget: 85000000, wageBudget: 3600000 },
  { id: "juventus", name: "Juventus", shortName: "Juventus", league: "Serie A", primaryColor: "#000000", secondaryColor: "#ffffff", reputation: 88, stadium: "Allianz Stadium", capacity: 41507, transferBudget: 90000000, wageBudget: 3400000 },
  { id: "milan", name: "AC Milan", shortName: "AC Milan", league: "Serie A", primaryColor: "#dc2626", secondaryColor: "#000000", reputation: 87, stadium: "San Siro", capacity: 75817, transferBudget: 75000000, wageBudget: 2800000 },
  { id: "napoli", name: "Napoli", shortName: "Napoli", league: "Serie A", primaryColor: "#38bdf8", secondaryColor: "#ffffff", reputation: 86, stadium: "Diego Armando Maradona", capacity: 54726, transferBudget: 80000000, wageBudget: 2600000 },
  { id: "atalanta", name: "Atalanta", shortName: "Atalanta", league: "Serie A", primaryColor: "#1d4ed8", secondaryColor: "#000000", reputation: 84, stadium: "Gewiss Stadium", capacity: 21300, transferBudget: 45000000, wageBudget: 1550000 },
  { id: "roma", name: "AS Roma", shortName: "AS Roma", league: "Serie A", primaryColor: "#991b1b", secondaryColor: "#facc15", reputation: 84, stadium: "Stadio Olimpico", capacity: 70634, transferBudget: 40000000, wageBudget: 2200000 },
  { id: "lazio", name: "Lazio", shortName: "Lazio", league: "Serie A", primaryColor: "#60a5fa", secondaryColor: "#ffffff", reputation: 81, stadium: "Stadio Olimpico", capacity: 70634, transferBudget: 35000000, wageBudget: 1800000 },
  { id: "fiorentina", name: "Fiorentina", shortName: "Fiorentina", league: "Serie A", primaryColor: "#6b21a8", secondaryColor: "#ffffff", reputation: 80, stadium: "Artemio Franchi", capacity: 43147, transferBudget: 30000000, wageBudget: 1500000 },
  { id: "bologna", name: "Bologna", shortName: "Bologna", league: "Serie A", primaryColor: "#991b1b", secondaryColor: "#1e3a8a", reputation: 78, stadium: "Renato Dall'Ara", capacity: 36462, transferBudget: 25000000, wageBudget: 1200000 },
  { id: "torino", name: "Torino FC", shortName: "Torino", league: "Serie A", primaryColor: "#7f1d1d", secondaryColor: "#ffffff", reputation: 77, stadium: "Stadio Olimpico Grande Torino", capacity: 27958, transferBudget: 20000000, wageBudget: 1100000 },
  { id: "monza", name: "Monza", shortName: "Monza", league: "Serie A", primaryColor: "#dc2626", secondaryColor: "#ffffff", reputation: 74, stadium: "U-Power Stadium", capacity: 15036, transferBudget: 15000000, wageBudget: 950000 },
  { id: "genoa", name: "Genoa", shortName: "Genoa", league: "Serie A", primaryColor: "#991b1b", secondaryColor: "#1e3a8a", reputation: 75, stadium: "Luigi Ferraris", capacity: 36600, transferBudget: 16000000, wageBudget: 900000 },
  { id: "lecce", name: "Lecce", shortName: "Lecce", league: "Serie A", primaryColor: "#eab308", secondaryColor: "#dc2626", reputation: 73, stadium: "Via del Mare", capacity: 31533, transferBudget: 10000000, wageBudget: 750000 },
  { id: "udinese", name: "Udinese", shortName: "Udinese", league: "Serie A", primaryColor: "#000000", secondaryColor: "#ffffff", reputation: 75, stadium: "Bluenergy Stadium", capacity: 25144, transferBudget: 12000000, wageBudget: 850000 },
  { id: "verona", name: "Hellas Verona", shortName: "Verona", league: "Serie A", primaryColor: "#eab308", secondaryColor: "#2563eb", reputation: 73, stadium: "Marcantonio Bentegodi", capacity: 39211, transferBudget: 9000000, wageBudget: 780000 },
  { id: "empoli", name: "Empoli", shortName: "Empoli", league: "Serie A", primaryColor: "#2563eb", secondaryColor: "#ffffff", reputation: 72, stadium: "Carlo Castellani", capacity: 16284, transferBudget: 8000000, wageBudget: 700000 },
  { id: "cagliari", name: "Cagliari", shortName: "Cagliari", league: "Serie A", primaryColor: "#dc2626", secondaryColor: "#1e3a8a", reputation: 73, stadium: "Unipol Domus", capacity: 16416, transferBudget: 11000000, wageBudget: 800000 },
  { id: "parma", name: "Parma", shortName: "Parma", league: "Serie A", primaryColor: "#eab308", secondaryColor: "#1e3a8a", reputation: 72, stadium: "Ennio Tardini", capacity: 22352, transferBudget: 14000000, wageBudget: 820000 },
  { id: "como", name: "Como 1907", shortName: "Como", league: "Serie A", primaryColor: "#1d4ed8", secondaryColor: "#ffffff", reputation: 74, stadium: "Giuseppe Sinigaglia", capacity: 13602, transferBudget: 22000000, wageBudget: 1000000 },
  { id: "venezia", name: "Venezia", shortName: "Venezia", league: "Serie A", primaryColor: "#0f172a", secondaryColor: "#16a34a", reputation: 70, stadium: "Pier Luigi Penzo", capacity: 11150, transferBudget: 10000000, wageBudget: 720000 },

  // Bundesliga (18)
  { id: "bayern", name: "Bayern Munich", shortName: "Bayern", league: "Bundesliga", primaryColor: "#dc2626", secondaryColor: "#ffffff", reputation: 93, stadium: "Allianz Arena", capacity: 75000, transferBudget: 120000000, wageBudget: 4400000 },
  { id: "leverkusen", name: "Bayer Leverkusen", shortName: "Leverkusen", league: "Bundesliga", primaryColor: "#ef4444", secondaryColor: "#000000", reputation: 89, stadium: "BayArena", capacity: 30210, transferBudget: 75000000, wageBudget: 2500000 },
  { id: "dortmund", name: "Borussia Dortmund", shortName: "Dortmund", league: "Bundesliga", primaryColor: "#facc15", secondaryColor: "#000000", reputation: 87, stadium: "Signal Iduna Park", capacity: 81365, transferBudget: 65000000, wageBudget: 2900000 },
  { id: "leipzig", name: "RB Leipzig", shortName: "Leipzig", league: "Bundesliga", primaryColor: "#ef4444", secondaryColor: "#1d4ed8", reputation: 85, stadium: "Red Bull Arena", capacity: 47069, transferBudget: 60000000, wageBudget: 2300000 },
  { id: "stuttgart", name: "VfB Stuttgart", shortName: "Stuttgart", league: "Bundesliga", primaryColor: "#ffffff", secondaryColor: "#dc2626", reputation: 80, stadium: "MHPArena", capacity: 60449, transferBudget: 35000000, wageBudget: 1400000 },
  { id: "frankfurt", name: "Eintracht Frankfurt", shortName: "Frankfurt", league: "Bundesliga", primaryColor: "#e2e8f0", secondaryColor: "#ef4444", reputation: 81, stadium: "Deutsche Bank Park", capacity: 58000, transferBudget: 30000000, wageBudget: 1500000 },
  { id: "freiburg", name: "SC Freiburg", shortName: "Freiburg", league: "Bundesliga", primaryColor: "#dc2626", secondaryColor: "#ffffff", reputation: 77, stadium: "Europa-Park Stadion", capacity: 34700, transferBudget: 15000000, wageBudget: 1000000 },
  { id: "hoffenheim", name: "TSG Hoffenheim", shortName: "Hoffenheim", league: "Bundesliga", primaryColor: "#2563eb", secondaryColor: "#ffffff", reputation: 76, stadium: "PreZero Arena", capacity: 30150, transferBudget: 20000000, wageBudget: 1200000 },
  { id: "heidenheim", name: "1. FC Heidenheim", shortName: "Heidenheim", league: "Bundesliga", primaryColor: "#ef4444", secondaryColor: "#1e3a8a", reputation: 74, stadium: "Voith-Arena", capacity: 15000, transferBudget: 10000000, wageBudget: 750000 },
  { id: "werder", name: "Werder Bremen", shortName: "Bremen", league: "Bundesliga", primaryColor: "#16a34a", secondaryColor: "#ffffff", reputation: 76, stadium: "Weserstadion", capacity: 42100, transferBudget: 14000000, wageBudget: 1100000 },
  { id: "wolfsburg", name: "VfL Wolfsburg", shortName: "Wolfsburg", league: "Bundesliga", primaryColor: "#22c55e", secondaryColor: "#ffffff", reputation: 77, stadium: "Volkswagen Arena", capacity: 30000, transferBudget: 35000000, wageBudget: 1600000 },
  { id: "monchengladbach", name: "Borussia Mönchengladbach", shortName: "M'gladbach", league: "Bundesliga", primaryColor: "#ffffff", secondaryColor: "#16a34a", reputation: 76, stadium: "Borussia-Park", capacity: 54042, transferBudget: 18000000, wageBudget: 1300000 },
  { id: "union_berlin", name: "Union Berlin", shortName: "Union Berlin", league: "Bundesliga", primaryColor: "#ef4444", secondaryColor: "#ffffff", reputation: 76, stadium: "An der Alten Försterei", capacity: 22012, transferBudget: 16000000, wageBudget: 1200000 },
  { id: "mainz", name: "FSV Mainz 05", shortName: "Mainz", league: "Bundesliga", primaryColor: "#dc2626", secondaryColor: "#ffffff", reputation: 74, stadium: "Mewa Arena", capacity: 33305, transferBudget: 12000000, wageBudget: 900000 },
  { id: "bochum", name: "VfL Bochum", shortName: "Bochum", league: "Bundesliga", primaryColor: "#2563eb", secondaryColor: "#ffffff", reputation: 71, stadium: "Vonovia Ruhrstadion", capacity: 26000, transferBudget: 7000000, wageBudget: 700000 },
  { id: "stpauli", name: "FC St. Pauli", shortName: "St. Pauli", league: "Bundesliga", primaryColor: "#78350f", secondaryColor: "#ffffff", reputation: 71, stadium: "Millerntor-Stadion", capacity: 29546, transferBudget: 8000000, wageBudget: 720000 },
  { id: "kiel", name: "Holstein Kiel", shortName: "Kiel", league: "Bundesliga", primaryColor: "#1d4ed8", secondaryColor: "#dc2626", reputation: 69, stadium: "Holstein-Stadion", capacity: 15034, transferBudget: 6000000, wageBudget: 600000 },
  { id: "augsburg", name: "FC Augsburg", shortName: "Augsburg", league: "Bundesliga", primaryColor: "#15803d", secondaryColor: "#dc2626", reputation: 74, stadium: "WWK Arena", capacity: 30660, transferBudget: 13000000, wageBudget: 950000 },

  // Ligue 1 (18)
  { id: "psg", name: "Paris Saint-Germain", shortName: "PSG", league: "Ligue 1", primaryColor: "#1e3a8a", secondaryColor: "#ef4444", reputation: 94, stadium: "Parc des Princes", capacity: 47900, transferBudget: 160000000, wageBudget: 4900000 },
  { id: "monaco", name: "AS Monaco", shortName: "Monaco", league: "Ligue 1", primaryColor: "#dc2626", secondaryColor: "#ffffff", reputation: 84, stadium: "Stade Louis II", capacity: 18500, transferBudget: 48000000, wageBudget: 1800000 },
  { id: "marseille", name: "Olympique de Marseille", shortName: "Marseille", league: "Ligue 1", primaryColor: "#38bdf8", secondaryColor: "#ffffff", reputation: 83, stadium: "Orange Vélodrome", capacity: 67394, transferBudget: 40000000, wageBudget: 2100000 },
  { id: "lille", name: "Lille OSC", shortName: "Lille", league: "Ligue 1", primaryColor: "#e11d48", secondaryColor: "#1d4ed8", reputation: 81, stadium: "Decathlon Arena", capacity: 50186, transferBudget: 32000000, wageBudget: 1500000 },
  { id: "lens", name: "RC Lens", shortName: "Lens", league: "Ligue 1", primaryColor: "#eab308", secondaryColor: "#dc2626", reputation: 80, stadium: "Stade Bollaert-Delelis", capacity: 38223, transferBudget: 22000000, wageBudget: 1300000 },
  { id: "lyon", name: "Olympique Lyonnais", shortName: "Lyon", league: "Ligue 1", primaryColor: "#ffffff", secondaryColor: "#1d4ed8", reputation: 81, stadium: "Groupama Stadium", capacity: 59186, transferBudget: 25000000, wageBudget: 1900000 },
  { id: "nice", name: "OGC Nice", shortName: "Nice", league: "Ligue 1", primaryColor: "#e2e8f0", secondaryColor: "#ef4444", reputation: 79, stadium: "Allianz Riviera", capacity: 36178, transferBudget: 28000000, wageBudget: 1400000 },
  { id: "rennes", name: "Stade Rennais", shortName: "Rennes", league: "Ligue 1", primaryColor: "#dc2626", secondaryColor: "#000000", reputation: 79, stadium: "Roazhon Park", capacity: 29778, transferBudget: 24000000, wageBudget: 1250000 },
  { id: "reims", name: "Stade de Reims", shortName: "Reims", league: "Ligue 1", primaryColor: "#dc2626", secondaryColor: "#ffffff", reputation: 76, stadium: "Stade Auguste-Delaune", capacity: 21102, transferBudget: 15000000, wageBudget: 900000 },
  { id: "brest", name: "Stade Brestois 29", shortName: "Brest", league: "Ligue 1", primaryColor: "#ef4444", secondaryColor: "#ffffff", reputation: 77, stadium: "Stade Francis-Le Blé", capacity: 15220, transferBudget: 12000000, wageBudget: 850000 },
  { id: "strasbourg", name: "RC Strasbourg", shortName: "Strasbourg", league: "Ligue 1", primaryColor: "#3b82f6", secondaryColor: "#ffffff", reputation: 75, stadium: "Stade de la Meinau", capacity: 26280, transferBudget: 20000000, wageBudget: 1000000 },
  { id: "toulouse", name: "Toulouse FC", shortName: "Toulouse", league: "Ligue 1", primaryColor: "#6b21a8", secondaryColor: "#ffffff", reputation: 74, stadium: "Stadium de Toulouse", capacity: 33150, transferBudget: 14000000, wageBudget: 800000 },
  { id: "montpellier", name: "Montpellier HSC", shortName: "Montpellier", league: "Ligue 1", primaryColor: "#1e3a8a", secondaryColor: "#f97316", reputation: 74, stadium: "Stade de la Mosson", capacity: 32900, transferBudget: 9000000, wageBudget: 850000 },
  { id: "nantes", name: "FC Nantes", shortName: "Nantes", league: "Ligue 1", primaryColor: "#eab308", secondaryColor: "#16a34a", reputation: 74, stadium: "Stade de la Beaujoire", capacity: 35322, transferBudget: 8000000, wageBudget: 880000 },
  { id: "angers", name: "Angers SCO", shortName: "Angers", league: "Ligue 1", primaryColor: "#000000", secondaryColor: "#ffffff", reputation: 70, stadium: "Stade Raymond Kopa", capacity: 18750, transferBudget: 6000000, wageBudget: 620000 },
  { id: "saint_etienne", name: "AS Saint-Étienne", shortName: "St-Étienne", league: "Ligue 1", primaryColor: "#15803d", secondaryColor: "#ffffff", reputation: 72, stadium: "Stade Geoffroy-Guichard", capacity: 41965, transferBudget: 8000000, wageBudget: 700000 },
  { id: "le_havre", name: "Le Havre AC", shortName: "Le Havre", league: "Ligue 1", primaryColor: "#bae6fd", secondaryColor: "#1e3a8a", reputation: 71, stadium: "Stade Océane", capacity: 25178, transferBudget: 7000000, wageBudget: 650000 },
  { id: "auxerre", name: "AJ Auxerre", shortName: "Auxerre", league: "Ligue 1", primaryColor: "#ffffff", secondaryColor: "#2563eb", reputation: 71, stadium: "Stade de l'Abbé-Deschamps", capacity: 18541, transferBudget: 8000000, wageBudget: 680000 },
];

export const STAR_PLAYERS_PRESET: Array<{
  name: string;
  clubId: string;
  position: "GK" | "DEF" | "MID" | "ATT";
  nationality: string;
  flag: string;
  overall: number;
  pace: number;
  shooting: number;
  passing: number;
  dribbling: number;
  defending: number;
  physical: number;
  mental: number;
  stamina: number;
}> = [
  // EPL
  { name: "Bukayo Saka", clubId: "arsenal", position: "ATT", nationality: "England", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", overall: 87, pace: 85, shooting: 84, passing: 83, dribbling: 88, defending: 45, physical: 68, mental: 82, stamina: 85 },
  { name: "Martin Ødegaard", clubId: "arsenal", position: "MID", nationality: "Norway", flag: "🇳🇴", overall: 88, pace: 78, shooting: 81, passing: 89, dribbling: 87, defending: 58, physical: 65, mental: 88, stamina: 89 },
  { name: "Declan Rice", clubId: "arsenal", position: "MID", nationality: "England", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", overall: 87, pace: 79, shooting: 73, passing: 82, dribbling: 79, defending: 86, physical: 84, mental: 85, stamina: 94 },
  { name: "William Saliba", clubId: "arsenal", position: "DEF", nationality: "France", flag: "🇫🇷", overall: 88, pace: 83, shooting: 40, passing: 78, dribbling: 74, defending: 89, physical: 85, mental: 84, stamina: 86 },
  
  { name: "Erling Haaland", clubId: "mancity", position: "ATT", nationality: "Norway", flag: "🇳🇴", overall: 91, pace: 89, shooting: 93, passing: 68, dribbling: 80, defending: 45, physical: 88, mental: 85, stamina: 82 },
  { name: "Kevin De Bruyne", clubId: "mancity", position: "MID", nationality: "Belgium", flag: "🇧🇪", overall: 91, pace: 72, shooting: 88, passing: 94, dribbling: 87, defending: 65, physical: 74, mental: 92, stamina: 83 },
  { name: "Rodri", clubId: "mancity", position: "MID", nationality: "Spain", flag: "🇪🇸", overall: 91, pace: 66, shooting: 80, passing: 87, dribbling: 83, defending: 89, physical: 85, mental: 93, stamina: 92 },
  { name: "Phil Foden", clubId: "mancity", position: "ATT", nationality: "England", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", overall: 89, pace: 86, shooting: 86, passing: 85, dribbling: 90, defending: 56, physical: 66, mental: 84, stamina: 84 },

  { name: "Mohamed Salah", clubId: "liverpool", position: "ATT", nationality: "Egypt", flag: "🇪🇬", overall: 89, pace: 89, shooting: 88, passing: 83, dribbling: 88, defending: 45, physical: 75, mental: 86, stamina: 87 },
  { name: "Virgil van Dijk", clubId: "liverpool", position: "DEF", nationality: "Netherlands", flag: "🇳🇱", overall: 90, pace: 78, shooting: 60, passing: 79, dribbling: 72, defending: 91, physical: 86, mental: 90, stamina: 83 },
  { name: "Alisson Becker", clubId: "liverpool", position: "GK", nationality: "Brazil", flag: "🇧🇷", overall: 89, pace: 85, shooting: 89, passing: 84, dribbling: 88, defending: 45, physical: 85, mental: 90, stamina: 78 },
  { name: "Trent Alexander-Arnold", clubId: "liverpool", position: "DEF", nationality: "England", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", overall: 86, pace: 76, shooting: 80, passing: 90, dribbling: 81, defending: 80, physical: 72, mental: 82, stamina: 84 },

  { name: "Bruno Fernandes", clubId: "manunited", position: "MID", nationality: "Portugal", flag: "🇵🇹", overall: 87, pace: 71, shooting: 85, passing: 89, dribbling: 83, defending: 69, physical: 76, mental: 88, stamina: 95 },
  { name: "Marcus Rashford", clubId: "manunited", position: "ATT", nationality: "England", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", overall: 83, pace: 89, shooting: 82, passing: 78, dribbling: 83, defending: 42, physical: 74, mental: 76, stamina: 80 },
  { name: "Kobbie Mainoo", clubId: "manunited", position: "MID", nationality: "England", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", overall: 79, pace: 75, shooting: 70, passing: 80, dribbling: 82, defending: 75, physical: 72, mental: 80, stamina: 82 },

  { name: "Son Heung-min", clubId: "tottenham", position: "ATT", nationality: "South Korea", flag: "🇰🇷", overall: 87, pace: 87, shooting: 89, passing: 81, dribbling: 84, defending: 42, physical: 70, mental: 85, stamina: 83 },
  { name: "Cole Palmer", clubId: "chelsea", position: "MID", nationality: "England", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", overall: 86, pace: 80, shooting: 84, passing: 85, dribbling: 87, defending: 50, physical: 68, mental: 84, stamina: 82 },

  // La Liga
  { name: "Kylian Mbappé", clubId: "realmadrid", position: "ATT", nationality: "France", flag: "🇫🇷", overall: 92, pace: 97, shooting: 90, passing: 80, dribbling: 92, defending: 36, physical: 78, mental: 86, stamina: 86 },
  { name: "Vinícius Júnior", clubId: "realmadrid", position: "ATT", nationality: "Brazil", flag: "🇧🇷", overall: 90, pace: 95, shooting: 84, passing: 81, dribbling: 92, defending: 29, physical: 69, mental: 82, stamina: 87 },
  { name: "Jude Bellingham", clubId: "realmadrid", position: "MID", nationality: "England", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", overall: 90, pace: 79, shooting: 85, passing: 84, dribbling: 87, defending: 81, physical: 84, mental: 88, stamina: 90 },
  { name: "Federico Valverde", clubId: "realmadrid", position: "MID", nationality: "Uruguay", flag: "🇺🇾", overall: 88, pace: 88, shooting: 82, passing: 84, dribbling: 84, defending: 80, physical: 82, mental: 85, stamina: 95 },
  { name: "Thibaut Courtois", clubId: "realmadrid", position: "GK", nationality: "Belgium", flag: "🇧🇪", overall: 90, pace: 84, shooting: 90, passing: 74, dribbling: 89, defending: 46, physical: 87, mental: 88, stamina: 70 },

  { name: "Robert Lewandowski", clubId: "barcelona", position: "ATT", nationality: "Poland", flag: "🇵🇱", overall: 89, pace: 73, shooting: 90, passing: 77, dribbling: 83, defending: 43, physical: 81, mental: 89, stamina: 78 },
  { name: "Pedri", clubId: "barcelona", position: "MID", nationality: "Spain", flag: "🇪🇸", overall: 86, pace: 78, shooting: 72, passing: 87, dribbling: 88, defending: 68, physical: 64, mental: 85, stamina: 86 },
  { name: "Lamine Yamal", clubId: "barcelona", position: "ATT", nationality: "Spain", flag: "🇪🇸", overall: 83, pace: 85, shooting: 78, passing: 81, dribbling: 89, defending: 40, physical: 58, mental: 81, stamina: 77 },

  { name: "Antoine Griezmann", clubId: "atletico", position: "ATT", nationality: "France", flag: "🇫🇷", overall: 88, pace: 78, shooting: 85, passing: 87, dribbling: 86, defending: 58, physical: 72, mental: 90, stamina: 85 },
  { name: "Julián Álvarez", clubId: "atletico", position: "ATT", nationality: "Argentina", flag: "🇦🇷", overall: 85, pace: 83, shooting: 84, passing: 79, dribbling: 82, defending: 50, physical: 76, mental: 83, stamina: 90 },

  // Serie A
  { name: "Lautaro Martínez", clubId: "inter", position: "ATT", nationality: "Argentina", flag: "🇦🇷", overall: 89, pace: 80, shooting: 88, passing: 73, dribbling: 84, defending: 48, physical: 84, mental: 87, stamina: 85 },
  { name: "Nicolò Barella", clubId: "inter", position: "MID", nationality: "Italy", flag: "🇮🇹", overall: 87, pace: 79, shooting: 76, passing: 84, dribbling: 84, defending: 77, physical: 81, mental: 86, stamina: 95 },
  
  { name: "Rafael Leão", clubId: "milan", position: "ATT", nationality: "Portugal", flag: "🇵🇹", overall: 87, pace: 93, shooting: 82, passing: 78, dribbling: 90, defending: 35, physical: 78, mental: 80, stamina: 80 },
  { name: "Mike Maignan", clubId: "milan", position: "GK", nationality: "France", flag: "🇫🇷", overall: 87, pace: 83, shooting: 88, passing: 80, dribbling: 87, defending: 48, physical: 83, mental: 86, stamina: 74 },
  
  { name: "Dušan Vlahović", clubId: "juventus", position: "ATT", nationality: "Serbia", flag: "🇷🇸", overall: 85, pace: 78, shooting: 86, passing: 66, dribbling: 78, defending: 38, physical: 82, mental: 80, stamina: 82 },
  { name: "Khvicha Kvaratskhelia", clubId: "napoli", position: "ATT", nationality: "Georgia", flag: "🇬🇪", overall: 86, pace: 84, shooting: 82, passing: 81, dribbling: 89, defending: 41, physical: 72, mental: 82, stamina: 82 },
  { name: "Victor Osimhen", clubId: "napoli", position: "ATT", nationality: "Nigeria", flag: "🇳🇬", overall: 88, pace: 89, shooting: 86, passing: 66, dribbling: 80, defending: 41, physical: 82, mental: 84, stamina: 84 },
  
  { name: "Paulo Dybala", clubId: "roma", position: "ATT", nationality: "Argentina", flag: "🇦🇷", overall: 86, pace: 78, shooting: 85, passing: 85, dribbling: 89, defending: 40, physical: 60, mental: 86, stamina: 72 },

  // Bundesliga
  { name: "Harry Kane", clubId: "bayern", position: "ATT", nationality: "England", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", overall: 90, pace: 69, shooting: 93, passing: 84, dribbling: 83, defending: 49, physical: 82, mental: 92, stamina: 83 },
  { name: "Jamal Musiala", clubId: "bayern", position: "MID", nationality: "Germany", flag: "🇩🇪", overall: 88, pace: 84, shooting: 81, passing: 84, dribbling: 92, defending: 62, physical: 65, mental: 84, stamina: 83 },
  { name: "Joshua Kimmich", clubId: "bayern", position: "MID", nationality: "Germany", flag: "🇩🇪", overall: 86, pace: 68, shooting: 74, passing: 88, dribbling: 81, defending: 81, physical: 73, mental: 88, stamina: 92 },

  { name: "Florian Wirtz", clubId: "leverkusen", position: "MID", nationality: "Germany", flag: "🇩🇪", overall: 88, pace: 80, shooting: 81, passing: 87, dribbling: 90, defending: 52, physical: 66, mental: 86, stamina: 84 },
  { name: "Granit Xhaka", clubId: "leverkusen", position: "MID", nationality: "Switzerland", flag: "🇨🇭", overall: 85, pace: 52, shooting: 76, passing: 86, dribbling: 77, defending: 80, physical: 81, mental: 90, stamina: 88 },
  { name: "Alejandro Grimaldo", clubId: "leverkusen", position: "DEF", nationality: "Spain", flag: "🇪🇸", overall: 85, pace: 78, shooting: 78, passing: 84, dribbling: 82, defending: 78, physical: 70, mental: 82, stamina: 88 },

  { name: "Julian Brandt", clubId: "dortmund", position: "MID", nationality: "Germany", flag: "🇩🇪", overall: 84, pace: 76, shooting: 78, passing: 84, dribbling: 85, defending: 48, physical: 68, mental: 81, stamina: 80 },

  // Ligue 1
  { name: "Ousmane Dembélé", clubId: "psg", position: "ATT", nationality: "France", flag: "🇫🇷", overall: 86, pace: 91, shooting: 77, passing: 83, dribbling: 90, defending: 36, physical: 56, mental: 78, stamina: 74 },
  { name: "Achraf Hakimi", clubId: "psg", position: "DEF", nationality: "Morocco", flag: "🇲🇦", overall: 84, pace: 90, shooting: 74, passing: 79, dribbling: 80, defending: 76, physical: 78, mental: 78, stamina: 90 },
  { name: "Marquinhos", clubId: "psg", position: "DEF", nationality: "Brazil", flag: "🇧🇷", overall: 87, pace: 78, shooting: 53, passing: 75, dribbling: 73, defending: 88, physical: 80, mental: 86, stamina: 82 },
  { name: "Gianluigi Donnarumma", clubId: "psg", position: "GK", nationality: "Italy", flag: "🇮🇹", overall: 87, pace: 83, shooting: 88, passing: 76, dribbling: 87, defending: 45, physical: 82, mental: 84, stamina: 70 },
  { name: "Jonathan David", clubId: "lille", position: "ATT", nationality: "Canada", flag: "🇨🇦", overall: 82, pace: 83, shooting: 81, passing: 72, dribbling: 79, defending: 38, physical: 75, mental: 78, stamina: 82 },
];

const COMMON_FIRST_NAMES = [
  "Thomas", "Lucas", "James", "Daniel", "Oliver", "David", "Marc", "Antoine", "Pierre", "Luca",
  "Alessandro", "Matteo", "Marco", "Francesco", "Jonas", "Lukas", "Leon", "Maximilian", "Benjamin",
  "Mateo", "Hugo", "Leo", "Arthur", "Jules", "Gabriel", "Samuel", "Sebastian", "Alexander", "Harry",
  "Jack", "Charlie", "George", "William", "Robert", "John", "Michael", "Christopher", "Kevin", "Robin",
  "Diego", "Javier", "Carlos", "Luis", "Manuel", "Alejandro", "Pedro", "Sergio", "Alvaro", "Mario"
];

const COMMON_LAST_NAMES = [
  "Smith", "Jones", "Williams", "Brown", "Taylor", "Davies", "Wilson", "Evans", "Thomas", "Roberts",
  "Müller", "Schmidt", "Schneider", "Fischer", "Weber", "Meyer", "Wagner", "Becker", "Schulz", "Hoffmann",
  "Martin", "Bernard", "Dubois", "Thomas", "Robert", "Richard", "Petit", "Durand", "Leroy", "Moreau",
  "Rossi", "Russo", "Ferrari", "Esposito", "Bianchi", "Romano", "Colombo", "Ricci", "Marino", "Greco",
  "Garcia", "Rodriguez", "Gonzalez", "Fernandez", "Lopez", "Martinez", "Sanchez", "Perez", "Gomez", "Martin"
];

const NATIONALITIES = [
  { name: "England", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
  { name: "Spain", flag: "🇪🇸" },
  { name: "Italy", flag: "🇮🇹" },
  { name: "Germany", flag: "🇩🇪" },
  { name: "France", flag: "🇫🇷" },
  { name: "Portugal", flag: "🇵🇹" },
  { name: "Netherlands", flag: "🇳🇱" },
  { name: "Belgium", flag: "🇧🇪" },
  { name: "Argentina", flag: "🇦🇷" },
  { name: "Brazil", flag: "🇧🇷" },
  { name: "Norway", flag: "🇳🇴" },
  { name: "Poland", flag: "🇵🇱" },
  { name: "Switzerland", flag: "🇨🇭" },
  { name: "Scotland", flag: "🏴󠁧󠁢󠁳󠁣󠁴󠁿" },
  { name: "Wales", flag: "🏴󠁧󠁢󠁷󠁬󠁳󠁿" },
  { name: "Ireland", flag: "🇮🇪" },
  { name: "Sweden", flag: "🇸🇪" },
  { name: "Denmark", flag: "🇩🇰" },
  { name: "Austria", flag: "🇦🇹" },
  { name: "Croatia", flag: "🇭🇷" }
];

const PERSONALITIES: Player["personality"][] = [
  "Leader",
  "Professional",
  "Temperamental",
  "Maverick",
  "Model Citizen"
];

import realSquads from './realSquads.json';

// Seed generator

const OVERRIDE_ATTRIBUTES: Record<string, Partial<Player>> = {
  "Erling Haaland": { overall: 92, potential: 95, pace: 89, shooting: 94, passing: 66, dribbling: 80, defending: 45, physical: 89, mental: 88, stamina: 82, age: 24 },
  "Kylian Mbappé": { overall: 92, potential: 95, pace: 97, shooting: 91, passing: 81, dribbling: 93, defending: 36, physical: 78, mental: 85, stamina: 85, age: 25 },
  "Jude Bellingham": { overall: 91, potential: 94, pace: 80, shooting: 85, passing: 86, dribbling: 88, defending: 81, physical: 84, mental: 90, stamina: 92, age: 21 },
  "Vinícius Júnior": { overall: 91, potential: 94, pace: 95, shooting: 85, passing: 82, dribbling: 94, defending: 30, physical: 68, mental: 83, stamina: 85, age: 24 },
  "Bukayo Saka": { overall: 89, potential: 92, pace: 86, shooting: 85, passing: 84, dribbling: 90, defending: 48, physical: 70, mental: 85, stamina: 86, age: 23 },
  "Cole Palmer": { overall: 88, potential: 91, pace: 80, shooting: 86, passing: 87, dribbling: 88, defending: 45, physical: 68, mental: 88, stamina: 83, age: 22 },
  "Lamine Yamal": { overall: 86, potential: 96, pace: 85, shooting: 80, passing: 82, dribbling: 90, defending: 35, physical: 55, mental: 80, stamina: 75, age: 17 },
  "Martin Ødegaard": { overall: 89, potential: 91, pace: 78, shooting: 82, passing: 90, dribbling: 88, defending: 58, physical: 65, mental: 89, stamina: 90, age: 25 },
  "Phil Foden": { overall: 89, potential: 91, pace: 86, shooting: 86, passing: 85, dribbling: 91, defending: 56, physical: 66, mental: 85, stamina: 85, age: 24 },
  "Rodri": { overall: 91, potential: 91, pace: 66, shooting: 80, passing: 88, dribbling: 84, defending: 89, physical: 86, mental: 94, stamina: 92, age: 28 },
  "Virgil van Dijk": { overall: 90, potential: 90, pace: 76, shooting: 60, passing: 79, dribbling: 72, defending: 92, physical: 86, mental: 90, stamina: 83, age: 33 },
  "Mohamed Salah": { overall: 89, potential: 89, pace: 88, shooting: 88, passing: 84, dribbling: 89, defending: 45, physical: 75, mental: 87, stamina: 87, age: 32 },
  "Marcus Rashford": { overall: 82, potential: 83, pace: 88, shooting: 81, passing: 77, dribbling: 82, defending: 42, physical: 74, mental: 75, stamina: 80, age: 26 },
  "Robert Lewandowski": { overall: 89, potential: 89, pace: 73, shooting: 91, passing: 77, dribbling: 82, defending: 44, physical: 82, mental: 89, stamina: 78, age: 36 }
};

export function generateSquadForClub(clubId: string, clubRep: number): Player[] {
  const squad: Player[] = [];
  
  // Real players from Wikipedia
  const realPlayers = (realSquads as any)[clubId] || [];
  
  let idCounter = 1;

  // Add the real players we fetched
  for (const preset of realPlayers) {
    // Determine overall based on club reputation plus some randomness (clubRep is 1-100)
    let baseAvg = 60;
    if (clubRep >= 90) baseAvg = 85;
    else if (clubRep >= 85) baseAvg = 82;
    else if (clubRep >= 80) baseAvg = 78;
    else if (clubRep >= 75) baseAvg = 75;
    else if (clubRep >= 70) baseAvg = 72;
    else baseAvg = 68;

    // We generate a deterministic pseudo-random offset based on the player's name length so it stays consistent
    const nameSeed = preset.name.length + preset.name.charCodeAt(0) + preset.name.charCodeAt(preset.name.length - 1);
    const variance = (nameSeed % 11) - 5; // -5 to +5
    
    // Younger players in high rep clubs get lower OVR but high potential
    let age = preset.age || (18 + (nameSeed % 15));
    let ageAdjustment = 0;
    if (age < 21) ageAdjustment = -4;
    else if (age > 32) ageAdjustment = -2;

    const override = TOP_PLAYER_OVERRIDES[preset.name];
    let overall = override ? override.overall : Math.min(99, Math.max(50, baseAvg + variance + ageAdjustment));
    const pos = preset.position as "GK" | "DEF" | "MID" | "ATT";

    // Potential
    let potential = overall;
    if (override) {
      potential = override.potential;
    } else if (age < 23) {
      potential = Math.min(99, overall + 8 + (nameSeed % 7));
    } else if (age < 28) {
      potential = Math.min(99, overall + 2 + (nameSeed % 4));
    }

    // Distribute attributes realistically
    let attributes = distributeAttributes(pos, overall);
    const hero = OVERRIDE_ATTRIBUTES[preset.name];
    if (hero) {
      if (hero.overall) overall = hero.overall;
      if (hero.potential) potential = hero.potential;
      if (hero.age) age = hero.age;
      attributes = {
        pace: hero.pace || attributes.pace,
        shooting: hero.shooting || attributes.shooting,
        passing: hero.passing || attributes.passing,
        dribbling: hero.dribbling || attributes.dribbling,
        defending: hero.defending || attributes.defending,
        physical: hero.physical || attributes.physical,
        mental: hero.mental || attributes.mental,
        stamina: hero.stamina || attributes.stamina,
      };
    }

    squad.push({
      id: preset.id || `${clubId}_r_${idCounter++}`,
      clubId,
      name: preset.name,
      position: pos,
      age: age,
      nationality: preset.nationality || "🏳️",
      nationalityFlag: preset.nationalityFlag || "🏳️",
      pace: attributes.pace,
      shooting: attributes.shooting,
      passing: attributes.passing,
      dribbling: attributes.dribbling,
      defending: attributes.defending,
      physical: attributes.physical,
      mental: attributes.mental,
      stamina: attributes.stamina,
      overall: overall,
      potential: potential,
      wage: calculateWage(overall, clubRep),
      value: calculateValue(overall, age, potential, clubRep),
      morale: 80 + (nameSeed % 20),
      personality: PERSONALITIES[nameSeed % PERSONALITIES.length],
      contractExpiry: (nameSeed % 4) + 1,
      injuryStatus: "Fit",
      goals: 0,
      assists: 0,
      ratingHistory: []
    });
  }

  // If Wikipedia failed or we have fewer than 18 players, pad out the squad
  const positionsNeeded = ["GK", "GK", "DEF", "DEF", "DEF", "DEF", "DEF", "MID", "MID", "MID", "MID", "MID", "MID", "ATT", "ATT", "ATT", "ATT", "ATT"];
  
  // Count what we have
  const counts = { GK: 0, DEF: 0, MID: 0, ATT: 0 };
  squad.forEach(p => counts[p.position]++);
  
  for (const requiredPos of positionsNeeded) {
    if (counts[requiredPos as keyof typeof counts] > 0) {
      counts[requiredPos as keyof typeof counts]--;
      continue;
    }
    
    // Generate a fallback generic player
    let baseAvg = 60;
    if (clubRep >= 90) baseAvg = 82;
    else if (clubRep >= 80) baseAvg = 78;
    else if (clubRep >= 75) baseAvg = 74;
    else if (clubRep >= 70) baseAvg = 70;
    else baseAvg = 66;

    const variance = Math.floor(prng() * 8) - 4;
    const ovr = Math.max(50, Math.min(99, baseAvg + variance));
    
    const randomNationality = NATIONALITIES[Math.floor(prng() * NATIONALITIES.length)];
    const firstName = COMMON_FIRST_NAMES[Math.floor(prng() * COMMON_FIRST_NAMES.length)];
    const lastName = COMMON_LAST_NAMES[Math.floor(prng() * COMMON_LAST_NAMES.length)];

    squad.push({
      id: `${clubId}_gen_${idCounter++}`,
      clubId,
      name: `${firstName} ${lastName}`,
      position: requiredPos as "GK" | "DEF" | "MID" | "ATT",
      age: Math.floor(prng() * 14) + 18,
      nationality: randomNationality.name,
      nationalityFlag: randomNationality.flag,
      pace: Math.floor(prng() * 20) + (ovr - 10),
      shooting: Math.floor(prng() * 20) + (requiredPos === 'ATT' ? ovr : ovr - 20),
      passing: Math.floor(prng() * 20) + (ovr - 10),
      dribbling: Math.floor(prng() * 20) + (ovr - 10),
      defending: Math.floor(prng() * 20) + (requiredPos === 'DEF' ? ovr : ovr - 20),
      physical: Math.floor(prng() * 20) + (ovr - 10),
      mental: Math.floor(prng() * 20) + (ovr - 10),
      stamina: Math.floor(prng() * 20) + (ovr - 10),
      overall: ovr,
      potential: Math.min(99, ovr + Math.floor(prng() * 12)),
      wage: calculateWage(ovr, clubRep),
      value: calculateValue(ovr, Math.floor(prng() * 14) + 18, Math.min(99, ovr + Math.floor(prng() * 12)), clubRep),
      morale: 80 + Math.floor(prng() * 20),
      personality: PERSONALITIES[Math.floor(prng() * PERSONALITIES.length)],
      contractExpiry: Math.floor(prng() * 4) + 1,
      injuryStatus: "Fit",
      goals: 0,
      assists: 0,
      ratingHistory: []
    });
  }

  return squad;
}

function distributeAttributes(pos: "GK" | "DEF" | "MID" | "ATT", overall: number) {
  // Simple heuristic mapping
  const base = overall;
  let pace = base + Math.floor(prng() * 10) - 5;
  let shooting = base + Math.floor(prng() * 10) - 5;
  let passing = base + Math.floor(prng() * 10) - 5;
  let dribbling = base + Math.floor(prng() * 10) - 5;
  let defending = base + Math.floor(prng() * 10) - 5;
  let physical = base + Math.floor(prng() * 10) - 5;
  let mental = base + Math.floor(prng() * 10) - 5;
  let stamina = base + Math.floor(prng() * 10) - 5;

  if (pos === "GK") {
    // For GK, defending represents GK handling/reflexes. Shooting/Dribbling/Pace are low.
    defending = base + Math.floor(prng() * 6) + 4; // reflexes
    physical = base + Math.floor(prng() * 6) + 2; // diving
    passing = base - Math.floor(prng() * 10) - 5; // kicking
    pace = 30 + Math.floor(prng() * 20);
    shooting = 10 + Math.floor(prng() * 15);
    dribbling = 25 + Math.floor(prng() * 20);
  } else if (pos === "DEF") {
    defending = base + Math.floor(prng() * 8) + 3;
    physical = base + Math.floor(prng() * 6) + 2;
    shooting = base - Math.floor(prng() * 15) - 5;
    passing = base - Math.floor(prng() * 5);
  } else if (pos === "MID") {
    passing = base + Math.floor(prng() * 8) + 3;
    dribbling = base + Math.floor(prng() * 6) + 1;
    defending = base - Math.floor(prng() * 5) - 2;
    shooting = base - Math.floor(prng() * 5);
  } else if (pos === "ATT") {
    shooting = base + Math.floor(prng() * 8) + 4;
    pace = base + Math.floor(prng() * 8) + 2;
    dribbling = base + Math.floor(prng() * 6) + 1;
    defending = base - Math.floor(prng() * 20) - 10;
  }

  // Bound check
  const cap = (val: number) => Math.max(1, Math.min(99, val));

  return {
    pace: cap(pace),
    shooting: cap(shooting),
    passing: cap(passing),
    dribbling: cap(dribbling),
    defending: cap(defending),
    physical: cap(physical),
    mental: cap(mental),
    stamina: cap(stamina)
  };
}

export function calculateWage(overall: number, clubRep: number = 75): number {
  // Realistic modern football wage curve (Euros per week)
  let baseWage = 0;
  if (overall >= 90) baseWage = 300000 + ((overall - 90) * 60000); // 90=300k, 94=540k
  else if (overall >= 85) baseWage = 140000 + ((overall - 85) * 32000); // 85=140k, 89=268k
  else if (overall >= 80) baseWage = 70000 + ((overall - 80) * 14000); // 80=70k, 84=126k
  else if (overall >= 75) baseWage = 35000 + ((overall - 75) * 7000); // 75=35k, 79=63k
  else if (overall >= 70) baseWage = 15000 + ((overall - 70) * 4000); // 70=15k, 74=31k
  else baseWage = Math.max(1000, Math.pow(overall / 60, 3) * 8000);

  // Big clubs (high rep) pay a premium
  const repPremium = 1.0 + ((clubRep - 70) / 80);
  
  const rawWage = baseWage * repPremium * (0.85 + prng() * 0.3);
  return Math.floor(rawWage / 1000) * 1000; // Round to nearest 1,000
}

export function calculateValue(overall: number, age: number, potential: number = overall, clubRep: number = 75): number {
  let ageMultiplier = 1.0;
  if (age <= 19) ageMultiplier = 2.0 + ((potential - overall) * 0.1);
  else if (age <= 22) ageMultiplier = 1.5 + ((potential - overall) * 0.05);
  else if (age <= 25) ageMultiplier = 1.2;
  else if (age >= 30 && age <= 32) ageMultiplier = 0.6;
  else if (age > 32) ageMultiplier = 0.3;

  let baseVal = 0;
  if (overall >= 90) baseVal = 120000000 + ((overall - 90) * 20000000); // 90=120M, 93=180M
  else if (overall >= 85) baseVal = 60000000 + ((overall - 85) * 10000000); // 85=60M, 89=100M
  else if (overall >= 80) baseVal = 25000000 + ((overall - 80) * 5000000); // 80=25M, 84=45M
  else if (overall >= 75) baseVal = 10000000 + ((overall - 75) * 3000000); 
  else if (overall >= 70) baseVal = 4000000 + ((overall - 70) * 1200000);
  else baseVal = Math.pow(overall / 60, 4) * 1500000;

  const repPremium = 1.0 + ((clubRep - 70) / 100);
  const rawValue = baseVal * ageMultiplier * repPremium * (0.9 + prng() * 0.2);
  return Math.floor(rawValue / 100000) * 100000;
}

export function generateAllClubsWithSquads(includeGeneratedFillers = true): { clubs: Club[], players: Player[] } {
  setSeed(12345);
  let players: Player[] = [];
  
  for (const club of CLUBS_DATA) {
    const squad = generateSquadForClub(club.id, club.reputation);
    players.push(...squad);
  }

  return {
    clubs: CLUBS_DATA,
    players
  };
}
