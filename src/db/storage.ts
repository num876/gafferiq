/* eslint-disable */
import { Club, Player, generateAllClubsWithSquads, calculateValue } from "../config/seededData";
import { get, set } from 'idb-keyval';

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
}

export interface MatchFixture {
  id: string;
  league: string; // Used to group fixtures by the user's primary league
  competition: "League" | "Domestic Cup";
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
  type: "Goal" | "Shot Saved" | "Yellow Card" | "Red Card" | "Injury" | "Substitution" | "Penalty" | "VAR Check" | "Big Chance Missed";
  clubId: string;
  playerName: string;
  assistName?: string;
  details: string;
}

export interface MatchStats {
  possession: { home: number; away: number };
  shots: { home: number; away: number };
  shotsOnTarget: { home: number; away: number };
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
  playerName: string;
  playerClub: string;
  playerClubId: string;
  playerRatingMin: number;
  playerRatingMax: number;
  playerAge: number;
  estimatedValue: number;
  position: string;
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

export interface SaveState {
  id: string;
  saveName: string;
  manager: Manager;
  selectedClubId: string;
  currentSeason: number;
  currentMatchday: number;
  academyLevel: number;
  transferBudget: number;
  wageBudget: number;
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
  transfersHistory: Array<{
    id: string;
    playerName: string;
    fromClubName: string;
    toClubName: string;
    fee: number;
    type: "permanent" | "loan";
    matchday: number;
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

  // Generate fixtures for all 5 leagues
  const leagues: Club["league"][] = ["EPL", "La Liga", "Serie A", "Bundesliga", "Ligue 1"];
  let allFixtures: MatchFixture[] = [];
  for (const l of leagues) {
    const leagueClubs = clubs.filter(c => c.league === l);
    allFixtures.push(...generateFixturesForLeague(leagueClubs, l));
    
    // Add Domestic Cup Round 1 fixtures for matchday 5
    const cupFixtures = generateCupFixturesForRound(leagueClubs.map(c => c.id), l, "Round 1", 5);
    allFixtures.push(...cupFixtures);
  }

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

  return {
    id: `save_${Date.now()}`,
    saveName,
    manager,
    selectedClubId: clubId,
    currentSeason: 1,
    currentMatchday: 1,
    academyLevel: 1,
    transferBudget: selectedClub.transferBudget,
    wageBudget: selectedClub.wageBudget,
    boardConfidence: 75,
    boardObjectives: [
      { id: "obj_1", title: "Maintain Respectability", description: "Avoid lingering in the relegation zone.", status: "pending", deadline: 38 },
      { id: "obj_2", title: "Cup Run", description: "Reach at least the quarter-finals of the Domestic Cup.", status: "pending", deadline: 38 }
    ],
    ticketPrice: 40,
    clubs,
    players,
    fixtures: allFixtures,
    standings,
    inbox: initialInbox,
    newsFeed: [],
    scoutingTasks: [],
    scoutShortlist: [],
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
