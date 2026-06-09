import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(req: Request) {
  try {
    const { clubName, reputation } = await req.json();

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ 
        sponsors: [
          { id: `sp_${Date.now()}_1`, name: "Global Air", type: "Kit", valuePerWeek: 500000, remainingWeeks: 38 },
          { id: `sp_${Date.now()}_2`, name: "TechCorp", type: "Sleeve", valuePerWeek: 150000, remainingWeeks: 38 },
          { id: `sp_${Date.now()}_3`, name: "BetFast", type: "Stadium", valuePerWeek: 800000, remainingWeeks: 76 }
        ]
      });
    }

    const prompt = `Generate 3 realistic, fictional corporate sponsorship offers for a football club named "${clubName}" with a reputation score of ${reputation}/100.
    
    The sponsors should be from different industries (e.g. Airlines, Tech, Automotive, Finance, Betting).
    They must be "Kit", "Sleeve", or "Stadium" type.
    Value should scale realistically with the club's reputation (a 90+ rep club should get multi-million euro deals, a 50 rep club should get 10k-50k deals per week).
    Duration should be between 38 and 114 weeks (1-3 seasons).
    
    Return exactly a JSON array of objects with these keys: name (string), type (string: "Kit", "Sleeve", or "Stadium"), valuePerWeek (number in euros), remainingWeeks (number).
    Do NOT return markdown formatting, ONLY the raw JSON array.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    let textResponse = response.text || "[]";
    textResponse = textResponse.replace(/```json/g, '').replace(/```/g, '').trim();

    const sponsors = JSON.parse(textResponse);
    
    const formattedSponsors = sponsors.map((s: any, i: number) => ({
      id: `sp_${Date.now()}_${i}`,
      name: s.name,
      type: s.type,
      valuePerWeek: s.valuePerWeek,
      remainingWeeks: s.remainingWeeks
    }));

    return NextResponse.json({ sponsors: formattedSponsors });

  } catch (error) {
    console.error("Sponsors API Error:", error);
    return NextResponse.json({ 
      sponsors: [
        { id: "sp_fallback_1", name: "Global Finance", type: "Kit", valuePerWeek: 250000, remainingWeeks: 38 }
      ]
    });
  }
}
