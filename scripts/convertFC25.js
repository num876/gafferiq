const fs = require('fs');
const path = require('path');

const clubsCode = fs.readFileSync(path.join(__dirname, '../src/config/seededData.ts'), 'utf8');

let clubs = [];
try {
  // Extract id and name from the same club object to avoid misalignments
  const clubBlockMatches = [...clubsCode.matchAll(/\{\s*id:\s*["']([^"']+)["'],\s*name:\s*["']([^"']+)["']/g)];
  clubs = clubBlockMatches.map(m => ({ id: m[1], name: m[2] }));
} catch (e) {
  console.error("Failed to parse clubs", e);
}

// Normalisation function for fuzzy matching
const normalize = (str) => {
  if (!str) return "";
  return str.toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // remove accents
    .replace(/[^a-z0-9]/g, "") // remove spaces/punctuation
    .replace(/fc|cf|ud|rcd|afc|hotspur|hovealbion|clubde|demadrid/g, ""); // remove common suffixes
};

const internalSquads = {};
let mappedCount = 0;
let unmappedCount = 0;

function parseCSVRow(row) {
  let inQuotes = false;
  let cols = [];
  let current = '';
  for (let i = 0; i < row.length; i++) {
    const c = row[i];
    if (c === '"') {
      inQuotes = !inQuotes;
    } else if (c === ',' && !inQuotes) {
      cols.push(current);
      current = '';
    } else {
      current += c;
    }
  }
  cols.push(current);
  return cols;
}

const csvData = fs.readFileSync(path.join(__dirname, '../data/male_players.csv'), 'utf8');
const lines = csvData.split('\n');

for (let i = 1; i < lines.length; i++) {
  const line = lines[i].trim();
  if (!line) continue;
  const cols = parseCSVRow(line);
  if (cols.length < 51) continue;

  const name = cols[3];
  const overall = parseInt(cols[4]) || 50;
  const pace = parseInt(cols[5]) || 50;
  const shooting = parseInt(cols[6]) || 50;
  const passing = parseInt(cols[7]) || 50;
  const dribbling = parseInt(cols[8]) || 50;
  const defending = parseInt(cols[9]) || 50;
  const physical = parseInt(cols[10]) || 50;
  const positionStr = cols[40];
  const age = parseInt(cols[47]) || 20;
  const nationality = cols[48];
  const clubName = cols[50];

  const normClub = normalize(clubName);
  
  // Find matching club in our DB
  let matchedClub = clubs.find(c => normalize(c.name) === normClub);
  
  // Fallbacks
  const explicitAliases = {
    'manutd': 'manchesterunited',
    'mancity': 'manchestercity',
    'spurs': 'tottenhamhotspur',
    'parissg': 'parissaintgermain',
    'nottmforest': 'nottinghamforest',
    'lombardia': 'inter',
    'milano': 'milan',
    'latium': 'lazio',
    'bergamocalcio': 'atalanta',
    'ol': 'olympique',
    'om': 'marseille',
    'losclille': 'lille',
    'atletico': 'atleticomadrid',
    'athletic': 'athleticbilbao',
    'bayernmnchen': 'bayernmunich',
    'bayer04leverkusen': 'bayerleverkusen',
    'borussiadortmund': 'dortmund',
    'rbleipzig': 'leipzig',
    'vfb': 'stuttgart',
    'eintrachtfrankfurt': 'frankfurt',
    'scfreiburg': 'freiburg',
    'tsghoffenheim': 'hoffenheim',
    'werderbremen': 'werder',
    'vflwolfsburg': 'wolfsburg',
    'realsociedad': 'real_sociedad',
    'celtavigo': 'celta',
    'osasuna': 'osasuna',
    'villareal': 'villarreal'
  };
  
  if (!matchedClub && explicitAliases[normClub]) {
    matchedClub = clubs.find(c => normalize(c.name) === explicitAliases[normClub] || normalize(c.id) === explicitAliases[normClub]);
  }
  
  if (matchedClub) {
    if (!internalSquads[matchedClub.id]) internalSquads[matchedClub.id] = [];
    
    // Map FC25 position to our 4 positional buckets
    let pos = "MID";
    const fcPos = positionStr.toUpperCase();
    if (fcPos.includes("GK")) pos = "GK";
    else if (fcPos.includes("B") || fcPos.includes("WB")) pos = "DEF";
    else if (fcPos.includes("M")) pos = "MID";
    else if (fcPos.includes("W") || fcPos.includes("F") || fcPos.includes("ST")) pos = "ATT";

    internalSquads[matchedClub.id].push({
      id: Math.random().toString(36).substr(2, 9),
      name: name,
      fullName: name,
      position: pos,
      nationality: nationality,
      age: age,
      overall: overall,
      pace: pace,
      shooting: shooting,
      passing: passing,
      dribbling: dribbling,
      defending: defending,
      physical: physical
    });
    mappedCount++;
  } else {
    unmappedCount++;
  }
}

fs.writeFileSync(path.join(__dirname, '../src/config/realSquads.json'), JSON.stringify(internalSquads, null, 2));

console.log(`Mapped ${mappedCount} players. Unmapped: ${unmappedCount}. Generated realSquads.json`);
