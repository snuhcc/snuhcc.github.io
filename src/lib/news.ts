import publicationsData from "@/data/publications.json";

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

const PAPER_NEWS_RULES: Record<string, RegExp[]> = {
  acl: [
    /^Proceedings of the \d+(st|nd|rd|th) Annual Meeting of the Association for Computational Linguistics/i,
    /^Findings of the Association for Computational Linguistics: ACL /i,
  ],
  chi: [
    /^Proceedings of the (\d{4} )?CHI Conference on Human Factors in Computing Systems$/i,
    /^Proceedings of the Extended Abstracts of the (\d{4} )?CHI Conference on Human Factors in Computing Systems$/i,
    /^Extended Abstracts of the CHI Conference on Human Factors in Computing Systems$/i,
  ],
  iui: [
    /International Conference on Intelligent User Interfaces/i,
    /Companion Proceedings of the .*International Conference on Intelligent User Interfaces/i,
  ],
  assets: [/SIGACCESS Conference on Computers and Accessibility/i],
  sigir: [/International ACM SIGIR Conference on Research and Development in Information Retrieval/i],
  cikm: [/ACM International Conference on Information and Knowledge Management/i],
  icwsm: [/International AAAI Conference on Web and Social Media/i],
};

export function withPaperLinks(items: NewsItem[]): NewsItem[] {
  return items.map((item) => {
    if (item.type !== "paper" || item.papers?.length) return item;

    const match = item.id.match(/^([a-z]+)(\d{4})-papers$/);
    if (!match) return item;

    const [, key, year] = match;
    const rules = PAPER_NEWS_RULES[key];
    if (!rules) return item;

    const papers = publicationsData.publications
      .filter((publication) =>
        publication.year === Number(year) &&
        rules.some((rule) => rule.test(publication.venue ?? ""))
      )
      .map(({ title, url }) => ({ title, url }));

    return papers.length ? { ...item, papers } : item;
  });
}
