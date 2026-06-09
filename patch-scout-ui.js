const fs = require('fs');

let c = fs.readFileSync('src/app/game/scouting/page.tsx', 'utf8');

// 1. Add SCOUTING_REGIONS to imports
c = c.replace('import { ScoutTask, Scout } from "../../../db/storage";', 'import { ScoutTask, Scout, SCOUTING_REGIONS } from "../../../db/storage";');

// 2. Add assignRegionScout function right after assignScout
const assignScoutTarget = `    setScoutingResults([]);
    setToastMessage(\`Assigned scout to analyze \${player.name}.\`);
  };`;

const regionAssignFunc = `
  const assignRegionScout = (region: string, scoutId: string) => {
    const activeTasks = activeSave.scoutingTasks.filter(t => !t.completed);
    if (activeTasks.some(t => t.scoutId === scoutId)) {
      alert("This scout is already busy on another assignment.");
      return;
    }
    const scout = (activeSave.scouts || []).find(s => s.id === scoutId);
    if (!scout) return;

    const newTask: ScoutTask = {
      id: \`task_\${Date.now()}\`,
      type: "Region",
      region,
      scoutId,
      daysRemaining: 30, // 30 matchdays duration
      completed: false
    };

    const newState = {
      ...activeSave,
      scoutingTasks: [...activeSave.scoutingTasks, newTask]
    };
    newState.gameLog.unshift(\`Sent \${scout.name} to scout \${region}. Reports arriving periodically.\`);
    
    updateActiveSave(newState);
    setToastMessage(\`Sent \${scout.name} to scout \${region}.\`);
  };
`;

c = c.replace(assignScoutTarget, assignScoutTarget + '\n' + regionAssignFunc);

// 3. Render Region Assignment panel below the Player Assignment panel
const renderTarget = `                {/* Scouting search results */}`;

const regionPanel = `                {/* Global Region Scouting */}
                <div className="pt-4 mt-2 border-t border-slate-800 flex flex-col gap-3">
                  <div>
                    <h3 className="font-extrabold text-slate-100 text-xs">Global Region Scouting</h3>
                    <p className="text-[10px] text-slate-500 mt-1">Send scouts to patrol global regions indefinitely.</p>
                  </div>
                  <div className="flex flex-col gap-2">
                    {SCOUTING_REGIONS.map(region => (
                      <div key={region} className="flex justify-between items-center p-2 bg-slate-900 border border-slate-800 rounded">
                        <span className="font-bold text-xs text-slate-300">{region}</span>
                        <div className="flex gap-1">
                          {scoutsList.filter(s => s.status !== "Scouting").slice(0,3).map(s => (
                             <button
                               key={s.id}
                               onClick={() => assignRegionScout(region, s.id)}
                               className="px-2 py-1 rounded text-[9px] font-bold border transition bg-indigo-600/10 border-indigo-500/20 text-indigo-400 hover:bg-indigo-600 hover:text-white"
                             >
                               Send {s.name.split(" ")[0]}
                             </button>
                           ))}
                           {scoutsList.filter(s => s.status !== "Scouting").length === 0 && (
                             <span className="text-[9px] text-slate-500 italic">No idle scouts</span>
                           )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
`;

c = c.replace(renderTarget, regionPanel + '\n' + renderTarget);

// 4. Update the Active Assignments render to handle Region tasks properly
const activeTasksTarget = `                          <div>
                            <h4 className="font-extrabold text-slate-200">{task.playerName}</h4>
                            <span className="text-[10px] text-slate-450 mt-1 block font-semibold">{task.position} • {task.playerClub}</span>
                          </div>`;

const activeTasksReplacement = `                          <div>
                            <h4 className="font-extrabold text-slate-200">
                              {task.type === "Region" ? \`Region: \${task.region}\` : task.playerName}
                            </h4>
                            <span className="text-[10px] text-slate-450 mt-1 block font-semibold">
                              {task.type === "Region" ? "Periodic Reports" : \`\${task.position} • \${task.playerClub}\`}
                            </span>
                          </div>`;

c = c.replace(activeTasksTarget, activeTasksReplacement);

fs.writeFileSync('src/app/game/scouting/page.tsx', c);
console.log("Patched scouting UI for Region Hub!");
