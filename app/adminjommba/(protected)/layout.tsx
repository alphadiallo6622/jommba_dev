// app/adminjommba/(protected)/layout.tsx
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { AdminShell } from "@/components/admin/admin-shell";
import { getAdminCounts, getAdminNotifications } from "@/lib/admin/queries";
import { verifyAdminToken, COOKIE } from "@/lib/admin/auth";
import type { AdminIdentity } from "@/lib/admin/types";

export const metadata: Metadata = {
  title: { template: "%s | Jommba Admin", default: "Jommba Admin" },
  robots: "noindex,nofollow",
};
export const dynamic = "force-dynamic";

export default async function ProtectedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const store = await cookies();
  const token = store.get(COOKIE)?.value;
  const session = token ? await verifyAdminToken(token) : null;
  // Le proxy garantit une session valide ici ; le repli ne sert qu'en cas de course.
  const identity: AdminIdentity = session
    ? { name: session.name, email: session.email, role: session.role, isMaster: !session.accountId }
    : { name: "Admin", email: "", role: "super-admin", isMaster: true };

  const [counts, notifications] = await Promise.all([
    getAdminCounts(),
    getAdminNotifications(),
  ]);

  const badges: Record<string, { value: number; tone: "amber" | "red" | "green" }> = {};
  if (counts.pendingProfiles > 0) badges["/adminjommba/validation"]   = { value: counts.pendingProfiles, tone: "amber" };
  if (counts.openReports > 0)     badges["/adminjommba/signalements"] = { value: counts.openReports,     tone: "red"   };
  if (counts.pendingPhotos > 0)   badges["/adminjommba/photos"]       = { value: counts.pendingPhotos,   tone: "amber" };
  if (counts.openTickets > 0)     badges["/adminjommba/support"]      = { value: counts.openTickets,     tone: "green" };

  return (
    <AdminShell badges={badges} notifications={notifications} identity={identity}>
      {children}
    </AdminShell>
  );
}
