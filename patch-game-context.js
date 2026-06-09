const fs = require('fs');

let c = fs.readFileSync('src/context/GameContext.tsx', 'utf8');

const replacement = 'const leagues = ["EPL", "La Liga", "Serie A", "Bundesliga", "Ligue 1", "Eredivisie", "Liga Portugal", "Serbian SuperLiga", "Swiss Super League", "Ukrainian Premier League", "Danish Superliga", "Allsvenskan", "Russian Premier League", "Ekstraklasa", "Prva HNL"];';

c = c.replace(/const leagues = \["EPL", "La Liga", "Serie A", "Bundesliga", "Ligue 1", "Eredivisie", "Liga Portugal"\];/g, replacement);
c = c.replace(/const leagues = \["EPL", "La Liga", "Serie A", "Bundesliga", "Ligue 1"\];/g, replacement);

// Also append Continental Cups standing logic to rebuildStandings
const continentalCode = `
    state.standings[league] = leagueStandings;
  }

  // Continental Cups Standings
  if (state.continentalCups) {
    const rebuildCup = (cupState, cupName) => {
      for (const gName in cupState.groups) {
        cupState.groups[gName] = cupState.groups[gName].map(s => ({
          ...s, played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, points: 0
        }));

        const playedFixtures = state.fixtures.filter(
          f => f.league === cupName && f.round === \`Group Stage - \${gName}\` && f.played && f.matchday <= state.currentMatchday
        );

        playedFixtures.forEach(f => {
          const homeStanding = cupState.groups[gName].find(s => s.clubId === f.homeClubId);
          const awayStanding = cupState.groups[gName].find(s => s.clubId === f.awayClubId);

          const hs = f.homeScore ?? 0;
          const as = f.awayScore ?? 0;

          homeStanding.played++;
          awayStanding.played++;
          homeStanding.goalsFor += hs;
          homeStanding.goalsAgainst += as;
          awayStanding.goalsFor += as;
          awayStanding.goalsAgainst += hs;

          if (hs > as) {
            homeStanding.won++;
            homeStanding.points += 3;
            awayStanding.lost++;
          } else if (hs < as) {
            awayStanding.won++;
            awayStanding.points += 3;
            homeStanding.lost++;
          } else {
            homeStanding.drawn++;
            awayStanding.drawn++;
            homeStanding.points += 1;
            awayStanding.points += 1;
          }
        });

        cupState.groups[gName].sort((a, b) => {
          if (b.points !== a.points) return b.points - a.points;
          const bGd = b.goalsFor - b.goalsAgainst;
          const aGd = a.goalsFor - a.goalsAgainst;
          if (bGd !== aGd) return bGd - aGd;
          return b.goalsFor - a.goalsFor;
        });
      }
    };

    rebuildCup(state.continentalCups.championsLeague, "Champions League");
    rebuildCup(state.continentalCups.europaLeague, "Europa League");
  }
`;

c = c.replace('    state.standings[league] = leagueStandings;\n  }', continentalCode);

fs.writeFileSync('src/context/GameContext.tsx', c);
console.log("Patched GameContext.tsx");
