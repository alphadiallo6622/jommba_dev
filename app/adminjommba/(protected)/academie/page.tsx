// app/adminjommba/(protected)/academie/page.tsx
import type { Metadata } from "next";
import { getAcademyArticles } from "@/lib/admin/queries";
import { AcademieClient } from "./academie-client";

export const metadata: Metadata = { title: "Académie" };
export const dynamic = "force-dynamic";

export default async function AcademiePage() {
  const articles = await getAcademyArticles();
  return <AcademieClient articles={articles} />;
}
