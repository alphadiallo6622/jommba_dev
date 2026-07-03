// app/adminjommba/(protected)/photos/page.tsx
import type { Metadata } from "next";
import { getPendingPhotos } from "@/lib/admin/queries";
import { PhotosClient } from "./photos-client";

export const metadata: Metadata = { title: "Photos en attente" };
export const dynamic = "force-dynamic";

export default async function PhotosPage() {
  const photos = await getPendingPhotos();
  return <PhotosClient photos={photos} />;
}
