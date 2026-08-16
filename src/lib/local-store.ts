// Firestore-backed reactive store. Drop-in replacement for the old localStorage store —
// preserves the same .get() / .set() / .update(fn) / .use() API so existing pages keep working.
//
// Each store maps to a Firestore collection. Items must have an `id` field (string).
// onSnapshot keeps an in-memory cache; .update(fn) diffs old vs new and writes the delta.

import { useSyncExternalStore } from "react";
import { toast } from "sonner";
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  or,
  type Unsubscribe,
  type Query,
} from "firebase/firestore";
import { db } from "./firebase";
import { authApi, type AuthUser } from "./auth";

type WithId = { id: string } & Record<string, unknown>;

const starterDebates: WithId[] = [
  {
    id: "starter-cjp-change",
    topic: "Is CJP a group that genuinely wants change, or is it mainly ideological?",
    authorEmail: "starter@skillnests.in",
    authorName: "SkillNests Debate",
    body: "Discuss the goals, methods and public perception of CJP. What evidence would support either interpretation? Consider the difference between ideological positioning and concrete policy change. Present evidence for your view and respond to opposing arguments.",
    createdAt: "2026-08-15T03:33:04.000Z",
  },
  {
    id: "starter-reservation-policy",
    topic: "Is India's current reservation policy justified in its present form?",
    authorEmail: "starter@skillnests.in",
    authorName: "SkillNests Debate",
    body: "Should reservation continue in its current structure, be expanded, be redesigned around different indicators, or be gradually reduced? Discuss social justice, historical disadvantage, representation, merit, economic conditions and access to opportunity. Support your position with evidence and address the strongest counterargument.",
    createdAt: "2026-08-15T03:32:00.000Z",
  },
  {
    id: "starter-ai-jobs",
    topic: "Should governments regulate AI development more aggressively even if it slows innovation?",
    authorEmail: "starter@skillnests.in",
    authorName: "SkillNests Debate",
    body: "Debate the trade-off between innovation, employment, privacy, safety and accountability. What level of regulation is reasonable, and who should set the rules?",
    createdAt: "2026-08-14T03:30:00.000Z",
  },
  {
    id: "starter-climate-responsibility",
    topic: "Should countries that historically emitted more greenhouse gases bear a larger share of climate costs?",
    authorEmail: "starter@skillnests.in",
    authorName: "SkillNests Debate",
    body: "Consider historical emissions, present-day development needs, per-capita emissions and the ability to pay. Argue whether responsibility should be distributed equally or differently.",
    createdAt: "2026-08-13T03:30:00.000Z",
  },
  {
    id: "starter-refugee-policy",
    topic: "Should states prioritize stronger border controls or greater protection for refugees?",
    authorEmail: "starter@skillnests.in",
    authorName: "SkillNests Debate",
    body: "Explore humanitarian obligations, national security, economic capacity and international responsibility. What policy could balance these competing concerns?",
    createdAt: "2026-08-12T03:30:00.000Z",
  },
  {
    id: "starter-political-funding",
    topic: "Should political funding in India have stricter transparency requirements?",
    authorEmail: "starter@skillnests.in",
    authorName: "SkillNests Debate",
    body: "Debate whether greater disclosure of political donations would strengthen democracy and accountability, and how transparency rules could protect legitimate donors while reducing undue influence.",
    createdAt: "2026-08-11T03:30:00.000Z",
  },
  {
    id: "starter-anti-defection",
    topic: "Does India's anti-defection law strengthen political stability or weaken legislators' independence?",
    authorEmail: "starter@skillnests.in",
    authorName: "SkillNests Debate",
    body: "Consider party discipline, voter mandates, government stability and the freedom of elected representatives to disagree with their parties. Should the law be changed, narrowed or retained?",
    createdAt: "2026-08-10T03:30:00.000Z",
  },
  {
    id: "starter-federalism",
    topic: "Does India need a stronger federal balance between the Union and the states?",
    authorEmail: "starter@skillnests.in",
    authorName: "SkillNests Debate",
    body: "Discuss fiscal powers, legislative responsibilities, national standards and state autonomy. Which areas require stronger central coordination, and where should states have greater discretion?",
    createdAt: "2026-08-09T03:30:00.000Z",
  },
  {
    id: "starter-education-reform",
    topic: "Should Indian schools place more weight on skills and projects than high-stakes examinations?",
    authorEmail: "starter@skillnests.in",
    authorName: "SkillNests Debate",
    body: "Compare standardized examinations with project-based learning, practical skills and continuous assessment. Consider fairness, scalability, academic rigor and preparation for higher education.",
    createdAt: "2026-08-08T03:30:00.000Z",
  },
  {
    id: "starter-social-media-democracy",
    topic: "Does social media strengthen democratic participation more than it harms public discourse?",
    authorEmail: "starter@skillnests.in",
    authorName: "SkillNests Debate",
    body: "Consider political participation, access to information, misinformation, polarization and algorithmic amplification. Argue which effects are most significant and what safeguards, if any, are justified.",
    createdAt: "2026-08-07T03:30:00.000Z",
  },
];

export function createLocalStore<T extends WithId[]>(
  collectionName: string, 
  initial: T,
  buildQuery?: (col: ReturnType<typeof collection>, user: AuthUser) => Query,
  notifyName?: string
) {
  const effectiveInitial = (collectionName === "sn-mun-debates" && initial.length === 0
    ? starterDebates
    : initial) as T;
  let cache: T = effectiveInitial;
  let started = false;
  let unsub: Unsubscribe | null = null;
  const listeners = new Set<() => void>();

  function start() {
    if (started || typeof window === "undefined") return;
    started = true;

    const begin = () => {
      if (unsub) return;
      try {
        const user = authApi.current();
        if (!user) return;
        const ref = buildQuery ? buildQuery(collection(db, collectionName), user) : collection(db, collectionName);
        const storageKey = `sn-seen-ids-${collectionName}`;
        const stored = localStorage.getItem(storageKey);
        // If stored is null, it's the first time visiting on this device. We don't want a toast storm of everything ever created.
        let seenIds = stored ? new Set<string>(JSON.parse(stored)) : null;

        unsub = onSnapshot(ref, (snap) => {
          const next = snap.docs.map((d) => ({ id: d.id, ...(d.data() as object) })) as unknown as T;
          const initialMap = new Map(effectiveInitial.map((item) => [item.id, item]));
          for (const item of next) initialMap.set(item.id, item);
          const merged = Array.from(initialMap.values()) as T;
          
          if (notifyName && !user.isAdmin) {
            if (seenIds) {
              const added = merged.filter((n) => !seenIds!.has(n.id));
              if (added.length > 0) {
                toast(`Oh! The Admin added something in ${notifyName}, check it out!`, { icon: "✨" });
              }
            }
            
            seenIds = new Set(merged.map((n) => n.id));
            localStorage.setItem(storageKey, JSON.stringify(Array.from(seenIds)));
          }

          cache = merged;
          listeners.forEach((l) => l());
        }, () => { /* permission errors swallowed; cache stays */ });
      } catch { /* ignore */ }
    };

    if (authApi.current()) begin();
    authApi.subscribe(() => {
      if (authApi.current()) begin();
      else { unsub?.(); unsub = null; cache = effectiveInitial; listeners.forEach((l) => l()); }
    });
  }

  function read(): T { start(); return cache; }

  async function writeDelta(prev: T, next: T) {
    const prevMap = new Map(prev.map((it) => [it.id, it]));
    const nextMap = new Map(next.map((it) => [it.id, it]));
    const ops: Promise<unknown>[] = [];
    for (const [id, item] of nextMap) {
      const before = prevMap.get(id);
      if (!before || JSON.stringify(before) !== JSON.stringify(item)) {
        const { id: _omit, ...payload } = item as WithId;
        // Firebase SDK crashes if we pass undefined values. Strip them out.
        const cleanPayload = Object.fromEntries(Object.entries(payload).filter(([_, v]) => v !== undefined));
        ops.push(setDoc(doc(db, collectionName, id), cleanPayload));
      }
    }
    for (const id of prevMap.keys()) {
      if (!nextMap.has(id)) ops.push(deleteDoc(doc(db, collectionName, id)));
    }
    try { await Promise.all(ops); } catch (e) { console.error(`[${collectionName}] write failed`, e); }
  }

  function set(v: T) {
    const prev = cache;
    cache = v;
    listeners.forEach((l) => l());
    void writeDelta(prev, v);
  }

  function update(fn: (prev: T) => T) { set(fn(read())); }

  function subscribe(cb: () => void) {
    start();
    listeners.add(cb);
    return () => { listeners.delete(cb); };
  }

  return {
    get: read,
    set,
    update,
    use: () => useSyncExternalStore(subscribe, read, () => effectiveInitial),
  };
}

export function uid() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
}
