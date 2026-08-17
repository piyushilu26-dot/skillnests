import { createFileRoute } from "@tanstack/react-router";

const SITE_CONTEXT = `You are SkillNests AI, a capable general-purpose AI assistant built into SkillNests.in.

SKILLNESTS FACTS (authoritative):
- SkillNests is a student-focused learning platform for practical learning, collaboration, resources, career guidance, MUN material, debate topics, and academic support.
- Piyush Raj is the Founder & CEO of SkillNests.
- Do not invent SkillNests features, people, statistics, or policies.

OLYMPIAD KNOWLEDGE:
- Understand Indian Olympiad and competitive-exam terminology, especially IOQM, IMO, IOM, NSEJS, NSEP, NSEC, NSEB, NSEA, INO/Indian National Olympiads, IAPT and HBCSE.
- Explain abbreviations when first used and distinguish mathematics and science pathways.
- Current rules, dates, eligibility, fees and qualification criteria are time-sensitive. Use web search when needed and never guess a current rule.

WORLD GENERAL KNOWLEDGE:
- Answer basic GK about countries worldwide: capitals, currencies, flags, continents, geography, history, government systems, science, economics and major institutions.
- For current office-holders, use web search when the answer may have changed. Never guess a current leader.

CURRENT NEWS:
- For today's news, daily newspaper summaries, current affairs, recent events, elections, appointments, wars, scientific developments or sports results, use web search.
- Never claim to have searched the web unless the tool was actually used.

BEHAVIOR:
- Answer normal general-knowledge, academic, maths, science, writing, planning, Olympiad, current-affairs and SkillNests questions.
- Treat conversation history as one continuous conversation and resolve references such as "it", "that", "this", "why?", "explain more" and "what about X?" using previous turns.
- Do not restart the conversation or repeat generic introductions.
- Calculate arithmetic carefully.
- Create useful study schedules when asked. If details are missing, make reasonable assumptions and state them briefly.
- If uncertain, say what is uncertain instead of inventing an answer.

STYLE:
- Conversational, intelligent, direct and specific.
- Answer simple questions simply; explain complex questions clearly.
- Do not ask unnecessary follow-up questions when a useful answer can be given immediately.`;

function shouldUseWebSearch(message: string) {
  return /\b(today|tonight|yesterday|tomorrow|latest|current|recent|news|headlines?|newspaper|daily newspaper|2026|this week|this month|right now|who is currently|president of|prime minister of|pm of|president|prime minister|leader of|head of state|head of government|election|elected|appointed|olympiad dates|olympiad eligibility|ioqm|nsejs|nsep|nsec|nseb|nsea|ino|iapt|hbcs?e)\b/i.test(message);
}

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
    const op = operators.pop();
    const b = values.pop();
    const a = values.pop();
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
    "india prime minister": "The **Prime Minister of India is Narendra Modi**.",
  };
  if (answers[normalized]) return answers[normalized];
  if (/^(who is )?(the )?(current )?(prime minister|pm) (of )?india$/.test(normalized)) return "The **Prime Minister of India is Narendra Modi**.";
  if (/^(who is )?(the )?(current )?president (of )?india$/.test(normalized)) return "The **President of India is Droupadi Murmu**.";
  if (/newton.*second law|second law.*newton|force.*mass.*acceleration/.test(normalized)) return "Newton's second law states that the net force on an object equals its mass multiplied by its acceleration: **F = ma**.";
  if (/what is ioqm|ioqm full form|ioqm meaning/.test(normalized)) return "**IOQM** stands for **Indian Olympiad Qualifier in Mathematics**. Current dates, eligibility and stages should be checked against the latest official sources.";
  if (/nsejs|nsep|nsec|nseb|nsea/.test(normalized)) return "**NSEJS, NSEP, NSEC, NSEB and NSEA** are National Standard Examination terms used in India's science-competition ecosystem. I can explain their full forms, subjects, eligibility, stages and preparation; current rules should be verified from official sources.";
  if (/example|real[- ]life example|give me an example|show me an example/.test(normalized)) {
    const previous = [...history].reverse().find((item) => item.role === "user" && item.content)?.content?.toLowerCase() || "";
    const previousAssistant = [...history].reverse().find((item) => item.role === "assistant" && item.content)?.content || "";
    if (/newton|force|acceleration|second law/.test(previous) || /newton|force|acceleration|f = ma/.test(previousAssistant.toLowerCase())) return "A simple example is pushing a shopping cart: pushing it harder gives it greater acceleration, while a heavier cart needs more force to get the same acceleration. That is **F = ma** in everyday life.";
    if (previousAssistant) return `Here is a practical example related to the previous answer: ${previousAssistant}`;
  }
  if (/explain.*easier|make.*easier|simpler|simple terms|explain that/.test(normalized)) {
    const previous = [...history].reverse().find((item) => item.role === "assistant" && item.content)?.content || "";
    if (/newton|force|acceleration|f = ma/.test(previous.toLowerCase())) return "Think of it like this: push a light cart and it speeds up easily; push a heavy cart with the same force and it speeds up less. More force means more acceleration, and more mass means less acceleration for the same force.";
    if (previous) return `In simpler terms: ${previous}`;
  }
  if (/schedule|study plan|manage my time/.test(normalized)) return ["Here’s a starter study schedule (assuming 5:00 PM–10:00 PM):","","5:00–5:15 PM — Plan the session + review goals","5:15–6:15 PM — Physics: concept + examples","6:15–6:30 PM — Break","6:30–7:30 PM — Mathematics: problem practice","7:30–8:00 PM — Dinner / longer break","8:00–9:00 PM — Chemistry: concepts + questions","9:00–9:15 PM — Break","9:15–9:45 PM — PYQs + active recall","9:45–10:00 PM — Review mistakes and plan tomorrow"].join("\n");
  if (/skillnests|website|what can i do/.test(normalized)) return "SkillNests is a student-focused learning platform with academic resources, PYQs, notes, MUN & debate material, career guidance, meetings, schedules, skill sharing, and SkillNests AI.";
  return null;
}

export const Route = createFileRoute("/api/ai")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = (await request.json()) as { message?: string; sessionSeconds?: number; history?: Array<{ role?: "user" | "assistant"; content?: string }> };
          const message = body.message?.trim();
          if (!message) return Response.json({ error: "Message is required" }, { status: 400 });
          const history = (body.history ?? []).filter((item) => (item.role === "user" || item.role === "assistant") && typeof item.content === "string").slice(-20);
          const deterministic = localFallback(message, history);
          if (deterministic && /prime minister|pm of india|president.*india|capital of india|capital of australia|founder of skillnests|ceo of skillnests|newton.*second law|second law.*newton|ioqm|nsejs|nsep|nsec|nseb|nsea|^\s*(what is|calculate|solve|evaluate|compute)?\s*[0-9]/i.test(message)) return Response.json({ answer: deterministic, fallback: true, webUsed: false });

          // On Vercel, AI Gateway can authenticate with the deployment's OIDC token.
          // Keep AI_GATEWAY_API_KEY as the local-development fallback.
          const gatewayToken = process.env.AI_GATEWAY_API_KEY || process.env.VERCEL_OIDC_TOKEN || process.env.OPENAI_API_KEY;
          if (!gatewayToken) {
            if (deterministic) return Response.json({ answer: deterministic, fallback: true });
            return Response.json({ error: "AI service is not configured. Add AI_GATEWAY_API_KEY or enable Vercel OIDC for the deployment." }, { status: 503 });
          }

          const sessionSeconds = Math.max(0, Math.floor(body.sessionSeconds || 0));
          const input = [
            ...history.map((item) => ({ role: item.role as "user" | "assistant", content: item.content as string })),
            { role: "user" as const, content: `${message}\n\nThe user's current SkillNests session duration is ${sessionSeconds} seconds. Use this only when relevant.` },
          ];

          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 25000);
          let response: Response;
          try {
            response = await fetch("https://ai-gateway.vercel.sh/v1/responses", {
              method: "POST",
              headers: { "content-type": "application/json", authorization: `Bearer ${gatewayToken}` },
              body: JSON.stringify({ model: process.env.OPENAI_MODEL || "openai/gpt-5.6-sol", instructions: SITE_CONTEXT, input, tools: shouldUseWebSearch(message) ? [{ type: "web_search" }] : undefined, max_output_tokens: 1400 }),
              signal: controller.signal,
            });
          } finally {
            clearTimeout(timeout);
          }

          if (!response.ok) {
            const details = await response.text();
            console.error("AI Gateway request failed", response.status, details);
            if (deterministic) return Response.json({ answer: deterministic, fallback: true });
            if (response.status === 401) return Response.json({ error: "AI Gateway authentication is not configured. Add AI_GATEWAY_API_KEY or enable Vercel OIDC." }, { status: 503 });
            if (response.status === 429) return Response.json({ error: "The AI service is out of quota or rate-limited. Please try again later." }, { status: 503 });
            return Response.json({ error: "The AI service returned an error. Please try again." }, { status: 502 });
          }

          const data = (await response.json()) as { output_text?: string; output?: Array<{ type?: string; content?: Array<{ type?: string; text?: string }> }> };
          const answer = data.output_text?.trim() || data.output?.filter((item) => item.type === "message").flatMap((item) => item.content ?? []).filter((part) => part.type === "output_text" && part.text).map((part) => part.text).join("\n").trim();
          if (!answer) {
            if (deterministic) return Response.json({ answer: deterministic, fallback: true });
            return Response.json({ error: "The AI returned an empty response. Please try again." }, { status: 502 });
          }
          return Response.json({ answer, webUsed: shouldUseWebSearch(message) });
        } catch (error) {
          console.error("AI route error", error);
          if (error instanceof DOMException && error.name === "AbortError") return Response.json({ error: "The AI request timed out. Please try again." }, { status: 504 });
          return Response.json({ error: "Unable to process the AI request." }, { status: 500 });
        }
      },
    },
  },
});
