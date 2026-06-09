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

function venueLabel(venue: string | null, year: number, type: string): string | null {
  const yy = String(year).slice(2);

  if (type === "book-chapter") return "Book Chapter";
  if (type === "Dissertation") return "Dissertation";
  if (type === "Technical Report") return "Technical Report";
  if (/preprint|posted.content/i.test(type)) {
    const src = /arXiv/i.test(venue ?? "") ? "arXiv  ·  " : "";
    return `${src}Preprint`;
  }

  if (!venue) return null;
  const v = venue;
  const isEA   = /extended abstract/i.test(v);
  const isComp = /companion/i.test(v);

  // CHI
  if (/CHI Conference|SIGCHI Conference|Human Factors in Computing/i.test(v))
    return isEA ? `CHI '${yy}  ·  Extended Abstract` : `CHI '${yy}  ·  Full Paper`;

  // CSCW / PACMHCI
  if (/ACM on Human.Computer Interaction/i.test(v)) return `PACMHCI '${yy}  ·  Full Paper`;
  if (/CSCW|Computer-Supported Cooperative/i.test(v))
    return isComp ? `CSCW '${yy}  ·  Companion` : `CSCW '${yy}  ·  Full Paper`;

  // UIST
  if (/UIST|User Interface Software and Tech/i.test(v)) return `UIST '${yy}  ·  Full Paper`;

  // IUI
  if (/Intelligent User Interface/i.test(v))
    return isComp ? `IUI '${yy}  ·  Companion` : `IUI '${yy}  ·  Full Paper`;

  // ASSETS
  if (/SIGACCESS|ASSETS/i.test(v)) return `ASSETS '${yy}  ·  Full Paper`;

  // SIGIR
  if (/SIGIR/i.test(v)) return `SIGIR '${yy}  ·  Full Paper`;

  // RecSys
  if (/Recommender Systems/i.test(v)) return `RecSys '${yy}  ·  Full Paper`;

  // DIS
  if (/Designing Interactive Systems/i.test(v)) return `DIS '${yy}  ·  Full Paper`;

  // TVX / Interactive TV
  if (/Interactive Experiences for TV|TVX/i.test(v)) return `TVX '${yy}  ·  Full Paper`;

  // CIKM
  if (/Information and Knowledge Management/i.test(v)) return `CIKM '${yy}  ·  Full Paper`;

  // MobileHCI
  if (/Human-Computer Interaction with Mobile/i.test(v)) return `MobileHCI '${yy}  ·  Full Paper`;

  // AVI
  if (/Advanced Visual Interface/i.test(v)) return `AVI '${yy}  ·  Full Paper`;

  // ICWSM
  if (/ICWSM/i.test(v)) return `ICWSM '${yy}  ·  Full Paper`;

  // AAAI
  if (/AAAI|National Conference on Artificial Intelligence/i.test(v)) return `AAAI '${yy}  ·  Full Paper`;

  // IEEE BigData / Visual Analytics
  if (/Big Data/i.test(v)) return `IEEE BigData '${yy}  ·  Full Paper`;
  if (/Visual Analytics/i.test(v)) return `IEEE VAST '${yy}  ·  Full Paper`;

  // Social Computing
  if (/Social Computing/i.test(v)) return `SocialCom '${yy}  ·  Full Paper`;

  // WikiSym
  if (/Wikis and Open Collaboration/i.test(v)) return `WikiSym '${yy}  ·  Full Paper`;

  // HCI Korea
  if (/HCI Korea/i.test(v)) return `HCI Korea '${yy}  ·  Full Paper`;

  // Journals
  if (/Journal of Medical Internet Research/i.test(v)) return "JMIR  ·  Journal Article";
  if (/International Journal of Human.Computer/i.test(v)) return "IJHCI  ·  Journal Article";
  if (/Interacting with Computers/i.test(v)) return "IwC  ·  Journal Article";
  if (/Behaviour and Information Technology/i.test(v)) return "BIT  ·  Journal Article";
  if (/HCI Society of Korea|Journal of.*HCI/i.test(v)) return "HCI Society  ·  Journal Article";
  if (/Journal of KIISE/i.test(v)) return "KIISE  ·  Journal Article";
  if (/Educational Technology Research/i.test(v)) return "ETRD  ·  Journal Article";
  if (/Cancer Research|Medicine\b|Surgery\b|Nutrition|Microbiology|Coloproctology|Ecology/i.test(v))
    return "Journal Article";
  if (/Lecture notes in computer science/i.test(v)) return "LNCS  ·  Full Paper";

  // Generic fallback
  const isConf = /proceedings|conference|symposium|workshop/i.test(v)
    || type === "proceedings-article";
  return isConf ? "Conference Paper" : "Journal Article";
}

const AREAS: Record<string, string> = {
  "human-ai": "Human-AI Interaction",
  "healthcare": "Healthcare & Wellbeing",
  "social-media": "Social & Media Computing",
  "accessibility": "Accessible & Inclusive Design",
  "data-intelligence": "Data Intelligence",
};

const CUTOFF_YEAR = 2013;

function PubCard({
  pub,
  activeArea,
  setArea,
}: {
  pub: Publication;
  activeArea: string | null;
  setArea: (k: string | null) => void;
}) {
  return (
    <div className="group py-1">
      {venueLabel(pub.venue, pub.year, pub.type) && (
        <p className="text-xs text-[#2563eb] mb-1 tracking-wide" style={{ fontFamily: "var(--font-mono)" }}>
          {venueLabel(pub.venue, pub.year, pub.type)}
        </p>
      )}
      <a
        href={pub.doi ?? pub.url}
        target="_blank"
        rel="noopener noreferrer"
        style={{ fontFamily: "var(--font-sans)" }}
        className="font-medium text-slate-800 group-hover:text-[#2563eb] transition-colors leading-snug block mb-1"
      >
        {pub.title}
      </a>
      <p className="text-sm text-slate-500 mb-1">{pub.authors.join(", ")}</p>
      {pub.venue && <p className="text-xs text-slate-500 mb-2">{pub.venue}</p>}
      <div className="flex flex-wrap items-center gap-2 mt-1.5">
        {pub.doi && (
          <a
            href={pub.doi}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs px-2 py-0.5 border border-slate-100 text-slate-400 hover:border-slate-300 hover:text-slate-600 transition-colors"
          >
            DOI
          </a>
        )}
        {pub.pdf && (
          <a
            href={pub.pdf}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs px-2 py-0.5 border border-slate-100 text-slate-400 hover:border-slate-300 hover:text-slate-600 transition-colors"
          >
            PDF
          </a>
        )}
        {pub.areas && pub.areas.length > 0 && pub.areas.map((a) => (
          <button
            key={a}
            onClick={() => setArea(activeArea === a ? null : a)}
            className={`text-xs px-2.5 py-0.5 rounded-none border transition-colors ${
              activeArea === a
                ? "border-[#2563eb]/40 text-[#2563eb]"
                : "border-slate-100 text-slate-400 hover:border-slate-300 hover:text-slate-600"
            }`}
          >
            {AREAS[a] ?? a}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function PublicationsClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const activeArea = searchParams.get("area");
  const [visibleYear, setVisibleYear] = useState<number | "older" | null>(null);

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
  const recentYears = years.filter((y) => y > CUTOFF_YEAR);
  const olderPubs = years
    .filter((y) => y <= CUTOFF_YEAR)
    .flatMap((y) => byYear[y].map((p) => ({ ...p, _year: y })))
    .sort((a, b) => b._year - a._year);

  useEffect(() => {
    if (recentYears.length === 0) return;

    const observers: IntersectionObserver[] = [];
    recentYears.forEach((year) => {
      const el = document.getElementById(`year-${year}`);
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setVisibleYear(year); },
        { rootMargin: "-64px 0px -72% 0px", threshold: 0 }
      );
      obs.observe(el);
      observers.push(obs);
    });
    if (olderPubs.length > 0) {
      const el = document.getElementById("year-older");
      if (el) {
        const obs = new IntersectionObserver(
          ([entry]) => { if (entry.isIntersecting) setVisibleYear("older"); },
          { rootMargin: "-64px 0px -72% 0px", threshold: 0 }
        );
        obs.observe(el);
        observers.push(obs);
      }
    }
    return () => observers.forEach((o) => o.disconnect());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeArea]);

  function setArea(key: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (key) params.set("area", key);
    else params.delete("area");
    router.push(`/publications?${params.toString()}`);
  }

  function scrollToYear(year: number | "older") {
    const id = year === "older" ? "year-older" : `year-${year}`;
    const el = document.getElementById(id);
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
          className={`text-xs px-3 py-1.5 rounded-none border transition-colors ${
            !activeArea
              ? "bg-slate-900 text-white border-slate-900"
              : "border-slate-200 text-slate-500 hover:border-slate-400 hover:text-slate-700 "
          }`}
        >
          All
        </button>
        {Object.entries(AREAS).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setArea(activeArea === key ? null : key)}
            className={`text-xs px-3 py-1.5 rounded-none border transition-colors ${
              activeArea === key
                ? "bg-[#2563eb] text-white border-[#2563eb]"
                : "border-slate-200 text-slate-500 hover:border-slate-400 hover:text-slate-700 "
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {activeArea && (
        <p className="text-sm text-slate-500 mb-8">
          Showing <span className="font-medium text-slate-800">{filtered.length}</span> papers in{" "}
          <span className="font-medium text-[#2563eb]">{AREAS[activeArea]}</span>
        </p>
      )}

      <div className="flex gap-10">
        {/* Main publications list */}
        <div className="flex-1 min-w-0 space-y-8">
          {recentYears.map((year) => (
            <section key={year} id={`year-${year}`}>
              <h2 className="sticky top-16 z-10 bg-white text-base font-bold text-slate-700 py-3 mb-5 border-b-2 border-slate-200">
                {year}
              </h2>
              <div className="space-y-3">
                {byYear[year].map((pub) => (
                  <PubCard key={pub.id} pub={pub} activeArea={activeArea} setArea={setArea} />
                ))}
              </div>
            </section>
          ))}

          {olderPubs.length > 0 && (
            <section id="year-older">
              <h2 className="sticky top-16 z-10 bg-white text-base font-bold text-slate-700 py-3 mb-5 border-b-2 border-slate-200">
                2013 &amp; Earlier
              </h2>
              <div className="space-y-3">
                {olderPubs.map((pub) => (
                  <PubCard key={pub.id} pub={pub} activeArea={activeArea} setArea={setArea} />
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Year TOC sidebar */}
        <aside className="hidden lg:block w-16 shrink-0">
          <div className="sticky top-24 flex flex-col items-end gap-2">
            {recentYears.map((year) => (
              <button
                key={year}
                onClick={() => scrollToYear(year)}
                className={`text-sm transition-colors ${
                  visibleYear === year
                    ? "text-[#2563eb] font-semibold"
                    : "text-slate-400 hover:text-[#2563eb] hover:font-semibold"
                }`}
              >
                {year}
              </button>
            ))}
            {olderPubs.length > 0 && (
              <button
                onClick={() => scrollToYear("older")}
                className={`text-sm transition-colors ${
                  visibleYear === "older"
                    ? "text-[#2563eb] font-semibold"
                    : "text-slate-400 hover:text-[#2563eb] hover:font-semibold"
                }`}
              >
                2013+
              </button>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
