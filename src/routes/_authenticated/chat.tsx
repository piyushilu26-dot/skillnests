import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/site/Navbar";
import { useAuth } from "@/lib/auth";
import { useEffect, useRef, useState } from "react";
import { Send, Users, MessageCircle, Lock, Inbox, Trash2 } from "lucide-react";
import { groupChatStore, dmStore, founderInboxStore, type DM } from "@/stores";
import { uid } from "@/lib/local-store";
import { ADMIN_EMAIL } from "@/lib/auth";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/chat")({
  ssr: false,
  head: () => ({ meta: [{ title: " - SkillNests" }] }),
  component: ChatPage,
});

function ChatPage() {
  const { user, isAdmin } = useAuth();
  const [tab, setTab] = useState<"group" | "dm" | "founder">("group");
  const [adminTarget, setAdminTarget] = useState<string | null>(null);
  const dms = dmStore.use();
  const founderMsgs = founderInboxStore.use();

  // For admin: list of users (other party emails) who have ever DM'd them
  const userEmails = Array.from(new Set(dms.filter((m) => m.to === ADMIN_EMAIL || m.from === ADMIN_EMAIL).map((m) => (m.from === ADMIN_EMAIL ? m.to : m.from))));

  if (!user) return null;
  const dmKey = isAdmin ? adminTarget : ADMIN_EMAIL;

  return (
    <main className="min-h-screen">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-28 pb-10">
        <div className="mb-6">
          <p className="text-xs font-mono uppercase tracking-widest text-rose-gold">chat</p>
          <h1 className="font-serif text-4xl mt-1">Talk to the nest.</h1>
        </div>
        <div className="flex gap-2 mb-6 flex-wrap">
          <TabBtn active={tab === "group"} onClick={() => setTab("group")} icon={<Users className="w-4 h-4" />} label="Group" />
          <TabBtn active={tab === "dm"} onClick={() => setTab("dm")} icon={<MessageCircle className="w-4 h-4" />} label={isAdmin ? "Direct messages" : "Message admin"} />
          {isAdmin && (
            <TabBtn active={tab === "founder"} onClick={() => setTab("founder")} icon={<Inbox className="w-4 h-4" />} label={`Founder inbox (${founderMsgs.length})`} />
          )}
        </div>

        {tab === "group" && <GroupChat />}
        {tab === "dm" && (
          <>
            {isAdmin && (
              <div className="mb-4 flex gap-2 overflow-x-auto pb-2">
                {userEmails.length === 0 && <div className="text-xs text-muted-foreground">No one has messaged you yet.</div>}
                {userEmails.map((e) => {
                  // Find the last message from this user to get their name
                  const lastMsg = dms.findLast((m) => m.from === e);
                  const name = lastMsg?.senderName || e.split("@")[0];
                  return (
                    <button key={e} onClick={() => setAdminTarget(e)}
                      className={`glass rounded-full px-4 py-2 text-xs whitespace-nowrap ${adminTarget === e ? "border-rose-gold/60 text-rose-gold" : ""}`}>
                      {name} ({e})
                    </button>
                  );
                })}
              </div>
            )}
            {dmKey ? <DMChat me={user.email} other={dmKey} /> : (
              <div className="glass rounded-2xl p-6 text-sm text-muted-foreground">Select a conversation to view messages.</div>
            )}
          </>
        )}
        {tab === "founder" && isAdmin && (
          <div className="space-y-3">
            <div className="flex justify-end">
              <button
                onClick={() => {
                  if (founderMsgs.length === 0) return;
                  if (!confirm("Delete ALL founder messages? This cannot be undone.")) return;
                  founderInboxStore.set([]);
                  toast.success("Founder inbox cleared.");
                }}
                disabled={founderMsgs.length === 0}
                className="text-xs glass rounded-full px-3 py-1.5 text-muted-foreground hover:text-crimson disabled:opacity-40 flex items-center gap-1.5"
              >
                <Trash2 className="w-3 h-3" /> Delete all
              </button>
            </div>
            {founderMsgs.length === 0 && <div className="glass rounded-2xl p-8 text-center text-sm text-muted-foreground">No founder messages yet.</div>}
            {[...founderMsgs].reverse().map((m) => (
              <div key={m.id} className="glass rounded-2xl p-4 group relative">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="text-sm font-medium">{m.fromName}</span>
                  <span className="text-xs text-muted-foreground">· {m.fromEmail}</span>
                  <span className="ml-auto text-[10px] font-mono text-muted-foreground">{new Date(m.at).toLocaleString()}</span>
                  <button onClick={() => founderInboxStore.update((p) => p.filter((x) => x.id !== m.id))} className="text-muted-foreground hover:text-crimson opacity-0 group-hover:opacity-100 transition"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
                <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap break-words">{m.body}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

function TabBtn({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button onClick={onClick} className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm transition ${active ? "glass-strong border-rose-gold/40 text-rose-gold" : "glass text-muted-foreground hover:text-foreground"}`}>
      {icon} {label}
    </button>
  );
}

function GroupChat() {
  const { user, isAdmin } = useAuth();
  const messages = groupChatStore.use();
  const [body, setBody] = useState("");
  const endRef = useRef<HTMLDivElement>(null);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages.length]);

  function send(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim() || !user || !isAdmin) return;
    groupChatStore.update((prev) => [...prev, { id: uid(), senderEmail: user.email, senderName: user.name, body: body.trim(), at: new Date().toISOString() }]);
    setBody("");
  }

  return (
    <div className="glass rounded-2xl flex flex-col h-[60vh]">
      {isAdmin && (
        <div className="px-4 py-2 border-b border-white/10 flex justify-end">
          <button
            onClick={() => {
              if (messages.length === 0) return;
              if (!confirm("Delete ALL group messages? This cannot be undone.")) return;
              groupChatStore.set([]);
              toast.success("Group chat cleared.");
            }}
            disabled={messages.length === 0}
            className="text-xs text-muted-foreground hover:text-crimson disabled:opacity-40 flex items-center gap-1.5"
          ><Trash2 className="w-3 h-3" /> Delete all</button>
        </div>
      )}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && <div className="text-center text-sm text-muted-foreground py-12">No messages yet. {isAdmin ? "Say something to the group." : "Only admins can post here — hang out and read."}</div>}
        {messages.map((m) => (
          <div key={m.id} className="flex gap-3 group">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-rose-gold/40 to-phoenix/40 grid place-items-center text-[10px] font-mono shrink-0">{m.senderName[0]?.toUpperCase()}</div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-mono text-rose-gold flex items-center gap-2">
                {m.senderName}<span className="text-muted-foreground"> · {new Date(m.at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                {isAdmin && <button onClick={() => groupChatStore.update((p) => p.filter((x) => x.id !== m.id))} className="ml-auto text-muted-foreground hover:text-crimson opacity-0 group-hover:opacity-100 transition"><Trash2 className="w-3 h-3" /></button>}
              </div>
              <div className="text-sm leading-relaxed break-words">{m.body}</div>
            </div>
          </div>
        ))}
        <div ref={endRef} />
      </div>
      {isAdmin ? (
        <form onSubmit={send} className="flex gap-2 p-3 border-t border-white/10">
          <input value={body} onChange={(e) => setBody(e.target.value)} placeholder="Broadcast to the group…" className="flex-1 bg-transparent outline-none text-sm px-3 py-2 glass rounded-full" />
          <button className="btn-phoenix rounded-full px-4 py-2 text-sm flex items-center gap-1.5"><Send className="w-3.5 h-3.5" /> Send</button>
        </form>
      ) : (
        <div className="flex items-center gap-2 p-3 border-t border-white/10 text-xs text-muted-foreground">
          <Lock className="w-3.5 h-3.5" /> Read-only — only admins post here.
        </div>
      )}
    </div>
  );
}

function DMChat({ me, other }: { me: string; other: string }) {
  const { user, isAdmin } = useAuth();
  const all = dmStore.use();
  const [body, setBody] = useState("");
  const endRef = useRef<HTMLDivElement>(null);
  const conv: DM[] = all.filter((m) => (m.from === me && m.to === other) || (m.from === other && m.to === me));
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [conv.length]);

  function send(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim() || !user) return;
    const sender = isAdmin ? ADMIN_EMAIL : me;
    dmStore.update((prev) => [...prev, { id: uid(), from: sender, to: other, body: body.trim(), at: new Date().toISOString(), senderName: user.name }]);
    setBody("");
  }

  const otherName = conv.find((m) => m.from === other)?.senderName || other.split("@")[0];

  return (
    <div className="glass rounded-2xl flex flex-col h-[60vh]">
      <div className="px-4 py-3 border-b border-white/10 text-xs font-mono text-rose-gold flex items-center gap-2">
        <span>Conversation with {otherName} ({other})</span>
        {isAdmin && (
          <button
            onClick={() => {
              if (conv.length === 0) return;
              if (!confirm("Delete this entire conversation? This cannot be undone.")) return;
              dmStore.update((p) => p.filter((m) => !((m.from === me && m.to === other) || (m.from === other && m.to === me))));
              toast.success("Conversation cleared.");
            }}
            className="ml-auto text-muted-foreground hover:text-crimson normal-case flex items-center gap-1.5"
          ><Trash2 className="w-3 h-3" /> Delete all</button>
        )}
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {conv.length === 0 && <div className="text-center text-sm text-muted-foreground py-12">Start the conversation.</div>}
        {conv.map((m) => {
          const mine = m.from === (isAdmin ? ADMIN_EMAIL : me);
          return (
            <div key={m.id} className={`flex group ${mine ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm relative ${mine ? "bg-rose-gold/15 border border-rose-gold/30" : "glass"}`}>
                {m.body}
                <div className="text-[10px] text-muted-foreground mt-1 font-mono">{new Date(m.at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</div>
                {isAdmin && <button onClick={() => dmStore.update((p) => p.filter((x) => x.id !== m.id))} className="absolute -top-2 -right-2 glass-strong rounded-full p-1 text-muted-foreground hover:text-crimson opacity-0 group-hover:opacity-100 transition"><Trash2 className="w-3 h-3" /></button>}
              </div>
            </div>
          );
        })}
        <div ref={endRef} />
      </div>
      <form onSubmit={send} className="flex gap-2 p-3 border-t border-white/10">
        <input value={body} onChange={(e) => setBody(e.target.value)} placeholder="Write a message…" className="flex-1 bg-transparent outline-none text-sm px-3 py-2 glass rounded-full" />
        <button className="btn-phoenix rounded-full px-4 py-2 text-sm flex items-center gap-1.5"><Send className="w-3.5 h-3.5" /> Send</button>
      </form>
    </div>
  );
}
