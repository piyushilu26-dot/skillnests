import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/site/Navbar";
import { useAuth } from "@/lib/auth";
import { useState } from "react";
import { Trophy, Plus, Trash2, ExternalLink, X, BookOpen, CalendarDays, IndianRupee, Target } from "lucide-react";
import { olympiadStore, type OlympiadItem, type OlympiadResource } from "@/stores";
import { uid } from "@/lib/local-store";
import { PaidGate } from "@/components/PaidGate";

export const Route = createFileRoute("/_authenticated/olympiads")({
  ssr: false,
  head: () => ({ meta: [{ title: "SkillNests" }] }),
  component: OlympiadsPage,
});

function OlympiadsPage() {
  const { isAdmin } = useAuth();
  const items = olympiadStore.use();

  return (
    <main className="min-h-screen">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-28 pb-16">
        <div className="mb-8">
          <p className="text-xs font-mono uppercase tracking-widest text-rose-gold">olympiads</p>
          <h1 className="font-serif text-4xl mt-1">For depth. Not medals.</h1>
        </div>

        <IOQMGuide />

        {isAdmin && <AdminForm />}
        <Grid items={items} isAdmin={isAdmin} />
      </div>
    </main>
  );
}

function IOQMGuide() {
  return (
    <section className="glass-strong rounded-3xl p-6 sm:p-8 mb-8 border border-rose-gold/20">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-5">
        <div>
          <div className="text-xs font-mono uppercase tracking-widest text-rose-gold mb-2">Mathematics Olympiad</div>
          <h2 className="font-serif text-3xl sm:text-4xl">IOQM 2026</h2>
          <p className="text-sm text-muted-foreground mt-2 max-w-3xl leading-relaxed">
            The Indian Olympiad Qualifier in Mathematics (IOQM) is the first stage of India's Mathematical Olympiad programme. It emphasizes mathematical thinking, logical reasoning and creative problem solving rather than routine formula application.
          </p>
        </div>
        <Trophy className="w-10 h-10 text-rose-gold shrink-0" strokeWidth={1.1} />
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-7">
        <InfoBox icon={<CalendarDays className="w-4 h-4" />} label="Exam date" value="6 September 2026" />
        <InfoBox icon={<Target className="w-4 h-4" />} label="Mode" value="Offline • OMR" />
        <InfoBox icon={<IndianRupee className="w-4 h-4" />} label="Fee" value="₹180 KV/JNV • ₹300 others" />
        <InfoBox icon={<BookOpen className="w-4 h-4" />} label="Next stages" value="RMO → INMO → IMO pathway" />
      </div>

      <div className="grid md:grid-cols-2 gap-6 mt-7">
        <GuideBlock title="Eligibility">
          <ul className="list-disc pl-5 space-y-1.5">
            <li>Students in Classes 8–12 are eligible, subject to the official age and other eligibility rules.</li>
            <li>For IOQM 2026, the birth-date window is 1 August 2007 through 31 July 2014.</li>
            <li>Candidates must satisfy the prescribed Indian citizenship/passport eligibility rules; OCI participation is provisional and has later-stage restrictions.</li>
            <li>Class XII students may appear if they have not already passed the Class XII board examination.</li>
            <li>Students from recognized systems including CBSE, ICSE, State Boards, NIOS, IB and other recognized boards can appear if eligible.</li>
          </ul>
        </GuideBlock>

        <GuideBlock title="Exam & syllabus">
          <ul className="list-disc pl-5 space-y-1.5">
            <li>IOQM 2026 is conducted offline using an OMR answer sheet.</li>
            <li>There is no negative marking.</li>
            <li>Core areas: Number Theory, Geometry, Algebra and Combinatorics.</li>
            <li>Calculus and Statistics are excluded from the stated mathematical-olympiad syllabus.</li>
            <li>The problems emphasize reasoning, creativity, logical thinking and non-routine problem solving.</li>
          </ul>
        </GuideBlock>

        <GuideBlock title="Registration & documents">
          <ul className="list-disc pl-5 space-y-1.5">
            <li>Students can enroll through an approved centre or individually through the online portal.</li>
            <li>For the 2026 cycle, the official portal lists student enrollment through 25 July 2026; the portal currently states that enrollment is closed.</li>
            <li>Registration documents include a recent photograph, proof of current school and proof of date of birth in the formats and size limits specified by MTA(I).</li>
            <li>Students must carry the printed hall ticket and valid photo identity document as specified in the examination instructions.</li>
          </ul>
        </GuideBlock>

        <GuideBlock title="Pathway after IOQM">
          <ul className="list-disc pl-5 space-y-1.5">
            <li>IOQM is followed by the Regional Mathematical Olympiad (RMO) for students selected under the notified criteria.</li>
            <li>For the 2026–27 cycle, HBCSE lists RMO on 15 November 2026, 13:00–16:00, with six proof-based questions.</li>
            <li>HBCSE lists INMO 2027 on 17 January 2027, 12:00–16:30, also with six proof-based questions.</li>
            <li>Later stages lead into the national training and selection process for international mathematical olympiads, subject to the annual rules.</li>
          </ul>
        </GuideBlock>
      </div>

      <div className="mt-7 pt-5 border-t border-rose-gold/10">
        <div className="text-[10px] font-mono uppercase tracking-widest text-rose-gold mb-3">Official resources</div>
        <div className="flex flex-wrap gap-2">
          <a href="https://ioqm.mtai.org.in/" target="_blank" rel="noreferrer" className="btn-ghost-gold rounded-full px-4 py-2 text-xs inline-flex items-center gap-1.5">IOQM 2026 portal <ExternalLink className="w-3 h-3" /></a>
          <a href="https://ioqm.mtai.org.in/documents/elcrIOQM.pdf" target="_blank" rel="noreferrer" className="btn-ghost-gold rounded-full px-4 py-2 text-xs inline-flex items-center gap-1.5">Eligibility document <ExternalLink className="w-3 h-3" /></a>
          <a href="https://olympiads.hbcse.tifr.res.in/mathematical-olympiad-2026-2027/" target="_blank" rel="noreferrer" className="btn-ghost-gold rounded-full px-4 py-2 text-xs inline-flex items-center gap-1.5">HBCSE 2026–27 cycle <ExternalLink className="w-3 h-3" /></a>
          <a href="https://olympiads.hbcse.tifr.res.in/how-to-prepare/past-papers/" target="_blank" rel="noreferrer" className="btn-ghost-gold rounded-full px-4 py-2 text-xs inline-flex items-center gap-1.5">Past papers <ExternalLink className="w-3 h-3" /></a>
        </div>
      </div>

      <p className="text-[11px] text-muted-foreground mt-5 leading-relaxed">
        Information is based on the official IOQM 2026 portal and HBCSE's 2026–27 Mathematical Olympiad announcement. Dates, eligibility, fees and procedures can change; students should verify the latest notice before registering or travelling to an examination centre.
      </p>
    </section>
  );
}

function InfoBox({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="glass rounded-2xl p-4">
      <div className="flex items-center gap-2 text-rose-gold mb-2">{icon}<span className="text-[10px] font-mono uppercase tracking-widest">{label}</span></div>
      <div className="text-sm font-medium">{value}</div>
    </div>
  );
}

function GuideBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="glass rounded-2xl p-5">
      <h3 className="font-serif text-xl mb-3">{title}</h3>
      <div className="text-xs text-muted-foreground leading-relaxed">{children}</div>
    </div>
  );
}

function AdminForm() {
  const [subject, setSubject] = useState("");
  const [topics, setTopics] = useState("");
  const [examDate, setExamDate] = useState("");
  const [blurb, setBlurb] = useState("");
  const [resources, setResources] = useState<OlympiadResource[]>([]);
  const [resTitle, setResTitle] = useState("");
  const [resUrl, setResUrl] = useState("");

  function addResource() {
    if (!resTitle.trim() || !resUrl.trim()) return;
    setResources((r) => [...r, { title: resTitle.trim(), url: resUrl.trim() }]);
    setResTitle(""); setResUrl("");
  }

  function add(e: React.FormEvent) {
    e.preventDefault();
    if (!subject.trim()) return;
    olympiadStore.update((prev) => [...prev, {
      id: uid(),
      subject: subject.trim(),
      topics: topics.split(",").map((t) => t.trim()).filter(Boolean),
      examDate: examDate || undefined,
      resources: resources.length ? resources : undefined,
      blurb: blurb.trim() || undefined,
    }]);
    setSubject(""); setTopics(""); setExamDate(""); setBlurb(""); setResources([]);
  }

  return (
    <form onSubmit={add} className="glass-strong rounded-2xl p-4 mb-6 space-y-3">
      <div className="text-xs font-mono uppercase tracking-widest text-rose-gold">Add olympiad</div>
      <input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Subject (e.g. Mathematics)" className="w-full glass rounded-xl px-4 py-2.5 text-sm bg-transparent outline-none" />
      <input value={topics} onChange={(e) => setTopics(e.target.value)} placeholder="Topics (comma separated, optional)" className="w-full glass rounded-xl px-4 py-2.5 text-sm bg-transparent outline-none" />
      <div className="grid sm:grid-cols-2 gap-3">
        <input type="date" value={examDate} onChange={(e) => setExamDate(e.target.value)} className="glass rounded-xl px-4 py-2.5 text-sm bg-transparent outline-none" />
        <input value={blurb} onChange={(e) => setBlurb(e.target.value)} placeholder="Short description (optional)" className="glass rounded-xl px-4 py-2.5 text-sm bg-transparent outline-none" />
      </div>
      <div className="glass rounded-xl p-3 space-y-2">
        <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Resources (optional)</div>
        <div className="grid sm:grid-cols-[1fr_1fr_auto] gap-2">
          <input value={resTitle} onChange={(e) => setResTitle(e.target.value)} placeholder="Resource title" className="glass rounded-lg px-3 py-2 text-xs bg-transparent outline-none" />
          <input value={resUrl} onChange={(e) => setResUrl(e.target.value)} placeholder="URL" className="glass rounded-lg px-3 py-2 text-xs bg-transparent outline-none" />
          <button type="button" onClick={addResource} className="btn-ghost-gold rounded-full px-3 py-1.5 text-xs">+ Add</button>
        </div>
        {resources.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {resources.map((r, i) => (
              <span key={i} className="text-[11px] glass rounded-full px-2.5 py-0.5 flex items-center gap-1.5">{r.title}<button type="button" onClick={() => setResources((rr) => rr.filter((_, j) => j !== i))}><X className="w-3 h-3" /></button></span>
            ))}
          </div>
        )}
      </div>
      <button className="btn-phoenix rounded-full px-5 py-2.5 text-sm w-full flex items-center justify-center gap-2"><Plus className="w-4 h-4" /> Add olympiad</button>
    </form>
  );
}

function Grid({ items, isAdmin }: { items: OlympiadItem[]; isAdmin: boolean }) {
  if (items.length === 0) return <div className="glass rounded-2xl p-10 text-center text-sm text-muted-foreground">No olympiads listed yet. {isAdmin ? "Add one above." : "Check back soon."}</div>;
  return (
    <div className="grid sm:grid-cols-2 gap-5">
      {items.map((o) => (
        <div key={o.id} className="glass rounded-2xl p-6 relative">
          {isAdmin && <button onClick={() => olympiadStore.update((p) => p.filter((x) => x.id !== o.id))} className="absolute top-3 right-3 text-muted-foreground hover:text-crimson p-1.5"><Trash2 className="w-4 h-4" /></button>}
          <Trophy className="w-7 h-7 text-rose-gold mb-3" strokeWidth={1.2} />
          <div className="font-serif text-2xl mb-2">{o.subject}</div>
          {o.blurb && <p className="text-sm text-muted-foreground mb-4">{o.blurb}</p>}
          {o.topics.length > 0 && (
            <>
              <div className="text-[10px] font-mono uppercase tracking-widest text-rose-gold mb-2">Topics</div>
              <div className="flex flex-wrap gap-1.5 mb-4">
                {o.topics.map((s) => <span key={s} className="text-[11px] glass rounded-full px-2.5 py-0.5">{s}</span>)}
              </div>
            </>
          )}
          {o.examDate && <div className="text-xs text-muted-foreground mb-3"><span className="font-mono uppercase tracking-widest text-rose-gold mr-2">Exam</span>{new Date(o.examDate).toLocaleDateString()}</div>}
          {o.resources && o.resources.length > 0 && (
            <>
              <div className="text-[10px] font-mono uppercase tracking-widest text-rose-gold mb-2">Resources</div>
              <ul className="text-xs space-y-1">
                {o.resources.map((r, i) => (
                  <li key={i}>
                    {i === 0 ? (
                      <a href={r.url} target="_blank" rel="noreferrer" className="text-rose-gold hover:underline inline-flex items-center gap-1">{r.title} <ExternalLink className="w-3 h-3" /></a>
                    ) : (
                      <PaidGate label="Locked" className="inline-block">
                        <a href={r.url} target="_blank" rel="noreferrer" className="text-rose-gold hover:underline inline-flex items-center gap-1">{r.title} <ExternalLink className="w-3 h-3" /></a>
                      </PaidGate>
                    )}
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      ))}
    </div>
  );
}
