const fs = require('fs');
let content = fs.readFileSync('./src/config/seededData.ts', 'utf-8');

// Remove all logoUrl properties that were injected by the broken script
content = content.replace(/logoUrl: "[^"]+",\s*/g, '');

// Also remove the logoUrl field from the interface if it was added
content = content.replace(/\s*logoUrl\?: string;\n/, '\n');

fs.writeFileSync('./src/config/seededData.ts', content);
console.log('Cleaned up seededData.ts');
