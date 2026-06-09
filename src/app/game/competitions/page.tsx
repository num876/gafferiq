"use client";

import React, { useState } from "react";
import { useGame } from "../../../context/GameContext";
import { Trophy, Shield, ChevronRight } from "lucide-react";

export default function CompetitionsPage() {
  const { activeSave } = useGame();
  const [activeComp, setActiveComp] = useState<"championsLeague" | "europaLeague">("championsLeague");

  if (!activeSave || !activeSave.continentalCups) {
    return (
      <div className="flex items-center justify-center h-full text-slate-400">
        <p>No active competitions available.</p>
      </div>
    );
  }

  const compState = activeSave.continentalCups[activeComp];
  const compName = activeComp === "championsLeague" ? "Champions League" : "Europa League";
  const compColor = activeComp === "championsLeague" ? "text-indigo-400" : "text-amber-400";
  const compBorder = activeComp === "championsLeague" ? "border-indigo-500/50" : "border-amber-500/50";

  const renderGroups = () => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Object.entries(compState.groups).map(([gName, standings]) => (
          <div key={gName} className="bg-slate-800/40 border border-slate-700/50 rounded-xl overflow-hidden shadow-lg">
            <div className="bg-slate-800 px-4 py-2 border-b border-slate-700 font-bold text-sm text-slate-300">
              {gName}
            </div>
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="text-slate-500 bg-slate-900/30">
                  <th className="px-3 py-2 font-medium">Club</th>
                  <th className="px-2 py-2 font-medium text-center">P</th>
                  <th className="px-2 py-2 font-medium text-center">GD</th>
                  <th className="px-3 py-2 font-bold text-right">Pts</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/30">
                {standings.map((s, idx) => (
                  <tr key={s.clubId} className={idx < 2 ? "bg-green-500/5" : ""}>
                    <td className="px-3 py-2 font-medium truncate max-w-[100px]">
                      <span className={idx < 2 ? "text-slate-200" : "text-slate-400"}>
                        {idx + 1}. {s.clubName}
                      </span>
                    </td>
                    <td className="px-2 py-2 text-center text-slate-400">{s.played}</td>
                    <td className="px-2 py-2 text-center text-slate-400">{s.goalsFor - s.goalsAgainst}</td>
                    <td className="px-3 py-2 text-right font-bold text-slate-300">{s.points}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>
    );
  };

  const renderKnockouts = () => {
    const knockoutFixtures = activeSave.fixtures.filter(
      f => f.league === compName && f.round?.startsWith("Knockout - ")
    );

    if (knockoutFixtures.length === 0) {
      return (
        <div className="text-center py-12 text-slate-400 border border-dashed border-slate-700 rounded-xl">
          Knockout stages have not been drawn yet. Group stages must conclude first.
        </div>
      );
    }

    // Group fixtures by round
    const rounds: Record<string, typeof knockoutFixtures> = {};
    knockoutFixtures.forEach(f => {
      const r = f.round!;
      if (!rounds[r]) rounds[r] = [];
      rounds[r].push(f);
    });

    return (
      <div className="flex flex-col gap-8">
        {Object.entries(rounds).map(([roundName, fixtures]) => (
          <div key={roundName} className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-6">
            <h3 className="text-lg font-black text-white mb-4 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-slate-400" />
              {roundName.replace("Knockout - ", "")}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {fixtures.map(f => {
                const home = activeSave.clubs.find(c => c.id === f.homeClubId);
                const away = activeSave.clubs.find(c => c.id === f.awayClubId);
                return (
                  <div key={f.id} className="bg-slate-900 border border-slate-700 rounded-lg p-3 flex flex-col gap-2 relative">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-slate-300 truncate pr-2">{home?.shortName}</span>
                      <span className="font-mono text-slate-400">{f.played ? f.homeScore : "-"}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-slate-300 truncate pr-2">{away?.shortName}</span>
                      <span className="font-mono text-slate-400">{f.played ? f.awayScore : "-"}</span>
                    </div>
                    {f.played && f.homeScore !== f.awayScore && (
                      <div className="absolute top-1/2 -right-2 transform -translate-y-1/2 bg-slate-800 border border-slate-600 rounded-full p-1 z-10 shadow-lg">
                        <ChevronRight className="w-3 h-3 text-green-400" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto pb-10">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-3">
            <Trophy className={`w-6 h-6 ${compColor}`} />
            Continental Competitions
          </h1>
          <p className="text-slate-400 text-sm mt-1">View the group stages and knockout brackets for Europe's elite.</p>
        </div>
        <div className="flex bg-slate-800 p-1 rounded-lg border border-slate-700">
          <button
            onClick={() => setActiveComp("championsLeague")}
            className={`px-4 py-1.5 rounded-md text-xs font-bold transition ${activeComp === "championsLeague" ? "bg-indigo-500 text-white shadow" : "text-slate-400 hover:text-white"}`}
          >
            Champions League
          </button>
          <button
            onClick={() => setActiveComp("europaLeague")}
            className={`px-4 py-1.5 rounded-md text-xs font-bold transition ${activeComp === "europaLeague" ? "bg-amber-600 text-white shadow" : "text-slate-400 hover:text-white"}`}
          >
            Europa League
          </button>
        </div>
      </header>

      <div className={`bg-slate-900 border ${compBorder} rounded-2xl p-6 md:p-8 shadow-2xl`}>
        <div className="flex items-center gap-4 mb-8">
          <h2 className={`text-3xl font-black ${compColor} tracking-tighter uppercase`}>
            {compName}
          </h2>
          <div className="flex-1 h-px bg-slate-800"></div>
          <span className="text-xs font-bold text-slate-500 bg-slate-800 px-3 py-1 rounded-full">Season {activeSave.currentSeason}</span>
        </div>

        {activeSave.currentMatchday <= 20 ? (
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-white mb-2">Group Stages</h3>
            {renderGroups()}
          </div>
        ) : (
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-white mb-2">Knockout Stages</h3>
            {renderKnockouts()}
          </div>
        )}
      </div>
    </div>
  );
}
