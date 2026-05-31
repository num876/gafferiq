const fs = require('fs');
const path = require('path');

const BADGES_DIR = path.join(__dirname, 'public', 'badges');
if (!fs.existsSync(BADGES_DIR)) fs.mkdirSync(BADGES_DIR, { recursive: true });

const CLUB_BADGE_URLS = {
  mancity: "https://upload.wikimedia.org/wikipedia/en/e/eb/Manchester_City_FC_badge.svg",
  arsenal: "https://upload.wikimedia.org/wikipedia/en/5/53/Arsenal_FC.svg",
  liverpool: "https://upload.wikimedia.org/wikipedia/en/0/0c/Liverpool_FC.svg",
  chelsea: "https://upload.wikimedia.org/wikipedia/en/c/cc/Chelsea_FC.svg",
  manunited: "https://upload.wikimedia.org/wikipedia/en/7/7a/Manchester_United_FC_crest.svg",
  tottenham: "https://upload.wikimedia.org/wikipedia/en/b/b4/Tottenham_Hotspur.svg",
  newcastle: "https://upload.wikimedia.org/wikipedia/en/5/56/Newcastle_United_Logo.svg",
  astonvilla: "https://upload.wikimedia.org/wikipedia/en/9/9a/Aston_Villa_FC_new_crest.svg",
  westham: "https://upload.wikimedia.org/wikipedia/en/c/c2/West_Ham_United_FC_logo.svg",
  brighton: "https://upload.wikimedia.org/wikipedia/en/f/fd/Brighton_%26_Hove_Albion_logo.svg",
  crystalpalace: "https://upload.wikimedia.org/wikipedia/en/a/a2/Crystal_Palace_FC_logo_%282022%29.svg",
  fulham: "https://upload.wikimedia.org/wikipedia/en/e/eb/Fulham_FC_%28shield%29.svg",
  bournemouth: "https://upload.wikimedia.org/wikipedia/en/e/e5/AFC_Bournemouth_%282013%29.svg",
  brentford: "https://upload.wikimedia.org/wikipedia/en/2/2a/Brentford_FC_crest.svg",
  everton: "https://upload.wikimedia.org/wikipedia/en/7/7c/Everton_FC_logo.svg",
  wolves: "https://upload.wikimedia.org/wikipedia/en/f/fc/Wolverhampton_Wanderers.svg",
  nottingham: "https://upload.wikimedia.org/wikipedia/en/e/e5/Nottingham_Forest_F.C._logo.svg",
  leicester: "https://upload.wikimedia.org/wikipedia/en/2/2d/Leicester_City_crest.svg",
  ipswich: "https://upload.wikimedia.org/wikipedia/en/4/43/Ipswich_Town.svg",
  southampton: "https://upload.wikimedia.org/wikipedia/en/c/c9/FC_Southampton.svg",
  realmadrid: "https://upload.wikimedia.org/wikipedia/en/5/56/Real_Madrid_CF.svg",
  barcelona: "https://upload.wikimedia.org/wikipedia/en/4/47/FC_Barcelona_%28crest%29.svg",
  atletico: "https://upload.wikimedia.org/wikipedia/en/c/c1/Atletico_Madrid_logo.svg",
  real_sociedad: "https://upload.wikimedia.org/wikipedia/en/f/f1/Real_Sociedad_logo.svg",
  athletic_bilbao: "https://upload.wikimedia.org/wikipedia/en/9/98/Club_Athletic_Bilbao_logo.svg",
  girona: "https://upload.wikimedia.org/wikipedia/en/2/2f/Girona_FC_New_Logo.svg",
  betis: "https://upload.wikimedia.org/wikipedia/en/1/13/Real_betis_logo.svg",
  villarreal: "https://upload.wikimedia.org/wikipedia/en/b/b9/Villarreal_CF_logo-en.svg",
  sevilla: "https://upload.wikimedia.org/wikipedia/en/3/3b/Sevilla_FC_logo.svg",
  valencia: "https://upload.wikimedia.org/wikipedia/en/c/ce/Valenciacf.svg",
  osasuna: "https://upload.wikimedia.org/wikipedia/en/d/db/CA_Osasuna_logo.svg",
  getafe: "https://upload.wikimedia.org/wikipedia/en/4/46/Getafe_logo.svg",
  celta: "https://upload.wikimedia.org/wikipedia/en/1/12/RC_Celta_de_Vigo_logo.svg",
  mallorca: "https://upload.wikimedia.org/wikipedia/en/e/e0/RCD_Mallorca.svg",
  rayo: "https://upload.wikimedia.org/wikipedia/en/1/12/Rayo_Vallecano_logo.svg",
  laspalmas: "https://upload.wikimedia.org/wikipedia/en/5/5e/UD_Las_Palmas_logo.svg",
  alaves: "https://upload.wikimedia.org/wikipedia/en/f/f8/Deportivo_Alav%C3%A9s_logo_%282020%29.svg",
  leganes: "https://upload.wikimedia.org/wikipedia/en/6/6e/CD_Legan%C3%A9s_logo.svg",
  valladolid: "https://upload.wikimedia.org/wikipedia/en/6/6e/Real_Valladolid_Logo.svg",
  espanyol: "https://upload.wikimedia.org/wikipedia/en/d/d5/RCD_Espanyol_logo.svg",
  inter: "https://upload.wikimedia.org/wikipedia/commons/0/05/FC_Internazionale_Milano_2021.svg",
  juventus: "https://upload.wikimedia.org/wikipedia/commons/e/ed/Juventus_FC_-_logo_black_%28Italy%2C_2020%29.svg",
  milan: "https://upload.wikimedia.org/wikipedia/commons/d/d0/Logo_of_AC_Milan.svg",
  napoli: "https://upload.wikimedia.org/wikipedia/commons/2/2d/SSC_Neapel.svg",
  atalanta: "https://upload.wikimedia.org/wikipedia/en/f/f2/Atalanta_BC_new_logo.svg",
  roma: "https://upload.wikimedia.org/wikipedia/en/f/f7/AS_Roma_logo_%282017%29.svg",
  lazio: "https://upload.wikimedia.org/wikipedia/en/c/ce/S.S._Lazio_badge.svg",
  fiorentina: "https://upload.wikimedia.org/wikipedia/commons/8/8c/ACF_Fiorentina_-_logo_%28Italy%2C_2022%29.svg",
  bologna: "https://upload.wikimedia.org/wikipedia/commons/5/5b/Bologna_F.C._1909_logo.svg",
  torino: "https://upload.wikimedia.org/wikipedia/en/2/2e/Torino_FC_Logo.svg",
  monza: "https://upload.wikimedia.org/wikipedia/en/0/09/AC_Monza_logo.svg",
  genoa: "https://upload.wikimedia.org/wikipedia/en/e/e2/Genoa_CFC_crest.svg",
  lecce: "https://upload.wikimedia.org/wikipedia/en/3/30/US_Lecce_logo.svg",
  udinese: "https://upload.wikimedia.org/wikipedia/en/c/ce/Udinese_Calcio_logo.svg",
  verona: "https://upload.wikimedia.org/wikipedia/en/9/92/Hellas_Verona_FC_logo_%282020%29.svg",
  empoli: "https://upload.wikimedia.org/wikipedia/en/f/fb/Empoli_FC_crest.svg",
  cagliari: "https://upload.wikimedia.org/wikipedia/en/6/61/Cagliari_Calcio_1920.svg",
  parma: "https://upload.wikimedia.org/wikipedia/commons/9/97/Logo_Parma_Calcio_1913_%28adozione_2016%29.svg",
  como: "https://upload.wikimedia.org/wikipedia/en/b/b8/Como_1907_logo.svg",
  venezia: "https://upload.wikimedia.org/wikipedia/en/3/39/Venezia_FC_crest.svg",
  bayern: "https://upload.wikimedia.org/wikipedia/commons/1/1b/FC_Bayern_M%C3%BCnchen_logo_%282017%29.svg",
  leverkusen: "https://upload.wikimedia.org/wikipedia/en/5/59/Bayer_04_Leverkusen_logo.svg",
  dortmund: "https://upload.wikimedia.org/wikipedia/commons/6/67/Borussia_Dortmund_logo.svg",
  leipzig: "https://upload.wikimedia.org/wikipedia/en/0/04/RB_Leipzig_2014_logo.svg",
  stuttgart: "https://upload.wikimedia.org/wikipedia/commons/e/eb/VfB_Stuttgart_1893_Logo.svg",
  frankfurt: "https://upload.wikimedia.org/wikipedia/commons/0/04/Eintracht_Frankfurt_Logo.svg",
  freiburg: "https://upload.wikimedia.org/wikipedia/en/6/6d/SC_Freiburg_logo.svg",
  hoffenheim: "https://upload.wikimedia.org/wikipedia/commons/e/e7/Logo_TSG_Hoffenheim.svg",
  heidenheim: "https://upload.wikimedia.org/wikipedia/en/9/9c/1._FC_Heidenheim_1846_logo.svg",
  werder: "https://upload.wikimedia.org/wikipedia/commons/b/be/SV-Werder-Bremen-Logo.svg",
  wolfsburg: "https://upload.wikimedia.org/wikipedia/commons/f/f3/Logo-VfL-Wolfsburg.svg",
  monchengladbach: "https://upload.wikimedia.org/wikipedia/commons/8/81/Borussia_M%C3%B6nchengladbach_logo.svg",
  union_berlin: "https://upload.wikimedia.org/wikipedia/commons/4/44/1._FC_Union_Berlin_Logo.svg",
  mainz: "https://upload.wikimedia.org/wikipedia/en/9/9e/Logo_Mainz_05.svg",
  bochum: "https://upload.wikimedia.org/wikipedia/commons/7/72/VfL_Bochum_logo.svg",
  stpauli: "https://upload.wikimedia.org/wikipedia/en/8/81/FC_St._Pauli_logo_%282018%29.svg",
  kiel: "https://upload.wikimedia.org/wikipedia/en/5/51/Holstein_Kiel_Logo.svg",
  augsburg: "https://upload.wikimedia.org/wikipedia/en/c/c5/FC_Augsburg_logo.svg",
  psg: "https://upload.wikimedia.org/wikipedia/en/a/a7/Paris_Saint-Germain_F.C..svg",
  monaco: "https://upload.wikimedia.org/wikipedia/en/c/cf/LogoASMonacoFC2021.svg",
  marseille: "https://upload.wikimedia.org/wikipedia/commons/d/d8/Olympique_Marseille_logo.svg",
  lille: "https://upload.wikimedia.org/wikipedia/en/3/3f/Lille_OSC_2018_logo.svg",
  lens: "https://upload.wikimedia.org/wikipedia/en/c/cc/RC_Lens_logo.svg",
  lyon: "https://upload.wikimedia.org/wikipedia/en/1/1c/Olympique_Lyonnais_logo.svg",
  nice: "https://upload.wikimedia.org/wikipedia/en/2/2e/OGC_Nice_logo.svg",
  rennes: "https://upload.wikimedia.org/wikipedia/en/9/9e/Stade_Rennais_FC.svg",
  reims: "https://upload.wikimedia.org/wikipedia/en/1/19/Stade_de_Reims_logo.svg",
  brest: "https://upload.wikimedia.org/wikipedia/en/6/6e/Stade_Brestois_29_logo.svg",
  strasbourg: "https://upload.wikimedia.org/wikipedia/en/8/80/Racing_Club_de_Strasbourg_logo.svg",
  toulouse: "https://upload.wikimedia.org/wikipedia/en/0/0e/Toulouse_FC_2018_logo.svg",
  montpellier: "https://upload.wikimedia.org/wikipedia/en/a/a8/Montpellier_HSC_logo.svg",
  nantes: "https://upload.wikimedia.org/wikipedia/commons/4/49/Logo_FC_Nantes_%28avec_fond%29_-_2019.svg",
  angers: "https://upload.wikimedia.org/wikipedia/en/0/0a/Angers_SCO_logo.svg",
  saint_etienne: "https://upload.wikimedia.org/wikipedia/commons/2/2c/Logo_AS_Saint-%C3%89tienne.svg",
  le_havre: "https://upload.wikimedia.org/wikipedia/en/6/66/Le_Havre_AC_logo.svg",
  auxerre: "https://upload.wikimedia.org/wikipedia/en/1/1c/AJ_Auxerre.svg",
};

async function downloadBadge(id, url) {
  // Skip if already downloaded
  const svgPath = path.join(BADGES_DIR, `${id}.svg`);
  if (fs.existsSync(svgPath) && fs.statSync(svgPath).size > 100) {
    console.log(`SKIP ${id} (already exists)`);
    return true;
  }
  
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    if (!res.ok) {
      console.log(`FAIL ${id}: HTTP ${res.status}`);
      return false;
    }
    const buffer = Buffer.from(await res.arrayBuffer());
    fs.writeFileSync(svgPath, buffer);
    console.log(`OK   ${id} (${buffer.length} bytes)`);
    return true;
  } catch(e) {
    console.log(`ERR  ${id}: ${e.message}`);
    return false;
  }
}

async function main() {
  const entries = Object.entries(CLUB_BADGE_URLS);
  let ok = 0, fail = 0;
  for (const [id, url] of entries) {
    const success = await downloadBadge(id, url);
    if (success) ok++; else fail++;
    // 3 second delay to avoid rate limiting
    await new Promise(r => setTimeout(r, 3000));
  }
  console.log(`\nDone: ${ok} succeeded, ${fail} failed out of ${entries.length}`);
}

main();
