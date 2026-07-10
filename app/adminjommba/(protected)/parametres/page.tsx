// app/adminjommba/(protected)/parametres/page.tsx
import type { Metadata } from "next";
import {
  getAdminAccounts, getApiConnections, getPlatformSettings,
} from "@/lib/admin/queries";
import { ParametresClient } from "./parametres-client";

export const metadata: Metadata = { title: "Paramètres" };
export const dynamic = "force-dynamic";

export default async function ParametresPage() {
  const [admins, apiServices, settings] = await Promise.all([
    getAdminAccounts(),
    getApiConnections(),
    getPlatformSettings(),
  ]);

  return (
    <ParametresClient
      admins={admins}
      apiServices={apiServices}
      initialLimits={settings.limits}
      initialPricing={settings.pricing}
      initialMaintenance={settings.maintenance}
    />
  );
}
