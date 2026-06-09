const fs = require('fs');
let c = fs.readFileSync('src/app/game/dashboard/page.tsx', 'utf8');

c = c.replace(
  'grid-cols-1 md:grid-cols-3',
  'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
);

const financesWidget = `

          {/* Finances */}
          <div className="group rounded-3xl bg-slate-900/60 backdrop-blur-2xl border border-sky-500/20 p-6 shadow-[0_10px_40px_rgba(0,0,0,0.5)] flex flex-col gap-4 relative overflow-hidden transition-all hover:border-sky-500/40">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-sky-500/10 blur-[50px] rounded-full group-hover:bg-sky-500/20 transition-all duration-700 pointer-events-none" />
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> Finances
            </h3>
            <div className="flex-1 flex flex-col justify-center gap-2 relative z-10">
              <div className="text-3xl font-black text-white tracking-tighter">€{(activeSave.bankBalance || 0).toLocaleString()}</div>
              <div className="text-sm font-semibold text-slate-400">Treasury</div>
              <div className="mt-2 text-xs text-slate-500">
                Wage Budget: €{(activeSave.wageBudget || 0).toLocaleString()}/w
              </div>
            </div>
          </div>
`;

// Find where Squad Morale block ends
const moralePattern = /\{\/\* Circular Gauge \*\/\}[\s\S]*?<\/div>[\s\n]*<\/div>[\s\n]*<\/div>/;
const match = c.match(moralePattern);
if (match) {
  c = c.replace(match[0], match[0] + financesWidget);
  fs.writeFileSync('src/app/game/dashboard/page.tsx', c);
  console.log("Dashboard patched.");
} else {
  console.log("Could not find morale block.");
}
