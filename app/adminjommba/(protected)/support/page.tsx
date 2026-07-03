// app/adminjommba/(protected)/support/page.tsx
import type { Metadata } from "next";
import { getTickets } from "@/lib/admin/queries";
import { SupportClient } from "./support-client";

export const metadata: Metadata = { title: "Support" };
export const dynamic = "force-dynamic";

export default async function SupportPage() {
  const tickets = await getTickets();
  return <SupportClient tickets={tickets} />;
}
