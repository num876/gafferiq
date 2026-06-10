const fs = require('fs');
const path = require('path');

const clubsCode = fs.readFileSync(path.join(__dirname, '../src/config/seededData.ts'), 'utf8');

// A very hacky but effective way to extract the CLUBS_DATA array without compiling TS
const match = clubsCode.match(/export const CLUBS_DATA: Club\[\] = \[([\s\S]*?)\];/);
if (!match) throw new Error("Could not find CLUBS_DATA");

const clubsJsonStr = "[" + match[1]
  .replace(/(\w+):/g, '"$1":') // Quote keys
  .replace(/'/g, '"') // Replace single quotes
  .replace(/,(\s*[\]}])/g, '$1') // Remove trailing commas
  + "]";

let clubs = [];
try {
  // Extract id and name from the same club object to avoid misalignments
  const clubBlockMatches = [...clubsCode.matchAll(/\{\s*id:\s*["']([^"']+)["'],\s*name:\s*["']([^"']+)["']/g)];
  clubs = clubBlockMatches.map(m => ({ id: m[1], name: m[2] }));
} catch (e) {
  console.error("Failed to parse clubs", e);
}

const rawPlayers = JSON.parse(fs.readFileSync(path.join(__dirname, 'fc25_players.json'), 'utf8'));

// Normalisation function for fuzzy matching
const normalize = (str) => {
  return str.toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // remove accents
    .replace(/[^a-z0-9]/g, "") // remove spaces/punctuation
    .replace(/fc|cf|ud|rcd|afc|hotspur|hovealbion|clubde|demadrid/g, ""); // remove common suffixes
};

const internalSquads = {};
let mappedCount = 0;
let unmappedCount = 0;

rawPlayers.forEach(p => {
  const normClub = normalize(p.club);
  
  // Find matching club in our DB
  let matchedClub = clubs.find(c => normalize(c.name) === normClub);
  
  // Fallbacks
  const explicitAliases = {
    'manutd': 'manchesterunited',
    'mancity': 'manchestercity',
    'spurs': 'tottenhamhotspur',
    'parissg': 'parissaintgermain',
    'nottmforest': 'nottinghamforest',
    'lombardiafc': 'inter',
    'milanofc': 'milan',
    'latium': 'lazio',
    'bergamocalcio': 'atalanta',
    'ol': 'olympique',
    'om': 'marseille',
    'losclille': 'lille'
  };
  
  if (!matchedClub && explicitAliases[normClub]) {
    matchedClub = clubs.find(c => normalize(c.name) === explicitAliases[normClub] || normalize(c.id) === explicitAliases[normClub]);
  }
  
  if (matchedClub) {
    if (!internalSquads[matchedClub.id]) internalSquads[matchedClub.id] = [];
    
    // Map FC25 position to our 4 positional buckets
    let pos = "MID";
    const fcPos = p.position.toUpperCase();
    if (fcPos.includes("GK")) pos = "GK";
    else if (fcPos.includes("B") || fcPos.includes("WB")) pos = "DEF";
    else if (fcPos.includes("M")) pos = "MID";
    else if (fcPos.includes("W") || fcPos.includes("F") || fcPos.includes("ST")) pos = "ATT";

    internalSquads[matchedClub.id].push({
      id: Math.random().toString(36).substr(2, 9),
      name: p.name,
      fullName: p.fullName,
      position: pos,
      nationality: p.nationality,
      age: p.age,
      overall: p.overall,
      pace: p.pace,
      shooting: p.shooting,
      passing: p.passing,
      dribbling: p.dribbling,
      defending: p.defending,
      physical: p.physical
    });
    mappedCount++;
  } else {
    unmappedCount++;
  }
});

fs.writeFileSync(path.join(__dirname, '../src/config/realSquads.json'), JSON.stringify(internalSquads, null, 2));

console.log(`Mapped ${mappedCount} players. Unmapped: ${unmappedCount}. Generated realSquads.json`);
