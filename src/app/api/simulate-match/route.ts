import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      homeTeam,
      awayTeam,
      homeTactics,
      awayTactics,
      managerAttributes,
      homeStarters, // string array of names
      awayStarters, // string array of names
    } = body;

    const prompt = `You are a realistic football (soccer) match simulation engine.
You will simulate a match between ${homeTeam.name} (Home) and ${awayTeam.name} (Away).

Context:
- Home Team OVR: ${homeTeam.overallRating}
- Away Team OVR: ${awayTeam.overallRating}
- Home Tactics: ${homeTactics.mentality} mentality, ${homeTactics.pressIntensity} press
- Away Tactics: ${awayTactics.mentality} mentality, ${awayTactics.pressIntensity} press
- Home Manager Tactical Knowledge: ${managerAttributes?.tactical_knowledge || 10}/20

Available Home Players (ONLY USE THESE NAMES FOR HOME TEAM):
${homeStarters ? homeStarters.join(", ") : "Generic Home Players"}

Available Away Players (ONLY USE THESE NAMES FOR AWAY TEAM):
${awayStarters ? awayStarters.join(", ") : "Generic Away Players"}

Your task is to generate a JSON response representing the match outcome. The JSON MUST follow this schema exactly, and contain NO markdown formatting outside the JSON:

{
  "homeScore": number,
  "awayScore": number,
  "events": [
    {
      "minute": number,
      "type": "Goal" | "Shot Saved" | "Yellow Card" | "Red Card" | "Injury" | "Substitution" | "Penalty" | "VAR Check" | "Big Chance Missed",
      "description": string (e.g., "A stunning volley from outside the box by [PlayerName]."),
      "playerName": string (exact name of the main player involved, e.g., the goalscorer, card recipient, or injured player),
      "assistName": string (optional, exact name of the assisting player for a Goal event)
    }
  ],
  "playerRatings": {
    "[Player ID or Name]": number (0.0 to 10.0, e.g. 7.5)
  },
  "motm": string (name of Man of the Match),
  "postMatchQuote": string (2-3 sentences from the manager),
  "tacticalAnalysis": string (a short paragraph analyzing why the result happened based on the tactics and OVR)
}

Rules:
1. Generate between 8 and 12 events.
2. The final scores MUST perfectly match the sum of "Goal" events for each team. (If homeScore is 2, there must be exactly 2 "Goal" events for the home team).
3. The match should be realistic based on the OVR ratings and home advantage.
4. CRITICAL: For goals, assists, yellow cards, red cards, injuries, and the MOTM, you MUST ONLY use exact player names from the 'Available Home Players' or 'Available Away Players' lists above. DO NOT make up random names.
5. In your event "description", you may mention "Assisted by [Exact Name]". This is highly encouraged for realism.
6. Output RAW JSON ONLY. No markdown code blocks, no backticks.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error("No text returned from Gemini");
    }

    const data = JSON.parse(text);
    return NextResponse.json(data);

  } catch (error: any) {
    console.error("Match Simulation Error:", error);
    return NextResponse.json(
      { error: "Failed to simulate match", details: error.message },
      { status: 500 }
    );
  }
}
