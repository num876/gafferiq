import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { intent, homeClubName, awayClubName, homeScore, awayScore, isHome } = await req.json();

    const apiKey = process.env.ANTHROPIC_API_KEY;

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

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-3-haiku-20240307",
        max_tokens: 60,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to contact Claude API");
    }

    const data = await response.json();
    let textResponse = data.content[0].text.trim();
    textResponse = textResponse.replace(/^["']|["']$/g, '');

    return NextResponse.json({ message: textResponse });

  } catch (error) {
    console.error("Team Talk API Error:", error);
    return NextResponse.json({ message: "Keep your shape and stick to the plan!" });
  }
}
