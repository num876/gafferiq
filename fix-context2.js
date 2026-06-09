const fs = require('fs');
let c = fs.readFileSync('src/context/GameContext.tsx', 'utf8');

// Find the insertion point 
const marker = 'completeLiveMatch,\r\n  if (fixture.playerRatings)';
const markerAlt = 'completeLiveMatch,\n  if (fixture.playerRatings)';

const inject = `      completeLiveMatch,
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
  if (fixture.playerRatings)`;

if (c.includes(marker)) {
  c = c.replace(marker, inject);
  console.log('Fixed with \\r\\n variant');
} else if (c.includes(markerAlt)) {
  c = c.replace(markerAlt, inject.replace(/\r\n/g, '\n'));
  console.log('Fixed with \\n variant');
} else {
  // manual find
  const idx = c.indexOf('completeLiveMatch,');
  console.log('idx:', idx, 'context:', JSON.stringify(c.substring(idx, idx+100)));
}

fs.writeFileSync('src/context/GameContext.tsx', c);
console.log('Done');
