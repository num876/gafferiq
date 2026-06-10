/* eslint-disable */
import { Club, Player, generateAllClubsWithSquads, calculateValue } from "../config/seededData";
import { get, set } from 'idb-keyval';

export interface ManagerSkill {
  category: string; // e.g., "Tactics", "Finances", "Scouting", "Negotiation", "Training", "Media"
  level: number; // 0-5
  points: number; // accumulated points toward next level
}

export interface Manager {
  firstName: string;
  lastName: string;
  nationality: string;
  dob: string;
  favoriteFormation: string;
  avatar: {
    skinTone: string;
    hairStyle: string;
    hairColor: string;
    shirtColor: string;
  };
  attributes: {
    tacticalKnowledge: number;
    manManagement: number;
    motivation: number;
    scouting: number;
    negotiation: number;
  };
  reputation: number; // 1-100 (Sunday League to World Class)
  reputationLabel: string;
  playingStyle: string;
  bio: string;
  aiImageUrl?: string;
  winCount: number;
  drawCount: number;
  lossCount: number;
  goalsScored: number;
  titlesWon: number;
  achievements: string[];
  // New field for skill tree
  skills: Record<string, ManagerSkill>;
}

export interface MatchFixture {
  id: string;
  league: string; // Used to group fixtures by the user's primary league
  competition: "League" | "Domestic Cup" | "Continental";
  round?: string; // e.g. "Quarter Final", "Final", "Round 1"
  matchday: number;
  homeClubId: string;
  awayClubId: string;
  homeScore: number | null;
  awayScore: number | null;
  played: boolean;
  events?: MatchEvent[];
  stats?: MatchStats;
  playerRatings?: Record<string, number>;
  motmId?: string;
  tacticalAnalysis?: string;
  pressQuote?: string;
}

export interface MatchEvent {
  minute: number;
  type: "Goal" | "Substitution" | "Yellow Card" | "Red Card" | "Injury" | "Penalty Goal" | "Penalty Miss" | "Shot Saved" | "Big Chance Missed" | "Penalty" | "VAR Check";
  clubId: string;
  playerName: string;
  assistName?: string;
  details?: string;
}

export interface MatchStats {
  possession: { home: number; away: number };
  shots: { home: number; away: number };
  shotsOnTarget: { home: number; away: number };
  xG?: { home: number; away: number };
  corners: { home: number; away: number };
  fouls: { home: number; away: number };
  offsides: { home: number; away: number };
}

export interface Standing {
  clubId: string;
  clubName: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  gf: number;
  ga: number;
  gd: number;
  points: number;
  form: ("W" | "D" | "L")[];
}

export interface InboxMessage {
  id: string;
  sender: string;
  subject: string;
  body: string;
  date: string;
  read: boolean;
  type: "board" | "player" | "media" | "transfer";
  actionRequired?: boolean;
  options?: { label: string; action: string; effect: string }[];
  selectedOption?: string;
}

export interface Scout {
  id: string;
  name: string;
  rating: number; // 1-5 stars
  specialty: string;
  wage: number;
}

export interface ScoutTask {
  id: string;
  type?: "Player" | "Region";
  
  // Specific player assignment (Optional now)
  playerName?: string;
  playerClub?: string;
  playerClubId?: string;
  playerRatingMin?: number;
  playerRatingMax?: number;
  playerAge?: number;
  estimatedValue?: number;
  position?: string;
  
  // Region assignment
  region?: string;

  scoutId: string;
  daysRemaining: number;
  completed: boolean;
}

export interface NewsArticle {
  id: string;
  author: string;
  handle: string;
  content: string;
  likes: number;
  type: "transfer" | "drama" | "competition" | "general";
  date: string; // Matchday relative
}

export interface BoardObjective {
  id: string;
  title: string;
  description: string;
  status: "pending" | "success" | "failed";
  deadline: number;
}

export interface ContinentalGroupStanding {
  clubId: string;
  clubName: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  points: number;
}

export interface ContinentalCupState {
  participants: string[];
  groups: Record<string, ContinentalGroupStanding[]>; // "Group A" to "Group H"
}




export const SCOUTING_REGIONS = [
  "UK & Ireland",
  "Western Europe", 
  "Southern Europe",
  "Eastern Europe",
  "Scandinavia",
  "Rest of World"
];

export function getRegionForLeague(league: string): string {
  switch (league) {
    case "EPL": return "UK & Ireland";
    case "Ligue 1": 
    case "Eredivisie": 
    case "Bundesliga": 
    case "Swiss Super League": return "Western Europe";
    case "La Liga":
    case "Serie A":
    case "Liga Portugal": return "Southern Europe";
    case "Serbian SuperLiga":
    case "Ukrainian Premier League":
    case "Russian Premier League":
    case "Ekstraklasa":
    case "Prva HNL": return "Eastern Europe";
    case "Danish Superliga":
    case "Allsvenskan": return "Scandinavia";
    default: return "Rest of World";
  }
}

export function addManagerSkillPoints(state: SaveState, pointsByCategory: Record<string, number>) {
  for (const cat in pointsByCategory) {
    const pts = pointsByCategory[cat];
    if (!state.manager.skills[cat]) continue;
    const skill = state.manager.skills[cat];
    skill.points += pts;
    // Level up when points exceed 100
    while (skill.points >= 100 && skill.level < 5) {
      skill.points -= 100;
      skill.level += 1;
      state.inbox.unshift({
        id: `skill_up_${cat}_${Date.now()}`,
        sender: "Club Board",
        subject: `Skill Upgrade: ${cat}`,
        body: `Your ${cat} skill has increased to level ${skill.level}. Congratulations!`,
        date: `Matchday ${state.currentMatchday}`,
        read: false,
        type: "board"
      });
    }
  }
}

export function checkPromotionEligibility(state: SaveState) {
  const reputation = state.manager.reputation;
  const thresholds = [80, 90]; // example thresholds for job offers
  thresholds.forEach(th => {
    if (reputation >= th && !state.jobOffers.some(o => o.requiredReputation === th)) {
      // Find clubs with higher reputation than current
      const eligibleClubs = state.clubs.filter(c => c.reputation > state.clubs.find(cl => cl.id === state.selectedClubId)!.reputation);
      eligibleClubs.slice(0, 3).forEach(cl => {
        state.jobOffers.push({ clubId: cl.id, clubName: cl.name, requiredReputation: th });
      });
      state.inbox.unshift({
        id: `job_offer_${th}_${Date.now()}`,
        sender: "Career Agent",
        subject: `New Job Opportunities`,
        body: `Your reputation has reached ${reputation}. Several clubs are interested in hiring you. Check the Career tab for offers.`,
        date: `Matchday ${state.currentMatchday}`,
        read: false,
        type: "board"
      });
    }
  });
}

export interface SaveState {
  id: string;
  saveName: string;
  manager: Manager;
  selectedClubId: string;
  currentSeason: number;
  currentMatchday: number;
  academyLevel: number;
  bankBalance: number; // General funds for the club
  transferBudget: number; // Budget allocated for transfers
  wageBudget: number; // Budget allocated for wages
  boardConfidence: number;
  boardObjectives: BoardObjective[];
  ticketPrice: number;
  stadiumExpansion?: {
    targetMatchday: number;
    capacityIncrease: number;
  };
  isGameOver?: boolean;
  clubs: Club[];
  players: Player[];
  fixtures: MatchFixture[];
  standings: Record<string, Standing[]>; // standings grouped by league name
  inbox: InboxMessage[];
  newsFeed: NewsArticle[];
  scoutingTasks: ScoutTask[];
  scoutShortlist: string[]; // player IDs
  playerKnowledge: Record<string, number>; // playerId -> knowledge level (0, 1, 2)
  jobOffers: Array<{ clubId: string; clubName: string; requiredReputation: number }>;
  // add future fields if needed
  continentalCups?: {
    championsLeague: ContinentalCupState;
    europaLeague: ContinentalCupState;
  };
  transfersHistory: Array<{
    id: string;
    playerName: string;
    fromClubName: string;
    toClubName: string;
    fee: number;
    type: "permanent" | "loan";
    matchday: number;
    date?: string;
  }>;
  coaches: Array<{
    id: string;
    type: "Attacking" | "Defensive" | "Fitness" | "Tactical" | "Goalkeeping";
    level: number; // 1-5, determines multiplier
    wage: number;
  }>;
  scouts: Scout[];
  cupState?: {
    activeClubs: string[]; // Club IDs still in the cup
    eliminatedClubs: string[]; // Club IDs knocked out
    currentRound: string;
    winnerId: string | null;
  };
  tactics?: {
    formation: string;
    instructions: any; // Using any here to avoid circular imports or redefining TacticalInstructions, we know it will be TacticalInstructions
    starters: string[]; // Player IDs
    bench: string[]; // Player IDs
  };
  tacticalPresets?: Record<number, {
    formation: string;
    tactics: any;
  }>;
  transferWindowOpen: boolean;
  difficulty: "Quick Sim" | "Detailed Sim";
  gameLog: string[];
}

// Circle Method algorithm to schedule fixtures
export function generateFixturesForLeague(clubs: Club[], league: string): MatchFixture[] {
  const leagueClubs = clubs.filter(c => c.league === league);
  const n = leagueClubs.length;
  const fixtures: MatchFixture[] = [];
  const rounds = (n - 1) * 2; // Home and Away rounds

  const list = [...leagueClubs];

  let idCounter = 1;

  for (let r = 0; r < rounds; r++) {
    const isSecondHalf = r >= n - 1;
    const roundNumber = r + 1;
    const activeRound = isSecondHalf ? r - (n - 1) : r;

    for (let i = 0; i < n / 2; i++) {
      let homeIdx = (activeRound + i) % (n - 1);
      let awayIdx = (activeRound - i + n - 1) % (n - 1);

      if (i === 0) {
        homeIdx = n - 1;
      }

      let home = list[homeIdx];
      let away = list[awayIdx];

      // Swap home and away for alternating rounds or in the second half
      if ((activeRound + i) % 2 === 1) {
        const temp = home;
        home = away;
        away = temp;
      }

      if (isSecondHalf) {
        const temp = home;
        home = away;
        away = temp;
      }

      // Map league rounds to matchdays, skipping cup weeks
      const cupWeeks = [5, 10, 15, 20, 25];
      let actualMatchday = roundNumber;
      for (const cw of cupWeeks) {
        if (actualMatchday >= cw) actualMatchday++;
      }

      fixtures.push({
        id: `${league.toLowerCase()}_m_${actualMatchday}_f_${idCounter++}`,
        league,
        competition: "League",
        matchday: actualMatchday,
        homeClubId: home.id,
        awayClubId: away.id,
        homeScore: null,
        awayScore: null,
        played: false
      });
    }
  }

  return fixtures;
}

export function generateCupFixturesForRound(activeClubIds: string[], league: string, roundName: string, matchday: number): MatchFixture[] {
  const fixtures: MatchFixture[] = [];
  
  // Shuffle array deterministically or pseudo-randomly
  const shuffled = [...activeClubIds].sort(() => Math.random() - 0.5);
  
  // If the number of clubs is not a power of 2, some clubs get a bye.
  // We need to calculate how many teams play in this round to reach the next power of 2.
  let nextPow2 = 1;
  while (nextPow2 < shuffled.length) nextPow2 *= 2;
  
  const byes = nextPow2 - shuffled.length;
  const teamsPlaying = shuffled.length - byes; // Number of teams that must play to eliminate enough teams
  
  const playingTeams = shuffled.slice(0, teamsPlaying);
  let idCounter = 1;
  
  for (let i = 0; i < playingTeams.length; i += 2) {
    if (i + 1 < playingTeams.length) {
      fixtures.push({
        id: `cup_${league.toLowerCase()}_${roundName.replace(/\s/g, '')}_f_${idCounter++}_${Date.now()}`,
        league,
        competition: "Domestic Cup",
        round: roundName,
        matchday,
        homeClubId: playingTeams[i],
        awayClubId: playingTeams[i+1],
        homeScore: null,
        awayScore: null,
        played: false
      });
    }
  }

  return fixtures;
}

export function createNewSave(saveName: string, manager: Manager, clubId: string, speed: "Quick Sim" | "Detailed Sim"): SaveState {
  const { clubs, players } = generateAllClubsWithSquads();
  const selectedClub = clubs.find(c => c.id === clubId)!;

  // Generate fixtures for all 15 leagues
  const leagues: Club["league"][] = ["EPL", "La Liga", "Serie A", "Bundesliga", "Ligue 1", "Eredivisie", "Liga Portugal", "Serbian SuperLiga", "Swiss Super League", "Ukrainian Premier League", "Danish Superliga", "Allsvenskan", "Russian Premier League", "Ekstraklasa", "Prva HNL"];
  let allFixtures: MatchFixture[] = [];
  for (const l of leagues) {
    const leagueClubs = clubs.filter(c => c.league === l);
    allFixtures.push(...generateFixturesForLeague(leagueClubs, l));
    
    // Add Domestic Cup Round 1 fixtures for matchday 5
    const cupFixtures = generateCupFixturesForRound(leagueClubs.map(c => c.id), l, "Round 1", 5);
    allFixtures.push(...cupFixtures);
  }

  // Generate Continental Cups
  const continentalCups = generateContinentalState(clubs);
  allFixtures.push(...generateContinentalGroupFixtures(continentalCups.championsLeague, "Champions League"));
  allFixtures.push(...generateContinentalGroupFixtures(continentalCups.europaLeague, "Europa League"));

  // Initialize Standings
  const standings: Record<string, Standing[]> = {};
  for (const l of leagues) {
    const leagueClubs = clubs.filter(c => c.league === l);
    standings[l] = leagueClubs.map(c => ({
      clubId: c.id,
      clubName: c.name,
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      gf: 0,
      ga: 0,
      gd: 0,
      points: 0,
      form: []
    }));
  }

  // Setup Initial Inbox Message from Board
  const initialInbox: InboxMessage[] = [
    {
      id: "board_welcome",
      sender: "Club Board of Directors",
      subject: "Welcome to the club!",
      body: `Dear Manager ${manager.lastName},

We are thrilled to welcome you as our new head coach. Your playing style (${manager.playingStyle}) and tactical approach align with our goals. 

For this season, the board expects you to match the status of our club and establish a stable position in the table. We have provided you with a transfer budget of €${(selectedClub.transferBudget / 1000000).toFixed(1)}M and a wage budget of €${(selectedClub.wageBudget / 1000).toFixed(0)}k/week.

Good luck! We will monitor your performance closely.

Regards,
The Board`,
      date: "Pre-Season",
      read: false,
      type: "board"
    }
  ];

  const playerKnowledge: Record<string, number> = {};
  // Initialize manager skill tree with default categories
  const defaultSkills: Record<string, ManagerSkill> = {
    Tactics: { category: 'Tactics', level: 0, points: 0 },
    Finances: { category: 'Finances', level: 0, points: 0 },
    Scouting: { category: 'Scouting', level: 0, points: 0 },
    Negotiation: { category: 'Negotiation', level: 0, points: 0 },
    Training: { category: 'Training', level: 0, points: 0 },
    Media: { category: 'Media', level: 0, points: 0 }
  };

  // Assign skills to manager
  manager.skills = defaultSkills;

  // Initialize empty job offers array
  const jobOffers: Array<{ clubId: string; clubName: string; requiredReputation: number }> = [];

  // Initialize Knowledge
  players.forEach(p => {
    const pClub = clubs.find(c => c.id === p.clubId);
    
    if (p.clubId === clubId) {
      playerKnowledge[p.id] = 2; // Full knowledge of own players
    } else if (pClub && pClub.league === selectedClub.league) {
      playerKnowledge[p.id] = 1; // Basic knowledge of same league players
    } else {
      playerKnowledge[p.id] = 0; // Fog of War for others
    }
  });

  return {
    id: `save_${Date.now()}`,
    saveName,
    manager,
    selectedClubId: clubId,
    currentSeason: 1,
    currentMatchday: 1,
    academyLevel: 1,
    bankBalance: selectedClub.bankBalance || 0,
    transferBudget: selectedClub.transferBudget,
    wageBudget: selectedClub.wageBudget,
    boardConfidence: 100,
    boardObjectives: [],
    ticketPrice: selectedClub.ticketPrice || 40,
    clubs,
    players,
    fixtures: allFixtures,
    standings,
    inbox: initialInbox,
    newsFeed: [],
    scoutingTasks: [],
    scoutShortlist: [],
    playerKnowledge,
    jobOffers,
    continentalCups,
    transfersHistory: [],
    coaches: [],
    scouts: [
      { id: "scout_1", name: "Gary Cahill", rating: 2, specialty: "General", wage: 800 }
    ],
    cupState: {
      activeClubs: clubs.filter(c => c.league === selectedClub.league).map(c => c.id),
      eliminatedClubs: [],
      currentRound: "Round 1",
      winnerId: null
    },
    transferWindowOpen: true,
    difficulty: speed,
    gameLog: ["Save file created. Pre-season training commenced."]
  };
}

const LOCAL_STORAGE_KEY = "gaffer_iq_saves";

export async function loadAllSaves(): Promise<SaveState[]> {
  if (typeof window === "undefined") return [];
  
  try {
    const idbSaves = await get<SaveState[]>(LOCAL_STORAGE_KEY);
    if (idbSaves && idbSaves.length > 0) return idbSaves;
  } catch(e) {}

  const savesJSON = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (!savesJSON) return [];
  try {
    const saves = JSON.parse(savesJSON);
    await set(LOCAL_STORAGE_KEY, saves); // Migrate
    return saves;
  } catch (e) {
    console.error("Failed to parse save games", e);
    return [];
  }
}

export async function saveGame(state: SaveState): Promise<void> {
  if (typeof window === "undefined") return;
  const currentSaves = await loadAllSaves();
  const index = currentSaves.findIndex(s => s.id === state.id);
  
  if (index !== -1) {
    currentSaves[index] = state;
  } else {
    currentSaves.push(state);
  }

  await set(LOCAL_STORAGE_KEY, currentSaves);
}

export async function deleteSave(saveId: string): Promise<void> {
  if (typeof window === "undefined") return;
  const currentSaves = await loadAllSaves();
  const updated = currentSaves.filter(s => s.id !== saveId);
  await set(LOCAL_STORAGE_KEY, updated);
}


export function generateContinentalState(clubs: Club[]) {
  const top5 = ["EPL", "La Liga", "Serie A", "Bundesliga", "Ligue 1"];
  const clTeams: string[] = [];
  const elTeams: string[] = [];

  // Group clubs by league and sort by reputation descending
  const clubsByLeague: Record<string, Club[]> = {};
  for (const c of clubs) {
    if (!clubsByLeague[c.league]) clubsByLeague[c.league] = [];
    clubsByLeague[c.league].push(c);
  }
  for (const l in clubsByLeague) {
    clubsByLeague[l].sort((a, b) => b.reputation - a.reputation);
  }

  // Pick CL teams
  for (const l in clubsByLeague) {
    const take = top5.includes(l) ? 4 : 2;
    for (let i = 0; i < take && i < clubsByLeague[l].length; i++) {
      clTeams.push(clubsByLeague[l][i].id);
    }
  }

  // Pick EL teams
  for (const l in clubsByLeague) {
    const skip = top5.includes(l) ? 4 : 2;
    const take = top5.includes(l) ? 4 : 2;
    for (let i = skip; i < skip + take && i < clubsByLeague[l].length; i++) {
      elTeams.push(clubsByLeague[l][i].id);
    }
  }

  // Helper to build 8 groups of 5
  const buildGroups = (teamIds: string[]): Record<string, ContinentalGroupStanding[]> => {
    // Shuffle teams for random draw
    const shuffled = [...teamIds].sort(() => Math.random() - 0.5);
    const groups: Record<string, ContinentalGroupStanding[]> = {};
    const groupNames = ["Group A", "Group B", "Group C", "Group D", "Group E", "Group F", "Group G", "Group H"];
    
    for (let i = 0; i < 8; i++) {
      const gName = groupNames[i];
      groups[gName] = [];
      for (let j = 0; j < 5; j++) {
        const tId = shuffled[i * 5 + j];
        if (tId) {
          const club = clubs.find(c => c.id === tId)!;
          groups[gName].push({
            clubId: tId,
            clubName: club.shortName,
            played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, points: 0
          });
        }
      }
    }
    return groups;
  };

  return {
    championsLeague: {
      participants: clTeams,
      groups: buildGroups(clTeams)
    },
    europaLeague: {
      participants: elTeams,
      groups: buildGroups(elTeams)
    }
  };
}

export function generateContinentalGroupFixtures(cupState: ContinentalCupState, compName: string): MatchFixture[] {
  const fixtures: MatchFixture[] = [];
  const matchdays = [4, 8, 12, 16, 20]; // 5 matchdays for the 5 rounds of a 5-team round-robin
  
  for (const gName in cupState.groups) {
    const teams = cupState.groups[gName].map(g => g.clubId);
    if (teams.length !== 5) continue; // safety

    // Standard 5-team round robin pairings (10 matches total, 2 per matchday)
    // Round 1: 1v4, 2v3 (5 rests)
    // Round 2: 5v1, 4v2 (3 rests)
    // Round 3: 2v5, 3v4 (1 rests)
    // Round 4: 1v2, 5v3 (4 rests)
    // Round 5: 3v1, 4v5 (2 rests)
    const schedule = [
      [[0,3], [1,2]],
      [[4,0], [3,1]],
      [[1,4], [2,3]],
      [[0,1], [4,2]],
      [[2,0], [3,4]]
    ];

    for (let round = 0; round < 5; round++) {
      const md = matchdays[round];
      const matches = schedule[round];
      for (let m = 0; m < matches.length; m++) {
        const homeIdx = matches[m][0];
        const awayIdx = matches[m][1];
        fixtures.push({
          id: `${compName.replace(/\s/g, '').toLowerCase()}_${gName.replace(/\s/g, '')}_md${md}_m${m}_${Date.now()}`,
          league: compName,
          competition: "Continental",
          round: `Group Stage - ${gName}`,
          matchday: md,
          homeClubId: teams[homeIdx],
          awayClubId: teams[awayIdx],
          homeScore: null,
          awayScore: null,
          played: false
        });
      }
    }
  }
  return fixtures;
}
