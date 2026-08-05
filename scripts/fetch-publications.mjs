import { readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const AUTHOR_ID = "A5027548665"; // Bongwon Suh (OpenAlex)
const BASE_URL = "https://api.openalex.org";

async function fetchAllWorks() {
  const works = [];
  let cursor = "*";

  while (cursor) {
    const url =
      `${BASE_URL}/works?filter=author.id:${AUTHOR_ID}` +
      `&select=id,title,publication_year,primary_location,authorships,open_access,doi,type,concepts` +
      `&sort=publication_year:desc&per-page=100&cursor=${cursor}`;

    const res = await fetch(url, {
      headers: { "User-Agent": "hcclab-website/1.0 (mailto:hana2001@snu.ac.kr)" },
    });

    if (!res.ok) throw new Error(`OpenAlex API error: ${res.status}`);

    const data = await res.json();
    works.push(...data.results);

    cursor = data.meta?.next_cursor ?? null;
    if (data.results.length === 0) break;
  }

  return works;
}

function formatWork(work) {
  const venue =
    work.primary_location?.source?.display_name ??
    work.primary_location?.raw_source_name ??
    null;

  const type =
    work.primary_location?.raw_type ??
    work.type ??
    null;

  const authors = work.authorships
    .map((a) => a.author?.display_name)
    .filter(Boolean);

  return {
    id: work.id,
    title: work.title,
    year: work.publication_year,
    venue,
    authors,
    doi: work.doi ?? null,
    url: work.doi ? `https://doi.org/${work.doi.replace("https://doi.org/", "")}` : work.id,
    openAccess: work.open_access?.is_oa ?? false,
    type,
  };
}

const CONCEPT_SCORE_THRESHOLD = 0.3;
const CONCEPT_MIN_PAPER_COUNT = 2;
const GENERATED_NEWS_SOURCE = "publications";

const PAPER_NEWS_RULES = [
  {
    key: "acl",
    label: (year) => `ACL ${year}`,
    buckets: [
      {
        pattern:
          /^Proceedings of the \d+(st|nd|rd|th) Annual Meeting of the Association for Computational Linguistics/i,
        bucket: "paper",
      },
      {
        pattern: /^Findings of the Association for Computational Linguistics: ACL /i,
        bucket: "paper",
      },
    ],
  },
  {
    key: "chi",
    label: (year) => `CHI ${year}`,
    buckets: [
      {
        pattern:
          /^Proceedings of the (\d{4} )?CHI Conference on Human Factors in Computing Systems$/i,
        bucket: "paper",
      },
      {
        pattern:
          /^Proceedings of the Extended Abstracts of the (\d{4} )?CHI Conference on Human Factors in Computing Systems$/i,
        bucket: "poster",
      },
      {
        pattern: /^Extended Abstracts of the CHI Conference on Human Factors in Computing Systems$/i,
        bucket: "poster",
      },
    ],
  },
  {
    key: "iui",
    label: (year) => `IUI ${year}`,
    buckets: [
      {
        pattern: /International Conference on Intelligent User Interfaces/i,
        bucket: "paper",
      },
      {
        pattern: /Companion Proceedings of the .*International Conference on Intelligent User Interfaces/i,
        bucket: "poster",
      },
    ],
  },
  {
    key: "assets",
    label: (year) => `ASSETS ${year}`,
    buckets: [
      {
        pattern: /SIGACCESS Conference on Computers and Accessibility/i,
        bucket: "paper",
      },
    ],
  },
  {
    key: "sigir",
    label: (year) => `SIGIR ${year}`,
    buckets: [
      {
        pattern: /International ACM SIGIR Conference on Research and Development in Information Retrieval/i,
        bucket: "paper",
      },
    ],
  },
  {
    key: "cikm",
    label: (year) => `CIKM ${year}`,
    buckets: [
      {
        pattern: /ACM International Conference on Information and Knowledge Management/i,
        bucket: "paper",
      },
    ],
  },
  {
    key: "icwsm",
    label: (year) => `ICWSM ${year}`,
    buckets: [
      {
        pattern: /International AAAI Conference on Web and Social Media/i,
        bucket: "paper",
      },
    ],
  },
];

// OpenAlex disambiguates generic English nouns into unrelated Wikidata senses
// (e.g. "Set (abstract data type)", "Key (lock)", "Work (physics)") — these all
// carry a parenthetical suffix, so dropping such names filters out that noise.
//
// A few mis-tags slip through without a parenthetical suffix, e.g. a paper
// about visual "logos" gets tagged with the "Logos Bible Software" concept.
// Extend this set as new false positives turn up.
const CONCEPT_DENYLIST = new Set(["Logos Bible Software"]);

function isNoisyConceptName(name) {
  return / \(/.test(name) || CONCEPT_DENYLIST.has(name);
}

function matchPaperNewsRule(publication) {
  const venue = publication.venue ?? "";

  for (const rule of PAPER_NEWS_RULES) {
    for (const matcher of rule.buckets) {
      if (matcher.pattern.test(venue)) {
        return { rule, bucket: matcher.bucket };
      }
    }
  }

  return null;
}

function pluralize(count, singular, plural = `${singular}s`) {
  return count === 1 ? singular : plural;
}

function buildGeneratedPaperNews(publications, existingNews, syncMonth) {
  const groups = new Map();
  const currentYear = new Date().getUTCFullYear();

  for (const publication of publications) {
    const match = matchPaperNewsRule(publication);
    if (!match) continue;

    const year = publication.year;
    if (!year) continue;

    const groupKey = `${match.rule.key}-${year}`;
    const nextGroup =
      groups.get(groupKey) ?? {
        rule: match.rule,
        year,
        paper: 0,
        poster: 0,
        papers: [],
      };

    nextGroup[match.bucket] += 1;
    nextGroup.papers.push({ title: publication.title, url: publication.url });
    groups.set(groupKey, nextGroup);
  }

  const manualIds = new Set(
    existingNews
      .filter((item) => item.source !== GENERATED_NEWS_SOURCE)
      .map((item) => item.id)
  );
  const existingGeneratedById = new Map(
    existingNews
      .filter((item) => item.source === GENERATED_NEWS_SOURCE)
      .map((item) => [item.id, item])
  );

  return [...groups.values()]
    .sort((a, b) => b.year - a.year || a.rule.key.localeCompare(b.rule.key))
    .flatMap((group) => {
      const id = `${group.rule.key}${group.year}-papers`;
      if (manualIds.has(id)) return [];

      const label = group.rule.label(group.year);
      const parts = [];
      if (group.paper > 0) {
        parts.push(`${group.paper} ${pluralize(group.paper, "paper")}`);
      }
      if (group.poster > 0) {
        parts.push(`${group.poster} ${pluralize(group.poster, "poster")}`);
      }
      if (parts.length === 0) return [];

      const text = `Congrats! ${parts.join(" and ")} accepted at ${label}!`;
      const previous = existingGeneratedById.get(id);
      if (previous) return [];
      if (!previous && group.year < currentYear) return [];

      return [
        {
          id,
          date: syncMonth,
          type: "paper",
          text,
          papers: group.papers,
          source: GENERATED_NEWS_SOURCE,
        },
      ];
    });
}

function syncNewsFromPublications(publications, newsPath) {
  const existingNewsData = JSON.parse(readFileSync(newsPath, "utf-8"));
  const existingNews = existingNewsData.news ?? [];
  const syncMonth = new Date().toISOString().slice(0, 7);

  const generatedPaperNews = buildGeneratedPaperNews(publications, existingNews, syncMonth);
  const mergedNews = [...existingNews, ...generatedPaperNews].sort((a, b) => {
    const dateOrder = b.date.localeCompare(a.date);
    return dateOrder !== 0 ? dateOrder : a.id.localeCompare(b.id);
  });

  writeFileSync(newsPath, JSON.stringify({ news: mergedNews }, null, 2));
  console.log(`Saved to ${newsPath}`);
}

// Level 0 concepts are too coarse to be useful (~85% of papers tag "Computer science").
// Level 1 reads as "Subject Areas", level 2+ as specific "Keywords".
function aggregateConcepts(works) {
  const subjectAreas = new Map();
  const keywords = new Map();

  for (const work of works) {
    for (const c of work.concepts ?? []) {
      if (c.score < CONCEPT_SCORE_THRESHOLD || c.level === 0 || isNoisyConceptName(c.display_name)) continue;
      const bucket = c.level === 1 ? subjectAreas : keywords;
      bucket.set(c.display_name, (bucket.get(c.display_name) ?? 0) + 1);
    }
  }

  const toRankedList = (bucket, limit) =>
    [...bucket.entries()]
      .filter(([, count]) => count >= CONCEPT_MIN_PAPER_COUNT)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([name, count]) => ({ name, count }));

  return {
    subjectAreas: toRankedList(subjectAreas, 20),
    keywords: toRankedList(keywords, 35),
  };
}

async function main() {
  console.log("Fetching publications for Bongwon Suh from OpenAlex...");

  const works = await fetchAllWorks();
  const formatted = works.map(formatWork);

  console.log(`Fetched ${formatted.length} publications.`);

  const __dirname = dirname(fileURLToPath(import.meta.url));
  const outPath = join(__dirname, "../src/data/publications.json");

  // Append-only sync:
  // keep existing publication entries exactly as they are, and only add
  // genuinely new OpenAlex records that are not already in the local dataset.
  const existing = JSON.parse(readFileSync(outPath, "utf-8"));
  const existingById = new Map(existing.publications.map((p) => [p.id, p]));
  const newPublications = formatted.filter((pub) => !existingById.has(pub.id));
  const merged = [...existing.publications, ...newPublications]
    .sort((a, b) => b.year - a.year);

  writeFileSync(
    outPath,
    JSON.stringify({ updatedAt: new Date().toISOString(), publications: merged }, null, 2)
  );

  console.log(`Saved to ${outPath}`);
  console.log(`Added ${newPublications.length} new publication(s). Existing entries were left unchanged.`);

  const keywordsOutPath = join(__dirname, "../src/data/keywords.json");
  const { subjectAreas, keywords } = aggregateConcepts(works);

  writeFileSync(
    keywordsOutPath,
    JSON.stringify({ updatedAt: new Date().toISOString(), subjectAreas, keywords }, null, 2)
  );

  console.log(`Saved to ${keywordsOutPath}`);

  const newsOutPath = join(__dirname, "../src/data/news.json");
  syncNewsFromPublications(merged, newsOutPath);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
