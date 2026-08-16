import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/site/Navbar";
import { useAuth } from "@/lib/auth";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Gavel, Brain, Plus, Trash2, FileText, MessageSquare, Send, Image as ImageIcon, Video as VideoIcon, Link as LinkIcon } from "lucide-react";
import { munStore, munDebateStore, munCommentStore, grantXP, type MunItem, type MunDebate, type MunComment } from "@/stores";
import { uid } from "@/lib/local-store";
import { toast } from "sonner";


export const Route = createFileRoute("/_authenticated/mun")({
  ssr: false,
  head: () => ({ meta: [{ title: "SkillNests" }] }),
  component: MunPage,
});

function MunPage() {
  const { user, isAdmin, isPaid } = useAuth();
  const items = munStore.use();
  const debates = munDebateStore.use();
  const comments = munCommentStore.use();
  const [tab, setTab] = useState<"topics" | "debates">("topics");

  return (
    <main className="min-h-screen">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-28 pb-16">
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <p className="text-xs font-mono uppercase tracking-widest text-rose-gold">mun & debate section</p>
            <h1 className="font-serif text-4xl mt-1">Voice. Listen. Defend gently.</h1>
          </div>
          
          <div className="flex bg-foreground/5 p-1 rounded-full w-fit">
            <button
              onClick={() => setTab("topics")}
              className={`px-6 py-2 rounded-full text-sm font-medium transition ${tab === "topics" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              Topics & Blocs
            </button>
            <button
              onClick={() => setTab("debates")}
              className={`px-6 py-2 rounded-full text-sm font-medium transition ${tab === "debates" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              Debate Articles
            </button>
          </div>
        </div>

        {tab === "topics" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            {isAdmin && <AdminForm />}
            <Grid items={items} isAdmin={isAdmin} />
          </motion.div>
        )}

        {tab === "debates" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <DebateForm user={user} />
            <DebateList debates={debates} comments={comments} isAdmin={isAdmin} isPaid={isPaid} user={user} />
          </motion.div>
        )}
      </div>
    </main>
  );
}

function DebateForm({ user }: { user: any }) {
  const [draft, setDraft] = useState({ topic: "", body: "", mediaUrl: "", mediaType: "image" as "image" | "video" | "link" });
  const [showMedia, setShowMedia] = useState(false);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!draft.topic.trim() || !draft.body.trim()) return;
    munDebateStore.update(p => [{
      id: uid(),
      topic: draft.topic.trim(),
      body: draft.body.trim(),
      authorEmail: user.email,
      authorName: user.name,
      mediaUrl: draft.mediaUrl.trim() || undefined,
      mediaType: draft.mediaUrl.trim() ? draft.mediaType : undefined,
      createdAt: new Date().toISOString()
    }, ...p]);
    setDraft({ topic: "", body: "", mediaUrl: "", mediaType: "image" });
    setShowMedia(false);
    
    grantXP(user, 15);
    toast.success("Debate posted! +15 XP 🗣️");
  }

  return (
    <form onSubmit={submit} className="glass-strong rounded-2xl p-5 mb-8">
      <div className="font-serif text-xl mb-4 text-gradient-gold">Start a debate</div>
      <div className="space-y-3">
        <input value={draft.topic} onChange={e => setDraft(d => ({ ...d, topic: e.target.value }))} placeholder="What is your stance or topic?" className="w-full glass rounded-xl px-4 py-3 text-sm bg-transparent outline-none" />
        <textarea value={draft.body} onChange={e => setDraft(d => ({ ...d, body: e.target.value }))} placeholder="Elaborate on your points... be respectful." rows={4} className="w-full glass rounded-xl px-4 py-3 text-sm bg-transparent outline-none resize-none" />
        {showMedia && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="flex gap-2">
            <select value={draft.mediaType} onChange={e => setDraft(d => ({ ...d, mediaType: e.target.value as any }))} className="glass rounded-xl px-3 py-2 text-sm bg-transparent outline-none">
              <option value="image">Image</option><option value="video">Video</option><option value="link">Link</option>
            </select>
            <input value={draft.mediaUrl} onChange={e => setDraft(d => ({ ...d, mediaUrl: e.target.value }))} placeholder="Paste URL here..." className="flex-1 glass rounded-xl px-4 py-2 text-sm bg-transparent outline-none" />
          </motion.div>
        )}
        <div className="flex justify-between items-center mt-2">
          <button type="button" onClick={() => setShowMedia(!showMedia)} className="text-xs text-muted-foreground hover:text-rose-gold transition flex items-center gap-1"><ImageIcon className="w-3.5 h-3.5" /> Add Media</button>
          <button type="submit" className="btn-phoenix rounded-full px-6 py-2.5 text-sm flex items-center gap-2"><MessageSquare className="w-4 h-4" /> Post Article</button>
        </div>
      </div>
    </form>
  );
}

function DebateList({ debates, comments, isAdmin, isPaid, user }: { debates: MunDebate[]; comments: MunComment[]; isAdmin: boolean; isPaid: boolean; user: any }) {
  if (debates.length === 0) return <div className="glass rounded-2xl p-10 text-center text-sm text-muted-foreground">No debates yet. Be the first to start one.</div>;
  return (
    <div className="space-y-4">
      {debates.sort((a,b) => b.createdAt.localeCompare(a.createdAt)).map(d => {
        const topicComments = comments.filter(c => c.debateId === d.id).sort((a,b) => a.createdAt.localeCompare(b.createdAt));
        return (
          <div key={d.id} className="glass rounded-2xl p-6 relative group">
            {(isAdmin || user?.email === d.authorEmail) && (
              <button onClick={() => { if(confirm("Delete this debate?")) munDebateStore.update(p => p.filter(x => x.id !== d.id)) }} className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-crimson opacity-0 group-hover:opacity-100 transition" title="Delete debate"><Trash2 className="w-4 h-4" /></button>
            )}
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-full bg-rose-gold/20 text-rose-gold grid place-items-center font-serif text-sm">{d.authorName.charAt(0).toUpperCase()}</div>
              <div><div className="text-sm font-medium">{d.authorName}</div><div className="text-[10px] font-mono text-muted-foreground">{new Date(d.createdAt).toLocaleString()}</div></div>
            </div>
            <div className="font-serif text-2xl mb-3">{d.topic}</div>
            <div className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">{d.body}</div>
            {d.mediaUrl && <MediaRender url={d.mediaUrl} type={d.mediaType || "link"} />}
            <div className="mt-6 pt-4 border-t border-white/5">
              <div className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-4">Discussion ({topicComments.length})</div>
              <div className="space-y-3 mb-4">
                {topicComments.map(c => (
                  <div key={c.id} className="bg-white/5 rounded-xl p-3 relative group/comment text-sm">
                    {(isAdmin || user?.email === c.authorEmail) && (
                      <button onClick={() => { if(confirm("Delete comment?")) munCommentStore.update(p => p.filter(x => x.id !== c.id)) }} className="absolute top-2 right-2 p-1.5 text-muted-foreground hover:text-crimson opacity-0 group-hover/comment:opacity-100 transition rounded-md" title="Delete comment"><Trash2 className="w-3.5 h-3.5" /></button>
                    )}
                    <div className="flex items-center gap-2 mb-1"><div className="font-medium text-rose-gold">{c.authorName}</div><div className="text-[10px] font-mono text-muted-foreground">{new Date(c.createdAt).toLocaleString()}</div></div>
                    <div className="text-foreground/90 whitespace-pre-wrap">{c.content}</div>
                    {c.mediaUrl && <MediaRender url={c.mediaUrl} type={c.mediaType || "link"} small />}
                  </div>
                ))}
              </div>
              {(isAdmin || isPaid) ? <CommentForm debateId={d.id} user={user} /> : <div className="text-center py-3 bg-white/5 rounded-xl text-xs text-muted-foreground italic">Upgrade to premium to join the debate.</div>}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function CommentForm({ debateId, user }: { debateId: string; user: any }) {
  const [content, setContent] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [mediaType, setMediaType] = useState<"image" | "video" | "link">("image");
  const [showMedia, setShowMedia] = useState(false);
  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;
    munCommentStore.update(p => [...p, { id: uid(), debateId, authorName: user.name, authorEmail: user.email, content: content.trim(), mediaUrl: mediaUrl.trim() || undefined, mediaType: mediaUrl.trim() ? mediaType : undefined, createdAt: new Date().toISOString() }]);
    setContent(""); setMediaUrl(""); setShowMedia(false);
  }
  return (
    <form onSubmit={submit} className="flex flex-col gap-2">
      <div className="flex gap-2">
        <input value={content} onChange={e => setContent(e.target.value)} placeholder="Add to the discussion..." className="flex-1 glass rounded-xl px-4 py-2 text-sm bg-transparent outline-none focus:border-rose-gold/40 transition" />
        <button type="button" onClick={() => setShowMedia(!showMedia)} className={`p-2 rounded-xl transition ${showMedia ? "bg-rose-gold/20 text-rose-gold" : "glass hover:text-rose-gold text-muted-foreground"}`}><ImageIcon className="w-4 h-4" /></button>
        <button type="submit" disabled={!content.trim()} className="btn-phoenix rounded-xl px-4 py-2 flex items-center justify-center disabled:opacity-50 transition"><Send className="w-4 h-4" /></button>
      </div>
      {showMedia && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="flex gap-2">
          <select value={mediaType} onChange={e => setMediaType(e.target.value as any)} className="glass rounded-xl px-3 py-1.5 text-xs bg-transparent outline-none"><option value="image">Image</option><option value="video">Video</option><option value="link">Link</option></select>
          <input value={mediaUrl} onChange={e => setMediaUrl(e.target.value)} placeholder="Paste media or link URL..." className="flex-1 glass rounded-xl px-3 py-1.5 text-xs bg-transparent outline-none" />
        </motion.div>
      )}
    </form>
  );
}

function MediaRender({ url, type, small = false }: { url: string; type: "image" | "video" | "link"; small?: boolean }) {
  const containerClass = `mt-3 ${small ? "max-w-xs" : "max-w-xl"} rounded-xl overflow-hidden glass-strong`;
  if (type === "image") return <div className={containerClass}><img src={url} alt="Attached media" className="w-full h-auto object-cover" /></div>;
  if (type === "video") {
    const ytMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})/);
    if (ytMatch) return <div className={`${containerClass} aspect-video`}><iframe src={`https://www.youtube.com/embed/${ytMatch[1]}`} title="Video" className="w-full h-full border-0" allowFullScreen /></div>;
    return <div className={containerClass}><video src={url} controls className="w-full h-auto" /></div>;
  }
  return <a href={url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 mt-2 px-4 py-2 glass rounded-lg text-sm text-rose-gold hover:underline"><LinkIcon className="w-4 h-4" /> {url.replace(/^https?:\/\//, '').slice(0, 30)}...</a>;
}

function AdminForm() {
  const [draft, setDraft] = useState({ committee: "", title: "", agenda: "", blocs: "", side: "crimson" as "crimson" | "azure", documentUrl: "" });
  function add(e: React.FormEvent) {
    e.preventDefault();
    if (!draft.committee || !draft.title || !draft.agenda) return;
    munStore.update((prev) => [...prev, { id: uid(), committee: draft.committee.trim(), title: draft.title.trim(), agenda: draft.agenda.trim(), blocs: draft.blocs.split(",").map((b) => b.trim()).filter(Boolean), side: draft.side, documentUrl: draft.documentUrl.trim() || undefined }]);
    setDraft({ committee: "", title: "", agenda: "", blocs: "", side: "crimson", documentUrl: "" });
  }
  return (
    <form onSubmit={add} className="glass-strong rounded-2xl p-4 mb-6 grid sm:grid-cols-2 gap-3">
      <input value={draft.committee} onChange={(e) => setDraft({ ...draft, committee: e.target.value })} placeholder="Committee (e.g. UNHRC)" className="glass rounded-xl px-4 py-2.5 text-sm bg-transparent outline-none" />
      <input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} placeholder="Title" className="glass rounded-xl px-4 py-2.5 text-sm bg-transparent outline-none" />
      <textarea value={draft.agenda} onChange={(e) => setDraft({ ...draft, agenda: e.target.value })} placeholder="Agenda" rows={2} className="glass rounded-xl px-4 py-2.5 text-sm bg-transparent outline-none sm:col-span-2 resize-none" />
      <input value={draft.blocs} onChange={(e) => setDraft({ ...draft, blocs: e.target.value })} placeholder="Blocs (comma separated)" className="glass rounded-xl px-4 py-2.5 text-sm bg-transparent outline-none" />
      <select value={draft.side} onChange={(e) => setDraft({ ...draft, side: e.target.value as "crimson" | "azure" })} className="glass rounded-xl px-4 py-2.5 text-sm bg-transparent outline-none"><option value="crimson">Crimson side</option><option value="azure">Azure side</option></select>
      <input value={draft.documentUrl} onChange={(e) => setDraft({ ...draft, documentUrl: e.target.value })} placeholder="Document URL (optional)" className="glass rounded-xl px-4 py-2.5 text-sm bg-transparent outline-none sm:col-span-2" />
      <button className="btn-phoenix rounded-full px-5 py-2.5 text-sm sm:col-span-2 flex items-center justify-center gap-2"><Plus className="w-4 h-4" /> Add MUN topic</button>
    </form>
  );
}

function Grid({ items, isAdmin }: { items: MunItem[]; isAdmin: boolean }) {
  if (items.length === 0) return <div className="glass rounded-2xl p-10 text-center text-sm text-muted-foreground">No MUN topics yet. {isAdmin ? "Add one above." : "Check back soon."}</div>;
  return (
    <div className="grid sm:grid-cols-2 gap-5">
      {items.map((t) => (
        <div key={t.id} className="glass rounded-2xl p-7 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1" style={{ background: t.side === "azure" ? "linear-gradient(90deg, transparent, rgba(90,110,170,0.7), transparent)" : "linear-gradient(90deg, transparent, rgba(220,80,80,0.7), transparent)" }} />
          {isAdmin && <button onClick={() => munStore.update((p) => p.filter((x) => x.id !== t.id))} className="absolute top-3 right-3 text-muted-foreground hover:text-crimson p-1.5"><Trash2 className="w-4 h-4" /></button>}
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full grid place-items-center shrink-0" style={{ background: t.side === "azure" ? "rgba(90,110,170,0.12)" : "rgba(220,80,80,0.12)", border: `1px solid ${t.side === "azure" ? "rgba(90,110,170,0.35)" : "rgba(220,80,80,0.35)"}` }}>
              {t.side === "azure" ? <Brain className="w-5 h-5 text-[#9bb0e0]" strokeWidth={1.2} /> : <Gavel className="w-5 h-5 text-[#dc8585]" strokeWidth={1.2} />}
            </div>
            <div className="min-w-0">
              <div className="text-[10px] uppercase tracking-[0.3em] font-mono mb-2" style={{ color: t.side === "azure" ? "#9bb0e0" : "#dc8585" }}>{t.committee}</div>
              <div className="font-serif text-2xl mb-2">{t.title}</div>
              <p className="text-sm text-muted-foreground mb-3">{t.agenda}</p>
              {t.blocs.length > 0 && <><div className="text-[10px] font-mono uppercase tracking-widest text-rose-gold mb-1">Blocs</div><div className="text-xs text-muted-foreground">{t.blocs.join(" · ")}</div></>}
              {t.documentUrl && <a href={t.documentUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 mt-3 text-xs text-rose-gold hover:underline"><FileText className="w-3.5 h-3.5" /> View document</a>}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
