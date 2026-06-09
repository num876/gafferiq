const fs = require('fs');

let content = fs.readFileSync('src/app/game/tactics/page.tsx', 'utf8');

// 1. Add pitchRef
content = content.replace(
  'const [initialized, setInitialized] = useState(false);',
  'const [initialized, setInitialized] = useState(false);\n  const pitchRef = useRef<HTMLDivElement>(null);'
);

// 2. Add pitchRef to the Pitch container
content = content.replace(
  '<div className="relative w-full max-w-[500px] mx-auto aspect-[4/5] bg-[#166534] rounded-2xl overflow-hidden shadow-2xl border-4 border-[#0f4b23] select-none">',
  '<div ref={pitchRef} className="relative w-full max-w-[500px] mx-auto aspect-[4/5] bg-[#166534] rounded-2xl overflow-hidden shadow-2xl border-4 border-[#0f4b23] select-none">'
);

// 3. Update motion.div drag logic
const oldMotionDivStart = `<motion.div
                    key={player.id}
                    layoutId={\`player-\${player.id}\`}
                    initial={false}
                    animate={{ left: \`\${spot.x}%\`, top: \`\${spot.y}%\` }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    drag
                    dragConstraints={{ top: -50, left: -50, right: 50, bottom: 50 }}
                    dragSnapToOrigin={true}
                    dragElastic={0.2}
                    onClick={() => setSelectedNode(isSelected ? null : { index: idx, player, spot })}
                    className="absolute w-12 h-12 flex flex-col items-center justify-center -ml-6 -mt-6 cursor-grab active:cursor-grabbing group z-20"
                  >`;

const newMotionDivStart = `<motion.div
                    key={player.id}
                    layoutId={\`player-\${player.id}\`}
                    initial={false}
                    animate={{ left: \`\${spot.x}%\`, top: \`\${spot.y}%\` }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    drag
                    dragConstraints={{ top: -50, left: -50, right: 50, bottom: 50 }}
                    dragSnapToOrigin={true}
                    dragElastic={0.2}
                    onDragEnd={(e, info) => {
                      if (!pitchRef.current) return;
                      const rect = pitchRef.current.getBoundingClientRect();
                      const dropX = ((info.point.x - rect.left) / rect.width) * 100;
                      const dropY = ((info.point.y - rect.top) / rect.height) * 100;
                      
                      let closestIdx = -1;
                      let minDistance = 15;
                      pitchSpots.forEach((s, sIdx) => {
                        const dist = Math.sqrt(Math.pow(s.x - dropX, 2) + Math.pow(s.y - dropY, 2));
                        if (dist < minDistance) {
                          minDistance = dist;
                          closestIdx = sIdx;
                        }
                      });
                      
                      if (closestIdx !== -1 && closestIdx !== idx) {
                        const newStarters = [...starters];
                        const temp = newStarters[idx];
                        newStarters[idx] = newStarters[closestIdx];
                        newStarters[closestIdx] = temp;
                        setStarters(newStarters);
                        setNotif(\`Swapped \${temp.name.split(' ').pop()} with \${newStarters[idx].name.split(' ').pop()}\`);
                        setTimeout(() => setNotif(""), 3000);
                        setSelectedNode(null);
                      }
                    }}
                    onClick={() => setSelectedNode(isSelected ? null : { index: idx, player, spot })}
                    className="absolute w-12 h-12 flex flex-col items-center justify-center -ml-6 -mt-6 cursor-grab active:cursor-grabbing group z-20"
                  >`;

content = content.replace(oldMotionDivStart, newMotionDivStart);

// 4. Implement Role Saving in Popover
const oldRoleSelector = `<select className="w-full appearance-none bg-[#0f1623] border border-[#1e2d40] text-white text-xs font-bold rounded-lg px-3 py-2 pr-8 focus:outline-none focus:border-[#22c55e]">
                          {selectedNode.spot.roleOptions.map((role: string) => (
                            <option key={role} value={role}>{role}</option>
                          ))}
                        </select>`;

const newRoleSelector = `<select 
                          className="w-full appearance-none bg-[#0f1623] border border-[#1e2d40] text-white text-xs font-bold rounded-lg px-3 py-2 pr-8 focus:outline-none focus:border-[#22c55e]"
                          value={tactics.playerRoles?.[selectedNode.player.id] || selectedNode.spot.roleOptions[0]}
                          onChange={(e) => {
                            setTactics({
                              ...tactics,
                              playerRoles: {
                                ...(tactics.playerRoles || {}),
                                [selectedNode.player.id]: e.target.value
                              }
                            });
                          }}
                        >
                          {selectedNode.spot.roleOptions.map((role: string) => (
                            <option key={role} value={role}>{role}</option>
                          ))}
                        </select>`;

content = content.replace(oldRoleSelector, newRoleSelector);

fs.writeFileSync('src/app/game/tactics/page.tsx', content);
console.log("Patched tactics page with drag-to-swap and role selection!");
