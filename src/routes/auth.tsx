import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Mail, Lock, ArrowLeft, Flame, User } from "lucide-react";
import { authApi, ADMIN_EMAIL, useAuth, isDeviceBlocked } from "@/lib/auth";
import { toast } from "sonner";

export const Route = createFileRoute("/auth")({
  ssr: false,
  head: () => ({ meta: [{ title: " - SkillNests" }] }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) navigate({ to: "/dashboard" });
  }, [isAuthenticated, navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      toast.error("Email and password required.");
      return;
    }
    setLoading(true);
    try {
      const u = mode === "signup"
        ? await authApi.signUp(email, password, name)
        : await authApi.signIn(email, password);
      toast.success(`Welcome${u.role === "admin" ? " back, Founders" : ""}.`);
      navigate({ to: "/dashboard" });
    } catch (err: any) {
      toast.error(err?.message?.replace("Firebase: ", "") ?? "Google sign-in failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setLoading(true);
    try {
      const u = await authApi.signInWithGoogle();
      toast.success(`Welcome${u.role === "admin" ? " back, Founders" : ""}.`);
      navigate({ to: "/dashboard" });
    } catch (err: any) {
      toast.error(err?.message?.replace("Firebase: ", "") ?? "Google sign-in failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative min-h-screen">
      <div className="min-h-screen grid place-items-center px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
          className="glass-strong rounded-3xl p-8 sm:p-10 w-full max-w-md"
        >
          <Link to="/" className="text-xs font-mono text-muted-foreground hover:text-rose-gold flex items-center gap-2 mb-8">
            <ArrowLeft className="w-3 h-3" /> back to nest
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full glass grid place-items-center">
              <Flame className="w-5 h-5 text-phoenix" strokeWidth={1.2} />
            </div>
            <h1 className="font-serif text-3xl">{mode === "signin" ? "Welcome back." : "Join the nest."}</h1>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Education that <span className="italic text-rose-gold">completes</span> — and not competes.
          </p>

          {isDeviceBlocked() && (
            <div className="glass rounded-2xl p-4 mb-6 border border-crimson/40 text-sm">
              <div className="font-medium text-crimson mb-1">Max 2 devices reached</div>
              <p className="text-xs text-muted-foreground">This account is already signed in on 2 devices. Sign out from one of them, or contact an admin at <a href="mailto:founders@skillnests.in" className="text-rose-gold">founders@skillnests.in</a> to reset.</p>
            </div>
          )}

          <button
            type="button"
            disabled={loading}
            onClick={handleGoogle}
            className="w-full flex items-center justify-center gap-3 glass rounded-full py-3 text-sm font-medium hover:border-rose-gold/50 transition disabled:opacity-60 mb-4"
          >
            <GoogleIcon /> Continue with Google
          </button>

          <div className="flex items-center gap-3 my-4">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">or</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            {mode === "signup" && (
              <Field icon={<User className="w-4 h-4" />} value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" label="Name" />
            )}
            <Field icon={<Mail className="w-4 h-4" />} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@nest.in" label="Email" required />
            <Field icon={<Lock className="w-4 h-4" />} type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 6 characters" label="Password" required />
            <button disabled={loading} type="submit" className="btn-phoenix pulse-glow w-full py-3.5 rounded-full font-semibold disabled:opacity-60">
              {loading ? "…" : mode === "signin" ? "Sign in" : "Create account"}
            </button>
          </form>

          <p className="text-center text-xs text-muted-foreground mt-6">
            {mode === "signin" ? "New here? " : "Already a member? "}
            <button onClick={() => setMode(mode === "signin" ? "signup" : "signin")} className="text-rose-gold hover:text-champagne">
              {mode === "signin" ? "Create an account →" : "Sign in →"}
            </button>
          </p>

          <p className="text-center text-[10px] font-mono text-muted-foreground/70 mt-6 leading-relaxed">
            Admin email: <span className="text-rose-gold">{ADMIN_EMAIL}</span>
          </p>
        </motion.div>
      </div>
    </main>
  );
}

function Field({ icon, label, ...props }: { icon: React.ReactNode; label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <div className="text-xs uppercase tracking-widest text-muted-foreground font-mono mb-2">{label}</div>
      <div className="flex items-center gap-3 glass rounded-xl px-4 py-3 focus-within:border-rose-gold/60 transition">
        <span className="text-rose-gold">{icon}</span>
        <input {...props} className="bg-transparent flex-1 outline-none text-sm placeholder:text-muted-foreground/60 text-foreground" />
      </div>
    </label>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.79 2.71v2.26h2.9c1.7-1.56 2.69-3.87 2.69-6.61z"/>
      <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.9-2.26c-.8.54-1.83.86-3.06.86-2.35 0-4.34-1.59-5.05-3.71H.95v2.33A9 9 0 0 0 9 18z"/>
      <path fill="#FBBC05" d="M3.95 10.71A5.41 5.41 0 0 1 3.66 9c0-.59.1-1.17.29-1.71V4.96H.95A9 9 0 0 0 0 9c0 1.45.35 2.82.95 4.04l3-2.33z"/>
      <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58A9 9 0 0 0 .95 4.96l3 2.33C4.66 5.17 6.65 3.58 9 3.58z"/>
    </svg>
  );
}
