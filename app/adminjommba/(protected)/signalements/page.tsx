// app/adminjommba/(protected)/signalements/page.tsx
import type { Metadata } from "next";
import { getReports } from "@/lib/admin/queries";
import { SignalementsClient } from "./signalements-client";

export const metadata: Metadata = { title: "Signalements" };
export const dynamic = "force-dynamic";

export default async function SignalementsPage() {
  const reports = await getReports();
  return <SignalementsClient reports={reports} />;
}
