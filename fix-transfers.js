const fs = require('fs');

let content = fs.readFileSync('src/app/game/transfers/page.tsx', 'utf8');

const modalStateRegex = /\/\/ Modal \/ Interaction states[\s\S]*?const \[isPending, setIsPending\] = useState\(false\);/;
const match = content.match(modalStateRegex);

if (match) {
  content = content.replace(match[0], ''); // Remove from bottom
  
  // Find top of component
  const componentStart = /const \{ activeSave, updateActiveSave \} = useGame\(\);/;
  content = content.replace(componentStart, "const { activeSave, updateActiveSave } = useGame();\n\n  " + match[0]);
  
  fs.writeFileSync('src/app/game/transfers/page.tsx', content);
  console.log("Transfers states moved to top.");
} else {
  console.log("Could not find states block.");
}
