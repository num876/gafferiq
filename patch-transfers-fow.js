const fs = require('fs');

let c = fs.readFileSync('src/app/game/transfers/page.tsx', 'utf8');

const regexMap = [
  {
    target: `                  const club = activeSave.clubs.find(
                    (c) => c.id === player.clubId,
                  );`,
    replacement: `                  const club = activeSave.clubs.find((c) => c.id === player.clubId);
                  const kl = activeSave.playerKnowledge?.[player.id] ?? 0;
                  const displayOvr = kl === 2 ? player.overall : kl === 1 ? \`\${Math.max(50, player.overall - 5)}-\${Math.min(99, player.overall + 5)}\` : "??";
                  const displayVal = kl === 2 ? \`€\${(player.value / 1000000).toFixed(1)}M\` : kl === 1 ? \`€\${(player.value * 0.8 / 1000000).toFixed(1)}M - €\${(player.value * 1.2 / 1000000).toFixed(1)}M\` : "??";
                  const displayAtt = (val: number) => kl === 2 ? val : kl === 1 ? \`\${Math.max(1, val - 8)}-\${Math.min(99, val + 8)}\` : "?";
                  `
  },
  {
    target: `                              {player.overall}
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[9px] font-bold text-slate-500 uppercase">
                                Est. Value
                              </span>
                              <span className="text-xs font-black text-white">
                                €{(player.value / 1000000).toFixed(1)}M
                              </span>`,
    replacement: `                              {displayOvr}
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[9px] font-bold text-slate-500 uppercase">
                                Est. Value
                              </span>
                              <span className="text-xs font-black text-white">
                                {displayVal}
                              </span>`
  },
  {
    target: `                              <span className="text-[9px] font-bold text-white">
                                {att.val}
                              </span>`,
    replacement: `                              <span className="text-[9px] font-bold text-white">
                                {kl === 2 ? att.val : kl === 1 ? "~" + att.val : "?"}
                              </span>`
  },
  // Table View Patches
  {
    target: `                      {filteredPlayers.map((player) => {
                        const club = activeSave.clubs.find(
                          (c) => c.id === player.clubId,
                        );`,
    replacement: `                      {filteredPlayers.map((player) => {
                        const club = activeSave.clubs.find((c) => c.id === player.clubId);
                        const kl = activeSave.playerKnowledge?.[player.id] ?? 0;
                        const displayOvr = kl === 2 ? player.overall : kl === 1 ? \`\${Math.max(50, player.overall - 5)}-\${Math.min(99, player.overall + 5)}\` : "??";
                        const displayVal = kl === 2 ? \`€\${(player.value / 1000000).toFixed(1)}M\` : kl === 1 ? \`€\${(player.value * 0.8 / 1000000).toFixed(1)}M - €\${(player.value * 1.2 / 1000000).toFixed(1)}M\` : "??";
                        `
  },
  {
    target: `                            <td className="py-3 px-5 font-black text-white">
                              €{(player.value / 1000000).toFixed(1)}M
                            </td>
                            <td className="py-3 px-5 text-slate-400">
                              €{(player.wage / 1000).toFixed(0)}k
                            </td>
                            <td className="py-3 px-5 text-right font-black text-white text-sm">
                              {player.overall}
                            </td>`,
    replacement: `                            <td className="py-3 px-5 font-black text-white text-[10px]">
                              {displayVal}
                            </td>
                            <td className="py-3 px-5 text-slate-400">
                              €{(player.wage / 1000).toFixed(0)}k
                            </td>
                            <td className="py-3 px-5 text-right font-black text-white text-sm">
                              {displayOvr}
                            </td>`
  },
  // Scout Side Panel Patches
  {
    target: `                  <div className="w-14 h-14 rounded-full border-4 border-[#22c55e] bg-[#080c14] flex items-center justify-center text-white font-black text-xl shadow-lg shadow-[#22c55e]/20">
                    {scoutedPlayer.overall}
                  </div>`,
    replacement: `                  <div className="w-14 h-14 rounded-full border-4 border-[#22c55e] bg-[#080c14] flex items-center justify-center text-white font-black text-xl shadow-lg shadow-[#22c55e]/20">
                    {activeSave.playerKnowledge?.[scoutedPlayer.id] === 2 ? scoutedPlayer.overall : activeSave.playerKnowledge?.[scoutedPlayer.id] === 1 ? "~"+scoutedPlayer.overall : "??"}
                  </div>`
  },
  {
    target: `                            <span className="text-xs font-black text-white w-4">
                              {val}
                            </span>`,
    replacement: `                            <span className="text-xs font-black text-white w-4">
                              {activeSave.playerKnowledge?.[scoutedPlayer.id] === 2 ? val : activeSave.playerKnowledge?.[scoutedPlayer.id] === 1 ? \`~\${val}\` : "?"}
                            </span>`
  },
  {
    target: `                    <span className="text-2xl font-black text-[#f59e0b] filter blur-[2px] group-hover:blur-none transition-all duration-300 select-none">
                      {scoutedPlayer.potential}
                    </span>`,
    replacement: `                    <span className="text-2xl font-black text-[#f59e0b] filter blur-[2px] group-hover:blur-none transition-all duration-300 select-none">
                      {activeSave.playerKnowledge?.[scoutedPlayer.id] === 2 ? scoutedPlayer.potential : activeSave.playerKnowledge?.[scoutedPlayer.id] === 1 ? \`\${Math.max(50, scoutedPlayer.potential - 5)}-\${Math.min(99, scoutedPlayer.potential + 5)}\` : "??"}
                    </span>`
  }
];

let changed = true;
for (const r of regexMap) {
  if (!c.includes(r.target)) {
    console.log("Could not find target block:\n", r.target.substring(0, 50));
    changed = false;
  }
  c = c.replace(r.target, r.replacement);
}

if (changed) {
  fs.writeFileSync('src/app/game/transfers/page.tsx', c);
  console.log("Patched transfers UI for Fog of War successfully");
} else {
  console.log("Patch failed due to missing targets");
}
