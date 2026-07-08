import type { Metadata } from "next";
import newsData from "@/data/news.json";

export const metadata: Metadata = {
  title: "News",
  description:
    "Latest news from HCC Lab — paper acceptances, awards, talks, and lab events at Seoul National University.",
  openGraph: {
    title: "News | HCC Lab",
    description:
      "Latest news from HCC Lab — paper acceptances, awards, talks, and lab events at Seoul National University.",
  },
};

type NewsItem = {
  id: string;
  date: string;
  type: string;
  text: string;
  url?: string;
};

const TYPE_LABELS: Record<string, string> = {
  paper:      "Paper",
  graduation: "Graduation",
  award:      "Award",
  talk:       "Talk",
  press:      "Press",
};

export default function NewsPage() {
  const items = (newsData.news as NewsItem[]).sort((a, b) =>
    b.date.localeCompare(a.date)
  );

  return (
    <div
      className="max-w-4xl mx-auto px-6 py-16"
      data-analytics-section="news_archive"
      data-analytics-page="news"
    >
      <h1 className="text-3xl font-bold text-slate-900 mb-12">News</h1>
      <ul className="divide-y divide-slate-100">
        {items.map((item) => (
          <li key={item.id} className="py-5 flex items-start gap-6">
            <span className="shrink-0 w-20 text-xs text-slate-500 pt-0.5 tabular-nums">
              {item.date}
            </span>
            <span className="shrink-0 text-xs font-semibold uppercase tracking-wide text-[#0B3D91] w-24">
              {TYPE_LABELS[item.type] ?? item.type}
            </span>
            <span className="text-sm text-slate-700 leading-relaxed">
              {item.url ? (
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#0B3D91] hover:underline underline-offset-2"
                  data-analytics-event="news_item_click"
                  data-analytics-label={item.text}
                  data-analytics-news-id={item.id}
                  data-analytics-news-type={item.type}
                  data-analytics-news-date={item.date}
                >
                  {item.text}
                </a>
              ) : (
                item.text
              )}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
