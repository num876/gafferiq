const fs=require('fs');
const d=JSON.parse(fs.readFileSync('./src/config/realSquads.json'));
Object.keys(d).forEach(k => {
  if (k === 'atletico' || k === 'marseille') {
    console.log(k, d[k].map(p=>p.name).join(', '));
  }
});
const code=fs.readFileSync('./src/config/seededData.ts', 'utf8');
const clubBlockMatches=[...code.matchAll(/\{\s*id:\s*["']([^"']+)["'],\s*name:\s*["']([^"']+)["']/g)];
const clubs=clubBlockMatches.map(m=>({id:m[1],name:m[2]}));
console.log('atletico in seededData:', clubs.find(c=>c.id==='atletico'));
console.log('marseille in seededData:', clubs.find(c=>c.name.toLowerCase().includes('marseille')));
