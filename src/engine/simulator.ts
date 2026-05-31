import { Club, Player } from "../config/seededData";
import { MatchFixture, MatchEvent, MatchStats } from "../db/storage";

export interface TacticalInstructions {
  mentality: "Attacking" | "Balanced" | "Defensive";
  pressIntensity: "High" | "Mid" | "Low" | "None";
  defensiveLine: "High" | "Standard" | "Deep";
  width: "Wide" | "Narrow" | "Standard";
  tempo: "Fast" | "Normal" | "Slow";
  takers: {
    penalties: string; // player ID
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
  takers: { penalties: "", corners: "", freeKicks: "" }
};

// Selects the starting 11 for a club automatically based on player ratings
export function autoSelectLineup(players: Player[], formation: string = "4-4-2"): { starters: Player[]; bench: Player[] } {
  // Sort players by overall descending
  const sorted = [...players].sort((a, b) => b.overall - a.overall);
  
  const gks = sorted.filter(p => p.position === "GK");
  const defs = sorted.filter(p => p.position === "DEF");
  const mids = sorted.filter(p => p.position === "MID");
  const atts = sorted.filter(p => p.position === "ATT");

  const starters: Player[] = [];
  
  // Parse formation, e.g., "4-4-2" -> 4 DEF, 4 MID, 2 ATT
  let defCount = 4;
  let midCount = 4;
  let attCount = 2;

  if (formation === "4-3-3") { defCount = 4; midCount = 3; attCount = 3; }
  else if (formation === "4-2-3-1") { defCount = 4; midCount = 5; attCount = 1; }
  else if (formation === "3-5-2") { defCount = 3; midCount = 5; attCount = 2; }
  else if (formation === "5-3-2") { defCount = 5; midCount = 3; attCount = 2; }
  else if (formation === "4-5-1") { defCount = 4; midCount = 5; attCount = 1; }
  else if (formation === "3-4-3") { defCount = 3; midCount = 4; attCount = 3; }
  else if (formation === "4-1-4-1") { defCount = 4; midCount = 5; attCount = 1; }

  // Select Goalkeeper
  if (gks.length > 0) starters.push(gks[0]);
  
  // Select Defenders
  for (let i = 0; i < Math.min(defCount, defs.length); i++) {
    starters.push(defs[i]);
  }
  // Select Midfielders
  for (let i = 0; i < Math.min(midCount, mids.length); i++) {
    starters.push(mids[i]);
  }
  // Select Attackers
  for (let i = 0; i < Math.min(attCount, atts.length); i++) {
    starters.push(atts[i]);
  }

  // Fallback if squad doesn't match standard counts
  while (starters.length < 11 && sorted.length > starters.length) {
    const nextPlayer = sorted.find(p => !starters.some(s => s.id === p.id));
    if (nextPlayer) starters.push(nextPlayer);
  }

  const bench = sorted.filter(p => !starters.some(s => s.id === p.id));

  return { starters: starters.slice(0, 11), bench };
}

// Client-side Match Simulation Engine (Heuristic)
export function simulateMatchHeuristic(
  homeClub: Club,
  awayClub: Club,
  homeSquad: Player[],
  awaySquad: Player[],
  homeTactics: TacticalInstructions,
  awayTactics: TacticalInstructions,
  homeManagerTacticsBonus: number = 10, // tactical knowledge out of 20
  awayManagerTacticsBonus: number = 10
): Omit<MatchFixture, "id" | "league" | "matchday" | "homeClubId" | "awayClubId" | "played"> {
  
  // 1. Get Starting Lineups
  const { starters: homeStarters } = autoSelectLineup(homeSquad);
  const { starters: awayStarters } = autoSelectLineup(awaySquad);

  // 2. Compute Core Ratings (Weighted based on positions)
  const computeAverageOverall = (players: Player[]) => 
    players.reduce((sum, p) => sum + p.overall, 0) / players.length;

  const homeAvgOverall = computeAverageOverall(homeStarters);
  const awayAvgOverall = computeAverageOverall(awayStarters);

  // Midfield Control (passing & dribbling)
  const homeMidRating = homeStarters.filter(p => p.position === "MID").reduce((sum, p) => sum + (p.passing + p.dribbling)/2, 0) / Math.max(1, homeStarters.filter(p => p.position === "MID").length);
  const awayMidRating = awayStarters.filter(p => p.position === "MID").reduce((sum, p) => sum + (p.passing + p.dribbling)/2, 0) / Math.max(1, awayStarters.filter(p => p.position === "MID").length);

  // Attack vs Defend ratings
  const homeAttRating = homeStarters.filter(p => p.position === "ATT").reduce((sum, p) => sum + p.shooting, 0) / Math.max(1, homeStarters.filter(p => p.position === "ATT").length);
  const awayDefRating = awayStarters.filter(p => p.position === "DEF").reduce((sum, p) => sum + p.defending, 0) / Math.max(1, awayStarters.filter(p => p.position === "DEF").length);

  const awayAttRating = awayStarters.filter(p => p.position === "ATT").reduce((sum, p) => sum + p.shooting, 0) / Math.max(1, awayStarters.filter(p => p.position === "ATT").length);
  const homeDefRating = homeStarters.filter(p => p.position === "DEF").reduce((sum, p) => sum + p.defending, 0) / Math.max(1, homeStarters.filter(p => p.position === "DEF").length);

  // 3. Modifiers (Home advantage, Tactics, Manager influence)
  let homeStrength = homeAvgOverall + 2.5; // Home advantage
  let awayStrength = awayAvgOverall;

  // Tactical Mentality Adjustment
  if (homeTactics.mentality === "Attacking") homeStrength += 1.5;
  if (homeTactics.mentality === "Defensive") homeStrength -= 1.0;
  if (awayTactics.mentality === "Attacking") awayStrength += 1.5;
  if (awayTactics.mentality === "Defensive") awayStrength -= 1.0;

  // Manager tactical knowledge bonus (adds up to 2 points)
  homeStrength += (homeManagerTacticsBonus / 20) * 2;
  awayStrength += (awayManagerTacticsBonus / 20) * 2;

  // 4. Determine Number of Attacks & Outcomes
  // Max attacks per team: 5-8
  const homeAttCount = Math.floor(Math.random() * 4) + 4 + (homeTactics.mentality === "Attacking" ? 2 : 0) - (awayTactics.mentality === "Defensive" ? 1 : 0);
  const awayAttCount = Math.floor(Math.random() * 4) + 3 + (awayTactics.mentality === "Attacking" ? 2 : 0) - (homeTactics.mentality === "Defensive" ? 1 : 0);

  const events: MatchEvent[] = [];
  let homeScore = 0;
  let awayScore = 0;

  let homeShots = 0;
  let homeShotsOnTarget = 0;
  let awayShots = 0;
  let awayShotsOnTarget = 0;

  // Distribute attacks chronologically (1-90 mins)
  const attackMinutes: { minute: number; isHome: boolean }[] = [];
  for (let i = 0; i < homeAttCount; i++) {
    attackMinutes.push({ minute: Math.floor(Math.random() * 88) + 2, isHome: true });
  }
  for (let i = 0; i < awayAttCount; i++) {
    attackMinutes.push({ minute: Math.floor(Math.random() * 88) + 2, isHome: false });
  }
  // Sort by minute
  attackMinutes.sort((a, b) => a.minute - b.minute);

  // Helper to pick scoring/assisting player
  const pickAttackingPlayer = (starters: Player[]) => {
    const atts = starters.filter(p => p.position === "ATT");
    const mids = starters.filter(p => p.position === "MID");
    
    // 60% Attacker, 30% Midfielder, 10% Defender
    const roll = Math.random();
    if (roll < 0.6 && atts.length > 0) return atts[Math.floor(Math.random() * atts.length)];
    if (roll < 0.9 && mids.length > 0) return mids[Math.floor(Math.random() * mids.length)];
    return starters.filter(p => p.position === "DEF")[Math.floor(Math.random() * starters.filter(p => p.position === "DEF").length)] || starters[0];
  };

  const pickAssistingPlayer = (scorerId: string, starters: Player[]) => {
    const candidates = starters.filter(p => p.id !== scorerId && p.position !== "GK");
    const mids = candidates.filter(p => p.position === "MID");
    const others = candidates.filter(p => p.position !== "MID");

    // 70% chance of midfielder assisting
    if (Math.random() < 0.7 && mids.length > 0) {
      return mids[Math.floor(Math.random() * mids.length)];
    }
    return others[Math.floor(Math.random() * others.length)] || null;
  };

  // Run through attacks
  for (const attack of attackMinutes) {
    const minute = attack.minute;
    const isHome = attack.isHome;
    const attackingClub = isHome ? homeClub : awayClub;
    const defendingClub = isHome ? awayClub : homeClub;
    const attackingStarters = isHome ? homeStarters : awayStarters;
    const defendingStarters = isHome ? awayStarters : homeStarters;

    // Calculate success probability based on rating comparisons
    const attackRep = isHome ? homeStrength : awayStrength;
    const defenseRep = isHome ? awayStrength : homeStrength;
    
    // Base goal probability: ~12% per attack
    const ratio = attackRep / (attackRep + defenseRep);
    const goalProb = ratio * 0.28; // adjusted for realistic final scores

    const roll = Math.random();

    if (roll < goalProb) {
      // GOAL!
      const scorer = pickAttackingPlayer(attackingStarters);
      const assister = pickAssistingPlayer(scorer.id, attackingStarters);
      scorer.goals = (scorer.goals || 0) + 1;
      if (assister) assister.assists = (assister.assists || 0) + 1;

      if (isHome) {
        homeScore++;
        homeShots++;
        homeShotsOnTarget++;
      } else {
        awayScore++;
        awayShots++;
        awayShotsOnTarget++;
      }

      events.push({
        minute,
        type: "Goal",
        clubId: attackingClub.id,
        playerName: scorer.name,
        details: assister 
          ? `Stunning strike! ${scorer.name} fires it past the keeper. Assisted by ${assister.name}.`
          : `Goal! ${scorer.name} intercepts a sloppy backpass and slots it home calmly.`
      });
    } else if (roll < goalProb + 0.3) {
      // SHOT SAVED
      const shooter = pickAttackingPlayer(attackingStarters);
      const gk = defendingStarters.find(p => p.position === "GK") || defendingStarters[0];
      
      if (isHome) {
        homeShots++;
        homeShotsOnTarget++;
      } else {
        awayShots++;
        awayShotsOnTarget++;
      }

      events.push({
        minute,
        type: "Shot Saved",
        clubId: attackingClub.id,
        playerName: shooter.name,
        details: `Great chance! ${shooter.name} shoots from the edge of the box, but ${gk.name} makes a flying fingertip save.`
      });
    } else if (roll < goalProb + 0.5) {
      // BIG CHANCE MISSED
      const shooter = pickAttackingPlayer(attackingStarters);
      if (isHome) homeShots++;
      else awayShots++;

      events.push({
        minute,
        type: "Big Chance Missed",
        clubId: attackingClub.id,
        playerName: shooter.name,
        details: `${shooter.name} finds himself unmarked in the box, but sends his header agonizingly wide of the post.`
      });
    }
  }

  // 5. Add random cards/injuries
  // Yellow Cards
  const totalYellows = Math.floor(Math.random() * 4) + 1; // 1 to 4 yellows in the match
  for (let y = 0; y < totalYellows; y++) {
    const isHome = Math.random() < 0.5;
    const roster = isHome ? homeStarters : awayStarters;
    const defender = roster.filter(p => p.position === "DEF" || p.position === "MID")[Math.floor(Math.random() * roster.length)] || roster[0];
    const minute = Math.floor(Math.random() * 85) + 5;
    
    // Check if duplicate minute
    if (!events.some(e => e.minute === minute)) {
      events.push({
        minute,
        type: "Yellow Card",
        clubId: isHome ? homeClub.id : awayClub.id,
        playerName: defender.name,
        details: `Yellow card for ${defender.name} after a reckless late tackle to stop a quick counter-attack.`
      });
    }
  }

  // Red Card (1% chance)
  if (Math.random() < 0.03) {
    const isHome = Math.random() < 0.5;
    const roster = isHome ? homeStarters : awayStarters;
    const player = roster.filter(p => p.position !== "GK")[Math.floor(Math.random() * (roster.length - 1))] || roster[0];
    const minute = Math.floor(Math.random() * 50) + 40;
    
    events.push({
      minute,
      type: "Red Card",
      clubId: isHome ? homeClub.id : awayClub.id,
      playerName: player.name,
      details: `RED CARD! ${player.name} is sent off for a dangerous high-boot tackle. A disaster for his team.`
    });
  }

  // Injury (2% chance)
  if (Math.random() < 0.05) {
    const isHome = Math.random() < 0.5;
    const roster = isHome ? homeStarters : awayStarters;
    const player = roster[Math.floor(Math.random() * roster.length)];
    const minute = Math.floor(Math.random() * 80) + 10;
    
    events.push({
      minute,
      type: "Injury",
      clubId: isHome ? homeClub.id : awayClub.id,
      playerName: player.name,
      details: `${player.name} pulls up clutching his hamstring and has to go off. Looks like a serious muscle strain.`
    });
  }

  // Sort events chronologically
  events.sort((a, b) => a.minute - b.minute);

  // Generate Stats
  const homePossession = Math.max(30, Math.min(70, Math.floor(50 + (homeMidRating - awayMidRating) * 0.8 + (homeTactics.tempo === "Slow" ? 2 : 0))));
  const awayPossession = 100 - homePossession;

  // Add filler shots if they are 0
  if (homeShots === 0) homeShots = Math.floor(Math.random() * 3) + 2;
  if (awayShots === 0) awayShots = Math.floor(Math.random() * 3) + 2;
  
  const stats: MatchStats = {
    possession: { home: homePossession, away: awayPossession },
    shots: { home: homeShots, away: awayShots },
    shotsOnTarget: { home: homeShotsOnTarget, away: awayShotsOnTarget },
    corners: {
      home: Math.floor(homeShots * 0.4) + Math.floor(Math.random() * 3),
      away: Math.floor(awayShots * 0.4) + Math.floor(Math.random() * 3)
    },
    fouls: {
      home: Math.floor(Math.random() * 6) + 7,
      away: Math.floor(Math.random() * 6) + 7
    },
    offsides: {
      home: Math.floor(Math.random() * 3) + 1,
      away: Math.floor(Math.random() * 3) + 1
    }
  };

  // 6. Generate Player Ratings
  const playerRatings: Record<string, number> = {};
  
  // Helper to compute ratings
  const buildPlayerRatings = (starters: Player[], isWinner: boolean, scoreDiff: number, isHomeTeam: boolean) => {
    starters.forEach(p => {
      // Base rating
      let base = 6.0;
      
      // Winner/Loser adjustments
      if (isWinner) base += 0.5 + scoreDiff * 0.15;
      else base -= 0.3 + scoreDiff * 0.15;

      // Position adjustments
      if (p.position === "GK") {
        const opposingShots = isHomeTeam ? awayShotsOnTarget : homeShotsOnTarget;
        const goalsConceded = isHomeTeam ? awayScore : homeScore;
        const saves = opposingShots - goalsConceded;
        base += saves * 0.4 - goalsConceded * 0.5;
      }
      
      // Goal/Assist boosts
      if (p.goals && p.goals > 0) base += p.goals * 1.5;
      if (p.assists && p.assists > 0) base += p.assists * 1.0;

      // Card penalty
      const hasRed = events.some(e => e.type === "Red Card" && e.playerName === p.name);
      const hasYellow = events.some(e => e.type === "Yellow Card" && e.playerName === p.name);
      if (hasRed) base -= 2.5;
      else if (hasYellow) base -= 0.6;

      // Muted bounds
      const finalRating = Math.max(3.0, Math.min(10.0, base + (Math.random() * 1.0 - 0.5)));
      playerRatings[p.id] = parseFloat(finalRating.toFixed(1));
    });
  };

  const isHomeWinner = homeScore > awayScore;
  const isDraw = homeScore === awayScore;
  const scoreDifference = Math.abs(homeScore - awayScore);

  buildPlayerRatings(homeStarters, isDraw ? true : isHomeWinner, scoreDifference, true);
  buildPlayerRatings(awayStarters, isDraw ? true : !isHomeWinner, scoreDifference, false);

  // 7. Determine Man of the Match (MOTM)
  let bestRating = 0;
  let motmId = "";
  
  Object.entries(playerRatings).forEach(([id, rating]) => {
    if (rating > bestRating) {
      bestRating = rating;
      motmId = id;
    }
  });

  // Fallback MOTM
  if (!motmId) {
    motmId = homeStarters[0]?.id || "";
  }

  const motmName = [...homeStarters, ...awayStarters].find(p => p.id === motmId)?.name || "The midfielder";

  // 8. Tactical Analysis & Press Quote
  let tacticalAnalysis = "";
  let pressQuote = "";

  if (isDraw) {
    tacticalAnalysis = `A tactical stalemate at ${homeClub.stadium}. Both teams setup compactly. ${homeClub.shortName} dominated possession (${stats.possession.home}%) but struggled to break down ${awayClub.shortName}'s low block.`;
    pressQuote = `"It was a tough match. We played well but lacked that final spark in the attacking third. A draw is a fair result, though we wanted all three points."`;
  } else {
    const winnerClub = isHomeWinner ? homeClub : awayClub;
    const loserClub = isHomeWinner ? awayClub : homeClub;
    const winnerTactics = isHomeWinner ? homeTactics : awayTactics;

    tacticalAnalysis = `${winnerClub.shortName} secured a crucial victory, utilizing their ${winnerTactics.mentality.toLowerCase()} instructions to slice through ${loserClub.shortName}'s lines. ${motmName} put on a masterclass, causing endless problems for the opposition defenders.`;
    pressQuote = `"I'm incredibly proud of the boys today. We executed our tactical plan perfectly and took our chances when they came. ${motmName} was outstanding, a real leader on the pitch."`;
  }

  return {
    homeScore,
    awayScore,
    events,
    stats,
    playerRatings,
    motmId,
    tacticalAnalysis,
    pressQuote
  };
}
