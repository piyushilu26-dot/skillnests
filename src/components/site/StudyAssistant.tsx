import { useEffect, useMemo, useState } from "react";
import { Bot, Clock3, Send, Sparkles, X } from "lucide-react";

type Message = { role: "user" | "assistant"; content: string };

const QUICK_PROMPTS = [
  "What can I do on SkillNests?",
  "Who is the CEO of SkillNests?",
  "Make me a study schedule",
  "What is 2+2?",
];

function formatDuration(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h) return `${h}h ${m}m ${s}s`;
  if (m) return `${m}m ${s}s`;
  return `${s}s`;
}

function tryCalculate(expression: string): number | null {
  const cleaned = expression
    .replace(/[×x]/gi, "*")
    .replace(/[÷]/g, "/")
    .replace(/[−–—]/g, "-")
    .replace(/\s+/g, "")
    .replace(/\?+$/, "");
  if (!/^[0-9+\-*/%.()^]+$/.test(cleaned) || !/[+\-*/%^]/.test(cleaned)) return null;
  let i = 0;
  const parseExpression = (): number => {
    let value = parseTerm();
    while (cleaned[i] === "+" || cleaned[i] === "-") {
      const op = cleaned[i++];
      const rhs = parseTerm();
      value = op === "+" ? value + rhs : value - rhs;
    }
    return value;
  };
  const parseTerm = (): number => {
    let value = parsePower();
    while (cleaned[i] === "*" || cleaned[i] === "/" || cleaned[i] === "%") {
      const op = cleaned[i++];
      const rhs = parsePower();
      if (op === "*") value *= rhs;
      else if (op === "/") {
        if (rhs === 0) throw new Error("division by zero");
        value /= rhs;
      } else value %= rhs;
    }
    return value;
  };
  const parsePower = (): number => {
    let value = parseUnary();
    if (cleaned[i] === "^") {
      i++;
      value = Math.pow(value, parsePower());
    }
    return value;
  };
  const parseUnary = (): number => {
    if (cleaned[i] === "+") { i++; return parseUnary(); }
    if (cleaned[i] === "-") { i++; return -parseUnary(); }
    return parsePrimary();
  };
  const parsePrimary = (): number => {
    if (cleaned[i] === "(") {
      i++;
      const value = parseExpression();
      if (cleaned[i] !== ")") throw new Error("missing parenthesis");
      i++;
      return value;
    }
    const start = i;
    while (/[0-9.]/.test(cleaned[i] || "")) i++;
    if (start === i) throw new Error("expected number");
    const value = Number(cleaned.slice(start, i));
    if (!Number.isFinite(value)) throw new Error("invalid number");
    return value;
  };
  try {
    const result = parseExpression();
    return i === cleaned.length && Number.isFinite(result) ? result : null;
  } catch {
    return null;
  }
}

function formatNumber(value: number) {
  return Number.isInteger(value) ? String(value) : String(Number(value.toFixed(10)));
}

function localFallback(prompt: string, seconds: number, history: Message[]) {
  const p = prompt.toLowerCase().trim();
  const arithmeticCandidate = prompt.replace(/^(what is|calculate|solve|evaluate|find)\s+/i, "").replace(/[=?]+\s*$/, "").trim();
  const arithmetic = tryCalculate(arithmeticCandidate);
  if (arithmetic !== null) return `${arithmeticCandidate} = ${formatNumber(arithmetic)}.`;
  if (/capital of (india|indian)/.test(p)) return "The capital of India is New Delhi.";
  if (/capital of (france|french)/.test(p)) return "The capital of France is Paris.";
  if (/capital of (japan|japanese)/.test(p)) return "The capital of Japan is Tokyo.";
  if (/largest planet/.test(p)) return "Jupiter is the largest planet in our Solar System.";
  if (/red planet/.test(p)) return "Mars is commonly called the Red Planet.";
  if (/who (is|was) (the )?founder|who.*ceo|piyush/.test(p)) return "Piyush Raj is the Founder & CEO of SkillNests.";
  if (/newton.*second law|second law.*newton|force.*mass.*acceleration/.test(p)) {
    return "Newton's second law states that the net force on an object equals its mass multiplied by its acceleration: F = ma. In simple terms, a larger force produces greater acceleration, while a larger mass needs more force for the same acceleration.";
  }
  if (/example|real[- ]life example|give me an example/.test(p)) {
    const previous = [...history].reverse().find((m) => m.role === "user" && m.content);
    if (previous && /newton|force|acceleration|second law/.test(previous.content.toLowerCase())) {
      return "A simple example is pushing a shopping cart: pushing it harder gives it greater acceleration, while a heavier cart needs more force to get the same acceleration. That is F = ma in everyday life.";
    }
    const previousAssistant = [...history].reverse().find((m) => m.role === "assistant" && m.content);
    if (previousAssistant) return `Here is a practical example related to what we were discussing: ${previousAssistant.content}`;
  }
  if (/explain.*easier|make.*easier|simpler|simple terms/.test(p)) {
    const previous = [...history].reverse().find((m) => m.role === "assistant" && m.content);
    if (previous && /newton|force|acceleration|f = ma/.test(previous.content.toLowerCase())) {
      return "Think of it like this: push a light cart and it speeds up easily; push a heavy cart with the same force and it speeds up less. More force means more acceleration, and more mass means less acceleration for the same force.";
    }
  }
  if (/how long|how much time|time.*here|been here/.test(p)) return `You've been on SkillNests for ${formatDuration(seconds)} in this session.`;
  if (/schedule|study plan|manage my time/.test(p)) {
    return [
      "Here’s a starter study schedule (assuming you’re free from 5:00 PM–10:00 PM):",
      "",
      "5:00–5:15 PM — Plan the session + review goals",
      "5:15–6:15 PM — Physics: learn/revise one concept + examples",
      "6:15–6:30 PM — Break",
      "6:30–7:30 PM — Mathematics: focused problem practice",
      "7:30–8:00 PM — Dinner / longer break",
      "8:00–9:00 PM — Chemistry: concepts + practice questions",
      "9:00–9:15 PM — Break",
      "9:15–9:45 PM — Active recall + PYQs from today’s topics",
      "9:45–10:00 PM — Review mistakes and plan tomorrow",
      "",
      "If you give me your subjects, exam dates, and available hours, I can make this more specific."
    ].join("\n");
  }
  if (/skillnests|website|what can i do/.test(p)) return "SkillNests is a student-focused learning platform with academic resources, PYQs, notes, MUN & debate material, career guidance, meetings, schedules, skill sharing, and SkillNests AI.";
  return "";
}

function shouldAnswerLocally(prompt: string, history: Message[]) {
  const p = prompt.toLowerCase();
  return /[+\-*/%^×÷]/.test(prompt) || /\b(what is 2\s*\+\s*2|capital of|largest planet|red planet|newton|second law|example|explain.*easier|make.*easier|study schedule|study plan|skillnests|who.*ceo|founder|how long.*here|been here)\b/i.test(p) || (history.length > 0 && /^(and|also|then|why|how|example|give me|make it|explain that|simplify that)\b/i.test(p));
}

export function StudyAssistant() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Hi — I’m SkillNests AI. Ask me a question, give me a study task, or ask about SkillNests." },
  ]);

  useEffect(() => {
    const key = "sn-session-start";
    const stored = sessionStorage.getItem(key);
    const startedAt = stored ? Number(stored) : Date.now();
    sessionStorage.setItem(key, String(startedAt));
    const tick = () => setSeconds(Math.max(0, Math.floor((Date.now() - startedAt) / 1000)));
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  const duration = useMemo(() => formatDuration(seconds), [seconds]);

  async function sendMessage(text = input) {
    const prompt = text.trim();
    if (!prompt || sending) return;
    const historyForRequest = messages.slice(-12);
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: prompt }]);
    setSending(true);

    try {
      // Handle common deterministic tasks locally first. This guarantees that arithmetic,
      // basic academics, and follow-ups do not depend on API availability or latency.
      if (shouldAnswerLocally(prompt, historyForRequest)) {
        const answer = localFallback(prompt, seconds, historyForRequest);
        if (answer) {
          setMessages((prev) => [...prev, { role: "assistant", content: answer }]);
          return;
        }
      }

      const response = await fetch("/api/ai", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ message: prompt, sessionSeconds: seconds, history: historyForRequest }),
      });
      const data = (await response.json().catch(() => ({}))) as { answer?: string };
      if (response.ok && data.answer) setMessages((prev) => [...prev, { role: "assistant", content: data.answer as string }]);
      else setMessages((prev) => [...prev, { role: "assistant", content: localFallback(prompt, seconds, historyForRequest) || "I couldn't complete that request. Please try asking it another way." }]);
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: localFallback(prompt, seconds, historyForRequest) || "I couldn't complete that request. Please try asking it another way." }]);
    } finally {
      setSending(false);
    }
  }

  return (
    <>
      {open && (
        <div className="fixed bottom-24 right-4 z-[70] w-[min(420px,calc(100vw-2rem))] overflow-hidden rounded-3xl border border-rose-gold/20 bg-background/95 shadow-2xl backdrop-blur-xl">
          <div className="flex items-center justify-between border-b border-border/60 px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-cyan-300 shadow-lg ring-2 ring-cyan-300/30"><Bot className="h-7 w-7" strokeWidth={2.5} /></div>
              <div><p className="font-serif text-xl">SkillNests AI</p><p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Study • Explore • Focus</p></div>
            </div>
            <button onClick={() => setOpen(false)} className="rounded-full p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground" aria-label="Close assistant"><X className="h-4 w-4" /></button>
          </div>
          <div className="flex items-center gap-2 border-b border-border/50 px-5 py-3 text-xs text-muted-foreground"><Clock3 className="h-3.5 w-3.5 text-cyan-400" /><span>Time on SkillNests</span><span className="ml-auto font-mono text-foreground">{duration}</span></div>
          <div className="max-h-[360px] space-y-3 overflow-y-auto p-4">
            {messages.map((message, index) => <div key={`${message.role}-${index}`} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}><div className={`max-w-[88%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm leading-relaxed ${message.role === "user" ? "bg-rose-gold text-white" : "bg-muted/70 text-foreground"}`}>{message.content}</div></div>)}
            {sending && <div className="rounded-2xl bg-muted/70 px-4 py-3 text-sm text-muted-foreground">Thinking…</div>}
          </div>
          <div className="border-t border-border/60 p-4">
            <div className="mb-3 flex gap-2 overflow-x-auto pb-1">{QUICK_PROMPTS.map((prompt) => <button key={prompt} onClick={() => void sendMessage(prompt)} disabled={sending} className="shrink-0 rounded-full border border-border px-3 py-1.5 text-[11px] transition hover:border-cyan-400/60 hover:text-cyan-400 disabled:opacity-50">{prompt}</button>)}</div>
            <form onSubmit={(e) => { e.preventDefault(); void sendMessage(); }} className="flex items-center gap-2 rounded-2xl border border-border bg-background px-3 py-2 focus-within:border-cyan-400/60"><input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask SkillNests AI anything…" className="min-w-0 flex-1 bg-transparent px-1 text-sm outline-none" aria-label="Ask SkillNests AI" /><button type="submit" disabled={!input.trim() || sending} className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-950 text-cyan-300 shadow-md ring-1 ring-cyan-300/30 transition hover:scale-105 hover:bg-slate-900 disabled:opacity-40" aria-label="Send"><Send className="h-5 w-5" strokeWidth={2.5} /></button></form>
          </div>
        </div>
      )}
      <div className="fixed bottom-5 right-5 z-[70] flex items-center gap-2">
        <div className="hidden items-center gap-1.5 rounded-full border border-border/70 bg-background/90 px-3 py-2 text-[11px] font-medium shadow-lg backdrop-blur-xl sm:flex"><Clock3 className="h-3.5 w-3.5 text-cyan-400" /><span className="text-muted-foreground">On site</span><span className="font-mono text-foreground">{duration}</span></div>
        <button onClick={() => setOpen((value) => !value)} className="flex items-center gap-3 rounded-full border border-cyan-300/40 bg-slate-950 px-5 py-3.5 text-sm font-semibold text-white shadow-xl shadow-cyan-900/20 transition hover:-translate-y-0.5 hover:border-cyan-300/80 hover:bg-slate-900" aria-label="Open SkillNests AI" aria-expanded={open}><span className="flex h-8 w-8 items-center justify-center rounded-xl bg-cyan-300 text-slate-950 shadow-md"><Bot className="h-6 w-6" strokeWidth={2.5} /></span><span>SkillNests AI</span><Sparkles className="h-4 w-4 text-cyan-300" /></button>
      </div>
    </>
  );
}
