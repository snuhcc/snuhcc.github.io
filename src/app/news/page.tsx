import type { Metadata } from "next";
import newsData from "@/data/news.json";
import NewsItemText from "@/components/NewsItemText";
import { type NewsItem, withPaperLinks } from "@/lib/news";

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

export default function NewsPage() {
  const items = withPaperLinks(newsData.news as NewsItem[]).sort((a, b) =>
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
          <li key={item.id} className="py-5 flex items-start gap-5">
            <span className="shrink-0 w-20 text-xs text-slate-500 pt-0.5 tabular-nums">
              {item.date}
            </span>
            <NewsItemText item={item} />
          </li>
        ))}
      </ul>
    </div>
  );
}
