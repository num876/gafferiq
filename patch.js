const fs = require('fs');
const path = require('path');

let content = fs.readFileSync('src/engine/simulator.ts', 'utf8').replace(/\r\n/g, '\n');

const getPitchSpotsCode = `
export type PitchSpot = { label: string; x: number; y: number; role: "GK" | "DEF" | "MID" | "ATT"; roleOptions: string[] };

export const getPitchSpots = (formation: string): PitchSpot[] => {
  const spots: PitchSpot[] = [];

  const defRoles = ["Central Defender", "Ball-Playing Defender", "No-Nonsense CB", "Libero"];
  const wbRoles = ["Wing-Back", "Full-Back", "Inverted Wing-Back"];
  const cdmRoles = ["Anchor Man", "Regista", "Ball-Winning Mid", "Deep-Lying Playmaker"];
  const midRoles = ["Box-to-Box", "Deep-Lying Playmaker", "Advanced Playmaker", "Ball-Winning Mid", "Mezzala"];
  const wideMidRoles = ["Winger", "Inverted Winger", "Wide Midfielder"];
  const attRoles = ["Advanced Forward", "Target Man", "False 9", "Poacher", "Complete Forward", "Pressing Forward"];
  const wideAttRoles = ["Inside Forward", "Winger", "Inverted Winger", "Raumdeuter"];

  spots.push({ label: "GK", x: 50, y: 90, role: "GK", roleOptions: ["Goalkeeper", "Sweeper Keeper"] });

  const defY = 72;
  const midY = 48;
  const attY = 20;

  switch (formation) {
    case "4-4-2":
      spots.push({ label:"LB", x:12, y:defY-5, role:"DEF", roleOptions:wbRoles });
      spots.push({ label:"CB", x:35, y:defY,   role:"DEF", roleOptions:defRoles });
      spots.push({ label:"CB", x:65, y:defY,   role:"DEF", roleOptions:defRoles });
      spots.push({ label:"RB", x:88, y:defY-5, role:"DEF", roleOptions:wbRoles });
      spots.push({ label:"LM", x:12, y:midY-5, role:"MID", roleOptions:wideMidRoles });
      spots.push({ label:"CM", x:37, y:midY+5, role:"MID", roleOptions:midRoles });
      spots.push({ label:"CM", x:63, y:midY+5, role:"MID", roleOptions:midRoles });
      spots.push({ label:"RM", x:88, y:midY-5, role:"MID", roleOptions:wideMidRoles });
      spots.push({ label:"ST", x:38, y:attY,   role:"ATT", roleOptions:attRoles });
      spots.push({ label:"ST", x:62, y:attY,   role:"ATT", roleOptions:attRoles });
      break;
    case "4-3-3":
      spots.push({ label:"LB", x:12, y:defY-5, role:"DEF", roleOptions:wbRoles });
      spots.push({ label:"CB", x:35, y:defY,   role:"DEF", roleOptions:defRoles });
      spots.push({ label:"CB", x:65, y:defY,   role:"DEF", roleOptions:defRoles });
      spots.push({ label:"RB", x:88, y:defY-5, role:"DEF", roleOptions:wbRoles });
      spots.push({ label:"CM", x:30, y:midY,   role:"MID", roleOptions:midRoles });
      spots.push({ label:"CM", x:50, y:midY+8, role:"MID", roleOptions:midRoles });
      spots.push({ label:"CM", x:70, y:midY,   role:"MID", roleOptions:midRoles });
      spots.push({ label:"LW", x:18, y:attY+5, role:"ATT", roleOptions:wideAttRoles });
      spots.push({ label:"ST", x:50, y:attY,   role:"ATT", roleOptions:attRoles });
      spots.push({ label:"RW", x:82, y:attY+5, role:"ATT", roleOptions:wideAttRoles });
      break;
    case "4-2-3-1":
      spots.push({ label:"LB",  x:12, y:defY-5, role:"DEF", roleOptions:wbRoles });
      spots.push({ label:"CB",  x:35, y:defY,   role:"DEF", roleOptions:defRoles });
      spots.push({ label:"CB",  x:65, y:defY,   role:"DEF", roleOptions:defRoles });
      spots.push({ label:"RB",  x:88, y:defY-5, role:"DEF", roleOptions:wbRoles });
      spots.push({ label:"CDM", x:38, y:midY+10, role:"MID", roleOptions:cdmRoles });
      spots.push({ label:"CDM", x:62, y:midY+10, role:"MID", roleOptions:cdmRoles });
      spots.push({ label:"LAM", x:20, y:midY-5, role:"MID", roleOptions:wideMidRoles });
      spots.push({ label:"CAM", x:50, y:midY-5, role:"MID", roleOptions:["Advanced Playmaker","False 9","Mezzala"] });
      spots.push({ label:"RAM", x:80, y:midY-5, role:"MID", roleOptions:wideMidRoles });
      spots.push({ label:"ST",  x:50, y:attY,   role:"ATT", roleOptions:attRoles });
      break;
    case "3-5-2":
      spots.push({ label:"CB",  x:25, y:defY,   role:"DEF", roleOptions:defRoles });
      spots.push({ label:"CB",  x:50, y:defY+3, role:"DEF", roleOptions:defRoles });
      spots.push({ label:"CB",  x:75, y:defY,   role:"DEF", roleOptions:defRoles });
      spots.push({ label:"LWB", x:10, y:midY+5, role:"MID", roleOptions:wbRoles });
      spots.push({ label:"CDM", x:50, y:midY+10, role:"MID", roleOptions:cdmRoles });
      spots.push({ label:"CM",  x:35, y:midY,   role:"MID", roleOptions:midRoles });
      spots.push({ label:"CM",  x:65, y:midY,   role:"MID", roleOptions:midRoles });
      spots.push({ label:"RWB", x:90, y:midY+5, role:"MID", roleOptions:wbRoles });
      spots.push({ label:"ST",  x:38, y:attY,   role:"ATT", roleOptions:attRoles });
      spots.push({ label:"ST",  x:62, y:attY,   role:"ATT", roleOptions:attRoles });
      break;
    case "5-3-2":
      spots.push({ label:"LWB", x:10, y:defY-10, role:"DEF", roleOptions:wbRoles });
      spots.push({ label:"CB",  x:28, y:defY,    role:"DEF", roleOptions:defRoles });
      spots.push({ label:"CB",  x:50, y:defY+3,  role:"DEF", roleOptions:defRoles });
      spots.push({ label:"CB",  x:72, y:defY,    role:"DEF", roleOptions:defRoles });
      spots.push({ label:"RWB", x:90, y:defY-10, role:"DEF", roleOptions:wbRoles });
      spots.push({ label:"CM",  x:30, y:midY,    role:"MID", roleOptions:midRoles });
      spots.push({ label:"CM",  x:50, y:midY+8,  role:"MID", roleOptions:midRoles });
      spots.push({ label:"CM",  x:70, y:midY,    role:"MID", roleOptions:midRoles });
      spots.push({ label:"ST",  x:38, y:attY,    role:"ATT", roleOptions:attRoles });
      spots.push({ label:"ST",  x:62, y:attY,    role:"ATT", roleOptions:attRoles });
      break;
    case "4-5-1":
      spots.push({ label:"LB",  x:12, y:defY-5, role:"DEF", roleOptions:wbRoles });
      spots.push({ label:"CB",  x:35, y:defY,   role:"DEF", roleOptions:defRoles });
      spots.push({ label:"CB",  x:65, y:defY,   role:"DEF", roleOptions:defRoles });
      spots.push({ label:"RB",  x:88, y:defY-5, role:"DEF", roleOptions:wbRoles });
      spots.push({ label:"LM",  x:12, y:midY-5, role:"MID", roleOptions:wideMidRoles });
      spots.push({ label:"CM",  x:35, y:midY+5, role:"MID", roleOptions:midRoles });
      spots.push({ label:"CDM", x:50, y:midY+12, role:"MID", roleOptions:cdmRoles });
      spots.push({ label:"CM",  x:65, y:midY+5, role:"MID", roleOptions:midRoles });
      spots.push({ label:"RM",  x:88, y:midY-5, role:"MID", roleOptions:wideMidRoles });
      spots.push({ label:"ST",  x:50, y:attY,   role:"ATT", roleOptions:attRoles });
      break;
    case "3-4-3":
      spots.push({ label:"CB",  x:25, y:defY,    role:"DEF", roleOptions:defRoles });
      spots.push({ label:"CB",  x:50, y:defY+3,  role:"DEF", roleOptions:defRoles });
      spots.push({ label:"CB",  x:75, y:defY,    role:"DEF", roleOptions:defRoles });
      spots.push({ label:"LM",  x:12, y:midY,    role:"MID", roleOptions:wbRoles });
      spots.push({ label:"CM",  x:38, y:midY+8,  role:"MID", roleOptions:midRoles });
      spots.push({ label:"CM",  x:62, y:midY+8,  role:"MID", roleOptions:midRoles });
      spots.push({ label:"RM",  x:88, y:midY,    role:"MID", roleOptions:wbRoles });
      spots.push({ label:"LW",  x:18, y:attY+5,  role:"ATT", roleOptions:wideAttRoles });
      spots.push({ label:"ST",  x:50, y:attY,    role:"ATT", roleOptions:attRoles });
      spots.push({ label:"RW",  x:82, y:attY+5,  role:"ATT", roleOptions:wideAttRoles });
      break;
    case "4-1-4-1":
      spots.push({ label:"LB",  x:12, y:defY-5, role:"DEF", roleOptions:wbRoles });
      spots.push({ label:"CB",  x:35, y:defY,   role:"DEF", roleOptions:defRoles });
      spots.push({ label:"CB",  x:65, y:defY,   role:"DEF", roleOptions:defRoles });
      spots.push({ label:"RB",  x:88, y:defY-5, role:"DEF", roleOptions:wbRoles });
      spots.push({ label:"CDM", x:50, y:midY+15, role:"MID", roleOptions:cdmRoles });
      spots.push({ label:"LM",  x:12, y:midY-5, role:"MID", roleOptions:wideMidRoles });
      spots.push({ label:"CM",  x:37, y:midY,   role:"MID", roleOptions:midRoles });
      spots.push({ label:"CM",  x:63, y:midY,   role:"MID", roleOptions:midRoles });
      spots.push({ label:"RM",  x:88, y:midY-5, role:"MID", roleOptions:wideMidRoles });
      spots.push({ label:"ST",  x:50, y:attY,   role:"ATT", roleOptions:attRoles });
      break;
    case "4-3-2-1":
      spots.push({ label:"LB",  x:12, y:defY-5, role:"DEF", roleOptions:wbRoles });
      spots.push({ label:"CB",  x:35, y:defY,   role:"DEF", roleOptions:defRoles });
      spots.push({ label:"CB",  x:65, y:defY,   role:"DEF", roleOptions:defRoles });
      spots.push({ label:"RB",  x:88, y:defY-5, role:"DEF", roleOptions:wbRoles });
      spots.push({ label:"CM",  x:30, y:midY+5, role:"MID", roleOptions:midRoles });
      spots.push({ label:"CM",  x:50, y:midY+8, role:"MID", roleOptions:midRoles });
      spots.push({ label:"CM",  x:70, y:midY+5, role:"MID", roleOptions:midRoles });
      spots.push({ label:"SS",  x:35, y:midY-8, role:"MID", roleOptions:["Advanced Playmaker","Mezzala","Inside Forward"] });
      spots.push({ label:"SS",  x:65, y:midY-8, role:"MID", roleOptions:["Advanced Playmaker","Mezzala","Inside Forward"] });
      spots.push({ label:"ST",  x:50, y:attY,   role:"ATT", roleOptions:attRoles });
      break;
    case "5-4-1":
      spots.push({ label:"LWB", x:10, y:defY-10, role:"DEF", roleOptions:wbRoles });
      spots.push({ label:"CB",  x:28, y:defY,    role:"DEF", roleOptions:defRoles });
      spots.push({ label:"CB",  x:50, y:defY+3,  role:"DEF", roleOptions:defRoles });
      spots.push({ label:"CB",  x:72, y:defY,    role:"DEF", roleOptions:defRoles });
      spots.push({ label:"RWB", x:90, y:defY-10, role:"DEF", roleOptions:wbRoles });
      spots.push({ label:"LM",  x:12, y:midY,    role:"MID", roleOptions:wideMidRoles });
      spots.push({ label:"CM",  x:37, y:midY+6,  role:"MID", roleOptions:midRoles });
      spots.push({ label:"CM",  x:63, y:midY+6,  role:"MID", roleOptions:midRoles });
      spots.push({ label:"RM",  x:88, y:midY,    role:"MID", roleOptions:wideMidRoles });
      spots.push({ label:"ST",  x:50, y:attY,    role:"ATT", roleOptions:attRoles });
      break;
    default:
      // 4-4-2 fallback
      spots.push({ label:"LB", x:12, y:defY-5, role:"DEF", roleOptions:wbRoles });
      spots.push({ label:"CB", x:35, y:defY,   role:"DEF", roleOptions:defRoles });
      spots.push({ label:"CB", x:65, y:defY,   role:"DEF", roleOptions:defRoles });
      spots.push({ label:"RB", x:88, y:defY-5, role:"DEF", roleOptions:wbRoles });
      spots.push({ label:"LM", x:12, y:midY-5, role:"MID", roleOptions:wideMidRoles });
      spots.push({ label:"CM", x:37, y:midY+5, role:"MID", roleOptions:midRoles });
      spots.push({ label:"CM", x:63, y:midY+5, role:"MID", roleOptions:midRoles });
      spots.push({ label:"RM", x:88, y:midY-5, role:"MID", roleOptions:wideMidRoles });
      spots.push({ label:"ST", x:38, y:attY,   role:"ATT", roleOptions:attRoles });
      spots.push({ label:"ST", x:62, y:attY,   role:"ATT", roleOptions:attRoles });
  }

  return spots;
};

export function autoSelectLineup(players: Player[], formation: string = "4-4-2"): { starters: Player[]; bench: Player[] } {
  const sorted = [...players].sort((a, b) => b.overall - a.overall);
  const spots = getPitchSpots(formation);
  
  const starters: Player[] = new Array(spots.length).fill(null);
  const usedIds = new Set<string>();

  // Helper to find the best available player for a spot based on truePosition and role
  const findBestFit = (spot: PitchSpot) => {
    // Exact match on true position
    let best = sorted.find(p => !usedIds.has(p.id) && (p.truePosition === spot.label || p.truePosition?.includes(spot.label)));
    
    // Fuzzy match based on general position
    if (!best) {
       best = sorted.find(p => !usedIds.has(p.id) && p.position === spot.role);
    }
    
    // Absolute fallback
    if (!best) {
       best = sorted.find(p => !usedIds.has(p.id));
    }
    return best;
  };

  for (let i = 0; i < spots.length; i++) {
    const player = findBestFit(spots[i]);
    if (player) {
      starters[i] = player;
      usedIds.add(player.id);
    }
  }

  const finalStarters = starters.filter(Boolean);

  // Fill in any blanks if we have less than 11 and players remaining
  while (finalStarters.length < 11 && sorted.length > finalStarters.length) {
    const nextPlayer = sorted.find(p => !usedIds.has(p.id));
    if (nextPlayer) {
      finalStarters.push(nextPlayer);
      usedIds.add(nextPlayer.id);
    } else break;
  }

  const bench = sorted.filter(p => !usedIds.has(p.id));
  return { starters: finalStarters.slice(0, 11), bench };
}
`;

const oldAutoSelectRegex = /\/\/ ─────────────────────────────────────────────\n\/\/ AUTO SELECT LINEUP\n\/\/ ─────────────────────────────────────────────\nexport function autoSelectLineup[\s\S]*?(?=\/\/ ─────────────────────────────────────────────\n\/\/ TACTICS RATING CALCULATOR)/;

if (content.match(oldAutoSelectRegex)) {
  content = content.replace(oldAutoSelectRegex, getPitchSpotsCode + '\n');
  fs.writeFileSync('src/engine/simulator.ts', content);
  console.log("Successfully replaced autoSelectLineup and added getPitchSpots.");
} else {
  console.log("Regex did not match!");
}
