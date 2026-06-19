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

  // Preserve manually-curated fields (e.g. "areas") that OpenAlex doesn't provide,
  // so re-syncing doesn't clobber existing categorization.
  const existing = JSON.parse(readFileSync(outPath, "utf-8"));
  const existingById = new Map(existing.publications.map((p) => [p.id, p]));
  const merged = formatted.map((pub) => {
    const prev = existingById.get(pub.id);
    return prev?.areas ? { ...pub, areas: prev.areas } : pub;
  });

  writeFileSync(
    outPath,
    JSON.stringify({ updatedAt: new Date().toISOString(), publications: merged }, null, 2)
  );

  console.log(`Saved to ${outPath}`);

  const keywordsOutPath = join(__dirname, "../src/data/keywords.json");
  const { subjectAreas, keywords } = aggregateConcepts(works);

  writeFileSync(
    keywordsOutPath,
    JSON.stringify({ updatedAt: new Date().toISOString(), subjectAreas, keywords }, null, 2)
  );

  console.log(`Saved to ${keywordsOutPath}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
