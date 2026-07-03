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
      { label: "Vue d'ensemble", desc: "Pilotage de la plateforme", href: "/adminjommba",              icon: LayoutDashboard },
      { label: "Statistiques",   desc: "Indicateurs détaillés",    href: "/adminjommba/statistiques", icon: TrendingUp },
    ],
  },
  {
    title: "Modération",
    items: [
      { label: "File de validation",  desc: "Modération des profils",   href: "/adminjommba/validation",   icon: ShieldCheck },
      { label: "Membres",             desc: "Gestion des comptes",      href: "/adminjommba/membres",       icon: Users },
      { label: "Signalements",        desc: "Modération",               href: "/adminjommba/signalements",  icon: Flag },
      { label: "Photos en attente",   desc: "Modération du contenu",    href: "/adminjommba/photos",        icon: Image },
    ],
  },
  {
    title: "Monétisation",
    items: [
      { label: "Abonnements", desc: "Monétisation",      href: "/adminjommba/abonnements", icon: Crown },
      { label: "Boosts",      desc: "Visibilité payante", href: "/adminjommba/boosts",      icon: Zap },
    ],
  },
  {
    title: "Contenu & Support",
    items: [
      { label: "Blog",          desc: "Contenu éditorial",   href: "/adminjommba/blog",          icon: Newspaper },
      { label: "Coach IA",      desc: "Cheikh Abdallah",     href: "/adminjommba/coach",         icon: MessageSquareHeart },
      { label: "Notifications", desc: "Diffusion",           href: "/adminjommba/notifications", icon: Megaphone },
      { label: "Support",       desc: "Tickets utilisateurs", href: "/adminjommba/support",       icon: LifeBuoy },
    ],
  },
  {
    title: "Système",
    items: [{ label: "Paramètres", desc: "Configuration", href: "/adminjommba/parametres", icon: Settings }],
  },
];