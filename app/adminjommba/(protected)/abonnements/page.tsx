// app/adminjommba/(protected)/abonnements/page.tsx
import type { Metadata } from "next";
import { getSubscriptions } from "@/lib/admin/queries";
import { AbonnementsClient } from "./abonnements-client";

export const metadata: Metadata = { title: "Abonnements" };
export const dynamic = "force-dynamic";

export default async function AbonnementsPage() {
  const { rows, kpis } = await getSubscriptions();
  return <AbonnementsClient rows={rows} kpis={kpis} />;
}
