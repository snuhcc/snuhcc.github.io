import { Fragment } from "react";
import type { NewsItem } from "@/lib/news";

function CelebrationEmoji({ item }: { item: NewsItem }) {
  const emoji =
    item.type === "award" ? "🏆" :
    item.type === "graduation" ? "🎓" :
    item.type === "paper" && /(accepted|congrats)/i.test(item.text) ? "🎉" :
    null;

  return emoji ? <span aria-hidden="true" className="mr-1">{emoji}</span> : null;
}

function AnnouncementText({ item, text }: { item: NewsItem; text: string }) {
  if (item.type === "graduation") {
    const match = text.match(/^(.*?)( wrapped up their.*)$/);
    return match ? <><strong className="font-semibold text-slate-900">{match[1]}</strong>{match[2]}</> : text;
  }

  const pattern = item.type === "paper"
    ? /(\b\d+ papers?(?: and \d+ posters?)?\b|\b(?:Findings of )?(?:ACL|CHI|SIGIR|IUI|ASSETS|CIKM|ICWSM) \d{4}\b)/g
    : item.type === "award"
      ? /(\bBest Full Paper Award\b)/g
      : null;

  if (!pattern) return text;

  return text.split(pattern).map((part, index) =>
    index % 2 === 1
      ? <strong key={index} className="font-semibold text-slate-900">{part}</strong>
      : part
  );
}

export default function NewsItemText({ item }: { item: NewsItem }) {
  const papers = item.papers;

  if (papers?.length) {
    if (papers.length > 2) {
      return (
        <div className="text-sm text-slate-700 leading-relaxed">
          <p><CelebrationEmoji item={item} /><AnnouncementText item={item} text={item.text.replace(/[!:.]\s*$/, ":")} /></p>
          <ol className="mt-1 list-decimal space-y-1 pl-5">
            {papers.map((paper) => (
              <li key={paper.url}>
                <a
                  href={paper.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#0B3D91] hover:underline underline-offset-2"
                  data-analytics-event="news_paper_click"
                  data-analytics-label={paper.title}
                  data-analytics-news-id={item.id}
                  data-analytics-news-type={item.type}
                  data-analytics-news-date={item.date}
                >
                  {paper.title}
                </a>
              </li>
            ))}
          </ol>
        </div>
      );
    }

    return (
      <p className="text-sm text-slate-700 leading-relaxed">
        <CelebrationEmoji item={item} /><AnnouncementText item={item} text={item.text.replace(/[!:.]\s*$/, ":")} />{" "}
          {papers.map((paper, index) => (
            <Fragment key={paper.url}>
              <a
                href={paper.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#0B3D91] hover:underline underline-offset-2"
                data-analytics-event="news_paper_click"
                data-analytics-label={paper.title}
                data-analytics-news-id={item.id}
                data-analytics-news-type={item.type}
                data-analytics-news-date={item.date}
              >
                {paper.title}
              </a>
              {index === papers.length - 1 ? "." : "; "}
            </Fragment>
          ))}
      </p>
    );
  }

  if (item.url) {
    return (
      <a
        href={item.url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-sm text-slate-700 leading-relaxed hover:text-[#0B3D91] hover:underline underline-offset-2"
        data-analytics-event="news_item_click"
        data-analytics-label={item.text}
        data-analytics-news-id={item.id}
        data-analytics-news-type={item.type}
        data-analytics-news-date={item.date}
      >
        <CelebrationEmoji item={item} /><AnnouncementText item={item} text={item.text} />
      </a>
    );
  }

  return <span className="text-sm text-slate-700 leading-relaxed"><CelebrationEmoji item={item} /><AnnouncementText item={item} text={item.text} /></span>;
}
