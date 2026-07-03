// app/adminjommba/(protected)/notifications/page.tsx
import type { Metadata } from "next";
import { getBroadcasts, getBroadcastTargetCounts } from "@/lib/admin/queries";
import { NotificationsClient } from "./notifications-client";

export const metadata: Metadata = { title: "Notifications" };
export const dynamic = "force-dynamic";

export default async function NotificationsAdminPage() {
  const [broadcasts, targets] = await Promise.all([
    getBroadcasts(),
    getBroadcastTargetCounts(),
  ]);
  return <NotificationsClient broadcasts={broadcasts} targets={targets} />;
}
