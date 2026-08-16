import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/site/Navbar";
import { useAuth } from "@/lib/auth";
import React, { useState } from "react";
import {
  Compass,
  ExternalLink,
  Plus,
  Trash2,
  Edit3,
  Video,
  FileText,
  Eye,
  X,
  LockKeyhole,
} from "lucide-react";
import { careerGuideStore } from "@/stores/career-guides";
import { careerLiveStore, careerVideoStore } from "@/stores";
import { uid } from "@/lib/local-store";
import { PaidGate } from "@/components/PaidGate";
import { DrivePdfViewer } from "@/components/DrivePdfViewer";
import { isDriveUrl } from "@/lib/drive";

function normalizeUrl(url: string): string {
  const trimmed = url.trim();
  if (/^(https?:\/\/|\/)/i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

export const Route = createFileRoute("/_authenticated/career-guidance")({
  ssr: false,
  head: () => ({ meta: [{ title: "SkillNests" }] }),
  component: CareerPage,
});

function CareerPage() {
  const { isAdmin } = useAuth();
  const [tab, setTab] = useState<"live" | "careers">("careers");

  return (
    <main className="min-h-screen">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-28 pb-16">
        <div className="mb-8">
          <p className="text-xs font-mono uppercase tracking-widest text-rose-gold">
            career & motivation
          </p>
          <h1 className="font-serif text-4xl mt-1">Pick a direction. Without panic.</h1>
          <p className="text-sm text-muted-foreground mt-2 max-w-2xl">
            Explore career options by interest. Each option has a dedicated document with the profession,
            course pathway, skills and three universities well known for the field.
          </p>
        </div>

        <div className="flex gap-2 mb-6 flex-wrap">
          <Tab active={tab === "careers"} onClick={() => setTab("careers")}>
            Explore careers
          </Tab>
          <Tab active={tab === "live"} onClick={() => setTab("live")}>
            Live class & links
          </Tab>
        </div>

        {tab === "careers" ? <CareerExplorer isAdmin={isAdmin} /> : <LiveSection isAdmin={isAdmin} />}
      </div>
    </main>
  );
}

function Tab({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-full text-sm transition ${
        active ? "glass-strong border-rose-gold/40 text-rose-gold" : "glass text-muted-foreground hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}

function LiveSection({ isAdmin }: { isAdmin: boolean }) {
  const live = careerLiveStore.use();
  const [draft, setDraft] = useState({ title: "", mentor: "", startsAt: "", meetUrl: "" });

  function add(e: React.FormEvent) {
    e.preventDefault();
    if (!draft.title || !draft.mentor || !draft.startsAt || !draft.meetUrl) return;
    careerLiveStore.update((prev) => [
      ...prev,
      {
        id: uid(),
        title: draft.title,
        mentor: draft.mentor,
        startsAt: new Date(draft.startsAt).toISOString(),
        meetUrl: draft.meetUrl,
      },
    ]);
    setDraft({ title: "", mentor: "", startsAt: "", meetUrl: "" });
  }

  return (
    <div>
      {isAdmin && (
        <form onSubmit={add} className="glass-strong rounded-2xl p-4 mb-5 grid sm:grid-cols-2 gap-3">
          <input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} placeholder="Session title" className="glass rounded-xl px-4 py-2.5 text-sm bg-transparent outline-none" />
          <input value={draft.mentor} onChange={(e) => setDraft({ ...draft, mentor: e.target.value })} placeholder="Mentor name" className="glass rounded-xl px-4 py-2.5 text-sm bg-transparent outline-none" />
          <input type="datetime-local" value={draft.startsAt} onChange={(e) => setDraft({ ...draft, startsAt: e.target.value })} className="glass rounded-xl px-4 py-2.5 text-sm bg-transparent outline-none" />
          <input value={draft.meetUrl} onChange={(e) => setDraft({ ...draft, meetUrl: e.target.value })} placeholder="Live link" className="glass rounded-xl px-4 py-2.5 text-sm bg-transparent outline-none" />
          <button className="btn-phoenix rounded-full px-5 py-2.5 text-sm sm:col-span-2 flex items-center justify-center gap-2"><Plus className="w-4 h-4" /> Add live class</button>
        </form>
      )}
      <div className="space-y-3">
        {live.length === 0 && <div className="glass rounded-2xl p-10 text-center text-sm text-muted-foreground">No live classes scheduled.</div>}
        {live.map((s, i) => (
          <div key={s.id} className="glass rounded-2xl p-4 flex items-center gap-4">
            <Compass className="w-5 h-5 text-rose-gold shrink-0" strokeWidth={1.2} />
            <div className="flex-1 min-w-0">
              <div className="font-serif text-lg truncate">{s.title}</div>
              <div className="text-xs text-muted-foreground">{s.mentor} · {new Date(s.startsAt).toLocaleString()}</div>
            </div>
            {i === 0 ? (
              <a href={normalizeUrl(s.meetUrl)} target="_blank" rel="noreferrer" className="btn-phoenix rounded-full px-4 py-2 text-xs flex items-center gap-1.5"><ExternalLink className="w-3 h-3" /> Join</a>
            ) : (
              <PaidGate label="Locked"><a href={normalizeUrl(s.meetUrl)} target="_blank" rel="noreferrer" className="btn-phoenix rounded-full px-4 py-2 text-xs flex items-center gap-1.5"><ExternalLink className="w-3 h-3" /> Join</a></PaidGate>
            )}
            {isAdmin && <button onClick={() => careerLiveStore.update((p) => p.filter((x) => x.id !== s.id))} className="text-muted-foreground hover:text-crimson p-2"><Trash2 className="w-4 h-4" /></button>}
          </div>
        ))}
      </div>
    </div>
  );
}

function CareerExplorer({ isAdmin }: { isAdmin: boolean }) {
  const guides = careerGuideStore.use().filter((g) => !g.removed);
  const interests = ["All", ...Array.from(new Set(guides.map((g) => g.interest).filter(Boolean)))];
  const [interest, setInterest] = useState("All");
  const filtered = interest === "All" ? guides : guides.filter((g) => g.interest === interest);

  return (
    <div>
      <div className="glass-strong rounded-2xl p-5 mb-6">
        <div className="flex items-center gap-2 mb-1">
          <Compass className="w-5 h-5 text-rose-gold" />
          <h2 className="font-serif text-2xl">Explore career options</h2>
        </div>
        <div className="flex gap-2 flex-wrap">
          {interests.map((i) => (
            <button key={i} onClick={() => setInterest(i)} className={`px-3 py-1.5 rounded-full text-xs transition ${interest === i ? "btn-phoenix" : "glass text-muted-foreground hover:text-foreground"}`}>
              {i}
            </button>
          ))}
        </div>
      </div>
      {isAdmin && <CareerGuideAdmin />}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((guide, index) => <CareerGuideCard key={guide.id} guide={guide} index={index} isAdmin={isAdmin} />)}
      </div>
      <CareerResources isAdmin={isAdmin} />
    </div>
  );
}

function CareerGuideAdmin() {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState({ title: "", interest: "", documentUrl: "", isPaid: true });

  React.useEffect(() => {
    const handler = (event: Event) => {
      const guide = (event as CustomEvent).detail;
      if (!guide) return;
      setEditingId(guide.id);
      setDraft({ title: guide.title || "", interest: guide.interest || "", documentUrl: guide.documentUrl || "", isPaid: !!guide.isPaid });
      window.scrollTo({ top: 0, behavior: "smooth" });
    };
    window.addEventListener("skillnests:edit-career-guide", handler);
    return () => window.removeEventListener("skillnests:edit-career-guide", handler);
  }, []);

  const reset = () => {
    setEditingId(null);
    setDraft({ title: "", interest: "", documentUrl: "", isPaid: true });
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.title || !draft.documentUrl) return;
    careerGuideStore.update((prev) => {
      if (editingId) return prev.map((g) => g.id === editingId ? { ...g, ...draft, kind: "career-guide" as const, removed: false } : g);
      return [...prev, { id: uid(), kind: "career-guide" as const, speaker: "SkillNests Career Guide", ...draft }];
    });
    reset();
  };

  return (
    <form onSubmit={submit} className="glass-strong rounded-2xl p-4 mb-5 grid sm:grid-cols-2 gap-3">
      <div className="sm:col-span-2 flex items-center justify-between">
        <span className="text-xs uppercase tracking-widest font-mono text-rose-gold">{editingId ? "Edit career document" : "Add career document"}</span>
        {editingId && <button type="button" onClick={reset} className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"><X className="w-3 h-3" /> Cancel</button>}
      </div>
      <input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} placeholder="Career title" className="glass rounded-xl px-4 py-2.5 text-sm bg-transparent outline-none" />
      <input value={draft.interest} onChange={(e) => setDraft({ ...draft, interest: e.target.value })} placeholder="Interest area" className="glass rounded-xl px-4 py-2.5 text-sm bg-transparent outline-none" />
      <input value={draft.documentUrl} onChange={(e) => setDraft({ ...draft, documentUrl: e.target.value })} placeholder="Document file URL / path" className="glass rounded-xl px-4 py-2.5 text-sm bg-transparent outline-none sm:col-span-2" />
      <label className="glass rounded-xl px-4 py-2.5 text-sm flex items-center gap-2"><input type="checkbox" checked={draft.isPaid} onChange={(e) => setDraft({ ...draft, isPaid: e.target.checked })} /> Paid document</label>
      <button className="btn-phoenix rounded-full px-5 py-2.5 text-sm sm:col-span-2 flex items-center justify-center gap-2">{editingId ? <><Edit3 className="w-4 h-4" /> Save changes</> : <><Plus className="w-4 h-4" /> Add career document</>}</button>
    </form>
  );
}

function CareerGuideCard({ guide, index, isAdmin }: { guide: any; index: number; isAdmin: boolean }) {
  const [viewing, setViewing] = useState<{ url: string; title: string } | null>(null);
  const open = () => {
    if (!guide.documentUrl) return;
    if (isDriveUrl(guide.documentUrl)) setViewing({ url: guide.documentUrl, title: guide.title });
    else window.open(normalizeUrl(guide.documentUrl), "_blank", "noopener,noreferrer");
  };

  return (
    <>
      <div className="glass rounded-2xl overflow-hidden group relative">
        <div className="p-5">
          <div className="text-xs font-mono uppercase tracking-widest text-rose-gold">{guide.interest}</div>
          <div className="font-serif text-xl mt-1">{guide.title}</div>
          {guide.speaker && <div className="text-xs text-muted-foreground mt-1">{guide.speaker}</div>}
          <div className="mt-4">
            {guide.isPaid ? (
              <PaidGate label="₹49/month required"><button onClick={open} className="btn-ghost-gold rounded-full px-4 py-2 text-xs inline-flex items-center gap-1.5"><LockKeyhole className="w-3 h-3" /> Unlock document</button></PaidGate>
            ) : (
              <button onClick={open} className="btn-phoenix rounded-full px-4 py-2 text-xs inline-flex items-center gap-1.5"><Eye className="w-3 h-3" /> View free document</button>
            )}
          </div>
        </div>
        {isAdmin && (
          <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition">
            <button onClick={() => window.dispatchEvent(new CustomEvent("skillnests:edit-career-guide", { detail: guide }))} title="Edit career document" className="glass-strong rounded-full p-1.5 text-muted-foreground hover:text-rose-gold"><Edit3 className="w-3.5 h-3.5" /></button>
            <button onClick={() => careerGuideStore.update((p) => p.map((x) => x.id === guide.id ? { ...x, removed: true } : x))} title="Remove career document" className="glass-strong rounded-full p-1.5 text-muted-foreground hover:text-crimson"><Trash2 className="w-3.5 h-3.5" /></button>
          </div>
        )}
      </div>
      {viewing && <DrivePdfViewer url={viewing.url} title={viewing.title} onClose={() => setViewing(null)} />}
    </>
  );
}

function CareerResources({ isAdmin }: { isAdmin: boolean }) {
  const items = careerVideoStore.use();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState({ title: "", speaker: "", videoUrl: "", documentUrl: "", thumb: "" });

  const reset = () => {
    setEditingId(null);
    setDraft({ title: "", speaker: "", videoUrl: "", documentUrl: "", thumb: "" });
  };
  const edit = (item: any) => {
    setEditingId(item.id);
    setDraft({ title: item.title || "", speaker: item.speaker || "", videoUrl: item.videoUrl || "", documentUrl: item.documentUrl || "", thumb: item.thumb || "" });
  };
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.title) return;
    careerVideoStore.update((prev) => editingId ? prev.map((x) => x.id === editingId ? { ...x, ...draft } : x) : [...prev, { id: uid(), ...draft }]);
    reset();
  };

  return (
    <div className="mt-10 pt-8 border-t border-white/5">
      <div className="mb-4">
        <div className="text-xs font-mono uppercase tracking-widest text-rose-gold">Additional career resources</div>
        <h3 className="font-serif text-2xl">Guides, talks & documents</h3>
      </div>
      {isAdmin && (
        <form onSubmit={submit} className="glass-strong rounded-2xl p-4 mb-5 grid sm:grid-cols-2 gap-3">
          <div className="sm:col-span-2 flex items-center justify-between">
            <span className="text-xs uppercase tracking-widest font-mono text-rose-gold">{editingId ? "Edit career resource" : "Add career resource"}</span>
            {editingId && <button type="button" onClick={reset} className="text-xs text-muted-foreground flex items-center gap-1"><X className="w-3 h-3" /> Cancel</button>}
          </div>
          <input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} placeholder="Title" className="glass rounded-xl px-4 py-2.5 text-sm bg-transparent outline-none" />
          <input value={draft.speaker} onChange={(e) => setDraft({ ...draft, speaker: e.target.value })} placeholder="Speaker (optional)" className="glass rounded-xl px-4 py-2.5 text-sm bg-transparent outline-none" />
          <input value={draft.videoUrl} onChange={(e) => setDraft({ ...draft, videoUrl: e.target.value })} placeholder="Video URL (optional)" className="glass rounded-xl px-4 py-2.5 text-sm bg-transparent outline-none" />
          <input value={draft.documentUrl} onChange={(e) => setDraft({ ...draft, documentUrl: e.target.value })} placeholder="Document URL (optional)" className="glass rounded-xl px-4 py-2.5 text-sm bg-transparent outline-none" />
          <input value={draft.thumb} onChange={(e) => setDraft({ ...draft, thumb: e.target.value })} placeholder="Thumbnail URL (optional)" className="glass rounded-xl px-4 py-2.5 text-sm bg-transparent outline-none" />
          <button className="btn-phoenix rounded-full px-5 py-2.5 text-sm sm:col-span-2 flex items-center justify-center gap-2">{editingId ? <><Edit3 className="w-4 h-4" /> Save changes</> : <><Plus className="w-4 h-4" /> Add career resource</>}</button>
        </form>
      )}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.length === 0 && <div className="glass rounded-2xl p-8 text-center text-sm text-muted-foreground sm:col-span-2 lg:col-span-3">No additional career resources yet.</div>}
        {items.map((item) => (
          <div key={item.id} className="glass rounded-2xl overflow-hidden group relative">
            {item.videoUrl ? (
              <div className="aspect-video relative"><div className="absolute inset-0 grid place-items-center"><Video className="w-10 h-10 text-rose-gold" /></div><a href={normalizeUrl(item.videoUrl)} target="_blank" rel="noreferrer" className="absolute inset-0" aria-label={`Open ${item.title}`} /></div>
            ) : (
              <div className="aspect-video relative"><div className="absolute inset-0 grid place-items-center"><FileText className="w-10 h-10 text-rose-gold" /></div></div>
            )}
            <div className="p-4">
              <div className="font-serif text-lg leading-tight">{item.title}</div>
              {item.speaker && <div className="text-xs text-muted-foreground mt-1">{item.speaker}</div>}
              {item.documentUrl && <div className="mt-3"><a href={normalizeUrl(item.documentUrl)} target="_blank" rel="noreferrer" className="btn-ghost-gold rounded-full px-4 py-2 text-xs inline-flex items-center gap-1.5"><FileText className="w-3 h-3" /> Open document</a></div>}
            </div>
            {isAdmin && <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition"><button onClick={() => edit(item)} title="Edit resource" className="glass-strong rounded-full p-1.5 text-muted-foreground hover:text-rose-gold"><Edit3 className="w-3.5 h-3.5" /></button><button onClick={() => careerVideoStore.update((p) => p.filter((x) => x.id !== item.id))} title="Remove resource" className="glass-strong rounded-full p-1.5 text-muted-foreground hover:text-crimson"><Trash2 className="w-3.5 h-3.5" /></button></div>}
          </div>
        ))}
      </div>
    </div>
  );
}
