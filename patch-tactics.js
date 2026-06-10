const fs = require('fs');
let content = fs.readFileSync('src/app/game/tactics/page.tsx', 'utf8').replace(/\r\n/g, '\n');

// 1. Add new states
content = content.replace(
  /const \[selectedNode, setSelectedNode\] = useState<{ index: number; player: Player; spot: any } \| null>\(null\);/,
  `const [selectedSwapNode, setSelectedSwapNode] = useState<{ type: "starter" | "bench", index: number, player: Player, spot?: any } | null>(null);
  const [showPopoverFor, setShowPopoverFor] = useState<{ index: number; player: Player; spot: any } | null>(null);`
);

// 2. Clear states on formation change
content = content.replace(
  /setSelectedNode\(null\);/g,
  `setSelectedSwapNode(null); setShowPopoverFor(null);`
);

// 3. Rewrite handleSwap
content = content.replace(
  /const handleSwap = \(starterIdx: number, benchId: string\) => \{[\s\S]*?\};/,
  `const executeSwap = (nodeA: { type: "starter"|"bench", index: number, player: Player }, nodeB: { type: "starter"|"bench", index: number, player: Player }) => {
    if (nodeA.type === "starter" && nodeB.type === "starter") {
      const ns = [...starters];
      ns[nodeA.index] = nodeB.player;
      ns[nodeB.index] = nodeA.player;
      setStarters(ns);
    } else if (nodeA.type === "bench" && nodeB.type === "bench") {
      const nb = [...bench];
      nb[nodeA.index] = nodeB.player;
      nb[nodeB.index] = nodeA.player;
      setBench(nb);
    } else {
      const starterNode = nodeA.type === "starter" ? nodeA : nodeB;
      const benchNode = nodeA.type === "bench" ? nodeA : nodeB;
      const ns = [...starters];
      ns[starterNode.index] = benchNode.player;
      const nb = [...bench];
      nb[benchNode.index] = starterNode.player;
      setStarters(ns);
      setBench(nb);
    }
    setSelectedSwapNode(null);
    setShowPopoverFor(null);
    setNotif(\`Swapped \${nodeA.player.name} & \${nodeB.player.name}\`);
    setTimeout(() => setNotif(""), 2000);
  };

  const handleNodeClick = (type: "starter" | "bench", index: number, player: Player, spot?: any) => {
    if (!selectedSwapNode) {
      setSelectedSwapNode({ type, index, player, spot });
      setShowPopoverFor(null);
    } else {
      if (selectedSwapNode.type === type && selectedSwapNode.index === index) {
        if (type === "starter") {
          setShowPopoverFor(showPopoverFor ? null : { index, player, spot });
        }
        setSelectedSwapNode(null);
      } else {
        executeSwap(selectedSwapNode, { type, index, player });
      }
    }
  };`
);

// 4. Update Starter Nodes
content = content.replace(
  /const isSelected = selectedNode\?\.index === idx;/g,
  `const isSelected = selectedSwapNode?.type === "starter" && selectedSwapNode.index === idx;`
);

content = content.replace(
  /onClick=\{\(\) => setSelectedNode\(isSelected \? null : \{ index: idx, player, spot \}\)\}/g,
  `onClick={() => handleNodeClick("starter", idx, player, spot)}`
);

// 5. Replace Popover conditions
content = content.replace(
  /\{selectedNode && \(/g,
  `{showPopoverFor && (`
);

content = content.replace(
  /selectedNode\./g,
  `showPopoverFor.`
);

// 6. Remove the Swap dropdown from popover
const swapSectionRegex = /\{\/\* Swap \*\/\}[\s\S]*?<\/div>\n\s*<\/div>/;
content = content.replace(swapSectionRegex, '');

// 7. Update Bench Nodes to be clickable
const benchNodesRegex = /<div key=\{p\.id\} className="flex items-center gap-2\.5 p-2 rounded-lg bg-slate-800\/30 border border-slate-800\/50">/;
content = content.replace(
  benchNodesRegex,
  `<div key={p.id} onClick={() => handleNodeClick("bench", bench.indexOf(p), p)} className={\`cursor-pointer flex items-center gap-2.5 p-2 rounded-lg border transition-all \${selectedSwapNode?.type === "bench" && selectedSwapNode.index === bench.indexOf(p) ? "bg-emerald-900/50 border-emerald-500 shadow-[0_0_10px_rgba(34,197,94,0.3)]" : "bg-slate-800/30 border-slate-800/50 hover:border-slate-600"}\`}>`
);

// 8. Add true position to starter popover
content = content.replace(
  /\{showPopoverFor\.player\.position\} · \{showPopoverFor\.player\.age\}y · \{showPopoverFor\.player\.overall\} OVR/,
  `{showPopoverFor.player.truePosition || showPopoverFor.player.position} · {showPopoverFor.player.age}y · {showPopoverFor.player.overall} OVR`
);

// 9. Add true position and best role to bench display
content = content.replace(
  /\{p\.position\} · \{p\.age\}y/g,
  `{p.truePosition || p.position} · {p.age}y{p.bestRole ? \` · \${p.bestRole}\` : ''}`
);

fs.writeFileSync('src/app/game/tactics/page.tsx', content);
console.log("Successfully patched tactics/page.tsx");
