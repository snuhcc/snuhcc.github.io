import { writeFileSync } from "fs";
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
      `&select=id,title,publication_year,primary_location,authorships,open_access,doi,type` +
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

async function main() {
  console.log("Fetching publications for Bongwon Suh from OpenAlex...");

  const works = await fetchAllWorks();
  const formatted = works.map(formatWork);

  console.log(`Fetched ${formatted.length} publications.`);

  const __dirname = dirname(fileURLToPath(import.meta.url));
  const outPath = join(__dirname, "../src/data/publications.json");

  writeFileSync(
    outPath,
    JSON.stringify({ updatedAt: new Date().toISOString(), publications: formatted }, null, 2)
  );

  console.log(`Saved to ${outPath}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
