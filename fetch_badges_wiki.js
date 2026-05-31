const fs = require('fs');

async function main() {
  const fileContent = fs.readFileSync('./src/config/seededData.ts', 'utf-8');
  const clubsMatch = fileContent.match(/export const CLUBS_DATA: Club\[\] = \[([\s\S]*?)\];/);
  
  if (!clubsMatch) return;
  
  let clubsSection = clubsMatch[1];
  const clubRegex = /\{\s*id:\s*"([^"]+)",\s*name:\s*"([^"]+)"[^\}]+\}/g;
  let match;
  const updates = [];

  while ((match = clubRegex.exec(clubsSection)) !== null) {
    const fullMatch = match[0];
    const name = match[2];
    
    // Check if it already has a working logoUrl from the first script
    if (fullMatch.includes('logoUrl: "http')) {
      console.log(`Skipping ${name}, already has logo.`);
      continue;
    }

    let searchName = name;
    // Map to wiki page titles
    if (searchName === "Manchester City") searchName = "Manchester City F.C.";
    else if (searchName === "Arsenal") searchName = "Arsenal F.C.";
    else if (searchName === "Liverpool") searchName = "Liverpool F.C.";
    else if (searchName === "Chelsea") searchName = "Chelsea F.C.";
    else if (searchName === "Manchester United") searchName = "Manchester United F.C.";
    else if (searchName === "Tottenham Hotspur") searchName = "Tottenham Hotspur F.C.";
    else if (searchName === "Newcastle United") searchName = "Newcastle United F.C.";
    else if (searchName === "Aston Villa") searchName = "Aston Villa F.C.";
    else if (searchName === "West Ham United") searchName = "West Ham United F.C.";
    else if (searchName === "Brighton & Hove Albion") searchName = "Brighton & Hove Albion F.C.";
    else if (searchName === "Crystal Palace") searchName = "Crystal Palace F.C.";
    else if (searchName === "Fulham") searchName = "Fulham F.C.";
    else if (searchName === "Bournemouth") searchName = "A.F.C. Bournemouth";
    else if (searchName === "Brentford") searchName = "Brentford F.C.";
    else if (searchName === "Everton") searchName = "Everton F.C.";
    else if (searchName === "Wolverhampton Wanderers") searchName = "Wolverhampton Wanderers F.C.";
    else if (searchName === "Nottingham Forest") searchName = "Nottingham Forest F.C.";
    else if (searchName === "Leicester City") searchName = "Leicester City F.C.";
    else if (searchName === "Ipswich Town") searchName = "Ipswich Town F.C.";
    else if (searchName === "Southampton") searchName = "Southampton F.C.";
    
    else if (searchName === "Real Madrid") searchName = "Real Madrid CF";
    else if (searchName === "FC Barcelona") searchName = "FC Barcelona";
    else if (searchName === "Atlético Madrid") searchName = "Atlético Madrid";
    else if (searchName === "Real Sociedad") searchName = "Real Sociedad";
    else if (searchName === "Athletic Club Bilbao") searchName = "Athletic Bilbao";
    
    else if (searchName === "Inter Milan") searchName = "Inter Milan";
    else if (searchName === "Juventus") searchName = "Juventus F.C.";
    else if (searchName === "AC Milan") searchName = "AC Milan";
    else if (searchName === "Napoli") searchName = "SSC Napoli";
    else if (searchName === "Atalanta") searchName = "Atalanta BC";
    else if (searchName === "AS Roma") searchName = "AS Roma";
    else if (searchName === "Lazio") searchName = "SS Lazio";
    
    else if (searchName === "Bayern Munich") searchName = "FC Bayern Munich";
    else if (searchName === "Bayer Leverkusen") searchName = "Bayer 04 Leverkusen";
    else if (searchName === "Borussia Dortmund") searchName = "Borussia Dortmund";
    else if (searchName === "RB Leipzig") searchName = "RB Leipzig";
    
    else if (searchName === "Paris Saint-Germain") searchName = "Paris Saint-Germain F.C.";
    else if (searchName === "AS Monaco") searchName = "AS Monaco FC";
    else if (searchName === "Olympique de Marseille") searchName = "Olympique de Marseille";
    else if (searchName === "Lille OSC") searchName = "Lille OSC";
    else if (searchName === "Olympique Lyonnais") searchName = "Olympique Lyonnais";
    
    // Default fallback
    if (searchName === name) searchName = name + " F.C.";
    
    console.log(`Fetching wiki for ${searchName}...`);
    try {
      const res = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(searchName)}`, {
        headers: { 'User-Agent': 'GafferIQ/1.0 (contact@gafferiq.com) Node.js/18' }
      });
      const data = await res.json();
      
      if (data && data.thumbnail && data.thumbnail.source) {
        const logoUrl = data.thumbnail.source;
        updates.push({
          original: fullMatch,
          replacement: fullMatch.includes('logoUrl:') 
            ? fullMatch.replace(/logoUrl:\s*"[^"]*",\s*reputation:/, `logoUrl: "${logoUrl}", reputation:`)
            : fullMatch.replace('reputation:', `logoUrl: "${logoUrl}", reputation:`)
        });
        console.log(`Found: ${logoUrl}`);
      } else {
        console.log(`No wiki thumbnail for ${name}`);
      }
    } catch (e) {
      console.error(`Error fetching ${name}:`, e.message);
    }
  }
  
  let newFileContent = fileContent;
  for (const update of updates) {
    newFileContent = newFileContent.replace(update.original, update.replacement);
  }
  
  fs.writeFileSync('./src/config/seededData.ts', newFileContent);
  console.log("Done updating seededData.ts from Wiki");
}

main();
