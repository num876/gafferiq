const fs = require('fs');

let content = fs.readFileSync('src/app/game/match/page.tsx', 'utf8').replace(/\r\n/g, '\n');

const getJitterStr = `const getJitter = (id: string, clock: number) => {
  let hash = 0;
  const str = id + clock.toString();
  for (let i = 0; i < str.length; i++) hash = Math.imul(31, hash) + str.charCodeAt(i) | 0;
  const rand1 = ((Math.abs(hash) & 0xffff) / 0xffff) * 2 - 1;
  const rand2 = (((Math.abs(hash) >> 16) & 0xffff) / 0xffff) * 2 - 1;
  return { x: rand1 * 4, y: rand2 * 6 };
};

`;

const oldGetPlayerPosition = `const getPlayerPosition = (player: Player, isHome: boolean, index: number, zone: Zone) => {
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

  // Slight jitter
  const jitterX = Math.random() * 6 - 3;
  const jitterY = Math.random() * 10 - 5;

  return { x: Math.min(100, Math.max(0, baseX + jitterX)), y: Math.min(100, Math.max(0, baseY + jitterY)) };
};`;

const newGetPlayerPosition = getJitterStr + `const getPlayerPosition = (player: Player, isHome: boolean, starters: Player[], zone: Zone, clock: number) => {
  let baseX = isHome ? 30 : 70;
  let baseY = 50;
  
  if (player.position === "GK") { 
    baseX = isHome ? 5 : 95; 
    baseY = 50; 
  } else {
    if (player.position === "DEF") baseX = isHome ? 20 : 80;
    else if (player.position === "MID") baseX = isHome ? 50 : 50;
    else if (player.position === "ATT") baseX = isHome ? 75 : 25;

    const lineMates = starters.filter(p => p.position === player.position);
    const indexInLine = lineMates.findIndex(p => p.id === player.id);
    
    if (lineMates.length === 1) {
      baseY = 50;
    } else {
      const spacing = 60 / (lineMates.length - 1);
      baseY = 20 + (indexInLine * spacing);
    }
  }

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

content = content.replace(/getPlayerPosition\(p, true, i, state\.currentZone\)/g, 'getPlayerPosition(p, true, homeLineups.current.starters, state.currentZone, state.clock)');
content = content.replace(/getPlayerPosition\(p, false, i, state\.currentZone\)/g, 'getPlayerPosition(p, false, awayLineups.current.starters, state.currentZone, state.clock)');

const oldBallRender = `{/* The Ball */}
              <motion.div 
                animate={{
                  left: state.currentZone === 'home-third' ? '15%' : state.currentZone === 'midfield' ? '50%' : '85%',
                  top: \`\${Math.random() * 60 + 20}%\`,
                  scale: state.lastAction?.type === "goal" ? [1, 1.5, 1] : 1
                }}
                transition={{ type: "spring", stiffness: 50, damping: 20 }}
                className="absolute w-4 h-4 bg-white rounded-full shadow-[0_0_20px_rgba(255,255,255,1)] z-30 -ml-2 -mt-2 flex items-center justify-center overflow-hidden border border-slate-300"
              >
                <div className="w-1.5 h-1.5 bg-black rounded-full opacity-50" />
              </motion.div>`;

const newBallRender = `{/* The Ball */}
              {(() => {
                let ballX = 50;
                let ballY = 50;
                if (state.activePlayerId) {
                  const homeIdx = homeLineups.current.starters.findIndex(p => p.id === state.activePlayerId);
                  if (homeIdx !== -1) {
                    const pos = getPlayerPosition(homeLineups.current.starters[homeIdx], true, homeLineups.current.starters, state.currentZone, state.clock);
                    ballX = pos.x; ballY = pos.y;
                  } else {
                    const awayIdx = awayLineups.current.starters.findIndex(p => p.id === state.activePlayerId);
                    if (awayIdx !== -1) {
                      const pos = getPlayerPosition(awayLineups.current.starters[awayIdx], false, awayLineups.current.starters, state.currentZone, state.clock);
                      ballX = pos.x; ballY = pos.y;
                    }
                  }
                } else if (state.lastAction && state.lastAction.type === 'goal') {
                   ballX = state.lastAction.endPos.x;
                   ballY = state.lastAction.endPos.y;
                } else {
                   ballX = state.currentZone === 'home-third' ? 15 : state.currentZone === 'midfield' ? 50 : 85;
                   const r = getJitter('ball', state.clock);
                   ballY = 50 + r.y * 5; 
                }
                
                return (
                  <motion.div 
                    animate={{
                      left: \`\${ballX}%\`,
                      top: \`\${ballY}%\`,
                      scale: state.lastAction?.type === "goal" ? [1, 1.5, 1] : 1
                    }}
                    transition={{ type: "spring", stiffness: 60, damping: 15 }}
                    className="absolute w-4 h-4 bg-white rounded-full shadow-[0_0_20px_rgba(255,255,255,1)] z-30 -ml-2 -mt-2 flex items-center justify-center overflow-hidden border border-slate-300"
                  >
                    <div className="w-1.5 h-1.5 bg-black rounded-full opacity-50" />
                  </motion.div>
                );
              })()}`;

content = content.replace(oldBallRender, newBallRender);

content = content.replace(
  /\| \{ type: "TICK"; payload: \{ isHome: boolean, homeStarters: Player\[\], awayStarters: Player\[\] \} \}/,
  '| { type: "TICK"; payload: { isHome: boolean, homeStarters: Player[], awayStarters: Player[], homeTactics: any, awayTactics: any } }'
);

content = content.replace(
  /const \{ isHome, homeStarters, awayStarters \} = action\.payload;\n\n      const newState = \{ \.\.\.state, clock: nextClock \};\n      \n      \/\/ Fatigue accumulation\n      newState\.homeFatigue \+= \(0\.5 \+ \(state\.homeMomentumModifier > 0 \? 0\.3 : 0\)\); \/\/ Pressing drains fatigue faster\n      newState\.awayFatigue \+= 0\.5;\n\n      \/\/ Calculate granular phase strengths\n      const homeMid = calculateMidfieldControl\(homeStarters, newState\.homeFatigue, newState\.homeRedCards\) \+ newState\.homeMomentumModifier;\n      const awayMid = calculateMidfieldControl\(awayStarters, newState\.awayFatigue, newState\.awayRedCards\);\n      \n      const homeAtt = calculateAttackThreat\(homeStarters, newState\.homeFatigue, newState\.homeRedCards\) \+ newState\.homeTacticsModifier;\n      const awayAtt = calculateAttackThreat\(awayStarters, newState\.awayFatigue, newState\.awayRedCards\);\n      \n      const homeDef = calculateDefenseSolid\(homeStarters, newState\.homeFatigue, newState\.homeRedCards\) - \(newState\.homeTacticsModifier > 0 \? 10 : 0\); \/\/ Attacking leaves defense open\n      const awayDef = calculateDefenseSolid\(awayStarters, newState\.awayFatigue, newState\.awayRedCards\);/,
  `const { isHome, homeStarters, awayStarters, homeTactics, awayTactics } = action.payload;

      const newState = { ...state, clock: nextClock };
      
      // Fatigue accumulation
      newState.homeFatigue += (0.5 + (state.homeMomentumModifier > 0 ? 0.3 : 0)); // Pressing drains fatigue faster
      newState.awayFatigue += 0.5;

      // Calculate base strengths
      let homeMid = calculateMidfieldControl(homeStarters, newState.homeFatigue, newState.homeRedCards) + newState.homeMomentumModifier;
      let awayMid = calculateMidfieldControl(awayStarters, newState.awayFatigue, newState.awayRedCards);
      
      let homeAtt = calculateAttackThreat(homeStarters, newState.homeFatigue, newState.homeRedCards) + newState.homeTacticsModifier;
      let awayAtt = calculateAttackThreat(awayStarters, newState.awayFatigue, newState.awayRedCards);
      
      let homeDef = calculateDefenseSolid(homeStarters, newState.homeFatigue, newState.homeRedCards) - (newState.homeTacticsModifier > 0 ? 10 : 0); 
      let awayDef = calculateDefenseSolid(awayStarters, newState.awayFatigue, newState.awayRedCards);

      // Apply Player Role Bonuses
      const applyRoleBonuses = (starters: Player[], tactics: any, att: number, mid: number, def: number) => {
        let newAtt = att; let newMid = mid; let newDef = def;
        if (!tactics || !tactics.playerRoles) return { att, mid, def };
        
        starters.forEach(p => {
           const role = tactics.playerRoles[p.id];
           if (!role) return;
           if (role.includes("Playmaker") || role.includes("Regista")) newMid += 3;
           if (role.includes("Anchor Man") || role.includes("Ball-Winning")) { newMid += 1; newDef += 2; }
           if (role.includes("Inverted Winger") || role.includes("Inside Forward")) newAtt += 3;
           if (role.includes("False 9")) { newAtt += 1; newMid += 2; }
           if (role.includes("Wing-Back")) { newDef += 1; newMid += 1; newAtt += 1; }
        });
        return { att: newAtt, mid: newMid, def: newDef };
      };

      const homeMods = applyRoleBonuses(homeStarters, homeTactics, homeAtt, homeMid, homeDef);
      homeAtt = homeMods.att; homeMid = homeMods.mid; homeDef = homeMods.def;

      const awayMods = applyRoleBonuses(awayStarters, awayTactics, awayAtt, awayMid, awayDef);
      awayAtt = awayMods.att; awayMid = awayMods.mid; awayDef = awayMods.def;`
);

content = content.replace(
  /  \/\/ We memoize starters so they don't regenerate every render\n  const homeLineups = useRef\(autoSelectLineup\(homeSquad, "4-3-3"\)\);\n  const awayLineups = useRef\(autoSelectLineup\(awaySquad, "4-3-3"\)\);/,
  `  // Load player's saved tactics if available, otherwise auto-select
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
  })());`
);

content = content.replace(
  /dispatch\(\{\s*type:\s*"TICK",\s*payload:\s*\{\s*isHome,\s*homeStarters:\s*homeLineups\.current\.starters,\s*awayStarters:\s*awayLineups\.current\.starters\s*\}\s*\}\);/,
  `const homeT = isHome && activeSave.tactics ? activeSave.tactics.instructions : null;
        const awayT = !isHome && activeSave.tactics ? activeSave.tactics.instructions : null;
        dispatch({ type: "TICK", payload: { isHome, homeStarters: homeLineups.current.starters, awayStarters: awayLineups.current.starters, homeTactics: homeT, awayTactics: awayT } });`
);

fs.writeFileSync('src/app/game/match/page.tsx', content);
console.log("All patches applied successfully via exact text replacement!");
