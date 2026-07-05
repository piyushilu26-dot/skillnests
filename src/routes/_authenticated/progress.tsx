import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/site/Navbar";
import { useAuth } from "@/lib/auth";
import { useState, useEffect } from "react";
import { CheckCircle2, Circle, Plus, Trash2, TrendingUp, Trophy } from "lucide-react";
import { userProgressStore } from "@/stores";
import { uid } from "@/lib/local-store";
import { motion } from "framer-motion";

export const Route = createFileRoute("/_authenticated/progress")({
  ssr: false,
  component: ProgressPage,
});

function ProgressPage() {
  const { user } = useAuth();
  const goals = userProgressStore.use();
  
  const [draftGoal, setDraftGoal] = useState("");
  const [todayStr, setTodayStr] = useState("");

  useEffect(() => {
    // Just a simple YYYY-MM-DD for local timezone
    const d = new Date();
    setTodayStr(`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`);
  }, []);

  const todayGoals = goals.filter(g => g.date === todayStr);
  const completedToday = todayGoals.filter(g => g.completed).length;
  
  // Calculate a mock "streak" by grouping past completed goals
  const uniqueDatesCompleted = new Set(goals.filter(g => g.completed).map(g => g.date)).size;

  function addGoal(e: React.FormEvent) {
    e.preventDefault();
    if (!draftGoal.trim() || !user) return;
    
    userProgressStore.update(p => [{
      id: uid(),
      userId: user.uid,
      date: todayStr,
      task: draftGoal.trim(),
      completed: false,
      createdAt: new Date().toISOString()
    }, ...p]);
    setDraftGoal("");
  }

  function toggleGoal(id: string, currentlyCompleted: boolean) {
    userProgressStore.update(p => p.map(g => g.id === id ? { ...g, completed: !currentlyCompleted } : g));
  }

  function deleteGoal(id: string) {
    userProgressStore.update(p => p.filter(g => g.id !== id));
  }

  return (
    <main className="min-h-screen">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-28 pb-16">
        <div className="mb-8">
          <p className="text-xs font-mono uppercase tracking-widest text-rose-gold">my progress</p>
          <h1 className="font-serif text-4xl mt-1">Consistency is everything.</h1>
        </div>

        <div className="grid sm:grid-cols-2 gap-6 mb-10">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-strong rounded-3xl p-6 flex items-center gap-5">
            <div className="w-14 h-14 rounded-full bg-rose-gold/10 flex items-center justify-center text-rose-gold">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <div className="text-sm font-mono uppercase tracking-widest text-muted-foreground mb-1">Today</div>
              <div className="font-serif text-3xl">
                {completedToday} <span className="text-lg text-muted-foreground">/ {todayGoals.length} tasks</span>
              </div>
            </div>
          </motion.div>
          
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-strong rounded-3xl p-6 flex items-center gap-5">
            <div className="w-14 h-14 rounded-full bg-rose-gold/10 flex items-center justify-center text-rose-gold">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <div className="text-sm font-mono uppercase tracking-widest text-muted-foreground mb-1">Active Days</div>
              <div className="font-serif text-3xl">
                {uniqueDatesCompleted} <span className="text-lg text-muted-foreground">days</span>
              </div>
            </div>
          </motion.div>
        </div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <h2 className="font-serif text-2xl mb-4">Daily Study Checklist</h2>
          <form onSubmit={addGoal} className="relative mb-6">
            <input 
              value={draftGoal}
              onChange={e => setDraftGoal(e.target.value)}
              placeholder="What do you want to accomplish today?"
              className="w-full glass-strong rounded-full pl-6 pr-14 py-4 text-sm bg-transparent outline-none focus:border-rose-gold/40 transition"
            />
            <button type="submit" className="absolute right-2 top-2 bottom-2 aspect-square rounded-full bg-rose-gold/10 hover:bg-rose-gold text-rose-gold hover:text-white transition flex items-center justify-center">
              <Plus className="w-5 h-5" />
            </button>
          </form>

          <div className="space-y-3">
            {todayGoals.length === 0 ? (
              <div className="text-center py-10 text-sm text-muted-foreground italic glass rounded-3xl">
                No goals set for today yet. Start small!
              </div>
            ) : (
              todayGoals.sort((a,b) => b.createdAt.localeCompare(a.createdAt)).map(g => (
                <div key={g.id} className="glass rounded-2xl p-4 flex items-center gap-4 group">
                  <button 
                    onClick={() => toggleGoal(g.id, g.completed)}
                    className={`transition-colors shrink-0 ${g.completed ? 'text-rose-gold' : 'text-muted-foreground hover:text-rose-gold/70'}`}
                  >
                    {g.completed ? <CheckCircle2 className="w-6 h-6" /> : <Circle className="w-6 h-6" />}
                  </button>
                  <div className={`flex-1 text-sm transition-all ${g.completed ? 'text-muted-foreground line-through' : 'text-foreground/90'}`}>
                    {g.task}
                  </div>
                  <button 
                    onClick={() => deleteGoal(g.id)}
                    className="opacity-0 group-hover:opacity-100 p-2 text-muted-foreground hover:text-crimson transition shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>
    </main>
  );
}
