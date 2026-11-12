// app/adminjommba/(protected)/parametres/page.tsx
import type { Metadata } from "next";
import {
  getAdminAccounts, getApiConnections, getPlatformSettings, getMobileMoneySettings,
} from "@/lib/admin/queries";
import { ParametresClient } from "./parametres-client";

export const metadata: Metadata = { title: "Paramètres" };
export const dynamic = "force-dynamic";

export default async function ParametresPage() {
  const [admins, apiServices, settings, mobileMoney] = await Promise.all([
    getAdminAccounts(),
    getApiConnections(),
    getPlatformSettings(),
    getMobileMoneySettings(),
  ]);

  return (
    <ParametresClient
      admins={admins}
      apiServices={apiServices}
      initialLimits={settings.limits}
      initialPricing={settings.pricing}
      initialBoostPricing={settings.boostPricing}
      initialMaintenance={settings.maintenance}
      initialGeoBlock={settings.geoBlock}
      initialEmailNotifications={settings.emailNotifications}
      initialMobileMoney={mobileMoney}
    />
  );
}
