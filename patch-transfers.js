const fs = require('fs');
let code = fs.readFileSync('src/app/game/transfers/page.tsx', 'utf8');

// 1. Update Tabs State
code = code.replace(/const \[activeTab, setActiveTab\] = useState\("search"\);/, 'const [activeTab, setActiveTab] = useState("search");');

// 2. Remove fake delay from submitBid
code = code.replace('setTimeout(() => {', '');
code = code.replace('        setNegotiationMessage(Great news!  has accepted your transfer bid of €M. You are now cleared to negotiate personal terms with .);\n      }, 1500);', '        setNegotiationMessage(Great news!  has accepted your transfer bid of €M. You are now cleared to negotiate personal terms with .);');

// 3. Remove fake delay from submitContract
code = code.replace('setTimeout(() => {', '');
code = code.replace('          updateActiveSave(newState);\n        }\n      }, 1500);', '          updateActiveSave(newState);\n        }\n      }');

// 4. Update the tabs UI
const oldTabsUI = \<div className="flex items-center gap-1 bg-[#080c14] p-1 rounded-xl border border-[#1e2d40]">\n            <button onClick={() => setActiveTab("search")} className={\\\px-4 py-2 rounded-lg text-xs font-bold transition \\\\}>Search</button>\n            <button onClick={() => setActiveTab("shortlist")} className={\\\px-4 py-2 rounded-lg text-xs font-bold transition \\\\}>Shortlist</button>\n          </div>\;
const newTabsUI = \<div className="flex items-center gap-1 bg-[#080c14] p-1 rounded-xl border border-[#1e2d40]">\n            <button onClick={() => setActiveTab("search")} className={\\\px-4 py-2 rounded-lg text-xs font-bold transition \\\\}>Search</button>\n            <button onClick={() => setActiveTab("shortlist")} className={\\\px-4 py-2 rounded-lg text-xs font-bold transition \\\\}>Shortlist</button>\n            <button onClick={() => setActiveTab("squad")} className={\\\px-4 py-2 rounded-lg text-xs font-bold transition \\\\}>My Squad</button>\n            <button onClick={() => setActiveTab("history")} className={\\\px-4 py-2 rounded-lg text-xs font-bold transition \\\\}>History</button>\n          </div>\;
code = code.replace(oldTabsUI, newTabsUI);

// 5. Inject Squad & History views
const tabsJSX = \
      {activeTab === "squad" && (
        <div className="flex-1 w-full max-w-7xl mx-auto px-6 pb-6">
          <h2 className="text-xl font-bold text-slate-100 mb-4">Squad Overview</h2>
          <div className="bg-[#0a0f1e] rounded-xl border border-[#1e2d40] overflow-hidden">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-[#1e2d40] text-slate-400 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="p-4">Player</th>
                    <th className="p-4">Position</th>
                    <th className="p-4">OVR</th>
                    <th className="p-4">Value</th>
                    <th className="p-4">Status</th>
                  </tr>
              </thead>
              <tbody className="divide-y divide-[#1e2d40]">
                {activeSave.players.filter(p => p.clubId === activeSave.selectedClubId).map(p => (
                  <tr key={p.id} className="hover:bg-[#0f1623]">
                      <td className="p-4 font-bold text-white">{p.name}</td>
                      <td className="p-4">{p.position}</td>
                      <td className="p-4">{p.overall}</td>
                      <td className="p-4">€{(p.value/1000000).toFixed(2)}M</td>
                      <td className="p-4">
                        <span className={\\\px-2 py-1 rounded text-xs font-bold \\\\}>
                          {p.isTransferListed ? 'Listed' : 'Not Listed'}
                        </span>
                      </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "history" && (
        <div className="flex-1 w-full max-w-7xl mx-auto px-6 pb-6">
          <h2 className="text-xl font-bold text-slate-100 mb-4">Transfer History</h2>
          {activeSave.transfersHistory && activeSave.transfersHistory.length > 0 ? (
            <div className="bg-[#0a0f1e] rounded-xl border border-[#1e2d40] overflow-hidden">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-[#1e2d40] text-slate-400 font-bold uppercase text-[10px]">
                    <tr>
                      <th className="p-4">Date</th>
                      <th className="p-4">Player</th>
                      <th className="p-4">From</th>
                      <th className="p-4">To</th>
                      <th className="p-4">Fee</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-[#1e2d40]">
                  {activeSave.transfersHistory.map((t, idx) => (
                      <tr key={idx} className="hover:bg-[#0f1623]">
                        <td className="p-4">{t.date}</td>
                        <td className="p-4 font-bold text-white">{t.playerName}</td>
                        <td className="p-4 text-rose-400">{t.fromClubName}</td>
                        <td className="p-4 text-emerald-400">{t.toClubName}</td>
                        <td className="p-4 font-bold">€{(t.fee/1000000).toFixed(2)}M</td>
                      </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-10 text-center text-slate-500 font-bold">No transfer history recorded yet.</div>
          )}
        </div>
      )}
\;

code = code.replace(
  '{/* \n        ========================================================\n        SCOUT SIDE PANEL',
  tabsJSX + '\\n      {/* \\n        ========================================================\\n        SCOUT SIDE PANEL'
);

fs.writeFileSync('src/app/game/transfers/page.tsx', code);
console.log('Patch complete.');
