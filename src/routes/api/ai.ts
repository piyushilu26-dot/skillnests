import { createFileRoute } from "@tanstack/react-router";

const SITE_CONTEXT = `You are SkillNests AI, a capable general-purpose AI assistant built into SkillNests.in.

SKILLNESTS FACTS (authoritative):
- SkillNests is a student-focused learning platform for practical learning, collaboration, resources, career guidance, MUN material, debate topics, and academic support.
- Piyush Raj is the Founder & CEO of SkillNests.
- Do not invent SkillNests features, people, statistics, or policies.

WHAT YOU SHOULD DO:
- Answer normal general-knowledge questions directly and accurately. You are not limited to SkillNests questions.
- Explain academic concepts step-by-step at the user's level.
- Solve problems when enough information is provided.
- Brainstorm, summarize, compare, write, plan, and tutor.
- Create useful study schedules. If the user gives enough constraints, calculate a realistic schedule. If they only say 'make me a study schedule', create a sensible starter schedule using clearly stated assumptions instead of only asking for more information.
- Use conversation history. If the user says 'that', 'it', 'make it harder', 'continue', etc., resolve the reference from earlier messages.
- If the user asks a current/time-sensitive question, use web search when available and distinguish current information from model knowledge.
- Never claim that you searched the web unless the web-search tool was actually used.

STUDY-SCHEDULE RULES:
- Prefer sustainable study blocks with short breaks.
- Balance new learning, active recall, practice questions, revision, and rest.
- Never suggest extreme or unsafe study routines.
- When details are missing, make reasonable assumptions and label them briefly.
- Return schedules in a clear table or bullet list with times, subjects, tasks, and breaks.

STYLE:
- Be conversational, intelligent, and specific.
- Do not repeat the same generic capability message.
- Do not ask unnecessary follow-up questions when a useful answer can be given immediately.
- For simple questions, answer simply. For complex questions, reason carefully and explain the important steps.
- If you are uncertain, say what is uncertain rather than inventing an answer.`;

function shouldUseWebSearch(message: string) {
  return /\b(today|tonight|yesterday|tomorrow|latest|current|recent|news|2026|this week|this month|right now|who is currently|president of|ceo of)\b/i.test(message);
}

export const Route = createFileRoute("/api/ai")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = (await request.json()) as {
            message?: string;
            sessionSeconds?: number;
            history?: Array<{ role?: "user" | "assistant"; content?: string }>;
          };
          const message = body.message?.trim();
          if (!message) return Response.json({ error: "Message is required" }, { status: 400 });

          const apiKey = process.env.OPENAI_API_KEY;
          if (!apiKey) {
            return Response.json(
              { error: "AI service is not configured. Add OPENAI_API_KEY to the production environment." },
              { status: 503 },
            );
          }

          const sessionSeconds = Math.max(0, Math.floor(body.sessionSeconds || 0));
          const history = (body.history ?? [])
            .filter((item) => item.role && typeof item.content === "string")
            .slice(-12)
            .map((item) => ({
              role: item.role as "user" | "assistant",
              content: [{ type: "input_text", text: item.content as string }],
            }));

          const input = [
            { role: "system", content: [{ type: "input_text", text: SITE_CONTEXT }] },
            ...history,
            {
              role: "user",
              content: [
                {
                  type: "input_text",
                  text: `${message}\n\nThe user's current SkillNests session duration is ${sessionSeconds} seconds. Use this only when relevant.`,
                },
              ],
            },
          ];

          const response = await fetch("https://api.openai.com/v1/responses", {
            method: "POST",
            headers: {
              "content-type": "application/json",
              authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
              model: process.env.OPENAI_MODEL || "gpt-5.6",
              input,
              tools: shouldUseWebSearch(message) ? [{ type: "web_search" }] : undefined,
              max_output_tokens: 1200,
            }),
          });

          if (!response.ok) {
            const details = await response.text();
            console.error("OpenAI request failed", response.status, details);
            return Response.json({ error: "The AI service returned an error. Please try again." }, { status: 502 });
          }

          const data = (await response.json()) as { output_text?: string };
          const answer = data.output_text?.trim();
          if (!answer) {
            return Response.json({ error: "The AI returned an empty response. Please try again." }, { status: 502 });
          }

          return Response.json({ answer, webUsed: shouldUseWebSearch(message) });
        } catch (error) {
          console.error("AI route error", error);
          return Response.json({ error: "Unable to process the AI request." }, { status: 400 });
        }
      },
    },
  },
});
