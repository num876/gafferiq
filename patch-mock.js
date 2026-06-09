const fs = require('fs');
let gc = fs.readFileSync('src/context/GameContext.tsx', 'utf8');

const oldMock = `function DEFAULT_TACTICS_MOCK(): TacticalInstructions {
  return {
    mentality: "Balanced",
    pressIntensity: "Mid",
    defensiveLine: "Standard",
    width: "Standard",
    tempo: "Normal",
    takers: { penalties: "", corners: "", freeKicks: "" }
  } as any; // Using as any so it doesn't break if properties change
}`;

const newMock = `function DEFAULT_TACTICS_MOCK(): any {
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

gc = gc.replace(oldMock, newMock);
fs.writeFileSync('src/context/GameContext.tsx', gc);
console.log("Patched DEFAULT_TACTICS_MOCK via script");
