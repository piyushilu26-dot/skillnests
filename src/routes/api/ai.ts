import { createFileRoute } from "@tanstack/react-router";

const SITE_CONTEXT = `You are SkillNests AI, the study and website assistant for SkillNests.in. SkillNests is a student-focused learning platform designed around practical learning, collaboration, resources, career guidance, MUN material, and reducing unhealthy academic competition. Help users understand SkillNests and manage their academic time. You may create realistic study schedules when users provide subjects, available hours, school/coaching timings, priorities, and exam dates. Encourage sustainable study habits and reasonable breaks; do not recommend extreme or unsafe study routines. If a user asks about a feature you cannot verify, say you are not certain rather than inventing it. Keep answers concise, friendly, and actionable.`;

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
                { role: "user", content: [{ type: "input_text", text: `${message}\n\nThe user's current SkillNests session duration is ${sessionSeconds} seconds. Use this only when relevant.` }] },
              ],
              max_output_tokens: 700,
            }),
          });

          if (!response.ok) {
            console.error("OpenAI request failed", response.status, await response.text());
            return Response.json({ error: "AI service failed" }, { status: 502 });
          }

          const data = (await response.json()) as { output_text?: string };
          return Response.json({ answer: data.output_text || "I couldn't generate an answer right now. Please try again." });
        } catch (error) {
          console.error("AI route error", error);
          return Response.json({ error: "Invalid request" }, { status: 400 });
        }
      },
    },
  },
});
