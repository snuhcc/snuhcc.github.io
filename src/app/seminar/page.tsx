"use client";

import seminarsData from "@/data/seminars.json";
import { useState, useMemo } from "react";

type Seminar = {
  date: string;
  title: string;
  presenter: string;
  tags: string[];
  semester: string;
  slides: string | null;
};

const seminars: Seminar[] = seminarsData;

const TAG_ORDER = [
  "LLM",
  "VLM",
  "MLLM",
  "Multi-Agent",
  "Prompt Engineering",
  "Reasoning",
  "Transformer",
  "HAI",
  "HCI",
  "Physical AI",
];

const HIDDEN_TAGS = new Set(["Prompt Engineering"]);

function tagRank(tag: string) {
  const index = TAG_ORDER.indexOf(tag);
  return index === -1 ? TAG_ORDER.length : index;
}

function sortTags(tags: string[]) {
  return [...tags].sort((a, b) => tagRank(a) - tagRank(b) || a.localeCompare(b));
}

const allTags = Array.from(new Set(seminars.flatMap((s) => s.tags.filter((tag) => !HIDDEN_TAGS.has(tag))))).sort(
  (a, b) => tagRank(a) - tagRank(b) || a.localeCompare(b)
);
const allGroupYears = Array.from(new Set(seminars.map((s) => s.date.slice(0, 4)))).sort(
  (a, b) => b.localeCompare(a)
);

export default function SeminarPage() {
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return seminars.filter((s) => {
      if (selectedTag && !s.tags.includes(selectedTag)) return false;
      if (selectedYear && s.date.slice(0, 4) !== selectedYear) return false;
      return true;
    });
  }, [selectedTag, selectedYear]);

  const grouped = filtered.reduce<Record<string, Seminar[]>>((acc, s) => {
    const year = s.date.slice(0, 4);
    if (!acc[year]) acc[year] = [];
    acc[year].push(s);
    return acc;
  }, {});

  const groupedKeys = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

  return (
    <div
      className="max-w-5xl mx-auto px-6 py-16"
      data-analytics-section="seminar_overview"
      data-analytics-page="seminar"
    >
      <h1 className="text-3xl font-bold text-slate-900 mb-8">Lab Seminar</h1>

      {/* Filters */}
      <div
        className="flex flex-col gap-3 mb-10"
        data-analytics-section="seminar_filters"
      >
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedYear(null)}
            className={`text-xs px-3 py-1.5 rounded-none border transition-all ${
              !selectedYear
                ? "bg-slate-900 text-white border-slate-900"
                : "border-slate-200 text-slate-500 hover:border-slate-400 hover:text-slate-700 hover:font-medium"
            }`}
            data-analytics-event="seminar_filter_click"
            data-analytics-label="All years"
            data-analytics-filter-name="year"
            data-analytics-filter-value="all"
            data-analytics-filter-state={!selectedYear ? "active" : "inactive"}
          >
            All years
          </button>
          {allGroupYears.map((year) => (
            <button
              key={year}
              onClick={() => setSelectedYear(year === selectedYear ? null : year)}
              className={`text-xs px-3 py-1.5 rounded-none border transition-all ${
                selectedYear === year
                  ? "bg-slate-900 text-white border-slate-900"
                  : "border-slate-200 text-slate-500 hover:border-slate-400 hover:text-slate-700 hover:font-medium"
              }`}
              data-analytics-event="seminar_filter_click"
              data-analytics-label={year}
              data-analytics-filter-name="year"
              data-analytics-filter-value={year}
              data-analytics-filter-state={selectedYear === year ? "active" : "inactive"}
            >
              {year}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedTag(null)}
            className={`text-xs px-3 py-1.5 rounded-none border transition-all ${
              !selectedTag
                ? "bg-[#192e57] text-white border-[#192e57]"
                : "border-slate-200 text-slate-500 hover:border-slate-400 hover:text-slate-700 hover:font-medium"
            }`}
            data-analytics-event="seminar_filter_click"
            data-analytics-label="All topics"
            data-analytics-filter-name="topic"
            data-analytics-filter-value="all"
            data-analytics-filter-state={!selectedTag ? "active" : "inactive"}
          >
            All topics
          </button>
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}
              className={`text-xs px-3 py-1.5 rounded-none border transition-all ${
                selectedTag === tag
                  ? "bg-[#192e57] text-white border-[#192e57]"
                  : "border-slate-200 text-slate-500 hover:border-slate-400 hover:text-slate-700 hover:font-medium"
              }`}
              data-analytics-event="seminar_filter_click"
              data-analytics-label={tag}
              data-analytics-filter-name="topic"
              data-analytics-filter-value={tag}
              data-analytics-filter-state={selectedTag === tag ? "active" : "inactive"}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-12" data-analytics-section="seminar_list">
        {groupedKeys.map((year) => (
          <section key={year}>
            <h2 className="sticky top-12 z-10 bg-white text-base font-bold text-slate-700 py-3 mb-5 border-b-2 border-slate-200">
              {year}
            </h2>
            <div className="divide-y divide-slate-100">
              {grouped[year]
                .sort((a, b) => b.date.localeCompare(a.date))
                .map((s, i) => (
                  <div key={i} className="py-3 flex gap-5 group">
                    <div className="shrink-0 w-14 pt-0.5">
                      <p className="text-xs text-slate-500 tabular-nums">
                        {new Date(s.date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}
                        className="font-medium text-slate-800 group-hover:text-[#2563eb] transition-colors leading-snug mb-1"
                      >
                        {s.title}
                      </p>
                      <p className="text-sm text-slate-500 mb-1.5">{s.presenter}</p>
                      <div className="flex flex-wrap items-center gap-1.5">
                        {sortTags(s.tags).filter((tag) => !HIDDEN_TAGS.has(tag)).map((tag) => (
                          <button
                            key={tag}
                            onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}
                            className={`text-xs px-2.5 py-0.5 border transition-colors ${
                              selectedTag === tag
                                ? "border-[#2563eb] text-[#2563eb]"
                                : "border-slate-200 text-slate-400 hover:border-slate-400 hover:text-slate-600"
                            }`}
                            data-analytics-event="seminar_tag_click"
                            data-analytics-label={tag}
                            data-analytics-seminar-title={s.title}
                            data-analytics-seminar-date={s.date}
                            data-analytics-filter-name="topic"
                            data-analytics-filter-value={tag}
                            data-analytics-filter-state={selectedTag === tag ? "active" : "inactive"}
                          >
                            {tag}
                          </button>
                        ))}
                        {s.slides && (
                          <a
                            href={s.slides}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs px-2.5 py-0.5 border border-slate-300 text-slate-500 hover:border-slate-500 hover:text-slate-700 transition-colors"
                            data-analytics-event="seminar_slides_click"
                            data-analytics-label={s.title}
                            data-analytics-seminar-title={s.title}
                            data-analytics-seminar-date={s.date}
                            data-analytics-presenter={s.presenter}
                          >
                            PDF
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
