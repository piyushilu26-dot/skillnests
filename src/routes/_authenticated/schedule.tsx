import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/site/Navbar";
import { useAuth } from "@/lib/auth";
import { useState } from "react";
import { Calendar, Plus, Trash2 } from "lucide-react";
import { scheduleStore, type ScheduleEvent } from "@/stores";
import { uid } from "@/lib/local-store";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/schedule")({
  ssr: false,
  head: () => ({ meta: [{ title: " - SkillNests" }] }),
  component: SchedulePage,
});

function SchedulePage() {
  const { isAdmin } = useAuth();
  const events = scheduleStore.use();
  const [draft, setDraft] = useState<{ title: string; date: string; time: string; type: ScheduleEvent["type"]; notes: string }>({
    title: "", date: "", time: "", type: "academic", notes: "",
  });

  const sorted = [...events].sort((a, b) => `${a.date}T${a.time}`.localeCompare(`${b.date}T${b.time}`));

  function add(e: React.FormEvent) {
    e.preventDefault();
    if (!draft.title || !draft.date || !draft.time) return;
    scheduleStore.update((prev) => [...prev, { id: uid(), title: draft.title, date: draft.date, time: draft.time, type: draft.type, notes: draft.notes, createdAt: new Date().toISOString() }]);
    setDraft({ title: "", date: "", time: "", type: "academic", notes: "" });
    toast.success("Event added.");
  }

  function remove(id: string) {
    scheduleStore.update((prev) => prev.filter((e) => e.id !== id));
  }

  return (
    <main className="min-h-screen">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-28 pb-16">
        <div className="mb-8">
          <p className="text-xs font-mono uppercase tracking-widest text-rose-gold">schedule</p>
          <h1 className="font-serif text-4xl mt-1">What's coming up.</h1>
          
        </div>

        {isAdmin && (
          <form onSubmit={add} className="glass-strong rounded-2xl p-5 mb-8 grid sm:grid-cols-2 gap-3">
            <input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} placeholder="Event title" className="glass rounded-xl px-4 py-2.5 text-sm bg-transparent outline-none sm:col-span-2" required />
            <input type="date" value={draft.date} onChange={(e) => setDraft({ ...draft, date: e.target.value })} className="glass rounded-xl px-4 py-2.5 text-sm bg-transparent outline-none" required />
            <input type="time" value={draft.time} onChange={(e) => setDraft({ ...draft, time: e.target.value })} className="glass rounded-xl px-4 py-2.5 text-sm bg-transparent outline-none" required />
            <select value={draft.type} onChange={(e) => setDraft({ ...draft, type: e.target.value as any })} className="glass rounded-xl px-4 py-2.5 text-sm bg-transparent outline-none">
              <option value="academic">Academic</option>
              <option value="extracurricular">Extracurricular</option>
              <option value="career">Career</option>
              <option value="other">Other</option>
            </select>
            <input value={draft.notes} onChange={(e) => setDraft({ ...draft, notes: e.target.value })} placeholder="Notes (optional)" className="glass rounded-xl px-4 py-2.5 text-sm bg-transparent outline-none" />
            <button className="btn-phoenix rounded-full px-5 py-2.5 text-sm sm:col-span-2 flex items-center justify-center gap-2"><Plus className="w-4 h-4" /> Add event</button>
          </form>
        )}

        <div className="space-y-3">
          {sorted.length === 0 && <div className="glass rounded-2xl p-10 text-center text-sm text-muted-foreground">No events yet. {isAdmin ? "Add one above." : "The admin hasn't added events yet."}</div>}
          {sorted.map((ev) => (
            <div key={ev.id} className="glass rounded-2xl p-4 flex items-center gap-4">
              <div className="w-14 shrink-0 text-center">
                <div className="text-[10px] font-mono uppercase text-muted-foreground">{new Date(`${ev.date}T${ev.time}`).toLocaleDateString([], { weekday: "short" })}</div>
                <div className="font-serif text-2xl">{new Date(`${ev.date}T${ev.time}`).getDate()}</div>
                <div className="text-[10px] font-mono text-rose-gold">{ev.time}</div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-serif text-lg truncate">{ev.title}</div>
                <div className="text-xs text-muted-foreground capitalize">{ev.type}{ev.notes ? ` · ${ev.notes}` : ""}</div>
              </div>
              {isAdmin && (
                <button onClick={() => remove(ev.id)} className="text-muted-foreground hover:text-crimson p-2"><Trash2 className="w-4 h-4" /></button>
              )}
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
