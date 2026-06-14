// lib/admin/nav.ts
import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard, TrendingUp, ShieldCheck, Users, Flag, Image,
  Crown, Zap, Newspaper, MessageSquareHeart, Megaphone, LifeBuoy, Settings,
} from "lucide-react";

export interface NavItem {
  label: string;
  desc?: string;
  href: string;
  icon: LucideIcon;
  badge?: { value: number; tone: "amber" | "red" | "green" };
}
export interface NavSection { title: string; items: NavItem[]; }

export const NAV: NavSection[] = [
  {
    title: "Pilotage",
    items: [
      { label: "Vue d'ensemble", desc: "Pilotage de la plateforme", href: "/admin",              icon: LayoutDashboard },
      { label: "Statistiques",   desc: "Indicateurs détaillés",    href: "/admin/statistiques", icon: TrendingUp },
    ],
  },
  {
    title: "Modération",
    items: [
      { label: "File de validation",  desc: "Modération des profils",   href: "/admin/validation",   icon: ShieldCheck, badge: { value: 7, tone: "amber" } },
      { label: "Membres",             desc: "Gestion des comptes",      href: "/admin/membres",       icon: Users },
      { label: "Signalements",        desc: "Modération",               href: "/admin/signalements",  icon: Flag,        badge: { value: 3, tone: "red"   } },
      { label: "Photos en attente",   desc: "Modération du contenu",    href: "/admin/photos",        icon: Image },
    ],
  },
  {
    title: "Monétisation",
    items: [
      { label: "Abonnements", desc: "Monétisation",      href: "/admin/abonnements", icon: Crown },
      { label: "Boosts",      desc: "Visibilité payante", href: "/admin/boosts",      icon: Zap },
    ],
  },
  {
    title: "Contenu & Support",
    items: [
      { label: "Blog",          desc: "Contenu éditorial",   href: "/admin/blog",          icon: Newspaper },
      { label: "Coach IA",      desc: "Cheikh Abdallah",     href: "/admin/coach",         icon: MessageSquareHeart },
      { label: "Notifications", desc: "Diffusion",           href: "/admin/notifications", icon: Megaphone },
      { label: "Support",       desc: "Tickets utilisateurs", href: "/admin/support",       icon: LifeBuoy, badge: { value: 4, tone: "green" } },
    ],
  },
  {
    title: "Système",
    items: [{ label: "Paramètres", desc: "Configuration", href: "/admin/parametres", icon: Settings }],
  },
];