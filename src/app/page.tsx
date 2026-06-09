import Link from "next/link";
import newsData from "@/data/news.json";
import ShaderHero from "@/components/ShaderHero";

const researchAreas = [
  {
    key: "human-ai",
    title: "Human-AI Interaction",
    short: "HAI",
    description:
      "We study how people understand, trust, and collaborate with AI systems, and design conversational agents and generative tools that are transparent, useful, and aligned with human needs.",
  },
  {
    key: "healthcare",
    title: "Healthcare & Wellbeing",
    short: "Health",
    description:
      "We build technologies that support physical and mental health, from patient-facing tools to clinician workflows, with a focus on improving wellbeing across diverse populations.",
  },
  {
    key: "social-media",
    title: "Social & Media Computing",
    short: "SMC",
    description:
      "We study how people communicate, share information, and form communities on social platforms, and design systems that foster healthier online interactions.",
  },
  {
    key: "accessibility",
    title: "Accessible & Inclusive Design",
    short: "AID",
    description:
      "We create technologies that work for people of all abilities and backgrounds, removing barriers and expanding who can participate in digital experiences.",
  },
  {
    key: "data-intelligence",
    title: "Data Intelligence",
    short: "DI",
    description:
      "We develop methods to collect, analyze, and visualize large-scale data, surfacing insights that help people and organizations make better decisions.",
  },
];

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
            We are an interdisciplinary research group working at the intersection of{" "}
            <span className="text-white font-medium">HCI</span>,{" "}
            <span className="text-white font-medium">Big Data</span>, and{" "}
            <span className="text-white font-medium">Artificial Intelligence</span>.
            Our goal is to help people communicate and interact without limits through
            human-centered software and hardware tools.
          </p>
        </div>
      </section>

      {/* Research Areas */}
      <section className="border-t border-slate-100 py-20">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-slate-900 mb-12">Research Areas</h2>
          <div className="divide-y divide-slate-100">
            {researchAreas.map((area) => (
              <div key={area.key} className="group py-2 grid grid-cols-1 md:grid-cols-[260px_1fr] gap-4 md:gap-12">
                <Link
                  href={`/publications?area=${area.key}`}
                  className="text-base font-semibold text-slate-900 hover:text-[#0B3D91] transition-colors self-start"
                >
                  {area.title}
                </Link>
                <p className="text-sm leading-loose text-slate-600">{area.description}</p>
              </div>
            ))}
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
