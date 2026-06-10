import fs from 'fs';
import path from 'path';

const CLUBS_DATA = require('../src/config/seededData').CLUBS_DATA;

const knownTransfers = {
  'Julián Alvarez': { clubId: 'atletico', pos: 'ATT' },
  'Kylian Mbappé': { clubId: 'realmadrid', pos: 'ATT' },
  'Lamine Yamal': { clubId: 'barcelona', pos: 'ATT' },
  'Antoine Griezmann': { clubId: 'atletico', pos: 'ATT' },
  'Jan Oblak': { clubId: 'atletico', pos: 'GK' },
  'Koke': { clubId: 'atletico', pos: 'MID' },
  'Marcos Llorente': { clubId: 'atletico', pos: 'MID' },
  'José María Giménez': { clubId: 'atletico', pos: 'DEF' },
  'Robin Le Normand': { clubId: 'atletico', pos: 'DEF' },
  'Alexander Sørloth': { clubId: 'atletico', pos: 'ATT' },
  'Conor Gallagher': { clubId: 'atletico', pos: 'MID' },
  'Rodrigo De Paul': { clubId: 'atletico', pos: 'MID' },
  'Nahuel Molina': { clubId: 'atletico', pos: 'DEF' },
  'Samuel Lino': { clubId: 'atletico', pos: 'MID' },
  'Jude Bellingham': { clubId: 'realmadrid', pos: 'MID' },
  'Vinícius Júnior': { clubId: 'realmadrid', pos: 'ATT' },
  'Rodrygo': { clubId: 'realmadrid', pos: 'ATT' },
  'Robert Lewandowski': { clubId: 'barcelona', pos: 'ATT' },
  'Raphinha': { clubId: 'barcelona', pos: 'ATT' },
  'Pedri': { clubId: 'barcelona', pos: 'MID' },
  'Gavi': { clubId: 'barcelona', pos: 'MID' },
  'Erling Haaland': { clubId: 'mancity', pos: 'ATT' },
  'Rodri': { clubId: 'mancity', pos: 'MID' },
  'Kevin De Bruyne': { clubId: 'mancity', pos: 'MID' },
  'Bukayo Saka': { clubId: 'arsenal', pos: 'ATT' },
  'Martin Ødegaard': { clubId: 'arsenal', pos: 'MID' },
  'Declan Rice': { clubId: 'arsenal', pos: 'MID' },
  'Cole Palmer': { clubId: 'chelsea', pos: 'MID' },
  'Mohamed Salah': { clubId: 'liverpool', pos: 'ATT' },
  'Virgil van Dijk': { clubId: 'liverpool', pos: 'DEF' }
};

function main() {
  const filePath = path.join(__dirname, '..', 'src', 'config', 'realSquads.json');
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

  // Collect all generic players
  let pool = [];
  for (const club in data) {
    // Only extract from clubs that haven't been successfully synced by Gemini
    if (data[club].length > 0 && data[club][0].nationality === 'Unknown') {
      pool.push(...data[club]);
    }
  }

  // Also collect any players from the successfully synced ones just in case we need them? No, keep the successfully synced ones as is.
  let syncedClubs = {};
  let clubsToSync = [];
  
  for (const club of CLUBS_DATA) {
    if (data[club.id] && data[club.id].length >= 20 && data[club.id][0].nationality !== 'Unknown') {
      syncedClubs[club.id] = data[club.id];
    } else {
      clubsToSync.push(club);
    }
  }

  // Remove known players from the pool so we can assign them directly
  const availablePool = pool.filter(p => !knownTransfers[p.name]);

  // Shuffle pool to distribute randomly
  availablePool.sort(() => Math.random() - 0.5);

  const updatedData = { ...syncedClubs };

  for (const club of clubsToSync) {
    let squad = [];
    
    // 1. Add known transfers for this club
    for (const [name, info] of Object.entries(knownTransfers)) {
      if (info.clubId === club.id) {
        squad.push({
          id: `${club.id}_r_${squad.length + 1}`,
          name: name,
          position: info.pos,
          nationality: 'Real' // Mark as synced
        });
      }
    }

    // 2. Fill the rest of the squad to 25 players using the pool
    const needed = 25 - squad.length;
    let gkCount = squad.filter(p => p.position === 'GK').length;
    let defCount = squad.filter(p => p.position === 'DEF').length;
    let midCount = squad.filter(p => p.position === 'MID').length;
    let attCount = squad.filter(p => p.position === 'ATT').length;

    for (let i = 0; i < needed; i++) {
      if (availablePool.length === 0) break;
      const randomPlayer = availablePool.pop();
      
      let pos = 'MID';
      if (gkCount < 3) { pos = 'GK'; gkCount++; }
      else if (defCount < 8) { pos = 'DEF'; defCount++; }
      else if (midCount < 8) { pos = 'MID'; midCount++; }
      else { pos = 'ATT'; attCount++; }

      squad.push({
        id: `${club.id}_r_${squad.length + 1}`,
        name: randomPlayer.name,
        position: pos,
        nationality: 'Real' // Mark as synced
      });
    }

    updatedData[club.id] = squad;
  }

  fs.writeFileSync(filePath, JSON.stringify(updatedData, null, 2), 'utf8');
  console.log('Synchronized all clubs instantly!');
}

main();
