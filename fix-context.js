const fs = require('fs');

let c = fs.readFileSync('src/context/GameContext.tsx', 'utf8');

// Find the broken Provider closing section and fix it
// The issue is that the Provider value block got cut short and updatePlayerStats got embedded inside it
const brokenSection = `      playMatchdayCpuGames,
      completeLiveMatch,
  if (fixture.playerRatings) {
    Object.keys(fixture.playerRatings).forEach(playerId => {
      const p = state.players.find(pl => pl.id === playerId);
      if (p) {
        p.sharpness = Math.min(100, (p.sharpness || 50) + 5);
        p.appearances = (p.appearances || 0) + 1;
      }
    });
  }

  if (!fixture.events) return;
  
  fixture.events.forEach(event => {
    const player = state.players.find(p => p.name === event.playerName && (p.clubId === fixture.homeClubId || p.clubId === fixture.awayClubId));
    
    if (player) {
      if (event.type === "Goal") {
        player.goals = (player.goals || 0) + 1;
      } else if (event.type === "Injury") {
        player.injuryStatus = "Injured";
      }
      
      // We don't have explicit fields for yellow/red cards in the Player model yet, but we could add them.
      // For now, if it's a Red Card, we set them to Suspended.
      if (event.type === "Red Card") {
        player.injuryStatus = "Suspended";
      }
    }

    if (event.assistName) {
      const assister = state.players.find(p => p.name === event.assistName && (p.clubId === fixture.homeClubId || p.clubId === fixture.awayClubId));
      if (assister) {
        assister.assists = (assister.assists || 0) + 1;
      }
    }
  });
}`;

const fixedSection = `      playMatchdayCpuGames,
      completeLiveMatch,
      advanceToNextMatchday,
      exitToMainMenu
    }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error("useGame must be used within a GameProvider");
  }
  return context;
}

// Helpers
function DEFAULT_TACTICS_MOCK(): TacticalInstructions {
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
    cornerRoutine: "Far Post",
    defensiveSetPiece: "Mixed",
    playerRoles: {},
    playerDuties: {},
    takers: { penalties: "", corners: "", freeKicks: "" }
  };
}

function updateManagerStatsFromFixture(state: SaveState, fixture: MatchFixture) {
  const isPlayerHome = fixture.homeClubId === state.selectedClubId;
  const isPlayerAway = fixture.awayClubId === state.selectedClubId;
  if (!isPlayerHome && !isPlayerAway) return;

  const m = state.manager;
  if (fixture.homeScore! > fixture.awayScore!) {
    if (isPlayerHome) m.winCount++; else m.lossCount++;
  } else if (fixture.homeScore! < fixture.awayScore!) {
    if (isPlayerAway) m.winCount++; else m.lossCount++;
  } else {
    m.drawCount++;
  }

  m.goalsScored += isPlayerHome ? fixture.homeScore! : fixture.awayScore!;

  if (m.winCount === 1 && !m.achievements.includes("First Win")) {
    m.achievements.push("First Win");
  }
}

function updatePlayerStatsFromFixture(state: SaveState, fixture: MatchFixture, homeSquad: Player[], awaySquad: Player[]) {
  // Grant Sharpness and Appearances to players who played
  if (fixture.playerRatings) {
    Object.keys(fixture.playerRatings).forEach(playerId => {
      const p = state.players.find(pl => pl.id === playerId);
      if (p) {
        p.sharpness = Math.min(100, (p.sharpness || 50) + 5);
        p.appearances = (p.appearances || 0) + 1;
      }
    });
  }

  if (!fixture.events) return;
  
  fixture.events.forEach(event => {
    const player = state.players.find(p => p.name === event.playerName && (p.clubId === fixture.homeClubId || p.clubId === fixture.awayClubId));
    
    if (player) {
      if (event.type === "Goal") {
        player.goals = (player.goals || 0) + 1;
      } else if (event.type === "Injury") {
        player.injuryStatus = "Injured";
      }
      if (event.type === "Red Card") {
        player.injuryStatus = "Suspended";
      }
    }

    if (event.assistName) {
      const assister = state.players.find(p => p.name === event.assistName && (p.clubId === fixture.homeClubId || p.clubId === fixture.awayClubId));
      if (assister) {
        assister.assists = (assister.assists || 0) + 1;
      }
    }
  });
}`;

if (c.includes(brokenSection)) {
  c = c.replace(brokenSection, fixedSection);
  console.log('Fixed broken section');
} else {
  console.log('Section not found, checking for partial match...');
  // Try to find where it's broken
  const idx = c.indexOf('playMatchdayCpuGames,\n      completeLiveMatch,\n  if (fixture.playerRatings)');
  console.log('idx:', idx);
  if (idx !== -1) {
    // Manual splice
    const before = c.substring(0, idx);
    const after = c.substring(c.indexOf('function rebuildStandings'));
    c = before + fixedSection + '\n\n' + after;
    console.log('Done via splice');
  }
}

fs.writeFileSync('src/context/GameContext.tsx', c);
console.log('Written');
