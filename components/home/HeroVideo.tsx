"use client";

import { useEffect, useRef, useState } from "react";
import { Volume2 } from "lucide-react";

const VIDEO_ID = "rikUE-4YxUs";
const THUMBNAIL = `https://i.ytimg.com/vi/${VIDEO_ID}/hqdefault.jpg`;

// La vidéo démarre seule dès l'ouverture de la page. Les navigateurs
// n'autorisent la lecture automatique que si le son est coupé : on lance donc
// en muet, et on propose au visiteur de rétablir le son d'un clic (via l'API
// iframe de YouTube, d'où le paramètre enablejsapi).
const SRC =
  `https://www.youtube-nocookie.com/embed/${VIDEO_ID}` +
  "?autoplay=1&mute=1&playsinline=1&rel=0&modestbranding=1&enablejsapi=1";

// Le hero a deux mises en page distinctes (mobile et desktop). Sans ce garde-fou
// les deux iframes se chargeraient, y compris celle qui est masquée en CSS :
// on ne monte donc le lecteur que dans la mise en page réellement affichée.
const DESKTOP_QUERY = "(min-width: 1024px)";

export default function HeroVideo({
  variant,
  title,
  soundLabel,
}: {
  variant: "mobile" | "desktop";
  title: string;
  soundLabel: string;
}) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isVisibleLayout, setIsVisibleLayout] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  useEffect(() => {
    const query = window.matchMedia(DESKTOP_QUERY);
    const sync = () =>
      setIsVisibleLayout(
        variant === "desktop" ? query.matches : !query.matches
      );

    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, [variant]);

  const unmute = () => {
    const player = iframeRef.current?.contentWindow;
    if (!player) return;
    for (const func of ["unMute", "playVideo"]) {
      player.postMessage(
        JSON.stringify({ event: "command", func, args: [] }),
        "*"
      );
    }
    setIsMuted(false);
  };

  return (
    <div className="relative w-full aspect-video bg-jommba-dark">
      {/* Miniature affichée le temps que le lecteur se charge */}
      <img
        src={THUMBNAIL}
        alt={title}
        aria-hidden="true"
        className="absolute inset-0 w-full h-full object-cover"
      />

      {isVisibleLayout && (
        <iframe
          ref={iframeRef}
          src={SRC}
          title={title}
          allow="autoplay; accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="absolute inset-0 w-full h-full"
        />
      )}

      {isVisibleLayout && isMuted && (
        <button
          type="button"
          onClick={unmute}
          className="absolute top-3 right-3 z-10 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/95 backdrop-blur-sm text-text-primary text-xs font-semibold shadow-lg hover:bg-white hover:scale-105 transition-all duration-200"
        >
          <Volume2 className="w-3.5 h-3.5 text-primary shrink-0" />
          {soundLabel}
        </button>
      )}
    </div>
  );
}
