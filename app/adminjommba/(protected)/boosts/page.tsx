// app/adminjommba/(protected)/boosts/page.tsx
import type { Metadata } from "next";
import { getActiveBoosts } from "@/lib/admin/queries";
import { BoostsClient } from "./boosts-client";

export const metadata: Metadata = { title: "Boosts" };
export const dynamic = "force-dynamic";

export default async function BoostsPage() {
  const boosts = await getActiveBoosts();
  return <BoostsClient boosts={boosts} />;
}
