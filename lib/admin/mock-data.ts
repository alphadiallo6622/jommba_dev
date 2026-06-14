// lib/admin/mock-data.ts
// Données mock typées (à remplacer par vos requêtes Prisma / Server Actions).

export type MemberStatus = "validated" | "pending" | "refused" | "suspended";
export type Plan = "free" | "premium";

export interface Member {
  id: string;
  name: string;
  email: string;
  age: number;
  location: string;
  status: MemberStatus;
  plan: Plan;
  joinedAt: string; // ISO
}

export interface Kpi {
  label: string;
  value: string;
  delta?: string;
  up?: boolean;
  icon: string; // clé lucide
  accent: string; // hex
  accentBg: string; // hex
  spark?: number[];
}

export interface PendingProfile {
  name: string;
  age: number;
  city: string;
  country: string;
  gender: string;
  job: string;
  edu: string;
  photos: number;
  sub: string;
  situation: string;
  madhhab: string;
}

export interface ReportItem {
  reporter: string;
  reported: string;
  reason: string;
  desc: string;
  when: string;
  sev: "high" | "medium" | "low";
}

export interface FeedItem {
  icon: string;
  tone: "green" | "amber" | "red";
  text: string;
  when: string;
}

export interface NotificationItem {
  id: string;
  icon: string;
  tone: "green" | "amber" | "red";
  text: string;
  when: string;
  read: boolean;
}

const spark = (n: number, a: number, b: number) =>
  Array.from({ length: n }, () => a + Math.round(Math.random() * (b - a)));

// Déterministe (évite les divergences SSR/client)
function sr(seed: number): number {
  const x = Math.sin(seed + 1) * 10000;
  return x - Math.floor(x);
}

export interface ChartPoint { day: number; inscriptions: number; validations: number; }

export const INSCRIPTIONS_DATA: ChartPoint[] = Array.from({ length: 30 }, (_, i) => ({
  day: i + 1,
  inscriptions: Math.max(2, Math.round(10 + sr(i * 3 + 1) * 28 + Math.sin(i / 3.5) * 7)),
  validations:  Math.max(1, Math.round(6  + sr(i * 3 + 2) * 20 + Math.sin(i / 4.2) * 5)),
}));

export interface DonutSegment { label: string; value: number; color: string; }

export const MEMBER_DISTRIBUTION: DonutSegment[] = [
  { label: "Validés",             value: 1842, color: "#10b981" },
  { label: "En attente",          value: 7,    color: "#e8920c" },
  { label: "Refusés / Suspendus", value: 96,   color: "#df4548" },
];

// ── Statistiques ──────────────────────────────────────────────────────────────
export interface MonthBar   { month: string; count: number; }
export interface CountryBar { country: string; count: number; }
export interface RevenuePoint { month: string; amount: number; }
export interface DayPoint     { day: number; count: number; }

export const CONVERSION_DATA: MonthBar[] = [
  { month: "J", count: 28 }, { month: "F", count: 35 }, { month: "M", count: 31 },
  { month: "A", count: 42 }, { month: "M", count: 39 }, { month: "J", count: 48 },
  { month: "J", count: 52 }, { month: "A", count: 44 }, { month: "S", count: 58 },
  { month: "O", count: 61 }, { month: "N", count: 69 }, { month: "D", count: 74 },
];

export const COUNTRY_DATA: CountryBar[] = [
  { country: "Sénégal",    count: 892 },
  { country: "Mali",       count: 234 },
  { country: "Côte d'Iv.", count: 187 },
  { country: "France",     count: 143 },
  { country: "Guinée",     count: 89  },
  { country: "Canada",     count: 67  },
];

export const REVENUE_DATA: RevenuePoint[] = [
  { month: "J",  amount: 1200 }, { month: "F", amount: 1580 }, { month: "M", amount: 1920 },
  { month: "A",  amount: 2100 }, { month: "M", amount: 2450 }, { month: "J", amount: 2780 },
  { month: "J",  amount: 3100 }, { month: "A", amount: 3340 }, { month: "S", amount: 3620 },
  { month: "O",  amount: 3850 }, { month: "N", amount: 4100 }, { month: "D", amount: 4340 },
];

export const MESSAGES_DATA: DayPoint[] = Array.from({ length: 30 }, (_, i) => ({
  day: i + 1,
  count: Math.max(800, Math.round(1800 + Math.sin(i * 0.8) * 300 + sr(i + 100) * 400)),
}));

export const COACH_QUESTIONS: DayPoint[] = Array.from({ length: 14 }, (_, i) => ({
  day: i + 1,
  count: Math.max(200, Math.round(600 + sr(i + 50) * 500 + Math.sin(i / 2) * 80)),
}));

// ── Abonnements ───────────────────────────────────────────────────────────────
export type SubStatus = "active" | "cancelled" | "expired";
export interface Subscription {
  id: string; name: string; email: string;
  plan: "1 mois" | "3 mois" | "6 mois" | "12 mois";
  payment: "Carte" | "MTN" | "Wave" | "Orange Money";
  status: SubStatus;
  expires: string;
  canRefund?: boolean;
}
export const SUBSCRIPTIONS: Subscription[] = [
  { id: "s1", name: "Alpha Diallo",  email: "alpha.d@gmail.com",   plan: "1 mois",  payment: "Carte",        status: "active",    expires: "12 juil 2026" },
  { id: "s2", name: "Awa Ndiaye",    email: "awa.n@gmail.com",     plan: "6 mois",  payment: "MTN",          status: "cancelled", expires: "expire 30 juin" },
  { id: "s3", name: "Bassirou Sy",   email: "bassirou.s@gmail.com",plan: "1 mois",  payment: "Carte",        status: "expired",   expires: "01 juin 2026" },
  { id: "s4", name: "Fatima Sy",     email: "fatima.sy@gmail.com", plan: "3 mois",  payment: "Wave",         status: "active",    expires: "04 sep 2026" },
  { id: "s5", name: "Khadija Touré", email: "khadija.t@gmail.com", plan: "12 mois", payment: "Orange Money", status: "active",    expires: "09 jan 2027" },
  { id: "s6", name: "Yacine Fall",   email: "yacine.f@gmail.com",  plan: "1 mois",  payment: "Carte",        status: "active",    expires: "15 juin 2026", canRefund: true },
];

// ── Boosts ────────────────────────────────────────────────────────────────────
export interface ActiveBoost {
  id: string; name: string;
  duration: string; remainingLabel: string; remainingPct: number;
}
export const ACTIVE_BOOSTS: ActiveBoost[] = [
  { id: "b1", name: "Alpha Diallo",  duration: "Boost 24h", remainingLabel: "18 h 12 min", remainingPct: 76 },
  { id: "b2", name: "Khadija Touré", duration: "Boost 3h",  remainingLabel: "1 h 04 min",  remainingPct: 35 },
  { id: "b3", name: "Fatima Sy",     duration: "Boost 1h",  remainingLabel: "12 min",       remainingPct: 20 },
];

// ── Blog ──────────────────────────────────────────────────────────────────────
export type PostStatus = "published" | "draft";
export interface BlogPost {
  id: string; title: string; category: string; author: string;
  date: string; status: PostStatus; gradient: string;
  excerpt?: string; content?: string; featured?: boolean;
}
export const BLOG_POSTS: BlogPost[] = [
  { id: "p1",  featured: true,  title: "Réussir ses rencontres dans le respect islamique", category: "Conseils",     author: "Équipe Jommba",   date: "10 juin 2026", status: "published", gradient: "from-emerald-500 to-teal-400",  excerpt: "Comment naviguer la recherche d'un conjoint tout en respectant les valeurs de l'islam.", content: "<h2>Introduction</h2><p>La recherche d'un conjoint est une étape importante dans la vie d'un musulman...</p>" },
  { id: "p2",  title: "Le rôle du Wali dans le mariage islamique",        category: "Famille",      author: "Cheikh Abdallah", date: "02 juin 2026", status: "published", gradient: "from-orange-500 to-amber-400",  excerpt: "Comprendre l'importance du tuteur matrimonial dans la tradition islamique.", content: "<h2>Le Wali en Islam</h2><p>Le tuteur matrimonial joue un rôle central dans le mariage islamique...</p>" },
  { id: "p3",  title: "La dimension spirituelle du mariage",              category: "Spiritualité", author: "Équipe Jommba",   date: "—",           status: "draft",     gradient: "from-purple-500 to-violet-400", excerpt: "Le mariage comme acte d'adoration et moyen de se rapprocher d'Allah." },
  { id: "p4",  title: "Soirée Jommba à Dakar : retour en images",        category: "Événements",   author: "Équipe Jommba",   date: "—",           status: "draft",     gradient: "from-pink-500 to-rose-400",    excerpt: "Découvrez les temps forts de notre soirée de rencontres à Dakar." },
  { id: "p5",  title: "Les qualités à rechercher chez un conjoint",       category: "Conseils",     author: "Équipe Jommba",   date: "28 mai 2026",  status: "published", gradient: "from-emerald-500 to-teal-400",  excerpt: "Dîn, caractère, compatibilité : ce que le Prophète ﷺ nous a enseigné." },
  { id: "p6",  title: "Comprendre la Mahr : guide complet",              category: "Famille",      author: "Cheikh Abdallah", date: "20 mai 2026",  status: "published", gradient: "from-orange-500 to-amber-400",  excerpt: "Tout ce qu'il faut savoir sur le don matrimonial en islam." },
  { id: "p7",  title: "Patience et confiance en Allah dans l'attente",   category: "Spiritualité", author: "Équipe Jommba",   date: "15 mai 2026",  status: "published", gradient: "from-purple-500 to-violet-400", excerpt: "Comment cultiver la tawakkul pendant la période de recherche d'un conjoint." },
  { id: "p8",  title: "Jommba lance sa version Premium",                 category: "Actualités",   author: "Équipe Jommba",   date: "01 mai 2026",  status: "published", gradient: "from-blue-500 to-cyan-400",     excerpt: "Nouvelles fonctionnalités, Coach IA et plus encore." },
  { id: "p9",  title: "Le consentement dans le mariage islamique",       category: "Famille",      author: "Cheikh Abdallah", date: "22 avr 2026",  status: "published", gradient: "from-orange-500 to-amber-400",  excerpt: "L'accord libre et éclairé des deux époux, une condition sine qua non." },
  { id: "p10", title: "5 conseils pour un premier contact réussi",       category: "Conseils",     author: "Équipe Jommba",   date: "10 avr 2026",  status: "published", gradient: "from-emerald-500 to-teal-400",  excerpt: "Comment se présenter avec pudeur et sincérité sur Jommba." },
  { id: "p11", title: "Rencontre Jommba à Lyon — mai 2026",             category: "Événements",   author: "Équipe Jommba",   date: "—",           status: "draft",     gradient: "from-pink-500 to-rose-400",    excerpt: "Rejoignez notre prochaine soirée de rencontres à Lyon." },
];

// ── Support ───────────────────────────────────────────────────────────────────
export type TicketStatus = "open" | "resolved";
export interface SupportTicket {
  id: string; name: string; email: string; title: string;
  category: string; when: string; status: TicketStatus;
  message: string;
}
export const SUPPORT_TICKETS: SupportTicket[] = [
  {
    id: "t1", name: "Abou Diallo", email: "abou.diallo@gmail.com",
    title: "Mon profil n'est toujours pas validé", category: "Vérification", when: "Il y a 1 h", status: "open",
    message: "Bonjour, j'ai créé mon profil il y a 3 jours mais il est toujours en attente de validation. J'ai bien renseigné toutes mes informations et uploadé mes photos. Pouvez-vous m'aider ?",
  },
  {
    id: "t2", name: "Yacine Fall", email: "yacine.fall@gmail.com",
    title: "Demande de remboursement Premium", category: "Premium", when: "Il y a 4 h", status: "open",
    message: "Salam, j'ai souscrit à l'abonnement Premium hier mais je souhaite être remboursé. Je n'ai pas trouvé les fonctionnalités que j'attendais. Mon abonnement est sous 7 jours donc je rentre dans la fenêtre de remboursement.",
  },
  {
    id: "t3", name: "Awa Ndiaye", email: "awa.ndiaye@gmail.com",
    title: "Comment changer ma photo de profil ?", category: "Compte", when: "Il y a 9 h", status: "open",
    message: "Bonjour, je n'arrive pas à modifier ma photo de profil. Quand je clique sur l'icône appareil photo, rien ne se passe. J'utilise un iPhone 14. Merci pour votre aide.",
  },
  {
    id: "t4", name: "Bassirou Sy", email: "bassirou.sy@gmail.com",
    title: "Je n'arrive pas à bloquer un membre", category: "Sécurité", when: "Il y a 1 j", status: "resolved",
    message: "Assalam aleykoum, un membre me contacte de manière répétée et je voudrais le bloquer mais je ne trouve pas l'option. Pouvez-vous m'indiquer la procédure ? Jazakallah khayr.",
  },
];

// ── Broadcasts (Notifications) ────────────────────────────────────────────────
export interface Broadcast { id: string; title: string; target: string; date: string; }
export const BROADCASTS: Broadcast[] = [
  { id: "bc1", title: "Offre de lancement Premium", target: "Membres Free · 1 511 destinataires",  date: "08 juin 2026" },
  { id: "bc2", title: "Conseils de sécurité",        target: "Tous les membres · 1 820 destinataires", date: "01 juin 2026" },
];

// ── Photo queue ───────────────────────────────────────────────────────────────
export interface PhotoItem {
  id: string;
  memberId: string;
  name: string;
  photoNum: number;
  url: string;
  when: string;
}
export const PHOTO_QUEUE: PhotoItem[] = [
  { id: "ph1",  memberId: "m1", name: "Diatou S.",  photoNum: 1, url: "https://picsum.photos/seed/ph1/480/640",  when: "Il y a 3 h"  },
  { id: "ph2",  memberId: "m1", name: "Diatou S.",  photoNum: 2, url: "https://picsum.photos/seed/ph2/480/640",  when: "Il y a 3 h"  },
  { id: "ph3",  memberId: "m1", name: "Diatou S.",  photoNum: 3, url: "https://picsum.photos/seed/ph3/480/640",  when: "Il y a 3 h"  },
  { id: "ph4",  memberId: "m2", name: "Moussa K.",  photoNum: 1, url: "https://picsum.photos/seed/ph4/480/640",  when: "Il y a 5 h"  },
  { id: "ph5",  memberId: "m3", name: "Aïcha B.",   photoNum: 1, url: "https://picsum.photos/seed/ph5/480/640",  when: "Il y a 8 h"  },
  { id: "ph6",  memberId: "m3", name: "Aïcha B.",   photoNum: 2, url: "https://picsum.photos/seed/ph6/480/640",  when: "Il y a 8 h"  },
  { id: "ph7",  memberId: "m4", name: "Fatou N.",   photoNum: 1, url: "https://picsum.photos/seed/ph7/480/640",  when: "Il y a 14 h" },
  { id: "ph8",  memberId: "m4", name: "Fatou N.",   photoNum: 2, url: "https://picsum.photos/seed/ph8/480/640",  when: "Il y a 14 h" },
  { id: "ph9",  memberId: "m5", name: "Mariama C.", photoNum: 1, url: "https://picsum.photos/seed/ph9/480/640",  when: "Il y a 22 h" },
  { id: "ph10", memberId: "m6", name: "Sékou T.",   photoNum: 1, url: "https://picsum.photos/seed/ph10/480/640", when: "Il y a 19 h" },
];

export const OVERVIEW_KPIS: Kpi[] = [
  { label: "Membres totaux", value: "1 945", delta: "+128 ce mois", up: true, icon: "users", accent: "#10b981", accentBg: "#ecfdf5", spark: spark(12, 40, 90) },
  { label: "En attente de validation", value: "7", delta: "à traiter < 24 h", icon: "clock", accent: "#e8920c", accentBg: "#fdf3e3", spark: spark(12, 2, 12) },
  { label: "Abonnés Premium", value: "434", delta: "22,3 % conversion", up: true, icon: "crown", accent: "#0a8f63", accentBg: "#e7f7ef", spark: spark(12, 20, 60) },
  { label: "Signalements ouverts", value: "3", delta: "priorité haute", icon: "flag", accent: "#df4548", accentBg: "#fceceb", spark: spark(12, 0, 6) },
];

export const ANALYTICS_KPIS: Kpi[] = [
  { label: "MRR (USD)", value: "4 340 $", delta: "+9,1 %", up: true, icon: "dollar-sign", accent: "#10b981", accentBg: "#ecfdf5", spark: spark(12, 30, 90) },
  { label: "Messages / jour", value: "2 117", delta: "+4,2 %", up: true, icon: "message-circle", accent: "#0a8f63", accentBg: "#e7f7ef", spark: spark(12, 40, 80) },
  { label: "Boosts actifs", value: "12", delta: "temps réel", icon: "zap", accent: "#e8920c", accentBg: "#fdf3e3", spark: spark(12, 4, 16) },
  { label: "Taux de validation", value: "94,8 %", delta: "profils acceptés", up: true, icon: "shield-check", accent: "#10b981", accentBg: "#ecfdf5", spark: spark(12, 88, 97) },
];

export const MEMBERS: Member[] = [
  { id: "1",  name: "Alpha Diallo",    email: "alphadiallo2308@gmail.com", age: 29, location: "Dakar, Sénégal",          status: "validated", plan: "premium", joinedAt: "2026-01-12" },
  { id: "2",  name: "Abou Diallo",     email: "abou.diallo@jommba.net",    age: 32, location: "Dakar, Sénégal",          status: "pending",   plan: "free",    joinedAt: "2026-06-13" },
  { id: "3",  name: "Diatou Sow",      email: "diatou.s@gmail.com",        age: 25, location: "Dakar, Sénégal",          status: "pending",   plan: "free",    joinedAt: "2026-06-13" },
  { id: "4",  name: "Fatima Sy",       email: "fatima.sy@gmail.com",       age: 27, location: "Thiès, Sénégal",          status: "validated", plan: "premium", joinedAt: "2026-03-04" },
  { id: "5",  name: "Moussa Keïta",    email: "m.keita@gmail.com",         age: 34, location: "Bamako, Mali",            status: "pending",   plan: "free",    joinedAt: "2026-06-13" },
  { id: "6",  name: "Aminata Diop",    email: "aminata.d@gmail.com",       age: 30, location: "Paris, France",           status: "validated", plan: "free",    joinedAt: "2026-02-21" },
  { id: "7",  name: "Soxna Sarr",      email: "soxna.sarr@gmail.com",      age: 29, location: "Dakar, Sénégal",          status: "refused",   plan: "free",    joinedAt: "2026-05-18" },
  { id: "8",  name: "Ousmane Ba",      email: "o.ba@gmail.com",            age: 41, location: "Saint-Louis, Sénégal",   status: "suspended", plan: "free",    joinedAt: "2026-04-02" },
  { id: "9",  name: "Khadija Touré",   email: "khadija.t@gmail.com",       age: 26, location: "Abidjan, Côte d'Ivoire", status: "validated", plan: "premium", joinedAt: "2026-01-09" },
  { id: "10", name: "Ndeye Gueye",     email: "ndeye.g@gmail.com",         age: 33, location: "Montréal, Canada",        status: "validated", plan: "free",    joinedAt: "2025-12-15" },
  { id: "11", name: "Ibrahima Fall",   email: "i.fall@gmail.com",          age: 36, location: "Dakar, Sénégal",          status: "validated", plan: "free",    joinedAt: "2026-03-29" },
  { id: "12", name: "Mariam Cissé",    email: "mariam.c@gmail.com",        age: 24, location: "Nouakchott, Mauritanie",  status: "pending",   plan: "free",    joinedAt: "2026-06-12" },
  { id: "13", name: "Yacine Fall",     email: "yacine.f@gmail.com",        age: 31, location: "Lyon, France",            status: "validated", plan: "premium", joinedAt: "2026-05-15" },
  { id: "14", name: "Awa Ndiaye",      email: "awa.n@gmail.com",           age: 28, location: "Dakar, Sénégal",          status: "validated", plan: "free",    joinedAt: "2026-04-22" },
];

export const PENDING_PROFILES: PendingProfile[] = [
  { name: "Diatou S.",   age: 25, city: "Dakar",     country: "Sénégal",              gender: "Femme", job: "Sage-femme",   edu: "BAC+3",    photos: 3, sub: "Il y a 3 h",  situation: "Célibataire", madhhab: "Malékite"  },
  { name: "Moussa K.",   age: 34, city: "Bamako",    country: "Mali",                 gender: "Homme", job: "Ingénieur",    edu: "BAC+5",    photos: 2, sub: "Il y a 5 h",  situation: "Célibataire", madhhab: "Malékite"  },
  { name: "Aïcha B.",    age: 28, city: "Paris",     country: "France (diaspora)",    gender: "Femme", job: "Pharmacienne", edu: "Doctorat", photos: 4, sub: "Il y a 8 h",  situation: "Divorcée",    madhhab: "Malékite"  },
  { name: "Ibrahima D.", age: 31, city: "Abidjan",   country: "Côte d'Ivoire",       gender: "Homme", job: "Comptable",    edu: "BAC+3",    photos: 1, sub: "Il y a 11 h", situation: "Célibataire", madhhab: "Malékite"  },
  { name: "Fatou N.",    age: 26, city: "Conakry",   country: "Guinée",               gender: "Femme", job: "Enseignante",  edu: "BAC+2",    photos: 3, sub: "Il y a 14 h", situation: "Célibataire", madhhab: "Hanafite"  },
  { name: "Sékou T.",    age: 38, city: "Bruxelles", country: "Belgique (diaspora)",  gender: "Homme", job: "Chauffeur",    edu: "BAC",      photos: 2, sub: "Il y a 19 h", situation: "Veuf",        madhhab: "Malékite"  },
  { name: "Mariama C.",  age: 24, city: "Nouakchott",country: "Mauritanie",           gender: "Femme", job: "Étudiante",   edu: "BAC+2",    photos: 2, sub: "Il y a 22 h", situation: "Célibataire", madhhab: "Shaféite"  },
];

export const REPORTS: ReportItem[] = [
  { reporter: "Aminata D.", reported: "Ousmane Ba",   reason: "Harcèlement",       desc: "Messages insistants malgré refus de contact.", when: "Il y a 2 h",  sev: "high"   },
  { reporter: "Fatima Sy",  reported: "Compte #4821", reason: "Profil faux",        desc: "Photos qui semblent provenir d'internet.",    when: "Il y a 6 h",  sev: "high"   },
  { reporter: "Khadija T.", reported: "Compte #5190", reason: "Contenu inapproprié", desc: "Photo de profil non conforme.",              when: "Il y a 13 h", sev: "medium" },
];

export const ACTIVITY: FeedItem[] = [
  { icon: "user-plus",    tone: "green", text: "Mariama C. a soumis son profil",              when: "Il y a 22 min" },
  { icon: "crown",        tone: "amber", text: "Yacine Fall a souscrit Premium (1 mois)",     when: "Il y a 51 min" },
  { icon: "flag",         tone: "red",   text: "Nouveau signalement contre Ousmane Ba",       when: "Il y a 2 h"   },
  { icon: "shield-check", tone: "green", text: "Khadija Touré validée par Modérateur",        when: "Il y a 3 h"   },
  { icon: "zap",          tone: "amber", text: "Alpha Diallo a activé un Boost 24h",          when: "Il y a 5 h"   },
];

export const NOTIFICATIONS: NotificationItem[] = [
  { id: "n1", icon: "shield-check", tone: "green", text: "7 profils en attente de validation",      when: "Il y a 12 min", read: false },
  { id: "n2", icon: "flag",         tone: "red",   text: "Nouveau signalement : harcèlement",       when: "Il y a 2 h",   read: false },
  { id: "n3", icon: "crown",        tone: "amber", text: "Yacine Fall a souscrit Premium",           when: "Il y a 51 min", read: false },
  { id: "n4", icon: "life-buoy",    tone: "green", text: "Nouveau ticket support (remboursement)",  when: "Il y a 4 h",   read: false },
  { id: "n5", icon: "check-circle", tone: "green", text: "Annonce « Offre de lancement » diffusée", when: "Hier",          read: true  },
];