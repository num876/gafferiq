const fs = require('fs');

let lines = fs.readFileSync('src/app/game/match/page.tsx', 'utf8').split('\n');

// The bad chunk is from the duplicated `const router = useRouter();` (around 437)
// up to `  const awayLineups = useRef(autoSelectLineup(awaySquad, "4-3-3"));` (around 475)
// and `// Setup the ticker` (480).

// Let's just find the exact indices.
const startIndex = lines.findIndex(l => l.includes('const router = useRouter();') && lines.indexOf(l) > 300); 
const endIndex = lines.findIndex((l, i) => i > startIndex && l.includes('// Setup the ticker'));

if (startIndex !== -1 && endIndex !== -1) {
  // We need to restore `return; }` at startIndex-1 if it's missing.
  // Then delete startIndex to endIndex - 1.
  lines.splice(startIndex - 1, endIndex - startIndex + 1, '          return;', '        }');
  fs.writeFileSync('src/app/game/match/page.tsx', lines.join('\n'));
  console.log("Fixed mangled match viewer!");
} else {
  console.log("Could not find boundaries.");
}
