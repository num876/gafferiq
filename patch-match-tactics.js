const fs = require('fs');

let content = fs.readFileSync('src/app/game/match/page.tsx', 'utf8');

// 1. Add homeTactics and awayTactics to TICK payload
content = content.replace(
  '| { type: "TICK"; payload: { isHome: boolean, homeStarters: Player[], awayStarters: Player[] } }',
  '| { type: "TICK"; payload: { isHome: boolean, homeStarters: Player[], awayStarters: Player[], homeTactics: any, awayTactics: any } }'
);

// 2. Modify TICK reducer.
const oldTickStart = `      const { isHome, homeStarters, awayStarters } = action.payload;

      const newState = { ...state, clock: nextClock };
      
      // Fatigue accumulation
      newState.homeFatigue += (0.5 + (state.homeMomentumModifier > 0 ? 0.3 : 0)); // Pressing drains fatigue faster
      newState.awayFatigue += 0.5;

      // Calculate granular phase strengths
      const homeMid = calculateMidfieldControl(homeStarters, newState.homeFatigue, newState.homeRedCards) + newState.homeMomentumModifier;
      const awayMid = calculateMidfieldControl(awayStarters, newState.awayFatigue, newState.awayRedCards);
      
      const homeAtt = calculateAttackThreat(homeStarters, newState.homeFatigue, newState.homeRedCards) + newState.homeTacticsModifier;
      const awayAtt = calculateAttackThreat(awayStarters, newState.awayFatigue, newState.awayRedCards);
      
      const homeDef = calculateDefenseSolid(homeStarters, newState.homeFatigue, newState.homeRedCards) - (newState.homeTacticsModifier > 0 ? 10 : 0); // Attacking leaves defense open
      const awayDef = calculateDefenseSolid(awayStarters, newState.awayFatigue, newState.awayRedCards);`;


const newTickStart = `      const { isHome, homeStarters, awayStarters, homeTactics, awayTactics } = action.payload;

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

      // Apply Player Role Bonuses (e.g. Playmakers boost midfield, Inverted Wingers boost attack)
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
      awayAtt = awayMods.att; awayMid = awayMods.mid; awayDef = awayMods.def;
      `;

content = content.replace(oldTickStart, newTickStart);

// 3. Fix Lineups
const oldLineupGen = `  // We memoize starters so they don't regenerate every render
  const homeLineups = useRef(autoSelectLineup(homeSquad, "4-3-3"));
  const awayLineups = useRef(autoSelectLineup(awaySquad, "4-3-3"));`;

const newLineupGen = `  // Load player's saved tactics if available, otherwise auto-select
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

content = content.replace(oldLineupGen, newLineupGen);

// 4. Pass tactics to TICK safely using regex
content = content.replace(
  /dispatch\(\{\s*type:\s*"TICK",\s*payload:\s*\{\s*isHome,\s*homeStarters:\s*homeLineups\.current\.starters,\s*awayStarters:\s*awayLineups\.current\.starters\s*\}\s*\}\);/,
  `const homeT = isHome && activeSave.tactics ? activeSave.tactics.instructions : null;
        const awayT = !isHome && activeSave.tactics ? activeSave.tactics.instructions : null;
        dispatch({ type: "TICK", payload: { isHome, homeStarters: homeLineups.current.starters, awayStarters: awayLineups.current.starters, homeTactics: homeT, awayTactics: awayT } });`
);

fs.writeFileSync('src/app/game/match/page.tsx', content);
console.log("Patched Match Engine to use player's saved tactics and roles.");
