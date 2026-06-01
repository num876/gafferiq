/* eslint-disable */
import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(req: Request) {
  try {
    const { intent, homeClubName, awayClubName, homeScore, awayScore, isHome } = await req.json();

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ 
        message: "Come on lads, dig deep! We need more intensity out there." 
      });
    }

    const currentTeamName = isHome ? homeClubName : awayClubName;
    const opponentName = isHome ? awayClubName : homeClubName;
    const ourScore = isHome ? homeScore : awayScore;
    const theirScore = isHome ? awayScore : homeScore;

    const prompt = `You are the football manager of ${currentTeamName}.
You are giving a live touchline team talk to your players during a match against ${opponentName}.
The current score is ${ourScore} - ${theirScore}.
Your chosen tactical shout intent is: "${intent}".

Generate exactly ONE or TWO short sentences (max 25 words total) of authentic, motivational, or demanding touchline shouting from a football manager. Do not use quotes.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    let textResponse = response.text || "Keep your shape and stick to the plan!";
    textResponse = textResponse.trim().replace(/^["']|["']$/g, '');

    return NextResponse.json({ message: textResponse });

  } catch (error) {
    console.error("Team Talk API Error:", error);
    return NextResponse.json({ message: "Keep your shape and stick to the plan!" });
  }
}
