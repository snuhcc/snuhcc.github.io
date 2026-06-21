"use client";

import Image from "next/image";
import { useState, useEffect, useCallback } from "react";

type MemoryEvent = {
  name: string;
  year: number;
  category: string;
  folder: string;
  photos: string[];
};

const categoryColors: Record<string, string> = {
  Conference:  "bg-[#0B3D91]/10 text-[#0B3D91]",
  "Lab Event": "bg-[#3a6bc4]/10 text-[#3a6bc4]",
  "Lab Life":  "bg-sky-100 text-sky-700",
  Research:    "bg-indigo-50 text-indigo-600",
  Seminar:     "bg-blue-50 text-blue-500",
};

const CATEGORY_ORDER = ["Conference", "Research", "Lab Event", "Lab Life"];

function categoryRank(category: string): number {
  const index = CATEGORY_ORDER.indexOf(category);
  return index === -1 ? CATEGORY_ORDER.length : index;
}

function Lightbox({
  memory,
  initialIndex,
  onClose,
}: {
  memory: MemoryEvent;
  initialIndex: number;
  onClose: () => void;
}) {
  const [current, setCurrent] = useState(initialIndex);
  const total = memory.photos.length;

  const prev = useCallback(() => setCurrent((c) => (c - 1 + total) % total), [total]);
  const next = useCallback(() => setCurrent((c) => (c + 1) % total), [total]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose, prev, next]);

  const src = `/images/memories/${memory.folder}/${memory.photos[current]}`;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
      onClick={onClose}
    >
      {/* Close */}
      <button
        className="absolute top-4 right-4 text-white/70 hover:text-white text-3xl leading-none z-10"
        onClick={onClose}
      >
        ×
      </button>

      {/* Counter */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 text-white/60 text-sm">
        {current + 1} / {total}
      </div>

      {/* Event name */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/80 text-sm font-medium">
        {memory.name}
      </div>

      {/* Prev */}
      {total > 1 && (
        <button
          className="absolute left-4 text-white/70 hover:text-white text-4xl z-10 px-4 py-8"
          onClick={(e) => { e.stopPropagation(); prev(); }}
        >
          ‹
        </button>
      )}

      {/* Image */}
      <div
        className="relative max-w-4xl max-h-[80vh] w-full mx-16"
        onClick={(e) => e.stopPropagation()}
      >
        <Image
          src={src}
          alt={`${memory.name} photo ${current + 1}`}
          width={1200}
          height={800}
          className="object-contain max-h-[80vh] w-full"
        />
      </div>

      {/* Next */}
      {total > 1 && (
        <button
          className="absolute right-4 text-white/70 hover:text-white text-4xl z-10 px-4 py-8"
          onClick={(e) => { e.stopPropagation(); next(); }}
        >
          ›
        </button>
      )}

      {/* Thumbnail strip */}
      {total > 1 && (
        <div className="absolute bottom-14 left-1/2 -translate-x-1/2 flex gap-2">
          {memory.photos.map((photo, i) => (
            <button
              key={i}
              onClick={(e) => { e.stopPropagation(); setCurrent(i); }}
              className={`w-2 h-2 rounded-full transition-all ${
                i === current ? "bg-white scale-125" : "bg-white/40 hover:bg-white/70"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function MemoryCard({
  memory,
  onClick,
}: {
  memory: MemoryEvent;
  onClick: () => void;
}) {
  const cover = memory.photos[0];
  const coverSrc = cover ? `/images/memories/${memory.folder}/${cover}` : null;

  return (
    <div
      className="border border-slate-100 overflow-hidden hover:border-slate-200 hover:shadow-md transition-all group cursor-pointer"
      onClick={() => coverSrc && onClick()}
    >
      <div className="h-48 bg-slate-50 overflow-hidden relative">
        {coverSrc ? (
          <Image
            src={coverSrc}
            alt={memory.name}
            fill
            className="object-cover blur-md scale-105 group-hover:blur-none group-hover:scale-100 transition-all duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-slate-100">
            <span className="text-xs text-slate-400 uppercase tracking-widest">No photo</span>
          </div>
        )}
        {memory.photos.length > 1 && (
          <span className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-0.5 rounded-full backdrop-blur-sm">
            {memory.photos.length} photos
          </span>
        )}
      </div>

      <div className="p-4">
        <span
          className={`text-xs px-2 py-0.5 rounded-full font-medium ${
            categoryColors[memory.category] ?? "bg-slate-50 text-slate-500"
          }`}
        >
          {memory.category}
        </span>
        <p className="font-medium text-slate-800 mt-2">{memory.name}</p>
      </div>
    </div>
  );
}

export default function MemoryGallery({ memories }: { memories: MemoryEvent[] }) {
  const [lightbox, setLightbox] = useState<{ memory: MemoryEvent; index: number } | null>(null);

  const years = Array.from(new Set(memories.map((m) => m.year))).sort((a, b) => b - a);
  const grouped = years.reduce<Record<number, MemoryEvent[]>>((acc, year) => {
    acc[year] = memories
      .filter((m) => m.year === year)
      .sort((a, b) => categoryRank(a.category) - categoryRank(b.category));
    return acc;
  }, {});

  return (
    <>
      <div className="space-y-14">

        {years.map((year) => (
          <section key={year}>
            <h2 className="sticky top-16 z-10 bg-white text-base font-bold text-slate-700 py-3 mb-5 border-b-2 border-slate-200">
              {year}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {grouped[year].map((memory, i) => (
                <MemoryCard
                  key={i}
                  memory={memory}
                  onClick={() => setLightbox({ memory, index: 0 })}
                />
              ))}
            </div>
          </section>
        ))}
      </div>

      {lightbox && (
        <Lightbox
          memory={lightbox.memory}
          initialIndex={lightbox.index}
          onClose={() => setLightbox(null)}
        />
      )}
    </>
  );
}
