const fs = require('fs');

let content = fs.readFileSync('src/context/GameContext.tsx', 'utf8');

const oldEconomics = `      // Matchday Economics
      const myPlayers = state.players.filter(p => p.clubId === playerClub.id);
      const currentWages = myPlayers.reduce((sum, p) => sum + p.wage, 0);
      const scoutWages = (state.scouts || []).reduce((sum, s) => sum + s.wage, 0);
      const totalWages = currentWages + scoutWages;

      state.transferBudget -= totalWages; // deduct weekly wages
      state.transferBudget -= 25000; // base stadium maintenance / travel cost

      // Penalty for overspending
      if (totalWages > state.wageBudget) {
        state.boardConfidence -= 1;
      }
      if (state.transferBudget < 0) {
        state.boardConfidence -= 5;
      }

      // Home Matchday Revenue
      const currentFixture = state.fixtures.find(f => f.matchday === state.currentMatchday && f.homeClubId === playerClub.id);
      if (currentFixture) {
        const priceModifier = Math.max(0, 1 - ((state.ticketPrice - 40) / 100)); // 40 = 1, 90 = 0.5
        const repModifier = state.manager.reputation / 100;
        const attendancePct = Math.min(1, 0.4 + (repModifier * 0.4) + (priceModifier * 0.2));
        const matchdayIncome = Math.floor(playerClub.capacity * attendancePct * state.ticketPrice);
        state.transferBudget += matchdayIncome;
        state.gameLog.unshift(\`Home Matchday Revenue: +€\${matchdayIncome.toLocaleString()}\`);
      }`;

const newEconomics = `      // Matchday Economics & Club Infrastructure
      // We process finances for all clubs to keep the world realistic
      state.clubs.forEach(c => {
         const clubPlayers = state.players.filter(p => p.clubId === c.id);
         const currentWages = clubPlayers.reduce((sum, p) => sum + p.wage, 0);
         let weeklyExpenses = currentWages + 25000; // wages + base operations
         
         let weeklyIncome = 0;
         
         // Sponsorships
         if (c.sponsorships) {
            c.sponsorships.forEach(sponsor => {
               weeklyIncome += sponsor.valuePerWeek;
               sponsor.remainingWeeks -= 1;
            });
            c.sponsorships = c.sponsorships.filter(s => s.remainingWeeks > 0);
         }
         
         // Home Matchday Revenue
         const currentFixture = state.fixtures.find(f => f.matchday === state.currentMatchday && f.homeClubId === c.id);
         let matchdayIncome = 0;
         if (currentFixture) {
            const ticketP = c.ticketPrice ?? (c.id === playerClub.id ? state.ticketPrice : 40);
            const priceModifier = Math.max(0, 1 - ((ticketP - 40) / 100)); 
            const repModifier = c.reputation / 100;
            const conditionMod = (c.stadiumCondition ?? 100) / 100;
            const attendancePct = Math.min(1, (0.4 + (repModifier * 0.4) + (priceModifier * 0.2)) * conditionMod);
            matchdayIncome = Math.floor(c.capacity * attendancePct * ticketP);
            weeklyIncome += matchdayIncome;
            
            // Degrade stadium condition slightly after a home match
            c.stadiumCondition = Math.max(0, (c.stadiumCondition ?? 100) - 0.5);
         }

         c.bankBalance = (c.bankBalance ?? 0) + weeklyIncome - weeklyExpenses;

         if (c.id === playerClub.id) {
            const scoutWages = (state.scouts || []).reduce((sum, s) => sum + s.wage, 0);
            c.bankBalance -= scoutWages; // Player pays scouts
            state.bankBalance = c.bankBalance; // Sync state bank balance
            
            if (currentFixture) {
               state.gameLog.unshift(\`Matchday Ticket Revenue: +€\${matchdayIncome.toLocaleString()}\`);
            }
            if (currentWages + scoutWages > state.wageBudget) {
               state.boardConfidence -= 1; // Overspending wage budget
            }
            if (state.bankBalance < 0) {
               state.boardConfidence -= 5; // Going into debt
            }
         }
      });`;

// Ensure exact replacement ignoring line endings
function normalizeStrings(str) {
  return str.replace(/\\r\\n/g, '\\n').trim();
}

if (!normalizeStrings(content).includes(normalizeStrings(oldEconomics))) {
  console.log("Could not find old economics block. Proceeding anyway or using regex.");
  // Regex fallback
  content = content.replace(/ \/\/ Matchday Economics[\s\S]*? \/\/ Check stadium expansion completion/, newEconomics + "\\n\\n      // Check stadium expansion completion");
} else {
  content = content.replace(oldEconomics, newEconomics);
}

// Ensure gameLog uses Euro symbol correctly
fs.writeFileSync('src/context/GameContext.tsx', content);
console.log("Matchday economics patched.");
