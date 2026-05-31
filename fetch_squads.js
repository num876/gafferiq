const https = require('https');
const fs = require('fs');
const path = require('path');

const WIKI_MAP = {
  "mancity": "Manchester_City_F.C.",
  "arsenal": "Arsenal_F.C.",
  "liverpool": "Liverpool_F.C.",
  "chelsea": "Chelsea_F.C.",
  "manunited": "Manchester_United_F.C.",
  "tottenham": "Tottenham_Hotspur_F.C.",
  "newcastle": "Newcastle_United_F.C.",
  "astonvilla": "Aston_Villa_F.C.",
  "westham": "West_Ham_United_F.C.",
  "brighton": "Brighton_%26_Hove_Albion_F.C.",
  "crystalpalace": "Crystal_Palace_F.C.",
  "fulham": "Fulham_F.C.",
  "bournemouth": "AFC_Bournemouth",
  "brentford": "Brentford_F.C.",
  "everton": "Everton_F.C.",
  "wolves": "Wolverhampton_Wanderers_F.C.",
  "nottingham": "Nottingham_Forest_F.C.",
  "leicester": "Leicester_City_F.C.",
  "ipswich": "Ipswich_Town_F.C.",
  "southampton": "Southampton_F.C.",
  "realmadrid": "Real_Madrid_CF",
  "barcelona": "FC_Barcelona",
  "atletico": "Atlético_Madrid",
  "real_sociedad": "Real_Sociedad",
  "athletic_bilbao": "Athletic_Club",
  "girona": "Girona_FC",
  "betis": "Real_Betis",
  "villarreal": "Villarreal_CF",
  "sevilla": "Sevilla_FC",
  "valencia": "Valencia_CF",
  "osasuna": "CA_Osasuna",
  "getafe": "Getafe_CF",
  "celta": "RC_Celta_de_Vigo",
  "mallorca": "RCD_Mallorca",
  "rayo": "Rayo_Vallecano",
  "laspalmas": "UD_Las_Palmas",
  "alaves": "Deportivo_Alavés",
  "leganes": "CD_Leganés",
  "valladolid": "Real_Valladolid",
  "espanyol": "RCD_Espanyol",
  "inter": "Inter_Milan",
  "juventus": "Juventus_FC",
  "milan": "AC_Milan",
  "napoli": "SSC_Napoli",
  "atalanta": "Atalanta_BC",
  "roma": "AS_Roma",
  "lazio": "SS_Lazio",
  "fiorentina": "ACF_Fiorentina",
  "bologna": "Bologna_FC_1909",
  "torino": "Torino_FC",
  "monza": "AC_Monza",
  "genoa": "Genoa_CFC",
  "lecce": "US_Lecce",
  "udinese": "Udinese_Calcio",
  "verona": "Hellas_Verona_FC",
  "empoli": "Empoli_FC",
  "cagliari": "Cagliari_Calcio",
  "parma": "Parma_Calcio_1913",
  "como": "Como_1907",
  "venezia": "Venezia_FC",
  "bayern": "FC_Bayern_Munich",
  "leverkusen": "Bayer_04_Leverkusen",
  "dortmund": "Borussia_Dortmund",
  "leipzig": "RB_Leipzig",
  "stuttgart": "VfB_Stuttgart",
  "frankfurt": "Eintracht_Frankfurt",
  "freiburg": "SC_Freiburg",
  "hoffenheim": "TSG_1899_Hoffenheim",
  "heidenheim": "1._FC_Heidenheim",
  "werder": "SV_Werder_Bremen",
  "wolfsburg": "VfL_Wolfsburg",
  "monchengladbach": "Borussia_Mönchengladbach",
  "union_berlin": "1._FC_Union_Berlin",
  "mainz": "1._FSV_Mainz_05",
  "bochum": "VfL_Bochum",
  "stpauli": "FC_St._Pauli",
  "kiel": "Holstein_Kiel",
  "augsburg": "FC_Augsburg",
  "psg": "Paris_Saint-Germain_F.C.",
  "monaco": "AS_Monaco_FC",
  "marseille": "Olympique_de_Marseille",
  "lille": "Lille_OSC",
  "lens": "RC_Lens",
  "lyon": "Olympique_Lyonnais",
  "nice": "OGC_Nice",
  "rennes": "Stade_Rennais_F.C.",
  "reims": "Stade_de_Reims",
  "brest": "Stade_Brestois_29",
  "strasbourg": "RC_Strasbourg_Alsace",
  "toulouse": "Toulouse_FC",
  "montpellier": "Montpellier_HSC",
  "nantes": "FC_Nantes",
  "angers": "Angers_SCO",
  "saint_etienne": "AS_Saint-Étienne",
  "le_havre": "Le_Havre_AC",
  "auxerre": "AJ_Auxerre"
};

const OUTPUT_FILE = path.join(__dirname, 'src', 'config', 'realSquads.json');

function fetchWikiContent(title) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'en.wikipedia.org',
      path: `/w/api.php?action=query&prop=revisions&rvprop=content&titles=${encodeURIComponent(title)}&format=json`,
      headers: { 'User-Agent': 'GafferIQ/1.0 (contact@gafferiq.com)' }
    };

    https.get(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          const pages = json.query.pages;
          const pageId = Object.keys(pages)[0];
          if (pageId === '-1') {
            resolve(''); // Page not found
          } else {
            resolve(pages[pageId].revisions[0]['*']);
          }
        } catch (e) {
          resolve('');
        }
      });
    }).on('error', reject);
  });
}

// Generate random ID
function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

function parseWikitext(content, clubId) {
  // match anything like {{fs player|...}} or {{football squad player|...}}
  const playerRegex = /\{\{\s*(?:fs player|football squad player)\s*\|([^}]+)\}\}/gi;
  const players = [];
  
  let match;
  while ((match = playerRegex.exec(content)) !== null) {
    const props = match[1].split('|');
    let name = '';
    let pos = '';
    
    for (const prop of props) {
      const [k, ...vParts] = prop.split('=');
      if (!vParts.length) continue;
      const key = k.trim().toLowerCase();
      const val = vParts.join('=').trim();
      
      if (key === 'name' || key === 'n') {
        name = val;
      } else if (key === 'pos' || key === 'p') {
        pos = val;
      }
    }
    
    // clean name e.g. [[Martin Ødegaard|Ødegaard]] -> Ødegaard or [[David Raya]] -> David Raya
    let cleanName = name;
    if (name.includes('[[')) {
      cleanName = name.split('|').pop().replace(/\[\[|\]\]/g, '').trim();
    }
    cleanName = cleanName.replace(/<[^>]*>?/gm, ''); // remove any HTML tags like <br> or <ref>

    if (pos === 'MF') pos = 'MID';
    if (pos === 'DF') pos = 'DEF';
    if (pos === 'FW') pos = 'ATT';

    if (cleanName && ['GK', 'DEF', 'MID', 'ATT'].includes(pos)) {
      players.push({
        id: uuidv4(),
        name: cleanName,
        position: pos,
        baseOverall: Math.floor(Math.random() * 10) + 75, 
        age: Math.floor(Math.random() * 16) + 18,
        nationality: "🏳️", // Generic flag
        nationalityFlag: "🏳️"
      });
    }
  }
  return players;
}

async function main() {
  const allSquads = {};
  const clubIds = Object.keys(WIKI_MAP);
  
  for (let i = 0; i < clubIds.length; i++) {
    const clubId = clubIds[i];
    const title = WIKI_MAP[clubId];
    console.log(`Fetching ${title}... (${i+1}/${clubIds.length})`);
    
    const content = await fetchWikiContent(title);
    if (!content) {
      console.log(`  -> FAILED to find Wikipedia page.`);
      allSquads[clubId] = [];
      continue;
    }
    
    const players = parseWikitext(content, clubId);
    console.log(`  -> Parsed ${players.length} players.`);
    allSquads[clubId] = players;
    
    // tiny delay
    await new Promise(r => setTimeout(r, 200));
  }

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(allSquads, null, 2), 'utf8');
  console.log(`\nSuccessfully wrote ${OUTPUT_FILE}`);
}

main();
