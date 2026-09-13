"use client";

import { useState } from "react";
import { Play } from "lucide-react";

const VIDEO_ID = "rikUE-4YxUs";

// Facade : on n'affiche que la miniature tant que le visiteur n'a pas cliqué.
// L'iframe YouTube (lourde) n'est chargée qu'à la lecture, pour ne pas plomber
// le chargement de la page d'accueil.
export default function HeroVideo({
  title,
  playLabel,
}: {
  title: string;
  playLabel: string;
}) {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <div className="relative w-full aspect-video bg-jommba-dark">
      {isPlaying ? (
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${VIDEO_ID}?autoplay=1&rel=0&modestbranding=1&playsinline=1`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="absolute inset-0 w-full h-full"
        />
      ) : (
        <button
          type="button"
          onClick={() => setIsPlaying(true)}
          aria-label={playLabel}
          className="group absolute inset-0 w-full h-full cursor-pointer"
        >
          {/* La miniature YouTube est en 4/3 : object-cover recadre les bandes noires */}
          <img
            src={`https://i.ytimg.com/vi/${VIDEO_ID}/hqdefault.jpg`}
            alt={title}
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-jommba-dark/25 group-hover:bg-jommba-dark/10 transition-colors duration-300" />
          <span className="absolute inset-0 flex items-center justify-center">
            <span className="w-16 h-16 rounded-full bg-white/95 shadow-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <Play className="w-6 h-6 text-primary fill-primary translate-x-0.5" />
            </span>
          </span>
        </button>
      )}
    </div>
  );
}
