const fs = require('fs');
const content = fs.readFileSync('src/app/game/match/page.tsx', 'utf8');

const stack = [];
const lines = content.split('\n');

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  for (let j = 0; j < line.length; j++) {
    const char = line[j];
    if (char === '{' || char === '(' || char === '[') {
      stack.push({ char, line: i + 1, col: j + 1 });
    } else if (char === '}' || char === ')' || char === ']') {
      const last = stack[stack.length - 1];
      if (
        (char === '}' && last && last.char === '{') ||
        (char === ')' && last && last.char === '(') ||
        (char === ']' && last && last.char === '[')
      ) {
        stack.pop();
      } else {
        console.log(`Mismatch at line ${i + 1}:${j + 1}. Found ${char}, expected matching for ${last ? last.char : 'nothing'}`);
      }
    }
  }
}

if (stack.length > 0) {
  console.log("Unclosed brackets:");
  stack.forEach(s => console.log(`- ${s.char} at line ${s.line}:${s.col}`));
} else {
  console.log("All brackets balanced!");
}
