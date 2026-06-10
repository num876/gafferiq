const fs = require('fs');
const path = require('path');

// Extract clubs from seededData.ts using simple regex, since we can't easily require ts files in raw node without ts-node
const seededDataContent = fs.readFileSync(path.join(__dirname, '../src/config/seededData.ts'), 'utf-8');
const clubsMatch = seededDataContent.match(/export const CLUBS_DATA: Club\[\] = \[([\s\S]*?)\];/);

let internalClubs = [];
if (clubsMatch) {
  const clubLines = clubsMatch[1].split('\n');
  for (const line of clubLines) {
    if (line.includes('{ id:')) {
      const idMatch = line.match(/id: "([^"]+)"/);
      const nameMatch = line.match(/name: "([^"]+)"/);
      const shortNameMatch = line.match(/shortName: "([^"]+)"/);
      
      if (idMatch && nameMatch) {
        internalClubs.push({
          id: idMatch[1],
          name: nameMatch[1],
          shortName: shortNameMatch ? shortNameMatch[1] : nameMatch[1]
        });
      }
    }
  }
}

console.log(`Found ${internalClubs.length} internal clubs.`);

// Read players.json
let allPlayers = [];
try {
  allPlayers = JSON.parse(fs.readFileSync(path.join(__dirname, '../players.json'), 'utf-8'));
  console.log(`Read ${allPlayers.length} players from players.json.`);
} catch (err) {
  console.error("Could not read players.json. Ensure scrape.js has finished running.");
  process.exit(1);
}

// Convert position to GK, DEF, MID, ATT
function mapPosition(pos) {
  if (!pos) return "MID";
  const p = pos.toLowerCase();
  if (p.includes("goalkeeper")) return "GK";
  if (p.includes("back") || p.includes("defender")) return "DEF";
  if (p.includes("midfield") || p.includes("wing")) return "MID";
  if (p.includes("forward") || p.includes("striker") || p.includes("attacker")) return "ATT";
  return "MID";
}

// Map clubs
const realSquads = {};

for (const player of allPlayers) {
  // Try to find the matching internal club
  const clubName = player.club.toLowerCase().replace(' fc', '').replace(' cf', '').replace(' as', '').trim();
  
  let matchedClub = internalClubs.find(c => c.name.toLowerCase() === clubName || c.shortName.toLowerCase() === clubName);
  
  // Fuzzy fallback
  if (!matchedClub) {
    matchedClub = internalClubs.find(c => 
      c.name.toLowerCase().includes(clubName) || 
      clubName.includes(c.name.toLowerCase()) ||
      c.shortName.toLowerCase().includes(clubName) ||
      clubName.includes(c.shortName.toLowerCase())
    );
  }
  
  if (matchedClub) {
    if (!realSquads[matchedClub.id]) {
      realSquads[matchedClub.id] = [];
    }
    
    // Calculate age from dateOfBirth
    let age = 25;
    if (player.dateOfBirth && player.dateOfBirth !== "N/A") {
      const dob = new Date(player.dateOfBirth);
      const ageDiffMs = Date.now() - dob.getTime();
      const ageDate = new Date(ageDiffMs);
      age = Math.abs(ageDate.getUTCFullYear() - 1970);
    }

    realSquads[matchedClub.id].push({
      id: `${matchedClub.id}_api_${player.id}`,
      name: player.name,
      position: mapPosition(player.position),
      nationality: player.nationality !== "N/A" ? player.nationality : "Unknown",
      age: age
    });
  }
}

const outputPath = path.join(__dirname, '../src/config/realSquads.json');
fs.writeFileSync(outputPath, JSON.stringify(realSquads, null, 2));

console.log(`Successfully generated realSquads.json at ${outputPath}`);
console.log(`Mapped players for ${Object.keys(realSquads).length} clubs.`);
