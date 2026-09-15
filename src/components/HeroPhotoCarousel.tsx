"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

type HeroPhoto = {
  src: string;
  caption: string;
  alt: string;
};

const HERO_PHOTOS: HeroPhoto[] = [
  { src: "/images/hero/chi-2026.jpg", caption: "CHI 2026, Barcelona", alt: "HCC Lab members at CHI 2026 in Barcelona" },
  { src: "/images/hero/chi-2025.jpg", caption: "CHI 2025, Yokohama", alt: "HCC Lab members at CHI 2025 in Yokohama" },
  { src: "/images/hero/chi-2024.jpg", caption: "CHI 2024, Honolulu", alt: "HCC Lab members at CHI 2024 in Honolulu" },
];

const INTERVAL_MS = 4500;

export default function HeroPhotoCarousel() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const id = window.setInterval(
      () => setCurrent((c) => (c + 1) % HERO_PHOTOS.length),
      INTERVAL_MS
    );
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className="w-full">
      <Link
        href="/memories"
        data-analytics-event="home_hero_photo_click"
        data-analytics-label={HERO_PHOTOS[current].caption}
        data-analytics-destination="/memories"
        className="group relative block w-full aspect-[4/3] overflow-hidden rounded-md shadow-lg shadow-black/30 ring-1 ring-white/20"
      >
        {HERO_PHOTOS.map((photo, i) => (
          <Image
            key={photo.src}
            src={photo.src}
            alt={photo.alt}
            fill
            sizes="(min-width: 768px) 420px, 100vw"
            priority={i === 0}
            className={`object-cover transition-opacity duration-1000 ease-in-out ${
              i === current ? "opacity-100" : "opacity-0"
            }`}
          />
        ))}
      </Link>
      <div className="mt-2 flex items-center justify-between">
        <p className="text-[11px] tracking-wide text-white/70 uppercase" style={{ fontFamily: "var(--font-mono)" }}>
          {HERO_PHOTOS[current].caption}
        </p>
        <div className="flex gap-1.5">
          {HERO_PHOTOS.map((photo, i) => (
            <button
              key={photo.src}
              type="button"
              aria-label={`Show ${photo.caption}`}
              onClick={() => setCurrent(i)}
              className={`h-1.5 rounded-full transition-all ${
                i === current ? "w-4 bg-white/90" : "w-1.5 bg-white/40 hover:bg-white/70"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
