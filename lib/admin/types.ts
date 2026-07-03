// lib/admin/types.ts
// Types partagés entre la couche de données admin (queries.ts) et l'UI.

export type MemberStatus = "validated" | "pending" | "refused" | "suspended";
export type Plan = "free" | "premium";

// ── UI génériques (graphiques, KPI) ──────────────────────────────────────────
export interface Kpi {
  label: string;
  value: string;
  delta?: string;
  up?: boolean;
  icon: string;   // clé lucide (kebab-case)
  accent: string; // hex
  accentBg: string; // hex
  spark?: number[];
}

export interface ChartPoint { day: number; inscriptions: number; validations: number; }
export interface DonutSegment { label: string; value: number; color: string; }
export interface MonthBar   { month: string; count: number; }
export interface CountryBar { country: string; count: number; }
export interface RevenuePoint { month: string; amount: number; }
export interface DayPoint     { day: number; count: number; }

export interface FeedItem {
  icon: string;
  tone: "green" | "amber" | "red";
  text: string;
  when: string;
}

export interface AdminNotification {
  id: string;
  icon: string;
  tone: "green" | "amber" | "red";
  text: string;
  when: string;
  read: boolean;
  href?: string;
}

// ── Lignes métier ─────────────────────────────────────────────────────────────
export interface MemberRow {
  id: string; // user_id
  name: string;
  email: string;
  age: number | null;
  location: string;
  status: MemberStatus;
  plan: Plan;
  joinedAt: string;
  // détails pour « Voir le profil complet »
  gender: string | null;
  job: string | null;
  education: string | null;
  maritalStatus: string | null;
  madhhab: string | null;
  bio: string | null;
  avatarUrl: string | null;
  completion: number;
}

export interface PendingProfileRow {
  userId: string;
  name: string;
  age: number | null;
  city: string;
  country: string;
  gender: string;
  job: string;
  edu: string;
  situation: string;
  madhhab: string;
  photos: string[]; // URLs
  sub: string;      // « Il y a 3 h »
}

export interface PhotoQueueItem {
  id: string;
  memberId: string; // user_id
  name: string;
  photoNum: number;
  url: string;
  when: string;
}

export interface ReportRow {
  id: string;
  reporter: string;
  reported: string;
  reportedUserId: string;
  reason: string;
  desc: string;
  when: string;
  sev: "high" | "medium" | "low";
}

export type SubStatus = "active" | "cancelled" | "expired";
export interface SubscriptionRow {
  id: string;
  userId: string;
  name: string;
  email: string;
  plan: string;    // « 1 mois », « 3 mois »…
  payment: string; // « Carte », « Wave »…
  status: SubStatus;
  expires: string;
  canRefund?: boolean;
}

export interface BoostRow {
  id: string;
  name: string;
  duration: string;
  remainingLabel: string;
  remainingPct: number;
}

export type PostStatus = "published" | "draft";
export interface BlogPostRow {
  id: string;
  title: string;
  category: string;
  author: string;
  date: string; // formatée ou « — »
  status: PostStatus;
  excerpt: string;
  content: string;
  coverImage: string | null;
  featured: boolean;
}

export type TicketUiStatus = "open" | "resolved";
export interface TicketRow {
  id: string;
  userId: string;
  name: string;
  email: string;
  title: string;
  category: string;
  when: string;
  status: TicketUiStatus;
  message: string;
}

export interface BroadcastRow {
  id: string;
  title: string;
  target: string; // « Membres Free · 1 511 destinataires »
  date: string;
}

export interface AdminAccountRow {
  id: string;
  name: string;
  email: string;
  role: string;
  status: "active" | "disabled";
  lastSeen: string;
  /** true = compte super-admin principal géré par les variables d'environnement */
  isMaster: boolean;
}

export interface AdminIdentity {
  name: string;
  email: string;
  role: string;
  /** true = connecté avec la clé maître env (pas de changement de mot de passe in-app) */
  isMaster: boolean;
}

export interface ApiServiceRow {
  id: string;
  name: string;
  desc: string;
  kind: "payment" | null;
  productionActive: boolean;
  identifier: string;
  hasSecret: boolean;
}

export interface LimitsSettings {
  contacts: number;
  conversations: number;
  coachQuestions: number;
  visitors: number;
}

export interface PricingSettings {
  launchPrice: number;
  normalPrice: number;
  refundWindow: number;
  autoValidate: boolean;
}

export interface BroadcastTargetCounts {
  all: number;
  free: number;
  premium: number;
  pending: number;
}
