export interface FAQItem {
  question: string;
  answer: string;
}

export interface FAQCategory {
  id: string;
  iconName: "User" | "ShieldAlert" | "MessageSquare" | "Star" | "Lock";
  /** Nombre de questions dans cette catégorie (résolues via useTranslations côté page). */
  itemCount: number;
}

export const FAQ_DATA: FAQCategory[] = [
  { id: "account", iconName: "User", itemCount: 3 },
  { id: "verification", iconName: "ShieldAlert", itemCount: 2 },
  { id: "messaging", iconName: "MessageSquare", itemCount: 2 },
  { id: "premium", iconName: "Star", itemCount: 2 },
  { id: "security", iconName: "Lock", itemCount: 2 },
];
