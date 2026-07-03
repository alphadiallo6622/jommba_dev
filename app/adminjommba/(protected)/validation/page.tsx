// app/adminjommba/(protected)/validation/page.tsx
import type { Metadata } from "next";
import { getPendingProfiles } from "@/lib/admin/queries";
import { ValidationClient } from "./validation-client";

export const metadata: Metadata = { title: "File de validation" };
export const dynamic = "force-dynamic";

export default async function ValidationPage() {
  const profiles = await getPendingProfiles();
  return <ValidationClient profiles={profiles} />;
}
