/* eslint-disable */
"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useGame } from "../../../context/GameContext";
import { Player, Club, calculateValue } from "../../../config/seededData";
import { ScoutTask, Scout } from "../../../db/storage";
import { 
  Search, Eye, Shield, Users, Calendar, Sparkles, UserPlus, 
  Trash2, Compass, AlertCircle, BarChart2, Star, CheckCircle, PlusCircle
} from "lucide-react";

interface ScoutDisplay extends Scout {
  status: "Idle" | "Scouting";
}

export default function Scouting() {
  const { activeSave, updateActiveSave } = useGame();
  
  // State for active tabs
  const [activeTab, setActiveTab] = useState<"hub" | "manage" | "shortlist" | "completed">("hub");
  
  // Search state to assign new scouting tasks
  const [searchQuery, setSearchQuery] = useState("");
  const [scoutingResults, setScoutingResults] = useState<Player[]>([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  
  const router = useRouter();

  // Clear toast after 3s
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  if (!activeSave) return null;

  const playerClub = activeSave.clubs.find(c => c.id === activeSave.selectedClubId)!;

  const scoutsList: ScoutDisplay[] = useMemo(() => {
    const tasks = activeSave.scoutingTasks.filter(t => !t.completed);
    return (activeSave.scouts || []).map(scout => ({
      ...scout,
      status: tasks.some(t => t.scoutId === scout.id) ? "Scouting" as const : "Idle" as const
    }));
  }, [activeSave.scoutingTasks, activeSave.scouts]);

  // Search for players to scout
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    // Filter players that are NOT in the user's club and are NOT already being scouted
    const results = activeSave.players.filter(p => {
      const isNotUserClub = p.clubId !== playerClub.id;
      const matchesName = p.name.toLowerCase().includes(searchQuery.toLowerCase());
      const isNotAlreadyScouting = !activeSave.scoutingTasks.some(t => t.playerName === p.name && !t.completed);
      
      return isNotUserClub && matchesName && isNotAlreadyScouting;
    });

    setScoutingResults(results.slice(0, 5)); // show top 5 results
    if (results.length === 0) {
      setErrorMessage("No players found, or player is already under active scouting.");
    } else {
      setErrorMessage("");
    }
  };

  // Assign scout to player
  const assignScout = (player: Player, scoutId: string) => {
    const activeTasks = activeSave.scoutingTasks.filter(t => !t.completed);
    const scoutTasksCount = activeTasks.filter(t => t.scoutId === scoutId).length;

    if (scoutTasksCount > 0) {
      alert("This scout is already busy on another assignment.");
      return;
    }

    const playerClubDetails = activeSave.clubs.find(c => c.id === player.clubId);
    
    const scout = (activeSave.scouts || []).find(s => s.id === scoutId);
    if (!scout) return;

    // Fuzzy Potential
    const variance = Math.max(1, 6 - scout.rating);
    const playerRatingMin = Math.max(1, player.potential - Math.floor(Math.random() * variance));
    const playerRatingMax = Math.min(99, player.potential + Math.floor(Math.random() * variance));

    // Dynamic Time
    const isForeign = playerClubDetails && playerClubDetails.league !== playerClub.league;
    const daysRemaining = (isForeign ? 3 : 2) + Math.max(0, 3 - scout.rating);

    // Estimated Value using actual age
    const estimatedValue = calculateValue((playerRatingMin + playerRatingMax) / 2, player.age);

    // Create new task
    const newTask: ScoutTask = {
      id: `task_${Date.now()}`,
      playerName: player.name,
      playerClub: playerClubDetails ? playerClubDetails.name : "Free Agent",
      playerClubId: player.clubId,
      playerRatingMin,
      playerRatingMax,
      playerAge: player.age,
      estimatedValue,
      position: player.position,
      scoutId,
      daysRemaining,
      completed: false
    };

    const newState = {
      ...activeSave,
      scoutingTasks: [...activeSave.scoutingTasks, newTask]
    };
    newState.gameLog.unshift(`Assigned scout to analyze ${player.name} (${player.position}). Report ready in ${daysRemaining} Matchdays.`);
    
    updateActiveSave(newState);
    setSearchQuery("");
    setScoutingResults([]);
    setToastMessage(`Assigned scout to analyze ${player.name}.`);
  };

  // Remove scout task
  const cancelScoutTask = (taskId: string) => {
    const newState = {
      ...activeSave,
      scoutingTasks: activeSave.scoutingTasks.filter(t => t.id !== taskId)
    };
    updateActiveSave(newState);
  };

  // Hire Scout
  const hireScout = () => {
    if ((activeSave.scouts || []).length >= 5) {
      setToastMessage("You have reached the maximum number of scouts.");
      return;
    }
    const names = ["Jürgen Becker", "Jean-Pierre", "Gary Cahill", "Luis Silva", "Paolo Rossi", "Steve Bould"];
    const specialties = ["Defenders", "Attackers", "Youth Prospects", "General", "Goalkeepers", "Technical Playmakers"];
    const rating = Math.floor(Math.random() * 5) + 1;
    const wage = rating * 300 + 200;
    
    const newScout: Scout = {
      id: `scout_${Date.now()}`,
      name: names[Math.floor(Math.random() * names.length)],
      rating,
      specialty: specialties[Math.floor(Math.random() * specialties.length)],
      wage
    };
    
    updateActiveSave({
      ...activeSave,
      scouts: [...(activeSave.scouts || []), newScout]
    });
  };

  // Fire Scout
  const fireScout = (id: string) => {
    const activeTasks = activeSave.scoutingTasks.filter(t => !t.completed && t.scoutId === id);
    if (activeTasks.length > 0) {
      setToastMessage("Cannot fire a scout while they are on assignment.");
      return;
    }
    updateActiveSave({
      ...activeSave,
      scouts: (activeSave.scouts || []).filter(s => s.id !== id)
    });
  };

  // Add player to shortlist
  const addShortlist = (playerId: string) => {
    if (activeSave.scoutShortlist.includes(playerId)) return;
    const newState = {
      ...activeSave,
      scoutShortlist: [...activeSave.scoutShortlist, playerId]
    };
    updateActiveSave(newState);
    setToastMessage("Player added to shortlist.");
  };

  // Remove player from shortlist
  const removeShortlist = (playerId: string) => {
    const newState = {
      ...activeSave,
      scoutShortlist: activeSave.scoutShortlist.filter(id => id !== playerId)
    };
    updateActiveSave(newState);
  };

  // Get shortlisted players detailed information
  const shortlistedPlayers = useMemo(() => {
    return activeSave.players.filter(p => activeSave.scoutShortlist.includes(p.id));
  }, [activeSave.players, activeSave.scoutShortlist]);

  // Completed scout reports
  const completedReports = useMemo(() => {
    return activeSave.scoutingTasks.filter(t => t.completed);
  }, [activeSave.scoutingTasks]);

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-black text-white uppercase tracking-tight flex items-center gap-3">
            <Search className="w-8 h-8 text-green-500" /> Scouting Network
          </h1>
          <p className="text-sm text-slate-400 mt-2 font-medium">Manage your scouts, identify talent, and build your shortlist.</p>
        </div>
      </div>

      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] bg-green-600/90 text-white px-6 py-3 rounded-full font-bold shadow-2xl backdrop-blur-sm border border-green-500 flex items-center gap-2">
          <CheckCircle className="w-4 h-4" />
          {toastMessage}
        </div>
      )}

      {/* Tabs Menu */}
      <div className="flex gap-2 border-b border-slate-800 pb-4">
          <button onClick={() => setActiveTab("hub")} className={`px-4 py-2 text-xs font-bold uppercase rounded-xl transition flex items-center gap-2 ${activeTab === "hub" ? 'bg-green-600 text-white shadow-lg shadow-green-600/20' : 'bg-slate-900 text-slate-400 hover:bg-slate-800'}`}>
            <Compass className="w-3.5 h-3.5" /> Hub
          </button>
          <button onClick={() => setActiveTab("manage")} className={`px-4 py-2 text-xs font-bold uppercase rounded-xl transition flex items-center gap-2 ${activeTab === "manage" ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/20' : 'bg-slate-900 text-slate-400 hover:bg-slate-800'}`}>
            <Users className="w-3.5 h-3.5" /> Manage Scouts
          </button>
          <button onClick={() => setActiveTab("shortlist")} className={`px-4 py-2 text-xs font-bold uppercase rounded-xl transition flex items-center gap-2 ${activeTab === "shortlist" ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'bg-slate-900 text-slate-400 hover:bg-slate-800'}`}>
            <Star className="w-3.5 h-3.5" /> Shortlist ({activeSave.scoutShortlist.length})
          </button>
          <button onClick={() => setActiveTab("completed")} className={`px-4 py-2 text-xs font-bold uppercase rounded-xl transition flex items-center gap-2 ${activeTab === "completed" ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20' : 'bg-slate-900 text-slate-400 hover:bg-slate-800'}`}>
            <CheckCircle className="w-3.5 h-3.5" /> Reports ({completedReports.length})
          </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Tab content */}
        {activeTab === "manage" && (
          <div className="lg:col-span-3 flex flex-col gap-6">
            <div className="flex justify-between items-center border-b border-slate-800 pb-2">
              <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-400 border-l-2 border-amber-500 pl-2">
                Manage Scouting Staff
              </h3>
              <button onClick={hireScout} className="bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs py-2 px-4 rounded-lg flex items-center gap-1.5 shadow transition">
                <PlusCircle className="w-3.5 h-3.5" /> Hire Scout
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {scoutsList.map((scout) => (
                <div key={scout.id} className="glass-card p-4 rounded-xl border border-slate-850 flex flex-col justify-between gap-4">
                  <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between items-start">
                      <h4 className="font-extrabold text-slate-100 text-sm">{scout.name}</h4>
                      <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded ${
                        scout.status === "Idle" ? "bg-green-600/10 text-green-400 border border-green-500/25" : "bg-amber-600/10 text-amber-400 border border-amber-500/25"
                      }`}>
                        {scout.status}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-450">{scout.specialty}</p>
                  </div>
                  
                  <div className="flex flex-col gap-2 pt-2 border-t border-slate-900">
                    <div className="flex justify-between items-center text-xs font-bold text-slate-500">
                      <span>Rating:</span>
                      <div className="flex gap-0.5 text-amber-500">
                        {Array.from({ length: scout.rating }).map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-current" />
                        ))}
                      </div>
                    </div>
                    <div className="flex justify-between items-center text-xs font-bold text-slate-500">
                      <span>Wage:</span>
                      <span className="text-slate-300">£{scout.wage.toLocaleString()}/wk</span>
                    </div>
                    
                    <button onClick={() => fireScout(scout.id)} className="mt-2 w-full bg-rose-600/10 hover:bg-rose-600/20 text-rose-500 border border-rose-600/20 font-bold text-xs py-2 px-4 rounded-lg transition flex justify-center items-center gap-1.5">
                      <Trash2 className="w-3.5 h-3.5" /> Fire Scout
                    </button>
                  </div>
                </div>
              ))}
              
              {scoutsList.length < 5 && (
                <div onClick={hireScout} className="border-2 border-dashed border-slate-800 rounded-xl flex flex-col items-center justify-center p-6 gap-2 text-slate-500 hover:text-slate-300 hover:border-slate-600 cursor-pointer transition h-full min-h-[160px]">
                  <UserPlus className="w-8 h-8 opacity-50" />
                  <span className="font-bold text-xs uppercase">Find New Scout</span>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "hub" && (
          <>
            {/* Left Col: Scout Staff & New Assignments */}
            <div className="lg:col-span-2 flex flex-col gap-6">
              
              {/* Scouts Roster */}
              <div className="flex flex-col gap-4">
                <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-400 border-l-2 border-green-500 pl-2">
                  Scouting Staff
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {scoutsList.map((scout) => (
                    <div 
                      key={scout.id}
                      className="glass-card p-4 rounded-xl border border-slate-850 flex flex-col justify-between gap-4"
                    >
                      <div className="flex flex-col gap-1.5">
                        <div className="flex justify-between items-start">
                          <h4 className="font-extrabold text-slate-100 text-xs">{scout.name}</h4>
                          <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded ${
                            scout.status === "Idle" ? "bg-green-600/10 text-green-400 border border-green-500/25" : "bg-amber-600/10 text-amber-400 border border-amber-500/25"
                          }`}>
                            {scout.status}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-450">{scout.specialty}</p>
                      </div>

                      <div className="flex justify-between items-center text-xs font-bold text-slate-500 pt-2 border-t border-slate-900">
                        <span>Rating:</span>
                        <div className="flex gap-0.5 text-amber-500">
                          {Array.from({ length: scout.rating }).map((_, i) => (
                            <Star key={i} className="w-3 h-3 fill-current" />
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Assign Scout Search */}
              <div className="glass-card p-5 rounded-xl border-slate-850 flex flex-col gap-4">
                <div>
                  <h3 className="font-extrabold text-slate-100 text-xs">Assign Scout to Target</h3>
                  <p className="text-[10px] text-slate-500 mt-1">Search players in the transfer database to assign scouts to inspect them.</p>
                </div>

                <form onSubmit={handleSearch} className="flex gap-2">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Enter player name..."
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-green-500 font-bold"
                  />
                  <button
                    type="submit"
                    className="bg-green-600 hover:bg-green-500 text-white font-bold text-xs py-2 px-4 rounded-lg flex items-center gap-1.5 shadow transition"
                  >
                    <Search className="w-3.5 h-3.5" />
                    Find
                  </button>
                </form>

                {errorMessage && (
                  <p className="text-[10px] text-rose-400 font-semibold">{errorMessage}</p>
                )}

                {/* Scouting search results */}
                {scoutingResults.length > 0 && (
                  <div className="flex flex-col border border-slate-850 rounded-xl divide-y divide-slate-850 overflow-hidden bg-slate-950/20 text-xs">
                    {scoutingResults.map(p => (
                      <div key={p.id} className="p-3 flex justify-between items-center hover:bg-slate-900/20 transition">
                        <div>
                          <span className="font-bold text-slate-200 block">{p.name} ({p.position})</span>
                          <span className="text-[9px] text-slate-550 block mt-0.5">OVR {p.overall} • Age {p.age}</span>
                        </div>

                        {/* Assign to idle scouts */}
                        <div className="flex gap-1.5 flex-wrap">
                          <button
                            onClick={() => addShortlist(p.id)}
                            className="px-2 py-1 rounded text-[9px] font-bold border transition bg-blue-600/10 border-blue-500/20 text-blue-400 hover:bg-blue-600 hover:text-white"
                          >
                            <Star className="w-2.5 h-2.5 inline mr-1" />
                            Shortlist
                          </button>
                          {scoutsList.map(s => (
                            <button
                              key={s.id}
                              disabled={s.status === "Scouting"}
                              onClick={() => assignScout(p, s.id)}
                              className={`px-2 py-1 rounded text-[9px] font-bold border transition ${
                                s.status === "Scouting" 
                                  ? 'bg-slate-950 text-slate-600 border-slate-900 cursor-not-allowed'
                                  : 'bg-green-600/10 border-green-500/20 text-green-400 hover:bg-green-600 hover:text-white'
                              }`}
                            >
                              Assign {s.name.split(" ")[0]}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right Col: Active Tasks */}
            <div className="lg:col-span-1 flex flex-col gap-4">
              <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-400 border-l-2 border-green-500 pl-2">
                Active Assignments
              </h3>

              <div className="flex flex-col gap-3">
                {activeSave.scoutingTasks.filter(t => !t.completed).length === 0 ? (
                  <div className="glass-card p-6 text-center text-slate-500 font-bold rounded-xl text-xs">
                    No active assignments. All scouts are idle.
                  </div>
                ) : (
                  activeSave.scoutingTasks.filter(t => !t.completed).map((task) => {
                    const scout = scoutsList.find(s => s.id === task.scoutId);
                    return (
                      <div 
                        key={task.id}
                        className="glass-card p-4 rounded-xl border border-slate-850 flex flex-col gap-3 text-xs"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-extrabold text-slate-200">{task.playerName}</h4>
                            <span className="text-[10px] text-slate-450 mt-1 block font-semibold">{task.position} • {task.playerClub}</span>
                          </div>
                          
                          <button
                            onClick={() => cancelScoutTask(task.id)}
                            className="p-1 hover:bg-rose-500/10 hover:text-rose-400 text-slate-550 rounded border border-transparent hover:border-rose-500/10"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-850 flex justify-between items-center text-[10px]">
                          <div>
                            <span className="text-slate-500 block">Assigned Scout:</span>
                            <span className="font-bold text-slate-350">{scout?.name}</span>
                          </div>
                          
                          <div className="text-right">
                            <span className="text-slate-500 block">Duration:</span>
                            <span className="font-extrabold text-amber-500 flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-amber-500" />
                              {task.daysRemaining} Matchdays left
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </>
        )}

        {/* Shortlist Tab */}
        {activeTab === "shortlist" && (
          <div className="lg:col-span-3">
            <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/50">
              {shortlistedPlayers.length === 0 ? (
                <div className="p-8 text-center text-slate-500 font-bold text-xs">
                  Your scouting shortlist is empty. Search players under the "Transfers" panel and add them.
                </div>
              ) : (
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-850 text-[10px] font-bold text-slate-500 uppercase tracking-wider bg-slate-950/20">
                      <th className="py-3 px-4">Name</th>
                      <th className="py-3 px-4">Club</th>
                      <th className="py-3 px-4">Age / Position</th>
                      <th className="py-3 px-4">Value</th>
                      <th className="py-3 px-4 text-center">Scout Potential</th>
                      <th className="py-3 px-4 text-right">OVR</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-900/50">
                    {shortlistedPlayers.map(player => {
                      const club = activeSave.clubs.find(c => c.id === player.clubId);
                      
                      // Check if we scouted him completely
                      const isScouted = activeSave.scoutingTasks.some(t => t.playerName === player.name && t.completed);
                      const scoutingLevel = activeSave.manager.attributes.scouting;

                      return (
                        <tr key={player.id} className="hover:bg-slate-900/40 transition">
                          <td className="py-3.5 px-4 font-bold text-slate-200">{player.name}</td>
                          <td className="py-3.5 px-4 text-slate-400 font-semibold">{club ? club.shortName : "Free Agent"}</td>
                          <td className="py-3.5 px-4 text-slate-400 font-medium">
                            {player.age} yrs • <span className="font-bold text-green-500">{player.position}</span>
                          </td>
                          <td className="py-3.5 px-4 font-black text-green-400">
                            €{(player.value / 1000000).toFixed(1)}M
                          </td>
                          <td className="py-3.5 px-4 text-center font-bold text-slate-200">
                            {isScouted ? (
                              <span className="text-green-400 font-black">{player.potential} (Revealed)</span>
                            ) : scoutingLevel >= 15 ? (
                              <span>{player.potential}</span>
                            ) : scoutingLevel >= 10 ? (
                              <span className="text-slate-450">{Math.max(50, player.potential - 3)}-{Math.min(99, player.potential + 3)}</span>
                            ) : (
                              <span className="text-slate-500">{Math.max(50, player.potential - 6)}-{Math.min(99, player.potential + 6)}</span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-right font-black text-slate-200 text-sm">{player.overall}</td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex justify-end gap-2">
                              {!isScouted && (
                                <button
                                  onClick={() => {
                                    // pick first idle scout
                                    const idleScout = scoutsList.find(s => s.status === "Idle");
                                    if (!idleScout) {
                                      alert("All scouts are currently busy. Wait for them to finish current tasks.");
                                    } else {
                                      assignScout(player, idleScout.id);
                                    }
                                  }}
                                  className="bg-slate-950 border border-slate-800 text-[10px] px-2.5 py-1.5 rounded-lg font-bold text-slate-400 hover:text-white"
                                >
                                  Scout
                                </button>
                              )}
                              <button
                                onClick={() => removeShortlist(player.id)}
                                className="bg-rose-950/20 hover:bg-rose-950 border border-rose-500/20 text-rose-400 px-2 py-1.5 rounded-lg text-[10px] font-bold"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

          {/* Completed Reports Tab */}
          {activeTab === "completed" && (
            <div className="lg:col-span-3 flex flex-col gap-4">
              <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-400 border-l-2 border-green-500 pl-2">
                Scouting Reports Archive
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {completedReports.length === 0 ? (
                  <div className="glass-card p-6 text-center text-slate-500 font-bold rounded-xl text-xs col-span-2">
                    No completed reports yet. Assign scouts under the "Scouting Hub" to receive reports.
                  </div>
                ) : (
                  completedReports.map((report) => (
                    <div 
                      key={report.id}
                      className="glass-card p-4 rounded-xl border border-slate-850 flex flex-col gap-3 text-xs"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-extrabold text-slate-200 text-sm">{report.playerName}</h4>
                          <span className="text-[10px] text-slate-450 mt-1 block font-bold">{report.position} • {report.playerClub}</span>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => addShortlist(report.playerClubId)} className="w-7 h-7 flex items-center justify-center rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-500 transition border border-blue-500/20" title="Add to Shortlist">
                            <Star className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => {
                            addShortlist(report.playerClubId);
                            router.push("/game/transfers");
                          }} className="w-7 h-7 flex items-center justify-center rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 transition border border-amber-500/20" title="Make Transfer Offer">
                            <BarChart2 className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => cancelScoutTask(report.id)} className="w-7 h-7 flex items-center justify-center rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 transition border border-rose-500/20" title="Delete Report">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="border-t border-slate-900 pt-3 flex flex-col gap-2">
                        <div className="flex justify-between">
                          <span className="text-slate-500">Est Potential:</span>
                          <span className="font-black text-green-400">{report.playerRatingMin === report.playerRatingMax ? report.playerRatingMin : `${report.playerRatingMin}-${report.playerRatingMax}`} / 99</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Est Value:</span>
                          <span className="font-extrabold text-slate-350">€{(report.estimatedValue/1000000).toFixed(1)}M</span>
                        </div>
                      </div>

                      <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-850 flex items-center gap-2 text-[10px] leading-relaxed text-slate-400 mt-1">
                        <CheckCircle className="w-3.5 h-3.5 text-green-500 shrink-0" />
                        <span>
                          {report.playerAge > 28 ? "Experienced player, good for short-term impact." : 
                           report.playerAge < 22 ? "High developmental headroom, strong prospect." : 
                           "In their prime, ready for first-team action."}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
      </div>
    </div>
  );
}
