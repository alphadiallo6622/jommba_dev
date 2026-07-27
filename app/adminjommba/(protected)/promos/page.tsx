// app/adminjommba/(protected)/promos/page.tsx
import type { Metadata } from "next";
import { getPromoCodes } from "@/lib/admin/queries";
import { PromosClient } from "./promos-client";

export const metadata: Metadata = { title: "Codes promo" };
export const dynamic = "force-dynamic";

export default async function PromosPage() {
  const promoCodes = await getPromoCodes();
  return <PromosClient promoCodes={promoCodes} />;
}
