import Link from "next/link";
import publicationsData from "@/data/publications.json";
import ShaderHero from "@/components/ShaderHero";

const FIVE_YEARS_AGO = new Date().getFullYear() - 5;

type Pub = {
  id: string;
  title: string;
  year: number;
  doi?: string;
  areas?: string[];
};

function shortTitle(title: string): string {
  const colon = title.indexOf(": ");
  if (colon > 0 && colon <= 25 && !title.startsWith('"') && !title.startsWith("'")) {
    return title.substring(0, colon);
  }
  const clean = title.replace(/^"[^"]*":\s*/, "").replace(/^'[^']*':\s*/, "");
  const words = clean.split(/\s+/).filter((w) => w.length > 2);
  return words.slice(0, 3).join(" ");
}

function getAreaPapers(areaKey: string): Pub[] {
  return (publicationsData.publications as Pub[])
    .filter((p) => p.year >= FIVE_YEARS_AGO && p.areas?.[0] === areaKey)
    .sort((a, b) => b.year - a.year)
    .slice(0, 8);
}

const researchAreas = [
  { key: "human-ai",         title: "Human-AI Interaction",       short: "HAI"    },
  { key: "healthcare",       title: "Healthcare & Wellbeing",     short: "Health" },
  { key: "social-media",     title: "Social & Media Computing",   short: "SMC"    },
  { key: "accessibility",    title: "Accessible & Inclusive Design", short: "AID" },
  { key: "data-intelligence",title: "Data Intelligence",          short: "DI"     },
];

export default function Home() {
  return (
    <div>
      {/* Hero */}
      <section
        className="relative min-h-[55vh] flex items-center overflow-hidden bg-[#0B3D91]"
      >
        <ShaderHero />
        <div className="absolute inset-0 bg-black/20 z-[1]" />
        <div className="relative z-10 max-w-6xl w-full mx-auto px-6 py-16">
          <h1 className="text-5xl text-white leading-tight font-normal" style={{ fontFamily: "var(--font-mono)" }}>
            <span className="block">Human centered</span>
            <span className="block mt-1">Computing Lab</span>
          </h1>
          <p className="text-lg text-white/70 max-w-xl leading-relaxed mt-6">
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
            {researchAreas.map((area) => {
              const papers = getAreaPapers(area.key);
              return (
                <div key={area.key} className="group py-2 grid grid-cols-1 md:grid-cols-[260px_1fr] gap-4 md:gap-12">
                  <Link
                    href={`/publications?area=${area.key}`}
                    className="text-base font-semibold text-slate-900 hover:text-[#0B3D91] transition-colors self-start"
                  >
                    {area.title}
                  </Link>
                  <p className="text-sm leading-loose text-slate-600">
                    {papers.map((p, pi) => {
                      const name = shortTitle(p.title);
                      return (
                        <span key={p.id}>
                          {pi > 0 && <span className="mx-1.5 text-slate-300">·</span>}
                          {p.doi ? (
                            <a
                              href={p.doi}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hover:text-[#0B3D91] hover:underline underline-offset-2 transition-colors"
                            >
                              {name}
                            </a>
                          ) : (
                            <span>{name}</span>
                          )}
                        </span>
                      );
                    })}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="border-t border-slate-100 py-20">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-slate-900 mb-8">Contact</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-3">
                Gwanak Campus
              </h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                2nd floor, 18-dong<br />
                Gwanak-ro 1, Gwanak-gu<br />
                Seoul, Republic of Korea (08826)
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-3">
                Gwanggyo Campus
              </h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Gwanggyo-ro 145, Yeongtong-gu<br />
                Suwon-si, Gyeonggi-do<br />
                Republic of Korea (16229)
              </p>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-slate-100 text-sm text-slate-500">
            <p>
              <span className="font-medium text-slate-700">Prof. Bongwon Suh</span>
              {" "}— bongwon@snu.ac.kr · 02-880-9364
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
