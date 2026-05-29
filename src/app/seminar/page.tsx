"use client";

import seminarsData from "@/data/seminars.json";
import { useState, useMemo, useEffect } from "react";

type Seminar = {
  date: string;
  title: string;
  presenter: string;
  tags: string[];
  semester: string;
  slides: string | null;
};

const seminars: Seminar[] = seminarsData;

const allTags = Array.from(new Set(seminars.flatMap((s) => s.tags))).sort();
const allYears = Array.from(new Set(seminars.map((s) => s.date.slice(0, 4)))).sort(
  (a, b) => b.localeCompare(a)
);

export default function SeminarPage() {
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<string | null>(null);
  const [visibleYear, setVisibleYear] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return seminars.filter((s) => {
      if (selectedTag && !s.tags.includes(selectedTag)) return false;
      if (selectedYear && s.date.slice(0, 4) !== selectedYear) return false;
      return true;
    });
  }, [selectedTag, selectedYear]);

  const grouped = filtered.reduce<Record<string, Seminar[]>>((acc, s) => {
    const year = s.date.slice(0, 4);
    if (!acc[year]) acc[year] = [];
    acc[year].push(s);
    return acc;
  }, {});

  const groupedKeys = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    groupedKeys.forEach((year) => {
      const el = document.getElementById(`seminar-year-${year}`);
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setVisibleYear(year); },
        { rootMargin: "-64px 0px -72% 0px", threshold: 0 }
      );
      obs.observe(el);
      observers.push(obs);
    });
    return () => observers.forEach((o) => o.disconnect());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTag, selectedYear]);

  function scrollToYear(year: string) {
    const el = document.getElementById(`seminar-year-${year}`);
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - 80;
    window.scrollTo({ top, behavior: "smooth" });
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-16">
      <h1 className="text-3xl font-bold text-slate-900 mb-8">Lab Seminar</h1>

      {/* Filters */}
      <div className="flex flex-col gap-3 mb-10">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedYear(null)}
            className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
              !selectedYear
                ? "bg-slate-900 text-white border-slate-900"
                : "border-slate-200 text-slate-500 hover:border-slate-400 hover:text-slate-700 hover:font-medium"
            }`}
          >
            All years
          </button>
          {allYears.map((year) => (
            <button
              key={year}
              onClick={() => setSelectedYear(year === selectedYear ? null : year)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                selectedYear === year
                  ? "bg-slate-900 text-white border-slate-900"
                  : "border-slate-200 text-slate-500 hover:border-slate-400 hover:text-slate-700 hover:font-medium"
              }`}
            >
              {year}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedTag(null)}
            className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
              !selectedTag
                ? "bg-[#192e57] text-white border-[#192e57]"
                : "border-slate-200 text-slate-500 hover:border-slate-400 hover:text-slate-700 hover:font-medium"
            }`}
          >
            All topics
          </button>
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                selectedTag === tag
                  ? "bg-[#192e57] text-white border-[#192e57]"
                  : "border-slate-200 text-slate-500 hover:border-slate-400 hover:text-slate-700 hover:font-medium"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-10">
        <div className="flex-1 min-w-0 space-y-12">
        {groupedKeys.map((year) => (
          <section key={year} id={`seminar-year-${year}`}>
            <h2 className="sticky top-16 z-10 bg-white text-base font-bold text-slate-700 py-3 mb-5 border-b-2 border-slate-200">
              {year}
            </h2>
            <div className="divide-y divide-slate-100">
              {grouped[year].map((s, i) => (
                <div key={i} className="py-3 flex gap-5 group">
                  <div className="shrink-0 w-14 pt-0.5">
                    <p className="text-xs text-slate-400 tabular-nums">
                      {new Date(s.date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}
                      className="font-medium text-slate-800 group-hover:text-[#192e57] group-hover:font-semibold transition-all leading-snug mb-1"
                    >
                      {s.title}
                    </p>
                    <p className="text-sm text-slate-500 mb-1.5">{s.presenter}</p>
                    <div className="flex flex-wrap items-center gap-1.5">
                      {s.tags.map((tag) => (
                        <button
                          key={tag}
                          onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}
                          className={`text-xs px-2.5 py-0.5 rounded-full border transition-all ${
                            selectedTag === tag
                              ? "border-[#3a6bc4] text-[#192e57] font-medium"
                              : "border-slate-200 text-slate-400 hover:border-slate-400 hover:text-slate-600 hover:font-medium"
                          }`}
                        >
                          {tag}
                        </button>
                      ))}
                      {s.slides && (
                        <a
                          href={s.slides}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs px-2.5 py-0.5 rounded-full border border-slate-300 text-slate-500 hover:border-slate-500 hover:text-slate-700 hover:font-medium transition-all"
                        >
                          PDF
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
        </div>

        {/* Year TOC sidebar */}
        <aside className="hidden lg:block w-16 shrink-0">
          <div className="sticky top-24 flex flex-col items-end gap-2">
            {groupedKeys.map((year) => (
              <button
                key={year}
                onClick={() => scrollToYear(year)}
                className={`text-sm transition-all ${
                  visibleYear === year
                    ? "text-[#192e57] font-semibold"
                    : "text-slate-400 hover:text-[#192e57] hover:font-semibold"
                }`}
              >
                {year}
              </button>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
