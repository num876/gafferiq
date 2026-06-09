const fs = require('fs');
const content = fs.readFileSync('src/app/game/match/page.tsx', 'utf8');

let count = 0;
for (let i=0; i<content.length; i++) {
  if (content[i] === '{') count++;
  if (content[i] === '}') count--;
}
console.log("Brace balance:", count);
