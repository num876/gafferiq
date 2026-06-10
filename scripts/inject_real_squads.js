import fs from 'fs';
import path from 'path';

const realClubs = {
  'bayern': [
    { name: 'Harry Kane', pos: 'ATT' }, { name: 'Jamal Musiala', pos: 'MID' }, { name: 'Leroy Sané', pos: 'ATT' },
    { name: 'Joshua Kimmich', pos: 'MID' }, { name: 'Manuel Neuer', pos: 'GK' }, { name: 'Alphonso Davies', pos: 'DEF' },
    { name: 'Dayot Upamecano', pos: 'DEF' }, { name: 'Kim Min-jae', pos: 'DEF' }, { name: 'Leon Goretzka', pos: 'MID' },
    { name: 'Serge Gnabry', pos: 'ATT' }, { name: 'Kingsley Coman', pos: 'ATT' }, { name: 'João Palhinha', pos: 'MID' },
    { name: 'Michael Olise', pos: 'ATT' }, { name: 'Thomas Müller', pos: 'ATT' }, { name: 'Sven Ulreich', pos: 'GK' },
    { name: 'Raphaël Guerreiro', pos: 'DEF' }, { name: 'Eric Dier', pos: 'DEF' }, { name: 'Aleksandar Pavlović', pos: 'MID' },
    { name: 'Konrad Laimer', pos: 'MID' }, { name: 'Sacha Boey', pos: 'DEF' }, { name: 'Mathys Tel', pos: 'ATT' }
  ],
  'psg': [
    { name: 'Gianluigi Donnarumma', pos: 'GK' }, { name: 'Marquinhos', pos: 'DEF' }, { name: 'Achraf Hakimi', pos: 'DEF' },
    { name: 'Nuno Mendes', pos: 'DEF' }, { name: 'Lucas Beraldo', pos: 'DEF' }, { name: 'Vitinha', pos: 'MID' },
    { name: 'Warren Zaïre-Emery', pos: 'MID' }, { name: 'Fabián Ruiz', pos: 'MID' }, { name: 'Ousmane Dembélé', pos: 'ATT' },
    { name: 'Bradley Barcola', pos: 'ATT' }, { name: 'Gonçalo Ramos', pos: 'ATT' }, { name: 'Randal Kolo Muani', pos: 'ATT' },
    { name: 'Matvey Safonov', pos: 'GK' }, { name: 'Lucas Hernández', pos: 'DEF' }, { name: 'Milan Škriniar', pos: 'DEF' },
    { name: 'Lee Kang-in', pos: 'MID' }, { name: 'Marco Asensio', pos: 'ATT' }, { name: 'João Neves', pos: 'MID' }
  ],
  'inter': [
    { name: 'Yann Sommer', pos: 'GK' }, { name: 'Alessandro Bastoni', pos: 'DEF' }, { name: 'Federico Dimarco', pos: 'DEF' },
    { name: 'Benjamin Pavard', pos: 'DEF' }, { name: 'Stefan de Vrij', pos: 'DEF' }, { name: 'Nicolò Barella', pos: 'MID' },
    { name: 'Hakan Çalhanoğlu', pos: 'MID' }, { name: 'Henrikh Mkhitaryan', pos: 'MID' }, { name: 'Denzel Dumfries', pos: 'MID' },
    { name: 'Lautaro Martínez', pos: 'ATT' }, { name: 'Marcus Thuram', pos: 'ATT' }, { name: 'Piotr Zieliński', pos: 'MID' },
    { name: 'Mehdi Taremi', pos: 'ATT' }, { name: 'Matteo Darmian', pos: 'DEF' }, { name: 'Francesco Acerbi', pos: 'DEF' },
    { name: 'Davide Frattesi', pos: 'MID' }, { name: 'Carlos Augusto', pos: 'DEF' }, { name: 'Josep Martínez', pos: 'GK' }
  ],
  'acmilan': [
    { name: 'Mike Maignan', pos: 'GK' }, { name: 'Theo Hernández', pos: 'DEF' }, { name: 'Fikayo Tomori', pos: 'DEF' },
    { name: 'Malick Thiaw', pos: 'DEF' }, { name: 'Davide Calabria', pos: 'DEF' }, { name: 'Tijjani Reijnders', pos: 'MID' },
    { name: 'Ismaël Bennacer', pos: 'MID' }, { name: 'Ruben Loftus-Cheek', pos: 'MID' }, { name: 'Rafael Leão', pos: 'ATT' },
    { name: 'Christian Pulisic', pos: 'ATT' }, { name: 'Álvaro Morata', pos: 'ATT' }, { name: 'Youssouf Fofana', pos: 'MID' },
    { name: 'Strahinja Pavlović', pos: 'DEF' }, { name: 'Samuel Chukwueze', pos: 'ATT' }, { name: 'Luka Jović', pos: 'ATT' },
    { name: 'Emerson Royal', pos: 'DEF' }, { name: 'Noah Okafor', pos: 'ATT' }, { name: 'Matteo Gabbia', pos: 'DEF' }
  ],
  'juventus': [
    { name: 'Michele Di Gregorio', pos: 'GK' }, { name: 'Bremer', pos: 'DEF' }, { name: 'Danilo', pos: 'DEF' },
    { name: 'Andrea Cambiaso', pos: 'DEF' }, { name: 'Federico Gatti', pos: 'DEF' }, { name: 'Manuel Locatelli', pos: 'MID' },
    { name: 'Douglas Luiz', pos: 'MID' }, { name: 'Khéphren Thuram', pos: 'MID' }, { name: 'Teun Koopmeiners', pos: 'MID' },
    { name: 'Dušan Vlahović', pos: 'ATT' }, { name: 'Kenan Yıldız', pos: 'ATT' }, { name: 'Timothy Weah', pos: 'MID' },
    { name: 'Nico González', pos: 'ATT' }, { name: 'Francisco Conceição', pos: 'ATT' }, { name: 'Pierre Kalulu', pos: 'DEF' },
    { name: 'Mattia Perin', pos: 'GK' }, { name: 'Nicolò Fagioli', pos: 'MID' }, { name: 'Weston McKennie', pos: 'MID' }
  ],
  'dortmund': [
    { name: 'Gregor Kobel', pos: 'GK' }, { name: 'Nico Schlotterbeck', pos: 'DEF' }, { name: 'Waldemar Anton', pos: 'DEF' },
    { name: 'Julian Ryerson', pos: 'DEF' }, { name: 'Ramy Bensebaini', pos: 'DEF' }, { name: 'Emre Can', pos: 'MID' },
    { name: 'Marcel Sabitzer', pos: 'MID' }, { name: 'Pascal Groß', pos: 'MID' }, { name: 'Julian Brandt', pos: 'MID' },
    { name: 'Donyell Malen', pos: 'ATT' }, { name: 'Karim Adeyemi', pos: 'ATT' }, { name: 'Serhou Guirassy', pos: 'ATT' },
    { name: 'Maximilian Beier', pos: 'ATT' }, { name: 'Jamie Bynoe-Gittens', pos: 'ATT' }, { name: 'Yan Couto', pos: 'DEF' },
    { name: 'Alexander Meyer', pos: 'GK' }, { name: 'Felix Nmecha', pos: 'MID' }, { name: 'Giovanni Reyna', pos: 'MID' }
  ],
  'leverkusen': [
    { name: 'Lukas Hradecky', pos: 'GK' }, { name: 'Jonathan Tah', pos: 'DEF' }, { name: 'Edmond Tapsoba', pos: 'DEF' },
    { name: 'Piero Hincapié', pos: 'DEF' }, { name: 'Jeremie Frimpong', pos: 'DEF' }, { name: 'Alejandro Grimaldo', pos: 'DEF' },
    { name: 'Granit Xhaka', pos: 'MID' }, { name: 'Exequiel Palacios', pos: 'MID' }, { name: 'Florian Wirtz', pos: 'MID' },
    { name: 'Victor Boniface', pos: 'ATT' }, { name: 'Patrik Schick', pos: 'ATT' }, { name: 'Robert Andrich', pos: 'MID' },
    { name: 'Martin Terrier', pos: 'ATT' }, { name: 'Aleix García', pos: 'MID' }, { name: 'Nordi Mukiele', pos: 'DEF' },
    { name: 'Amine Adli', pos: 'ATT' }, { name: 'Nathan Tella', pos: 'MID' }, { name: 'Matej Kovar', pos: 'GK' }
  ],
  'tottenham': [
    { name: 'Guglielmo Vicario', pos: 'GK' }, { name: 'Cristian Romero', pos: 'DEF' }, { name: 'Micky van de Ven', pos: 'DEF' },
    { name: 'Pedro Porro', pos: 'DEF' }, { name: 'Destiny Udogie', pos: 'DEF' }, { name: 'Yves Bissouma', pos: 'MID' },
    { name: 'Pape Matar Sarr', pos: 'MID' }, { name: 'James Maddison', pos: 'MID' }, { name: 'Son Heung-min', pos: 'ATT' },
    { name: 'Dejan Kulusevski', pos: 'MID' }, { name: 'Dominic Solanke', pos: 'ATT' }, { name: 'Brennan Johnson', pos: 'ATT' },
    { name: 'Richarlison', pos: 'ATT' }, { name: 'Timo Werner', pos: 'ATT' }, { name: 'Rodrigo Bentancur', pos: 'MID' },
    { name: 'Radu Drăgușin', pos: 'DEF' }, { name: 'Archie Gray', pos: 'MID' }, { name: 'Lucas Bergvall', pos: 'MID' }
  ],
  'newcastle': [
    { name: 'Nick Pope', pos: 'GK' }, { name: 'Sven Botman', pos: 'DEF' }, { name: 'Fabian Schär', pos: 'DEF' },
    { name: 'Kieran Trippier', pos: 'DEF' }, { name: 'Lewis Hall', pos: 'DEF' }, { name: 'Bruno Guimarães', pos: 'MID' },
    { name: 'Sandro Tonali', pos: 'MID' }, { name: 'Joelinton', pos: 'MID' }, { name: 'Anthony Gordon', pos: 'ATT' },
    { name: 'Alexander Isak', pos: 'ATT' }, { name: 'Harvey Barnes', pos: 'ATT' }, { name: 'Dan Burn', pos: 'DEF' },
    { name: 'Sean Longstaff', pos: 'MID' }, { name: 'Callum Wilson', pos: 'ATT' }, { name: 'Tino Livramento', pos: 'DEF' },
    { name: 'Lloyd Kelly', pos: 'DEF' }, { name: 'Martin Dúbravka', pos: 'GK' }, { name: 'Miguel Almirón', pos: 'ATT' }
  ],
  'astonvilla': [
    { name: 'Emiliano Martínez', pos: 'GK' }, { name: 'Pau Torres', pos: 'DEF' }, { name: 'Ezri Konsa', pos: 'DEF' },
    { name: 'Matty Cash', pos: 'DEF' }, { name: 'Lucas Digne', pos: 'DEF' }, { name: 'John McGinn', pos: 'MID' },
    { name: 'Youri Tielemans', pos: 'MID' }, { name: 'Amadou Onana', pos: 'MID' }, { name: 'Leon Bailey', pos: 'ATT' },
    { name: 'Ollie Watkins', pos: 'ATT' }, { name: 'Morgan Rogers', pos: 'MID' }, { name: 'Jhon Durán', pos: 'ATT' },
    { name: 'Ian Maatsen', pos: 'DEF' }, { name: 'Diego Carlos', pos: 'DEF' }, { name: 'Boubacar Kamara', pos: 'MID' },
    { name: 'Jacob Ramsey', pos: 'MID' }, { name: 'Emiliano Buendía', pos: 'MID' }, { name: 'Ross Barkley', pos: 'MID' }
  ],
  'westham': [
    { name: 'Alphonse Areola', pos: 'GK' }, { name: 'Max Kilman', pos: 'DEF' }, { name: 'Jean-Clair Todibo', pos: 'DEF' },
    { name: 'Aaron Wan-Bissaka', pos: 'DEF' }, { name: 'Emerson Palmieri', pos: 'DEF' }, { name: 'Edson Álvarez', pos: 'MID' },
    { name: 'Lucas Paquetá', pos: 'MID' }, { name: 'Mohammed Kudus', pos: 'ATT' }, { name: 'Jarrod Bowen', pos: 'ATT' },
    { name: 'Niclas Füllkrug', pos: 'ATT' }, { name: 'Crysencio Summerville', pos: 'ATT' }, { name: 'Guido Rodríguez', pos: 'MID' },
    { name: 'Tomáš Souček', pos: 'MID' }, { name: 'Michail Antonio', pos: 'ATT' }, { name: 'Carlos Soler', pos: 'MID' },
    { name: 'Vladimír Coufal', pos: 'DEF' }, { name: 'Danny Ings', pos: 'ATT' }, { name: 'Łukasz Fabiański', pos: 'GK' }
  ],
  'napoli': [
    { name: 'Alex Meret', pos: 'GK' }, { name: 'Alessandro Buongiorno', pos: 'DEF' }, { name: 'Amir Rrahmani', pos: 'DEF' },
    { name: 'Giovanni Di Lorenzo', pos: 'DEF' }, { name: 'Mathías Olivera', pos: 'DEF' }, { name: 'Stanislav Lobotka', pos: 'MID' },
    { name: 'André-Frank Zambo Anguissa', pos: 'MID' }, { name: 'Scott McTominay', pos: 'MID' }, { name: 'Khvicha Kvaratskhelia', pos: 'ATT' },
    { name: 'Romelu Lukaku', pos: 'ATT' }, { name: 'David Neres', pos: 'ATT' }, { name: 'Billy Gilmour', pos: 'MID' },
    { name: 'Giacomo Raspadori', pos: 'ATT' }, { name: 'Matteo Politano', pos: 'ATT' }, { name: 'Leonardo Spinazzola', pos: 'DEF' },
    { name: 'Rafa Marín', pos: 'DEF' }, { name: 'Pasquale Mazzocchi', pos: 'DEF' }, { name: 'Cyril Ngonge', pos: 'ATT' }
  ],
  'roma': [
    { name: 'Mile Svilar', pos: 'GK' }, { name: 'Gianluca Mancini', pos: 'DEF' }, { name: 'Evan Ndicka', pos: 'DEF' },
    { name: 'Mats Hummels', pos: 'DEF' }, { name: 'Zeki Çelik', pos: 'DEF' }, { name: 'Angeliño', pos: 'DEF' },
    { name: 'Bryan Cristante', pos: 'MID' }, { name: 'Lorenzo Pellegrini', pos: 'MID' }, { name: 'Manu Koné', pos: 'MID' },
    { name: 'Paulo Dybala', pos: 'ATT' }, { name: 'Artem Dovbyk', pos: 'ATT' }, { name: 'Matías Soulé', pos: 'ATT' },
    { name: 'Stephan El Shaarawy', pos: 'ATT' }, { name: 'Leandro Paredes', pos: 'MID' }, { name: 'Mario Hermoso', pos: 'DEF' },
    { name: 'Enzo Le Fée', pos: 'MID' }, { name: 'Alexis Saelemaekers', pos: 'MID' }, { name: 'Tommaso Baldanzi', pos: 'MID' }
  ],
  'leipzig': [
    { name: 'Péter Gulácsi', pos: 'GK' }, { name: 'Willi Orbán', pos: 'DEF' }, { name: 'Castello Lukeba', pos: 'DEF' },
    { name: 'David Raum', pos: 'DEF' }, { name: 'Benjamin Henrichs', pos: 'DEF' }, { name: 'Xaver Schlager', pos: 'MID' },
    { name: 'Amadou Haidara', pos: 'MID' }, { name: 'Xavi Simons', pos: 'MID' }, { name: 'Christoph Baumgartner', pos: 'MID' },
    { name: 'Loïs Openda', pos: 'ATT' }, { name: 'Benjamin Šeško', pos: 'ATT' }, { name: 'Arthur Vermeeren', pos: 'MID' },
    { name: 'Lutsharel Geertruida', pos: 'DEF' }, { name: 'Antonio Nusa', pos: 'ATT' }, { name: 'Kevin Kampl', pos: 'MID' },
    { name: 'Yussuf Poulsen', pos: 'ATT' }, { name: 'Eljif Elmas', pos: 'MID' }, { name: 'Nicolas Seiwald', pos: 'MID' }
  ],
  'monaco': [
    { name: 'Philipp Köhn', pos: 'GK' }, { name: 'Thilo Kehrer', pos: 'DEF' }, { name: 'Mohammed Salisu', pos: 'DEF' },
    { name: 'Vanderson', pos: 'DEF' }, { name: 'Caio Henrique', pos: 'DEF' }, { name: 'Denis Zakaria', pos: 'MID' },
    { name: 'Lamine Camara', pos: 'MID' }, { name: 'Aleksandr Golovin', pos: 'MID' }, { name: 'Takumi Minamino', pos: 'MID' },
    { name: 'Folarin Balogun', pos: 'ATT' }, { name: 'Breel Embolo', pos: 'ATT' }, { name: 'Eliesse Ben Seghir', pos: 'MID' },
    { name: 'Maghnes Akliouche', pos: 'MID' }, { name: 'Christian Mawissa', pos: 'DEF' }, { name: 'Jordan Teze', pos: 'DEF' },
    { name: 'Wilfried Singo', pos: 'DEF' }, { name: 'Soungoutou Magassa', pos: 'MID' }, { name: 'Krépin Diatta', pos: 'MID' }
  ]
};

function main() {
  const filePath = path.join(__dirname, '..', 'src', 'config', 'realSquads.json');
  let data = {};
  if (fs.existsSync(filePath)) {
    data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  }

  // Collect pool of generic realistic players from the database to pad the squads to 25
  let pool = [];
  for (const club in data) {
    if (data[club]) {
      pool.push(...data[club].filter(p => !p.name.includes(' '))); // simplistic generic pull, but let's just pull any
    }
  }
  // Just use all players in DB as pool
  for (const club in data) pool.push(...data[club]);

  // Remove players we are about to inject
  const knownNames = new Set();
  for (const squad of Object.values(realClubs)) {
    for (const p of squad) knownNames.add(p.name);
  }
  pool = pool.filter(p => !knownNames.has(p.name));
  pool.sort(() => Math.random() - 0.5);

  for (const [clubId, realPlayers] of Object.entries(realClubs)) {
    let squad = [];
    
    // Inject real players
    for (const p of realPlayers) {
      squad.push({
        id: `${clubId}_r_${squad.length + 1}`,
        name: p.name,
        position: p.pos,
        nationality: 'Real' // Mark as synced
      });
    }

    // Pad to 25 with generic players
    const needed = 25 - squad.length;
    let gkCount = squad.filter(p => p.position === 'GK').length;
    let defCount = squad.filter(p => p.position === 'DEF').length;
    let midCount = squad.filter(p => p.position === 'MID').length;
    let attCount = squad.filter(p => p.position === 'ATT').length;

    for (let i = 0; i < needed; i++) {
      const randomPlayer = pool.pop();
      if (!randomPlayer) break;
      
      let pos = 'MID';
      if (gkCount < 3) { pos = 'GK'; gkCount++; }
      else if (defCount < 8) { pos = 'DEF'; defCount++; }
      else if (midCount < 8) { pos = 'MID'; midCount++; }
      else { pos = 'ATT'; attCount++; }

      squad.push({
        id: `${clubId}_r_${squad.length + 1}`,
        name: randomPlayer.name,
        position: pos,
        nationality: 'Real'
      });
    }

    data[clubId] = squad;
    console.log(`Successfully hardcoded elite squad for ${clubId}`);
  }

  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  console.log('Synchronized elite clubs!');
}

main();
