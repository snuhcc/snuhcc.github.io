"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { type Publication, publications } from "@/lib/publications";

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

  // ACL
  if (/^Findings of the Association for Computational Linguistics: ACL /i.test(v))
    return `ACL '${yy}  ·  Findings`;
  if (/Association for Computational Linguistics/i.test(v))
    return /Long Papers/i.test(v) ? `ACL '${yy}  ·  Long Paper` : `ACL '${yy}  ·  Full Paper`;

  // UIST
  if (/\bUIST\b|User Interface Software and Technology/i.test(v)) return `UIST '${yy}  ·  Full Paper`;

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

const CUTOFF_YEAR = 2013;
const LAB_BLUE = "#0B3D91";

// "CHI '26  ·  Extended Abstract" → "CHI 2026 · Extended Abstract";
// journals / preprints / book chapters fall back to the full venue name.
function venueLine(pub: Publication): string | null {
  const label = venueLabel(pub.venue, pub.year, pub.type);
  const match = label?.match(/^(.+?) '(\d{2})\s+·\s+(.+)$/);
  if (match) {
    const [, name, yy, kind] = match;
    const year = Number(yy) > 50 ? `19${yy}` : `20${yy}`;
    return kind === "Full Paper" ? `${name} ${year}` : `${name} ${year} · ${kind}`;
  }
  if (/preprint/i.test(label ?? "")) return `${/arXiv/i.test(pub.venue ?? "") ? "arXiv" : "Preprint"} ${pub.year}`;
  if (pub.venue) return `${pub.venue}, ${pub.year}`;
  return label ? `${label}, ${pub.year}` : null;
}

function PubCard({ pub }: { pub: Publication }) {
  const publicationYear = String(pub.year);
  const venue = venueLabel(pub.venue, pub.year, pub.type);
  const link = pub.doi ?? pub.url;
  const analytics = {
    "data-analytics-publication-id": pub.id,
    "data-analytics-publication-year": publicationYear,
    "data-analytics-publication-type": pub.type,
    "data-analytics-venue-label": venue ?? "",
  };

  return (
    <article className="group grid grid-cols-1 sm:grid-cols-[220px_minmax(0,1fr)] gap-4 sm:gap-8 py-5">
      <a
        href={link}
        target="_blank"
        rel="noopener noreferrer"
        className="block w-full max-w-[280px] sm:max-w-none"
        data-analytics-event="publication_open"
        data-analytics-label={pub.title}
        {...analytics}
      >
        <div className="relative aspect-[16/10] overflow-hidden rounded-xl border border-slate-300 bg-white">
          {pub.teaserImage ? (
            <Image
              src={pub.teaserImage}
              alt={pub.teaserAlt ?? `${pub.title} teaser image`}
              fill
              sizes="(min-width: 640px) 220px, 100vw"
              className="object-contain p-1.5"
            />
          ) : (
            <div
              className="flex h-full w-full items-center justify-center text-xs tracking-[0.2em] uppercase text-slate-400"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              Coming soon
            </div>
          )}
        </div>
      </a>
      <div className="min-w-0">
        <a
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          style={{ fontFamily: "var(--font-sans)", color: LAB_BLUE }}
          className="block text-lg font-semibold leading-snug hover:underline underline-offset-4"
          data-analytics-event="publication_open"
          data-analytics-label={pub.title}
          {...analytics}
        >
          {pub.title}
        </a>
        <p className="mt-1.5 text-[15px] leading-relaxed text-slate-900">{pub.authors.join(", ")}</p>
        {venueLine(pub) && <p className="mt-0.5 text-[15px] text-slate-900">{venueLine(pub)}</p>}
        <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-2 text-[15px]">
          {pub.doi && (
            <a
              href={pub.doi}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: LAB_BLUE }}
              className="hover:underline underline-offset-4"
              data-analytics-event="publication_asset_click"
              data-analytics-label={`${pub.title} DOI`}
              data-analytics-publication-id={pub.id}
              data-analytics-publication-year={publicationYear}
              data-analytics-asset-type="doi"
            >
              DOI
            </a>
          )}
          {pub.doi && pub.pdf && <span className="text-slate-900">|</span>}
          {pub.pdf && (
            <a
              href={pub.pdf}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: LAB_BLUE }}
              className="hover:underline underline-offset-4"
              data-analytics-event="publication_asset_click"
              data-analytics-label={`${pub.title} PDF`}
              data-analytics-publication-id={pub.id}
              data-analytics-publication-year={publicationYear}
              data-analytics-asset-type="pdf"
            >
              PDF
            </a>
          )}
        </div>
      </div>
    </article>
  );
}

export default function PublicationsClient() {
  const [visibleYear, setVisibleYear] = useState<number | "older" | null>(null);

  const byYear = publications.reduce<Record<number, Publication[]>>((acc, p) => {
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
  }, []);

  function scrollToYear(year: number | "older") {
    const id = year === "older" ? "year-older" : `year-${year}`;
    const el = document.getElementById(id);
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - 80;
    window.scrollTo({ top, behavior: "smooth" });
  }

  return (
    <div
      className="max-w-6xl mx-auto px-6 py-16"
      data-analytics-section="publications_overview"
      data-analytics-page="publications"
    >
      <h1 className="text-3xl font-bold text-slate-900 mb-10">Publications</h1>

      <div className="flex gap-10">
        {/* Main publications list */}
        <div
          className="flex-1 min-w-0 divide-y divide-slate-200"
          data-analytics-section="publications_list"
        >
          {recentYears.map((year) => (
            <section key={year} id={`year-${year}`} className="pt-6 first:pt-0">
              <h2 className="sticky top-12 z-10 bg-white text-base font-bold text-slate-900 py-3 mb-2">
                {year}
              </h2>
              <div>
                {byYear[year].map((pub) => (
                  <PubCard key={pub.id} pub={pub} />
                ))}
              </div>
            </section>
          ))}

          {olderPubs.length > 0 && (
            <section id="year-older" className="pt-6">
              <h2 className="sticky top-12 z-10 bg-white text-base font-bold text-slate-900 py-3 mb-2">
                2013 &amp; Earlier
              </h2>
              <div>
                {olderPubs.map((pub) => (
                  <PubCard key={pub.id} pub={pub} />
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Year TOC sidebar */}
        <aside className="hidden lg:block w-16 shrink-0">
          <div
            className="sticky top-24 flex flex-col items-end gap-2"
            data-analytics-section="publications_year_nav"
          >
            {recentYears.map((year) => (
              <button
                key={year}
                onClick={() => scrollToYear(year)}
                className={`text-sm transition-colors ${
                  visibleYear === year
                    ? "text-[#0B3D91] font-semibold"
                    : "text-slate-400 hover:text-[#0B3D91] hover:font-semibold"
                }`}
                data-analytics-event="publication_year_jump_click"
                data-analytics-label={String(year)}
                data-analytics-year={String(year)}
              >
                {year}
              </button>
            ))}
            {olderPubs.length > 0 && (
              <button
                onClick={() => scrollToYear("older")}
                className={`text-sm transition-colors ${
                  visibleYear === "older"
                    ? "text-[#0B3D91] font-semibold"
                    : "text-slate-400 hover:text-[#0B3D91] hover:font-semibold"
                }`}
                data-analytics-event="publication_year_jump_click"
                data-analytics-label="2013+"
                data-analytics-year="2013_and_earlier"
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
