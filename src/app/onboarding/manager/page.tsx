/* eslint-disable */
"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { 
  ChevronRight, Shield, Award, User, Sparkles, Plus, Minus, Loader2,
  Share2, Zap, TrendingUp, ArrowUp, Expand, Wind, Check, ChevronDown, 
  Search, Wand2
} from "lucide-react";

const NATIONALITIES = [
  { name: "England", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
  { name: "Spain", flag: "🇪🇸" },
  { name: "Italy", flag: "🇮🇹" },
  { name: "Germany", flag: "🇩🇪" },
  { name: "France", flag: "🇫🇷" },
  { name: "Portugal", flag: "🇵🇹" },
  { name: "Argentina", flag: "🇦🇷" },
  { name: "Brazil", flag: "🇧🇷" },
  { name: "Netherlands", flag: "🇳🇱" },
  { name: "Belgium", flag: "🇧🇪" },
  { name: "Croatia", flag: "🇭🇷" },
  { name: "Norway", flag: "🇳🇴" },
  { name: "Poland", flag: "🇵🇱" },
  { name: "USA", flag: "🇺🇸" },
  { name: "Mexico", flag: "🇲🇽" },
  { name: "Japan", flag: "🇯🇵" }
];

const FORMATIONS = ["4-4-2", "4-3-3", "4-2-3-1", "3-5-2", "5-3-2", "4-5-1"];

const PLAYING_STYLES = [
  { name: "Tiki-Taka", icon: Share2, desc: "Possession-based passing." },
  { name: "Gegenpressing", icon: Zap, desc: "High pressing, quick transitions." },
  { name: "Counter Attack", icon: TrendingUp, desc: "Solid low-block, fast wingers." },
  { name: "Long Ball Direct", icon: ArrowUp, desc: "Physical, direct to target man." },
  { name: "Wing Play", icon: Expand, desc: "Overlapping fullbacks, crossing." },
  { name: "Fluid Attacking", icon: Wind, desc: "Creative positional roaming." }
];

const BACKSTORIES = [
  "Former legendary captain transitioning to the dugout.",
  "Analytical genius and tactical theorist from the laptop generation.",
  "No-nonsense old school manager focused on hard work and discipline.",
  "Youth academy specialist dedicated to developing wonderkids.",
  "Sunday league wildcard who bluffed their way into professional management."
];

const PRESET_AVATARS = [
  { 
    id: 'pro-suit', 
    name: 'The Pro', 
    svg: <svg viewBox="0 0 100 100" className="w-full h-full"><path d="M20,90 Q50,70 80,90 Z" fill="#1e293b" /><path d="M45,70 L55,70 L50,80 Z" fill="#FDBA74" /><path d="M48,70 L52,70 L50,85 Z" fill="#DC2626" /><circle cx="50" cy="50" r="20" fill="#FDBA74" /><path d="M30,45 Q50,30 70,45 Q50,22 30,45" fill="#451A03" /></svg> 
  },
  { 
    id: 'tracksuit', 
    name: 'Tracksuit', 
    svg: <svg viewBox="0 0 100 100" className="w-full h-full"><path d="M20,90 Q50,70 80,90 Z" fill="#16A34A" /><path d="M50,70 L50,90" stroke="#fff" strokeWidth="2" /><path d="M45,70 L55,70 L50,75 Z" fill="#FED7AA" /><circle cx="50" cy="50" r="20" fill="#FED7AA" /><path d="M30,45 Q50,30 70,45 Q50,22 30,45" fill="#FDE047" /></svg> 
  },
  { 
    id: 'tactician', 
    name: 'Tactician', 
    svg: <svg viewBox="0 0 100 100" className="w-full h-full"><path d="M20,90 Q50,70 80,90 Z" fill="#475569" /><path d="M45,70 L55,70 L50,78 Z" fill="#D97706" /><circle cx="50" cy="50" r="20" fill="#D97706" /><path d="M28,45 Q50,25 72,45 L72,60 Q50,55 28,60 Z" fill="#000000" /><rect x="35" y="42" width="30" height="8" rx="2" fill="none" stroke="#1e293b" strokeWidth="2" /></svg> 
  },
  { 
    id: 'veteran', 
    name: 'Veteran', 
    svg: <svg viewBox="0 0 100 100" className="w-full h-full"><path d="M20,90 Q50,70 80,90 Z" fill="#0F172A" /><path d="M45,70 L55,70 L50,80 Z" fill="#FDBA74" /><circle cx="50" cy="50" r="20" fill="#FDBA74" /><path d="M30,45 Q50,30 70,45 Q50,22 30,45" fill="#94A3B8" /><path d="M35,62 Q50,70 65,62" stroke="#94A3B8" strokeWidth="3" fill="none" /></svg> 
  },
  { 
    id: 'maverick', 
    name: 'Maverick', 
    svg: <svg viewBox="0 0 100 100" className="w-full h-full"><path d="M20,90 Q50,70 80,90 Z" fill="#2563EB" /><path d="M45,70 L55,70 L50,75 Z" fill="#78350F" /><circle cx="50" cy="50" r="20" fill="#78350F" /></svg> 
  },
  { 
    id: 'rookie', 
    name: 'Rookie', 
    svg: <svg viewBox="0 0 100 100" className="w-full h-full"><path d="M20,90 Q50,70 80,90 Z" fill="#DC2626" /><path d="M45,70 L55,70 L50,80 Z" fill="#FED7AA" /><circle cx="50" cy="50" r="20" fill="#FED7AA" /><path d="M30,45 Q50,30 70,45 Q50,22 30,45" fill="#D97706" /><circle cx="50" cy="35" r="20" fill="#DC2626" /><path d="M30,35 Q50,25 70,35" stroke="#DC2626" strokeWidth="8" /></svg> 
  }
];

const REPUTATION_TIERS = [
  { value: 20, label: "Amateur", unlocks: ["League 2", "National League"] },
  { value: 40, label: "Semi-Pro", unlocks: ["League 1", "Championship"] },
  { value: 60, label: "Professional", unlocks: ["Mid-table Top Flight"] },
  { value: 80, label: "Elite", unlocks: ["Top 5 Leagues", "Champions League"] }
];

function MiniPitchFormation({ formation, active }: { formation: string, active: boolean }) {
  const parts = formation.split("-").map(Number);
  const rows = [1, ...parts]; // add GK
  
  return (
    <div className={`w-full aspect-[3/4] rounded-lg border-2 relative overflow-hidden transition-all ${active ? 'border-green-500 bg-green-500/10' : 'border-slate-800 bg-slate-900/50 hover:border-slate-700'}`}>
      <div className="absolute inset-0 flex flex-col justify-between py-2 px-1">
        {rows.map((count, rIdx) => (
          <div key={rIdx} className="flex justify-around w-full">
            {Array.from({ length: count }).map((_, cIdx) => (
              <div key={cIdx} className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-green-400' : 'bg-slate-600'}`} />
            ))}
          </div>
        ))}
      </div>
      <div className="absolute inset-x-0 top-[50%] h-px bg-slate-800/50" />
      <div className="absolute top-0 left-[25%] right-[25%] h-2 border border-t-0 border-slate-800/50" />
      <div className="absolute bottom-0 left-[25%] right-[25%] h-2 border border-b-0 border-slate-800/50" />
    </div>
  );
}

export default function ManagerCreation() {
  const router = useRouter();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [nationality, setNationality] = useState(NATIONALITIES[0]);
  const [dob, setDob] = useState("1980-05-15");
  const [favFormation, setFavFormation] = useState("4-3-3");
  const [playingStyle, setPlayingStyle] = useState("Gegenpressing");
  const [backstory, setBackstory] = useState(BACKSTORIES[0]);
  const [bio, setBio] = useState("");
  const [isGeneratingBio, setIsGeneratingBio] = useState(false);
  const [selectedAvatarId, setSelectedAvatarId] = useState(PRESET_AVATARS[0].id);

  const [isNatComboOpen, setIsNatComboOpen] = useState(false);
  const [natSearch, setNatSearch] = useState("");

  const [reputation, setReputation] = useState(20);
  const [sandboxMode, setSandboxMode] = useState(false);

  const [attributes, setAttributes] = useState({
    tacticalKnowledge: 10,
    manManagement: 10,
    motivation: 10,
    scouting: 10,
    negotiation: 10
  });

  const totalPointsUsed = Object.values(attributes).reduce((a, b) => a + b, 0);
  const pointsRemaining = sandboxMode ? "∞" : 75 - totalPointsUsed; // default 50 points spent out of 75 total (25 extra)

  const comboRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (comboRef.current && !comboRef.current.contains(event.target as Node)) setIsNatComboOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const generateAiBio = async () => {
    setIsGeneratingBio(true);
    // Simulate fetch delay
    setTimeout(() => {
      setBio(`Born in ${nationality.name}, ${firstName || 'The'} ${lastName || 'Manager'} is a ${backstory.toLowerCase()} Known for adopting a strict ${playingStyle} style, they favor a ${favFormation} setup on the pitch.`);
      setIsGeneratingBio(false);
    }, 1500);
  };

  const adjustAttribute = (key: keyof typeof attributes, amount: number) => {
    setAttributes(prev => {
      const val = prev[key];
      if (amount > 0 && val < 20 && (sandboxMode || (typeof pointsRemaining === 'number' && pointsRemaining > 0))) {
        return { ...prev, [key]: val + 1 };
      } else if (amount < 0 && val > 1) {
        return { ...prev, [key]: val - 1 };
      }
      return prev;
    });
  };

  const handleNext = () => {
    const repTier = REPUTATION_TIERS.find(t => t.value === reputation) || REPUTATION_TIERS[0];
    
    const managerData = {
      firstName: firstName || "Unknown",
      lastName: lastName || "Manager",
      nationality: nationality.name,
      dob,
      favoriteFormation: favFormation,
      avatar: selectedAvatarId,
      attributes,
      reputation,
      reputationLabel: repTier.label,
      playingStyle,
      bio: bio || `Born in ${nationality.name}, ${firstName || 'The'} ${lastName || 'Manager'} is ready to make waves.`,
      winCount: 0,
      drawCount: 0,
      lossCount: 0,
      goalsScored: 0,
      titlesWon: 0,
      achievements: []
    };

    sessionStorage.setItem("gaffer_iq_onboarding_manager", JSON.stringify(managerData));
    router.push("/onboarding/club");
  };

  const selectedAvatar = PRESET_AVATARS.find(a => a.id === selectedAvatarId)!;
  const currentRepTier = REPUTATION_TIERS.find(t => t.value === reputation)!;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col py-8 px-4 lg:px-12 font-sans overflow-x-hidden">
      
      {/* Pitch Progress Bar */}
      <div className="max-w-6xl mx-auto w-full mb-10 flex flex-col gap-4">
        <h1 className="text-2xl font-black tracking-tighter uppercase text-white flex items-center gap-2">
          Gaffer<span className="text-green-500">IQ</span>
        </h1>
        
        <div className="w-full h-12 bg-slate-900 border border-slate-800 rounded-xl relative flex overflow-hidden">
          {/* Pitch lines */}
          <div className="absolute top-0 bottom-0 left-[33.33%] w-px bg-slate-800/50" />
          <div className="absolute top-0 bottom-0 left-[66.66%] w-px bg-slate-800/50" />
          
          <div className="flex-1 flex items-center justify-center relative bg-green-500/10 border-b-2 border-green-500">
            <span className="text-xs font-black uppercase tracking-widest text-green-400">1. Identity</span>
          </div>
          <div className="flex-1 flex items-center justify-center relative">
            <span className="text-xs font-bold uppercase tracking-widest text-slate-600">2. Club</span>
          </div>
          <div className="flex-1 flex items-center justify-center relative">
            <span className="text-xs font-bold uppercase tracking-widest text-slate-600">3. Confirm</span>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Left Column: Form Fields */}
        <div className="lg:col-span-8 flex flex-col gap-8 pb-20">
          
          {/* Section 1: Basic Info & Avatar */}
          <section className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 md:p-8 flex flex-col gap-6">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
              <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center">
                <User className="w-4 h-4" />
              </div>
              <h2 className="text-lg font-bold text-white">Personal Identity</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">First Name</label>
                <input 
                  type="text" 
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Pep"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-green-500 text-white placeholder-slate-700 transition"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Last Name</label>
                <input 
                  type="text" 
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Guardiola"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-green-500 text-white placeholder-slate-700 transition"
                />
              </div>
              
              <div className="relative" ref={comboRef}>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Nationality</label>
                <div 
                  onClick={() => setIsNatComboOpen(!isNatComboOpen)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm flex items-center justify-between cursor-pointer hover:border-slate-700 transition"
                >
                  <span className="flex items-center gap-2">
                    <span>{nationality.flag}</span>
                    <span className="text-white">{nationality.name}</span>
                  </span>
                  <ChevronDown className="w-4 h-4 text-slate-500" />
                </div>
                
                {isNatComboOpen && (
                  <div className="absolute z-50 top-full left-0 right-0 mt-2 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden animate-fade-in">
                    <div className="p-2 border-b border-slate-800 flex items-center gap-2 px-3">
                      <Search className="w-4 h-4 text-slate-500" />
                      <input 
                        type="text"
                        placeholder="Search country..."
                        value={natSearch}
                        onChange={(e) => setNatSearch(e.target.value)}
                        className="bg-transparent border-none focus:outline-none text-sm text-white w-full py-1"
                      />
                    </div>
                    <div className="max-h-60 overflow-y-auto p-2 flex flex-col gap-1">
                      {NATIONALITIES.filter(n => n.name.toLowerCase().includes(natSearch.toLowerCase())).map(nat => (
                        <button
                          key={nat.name}
                          onClick={() => { setNationality(nat); setIsNatComboOpen(false); setNatSearch(""); }}
                          className={`flex items-center gap-2 px-3 py-2 text-sm text-left rounded-lg transition ${nationality.name === nat.name ? 'bg-green-500/20 text-green-400' : 'text-slate-300 hover:bg-slate-800'}`}
                        >
                          <span>{nat.flag}</span>
                          <span>{nat.name}</span>
                          {nationality.name === nat.name && <Check className="w-4 h-4 ml-auto" />}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Date of Birth</label>
                <input 
                  type="date" 
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-green-500 text-white transition"
                  style={{ colorScheme: 'dark' }}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Preset Avatar</label>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                {PRESET_AVATARS.map(avatar => (
                  <button
                    key={avatar.id}
                    onClick={() => setSelectedAvatarId(avatar.id)}
                    className={`flex flex-col items-center gap-2 p-2 rounded-xl border-2 transition-all ${selectedAvatarId === avatar.id ? 'border-green-500 bg-green-500/10' : 'border-transparent bg-slate-950 hover:border-slate-800'}`}
                  >
                    <div className="w-12 h-12 rounded-lg bg-slate-900 border border-slate-800 overflow-hidden flex items-center justify-center p-1">
                      {avatar.svg}
                    </div>
                    <span className="text-[9px] font-bold text-slate-400 text-center leading-tight uppercase tracking-wide">
                      {avatar.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                <div className="flex-1 w-full">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Backstory</label>
                  <select 
                    value={backstory}
                    onChange={(e) => setBackstory(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500 text-white"
                  >
                    {BACKSTORIES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <button
                  onClick={generateAiBio}
                  disabled={isGeneratingBio}
                  className="w-full sm:w-auto mt-0 sm:mt-6 px-4 py-2 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 font-bold text-xs rounded-lg flex items-center justify-center gap-2 border border-indigo-500/20 transition disabled:opacity-50"
                >
                  {isGeneratingBio ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
                  Generate Manager Lore
                </button>
              </div>
              
              <div>
                <textarea 
                  readOnly
                  value={bio || "Click the button to generate a unique backstory for your manager profile."}
                  className="w-full bg-slate-900/50 border border-slate-800/50 rounded-lg p-4 text-sm text-slate-300 min-h-[80px] focus:outline-none resize-none"
                />
              </div>
            </div>
          </section>

          {/* Section 2: Tactical Philosophy */}
          <section className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 md:p-8 flex flex-col gap-6">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
              <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <h2 className="text-lg font-bold text-white">Tactical Philosophy</h2>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Favorite Formation</label>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                {FORMATIONS.map(form => (
                  <button
                    key={form}
                    onClick={() => setFavFormation(form)}
                    className="flex flex-col items-center gap-2 group"
                  >
                    <MiniPitchFormation formation={form} active={favFormation === form} />
                    <span className={`text-[10px] font-bold transition ${favFormation === form ? 'text-green-400' : 'text-slate-500 group-hover:text-slate-300'}`}>
                      {form}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Playing Style</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {PLAYING_STYLES.map(style => {
                  const Icon = style.icon;
                  const active = playingStyle === style.name;
                  return (
                    <button
                      key={style.name}
                      onClick={() => setPlayingStyle(style.name)}
                      className={`p-4 rounded-xl border text-left transition flex flex-col gap-2 ${active ? 'bg-green-500/10 border-green-500' : 'bg-slate-950 border-slate-800 hover:border-slate-700'}`}
                    >
                      <Icon className={`w-5 h-5 ${active ? 'text-green-500' : 'text-slate-500'}`} />
                      <div>
                        <h4 className={`text-sm font-bold ${active ? 'text-green-400' : 'text-slate-200'}`}>{style.name}</h4>
                        <p className="text-[10px] text-slate-500 mt-1 leading-tight">{style.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </section>

          {/* Section 3: Attributes & Reputation */}
          <section className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 md:p-8 flex flex-col gap-8">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
              <div className="w-8 h-8 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center">
                <Shield className="w-4 h-4" />
              </div>
              <h2 className="text-lg font-bold text-white">Attributes & Reputation</h2>
            </div>

            {/* Reputation */}
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-end">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">Starting Reputation</label>
                <span className="text-sm font-black text-white px-3 py-1 bg-slate-800 rounded-lg">{currentRepTier.label}</span>
              </div>
              
              <div className="relative pt-2 pb-6 px-2">
                <input
                  type="range"
                  min="20"
                  max="80"
                  step="20"
                  value={reputation}
                  onChange={(e) => setReputation(parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-green-500 focus:outline-none"
                />
                <div className="absolute w-full flex justify-between px-3 mt-3 text-[10px] font-bold text-slate-500 uppercase">
                  <span>Amateur</span>
                  <span>Semi-Pro</span>
                  <span>Pro</span>
                  <span>Elite</span>
                </div>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex gap-3 items-center">
                <Award className="w-8 h-8 text-amber-500 shrink-0" />
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-bold text-slate-300">Unlocks jobs in:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {currentRepTier.unlocks.map(u => (
                      <span key={u} className="text-[10px] bg-slate-800 text-amber-400 px-2 py-0.5 rounded font-semibold">{u}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Attributes */}
            <div className="flex flex-col gap-5 border-t border-slate-800 pt-6">
              <div className="flex justify-between items-center">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">Attribute Points</label>
                
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-slate-500">Sandbox Mode</span>
                    <button 
                      onClick={() => setSandboxMode(!sandboxMode)}
                      className={`w-10 h-5 rounded-full p-0.5 transition-colors duration-200 ease-in-out flex ${sandboxMode ? 'bg-green-500 justify-end' : 'bg-slate-700 justify-start'}`}
                      title="Removes the 25 point cap for testing purposes"
                    >
                      <div className="w-4 h-4 bg-white rounded-full shadow-sm" />
                    </button>
                  </div>
                  
                  <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-lg">
                    <span className="text-xs font-bold text-slate-400">Left:</span>
                    <span className={`text-sm font-black ${sandboxMode ? 'text-purple-400' : (pointsRemaining as number) > 0 ? 'text-green-400' : 'text-rose-400'}`}>
                      {pointsRemaining}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                {[
                  { key: "tacticalKnowledge" as const, label: "Tactical Knowledge", color: "bg-blue-500" },
                  { key: "manManagement" as const, label: "Man Management", color: "bg-yellow-500" },
                  { key: "motivation" as const, label: "Motivation", color: "bg-orange-500" },
                  { key: "scouting" as const, label: "Scouting Knowledge", color: "bg-purple-500" },
                  { key: "negotiation" as const, label: "Transfer Negotiation", color: "bg-green-500" }
                ].map(item => (
                  <div key={item.key} className="flex flex-col gap-1.5">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-slate-300">{item.label}</span>
                      <div className="flex items-center gap-3">
                        <button 
                          onClick={() => adjustAttribute(item.key, -1)}
                          className="p-1 rounded bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-400 transition"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-6 text-center font-black text-sm text-white">
                          {attributes[item.key]}
                        </span>
                        <button 
                          onClick={() => adjustAttribute(item.key, 1)}
                          className="p-1 rounded bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-400 transition"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                    <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-300 ${item.color}`}
                        style={{ width: `${(attributes[item.key] / 20) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
          </section>

        </div>

        {/* Right Column: Live Manager Card */}
        <div className="lg:col-span-4 relative">
          <div className="sticky top-8 flex flex-col gap-4">
            
            <div className="glass-card p-1 rounded-2xl overflow-hidden bg-gradient-to-b from-slate-800 to-slate-900 border border-slate-700 shadow-2xl">
              <div className="bg-slate-950 rounded-xl overflow-hidden relative">
                {/* ID Card Header */}
                <div className="bg-green-600 p-4 flex justify-between items-start relative overflow-hidden">
                  <div className="absolute -right-4 -top-10 opacity-20">
                    <svg viewBox="0 0 100 100" className="w-32 h-32 text-white fill-current"><path d="M50 0 L100 25 L100 75 L50 100 L0 75 L0 25 Z"/></svg>
                  </div>
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-widest text-green-200">GafferIQ</h3>
                    <p className="text-[9px] font-bold text-white/80 uppercase">Official License</p>
                  </div>
                  <div className="w-6 h-8 rounded bg-green-500 border border-green-400/50 flex flex-col gap-0.5 p-1">
                    <div className="w-full flex-1 bg-white/20 rounded-sm" />
                    <div className="w-full h-1 bg-white/20 rounded-sm" />
                  </div>
                </div>

                {/* ID Card Body */}
                <div className="p-5 flex flex-col gap-5 bg-[url('/noise.png')]">
                  <div className="flex gap-4 items-start">
                    {/* Avatar Profile Shot */}
                    <div className="w-20 h-24 bg-slate-900 rounded-lg border-2 border-slate-800 shadow-inner flex items-center justify-center p-1 shrink-0">
                      {selectedAvatar.svg}
                    </div>
                    
                    <div className="flex flex-col gap-3 pt-1 w-full">
                      <div>
                        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">Last Name</p>
                        <p className="text-base font-black text-white leading-none truncate">{lastName || "MANAGER"}</p>
                      </div>
                      <div>
                        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">First Name</p>
                        <p className="text-sm font-bold text-slate-300 leading-none truncate">{firstName || "Unknown"}</p>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xl" title={nationality.name}>{nationality.flag}</span>
                        <div className="flex-1 h-px bg-slate-800" />
                        <span className="text-[10px] font-bold text-green-500 bg-green-500/10 px-2 py-0.5 rounded border border-green-500/20">
                          PRO
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-800/50">
                    <div>
                      <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">Reputation</p>
                      <p className="text-xs font-black text-amber-400">{currentRepTier.label}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">Formation</p>
                      <p className="text-xs font-black text-slate-200">{favFormation}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">Style</p>
                      <p className="text-xs font-black text-slate-200">{playingStyle}</p>
                    </div>
                  </div>
                </div>

                {/* ID Card Footer */}
                <div className="bg-slate-900 py-2 px-4 flex justify-between items-center text-[8px] font-mono text-slate-500">
                  <span>ID: GAFF-2026-X</span>
                  <span>VALID THRU: END OF CAREER</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleNext}
              className="w-full mt-4 py-4 rounded-xl bg-green-600 hover:bg-green-500 font-black text-sm tracking-wider uppercase text-white flex items-center justify-center gap-2 shadow-xl shadow-green-600/20 active:scale-95 transition-all"
            >
              Confirm Identity
              <ChevronRight className="w-5 h-5" />
            </button>
            <p className="text-[10px] text-center text-slate-500 font-semibold px-4">
              Your identity cannot be changed once your career begins.
            </p>
          </div>
        </div>
        
      </div>
    </div>
  );
}
