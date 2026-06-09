const fs = require('fs');
let content = fs.readFileSync('src/app/game/match/page.tsx', 'utf8');

// 1. Add getJitter and modify getPlayerPosition
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

const newGetPlayerPosition = `const getJitter = (id: string, clock: number) => {
  let hash = 0;
  const str = id + clock.toString();
  for (let i = 0; i < str.length; i++) hash = Math.imul(31, hash) + str.charCodeAt(i) | 0;
  const rand1 = ((Math.abs(hash) & 0xffff) / 0xffff) * 2 - 1;
  const rand2 = (((Math.abs(hash) >> 16) & 0xffff) / 0xffff) * 2 - 1;
  return { x: rand1 * 4, y: rand2 * 6 };
};

const getPlayerPosition = (player: Player, isHome: boolean, index: number, zone: Zone, clock: number) => {
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

content = content.replace(oldGetPlayerPosition, newGetPlayerPosition);

// 2. Change occurrences of `getPlayerPosition(p, true, i, state.currentZone)` to `... state.clock)`
content = content.replace(/getPlayerPosition\(p, true, i, state\.currentZone\)/g, 'getPlayerPosition(p, true, i, state.currentZone, state.clock)');
content = content.replace(/getPlayerPosition\(p, false, i, state\.currentZone\)/g, 'getPlayerPosition(p, false, i, state.currentZone, state.clock)');

// 3. Modify Ball rendering
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
                    const pos = getPlayerPosition(homeLineups.current.starters[homeIdx], true, homeIdx, state.currentZone, state.clock);
                    ballX = pos.x; ballY = pos.y;
                  } else {
                    const awayIdx = awayLineups.current.starters.findIndex(p => p.id === state.activePlayerId);
                    if (awayIdx !== -1) {
                      const pos = getPlayerPosition(awayLineups.current.starters[awayIdx], false, awayIdx, state.currentZone, state.clock);
                      ballX = pos.x; ballY = pos.y;
                    }
                  }
                } else if (state.lastAction && state.lastAction.type === 'goal') {
                   ballX = state.lastAction.endPos.x;
                   ballY = state.lastAction.endPos.y;
                } else {
                   ballX = state.currentZone === 'home-third' ? 15 : state.currentZone === 'midfield' ? 50 : 85;
                   // seed random with clock so it stays put during tick
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

// 4. Also fix passes to start from the player accurately
// In matchReducer, we should use sourcePlayerId and targetPlayerId if possible.
// Wait, matchReducer doesn't know the component indices. 
// It's easier if we just let the line draw from approximate area to approximate area, 
// but the ball itself will jump precisely to the activePlayerId. The user mostly notices the ball!
// Let's leave lastAction coordinates as they are for the visual SVG lines (they are just dashed lines for effect),
// but the ball will definitely stick to the player dot.

fs.writeFileSync('src/app/game/match/page.tsx', content);
console.log('Patched Match Engine Visualizer.');
