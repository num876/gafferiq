import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { matchState, homeClub, awayClub, motmName } = await req.json();

    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ 
        report: `A hard-fought match at ${homeClub.stadium} ended ${matchState.homeScore}-${matchState.awayScore}. Both teams had their moments, but ultimately the scoreline reflects a competitive 90 minutes. \n\n${motmName} was named Man of the Match for an outstanding individual performance.` 
      });
    }

    const prompt = `You are an expert football journalist for a premium sports outlet.
Write a 3-paragraph post-match report summarizing the following football match:
Home: ${homeClub.name} (${matchState.homeScore})
Away: ${awayClub.name} (${matchState.awayScore})
Possession: ${matchState.stats.possession.home}% - ${matchState.stats.possession.away}%
Shots: ${matchState.stats.shots.home} - ${matchState.stats.shots.away}
Key Events: ${JSON.stringify(matchState.events.filter((e: any) => e.type === "Goal" || e.type === "Red Card"))}
Man of the Match: ${motmName}

Paragraph 1: Summary of the result and overall feel of the game.
Paragraph 2: Breakdown of the key moments or goals.
Paragraph 3: Conclusion on what this means for the teams, highlighting the MOTM.

Do not use introductory phrases like "Here is the report". Just return the 3 paragraphs formatted with double newlines between them.`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-3-5-sonnet-20241022", // Use Sonnet for the long-form report
        max_tokens: 500,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to contact Claude API");
    }

    const data = await response.json();
    const textResponse = data.content[0].text.trim();

    return NextResponse.json({ report: textResponse });

  } catch (error) {
    console.error("Report API Error:", error);
    return NextResponse.json({ 
      report: `The match concluded with a scoreline of ${error}. It was a tactical battle.` 
    });
  }
}
