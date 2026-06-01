/* eslint-disable */
import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(req: Request) {
  try {
    const { matchState, homeClubName, awayClubName } = await req.json();

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      // Graceful fallback procedural commentary
      const zones = ["in midfield", "deep in their own half", "attacking dangerously"];
      const randZone = zones[Math.floor(Math.random() * zones.length)];
      return NextResponse.json({ 
        commentary: `${matchState.clock}' - The ball is ${randZone} as the tension builds.` 
      });
    }

    const prompt = `You are a live football commentator. 
The match is currently in minute ${matchState.clock}.
Score: ${homeClubName} ${matchState.homeScore} - ${matchState.awayScore} ${awayClubName}.
Recent events: ${JSON.stringify(matchState.events.slice(0, 2))}.
Ball is in zone: ${matchState.currentZone}.

Provide exactly ONE short sentence (max 15 words) of live, punchy, ticker-style match commentary. Do not use quotes or prefixes.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    let textResponse = response.text || "Play resumes in the center of the park.";
    textResponse = textResponse.trim().replace(/^["']|["']$/g, '');

    return NextResponse.json({ commentary: textResponse });

  } catch (error) {
    console.error("Commentary API Error:", error);
    return NextResponse.json({ commentary: "Play resumes in the center of the park." });
  }
}
