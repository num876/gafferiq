import fs from 'fs';
import path from 'path';

const CLUBS_DATA = require('../src/config/seededData').CLUBS_DATA;

const realClubs = {
  // [Previously injected elite clubs...]
  'bayern': [
    { name: 'Harry Kane', pos: 'ATT' }, { name: 'Jamal Musiala', pos: 'MID' }, { name: 'Leroy Sané', pos: 'ATT' },
    { name: 'Joshua Kimmich', pos: 'MID' }, { name: 'Manuel Neuer', pos: 'GK' }, { name: 'Alphonso Davies', pos: 'DEF' },
    { name: 'Dayot Upamecano', pos: 'DEF' }, { name: 'Kim Min-jae', pos: 'DEF' }, { name: 'Leon Goretzka', pos: 'MID' },
    { name: 'Serge Gnabry', pos: 'ATT' }, { name: 'Kingsley Coman', pos: 'ATT' }, { name: 'João Palhinha', pos: 'MID' },
    { name: 'Michael Olise', pos: 'ATT' }, { name: 'Thomas Müller', pos: 'ATT' }
  ],
  'psg': [
    { name: 'Gianluigi Donnarumma', pos: 'GK' }, { name: 'Marquinhos', pos: 'DEF' }, { name: 'Achraf Hakimi', pos: 'DEF' },
    { name: 'Nuno Mendes', pos: 'DEF' }, { name: 'Lucas Beraldo', pos: 'DEF' }, { name: 'Vitinha', pos: 'MID' },
    { name: 'Warren Zaïre-Emery', pos: 'MID' }, { name: 'Fabián Ruiz', pos: 'MID' }, { name: 'Ousmane Dembélé', pos: 'ATT' },
    { name: 'Bradley Barcola', pos: 'ATT' }, { name: 'Gonçalo Ramos', pos: 'ATT' }, { name: 'Randal Kolo Muani', pos: 'ATT' }
  ],
  'inter': [
    { name: 'Yann Sommer', pos: 'GK' }, { name: 'Alessandro Bastoni', pos: 'DEF' }, { name: 'Federico Dimarco', pos: 'DEF' },
    { name: 'Benjamin Pavard', pos: 'DEF' }, { name: 'Stefan de Vrij', pos: 'DEF' }, { name: 'Nicolò Barella', pos: 'MID' },
    { name: 'Hakan Çalhanoğlu', pos: 'MID' }, { name: 'Henrikh Mkhitaryan', pos: 'MID' }, { name: 'Denzel Dumfries', pos: 'MID' },
    { name: 'Lautaro Martínez', pos: 'ATT' }, { name: 'Marcus Thuram', pos: 'ATT' }, { name: 'Piotr Zieliński', pos: 'MID' }
  ],
  'acmilan': [
    { name: 'Mike Maignan', pos: 'GK' }, { name: 'Theo Hernández', pos: 'DEF' }, { name: 'Fikayo Tomori', pos: 'DEF' },
    { name: 'Malick Thiaw', pos: 'DEF' }, { name: 'Davide Calabria', pos: 'DEF' }, { name: 'Tijjani Reijnders', pos: 'MID' },
    { name: 'Ismaël Bennacer', pos: 'MID' }, { name: 'Ruben Loftus-Cheek', pos: 'MID' }, { name: 'Rafael Leão', pos: 'ATT' },
    { name: 'Christian Pulisic', pos: 'ATT' }, { name: 'Álvaro Morata', pos: 'ATT' }, { name: 'Youssouf Fofana', pos: 'MID' }
  ],
  'juventus': [
    { name: 'Michele Di Gregorio', pos: 'GK' }, { name: 'Bremer', pos: 'DEF' }, { name: 'Danilo', pos: 'DEF' },
    { name: 'Andrea Cambiaso', pos: 'DEF' }, { name: 'Federico Gatti', pos: 'DEF' }, { name: 'Manuel Locatelli', pos: 'MID' },
    { name: 'Douglas Luiz', pos: 'MID' }, { name: 'Khéphren Thuram', pos: 'MID' }, { name: 'Teun Koopmeiners', pos: 'MID' },
    { name: 'Dušan Vlahović', pos: 'ATT' }, { name: 'Kenan Yıldız', pos: 'ATT' }, { name: 'Timothy Weah', pos: 'MID' }
  ],
  'dortmund': [
    { name: 'Gregor Kobel', pos: 'GK' }, { name: 'Nico Schlotterbeck', pos: 'DEF' }, { name: 'Waldemar Anton', pos: 'DEF' },
    { name: 'Julian Ryerson', pos: 'DEF' }, { name: 'Ramy Bensebaini', pos: 'DEF' }, { name: 'Emre Can', pos: 'MID' },
    { name: 'Marcel Sabitzer', pos: 'MID' }, { name: 'Pascal Groß', pos: 'MID' }, { name: 'Julian Brandt', pos: 'MID' },
    { name: 'Donyell Malen', pos: 'ATT' }, { name: 'Karim Adeyemi', pos: 'ATT' }, { name: 'Serhou Guirassy', pos: 'ATT' }
  ],
  'leverkusen': [
    { name: 'Lukas Hradecky', pos: 'GK' }, { name: 'Jonathan Tah', pos: 'DEF' }, { name: 'Edmond Tapsoba', pos: 'DEF' },
    { name: 'Piero Hincapié', pos: 'DEF' }, { name: 'Jeremie Frimpong', pos: 'DEF' }, { name: 'Alejandro Grimaldo', pos: 'DEF' },
    { name: 'Granit Xhaka', pos: 'MID' }, { name: 'Exequiel Palacios', pos: 'MID' }, { name: 'Florian Wirtz', pos: 'MID' },
    { name: 'Victor Boniface', pos: 'ATT' }, { name: 'Patrik Schick', pos: 'ATT' }, { name: 'Robert Andrich', pos: 'MID' }
  ],
  'tottenham': [
    { name: 'Guglielmo Vicario', pos: 'GK' }, { name: 'Cristian Romero', pos: 'DEF' }, { name: 'Micky van de Ven', pos: 'DEF' },
    { name: 'Pedro Porro', pos: 'DEF' }, { name: 'Destiny Udogie', pos: 'DEF' }, { name: 'Yves Bissouma', pos: 'MID' },
    { name: 'Pape Matar Sarr', pos: 'MID' }, { name: 'James Maddison', pos: 'MID' }, { name: 'Son Heung-min', pos: 'ATT' },
    { name: 'Dejan Kulusevski', pos: 'MID' }, { name: 'Dominic Solanke', pos: 'ATT' }, { name: 'Brennan Johnson', pos: 'ATT' }
  ],
  'newcastle': [
    { name: 'Nick Pope', pos: 'GK' }, { name: 'Sven Botman', pos: 'DEF' }, { name: 'Fabian Schär', pos: 'DEF' },
    { name: 'Kieran Trippier', pos: 'DEF' }, { name: 'Lewis Hall', pos: 'DEF' }, { name: 'Bruno Guimarães', pos: 'MID' },
    { name: 'Sandro Tonali', pos: 'MID' }, { name: 'Joelinton', pos: 'MID' }, { name: 'Anthony Gordon', pos: 'ATT' },
    { name: 'Alexander Isak', pos: 'ATT' }, { name: 'Harvey Barnes', pos: 'ATT' }, { name: 'Dan Burn', pos: 'DEF' }
  ],
  'astonvilla': [
    { name: 'Emiliano Martínez', pos: 'GK' }, { name: 'Pau Torres', pos: 'DEF' }, { name: 'Ezri Konsa', pos: 'DEF' },
    { name: 'Matty Cash', pos: 'DEF' }, { name: 'Lucas Digne', pos: 'DEF' }, { name: 'John McGinn', pos: 'MID' },
    { name: 'Youri Tielemans', pos: 'MID' }, { name: 'Amadou Onana', pos: 'MID' }, { name: 'Leon Bailey', pos: 'ATT' },
    { name: 'Ollie Watkins', pos: 'ATT' }, { name: 'Morgan Rogers', pos: 'MID' }, { name: 'Jhon Durán', pos: 'ATT' }
  ],
  'westham': [
    { name: 'Alphonse Areola', pos: 'GK' }, { name: 'Max Kilman', pos: 'DEF' }, { name: 'Jean-Clair Todibo', pos: 'DEF' },
    { name: 'Aaron Wan-Bissaka', pos: 'DEF' }, { name: 'Emerson Palmieri', pos: 'DEF' }, { name: 'Edson Álvarez', pos: 'MID' },
    { name: 'Lucas Paquetá', pos: 'MID' }, { name: 'Mohammed Kudus', pos: 'ATT' }, { name: 'Jarrod Bowen', pos: 'ATT' },
    { name: 'Niclas Füllkrug', pos: 'ATT' }, { name: 'Crysencio Summerville', pos: 'ATT' }, { name: 'Guido Rodríguez', pos: 'MID' }
  ],
  'napoli': [
    { name: 'Alex Meret', pos: 'GK' }, { name: 'Alessandro Buongiorno', pos: 'DEF' }, { name: 'Amir Rrahmani', pos: 'DEF' },
    { name: 'Giovanni Di Lorenzo', pos: 'DEF' }, { name: 'Mathías Olivera', pos: 'DEF' }, { name: 'Stanislav Lobotka', pos: 'MID' },
    { name: 'André-Frank Zambo Anguissa', pos: 'MID' }, { name: 'Scott McTominay', pos: 'MID' }, { name: 'Khvicha Kvaratskhelia', pos: 'ATT' },
    { name: 'Romelu Lukaku', pos: 'ATT' }, { name: 'David Neres', pos: 'ATT' }, { name: 'Billy Gilmour', pos: 'MID' }
  ],
  'roma': [
    { name: 'Mile Svilar', pos: 'GK' }, { name: 'Gianluca Mancini', pos: 'DEF' }, { name: 'Evan Ndicka', pos: 'DEF' },
    { name: 'Mats Hummels', pos: 'DEF' }, { name: 'Zeki Çelik', pos: 'DEF' }, { name: 'Angeliño', pos: 'DEF' },
    { name: 'Bryan Cristante', pos: 'MID' }, { name: 'Lorenzo Pellegrini', pos: 'MID' }, { name: 'Manu Koné', pos: 'MID' },
    { name: 'Paulo Dybala', pos: 'ATT' }, { name: 'Artem Dovbyk', pos: 'ATT' }, { name: 'Matías Soulé', pos: 'ATT' }
  ],
  'leipzig': [
    { name: 'Péter Gulácsi', pos: 'GK' }, { name: 'Willi Orbán', pos: 'DEF' }, { name: 'Castello Lukeba', pos: 'DEF' },
    { name: 'David Raum', pos: 'DEF' }, { name: 'Benjamin Henrichs', pos: 'DEF' }, { name: 'Xaver Schlager', pos: 'MID' },
    { name: 'Amadou Haidara', pos: 'MID' }, { name: 'Xavi Simons', pos: 'MID' }, { name: 'Christoph Baumgartner', pos: 'MID' },
    { name: 'Loïs Openda', pos: 'ATT' }, { name: 'Benjamin Šeško', pos: 'ATT' }, { name: 'Arthur Vermeeren', pos: 'MID' }
  ],
  'monaco': [
    { name: 'Philipp Köhn', pos: 'GK' }, { name: 'Thilo Kehrer', pos: 'DEF' }, { name: 'Mohammed Salisu', pos: 'DEF' },
    { name: 'Vanderson', pos: 'DEF' }, { name: 'Caio Henrique', pos: 'DEF' }, { name: 'Denis Zakaria', pos: 'MID' },
    { name: 'Lamine Camara', pos: 'MID' }, { name: 'Aleksandr Golovin', pos: 'MID' }, { name: 'Takumi Minamino', pos: 'MID' },
    { name: 'Folarin Balogun', pos: 'ATT' }, { name: 'Breel Embolo', pos: 'ATT' }, { name: 'Eliesse Ben Seghir', pos: 'MID' }
  ],
  'realmadrid': [
    { name: 'Thibaut Courtois', pos: 'GK' }, { name: 'Éder Militão', pos: 'DEF' }, { name: 'Antonio Rüdiger', pos: 'DEF' },
    { name: 'Dani Carvajal', pos: 'DEF' }, { name: 'Ferland Mendy', pos: 'DEF' }, { name: 'Jude Bellingham', pos: 'MID' },
    { name: 'Federico Valverde', pos: 'MID' }, { name: 'Aurélien Tchouaméni', pos: 'MID' }, { name: 'Eduardo Camavinga', pos: 'MID' },
    { name: 'Vinícius Júnior', pos: 'ATT' }, { name: 'Kylian Mbappé', pos: 'ATT' }, { name: 'Rodrygo', pos: 'ATT' }
  ],
  'barcelona': [
    { name: 'Marc-André ter Stegen', pos: 'GK' }, { name: 'Ronald Araújo', pos: 'DEF' }, { name: 'Pau Cubarsí', pos: 'DEF' },
    { name: 'Jules Koundé', pos: 'DEF' }, { name: 'Alejandro Balde', pos: 'DEF' }, { name: 'Pedri', pos: 'MID' },
    { name: 'Gavi', pos: 'MID' }, { name: 'Frenkie de Jong', pos: 'MID' }, { name: 'Dani Olmo', pos: 'MID' },
    { name: 'Lamine Yamal', pos: 'ATT' }, { name: 'Robert Lewandowski', pos: 'ATT' }, { name: 'Raphinha', pos: 'ATT' }
  ],
  'atletico': [
    { name: 'Jan Oblak', pos: 'GK' }, { name: 'José María Giménez', pos: 'DEF' }, { name: 'Robin Le Normand', pos: 'DEF' },
    { name: 'Nahuel Molina', pos: 'DEF' }, { name: 'Samuel Lino', pos: 'DEF' }, { name: 'Koke', pos: 'MID' },
    { name: 'Marcos Llorente', pos: 'MID' }, { name: 'Rodrigo De Paul', pos: 'MID' }, { name: 'Conor Gallagher', pos: 'MID' },
    { name: 'Julián Alvarez', pos: 'ATT' }, { name: 'Antoine Griezmann', pos: 'ATT' }, { name: 'Alexander Sørloth', pos: 'ATT' }
  ],
  'mancity': [
    { name: 'Ederson', pos: 'GK' }, { name: 'Rúben Dias', pos: 'DEF' }, { name: 'John Stones', pos: 'DEF' },
    { name: 'Kyle Walker', pos: 'DEF' }, { name: 'Joško Gvardiol', pos: 'DEF' }, { name: 'Rodri', pos: 'MID' },
    { name: 'Kevin De Bruyne', pos: 'MID' }, { name: 'Bernardo Silva', pos: 'MID' }, { name: 'Phil Foden', pos: 'ATT' },
    { name: 'Erling Haaland', pos: 'ATT' }, { name: 'Jérémy Doku', pos: 'ATT' }, { name: 'Mateo Kovačić', pos: 'MID' }
  ],
  'arsenal': [
    { name: 'David Raya', pos: 'GK' }, { name: 'William Saliba', pos: 'DEF' }, { name: 'Gabriel Magalhães', pos: 'DEF' },
    { name: 'Ben White', pos: 'DEF' }, { name: 'Riccardo Calafiori', pos: 'DEF' }, { name: 'Declan Rice', pos: 'MID' },
    { name: 'Martin Ødegaard', pos: 'MID' }, { name: 'Thomas Partey', pos: 'MID' }, { name: 'Mikel Merino', pos: 'MID' },
    { name: 'Bukayo Saka', pos: 'ATT' }, { name: 'Kai Havertz', pos: 'ATT' }, { name: 'Gabriel Martinelli', pos: 'ATT' }
  ],
  'liverpool': [
    { name: 'Alisson', pos: 'GK' }, { name: 'Virgil van Dijk', pos: 'DEF' }, { name: 'Ibrahima Konaté', pos: 'DEF' },
    { name: 'Trent Alexander-Arnold', pos: 'DEF' }, { name: 'Andrew Robertson', pos: 'DEF' }, { name: 'Alexis Mac Allister', pos: 'MID' },
    { name: 'Ryan Gravenberch', pos: 'MID' }, { name: 'Dominik Szoboszlai', pos: 'MID' }, { name: 'Mohamed Salah', pos: 'ATT' },
    { name: 'Diogo Jota', pos: 'ATT' }, { name: 'Luis Díaz', pos: 'ATT' }, { name: 'Cody Gakpo', pos: 'ATT' }
  ],
  'chelsea': [
    { name: 'Robert Sánchez', pos: 'GK' }, { name: 'Levi Colwill', pos: 'DEF' }, { name: 'Wesley Fofana', pos: 'DEF' },
    { name: 'Reece James', pos: 'DEF' }, { name: 'Marc Cucurella', pos: 'DEF' }, { name: 'Enzo Fernández', pos: 'MID' },
    { name: 'Moisés Caicedo', pos: 'MID' }, { name: 'Cole Palmer', pos: 'MID' }, { name: 'Noni Madueke', pos: 'ATT' },
    { name: 'Nicolas Jackson', pos: 'ATT' }, { name: 'Jadon Sancho', pos: 'ATT' }, { name: 'Pedro Neto', pos: 'ATT' }
  ]
};

function main() {
  const filePath = path.join(__dirname, '..', 'src', 'config', 'realSquads.json');
  let data = {};
  if (fs.existsSync(filePath)) {
    data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  }

  // Build a league-specific pool of names
  let leaguePool = {};
  
  // We'll read the names from the existing realistic squad data (even if it's the old hallucinated one, the names match the native language of the club!)
  // E.g. Serbian clubs had Serbian names. Spanish clubs had Spanish names.
  // The original hallucinated data was generated by an LLM with realistic names, just wrong players.
  for (const club of CLUBS_DATA) {
    if (!leaguePool[club.leagueId]) {
      leaguePool[club.leagueId] = [];
    }
    if (data[club.id]) {
      leaguePool[club.leagueId].push(...data[club.id].filter(p => !p.name.includes(' '))); // Generic check
    }
  }

  // Backup pool of all names just in case
  let allPool = [];
  for (const club in data) {
    if (data[club]) allPool.push(...data[club]);
  }

  const knownNames = new Set();
  for (const squad of Object.values(realClubs)) {
    for (const p of squad) knownNames.add(p.name);
  }

  for (const league in leaguePool) {
    leaguePool[league] = leaguePool[league].filter(p => !knownNames.has(p.name));
    leaguePool[league].sort(() => Math.random() - 0.5);
  }
  allPool = allPool.filter(p => !knownNames.has(p.name));
  allPool.sort(() => Math.random() - 0.5);

  const updatedData = {};

  for (const club of CLUBS_DATA) {
    let squad = [];
    
    // Inject real players if elite club
    if (realClubs[club.id]) {
      for (const p of realClubs[club.id]) {
        squad.push({
          id: `${club.id}_r_${squad.length + 1}`,
          name: p.name,
          position: p.pos,
          nationality: 'Real'
        });
      }
    }

    // Pad to 25 with generic players from the SAME LEAGUE
    const needed = 25 - squad.length;
    let gkCount = squad.filter(p => p.position === 'GK').length;
    let defCount = squad.filter(p => p.position === 'DEF').length;
    let midCount = squad.filter(p => p.position === 'MID').length;
    let attCount = squad.filter(p => p.position === 'ATT').length;

    for (let i = 0; i < needed; i++) {
      let randomPlayer = null;
      if (leaguePool[club.leagueId] && leaguePool[club.leagueId].length > 0) {
        randomPlayer = leaguePool[club.leagueId].pop();
      } else {
        randomPlayer = allPool.pop();
      }
      
      if (!randomPlayer) break;
      
      let pos = 'MID';
      if (gkCount < 3) { pos = 'GK'; gkCount++; }
      else if (defCount < 8) { pos = 'DEF'; defCount++; }
      else if (midCount < 8) { pos = 'MID'; midCount++; }
      else { pos = 'ATT'; attCount++; }

      squad.push({
        id: `${club.id}_r_${squad.length + 1}`,
        name: randomPlayer.name,
        position: pos,
        nationality: 'Real'
      });
    }

    updatedData[club.id] = squad;
  }

  fs.writeFileSync(filePath, JSON.stringify(updatedData, null, 2), 'utf8');
  console.log('Synchronized all clubs with league-specific name pooling!');
}

main();
