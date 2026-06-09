const fs = require('fs');

let content = fs.readFileSync('src/app/game/match/page.tsx', 'utf8');

const oldGetPlayerPosition = `const getPlayerPosition = (player: Player, isHome: boolean, index: number, zone: Zone, clock: number) => {
  let baseY = 15 + (index * 7);
  let baseX = isHome ? 30 : 70;
  
  if (player.position === "GK") { baseX = isHome ? 5 : 95; baseY = 50; }
  else if (player.position === "DEF") baseX = isHome ? 20 : 80;
  else if (player.position === "MID") baseX = isHome ? 50 : 50;
  else if (player.position === "ATT") baseX = isHome ? 75 : 25;

  // Shift dynamically based on possession zone
  if (zone === "home-third") {
     if (isHome) baseX -= 5;
     else baseX -= 15;
  } else if (zone === "away-third") {
     if (isHome) baseX += 15;
     else baseX += 5;
  }

  const jitter = getJitter(player.id, clock);
  return { x: Math.min(100, Math.max(0, baseX + jitter.x)), y: Math.min(100, Math.max(0, baseY + jitter.y)) };
};`;

const newGetPlayerPosition = `const getPlayerPosition = (player: Player, isHome: boolean, starters: Player[], zone: Zone, clock: number) => {
  let baseX = isHome ? 30 : 70;
  let baseY = 50;
  
  if (player.position === "GK") { 
    baseX = isHome ? 5 : 95; 
    baseY = 50; 
  } else {
    if (player.position === "DEF") baseX = isHome ? 20 : 80;
    else if (player.position === "MID") baseX = isHome ? 50 : 50;
    else if (player.position === "ATT") baseX = isHome ? 75 : 25;

    // Calculate Y spacing based on formation
    const lineMates = starters.filter(p => p.position === player.position);
    const indexInLine = lineMates.findIndex(p => p.id === player.id);
    
    if (lineMates.length === 1) {
      baseY = 50;
    } else {
      // Spread evenly between 20% and 80% of the pitch height
      const spacing = 60 / (lineMates.length - 1);
      baseY = 20 + (indexInLine * spacing);
    }
  }

  // Shift dynamically based on possession zone
  if (zone === "home-third") {
     if (isHome) baseX -= 5;
     else baseX -= 15;
  } else if (zone === "away-third") {
     if (isHome) baseX += 15;
     else baseX += 5;
  }

  const jitter = getJitter(player.id, clock);
  return { x: Math.min(100, Math.max(0, baseX + jitter.x)), y: Math.min(100, Math.max(0, baseY + jitter.y)) };
};`;

content = content.replace(oldGetPlayerPosition, newGetPlayerPosition);

// Now update the calls
// We need to replace `getPlayerPosition(..., true, index, ...)` with `getPlayerPosition(..., true, starters, ...)`

content = content.replace(
  /getPlayerPosition\(homeLineups\.current\.starters\[homeIdx\], true, homeIdx, state\.currentZone, state\.clock\)/g,
  'getPlayerPosition(homeLineups.current.starters[homeIdx], true, homeLineups.current.starters, state.currentZone, state.clock)'
);

content = content.replace(
  /getPlayerPosition\(awayLineups\.current\.starters\[awayIdx\], false, awayIdx, state\.currentZone, state\.clock\)/g,
  'getPlayerPosition(awayLineups.current.starters[awayIdx], false, awayLineups.current.starters, state.currentZone, state.clock)'
);

content = content.replace(
  /getPlayerPosition\(p, true, i, state\.currentZone, state\.clock\)/g,
  'getPlayerPosition(p, true, homeLineups.current.starters, state.currentZone, state.clock)'
);

content = content.replace(
  /getPlayerPosition\(p, false, i, state\.currentZone, state\.clock\)/g,
  'getPlayerPosition(p, false, awayLineups.current.starters, state.currentZone, state.clock)'
);

fs.writeFileSync('src/app/game/match/page.tsx', content);
console.log('Patched match formation shape.');
