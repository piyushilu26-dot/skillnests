import { createFileRoute } from "@tanstack/react-router";

const SITE_CONTEXT = `You are SkillNests AI, a capable general-purpose AI assistant built into SkillNests.in.

SKILLNESTS FACTS (authoritative):
- SkillNests is a student-focused learning platform for practical learning, collaboration, resources, career guidance, MUN material, debate topics, and academic support.
- Piyush Raj is the Founder & CEO of SkillNests.
- Do not invent SkillNests features, people, statistics, or policies.

BEHAVIOR:
- Answer normal general-knowledge, academic, maths, science, writing, planning, and SkillNests questions.
- Treat the supplied conversation history as one continuous conversation. Resolve references such as "it", "that", "this", "the second one", "why?", "explain more", and "what about X?" using the previous turns.
- Do not restart the conversation or repeat a generic introduction on follow-up questions.
- For arithmetic, calculate the answer carefully and show concise working when useful.
- Create useful study schedules when asked. If details are missing, make reasonable assumptions and state them briefly.
- For current/time-sensitive questions, use web search when available.
- Never claim to have searched the web unless the web-search tool was actually used.

STYLE:
- Be conversational, intelligent, direct, and specific.
- Answer simple questions simply; explain complex questions clearly.
- Do not ask unnecessary follow-up questions when a useful answer can be given immediately.
- If uncertain, say what is uncertain instead of inventing an answer.`;

function shouldUseWebSearch(message: string) {
  return /\b(today|tonight|yesterday|tomorrow|latest|current|recent|news|2026|this week|this month|right now|who is currently|president of|ceo of)\b/i.test(message);
}

function calculateArithmetic(message: string): string | null {
  const match = message
    .trim()
    .match(/^(?:what is|calculate|solve|evaluate|compute)?\s*([0-9][0-9.\s]*(?:[+\-*/^%][0-9.\s]+)+[0-9.]?)\s*\??$/i);
  if (!match) return null;

  const expression = match[1].replace(/\s+/g, "");
  if (!/[+\-*/^%]/.test(expression) || !/^[0-9.+\-*/^%()]+$/.test(expression)) return null;

  const tokens = expression.match(/\d*\.?\d+|[+\-*/^%()]/g);
  if (!tokens) return null;

  const values: number[] = [];
  const operators: string[] = [];
  const precedence: Record<string, number> = { "+": 1, "-": 1, "*": 2, "/": 2, "%": 2, "^": 3 };

  const apply = () => {
    const op = operators.pop();
    if (!op) throw new Error("operator");
    const b = values.pop();
    const a = values.pop();
    if (a === undefined || b === undefined) throw new Error("operand");
    if (op === "+") values.push(a + b);
    else if (op === "-") values.push(a - b);
    else if (op === "*") values.push(a * b);
    else if (op === "/") {
      if (b === 0) throw new Error("division by zero");
      values.push(a / b);
    } else if (op === "%") values.push(a % b);
    else if (op === "^") values.push(a ** b);
  };

  try {
    let expectValue = true;
    for (const token of tokens) {
      if (/^\d/.test(token)) {
        values.push(Number(token));
        expectValue = false;
      } else if (token === "(") {
        operators.push(token);
        expectValue = true;
      } else if (token === ")") {
        while (operators.at(-1) && operators.at(-1) !== "(") apply();
        if (operators.pop() !== "(") throw new Error("parenthesis");
        expectValue = false;
      } else {
        if (expectValue && token === "-") values.push(0);
        while (
          operators.at(-1) &&
          operators.at(-1) !== "(" &&
          precedence[operators.at(-1)] >= precedence[token]
        ) apply();
        operators.push(token);
        expectValue = true;
      }
    }
    while (operators.length) {
      if (operators.at(-1) === "(") throw new Error("parenthesis");
      apply();
    }
    if (values.length !== 1 || !Number.isFinite(values[0])) return null;
    return `**Answer: ${Number.isInteger(values[0]) ? values[0] : Number(values[0].toFixed(10))}**`;
  } catch {
    return null;
  }
}

function localFallback(message: string, history: Array<{ role?: "user" | "assistant"; content?: string }>) {
  const arithmetic = calculateArithmetic(message);
  if (arithmetic) return arithmetic;

  const normalized = message.trim().toLowerCase();
  const answers: Record<string, string> = {
    "what is the capital of india?": "The capital of India is **New Delhi**.",
    "what is the capital of australia?": "The capital of Australia is **Canberra**.",
    "who is the founder of skillnests?": "**Piyush Raj** is the Founder & CEO of SkillNests.",
    "who is the ceo of skillnests?": "**Piyush Raj** is the Founder & CEO of SkillNests.",
    "what can i do on skillnests?": "SkillNests brings together academic resources, career guidance, MUN and debate material, meetings, schedules, and student-focused learning tools.",
  };
  if (answers[normalized]) return answers[normalized];

  if (/^(why|how|what about|and|then|explain|tell me more)\b/i.test(message) && history.length) {
    const previous = [...history].reverse().find((item) => item.role === "user" && item.content)?.content;
    if (previous) {
      return `I remember your previous question: **${previous}**. The AI service is currently unavailable, so I can't reliably answer that follow-up yet. Please try again after the AI service is connected.`;
    }
  }

  return null;
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

          const history = (body.history ?? [])
            .filter((item) => (item.role === "user" || item.role === "assistant") && typeof item.content === "string")
            .slice(-12);

          const apiKey = process.env.OPENAI_API_KEY;
          if (!apiKey) {
            const fallback = localFallback(message, history);
            if (fallback) return Response.json({ answer: fallback, fallback: true });
            return Response.json({ error: "AI service is not configured." }, { status: 503 });
          }

          const sessionSeconds = Math.max(0, Math.floor(body.sessionSeconds || 0));
          const input = [
            ...history.map((item) => ({
              role: item.role as "user" | "assistant",
              content: [{ type: "input_text", text: item.content as string }],
            })),
            {
              role: "user" as const,
              content: [
                {
                  type: "input_text" as const,
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
              instructions: SITE_CONTEXT,
              input,
              tools: shouldUseWebSearch(message) ? [{ type: "web_search" }] : undefined,
              max_output_tokens: 1200,
            }),
          });

          if (!response.ok) {
            const details = await response.text();
            console.error("OpenAI request failed", response.status, details);
            const fallback = localFallback(message, history);
            if (fallback) return Response.json({ answer: fallback, fallback: true });
            return Response.json({ error: "The AI service returned an error. Please try again." }, { status: 502 });
          }

          const data = (await response.json()) as {
            output_text?: string;
            output?: Array<{ type?: string; content?: Array<{ type?: string; text?: string }> }>;
          };
          const answer =
            data.output_text?.trim() ||
            data.output
              ?.filter((item) => item.type === "message")
              .flatMap((item) => item.content ?? [])
              .filter((part) => part.type === "output_text" && part.text)
              .map((part) => part.text)
              .join("\n")
              .trim();

          if (!answer) {
            const fallback = localFallback(message, history);
            if (fallback) return Response.json({ answer: fallback, fallback: true });
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
