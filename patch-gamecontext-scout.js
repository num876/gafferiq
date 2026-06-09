const fs = require('fs');

let c = fs.readFileSync('src/context/GameContext.tsx', 'utf8');

// 1. Import getRegionForLeague
c = c.replace('generateCupFixturesForRound } from "../db/storage";', 'generateCupFixturesForRound, getRegionForLeague } from "../db/storage";');

// 2. Replace scout tasks loop
const oldScoutLoop = `      // Decrease scouting task timers
      state.scoutingTasks = state.scoutingTasks.map(task => {
        if (task.completed) return task;
        const daysLeft = task.daysRemaining - 1;
        if (daysLeft <= 0) {
          // Completed scouting!
          state.inbox.unshift({
            id: \`scout_task_\${task.id}\`,
            sender: "Chief Scout",
            subject: \`Scouting Completed: \${task.playerName}\`,
            body: \`Your scout has finished observing \${task.playerName}. The player looks like a \${task.playerRatingMin}-\${task.playerRatingMax} potential prospect, valued around €\${(task.estimatedValue! / 1000000).toFixed(1)}M.\`,
            date: \`Matchday \${state.currentMatchday}\`,
            read: false,
            type: "media"
          });
          return { ...task, daysRemaining: 0, completed: true };
        }
        return { ...task, daysRemaining: daysLeft };
      });`;

const newScoutLoop = `      // Decrease scouting task timers
      state.scoutingTasks = state.scoutingTasks.map(task => {
        if (task.completed) return task;
        const daysLeft = task.daysRemaining - 1;
        
        if (task.type === "Region") {
            // Region scouting logic:
            if (daysLeft % 5 === 0 && daysLeft !== task.daysRemaining) {
              const regionPlayers = state.players.filter(p => {
                const c = state.clubs.find(club => club.id === p.clubId);
                return c && getRegionForLeague(c.league) === task.region && (state.playerKnowledge[p.id] || 0) < 1;
              });
              
              if (regionPlayers.length > 0) {
                 const found = [];
                 for(let i=0; i < Math.min(2, regionPlayers.length); i++) {
                     const p = regionPlayers[Math.floor(Math.random() * regionPlayers.length)];
                     state.playerKnowledge[p.id] = 1;
                     found.push(p);
                 }
                 state.inbox.unshift({
                    id: \`region_scout_\${Date.now()}_\${Math.random()}\`,
                    sender: "Chief Scout",
                    subject: \`Scouting Update: \${task.region}\`,
                    body: \`Your scout has sent a batch of reports from \${task.region}. We've found some interesting players:\\n\` + found.map(p => \`- \${p.name} (\${p.position})\`).join("\\n") + "\\nCheck the Transfers tab to see their estimated attributes.",
                    date: \`Matchday \${state.currentMatchday}\`,
                    read: false,
                    type: "media"
                 });
              }
            }
            if (daysLeft <= 0) {
               return { ...task, daysRemaining: 0, completed: true };
            }
            return { ...task, daysRemaining: daysLeft };
        }

        // Original Player logic
        if (daysLeft <= 0) {
          // Completed scouting!
          const p = state.players.find(pl => pl.name === task.playerName);
          if (p) {
              state.playerKnowledge[p.id] = 2; // Level up knowledge to 2
          }
          state.inbox.unshift({
            id: \`scout_task_\${task.id}\`,
            sender: "Chief Scout",
            subject: \`Scouting Completed: \${task.playerName}\`,
            body: \`Your scout has finished observing \${task.playerName}. The player looks like a \${task.playerRatingMin}-\${task.playerRatingMax} potential prospect, valued around €\${((task.estimatedValue || 0) / 1000000).toFixed(1)}M.\`,
            date: \`Matchday \${state.currentMatchday}\`,
            read: false,
            type: "media"
          });
          return { ...task, daysRemaining: 0, completed: true };
        }
        return { ...task, daysRemaining: daysLeft };
      });`;

c = c.replace(oldScoutLoop, newScoutLoop);

fs.writeFileSync('src/context/GameContext.tsx', c);
console.log("Patched GameContext for Scouting Network");
