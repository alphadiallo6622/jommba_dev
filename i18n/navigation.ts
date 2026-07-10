// i18n/navigation.ts
// Wrappers localisés de Link / useRouter / usePathname / redirect, à utiliser
// à la place de leurs équivalents next/link et next/navigation partout dans
// les pages sous app/[locale]/ (site public + auth). Ils préservent
// automatiquement le préfixe de langue lors de la navigation.
import { createNavigation } from "next-intl/navigation";
import { routing } from "./routing";

export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
