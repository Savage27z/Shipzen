import { NextRequest, NextResponse } from "next/server";
import { CLAUDE_MODEL, getAnthropicHeaders, NUDGE_SYSTEM_PROMPT } from "@/lib/claude";

export async function POST(req: NextRequest) {
  try {
    const { context } = await req.json();

    if (!context) {
      return NextResponse.json({ error: "Context is required" }, { status: 400 });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "API key not configured" }, { status: 500 });
    }

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: getAnthropicHeaders(),
      body: JSON.stringify({
        model: CLAUDE_MODEL,
        max_tokens: 256,
        system: NUDGE_SYSTEM_PROMPT,
        messages: [
          {
            role: "user",
            content: `Based on this developer's current work data, give them a contextual nudge:\n\n${context}`,
          },
        ],
      }),
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to generate nudge" },
        { status: response.status }
      );
    }

    const data = await response.json();
    const content = data.content?.[0]?.text;

    if (!content) {
      return NextResponse.json({ error: "Empty response" }, { status: 500 });
    }

    const nudge = JSON.parse(content);
    return NextResponse.json(nudge);
  } catch (error) {
    console.error("Nudge error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
