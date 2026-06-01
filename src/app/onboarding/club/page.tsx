/* eslint-disable */
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ChevronLeft, Lock, Search, Shield, Info, MapPin } from "lucide-react";
import { CLUBS_DATA, LEAGUE_INFO, Club } from "../../../config/seededData";
import { CLUB_LOGOS } from "../../../config/clubLogos";

// Helper to determine difficulty based on club reputation
const getDifficulty = (rep: number) => {
  if (rep >= 85) return { label: "Easy", color: "text-green-400 bg-green-500/10 border-green-500/20" };
  if (rep >= 70) return { label: "Medium", color: "text-amber-400 bg-amber-500/10 border-amber-500/20" };
  if (rep >= 50) return { label: "Hard", color: "text-orange-400 bg-orange-500/10 border-orange-500/20" };
  return { label: "Legendary", color: "text-rose-400 bg-rose-500/10 border-rose-500/20" };
};

export default function ClubSelection() {
  const router = useRouter();
  
  const [manager, setManager] = useState<any>(null);
  const [selectedLeague, setSelectedLeague] = useState<string>("EPL");
  const [searchQuery, setSearchQuery] = useState("");
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
      <div className="min-h-screen bg-[#080c14] text-slate-100 flex items-center justify-center">
        <div className="animate-pulse font-medium text-[#22c55e]">Loading database...</div>
      </div>
    );
  }

  const maxClubRepAllowed = manager.reputation + 65;

  const isClubLocked = (club: Club) => {
    return club.reputation > maxClubRepAllowed;
  };

  const filteredClubs = CLUBS_DATA.filter(c => {
    const matchesLeague = c.league === selectedLeague;
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesLeague && matchesSearch;
  });

  const handleNext = () => {
    if (!selectedClub) return;
    sessionStorage.setItem("gaffer_iq_onboarding_club_id", selectedClub.id);
    router.push("/onboarding/squad-review");
  };

  return (
    <div className="min-h-screen bg-[#080c14] text-white flex flex-col font-sans overflow-hidden">
      
      {/* Top Filter & Search Bar */}
      <header className="w-full bg-[#0f1623] border-b border-[#1e2d40] sticky top-0 z-20 shadow-lg">
        <div className="max-w-[1400px] mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <button onClick={() => router.push("/onboarding/manager")} className="p-2 rounded-lg bg-[#080c14] border border-[#1e2d40] text-slate-400 hover:text-white transition">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <h1 className="text-xl font-black tracking-tight uppercase">GAFFER<span className="text-[#22c55e]">IQ</span></h1>
            
            {/* League Tabs */}
            <div className="hidden lg:flex items-center gap-1 ml-8">
              {(["EPL", "La Liga", "Serie A", "Bundesliga", "Ligue 1"] as const).map(l => {
                const info = LEAGUE_INFO[l];
                const isActive = selectedLeague === l;
                return (
                  <button
                    key={l}
                    onClick={() => { setSelectedLeague(l); setSelectedClub(null); }}
                    className={`px-4 py-2 rounded-full font-bold text-xs transition duration-300 flex items-center gap-2 ${isActive ? 'bg-[#1e2d40] text-white shadow-inner' : 'text-slate-400 hover:text-slate-200 hover:bg-[#1e2d40]/50'}`}
                  >
                    <span>{info.emoji}</span>
                    {info.name}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input 
                type="text" 
                placeholder="Search clubs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-[#080c14] border border-[#1e2d40] rounded-full py-2 pl-9 pr-4 text-xs font-bold text-white focus:outline-none focus:border-[#22c55e] transition w-64"
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 flex w-full max-w-[1400px] mx-auto relative h-[calc(100vh-64px)]">
        
        {/* Left/Center: Club Grid */}
        <div className={`flex-1 p-6 overflow-y-auto pb-32 transition-all duration-500 ${selectedClub ? 'lg:pr-[360px]' : ''}`}>
          
          <AnimatePresence mode="wait">
            <motion.div 
              key={selectedLeague}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5"
            >
              {filteredClubs.length === 0 && (
                <div className="col-span-full py-20 text-center text-slate-500 font-bold">
                  No clubs found matching your search.
                </div>
              )}
              
              {filteredClubs.map(club => {
                const locked = isClubLocked(club);
                const isSelected = selectedClub?.id === club.id;
                const difficulty = getDifficulty(club.reputation);
                const squadRating = Math.floor((club.reputation * 0.4) + 60); // Mock rating calculation

                return (
                  <motion.button
                    key={club.id}
                    disabled={locked}
                    onClick={() => setSelectedClub(club)}
                    whileHover={!locked ? { y: -4, scale: 1.02 } : {}}
                    className={`relative p-5 rounded-2xl border text-left flex flex-col gap-4 overflow-hidden group transition-colors duration-300 ${locked ? 'bg-[#0f1623]/40 border-[#1e2d40] opacity-50 cursor-not-allowed' : isSelected ? 'bg-[#16a34a]/10 border-[#22c55e] shadow-[0_0_20px_rgba(34,197,94,0.15)] ring-1 ring-[#22c55e]' : 'bg-[#0f1623] border-[#1e2d40] hover:border-slate-600 hover:shadow-xl'}`}
                  >
                    {/* Locked Overlay Gradient */}
                    {locked && <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(0,0,0,0.2)_10px,rgba(0,0,0,0.2)_20px)] z-0 pointer-events-none" />}

                    <div className="flex justify-between items-start z-10 w-full">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-[#080c14] rounded-xl flex items-center justify-center shadow-inner border border-white/5 p-2">
                          {CLUB_LOGOS[club.id] ? (
                            <img src={CLUB_LOGOS[club.id]} alt={club.name} className="w-full h-full object-contain drop-shadow-md" />
                          ) : (
                            <div className="font-black text-xl" style={{ color: club.primaryColor }}>{club.name.charAt(0)}</div>
                          )}
                        </div>
                        <div>
                          <h3 className="text-base font-black text-white">{club.name}</h3>
                          <p className="text-xs text-slate-400 flex items-center gap-1 font-semibold mt-0.5">
                            {LEAGUE_INFO[club.league].emoji} {club.league}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-end gap-2">
                        {locked ? (
                          <div className="p-2 rounded-lg bg-black/50 text-slate-500 border border-[#1e2d40] flex items-center group/tooltip relative">
                            <Lock className="w-4 h-4" />
                            <div className="absolute right-0 top-full mt-2 w-40 p-2 bg-slate-900 border border-slate-700 rounded text-[10px] text-white opacity-0 group-hover/tooltip:opacity-100 pointer-events-none z-50 shadow-xl transition">
                              Requires {club.reputation - 65 + manager.reputation} reputation to unlock.
                            </div>
                          </div>
                        ) : (
                          <div className="w-10 h-10 rounded-full border-2 border-[#22c55e] flex items-center justify-center">
                            <span className="font-black text-[#22c55e] text-sm">{squadRating}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between z-10">
                      <span className={`px-2.5 py-1 rounded border text-[10px] font-black uppercase tracking-wider ${difficulty.color}`}>
                        {difficulty.label}
                      </span>
                      {isSelected && (
                        <span className="text-[#22c55e] font-bold text-xs flex items-center gap-1">
                          <Shield className="w-3.5 h-3.5 fill-current" /> Selected
                        </span>
                      )}
                    </div>

                    {/* Hover Content: Stat Progress Bars */}
                    {!locked && !isSelected && (
                      <div className="absolute inset-x-0 bottom-0 h-0 group-hover:h-12 bg-gradient-to-t from-[#080c14] to-transparent flex items-end px-5 pb-3 transition-all duration-300 opacity-0 group-hover:opacity-100 overflow-hidden">
                         <div className="w-full flex gap-2">
                           <div className="flex-1">
                             <div className="h-1 w-full bg-[#1e2d40] rounded-full overflow-hidden">
                               <div className="h-full bg-rose-500" style={{ width: `${squadRating + 2}%` }} />
                             </div>
                             <span className="text-[8px] font-bold text-slate-500 uppercase mt-0.5 block">ATT</span>
                           </div>
                           <div className="flex-1">
                             <div className="h-1 w-full bg-[#1e2d40] rounded-full overflow-hidden">
                               <div className="h-full bg-green-500" style={{ width: `${squadRating}%` }} />
                             </div>
                             <span className="text-[8px] font-bold text-slate-500 uppercase mt-0.5 block">MID</span>
                           </div>
                           <div className="flex-1">
                             <div className="h-1 w-full bg-[#1e2d40] rounded-full overflow-hidden">
                               <div className="h-full bg-blue-500" style={{ width: `${squadRating - 2}%` }} />
                             </div>
                             <span className="text-[8px] font-bold text-slate-500 uppercase mt-0.5 block">DEF</span>
                           </div>
                         </div>
                      </div>
                    )}
                  </motion.button>
                );
              })}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Right Sidebar Slide-in */}
        <AnimatePresence>
          {selectedClub && (
            <motion.aside 
              initial={{ x: 400, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 400, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="absolute right-0 top-0 w-full lg:w-[340px] h-full bg-[#0f1623] border-l border-[#1e2d40] shadow-2xl p-6 flex flex-col gap-6 overflow-y-auto pb-32 z-10"
            >
              {/* Sidebar Header */}
              <div className="flex flex-col items-center text-center gap-3 border-b border-[#1e2d40] pb-6">
                <div className="w-24 h-24 bg-[#080c14] rounded-2xl flex items-center justify-center shadow-lg border border-white/5 p-4">
                  {CLUB_LOGOS[selectedClub.id] ? (
                    <img src={CLUB_LOGOS[selectedClub.id]} alt={selectedClub.name} className="w-full h-full object-contain drop-shadow-xl" />
                  ) : (
                    <div className="font-black text-4xl" style={{ color: selectedClub.primaryColor }}>{selectedClub.name.charAt(0)}</div>
                  )}
                </div>
                <div>
                  <h2 className="text-xl font-black text-white">{selectedClub.name}</h2>
                  <p className="text-xs font-semibold text-slate-400 mt-1 flex items-center justify-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5" /> {selectedClub.stadium} ({(selectedClub.capacity/1000).toFixed(1)}k)
                  </p>
                </div>
              </div>

              {/* Top Players Snippet */}
              <div className="flex flex-col gap-3">
                <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest border-l-2 border-[#22c55e] pl-2">Key Personnel</h4>
                <div className="flex flex-col gap-2">
                  <div className="p-2.5 rounded-lg bg-[#080c14] border border-[#1e2d40] flex items-center justify-between">
                    <span className="font-bold text-xs text-white">Club Captain</span>
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] font-black">90 OVR</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-[#080c14] border border-[#1e2d40] flex items-center justify-between">
                    <span className="font-bold text-xs text-white">Star Striker</span>
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] font-black">88 OVR</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-[#080c14] border border-[#1e2d40] flex items-center justify-between">
                    <span className="font-bold text-xs text-white">Wonderkid</span>
                    <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-500 text-[10px] font-black">89 POT</span>
                  </div>
                </div>
              </div>

              {/* Manager History */}
              <div className="flex flex-col gap-3">
                <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest border-l-2 border-[#22c55e] pl-2">Manager History</h4>
                <div className="flex flex-col gap-2">
                  <div className="text-xs flex items-center justify-between">
                    <span className="text-slate-300">Previous Manager</span>
                    <span className="text-slate-500 font-medium">Sacked (Recent)</span>
                  </div>
                  <div className="text-xs flex items-center justify-between">
                    <span className="text-slate-300">Interim Coach</span>
                    <span className="text-slate-500 font-medium">2023-2024</span>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 mt-auto">
                <div className="flex gap-2">
                  <Info className="w-4 h-4 text-blue-400 shrink-0" />
                  <p className="text-[10px] text-blue-400 leading-relaxed font-medium">
                    The board expects you to manage budgets tightly and meet season objectives. Failing to do so will result in termination.
                  </p>
                </div>
              </div>

            </motion.aside>
          )}
        </AnimatePresence>
      </div>

      {/* Fixed Bottom Bar */}
      <AnimatePresence>
        {selectedClub && (
          <motion.div 
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            className="fixed bottom-0 left-0 w-full h-20 bg-[#080c14]/90 backdrop-blur-md border-t border-[#1e2d40] z-50 flex items-center justify-center px-6"
          >
            <div className="max-w-[1400px] w-full flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-[#0f1623] rounded-lg flex items-center justify-center p-1 border border-white/10">
                  {CLUB_LOGOS[selectedClub.id] ? (
                    <img src={CLUB_LOGOS[selectedClub.id]} alt="Logo" className="w-full h-full object-contain" />
                  ) : (
                    <span className="font-bold">{selectedClub.name.charAt(0)}</span>
                  )}
                </div>
                <div>
                  <h4 className="text-sm font-black text-white uppercase">{selectedClub.name}</h4>
                  <span className="text-[10px] text-[#22c55e] font-bold">Ready to sign contract</span>
                </div>
              </div>
              <button 
                onClick={handleNext}
                className="px-8 py-3 rounded-xl bg-[#16a34a] hover:bg-[#15803d] text-white font-black text-sm uppercase tracking-wide flex items-center gap-2 shadow-[0_0_20px_rgba(22,163,74,0.3)] transition-transform active:scale-95"
              >
                Confirm Club <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
