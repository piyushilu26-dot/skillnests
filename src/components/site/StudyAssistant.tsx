import { useEffect, useMemo, useState } from "react";
import { Bot, Clock3, Send, Sparkles, X } from "lucide-react";

type Message = { role: "user" | "assistant"; content: string };

const QUICK_PROMPTS = [
  "What can I do on SkillNests?",
  "Who is the CEO of SkillNests?",
  "Make me a study schedule",
  "How long have I been here?",
];

function formatDuration(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h) return `${h}h ${m}m ${s}s`;
  if (m) return `${m}m ${s}s`;
  return `${s}s`;
}

function localAnswer(prompt: string, seconds: number) {
  const p = prompt.toLowerCase();
  if (p.includes("ceo") || p.includes("founder") || p.includes("piyush")) {
    return "Piyush Raj is the Founder & CEO of SkillNests.";
  }
  if (p.includes("how long") || p.includes("time") || p.includes("here")) {
    return `You've been on SkillNests for ${formatDuration(seconds)} in this session. Keep an eye on the clock and take short breaks between study blocks.`;
  }
  if (p.includes("schedule") || p.includes("study plan") || p.includes("manage my time")) {
    return "I can build a personalised study plan. Tell me your subjects, available hours, school/coaching timings, and any upcoming exam dates. I’ll balance focused study blocks, revision, practice, and breaks.";
  }
  if (p.includes("skillnests") || p.includes("website") || p.includes("what can")) {
    return "SkillNests is a student-focused learning platform built around practical learning, collaboration, resources, career guidance and MUN material. Ask me about a feature, or tell me what you need to study and I can help you plan your time.";
  }
  return "I’m SkillNests AI. I can answer general questions, explain SkillNests, help with academic planning, build study schedules, and track your time on the website.";
}

export function StudyAssistant() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hi — I’m SkillNests AI. Ask me anything, ask about SkillNests, plan your studies, or check your time on the website.",
    },
  ]);

  useEffect(() => {
    const key = "sn-session-start";
    const stored = sessionStorage.getItem(key);
    const startedAt = stored ? Number(stored) : Date.now();
    sessionStorage.setItem(key, String(startedAt));

    const tick = () =>
      setSeconds(Math.max(0, Math.floor((Date.now() - startedAt) / 1000)));
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  const duration = useMemo(() => formatDuration(seconds), [seconds]);

  async function sendMessage(text = input) {
    const prompt = text.trim();
    if (!prompt || sending) return;
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: prompt }]);
    setSending(true);
    try {
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ message: prompt, sessionSeconds: seconds }),
      });
      if (!response.ok) throw new Error("AI unavailable");
      const data = (await response.json()) as { answer?: string };
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.answer || localAnswer(prompt, seconds) },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: localAnswer(prompt, seconds) },
      ]);
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
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-cyan-300 shadow-lg ring-2 ring-cyan-300/30">
                <Bot className="h-7 w-7" strokeWidth={2.5} />
              </div>
              <div>
                <p className="font-serif text-xl">SkillNests AI</p>
                <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                  Study • Explore • Focus
                </p>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="rounded-full p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground"
              aria-label="Close assistant"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="flex items-center gap-2 border-b border-border/50 px-5 py-3 text-xs text-muted-foreground">
            <Clock3 className="h-3.5 w-3.5 text-cyan-400" />
            <span>Time on SkillNests</span>
            <span className="ml-auto font-mono text-foreground">{duration}</span>
          </div>

          <div className="max-h-[360px] space-y-3 overflow-y-auto p-4">
            {messages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[88%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    message.role === "user"
                      ? "bg-rose-gold text-white"
                      : "bg-muted/70 text-foreground"
                  }`}
                >
                  {message.content}
                </div>
              </div>
            ))}
            {sending && (
              <div className="rounded-2xl bg-muted/70 px-4 py-3 text-sm text-muted-foreground">
                Thinking…
              </div>
            )}
          </div>

          <div className="border-t border-border/60 p-4">
            <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
              {QUICK_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => void sendMessage(prompt)}
                  className="shrink-0 rounded-full border border-border px-3 py-1.5 text-[11px] transition hover:border-cyan-400/60 hover:text-cyan-400"
                >
                  {prompt}
                </button>
              ))}
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                void sendMessage();
              }}
              className="flex items-center gap-2 rounded-2xl border border-border bg-background px-3 py-2 focus-within:border-cyan-400/60"
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask SkillNests AI anything…"
                className="min-w-0 flex-1 bg-transparent px-1 text-sm outline-none"
                aria-label="Ask SkillNests AI"
              />
              <button
                type="submit"
                disabled={!input.trim() || sending}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-950 text-cyan-300 shadow-md ring-1 ring-cyan-300/30 transition hover:scale-105 hover:bg-slate-900 disabled:opacity-40"
                aria-label="Send"
              >
                <Send className="h-5 w-5" strokeWidth={2.5} />
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="fixed bottom-5 right-5 z-[70] flex items-center gap-2">
        <div className="hidden items-center gap-1.5 rounded-full border border-border/70 bg-background/90 px-3 py-2 text-[11px] font-medium shadow-lg backdrop-blur-xl sm:flex">
          <Clock3 className="h-3.5 w-3.5 text-cyan-400" />
          <span className="text-muted-foreground">On site</span>
          <span className="font-mono text-foreground">{duration}</span>
        </div>
        <button
          onClick={() => setOpen((value) => !value)}
          className="flex items-center gap-3 rounded-full border border-cyan-300/40 bg-slate-950 px-5 py-3.5 text-sm font-semibold text-white shadow-xl shadow-cyan-900/20 transition hover:-translate-y-0.5 hover:border-cyan-300/80 hover:bg-slate-900"
          aria-label="Open SkillNests AI"
          aria-expanded={open}
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-cyan-300 text-slate-950 shadow-md">
            <Bot className="h-6 w-6" strokeWidth={2.5} />
          </span>
          <span>SkillNests AI</span>
          <Sparkles className="h-4 w-4 text-cyan-300" />
        </button>
      </div>
    </>
  );
}
