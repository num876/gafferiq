const fs = require('fs');
let c = fs.readFileSync('src/context/GameContext.tsx', 'utf8');

const progressionLogic = `
    // Continental Cup Progression Logic
    if (state.continentalCups) {
      const processContinentalKnockouts = (compName: string, statePrefix: string) => {
        // Did we just finish a knockout round matchday?
        const playedKnockouts = state.fixtures.filter(
          f => f.league === compName && f.matchday === state.currentMatchday && f.played && f.round.startsWith("Knockout - ")
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
                competition: "Continental",
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
              competition: "Continental",
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

c = c.replace('    const nextMDay = state.currentMatchday + 1;', progressionLogic + '\n    const nextMDay = state.currentMatchday + 1;');

fs.writeFileSync('src/context/GameContext.tsx', c);
console.log("Injected Continental cup progression logic");
