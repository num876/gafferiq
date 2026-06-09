const fs = require('fs');

let c = fs.readFileSync('src/db/storage.ts', 'utf8');

// 1. Update ScoutTask interface
const oldScoutTask = `export interface ScoutTask {
  id: string;
  playerName: string;
  playerClub: string;
  playerClubId: string;
  playerRatingMin: number;
  playerRatingMax: number;
  playerAge: number;
  estimatedValue: number;
  position: string;
  scoutId: string;
  daysRemaining: number;
  completed: boolean;
}`;

const newScoutTask = `export interface ScoutTask {
  id: string;
  type?: "Player" | "Region";
  
  // Specific player assignment (Optional now)
  playerName?: string;
  playerClub?: string;
  playerClubId?: string;
  playerRatingMin?: number;
  playerRatingMax?: number;
  playerAge?: number;
  estimatedValue?: number;
  position?: string;
  
  // Region assignment
  region?: string;

  scoutId: string;
  daysRemaining: number;
  completed: boolean;
}`;

c = c.replace(oldScoutTask, newScoutTask);

// 2. Add playerKnowledge to SaveState
c = c.replace('scoutShortlist: string[]; // player IDs', 'scoutShortlist: string[]; // player IDs\n  playerKnowledge: Record<string, number>; // playerId -> knowledge level (0, 1, 2)');

// 3. Add SCOUTING_REGIONS and getRegionForLeague
const regionLogic = `

export const SCOUTING_REGIONS = [
  "UK & Ireland",
  "Western Europe", 
  "Southern Europe",
  "Eastern Europe",
  "Scandinavia",
  "Rest of World"
];

export function getRegionForLeague(league: string): string {
  switch (league) {
    case "EPL": return "UK & Ireland";
    case "Ligue 1": 
    case "Eredivisie": 
    case "Bundesliga": 
    case "Swiss Super League": return "Western Europe";
    case "La Liga":
    case "Serie A":
    case "Liga Portugal": return "Southern Europe";
    case "Serbian SuperLiga":
    case "Ukrainian Premier League":
    case "Russian Premier League":
    case "Ekstraklasa":
    case "Prva HNL": return "Eastern Europe";
    case "Danish Superliga":
    case "Allsvenskan": return "Scandinavia";
    default: return "Rest of World";
  }
}
`;
c = c.replace('export interface SaveState', regionLogic + '\nexport interface SaveState');

// 4. Update createNewSave to initialize playerKnowledge
// Find where it returns SaveState
const saveReturnStart = `const save: SaveState = {
    id: \`save_\${Date.now()}\`,`;

const saveReturnReplacement = `
  const playerKnowledge: Record<string, number> = {};
  
  // Initialize Knowledge
  players.forEach(p => {
    const pClub = clubs.find(c => c.id === p.clubId);
    const userClub = clubs.find(c => c.id === "club_1"); // user is assigned club_1 in createNewSave
    
    if (p.clubId === "club_1") {
      playerKnowledge[p.id] = 2; // Full knowledge of own players
    } else if (pClub && userClub && pClub.league === userClub.league) {
      playerKnowledge[p.id] = 1; // Basic knowledge of same league players
    } else {
      playerKnowledge[p.id] = 0; // Fog of War for others
    }
  });

  const save: SaveState = {
    id: \`save_\${Date.now()}\`,`;

c = c.replace(saveReturnStart, saveReturnReplacement);

// Inject playerKnowledge into the returned SaveState object
c = c.replace('scoutShortlist: [],', 'scoutShortlist: [],\n    playerKnowledge,');

fs.writeFileSync('src/db/storage.ts', c);
console.log("Patched storage.ts for Fog of War and Regions");
