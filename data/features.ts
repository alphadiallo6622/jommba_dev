export interface Feature {
  id: string;
  /** Clé de traduction sous home.features.items.<key> */
  key: "sharia" | "verified" | "messaging" | "search" | "privacy" | "notifications";
  iconName: "ShieldCheck" | "UserCheck" | "MessageSquare" | "Flame" | "Search" | "Bell";
}

export const FEATURES: Feature[] = [
  { id: "1", key: "sharia", iconName: "ShieldCheck" },
  { id: "2", key: "verified", iconName: "UserCheck" },
  { id: "3", key: "messaging", iconName: "MessageSquare" },
  { id: "4", key: "search", iconName: "Search" },
  { id: "5", key: "privacy", iconName: "Flame" },
  { id: "6", key: "notifications", iconName: "Bell" },
];
