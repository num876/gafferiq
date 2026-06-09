const fs = require('fs');

let content = fs.readFileSync('src/app/game/match/page.tsx', 'utf8');

const oldLineup = `  // We memoize starters so they don't regenerate every render
  const homeLineups = useRef(autoSelectLineup(homeSquad, "4-3-3"));
  const awayLineups = useRef(autoSelectLineup(awaySquad, "4-3-3"));`;

const newLineup = `  // We memoize starters so they don't regenerate every render
  const homeLineups = useRef((() => {
    if (isHome && activeSave.tactics && activeSave.tactics.starters.length === 11) {
      return {
        starters: activeSave.tactics.starters.map(id => homeSquad.find(p => p.id === id)).filter(Boolean) as Player[],
        bench: activeSave.tactics.bench.map(id => homeSquad.find(p => p.id === id)).filter(Boolean) as Player[]
      };
    }
    return autoSelectLineup(homeSquad, "4-3-3");
  })());

  const awayLineups = useRef((() => {
    if (!isHome && activeSave.tactics && activeSave.tactics.starters.length === 11) {
      return {
        starters: activeSave.tactics.starters.map(id => awaySquad.find(p => p.id === id)).filter(Boolean) as Player[],
        bench: activeSave.tactics.bench.map(id => awaySquad.find(p => p.id === id)).filter(Boolean) as Player[]
      };
    }
    return autoSelectLineup(awaySquad, "4-3-3");
  })());`;

content = content.replace(oldLineup, newLineup);

const oldTick = `        // Tick
        dispatch({ type: "TICK", payload: { isHome, homeStarters: homeLineups.current.starters, awayStarters: awayLineups.current.starters } });`;

const newTick = `        // Tick
        const homeT = isHome && activeSave.tactics ? activeSave.tactics.instructions : null;
        const awayT = !isHome && activeSave.tactics ? activeSave.tactics.instructions : null;
        dispatch({ type: "TICK", payload: { isHome, homeStarters: homeLineups.current.starters, awayStarters: awayLineups.current.starters, homeTactics: homeT, awayTactics: awayT } });`;

content = content.replace(oldTick, newTick);

fs.writeFileSync('src/app/game/match/page.tsx', content);
console.log('Patch complete.');
