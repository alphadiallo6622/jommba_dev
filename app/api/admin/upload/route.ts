// app/api/admin/upload/route.ts
// Dépôt des images de la console admin sur Supabase Storage : couvertures
// d'articles de blog et visuels de l'Académie passent tous deux par ici.
// Protégé par le cookie admin.
//
// Ces images partaient sur Cloudinary, dont le quota gratuit est épuisé. Le
// contrat de la route est inchangé — mêmes entrées, même réponse `{ url }` —
// seul l'hébergeur du fichier change.
import { NextRequest, NextResponse } from "next/server";
import { verifyAdminToken, COOKIE } from "@/lib/admin/auth";
import { uploadBlogImage } from "@/lib/supabase/storage";

/** Garde-fou serveur, aligné sur la limite du bucket (10 Mo). */
const MAX_BYTES = 10 * 1024 * 1024;

export async function POST(req: NextRequest) {
  const token = req.cookies.get(COOKIE)?.value;
  if (!token || !(await verifyAdminToken(token))) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const body = await req.formData();
  const file = body.get("file");
  if (!file || typeof file === "string") {
    return NextResponse.json({ error: "Fichier manquant" }, { status: 400 });
  }
  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "Le fichier doit être une image" }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "Image trop lourde (10 Mo maximum)" }, { status: 400 });
  }

  const result = await uploadBlogImage(file);
  if (!result.ok) {
    console.error("[admin/upload] échec:", result.error);
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({ url: result.url });
}
