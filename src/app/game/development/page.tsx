/* eslint-disable */
"use client";

import React, { useState, useEffect } from "react";
import { useGame } from "../../../context/GameContext";
import { Player, calculateValue } from "../../../config/seededData";
import { 
  TrendingUp, Sparkles, UserCheck, Star, ShieldAlert, 
  Activity, Target, Shield, Flame, Activity as Dribbble
} from "lucide-react";

export default function Development() {
  const { activeSave, updateActiveSave } = useGame();
  
  // Tab state: "Training Focus" | "Youth Academy"
  const [activeTab, setActiveTab] = useState<"training" | "academy">("training");
  const [academyPlayers, setAcademyPlayers] = useState<Player[]>([]);

  if (!activeSave) return null;

  const playerClub = activeSave.clubs.find(c => c.id === activeSave.selectedClubId)!;
  const squad = activeSave.players.filter(p => p.clubId === playerClub.id);

  // Load or generate Youth Academy prospects
  useEffect(() => {
    if (!activeSave) return;
    const academyKey = `gaffer_iq_academy_${activeSave.id}_s${activeSave.currentSeason}`;
    const stored = localStorage.getItem(academyKey);

    if (stored) {
      try {
        setAcademyPlayers(JSON.parse(stored));
      } catch (e) {
        generateAcademyProspects();
      }
    } else {
      generateAcademyProspects();
    }
  }, [activeSave?.id, activeSave?.currentSeason]);

  const generateAcademyProspects = () => {
    const prospects: Player[] = [];
    const positions = ["GK", "DEF", "MID", "ATT"] as const;
    const nationalities = [
      { name: "England", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
      { name: "Spain", flag: "🇪🇸" },
      { name: "Italy", flag: "🇮🇹" },
      { name: "Germany", flag: "🇩🇪" },
      { name: "France", flag: "🇫🇷" }
    ];
    const firstNames = ["Leo", "Mason", "Jonas", "Lucas", "Oliver", "Alessandro", "Pedro", "Kai"];
    const lastNames = ["Smith", "Gomez", "Müller", "Dubois", "Rossi", "Bauer", "Taylor", "Silva"];

    for (let i = 0; i < 3; i++) {
      const pos = positions[Math.floor(Math.random() * positions.length)];
      const nat = nationalities[Math.floor(Math.random() * nationalities.length)];
      const name = `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;
      const age = Math.floor(Math.random() * 3) + 15; // 15 to 17
      
      const overall = Math.floor(Math.random() * 12) + 48; // 48 to 59
      const potential = Math.floor(Math.random() * 12) + 78; // 78 to 89

      // attributes
      const cap = (val: number) => Math.max(1, Math.min(99, val));
      const stats = {
        pace: cap(overall + Math.floor(Math.random() * 15) - 5),
        shooting: cap(overall + Math.floor(Math.random() * 15) - 5),
        passing: cap(overall + Math.floor(Math.random() * 15) - 5),
        dribbling: cap(overall + Math.floor(Math.random() * 15) - 5),
        defending: cap(overall + Math.floor(Math.random() * 15) - 5),
        physical: cap(overall + Math.floor(Math.random() * 15) - 5),
        mental: cap(overall + Math.floor(Math.random() * 15) - 5),
        stamina: cap(overall + Math.floor(Math.random() * 15) - 5)
      };

      prospects.push({
        id: `youth_${Date.now()}_${i}`,
        clubId: "academy",
        name,
        position: pos,
        age,
        nationality: nat.name,
        nationalityFlag: nat.flag,
        ...stats,
        overall,
        potential,
        wage: 500, // cheap contract
        value: calculateValue(overall, age),
        morale: 85,
        personality: "Professional",
        contractExpiry: 3,
        injuryStatus: "Fit",
        goals: 0,
        assists: 0,
        ratingHistory: [],
        trainingFocus: "Balanced"
      });
    }

    const academyKey = `gaffer_iq_academy_${activeSave.id}_s${activeSave.currentSeason}`;
    localStorage.setItem(academyKey, JSON.stringify(prospects));
    setAcademyPlayers(prospects);
  };

  // Change individual player training focus
  const handleFocusChange = (playerId: string, focus: Player["trainingFocus"]) => {
    const newState = { ...activeSave };
    const player = newState.players.find(p => p.id === playerId);
    if (player) {
      player.trainingFocus = focus;
      updateActiveSave(newState);
    }
  };

  // Promote youth player to senior squad
  const promoteProspect = (prospect: Player) => {
    if (squad.length >= 25) {
      alert("Squad is full! You can only register up to 25 players in the first team. Sell or release players first.");
      return;
    }

    const newState = { ...activeSave };
    
    // Convert youth prospect to club player
    const newPlayer: Player = {
      ...prospect,
      clubId: playerClub.id,
      wage: 1000, // standard first contract
      contractExpiry: 3,
      morale: 100, // thrilled
    };

    newState.players.push(newPlayer);
    newState.gameLog.unshift(`PROMOTED: Youth prospect ${prospect.name} (${prospect.position}) has been signed to the first team.`);
    
    // Update active save
    updateActiveSave(newState);

    // Update local state and save to local storage
    const updatedProspects = academyPlayers.filter(p => p.id !== prospect.id);
    const academyKey = `gaffer_iq_academy_${activeSave.id}_s${activeSave.currentSeason}`;
    localStorage.setItem(academyKey, JSON.stringify(updatedProspects));
    setAcademyPlayers(updatedProspects);

    alert(`${prospect.name} has been promoted to the first-team squad!`);
  };

  // Mapping of training focus to the attributes it boosts (mirrors developPlayers logic)
  const focusAttributeMap: Record<string, { attrs: string[]; color: string; icon: React.ReactNode }> = {
    Balanced: { attrs: ["All Attributes"], color: "slate", icon: <Dribbble className="w-4 h-4 text-slate-400" /> },
    Attacking: { attrs: ["Shooting", "Dribbling", "Passing"], color: "rose", icon: <Target className="w-4 h-4 text-rose-500" /> },
    Defensive: { attrs: ["Defending", "Physical", "Stamina"], color: "blue", icon: <Shield className="w-4 h-4 text-blue-500" /> },
    Fitness: { attrs: ["Pace", "Stamina", "Physical"], color: "amber", icon: <Flame className="w-4 h-4 text-amber-500" /> },
    Tactical: { attrs: ["Mental", "Passing", "Stamina"], color: "emerald", icon: <Activity className="w-4 h-4 text-emerald-500" /> },
  };

  const getFocusIcon = (focus: string) => focusAttributeMap[focus]?.icon ?? <Dribbble className="w-4 h-4 text-slate-400" />;

  const focusColorClasses: Record<string, string> = {
    slate: "bg-slate-500/10 text-slate-400 border-slate-500/20",
    rose: "bg-rose-500/10 text-rose-400 border-rose-500/20",
    blue: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    amber: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    emerald: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-500" />
            Player Development & Academy
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Configure training programs to grow player attributes or promote prospects from the youth academy.
          </p>
        </div>
      </div>

      {/* Training Focus Legend */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        {Object.entries(focusAttributeMap).map(([name, info]) => (
          <div key={name} className="flex flex-col gap-1.5 p-3 rounded-xl border border-slate-850 bg-slate-900/40">
            <div className="flex items-center gap-1.5 text-[11px] font-extrabold text-slate-200">
              {info.icon}
              {name}
            </div>
            <div className="flex flex-wrap gap-1">
              {info.attrs.map(attr => (
                <span
                  key={attr}
                  className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${focusColorClasses[info.color]}`}
                >
                  +{attr}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Tabs Menu */}
      <div className="flex border-b border-slate-800 text-xs font-bold text-slate-400">
        <button
          onClick={() => setActiveTab("training")}
          className={`px-4 py-3 border-b-2 transition ${activeTab === "training" ? "border-green-500 text-slate-100" : "border-transparent hover:text-slate-200"}`}
        >
          Training Dashboard
        </button>
        <button
          onClick={() => setActiveTab("academy")}
          className={`px-4 py-3 border-b-2 transition ${activeTab === "academy" ? "border-green-500 text-slate-100" : "border-transparent hover:text-slate-200"}`}
        >
          Youth Academy ({academyPlayers.length})
        </button>
      </div>

      {activeTab === "training" && (
        <div className="flex flex-col gap-4">
          <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-400 border-l-2 border-green-500 pl-2">
            Squad Development Focus
          </h3>

          <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/50">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-850 text-[10px] font-bold text-slate-500 uppercase tracking-wider bg-slate-950/20">
                  <th className="py-3 px-4">Name</th>
                  <th className="py-3 px-4">Age / Position</th>
                  <th className="py-3 px-4">Growth potential</th>
                  <th className="py-3 px-4">Current Focus & Effects</th>
                  <th className="py-3 px-4">Change Focus</th>
                  <th className="py-3 px-4 text-right">OVR</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900/50">
                {squad.map(player => {
                  const focus = player.trainingFocus || "Balanced";
                  const potentialGap = player.potential - player.overall;
                  const focusInfo = focusAttributeMap[focus] || focusAttributeMap["Balanced"];
                  const colorClass = focusColorClasses[focusInfo.color] || focusColorClasses["slate"];
                  return (
                    <tr key={player.id} className="hover:bg-slate-900/40 transition">
                      <td className="py-3.5 px-4 font-bold text-slate-200">
                        {player.name}
                        {player.age <= 21 && (
                          <span className="ml-2 text-[9px] bg-green-500/10 text-green-400 border border-green-500/20 px-1 py-0.5 rounded font-extrabold uppercase">Wonderkid</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-slate-400">
                        {player.age} yrs • <span className="font-bold text-green-500">{player.position}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          <div className="w-20 h-1.5 bg-slate-950 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-green-500" 
                              style={{ width: `${Math.max(1, (potentialGap / 15) * 100)}%` }}
                            />
                          </div>
                          <span className="text-[10px] text-slate-550 font-bold">Max +{potentialGap}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-1.5 font-semibold text-slate-300">
                            {getFocusIcon(focus)}
                            <span>{focus}</span>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {focusInfo.attrs.map(attr => (
                              <span key={attr} className={`text-[8px] font-bold px-1 py-px rounded border ${colorClass}`}>
                                +{attr}
                              </span>
                            ))}
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex gap-1">
                          {["Balanced", "Attacking", "Defensive", "Fitness", "Tactical"].map(f => {
                            const btnInfo = focusAttributeMap[f];
                            return (
                              <button
                                key={f}
                                onClick={() => handleFocusChange(player.id, f as any)}
                                title={`Boosts: ${btnInfo.attrs.join(", ")}`}
                                className={`px-2 py-1 rounded text-[9px] font-bold border transition ${
                                  focus === f 
                                    ? 'bg-green-600 border-green-500 text-white shadow shadow-green-600/10' 
                                    : 'bg-slate-950 border-slate-850 text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                                }`}
                              >
                                {f}
                              </button>
                            );
                          })}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right font-black text-green-400 text-sm">{player.overall}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "academy" && (
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-400 border-l-2 border-green-500 pl-2">
              Youth Prospects (Season {activeSave.currentSeason})
            </h3>
            
            {academyPlayers.length === 0 && (
              <span className="text-[10px] text-slate-500 font-bold uppercase">
                Next class arrives next season.
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {academyPlayers.length === 0 ? (
              <div className="glass-card p-8 rounded-xl border border-slate-850 text-center text-slate-500 font-bold text-xs col-span-3">
                All academy prospects for this season have been promoted or released.
              </div>
            ) : (
              academyPlayers.map(prospect => (
                <div 
                  key={prospect.id}
                  className="glass-card p-5 rounded-2xl border border-slate-850 flex flex-col justify-between gap-5 relative overflow-hidden"
                >
                  {/* Top rating badge overlay */}
                  <div className="absolute top-0 right-0 w-16 h-16 bg-green-600/10 border-l border-b border-green-500/10 flex items-center justify-center text-green-400 font-black text-lg">
                    {prospect.overall}
                  </div>

                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{prospect.nationalityFlag}</span>
                      <span className="text-xs text-slate-450 font-bold uppercase">{prospect.nationality}</span>
                    </div>

                    <div>
                      <h4 className="text-base font-black text-slate-100">{prospect.name}</h4>
                      <p className="text-[10px] text-slate-500 mt-1 font-extrabold uppercase">
                        Age {prospect.age} • Position: <span className="text-green-500">{prospect.position}</span>
                      </p>
                    </div>
                  </div>

                  {/* Attributes Radar Bars */}
                  <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-850 flex flex-col gap-2 text-[10px] font-bold">
                    <div className="flex justify-between text-slate-400">
                      <span>Pace:</span>
                      <span className="text-slate-200">{prospect.pace}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Shooting:</span>
                      <span className="text-slate-200">{prospect.shooting}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Passing:</span>
                      <span className="text-slate-200">{prospect.passing}</span>
                    </div>
                    <div className="border-t border-slate-900 my-1"></div>
                    <div className="flex justify-between text-slate-400">
                      <span>Academy Potential:</span>
                      <span className="text-green-400 flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 text-green-500 fill-current" />
                        {prospect.potential}
                      </span>
                    </div>
                  </div>

                  {/* Promotion Button */}
                  <button
                    onClick={() => promoteProspect(prospect)}
                    className="w-full bg-green-600 hover:bg-green-500 text-white py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow shadow-green-600/10 transition active:scale-95"
                  >
                    <UserCheck className="w-4 h-4" />
                    Promote to Senior Squad
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
