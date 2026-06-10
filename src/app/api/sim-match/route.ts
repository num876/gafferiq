/* eslint-disable */
import { NextResponse } from "next/server";
import { simulateMatchHeuristic } from "../../../engine/simulator";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      homeClub,
      awayClub,
      homeSquad,
      awaySquad,
      homeTactics,
      awayTactics,
      homeManagerTacticsBonus,
      awayManagerTacticsBonus,
    } = body;

    if (!homeClub || !awayClub || !homeSquad || !awaySquad) {
      return NextResponse.json({ error: "Missing required match parameters" }, { status: 400 });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (!apiKey) {
      // Graceful fallback to Heuristic Simulator
      console.log("ANTHROPIC_API_KEY not found. Falling back to heuristic simulator.");
      const result = simulateMatchHeuristic(
        homeClub,
        awayClub,
        homeSquad,
        awaySquad,
        homeTactics,
        awayTactics,
        homeManagerTacticsBonus || 10,
        awayManagerTacticsBonus || 10
      );
      return NextResponse.json(result);
    }

    // Call AI API (Anthropic)
    // Build custom simulation prompt
    const prompt = `You are GafferIQ, an advanced Football Manager match simulation engine.
Simulate a football match between:
Home Club: ${homeClub.name} (Reputation: ${homeClub.reputation}/100, Played at ${homeClub.stadium}, Capacity: ${homeClub.capacity})
Away Club: ${awayClub.name} (Reputation: ${awayClub.reputation}/100)

Home Roster Starters (Name - Position - Overall Rating):
${homeSquad.slice(0, 11).map((p: any) => `- ${p.name} (${p.position}) - Ovr: ${p.overall}`).join("\n")}

Away Roster Starters (Name - Position - Overall Rating):
${awaySquad.slice(0, 11).map((p: any) => `- ${p.name} (${p.position}) - Ovr: ${p.overall}`).join("\n")}

Home Tactical Mentality: ${homeTactics.mentality}, Pressing: ${homeTactics.pressIntensity}, Line: ${homeTactics.defensiveLine}, Tempo: ${homeTactics.tempo}
Away Tactical Mentality: ${awayTactics.mentality}, Pressing: ${awayTactics.pressIntensity}, Line: ${awayTactics.defensiveLine}, Tempo: ${awayTactics.tempo}

Home Manager Tactical Knowledge: ${homeManagerTacticsBonus}/20
Away Manager Tactical Knowledge: ${awayManagerTacticsBonus}/20

Rules:
1. Generate a realistic football match result based on these parameters.
2. Provide a list of 8-12 chronological match events with minute stamps (between 1 and 90). Event types MUST be one of: "Goal", "Shot Saved", "Yellow Card", "Red Card", "Injury", "Substitution", "Penalty", "VAR Check", "Big Chance Missed".
3. Return statistics: Possession (sum must be 100), Shots, Shots on Target, Corners, Fouls, Offsides.
4. Calculate player ratings (0.0 to 10.0) for every starter based on their performance (goal scorers, clean sheets, match winners get higher; red cards, conceded goals get lower).
5. Identify the Man of the Match (motmId - match one of the starter ids).
6. Provide a 2-3 sentence post-match press conference quote from the winning manager (or both if draw).
7. Provide a 1-paragraph tactical analysis summarizing the key battle and why it was won/lost.

Respond ONLY with a valid JSON object matching this schema. Do not include markdown code blocks or explanations.
{
  "homeScore": number,
  "awayScore": number,
  "events": [
    {
      "minute": number,
      "type": "Goal" | "Shot Saved" | "Yellow Card" | "Red Card" | "Injury" | "Substitution" | "Penalty" | "VAR Check" | "Big Chance Missed",
      "clubId": string (either "${homeClub.id}" or "${awayClub.id}"),
      "playerName": string,
      "details": string
    }
  ],
  "stats": {
    "possession": { "home": number, "away": number },
    "shots": { "home": number, "away": number },
    "shotsOnTarget": { "home": number, "away": number },
    "corners": { "home": number, "away": number },
    "fouls": { "home": number, "away": number },
    "offsides": { "home": number, "away": number }
  },
  "playerRatings": {
    "player_id": number
  },
  "motmId": string (must match one of the player IDs provided in the lineups),
  "tacticalAnalysis": string,
  "pressQuote": string
}`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 2000,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("AI API Error:", errText);
      throw new Error("Failed to contact AI API");
    }

    const data = await response.json();
    const textResponse = data.content[0].text;
    
    // Parse response
    const jsonStart = textResponse.indexOf("{");
    const jsonEnd = textResponse.lastIndexOf("}");
    if (jsonStart === -1 || jsonEnd === -1) {
      throw new Error("Invalid response format from AI");
    }
    
    const parsedResult = JSON.parse(textResponse.slice(jsonStart, jsonEnd + 1));
    return NextResponse.json(parsedResult);

  } catch (error) {
    console.error("Match Sim API Error, falling back to heuristic:", error);
    // Safe fallback in case of AI network/parse error
    try {
      const body = await req.clone().json();
      const result = simulateMatchHeuristic(
        body.homeClub,
        body.awayClub,
        body.homeSquad,
        body.awaySquad,
        body.homeTactics,
        body.awayTactics,
        body.homeManagerTacticsBonus || 10,
        body.awayManagerTacticsBonus || 10
      );
      return NextResponse.json(result);
    } catch (e) {
      return NextResponse.json({ error: "Simulation failed completely" }, { status: 500 });
    }
  }
}
