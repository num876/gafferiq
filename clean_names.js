const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'config', 'realSquads.json');

try {
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  let cleanedCount = 0;

  for (const clubId in data) {
    const squad = data[clubId];
    for (const player of squad) {
      if (player.name.includes('(')) {
        const oldName = player.name;
        // Remove anything in parentheses (e.g. " (footballer, born 1999)")
        player.name = player.name.replace(/\s*\(.*?\)\s*/g, '').trim();
        console.log(`Cleaned: "${oldName}" -> "${player.name}"`);
        cleanedCount++;
      }
    }
  }

  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  console.log(`\nSuccessfully cleaned ${cleanedCount} player names.`);
} catch (e) {
  console.error("Error:", e);
}
