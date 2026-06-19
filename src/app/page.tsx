import Link from "next/link";
import newsData from "@/data/news.json";
import publicationsData from "@/data/publications.json";
import keywordsData from "@/data/keywords.json";
import ShaderHero from "@/components/ShaderHero";
import WordCloud from "@/components/WordCloud";
import YearChart from "@/components/YearChart";

const NEWS_TYPE_LABELS: Record<string, string> = {
  paper:      "Paper",
  graduation: "Graduation",
  award:      "Award",
  talk:       "Talk",
  press:      "Press",
};

export default function Home() {
  return (
    <div>
      {/* Hero */}
      <section className="relative min-h-[55vh] flex items-center overflow-hidden bg-[#0B3D91]">
        <ShaderHero />
        <div className="absolute inset-0 bg-black/30 z-[1]" />
        <div className="relative z-10 max-w-6xl w-full mx-auto px-6 py-16">
          <h1 className="text-5xl text-white leading-tight font-normal" style={{ fontFamily: "var(--font-mono)" }}>
            <span className="block">Human Centered</span>
            <span className="block mt-1">Computing Lab</span>
          </h1>
          <p className="text-lg text-white/90 max-w-xl leading-relaxed mt-6">
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
      <section className="border-t border-slate-100 py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-baseline justify-between mb-12">
            <h2 className="text-2xl font-bold text-slate-900">Research Snapshot</h2>
            <Link
              href="/publications"
              className="text-sm text-slate-400 hover:text-[#0B3D91] transition-colors"
            >
              all publications →
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-6">
                Subject Areas
              </h3>
              <WordCloud items={keywordsData.subjectAreas} />
            </div>
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-6">
                Published Items by Year
              </h3>
              <YearChart years={publicationsData.publications.map((p) => p.year)} />
            </div>
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-6">
                Keywords
              </h3>
              <WordCloud items={keywordsData.keywords} />
            </div>
          </div>
        </div>
      </section>

      {/* News */}
      <section className="border-t border-slate-200 py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-baseline justify-between mb-10">
            <h2 className="text-2xl font-bold text-slate-900">News</h2>
            <Link
              href="/news"
              className="text-sm text-slate-400 hover:text-[#0B3D91] transition-colors"
            >
              all news →
            </Link>
          </div>
          <ul className="divide-y divide-slate-100">
            {(newsData.news as { id: string; date: string; type: string; text: string; url?: string }[])
              .sort((a, b) => b.date.localeCompare(a.date))
              .slice(0, 3)
              .map((item) => (
                <li key={item.id} className="py-4 flex items-start gap-6">
                  <span className="shrink-0 w-20 text-xs text-slate-500 pt-0.5 tabular-nums">{item.date}</span>
                  <span className="shrink-0 text-xs font-semibold uppercase tracking-wide text-[#0B3D91] w-24">
                    {NEWS_TYPE_LABELS[item.type] ?? item.type}
                  </span>
                  <span className="text-sm text-slate-700 leading-relaxed">
                    {item.url ? (
                      <a href={item.url} target="_blank" rel="noopener noreferrer" className="hover:text-[#0B3D91] hover:underline underline-offset-2">
                        {item.text}
                      </a>
                    ) : (
                      item.text
                    )}
                  </span>
                </li>
              ))}
          </ul>
          <div className="mt-6 flex justify-end">
            <Link
              href="/news"
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
