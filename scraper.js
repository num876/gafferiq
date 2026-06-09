const fs = require('fs');
const cheerio = require('cheerio');

// Map of our game's club IDs to their Wikipedia page titles
const CLUB_WIKI_MAP = {
  // EPL
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

  // La Liga
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

  // Serie A
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

  // Bundesliga
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

  // Ligue 1
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
  "auxerre": "AJ_Auxerre",

  // Eredivisie (New)
  "psv": "PSV_Eindhoven",
  "feyenoord": "Feyenoord",
  "ajax": "AFC_Ajax",
  "az": "AZ_Alkmaar",
  "twente": "FC_Twente",
  "sparta": "Sparta_Rotterdam",
  "utrecht": "FC_Utrecht",
  "heerenveen": "SC_Heerenveen",
  "goaheadeagles": "Go_Ahead_Eagles",
  "nec": "NEC_Nijmegen",
  "pec": "PEC_Zwolle",
  "fortuna": "Fortuna_Sittard",
  "heracles": "Heracles_Almelo",
  "rkc": "RKC_Waalwijk",
  "almere": "Almere_City_FC",
  "willemii": "Willem_II_(football_club)",
  "nac": "NAC_Breda",
  "groningen": "FC_Groningen",

  // Liga Portugal (New)
  "sporting": "Sporting_CP",
  "benfica": "S.L._Benfica",
  "porto": "FC_Porto",
  "braga": "S.C._Braga",
  "guimaraes": "Vitória_S.C.",
  "moreirense": "Moreirense_F.C.",
  "arouca": "F.C._Arouca",
  "famalicao": "F.C._Famalicão",
  "casapia": "Casa_Pia_A.C.",
  "farense": "S.C._Farense",
  "rioave": "Rio_Ave_F.C.",
  "gilvicente": "Gil_Vicente_F.C.",
  "estoril": "G.D._Estoril_Praia",
  "estrela": "C.F._Estrela_da_Amadora",
  "boavista": "Boavista_F.C.",
  "santaclara": "C.D._Santa_Clara",
  "nacional": "C.D._Nacional",
  "avs": "AVS_Futebol_SAD"
};

const POS_MAP = {
  "GK": "GK",
  "DF": "DEF",
  "MF": "MID",
  "FW": "ATT",
  "Goalkeeper": "GK",
  "Defender": "DEF",
  "Midfielder": "MID",
  "Forward": "ATT"
};

async function scrapeSquad(clubId, wikiUrl) {
  try {
    const res = await fetch(`https://en.wikipedia.org/wiki/${wikiUrl}`);
    if (!res.ok) throw new Error(`Failed to fetch ${wikiUrl}`);
    const html = await res.text();
    const $ = cheerio.load(html);
    
    // Most Wikipedia team pages have a "First-team squad" section
    // followed by a table with class "vcard agent" rows or similar.
    let players = [];

    // Approach 1: Look for rows with vcard agent
    $('tr.vcard.agent').each((i, el) => {
      const posRaw = $(el).find('.pos a').text() || $(el).find('.pos').text() || $(el).find('td').eq(0).text();
      let posClean = posRaw.trim().toUpperCase();
      let pos = POS_MAP[posClean] || "MID"; // default fallback

      const natRaw = $(el).find('.nat a').attr('title') || $(el).find('.nat img').attr('alt') || $(el).find('.nat').text();
      let nat = natRaw ? natRaw.trim() : "Unknown";

      // Name is usually in a th with class "fn" or td with class "fn"
      let nameRaw = $(el).find('.fn a').text() || $(el).find('.fn').text();
      if (!nameRaw) {
         nameRaw = $(el).find('td:nth-child(4) a').text() || $(el).find('td:nth-child(4)').text();
      }
      let name = nameRaw.replace(/\(.*\)/g, '').trim();

      if (name && pos) {
        players.push({
          id: `${clubId}_r_${players.length + 1}`,
          name: name,
          position: pos,
          nationality: nat
        });
      }
    });

    return players;
  } catch (err) {
    console.error(`Error scraping ${clubId}:`, err.message);
    return [];
  }
}

async function run() {
  const allSquads = {};
  const clubIds = Object.keys(CLUB_WIKI_MAP);
  
  console.log(`Starting scrape for ${clubIds.length} clubs...`);
  
  for (let i = 0; i < clubIds.length; i++) {
    const clubId = clubIds[i];
    const wikiName = CLUB_WIKI_MAP[clubId];
    console.log(`[${i+1}/${clubIds.length}] Fetching ${wikiName}...`);
    const squad = await scrapeSquad(clubId, wikiName);
    
    // Deduplicate just in case Wikipedia repeats tables
    const unique = [];
    const seen = new Set();
    squad.forEach(p => {
      if (!seen.has(p.name)) {
        seen.add(p.name);
        unique.push(p);
      }
    });

    if (unique.length > 0) {
        allSquads[clubId] = unique;
        console.log(`   -> Found ${unique.length} players for ${clubId}`);
    } else {
        console.log(`   -> WARNING: Found 0 players for ${clubId}`);
    }
    
    // Small delay to be respectful to Wikipedia
    await new Promise(r => setTimeout(r, 200)); 
  }
  
  fs.writeFileSync('src/config/realSquads.json', JSON.stringify(allSquads, null, 2));
  console.log('✅ Wrote all updated squads to src/config/realSquads.json');
}

run();
