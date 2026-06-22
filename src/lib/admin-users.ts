import { collection, doc, getDoc, getDocs, onSnapshot, query, setDoc, where } from "firebase/firestore";
import { db } from "./firebase";
import { ADMIN_EMAIL, FREE_EMAILS } from "./auth";

export type PaidUserMeta = { uid: string; email: string; name?: string; paidUntil?: string };
export type PaidStats = { paid: number; total: number; paidUsers: PaidUserMeta[]; freeUsers: PaidUserMeta[] };

function computeStats(docs: { id: string; data: { email?: string; paidUntil?: string; displayName?: string } }[]): PaidStats {
  const excluded = new Set<string>([ADMIN_EMAIL, ...FREE_EMAILS].map((e) => e.toLowerCase()));
  const now = Date.now();
  let paid = 0;
  let total = 0;
  const paidUsers: PaidUserMeta[] = [];
  const freeUsers: PaidUserMeta[] = [];
  for (const d of docs) {
    const email = (d.data.email || "").toLowerCase();
    if (!email || excluded.has(email)) continue;
    total += 1;
    const until = typeof d.data.paidUntil === "string" ? new Date(d.data.paidUntil).getTime() : 0;
    const u: PaidUserMeta = { uid: d.id, email: d.data.email || "", name: d.data.displayName, paidUntil: d.data.paidUntil };
    if (until > now) {
      paid += 1;
      paidUsers.push(u);
    } else {
      freeUsers.push(u);
    }
  }
  return { paid, total, paidUsers, freeUsers };
}

export async function getPaidStats(): Promise<PaidStats> {
  const snap = await getDocs(collection(db, "users"));
  return computeStats(snap.docs.map((d) => ({ id: d.id, data: d.data() as any })));
}

/** Realtime subscription — fires immediately and on every users-collection change. */
export function subscribePaidStats(cb: (s: PaidStats) => void): () => void {
  return onSnapshot(collection(db, "users"), (snap) => {
    cb(computeStats(snap.docs.map((d) => ({ id: d.id, data: d.data() as any }))));
  });
}

export type AdminUserRow = {
  uid: string;
  email: string;
  displayName?: string;
  role?: string;
  paid?: boolean;
  paidUntil?: string;
  devices?: { id: string; lastSeen: number; ua?: string }[];
};

export async function findUserByEmail(email: string): Promise<AdminUserRow | null> {
  const q = query(collection(db, "users"), where("email", "==", email.toLowerCase().trim()));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const d = snap.docs[0];
  return { uid: d.id, ...(d.data() as object) } as AdminUserRow;
}

export async function setUserPaid(uid: string, paid: boolean) {
  if (paid) {
    // Manual unlock by admin = +30 days from today
    const until = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    await setDoc(doc(db, "users", uid), { paid: true, paidUntil: until }, { merge: true });
  } else {
    await setDoc(doc(db, "users", uid), { paid: false, paidUntil: new Date(0).toISOString() }, { merge: true });
  }
}

/** Extend membership by 30 days from now OR from current paidUntil if still in the future. */
export async function extendPaidMonth(uid: string, extra?: { subscriptionId?: string; lastInvoiceId?: string; lastPaidAt?: number }) {
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);
  const data = snap.data() || {};
  const currentUntil = typeof data?.paidUntil === "string" ? new Date(data.paidUntil).getTime() : 0;
  const base = Math.max(currentUntil, Date.now());
  const until = new Date(base + 30 * 24 * 60 * 60 * 1000).toISOString();
  const patch: Record<string, unknown> = { paid: true, paidUntil: until };
  if (extra?.subscriptionId) patch.subscriptionId = extra.subscriptionId;
  if (extra?.lastInvoiceId) patch.lastInvoiceId = extra.lastInvoiceId;
  if (extra?.lastPaidAt) patch.lastPaidAt = extra.lastPaidAt;
  await setDoc(ref, patch, { merge: true });
  return until;
}

/** Reconcile a user's subscription with Razorpay: extend by 30d once per new paid invoice. */
export async function reconcileSubscriptionForUser(
  uid: string,
  fetchLatest: (subId: string) => Promise<{ paymentId: string | null; paidAt: number | null } | null>,
): Promise<{ extended: boolean; paidUntil?: string }> {
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);
  const data = snap.data() || {};
  const subId: string | undefined = typeof data?.subscriptionId === "string" ? data.subscriptionId : undefined;
  if (!subId) return { extended: false };
  const latest = await fetchLatest(subId);
  if (!latest || !latest.paymentId || !latest.paidAt) return { extended: false };
  const lastPaidAt: number = typeof data?.lastPaidAt === "number" ? data.lastPaidAt : 0;
  if (latest.paidAt <= lastPaidAt) return { extended: false };
  const until = await extendPaidMonth(uid, { subscriptionId: subId, lastInvoiceId: latest.paymentId, lastPaidAt: latest.paidAt });
  return { extended: true, paidUntil: until };
}

/** Set subscription metadata without extending. */
export async function setSubscriptionMeta(uid: string, patch: { subscriptionId?: string | null; subscriptionStatus?: string | null }) {
  const ref = doc(db, "users", uid);
  const update: Record<string, unknown> = {};
  if (patch.subscriptionId !== undefined) update.subscriptionId = patch.subscriptionId;
  if (patch.subscriptionStatus !== undefined) update.subscriptionStatus = patch.subscriptionStatus;
  await setDoc(ref, update, { merge: true });
}

export async function resetUserDevices(uid: string) {
  await setDoc(doc(db, "users", uid), { devices: [] }, { merge: true });
}

export async function getUser(uid: string): Promise<AdminUserRow | null> {
  const snap = await getDoc(doc(db, "users", uid));
  if (!snap.exists()) return null;
  return { uid, ...(snap.data() as object) } as AdminUserRow;
}
