// lib/admin/queries.ts
// Couche de données admin — requêtes Supabase (service_role), côté serveur uniquement.

import { cache } from "react";
import { createAdminClient } from "@/lib/supabase/admin";
import { timeAgo, formatDate, formatDuration } from "@/lib/admin/format";
import type {
  Kpi, ChartPoint, DonutSegment, MonthBar, CountryBar, RevenuePoint, DayPoint,
  FeedItem, AdminNotification, MemberRow, PendingProfileRow, PhotoQueueItem,
  ReportRow, SubscriptionRow, BoostRow, BlogPostRow, TicketRow, BroadcastRow,
  AdminAccountRow, ApiServiceRow, LimitsSettings, PricingSettings,
  BroadcastTargetCounts, MemberStatus,
} from "@/lib/admin/types";
import type { AdminMember } from "@/lib/supabase/types";

const DEFAULT_LIMITS: LimitsSettings = { contacts: 3, conversations: 3, coachQuestions: 3, visitors: 2 };
const DEFAULT_PRICING: PricingSettings = { launchPrice: 10, normalPrice: 15, refundWindow: 7, autoValidate: false };

function fullName(first: string | null, last: string | null): string {
  return [first, last].filter(Boolean).join(" ") || "Membre";
}

function location(city: string | null, country: string | null): string {
  return [city, country].filter((v) => v && v.trim()).join(", ") || "—";
}

/** Compte par jour sur les `days` derniers jours (index 0 = il y a days-1 jours). */
function bucketByDay(dates: (string | null)[], days: number): number[] {
  const buckets = new Array<number>(days).fill(0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (const iso of dates) {
    if (!iso) continue;
    const d = new Date(iso);
    d.setHours(0, 0, 0, 0);
    const idx = days - 1 - Math.round((today.getTime() - d.getTime()) / 86_400_000);
    if (idx >= 0 && idx < days) buckets[idx]++;
  }
  return buckets;
}

const MONTH_LETTERS = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];

// ── Paramètres plateforme ─────────────────────────────────────────────────────

export const getPlatformSettings = cache(async (): Promise<{ limits: LimitsSettings; pricing: PricingSettings }> => {
  const supabase = createAdminClient();
  const { data } = await supabase.from("platform_settings").select("*").eq("id", 1).maybeSingle();
  return {
    limits:  { ...DEFAULT_LIMITS,  ...((data?.limits  ?? {}) as Partial<LimitsSettings>)  },
    pricing: { ...DEFAULT_PRICING, ...((data?.pricing ?? {}) as Partial<PricingSettings>) },
  };
});

// ── Compteurs globaux (sidebar / topbar / vue d'ensemble) ─────────────────────

export interface AdminCounts {
  totalMembers: number;
  newThisMonth: number;
  pendingProfiles: number;
  premiumMembers: number;
  openReports: number;
  pendingPhotos: number;
  openTickets: number;
  activeBoosts: number;
}

export const getAdminCounts = cache(async (): Promise<AdminCounts> => {
  const supabase = createAdminClient();
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const [total, newMonth, pending, premium, reports, photos, tickets, boosts] = await Promise.all([
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase.from("profiles").select("id", { count: "exact", head: true }).gte("created_at", monthStart.toISOString()),
    supabase.from("profiles").select("id", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("profiles").select("id", { count: "exact", head: true }).eq("is_premium", true),
    supabase.from("reports").select("id", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("profile_photos").select("id", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("support_tickets").select("id", { count: "exact", head: true }).in("status", ["open", "in_progress"]),
    supabase.from("boosts").select("id", { count: "exact", head: true }).gt("expires_at", new Date().toISOString()),
  ]);

  return {
    totalMembers:    total.count ?? 0,
    newThisMonth:    newMonth.count ?? 0,
    pendingProfiles: pending.count ?? 0,
    premiumMembers:  premium.count ?? 0,
    openReports:     reports.count ?? 0,
    pendingPhotos:   photos.count ?? 0,
    openTickets:     tickets.count ?? 0,
    activeBoosts:    boosts.count ?? 0,
  };
});

// ── Vue d'ensemble ────────────────────────────────────────────────────────────

export interface OverviewData {
  kpis: Kpi[];
  chart: ChartPoint[];
  distribution: DonutSegment[];
  activity: FeedItem[];
  pendingProfiles: number;
}

export async function getOverviewData(): Promise<OverviewData> {
  const supabase = createAdminClient();
  const counts = await getAdminCounts();
  const since30 = new Date(Date.now() - 30 * 86_400_000).toISOString();

  const [inscriptions, validations, statuses, recentProfiles, recentSubs, recentReports, recentValidated, recentBoosts] =
    await Promise.all([
      supabase.from("profiles").select("created_at").gte("created_at", since30).limit(10_000),
      supabase.from("profiles").select("validated_at").gte("validated_at", since30).limit(10_000),
      supabase.from("profiles").select("status").limit(10_000),
      supabase.from("profiles").select("first_name,last_name,created_at").order("created_at", { ascending: false }).limit(4),
      supabase.from("subscriptions").select("user_id,created_at,duration_months").eq("plan", "premium").order("created_at", { ascending: false }).limit(3),
      supabase.from("reports").select("reported_id,created_at").order("created_at", { ascending: false }).limit(3),
      supabase.from("profiles").select("first_name,last_name,validated_at").not("validated_at", "is", null).order("validated_at", { ascending: false }).limit(3),
      supabase.from("boosts").select("user_id,created_at,expires_at").order("created_at", { ascending: false }).limit(3),
    ]);

  // Noms pour les événements liés à un user_id
  const eventUserIds = [
    ...(recentSubs.data ?? []).map((s) => s.user_id),
    ...(recentReports.data ?? []).map((r) => r.reported_id),
    ...(recentBoosts.data ?? []).map((b) => b.user_id),
  ];
  const names = new Map<string, string>();
  if (eventUserIds.length > 0) {
    const { data: nameRows } = await supabase
      .from("profiles").select("user_id,first_name,last_name").in("user_id", eventUserIds);
    for (const n of nameRows ?? []) names.set(n.user_id, fullName(n.first_name, n.last_name));
  }

  // Graphique 30 jours
  const insBuckets = bucketByDay((inscriptions.data ?? []).map((r) => r.created_at), 30);
  const valBuckets = bucketByDay((validations.data ?? []).map((r) => r.validated_at), 30);
  const chart: ChartPoint[] = insBuckets.map((v, i) => ({ day: i + 1, inscriptions: v, validations: valBuckets[i] }));

  // Répartition
  const byStatus: Record<string, number> = {};
  for (const row of statuses.data ?? []) byStatus[row.status] = (byStatus[row.status] ?? 0) + 1;
  const distribution: DonutSegment[] = [
    { label: "Validés",             value: byStatus["validated"] ?? 0, color: "#10b981" },
    { label: "En attente",          value: byStatus["pending"] ?? 0,   color: "#e8920c" },
    { label: "Refusés / Suspendus", value: (byStatus["refused"] ?? 0) + (byStatus["suspended"] ?? 0), color: "#df4548" },
  ];

  // Flux d'activité — fusion des événements récents
  type RawEvent = FeedItem & { ts: number };
  const events: RawEvent[] = [];
  for (const p of recentProfiles.data ?? []) {
    events.push({ icon: "user-plus", tone: "green", text: `${fullName(p.first_name, p.last_name)} a soumis son profil`, when: timeAgo(p.created_at), ts: Date.parse(p.created_at) });
  }
  for (const s of recentSubs.data ?? []) {
    events.push({ icon: "crown", tone: "amber", text: `${names.get(s.user_id) ?? "Un membre"} a souscrit Premium (${s.duration_months} mois)`, when: timeAgo(s.created_at), ts: Date.parse(s.created_at) });
  }
  for (const r of recentReports.data ?? []) {
    events.push({ icon: "flag", tone: "red", text: `Nouveau signalement contre ${names.get(r.reported_id) ?? "un membre"}`, when: timeAgo(r.created_at), ts: Date.parse(r.created_at) });
  }
  for (const v of recentValidated.data ?? []) {
    if (!v.validated_at) continue;
    events.push({ icon: "shield-check", tone: "green", text: `${fullName(v.first_name, v.last_name)} validé(e) par l'équipe`, when: timeAgo(v.validated_at), ts: Date.parse(v.validated_at) });
  }
  for (const b of recentBoosts.data ?? []) {
    const hours = Math.round((Date.parse(b.expires_at) - Date.parse(b.created_at)) / 3_600_000);
    events.push({ icon: "zap", tone: "amber", text: `${names.get(b.user_id) ?? "Un membre"} a activé un Boost ${hours}h`, when: timeAgo(b.created_at), ts: Date.parse(b.created_at) });
  }
  const activity: FeedItem[] = events
    .sort((a, b) => b.ts - a.ts)
    .slice(0, 6)
    .map((e) => ({ icon: e.icon, tone: e.tone, text: e.text, when: e.when }));

  const conversion = counts.totalMembers > 0
    ? ((counts.premiumMembers / counts.totalMembers) * 100).toFixed(1).replace(".", ",")
    : "0";

  const kpis: Kpi[] = [
    { label: "Membres totaux", value: counts.totalMembers.toLocaleString("fr-FR"), delta: `+${counts.newThisMonth} ce mois`, up: true, icon: "users", accent: "#10b981", accentBg: "#ecfdf5", spark: insBuckets.slice(-12) },
    { label: "En attente de validation", value: String(counts.pendingProfiles), delta: "à traiter < 24 h", icon: "clock", accent: "#e8920c", accentBg: "#fdf3e3", spark: insBuckets.slice(-12) },
    { label: "Abonnés Premium", value: String(counts.premiumMembers), delta: `${conversion} % conversion`, up: true, icon: "crown", accent: "#0a8f63", accentBg: "#e7f7ef" },
    { label: "Signalements ouverts", value: String(counts.openReports), delta: counts.openReports > 0 ? "priorité haute" : "aucun en attente", icon: "flag", accent: "#df4548", accentBg: "#fceceb" },
  ];

  return { kpis, chart, distribution, activity, pendingProfiles: counts.pendingProfiles };
}

// ── Statistiques ──────────────────────────────────────────────────────────────

export interface StatsData {
  kpis: Kpi[];
  conversion: MonthBar[];
  messages: DayPoint[];
  countries: CountryBar[];
  revenue: RevenuePoint[];
}

export async function getStatsData(): Promise<StatsData> {
  const supabase = createAdminClient();
  const [counts, settings] = await Promise.all([getAdminCounts(), getPlatformSettings()]);
  const since30 = new Date(Date.now() - 30 * 86_400_000).toISOString();
  const yearStart = new Date();
  yearStart.setMonth(yearStart.getMonth() - 11);
  yearStart.setDate(1);
  yearStart.setHours(0, 0, 0, 0);

  const [msgs, premiumSubs, profileCountries, statuses] = await Promise.all([
    supabase.from("messages").select("created_at").gte("created_at", since30).limit(10_000),
    supabase.from("subscriptions").select("created_at,duration_months,price_usd").eq("plan", "premium").gte("created_at", yearStart.toISOString()).limit(10_000),
    supabase.from("profiles").select("country").limit(10_000),
    supabase.from("profiles").select("status").limit(10_000),
  ]);

  // Messages / jour (30 j)
  const msgBuckets = bucketByDay((msgs.data ?? []).map((m) => m.created_at), 30);
  const messages: DayPoint[] = msgBuckets.map((count, i) => ({ day: i + 1, count }));
  const msgPerDay = Math.round(msgBuckets.reduce((a, b) => a + b, 0) / 30);

  // Conversion Premium & revenus par mois (12 mois glissants)
  const monthCounts = new Array<number>(12).fill(0);
  const monthRevenue = new Array<number>(12).fill(0);
  const now = new Date();
  for (const s of premiumSubs.data ?? []) {
    const d = new Date(s.created_at);
    const idx = 11 - ((now.getFullYear() - d.getFullYear()) * 12 + (now.getMonth() - d.getMonth()));
    if (idx >= 0 && idx < 12) {
      monthCounts[idx]++;
      const price = s.price_usd ?? settings.pricing.launchPrice * (s.duration_months ?? 1);
      monthRevenue[idx] += Number(price);
    }
  }
  const monthLabel = (i: number) => MONTH_LETTERS[(now.getMonth() + 1 + i) % 12];
  const conversion: MonthBar[] = monthCounts.map((count, i) => ({ month: monthLabel(i), count }));
  const revenue: RevenuePoint[] = monthRevenue.map((amount, i) => ({ month: monthLabel(i), amount }));

  // Membres par pays (top 6)
  const byCountry: Record<string, number> = {};
  for (const row of profileCountries.data ?? []) {
    const c = row.country?.trim() || "Non renseigné";
    byCountry[c] = (byCountry[c] ?? 0) + 1;
  }
  const countries: CountryBar[] = Object.entries(byCountry)
    .sort((a, b) => b[1] - a[1]).slice(0, 6)
    .map(([country, count]) => ({ country, count }));

  // Taux de validation
  const byStatus: Record<string, number> = {};
  for (const row of statuses.data ?? []) byStatus[row.status] = (byStatus[row.status] ?? 0) + 1;
  const decided = (byStatus["validated"] ?? 0) + (byStatus["refused"] ?? 0);
  const valRate = decided > 0 ? (((byStatus["validated"] ?? 0) / decided) * 100).toFixed(1).replace(".", ",") : "—";

  const mrr = counts.premiumMembers * settings.pricing.launchPrice;

  const kpis: Kpi[] = [
    { label: "MRR (USD)", value: `${mrr.toLocaleString("fr-FR")} $`, delta: `${counts.premiumMembers} abonnés actifs`, up: true, icon: "dollar-sign", accent: "#10b981", accentBg: "#ecfdf5", spark: monthRevenue.slice(-12).map((v) => Math.round(v)) },
    { label: "Messages / jour", value: msgPerDay.toLocaleString("fr-FR"), delta: "moyenne 30 j", up: true, icon: "message-circle", accent: "#0a8f63", accentBg: "#e7f7ef", spark: msgBuckets.slice(-12) },
    { label: "Boosts actifs", value: String(counts.activeBoosts), delta: "temps réel", icon: "zap", accent: "#e8920c", accentBg: "#fdf3e3" },
    { label: "Taux de validation", value: valRate === "—" ? "—" : `${valRate} %`, delta: "profils acceptés", up: true, icon: "shield-check", accent: "#10b981", accentBg: "#ecfdf5" },
  ];

  return { kpis, conversion, messages, countries, revenue };
}

// ── Membres ───────────────────────────────────────────────────────────────────

/** Détails profil enrichis + abonnement, indexés par user_id. */
type MemberExtra = {
  height: number | null;
  languages: string | null;
  mosque_frequency: string | null;
  arabic_level: string | null;
  has_children: string | null;
  wants_children: string | null;
  can_relocate: string | null;
  polygamy: string | null;
  seeking: string | null;
  marriage_vision: string | null;
  interests: string | null;
};
type SubInfo = { amount: number | null; plan: string | null };

function toMemberRow(
  m: AdminMember,
  extra: Map<string, MemberExtra>,
  subs: Map<string, SubInfo>,
): MemberRow {
  const e = extra.get(m.user_id);
  const sub = subs.get(m.user_id);
  return {
    id: m.user_id,
    name: fullName(m.first_name, m.last_name),
    email: m.email,
    age: m.age,
    location: location(m.city, m.country),
    city: m.city,
    country: m.country,
    status: m.status as MemberStatus,
    plan: m.is_premium ? "premium" : "free",
    subscriptionAmount: m.is_premium ? sub?.amount ?? null : null,
    subscriptionPlan: m.is_premium ? sub?.plan ?? null : null,
    joinedAt: m.created_at,
    gender: m.gender,
    job: m.job,
    education: m.education,
    maritalStatus: m.marital_status,
    madhhab: m.madhhab,
    bio: m.bio,
    avatarUrl: m.avatar_url,
    completion: m.profile_completion,
    height: e?.height ?? null,
    languages: e?.languages ?? null,
    mosqueFrequency: e?.mosque_frequency ?? null,
    arabicLevel: e?.arabic_level ?? null,
    hasChildren: e?.has_children ?? null,
    wantsChildren: e?.wants_children ?? null,
    canRelocate: e?.can_relocate ?? null,
    polygamy: e?.polygamy ?? null,
    seeking: e?.seeking ?? null,
    marriageVision: e?.marriage_vision ?? null,
    interests: e?.interests ?? null,
    lastSignInAt: m.last_sign_in_at,
  };
}

/** Charge les détails profil enrichis + le dernier abonnement premium par membre. */
async function loadMemberExtras(
  supabase: ReturnType<typeof createAdminClient>,
  userIds: string[],
): Promise<{ extra: Map<string, MemberExtra>; subs: Map<string, SubInfo> }> {
  const extra = new Map<string, MemberExtra>();
  const subs = new Map<string, SubInfo>();
  if (userIds.length === 0) return { extra, subs };

  const [profileRows, subRows] = await Promise.all([
    supabase
      .from("profiles")
      .select("user_id,height,languages,mosque_frequency,arabic_level,has_children,wants_children,can_relocate,polygamy,seeking,marriage_vision,interests")
      .in("user_id", userIds),
    supabase
      .from("subscriptions")
      .select("user_id,price_usd,duration_months,created_at")
      .eq("plan", "premium")
      .in("user_id", userIds)
      .order("created_at", { ascending: false }),
  ]);

  for (const p of profileRows.data ?? []) {
    extra.set(p.user_id, p as unknown as MemberExtra);
  }
  // Premier vu = le plus récent (tri desc) : on ne garde que celui-là par membre.
  for (const s of subRows.data ?? []) {
    if (subs.has(s.user_id)) continue;
    subs.set(s.user_id, {
      amount: s.price_usd != null ? Number(s.price_usd) : null,
      plan: s.duration_months != null ? `${s.duration_months} mois` : null,
    });
  }
  return { extra, subs };
}

export async function getMembers(): Promise<MemberRow[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("admin_members").select("*")
    .order("created_at", { ascending: false })
    .limit(2_000);
  if (error) throw new Error(error.message);

  const members = data ?? [];
  const { extra, subs } = await loadMemberExtras(supabase, members.map((m) => m.user_id));
  return members.map((m) => toMemberRow(m, extra, subs));
}

export async function searchMembers(q: string): Promise<MemberRow[]> {
  const supabase = createAdminClient();
  const like = `%${q.replace(/[%_]/g, "")}%`;
  const { data } = await supabase
    .from("admin_members").select("*")
    .or(`first_name.ilike.${like},last_name.ilike.${like},email.ilike.${like},city.ilike.${like}`)
    .limit(8);
  const members = data ?? [];
  const { extra, subs } = await loadMemberExtras(supabase, members.map((m) => m.user_id));
  return members.map((m) => toMemberRow(m, extra, subs));
}

// ── File de validation ────────────────────────────────────────────────────────

export async function getPendingProfiles(): Promise<PendingProfileRow[]> {
  const supabase = createAdminClient();
  const { data: profiles } = await supabase
    .from("profiles").select("*")
    .eq("status", "pending")
    .order("created_at", { ascending: true })
    .limit(200);

  if (!profiles || profiles.length === 0) return [];

  const { data: photos } = await supabase
    .from("profile_photos").select("user_id,url,order")
    .in("user_id", profiles.map((p) => p.user_id))
    .order("order", { ascending: true });

  const photosByUser = new Map<string, string[]>();
  for (const ph of photos ?? []) {
    const list = photosByUser.get(ph.user_id) ?? [];
    list.push(ph.url);
    photosByUser.set(ph.user_id, list);
  }

  return profiles.map((p) => ({
    userId: p.user_id,
    name: fullName(p.first_name, p.last_name),
    age: p.age,
    city: p.city?.trim() || "—",
    country: p.country?.trim() || "—",
    gender: p.gender === "femme" ? "Femme" : p.gender === "homme" ? "Homme" : "—",
    job: p.job?.trim() || "—",
    edu: p.education?.trim() || "—",
    situation: p.marital_status?.trim() || "—",
    madhhab: p.madhhab?.trim() || "—",
    photos: photosByUser.get(p.user_id) ?? [],
    sub: timeAgo(p.created_at),
  }));
}

// ── Photos en attente ─────────────────────────────────────────────────────────

export async function getPendingPhotos(): Promise<PhotoQueueItem[]> {
  const supabase = createAdminClient();
  const { data: photos } = await supabase
    .from("profile_photos").select("*")
    .eq("status", "pending")
    .order("created_at", { ascending: true })
    .limit(200);

  if (!photos || photos.length === 0) return [];

  const { data: names } = await supabase
    .from("profiles").select("user_id,first_name,last_name")
    .in("user_id", [...new Set(photos.map((p) => p.user_id))]);
  const nameMap = new Map((names ?? []).map((n) => [n.user_id, fullName(n.first_name, n.last_name)]));

  const numByUser = new Map<string, number>();
  return photos.map((ph) => {
    const num = (numByUser.get(ph.user_id) ?? 0) + 1;
    numByUser.set(ph.user_id, num);
    return {
      id: ph.id,
      memberId: ph.user_id,
      name: nameMap.get(ph.user_id) ?? "Membre",
      photoNum: num,
      url: ph.url,
      when: timeAgo(ph.created_at),
    };
  });
}

// ── Signalements ──────────────────────────────────────────────────────────────

export async function getReports(): Promise<ReportRow[]> {
  const supabase = createAdminClient();
  const { data: reports } = await supabase
    .from("reports").select("*")
    .eq("status", "pending")
    .order("created_at", { ascending: false })
    .limit(200);

  if (!reports || reports.length === 0) return [];

  const ids = [...new Set(reports.flatMap((r) => [r.reporter_id, r.reported_id]))];
  const { data: names } = await supabase
    .from("profiles").select("user_id,first_name,last_name").in("user_id", ids);
  const nameMap = new Map((names ?? []).map((n) => [n.user_id, fullName(n.first_name, n.last_name)]));

  return reports.map((r) => ({
    id: r.id,
    reporter: nameMap.get(r.reporter_id) ?? "Membre supprimé",
    reported: nameMap.get(r.reported_id) ?? "Membre supprimé",
    reportedUserId: r.reported_id,
    reason: r.reason,
    desc: r.description ?? "",
    when: timeAgo(r.created_at),
    sev: r.severity,
  }));
}

// ── Abonnements ───────────────────────────────────────────────────────────────

export interface SubscriptionsData {
  rows: SubscriptionRow[];
  kpis: { activeCount: number; monthRevenue: number; cancellations30d: number; refunds30d: number };
}

export async function getSubscriptions(): Promise<SubscriptionsData> {
  const supabase = createAdminClient();
  const settings = await getPlatformSettings();
  const since30 = new Date(Date.now() - 30 * 86_400_000).toISOString();
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const [subs, cancelled, refunded, monthSubs] = await Promise.all([
    supabase.from("subscriptions").select("*").eq("plan", "premium").order("created_at", { ascending: false }).limit(1_000),
    supabase.from("subscriptions").select("id", { count: "exact", head: true }).gte("cancelled_at", since30),
    supabase.from("subscriptions").select("id", { count: "exact", head: true }).gte("refunded_at", since30),
    supabase.from("subscriptions").select("duration_months,price_usd").eq("plan", "premium").gte("created_at", monthStart.toISOString()),
  ]);

  const userIds = [...new Set((subs.data ?? []).map((s) => s.user_id))];
  const nameMap = new Map<string, { name: string; email: string; gender: string | null; city: string | null; country: string | null }>();
  if (userIds.length > 0) {
    const { data: members } = await supabase
      .from("admin_members").select("user_id,first_name,last_name,email,gender,city,country").in("user_id", userIds);
    for (const m of members ?? []) {
      nameMap.set(m.user_id, {
        name: fullName(m.first_name, m.last_name),
        email: m.email,
        gender: m.gender,
        city: m.city,
        country: m.country,
      });
    }
  }

  const refundMs = settings.pricing.refundWindow * 86_400_000;
  const rows: SubscriptionRow[] = (subs.data ?? []).map((s) => {
    const info = nameMap.get(s.user_id);
    const withinRefundWindow = Date.now() - Date.parse(s.created_at) <= refundMs;
    return {
      id: s.id,
      userId: s.user_id,
      name: info?.name ?? "Membre supprimé",
      email: info?.email ?? "—",
      plan: `${s.duration_months} mois`,
      payment: s.payment_method ?? "—",
      status: s.status,
      expires: s.current_period_end ? formatDate(s.current_period_end) : "—",
      canRefund: s.status === "active" && withinRefundWindow && !s.refunded_at,
      gender: info?.gender ?? null,
      city: info?.city ?? null,
      country: info?.country ?? null,
      location: location(info?.city ?? null, info?.country ?? null),
      amount: s.price_usd != null ? Number(s.price_usd) : null,
    };
  });

  const activeCount = rows.filter((r) => r.status === "active").length;
  const monthRevenue = (monthSubs.data ?? []).reduce(
    (sum, s) => sum + Number(s.price_usd ?? settings.pricing.launchPrice * (s.duration_months ?? 1)), 0,
  );

  return {
    rows,
    kpis: {
      activeCount,
      monthRevenue: Math.round(monthRevenue),
      cancellations30d: cancelled.count ?? 0,
      refunds30d: refunded.count ?? 0,
    },
  };
}

// ── Boosts ────────────────────────────────────────────────────────────────────

export async function getActiveBoosts(): Promise<BoostRow[]> {
  const supabase = createAdminClient();
  const { data: boosts } = await supabase
    .from("boosts").select("*")
    .gt("expires_at", new Date().toISOString())
    .order("expires_at", { ascending: true })
    .limit(200);

  if (!boosts || boosts.length === 0) return [];

  const { data: names } = await supabase
    .from("profiles").select("user_id,first_name,last_name")
    .in("user_id", [...new Set(boosts.map((b) => b.user_id))]);
  const nameMap = new Map((names ?? []).map((n) => [n.user_id, fullName(n.first_name, n.last_name)]));

  return boosts.map((b) => {
    const total = Date.parse(b.expires_at) - Date.parse(b.created_at);
    const remaining = Date.parse(b.expires_at) - Date.now();
    const hours = Math.round(total / 3_600_000);
    return {
      id: b.id,
      name: nameMap.get(b.user_id) ?? "Membre",
      duration: `Boost ${hours}h`,
      remainingLabel: formatDuration(remaining),
      remainingPct: total > 0 ? Math.max(0, Math.min(100, Math.round((remaining / total) * 100))) : 0,
    };
  });
}

// ── Blog ──────────────────────────────────────────────────────────────────────

export async function getBlogPosts(): Promise<BlogPostRow[]> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("blog_posts").select("*")
    .order("created_at", { ascending: false })
    .limit(500);

  return (data ?? []).map((p) => ({
    id: p.id,
    title: p.title,
    category: p.category,
    author: p.author,
    date: p.published_at ? formatDate(p.published_at) : "—",
    status: p.status,
    excerpt: p.excerpt ?? "",
    content: p.content ?? "",
    coverImage: p.cover_image_url,
    featured: p.featured,
  }));
}

// ── Coach IA ──────────────────────────────────────────────────────────────────

export interface CoachStats {
  questionsMonth: number;
  activeUsers: number;
  avgTokens: number | null;
  satisfaction: string;
  daily: DayPoint[];
}

export async function getCoachStats(): Promise<CoachStats> {
  const supabase = createAdminClient();
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);
  const since14 = new Date(Date.now() - 14 * 86_400_000).toISOString();

  const [monthRows, recent] = await Promise.all([
    supabase.from("coach_usage").select("user_id,tokens,rating").gte("created_at", monthStart.toISOString()).limit(50_000),
    supabase.from("coach_usage").select("created_at").gte("created_at", since14).limit(50_000),
  ]);

  const rows = monthRows.data ?? [];
  const users = new Set(rows.map((r) => r.user_id).filter(Boolean));
  const tokens = rows.map((r) => r.tokens).filter((t): t is number => t != null);
  const ratings = rows.map((r) => r.rating).filter((r): r is number => r != null);

  const buckets = bucketByDay((recent.data ?? []).map((r) => r.created_at), 14);

  return {
    questionsMonth: rows.length,
    activeUsers: users.size,
    avgTokens: tokens.length > 0 ? Math.round(tokens.reduce((a, b) => a + b, 0) / tokens.length) : null,
    satisfaction: ratings.length > 0
      ? `${(ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1).replace(".", ",")} / 5`
      : "—",
    daily: buckets.map((count, i) => ({ day: i + 1, count })),
  };
}

// ── Notifications (diffusions) ────────────────────────────────────────────────

const TARGET_LABEL: Record<string, string> = {
  all: "Tous les membres",
  free: "Membres Free",
  premium: "Membres Premium",
  pending: "En attente de validation",
};

export async function getBroadcasts(): Promise<BroadcastRow[]> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("broadcasts").select("*")
    .order("created_at", { ascending: false })
    .limit(20);

  return (data ?? []).map((b) => ({
    id: b.id,
    title: b.title,
    target: `${TARGET_LABEL[b.target] ?? b.target} · ${b.recipient_count.toLocaleString("fr-FR")} destinataire${b.recipient_count > 1 ? "s" : ""}`,
    date: formatDate(b.created_at),
  }));
}

export async function getBroadcastTargetCounts(): Promise<BroadcastTargetCounts> {
  const counts = await getAdminCounts();
  return {
    all: counts.totalMembers,
    free: counts.totalMembers - counts.premiumMembers,
    premium: counts.premiumMembers,
    pending: counts.pendingProfiles,
  };
}

// ── Support ───────────────────────────────────────────────────────────────────

export async function getTickets(): Promise<TicketRow[]> {
  const supabase = createAdminClient();
  const { data: tickets } = await supabase
    .from("support_tickets").select("*")
    .order("created_at", { ascending: false })
    .limit(200);

  if (!tickets || tickets.length === 0) return [];

  const userIds = [...new Set(tickets.map((t) => t.user_id))];
  const nameMap = new Map<string, { name: string; email: string }>();
  const { data: members } = await supabase
    .from("admin_members").select("user_id,first_name,last_name,email").in("user_id", userIds);
  for (const m of members ?? []) {
    nameMap.set(m.user_id, { name: fullName(m.first_name, m.last_name), email: m.email });
  }

  return tickets.map((t) => ({
    id: t.id,
    userId: t.user_id,
    name: nameMap.get(t.user_id)?.name ?? "Membre supprimé",
    email: nameMap.get(t.user_id)?.email ?? "—",
    title: t.subject,
    category: t.category,
    when: timeAgo(t.created_at),
    status: t.status === "closed" ? "resolved" : "open",
    message: t.body,
  }));
}

// ── Paramètres : admins & API ─────────────────────────────────────────────────

export async function getAdminAccounts(): Promise<AdminAccountRow[]> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("admin_accounts").select("*")
    .order("created_at", { ascending: true });

  return (data ?? []).map((a) => ({
    id: a.id,
    name: a.name,
    email: a.email,
    role: a.role,
    status: a.status,
    lastSeen: a.last_seen_at ? timeAgo(a.last_seen_at) : "Jamais",
    isMaster: a.role === "super-admin" && !a.user_id,
  }));
}

export async function getApiConnections(): Promise<ApiServiceRow[]> {
  const supabase = createAdminClient();
  const { data } = await supabase.from("api_connections").select("*").order("id");
  return (data ?? []).map((s) => ({
    id: s.id,
    name: s.name,
    desc: s.description ?? "",
    kind: s.kind === "payment" ? "payment" : null,
    productionActive: s.production_active,
    identifier: s.identifier ?? "",
    hasSecret: !!s.secret,
  }));
}

// ── Topbar : notifications dérivées des données ───────────────────────────────

export async function getAdminNotifications(): Promise<AdminNotification[]> {
  const counts = await getAdminCounts();
  const items: AdminNotification[] = [];

  if (counts.pendingProfiles > 0) {
    items.push({ id: "pending", icon: "shield-check", tone: "green", text: `${counts.pendingProfiles} profil${counts.pendingProfiles > 1 ? "s" : ""} en attente de validation`, when: "Maintenant", read: false, href: "/adminjommba/validation" });
  }
  if (counts.openReports > 0) {
    items.push({ id: "reports", icon: "flag", tone: "red", text: `${counts.openReports} signalement${counts.openReports > 1 ? "s" : ""} à traiter`, when: "Maintenant", read: false, href: "/adminjommba/signalements" });
  }
  if (counts.pendingPhotos > 0) {
    items.push({ id: "photos", icon: "image", tone: "amber", text: `${counts.pendingPhotos} photo${counts.pendingPhotos > 1 ? "s" : ""} à modérer`, when: "Maintenant", read: false, href: "/adminjommba/photos" });
  }
  if (counts.openTickets > 0) {
    items.push({ id: "tickets", icon: "life-buoy", tone: "green", text: `${counts.openTickets} ticket${counts.openTickets > 1 ? "s" : ""} support ouvert${counts.openTickets > 1 ? "s" : ""}`, when: "Maintenant", read: false, href: "/adminjommba/support" });
  }
  if (items.length === 0) {
    items.push({ id: "ok", icon: "check-circle", tone: "green", text: "Aucune action requise — tout est à jour", when: "Maintenant", read: true });
  }
  return items;
}
