import { NextRequest, NextResponse } from "next/server";
import { AI_MODEL, getOpenRouterHeaders, BREAKDOWN_SYSTEM_PROMPT } from "@/lib/claude";

export async function POST(req: NextRequest) {
  try {
    const { task } = await req.json();

    if (!task || typeof task !== "string" || task.trim().length === 0) {
      return NextResponse.json({ error: "Task description is required" }, { status: 400 });
    }

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "API key not configured" }, { status: 500 });
    }

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: getOpenRouterHeaders(),
      body: JSON.stringify({
        model: AI_MODEL,
        max_tokens: 1024,
        messages: [
          { role: "system", content: BREAKDOWN_SYSTEM_PROMPT },
          { role: "user", content: `Break down this task into sub-tasks:\n\n${task.trim()}` },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenRouter API error:", errorText);
      return NextResponse.json(
        { error: "Failed to generate breakdown" },
        { status: response.status }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      return NextResponse.json({ error: "Empty response from AI" }, { status: 500 });
    }

    // Parse the JSON response — strip markdown fences if present
    const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const subTasks = JSON.parse(cleaned);

    return NextResponse.json({ subTasks });
  } catch (error) {
    console.error("Breakdown error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
