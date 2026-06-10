const normalize = (str) => {
  return str.toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // remove accents
    .replace(/[^a-z0-9]/g, "") // remove spaces/punctuation
    .replace(/fc|cf|ud|rcd|afc|hotspur|hovealbion|clubde|demadrid/g, ""); // remove common suffixes
};

console.log('marseille:', normalize('Olympique de Marseille'));
console.log('atletico:', normalize('Atlético Madrid'));
console.log('atletico FC25:', normalize('Atlético de Madrid'));

const fs = require('fs');
const clubsCode = fs.readFileSync('./src/config/seededData.ts', 'utf8');
const clubBlockMatches = [...clubsCode.matchAll(/\{\s*id:\s*["']([^"']+)["'],\s*name:\s*["']([^"']+)["']/g)];
const clubs = clubBlockMatches.map(m => ({ id: m[1], name: m[2] }));

const normClub = normalize('Olympique de Marseille');
console.log('normClub:', normClub);
console.log('exact match:', clubs.find(c => normalize(c.name) === normClub));

const fallbackMatch = clubs.find(c => normClub.includes(normalize(c.name)) || normalize(c.name).includes(normClub));
console.log('fallbackMatch:', fallbackMatch);

console.log('what does atletico normalize to?', normalize(clubs.find(c=>c.id==='atletico').name));
