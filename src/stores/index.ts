// All app data lives in Firestore via createLocalStore (Firebase-backed).

import { createLocalStore } from "@/lib/local-store";
import { query, where, or } from "firebase/firestore";

/* ---------------- PYQ ---------------- */
export type PYQStream = "boards" | "jee" | "neet";
export type PYQSubject = "Mathematics" | "Physics" | "Chemistry" | "Biology" | "English";
export type PYQClass = "11" | "12" | "Others";
export type PYQPaper = {
  id: string;
  stream?: PYQStream; // defaults to "boards" for legacy rows
  subject: PYQSubject;
  klass: PYQClass;
  year: number;
  title: string;
  url: string;
  uploadedAt: string;
};

export const pyqStore = createLocalStore<PYQPaper[]>("sn-pyq", [], undefined, "Past Year Questions");

/* ---------------- Notes ---------------- */
export type NoteDoc = {
  id: string;
  stream?: PYQStream;
  subject: PYQSubject;
  chapter: string;
  title: string;
  url: string;
  uploadedAt: string;
};
export const notesStore = createLocalStore<NoteDoc[]>("sn-notes", [], undefined, "Handwritten Notes");

/* ---------------- Meetings ---------------- */
export type Meeting = {
  id: string;
  kind: "global" | "peer";
  title: string;
  hostName: string;
  hostEmail: string;
  startsAt: string;
  meetUrl: string;
  description?: string;
  createdAt: string;
};
export const meetingsStore = createLocalStore<Meeting[]>("sn-meetings", []);

/* ---------------- Schedule ---------------- */
export type ScheduleEvent = {
  id: string;
  title: string;
  date: string;
  time: string;
  type: "academic" | "extracurricular" | "career" | "other";
  notes?: string;
  createdAt: string;
};
export const scheduleStore = createLocalStore<ScheduleEvent[]>("sn-schedule", [], undefined, "the Schedule");

/* ---------------- Chat ---------------- */
export type GroupMsg = { id: string; senderEmail: string; senderName: string; body: string; at: string };
export type DM = { id: string; from: string; to: string; body: string; at: string; senderName?: string };
export const groupChatStore = createLocalStore<GroupMsg[]>("sn-chat-group", []);
export const dmStore = createLocalStore<DM[]>("sn-chat-dm", [], (col, user) => 
  user.role === "admin" ? col as unknown as ReturnType<typeof query> : query(col, or(where("from", "==", user.email), where("to", "==", user.email)))
);

/* ---------------- Skill Share ---------------- */
export type SkillPost = {
  id: string;
  authorEmail: string;
  authorName: string;
  title: string;
  body: string;
  videoUrl?: string;
  classUrl?: string;
  createdAt: string;
};
export const skillStore = createLocalStore<SkillPost[]>("sn-skill", []);

/* ---------------- Coding Workshops ---------------- */
export type CodingWorkshop = {
  id: string;
  title: string;
  language: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  startsAt: string;
  meetUrl: string;
  blurb: string;
};
export const codingStore = createLocalStore<CodingWorkshop[]>("sn-coding", [], undefined, "Coding Workshops");

/* ---------------- Career Sessions ---------------- */
export type CareerLive = { id: string; title: string; mentor: string; startsAt: string; meetUrl: string };
export type CareerVideo = { id: string; title: string; speaker?: string; thumb?: string; videoUrl?: string; documentUrl?: string };
export const careerLiveStore = createLocalStore<CareerLive[]>("sn-career-live", [], undefined, "Career Guidance");
export const careerVideoStore = createLocalStore<CareerVideo[]>("sn-career-vids", [], undefined, "Career Guidance");

/* ---------------- Founder Inbox ---------------- */
export type FounderMsg = { id: string; fromName: string; fromEmail: string; body: string; at: string };
export const founderInboxStore = createLocalStore<FounderMsg[]>("sn-founder-inbox", []);

/* ---------------- Payment Requests ---------------- */
export type PaymentRequest = {
  id: string;
  uid: string;
  email: string;
  name: string;
  utr: string;
  note?: string;
  status: "pending" | "verified" | "rejected";
  at: string;
};
export const paymentRequestsStore = createLocalStore<PaymentRequest[]>("sn-payments", []);

/* ---------------- MUN (admin-controlled) ---------------- */
export type MunItem = {
  id: string;
  committee: string;
  title: string;
  agenda: string;
  blocs: string[];
  side?: "crimson" | "azure";
  documentUrl?: string;
};
export const munStore = createLocalStore<MunItem[]>("sn-mun", [], undefined, "Model UN");

/* ---------------- Olympiads (admin-controlled) ---------------- */
export type OlympiadResource = { title: string; url: string };
export type OlympiadItem = {
  id: string;
  subject: string;
  topics: string[];
  examDate?: string;
  resources?: OlympiadResource[];
  blurb?: string;
};
export const olympiadStore = createLocalStore<OlympiadItem[]>("sn-olympiads", [], undefined, "Olympiad");

/* ---------------- Notice Board ---------------- */
export type Notice = {
  id: string;
  title: string;
  body: string;
  authorName: string;
  createdAt: string;
};
export const noticeStore = createLocalStore<Notice[]>("sn-notices", [], undefined, "Notice Board");

/* ---------------- MUN Debates ---------------- */
export type MunDebate = {
  id: string;
  topic: string;
  authorEmail: string;
  authorName: string;
  body: string;
  createdAt: string;
};
export const munDebateStore = createLocalStore<MunDebate[]>("sn-mun-debates", [], undefined, "MUN Debates");

export type MunComment = {
  id: string;
  debateId: string;
  authorName: string;
  authorEmail: string;
  content: string;
  createdAt: string;
};
export const munCommentStore = createLocalStore<MunComment[]>("sn-mun-comments", []);

/* ---------------- Extra Section (Dynamic) ---------------- */
export type ExtraConfig = {
  id: string;
  name: string;
};
export const extraConfigStore = createLocalStore<ExtraConfig[]>("sn-extra-config", []);

export type ExtraContent = {
  id: string;
  type: "text" | "image" | "pdf";
  content: string; // URL for image/pdf, text body for text
  createdAt: string;
};
export const extraContentStore = createLocalStore<ExtraContent[]>("sn-extra-content", [], undefined, "Extra Resources");

/* ---------------- Progress Tracking ---------------- */
export type DailyGoal = {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  task: string;
  timeLimit?: string;
  completed: boolean;
  createdAt: string;
};
export const userProgressStore = createLocalStore<DailyGoal[]>("sn-progress", [], (col, user) => query(col, where("userId", "==", user.uid)));
