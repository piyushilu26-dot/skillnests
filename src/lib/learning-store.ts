import { query, where } from "firebase/firestore";
import { createLocalStore, uid } from "./local-store";
import { authApi } from "./auth";
import type { LearningEvent, LearningProfile } from "./learning-engine";

export const learningEventsStore = createLocalStore<LearningEvent[]>("sn-learning-events", [], (col, user) => query(col, where("userId", "==", user.uid)));
export const learningProfilesStore = createLocalStore<LearningProfile[]>("sn-learning-profiles", [], (col) => query(col));

export function recordLearningEvent(event: Omit<LearningEvent, "id" | "userId" | "createdAt">) {
  const user = authApi.current();
  if (!user) return;
  learningEventsStore.update(items => [...items, { ...event, id: uid(), userId: user.uid, createdAt: new Date().toISOString() }]);
}

export function saveLearningProfile(input: Omit<LearningProfile, "id" | "userId" | "updatedAt">) {
  const user = authApi.current();
  if (!user) return;
  const existing = learningProfilesStore.get().find(p => p.userId === user.uid);
  const profile: LearningProfile = { ...input, id: existing?.id ?? uid(), userId: user.uid, updatedAt: new Date().toISOString() };
  learningProfilesStore.update(items => existing ? items.map(p => p.userId === user.uid ? profile : p) : [...items, profile]);
}
