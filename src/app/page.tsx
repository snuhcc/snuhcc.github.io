import Link from "next/link";
import newsData from "@/data/news.json";
import publicationsData from "@/data/publications.json";
import keywordsData from "@/data/keywords.json";
import ShaderHero from "@/components/ShaderHero";
import WordCloud from "@/components/WordCloud";
import YearChart from "@/components/YearChart";
import NewsItemText from "@/components/NewsItemText";
import { type NewsItem, withPaperLinks } from "@/lib/news";

const HOME_SUBJECT_AREA_LIMIT = 12;
const HOME_KEYWORD_LIMIT = 25;

export default function Home() {
  return (
    <div>
      {/* Hero */}
      <section
        className="relative min-h-[40vh] md:min-h-[44vh] flex items-center overflow-hidden bg-[#0B3D91]"
        data-analytics-section="home_hero"
        data-analytics-page="home"
      >
        <ShaderHero />
        <div className="absolute inset-0 bg-black/30 z-[1]" />
        <div className="relative z-10 max-w-6xl w-full mx-auto px-6 py-12 md:py-14">
          <h1 className="text-4xl md:text-[2.9rem] text-white leading-tight font-normal" style={{ fontFamily: "var(--font-mono)" }}>
            <span className="block">Human Centered</span>
            <span className="block mt-1">Computing Lab</span>
          </h1>
          <p className="text-base md:text-lg text-white/90 max-w-xl leading-relaxed mt-5">
            Led by <span className="text-white font-medium">Prof. Bongwon Suh</span> at{" "}
            <span className="text-white font-medium">Seoul National University</span>, we are an
            interdisciplinary research group at the intersection of{" "}
            <span className="text-white font-medium">HCI</span>,{" "}
            <span className="text-white font-medium">Big Data</span>, and{" "}
            <span className="text-white font-medium">Artificial Intelligence</span>.
          </p>
        </div>
      </section>

      {/* Research Snapshot */}
      <section
        className="border-t border-slate-100 py-12"
        data-analytics-section="home_research_snapshot"
        data-analytics-page="home"
      >
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-baseline justify-between mb-8">
            <h2 className="text-2xl font-bold text-slate-900">Research Snapshot</h2>
            <Link
              href="/publications"
              data-analytics-event="home_section_link_click"
              data-analytics-label="All publications"
              data-analytics-destination="/publications"
              className="text-sm text-slate-600 hover:text-[#0B3D91] transition-colors"
            >
              all publications →
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-700 mb-4">
                Subject Areas
              </h3>
              <WordCloud items={keywordsData.subjectAreas.slice(0, HOME_SUBJECT_AREA_LIMIT)} />
            </div>
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-700 mb-4">
                Published Items by Year
              </h3>
              <YearChart years={publicationsData.publications.map((p) => p.year)} />
            </div>
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-700 mb-4">
                Keywords
              </h3>
              <WordCloud items={keywordsData.keywords.slice(0, HOME_KEYWORD_LIMIT)} />
            </div>
          </div>
        </div>
      </section>

      {/* News */}
      <section
        className="border-t border-slate-200 py-20"
        data-analytics-section="home_news"
        data-analytics-page="home"
      >
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-baseline justify-between mb-10">
            <h2 className="text-2xl font-bold text-slate-900">News</h2>
            <Link
              href="/news"
              data-analytics-event="home_section_link_click"
              data-analytics-label="All news"
              data-analytics-destination="/news"
              className="text-sm text-slate-400 hover:text-[#0B3D91] transition-colors"
            >
              all news →
            </Link>
          </div>
          <ul className="divide-y divide-slate-100">
            {withPaperLinks(newsData.news as NewsItem[])
              .sort((a, b) => b.date.localeCompare(a.date))
              .slice(0, 3)
              .map((item) => (
                <li key={item.id} className="py-4 flex items-start gap-5">
                  <span className="shrink-0 w-20 text-xs text-slate-500 pt-0.5 tabular-nums">{item.date}</span>
                  <NewsItemText item={item} />
                </li>
              ))}
          </ul>
          <div className="mt-6 flex justify-end">
            <Link
              href="/news"
              data-analytics-event="home_section_link_click"
              data-analytics-label="News archive plus"
              data-analytics-destination="/news"
              className="w-8 h-8 flex items-center justify-center border border-slate-200 text-slate-400 hover:border-[#0B3D91] hover:text-[#0B3D91] transition-colors text-lg leading-none"
            >
              +
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
