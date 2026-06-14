import { ShieldCheck, UserCheck, MessageSquare, Flame, Search, Bell } from "lucide-react";
import React from "react";

export interface Feature {
  id: string;
  title: string;
  description: string;
  iconName: "ShieldCheck" | "UserCheck" | "MessageSquare" | "Flame" | "Search" | "Bell";
}

export const FEATURES: Feature[] = [
  {
    id: "1",
    title: "Respect de la Charia & Éthique",
    description: "Une plateforme conçue selon les principes islamiques avec option d'accompagnement de Tuteur (Wali) et respect strict des règles de bienséance.",
    iconName: "ShieldCheck",
  },
  {
    id: "2",
    title: "Profils Vérifiés Manuellement",
    description: "Chaque inscription et chaque photo sont examinées avec soin par notre équipe de modération pour garantir des profils sérieux et réels.",
    iconName: "UserCheck",
  },
  {
    id: "3",
    title: "Messagerie Sécurisée",
    description: "Échangez en toute sérénité. Notre messagerie protège vos informations privées jusqu'à ce que vous décidiez de les partager.",
    iconName: "MessageSquare",
  },
  {
    id: "4",
    title: "Recherche Avancée par Critères",
    description: "Filtrez les profils selon des critères précis : pratique religieuse, localisation, profession, vision du mariage et bien plus.",
    iconName: "Search",
  },
  {
    id: "5",
    title: "Confidentialité Absolue",
    description: "Floutez vos photos pour les rendre visibles uniquement aux profils que vous autorisez. Votre vie privée est sous votre contrôle.",
    iconName: "Flame",
  },
  {
    id: "6",
    title: "Notifications en Temps Réel",
    description: "Ne manquez aucune opportunité. Soyez immédiatement informé des visites, des likes et des nouveaux messages reçus.",
    iconName: "Bell",
  },
];
