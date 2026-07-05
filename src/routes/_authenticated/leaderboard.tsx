import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/site/Navbar";
import { gamificationStore } from "@/stores";
import { motion } from "framer-motion";
import { Trophy, Medal, Award, Crown } from "lucide-react";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/_authenticated/leaderboard")({
  ssr: false,
  head: () => ({ meta: [{ title: "Leaderboard - SkillNests" }] }),
  component: LeaderboardPage,
});

function LeaderboardPage() {
  const { user } = useAuth();
  const profiles = gamificationStore.use();
  
  // Sort profiles by XP in descending order
  const sortedProfiles = [...profiles].sort((a, b) => b.xp - a.xp);

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0: return <Crown className="w-6 h-6 text-yellow-400 drop-shadow-md" />;
      case 1: return <Medal className="w-6 h-6 text-slate-300 drop-shadow-md" />;
      case 2: return <Award className="w-6 h-6 text-amber-600 drop-shadow-md" />;
      default: return <span className="font-mono text-muted-foreground w-6 text-center">#{index + 1}</span>;
    }
  };

  const getRankColor = (index: number) => {
    switch (index) {
      case 0: return "bg-yellow-400/10 border-yellow-400/20";
      case 1: return "bg-slate-300/10 border-slate-300/20";
      case 2: return "bg-amber-600/10 border-amber-600/20";
      default: return "glass";
    }
  };

  return (
    <main className="min-h-screen">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-28 pb-16">
        <div className="text-center mb-12">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", bounce: 0.5 }}
            className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-rose-gold/10 text-rose-gold mb-6"
          >
            <Trophy className="w-10 h-10" />
          </motion.div>
          <h1 className="font-serif text-4xl sm:text-5xl mb-4">Hall of Fame</h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Earn XP by setting daily goals, completing tasks, joining meetings, and sharing your skills with the community.
          </p>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {sortedProfiles.length === 0 ? (
            <div className="text-center p-12 glass-strong rounded-3xl">
              <p className="text-muted-foreground">The leaderboard is currently empty. Be the first to earn XP!</p>
            </div>
          ) : (
            sortedProfiles.map((profile, index) => {
              const isCurrentUser = user?.uid === profile.id;
              
              return (
                <div 
                  key={profile.id}
                  className={`flex items-center p-4 sm:p-5 rounded-2xl border transition-all hover:scale-[1.01] ${getRankColor(index)} ${isCurrentUser ? "ring-2 ring-rose-gold/50" : ""}`}
                >
                  <div className="flex items-center justify-center w-12 shrink-0">
                    {getRankIcon(index)}
                  </div>
                  
                  <div className="flex-1 ml-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-serif text-lg">{profile.name}</span>
                        {isCurrentUser && (
                          <span className="text-[10px] font-mono uppercase tracking-widest bg-rose-gold text-white px-2 py-0.5 rounded-full">
                            You
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        Level {profile.level} Master
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 text-right">
                      <span className="text-2xl font-serif text-gradient-gold">{profile.xp}</span>
                      <span className="text-xs text-muted-foreground uppercase tracking-widest font-mono">XP</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </motion.div>
      </div>
    </main>
  );
}
