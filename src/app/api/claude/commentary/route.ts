import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { matchState, homeClubName, awayClubName } = await req.json();

    const apiKey = process.env.ANTHROPIC_API_KEY;

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

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-3-haiku-20240307", // Using Haiku for speed and lower cost on rapid ticker calls
        max_tokens: 50,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to contact Claude API");
    }

    const data = await response.json();
    let textResponse = data.content[0].text.trim();
    
    // Remove surrounding quotes if Claude added them
    textResponse = textResponse.replace(/^["']|["']$/g, '');

    return NextResponse.json({ commentary: textResponse });

  } catch (error) {
    console.error("Commentary API Error:", error);
    return NextResponse.json({ commentary: "Play resumes in the center of the park." });
  }
}
