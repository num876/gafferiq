const fs = require('fs');
let c = fs.readFileSync('src/app/game/finances/page.tsx', 'utf8');
// Replace escaped backticks with actual backticks
c = c.split('\\`').join('`');
fs.writeFileSync('src/app/game/finances/page.tsx', c);
console.log('Fixed backticks in finances/page.tsx');
