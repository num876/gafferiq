const fs   = require("fs");
const path = require("path");
const { parse } = require("csv-parse/sync");

// ── CLI args ──────────────────────────────────────────────────
const args       = process.argv.slice(2);
const getArg     = (flag) => { const i = args.indexOf(flag); return i !== -1 ? args[i + 1] : null; };
const leagueFilter = getArg("--league");
const clubFilter   = getArg("--club");
const minOvr       = parseInt(getArg("--min-ovr") || "0", 10);

// ── Top 5 league names as they appear in FC25 data ────────────
const TOP5_LEAGUES = [
  "English Premier League",   // PL
  "Spain Primera Division",   // La Liga
  "German 1. Bundesliga",     // Bundesliga
  "Italian Serie A",          // Serie A
  "French Ligue 1",           // Ligue 1
];

// ── Find CSV ──────────────────────────────────────────────────
function findCSV(dir) {
  if (!fs.existsSync(dir)) return null;
  const files = fs.readdirSync(dir);
  // Prefer the main players file (not GK-specific if split)
  const preferred = files.find(f => f.match(/player/i) && f.endsWith(".csv") && !f.match(/goal/i));
  const fallback  = files.find(f => f.endsWith(".csv"));
  return preferred || fallback || null;
}

const dataDir  = path.join(__dirname, "data");
const csvFile  = findCSV(dataDir);

if (!csvFile) {
  console.log("❌ No CSV found in ./data/");
  console.log("\nRun this first:\n");
  console.log("  pip install kaggle");
  console.log("  kaggle datasets download -d nyagami/ea-sports-fc-25-database-ratings-and-stats --unzip -p ./data");
  console.log("\nThen re-run: node ratings.js");
  process.exit(1);
}

console.log(`📂 Reading: ${csvFile}`);
const raw = fs.readFileSync(path.join(dataDir, csvFile), "utf8");

// ── Parse CSV ─────────────────────────────────────────────────
const rows = parse(raw, {
  columns: true,
  skip_empty_lines: true,
  trim: true,
});

console.log(`📊 Total players in dataset: ${rows.length}`);
console.log(`📋 Columns: ${Object.keys(rows[0]).join(", ")}\n`);

// ── Normalise column names (datasets use different naming conventions)
function col(row, ...candidates) {
  for (const c of candidates) {
    const key = Object.keys(row).find(k => k.toLowerCase().replace(/[\s_]/g, "") === c.toLowerCase().replace(/[\s_]/g, ""));
    if (key && row[key] !== undefined && row[key] !== "") return row[key];
  }
  return "N/A";
}

// ── Filter ────────────────────────────────────────────────────
let filtered = rows.filter(row => {
  const league = col(row, "league_name", "leaguename", "league", "competition");
  return TOP5_LEAGUES.some(l => league.toLowerCase().includes(l.toLowerCase().split(" ").slice(-2).join(" ")));
});

if (leagueFilter) {
  filtered = filtered.filter(r => col(r, "league_name","leaguename","league","competition").toLowerCase().includes(leagueFilter.toLowerCase()));
}
if (clubFilter) {
  filtered = filtered.filter(r => col(r, "club_name","clubname","club","team").toLowerCase().includes(clubFilter.toLowerCase()));
}
if (minOvr > 0) {
  filtered = filtered.filter(r => parseInt(col(r, "overall","ovr","rating"), 10) >= minOvr);
}

console.log(`✅ Players after filter: ${filtered.length}\n`);

// ── Sort by OVR desc ──────────────────────────────────────────
filtered.sort((a, b) => {
  const ovrA = parseInt(col(a, "overall","ovr","rating"), 10) || 0;
  const ovrB = parseInt(col(b, "overall","ovr","rating"), 10) || 0;
  return ovrB - ovrA;
});

// ── Group by League → Club ────────────────────────────────────
const byLeague = {};
for (const row of filtered) {
  const league = col(row, "league_name","leaguename","league","competition") || "Unknown League";
  const club   = col(row, "club_name","clubname","club","team")              || "Unknown Club";
  if (!byLeague[league]) byLeague[league] = {};
  if (!byLeague[league][club]) byLeague[league][club] = [];
  byLeague[league][club].push(row);
}

// ── Print ─────────────────────────────────────────────────────
for (const [league, clubs] of Object.entries(byLeague)) {
  const totalPlayers = Object.values(clubs).flat().length;
  console.log(`\n${"═".repeat(72)}`);
  console.log(`🏆  ${league.toUpperCase()}  —  ${Object.keys(clubs).length} clubs, ${totalPlayers} players`);
  console.log(`${"═".repeat(72)}`);

  for (const [club, players] of Object.entries(clubs)) {
    console.log(`\n  🏟  ${club}  (${players.length} players)`);
    console.log(`  ${"─".repeat(68)}`);
    console.log(`  ${"#".padStart(3)}  ${"Name".padEnd(28)}  ${"Pos".padEnd(6)}  ${"OVR".padEnd(4)}  ${"PAC".padEnd(4)}  ${"SHO".padEnd(4)}  ${"PAS".padEnd(4)}  ${"DRI".padEnd(4)}  ${"DEF".padEnd(4)}  ${"PHY".padEnd(4)}  Age  Nationality`);
    console.log(`  ${"─".repeat(68)}`);

    players.forEach((p, i) => {
      const name  = col(p, "short_name","shortname","name","player_name","playername").slice(0, 27).padEnd(28);
      const pos   = col(p, "player_positions","playerpositions","position","best_position","bestposition").split(",")[0].trim().padEnd(6);
      const ovr   = String(col(p, "overall","ovr","rating")).padEnd(4);
      const pac   = String(col(p, "pace","pac")).padEnd(4);
      const sho   = String(col(p, "shooting","sho")).padEnd(4);
      const pas   = String(col(p, "passing","pas")).padEnd(4);
      const dri   = String(col(p, "dribbling","dri")).padEnd(4);
      const def   = String(col(p, "defending","def")).padEnd(4);
      const phy   = String(col(p, "physic","phy","physical")).padEnd(4);
      const age   = String(col(p, "age")).padEnd(3);
      const nat   = col(p, "nationality_name","nationality","nationname").slice(0, 18);

      console.log(`  ${String(i+1).padStart(3)}  ${name}  ${pos}  ${ovr}  ${pac}  ${sho}  ${pas}  ${dri}  ${def}  ${phy}  ${age}  ${nat}`);
    });
  }
}

// ── Summary stats ─────────────────────────────────────────────
console.log(`\n\n${"═".repeat(72)}`);
console.log("📊  SUMMARY");
console.log(`${"═".repeat(72)}`);

for (const [league, clubs] of Object.entries(byLeague)) {
  const players = Object.values(clubs).flat();
  const ovrs    = players.map(p => parseInt(col(p,"overall","ovr","rating"),10)).filter(Boolean);
  const avg     = (ovrs.reduce((a,b) => a+b, 0) / ovrs.length).toFixed(1);
  const max     = Math.max(...ovrs);
  const min     = Math.min(...ovrs);
  console.log(`  ${league.padEnd(35)}  ${String(players.length).padStart(4)} players  avg OVR: ${avg}  range: ${min}–${max}`);
}

// ── JSON dump ────────────────────
const output = filtered.map(row => ({
  name:        col(row, "short_name","shortname","name","player_name"),
  fullName:    col(row, "long_name","longname","player_name"),
  position:    col(row, "player_positions","playerpositions","position","best_position").split(",")[0].trim(),
  overall:     parseInt(col(row, "overall","ovr","rating"), 10) || 0,
  pace:        parseInt(col(row, "pace","pac"), 10) || 0,
  shooting:    parseInt(col(row, "shooting","sho"), 10) || 0,
  passing:     parseInt(col(row, "passing","pas"), 10) || 0,
  dribbling:   parseInt(col(row, "dribbling","dri"), 10) || 0,
  defending:   parseInt(col(row, "defending","def"), 10) || 0,
  physical:    parseInt(col(row, "physic","phy","physical"), 10) || 0,
  age:         parseInt(col(row, "age"), 10) || 0,
  nationality: col(row, "nationality_name","nationality"),
  club:        col(row, "club_name","clubname","club","team"),
  league:      col(row, "league_name","leaguename","league","competition"),
  value:       col(row, "value_eur","value","player_value"),
  wage:        col(row, "wage_eur","wage"),
}));

const outPath = path.join(__dirname, "fc25_players.json");
fs.writeFileSync(outPath, JSON.stringify(output, null, 2));
console.log(`\n\n📦 JSON OUTPUT (${output.length} players) saved to ${outPath}`);
