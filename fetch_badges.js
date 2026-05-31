const fs = require('fs');

async function main() {
  const fileContent = fs.readFileSync('./src/config/seededData.ts', 'utf-8');
  const clubsMatch = fileContent.match(/export const CLUBS_DATA: Club\[\] = \[([\s\S]*?)\];/);
  
  if (!clubsMatch) {
    console.error("Could not find CLUBS_DATA");
    return;
  }
  
  let clubsSection = clubsMatch[1];
  
  // Find all club definitions
  const clubRegex = /\{\s*id:\s*"([^"]+)",\s*name:\s*"([^"]+)"[^\}]+\}/g;
  let match;
  const updates = [];

  while ((match = clubRegex.exec(clubsSection)) !== null) {
    const fullMatch = match[0];
    const id = match[1];
    const name = match[2];
    
    // Check if it already has logoUrl
    if (fullMatch.includes('logoUrl:')) continue;
    
    // search term adjustments for better hits
    let searchName = name;
    if (searchName === "FC Barcelona") searchName = "Barcelona";
    if (searchName === "AS Roma") searchName = "Roma";
    if (searchName === "AC Milan") searchName = "Milan";
    if (searchName === "Inter Milan") searchName = "Inter";
    if (searchName === "Olympique Lyonnais") searchName = "Lyon";
    if (searchName === "Olympique de Marseille") searchName = "Marseille";
    
    console.log(`Fetching badge for ${searchName}...`);
    try {
      const res = await fetch(`https://www.thesportsdb.com/api/v1/json/3/searchteams.php?t=${encodeURIComponent(searchName)}`);
      const data = await res.json();
      
      if (data && data.teams && data.teams.length > 0) {
        // Find the team that matches the sport "Soccer"
        const soccerTeam = data.teams.find(t => t.strSport === "Soccer" && t.strBadge);
        if (soccerTeam) {
          const logoUrl = soccerTeam.strBadge;
          updates.push({
            original: fullMatch,
            replacement: fullMatch.replace('reputation:', `logoUrl: "${logoUrl}", reputation:`)
          });
          console.log(`Found: ${logoUrl}`);
        } else {
          console.log(`No soccer badge found for ${name}`);
        }
      } else {
        console.log(`No team found for ${name}`);
      }
    } catch (e) {
      console.error(`Error fetching ${name}:`, e.message);
    }
    
    // small delay to avoid rate limit
    await new Promise(r => setTimeout(r, 100));
  }
  
  let newFileContent = fileContent;
  for (const update of updates) {
    newFileContent = newFileContent.replace(update.original, update.replacement);
  }
  
  // Update the Club interface
  if (!newFileContent.includes('logoUrl?: string;')) {
    newFileContent = newFileContent.replace('reputation: number;', 'logoUrl?: string;\n  reputation: number;');
  }
  
  fs.writeFileSync('./src/config/seededData.ts', newFileContent);
  console.log("Done updating seededData.ts");
}

main();
