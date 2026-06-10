/* eslint-disable */
export interface Club {
  id: string;
  name: string;
  shortName: string;
  league: "EPL" | "La Liga" | "Serie A" | "Bundesliga" | "Ligue 1" | "Eredivisie" | "Liga Portugal" | "Serbian SuperLiga" | "Swiss Super League" | "Ukrainian Premier League" | "Danish Superliga" | "Allsvenskan" | "Russian Premier League" | "Ekstraklasa" | "Prva HNL";
  primaryColor: string;
  secondaryColor: string;
  reputation: number; // 1-100
  stadium: string;
  capacity: number;
  transferBudget: number; // in Euros
  wageBudget: number; // in Euros per week
  bankBalance?: number; // General funds
  stadiumCondition?: number; // 0-100
  ticketPrice?: number; // Euros
  sponsorships?: Sponsorship[];
}

export interface Sponsorship {
  id: string;
  name: string;
  type: "Kit" | "Stadium" | "Sleeve";
  valuePerWeek: number; // payout per week
  remainingWeeks: number;
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
  truePosition?: string;
  bestRole?: string;
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
  injuryDuration?: number; // Matchdays remaining
  suspensionDuration?: number; // Matchdays remaining
  // Seasonal stats
  stats?: any; // For backward compatibility with some components
  appearances?: number;
  goals: number;
  assists: number;
  ratingHistory: number[];
  trainingFocus?: "Balanced" | "Attacking" | "Defensive" | "Fitness" | "Tactical";
  isTransferListed?: boolean;
  isLoanListed?: boolean;
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
  "Eredivisie": { name: "Eredivisie", color: "#f97316", emoji: "🇳🇱" },
  "Liga Portugal": { name: "Liga Portugal", color: "#16a34a", emoji: "🇵🇹" },
  "Serbian SuperLiga": { name: "Serbian SuperLiga", color: "#dc2626", emoji: "🇷🇸" },
  "Swiss Super League": { name: "Swiss Super League", color: "#dc2626", emoji: "🇨🇭" },
  "Ukrainian Premier League": { name: "Ukrainian Premier League", color: "#facc15", emoji: "🇺🇦" },
  "Danish Superliga": { name: "Danish Superliga", color: "#dc2626", emoji: "🇩🇰" },
  "Allsvenskan": { name: "Allsvenskan", color: "#1d4ed8", emoji: "🇸🇪" },
  "Russian Premier League": { name: "Russian Premier League", color: "#38bdf8", emoji: "🇷🇺" },
  "Ekstraklasa": { name: "Ekstraklasa", color: "#dc2626", emoji: "🇵🇱" },
  "Prva HNL": { name: "Prva HNL", color: "#dc2626", emoji: "🇭🇷" },
};

export const TOP_PLAYER_OVERRIDES: Record<string, { overall: number, potential: number }> = {
  "Endrick": { overall: 82, potential: 93 },
  "Arda Güler": { overall: 83, potential: 92 },
  "Leny Yoro": { overall: 81, potential: 90 },
  "Savinho": { overall: 84, potential: 89 },
  "Riccardo Calafiori": { overall: 84, potential: 89 },
  "Michael Olise": { overall: 86, potential: 90 },
  "João Neves": { overall: 84, potential: 91 },
  "Alejandro Garnacho": { overall: 84, potential: 90 },
  "Bradley Barcola": { overall: 84, potential: 90 },
  "Pau Cubarsí": { overall: 82, potential: 92 },
  "Kobbie Mainoo": { overall: 83, potential: 90 },
  "Mathys Tel": { overall: 82, potential: 89 },
  "Evan Ferguson": { overall: 81, potential: 88 },
  "Amadou Onana": { overall: 84, potential: 88 },
  "Ian Maatsen": { overall: 82, potential: 86 },
  "Viktor Gyökeres": { overall: 88, potential: 89 },
  "Alexander Isak": { overall: 87, potential: 89 },
  "Anthony Gordon": { overall: 85, potential: 88 },
  "Micky van de Ven": { overall: 85, potential: 89 },
  "Destiny Udogie": { overall: 84, potential: 88 },
  "Joshua Zirkzee": { overall: 83, potential: 87 },


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
  { id: "mancity", name: "Manchester City", shortName: "Man City", league: "EPL", primaryColor: "#7dd3fc", secondaryColor: "#1e3a8a", reputation: 92, stadium: "Etihad Stadium", capacity: 53400, transferBudget: 198374999, wageBudget: 5554500, bankBalance: 147000000, ticketPrice: 47, stadiumCondition: 87, sponsorships: [] },
  { id: "arsenal", name: "Arsenal", shortName: "Arsenal", league: "EPL", primaryColor: "#ef4444", secondaryColor: "#ffffff", reputation: 90, stadium: "Emirates Stadium", capacity: 60700, transferBudget: 145474998, wageBudget: 4628748, bankBalance: 122500000, ticketPrice: 68, stadiumCondition: 63, sponsorships: [] },
  { id: "liverpool", name: "Liverpool", shortName: "Liverpool", league: "EPL", primaryColor: "#b91c1c", secondaryColor: "#facc15", reputation: 90, stadium: "Anfield", capacity: 61200, transferBudget: 125637498, wageBudget: 5025500, bankBalance: 133000000, ticketPrice: 52, stadiumCondition: 94, sponsorships: [] },
  { id: "chelsea", name: "Chelsea", shortName: "Chelsea", league: "EPL", primaryColor: "#1d4ed8", secondaryColor: "#ffffff", reputation: 85, stadium: "Stamford Bridge", capacity: 40300, transferBudget: 171925000, wageBudget: 4496498, bankBalance: 119000000, ticketPrice: 55, stadiumCondition: 70, sponsorships: [] },
  { id: "manunited", name: "Manchester United", shortName: "Man United", league: "EPL", primaryColor: "#dc2626", secondaryColor: "#000000", reputation: 87, stadium: "Old Trafford", capacity: 74300, transferBudget: 132249998, wageBudget: 5290000, bankBalance: 140000000, ticketPrice: 65, stadiumCondition: 74, sponsorships: [] },
  { id: "tottenham", name: "Tottenham Hotspur", shortName: "Tottenham", league: "EPL", primaryColor: "#0f172a", secondaryColor: "#ffffff", reputation: 84, stadium: "Tottenham Hotspur Stadium", capacity: 62850, transferBudget: 112412498, wageBudget: 3702998, bankBalance: 98000000, ticketPrice: 61, stadiumCondition: 62, sponsorships: [] },
  { id: "newcastle", name: "Newcastle United", shortName: "Newcastle", league: "EPL", primaryColor: "#000000", secondaryColor: "#ffffff", reputation: 83, stadium: "St. James' Park", capacity: 52300, transferBudget: 119024998, wageBudget: 3306249, bankBalance: 87500000, ticketPrice: 49, stadiumCondition: 61, sponsorships: [] },
  { id: "astonvilla", name: "Aston Villa", shortName: "Aston Villa", league: "EPL", primaryColor: "#7c2d12", secondaryColor: "#93c5fd", reputation: 82, stadium: "Villa Park", capacity: 42640, transferBudget: 99187499, wageBudget: 2909500, bankBalance: 77000000, ticketPrice: 48, stadiumCondition: 99, sponsorships: [] },
  { id: "westham", name: "West Ham United", shortName: "West Ham", league: "EPL", primaryColor: "#881337", secondaryColor: "#06b6d4", reputation: 79, stadium: "London Stadium", capacity: 62500, transferBudget: 66124998, wageBudget: 2380498, bankBalance: 63000000, ticketPrice: 42, stadiumCondition: 69, sponsorships: [] },
  { id: "brighton", name: "Brighton & Hove Albion", shortName: "Brighton", league: "EPL", primaryColor: "#2563eb", secondaryColor: "#ffffff", reputation: 80, stadium: "Amex Stadium", capacity: 31800, transferBudget: 79350000, wageBudget: 1983748, bankBalance: 52500000, ticketPrice: 53, stadiumCondition: 70, sponsorships: [] },
  { id: "crystalpalace", name: "Crystal Palace", shortName: "Crystal Palace", league: "EPL", primaryColor: "#1d4ed8", secondaryColor: "#dc2626", reputation: 76, stadium: "Selhurst Park", capacity: 25400, transferBudget: 52899999, wageBudget: 1851498, bankBalance: 49000000, ticketPrice: 64, stadiumCondition: 72, sponsorships: [] },
  { id: "fulham", name: "Fulham", shortName: "Fulham", league: "EPL", primaryColor: "#ffffff", secondaryColor: "#000000", reputation: 76, stadium: "Craven Cottage", capacity: 29600, transferBudget: 46287500, wageBudget: 1719249, bankBalance: 45500000, ticketPrice: 65, stadiumCondition: 90, sponsorships: [] },
  { id: "bournemouth", name: "Bournemouth", shortName: "Bournemouth", league: "EPL", primaryColor: "#ef4444", secondaryColor: "#000000", reputation: 75, stadium: "Vitality Stadium", capacity: 11300, transferBudget: 39675000, wageBudget: 1454750, bankBalance: 38500000, ticketPrice: 51, stadiumCondition: 80, sponsorships: [] },
  { id: "brentford", name: "Brentford", shortName: "Brentford", league: "EPL", primaryColor: "#e11d48", secondaryColor: "#ffffff", reputation: 75, stadium: "Gtech Community Stadium", capacity: 17250, transferBudget: 42320000, wageBudget: 1454750, bankBalance: 38500000, ticketPrice: 44, stadiumCondition: 82, sponsorships: [] },
  { id: "everton", name: "Everton", shortName: "Everton", league: "EPL", primaryColor: "#1d4ed8", secondaryColor: "#ffffff", reputation: 75, stadium: "Goodison Park", capacity: 39572, transferBudget: 26449999, wageBudget: 1851498, bankBalance: 49000000, ticketPrice: 64, stadiumCondition: 61, sponsorships: [] },
  { id: "wolves", name: "Wolverhampton Wanderers", shortName: "Wolves", league: "EPL", primaryColor: "#eab308", secondaryColor: "#000000", reputation: 75, stadium: "Molineux Stadium", capacity: 32000, transferBudget: 37029998, wageBudget: 1586999, bankBalance: 42000000, ticketPrice: 41, stadiumCondition: 82, sponsorships: [] },
  { id: "nottingham", name: "Nottingham Forest", shortName: "Nottingham F", league: "EPL", primaryColor: "#dc2626", secondaryColor: "#ffffff", reputation: 74, stadium: "The City Ground", capacity: 30400, transferBudget: 46287500, wageBudget: 1785373, bankBalance: 47250000, ticketPrice: 50, stadiumCondition: 60, sponsorships: [] },
  { id: "leicester", name: "Leicester City", shortName: "Leicester", league: "EPL", primaryColor: "#1e40af", secondaryColor: "#facc15", reputation: 74, stadium: "King Power Stadium", capacity: 32260, transferBudget: 33062498, wageBudget: 1586999, bankBalance: 42000000, ticketPrice: 51, stadiumCondition: 78, sponsorships: [] },
  { id: "ipswich", name: "Ipswich Town", shortName: "Ipswich", league: "EPL", primaryColor: "#2563eb", secondaryColor: "#ffffff", reputation: 71, stadium: "Portman Road", capacity: 29670, transferBudget: 29094998, wageBudget: 1190248, bankBalance: 31500000, ticketPrice: 57, stadiumCondition: 63, sponsorships: [] },
  { id: "southampton", name: "Southampton", shortName: "Southampton", league: "EPL", primaryColor: "#ef4444", secondaryColor: "#ffffff", reputation: 72, stadium: "St Mary's Stadium", capacity: 32380, transferBudget: 26449999, wageBudget: 1322500, bankBalance: 35000000, ticketPrice: 52, stadiumCondition: 89, sponsorships: [] },

  // La Liga (20)
  { id: "realmadrid", name: "Real Madrid", shortName: "Real Madrid", league: "La Liga", primaryColor: "#ffffff", secondaryColor: "#facc15", reputation: 95, stadium: "Santiago Bernabéu", capacity: 81000, transferBudget: 238049998, wageBudget: 6347999, bankBalance: 168000000, ticketPrice: 38, stadiumCondition: 69, sponsorships: [] },
  { id: "barcelona", name: "FC Barcelona", shortName: "Barcelona", league: "La Liga", primaryColor: "#991b1b", secondaryColor: "#1e3a8a", reputation: 92, stadium: "Spotify Camp Nou", capacity: 99350, transferBudget: 79350000, wageBudget: 5157750, bankBalance: 136500000, ticketPrice: 55, stadiumCondition: 87, sponsorships: [] },
  { id: "atletico", name: "Atlético Madrid", shortName: "Atlético", league: "La Liga", primaryColor: "#dc2626", secondaryColor: "#1d4ed8", reputation: 87, stadium: "Cívitas Metropolitano", capacity: 70460, transferBudget: 105799999, wageBudget: 3967498, bankBalance: 105000000, ticketPrice: 47, stadiumCondition: 75, sponsorships: [] },
  { id: "real_sociedad", name: "Real Sociedad", shortName: "R. Sociedad", league: "La Liga", primaryColor: "#2563eb", secondaryColor: "#ffffff", reputation: 82, stadium: "Reale Arena", capacity: 39500, transferBudget: 46287500, wageBudget: 1983748, bankBalance: 52500000, ticketPrice: 60, stadiumCondition: 65, sponsorships: [] },
  { id: "athletic_bilbao", name: "Athletic Club Bilbao", shortName: "Athletic", league: "La Liga", primaryColor: "#dc2626", secondaryColor: "#ffffff", reputation: 82, stadium: "San Mamés", capacity: 53280, transferBudget: 59512498, wageBudget: 2115998, bankBalance: 56000000, ticketPrice: 57, stadiumCondition: 92, sponsorships: [] },
  { id: "girona", name: "Girona", shortName: "Girona", league: "La Liga", primaryColor: "#ef4444", secondaryColor: "#ffffff", reputation: 80, stadium: "Montilivi", capacity: 14600, transferBudget: 37029998, wageBudget: 1586999, bankBalance: 42000000, ticketPrice: 63, stadiumCondition: 69, sponsorships: [] },
  { id: "betis", name: "Real Betis", shortName: "Real Betis", league: "La Liga", primaryColor: "#16a34a", secondaryColor: "#ffffff", reputation: 80, stadium: "Benito Villamarín", capacity: 60720, transferBudget: 33062498, wageBudget: 1851498, bankBalance: 49000000, ticketPrice: 64, stadiumCondition: 74, sponsorships: [] },
  { id: "villarreal", name: "Villarreal", shortName: "Villarreal", league: "La Liga", primaryColor: "#eab308", secondaryColor: "#1d4ed8", reputation: 80, stadium: "Estadio de la Cerámica", capacity: 23000, transferBudget: 39675000, wageBudget: 1785373, bankBalance: 47250000, ticketPrice: 45, stadiumCondition: 88, sponsorships: [] },
  { id: "sevilla", name: "Sevilla FC", shortName: "Sevilla", league: "La Liga", primaryColor: "#ef4444", secondaryColor: "#ffffff", reputation: 80, stadium: "Ramón Sánchez-Pizjuán", capacity: 43880, transferBudget: 23805000, wageBudget: 1983748, bankBalance: 52500000, ticketPrice: 35, stadiumCondition: 76, sponsorships: [] },
  { id: "valencia", name: "Valencia CF", shortName: "Valencia", league: "La Liga", primaryColor: "#ffffff", secondaryColor: "#f97316", reputation: 78, stadium: "Mestalla", capacity: 49430, transferBudget: 15869998, wageBudget: 1586999, bankBalance: 42000000, ticketPrice: 33, stadiumCondition: 95, sponsorships: [] },
  { id: "osasuna", name: "Osasuna", shortName: "Osasuna", league: "La Liga", primaryColor: "#dc2626", secondaryColor: "#1e3a8a", reputation: 75, stadium: "El Sadar", capacity: 23576, transferBudget: 13224999, wageBudget: 1124123, bankBalance: 29750000, ticketPrice: 44, stadiumCondition: 77, sponsorships: [] },
  { id: "getafe", name: "Getafe CF", shortName: "Getafe", league: "La Liga", primaryColor: "#1d4ed8", secondaryColor: "#ffffff", reputation: 74, stadium: "Coliseum Alfonso Pérez", capacity: 16500, transferBudget: 14547498, wageBudget: 1190248, bankBalance: 31500000, ticketPrice: 64, stadiumCondition: 88, sponsorships: [] },
  { id: "celta", name: "Celta Vigo", shortName: "Celta", league: "La Liga", primaryColor: "#bae6fd", secondaryColor: "#ffffff", reputation: 75, stadium: "Abanca-Balaídos", capacity: 29000, transferBudget: 18514998, wageBudget: 1256375, bankBalance: 33250000, ticketPrice: 63, stadiumCondition: 61, sponsorships: [] },
  { id: "mallorca", name: "RCD Mallorca", shortName: "Mallorca", league: "La Liga", primaryColor: "#dc2626", secondaryColor: "#000000", reputation: 74, stadium: "Son Moix", capacity: 23010, transferBudget: 15869998, wageBudget: 1057998, bankBalance: 28000000, ticketPrice: 65, stadiumCondition: 82, sponsorships: [] },
  { id: "rayo", name: "Rayo Vallecano", shortName: "Rayo", league: "La Liga", primaryColor: "#ffffff", secondaryColor: "#dc2626", reputation: 74, stadium: "Vallecas", capacity: 14700, transferBudget: 10580000, wageBudget: 991873, bankBalance: 26250000, ticketPrice: 57, stadiumCondition: 68, sponsorships: [] },
  { id: "laspalmas", name: "UD Las Palmas", shortName: "Las Palmas", league: "La Liga", primaryColor: "#eab308", secondaryColor: "#2563eb", reputation: 73, stadium: "Gran Canaria", capacity: 32400, transferBudget: 13224999, wageBudget: 925748, bankBalance: 24500000, ticketPrice: 59, stadiumCondition: 80, sponsorships: [] },
  { id: "alaves", name: "Deportivo Alavés", shortName: "Alavés", league: "La Liga", primaryColor: "#2563eb", secondaryColor: "#ffffff", reputation: 73, stadium: "Mendizorrotza", capacity: 19840, transferBudget: 11902500, wageBudget: 952198, bankBalance: 25200000, ticketPrice: 40, stadiumCondition: 92, sponsorships: [] },
  { id: "leganes", name: "CD Leganés", shortName: "Leganés", league: "La Liga", primaryColor: "#2563eb", secondaryColor: "#ffffff", reputation: 70, stadium: "Butarque", capacity: 12450, transferBudget: 9257498, wageBudget: 793499, bankBalance: 21000000, ticketPrice: 68, stadiumCondition: 67, sponsorships: [] },
  { id: "valladolid", name: "Real Valladolid", shortName: "Valladolid", league: "La Liga", primaryColor: "#a855f7", secondaryColor: "#ffffff", reputation: 71, stadium: "José Zorrilla", capacity: 27618, transferBudget: 10580000, wageBudget: 859624, bankBalance: 22750000, ticketPrice: 32, stadiumCondition: 77, sponsorships: [] },
  { id: "espanyol", name: "RCD Espanyol", shortName: "Espanyol", league: "La Liga", primaryColor: "#3b82f6", secondaryColor: "#ffffff", reputation: 72, stadium: "Stage Front Stadium", capacity: 40000, transferBudget: 11902500, wageBudget: 1031548, bankBalance: 27300000, ticketPrice: 39, stadiumCondition: 72, sponsorships: [] },

    // Eredivisie (18)
  { id: "psv", name: "PSV Eindhoven", shortName: "PSV", league: "Eredivisie", primaryColor: "#dc2626", secondaryColor: "#ffffff", reputation: 83, stadium: "Philips Stadion", capacity: 35119, transferBudget: 40250000, wageBudget: 1724999, bankBalance: 52500000, ticketPrice: 40, stadiumCondition: 92, sponsorships: [] },
  { id: "feyenoord", name: "Feyenoord", shortName: "Feyenoord", league: "Eredivisie", primaryColor: "#dc2626", secondaryColor: "#ffffff", reputation: 82, stadium: "De Kuip", capacity: 51117, transferBudget: 34500000, wageBudget: 1609999, bankBalance: 49000000, ticketPrice: 42, stadiumCondition: 78, sponsorships: [] },
  { id: "ajax", name: "AFC Ajax", shortName: "Ajax", league: "Eredivisie", primaryColor: "#dc2626", secondaryColor: "#ffffff", reputation: 84, stadium: "Johan Cruyff Arena", capacity: 55865, transferBudget: 46000000, wageBudget: 1954999, bankBalance: 59500000, ticketPrice: 45, stadiumCondition: 94, sponsorships: [] },
  { id: "az", name: "AZ Alkmaar", shortName: "AZ", league: "Eredivisie", primaryColor: "#dc2626", secondaryColor: "#ffffff", reputation: 77, stadium: "AFAS Stadion", capacity: 19500, transferBudget: 20700000, wageBudget: 1034999, bankBalance: 31500000, ticketPrice: 35, stadiumCondition: 95, sponsorships: [] },
  { id: "twente", name: "FC Twente", shortName: "Twente", league: "Eredivisie", primaryColor: "#dc2626", secondaryColor: "#ffffff", reputation: 76, stadium: "De Grolsch Veste", capacity: 30205, transferBudget: 17250000, wageBudget: 977499, bankBalance: 29750000, ticketPrice: 33, stadiumCondition: 88, sponsorships: [] },
  { id: "sparta", name: "Sparta Rotterdam", shortName: "Sparta", league: "Eredivisie", primaryColor: "#dc2626", secondaryColor: "#ffffff", reputation: 72, stadium: "Het Kasteel", capacity: 10599, transferBudget: 8049999, wageBudget: 575000, bankBalance: 17500000, ticketPrice: 28, stadiumCondition: 82, sponsorships: [] },
  { id: "utrecht", name: "FC Utrecht", shortName: "Utrecht", league: "Eredivisie", primaryColor: "#dc2626", secondaryColor: "#ffffff", reputation: 74, stadium: "Stadion Galgenwaard", capacity: 23750, transferBudget: 11500000, wageBudget: 804999, bankBalance: 24500000, ticketPrice: 32, stadiumCondition: 79, sponsorships: [] },
  { id: "heerenveen", name: "SC Heerenveen", shortName: "Heerenveen", league: "Eredivisie", primaryColor: "#1e3a8a", secondaryColor: "#ffffff", reputation: 73, stadium: "Abe Lenstra Stadion", capacity: 27224, transferBudget: 10350000, wageBudget: 690000, bankBalance: 21000000, ticketPrice: 30, stadiumCondition: 84, sponsorships: [] },
  { id: "goaheadeagles", name: "Go Ahead Eagles", shortName: "GA Eagles", league: "Eredivisie", primaryColor: "#facc15", secondaryColor: "#dc2626", reputation: 71, stadium: "De Adelaarshorst", capacity: 9909, transferBudget: 6899999, wageBudget: 517499, bankBalance: 15750000, ticketPrice: 25, stadiumCondition: 72, sponsorships: [] },
  { id: "nec", name: "NEC Nijmegen", shortName: "NEC", league: "Eredivisie", primaryColor: "#dc2626", secondaryColor: "#16a34a", reputation: 72, stadium: "Goffertstadion", capacity: 12500, transferBudget: 8049999, wageBudget: 552000, bankBalance: 16800000, ticketPrice: 27, stadiumCondition: 70, sponsorships: [] },
  { id: "pec", name: "PEC Zwolle", shortName: "Zwolle", league: "Eredivisie", primaryColor: "#1e3a8a", secondaryColor: "#ffffff", reputation: 70, stadium: "MAC³PARK Stadion", capacity: 14000, transferBudget: 5750000, wageBudget: 459999, bankBalance: 14000000, ticketPrice: 24, stadiumCondition: 81, sponsorships: [] },
  { id: "fortuna", name: "Fortuna Sittard", shortName: "Fortuna", league: "Eredivisie", primaryColor: "#facc15", secondaryColor: "#16a34a", reputation: 70, stadium: "Fortuna Sittard Stadion", capacity: 12800, transferBudget: 6899999, wageBudget: 482999, bankBalance: 14700000, ticketPrice: 26, stadiumCondition: 75, sponsorships: [] },
  { id: "heracles", name: "Heracles Almelo", shortName: "Heracles", league: "Eredivisie", primaryColor: "#000000", secondaryColor: "#ffffff", reputation: 70, stadium: "Erve Asito", capacity: 12080, transferBudget: 5750000, wageBudget: 459999, bankBalance: 14000000, ticketPrice: 25, stadiumCondition: 88, sponsorships: [] },
  { id: "rkc", name: "RKC Waalwijk", shortName: "RKC", league: "Eredivisie", primaryColor: "#facc15", secondaryColor: "#1e3a8a", reputation: 69, stadium: "Mandemakers Stadion", capacity: 7500, transferBudget: 4600000, wageBudget: 402499, bankBalance: 12250000, ticketPrice: 22, stadiumCondition: 65, sponsorships: [] },
  { id: "almere", name: "Almere City FC", shortName: "Almere", league: "Eredivisie", primaryColor: "#dc2626", secondaryColor: "#000000", reputation: 68, stadium: "Yanmar Stadion", capacity: 4501, transferBudget: 3449999, wageBudget: 345000, bankBalance: 10500000, ticketPrice: 20, stadiumCondition: 70, sponsorships: [] },
  { id: "willemii", name: "Willem II", shortName: "Willem II", league: "Eredivisie", primaryColor: "#dc2626", secondaryColor: "#1e3a8a", reputation: 71, stadium: "Koning Willem II Stadion", capacity: 14700, transferBudget: 6899999, wageBudget: 517499, bankBalance: 15750000, ticketPrice: 26, stadiumCondition: 80, sponsorships: [] },
  { id: "nac", name: "NAC Breda", shortName: "NAC Breda", league: "Eredivisie", primaryColor: "#facc15", secondaryColor: "#000000", reputation: 71, stadium: "Rat Verlegh Stadion", capacity: 19000, transferBudget: 7474999, wageBudget: 552000, bankBalance: 16800000, ticketPrice: 28, stadiumCondition: 85, sponsorships: [] },
  { id: "groningen", name: "FC Groningen", shortName: "Groningen", league: "Eredivisie", primaryColor: "#16a34a", secondaryColor: "#ffffff", reputation: 73, stadium: "Euroborg", capacity: 22550, transferBudget: 9200000, wageBudget: 632500, bankBalance: 19250000, ticketPrice: 30, stadiumCondition: 90, sponsorships: [] },

  // Liga Portugal (18)
  { id: "sporting", name: "Sporting CP", shortName: "Sporting", league: "Liga Portugal", primaryColor: "#16a34a", secondaryColor: "#ffffff", reputation: 84, stadium: "Estádio José Alvalade", capacity: 50095, transferBudget: 51749999, wageBudget: 1839999, bankBalance: 56000000, ticketPrice: 42, stadiumCondition: 90, sponsorships: [] },
  { id: "benfica", name: "SL Benfica", shortName: "Benfica", league: "Liga Portugal", primaryColor: "#dc2626", secondaryColor: "#ffffff", reputation: 85, stadium: "Estádio da Luz", capacity: 64642, transferBudget: 57499999, wageBudget: 2069999, bankBalance: 63000000, ticketPrice: 45, stadiumCondition: 95, sponsorships: [] },
  { id: "porto", name: "FC Porto", shortName: "Porto", league: "Liga Portugal", primaryColor: "#1d4ed8", secondaryColor: "#ffffff", reputation: 85, stadium: "Estádio do Dragão", capacity: 50033, transferBudget: 51749999, wageBudget: 1954999, bankBalance: 59500000, ticketPrice: 44, stadiumCondition: 94, sponsorships: [] },
  { id: "braga", name: "SC Braga", shortName: "Braga", league: "Liga Portugal", primaryColor: "#dc2626", secondaryColor: "#ffffff", reputation: 80, stadium: "Estádio Municipal de Braga", capacity: 30286, transferBudget: 23000000, wageBudget: 1150000, bankBalance: 35000000, ticketPrice: 35, stadiumCondition: 96, sponsorships: [] },
  { id: "guimaraes", name: "Vitória de Guimarães", shortName: "Vitória SC", league: "Liga Portugal", primaryColor: "#ffffff", secondaryColor: "#000000", reputation: 77, stadium: "Estádio D. Afonso Henriques", capacity: 30000, transferBudget: 13799999, wageBudget: 862499, bankBalance: 26250000, ticketPrice: 30, stadiumCondition: 85, sponsorships: [] },
  { id: "moreirense", name: "Moreirense FC", shortName: "Moreirense", league: "Liga Portugal", primaryColor: "#16a34a", secondaryColor: "#ffffff", reputation: 73, stadium: "Parque Joaquim de Almeida Freitas", capacity: 6153, transferBudget: 6899999, wageBudget: 459999, bankBalance: 14000000, ticketPrice: 22, stadiumCondition: 70, sponsorships: [] },
  { id: "arouca", name: "FC Arouca", shortName: "Arouca", league: "Liga Portugal", primaryColor: "#facc15", secondaryColor: "#1d4ed8", reputation: 72, stadium: "Estádio Municipal de Arouca", capacity: 5000, transferBudget: 5750000, wageBudget: 402499, bankBalance: 12250000, ticketPrice: 20, stadiumCondition: 75, sponsorships: [] },
  { id: "famalicao", name: "FC Famalicão", shortName: "Famalicão", league: "Liga Portugal", primaryColor: "#1d4ed8", secondaryColor: "#ffffff", reputation: 75, stadium: "Estádio Municipal 22 de Junho", capacity: 5307, transferBudget: 11500000, wageBudget: 690000, bankBalance: 21000000, ticketPrice: 25, stadiumCondition: 80, sponsorships: [] },
  { id: "casapia", name: "Casa Pia AC", shortName: "Casa Pia", league: "Liga Portugal", primaryColor: "#000000", secondaryColor: "#ffffff", reputation: 72, stadium: "Estádio Pina Manique", capacity: 2574, transferBudget: 5750000, wageBudget: 402499, bankBalance: 12250000, ticketPrice: 20, stadiumCondition: 65, sponsorships: [] },
  { id: "farense", name: "SC Farense", shortName: "Farense", league: "Liga Portugal", primaryColor: "#000000", secondaryColor: "#ffffff", reputation: 71, stadium: "Estádio de São Luís", capacity: 12000, transferBudget: 5175000, wageBudget: 345000, bankBalance: 10500000, ticketPrice: 22, stadiumCondition: 68, sponsorships: [] },
  { id: "rioave", name: "Rio Ave FC", shortName: "Rio Ave", league: "Liga Portugal", primaryColor: "#16a34a", secondaryColor: "#ffffff", reputation: 73, stadium: "Estádio dos Arcos", capacity: 9065, transferBudget: 6899999, wageBudget: 482999, bankBalance: 14700000, ticketPrice: 24, stadiumCondition: 77, sponsorships: [] },
  { id: "gilvicente", name: "Gil Vicente FC", shortName: "Gil Vicente", league: "Liga Portugal", primaryColor: "#dc2626", secondaryColor: "#ffffff", reputation: 73, stadium: "Estádio Cidade de Barcelos", capacity: 12504, transferBudget: 6324999, wageBudget: 459999, bankBalance: 14000000, ticketPrice: 23, stadiumCondition: 82, sponsorships: [] },
  { id: "estoril", name: "GD Estoril Praia", shortName: "Estoril", league: "Liga Portugal", primaryColor: "#facc15", secondaryColor: "#1d4ed8", reputation: 73, stadium: "Estádio António Coimbra da Mota", capacity: 8015, transferBudget: 6899999, wageBudget: 517499, bankBalance: 15750000, ticketPrice: 25, stadiumCondition: 80, sponsorships: [] },
  { id: "estrela", name: "CF Estrela da Amadora", shortName: "Estrela", league: "Liga Portugal", primaryColor: "#dc2626", secondaryColor: "#16a34a", reputation: 71, stadium: "Estádio José Gomes", capacity: 9288, transferBudget: 4600000, wageBudget: 368000, bankBalance: 11200000, ticketPrice: 20, stadiumCondition: 70, sponsorships: [] },
  { id: "boavista", name: "Boavista FC", shortName: "Boavista", league: "Liga Portugal", primaryColor: "#000000", secondaryColor: "#ffffff", reputation: 74, stadium: "Estádio do Bessa", capacity: 28263, transferBudget: 8049999, wageBudget: 575000, bankBalance: 17500000, ticketPrice: 28, stadiumCondition: 85, sponsorships: [] },
  { id: "santaclara", name: "CD Santa Clara", shortName: "Santa Clara", league: "Liga Portugal", primaryColor: "#dc2626", secondaryColor: "#ffffff", reputation: 71, stadium: "Estádio de São Miguel", capacity: 13277, transferBudget: 5175000, wageBudget: 402499, bankBalance: 12250000, ticketPrice: 22, stadiumCondition: 73, sponsorships: [] },
  { id: "nacional", name: "CD Nacional", shortName: "Nacional", league: "Liga Portugal", primaryColor: "#000000", secondaryColor: "#ffffff", reputation: 71, stadium: "Estádio da Madeira", capacity: 5132, transferBudget: 4600000, wageBudget: 368000, bankBalance: 11200000, ticketPrice: 20, stadiumCondition: 75, sponsorships: [] },
  { id: "avs", name: "AVS Futebol SAD", shortName: "AVS", league: "Liga Portugal", primaryColor: "#dc2626", secondaryColor: "#ffffff", reputation: 69, stadium: "Estádio do CD Aves", capacity: 8560, transferBudget: 3449999, wageBudget: 287500, bankBalance: 8750000, ticketPrice: 18, stadiumCondition: 78, sponsorships: [] },

  // Serie A (20)
  { id: "inter", name: "Inter Milan", shortName: "Inter", league: "Serie A", primaryColor: "#000000", secondaryColor: "#2563eb", reputation: 91, stadium: "San Siro", capacity: 75817, transferBudget: 112412498, wageBudget: 4760998, bankBalance: 126000000, ticketPrice: 43, stadiumCondition: 81, sponsorships: [] },
  { id: "juventus", name: "Juventus", shortName: "Juventus", league: "Serie A", primaryColor: "#000000", secondaryColor: "#ffffff", reputation: 88, stadium: "Allianz Stadium", capacity: 41507, transferBudget: 119024998, wageBudget: 4496498, bankBalance: 119000000, ticketPrice: 53, stadiumCondition: 74, sponsorships: [] },
  { id: "milan", name: "AC Milan", shortName: "AC Milan", league: "Serie A", primaryColor: "#dc2626", secondaryColor: "#000000", reputation: 87, stadium: "San Siro", capacity: 75817, transferBudget: 99187499, wageBudget: 3702998, bankBalance: 98000000, ticketPrice: 34, stadiumCondition: 86, sponsorships: [] },
  { id: "napoli", name: "Napoli", shortName: "Napoli", league: "Serie A", primaryColor: "#38bdf8", secondaryColor: "#ffffff", reputation: 86, stadium: "Diego Armando Maradona", capacity: 54726, transferBudget: 105799999, wageBudget: 3438499, bankBalance: 91000000, ticketPrice: 54, stadiumCondition: 71, sponsorships: [] },
  { id: "atalanta", name: "Atalanta", shortName: "Atalanta", league: "Serie A", primaryColor: "#1d4ed8", secondaryColor: "#000000", reputation: 84, stadium: "Gewiss Stadium", capacity: 21300, transferBudget: 59512498, wageBudget: 2049873, bankBalance: 54250000, ticketPrice: 44, stadiumCondition: 99, sponsorships: [] },
  { id: "roma", name: "AS Roma", shortName: "AS Roma", league: "Serie A", primaryColor: "#991b1b", secondaryColor: "#facc15", reputation: 84, stadium: "Stadio Olimpico", capacity: 70634, transferBudget: 52899999, wageBudget: 2909500, bankBalance: 77000000, ticketPrice: 50, stadiumCondition: 84, sponsorships: [] },
  { id: "lazio", name: "Lazio", shortName: "Lazio", league: "Serie A", primaryColor: "#60a5fa", secondaryColor: "#ffffff", reputation: 81, stadium: "Stadio Olimpico", capacity: 70634, transferBudget: 46287500, wageBudget: 2380498, bankBalance: 63000000, ticketPrice: 59, stadiumCondition: 90, sponsorships: [] },
  { id: "fiorentina", name: "Fiorentina", shortName: "Fiorentina", league: "Serie A", primaryColor: "#6b21a8", secondaryColor: "#ffffff", reputation: 80, stadium: "Artemio Franchi", capacity: 43147, transferBudget: 39675000, wageBudget: 1983748, bankBalance: 52500000, ticketPrice: 57, stadiumCondition: 62, sponsorships: [] },
  { id: "bologna", name: "Bologna", shortName: "Bologna", league: "Serie A", primaryColor: "#991b1b", secondaryColor: "#1e3a8a", reputation: 78, stadium: "Renato Dall'Ara", capacity: 36462, transferBudget: 33062498, wageBudget: 1586999, bankBalance: 42000000, ticketPrice: 32, stadiumCondition: 92, sponsorships: [] },
  { id: "torino", name: "Torino FC", shortName: "Torino", league: "Serie A", primaryColor: "#7f1d1d", secondaryColor: "#ffffff", reputation: 77, stadium: "Stadio Olimpico Grande Torino", capacity: 27958, transferBudget: 26449999, wageBudget: 1454750, bankBalance: 38500000, ticketPrice: 50, stadiumCondition: 80, sponsorships: [] },
  { id: "monza", name: "Monza", shortName: "Monza", league: "Serie A", primaryColor: "#dc2626", secondaryColor: "#ffffff", reputation: 74, stadium: "U-Power Stadium", capacity: 15036, transferBudget: 19837500, wageBudget: 1256375, bankBalance: 33250000, ticketPrice: 40, stadiumCondition: 85, sponsorships: [] },
  { id: "genoa", name: "Genoa", shortName: "Genoa", league: "Serie A", primaryColor: "#991b1b", secondaryColor: "#1e3a8a", reputation: 75, stadium: "Luigi Ferraris", capacity: 36600, transferBudget: 21160000, wageBudget: 1190248, bankBalance: 31500000, ticketPrice: 52, stadiumCondition: 71, sponsorships: [] },
  { id: "lecce", name: "Lecce", shortName: "Lecce", league: "Serie A", primaryColor: "#eab308", secondaryColor: "#dc2626", reputation: 73, stadium: "Via del Mare", capacity: 31533, transferBudget: 13224999, wageBudget: 991873, bankBalance: 26250000, ticketPrice: 52, stadiumCondition: 90, sponsorships: [] },
  { id: "udinese", name: "Udinese", shortName: "Udinese", league: "Serie A", primaryColor: "#000000", secondaryColor: "#ffffff", reputation: 75, stadium: "Bluenergy Stadium", capacity: 25144, transferBudget: 15869998, wageBudget: 1124123, bankBalance: 29750000, ticketPrice: 31, stadiumCondition: 84, sponsorships: [] },
  { id: "verona", name: "Hellas Verona", shortName: "Verona", league: "Serie A", primaryColor: "#eab308", secondaryColor: "#2563eb", reputation: 73, stadium: "Marcantonio Bentegodi", capacity: 39211, transferBudget: 11902500, wageBudget: 1031548, bankBalance: 27300000, ticketPrice: 55, stadiumCondition: 88, sponsorships: [] },
  { id: "empoli", name: "Empoli", shortName: "Empoli", league: "Serie A", primaryColor: "#2563eb", secondaryColor: "#ffffff", reputation: 72, stadium: "Carlo Castellani", capacity: 16284, transferBudget: 10580000, wageBudget: 925748, bankBalance: 24500000, ticketPrice: 45, stadiumCondition: 81, sponsorships: [] },
  { id: "cagliari", name: "Cagliari", shortName: "Cagliari", league: "Serie A", primaryColor: "#dc2626", secondaryColor: "#1e3a8a", reputation: 73, stadium: "Unipol Domus", capacity: 16416, transferBudget: 14547498, wageBudget: 1057998, bankBalance: 28000000, ticketPrice: 66, stadiumCondition: 83, sponsorships: [] },
  { id: "parma", name: "Parma", shortName: "Parma", league: "Serie A", primaryColor: "#eab308", secondaryColor: "#1e3a8a", reputation: 72, stadium: "Ennio Tardini", capacity: 22352, transferBudget: 18514998, wageBudget: 1084448, bankBalance: 28700000, ticketPrice: 64, stadiumCondition: 68, sponsorships: [] },
  { id: "como", name: "Como 1907", shortName: "Como", league: "Serie A", primaryColor: "#1d4ed8", secondaryColor: "#ffffff", reputation: 74, stadium: "Giuseppe Sinigaglia", capacity: 13602, transferBudget: 29094998, wageBudget: 1322500, bankBalance: 35000000, ticketPrice: 64, stadiumCondition: 93, sponsorships: [] },
  { id: "venezia", name: "Venezia", shortName: "Venezia", league: "Serie A", primaryColor: "#0f172a", secondaryColor: "#16a34a", reputation: 70, stadium: "Pier Luigi Penzo", capacity: 11150, transferBudget: 13224999, wageBudget: 952198, bankBalance: 25200000, ticketPrice: 35, stadiumCondition: 78, sponsorships: [] },

  // Bundesliga (18)
  { id: "bayern", name: "Bayern Munich", shortName: "Bayern", league: "Bundesliga", primaryColor: "#dc2626", secondaryColor: "#ffffff", reputation: 93, stadium: "Allianz Arena", capacity: 75000, transferBudget: 158700000, wageBudget: 5819000, bankBalance: 154000000, ticketPrice: 43, stadiumCondition: 73, sponsorships: [] },
  { id: "leverkusen", name: "Bayer Leverkusen", shortName: "Leverkusen", league: "Bundesliga", primaryColor: "#ef4444", secondaryColor: "#000000", reputation: 89, stadium: "BayArena", capacity: 30210, transferBudget: 99187499, wageBudget: 3306249, bankBalance: 87500000, ticketPrice: 40, stadiumCondition: 80, sponsorships: [] },
  { id: "dortmund", name: "Borussia Dortmund", shortName: "Dortmund", league: "Bundesliga", primaryColor: "#facc15", secondaryColor: "#000000", reputation: 87, stadium: "Signal Iduna Park", capacity: 81365, transferBudget: 85962500, wageBudget: 3835248, bankBalance: 101500000, ticketPrice: 60, stadiumCondition: 67, sponsorships: [] },
  { id: "leipzig", name: "RB Leipzig", shortName: "Leipzig", league: "Bundesliga", primaryColor: "#ef4444", secondaryColor: "#1d4ed8", reputation: 85, stadium: "Red Bull Arena", capacity: 47069, transferBudget: 79350000, wageBudget: 3041749, bankBalance: 80500000, ticketPrice: 44, stadiumCondition: 68, sponsorships: [] },
  { id: "stuttgart", name: "VfB Stuttgart", shortName: "Stuttgart", league: "Bundesliga", primaryColor: "#ffffff", secondaryColor: "#dc2626", reputation: 80, stadium: "MHPArena", capacity: 60449, transferBudget: 46287500, wageBudget: 1851498, bankBalance: 49000000, ticketPrice: 41, stadiumCondition: 89, sponsorships: [] },
  { id: "frankfurt", name: "Eintracht Frankfurt", shortName: "Frankfurt", league: "Bundesliga", primaryColor: "#e2e8f0", secondaryColor: "#ef4444", reputation: 81, stadium: "Deutsche Bank Park", capacity: 58000, transferBudget: 39675000, wageBudget: 1983748, bankBalance: 52500000, ticketPrice: 66, stadiumCondition: 81, sponsorships: [] },
  { id: "freiburg", name: "SC Freiburg", shortName: "Freiburg", league: "Bundesliga", primaryColor: "#dc2626", secondaryColor: "#ffffff", reputation: 77, stadium: "Europa-Park Stadion", capacity: 34700, transferBudget: 19837500, wageBudget: 1322500, bankBalance: 35000000, ticketPrice: 40, stadiumCondition: 93, sponsorships: [] },
  { id: "hoffenheim", name: "TSG Hoffenheim", shortName: "Hoffenheim", league: "Bundesliga", primaryColor: "#2563eb", secondaryColor: "#ffffff", reputation: 76, stadium: "PreZero Arena", capacity: 30150, transferBudget: 26449999, wageBudget: 1586999, bankBalance: 42000000, ticketPrice: 33, stadiumCondition: 77, sponsorships: [] },
  { id: "heidenheim", name: "1. FC Heidenheim", shortName: "Heidenheim", league: "Bundesliga", primaryColor: "#ef4444", secondaryColor: "#1e3a8a", reputation: 74, stadium: "Voith-Arena", capacity: 15000, transferBudget: 13224999, wageBudget: 991873, bankBalance: 26250000, ticketPrice: 46, stadiumCondition: 73, sponsorships: [] },
  { id: "werder", name: "Werder Bremen", shortName: "Bremen", league: "Bundesliga", primaryColor: "#16a34a", secondaryColor: "#ffffff", reputation: 76, stadium: "Weserstadion", capacity: 42100, transferBudget: 18514998, wageBudget: 1454750, bankBalance: 38500000, ticketPrice: 56, stadiumCondition: 67, sponsorships: [] },
  { id: "wolfsburg", name: "VfL Wolfsburg", shortName: "Wolfsburg", league: "Bundesliga", primaryColor: "#22c55e", secondaryColor: "#ffffff", reputation: 77, stadium: "Volkswagen Arena", capacity: 30000, transferBudget: 46287500, wageBudget: 2115998, bankBalance: 56000000, ticketPrice: 58, stadiumCondition: 94, sponsorships: [] },
  { id: "monchengladbach", name: "Borussia Mönchengladbach", shortName: "M'gladbach", league: "Bundesliga", primaryColor: "#ffffff", secondaryColor: "#16a34a", reputation: 76, stadium: "Borussia-Park", capacity: 54042, transferBudget: 23805000, wageBudget: 1719249, bankBalance: 45500000, ticketPrice: 46, stadiumCondition: 62, sponsorships: [] },
  { id: "union_berlin", name: "Union Berlin", shortName: "Union Berlin", league: "Bundesliga", primaryColor: "#ef4444", secondaryColor: "#ffffff", reputation: 76, stadium: "An der Alten Försterei", capacity: 22012, transferBudget: 21160000, wageBudget: 1586999, bankBalance: 42000000, ticketPrice: 42, stadiumCondition: 95, sponsorships: [] },
  { id: "mainz", name: "FSV Mainz 05", shortName: "Mainz", league: "Bundesliga", primaryColor: "#dc2626", secondaryColor: "#ffffff", reputation: 74, stadium: "Mewa Arena", capacity: 33305, transferBudget: 15869998, wageBudget: 1190248, bankBalance: 31500000, ticketPrice: 69, stadiumCondition: 66, sponsorships: [] },
  { id: "bochum", name: "VfL Bochum", shortName: "Bochum", league: "Bundesliga", primaryColor: "#2563eb", secondaryColor: "#ffffff", reputation: 71, stadium: "Vonovia Ruhrstadion", capacity: 26000, transferBudget: 9257498, wageBudget: 925748, bankBalance: 24500000, ticketPrice: 47, stadiumCondition: 75, sponsorships: [] },
  { id: "stpauli", name: "FC St. Pauli", shortName: "St. Pauli", league: "Bundesliga", primaryColor: "#78350f", secondaryColor: "#ffffff", reputation: 71, stadium: "Millerntor-Stadion", capacity: 29546, transferBudget: 10580000, wageBudget: 952198, bankBalance: 25200000, ticketPrice: 31, stadiumCondition: 80, sponsorships: [] },
  { id: "kiel", name: "Holstein Kiel", shortName: "Kiel", league: "Bundesliga", primaryColor: "#1d4ed8", secondaryColor: "#dc2626", reputation: 69, stadium: "Holstein-Stadion", capacity: 15034, transferBudget: 7934998, wageBudget: 793499, bankBalance: 21000000, ticketPrice: 66, stadiumCondition: 91, sponsorships: [] },
  { id: "augsburg", name: "FC Augsburg", shortName: "Augsburg", league: "Bundesliga", primaryColor: "#15803d", secondaryColor: "#dc2626", reputation: 74, stadium: "WWK Arena", capacity: 30660, transferBudget: 17192498, wageBudget: 1256375, bankBalance: 33250000, ticketPrice: 65, stadiumCondition: 62, sponsorships: [] },

  // Ligue 1 (18)
  { id: "psg", name: "Paris Saint-Germain", shortName: "PSG", league: "Ligue 1", primaryColor: "#1e3a8a", secondaryColor: "#ef4444", reputation: 94, stadium: "Parc des Princes", capacity: 47900, transferBudget: 211599999, wageBudget: 6480249, bankBalance: 171500000, ticketPrice: 61, stadiumCondition: 90, sponsorships: [] },
  { id: "monaco", name: "AS Monaco", shortName: "Monaco", league: "Ligue 1", primaryColor: "#dc2626", secondaryColor: "#ffffff", reputation: 84, stadium: "Stade Louis II", capacity: 18500, transferBudget: 63479998, wageBudget: 2380498, bankBalance: 63000000, ticketPrice: 67, stadiumCondition: 92, sponsorships: [] },
  { id: "marseille", name: "Olympique de Marseille", shortName: "Marseille", league: "Ligue 1", primaryColor: "#38bdf8", secondaryColor: "#ffffff", reputation: 83, stadium: "Orange Vélodrome", capacity: 67394, transferBudget: 52899999, wageBudget: 2777250, bankBalance: 73500000, ticketPrice: 39, stadiumCondition: 65, sponsorships: [] },
  { id: "lille", name: "Lille OSC", shortName: "Lille", league: "Ligue 1", primaryColor: "#e11d48", secondaryColor: "#1d4ed8", reputation: 81, stadium: "Decathlon Arena", capacity: 50186, transferBudget: 42320000, wageBudget: 1983748, bankBalance: 52500000, ticketPrice: 42, stadiumCondition: 90, sponsorships: [] },
  { id: "lens", name: "RC Lens", shortName: "Lens", league: "Ligue 1", primaryColor: "#eab308", secondaryColor: "#dc2626", reputation: 80, stadium: "Stade Bollaert-Delelis", capacity: 38223, transferBudget: 29094998, wageBudget: 1719249, bankBalance: 45500000, ticketPrice: 54, stadiumCondition: 92, sponsorships: [] },
  { id: "lyon", name: "Olympique Lyonnais", shortName: "Lyon", league: "Ligue 1", primaryColor: "#ffffff", secondaryColor: "#1d4ed8", reputation: 81, stadium: "Groupama Stadium", capacity: 59186, transferBudget: 33062498, wageBudget: 2512750, bankBalance: 66500000, ticketPrice: 45, stadiumCondition: 65, sponsorships: [] },
  { id: "nice", name: "OGC Nice", shortName: "Nice", league: "Ligue 1", primaryColor: "#e2e8f0", secondaryColor: "#ef4444", reputation: 79, stadium: "Allianz Riviera", capacity: 36178, transferBudget: 37029998, wageBudget: 1851498, bankBalance: 49000000, ticketPrice: 58, stadiumCondition: 84, sponsorships: [] },
  { id: "rennes", name: "Stade Rennais", shortName: "Rennes", league: "Ligue 1", primaryColor: "#dc2626", secondaryColor: "#000000", reputation: 79, stadium: "Roazhon Park", capacity: 29778, transferBudget: 31739998, wageBudget: 1653124, bankBalance: 43750000, ticketPrice: 68, stadiumCondition: 91, sponsorships: [] },
  { id: "reims", name: "Stade de Reims", shortName: "Reims", league: "Ligue 1", primaryColor: "#dc2626", secondaryColor: "#ffffff", reputation: 76, stadium: "Stade Auguste-Delaune", capacity: 21102, transferBudget: 19837500, wageBudget: 1190248, bankBalance: 31500000, ticketPrice: 46, stadiumCondition: 64, sponsorships: [] },
  { id: "brest", name: "Stade Brestois 29", shortName: "Brest", league: "Ligue 1", primaryColor: "#ef4444", secondaryColor: "#ffffff", reputation: 77, stadium: "Stade Francis-Le Blé", capacity: 15220, transferBudget: 15869998, wageBudget: 1124123, bankBalance: 29750000, ticketPrice: 69, stadiumCondition: 66, sponsorships: [] },
  { id: "strasbourg", name: "RC Strasbourg", shortName: "Strasbourg", league: "Ligue 1", primaryColor: "#3b82f6", secondaryColor: "#ffffff", reputation: 75, stadium: "Stade de la Meinau", capacity: 26280, transferBudget: 26449999, wageBudget: 1322500, bankBalance: 35000000, ticketPrice: 66, stadiumCondition: 79, sponsorships: [] },
  { id: "toulouse", name: "Toulouse FC", shortName: "Toulouse", league: "Ligue 1", primaryColor: "#6b21a8", secondaryColor: "#ffffff", reputation: 74, stadium: "Stadium de Toulouse", capacity: 33150, transferBudget: 18514998, wageBudget: 1057998, bankBalance: 28000000, ticketPrice: 68, stadiumCondition: 96, sponsorships: [] },
  { id: "montpellier", name: "Montpellier HSC", shortName: "Montpellier", league: "Ligue 1", primaryColor: "#1e3a8a", secondaryColor: "#f97316", reputation: 74, stadium: "Stade de la Mosson", capacity: 32900, transferBudget: 11902500, wageBudget: 1124123, bankBalance: 29750000, ticketPrice: 62, stadiumCondition: 75, sponsorships: [] },
  { id: "nantes", name: "FC Nantes", shortName: "Nantes", league: "Ligue 1", primaryColor: "#eab308", secondaryColor: "#16a34a", reputation: 74, stadium: "Stade de la Beaujoire", capacity: 35322, transferBudget: 10580000, wageBudget: 1163798, bankBalance: 30800000, ticketPrice: 54, stadiumCondition: 71, sponsorships: [] },
  { id: "angers", name: "Angers SCO", shortName: "Angers", league: "Ligue 1", primaryColor: "#000000", secondaryColor: "#ffffff", reputation: 70, stadium: "Stade Raymond Kopa", capacity: 18750, transferBudget: 7934998, wageBudget: 819949, bankBalance: 21700000, ticketPrice: 31, stadiumCondition: 86, sponsorships: [] },
  { id: "saint_etienne", name: "AS Saint-Étienne", shortName: "St-Étienne", league: "Ligue 1", primaryColor: "#15803d", secondaryColor: "#ffffff", reputation: 72, stadium: "Stade Geoffroy-Guichard", capacity: 41965, transferBudget: 10580000, wageBudget: 925748, bankBalance: 24500000, ticketPrice: 33, stadiumCondition: 90, sponsorships: [] },
  { id: "le_havre", name: "Le Havre AC", shortName: "Le Havre", league: "Ligue 1", primaryColor: "#bae6fd", secondaryColor: "#1e3a8a", reputation: 71, stadium: "Stade Océane", capacity: 25178, transferBudget: 9257498, wageBudget: 859624, bankBalance: 22750000, ticketPrice: 64, stadiumCondition: 70, sponsorships: [] },
  { id: "auxerre", name: "AJ Auxerre", shortName: "Auxerre", league: "Ligue 1", primaryColor: "#ffffff", secondaryColor: "#2563eb", reputation: 71, stadium: "Stade de l'Abbé-Deschamps", capacity: 18541, transferBudget: 10580000, wageBudget: 899298, bankBalance: 23800000, ticketPrice: 55, stadiumCondition: 93, sponsorships: [] },

  // Serbian SuperLiga
  { id: "redstar", name: "Red Star Belgrade", shortName: "Red Star", league: "Serbian SuperLiga", primaryColor: "#dc2626", secondaryColor: "#ffffff", reputation: 74, stadium: "Rajko Mitić", capacity: 51755, transferBudget: 17250000, wageBudget: 862499, bankBalance: 37500000, ticketPrice: 47, stadiumCondition: 78, sponsorships: [] },
  { id: "partizan", name: "Partizan Belgrade", shortName: "Partizan", league: "Serbian SuperLiga", primaryColor: "#000000", secondaryColor: "#ffffff", reputation: 72, stadium: "Partizan Stadium", capacity: 29775, transferBudget: 11500000, wageBudget: 575000, bankBalance: 25000000, ticketPrice: 46, stadiumCondition: 92, sponsorships: [] },
  { id: "tsc", name: "TSC Bačka Topola", shortName: "TSC", league: "Serbian SuperLiga", primaryColor: "#1d4ed8", secondaryColor: "#ffffff", reputation: 68, stadium: "TSC Arena", capacity: 4500, transferBudget: 5750000, wageBudget: 287500, bankBalance: 12500000, ticketPrice: 44, stadiumCondition: 68, sponsorships: [] },
  { id: "cukaricki", name: "Čukarički", shortName: "Čukarički", league: "Serbian SuperLiga", primaryColor: "#ffffff", secondaryColor: "#000000", reputation: 67, stadium: "Čukarički Stadium", capacity: 4070, transferBudget: 4600000, wageBudget: 229999, bankBalance: 10000000, ticketPrice: 43, stadiumCondition: 61, sponsorships: [] },
  { id: "vojvodina", name: "Vojvodina", shortName: "Vojvodina", league: "Serbian SuperLiga", primaryColor: "#dc2626", secondaryColor: "#ffffff", reputation: 68, stadium: "Karađorđe Stadium", capacity: 14458, transferBudget: 5175000, wageBudget: 258749, bankBalance: 11250000, ticketPrice: 44, stadiumCondition: 73, sponsorships: [] },
  { id: "radnicki1923", name: "Radnički 1923", shortName: "Radnički", league: "Serbian SuperLiga", primaryColor: "#dc2626", secondaryColor: "#ffffff", reputation: 65, stadium: "Čika Dača", capacity: 15100, transferBudget: 2300000, wageBudget: 114999, bankBalance: 5000000, ticketPrice: 42, stadiumCondition: 84, sponsorships: [] },
  { id: "novipazar", name: "Novi Pazar", shortName: "Novi Pazar", league: "Serbian SuperLiga", primaryColor: "#1d4ed8", secondaryColor: "#ffffff", reputation: 64, stadium: "City Stadium Novi Pazar", capacity: 12000, transferBudget: 1724999, wageBudget: 86250, bankBalance: 3750000, ticketPrice: 42, stadiumCondition: 94, sponsorships: [] },
  { id: "spartak", name: "Spartak Subotica", shortName: "Spartak", league: "Serbian SuperLiga", primaryColor: "#1d4ed8", secondaryColor: "#ffffff", reputation: 64, stadium: "Subotica City Stadium", capacity: 13000, transferBudget: 1724999, wageBudget: 86250, bankBalance: 3750000, ticketPrice: 42, stadiumCondition: 64, sponsorships: [] },
  { id: "napredak", name: "Napredak Kruševac", shortName: "Napredak", league: "Serbian SuperLiga", primaryColor: "#dc2626", secondaryColor: "#ffffff", reputation: 63, stadium: "Mladost Stadium", capacity: 10331, transferBudget: 1380000, wageBudget: 69000, bankBalance: 3000000, ticketPrice: 41, stadiumCondition: 80, sponsorships: [] },
  { id: "radnickinis", name: "Radnički Niš", shortName: "Radnički N", league: "Serbian SuperLiga", primaryColor: "#dc2626", secondaryColor: "#ffffff", reputation: 64, stadium: "Čair Stadium", capacity: 18151, transferBudget: 1724999, wageBudget: 86250, bankBalance: 3750000, ticketPrice: 42, stadiumCondition: 91, sponsorships: [] },
  { id: "imt", name: "IMT", shortName: "IMT", league: "Serbian SuperLiga", primaryColor: "#dc2626", secondaryColor: "#ffffff", reputation: 62, stadium: "Shopping Center Stadium", capacity: 5175, transferBudget: 1150000, wageBudget: 57499, bankBalance: 2500000, ticketPrice: 41, stadiumCondition: 64, sponsorships: [] },
  { id: "javor", name: "Javor Ivanjica", shortName: "Javor", league: "Serbian SuperLiga", primaryColor: "#ffffff", secondaryColor: "#dc2626", reputation: 62, stadium: "Ivanjica Stadium", capacity: 3000, transferBudget: 1150000, wageBudget: 57499, bankBalance: 2500000, ticketPrice: 41, stadiumCondition: 90, sponsorships: [] },
  { id: "zeleznicar", name: "Železničar Pančevo", shortName: "Železničar", league: "Serbian SuperLiga", primaryColor: "#ffffff", secondaryColor: "#1d4ed8", reputation: 61, stadium: "SC Mladost", capacity: 1200, transferBudget: 919999, wageBudget: 46000, bankBalance: 2000000, ticketPrice: 40, stadiumCondition: 61, sponsorships: [] },
  { id: "radnik", name: "Radnik Surdulica", shortName: "Radnik", league: "Serbian SuperLiga", primaryColor: "#1d4ed8", secondaryColor: "#ffffff", reputation: 62, stadium: "Surdulica City Stadium", capacity: 3312, transferBudget: 1034999, wageBudget: 51749, bankBalance: 2250000, ticketPrice: 41, stadiumCondition: 64, sponsorships: [] },
  { id: "vozdovac", name: "Voždovac", shortName: "Voždovac", league: "Serbian SuperLiga", primaryColor: "#dc2626", secondaryColor: "#ffffff", reputation: 63, stadium: "Voždovac Stadium", capacity: 5175, transferBudget: 1265000, wageBudget: 63249, bankBalance: 2750000, ticketPrice: 41, stadiumCondition: 92, sponsorships: [] },
  { id: "mladost", name: "Mladost Lučani", shortName: "Mladost", league: "Serbian SuperLiga", primaryColor: "#1d4ed8", secondaryColor: "#ffffff", reputation: 63, stadium: "Mladost Stadium", capacity: 5944, transferBudget: 1150000, wageBudget: 57499, bankBalance: 2500000, ticketPrice: 41, stadiumCondition: 91, sponsorships: [] },

  // Swiss Super League
  { id: "youngboys", name: "Young Boys", shortName: "Young Boys", league: "Swiss Super League", primaryColor: "#facc15", secondaryColor: "#000000", reputation: 75, stadium: "Stadion Wankdorf", capacity: 31500, transferBudget: 23000000, wageBudget: 1150000, bankBalance: 50000000, ticketPrice: 47, stadiumCondition: 83, sponsorships: [] },
  { id: "basel", name: "FC Basel", shortName: "Basel", league: "Swiss Super League", primaryColor: "#dc2626", secondaryColor: "#1d4ed8", reputation: 73, stadium: "St. Jakob-Park", capacity: 38512, transferBudget: 17250000, wageBudget: 862499, bankBalance: 37500000, ticketPrice: 46, stadiumCondition: 88, sponsorships: [] },
  { id: "servette", name: "Servette FC", shortName: "Servette", league: "Swiss Super League", primaryColor: "#7f1d1d", secondaryColor: "#ffffff", reputation: 71, stadium: "Stade de Genève", capacity: 30084, transferBudget: 11500000, wageBudget: 575000, bankBalance: 25000000, ticketPrice: 45, stadiumCondition: 73, sponsorships: [] },
  { id: "lugano", name: "FC Lugano", shortName: "Lugano", league: "Swiss Super League", primaryColor: "#000000", secondaryColor: "#ffffff", reputation: 70, stadium: "Stadio Cornaredo", capacity: 6330, transferBudget: 9200000, wageBudget: 459999, bankBalance: 20000000, ticketPrice: 45, stadiumCondition: 91, sponsorships: [] },
  { id: "zurich", name: "FC Zürich", shortName: "Zürich", league: "Swiss Super League", primaryColor: "#ffffff", secondaryColor: "#1d4ed8", reputation: 71, stadium: "Letzigrund", capacity: 26104, transferBudget: 10350000, wageBudget: 517499, bankBalance: 22500000, ticketPrice: 45, stadiumCondition: 63, sponsorships: [] },
  { id: "stgallen", name: "FC St. Gallen", shortName: "St. Gallen", league: "Swiss Super League", primaryColor: "#16a34a", secondaryColor: "#ffffff", reputation: 69, stadium: "Kybunpark", capacity: 19456, transferBudget: 6899999, wageBudget: 345000, bankBalance: 15000000, ticketPrice: 44, stadiumCondition: 61, sponsorships: [] },
  { id: "winterthur", name: "FC Winterthur", shortName: "Winterthur", league: "Swiss Super League", primaryColor: "#dc2626", secondaryColor: "#ffffff", reputation: 66, stadium: "Schützenwiese", capacity: 8400, transferBudget: 4600000, wageBudget: 229999, bankBalance: 10000000, ticketPrice: 43, stadiumCondition: 64, sponsorships: [] },
  { id: "luzern", name: "FC Luzern", shortName: "Luzern", league: "Swiss Super League", primaryColor: "#1d4ed8", secondaryColor: "#ffffff", reputation: 68, stadium: "Swissporarena", capacity: 16490, transferBudget: 6324999, wageBudget: 316250, bankBalance: 13750000, ticketPrice: 44, stadiumCondition: 79, sponsorships: [] },
  { id: "yverdon", name: "Yverdon-Sport FC", shortName: "Yverdon", league: "Swiss Super League", primaryColor: "#16a34a", secondaryColor: "#ffffff", reputation: 64, stadium: "Stade Municipal", capacity: 6600, transferBudget: 3449999, wageBudget: 172500, bankBalance: 7500000, ticketPrice: 42, stadiumCondition: 94, sponsorships: [] },
  { id: "lausanne", name: "FC Lausanne-Sport", shortName: "Lausanne", league: "Swiss Super League", primaryColor: "#1d4ed8", secondaryColor: "#ffffff", reputation: 67, stadium: "Stade de la Tuilière", capacity: 12544, transferBudget: 5750000, wageBudget: 287500, bankBalance: 12500000, ticketPrice: 43, stadiumCondition: 72, sponsorships: [] },
  { id: "grasshoppers", name: "Grasshopper Club", shortName: "Grasshoppers", league: "Swiss Super League", primaryColor: "#1d4ed8", secondaryColor: "#ffffff", reputation: 68, stadium: "Letzigrund", capacity: 26104, transferBudget: 6899999, wageBudget: 345000, bankBalance: 15000000, ticketPrice: 44, stadiumCondition: 84, sponsorships: [] },
  { id: "sion", name: "FC Sion", shortName: "Sion", league: "Swiss Super League", primaryColor: "#dc2626", secondaryColor: "#ffffff", reputation: 67, stadium: "Stade Tourbillon", capacity: 14283, transferBudget: 5175000, wageBudget: 258749, bankBalance: 11250000, ticketPrice: 43, stadiumCondition: 83, sponsorships: [] },

  // Ukrainian Premier League
  { id: "shakhtar", name: "Shakhtar Donetsk", shortName: "Shakhtar", league: "Ukrainian Premier League", primaryColor: "#f97316", secondaryColor: "#000000", reputation: 78, stadium: "Olimpiyskiy", capacity: 70050, transferBudget: 28749999, wageBudget: 1437500, bankBalance: 62500000, ticketPrice: 49, stadiumCondition: 87, sponsorships: [] },
  { id: "dynamokyiv", name: "Dynamo Kyiv", shortName: "Dynamo", league: "Ukrainian Premier League", primaryColor: "#ffffff", secondaryColor: "#1d4ed8", reputation: 76, stadium: "Olimpiyskiy", capacity: 70050, transferBudget: 23000000, wageBudget: 1150000, bankBalance: 50000000, ticketPrice: 48, stadiumCondition: 77, sponsorships: [] },
  { id: "kryvbas", name: "Kryvbas Kryvyi Rih", shortName: "Kryvbas", league: "Ukrainian Premier League", primaryColor: "#dc2626", secondaryColor: "#ffffff", reputation: 70, stadium: "Hirnyk Stadium", capacity: 2500, transferBudget: 8049999, wageBudget: 402499, bankBalance: 17500000, ticketPrice: 45, stadiumCondition: 61, sponsorships: [] },
  { id: "dnipro1", name: "SC Dnipro-1", shortName: "Dnipro-1", league: "Ukrainian Premier League", primaryColor: "#facc15", secondaryColor: "#000000", reputation: 68, stadium: "Dnipro-Arena", capacity: 31003, transferBudget: 5750000, wageBudget: 287500, bankBalance: 12500000, ticketPrice: 44, stadiumCondition: 77, sponsorships: [] },
  { id: "polissya", name: "Polissya Zhytomyr", shortName: "Polissya", league: "Ukrainian Premier League", primaryColor: "#16a34a", secondaryColor: "#facc15", reputation: 69, stadium: "Tsentralnyi Stadion", capacity: 5928, transferBudget: 6899999, wageBudget: 345000, bankBalance: 15000000, ticketPrice: 44, stadiumCondition: 92, sponsorships: [] },
  { id: "rukh", name: "Rukh Lviv", shortName: "Rukh", league: "Ukrainian Premier League", primaryColor: "#facc15", secondaryColor: "#000000", reputation: 68, stadium: "Arena Lviv", capacity: 34915, transferBudget: 6324999, wageBudget: 316250, bankBalance: 13750000, ticketPrice: 44, stadiumCondition: 62, sponsorships: [] },
  { id: "lnz", name: "LNZ Cherkasy", shortName: "LNZ", league: "Ukrainian Premier League", primaryColor: "#6b21a8", secondaryColor: "#ffffff", reputation: 65, stadium: "Cherkasy Arena", capacity: 10321, transferBudget: 4600000, wageBudget: 229999, bankBalance: 10000000, ticketPrice: 42, stadiumCondition: 60, sponsorships: [] },
  { id: "oleksandriya", name: "FC Oleksandriya", shortName: "Oleksandriya", league: "Ukrainian Premier League", primaryColor: "#16a34a", secondaryColor: "#facc15", reputation: 67, stadium: "Nika Stadium", capacity: 7000, transferBudget: 5175000, wageBudget: 258749, bankBalance: 11250000, ticketPrice: 43, stadiumCondition: 67, sponsorships: [] },
  { id: "vorskla", name: "Vorskla Poltava", shortName: "Vorskla", league: "Ukrainian Premier League", primaryColor: "#16a34a", secondaryColor: "#ffffff", reputation: 66, stadium: "Oleksiy Butovsky", capacity: 24795, transferBudget: 4600000, wageBudget: 229999, bankBalance: 10000000, ticketPrice: 43, stadiumCondition: 73, sponsorships: [] },
  { id: "zorya", name: "Zorya Luhansk", shortName: "Zorya", league: "Ukrainian Premier League", primaryColor: "#000000", secondaryColor: "#ffffff", reputation: 67, stadium: "Slavutych-Arena", capacity: 11883, transferBudget: 5175000, wageBudget: 258749, bankBalance: 11250000, ticketPrice: 43, stadiumCondition: 88, sponsorships: [] },
  { id: "kolos", name: "Kolos Kovalivka", shortName: "Kolos", league: "Ukrainian Premier League", primaryColor: "#ffffff", secondaryColor: "#000000", reputation: 65, stadium: "Kolos Stadium", capacity: 5000, transferBudget: 4024999, wageBudget: 201249, bankBalance: 8750000, ticketPrice: 42, stadiumCondition: 86, sponsorships: [] },
  { id: "chornomorets", name: "Chornomorets Odesa", shortName: "Chornomorets", league: "Ukrainian Premier League", primaryColor: "#1d4ed8", secondaryColor: "#000000", reputation: 66, stadium: "Chornomorets Stadium", capacity: 34164, transferBudget: 4600000, wageBudget: 229999, bankBalance: 10000000, ticketPrice: 43, stadiumCondition: 70, sponsorships: [] },
  { id: "veres", name: "Veres Rivne", shortName: "Veres", league: "Ukrainian Premier League", primaryColor: "#dc2626", secondaryColor: "#000000", reputation: 64, stadium: "Avanhard Stadium", capacity: 4650, transferBudget: 3449999, wageBudget: 172500, bankBalance: 7500000, ticketPrice: 42, stadiumCondition: 89, sponsorships: [] },
  { id: "obolon", name: "Obolon Kyiv", shortName: "Obolon", league: "Ukrainian Premier League", primaryColor: "#16a34a", secondaryColor: "#ffffff", reputation: 64, stadium: "Obolon Arena", capacity: 5100, transferBudget: 3449999, wageBudget: 172500, bankBalance: 7500000, ticketPrice: 42, stadiumCondition: 90, sponsorships: [] },
  { id: "inhulets", name: "Inhulets Petrove", shortName: "Inhulets", league: "Ukrainian Premier League", primaryColor: "#facc15", secondaryColor: "#dc2626", reputation: 63, stadium: "Inhulets Stadium", capacity: 1869, transferBudget: 2875000, wageBudget: 143750, bankBalance: 6250000, ticketPrice: 41, stadiumCondition: 77, sponsorships: [] },
  { id: "karpaty", name: "Karpaty Lviv", shortName: "Karpaty", league: "Ukrainian Premier League", primaryColor: "#16a34a", secondaryColor: "#ffffff", reputation: 66, stadium: "Ukraina Stadium", capacity: 27925, transferBudget: 4600000, wageBudget: 229999, bankBalance: 10000000, ticketPrice: 43, stadiumCondition: 87, sponsorships: [] },

  // Danish Superliga
  { id: "midtjylland", name: "FC Midtjylland", shortName: "Midtjylland", league: "Danish Superliga", primaryColor: "#000000", secondaryColor: "#dc2626", reputation: 75, stadium: "MCH Arena", capacity: 11800, transferBudget: 20700000, wageBudget: 1034999, bankBalance: 45000000, ticketPrice: 47, stadiumCondition: 83, sponsorships: [] },
  { id: "brondby", name: "Brøndby IF", shortName: "Brøndby", league: "Danish Superliga", primaryColor: "#facc15", secondaryColor: "#1d4ed8", reputation: 73, stadium: "Brøndby Stadium", capacity: 28000, transferBudget: 16099999, wageBudget: 804999, bankBalance: 35000000, ticketPrice: 46, stadiumCondition: 78, sponsorships: [] },
  { id: "copenhagen", name: "FC Copenhagen", shortName: "Copenhagen", league: "Danish Superliga", primaryColor: "#ffffff", secondaryColor: "#1d4ed8", reputation: 76, stadium: "Parken", capacity: 38065, transferBudget: 25299999, wageBudget: 1265000, bankBalance: 55000000, ticketPrice: 48, stadiumCondition: 83, sponsorships: [] },
  { id: "nordsjaelland", name: "FC Nordsjælland", shortName: "Nordsjælland", league: "Danish Superliga", primaryColor: "#dc2626", secondaryColor: "#facc15", reputation: 72, stadium: "Right to Dream Park", capacity: 10300, transferBudget: 13799999, wageBudget: 690000, bankBalance: 30000000, ticketPrice: 46, stadiumCondition: 74, sponsorships: [] },
  { id: "agf", name: "AGF", shortName: "AGF", league: "Danish Superliga", primaryColor: "#ffffff", secondaryColor: "#1d4ed8", reputation: 70, stadium: "Ceres Park", capacity: 19433, transferBudget: 9200000, wageBudget: 459999, bankBalance: 20000000, ticketPrice: 45, stadiumCondition: 69, sponsorships: [] },
  { id: "silkeborg", name: "Silkeborg IF", shortName: "Silkeborg", league: "Danish Superliga", primaryColor: "#dc2626", secondaryColor: "#ffffff", reputation: 69, stadium: "JYSK Park", capacity: 10000, transferBudget: 6899999, wageBudget: 345000, bankBalance: 15000000, ticketPrice: 44, stadiumCondition: 82, sponsorships: [] },
  { id: "randers", name: "Randers FC", shortName: "Randers", league: "Danish Superliga", primaryColor: "#000000", secondaryColor: "#38bdf8", reputation: 68, stadium: "Cepheus Park", capacity: 10300, transferBudget: 5750000, wageBudget: 287500, bankBalance: 12500000, ticketPrice: 44, stadiumCondition: 93, sponsorships: [] },
  { id: "viborg", name: "Viborg FF", shortName: "Viborg", league: "Danish Superliga", primaryColor: "#16a34a", secondaryColor: "#ffffff", reputation: 68, stadium: "Energi Viborg Arena", capacity: 9566, transferBudget: 5750000, wageBudget: 287500, bankBalance: 12500000, ticketPrice: 44, stadiumCondition: 79, sponsorships: [] },
  { id: "aab", name: "AaB", shortName: "AaB", league: "Danish Superliga", primaryColor: "#dc2626", secondaryColor: "#ffffff", reputation: 69, stadium: "Aalborg Portland Park", capacity: 13797, transferBudget: 6324999, wageBudget: 316250, bankBalance: 13750000, ticketPrice: 44, stadiumCondition: 88, sponsorships: [] },
  { id: "sonderjyske", name: "SønderjyskE", shortName: "SønderjyskE", league: "Danish Superliga", primaryColor: "#38bdf8", secondaryColor: "#ffffff", reputation: 66, stadium: "Sydbank Park", capacity: 10100, transferBudget: 4600000, wageBudget: 229999, bankBalance: 10000000, ticketPrice: 43, stadiumCondition: 67, sponsorships: [] },
  { id: "vejle", name: "Vejle Boldklub", shortName: "Vejle", league: "Danish Superliga", primaryColor: "#dc2626", secondaryColor: "#ffffff", reputation: 65, stadium: "Vejle Stadium", capacity: 10418, transferBudget: 4024999, wageBudget: 201249, bankBalance: 8750000, ticketPrice: 42, stadiumCondition: 64, sponsorships: [] },
  { id: "lyngby", name: "Lyngby BK", shortName: "Lyngby", league: "Danish Superliga", primaryColor: "#1d4ed8", secondaryColor: "#ffffff", reputation: 65, stadium: "Lyngby Stadium", capacity: 10100, transferBudget: 4024999, wageBudget: 201249, bankBalance: 8750000, ticketPrice: 42, stadiumCondition: 76, sponsorships: [] },

  // Allsvenskan
  { id: "malmo", name: "Malmö FF", shortName: "Malmö", league: "Allsvenskan", primaryColor: "#38bdf8", secondaryColor: "#ffffff", reputation: 74, stadium: "Eleda Stadion", capacity: 22500, transferBudget: 18400000, wageBudget: 919999, bankBalance: 40000000, ticketPrice: 47, stadiumCondition: 91, sponsorships: [] },
  { id: "elfsborg", name: "IF Elfsborg", shortName: "Elfsborg", league: "Allsvenskan", primaryColor: "#facc15", secondaryColor: "#000000", reputation: 71, stadium: "Borås Arena", capacity: 16200, transferBudget: 10350000, wageBudget: 517499, bankBalance: 22500000, ticketPrice: 45, stadiumCondition: 66, sponsorships: [] },
  { id: "hacken", name: "BK Häcken", shortName: "Häcken", league: "Allsvenskan", primaryColor: "#facc15", secondaryColor: "#000000", reputation: 70, stadium: "Bravida Arena", capacity: 6316, transferBudget: 9200000, wageBudget: 459999, bankBalance: 20000000, ticketPrice: 45, stadiumCondition: 67, sponsorships: [] },
  { id: "djurgarden", name: "Djurgårdens IF", shortName: "Djurgården", league: "Allsvenskan", primaryColor: "#1d4ed8", secondaryColor: "#38bdf8", reputation: 72, stadium: "Tele2 Arena", capacity: 30000, transferBudget: 12649999, wageBudget: 632500, bankBalance: 27500000, ticketPrice: 46, stadiumCondition: 73, sponsorships: [] },
  { id: "varnamo", name: "IFK Värnamo", shortName: "Värnamo", league: "Allsvenskan", primaryColor: "#ffffff", secondaryColor: "#1d4ed8", reputation: 65, stadium: "Finnvedsvallen", capacity: 5000, transferBudget: 3449999, wageBudget: 172500, bankBalance: 7500000, ticketPrice: 42, stadiumCondition: 89, sponsorships: [] },
  { id: "kalmar", name: "Kalmar FF", shortName: "Kalmar", league: "Allsvenskan", primaryColor: "#dc2626", secondaryColor: "#ffffff", reputation: 67, stadium: "Guldfågeln Arena", capacity: 12150, transferBudget: 5175000, wageBudget: 258749, bankBalance: 11250000, ticketPrice: 43, stadiumCondition: 73, sponsorships: [] },
  { id: "hammarby", name: "Hammarby IF", shortName: "Hammarby", league: "Allsvenskan", primaryColor: "#16a34a", secondaryColor: "#ffffff", reputation: 71, stadium: "Tele2 Arena", capacity: 30000, transferBudget: 11500000, wageBudget: 575000, bankBalance: 25000000, ticketPrice: 45, stadiumCondition: 77, sponsorships: [] },
  { id: "sirius", name: "IK Sirius", shortName: "Sirius", league: "Allsvenskan", primaryColor: "#1d4ed8", secondaryColor: "#000000", reputation: 66, stadium: "Studenternas IP", capacity: 10250, transferBudget: 4024999, wageBudget: 201249, bankBalance: 8750000, ticketPrice: 43, stadiumCondition: 88, sponsorships: [] },
  { id: "norrkoping", name: "IFK Norrköping", shortName: "Norrköping", league: "Allsvenskan", primaryColor: "#ffffff", secondaryColor: "#1d4ed8", reputation: 68, stadium: "PlatinumCars Arena", capacity: 16000, transferBudget: 5750000, wageBudget: 287500, bankBalance: 12500000, ticketPrice: 44, stadiumCondition: 65, sponsorships: [] },
  { id: "mjallby", name: "Mjällby AIF", shortName: "Mjällby", league: "Allsvenskan", primaryColor: "#facc15", secondaryColor: "#000000", reputation: 66, stadium: "Strandvallen", capacity: 6000, transferBudget: 4024999, wageBudget: 201249, bankBalance: 8750000, ticketPrice: 43, stadiumCondition: 91, sponsorships: [] },
  { id: "aik", name: "AIK", shortName: "AIK", league: "Allsvenskan", primaryColor: "#000000", secondaryColor: "#facc15", reputation: 72, stadium: "Friends Arena", capacity: 50000, transferBudget: 12649999, wageBudget: 632500, bankBalance: 27500000, ticketPrice: 46, stadiumCondition: 67, sponsorships: [] },
  { id: "halmstad", name: "Halmstads BK", shortName: "Halmstad", league: "Allsvenskan", primaryColor: "#1d4ed8", secondaryColor: "#ffffff", reputation: 65, stadium: "Örjans Vall", capacity: 10873, transferBudget: 3449999, wageBudget: 172500, bankBalance: 7500000, ticketPrice: 42, stadiumCondition: 71, sponsorships: [] },
  { id: "goteborg", name: "IFK Göteborg", shortName: "Göteborg", league: "Allsvenskan", primaryColor: "#1d4ed8", secondaryColor: "#ffffff", reputation: 70, stadium: "Gamla Ullevi", capacity: 18416, transferBudget: 8049999, wageBudget: 402499, bankBalance: 17500000, ticketPrice: 45, stadiumCondition: 78, sponsorships: [] },
  { id: "brommapojkarna", name: "IF Brommapojkarna", shortName: "Brommapojkarna", league: "Allsvenskan", primaryColor: "#dc2626", secondaryColor: "#000000", reputation: 65, stadium: "Grimsta IP", capacity: 5000, transferBudget: 2875000, wageBudget: 143750, bankBalance: 6250000, ticketPrice: 42, stadiumCondition: 68, sponsorships: [] },
  { id: "gais", name: "GAIS", shortName: "GAIS", league: "Allsvenskan", primaryColor: "#16a34a", secondaryColor: "#000000", reputation: 66, stadium: "Gamla Ullevi", capacity: 18416, transferBudget: 4024999, wageBudget: 201249, bankBalance: 8750000, ticketPrice: 43, stadiumCondition: 92, sponsorships: [] },
  { id: "vasteras", name: "Västerås SK", shortName: "Västerås", league: "Allsvenskan", primaryColor: "#16a34a", secondaryColor: "#ffffff", reputation: 64, stadium: "Hitachi Energy Arena", capacity: 7000, transferBudget: 2875000, wageBudget: 143750, bankBalance: 6250000, ticketPrice: 42, stadiumCondition: 63, sponsorships: [] },

  // Russian Premier League
  { id: "zenit", name: "Zenit Saint Petersburg", shortName: "Zenit", league: "Russian Premier League", primaryColor: "#38bdf8", secondaryColor: "#ffffff", reputation: 77, stadium: "Gazprom Arena", capacity: 67800, transferBudget: 34500000, wageBudget: 1724999, bankBalance: 75000000, ticketPrice: 48, stadiumCondition: 90, sponsorships: [] },
  { id: "krasnodar", name: "FC Krasnodar", shortName: "Krasnodar", league: "Russian Premier League", primaryColor: "#16a34a", secondaryColor: "#000000", reputation: 74, stadium: "Krasnodar Stadium", capacity: 35179, transferBudget: 20700000, wageBudget: 1034999, bankBalance: 45000000, ticketPrice: 47, stadiumCondition: 85, sponsorships: [] },
  { id: "dynamomoscow", name: "Dynamo Moscow", shortName: "Dynamo", league: "Russian Premier League", primaryColor: "#1d4ed8", secondaryColor: "#ffffff", reputation: 73, stadium: "VTB Arena", capacity: 25716, transferBudget: 17250000, wageBudget: 862499, bankBalance: 37500000, ticketPrice: 46, stadiumCondition: 62, sponsorships: [] },
  { id: "lokomotiv", name: "Lokomotiv Moscow", shortName: "Lokomotiv", league: "Russian Premier League", primaryColor: "#dc2626", secondaryColor: "#16a34a", reputation: 73, stadium: "RZD Arena", capacity: 27320, transferBudget: 17250000, wageBudget: 862499, bankBalance: 37500000, ticketPrice: 46, stadiumCondition: 68, sponsorships: [] },
  { id: "spartakmoscow", name: "Spartak Moscow", shortName: "Spartak", league: "Russian Premier League", primaryColor: "#dc2626", secondaryColor: "#ffffff", reputation: 74, stadium: "Otkritie Bank Arena", capacity: 45360, transferBudget: 19550000, wageBudget: 977499, bankBalance: 42500000, ticketPrice: 47, stadiumCondition: 81, sponsorships: [] },
  { id: "cska", name: "CSKA Moscow", shortName: "CSKA", league: "Russian Premier League", primaryColor: "#dc2626", secondaryColor: "#1d4ed8", reputation: 74, stadium: "VEB Arena", capacity: 30114, transferBudget: 18400000, wageBudget: 919999, bankBalance: 40000000, ticketPrice: 47, stadiumCondition: 83, sponsorships: [] },
  { id: "rostov", name: "FC Rostov", shortName: "Rostov", league: "Russian Premier League", primaryColor: "#facc15", secondaryColor: "#1d4ed8", reputation: 71, stadium: "Rostov Arena", capacity: 43472, transferBudget: 11500000, wageBudget: 575000, bankBalance: 25000000, ticketPrice: 45, stadiumCondition: 75, sponsorships: [] },
  { id: "rubin", name: "Rubin Kazan", shortName: "Rubin", league: "Russian Premier League", primaryColor: "#7f1d1d", secondaryColor: "#16a34a", reputation: 70, stadium: "Ak Bars Arena", capacity: 45379, transferBudget: 9200000, wageBudget: 459999, bankBalance: 20000000, ticketPrice: 45, stadiumCondition: 92, sponsorships: [] },
  { id: "krylia", name: "Krylia Sovetov", shortName: "Krylia", league: "Russian Premier League", primaryColor: "#38bdf8", secondaryColor: "#ffffff", reputation: 69, stadium: "Solidarnost Arena", capacity: 44918, transferBudget: 8049999, wageBudget: 402499, bankBalance: 17500000, ticketPrice: 44, stadiumCondition: 82, sponsorships: [] },
  { id: "akhmat", name: "Akhmat Grozny", shortName: "Akhmat", league: "Russian Premier League", primaryColor: "#16a34a", secondaryColor: "#ffffff", reputation: 68, stadium: "Akhmat-Arena", capacity: 30597, transferBudget: 6899999, wageBudget: 345000, bankBalance: 15000000, ticketPrice: 44, stadiumCondition: 66, sponsorships: [] },
  { id: "fakel", name: "Fakel Voronezh", shortName: "Fakel", league: "Russian Premier League", primaryColor: "#1d4ed8", secondaryColor: "#ffffff", reputation: 67, stadium: "Tsentralnyi Profsoyuz", capacity: 31793, transferBudget: 5750000, wageBudget: 287500, bankBalance: 12500000, ticketPrice: 43, stadiumCondition: 77, sponsorships: [] },
  { id: "orenburg", name: "FC Orenburg", shortName: "Orenburg", league: "Russian Premier League", primaryColor: "#1d4ed8", secondaryColor: "#ffffff", reputation: 67, stadium: "Gazovik Stadium", capacity: 10046, transferBudget: 5750000, wageBudget: 287500, bankBalance: 12500000, ticketPrice: 43, stadiumCondition: 61, sponsorships: [] },
  { id: "parinn", name: "Pari Nizhny Novgorod", shortName: "Pari NN", league: "Russian Premier League", primaryColor: "#38bdf8", secondaryColor: "#ffffff", reputation: 68, stadium: "Nizhny Novgorod", capacity: 44899, transferBudget: 6324999, wageBudget: 316250, bankBalance: 13750000, ticketPrice: 44, stadiumCondition: 60, sponsorships: [] },
  { id: "dynamomakhachkala", name: "Dynamo Makhachkala", shortName: "Dynamo M", league: "Russian Premier League", primaryColor: "#1d4ed8", secondaryColor: "#ffffff", reputation: 66, stadium: "Anzhi Arena", capacity: 26500, transferBudget: 5175000, wageBudget: 258749, bankBalance: 11250000, ticketPrice: 43, stadiumCondition: 94, sponsorships: [] },
  { id: "khimki", name: "FC Khimki", shortName: "Khimki", league: "Russian Premier League", primaryColor: "#dc2626", secondaryColor: "#000000", reputation: 65, stadium: "Arena Khimki", capacity: 18636, transferBudget: 4600000, wageBudget: 229999, bankBalance: 10000000, ticketPrice: 42, stadiumCondition: 94, sponsorships: [] },
  { id: "akron", name: "Akron Tolyatti", shortName: "Akron", league: "Russian Premier League", primaryColor: "#dc2626", secondaryColor: "#000000", reputation: 66, stadium: "Kristall Stadium", capacity: 3000, transferBudget: 5175000, wageBudget: 258749, bankBalance: 11250000, ticketPrice: 43, stadiumCondition: 91, sponsorships: [] },

  // Ekstraklasa
  { id: "jagiellonia", name: "Jagiellonia Białystok", shortName: "Jagiellonia", league: "Ekstraklasa", primaryColor: "#facc15", secondaryColor: "#dc2626", reputation: 71, stadium: "Białystok City Stadium", capacity: 22386, transferBudget: 8049999, wageBudget: 402499, bankBalance: 17500000, ticketPrice: 45, stadiumCondition: 60, sponsorships: [] },
  { id: "slask", name: "Śląsk Wrocław", shortName: "Śląsk", league: "Ekstraklasa", primaryColor: "#16a34a", secondaryColor: "#ffffff", reputation: 70, stadium: "Tarczyński Arena", capacity: 42771, transferBudget: 6899999, wageBudget: 345000, bankBalance: 15000000, ticketPrice: 45, stadiumCondition: 69, sponsorships: [] },
  { id: "legia", name: "Legia Warsaw", shortName: "Legia", league: "Ekstraklasa", primaryColor: "#ffffff", secondaryColor: "#000000", reputation: 74, stadium: "Stadion Wojska Polskiego", capacity: 31103, transferBudget: 16099999, wageBudget: 804999, bankBalance: 35000000, ticketPrice: 47, stadiumCondition: 82, sponsorships: [] },
  { id: "pogon", name: "Pogoń Szczecin", shortName: "Pogoń", league: "Ekstraklasa", primaryColor: "#1d4ed8", secondaryColor: "#7f1d1d", reputation: 71, stadium: "Stadion Miejski im. Floriana", capacity: 21163, transferBudget: 8049999, wageBudget: 402499, bankBalance: 17500000, ticketPrice: 45, stadiumCondition: 72, sponsorships: [] },
  { id: "lech", name: "Lech Poznań", shortName: "Lech", league: "Ekstraklasa", primaryColor: "#1d4ed8", secondaryColor: "#ffffff", reputation: 73, stadium: "Stadion Miejski", capacity: 42837, transferBudget: 12649999, wageBudget: 632500, bankBalance: 27500000, ticketPrice: 46, stadiumCondition: 60, sponsorships: [] },
  { id: "gornik", name: "Górnik Zabrze", shortName: "Górnik", league: "Ekstraklasa", primaryColor: "#ffffff", secondaryColor: "#dc2626", reputation: 69, stadium: "Stadion im. Ernesta Pohla", capacity: 24563, transferBudget: 6324999, wageBudget: 316250, bankBalance: 13750000, ticketPrice: 44, stadiumCondition: 73, sponsorships: [] },
  { id: "rakow", name: "Raków Częstochowa", shortName: "Raków", league: "Ekstraklasa", primaryColor: "#dc2626", secondaryColor: "#1d4ed8", reputation: 72, stadium: "Miejski Stadion Piłkarski", capacity: 5500, transferBudget: 10350000, wageBudget: 517499, bankBalance: 22500000, ticketPrice: 46, stadiumCondition: 65, sponsorships: [] },
  { id: "zaglebie", name: "Zagłębie Lubin", shortName: "Zagłębie", league: "Ekstraklasa", primaryColor: "#f97316", secondaryColor: "#16a34a", reputation: 68, stadium: "Stadion Zagłębia", capacity: 16068, transferBudget: 5175000, wageBudget: 258749, bankBalance: 11250000, ticketPrice: 44, stadiumCondition: 93, sponsorships: [] },
  { id: "widzew", name: "Widzew Łódź", shortName: "Widzew", league: "Ekstraklasa", primaryColor: "#dc2626", secondaryColor: "#ffffff", reputation: 69, stadium: "Stadion Miejski Widzewa", capacity: 18018, transferBudget: 5750000, wageBudget: 287500, bankBalance: 12500000, ticketPrice: 44, stadiumCondition: 92, sponsorships: [] },
  { id: "piast", name: "Piast Gliwice", shortName: "Piast", league: "Ekstraklasa", primaryColor: "#1d4ed8", secondaryColor: "#dc2626", reputation: 68, stadium: "Stadion Miejski", capacity: 10037, transferBudget: 5175000, wageBudget: 258749, bankBalance: 11250000, ticketPrice: 44, stadiumCondition: 90, sponsorships: [] },
  { id: "stal", name: "Stal Mielec", shortName: "Stal", league: "Ekstraklasa", primaryColor: "#ffffff", secondaryColor: "#38bdf8", reputation: 66, stadium: "Stadion MOSiR", capacity: 6864, transferBudget: 3449999, wageBudget: 172500, bankBalance: 7500000, ticketPrice: 43, stadiumCondition: 93, sponsorships: [] },
  { id: "puszcza", name: "Puszcza Niepołomice", shortName: "Puszcza", league: "Ekstraklasa", primaryColor: "#facc15", secondaryColor: "#16a34a", reputation: 65, stadium: "Stadion Miejski", capacity: 2118, transferBudget: 2875000, wageBudget: 143750, bankBalance: 6250000, ticketPrice: 42, stadiumCondition: 75, sponsorships: [] },
  { id: "cracovia", name: "Cracovia", shortName: "Cracovia", league: "Ekstraklasa", primaryColor: "#ffffff", secondaryColor: "#dc2626", reputation: 68, stadium: "Stadion Cracovii", capacity: 15016, transferBudget: 5175000, wageBudget: 258749, bankBalance: 11250000, ticketPrice: 44, stadiumCondition: 83, sponsorships: [] },
  { id: "korona", name: "Korona Kielce", shortName: "Korona", league: "Ekstraklasa", primaryColor: "#facc15", secondaryColor: "#dc2626", reputation: 66, stadium: "Suzuki Arena", capacity: 15550, transferBudget: 3449999, wageBudget: 172500, bankBalance: 7500000, ticketPrice: 43, stadiumCondition: 70, sponsorships: [] },
  { id: "radomiak", name: "Radomiak Radom", shortName: "Radomiak", league: "Ekstraklasa", primaryColor: "#16a34a", secondaryColor: "#ffffff", reputation: 67, stadium: "Stadion im. Braci Czachorów", capacity: 8840, transferBudget: 4024999, wageBudget: 201249, bankBalance: 8750000, ticketPrice: 43, stadiumCondition: 63, sponsorships: [] },
  { id: "lechia", name: "Lechia Gdańsk", shortName: "Lechia", league: "Ekstraklasa", primaryColor: "#16a34a", secondaryColor: "#ffffff", reputation: 69, stadium: "Polsat Plus Arena", capacity: 41620, transferBudget: 6324999, wageBudget: 316250, bankBalance: 13750000, ticketPrice: 44, stadiumCondition: 89, sponsorships: [] },
  { id: "gks", name: "GKS Katowice", shortName: "GKS", league: "Ekstraklasa", primaryColor: "#facc15", secondaryColor: "#000000", reputation: 66, stadium: "Stadion GKS Katowice", capacity: 6710, transferBudget: 3449999, wageBudget: 172500, bankBalance: 7500000, ticketPrice: 43, stadiumCondition: 86, sponsorships: [] },
  { id: "motor", name: "Motor Lublin", shortName: "Motor", league: "Ekstraklasa", primaryColor: "#facc15", secondaryColor: "#1d4ed8", reputation: 66, stadium: "Arena Lublin", capacity: 15243, transferBudget: 4024999, wageBudget: 201249, bankBalance: 8750000, ticketPrice: 43, stadiumCondition: 76, sponsorships: [] },

  // Prva HNL
  { id: "dinamozagreb", name: "Dinamo Zagreb", shortName: "Dinamo", league: "Prva HNL", primaryColor: "#1d4ed8", secondaryColor: "#ffffff", reputation: 76, stadium: "Stadion Maksimir", capacity: 35123, transferBudget: 23000000, wageBudget: 1150000, bankBalance: 50000000, ticketPrice: 48, stadiumCondition: 87, sponsorships: [] },
  { id: "rijeka", name: "HNK Rijeka", shortName: "Rijeka", league: "Prva HNL", primaryColor: "#ffffff", secondaryColor: "#38bdf8", reputation: 72, stadium: "Stadion Rujevica", capacity: 8279, transferBudget: 9200000, wageBudget: 459999, bankBalance: 20000000, ticketPrice: 46, stadiumCondition: 86, sponsorships: [] },
  { id: "hajduk", name: "Hajduk Split", shortName: "Hajduk", league: "Prva HNL", primaryColor: "#ffffff", secondaryColor: "#1d4ed8", reputation: 73, stadium: "Stadion Poljud", capacity: 33987, transferBudget: 12649999, wageBudget: 632500, bankBalance: 27500000, ticketPrice: 46, stadiumCondition: 82, sponsorships: [] },
  { id: "osijek", name: "NK Osijek", shortName: "Osijek", league: "Prva HNL", primaryColor: "#ffffff", secondaryColor: "#1d4ed8", reputation: 70, stadium: "Opus Arena", capacity: 13005, transferBudget: 6899999, wageBudget: 345000, bankBalance: 15000000, ticketPrice: 45, stadiumCondition: 88, sponsorships: [] },
  { id: "lokomotiva", name: "Lokomotiva Zagreb", shortName: "Lokomotiva", league: "Prva HNL", primaryColor: "#1d4ed8", secondaryColor: "#ffffff", reputation: 67, stadium: "Stadion Kranjčevićeva", capacity: 5350, transferBudget: 3449999, wageBudget: 172500, bankBalance: 7500000, ticketPrice: 43, stadiumCondition: 60, sponsorships: [] },
  { id: "varazdin", name: "NK Varaždin", shortName: "Varaždin", league: "Prva HNL", primaryColor: "#1d4ed8", secondaryColor: "#ffffff", reputation: 66, stadium: "Stadion Varteks", capacity: 8850, transferBudget: 2875000, wageBudget: 143750, bankBalance: 6250000, ticketPrice: 43, stadiumCondition: 83, sponsorships: [] },
  { id: "gorica", name: "HNK Gorica", shortName: "Gorica", league: "Prva HNL", primaryColor: "#dc2626", secondaryColor: "#ffffff", reputation: 66, stadium: "Stadion Radnik", capacity: 5200, transferBudget: 2875000, wageBudget: 143750, bankBalance: 6250000, ticketPrice: 43, stadiumCondition: 77, sponsorships: [] },
  { id: "istra", name: "Istra 1961", shortName: "Istra", league: "Prva HNL", primaryColor: "#16a34a", secondaryColor: "#facc15", reputation: 65, stadium: "Stadion Aldo Drosina", capacity: 8923, transferBudget: 2300000, wageBudget: 114999, bankBalance: 5000000, ticketPrice: 42, stadiumCondition: 61, sponsorships: [] },
  { id: "slaven", name: "Slaven Belupo", shortName: "Slaven", league: "Prva HNL", primaryColor: "#1d4ed8", secondaryColor: "#ffffff", reputation: 65, stadium: "Gradski Stadion Ivan Kušek-Apaš", capacity: 3205, transferBudget: 1724999, wageBudget: 86250, bankBalance: 3750000, ticketPrice: 42, stadiumCondition: 80, sponsorships: [] },
  { id: "sibenik", name: "HNK Šibenik", shortName: "Šibenik", league: "Prva HNL", primaryColor: "#f97316", secondaryColor: "#000000", reputation: 64, stadium: "Stadion Šubićevac", capacity: 3412, transferBudget: 1724999, wageBudget: 86250, bankBalance: 3750000, ticketPrice: 42, stadiumCondition: 73, sponsorships: [] },
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
  "Declan Rice": { overall: 87, potential: 88, pace: 74, shooting: 73, passing: 83, dribbling: 79, defending: 85, physical: 84, mental: 86, stamina: 92, age: 25 },
  "William Saliba": { overall: 88, potential: 92, pace: 82, shooting: 40, passing: 78, dribbling: 74, defending: 89, physical: 85, mental: 84, stamina: 82, age: 23 },
  "Gabriel Magalhães": { overall: 86, potential: 87, pace: 73, shooting: 35, passing: 70, dribbling: 65, defending: 87, physical: 89, mental: 82, stamina: 80, age: 26 },
  "Kai Havertz": { overall: 85, potential: 87, pace: 80, shooting: 82, passing: 81, dribbling: 84, defending: 55, physical: 78, mental: 84, stamina: 85, age: 25 },
  "Endrick": { overall: 82, potential: 93, pace: 89, shooting: 84, passing: 72, dribbling: 85, defending: 35, physical: 78, mental: 75, stamina: 76, age: 19 },
  "Arda Güler": { overall: 83, potential: 92, pace: 78, shooting: 81, passing: 86, dribbling: 87, defending: 45, physical: 60, mental: 82, stamina: 75, age: 21 },
  "Leny Yoro": { overall: 81, potential: 90, pace: 78, shooting: 40, passing: 74, dribbling: 70, defending: 83, physical: 80, mental: 78, stamina: 76, age: 20 },
  "Savinho": { overall: 84, potential: 89, pace: 90, shooting: 78, passing: 80, dribbling: 88, defending: 42, physical: 65, mental: 78, stamina: 82, age: 21 },
  "Riccardo Calafiori": { overall: 84, potential: 89, pace: 79, shooting: 60, passing: 81, dribbling: 78, defending: 85, physical: 84, mental: 82, stamina: 85, age: 23 },
  "Michael Olise": { overall: 86, potential: 90, pace: 85, shooting: 83, passing: 86, dribbling: 88, defending: 48, physical: 70, mental: 81, stamina: 82, age: 24 },
  "João Neves": { overall: 84, potential: 91, pace: 76, shooting: 70, passing: 85, dribbling: 84, defending: 80, physical: 74, mental: 84, stamina: 88, age: 21 },
  "Alejandro Garnacho": { overall: 84, potential: 90, pace: 90, shooting: 82, passing: 76, dribbling: 86, defending: 40, physical: 65, mental: 79, stamina: 81, age: 21 },
  "Bradley Barcola": { overall: 84, potential: 90, pace: 92, shooting: 80, passing: 79, dribbling: 87, defending: 42, physical: 68, mental: 78, stamina: 80, age: 23 },
  "Pau Cubarsí": { overall: 82, potential: 92, pace: 75, shooting: 35, passing: 82, dribbling: 74, defending: 84, physical: 78, mental: 82, stamina: 75, age: 19 },
  "Kobbie Mainoo": { overall: 83, potential: 90, pace: 76, shooting: 72, passing: 84, dribbling: 86, defending: 78, physical: 75, mental: 82, stamina: 84, age: 20 },
  "Viktor Gyökeres": { overall: 88, potential: 89, pace: 87, shooting: 88, passing: 76, dribbling: 82, defending: 45, physical: 88, mental: 83, stamina: 86, age: 27 },
  "Alexander Isak": { overall: 87, potential: 89, pace: 88, shooting: 87, passing: 76, dribbling: 85, defending: 40, physical: 78, mental: 81, stamina: 82, age: 26 },
  "Anthony Gordon": { overall: 85, potential: 88, pace: 90, shooting: 80, passing: 81, dribbling: 85, defending: 55, physical: 72, mental: 80, stamina: 88, age: 24 },
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
    // Generate a deterministic pseudo-random seed based on the player's name
    const nameSeed = preset.name.length + preset.name.charCodeAt(0) + preset.name.charCodeAt(preset.name.length - 1);
    
    // Determine squad status deterministically to create realistic squad distributions
    const squadRoleRoll = nameSeed % 10;
    
    let baseOverall = clubRep - 5; // Default average
    
    if (squadRoleRoll === 0) {
      // Star Player: Rating often exceeds or matches the club's raw reputation
      baseOverall = clubRep + 1;
    } else if (squadRoleRoll >= 1 && squadRoleRoll <= 4) {
      // Key First Team
      baseOverall = clubRep - 2;
    } else if (squadRoleRoll >= 5 && squadRoleRoll <= 8) {
      // Rotation Player
      baseOverall = clubRep - 6;
    } else {
      // Fringe / Prospect
      baseOverall = clubRep - 12;
    }

    let age = preset.age || (18 + (nameSeed % 15));
    
    // Age curve logic: Players in their prime get a slight bump, youngsters/veterans get a penalty
    let ageAdjustment = 0;
    if (age < 20) ageAdjustment = -4;
    else if (age >= 26 && age <= 29) ageAdjustment = +2;
    else if (age > 33) ageAdjustment = -3;

    const override = TOP_PLAYER_OVERRIDES[preset.name];
    let overall = override ? override.overall : Math.min(99, Math.max(50, baseOverall + ageAdjustment));
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

  return squad.map(p => computeTruePositionAndRole(p));
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

export function computeTruePositionAndRole(p: Player): Player {
  let truePos = p.position as string;
  let role = "";

  if (p.position === "GK") {
    truePos = "GK";
    role = p.passing > 70 ? "Sweeper Keeper" : "Goalkeeper";
  } else if (p.position === "DEF") {
    // If pace > 80 or dribbling is high -> Fullback/Wingback
    if (p.pace > 78 || p.dribbling > 75) {
      truePos = "WB";
      role = p.passing > 75 ? "Inverted Wing-Back" : (p.pace > 85 ? "Wing-Back" : "Full-Back");
    } else {
      truePos = "CB";
      role = p.passing > 75 ? "Ball-Playing Defender" : (p.defending > 85 ? "No-Nonsense CB" : "Central Defender");
    }
  } else if (p.position === "MID") {
    if (p.pace > 82 && p.dribbling > 80) {
      truePos = "WM"; // Wide Midfielder / Winger
      role = p.shooting > 75 ? "Inverted Winger" : "Winger";
    } else if (p.defending > 75) {
      truePos = "CDM";
      role = p.passing > 80 ? "Regista" : (p.physical > 80 ? "Ball-Winning Mid" : "Anchor Man");
    } else if (p.passing > 82) {
      truePos = "CM";
      role = p.shooting > 75 ? "Advanced Playmaker" : "Deep-Lying Playmaker";
    } else {
      truePos = "CM";
      role = p.physical > 75 && p.stamina > 80 ? "Box-to-Box" : "Mezzala";
    }
  } else if (p.position === "ATT") {
    if (p.pace > 85 && p.dribbling > 82) {
      truePos = "LW/RW";
      role = "Inside Forward";
    } else if (p.physical > 82) {
      truePos = "ST";
      role = "Target Man";
    } else if (p.passing > 78 && p.dribbling > 80) {
      truePos = "CF";
      role = "False 9";
    } else if (p.pace > 85 && p.shooting > 85) {
      truePos = "ST";
      role = "Advanced Forward";
    } else {
      truePos = "ST";
      role = (p.shooting > 85) ? "Poacher" : "Complete Forward";
    }
  }

  return { ...p, truePosition: truePos, bestRole: role };
}

