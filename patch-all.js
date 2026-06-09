const fs = require('fs');

let gc = fs.readFileSync('src/context/GameContext.tsx', 'utf8');

// 1. Update leagues array in advanceToNextMatchday
const replacement = 'const leagues = ["EPL", "La Liga", "Serie A", "Bundesliga", "Ligue 1", "Eredivisie", "Liga Portugal", "Serbian SuperLiga", "Swiss Super League", "Ukrainian Premier League", "Danish Superliga", "Allsvenskan", "Russian Premier League", "Ekstraklasa", "Prva HNL"];';
gc = gc.replace(/const leagues = \["EPL", "La Liga", "Serie A", "Bundesliga", "Ligue 1", "Eredivisie", "Liga Portugal"\];/g, replacement);
gc = gc.replace(/const leagues = \["EPL", "La Liga", "Serie A", "Bundesliga", "Ligue 1"\];/g, replacement);

// 2. Continental Cup Progression Logic injection
const progressionLogic = `
    // Continental Cup Progression Logic
    if (state.continentalCups) {
      const processContinentalKnockouts = (compName: string, statePrefix: string) => {
        // Did we just finish a knockout round matchday?
        const playedKnockouts = state.fixtures.filter(
          f => f.league === compName && f.matchday === state.currentMatchday && f.played && (f.round && f.round.startsWith("Knockout - "))
        );

        if (playedKnockouts.length > 0) {
          const advancingTeams: string[] = [];
          playedKnockouts.forEach(f => {
            const winner = (f.homeScore! > f.awayScore!) ? f.homeClubId : f.awayClubId;
            advancingTeams.push(winner);
          });
          
          if (advancingTeams.length > 1) {
            let nextRound = "";
            let nextMd = state.currentMatchday + 4;
            if (advancingTeams.length === 8) nextRound = "Quarter Final";
            if (advancingTeams.length === 4) nextRound = "Semi Final";
            if (advancingTeams.length === 2) nextRound = "Final";
            
            // Generate next round
            for (let i = 0; i < advancingTeams.length; i += 2) {
              state.fixtures.push({
                id: \`cup_\${compName.replace(/\\s/g, '').toLowerCase()}_\${nextRound.replace(/\\s/g, '')}_\${Date.now()}_\${i}\`,
                league: compName,
                competition: "Continental" as any,
                round: \`Knockout - \${nextRound}\`,
                matchday: nextMd,
                homeClubId: advancingTeams[i],
                awayClubId: advancingTeams[i+1],
                homeScore: null,
                awayScore: null,
                played: false
              });
            }
          } else if (advancingTeams.length === 1) {
            // Winner crowned
            const winnerName = state.clubs.find(cl => cl.id === advancingTeams[0])?.name;
            state.inbox.unshift({
              id: \`cup_winner_\${compName}_\${state.currentMatchday}\`,
              sender: "UEFA",
              subject: \`\${winnerName} Wins the \${compName}!\`,
              body: \`\${winnerName} have lifted the \${compName} trophy!\`,
              date: \`Matchday \${state.currentMatchday}\`,
              read: false,
              type: "media"
            });
          }
        }
      };

      processContinentalKnockouts("Champions League", "championsLeague");
      processContinentalKnockouts("Europa League", "europaLeague");

      // Did we just finish Matchday 20 (Group Stages done)?
      if (state.currentMatchday === 20) {
        const generateRo16 = (cupState: any, compName: string) => {
          const advancingTeams: string[] = [];
          for (const gName in cupState.groups) {
            // Already sorted in rebuildStandings, take top 2
            advancingTeams.push(cupState.groups[gName][0].clubId);
            advancingTeams.push(cupState.groups[gName][1].clubId);
          }
          
          // advancingTeams has 16 teams. Generate Ro16 fixtures for Matchday 24
          for (let i = 0; i < 16; i += 2) {
            state.fixtures.push({
              id: \`cup_\${compName.replace(/\\s/g, '').toLowerCase()}_ro16_\${Date.now()}_\${i}\`,
              league: compName,
              competition: "Continental" as any,
              round: \`Knockout - Round of 16\`,
              matchday: 24,
              homeClubId: advancingTeams[i],
              awayClubId: advancingTeams[i+1],
              homeScore: null,
              awayScore: null,
              played: false
            });
          }
        };

        generateRo16(state.continentalCups.championsLeague, "Champions League");
        generateRo16(state.continentalCups.europaLeague, "Europa League");
        
        state.inbox.unshift({
          id: \`cup_ro16_\${state.currentMatchday}\`,
          sender: "UEFA",
          subject: "Continental Cups Group Stage Concludes",
          body: "The group stages have finished. The Round of 16 draw is complete!",
          date: \`Matchday \${state.currentMatchday}\`,
          read: false,
          type: "media"
        });
      }
    }
`;
gc = gc.replace('    const nextMDay = state.currentMatchday + 1;', progressionLogic + '\n    const nextMDay = state.currentMatchday + 1;');

// 3. Continental Cups standings logic in rebuildStandings
const continentalCode = `
    state.standings[league] = leagueStandings;
  }

  // Continental Cups Standings
  if (state.continentalCups) {
    const rebuildCup = (cupState: any, cupName: string) => {
      for (const gName in cupState.groups) {
        cupState.groups[gName] = cupState.groups[gName].map((s: any) => ({
          ...s, played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, points: 0
        }));

        const playedFixtures = state.fixtures.filter(
          f => f.league === cupName && f.round === \`Group Stage - \${gName}\` && f.played && f.matchday <= state.currentMatchday
        );

        playedFixtures.forEach(f => {
          const homeStanding = cupState.groups[gName].find((s: any) => s.clubId === f.homeClubId);
          const awayStanding = cupState.groups[gName].find((s: any) => s.clubId === f.awayClubId);

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

        cupState.groups[gName].sort((a: any, b: any) => {
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
gc = gc.replace('    state.standings[league] = leagueStandings;\n  }', continentalCode);

// 4. Update DEFAULT_TACTICS_MOCK
const mockPattern = `function DEFAULT_TACTICS_MOCK(): any {
  return {
    mentality: "Balanced",
    pressIntensity: "Mid",
    defensiveLine: "Standard",
    width: "Standard",
    tempo: "Normal",
    passingDirectness: "Mixed",
    crossingFrequency: "Sometimes",
    pressingTrigger: "Mid",
    offsideTrap: false,
    counterAttackSpeed: "Balanced",
    counterPress: false,
    takers: { penalties: "", corners: "", freeKicks: "" }
  };
}`;
gc = gc.replace(/function DEFAULT_TACTICS_MOCK\(\)[\s\S]*?as any;[\s\S]*?\}/, mockPattern);

// 5. Fix state.tactics type error in simulateMatchHeuristic calls
gc = gc.replace(/state\.tactics \? state\.tactics : DEFAULT_TACTICS_MOCK\(\)/g, 'state.tactics ? state.tactics.instructions : DEFAULT_TACTICS_MOCK()');

fs.writeFileSync('src/context/GameContext.tsx', gc);
console.log("Unified GameContext patch successful");
