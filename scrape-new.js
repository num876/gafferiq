const fs = require('fs');
const cheerio = require('cheerio');

const NEW_WIKI_MAP = {
  // Serbian SuperLiga (16)
  "redstar": "Red_Star_Belgrade",
  "partizan": "FK_Partizan",
  "tsc": "FK_TSC",
  "cukaricki": "FK_Čukarički",
  "vojvodina": "FK_Vojvodina",
  "radnicki1923": "FK_Radnički_1923",
  "novipazar": "FK_Novi_Pazar",
  "spartak": "FK_Spartak_Subotica",
  "napredak": "FK_Napredak_Kruševac",
  "radnickinis": "FK_Radnički_Niš",
  "imt": "FK_IMT",
  "javor": "FK_Javor_Ivanjica",
  "zeleznicar": "FK_Železničar_Pančevo",
  "radnik": "FK_Radnik_Surdulica",
  "vozdovac": "FK_Voždovac",
  "mladost": "FK_Mladost_Lučani",

  // Swiss Super League (12)
  "youngboys": "BSC_Young_Boys",
  "basel": "FC_Basel",
  "servette": "Servette_FC",
  "lugano": "FC_Lugano",
  "zurich": "FC_Zürich",
  "stgallen": "FC_St._Gallen",
  "winterthur": "FC_Winterthur",
  "luzern": "FC_Luzern",
  "yverdon": "Yverdon-Sport_FC",
  "lausanne": "FC_Lausanne-Sport",
  "grasshoppers": "Grasshopper_Club_Zürich",
  "sion": "FC_Sion",

  // Ukrainian Premier League (16)
  "shakhtar": "FC_Shakhtar_Donetsk",
  "dynamokyiv": "FC_Dynamo_Kyiv",
  "kryvbas": "FC_Kryvbas_Kryvyi_Rih",
  "dnipro1": "SC_Dnipro-1",
  "polissya": "FC_Polissya_Zhytomyr",
  "rukh": "FC_Rukh_Lviv",
  "lnz": "FC_LNZ_Cherkasy",
  "oleksandriya": "FC_Oleksandriya",
  "vorskla": "FC_Vorskla_Poltava",
  "zorya": "FC_Zorya_Luhansk",
  "kolos": "FC_Kolos_Kovalivka",
  "chornomorets": "FC_Chornomorets_Odesa",
  "veres": "NK_Veres_Rivne",
  "obolon": "FC_Obolon_Kyiv",
  "inhulets": "FC_Inhulets_Petrove",
  "karpaty": "FC_Karpaty_Lviv",

  // Danish Superliga (12)
  "midtjylland": "FC_Midtjylland",
  "brondby": "Brøndby_IF",
  "copenhagen": "F.C._Copenhagen",
  "nordsjaelland": "FC_Nordsjælland",
  "agf": "Aarhus_Gymnastikforening",
  "silkeborg": "Silkeborg_IF",
  "randers": "Randers_FC",
  "viborg": "Viborg_FF",
  "aab": "AaB_Fodbold",
  "sonderjyske": "Sønderjyske_Fodbold",
  "vejle": "Vejle_Boldklub",
  "lyngby": "Lyngby_Boldklub",

  // Allsvenskan (16)
  "malmo": "Malmö_FF",
  "elfsborg": "IF_Elfsborg",
  "hacken": "BK_Häcken",
  "djurgarden": "Djurgårdens_IF_Fotboll",
  "varnamo": "IFK_Värnamo",
  "kalmar": "Kalmar_FF",
  "hammarby": "Hammarby_Fotboll",
  "sirius": "IK_Sirius_Fotboll",
  "norrkoping": "IFK_Norrköping",
  "mjallby": "Mjällby_AIF",
  "aik": "AIK_Fotboll",
  "halmstad": "Halmstads_BK",
  "goteborg": "IFK_Göteborg",
  "brommapojkarna": "IF_Brommapojkarna",
  "gais": "GAIS",
  "vasteras": "Västerås_SK_Fotboll",

  // Russian Premier League (16)
  "zenit": "FC_Zenit_Saint_Petersburg",
  "krasnodar": "FC_Krasnodar",
  "dynamomoscow": "FC_Dynamo_Moscow",
  "lokomotiv": "FC_Lokomotiv_Moscow",
  "spartakmoscow": "FC_Spartak_Moscow",
  "cska": "PFC_CSKA_Moscow",
  "rostov": "FC_Rostov",
  "rubin": "FC_Rubin_Kazan",
  "krylia": "PFC_Krylia_Sovetov_Samara",
  "akhmat": "FC_Akhmat_Grozny",
  "fakel": "FC_Fakel_Voronezh",
  "orenburg": "FC_Orenburg",
  "parinn": "FC_Pari_Nizhny_Novgorod",
  "dynamomakhachkala": "FC_Dynamo_Makhachkala",
  "khimki": "FC_Khimki",
  "akron": "FC_Akron_Tolyatti",

  // Ekstraklasa (18)
  "jagiellonia": "Jagiellonia_Białystok",
  "slask": "Śląsk_Wrocław",
  "legia": "Legia_Warsaw",
  "pogon": "Pogoń_Szczecin",
  "lech": "Lech_Poznań",
  "gornik": "Górnik_Zabrze",
  "rakow": "Raków_Częstochowa",
  "zaglebie": "Zagłębie_Lubin",
  "widzew": "Widzew_Łódź",
  "piast": "Piast_Gliwice",
  "stal": "Stal_Mielec",
  "puszcza": "Puszcza_Niepołomice",
  "cracovia": "KS_Cracovia_(football)",
  "korona": "Korona_Kielce",
  "radomiak": "Radomiak_Radom",
  "lechia": "Lechia_Gdańsk",
  "gks": "GKS_Katowice",
  "motor": "Motor_Lublin",

  // Prva HNL (Croatia) (10)
  "dinamozagreb": "GNK_Dinamo_Zagreb",
  "rijeka": "HNK_Rijeka",
  "hajduk": "HNK_Hajduk_Split",
  "osijek": "NK_Osijek",
  "lokomotiva": "NK_Lokomotiva_Zagreb",
  "varazdin": "NK_Varaždin_(2012)",
  "gorica": "HNK_Gorica",
  "istra": "NK_Istra_1961",
  "slaven": "NK_Slaven_Belupo",
  "sibenik": "HNK_Šibenik"
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
    
    let players = [];

    // Approach 1: Look for rows with vcard agent
    $('tr.vcard.agent').each((i, el) => {
      const posRaw = $(el).find('.pos a').text() || $(el).find('.pos').text() || $(el).find('td').eq(0).text();
      let posClean = posRaw.trim().toUpperCase();
      let pos = POS_MAP[posClean] || "MID"; // default fallback

      const natRaw = $(el).find('.nat a').attr('title') || $(el).find('.nat img').attr('alt') || $(el).find('.nat').text();
      let nat = natRaw ? natRaw.trim() : "Unknown";

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
  const existingData = require('./src/config/realSquads.json');
  const clubIds = Object.keys(NEW_WIKI_MAP);
  
  console.log(`Starting scrape for ${clubIds.length} new clubs...`);
  
  for (let i = 0; i < clubIds.length; i++) {
    const clubId = clubIds[i];
    const wikiName = NEW_WIKI_MAP[clubId];
    console.log(`[${i+1}/${clubIds.length}] Fetching ${wikiName}...`);
    const squad = await scrapeSquad(clubId, wikiName);
    
    const unique = [];
    const seen = new Set();
    squad.forEach(p => {
      if (!seen.has(p.name)) {
        seen.add(p.name);
        unique.push(p);
      }
    });

    if (unique.length > 0) {
        existingData[clubId] = unique;
        console.log(`   -> Found ${unique.length} players for ${clubId}`);
    } else {
        console.log(`   -> WARNING: Found 0 players for ${clubId}`);
    }
    
    await new Promise(r => setTimeout(r, 200)); 
  }
  
  fs.writeFileSync('src/config/realSquads.json', JSON.stringify(existingData, null, 2));
  console.log('✅ Wrote all updated squads to src/config/realSquads.json');
}

run();
