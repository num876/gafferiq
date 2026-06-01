/* eslint-disable */
"use client";

import React, { useState } from "react";
import { useGame } from "../../../context/GameContext";
import { 
  Trophy, Goal, Star, ShieldAlert, Award, Compass 
} from "lucide-react";
import { LEAGUE_INFO, Club } from "../../../config/seededData";

export default function LeagueTable() {
  const { activeSave } = useGame();
  const [activeTab, setActiveTab] = useState<"standings" | "scorers" | "assists">("standings");

  if (!activeSave) return null;

  const playerClub = activeSave.clubs.find(c => c.id === activeSave.selectedClubId)!;
  const league = LEAGUE_INFO[playerClub.league];

  // Get standings for player's league
  const standings = activeSave.standings[playerClub.league] || [];

  // Get all players in this league for stats
  const leagueClubIds = activeSave.clubs.filter(c => c.league === playerClub.league).map(c => c.id);
  const leaguePlayers = activeSave.players.filter(p => leagueClubIds.includes(p.clubId));

  // Sort players for stats tables
  const topScorers = [...leaguePlayers]
    .filter(p => p.goals && p.goals > 0)
    .sort((a, b) => (b.goals || 0) - (a.goals || 0))
    .slice(0, 10);

  const topAssists = [...leaguePlayers]
    .filter(p => p.assists && p.assists > 0)
    .sort((a, b) => (b.assists || 0) - (a.assists || 0))
    .slice(0, 10);

  const getClubName = (clubId: string) => {
    return activeSave.clubs.find(c => c.id === clubId)?.shortName || "Unknown";
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            League Database
          </h2>
          <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
            <span>Current competition:</span>
            <span className="font-bold text-slate-200 flex items-center gap-0.5">
              {league.emoji} {league.name}
            </span>
          </p>
        </div>

        {/* Tab switchers */}
        <div className="flex bg-slate-900 border border-slate-800 rounded-lg p-1">
          {[
            { id: "standings", label: "Standings", icon: Trophy },
            { id: "scorers", label: "Top Scorers", icon: Goal },
            { id: "assists", label: "Top Assists", icon: Star }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-md font-bold text-xs transition ${activeTab === tab.id ? 'bg-green-600 text-white shadow shadow-green-600/10' : 'text-slate-400 hover:text-slate-200'}`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Dynamic Tab Contents */}
      {activeTab === "standings" && (
        <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-[10px] font-bold text-slate-500 uppercase tracking-wider bg-slate-950/20">
                  <th className="py-3 px-4 w-12 text-center">Pos</th>
                  <th className="py-3 px-4">Club</th>
                  <th className="py-3 px-4 w-16 text-center">P</th>
                  <th className="py-3 px-4 w-12 text-center">W</th>
                  <th className="py-3 px-4 w-12 text-center">D</th>
                  <th className="py-3 px-4 w-12 text-center">L</th>
                  <th className="py-3 px-4 w-16 text-center">GD</th>
                  <th className="py-3 px-4 w-20 text-center">PTS</th>
                  <th className="py-3 px-4 w-32 text-center">Form</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900/50">
                {standings.map((st, idx) => {
                  const pos = idx + 1;
                  const isPlayer = st.clubId === playerClub.id;

                  // Champions League/Relegation colors
                  let rankColor = "text-slate-400";
                  if (pos <= 4) rankColor = "text-sky-400 bg-sky-400/5"; // Champions League
                  else if (pos > standings.length - 3) rankColor = "text-rose-500 bg-rose-500/5"; // Relegation

                  return (
                    <tr 
                      key={st.clubId}
                      className={`hover:bg-slate-900/40 transition duration-150 ${isPlayer ? 'bg-green-600/5 text-green-400' : ''}`}
                    >
                      <td className={`py-3.5 px-4 text-center font-black ${rankColor}`}>
                        {pos}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-200">
                        {st.clubName}
                        {isPlayer && <span className="ml-2 text-[9px] bg-green-500/10 text-green-400 px-1 py-0.5 rounded font-extrabold uppercase">You</span>}
                      </td>
                      <td className="py-3.5 px-4 text-center text-slate-400 font-semibold">{st.played}</td>
                      <td className="py-3.5 px-4 text-center text-slate-400">{st.won}</td>
                      <td className="py-3.5 px-4 text-center text-slate-400">{st.drawn}</td>
                      <td className="py-3.5 px-4 text-center text-slate-400">{st.lost}</td>
                      <td className={`py-3.5 px-4 text-center font-bold ${st.gd > 0 ? 'text-green-400' : st.gd < 0 ? 'text-rose-500' : 'text-slate-400'}`}>
                        {st.gd > 0 ? `+${st.gd}` : st.gd}
                      </td>
                      <td className="py-3.5 px-4 text-center font-black text-slate-100 text-sm">{st.points}</td>
                      <td className="py-3.5 px-4">
                        <div className="flex gap-1 justify-center">
                          {st.form.map((f, i) => (
                            <span 
                              key={i} 
                              className={`w-4 h-4 rounded-sm flex items-center justify-center font-bold text-[9px] text-white ${f === 'W' ? 'bg-green-600' : f === 'D' ? 'bg-slate-700' : 'bg-rose-600'}`}
                            >
                              {f}
                            </span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Top Scorers list */}
      {activeTab === "scorers" && (
        <div className="glass-card rounded-2xl border border-slate-800 p-6 shadow-xl flex flex-col gap-4">
          <h3 className="text-sm font-bold text-slate-200 border-b border-slate-800 pb-3 flex items-center gap-1.5">
            <Goal className="w-4 h-4 text-green-500" />
            Top Goalscorers List
          </h3>

          <div className="flex flex-col gap-2">
            {topScorers.length === 0 ? (
              <div className="text-center py-10 text-xs text-slate-500">No goals scored yet this season.</div>
            ) : (
              topScorers.map((p, idx) => (
                <div 
                  key={p.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-slate-900/50 border border-slate-850 hover:bg-slate-900 transition"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-black text-slate-500 w-6">#{idx + 1}</span>
                    <div>
                      <h4 className="text-xs font-bold text-slate-200">{p.name}</h4>
                      <p className="text-[9px] text-slate-500 uppercase font-semibold mt-0.5">{getClubName(p.clubId)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-black text-green-400">{p.goals} Goals</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Top Assists list */}
      {activeTab === "assists" && (
        <div className="glass-card rounded-2xl border border-slate-800 p-6 shadow-xl flex flex-col gap-4">
          <h3 className="text-sm font-bold text-slate-200 border-b border-slate-800 pb-3 flex items-center gap-1.5">
            <Star className="w-4 h-4 text-green-500" />
            Top Assists List
          </h3>

          <div className="flex flex-col gap-2">
            {topAssists.length === 0 ? (
              <div className="text-center py-10 text-xs text-slate-500">No assists registered yet this season.</div>
            ) : (
              topAssists.map((p, idx) => (
                <div 
                  key={p.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-slate-900/50 border border-slate-850 hover:bg-slate-900 transition"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-black text-slate-500 w-6">#{idx + 1}</span>
                    <div>
                      <h4 className="text-xs font-bold text-slate-200">{p.name}</h4>
                      <p className="text-[9px] text-slate-500 uppercase font-semibold mt-0.5">{getClubName(p.clubId)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-black text-green-400">{p.assists} Assists</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
