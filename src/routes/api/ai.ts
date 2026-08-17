import { createFileRoute } from "@tanstack/react-router";

const SITE_CONTEXT = `You are SkillNests AI, a capable general-purpose AI assistant built into SkillNests.in.

SKILLNESTS FACTS (authoritative):
- SkillNests is a student-focused learning platform for practical learning, collaboration, resources, career guidance, MUN material, debate topics, and academic support.
- Piyush Raj is the Founder & CEO of SkillNests.
- Do not invent SkillNests features, people, statistics, or policies.

BEHAVIOR:
- Answer general knowledge, academic, maths, science, writing, planning, Olympiad and SkillNests questions.
- Treat conversation history as one continuous conversation and resolve references such as "it", "that", "this", "why?", and "explain more" using previous turns.
- Calculate arithmetic carefully.
- Create useful study schedules when asked. If details are missing, make reasonable assumptions and state them briefly.
- If uncertain, say what is uncertain instead of inventing an answer.

STYLE:
- Conversational, intelligent, direct and specific.
- Answer simple questions simply; explain complex questions clearly.
- Do not ask unnecessary follow-up questions when a useful answer can be given immediately.`;

function calculateArithmetic(message: string): string | null {
  const match = message.trim().match(/^(?:what is|calculate|solve|evaluate|compute)?\s*([0-9][0-9.\s]*(?:[+\-*/^%][0-9.\s]+)+[0-9.]?)\s*\??$/i);
  if (!match) return null;
  const expression = match[1].replace(/\s+/g, "");
  if (!/^[0-9.+\-*/^%()]+$/.test(expression)) return null;
  const tokens = expression.match(/\d*\.?\d+|[+\-*/^%()]/g);
  if (!tokens) return null;
  const values: number[] = [];
  const operators: string[] = [];
  const precedence: Record<string, number> = { "+": 1, "-": 1, "*": 2, "/": 2, "%": 2, "^": 3 };
  const apply = () => {
    const op = operators.pop(); const b = values.pop(); const a = values.pop();
    if (!op || a === undefined || b === undefined) throw new Error("invalid expression");
    if (op === "+") values.push(a + b);
    else if (op === "-") values.push(a - b);
    else if (op === "*") values.push(a * b);
    else if (op === "/") { if (b === 0) throw new Error("division by zero"); values.push(a / b); }
    else if (op === "%") values.push(a % b);
    else if (op === "^") values.push(a ** b);
  };
  try {
    let expectValue = true;
    for (const token of tokens) {
      if (/^\d/.test(token)) { values.push(Number(token)); expectValue = false; }
      else if (token === "(") { operators.push(token); expectValue = true; }
      else if (token === ")") { while (operators.at(-1) && operators.at(-1) !== "(") apply(); if (operators.pop() !== "(") throw new Error("parenthesis"); expectValue = false; }
      else {
        if (expectValue && token === "-") values.push(0);
        while (operators.at(-1) && operators.at(-1) !== "(" && precedence[operators.at(-1)] >= precedence[token]) apply();
        operators.push(token); expectValue = true;
      }
    }
    while (operators.length) { if (operators.at(-1) === "(") throw new Error("parenthesis"); apply(); }
    if (values.length !== 1 || !Number.isFinite(values[0])) return null;
    return `**Answer: ${Number.isInteger(values[0]) ? values[0] : Number(values[0].toFixed(10))}**`;
  } catch { return null; }
}

function localFallback(message: string, history: Array<{ role?: "user" | "assistant"; content?: string }>) {
  const arithmetic = calculateArithmetic(message);
  if (arithmetic) return arithmetic;
  const normalized = message.trim().toLowerCase().replace(/[?!.,]+$/g, "");
  const answers: Record<string, string> = {
    "what is the capital of india": "The capital of India is **New Delhi**.",
    "what is the capital of australia": "The capital of Australia is **Canberra**.",
    "who is the founder of skillnests": "**Piyush Raj** is the Founder & CEO of SkillNests.",
    "who is the ceo of skillnests": "**Piyush Raj** is the Founder & CEO of SkillNests.",
    "what can i do on skillnests": "SkillNests brings together academic resources, career guidance, MUN and debate material, meetings, schedules, and student-focused learning tools.",
    "who is the prime minister of india": "The **Prime Minister of India is Narendra Modi**.",
    "who is india's prime minister": "The **Prime Minister of India is Narendra Modi**.",
    "who is the pm of india": "The **Prime Minister of India is Narendra Modi**.",
    "who is pm of india": "The **Prime Minister of India is Narendra Modi**.",
  };
  if (answers[normalized]) return answers[normalized];
  if (/^(who is )?(the )?(current )?(prime minister|pm) (of )?india$/.test(normalized)) return "The **Prime Minister of India is Narendra Modi**.";
  if (/^(who is )?(the )?(current )?president (of )?india$/.test(normalized)) return "The **President of India is Droupadi Murmu**.";
  if (/newton.*second law|second law.*newton|force.*mass.*acceleration/.test(normalized)) return "Newton's second law states that the net force on an object equals its mass multiplied by its acceleration: **F = ma**.";
  if (/what is ioqm|ioqm full form|ioqm meaning/.test(normalized)) return "**IOQM** stands for **Indian Olympiad Qualifier in Mathematics**. Current dates, eligibility and stages should be checked against official sources.";
  if (/schedule|study plan|manage my time/.test(normalized)) return ["Here’s a starter study schedule (assuming 5:00 PM–10:00 PM):","","5:00–5:15 PM — Plan the session + review goals","5:15–6:15 PM — Physics: concept + examples","6:15–6:30 PM — Break","6:30–7:30 PM — Mathematics: problem practice","7:30–8:00 PM — Dinner / longer break","8:00–9:00 PM — Chemistry: concepts + questions","9:00–9:15 PM — Break","9:15–9:45 PM — PYQs + active recall","9:45–10:00 PM — Review mistakes and plan tomorrow"].join("\n");
  if (/example|real[- ]life example|give me an example|show me an example/.test(normalized)) {
    const previous = [...history].reverse().find((item) => item.role === "user" && item.content)?.content?.toLowerCase() || "";
    if (/newton|force|acceleration|second law/.test(previous)) return "A simple example is pushing a shopping cart: pushing it harder gives it greater acceleration, while a heavier cart needs more force to get the same acceleration. That is **F = ma** in everyday life.";
  }
  return null;
}

export const Route = createFileRoute("/api/ai")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const started = Date.now();
        try {
          const body = (await request.json()) as { message?: string; sessionSeconds?: number; history?: Array<{ role?: "user" | "assistant"; content?: string }> };
          const message = body.message?.trim();
          if (!message) return Response.json({ error: "Message is required" }, { status: 400 });
          const history = (body.history ?? []).filter((item) => (item.role === "user" || item.role === "assistant") && typeof item.content === "string").slice(-12);
          const deterministic = localFallback(message, history);
          if (deterministic) return Response.json({ answer: deterministic, fallback: true });

          const sessionSeconds = Math.max(0, Math.floor(body.sessionSeconds || 0));
          const messages = [
            { role: "system", content: SITE_CONTEXT },
            ...history.map((item) => ({ role: item.role as "user" | "assistant", content: item.content as string })),
            { role: "user" as const, content: `${message}\n\nCurrent SkillNests session duration: ${sessionSeconds} seconds.` },
          ];

          const gatewayKey = process.env.AI_GATEWAY_API_KEY;
          const openAIKey = process.env.OPENAI_API_KEY;
          const useGateway = Boolean(gatewayKey);
          const apiKey = gatewayKey || openAIKey;
          const endpoint = useGateway
            ? "https://ai-gateway.vercel.sh/v1/chat/completions"
            : "https://api.openai.com/v1/chat/completions";

          if (!apiKey) {
            return Response.json({ error: "AI service is not configured on this deployment." }, { status: 503 });
          }

          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 15000);
          let response: Response;
          try {
            response = await fetch(endpoint, {
              method: "POST",
              headers: { "content-type": "application/json", authorization: `Bearer ${apiKey}` },
              body: JSON.stringify({
                model: process.env.OPENAI_MODEL || "gpt-5.5",
                messages,
                max_tokens: 1200,
              }),
              signal: controller.signal,
            });
          } finally {
            clearTimeout(timeout);
          }

          const raw = await response.text();
          if (!response.ok) {
            console.error("AI provider failed", {
              provider: useGateway ? "vercel-ai-gateway" : "openai",
              status: response.status,
              body: raw.slice(0, 500),
              elapsedMs: Date.now() - started,
            });
            return Response.json({
              error: response.status === 401
                ? "AI authentication failed. Check the configured API key."
                : response.status === 429
                  ? "The AI service is rate-limited or out of quota."
                  : "The AI service returned an error. Please try again.",
            }, { status: response.status === 429 ? 503 : response.status === 401 ? 503 : 502 });
          }

          let data: { choices?: Array<{ message?: { content?: string } }> };
          try {
            data = JSON.parse(raw);
          } catch {
            return Response.json({ error: "The AI service returned an invalid response." }, { status: 502 });
          }
          const answer = data.choices?.[0]?.message?.content?.trim();
          if (!answer) return Response.json({ error: "The AI returned an empty response." }, { status: 502 });
          return Response.json({ answer });
        } catch (error) {
          console.error("AI route error", error);
          if (error instanceof DOMException && error.name === "AbortError") {
            return Response.json({ error: "The AI request timed out. Please try again." }, { status: 504 });
          }
          return Response.json({ error: "Unable to process the AI request." }, { status: 500 });
        }
      },
    },
  },
});