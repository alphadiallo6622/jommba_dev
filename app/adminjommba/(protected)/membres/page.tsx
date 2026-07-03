// app/adminjommba/(protected)/membres/page.tsx
import type { Metadata } from "next";
import { getMembers } from "@/lib/admin/queries";
import { MembresClient } from "./membres-client";

export const metadata: Metadata = { title: "Membres" };
export const dynamic = "force-dynamic";

export default async function MembresPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const [{ q }, members] = await Promise.all([searchParams, getMembers()]);
  return <MembresClient members={members} initialSearch={q} />;
}
