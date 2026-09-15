// Downloads open-access PDFs for publications into public/papers/ and fills
// the `pdf` field in src/data/publications.json.
//
//   node scripts/fetch-pdfs.mjs            # publications from MIN_YEAR on
//   node scripts/fetch-pdfs.mjs --year 2026
//   node scripts/fetch-pdfs.mjs --all      # every publication
//
// Sources, in order: ACL Anthology (DOI 10.18653), arXiv (DOI 10.48550),
// OpenAlex open-access locations, Semantic Scholar's openAccessPdf, and an
// arXiv title search. Publisher sites that block scripted downloads (ACM DL,
// Springer) are linked instead of hosted when the paper is open access —
// drop the author version into public/papers/ and set `pdf` by hand to host
// it. Files above MAX_HOSTED_BYTES are linked to their source URL too and only
// cached (git-ignored) in .cache/papers/ for teaser generation.
// Entries that already have a `pdf` are left alone.

import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { publicationSlug, titleKey } from "../src/lib/publications.mjs";

const MIN_YEAR = 2014;
const MAX_PDF_BYTES = 60 * 1024 * 1024;
const MAX_HOSTED_BYTES = 10 * 1024 * 1024; // larger files are linked, not committed
const MAILTO = process.env.OPENALEX_MAILTO || "hana2001@snu.ac.kr";
const USER_AGENT = `hcclab-website/1.0 (mailto:${MAILTO})`;

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const DATA_PATH = join(ROOT, "src/data/publications.json");
const PAPERS_DIR = join(ROOT, "public/papers");
const CACHE_DIR = join(ROOT, ".cache/papers");

const args = process.argv.slice(2);
const yearArg = args.includes("--year") ? Number(args[args.indexOf("--year") + 1]) : null;
const allYears = args.includes("--all");

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const timeout = (ms) => AbortSignal.timeout(ms);

function doiOf(pub) {
  return pub.doi ? pub.doi.replace(/^https?:\/\/doi\.org\//, "") : null;
}

async function fetchJson(url, headers = {}) {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    let res;
    try {
      res = await fetch(url, { headers: { "User-Agent": USER_AGENT, ...headers }, signal: timeout(20_000) });
    } catch {
      return null;
    }
    if (res.status === 429 || res.status >= 500) {
      await sleep(Math.min(20_000, 2_000 * 2 ** attempt));
      continue;
    }
    if (!res.ok) return null;
    return res.json();
  }
  return null;
}

// Candidate PDF URLs in preference order.
async function candidateUrls(pub) {
  const urls = [];
  const doi = doiOf(pub);

  if (doi?.startsWith("10.18653/v1/")) {
    urls.push(`https://aclanthology.org/${doi.slice("10.18653/v1/".length)}.pdf`);
  }
  const arxivMatch = doi?.match(/^10\.48550\/arxiv\.(.+)$/i);
  if (arxivMatch) urls.push(`https://arxiv.org/pdf/${arxivMatch[1]}`);

  const openalexId = pub.id.replace("https://openalex.org/", "");
  const work = await fetchJson(
    `https://api.openalex.org/works/${openalexId}?select=open_access,best_oa_location,locations&mailto=${MAILTO}`
  );
  for (const location of [work?.best_oa_location, ...(work?.locations ?? [])]) {
    if (location?.pdf_url) urls.push(location.pdf_url);
  }
  const isOpenAccess = Boolean(work?.open_access?.is_oa);

  // Semantic Scholar is only a fallback; it rate-limits anonymous callers hard.
  if (doi && urls.length === 0) {
    const s2 = await fetchJson(
      `https://api.semanticscholar.org/graph/v1/paper/DOI:${encodeURIComponent(doi)}?fields=openAccessPdf`
    );
    if (s2?.openAccessPdf?.url) urls.push(s2.openAccessPdf.url);
  }

  if (!arxivMatch) {
    const query = encodeURIComponent(`ti:"${pub.title.replace(/["“”]/g, "")}"`);
    const res = await fetch(`https://export.arxiv.org/api/query?search_query=${query}&max_results=3`, {
      headers: { "User-Agent": USER_AGENT },
      signal: timeout(20_000),
    }).catch(() => null);
    if (res?.ok) {
      const xml = await res.text();
      const entries = [...xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)];
      for (const [, entry] of entries) {
        const title = entry.match(/<title>([\s\S]*?)<\/title>/)?.[1]?.replace(/\s+/g, " ").trim();
        const id = entry.match(/<id>([\s\S]*?)<\/id>/)?.[1]?.trim();
        if (title && id && titleKey(title) === titleKey(pub.title)) {
          urls.push(id.replace("/abs/", "/pdf/").replace(/v\d+$/, ""));
        }
      }
    }
  }

  // Publisher sites that answer scripted requests with a bot wall.
  const blocked = /dl\.acm\.org|link\.springer\.com|ieeexplore|figshare\.com/i;
  const downloadable = [...new Set(urls)].filter((url) => !blocked.test(url) && !/doi\.org\/10\.1145\//.test(url));

  // ACM DL papers are open access (ACM went fully OA in 2026) but the site
  // blocks scripted downloads, so link straight to the publisher PDF instead
  // of hosting it. Replace with a local file in public/papers/ to host it.
  const external = doi?.startsWith("10.1145/") && isOpenAccess ? `https://dl.acm.org/doi/pdf/${doi}` : null;
  return { downloadable, external };
}

async function downloadPdf(url, dest) {
  let res;
  try {
    res = await fetch(url, {
      headers: { "User-Agent": USER_AGENT, Accept: "application/pdf,*/*" },
      redirect: "follow",
      signal: timeout(90_000),
    });
  } catch (error) {
    return error?.name === "TimeoutError" ? "timed out" : `fetch failed (${error?.cause?.code ?? error?.message})`;
  }
  if (!res.ok) return `HTTP ${res.status}`;
  const buffer = Buffer.from(await res.arrayBuffer());
  if (buffer.subarray(0, 5).toString() !== "%PDF-") return "not a PDF";
  if (buffer.length > MAX_PDF_BYTES) return `too large (${(buffer.length / 1e6).toFixed(1)} MB)`;
  writeFileSync(dest, buffer);
  return { bytes: buffer.length };
}

async function main() {
  const data = JSON.parse(readFileSync(DATA_PATH, "utf-8"));
  mkdirSync(PAPERS_DIR, { recursive: true });
  mkdirSync(CACHE_DIR, { recursive: true });

  const targets = data.publications.filter((pub) => {
    if (pub.pdf) return false;
    if (yearArg) return pub.year === yearArg;
    return allYears || pub.year >= MIN_YEAR;
  });
  console.log(`Looking for PDFs of ${targets.length} publication(s)...`);

  const missing = [];
  let added = 0;

  for (const pub of targets) {
    const filename = `${publicationSlug(pub)}.pdf`;
    const hosted = join(PAPERS_DIR, filename);
    const cached = join(CACHE_DIR, filename);

    if (existsSync(hosted)) {
      pub.pdf = `/papers/${filename}`;
      added += 1;
      console.log(`  = ${filename} (already hosted)`);
      continue;
    }

    const { downloadable, external } = await candidateUrls(pub);
    let saved = false;
    for (const url of downloadable) {
      const result = await downloadPdf(url, cached);
      if (typeof result === "string") {
        console.log(`    skip ${url}: ${result}`);
        continue;
      }
      if (result.bytes <= MAX_HOSTED_BYTES) {
        renameSync(cached, hosted);
        pub.pdf = `/papers/${filename}`;
        console.log(`  + ${filename}  ←  ${url}`);
      } else {
        // Keep the big file out of git: link to the source, cache for teasers.
        pub.pdf = url;
        console.log(`  ~ ${filename}  →  ${url} (${(result.bytes / 1e6).toFixed(1)} MB, linked instead of hosted)`);
      }
      added += 1;
      saved = true;
      break;
    }
    if (!saved && external) {
      pub.pdf = external;
      added += 1;
      saved = true;
      console.log(`  ~ ${pub.title.slice(0, 60)}  →  ${external} (external link; publisher blocks scripted download)`);
    }
    if (!saved) missing.push(pub);
    await sleep(1_000); // be polite to arXiv / Semantic Scholar
  }

  writeFileSync(DATA_PATH, JSON.stringify(data, null, 2));
  console.log(`\nSaved ${added} PDF link(s) to ${DATA_PATH}.`);

  if (missing.length) {
    console.log(`\nNo open-access PDF found for ${missing.length} publication(s) — add the author version to public/papers/ and set "pdf" manually:`);
    for (const pub of missing) console.log(`  - [${pub.year}] ${pub.title} (${pub.doi ?? pub.url})`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
