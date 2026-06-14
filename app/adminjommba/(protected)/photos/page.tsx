"use client";
// app/admin/(protected)/photos/page.tsx
import { useState, useEffect, useCallback } from "react";
import { X, ChevronLeft, ChevronRight, ImageOff } from "lucide-react";
import { PHOTO_QUEUE, type PhotoItem } from "@/lib/admin/mock-data";
import { useToast } from "@/components/admin/ui/toast";

/* ── Lightbox ─────────────────────────────────────────────────────────────── */
function PhotoLightbox({
  initialPhoto,
  memberPhotos,
  onClose,
  onApprove,
  onReject,
}: {
  initialPhoto: PhotoItem;
  memberPhotos: PhotoItem[];
  onClose: () => void;
  onApprove: (p: PhotoItem) => void;
  onReject: (p: PhotoItem) => void;
}) {
  const [idx, setIdx] = useState(() =>
    memberPhotos.findIndex((p) => p.id === initialPhoto.id),
  );
  const current = memberPhotos[idx];
  const total   = memberPhotos.length;

  const prev = useCallback(() => setIdx((i) => Math.max(0, i - 1)), []);
  const next = useCallback(() => setIdx((i) => Math.min(total - 1, i + 1)), [total]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape")      onClose();
      if (e.key === "ArrowLeft")   prev();
      if (e.key === "ArrowRight")  next();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose, prev, next]);

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-black/92"
      onClick={onClose}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-6 py-4 shrink-0"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-white">
          <p className="font-semibold text-sm">{current.name}</p>
          <p className="text-xs text-white/60">
            Photo {idx + 1} / {total} · {current.when}
          </p>
        </div>

        {/* Dots navigation */}
        {total > 1 && (
          <div className="flex gap-1.5">
            {memberPhotos.map((_, i) => (
              <button
                key={i}
                onClick={() => setIdx(i)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  i === idx ? "bg-white" : "bg-white/30"
                }`}
              />
            ))}
          </div>
        )}

        <button
          onClick={onClose}
          className="p-2 rounded-full hover:bg-white/10 text-white transition-colors"
          aria-label="Fermer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Photo area */}
      <div
        className="flex-1 flex items-center justify-center relative px-4 min-h-0"
        onClick={(e) => e.stopPropagation()}
      >
        {total > 1 && idx > 0 && (
          <button
            onClick={prev}
            className="absolute left-4 z-10 p-2.5 rounded-full bg-white/10 hover:bg-white/25 text-white transition-colors"
            aria-label="Photo précédente"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}

        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          key={current.id}
          src={current.url}
          alt={`${current.name} — photo ${current.photoNum}`}
          className="rounded-xl shadow-2xl"
          style={{ maxHeight: "calc(100vh - 180px)", maxWidth: "100%", objectFit: "contain" }}
        />

        {total > 1 && idx < total - 1 && (
          <button
            onClick={next}
            className="absolute right-4 z-10 p-2.5 rounded-full bg-white/10 hover:bg-white/25 text-white transition-colors"
            aria-label="Photo suivante"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        )}
      </div>

      {/* Footer actions */}
      <div
        className="flex items-center justify-center gap-3 py-5 shrink-0"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => onReject(current)}
          className="px-7 py-2.5 rounded-xl border border-red-400/60 text-red-300 text-sm font-semibold hover:bg-red-900/40 transition-colors"
        >
          Rejeter
        </button>
        <button
          onClick={() => onApprove(current)}
          className="px-7 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition-colors"
        >
          Approuver
        </button>
      </div>
    </div>
  );
}

/* ── Page ─────────────────────────────────────────────────────────────────── */
export default function PhotosPage() {
  const { show }    = useToast();
  const [queue, setQueue]       = useState(PHOTO_QUEUE);
  const [viewing, setViewing]   = useState<PhotoItem | null>(null);

  const photosByMember = (memberId: string) =>
    queue.filter((p) => p.memberId === memberId);

  const removePhoto = (id: string) =>
    setQueue((q) => q.filter((p) => p.id !== id));

  const handleApprove = (photo: PhotoItem) => {
    removePhoto(photo.id);
    show(`Photo approuvée · ${photo.name}`, "success");
    const remaining = photosByMember(photo.memberId).filter((p) => p.id !== photo.id);
    if (remaining.length === 0) setViewing(null);
    else setViewing(remaining[0]);
  };

  const handleReject = (photo: PhotoItem) => {
    removePhoto(photo.id);
    show(`Photo rejetée · ${photo.name}`, "error");
    const remaining = photosByMember(photo.memberId).filter((p) => p.id !== photo.id);
    if (remaining.length === 0) setViewing(null);
    else setViewing(remaining[0]);
  };

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold text-[var(--color-ink)]">Photos en attente</h1>
            <p className="text-sm text-[var(--color-muted)] mt-0.5">
              Contrôle du contenu islamiquement approprié avant publication.
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 shrink-0">
            {queue.length} photo{queue.length !== 1 ? "s" : ""}
          </span>
        </div>

        {queue.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-[var(--color-muted)]">
            <ImageOff className="w-10 h-10 mb-3 opacity-40" />
            <p className="text-sm">Aucune photo en attente</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {queue.map((ph) => {
              const memberCount = photosByMember(ph.memberId).length;
              return (
                <div
                  key={ph.id}
                  className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-line)] shadow-[var(--shadow-card)] overflow-hidden"
                >
                  {/* Clickable photo area */}
                  <button
                    onClick={() => setViewing(ph)}
                    className="relative w-full aspect-[3/4] overflow-hidden group bg-[var(--color-faint)] block"
                    aria-label={`Voir photo de ${ph.name}`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={ph.url}
                      alt={`${ph.name} photo ${ph.photoNum}`}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />

                    {/* Overlay on hover */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                      <span className="opacity-0 group-hover:opacity-100 text-white text-xs font-semibold bg-black/50 px-3 py-1 rounded-full transition-opacity">
                        Visualiser
                      </span>
                    </div>

                    {/* Photo num badge */}
                    <span className="absolute top-2 left-2 text-[10px] font-semibold text-white bg-black/40 px-1.5 py-0.5 rounded backdrop-blur-sm">
                      Photo {ph.photoNum}
                    </span>

                    {/* Multi-photo indicator */}
                    {memberCount > 1 && (
                      <span className="absolute top-2 right-2 text-[10px] font-semibold text-white bg-[var(--color-brand-600)]/80 px-1.5 py-0.5 rounded backdrop-blur-sm">
                        {memberCount} photos
                      </span>
                    )}
                  </button>

                  {/* Info + actions */}
                  <div className="p-3 space-y-2.5">
                    <div>
                      <p className="text-sm font-medium text-[var(--color-ink)]">{ph.name}</p>
                      <p className="text-xs text-[var(--color-muted)]">{ph.when}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleApprove(ph)}
                        className="flex-1 py-1.5 text-xs font-semibold rounded-lg border border-emerald-200 text-emerald-700 hover:bg-emerald-50 transition-colors"
                      >
                        Approuver
                      </button>
                      <button
                        onClick={() => handleReject(ph)}
                        className="flex-1 py-1.5 text-xs font-semibold rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-colors"
                      >
                        Rejeter
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {viewing && (
        <PhotoLightbox
          initialPhoto={viewing}
          memberPhotos={photosByMember(viewing.memberId)}
          onClose={() => setViewing(null)}
          onApprove={handleApprove}
          onReject={handleReject}
        />
      )}
    </>
  );
}
