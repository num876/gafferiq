"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, Shield, Award, User, Sparkles, Plus, Minus, Loader2, Camera } from "lucide-react";

const NATIONALITIES = [
  "England", "Spain", "Italy", "Germany", "France", "Portugal", "Argentina", "Brazil", 
  "Netherlands", "Belgium", "Croatia", "Norway", "Poland", "USA", "Mexico", "Japan"
];

const FORMATIONS = ["4-4-2", "4-3-3", "4-2-3-1", "3-5-2", "5-3-2", "4-5-1"];

const PLAYING_STYLES = [
  { name: "Tiki-Taka", desc: "Possession-based, short passing, high technical requirements." },
  { name: "Gegenpressing", desc: "High pressing, quick transitions, extreme stamina required." },
  { name: "Counter Attack", desc: "Solid low-block, fast wingers breaking into spaces." },
  { name: "Long Ball Direct", desc: "Physical gameplay, direct balls to target man forward." },
  { name: "Wing Play", desc: "Overlapping fullbacks, crossing focus, wide attacking width." },
  { name: "Fluid Attacking", desc: "Creative positional roaming, freedom in final third." }
];

const BACKSTORIES = [
  "Former legendary captain transitioning to the dugout.",
  "Analytical genius and tactical theorist from the laptop generation.",
  "No-nonsense old school manager focused on hard work and discipline.",
  "Youth academy specialist dedicated to developing wonderkids.",
  "Sunday league wildcard who bluffed their way into professional management."
];

export default function ManagerCreation() {
  const router = useRouter();

  // Basic Details
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [nationality, setNationality] = useState("England");
  const [dob, setDob] = useState("1980-05-15");
  const [favFormation, setFavFormation] = useState("4-3-3");
  const [playingStyle, setPlayingStyle] = useState("Gegenpressing");
  const [bio, setBio] = useState(BACKSTORIES[0]);

  const [aiImageUrl, setAiImageUrl] = useState<string | null>(null);
  const [isGeneratingFace, setIsGeneratingFace] = useState(false);
  const [faceError, setFaceError] = useState<string | null>(null);

  const generateAiFace = async () => {
    if (!firstName || !lastName) {
      setFaceError("Please enter a first and last name to personalize your portrait.");
      return;
    }
    setFaceError(null);
    setIsGeneratingFace(true);
    try {
      const birthYear = new Date(dob).getFullYear();
      const currentYear = new Date().getFullYear();
      const age = currentYear - birthYear;

      const res = await fetch("/api/generate-face", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName, lastName, nationality, age, playingStyle })
      });
      const data = await res.json();
      if (data.success && data.image) {
        setAiImageUrl(data.image);
      } else {
        throw new Error(data.error || "Failed to generate image");
      }
    } catch (err: any) {
      setFaceError(err.message || "An error occurred.");
    } finally {
      setIsGeneratingFace(false);
    }
  };

  // Reputation (Starts Sunday League by default, options to pick for onboarding customization)
  const [reputation, setReputation] = useState(20); // 20 = Amateur, locked options checked later
  const [reputationLabel, setReputationLabel] = useState("Amateur");

  // Avatar Builder
  const [skinTone, setSkinTone] = useState("#FDBA74"); // warm tan
  const [hairStyle, setHairStyle] = useState("short"); // short, bald, long
  const [hairColor, setHairColor] = useState("#451A03"); // brown
  const [shirtColor, setShirtColor] = useState("#16A34A"); // green

  // Attributes Allocation (25 points to distribute, default 10 points on each)
  const [pointsRemaining, setPointsRemaining] = useState(25);
  const [attributes, setAttributes] = useState({
    tacticalKnowledge: 10,
    manManagement: 10,
    motivation: 10,
    scouting: 10,
    negotiation: 10
  });

  const handleReputationChange = (val: number, label: string) => {
    setReputation(val);
    setReputationLabel(label);
  };

  const adjustAttribute = (key: keyof typeof attributes, amount: number) => {
    setAttributes(prev => {
      const val = prev[key];
      if (amount > 0 && val < 20) {
        return { ...prev, [key]: val + 1 };
      } else if (amount < 0 && val > 1) {
        return { ...prev, [key]: val - 1 };
      }
      return prev;
    });
  };

  const handleNext = () => {
    // Save manager state in sessionStorage
    const managerData = {
      firstName: firstName || "Unknown",
      lastName: lastName || "Manager",
      nationality,
      dob,
      favoriteFormation: favFormation,
      avatar: { skinTone, hairStyle, hairColor, shirtColor },
      aiImageUrl,
      attributes,
      reputation,
      reputationLabel,
      playingStyle,
      bio: bio || `Born in ${nationality}, ${firstName || 'The'} ${lastName || 'Manager'} is ready to make waves in the football world with a signature ${playingStyle} style.`,
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

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-100 flex flex-col justify-between py-12 px-6 lg:px-24">
      <div className="max-w-6xl mx-auto w-full flex items-center justify-between border-b border-slate-800 pb-4 mb-8">
        <h1 className="text-2xl font-bold tracking-tight">
          GAFFER<span className="text-green-500">IQ</span>
        </h1>
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
          <span className="text-green-400 font-bold">Step 1: Manager</span>
          <span>→</span>
          <span>Step 2: Club</span>
          <span>→</span>
          <span>Step 3: Review</span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start my-auto">
        {/* Left: General & Avatar Creator */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <div className="glass-card p-6 rounded-2xl flex flex-col gap-6">
            <h2 className="text-lg font-bold border-b border-slate-800 pb-3 flex items-center gap-2 text-green-400">
              <User className="w-5 h-5" />
              Manager Personal Profile
            </h2>

            {/* Fields Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">First Name</label>
                <input 
                  type="text" 
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3.5 py-2 text-sm focus:outline-none focus:border-green-500 text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">Last Name</label>
                <input 
                  type="text" 
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3.5 py-2 text-sm focus:outline-none focus:border-green-500 text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">Nationality</label>
                <select 
                  value={nationality}
                  onChange={(e) => setNationality(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3.5 py-2 text-sm focus:outline-none focus:border-green-500 text-white"
                >
                  {NATIONALITIES.map(n => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">Date of Birth</label>
                <input 
                  type="date" 
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3.5 py-2 text-sm focus:outline-none focus:border-green-500 text-white"
                />
              </div>
            </div>

            {/* Tactical preferences */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">Favorite Formation</label>
                <select 
                  value={favFormation}
                  onChange={(e) => setFavFormation(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3.5 py-2 text-sm focus:outline-none focus:border-green-500 text-white"
                >
                  {FORMATIONS.map(f => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">Playing Style Preference</label>
                <select 
                  value={playingStyle}
                  onChange={(e) => setPlayingStyle(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3.5 py-2 text-sm focus:outline-none focus:border-green-500 text-white"
                >
                  {PLAYING_STYLES.map(s => <option key={s.name} value={s.name}>{s.name}</option>)}
                </select>
              </div>
            </div>

            {/* Custom SVG Avatar Customizer */}
            <div className="border border-slate-800 rounded-xl p-4 bg-slate-900/50 flex flex-col md:flex-row gap-6 items-center">
              {/* Profile Image Preview */}
              <div className="w-28 h-28 shrink-0 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center relative overflow-hidden shadow-inner">
                {aiImageUrl ? (
                  <img src={aiImageUrl} alt="AI Portrait" className="w-full h-full object-cover" />
                ) : (
                  <svg viewBox="0 0 100 100" className="w-24 h-24 mt-2">
                    {/* Shoulders / Shirt */}
                    <path d="M20,90 Q50,70 80,90 Z" fill={shirtColor} />
                    <path d="M45,70 L55,70 L50,80 Z" fill={skinTone} />
                    {/* Face */}
                    <circle cx="50" cy="50" r="20" fill={skinTone} />
                    {/* Hair */}
                    {hairStyle === "short" && (
                      <path d="M30,45 Q50,30 70,45 Q50,22 30,45" fill={hairColor} />
                    )}
                    {hairStyle === "long" && (
                      <path d="M28,45 Q50,25 72,45 L72,60 Q50,55 28,60 Z" fill={hairColor} />
                    )}
                    {/* Eyes & smile */}
                    <circle cx="44" cy="48" r="2.5" fill="#1e293b" />
                    <circle cx="56" cy="48" r="2.5" fill="#1e293b" />
                    <path d="M44,58 Q50,64 56,58" stroke="#1e293b" strokeWidth="2" fill="none" />
                  </svg>
                )}
              </div>

              {/* Controls */}
              <div className="flex-1 grid grid-cols-2 gap-3 w-full">
                <div>
                  <label className="block text-[10px] uppercase tracking-wider font-semibold text-slate-500 mb-1">Skin Tone</label>
                  <div className="flex gap-2">
                    {["#FED7AA", "#FDBA74", "#D97706", "#78350F"].map(color => (
                      <button 
                        key={color} 
                        onClick={() => setSkinTone(color)}
                        className={`w-6 h-6 rounded-full border-2 ${skinTone === color ? 'border-green-500 scale-110' : 'border-transparent'}`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-wider font-semibold text-slate-500 mb-1">Hair Style</label>
                  <select 
                    value={hairStyle}
                    onChange={(e) => setHairStyle(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-white"
                  >
                    <option value="short">Short Crop</option>
                    <option value="long">Long Flowing</option>
                    <option value="bald">Clean Shaved</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-wider font-semibold text-slate-500 mb-1">Hair Color</label>
                  <div className="flex gap-2">
                    {["#FDE047", "#D97706", "#451A03", "#000000", "#94A3B8"].map(color => (
                      <button 
                        key={color} 
                        onClick={() => setHairColor(color)}
                        className={`w-5 h-5 rounded-full border ${hairColor === color ? 'border-green-500 scale-110' : 'border-transparent'}`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-wider font-semibold text-slate-500 mb-1">Suit/Shirt Color</label>
                  <div className="flex gap-2">
                    {["#16A34A", "#DC2626", "#2563EB", "#0F172A", "#FFFFFF"].map(color => (
                      <button 
                        key={color} 
                        onClick={() => setShirtColor(color)}
                        className={`w-5 h-5 rounded-full border ${shirtColor === color ? 'border-green-500 scale-110' : 'border-transparent'}`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col items-center border-t border-slate-800/50 pt-4">
              <button
                onClick={generateAiFace}
                disabled={isGeneratingFace}
                className="px-6 py-2.5 bg-green-600/10 hover:bg-green-600/20 text-green-400 font-bold text-xs rounded-xl flex items-center gap-2 border border-green-500/20 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGeneratingFace ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
                {isGeneratingFace ? "Generating AI Profile..." : "Generate AI Face Profile (Beta)"}
              </button>
              {faceError && <p className="text-[10px] text-rose-500 mt-2 font-semibold text-center">{faceError}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">Manager Backstory / Bio</label>
              <select 
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3.5 py-2 text-sm focus:outline-none focus:border-green-500 text-white"
              >
                {BACKSTORIES.map(story => (
                  <option key={story} value={story}>{story}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Right: Reputation & Skills Distributor */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* Starting Reputation */}
          <div className="glass-card p-6 rounded-2xl flex flex-col gap-4">
            <h2 className="text-sm uppercase tracking-wider font-bold text-slate-400 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-green-500" />
              Starting Reputation
            </h2>
            <div className="flex flex-col gap-3">
              <input
                type="range"
                min="1"
                max="100"
                value={reputation}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  setReputation(val);
                  if (val < 20) setReputationLabel("Sunday League");
                  else if (val < 40) setReputationLabel("Amateur");
                  else if (val < 60) setReputationLabel("Semi-Pro");
                  else if (val < 80) setReputationLabel("Professional");
                  else setReputationLabel("World Class");
                }}
                className="w-full accent-green-500 cursor-pointer"
              />
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-300">{reputationLabel}</span>
                <span className="font-black text-green-400">{reputation}/100</span>
              </div>
            </div>
            <p className="text-[10px] text-slate-400 leading-relaxed">
              Your reputation level determines which European clubs will accept your applications at the start of your career. Sunday League managers will only be hired by relegation candidates.
            </p>
          </div>

          {/* Points Allocator */}
          <div className="glass-card p-6 rounded-2xl flex flex-col gap-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-sm uppercase tracking-wider font-bold text-slate-400 flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-green-500" />
                Attribute Allocation
              </h2>
              <span className="text-xs font-bold px-2 py-1 rounded bg-green-500/10 text-green-400 border border-green-500/20">
                Sandbox Mode
              </span>
            </div>

            {/* List */}
            <div className="flex flex-col gap-4">
              {[
                { key: "tacticalKnowledge" as const, label: "Tactical Knowledge", desc: "Boosts AI game plan modifiers." },
                { key: "manManagement" as const, label: "Man Management", desc: "Improves overall squad morale." },
                { key: "motivation" as const, label: "Motivation", desc: "Influences performance in derby/big games." },
                { key: "scouting" as const, label: "Scouting Knowledge", desc: "Reveals player potentials on lists." },
                { key: "negotiation" as const, label: "Transfer Negotiation", desc: "Unlocks better transfer & wage deals." }
              ].map(item => (
                <div key={item.key} className="flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-200">{item.label}</h4>
                      <p className="text-[10px] text-slate-500">{item.desc}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => adjustAttribute(item.key, -1)}
                        className="p-1 rounded bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-400 active:scale-95 transition"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-5 text-center font-bold text-xs text-slate-100">
                        {attributes[item.key]}
                      </span>
                      <button 
                        onClick={() => adjustAttribute(item.key, 1)}
                        className="p-1 rounded bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-400 active:scale-95 transition"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  {/* Micro stat bar */}
                  <div className="w-full h-1 bg-slate-950 rounded-full mt-1 overflow-hidden">
                    <div 
                      className="h-full bg-green-500 transition-all duration-300"
                      style={{ width: `${(attributes[item.key] / 20) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={handleNext}
              className="w-full mt-2 py-3 rounded-xl bg-green-600 hover:bg-green-500 font-bold text-xs tracking-wider uppercase text-white flex items-center justify-center gap-1.5 shadow-lg shadow-green-600/10 active:scale-95 transition-all"
            >
              Select Your Club
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
