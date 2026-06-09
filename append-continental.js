const fs = require('fs');

const codeToAppend = `

export function generateContinentalState(clubs: Club[]): SaveState["continentalCups"] {
  const top5 = ["EPL", "La Liga", "Serie A", "Bundesliga", "Ligue 1"];
  const clTeams: string[] = [];
  const elTeams: string[] = [];

  // Group clubs by league and sort by reputation descending
  const clubsByLeague: Record<string, Club[]> = {};
  for (const c of clubs) {
    if (!clubsByLeague[c.league]) clubsByLeague[c.league] = [];
    clubsByLeague[c.league].push(c);
  }
  for (const l in clubsByLeague) {
    clubsByLeague[l].sort((a, b) => b.reputation - a.reputation);
  }

  // Pick CL teams
  for (const l in clubsByLeague) {
    const take = top5.includes(l) ? 4 : 2;
    for (let i = 0; i < take && i < clubsByLeague[l].length; i++) {
      clTeams.push(clubsByLeague[l][i].id);
    }
  }

  // Pick EL teams
  for (const l in clubsByLeague) {
    const skip = top5.includes(l) ? 4 : 2;
    const take = top5.includes(l) ? 4 : 2;
    for (let i = skip; i < skip + take && i < clubsByLeague[l].length; i++) {
      elTeams.push(clubsByLeague[l][i].id);
    }
  }

  // Helper to build 8 groups of 5
  const buildGroups = (teamIds: string[]): Record<string, ContinentalGroupStanding[]> => {
    // Shuffle teams for random draw
    const shuffled = [...teamIds].sort(() => Math.random() - 0.5);
    const groups: Record<string, ContinentalGroupStanding[]> = {};
    const groupNames = ["Group A", "Group B", "Group C", "Group D", "Group E", "Group F", "Group G", "Group H"];
    
    for (let i = 0; i < 8; i++) {
      const gName = groupNames[i];
      groups[gName] = [];
      for (let j = 0; j < 5; j++) {
        const tId = shuffled[i * 5 + j];
        if (tId) {
          const club = clubs.find(c => c.id === tId)!;
          groups[gName].push({
            clubId: tId,
            clubName: club.shortName,
            played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, points: 0
          });
        }
      }
    }
    return groups;
  };

  return {
    championsLeague: {
      participants: clTeams,
      groups: buildGroups(clTeams)
    },
    europaLeague: {
      participants: elTeams,
      groups: buildGroups(elTeams)
    }
  };
}

export function generateContinentalGroupFixtures(cupState: ContinentalCupState, compName: string): MatchFixture[] {
  const fixtures: MatchFixture[] = [];
  const matchdays = [4, 8, 12, 16, 20]; // 5 matchdays for the 5 rounds of a 5-team round-robin
  
  for (const gName in cupState.groups) {
    const teams = cupState.groups[gName].map(g => g.clubId);
    if (teams.length !== 5) continue; // safety

    // Standard 5-team round robin pairings (10 matches total, 2 per matchday)
    // Round 1: 1v4, 2v3 (5 rests)
    // Round 2: 5v1, 4v2 (3 rests)
    // Round 3: 2v5, 3v4 (1 rests)
    // Round 4: 1v2, 5v3 (4 rests)
    // Round 5: 3v1, 4v5 (2 rests)
    const schedule = [
      [[0,3], [1,2]],
      [[4,0], [3,1]],
      [[1,4], [2,3]],
      [[0,1], [4,2]],
      [[2,0], [3,4]]
    ];

    for (let round = 0; round < 5; round++) {
      const md = matchdays[round];
      const matches = schedule[round];
      for (let m = 0; m < matches.length; m++) {
        const homeIdx = matches[m][0];
        const awayIdx = matches[m][1];
        fixtures.push({
          id: \`\${compName.replace(/\\s/g, '').toLowerCase()}_\${gName.replace(/\\s/g, '')}_md\${md}_m\${m}_\${Date.now()}\`,
          league: compName,
          competition: "Continental",
          round: \`Group Stage - \${gName}\`,
          matchday: md,
          homeClubId: teams[homeIdx],
          awayClubId: teams[awayIdx],
          homeScore: null,
          awayScore: null,
          played: false
        });
      }
    }
  }
  return fixtures;
}
`;

const existing = fs.readFileSync('src/db/storage.ts', 'utf8');
fs.writeFileSync('src/db/storage.ts', existing + codeToAppend);
console.log("Added Continental generators");
