const fs = require('fs');

let c = fs.readFileSync('src/config/seededData.ts', 'utf8');

const newOverrides = {
  "Endrick": { overall: 82, potential: 93 },
  "Arda Güler": { overall: 83, potential: 92 },
  "Leny Yoro": { overall: 81, potential: 90 },
  "Savinho": { overall: 84, potential: 89 },
  "Riccardo Calafiori": { overall: 84, potential: 89 },
  "Michael Olise": { overall: 86, potential: 90 },
  "João Neves": { overall: 84, potential: 91 },
  "Alejandro Garnacho": { overall: 84, potential: 90 },
  "Bradley Barcola": { overall: 84, potential: 90 },
  "Pau Cubarsí": { overall: 82, potential: 92 },
  "Kobbie Mainoo": { overall: 83, potential: 90 },
  "Mathys Tel": { overall: 82, potential: 89 },
  "Evan Ferguson": { overall: 81, potential: 88 },
  "Amadou Onana": { overall: 84, potential: 88 },
  "Ian Maatsen": { overall: 82, potential: 86 },
  "Viktor Gyökeres": { overall: 88, potential: 89 },
  "Alexander Isak": { overall: 87, potential: 89 },
  "Anthony Gordon": { overall: 85, potential: 88 },
  "Micky van de Ven": { overall: 85, potential: 89 },
  "Destiny Udogie": { overall: 84, potential: 88 },
  "Joshua Zirkzee": { overall: 83, potential: 87 }
};

const newOverrideAttributes = {
  "Endrick": { overall: 82, potential: 93, pace: 89, shooting: 84, passing: 72, dribbling: 85, defending: 35, physical: 78, mental: 75, stamina: 76, age: 19 },
  "Arda Güler": { overall: 83, potential: 92, pace: 78, shooting: 81, passing: 86, dribbling: 87, defending: 45, physical: 60, mental: 82, stamina: 75, age: 21 },
  "Leny Yoro": { overall: 81, potential: 90, pace: 78, shooting: 40, passing: 74, dribbling: 70, defending: 83, physical: 80, mental: 78, stamina: 76, age: 20 },
  "Savinho": { overall: 84, potential: 89, pace: 90, shooting: 78, passing: 80, dribbling: 88, defending: 42, physical: 65, mental: 78, stamina: 82, age: 21 },
  "Riccardo Calafiori": { overall: 84, potential: 89, pace: 79, shooting: 60, passing: 81, dribbling: 78, defending: 85, physical: 84, mental: 82, stamina: 85, age: 23 },
  "Michael Olise": { overall: 86, potential: 90, pace: 85, shooting: 83, passing: 86, dribbling: 88, defending: 48, physical: 70, mental: 81, stamina: 82, age: 24 },
  "João Neves": { overall: 84, potential: 91, pace: 76, shooting: 70, passing: 85, dribbling: 84, defending: 80, physical: 74, mental: 84, stamina: 88, age: 21 },
  "Alejandro Garnacho": { overall: 84, potential: 90, pace: 90, shooting: 82, passing: 76, dribbling: 86, defending: 40, physical: 65, mental: 79, stamina: 81, age: 21 },
  "Bradley Barcola": { overall: 84, potential: 90, pace: 92, shooting: 80, passing: 79, dribbling: 87, defending: 42, physical: 68, mental: 78, stamina: 80, age: 23 },
  "Pau Cubarsí": { overall: 82, potential: 92, pace: 75, shooting: 35, passing: 82, dribbling: 74, defending: 84, physical: 78, mental: 82, stamina: 75, age: 19 },
  "Kobbie Mainoo": { overall: 83, potential: 90, pace: 76, shooting: 72, passing: 84, dribbling: 86, defending: 78, physical: 75, mental: 82, stamina: 84, age: 20 },
  "Viktor Gyökeres": { overall: 88, potential: 89, pace: 87, shooting: 88, passing: 76, dribbling: 82, defending: 45, physical: 88, mental: 83, stamina: 86, age: 27 },
  "Alexander Isak": { overall: 87, potential: 89, pace: 88, shooting: 87, passing: 76, dribbling: 85, defending: 40, physical: 78, mental: 81, stamina: 82, age: 26 },
  "Anthony Gordon": { overall: 85, potential: 88, pace: 90, shooting: 80, passing: 81, dribbling: 85, defending: 55, physical: 72, mental: 80, stamina: 88, age: 24 }
};

// Insert into TOP_PLAYER_OVERRIDES
let topOverridesStr = '';
for (const [k, v] of Object.entries(newOverrides)) {
  topOverridesStr += `  "${k}": { overall: ${v.overall}, potential: ${v.potential} },\n`;
}

c = c.replace(
  'export const TOP_PLAYER_OVERRIDES: Record<string, { overall: number, potential: number }> = {',
  'export const TOP_PLAYER_OVERRIDES: Record<string, { overall: number, potential: number }> = {\n' + topOverridesStr
);

// Insert into OVERRIDE_ATTRIBUTES
let overrideAttrsStr = '';
for (const [k, v] of Object.entries(newOverrideAttributes)) {
  overrideAttrsStr += `  "${k}": { overall: ${v.overall}, potential: ${v.potential}, pace: ${v.pace}, shooting: ${v.shooting}, passing: ${v.passing}, dribbling: ${v.dribbling}, defending: ${v.defending}, physical: ${v.physical}, mental: ${v.mental}, stamina: ${v.stamina}, age: ${v.age} },\n`;
}

c = c.replace(
  'const OVERRIDE_ATTRIBUTES: Record<string, Partial<Player>> = {',
  'const OVERRIDE_ATTRIBUTES: Record<string, Partial<Player>> = {\n' + overrideAttrsStr
);

// Increase budgets by 10-15% for 2026 landscape
c = c.replace(/transferBudget: (\d+)/g, (match, p1) => {
  return `transferBudget: ${Math.floor(parseInt(p1) * 1.15)}`;
});

c = c.replace(/wageBudget: (\d+)/g, (match, p1) => {
  return `wageBudget: ${Math.floor(parseInt(p1) * 1.15)}`;
});

fs.writeFileSync('src/config/seededData.ts', c);
console.log('seededData updated with 2026 landscape overrides.');
