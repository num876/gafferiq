const fs = require('fs');
let c = fs.readFileSync('src/context/GameContext.tsx', 'utf8');

c = c.replace(
  'const leagues = ["EPL", "La Liga", "Serie A", "Bundesliga", "Ligue 1"];',
  'const leagues = ["EPL", "La Liga", "Serie A", "Bundesliga", "Ligue 1", "Eredivisie", "Liga Portugal"];'
);

c = c.replace(
  'const leagues: ("EPL" | "La Liga" | "Serie A" | "Bundesliga" | "Ligue 1")[] = ["EPL", "La Liga", "Serie A", "Bundesliga", "Ligue 1"];',
  'const leagues: ("EPL" | "La Liga" | "Serie A" | "Bundesliga" | "Ligue 1" | "Eredivisie" | "Liga Portugal")[] = ["EPL", "La Liga", "Serie A", "Bundesliga", "Ligue 1", "Eredivisie", "Liga Portugal"];'
);

fs.writeFileSync('src/context/GameContext.tsx', c);
console.log('Patched GameContext.tsx');
