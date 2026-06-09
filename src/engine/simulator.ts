/* eslint-disable */
import { Club, Player } from "../config/seededData";
import { MatchFixture, MatchEvent, MatchStats } from "../db/storage";

// ─────────────────────────────────────────────
// TACTICAL INSTRUCTIONS (FM-style)
// ─────────────────────────────────────────────
export interface TacticalInstructions {
  // ── Core Mentality ──
  mentality: "Attacking" | "Balanced" | "Defensive";

  // ── In Possession ──
  pressIntensity: "High" | "Mid" | "Low" | "None";
  defensiveLine: "High" | "Standard" | "Deep";
  width: "Wide" | "Narrow" | "Standard";
  tempo: "Fast" | "Normal" | "Slow";
  passingDirectness: "Direct" | "Mixed" | "Short";   // build-up play style
  crossingFrequency: "Often" | "Sometimes" | "Rarely";

  // ── Out of Possession ──
  pressingTrigger: "High" | "Mid" | "Low";           // when to start pressing
  offsideTrap: boolean;                               // risky: reduces space but can be beaten

  // ── Transitions ──
  counterAttackSpeed: "Rapid" | "Balanced" | "Patient";
  counterPress: boolean;                              // press immediately on losing ball

  // ── Set Piece Routines ──
  cornerRoutine: "Near Post" | "Far Post" | "Short" | "Whipped In";
  defensiveSetPiece: "Zonal" | "Man-to-Man" | "Mixed";

  // ── Per-Player ──
  playerRoles: Record<string, string>;               // player ID → tactical role label
  playerDuties: Record<string, "Attack" | "Support" | "Defend">;

  // ── Set-Piece Takers ──
  takers: {
    penalties: string;
    corners: string;
    freeKicks: string;
  };
}

export const DEFAULT_TACTICS: TacticalInstructions = {
  mentality: "Balanced",
  pressIntensity: "Mid",
  defensiveLine: "Standard",
  width: "Standard",
  tempo: "Normal",
  passingDirectness: "Mixed",
  crossingFrequency: "Sometimes",
  pressingTrigger: "Mid",
  offsideTrap: false,
  counterAttackSpeed: "Balanced",
  counterPress: false,
  cornerRoutine: "Far Post",
  defensiveSetPiece: "Mixed",
  playerRoles: {},
  playerDuties: {},
  takers: { penalties: "", corners: "", freeKicks: "" },
};

// ─────────────────────────────────────────────
// TACTIC PRESETS (FM-style quick-apply)
// ─────────────────────────────────────────────
export interface TacticPreset {
  name: string;
  description: string;
  formation: string;
  instructions: Partial<TacticalInstructions>;
  badge: string; // emoji
}

export const TACTIC_PRESETS: TacticPreset[] = [
  {
    name: "Gegenpress",
    description: "Win the ball back immediately. High energy, high press, direct football.",
    formation: "4-3-3",
    badge: "⚡",
    instructions: {
      mentality: "Attacking",
      pressIntensity: "High",
      defensiveLine: "High",
      width: "Standard",
      tempo: "Fast",
      passingDirectness: "Direct",
      crossingFrequency: "Sometimes",
      pressingTrigger: "High",
      offsideTrap: true,
      counterAttackSpeed: "Rapid",
      counterPress: true,
    },
  },
  {
    name: "Tiki-Taka",
    description: "Possession-dominant, short passes, control the game through ball retention.",
    formation: "4-3-3",
    badge: "🎯",
    instructions: {
      mentality: "Balanced",
      pressIntensity: "Mid",
      defensiveLine: "High",
      width: "Standard",
      tempo: "Slow",
      passingDirectness: "Short",
      crossingFrequency: "Rarely",
      pressingTrigger: "High",
      offsideTrap: true,
      counterAttackSpeed: "Patient",
      counterPress: true,
    },
  },
  {
    name: "Counter Attack",
    description: "Sit deep, absorb pressure, and explode on the break with pace.",
    formation: "4-5-1",
    badge: "🏹",
    instructions: {
      mentality: "Defensive",
      pressIntensity: "Low",
      defensiveLine: "Deep",
      width: "Narrow",
      tempo: "Normal",
      passingDirectness: "Direct",
      crossingFrequency: "Rarely",
      pressingTrigger: "Low",
      offsideTrap: false,
      counterAttackSpeed: "Rapid",
      counterPress: false,
    },
  },
  {
    name: "Park the Bus",
    description: "Defend at all costs. Ultra-compact, suffocate the opposition.",
    formation: "5-4-1",
    badge: "🚌",
    instructions: {
      mentality: "Defensive",
      pressIntensity: "None",
      defensiveLine: "Deep",
      width: "Narrow",
      tempo: "Slow",
      passingDirectness: "Direct",
      crossingFrequency: "Rarely",
      pressingTrigger: "Low",
      offsideTrap: false,
      counterAttackSpeed: "Patient",
      counterPress: false,
    },
  },
  {
    name: "Wide Overload",
    description: "Exploit the wings with high-frequency crossing and overlapping full-backs.",
    formation: "4-4-2",
    badge: "↔️",
    instructions: {
      mentality: "Attacking",
      pressIntensity: "Mid",
      defensiveLine: "Standard",
      width: "Wide",
      tempo: "Fast",
      passingDirectness: "Mixed",
      crossingFrequency: "Often",
      pressingTrigger: "Mid",
      offsideTrap: false,
      counterAttackSpeed: "Balanced",
      counterPress: false,
    },
  },
  {
    name: "False 9 Press",
    description: "No traditional striker. The #10 drops deep to overload midfield.",
    formation: "4-2-3-1",
    badge: "🔄",
    instructions: {
      mentality: "Attacking",
      pressIntensity: "High",
      defensiveLine: "High",
      width: "Standard",
      tempo: "Fast",
      passingDirectness: "Short",
      crossingFrequency: "Rarely",
      pressingTrigger: "High",
      offsideTrap: true,
      counterAttackSpeed: "Rapid",
      counterPress: true,
    },
  },
];

// ─────────────────────────────────────────────
// PLAYER ROLES (full FM-inspired set)
// ─────────────────────────────────────────────
export interface PlayerRoleDefinition {
  label: string;
  positions: string[]; // which positions this role suits
  attackMod: number;  // affects attack strength calculation
  midMod: number;
  defMod: number;
  fatigueMultiplier: number; // how quickly player tires
  description: string;
}

export const PLAYER_ROLES: Record<string, PlayerRoleDefinition> = {
  // GK
  "Goalkeeper":         { label:"Goalkeeper",         positions:["GK"], attackMod:0, midMod:0, defMod:3,  fatigueMultiplier:0.6, description:"Standard shot-stopping focus." },
  "Sweeper Keeper":     { label:"Sweeper Keeper",      positions:["GK"], attackMod:1, midMod:1, defMod:2,  fatigueMultiplier:0.8, description:"Actively claims balls beyond the penalty area." },

  // DEF
  "Central Defender":   { label:"Central Defender",   positions:["DEF"], attackMod:0, midMod:0, defMod:4, fatigueMultiplier:0.6, description:"Solid, positional defending." },
  "Ball-Playing Defender": { label:"Ball-Playing Defender", positions:["DEF"], attackMod:0, midMod:2, defMod:3, fatigueMultiplier:0.7, description:"Initiates build-up play from the back." },
  "No-Nonsense CB":     { label:"No-Nonsense CB",     positions:["DEF"], attackMod:0, midMod:0, defMod:5, fatigueMultiplier:0.5, description:"Win the ball, launch it forward. Pure defender." },
  "Libero":             { label:"Libero",              positions:["DEF"], attackMod:1, midMod:3, defMod:2, fatigueMultiplier:0.9, description:"Marauding CB who steps out to carry the ball." },
  "Full-Back":          { label:"Full-Back",           positions:["DEF"], attackMod:1, midMod:1, defMod:3, fatigueMultiplier:0.7, description:"Provides width defensively and in build-up." },
  "Wing-Back":          { label:"Wing-Back",           positions:["DEF"], attackMod:3, midMod:2, defMod:1, fatigueMultiplier:1.1, description:"Essentially a wide midfielder who starts deeper." },
  "Inverted Wing-Back": { label:"Inverted Wing-Back",  positions:["DEF"], attackMod:2, midMod:3, defMod:1, fatigueMultiplier:1.0, description:"Cuts inside to overload the midfield." },

  // MID
  "Box-to-Box":         { label:"Box-to-Box",          positions:["MID"], attackMod:2, midMod:3, defMod:2, fatigueMultiplier:1.2, description:"Energetic link between defense and attack." },
  "Deep-Lying Playmaker":{ label:"Deep-Lying Playmaker",positions:["MID"], attackMod:0, midMod:5, defMod:1, fatigueMultiplier:0.8, description:"Orchestrates from deep, rarely runs beyond." },
  "Advanced Playmaker": { label:"Advanced Playmaker",  positions:["MID"], attackMod:3, midMod:4, defMod:0, fatigueMultiplier:0.9, description:"Creates chances in the final third." },
  "Ball-Winning Mid":   { label:"Ball-Winning Mid",    positions:["MID"], attackMod:0, midMod:2, defMod:4, fatigueMultiplier:1.0, description:"Aggressive pressing and tackling role." },
  "Anchor Man":         { label:"Anchor Man",          positions:["MID"], attackMod:0, midMod:1, defMod:5, fatigueMultiplier:0.7, description:"Sits in front of defense, protects space." },
  "Regista":            { label:"Regista",             positions:["MID"], attackMod:1, midMod:5, defMod:0, fatigueMultiplier:0.9, description:"Deep creative distributor, rarely presses." },
  "Mezzala":            { label:"Mezzala",             positions:["MID"], attackMod:3, midMod:3, defMod:1, fatigueMultiplier:1.1, description:"Half-turn runner from CM, attacks half-spaces." },
  "Winger":             { label:"Winger",              positions:["MID","ATT"], attackMod:3, midMod:1, defMod:0, fatigueMultiplier:1.1, description:"Hugs touchline, delivers crosses." },
  "Inverted Winger":    { label:"Inverted Winger",     positions:["MID","ATT"], attackMod:4, midMod:1, defMod:0, fatigueMultiplier:1.0, description:"Cuts inside to shoot on favoured foot." },
  "Wide Midfielder":    { label:"Wide Midfielder",     positions:["MID"], attackMod:2, midMod:2, defMod:1, fatigueMultiplier:0.9, description:"Provides width and tracks back." },

  // ATT
  "Advanced Forward":   { label:"Advanced Forward",   positions:["ATT"], attackMod:5, midMod:0, defMod:0, fatigueMultiplier:1.0, description:"Pure striker, stays up and finishes chances." },
  "Target Man":         { label:"Target Man",         positions:["ATT"], attackMod:4, midMod:1, defMod:0, fatigueMultiplier:0.8, description:"Holds up play, wins aerial duels." },
  "False 9":            { label:"False 9",            positions:["ATT"], attackMod:2, midMod:4, defMod:0, fatigueMultiplier:1.0, description:"Drops deep to overload midfield." },
  "Poacher":            { label:"Poacher",            positions:["ATT"], attackMod:5, midMod:0, defMod:0, fatigueMultiplier:0.7, description:"Lurks in the box, only cares about goals." },
  "Inside Forward":     { label:"Inside Forward",     positions:["ATT","MID"], attackMod:4, midMod:2, defMod:0, fatigueMultiplier:1.1, description:"Drifts infield to shoot from outside the box." },
  "Raumdeuter":         { label:"Raumdeuter",         positions:["ATT"], attackMod:4, midMod:1, defMod:0, fatigueMultiplier:0.8, description:"'Space interpreter' — exploits blind spots." },
  "Pressing Forward":   { label:"Pressing Forward",   positions:["ATT"], attackMod:3, midMod:1, defMod:1, fatigueMultiplier:1.3, description:"Forces mistakes from defenders through relentless pressing." },
  "Complete Forward":   { label:"Complete Forward",   positions:["ATT"], attackMod:4, midMod:2, defMod:0, fatigueMultiplier:1.1, description:"Can do everything: score, assist, press, and hold up." },
};

// ─────────────────────────────────────────────
// AUTO SELECT LINEUP
// ─────────────────────────────────────────────
export function autoSelectLineup(players: Player[], formation: string = "4-4-2"): { starters: Player[]; bench: Player[] } {
  const sorted = [...players].sort((a, b) => b.overall - a.overall);
  
  const gks = sorted.filter(p => p.position === "GK");
  const defs = sorted.filter(p => p.position === "DEF");
  const mids = sorted.filter(p => p.position === "MID");
  const atts = sorted.filter(p => p.position === "ATT");

  const starters: Player[] = [];
  
  let defCount = 4;
  let midCount = 4;
  let attCount = 2;

  const fMap: Record<string, [number,number,number]> = {
    "4-3-3":   [4,3,3],
    "4-2-3-1": [4,5,1],
    "3-5-2":   [3,5,2],
    "5-3-2":   [5,3,2],
    "4-5-1":   [4,5,1],
    "3-4-3":   [3,4,3],
    "4-1-4-1": [4,5,1],
    "4-3-2-1": [4,5,1],
    "3-4-1-2": [3,5,2],
    "4-2-2-2": [4,4,2],
    "5-4-1":   [5,4,1],
  };

  if (fMap[formation]) {
    [defCount, midCount, attCount] = fMap[formation];
  }

  if (gks.length > 0) starters.push(gks[0]);
  for (let i = 0; i < Math.min(defCount, defs.length); i++) starters.push(defs[i]);
  for (let i = 0; i < Math.min(midCount, mids.length); i++) starters.push(mids[i]);
  for (let i = 0; i < Math.min(attCount, atts.length); i++) starters.push(atts[i]);

  while (starters.length < 11 && sorted.length > starters.length) {
    const nextPlayer = sorted.find(p => !starters.some(s => s.id === p.id));
    if (nextPlayer) starters.push(nextPlayer);
    else break;
  }

  const bench = sorted.filter(p => !starters.some(s => s.id === p.id));
  return { starters: starters.slice(0, 11), bench };
}

// ─────────────────────────────────────────────
// TACTICS RATING CALCULATOR
// (used by both live engine and heuristic sim)
// ─────────────────────────────────────────────
export interface TacticsRating {
  attack: number;
  midfield: number;
  defense: number;
  fatigueRate: number; // modifier (1.0 = baseline)
}

export function computeTacticsRating(
  starters: Player[],
  tactics: TacticalInstructions,
  isHome: boolean
): TacticsRating {
  let att = 0, mid = 0, def = 0, fatigue = 0;

  starters.forEach(p => {
    const roleName = (tactics.playerRoles || {})[p.id];
    const role = roleName ? PLAYER_ROLES[roleName] : null;
    const duty = (tactics.playerDuties || {})[p.id] || "Support";

    // Attribute weights per role
    const attBase = (p.shooting || p.overall) * 0.6 + (p.pace || p.overall) * 0.4;
    const midBase = (p.passing || p.overall) * 0.6 + (p.dribbling || p.overall) * 0.4;
    const defBase = (p.defending || p.overall) * 0.7 + (p.physical || p.overall) * 0.3;

    // Role modifiers
    const rAtt = role ? role.attackMod : (p.position === "ATT" ? 3 : p.position === "MID" ? 1 : 0);
    const rMid = role ? role.midMod   : (p.position === "MID" ? 3 : 1);
    const rDef = role ? role.defMod   : (p.position === "DEF" || p.position === "GK" ? 3 : p.position === "MID" ? 1 : 0);
    const rFat = role ? role.fatigueMultiplier : 1.0;

    // Duty modifiers
    const dutyAttMod = duty === "Attack" ? 1.5 : duty === "Defend" ? 0.5 : 1.0;
    const dutyDefMod = duty === "Defend" ? 1.5 : duty === "Attack" ? 0.5 : 1.0;

    att += (attBase / 100) * rAtt * dutyAttMod;
    mid += (midBase / 100) * rMid;
    def += (defBase / 100) * rDef * dutyDefMod;
    fatigue += rFat;
  });

  const n = starters.length;
  att = att / n;
  mid = mid / n;
  def = def / n;
  fatigue = fatigue / n;

  // ── Team Instruction Modifiers ──
  const mentalityAttMod  = { Attacking: 1.4, Balanced: 1.0, Defensive: 0.7 }[tactics.mentality] ?? 1.0;
  const mentalityDefMod  = { Attacking: 0.8, Balanced: 1.0, Defensive: 1.3 }[tactics.mentality] ?? 1.0;
  const pressAttMod      = { High: 1.15, Mid: 1.0, Low: 0.9, None: 0.8 }[tactics.pressIntensity] ?? 1.0;
  const defLineMod       = { High: 1.15, Standard: 1.0, Deep: 0.85 }[tactics.defensiveLine] ?? 1.0;
  const widthAttMod      = { Wide: 1.1, Standard: 1.0, Narrow: 0.95 }[tactics.width] ?? 1.0;
  const tempoFatMod      = { Fast: 1.3, Normal: 1.0, Slow: 0.75 }[tactics.tempo] ?? 1.0;
  const directnessMod    = { Direct: 1.1, Mixed: 1.0, Short: 0.9 }[tactics.passingDirectness] ?? 1.0;
  const crossMod         = { Often: 1.1, Sometimes: 1.0, Rarely: 0.95 }[tactics.crossingFrequency] ?? 1.0;
  const counterMod       = { Rapid: 1.2, Balanced: 1.0, Patient: 0.9 }[tactics.counterAttackSpeed] ?? 1.0;

  // Home advantage
  const homeAdv = isHome ? 1.05 : 1.0;

  att = att * mentalityAttMod * widthAttMod * directnessMod * crossMod * counterMod * pressAttMod * homeAdv;
  mid = mid * (tactics.counterPress ? 1.1 : 1.0) * pressAttMod * homeAdv;
  def = def * mentalityDefMod * defLineMod * (tactics.offsideTrap ? 1.05 : 1.0) * homeAdv;

  // Offside trap risk — can backfire
  if (tactics.offsideTrap && Math.random() < 0.2) {
    def *= 0.85; // caught offside trap
  }

  fatigue = fatigue * tempoFatMod;

  return { attack: att, midfield: mid, defense: def, fatigueRate: fatigue };
}

// ─────────────────────────────────────────────
// HEURISTIC MATCH SIMULATION
// ─────────────────────────────────────────────
export function simulateMatchHeuristic(
  fixture: MatchFixture,
  homeClub: Club,
  awayClub: Club,
  homeSquad: Player[],
  awaySquad: Player[],
  homeTactics: TacticalInstructions = DEFAULT_TACTICS,
  awayTactics: TacticalInstructions = DEFAULT_TACTICS,
  homeManagerTacticsBonus: number = 10,
  awayManagerTacticsBonus: number = 10
): Omit<MatchFixture, "id" | "league" | "competition" | "round" | "matchday" | "homeClubId" | "awayClubId" | "played"> {
  
  const { starters: homeStarters } = autoSelectLineup(homeSquad);
  const { starters: awayStarters } = autoSelectLineup(awaySquad);

  // Compute FM-style ratings
  const homeRating = computeTacticsRating(homeStarters, homeTactics, true);
  const awayRating = computeTacticsRating(awayStarters, awayTactics, false);

  // Manager bonus
  homeRating.attack  += (homeManagerTacticsBonus / 20) * 0.15;
  homeRating.midfield += (homeManagerTacticsBonus / 20) * 0.15;
  awayRating.attack  += (awayManagerTacticsBonus / 20) * 0.15;
  awayRating.midfield += (awayManagerTacticsBonus / 20) * 0.15;

  // Possession based on midfield
  const homePossession = Math.max(30, Math.min(70, Math.round(50 + (homeRating.midfield - awayRating.midfield) * 25)));
  const awayPossession = 100 - homePossession;

  // Attack count based on possession share
  const homeAttCount = Math.floor(Math.random() * 4) + 4 + (homeTactics.mentality === "Attacking" ? 2 : 0) - (awayTactics.mentality === "Defensive" ? 1 : 0);
  const awayAttCount = Math.floor(Math.random() * 4) + 3 + (awayTactics.mentality === "Attacking" ? 2 : 0) - (homeTactics.mentality === "Defensive" ? 1 : 0);

  const events: MatchEvent[] = [];
  let homeScore = 0;
  let awayScore = 0;
  let homeShots = 0, homeShotsOnTarget = 0, awayShots = 0, awayShotsOnTarget = 0;

  const attackMinutes: { minute: number; isHome: boolean }[] = [];
  for (let i = 0; i < homeAttCount; i++) attackMinutes.push({ minute: Math.floor(Math.random() * 88) + 2, isHome: true });
  for (let i = 0; i < awayAttCount; i++) attackMinutes.push({ minute: Math.floor(Math.random() * 88) + 2, isHome: false });
  attackMinutes.sort((a, b) => a.minute - b.minute);

  const pickAttackingPlayer = (starters: Player[]) => {
    const atts = starters.filter(p => p.position === "ATT");
    const mids = starters.filter(p => p.position === "MID");
    const roll = Math.random();
    if (roll < 0.6 && atts.length > 0) return atts[Math.floor(Math.random() * atts.length)];
    if (roll < 0.9 && mids.length > 0) return mids[Math.floor(Math.random() * mids.length)];
    const defs = starters.filter(p => p.position === "DEF");
    return defs[Math.floor(Math.random() * defs.length)] || starters[0];
  };

  const pickAssistingPlayer = (scorerId: string, starters: Player[]) => {
    const candidates = starters.filter(p => p.id !== scorerId && p.position !== "GK");
    const mids = candidates.filter(p => p.position === "MID");
    if (Math.random() < 0.7 && mids.length > 0) return mids[Math.floor(Math.random() * mids.length)];
    return candidates[Math.floor(Math.random() * candidates.length)] || null;
  };

  for (const attack of attackMinutes) {
    const { minute, isHome } = attack;
    const attackingClub = isHome ? homeClub : awayClub;
    const attackingRating = isHome ? homeRating : awayRating;
    const defendingRating = isHome ? awayRating : homeRating;
    const attackingStarters = isHome ? homeStarters : awayStarters;
    const defendingStarters = isHome ? awayStarters : homeStarters;

    // Goal probability: attack vs defense ratio
    const ratio = attackingRating.attack / (attackingRating.attack + defendingRating.defense);
    const goalProb = ratio * 0.30;

    // Corner routine bonus
    const cornerBonus = (isHome ? homeTactics : awayTactics).cornerRoutine === "Whipped In" ? 0.02 : 0;
    const roll = Math.random();

    if (roll < goalProb + cornerBonus) {
      const scorer = pickAttackingPlayer(attackingStarters);
      const assister = pickAssistingPlayer(scorer.id, attackingStarters);
      scorer.goals = (scorer.goals || 0) + 1;
      if (assister) assister.assists = (assister.assists || 0) + 1;

      if (isHome) { homeScore++; homeShots++; homeShotsOnTarget++; }
      else { awayScore++; awayShots++; awayShotsOnTarget++; }

      events.push({
        minute, type: "Goal", clubId: attackingClub.id,
        playerName: scorer.name,
        details: assister
          ? `${scorer.name} converts! ${assister.name} with the assist.`
          : `${scorer.name} scores! Unstoppable finish.`
      });
    } else if (roll < goalProb + 0.28) {
      const shooter = pickAttackingPlayer(attackingStarters);
      const gk = defendingStarters.find(p => p.position === "GK") || defendingStarters[0];
      if (isHome) { homeShots++; homeShotsOnTarget++; }
      else { awayShots++; awayShotsOnTarget++; }

      events.push({
        minute, type: "Shot Saved", clubId: attackingClub.id,
        playerName: shooter.name,
        details: `${shooter.name} shoots hard, ${gk.name} pulls off a world-class save!`
      });
    } else if (roll < goalProb + 0.48) {
      const shooter = pickAttackingPlayer(attackingStarters);
      if (isHome) homeShots++; else awayShots++;
      events.push({
        minute, type: "Big Chance Missed", clubId: attackingClub.id,
        playerName: shooter.name,
        details: `${shooter.name} blazes over from a great position. What a chance wasted.`
      });
    }
  }

  // Cards
  const totalYellows = Math.floor(Math.random() * 4) + 1;
  for (let y = 0; y < totalYellows; y++) {
    const isHome = Math.random() < 0.5;
    const roster = isHome ? homeStarters : awayStarters;
    const player = roster.filter(p => p.position === "DEF" || p.position === "MID")[Math.floor(Math.random() * roster.length)] || roster[0];
    const minute = Math.floor(Math.random() * 85) + 5;
    if (!events.some(e => e.minute === minute)) {
      events.push({ minute, type: "Yellow Card", clubId: isHome ? homeClub.id : awayClub.id, playerName: player.name, details: `Yellow card shown to ${player.name}.` });
    }
  }

  if (Math.random() < 0.04) {
    const isHome = Math.random() < 0.5;
    const roster = isHome ? homeStarters : awayStarters;
    const player = roster.filter(p => p.position !== "GK")[Math.floor(Math.random() * (roster.length - 1))] || roster[0];
    const minute = Math.floor(Math.random() * 50) + 40;
    events.push({ minute, type: "Red Card", clubId: isHome ? homeClub.id : awayClub.id, playerName: player.name, details: `RED CARD! ${player.name} is off. His team is down to ten men.` });
  }

  if (Math.random() < 0.05) {
    const isHome = Math.random() < 0.5;
    const roster = isHome ? homeStarters : awayStarters;
    const player = roster[Math.floor(Math.random() * roster.length)];
    const minute = Math.floor(Math.random() * 80) + 10;
    events.push({ minute, type: "Injury", clubId: isHome ? homeClub.id : awayClub.id, playerName: player.name, details: `${player.name} goes off injured. Looks like a muscle issue.` });
  }

  events.sort((a, b) => a.minute - b.minute);

  // Cup tiebreaker
  if (fixture.competition === "Domestic Cup" && homeScore === awayScore) {
    const homePens = Math.floor(Math.random() * 5) + 3;
    let awayPens = Math.floor(Math.random() * 5) + 3;
    if (homePens === awayPens) awayPens = Math.random() > 0.5 ? homePens - 1 : homePens + 1;
    events.push({ minute: 120, type: "Penalty", clubId: homePens > awayPens ? homeClub.id : awayClub.id, playerName: "Team", details: `Full Time: draw. Penalties! ${homeClub.name} ${homePens}-${awayPens} ${awayClub.name}.` });
    if (homePens > awayPens) homeScore++; else awayScore++;
  }

  if (homeShots === 0) homeShots = Math.floor(Math.random() * 3) + 2;
  if (awayShots === 0) awayShots = Math.floor(Math.random() * 3) + 2;

  const stats: MatchStats = {
    possession: { home: homePossession, away: awayPossession },
    shots: { home: homeShots, away: awayShots },
    shotsOnTarget: { home: homeShotsOnTarget, away: awayShotsOnTarget },
    corners: { home: Math.floor(homeShots * 0.4) + Math.floor(Math.random() * 3), away: Math.floor(awayShots * 0.4) + Math.floor(Math.random() * 3) },
    fouls: { home: Math.floor(Math.random() * 6) + 7, away: Math.floor(Math.random() * 6) + 7 },
    offsides: { home: Math.floor(Math.random() * 3) + 1, away: Math.floor(Math.random() * 3) + 1 }
  };

  // Player ratings
  const playerRatings: Record<string, number> = {};
  const buildPlayerRatings = (starters: Player[], isWinner: boolean, scoreDiff: number, isHomeTeam: boolean) => {
    starters.forEach(p => {
      let base = 6.0;
      if (isWinner) base += 0.5 + scoreDiff * 0.15;
      else base -= 0.3 + scoreDiff * 0.15;
      if (p.position === "GK") {
        const oShots = isHomeTeam ? awayShotsOnTarget : homeShotsOnTarget;
        const gConceded = isHomeTeam ? awayScore : homeScore;
        base += (oShots - gConceded) * 0.4 - gConceded * 0.5;
      }
      if (p.goals && p.goals > 0) base += p.goals * 1.5;
      if (p.assists && p.assists > 0) base += p.assists * 1.0;
      if (events.some(e => e.type === "Red Card" && e.playerName === p.name)) base -= 2.5;
      else if (events.some(e => e.type === "Yellow Card" && e.playerName === p.name)) base -= 0.6;
      playerRatings[p.id] = parseFloat(Math.max(3.0, Math.min(10.0, base + (Math.random() - 0.5))).toFixed(1));
    });
  };

  const isHomeWinner = homeScore > awayScore;
  const isDraw = homeScore === awayScore;
  buildPlayerRatings(homeStarters, isDraw || isHomeWinner, Math.abs(homeScore - awayScore), true);
  buildPlayerRatings(awayStarters, isDraw || !isHomeWinner, Math.abs(homeScore - awayScore), false);

  let motmId = "";
  let bestRating = 0;
  Object.entries(playerRatings).forEach(([id, rating]) => { if (rating > bestRating) { bestRating = rating; motmId = id; } });
  if (!motmId) motmId = homeStarters[0]?.id || "";

  const motmName = [...homeStarters, ...awayStarters].find(p => p.id === motmId)?.name || "A midfielder";

  const winnerClub = isHomeWinner ? homeClub : awayClub;
  const loserClub = isHomeWinner ? awayClub : homeClub;
  const winnerTactics = isHomeWinner ? homeTactics : awayTactics;
  const tacticalAnalysis = isDraw
    ? `A tight affair at ${homeClub.stadium}. Possession ${homePossession}%-${awayPossession}%.`
    : `${winnerClub.shortName} were excellent, using a ${winnerTactics.mentality.toLowerCase()} mentality to outclass ${loserClub.shortName}. ${motmName} was the standout player.`;
  const pressQuote = isDraw
    ? `"A fair result. We played our game but lacked the cutting edge today."`
    : `"Brilliant performance. The boys stuck to the gameplan and were rewarded."`;

  return { homeScore, awayScore, events, stats, playerRatings, motmId, tacticalAnalysis, pressQuote };
}
