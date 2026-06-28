import { motion, AnimatePresence, useInView, useMotionValue, useSpring, useTransform, animate } from "framer-motion";
import { Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  BookOpen, Compass, Trophy, Users, Code2,
  ArrowUpRight, Sparkles, Quote,
} from "lucide-react";
import logoAsset from "@/assets/skillnestslogo.jpeg";

const pillars = [
  { icon: BookOpen, label: "Academic Excellence", sub: "PYQ Repository", to: "/pyq" },
  { icon: Compass, label: "Career Guidance", sub: "& Motivation", to: "/career-guidance" },
  { icon: Trophy, label: "Olympiad Section", sub: "Sharpen the edge", to: "/olympiads" },
  { icon: Users, label: "Skill Sharing", sub: "Peer Community", to: "/skill-share" },
  { icon: Code2, label: "Coding Campus", sub: "Build & ship", to: "/coding-campus" },
];


const rotatingWords = ["complete", "compose", "cultivate", "create", "kindle"];

function Embers() {
  // deterministic positions so SSR + hydration match
  const seeds = Array.from({ length: 22 }, (_, i) => i);
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {seeds.map((i) => {
        const left = (i * 47) % 100;
        const delay = (i * 0.37) % 6;
        const duration = 8 + ((i * 1.7) % 9);
        const size = 2 + (i % 3);
        return (
          <span
            key={i}
            className="ember"
            style={{
              left: `${left}%`,
              width: size,
              height: size,
              animationDuration: `${duration}s`,
              animationDelay: `${delay}s`,
              opacity: 0.55,
            }}
          />
        );
      })}
    </div>
  );
}

function CursorSpotlight({ targetRef }: { targetRef: React.RefObject<HTMLElement | null> }) {
  const x = useMotionValue(-1000);
  const y = useMotionValue(-1000);
  const sx = useSpring(x, { stiffness: 80, damping: 20, mass: 0.6 });
  const sy = useSpring(y, { stiffness: 80, damping: 20, mass: 0.6 });
  const bg = useTransform([sx, sy], ([lx, ly]) =>
    `radial-gradient(380px circle at ${lx}px ${ly}px, oklch(0.65 0.16 30 / 0.18), transparent 65%)`
  );
  useEffect(() => {
    const el = targetRef.current;
    if (!el) return;
    let raf = 0;
    const onMove = (e: PointerEvent) => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        const r = el.getBoundingClientRect();
        x.set(e.clientX - r.left);
        y.set(e.clientY - r.top);
        raf = 0;
      });
    };
    const onLeave = () => { x.set(-1000); y.set(-1000); };
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [targetRef, x, y]);
  return <motion.div aria-hidden className="pointer-events-none absolute inset-0 z-[1]" style={{ background: bg }} />;
}

function CountUp({ to, suffix = "", prefix = "", decimals = 0, duration = 1.8 }: { to: number; suffix?: string; prefix?: string; decimals?: number; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, to, {
      duration,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => setVal(v),
    });
    return () => controls.stop();
  }, [inView, to, duration]);
  const display = decimals > 0 ? val.toFixed(decimals) : Math.round(val).toLocaleString();
  return <span ref={ref}>{prefix}{display}{suffix}</span>;
}

export function Hero() {
  const heroRef = useRef<HTMLElement>(null);
  return (
    <section ref={heroRef} className="relative min-h-[100svh] w-full overflow-hidden pt-20 pb-10">
      <CursorSpotlight targetRef={heroRef} />
      {/* ambient lighting */}
      <div className="pointer-events-none absolute inset-0">
        <motion.div
          animate={{ scale: [1, 1.08, 1], opacity: [0.55, 0.7, 0.55] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute left-1/2 top-1/2 h-[60rem] w-[60rem] -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{ background: "radial-gradient(circle, oklch(0.55 0.18 28 / 0.32), transparent 60%)" }}
        />
        <motion.div
          animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          className="absolute left-[8%] top-[18%] h-[26rem] w-[26rem] rounded-full opacity-40"
          style={{ background: "radial-gradient(circle, oklch(0.7 0.09 40 / 0.18), transparent 70%)" }}
        />
        <motion.div
          animate={{ x: [0, -25, 0], y: [0, 15, 0] }}
          transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
          className="absolute right-[6%] bottom-[12%] h-[30rem] w-[30rem] rounded-full opacity-40"
          style={{ background: "radial-gradient(circle, oklch(0.62 0.12 45 / 0.22), transparent 70%)" }}
        />
        {/* hairline grid */}
        <div
          className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage:
              "linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)",
            backgroundSize: "80px 80px",
            color: "var(--rose-gold)",
            maskImage:
              "radial-gradient(ellipse at center, black 30%, transparent 75%)",
          }}
        />
      </div>

      <Embers />

      <div className="relative z-10 mx-auto max-w-[1400px] px-4 sm:px-6">
        <div className="grid grid-cols-12 gap-6">

          {/* LEFT SIDEBAR */}
          <motion.aside
            initial={{ opacity: 0, x: -24 }} animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="col-span-12 lg:col-span-3 order-2 lg:order-1 space-y-5">
            <div className="matte-glass rounded-2xl p-5 lg:sticky lg:top-28">
              <div className="mb-5 flex items-center justify-between">
                <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-rose-gold/90">The Nest</div>
                <div className="h-px flex-1 ml-3 bg-gradient-to-r from-rose-gold/40 to-transparent" />
              </div>

              <ul className="space-y-1.5">
                {pillars.map((p, i) => (
                  <motion.li key={p.label}
                    initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.15 + i * 0.07, duration: 0.5 }}>
                    <Link to={p.to as any} className="group flex items-center gap-3 rounded-xl px-3 py-3 transition-all duration-500 hover:bg-foreground/[0.04] hover:translate-x-1">
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-rose-gold/20 bg-foreground/[0.03] text-rose-gold transition-colors group-hover:border-rose-gold/50 group-hover:text-primary">
                        <p.icon className="h-4 w-4" strokeWidth={1.3} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block font-serif text-[15px] leading-tight text-foreground group-hover:text-primary transition-colors">{p.label}</span>
                        <span className="block text-[11px] text-muted-foreground italic">{p.sub}</span>
                      </span>
                      <ArrowUpRight className="h-3.5 w-3.5 text-rose-gold/40 opacity-0 transition-all duration-500 group-hover:opacity-100 group-hover:text-rose-gold" />
                    </Link>
                  </motion.li>
                ))}
              </ul>

              <div className="mt-5 pt-5 border-t border-border">
                <div className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground font-mono mb-2">Currently Live</div>
                <div className="flex items-center gap-2">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-crimson opacity-60" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-crimson" />
                  </span>
                  <span className="text-xs text-foreground/80">3 mentors in session</span>
                </div>
              </div>
            </div>

          </motion.aside>

          {/* CENTER STAGE */}
          <div className="col-span-12 lg:col-span-6 order-1 lg:order-2">
            <div className="flex flex-col items-center text-center px-2 sm:px-6 pt-2 pb-6">
              {/* emblem with rotating ring */}
              <motion.div
                initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
                className="relative mb-8">
                <motion.div
                  animate={{ scale: [1, 1.12, 1], opacity: [0.55, 0.85, 0.55] }}
                  transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute -inset-8 rounded-full"
                  style={{ background: "radial-gradient(circle, oklch(0.55 0.18 28 / 0.45), transparent 70%)" }}
                />
                {/* slow rotating outer ring with phoenix tick marks */}
                <motion.svg
                  viewBox="0 0 200 200"
                  className="absolute -inset-6 h-[calc(100%+3rem)] w-[calc(100%+3rem)]"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
                >
                  <circle cx="100" cy="100" r="96" fill="none" stroke="var(--rose-gold)" strokeOpacity="0.25" strokeDasharray="2 6" strokeWidth="0.8" />
                  {Array.from({ length: 12 }).map((_, i) => {
                    const a = (i / 12) * Math.PI * 2;
                    const x1 = 100 + Math.cos(a) * 92;
                    const y1 = 100 + Math.sin(a) * 92;
                    const x2 = 100 + Math.cos(a) * 98;
                    const y2 = 100 + Math.sin(a) * 98;
                    return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="var(--rose-gold)" strokeOpacity="0.5" strokeWidth="0.8" />;
                  })}
                </motion.svg>
                {/* counter-rotating inner ring */}
                <motion.div
                  animate={{ rotate: -360 }}
                  transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
                  className="absolute -inset-2 rounded-full border border-rose-gold/20"
                  style={{ borderStyle: "dashed" }}
                />
                <div className="relative h-32 w-32 sm:h-40 sm:w-40 rounded-full overflow-hidden border border-rose-gold/30 shadow-[0_0_50px_-8px_oklch(0.55_0.18_28/0.55)]">
                  <img src={logoAsset} alt="skillnests phoenix emblem" className="h-full w-full object-cover" />
                  <div className="absolute inset-0 rounded-full" style={{ boxShadow: "inset 0 0 30px oklch(0.15 0.03 25 / 0.5)" }} />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                transition={{ delay: 0.25, duration: 0.8 }}
                className="mb-5 flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.45em] text-rose-gold/90">
                <span className="h-px w-8 bg-rose-gold/40" />
                est. skillnests.in
                <span className="h-px w-8 bg-rose-gold/40" />
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                className="font-serif text-[2.75rem] sm:text-6xl md:text-7xl font-light leading-[0.98] tracking-tight">
                Education to{" "}
                <RotatingWord words={rotatingWords} />
                <br />
                your <span className="italic text-gradient-rose">future.</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.8 }}
                className="mt-6 font-serif italic text-xl sm:text-2xl text-foreground/85 font-light">
                Education that <span className="text-gradient-gold not-italic font-medium">completes</span> — and not competes.
              </motion.p>

              <motion.p
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7, duration: 0.8 }}
                className="mt-6 max-w-xl text-[15px] sm:text-base leading-relaxed text-muted-foreground">
                A sanctuary for holistic growth over relentless competition — where curiosity is craft,
                knowledge is community, and learning rises, quietly, like a phoenix.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9, duration: 0.7 }}
                className="mt-10 flex flex-wrap items-center justify-center gap-5">
                <Link to="/auth" className="btn-matte px-8 py-3.5 rounded-full text-sm font-medium tracking-wide">
                  Start Your Journey
                </Link>
                <Link to="/pyq" className="group inline-flex items-center gap-2 text-sm text-rose-gold tracking-wide">
                  <span className="relative">
                    Explore the Nest
                    <span className="absolute -bottom-0.5 left-0 h-px w-full bg-rose-gold/60 transition-all duration-500 group-hover:w-0" />
                    <span className="absolute -bottom-0.5 right-0 h-px w-0 bg-primary transition-all duration-500 group-hover:w-full" />
                  </span>
                  <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </Link>
              </motion.div>

            </div>
          </div>

          {/* RIGHT PANELS */}
          <motion.aside
            initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="col-span-12 lg:col-span-3 order-3 space-y-5 lg:sticky lg:top-28 self-start">

            {/* Quote card */}
            <div className="matte-glass rounded-2xl p-5 relative overflow-hidden">
              <Quote className="absolute -top-2 -right-2 h-16 w-16 text-rose-gold/10" strokeWidth={1} />
              <div className="text-[10px] font-mono uppercase tracking-[0.25em] text-rose-gold/90 mb-3">Founder's note</div>
              <p className="font-serif italic text-[15px] leading-snug text-foreground/90">
                "Rise quietly. Build deeply. The world will catch up."
              </p>
              <div className="mt-4 flex items-center gap-2">
                <div className="h-7 w-7 rounded-full overflow-hidden border border-rose-gold/30">
                  <img src={logoAsset} alt="" className="h-full w-full object-cover" />
                </div>
                <div className="text-[11px] text-muted-foreground">— The Skillnests Atelier</div>
              </div>
            </div>

            {/* Now playing card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.7 }}
              className="matte-glass rounded-2xl p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="text-[10px] font-mono uppercase tracking-[0.25em] text-rose-gold/90">Now in the Nest</div>
                <Sparkles className="h-3.5 w-3.5 text-rose-gold/80" strokeWidth={1.4} />
              </div>
              <div className="font-serif italic text-[15px] leading-snug text-foreground/90">
                "Engineering Pathways"
              </div>
              <div className="text-[11px] font-mono text-muted-foreground mt-1">live · 6:00 PM IST</div>
              <div className="mt-3 h-1 w-full rounded-full bg-foreground/[0.06] overflow-hidden">
                <motion.div
                  initial={{ width: "0%" }} animate={{ width: "62%" }}
                  transition={{ delay: 1.2, duration: 1.6, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-rose-gold via-copper to-crimson"
                />
              </div>
            </motion.div>

          </motion.aside>
        </div>

        {/* MARQUEE STRIP */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2, duration: 0.8 }}
          className="relative mt-8 overflow-hidden matte-glass rounded-2xl py-3"
          style={{
            maskImage: "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
          }}
        >
          <motion.div
            className="flex gap-10 whitespace-nowrap font-serif italic text-base sm:text-lg text-foreground/70"
            animate={{ x: ["0%", "-50%"] }}
            transition={{ duration: 38, repeat: Infinity, ease: "linear" }}
          >
            {Array.from({ length: 2 }).map((_, dup) => (
              <div key={dup} className="flex gap-10 shrink-0">
                {[
                  "PYQ Archives",
                  "✦",
                  "Olympiad Atelier",
                  "✦",
                  "Career Compass",
                  "✦",
                  "MUN & Debate",
                  "✦",
                  "Coding Campus",
                  "✦",
                  "Peer Skill Nests",
                  "✦",
                  "Founder's Corner",
                  "✦",
                ].map((t, i) => (
                  <span key={`${dup}-${i}`} className={t === "✦" ? "text-rose-gold/60" : ""}>{t}</span>
                ))}
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* STATS BAND */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.3, duration: 0.7 }}
          className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { node: <><CountUp to={2400} />+</>, v: "Learners in the nest" },
            { node: <><CountUp to={5} /> yrs</>, v: "PYQ archive depth" },
            { node: <CountUp to={48} />, v: "Mentors this week" },
            { node: <><CountUp to={12} />+</>, v: "Disciplines covered" },
          ].map((s, i) => (
            <motion.div key={s.v}
              initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.35 + i * 0.08, duration: 0.6 }}
              whileHover={{ y: -4, scale: 1.015 }}
              className="matte-glass rounded-2xl px-5 py-4 transition-shadow hover:shadow-[0_18px_50px_-22px_oklch(0.55_0.18_28/0.45)]">
              <div className="font-serif text-3xl text-gradient-gold">{s.node}</div>
              <div className="text-[11px] font-mono uppercase tracking-[0.2em] text-muted-foreground mt-1">{s.v}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>

    </section>
  );
}

function RotatingWord({ words }: { words: string[] }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % words.length);
    }, 2400);
    return () => clearInterval(interval);
  }, [words.length]);

  const longest = words.reduce((a, b) => (a.length >= b.length ? a : b));

  return (
    <span className="relative inline-flex items-center overflow-hidden align-bottom">
      <span className="invisible italic">{longest}</span>
      <span className="absolute inset-0 pointer-events-none flex items-center justify-start">
        <AnimatePresence mode="popLayout">
          <motion.span
            key={words[index]}
            className="italic text-gradient-phoenix block"
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: "0%", opacity: 1 }}
            exit={{ y: "-100%", opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            {words[index]}
          </motion.span>
        </AnimatePresence>
      </span>
    </span>
  );
}
