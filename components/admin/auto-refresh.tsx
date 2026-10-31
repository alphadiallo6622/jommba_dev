"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Recharge les donnees serveur de la page a intervalle regulier, pour les
 * indicateurs qui doivent coller au present (membres connectes, file de
 * validation). Le rafraichissement est suspendu quand l'onglet est masque :
 * une console laissee ouverte en arriere-plan n'a rien a rafraichir.
 */
export function AutoRefresh({ seconds = 30 }: { seconds?: number }) {
  const router = useRouter();

  useEffect(() => {
    const tick = () => {
      if (document.visibilityState === "visible") router.refresh();
    };
    const timer = setInterval(tick, seconds * 1000);
    document.addEventListener("visibilitychange", tick);
    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", tick);
    };
  }, [router, seconds]);

  return null;
}
