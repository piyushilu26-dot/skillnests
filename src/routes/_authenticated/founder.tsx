import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/site/Navbar";
import { useAuth } from "@/lib/auth";
import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, MessageCircle, Send, Sparkles } from "lucide-react";
import { founderInboxStore } from "@/stores";
import { uid } from "@/lib/local-store";
import { toast } from "sonner";
import founderPhoto from "@/assets/priyushsomething.jpeg";
import abhinavPhoto from "@/assets/abhinav.jpeg";
import sanviPhoto from "@/assets/sanvi.jpeg";
import miskaPhoto from "@/assets/miska rai.jpeg";
import aravPhoto from "@/assets/aravPhoto.jpg";
import anantPhoto from "@/assets/anant.jpeg";
import anamPhoto from "@/assets/anam.jpeg";

export const Route = createFileRoute("/_authenticated/founder")({
  ssr: false,
  head: () => ({ meta: [{ title: "SkillNests — The Team" }] }),
  component: FounderPage,
});

function FounderPage() {
  const { user } = useAuth();
  const [body, setBody] = useState("");
  const [sent, setSent] = useState(false);

  function send(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !body.trim()) return;
    founderInboxStore.update((prev) => [...prev, { id: uid(), fromName: user.name, fromEmail: user.email, body: body.trim(), at: new Date().toISOString() }]);
    setBody("");
    setSent(true);
    toast.success("Message delivered to the founder's inbox.");
    setTimeout(() => setSent(false), 4000);
  }

  return (
    <main className="min-h-screen">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-28 pb-20">
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.65 }}>
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 rounded-full border border-rose-gold/20 bg-rose-gold/5 px-4 py-2 text-[10px] font-mono uppercase tracking-[0.28em] text-rose-gold mb-5">
              <Sparkles className="w-3.5 h-3.5" /> The people behind SkillNests
            </div>
            <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl tracking-tight">Meet the Founders</h1>
            <p className="max-w-2xl mx-auto text-sm sm:text-base text-muted-foreground mt-4 leading-relaxed">
              A student-led team building a more collaborative, practical and connected learning experience.
            </p>
          </div>

          {(() => {
            const founders = [
              { name: "Piyush Raj", role: "Co-Founder & CEO", photo: founderPhoto, bio: "I've always felt a need for change in our education system, so I decided to build SkillNests so students can get access to everything while connecting with their peers.", email: "piyushilu26@gmail.com" },
              { name: "Miska Rai", role: "Co-Founder", photo: miskaPhoto, bio: "Finally it's time that we take a step towards skillnests.in.", email: "raimiska.8579@gmail.com" },
              { name: "Sanvi Kumar", role: "Co-Founder", photo: sanviPhoto, bio: "Finally it's time that we take a step towards skillnests.in.", email: "sanvi.kumarstm@gmail.com" },
              { name: "Abhinav Pratap", role: "Co-Founder", photo: abhinavPhoto, bio: "Let's come together at skillnests.in and escape the matrix. Let's make education more interactive.", email: "abhinavpratap666@gmail.com" },
              { name: "Anant Arya", role: "Co-Founder", photo: anantPhoto, bio: "Finally it's time that we take a step towards skillnests.in.", email: "bachcha690@gmail.com" },
            ];

            const coreMembers = [
              { name: "Arav Raj", photo: aravPhoto, bio: "Building initiatives that create opportunities and positive impact for students and society. Join us at SkillNests.", email: "aravrajraj842@gmail.com" },
              { name: "Anam Zia", photo: anamPhoto, bio: "Finally it's time that we take a step towards skillnests.in.", email: "ziaanam1522@gmail.com" },
            ];

            const PersonCard = ({ f, role, featured = false }: { f: any; role: string; featured?: boolean }) => (
              <motion.article whileHover={{ y: -5 }} transition={{ duration: 0.2 }} className={`group relative overflow-hidden rounded-[2rem] border border-rose-gold/10 bg-gradient-to-br from-background/90 via-background/70 to-rose-gold/[0.04] shadow-xl shadow-black/5 ${featured ? "p-7 sm:p-10" : "p-6 sm:p-7"}`}>
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-rose-gold/50 to-transparent" />
                <div className="absolute -right-20 -top-20 w-48 h-48 rounded-full bg-rose-gold/5 blur-3xl transition-all duration-500 group-hover:bg-rose-gold/10" />
                <div className={`relative flex ${featured ? "flex-col sm:flex-row items-center sm:items-start" : "flex-col items-center text-center"} gap-6`}>
                  <div className={`shrink-0 rounded-full p-1 bg-gradient-to-br from-rose-gold/60 via-rose-gold/10 to-transparent shadow-lg ${featured ? "w-36 h-36 sm:w-40 sm:h-40" : "w-28 h-28"}`}>
                    <div className="w-full h-full rounded-full overflow-hidden ring-4 ring-background/80">
                      <img src={f.photo} alt={f.name} className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${f.name === "Abhinav Pratap" ? "object-[center_25%]" : ""}`} />
                    </div>
                  </div>
                  <div className={`${featured ? "flex-1 text-center sm:text-left" : "w-full"}`}>
                    <p className="text-[10px] font-mono uppercase tracking-[0.24em] text-rose-gold mb-2">{role}</p>
                    <h2 className={`${featured ? "text-3xl sm:text-4xl" : "text-2xl"} font-serif tracking-tight`}>{f.name}</h2>
                    <div className="w-10 h-px bg-rose-gold/40 my-4 mx-auto sm:mx-0" />
                    <p className="text-sm text-muted-foreground leading-7 max-w-xl">{f.bio}</p>
                    {f.email && <div className="mt-5 inline-flex items-center gap-2 text-xs text-rose-gold/90"><Mail className="w-3.5 h-3.5 flex-shrink-0" /><a href={`mailto:${f.email}`} className="hover:underline break-all">{f.email}</a></div>}
                  </div>
                </div>
              </motion.article>
            );

            return (
              <>
                <section>
                  <div className="mb-5"><p className="text-[10px] font-mono uppercase tracking-[0.25em] text-rose-gold">01 / Leadership</p><h2 className="font-serif text-2xl sm:text-3xl mt-1">Founding Team</h2></div>
                  <div className="mb-8"><PersonCard f={founders[0]} role={founders[0].role} featured /></div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">{founders.slice(1).map((f) => <PersonCard key={f.email} f={f} role={f.role} />)}</div>
                </section>
                <section className="mt-16">
                  <div className="mb-6"><p className="text-[10px] font-mono uppercase tracking-[0.25em] text-rose-gold">02 / Core Team</p><h2 className="font-serif text-2xl sm:text-3xl mt-1">The Backbone</h2></div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">{coreMembers.map((f) => <PersonCard key={f.name} f={f} role="Core Member" />)}</div>
                </section>
              </>
            );
          })()}

          <form onSubmit={send} className="mt-16 rounded-[2rem] border border-rose-gold/10 bg-gradient-to-br from-background/80 to-rose-gold/[0.04] shadow-xl shadow-black/5 p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-5"><div className="w-9 h-9 rounded-full border border-rose-gold/20 bg-rose-gold/5 flex items-center justify-center"><MessageCircle className="w-4 h-4 text-rose-gold" strokeWidth={1.2} /></div><div><h2 className="font-serif text-2xl">Start a conversation</h2><p className="text-xs text-muted-foreground mt-0.5">Have an idea, question, or opportunity?</p></div></div>
            <p className="text-xs text-muted-foreground mb-4">Sent as <span className="text-rose-gold">{user?.name}</span> ({user?.email})</p>
            <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={6} placeholder="Write what's on your mind…" className="w-full rounded-2xl border border-rose-gold/10 bg-background/40 px-4 py-3 text-sm outline-none resize-none transition focus:border-rose-gold/40" />
            <div className="mt-4 flex items-center justify-between gap-3">{sent ? <span className="text-xs text-rose-gold">Delivered ✓</span> : <span className="text-xs text-muted-foreground">Press send when ready.</span>}<button className="btn-phoenix rounded-full px-5 py-2.5 text-sm flex items-center gap-2 ml-auto"><Send className="w-4 h-4" /> Send message</button></div>
          </form>
          <div className="mt-8 text-center"><p className="text-xs text-muted-foreground">For any queries, contact <a href="mailto:founders@skillnests.in" className="text-rose-gold hover:underline">founders@skillnests.in</a></p></div>
        </motion.div>
      </div>
    </main>
  );
}
