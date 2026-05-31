"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, ChevronLeft, Lock, Shield, Landmark, Users } from "lucide-react";
import { CLUBS_DATA, LEAGUE_INFO, Club } from "../../../config/seededData";
import { CLUB_LOGOS } from "../../../config/clubLogos";

export default function ClubSelection() {
  const router = useRouter();
  
  const [manager, setManager] = useState<any>(null);
  const [selectedLeague, setSelectedLeague] = useState<"EPL" | "La Liga" | "Serie A" | "Bundesliga" | "Ligue 1">("EPL");
  const [selectedClub, setSelectedClub] = useState<Club | null>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem("gaffer_iq_onboarding_manager");
    if (!raw) {
      router.push("/onboarding/manager");
      return;
    }
    setManager(JSON.parse(raw));
  }, [router]);

  if (!manager) {
    return (
      <div className="min-h-screen bg-[#0f172a] text-slate-100 flex items-center justify-center">
        <div className="animate-pulse font-medium text-slate-400">Loading manager details...</div>
      </div>
    );
  }

  // Reputation locking formula:
  // Club reputation threshold is Manager Reputation + 65
  // Sunday League (5) -> Max club rep: 70
  // Amateur (20) -> Max club rep: 75
  // Semi-Pro (40) -> Max club rep: 82
  // Professional (60) -> Max club rep: 90
  // Continental/World Class -> All unlocked
  const maxClubRepAllowed = manager.reputation + 65;

  const isClubLocked = (club: Club) => {
    return club.reputation > maxClubRepAllowed;
  };

  const filteredClubs = CLUBS_DATA.filter(c => c.league === selectedLeague);

  const handleClubSelect = (club: Club) => {
    if (isClubLocked(club)) return;
    setSelectedClub(club);
  };

  const handleNext = () => {
    if (!selectedClub) return;
    sessionStorage.setItem("gaffer_iq_onboarding_club_id", selectedClub.id);
    router.push("/onboarding/squad-review");
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-100 flex flex-col justify-between py-12 px-6 lg:px-24">
      {/* Header */}
      <div className="max-w-6xl mx-auto w-full flex items-center justify-between border-b border-slate-800 pb-4 mb-8">
        <h1 className="text-2xl font-bold tracking-tight">
          GAFFER<span className="text-green-500">IQ</span>
        </h1>
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
          <span>Step 1: Manager</span>
          <span>→</span>
          <span className="text-green-400 font-bold">Step 2: Club</span>
          <span>→</span>
          <span>Step 3: Review</span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start my-auto">
        {/* Left: League & Clubs selector */}
        <div className="lg:col-span-8 flex flex-col gap-5">
          {/* League filters */}
          <div className="glass-card p-4 rounded-xl flex items-center gap-2 overflow-x-auto">
            {(["EPL", "La Liga", "Serie A", "Bundesliga", "Ligue 1"] as const).map(l => {
              const info = LEAGUE_INFO[l];
              const isActive = selectedLeague === l;
              return (
                <button
                  key={l}
                  onClick={() => {
                    setSelectedLeague(l);
                    setSelectedClub(null);
                  }}
                  className={`px-4 py-2 rounded-lg font-bold text-xs flex items-center gap-1.5 whitespace-nowrap transition duration-200 ${isActive ? 'bg-slate-900 border text-slate-100' : 'bg-slate-900/40 border border-transparent text-slate-400 hover:text-slate-200'}`}
                  style={{ borderColor: isActive ? info.color : "transparent" }}
                >
                  <span className="text-sm">{info.emoji}</span>
                  {info.name}
                </button>
              );
            })}
          </div>

          {/* Clubs Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {filteredClubs.map(club => {
              const locked = isClubLocked(club);
              const isSelected = selectedClub?.id === club.id;

              return (
                <button
                  key={club.id}
                  disabled={locked}
                  onClick={() => handleClubSelect(club)}
                  className={`p-4 rounded-xl border relative text-left flex flex-col justify-between h-[135px] transition duration-200 ${locked ? 'bg-slate-900/30 border-slate-950 opacity-40 cursor-not-allowed' : isSelected ? 'bg-green-600/10 border-green-500 scale-[1.02]' : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/80'}`}
                >
                  {/* Badge & Lock */}
                  <div className="flex items-start justify-between w-full">
                    {CLUB_LOGOS[club.id] ? (
                      <img src={CLUB_LOGOS[club.id]} alt={club.name} className="w-10 h-10 object-contain drop-shadow-md" />
                    ) : (
                      <div 
                        className="w-10 h-10 rounded-lg flex items-center justify-center font-extrabold text-sm shadow-md"
                        style={{ 
                          backgroundColor: club.primaryColor,
                          color: club.secondaryColor === "#ffffff" ? "#0f172a" : club.secondaryColor 
                        }}
                      >
                        {club.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    {locked && (
                      <div className="p-1 rounded bg-slate-950/80 text-rose-500">
                        <Lock className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </div>

                  {/* Club info */}
                  <div className="mt-3">
                    <h3 className="text-sm font-bold text-slate-100 leading-snug truncate">
                      {club.name}
                    </h3>
                    <p className="text-[10px] text-slate-400 mt-0.5 truncate">
                      Stadium: {club.stadium}
                    </p>
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-950/50 text-slate-300">
                        Rep: {club.reputation}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Club Detail Sidebar */}
        <div className="lg:col-span-4 flex flex-col gap-6 w-full">
          {/* Club Info card */}
          {selectedClub ? (
            <div className="glass-card p-6 rounded-2xl flex flex-col gap-5 shadow-xl animate-fade-in">
              {/* Profile Header */}
              <div className="flex items-center gap-4 border-b border-slate-800 pb-4">
                {CLUB_LOGOS[selectedClub.id] ? (
                  <img src={CLUB_LOGOS[selectedClub.id]} alt={selectedClub.name} className="w-16 h-16 object-contain drop-shadow-lg" />
                ) : (
                  <div 
                    className="w-14 h-14 rounded-xl flex items-center justify-center font-extrabold text-xl shadow"
                    style={{ 
                      backgroundColor: selectedClub.primaryColor,
                      color: selectedClub.secondaryColor === "#ffffff" ? "#0f172a" : selectedClub.secondaryColor 
                    }}
                  >
                    {selectedClub.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <h3 className="text-base font-extrabold text-white">{selectedClub.name}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">{selectedClub.stadium}</p>
                </div>
              </div>

              {/* Stats details */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between py-1.5 border-b border-slate-900/50 text-xs">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Shield className="w-4 h-4 text-green-500" /> Club Reputation
                  </span>
                  <span className="font-bold text-slate-100">{selectedClub.reputation}/100</span>
                </div>
                <div className="flex items-center justify-between py-1.5 border-b border-slate-900/50 text-xs">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-green-500" /> Stadium Capacity
                  </span>
                  <span className="font-bold text-slate-100">{selectedClub.capacity.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between py-1.5 border-b border-slate-900/50 text-xs">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Landmark className="w-4 h-4 text-green-500" /> Transfer Budget
                  </span>
                  <span className="font-bold text-green-400">€{(selectedClub.transferBudget / 1000000).toFixed(1)}M</span>
                </div>
                <div className="flex items-center justify-between py-1.5 border-b border-slate-900/50 text-xs">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Landmark className="w-4 h-4 text-green-500" /> Wage Budget
                  </span>
                  <span className="font-bold text-green-400">€{(selectedClub.wageBudget / 1000).toFixed(0)}k/wk</span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-2 w-full mt-2">
                <button
                  onClick={() => router.push("/onboarding/manager")}
                  className="flex-1 py-3 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-850 font-bold text-xs tracking-wider uppercase text-slate-400 flex items-center justify-center gap-1 active:scale-95 transition"
                >
                  <ChevronLeft className="w-4 h-4" /> Back
                </button>
                <button
                  onClick={handleNext}
                  className="flex-1 py-3 rounded-lg bg-green-600 hover:bg-green-500 font-bold text-xs tracking-wider uppercase text-white flex items-center justify-center gap-1 shadow shadow-green-600/10 active:scale-95 transition"
                >
                  Review Squad <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="glass-card p-6 rounded-2xl flex flex-col justify-center items-center text-center py-16 gap-3 text-slate-500">
              <div className="p-4 rounded-full bg-slate-900 border border-slate-800 text-slate-600">
                <Shield className="w-8 h-8" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-400">Select a Club</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-[200px]">Click on one of the unlocked clubs on the grid to view details and budgets.</p>
              </div>
              <button
                onClick={() => router.push("/onboarding/manager")}
                className="mt-4 px-4 py-2 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-850 text-xs font-bold text-slate-400 flex items-center gap-1 transition"
              >
                <ChevronLeft className="w-3.5 h-3.5" /> Back to Profile
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
