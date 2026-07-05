import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/site/Navbar";
import { useAuth } from "@/lib/auth";
import { useState } from "react";
import { CheckCircle2, Circle, Plus, Trash2, TrendingUp, Trophy, Clock, X } from "lucide-react";
import { userProgressStore, grantXP } from "@/stores";
import { uid } from "@/lib/local-store";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/progress")({
  ssr: false,
  component: ProgressPage,
});

function ProgressPage() {
  const { user } = useAuth();
  const goals = userProgressStore.use();
  
  const [draftGoal, setDraftGoal] = useState("");
  const [draftTime, setDraftTime] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Calculate todayStr synchronously
  const d = new Date();
  const todayStr = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;

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
      timeLimit: draftTime.trim() || undefined,
      completed: false,
      createdAt: new Date().toISOString()
    }, ...p]);
    setDraftGoal("");
    setDraftTime("");
    setIsModalOpen(false);
    
    grantXP(user, 5);
    toast.success("Goal added! +5 XP 🚀");
  }

  function toggleGoal(id: string, currentlyCompleted: boolean) {
    userProgressStore.update(p => p.map(g => g.id === id ? { ...g, completed: !currentlyCompleted } : g));
    if (!currentlyCompleted && user) {
      grantXP(user, 10);
      toast.success("Goal completed! +10 XP 🎉");
    }
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
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-serif text-2xl">Daily Study Checklist</h2>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="btn-phoenix rounded-full px-5 py-2.5 text-sm flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Add Goal
            </button>
          </div>

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
                    <div>{g.task}</div>
                    {g.timeLimit && (
                      <div className="inline-flex items-center gap-1 mt-1 text-[11px] font-mono uppercase tracking-widest text-rose-gold bg-rose-gold/10 px-2 py-0.5 rounded-full">
                        <Clock className="w-3 h-3" /> {g.timeLimit}
                      </div>
                    )}
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

      {/* Goal Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass-strong rounded-3xl w-full max-w-md p-6 relative overflow-hidden"
            >
              <button 
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-foreground transition rounded-full hover:bg-white/5"
              >
                <X className="w-5 h-5" />
              </button>
              
              <h3 className="font-serif text-2xl mb-2 text-gradient-gold">Set a New Goal</h3>
              <p className="text-sm text-muted-foreground mb-6">What do you want to accomplish today?</p>
              
              <form onSubmit={addGoal} className="space-y-4">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-widest text-muted-foreground mb-2 ml-1">Task Description</label>
                  <input 
                    value={draftGoal}
                    onChange={e => setDraftGoal(e.target.value)}
                    placeholder="e.g., Complete Math Chapter 4"
                    className="w-full glass rounded-xl px-4 py-3 text-sm bg-transparent outline-none focus:border-rose-gold/40 transition"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase tracking-widest text-muted-foreground mb-2 ml-1">Time Limit <span className="opacity-50">(Optional)</span></label>
                  <input 
                    value={draftTime}
                    onChange={e => setDraftTime(e.target.value)}
                    placeholder="e.g., 30 mins, 2 hours"
                    className="w-full glass rounded-xl px-4 py-3 text-sm bg-transparent outline-none focus:border-rose-gold/40 transition"
                  />
                </div>
                <div className="pt-2">
                  <button type="submit" disabled={!draftGoal.trim()} className="w-full btn-phoenix rounded-xl py-3 text-sm flex items-center justify-center gap-2 disabled:opacity-50 transition">
                    <Plus className="w-4 h-4" /> Save Goal
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
