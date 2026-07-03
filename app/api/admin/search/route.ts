// app/api/admin/search/route.ts
// Recherche de membres pour la topbar admin (protégée par le cookie admin).
import { NextRequest, NextResponse } from "next/server";
import { verifyAdminToken, COOKIE } from "@/lib/admin/auth";
import { searchMembers } from "@/lib/admin/queries";

export async function GET(req: NextRequest) {
  const token = req.cookies.get(COOKIE)?.value;
  if (!token || !(await verifyAdminToken(token))) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const q = req.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (q.length < 2) {
    return NextResponse.json({ results: [] });
  }

  const members = await searchMembers(q);
  return NextResponse.json({
    results: members.map((m) => ({
      id: m.id,
      name: m.name,
      email: m.email,
      location: m.location,
      status: m.status,
    })),
  });
}
