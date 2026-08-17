import { createFileRoute } from "@tanstack/react-router";

const SITE_CONTEXT = `You are SkillNests AI, the general-purpose AI assistant built into SkillNests.in.

SKILLNESTS FACTS (treat these as authoritative):
- SkillNests is a student-focused learning platform designed around practical learning, collaboration, resources, career guidance, MUN material, and reducing unhealthy academic competition.
- Piyush Raj is the Founder & CEO of SkillNests.
- The founders/team page may contain other co-founders and core team members. Do not invent roles for them.

CAPABILITIES:
- Answer general educational and everyday knowledge questions, not only SkillNests questions.
- Explain concepts, help with homework/studying, brainstorming, writing, planning, and time management.
- Create realistic academic schedules when users provide subjects, available hours, school/coaching timings, priorities, and exam dates.
- Help users understand SkillNests and its features.
- The user can ask how long they have been on SkillNests; the current session duration is supplied separately.

WEB/WIKIPEDIA BEHAVIOUR:
- For general knowledge, use your model knowledge and any supplied external reference information.
- A Wikipedia lookup may be supplied for the user's question. If it is supplied, use it as a reference and clearly distinguish it from your own explanation.
- Do not claim you searched Google or Wikipedia unless the server actually supplied search/reference results.
- For current or time-sensitive facts, say when you cannot verify the latest information rather than pretending it is current.
- Never invent facts about SkillNests. The authoritative SkillNests facts above override general model knowledge.

STYLE:
Be concise, friendly, useful, and actionable. For study planning, encourage sustainable study habits and reasonable breaks; do not recommend extreme or unsafe study routines.`;

async function wikipediaLookup(query: string) {
  try {
    const url = new URL("https://en.wikipedia.org/w/api.php");
    url.searchParams.set("action", "query");
    url.searchParams.set("list", "search");
    url.searchParams.set("srsearch", query.slice(0, 200));
    url.searchParams.set("srlimit", "3");
    url.searchParams.set("format", "json");
    url.searchParams.set("origin", "*");

    const response = await fetch(url, {
      headers: { "user-agent": "SkillNestsAI/1.0 (https://skillnests.in)" },
    });
    if (!response.ok) return "";

    const data = (await response.json()) as {
      query?: { search?: Array<{ title?: string; snippet?: string }> };
    };
    const results = data.query?.search ?? [];
    if (!results.length) return "";

    return results
      .map((item) => `Wikipedia result: ${item.title ?? "Unknown"}\n${(item.snippet ?? "").replace(/<[^>]*>/g, "")}`)
      .join("\n\n");
  } catch {
    return "";
  }
}

export const Route = createFileRoute("/api/ai")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = (await request.json()) as { message?: string; sessionSeconds?: number };
          const message = body.message?.trim();
          if (!message) return Response.json({ error: "Message is required" }, { status: 400 });

          const apiKey = process.env.OPENAI_API_KEY;
          if (!apiKey) {
            return Response.json({ error: "AI service is not configured" }, { status: 503 });
          }

          const sessionSeconds = Math.max(0, Math.floor(body.sessionSeconds || 0));
          const wikipedia = await wikipediaLookup(message);
          const referenceContext = wikipedia
            ? `\n\nOPTIONAL WIKIPEDIA REFERENCE FOR THIS QUESTION:\n${wikipedia}`
            : "";

          const response = await fetch("https://api.openai.com/v1/responses", {
            method: "POST",
            headers: {
              "content-type": "application/json",
              authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
              model: process.env.OPENAI_MODEL || "gpt-5-mini",
              input: [
                { role: "system", content: [{ type: "input_text", text: SITE_CONTEXT }] },
                {
                  role: "user",
                  content: [
                    {
                      type: "input_text",
                      text: `${message}\n\nThe user's current SkillNests session duration is ${sessionSeconds} seconds. Use this only when relevant.${referenceContext}`,
                    },
                  ],
                },
              ],
              max_output_tokens: 900,
            }),
          });

          if (!response.ok) {
            console.error("OpenAI request failed", response.status, await response.text());
            return Response.json({ error: "AI service failed" }, { status: 502 });
          }

          const data = (await response.json()) as { output_text?: string };
          return Response.json({
            answer: data.output_text || "I couldn't generate an answer right now. Please try again.",
            wikipediaUsed: Boolean(wikipedia),
          });
        } catch (error) {
          console.error("AI route error", error);
          return Response.json({ error: "Invalid request" }, { status: 400 });
        }
      },
    },
  },
});
