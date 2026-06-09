const fs = require('fs');

// Patch storage.ts MatchFixture
let storage = fs.readFileSync('src/db/storage.ts', 'utf8');
storage = storage.replace('competition: "League" | "Domestic Cup";', 'competition: "League" | "Domestic Cup" | "Continental";');
fs.writeFileSync('src/db/storage.ts', storage);

// Patch GameContext.tsx
let gc = fs.readFileSync('src/context/GameContext.tsx', 'utf8');

// Fix DEFAULT_TACTICS_MOCK
const mockPattern = `function DEFAULT_TACTICS_MOCK(): TacticalInstructions {
  return {
    mentality: "Balanced",
    pressIntensity: "Mid",
    defensiveLine: "Standard",
    width: "Standard",
    tempo: "Normal",
    takers: { penalties: "", corners: "", freeKicks: "" }
  } as any; // Using as any so it doesn't break if properties change
}`;

gc = gc.replace(/function DEFAULT_TACTICS_MOCK\(\): TacticalInstructions \{[\s\S]*?\}/, mockPattern);

// Fix f.round error
gc = gc.replace('f.round.startsWith("Knockout - ")', '(f.round && f.round.startsWith("Knockout - "))');

fs.writeFileSync('src/context/GameContext.tsx', gc);
console.log("Patched types and logic");
