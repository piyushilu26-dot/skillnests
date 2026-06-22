import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Navbar } from "@/components/site/Navbar";
import { useAuth } from "@/lib/auth";
import { useEffect, useState } from "react";
import { Video, Plus, Trash2, ExternalLink, Globe, Users } from "lucide-react";
import { uid } from "@/lib/local-store";
import { meetingsStore, type Meeting } from "@/stores";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/meetings")({
  ssr: false,
  head: () => ({ meta: [{ title: " - SkillNests" }] }),
  component: MeetingsPage,
});

function MeetingsPage() {
  const { user, isAdmin } = useAuth();
  const all = meetingsStore.use();
  const globals = all
    .filter((m) => m.kind === "global")
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt));
  const peers = all
    .filter((m) => m.kind === "peer")
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt));

  async function handleCreate(draft: {
    kind: "global" | "peer";
    title: string;
    startsAt: string;
    meetUrl: string;
    description: string;
  }) {
    if (!user) throw new Error("Sign in again to continue.");
    const meeting: Meeting = {
      id: uid(),
      kind: draft.kind,
      title: draft.title,
      hostName: user.name,
      hostEmail: user.email,
      startsAt: new Date(draft.startsAt).toISOString(),
      meetUrl: draft.meetUrl,
      description: draft.description || undefined,
      createdAt: new Date().toISOString(),
    };
    meetingsStore.update(prev => [...prev, meeting]);
  }

  async function handleDelete(id: string) {
    meetingsStore.update(prev => prev.filter(m => m.id !== id));
  }

  return (
    <main className="min-h-screen">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-28 pb-16 space-y-12">
        <div>
          <p className="text-xs font-mono uppercase tracking-widest text-rose-gold">meeting hub</p>
          <h1 className="font-serif text-4xl mt-1">Sit in. Speak up.</h1>
        </div>

        <section>
          <div className="flex items-center gap-2 mb-4">
            <Globe className="w-5 h-5 text-rose-gold" strokeWidth={1.2} />
            <h2 className="font-serif text-2xl">Global meets</h2>
          </div>
          {isAdmin && <MeetingForm kind="global" onCreate={handleCreate} />}
          <MeetingList meetings={globals} canDelete={isAdmin} onDelete={handleDelete} currentUserEmail={user?.email} />
        </section>

        <section>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-rose-gold" strokeWidth={1.2} />
              <h2 className="font-serif text-2xl">Peer study rooms</h2>
            </div>
          </div>
          {user && <MeetingForm kind="peer" onCreate={handleCreate} />}
          <MeetingList meetings={peers} canDelete={isAdmin} onDelete={handleDelete} currentUserEmail={user?.email} />
        </section>
      </div>
    </main>
  );
}

function MeetingForm({
  kind,
  onCreate,
}: {
  kind: "global" | "peer";
  onCreate: (draft: {
    kind: "global" | "peer";
    title: string;
    startsAt: string;
    meetUrl: string;
    description: string;
  }) => Promise<void>;
}) {
  const { user } = useAuth();
  const [draft, setDraft] = useState({ title: "", startsAt: "", meetUrl: "", description: "" });
  const [isPending, setIsPending] = useState(false);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !draft.title || !draft.startsAt || !draft.meetUrl || isPending) return;
    setIsPending(true);
    try {
      await onCreate({ kind, ...draft });
      setDraft({ title: "", startsAt: "", meetUrl: "", description: "" });
      toast.success(kind === "global" ? "Global meet scheduled." : "Study room hosted.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Meeting could not be hosted.");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <form onSubmit={add} className="glass-strong rounded-2xl p-4 mb-5 grid sm:grid-cols-2 gap-3">
      <input
        value={draft.title}
        onChange={(e) => setDraft({ ...draft, title: e.target.value })}
        placeholder={kind === "global" ? "Meeting title" : "Study room topic"}
        className="glass rounded-xl px-4 py-2.5 text-sm bg-transparent outline-none sm:col-span-2"
      />
      <input
        type="datetime-local"
        value={draft.startsAt}
        onChange={(e) => setDraft({ ...draft, startsAt: e.target.value })}
        className="glass rounded-xl px-4 py-2.5 text-sm bg-transparent outline-none"
      />
      <div className="flex gap-2">
        <input
          value={draft.meetUrl}
          onChange={(e) => setDraft({ ...draft, meetUrl: e.target.value })}
          placeholder="Google Meet / Zoom URL"
          className="glass rounded-xl px-4 py-2.5 text-sm bg-transparent outline-none flex-1"
        />
        <a
          href="https://meet.google.com/new"
          target="_blank"
          rel="noreferrer"
          className="glass rounded-xl px-3 py-2.5 text-xs whitespace-nowrap hover:bg-white/5"
          title="Open Google Meet to create a new meeting, then paste the URL here"
        >
          + New Meet
        </a>
      </div>
      <textarea
        value={draft.description}
        onChange={(e) => setDraft({ ...draft, description: e.target.value })}
        placeholder="What's it about?"
        rows={2}
        className="glass rounded-xl px-4 py-2.5 text-sm bg-transparent outline-none sm:col-span-2 resize-none"
      />
      <button 
        disabled={isPending}
        className="btn-phoenix rounded-full px-5 py-2.5 text-sm sm:col-span-2 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      >
        <Plus className={`w-4 h-4 ${isPending ? 'animate-spin' : ''}`} />{" "}
        {isPending ? "Working on it..." : kind === "global" ? "Schedule global meet" : "Host a study room"}
      </button>
    </form>
  );
}

function MeetingList({
  meetings,
  canDelete,
  onDelete,
  currentUserEmail,
}: {
  meetings: Meeting[];
  canDelete: boolean;
  onDelete: (id: string) => Promise<void>;
  currentUserEmail?: string | null;
}) {
  async function remove(id: string) {
    try {
      await onDelete(id);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Meeting could not be deleted.");
    }
  }
  if (meetings.length === 0)
    return (
      <div className="glass rounded-2xl p-8 text-center text-sm text-muted-foreground">
        No meetings yet.
      </div>
    );
  return (
    <div className="space-y-3">
      {meetings.map((m) => (
        <div key={m.id} className="glass rounded-2xl p-4 flex items-center gap-4">
          <Video className="w-5 h-5 text-rose-gold shrink-0" strokeWidth={1.2} />
          <div className="flex-1 min-w-0">
            <div className="font-serif text-lg truncate">{m.title}</div>
            <div className="text-xs text-muted-foreground">
              Hosted by {m.hostName} · {new Date(m.startsAt).toLocaleString()}
            </div>
            {m.description && (
              <div className="text-xs text-muted-foreground mt-1">{m.description}</div>
            )}
          </div>
          <a
            href={normalizeUrl(m.meetUrl)}
            target="_blank"
            rel="noreferrer"
            className="btn-phoenix rounded-full px-4 py-2 text-xs flex items-center gap-1.5"
          >
            <ExternalLink className="w-3 h-3" /> Join
          </a>
          {(canDelete || m.hostEmail === currentUserEmail) && (
            <button
              onClick={() => remove(m.id)}
              className="text-muted-foreground hover:text-crimson p-2 transition-colors"
              title="Delete meeting"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      ))}
    </div>
  );
}

function normalizeUrl(url: string): string {
  const trimmed = url.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}
