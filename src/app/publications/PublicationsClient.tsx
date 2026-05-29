"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import publicationsData from "@/data/publications.json";

type Publication = {
  id: string;
  title: string;
  year: number;
  venue: string | null;
  authors: string[];
  doi: string | null;
  pdf?: string | null;
  url: string;
  openAccess: boolean;
  type: string;
  areas?: string[];
};

const AREAS: Record<string, string> = {
  "human-ai": "Human-AI Interaction",
  "healthcare": "Healthcare & Wellbeing",
  "social-media": "Social & Media Computing",
  "accessibility": "Accessible & Inclusive Design",
  "data-intelligence": "Data Intelligence",
};

export default function PublicationsClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const activeArea = searchParams.get("area");
  const [visibleYear, setVisibleYear] = useState<number | null>(null);

  const allPubs: Publication[] = publicationsData.publications;
  const filtered = activeArea
    ? allPubs.filter((p) => p.areas?.includes(activeArea))
    : allPubs;

  const byYear = filtered.reduce<Record<number, Publication[]>>((acc, p) => {
    if (!acc[p.year]) acc[p.year] = [];
    acc[p.year].push(p);
    return acc;
  }, {});

  const years = Object.keys(byYear).map(Number).sort((a, b) => b - a);

  useEffect(() => {
    const currentYears = Object.keys(byYear).map(Number).sort((a, b) => b - a);
    if (currentYears.length === 0) return;

    const observers: IntersectionObserver[] = [];
    currentYears.forEach((year) => {
      const el = document.getElementById(`year-${year}`);
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setVisibleYear(year);
        },
        { rootMargin: "-64px 0px -72% 0px", threshold: 0 }
      );
      obs.observe(el);
      observers.push(obs);
    });
    return () => observers.forEach((o) => o.disconnect());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeArea]);

  function setArea(key: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (key) params.set("area", key);
    else params.delete("area");
    router.push(`/publications?${params.toString()}`);
  }

  function scrollToYear(year: number) {
    const el = document.getElementById(`year-${year}`);
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - 80;
    window.scrollTo({ top, behavior: "smooth" });
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-16">
      <h1 className="text-3xl font-bold text-slate-900 mb-2">Publications</h1>

      {/* Area filter chips */}
      <div className="flex flex-wrap gap-2 mb-10">
        <button
          onClick={() => setArea(null)}
          className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
            !activeArea
              ? "bg-slate-900 text-white border-slate-900"
              : "border-slate-200 text-slate-500 hover:border-slate-400 hover:text-slate-700 hover:font-medium"
          }`}
        >
          All
        </button>
        {Object.entries(AREAS).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setArea(activeArea === key ? null : key)}
            className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
              activeArea === key
                ? "bg-[#192e57] text-white border-[#192e57]"
                : "border-slate-200 text-slate-500 hover:border-slate-400 hover:text-slate-700 hover:font-medium"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {activeArea && (
        <p className="text-sm text-slate-500 mb-8">
          Showing <span className="font-medium text-slate-800">{filtered.length}</span> papers in{" "}
          <span className="font-medium text-[#192e57]">{AREAS[activeArea]}</span>
        </p>
      )}

      <div className="flex gap-10">
        {/* Main publications list */}
        <div className="flex-1 min-w-0 space-y-14">
          {years.map((year) => (
            <section key={year} id={`year-${year}`}>
              <h2 className="sticky top-16 z-10 bg-white text-base font-bold text-slate-700 py-3 mb-5 border-b-2 border-slate-200">
                {year}
              </h2>
              <div className="space-y-6">
                {byYear[year].map((pub) => (
                  <div key={pub.id} className="group">
                    <a
                      href={pub.doi ?? pub.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}
                      className="font-medium text-slate-800 group-hover:text-[#192e57] group-hover:font-semibold transition-all leading-snug block mb-1.5"
                    >
                      {pub.title}
                    </a>
                    <p className="text-sm text-slate-500 mb-1">
                      {pub.authors.join(", ")}
                    </p>
                    {pub.venue && (
                      <p className="text-sm text-slate-400 italic mb-2">{pub.venue}</p>
                    )}
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      {pub.doi && (
                        <a
                          href={pub.doi}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs px-2.5 py-1 rounded-full border border-slate-300 text-slate-500 hover:border-slate-500 hover:text-slate-700 hover:font-medium transition-all"
                        >
                          DOI
                        </a>
                      )}
                      {pub.pdf && (
                        <a
                          href={pub.pdf}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs px-2.5 py-1 rounded-full border border-slate-300 text-slate-500 hover:border-slate-500 hover:text-slate-700 hover:font-medium transition-all"
                        >
                          PDF
                        </a>
                      )}
                      {pub.areas && pub.areas.length > 0 && pub.areas.map((a) => (
                        <button
                          key={a}
                          onClick={() => setArea(activeArea === a ? null : a)}
                          className={`text-xs px-2.5 py-0.5 rounded-full border transition-colors ${
                            activeArea === a
                              ? "border-[#3a6bc4] text-[#192e57]"
                              : "border-slate-200 text-slate-400 hover:border-slate-400 hover:text-slate-600 hover:font-medium"
                          }`}
                        >
                          {AREAS[a] ?? a}
                        </button>
                      ))}
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
            {years.map((year) => (
              <button
                key={year}
                onClick={() => scrollToYear(year)}
                className={`text-sm transition-colors ${
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
