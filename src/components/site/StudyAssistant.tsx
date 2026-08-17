import { useEffect, useMemo, useState } from "react";
import { Bot, Clock3, Send, Sparkles, X } from "lucide-react";

type Message = { role: "user" | "assistant"; content: string };

const QUICK_PROMPTS = [
  "What can I do on SkillNests?",
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
  if (p.includes("how long") || p.includes("time") || p.includes("here")) {
    return `You've been on SkillNests for ${formatDuration(seconds)} in this session. Keep an eye on the clock and take short breaks between study blocks.`;
  }
  if (p.includes("schedule") || p.includes("study plan") || p.includes("manage my time")) {
    return "I can build a personalised study plan. Tell me your subjects, available hours, school/coaching timings, and any upcoming exam dates. I’ll balance focused study blocks, revision, practice, and breaks.";
  }
  if (p.includes("skillnests") || p.includes("website") || p.includes("what can")) {
    return "SkillNests is a student-focused learning platform built around practical learning, collaboration, resources, career guidance and MUN material. Ask me about a feature, or tell me what you need to study and I can help you plan your time.";
  }
  return "I’m the SkillNests Study Assistant. I can explain the website, help you plan academic time, build a study schedule, and track how long you’ve been on SkillNests.";
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
        "Hi — I’m your SkillNests Study Assistant. Ask me about the website, your study schedule, or your time on SkillNests.",
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
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-gold/10 text-rose-gold">
                <Sparkles className="h-5 w-5" />
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
            <Clock3 className="h-3.5 w-3.5 text-rose-gold" />
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
                  className="shrink-0 rounded-full border border-border px-3 py-1.5 text-[11px] transition hover:border-rose-gold/50 hover:text-rose-gold"
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
              className="flex items-center gap-2 rounded-2xl border border-border bg-background px-3 py-2 focus-within:border-rose-gold/50"
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask SkillNests AI…"
                className="min-w-0 flex-1 bg-transparent px-1 text-sm outline-none"
                aria-label="Ask SkillNests AI"
              />
              <button
                type="submit"
                disabled={!input.trim() || sending}
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-gold text-white transition hover:scale-105 disabled:opacity-40"
                aria-label="Send"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="fixed bottom-5 right-5 z-[70] flex items-center gap-2">
        <div className="hidden items-center gap-1.5 rounded-full border border-border/70 bg-background/90 px-3 py-2 text-[11px] font-medium shadow-lg backdrop-blur-xl sm:flex">
          <Clock3 className="h-3.5 w-3.5 text-rose-gold" />
          <span className="text-muted-foreground">On site</span>
          <span className="font-mono text-foreground">{duration}</span>
        </div>
        <button
          onClick={() => setOpen((value) => !value)}
          className="flex items-center gap-2 rounded-full border border-rose-gold/30 bg-background/90 px-4 py-3 text-sm font-medium shadow-xl backdrop-blur-xl transition hover:-translate-y-0.5 hover:border-rose-gold/60"
          aria-label="Open SkillNests AI"
          aria-expanded={open}
        >
          <Bot className="h-5 w-5 text-rose-gold" />
          <span>SkillNests AI</span>
        </button>
      </div>
    </>
  );
}
