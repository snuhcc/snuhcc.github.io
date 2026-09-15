import { publications } from "@/lib/publications";
import { paperNewsRuleByKey } from "@/lib/paperNewsRules.mjs";

export type NewsPaper = {
  title: string;
  url: string;
};

export type NewsItem = {
  id: string;
  date: string;
  type: string;
  text: string;
  url?: string;
  papers?: NewsPaper[];
};

export function withPaperLinks(items: NewsItem[]): NewsItem[] {
  return items.map((item) => {
    if (item.type !== "paper" || item.papers?.length) return item;

    const match = item.id.match(/^([a-z]+)(\d{4})-papers$/);
    if (!match) return item;

    const [, key, year] = match;
    const rule = paperNewsRuleByKey(key);
    if (!rule) return item;

    const papers = publications
      .filter((publication) =>
        publication.year === Number(year) &&
        rule.buckets.some(({ pattern }) => pattern.test(publication.venue ?? ""))
      )
      .map(({ title, url }) => ({ title, url }));

    return papers.length ? { ...item, papers } : item;
  });
}
