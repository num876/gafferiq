// using native fetch

// ─────────────────────────────────────────────
// football-data.org — free tier
// Get your free API key at: https://www.football-data.org/client/register
// Then run: API_KEY=your_key node scrape.js
// ─────────────────────────────────────────────

const API_KEY = process.env.API_KEY || "YOUR_API_KEY_HERE";
const BASE    = "https://api.football-data.org/v4";

// Top 5 league codes on football-data.org
const LEAGUES = [
  { name: "Premier League", code: "PL"  },
  { name: "La Liga",        code: "PD"  },
  { name: "Bundesliga",     code: "BL1" },
  { name: "Serie A",        code: "SA"  },
  { name: "Ligue 1",        code: "FL1" },
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function apiFetch(path) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "X-Auth-Token": API_KEY },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} — ${path}`);
  return res.json();
}

// Get all teams in a league
async function getTeams(leagueCode) {
  const data = await apiFetch(`/competitions/${leagueCode}/teams`);
  return data.teams || [];
}

// Get squad for a specific team
async function getSquad(teamId) {
  const data = await apiFetch(`/teams/${teamId}`);
  return data.squad || [];
}

async function main() {
  if (API_KEY === "YOUR_API_KEY_HERE") {
    console.log("⚠️  No API key set!");
    console.log("   1. Register free at https://www.football-data.org/client/register");
    console.log("   2. Run: API_KEY=your_key node scrape.js\n");
    process.exit(1);
  }

  const allPlayers = [];

  for (const league of LEAGUES) {
    console.log(`\n🏆 Fetching ${league.name} teams...`);

    let teams;
    try {
      teams = await getTeams(league.code);
      console.log(`   ✅ ${teams.length} clubs found`);
    } catch (err) {
      console.error(`   ❌ Failed: ${err.message}`);
      continue;
    }

    for (let i = 0; i < teams.length; i++) {
      const team = teams[i];
      console.log(`  [${i + 1}/${teams.length}] ${team.name}...`);

      let squad;
      try {
        squad = await getSquad(team.id);
      } catch (err) {
        console.error(`     ❌ ${err.message}`);
        await sleep(2000);
        continue;
      }

      for (const player of squad) {
        allPlayers.push({
          id:          player.id,
          name:        player.name,
          position:    player.position     || "Unknown",
          nationality: player.nationality  || "N/A",
          dateOfBirth: player.dateOfBirth  || "N/A",
          club:        team.name,
          clubId:      team.id,
          league:      league.name,
          leagueCode:  league.code,
          crest:       team.crest          || null,
        });
      }

      console.log(`     → ${squad.length} players`);

      // Free tier = 10 req/min → ~6s between requests to stay safe
      await sleep(6100);
    }
  }

  // ── Summary ──────────────────────────────────────
  console.log("\n\n========================================");
  console.log(`✅ TOTAL: ${allPlayers.length} players | ${new Set(allPlayers.map(p => p.club)).size} clubs`);
  console.log("========================================\n");

  for (const league of LEAGUES) {
    const lp = allPlayers.filter(p => p.league === league.name);
    const clubs = [...new Set(lp.map(p => p.club))];
    console.log(`\n🏆 ${league.name} — ${clubs.length} clubs, ${lp.length} players`);
    console.log("─".repeat(70));

    for (const club of clubs) {
      const squad = lp.filter(p => p.club === club);
      console.log(`\n  🏟  ${club} (${squad.length})`);
      for (const p of squad) {
        console.log(
          `     ${p.name.padEnd(30)} | ${(p.position || "").padEnd(18)} | ${p.nationality.padEnd(20)} | DOB: ${p.dateOfBirth}`
        );
      }
    }
  }

  // Dump full JSON at the end
  const fs = require('fs');
  fs.writeFileSync('players.json', JSON.stringify(allPlayers, null, 2));
  console.log("\n\n📦 JSON OUTPUT saved to players.json");
}

main().catch(console.error);
