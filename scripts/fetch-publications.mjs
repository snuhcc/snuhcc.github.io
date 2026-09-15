import { readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import {
  buildLabAuthorMatcher,
  collapsePublications,
  isBongwonSuh,
  isLabPublication,
  publicationRank,
  titleKey,
} from "../src/lib/publications.mjs";
import { matchPaperNewsRule } from "../src/lib/paperNewsRules.mjs";

const AUTHOR_ID = "A5027548665"; // Bongwon Suh (OpenAlex, canonical profile)
const AUTHOR_NAME = "Bongwon Suh";
const BASE_URL = "https://api.openalex.org";

// OpenAlex "polite pool" contact. A free API key (https://openalex.org/rest-api)
// lifts the anonymous rate limit that made the monthly sync fail with 429.
const MAILTO = process.env.OPENALEX_MAILTO || "hana2001@snu.ac.kr";
const API_KEY = process.env.OPENALEX_API_KEY || null;

// Set SYNC_ALL_COAUTHORED=1 to also add papers where the PI is the only lab
// author (clinical collaborations etc.). By default those are only logged.
const LAB_ONLY = process.env.SYNC_ALL_COAUTHORED !== "1";

const MAX_RETRIES = 6;
const WORK_FIELDS =
  "id,title,publication_year,primary_location,authorships,open_access,doi,type,concepts";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchJson(path, params, attempt = 0) {
  const url = new URL(path, BASE_URL);
  for (const [key, value] of Object.entries(params)) url.searchParams.set(key, value);
  url.searchParams.set("mailto", MAILTO);
  if (API_KEY) url.searchParams.set("api_key", API_KEY);

  const res = await fetch(url, {
    headers: { "User-Agent": `hcclab-website/1.0 (mailto:${MAILTO})` },
  });

  if (res.status === 429 || res.status >= 500) {
    if (attempt >= MAX_RETRIES) {
      throw new Error(`OpenAlex API error: ${res.status} after ${attempt} retries (${url.pathname})`);
    }
    // OpenAlex tells us how long to back off, either via Retry-After or in the
    // JSON body ({"retryAfter": 10}); fall back to exponential backoff.
    let waitMs = Number(res.headers.get("retry-after")) * 1000 || 0;
    if (!waitMs) {
      try {
        const body = await res.json();
        waitMs = Number(body?.retryAfter) * 1000 || 0;
      } catch {
        /* non-JSON body */
      }
    }
    if (!waitMs) waitMs = Math.min(60_000, 2_000 * 2 ** attempt);
    console.warn(`OpenAlex ${res.status}; retrying in ${Math.round(waitMs / 1000)}s (attempt ${attempt + 1}/${MAX_RETRIES})`);
    await sleep(waitMs);
    return fetchJson(path, params, attempt + 1);
  }

  if (!res.ok) throw new Error(`OpenAlex API error: ${res.status} ${await res.text()}`);
  return res.json();
}

async function fetchWorksByFilter(filter) {
  const works = [];
  let cursor = "*";

  while (cursor) {
    const data = await fetchJson("/works", {
      filter,
      select: WORK_FIELDS,
      sort: "publication_year:desc",
      "per-page": "200",
      cursor,
    });
    works.push(...data.results);
    cursor = data.meta?.next_cursor ?? null;
    if (data.results.length === 0) break;
  }

  return works;
}

// OpenAlex splits the PI across a dozen author profiles (author-name
// disambiguation drifts every few months), so querying the canonical author
// ID alone silently misses papers. Union it with a raw-author-name search and
// keep only works that really list "Bongwon Suh" as an author.
async function fetchAllWorks() {
  const [byId, byName] = await Promise.all([
    fetchWorksByFilter(`author.id:${AUTHOR_ID}`),
    fetchWorksByFilter(`raw_author_name.search:${AUTHOR_NAME}`),
  ]);

  const byWorkId = new Map();
  for (const work of [...byId, ...byName]) {
    if (!byWorkId.has(work.id)) byWorkId.set(work.id, work);
  }

  const works = [...byWorkId.values()].filter((work) =>
    (work.authorships ?? []).some(
      (a) =>
        a.author?.id === `https://openalex.org/${AUTHOR_ID}` ||
        isBongwonSuh(a.raw_author_name) ||
        isBongwonSuh(a.author?.display_name)
    )
  );

  console.log(
    `OpenAlex: ${byId.length} works via author ID, ${byName.length} via author name, ${works.length} unique after merge.`
  );
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
    .map((a) => {
      // Satellite profiles sometimes carry a mangled display name ("B. J. Suh");
      // normalise the PI's name so the list reads consistently.
      if (isBongwonSuh(a.raw_author_name) || isBongwonSuh(a.author?.display_name)) return AUTHOR_NAME;
      return a.author?.display_name ?? a.raw_author_name ?? null;
    })
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

function pluralize(count, singular, plural = `${singular}s`) {
  return count === 1 ? singular : plural;
}

function joinParts(parts) {
  if (parts.length <= 1) return parts.join("");
  return `${parts.slice(0, -1).join(", ")} and ${parts[parts.length - 1]}`;
}

function describeGroup(group) {
  const parts = [];
  if (group.paper > 0) parts.push(`${group.paper} ${pluralize(group.paper, "paper")}`);
  if (group.findings > 0) {
    parts.push(`${group.findings} Findings ${pluralize(group.findings, "paper")}`);
  }
  if (group.poster > 0) parts.push(`${group.poster} ${pluralize(group.poster, "poster")}`);
  return parts.length ? joinParts(parts) : null;
}

// "2 papers and 5 posters accepted at CHI 2026. See you in Barcelona!" and the
// generated wording differ in prose but agree on every number — that is what we
// compare when deciding whether a manual item has gone stale.
function countSignature(text) {
  return (text.match(/\d+/g) ?? []).join(",");
}

// Groups publications into (venue, year) buckets that deserve a news item.
function groupPaperNews(publications) {
  const groups = new Map();

  for (const publication of publications) {
    const match = matchPaperNewsRule(publication.venue);
    if (!match || !publication.year) continue;

    const groupKey = `${match.rule.key}-${publication.year}`;
    const group =
      groups.get(groupKey) ?? {
        id: `${match.rule.key}${publication.year}-papers`,
        rule: match.rule,
        year: publication.year,
        paper: 0,
        findings: 0,
        poster: 0,
        papers: [],
      };

    group[match.bucket] += 1;
    group.papers.push({ title: publication.title, url: publication.url });
    groups.set(groupKey, group);
  }

  return [...groups.values()].sort(
    (a, b) => b.year - a.year || a.rule.key.localeCompare(b.rule.key)
  );
}

function syncNewsFromPublications(publications, newsPath) {
  const existingNewsData = JSON.parse(readFileSync(newsPath, "utf-8"));
  const existingNews = existingNewsData.news ?? [];
  const syncMonth = new Date().toISOString().slice(0, 7);
  const currentYear = new Date().getUTCFullYear();

  const manualById = new Map(
    existingNews.filter((item) => item.source !== GENERATED_NEWS_SOURCE).map((item) => [item.id, item])
  );
  const generatedById = new Map(
    existingNews.filter((item) => item.source === GENERATED_NEWS_SOURCE).map((item) => [item.id, item])
  );

  let added = 0;
  let updated = 0;

  for (const group of groupPaperNews(publications)) {
    const summary = describeGroup(group);
    if (!summary) continue;
    const label = group.rule.label(group.year);
    const text = `Congrats! ${summary} accepted at ${label}!`;

    // Hand-written items own their id: never overwrite them, but surface a
    // count mismatch in the workflow log so someone can update the wording.
    const manual = manualById.get(group.id);
    if (manual) {
      if (countSignature(manual.text) !== countSignature(text)) {
        console.warn(`news: manual item "${group.id}" says "${manual.text}" — publications now suggest "${text}"`);
      }
      continue;
    }

    const previous = generatedById.get(group.id);
    if (previous) {
      // Generated items are ours: refresh count/paper list as more papers of
      // the same venue-year show up, but keep the original announcement date.
      const next = { ...previous, text, papers: group.papers };
      if (JSON.stringify(next) !== JSON.stringify(previous)) {
        generatedById.set(group.id, next);
        updated += 1;
        console.log(`news: updated "${group.id}" → ${text}`);
      }
      continue;
    }

    // Only announce this year's acceptances; older venue-years discovered late
    // (e.g. after the author-matching fix) would read as stale news.
    if (group.year < currentYear) continue;

    generatedById.set(group.id, {
      id: group.id,
      date: syncMonth,
      type: "paper",
      text,
      papers: group.papers,
      source: GENERATED_NEWS_SOURCE,
    });
    added += 1;
    console.log(`news: added "${group.id}" → ${text}`);
  }

  const mergedNews = [...manualById.values(), ...generatedById.values()].sort((a, b) => {
    const dateOrder = b.date.localeCompare(a.date);
    return dateOrder !== 0 ? dateOrder : a.id.localeCompare(b.id);
  });

  writeFileSync(newsPath, JSON.stringify({ news: mergedNews }, null, 2));
  console.log(`Saved to ${newsPath} (${added} added, ${updated} updated).`);
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

// Decide which freshly fetched records to append. Records are skipped when
//   - the same OpenAlex ID is already stored,
//   - a same-title entry already exists and the new one is not a better
//     version of it (preprint/talk recording of an already-listed paper),
//   - no lab member besides the PI is an author (unless SYNC_ALL_COAUTHORED=1).
function selectNewPublications(formatted, existing, isLabAuthor) {
  const existingById = new Set(existing.map((p) => p.id));
  const bestExistingRank = new Map();
  for (const pub of existing) {
    const key = titleKey(pub.title);
    bestExistingRank.set(key, Math.max(bestExistingRank.get(key) ?? -1, publicationRank(pub)));
  }

  const accepted = new Map(); // titleKey → publication
  const skipped = { duplicate: [], nonLab: [] };

  for (const pub of formatted) {
    if (existingById.has(pub.id)) continue;

    const key = titleKey(pub.title);
    const rank = publicationRank(pub);
    const rival = accepted.get(key);
    if (rank <= (bestExistingRank.get(key) ?? -1) || (rival && publicationRank(rival) >= rank)) {
      skipped.duplicate.push(pub);
      continue;
    }

    if (LAB_ONLY && !isLabPublication(pub, isLabAuthor)) {
      skipped.nonLab.push(pub);
      continue;
    }

    if (rival) skipped.duplicate.push(rival); // superseded by a better version
    accepted.set(key, pub);
  }

  return { newPublications: [...accepted.values()], skipped };
}

function logSkipped(label, pubs) {
  if (pubs.length === 0) return;
  console.log(`${label} (${pubs.length}):`);
  for (const pub of pubs) {
    console.log(`  - [${pub.year}] ${pub.title} (${pub.id}) — ${pub.venue ?? "no venue"}`);
  }
}

async function main() {
  console.log(`Fetching publications for ${AUTHOR_NAME} from OpenAlex${API_KEY ? " (API key)" : " (anonymous)"}...`);

  const works = await fetchAllWorks();
  const formatted = works.map(formatWork);

  console.log(`Fetched ${formatted.length} publications.`);

  const __dirname = dirname(fileURLToPath(import.meta.url));
  const dataDir = join(__dirname, "../src/data");
  const outPath = join(dataDir, "publications.json");
  const members = JSON.parse(readFileSync(join(dataDir, "members.json"), "utf-8"));

  // Append-only sync:
  // keep existing publication entries exactly as they are, and only add
  // genuinely new OpenAlex records that are not already in the local dataset.
  const existing = JSON.parse(readFileSync(outPath, "utf-8"));
  const { newPublications, skipped } = selectNewPublications(
    formatted,
    existing.publications,
    buildLabAuthorMatcher(members)
  );

  // Place newly discovered work first within each year so the publication
  // page surfaces the most recently added records at the top.
  const merged = [...newPublications, ...existing.publications]
    .sort((a, b) => b.year - a.year);

  writeFileSync(
    outPath,
    JSON.stringify({ updatedAt: new Date().toISOString(), publications: merged }, null, 2)
  );

  console.log(`Saved to ${outPath}`);
  console.log(`Added ${newPublications.length} new publication(s). Existing entries were left unchanged.`);
  for (const pub of newPublications) console.log(`  + [${pub.year}] ${pub.title} — ${pub.venue ?? "no venue"}`);
  logSkipped("Skipped as duplicate of an existing/better record", skipped.duplicate);
  logSkipped("Skipped: no lab member co-author (add to members.json or set SYNC_ALL_COAUTHORED=1)", skipped.nonLab);

  const keywordsOutPath = join(dataDir, "keywords.json");
  const mergedIds = new Set(merged.map((p) => p.id));
  const { subjectAreas, keywords } = aggregateConcepts(works.filter((w) => mergedIds.has(w.id)));

  writeFileSync(
    keywordsOutPath,
    JSON.stringify({ updatedAt: new Date().toISOString(), subjectAreas, keywords }, null, 2)
  );

  console.log(`Saved to ${keywordsOutPath}`);

  // Count each paper once even when it is stored as preprint + proceedings.
  syncNewsFromPublications(collapsePublications(merged), join(dataDir, "news.json"));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
