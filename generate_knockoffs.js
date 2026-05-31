const fs = require('fs');
const path = require('path');
const { GoogleGenAI } = require('@google/genai');

const ai = new GoogleGenAI({ apiKey: "AIzaSyAwuFu0iKILGckyES_AkMVUxabBoy_rRR0" });

const BADGES_DIR = path.join(__dirname, 'public', 'badges');

// We just need the basic club info to prompt the LLM
const CLUBS = [
  { id: "mancity", name: "Manchester City", primaryColor: "#7dd3fc", secondaryColor: "#1e3a8a" },
  { id: "arsenal", name: "Arsenal", primaryColor: "#ef4444", secondaryColor: "#ffffff" },
  { id: "liverpool", name: "Liverpool", primaryColor: "#b91c1c", secondaryColor: "#facc15" },
  { id: "chelsea", name: "Chelsea", primaryColor: "#1d4ed8", secondaryColor: "#ffffff" },
  { id: "manunited", name: "Manchester United", primaryColor: "#dc2626", secondaryColor: "#000000" },
  { id: "tottenham", name: "Tottenham Hotspur", primaryColor: "#0f172a", secondaryColor: "#ffffff" },
  { id: "newcastle", name: "Newcastle United", primaryColor: "#000000", secondaryColor: "#ffffff" },
  { id: "astonvilla", name: "Aston Villa", primaryColor: "#7c2d12", secondaryColor: "#93c5fd" },
  { id: "westham", name: "West Ham United", primaryColor: "#881337", secondaryColor: "#06b6d4" },
  { id: "brighton", name: "Brighton & Hove Albion", primaryColor: "#2563eb", secondaryColor: "#ffffff" },
  { id: "crystalpalace", name: "Crystal Palace", primaryColor: "#1d4ed8", secondaryColor: "#dc2626" },
  { id: "fulham", name: "Fulham", primaryColor: "#ffffff", secondaryColor: "#000000" },
  { id: "bournemouth", name: "Bournemouth", primaryColor: "#ef4444", secondaryColor: "#000000" },
  { id: "brentford", name: "Brentford", primaryColor: "#e11d48", secondaryColor: "#ffffff" },
  { id: "everton", name: "Everton", primaryColor: "#1d4ed8", secondaryColor: "#ffffff" },
  { id: "wolves", name: "Wolverhampton Wanderers", primaryColor: "#eab308", secondaryColor: "#000000" },
  { id: "nottingham", name: "Nottingham Forest", primaryColor: "#dc2626", secondaryColor: "#ffffff" },
  { id: "leicester", name: "Leicester City", primaryColor: "#1e40af", secondaryColor: "#facc15" },
  { id: "ipswich", name: "Ipswich Town", primaryColor: "#2563eb", secondaryColor: "#ffffff" },
  { id: "southampton", name: "Southampton", primaryColor: "#ef4444", secondaryColor: "#ffffff" },

  { id: "realmadrid", name: "Real Madrid", primaryColor: "#ffffff", secondaryColor: "#facc15" },
  { id: "barcelona", name: "FC Barcelona", primaryColor: "#991b1b", secondaryColor: "#1e3a8a" },
  { id: "atletico", name: "Atlético Madrid", primaryColor: "#dc2626", secondaryColor: "#1d4ed8" },
  { id: "real_sociedad", name: "Real Sociedad", primaryColor: "#2563eb", secondaryColor: "#ffffff" },
  { id: "athletic_bilbao", name: "Athletic Club Bilbao", primaryColor: "#dc2626", secondaryColor: "#ffffff" },
  { id: "girona", name: "Girona", primaryColor: "#ef4444", secondaryColor: "#ffffff" },
  { id: "betis", name: "Real Betis", primaryColor: "#16a34a", secondaryColor: "#ffffff" },
  { id: "villarreal", name: "Villarreal", primaryColor: "#eab308", secondaryColor: "#1d4ed8" },
  { id: "sevilla", name: "Sevilla FC", primaryColor: "#ef4444", secondaryColor: "#ffffff" },
  { id: "valencia", name: "Valencia CF", primaryColor: "#ffffff", secondaryColor: "#f97316" },
  { id: "osasuna", name: "Osasuna", primaryColor: "#dc2626", secondaryColor: "#1e3a8a" },
  { id: "getafe", name: "Getafe CF", primaryColor: "#1d4ed8", secondaryColor: "#ffffff" },
  { id: "celta", name: "Celta Vigo", primaryColor: "#bae6fd", secondaryColor: "#ffffff" },
  { id: "mallorca", name: "RCD Mallorca", primaryColor: "#dc2626", secondaryColor: "#000000" },
  { id: "rayo", name: "Rayo Vallecano", primaryColor: "#ffffff", secondaryColor: "#dc2626" },
  { id: "laspalmas", name: "UD Las Palmas", primaryColor: "#eab308", secondaryColor: "#2563eb" },
  { id: "alaves", name: "Deportivo Alavés", primaryColor: "#2563eb", secondaryColor: "#ffffff" },
  { id: "leganes", name: "CD Leganés", primaryColor: "#2563eb", secondaryColor: "#ffffff" },
  { id: "valladolid", name: "Real Valladolid", primaryColor: "#a855f7", secondaryColor: "#ffffff" },
  { id: "espanyol", name: "RCD Espanyol", primaryColor: "#3b82f6", secondaryColor: "#ffffff" },

  { id: "inter", name: "Inter Milan", primaryColor: "#1d4ed8", secondaryColor: "#000000" },
  { id: "juventus", name: "Juventus", primaryColor: "#ffffff", secondaryColor: "#000000" },
  { id: "milan", name: "AC Milan", primaryColor: "#dc2626", secondaryColor: "#000000" },
  { id: "napoli", name: "Napoli", primaryColor: "#38bdf8", secondaryColor: "#ffffff" },
  { id: "atalanta", name: "Atalanta", primaryColor: "#1d4ed8", secondaryColor: "#000000" },
  { id: "roma", name: "AS Roma", primaryColor: "#9f1239", secondaryColor: "#f59e0b" },
  { id: "lazio", name: "Lazio", primaryColor: "#7dd3fc", secondaryColor: "#ffffff" },
  { id: "fiorentina", name: "Fiorentina", primaryColor: "#7e22ce", secondaryColor: "#ffffff" },
  { id: "bologna", name: "Bologna", primaryColor: "#dc2626", secondaryColor: "#1d4ed8" },
  { id: "torino", name: "Torino FC", primaryColor: "#881337", secondaryColor: "#ffffff" },
  { id: "monza", name: "Monza", primaryColor: "#dc2626", secondaryColor: "#ffffff" },
  { id: "genoa", name: "Genoa", primaryColor: "#dc2626", secondaryColor: "#1d4ed8" },
  { id: "lecce", name: "Lecce", primaryColor: "#facc15", secondaryColor: "#dc2626" },
  { id: "udinese", name: "Udinese", primaryColor: "#000000", secondaryColor: "#ffffff" },
  { id: "verona", name: "Hellas Verona", primaryColor: "#1d4ed8", secondaryColor: "#facc15" },
  { id: "empoli", name: "Empoli", primaryColor: "#1d4ed8", secondaryColor: "#ffffff" },
  { id: "cagliari", name: "Cagliari", primaryColor: "#dc2626", secondaryColor: "#1d4ed8" },
  { id: "parma", name: "Parma", primaryColor: "#facc15", secondaryColor: "#1d4ed8" },
  { id: "como", name: "Como 1907", primaryColor: "#3b82f6", secondaryColor: "#ffffff" },
  { id: "venezia", name: "Venezia", primaryColor: "#000000", secondaryColor: "#16a34a" },

  { id: "bayern", name: "Bayern Munich", primaryColor: "#dc2626", secondaryColor: "#ffffff" },
  { id: "leverkusen", name: "Bayer Leverkusen", primaryColor: "#dc2626", secondaryColor: "#000000" },
  { id: "dortmund", name: "Borussia Dortmund", primaryColor: "#facc15", secondaryColor: "#000000" },
  { id: "leipzig", name: "RB Leipzig", primaryColor: "#ffffff", secondaryColor: "#dc2626" },
  { id: "stuttgart", name: "VfB Stuttgart", primaryColor: "#ffffff", secondaryColor: "#dc2626" },
  { id: "frankfurt", name: "Eintracht Frankfurt", primaryColor: "#000000", secondaryColor: "#dc2626" },
  { id: "freiburg", name: "SC Freiburg", primaryColor: "#dc2626", secondaryColor: "#000000" },
  { id: "hoffenheim", name: "TSG Hoffenheim", primaryColor: "#1d4ed8", secondaryColor: "#ffffff" },
  { id: "heidenheim", name: "1. FC Heidenheim", primaryColor: "#dc2626", secondaryColor: "#1d4ed8" },
  { id: "werder", name: "Werder Bremen", primaryColor: "#16a34a", secondaryColor: "#ffffff" },
  { id: "wolfsburg", name: "VfL Wolfsburg", primaryColor: "#16a34a", secondaryColor: "#ffffff" },
  { id: "monchengladbach", name: "Borussia Mönchengladbach", primaryColor: "#ffffff", secondaryColor: "#000000" },
  { id: "union_berlin", name: "Union Berlin", primaryColor: "#dc2626", secondaryColor: "#facc15" },
  { id: "mainz", name: "FSV Mainz 05", primaryColor: "#dc2626", secondaryColor: "#ffffff" },
  { id: "bochum", name: "VfL Bochum", primaryColor: "#1d4ed8", secondaryColor: "#ffffff" },
  { id: "stpauli", name: "FC St. Pauli", primaryColor: "#78350f", secondaryColor: "#ffffff" },
  { id: "kiel", name: "Holstein Kiel", primaryColor: "#1d4ed8", secondaryColor: "#ffffff" },
  { id: "augsburg", name: "FC Augsburg", primaryColor: "#ffffff", secondaryColor: "#dc2626" },

  { id: "psg", name: "Paris Saint-Germain", primaryColor: "#1e3a8a", secondaryColor: "#dc2626" },
  { id: "monaco", name: "AS Monaco", primaryColor: "#dc2626", secondaryColor: "#ffffff" },
  { id: "marseille", name: "Marseille", primaryColor: "#ffffff", secondaryColor: "#38bdf8" },
  { id: "lille", name: "Lille OSC", primaryColor: "#dc2626", secondaryColor: "#1e3a8a" },
  { id: "lens", name: "RC Lens", primaryColor: "#dc2626", secondaryColor: "#facc15" },
  { id: "lyon", name: "Lyon", primaryColor: "#ffffff", secondaryColor: "#dc2626" },
  { id: "nice", name: "OGC Nice", primaryColor: "#dc2626", secondaryColor: "#000000" },
  { id: "rennes", name: "Stade Rennais", primaryColor: "#dc2626", secondaryColor: "#000000" },
  { id: "reims", name: "Stade de Reims", primaryColor: "#dc2626", secondaryColor: "#ffffff" },
  { id: "brest", name: "Stade Brestois 29", primaryColor: "#dc2626", secondaryColor: "#ffffff" },
  { id: "strasbourg", name: "RC Strasbourg", primaryColor: "#1d4ed8", secondaryColor: "#ffffff" },
  { id: "toulouse", name: "Toulouse FC", primaryColor: "#a855f7", secondaryColor: "#ffffff" },
  { id: "montpellier", name: "Montpellier HSC", primaryColor: "#1d4ed8", secondaryColor: "#f97316" },
  { id: "nantes", name: "FC Nantes", primaryColor: "#facc15", secondaryColor: "#16a34a" },
  { id: "angers", name: "Angers SCO", primaryColor: "#000000", secondaryColor: "#ffffff" },
  { id: "saint_etienne", name: "AS Saint-Étienne", primaryColor: "#16a34a", secondaryColor: "#ffffff" },
  { id: "le_havre", name: "Le Havre AC", primaryColor: "#38bdf8", secondaryColor: "#1e3a8a" },
  { id: "auxerre", name: "AJ Auxerre", primaryColor: "#ffffff", secondaryColor: "#1d4ed8" },
];

async function generateSvg(club) {
  // Use a classic generic football shield shape
  // With primary color as background, secondary as border and text.
  // The text will be the first 1-3 letters of the club name.
  
  const initials = club.name.split(' ').map(w => w[0]).join('').substring(0, 3).toUpperCase();
  
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
  <path d="M 20 20 L 180 20 L 180 100 C 180 160 100 190 100 190 C 100 190 20 160 20 100 Z" fill="${club.primaryColor}" stroke="${club.secondaryColor}" stroke-width="12"/>
  <text x="100" y="120" font-family="Arial, sans-serif" font-size="70" font-weight="900" fill="${club.secondaryColor}" text-anchor="middle" letter-spacing="2">${initials}</text>
</svg>`;
}

async function main() {
  let count = 0;
  for (const club of CLUBS) {
    const badgePath = path.join(BADGES_DIR, `${club.id}.svg`);
    // If it doesn't exist, generate it
    if (!fs.existsSync(badgePath)) {
      console.log(`Generating knockoff badge for ${club.name}...`);
      try {
        const svgCode = await generateSvg(club);
        fs.writeFileSync(badgePath, svgCode, 'utf8');
        console.log(`Saved ${club.id}.svg`);
        count++;
        // No delay needed for local generation
      } catch (e) {
        console.error(`Failed to generate ${club.name}: ${e.message}`);
      }
    }
  }
  console.log(`Finished generating ${count} knockoff badges.`);
}

main();
