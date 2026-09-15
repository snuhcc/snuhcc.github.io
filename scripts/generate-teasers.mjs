// Generates teaser images for publications that have a PDF (`pdf` pointing to
// a hosted file in public/papers/ or to a downloadable URL — the latter is
// cached in .cache/papers/) and writes them to public/images/publications/.
//
//   node scripts/generate-teasers.mjs              # publications from MIN_YEAR on
//   node scripts/generate-teasers.mjs --year 2026
//   node scripts/generate-teasers.mjs --all
//   node scripts/generate-teasers.mjs --force      # regenerate even if teaserImage is set
//   node scripts/generate-teasers.mjs --fallback   # use a first-page crop when no figure is found
//
// Strategy, in order:
//   1. locate the "Figure 1" caption with `pdftotext -bbox-layout` and crop
//      the region above it from the rendered page (works for vector figures),
//   2. otherwise take the largest raster image on the first pages,
//   3. otherwise leave the entry without a teaser (the page shows "Coming
//      soon"), or crop the top of the first page when --fallback is given.
// Needs poppler (`pdfimages`, `pdftoppm`, `pdftotext`):
//   macOS: brew install poppler   |   Ubuntu: apt-get install poppler-utils
//
// Entries with a hand-picked `teaserImage` are never overwritten unless --force.

import { execFileSync } from "child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "fs";
import { tmpdir } from "os";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";
import { publicationSlug } from "../src/lib/publications.mjs";

const MIN_YEAR = 2014;
const OUT_WIDTH = 800; // shown at ~220px, leaves headroom for retina displays
const OUT_HEIGHT = 500;
const MIN_FIGURE_WIDTH = 400;
const MIN_FIGURE_HEIGHT = 180;
const CAPTION_SEARCH_PAGES = 8;
const RASTER_SEARCH_PAGES = 4;
const RENDER_DPI = 150;

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const DATA_PATH = join(ROOT, "src/data/publications.json");
const PUBLIC_DIR = join(ROOT, "public");
const OUT_DIR = join(PUBLIC_DIR, "images/publications");
const CACHE_DIR = join(ROOT, ".cache/papers");
const BLOCKED_HOSTS = /dl\.acm\.org|link\.springer\.com|ieeexplore/i;

const args = process.argv.slice(2);
const yearArg = args.includes("--year") ? Number(args[args.indexOf("--year") + 1]) : null;
const allYears = args.includes("--all");
const force = args.includes("--force");
const allowFallback = args.includes("--fallback");

function run(cmd, cmdArgs) {
  return execFileSync(cmd, cmdArgs, { encoding: "utf-8", stdio: ["ignore", "pipe", "ignore"] });
}

// Parse `pdfimages -list` output into rows.
function listImages(pdfPath) {
  const out = run("pdfimages", ["-list", "-f", "1", "-l", String(RASTER_SEARCH_PAGES), pdfPath]);
  const rows = [];
  for (const line of out.split("\n").slice(2)) {
    const cols = line.trim().split(/\s+/);
    if (cols.length < 5) continue;
    const [page, num, type, width, height] = cols;
    rows.push({ page: Number(page), num: Number(num), type, width: Number(width), height: Number(height) });
  }
  return rows;
}

function pickFigure(rows) {
  return rows
    .filter((r) => r.type === "image" && r.width >= MIN_FIGURE_WIDTH && r.height >= MIN_FIGURE_HEIGHT)
    .filter((r) => {
      const ratio = r.width / r.height;
      return ratio >= 0.5 && ratio <= 4; // skip banners and column-long strips
    })
    .sort((a, b) => b.width * b.height - a.width * a.height)[0] ?? null;
}

async function extractFigure(pdfPath, figure, workDir) {
  const prefix = join(workDir, "img");
  run("pdfimages", ["-png", "-f", String(figure.page), "-l", String(figure.page), pdfPath, prefix]);
  // Numbering restarts at 0 for the extracted page range, so re-list that
  // page alone to find the index of our figure within it.
  const pageRows = listImagesOnPage(pdfPath, figure.page);
  const index = pageRows.findIndex(
    (r) => r.type === "image" && r.width === figure.width && r.height === figure.height
  );
  if (index < 0) return null;
  const file = join(workDir, `img-${String(index).padStart(3, "0")}.png`);
  if (!existsSync(file)) return null;

  // Reject near-blank images (white placeholders, scanned margins).
  const stats = await sharp(file).stats();
  const meanLuma = stats.channels.slice(0, 3).reduce((sum, c) => sum + c.mean, 0) / 3;
  const stdLuma = stats.channels.slice(0, 3).reduce((sum, c) => sum + c.stdev, 0) / 3;
  if (meanLuma > 250 || stdLuma < 8) return null;
  return file;
}

function listImagesOnPage(pdfPath, page) {
  const out = run("pdfimages", ["-list", "-f", String(page), "-l", String(page), pdfPath]);
  return out
    .split("\n")
    .slice(2)
    .map((line) => line.trim().split(/\s+/))
    .filter((cols) => cols.length >= 5)
    .map(([, , type, width, height]) => ({ type, width: Number(width), height: Number(height) }));
}

// Parse `pdftotext -bbox-layout` into per-page lines with word boxes (PDF points).
function layoutPages(pdfPath) {
  const xml = run("pdftotext", ["-bbox-layout", "-f", "1", "-l", String(CAPTION_SEARCH_PAGES), pdfPath, "-"]);
  const pages = [];
  for (const [, attrs, body] of xml.matchAll(/<page([^>]*)>([\s\S]*?)<\/page>/g)) {
    const width = Number(attrs.match(/width="([\d.]+)"/)?.[1]);
    const height = Number(attrs.match(/height="([\d.]+)"/)?.[1]);
    const lines = [];
    for (const [, lineAttrs, lineBody] of body.matchAll(/<line([^>]*)>([\s\S]*?)<\/line>/g)) {
      const box = (attr) => Number(lineAttrs.match(new RegExp(`${attr}="([\\d.]+)"`))?.[1]);
      const words = [...lineBody.matchAll(/<word[^>]*>([^<]*)<\/word>/g)].map((m) => m[1]);
      const line = { xMin: box("xMin"), yMin: box("yMin"), xMax: box("xMax"), yMax: box("yMax"), words };
      // Skip rotated text (the arXiv side stamp) so it does not widen the margins.
      const tall = line.yMax - line.yMin > 40 && line.yMax - line.yMin > 3 * (line.xMax - line.xMin);
      if (!tall) lines.push(line);
    }
    pages.push({ number: pages.length + 1, width, height, lines });
  }
  return pages;
}

// Find the earliest figure caption ("Figure 1:" / "Fig. 2.") and the column
// it sits in, then extend upward to the previous block of running text.
function findFirstFigure(pages) {
  for (const page of pages) {
    const captions = page.lines
      .filter((line) => {
        const [first, second] = line.words;
        // A caption has punctuation after the number; "Figure 3 (Appendix)"
        // mid-sentence references do not.
        return line.words.length > 2 && /^(Figure|Fig\.?)$/i.test(first ?? "") && /^\d+[:.]$/.test(second ?? "");
      })
      .sort((a, b) => Number(a.words[1]) - Number(b.words[1]) || a.yMin - b.yMin);

    for (const caption of captions) {
      const textLeft = Math.min(...page.lines.map((l) => l.xMin));
      const textRight = Math.max(...page.lines.map((l) => l.xMax));
      const textWidth = textRight - textLeft;
      const captionWidth = caption.xMax - caption.xMin;
      let column;
      if (captionWidth > textWidth * 0.55 || (caption.xMin < page.width / 2 && caption.xMax > page.width / 2 + textWidth * 0.1)) {
        column = { left: textLeft, right: textRight };
      } else if (caption.xMin < page.width / 2) {
        column = { left: textLeft, right: textLeft + textWidth / 2 - 6 };
      } else {
        column = { left: textLeft + textWidth / 2 + 6, right: textRight };
      }
      const columnWidth = column.right - column.left;

      // Group the lines above the caption into rows and measure how much of
      // the column each row covers. Two consecutive well-covered rows mean
      // running text (or an author block) — the figure ends there.
      const above = page.lines
        .filter((l) => l !== caption && l.yMax <= caption.yMin + 1 && l.xMax > column.left && l.xMin < column.right)
        .sort((a, b) => b.yMax - a.yMax);
      const rows = [];
      for (const l of above) {
        const coverage = (Math.min(l.xMax, column.right) - Math.max(l.xMin, column.left)) / columnWidth;
        const row = rows.find((r) => Math.abs(r.yMax - l.yMax) < 4);
        if (row) {
          row.coverage += coverage;
          row.xMin = Math.min(row.xMin, l.xMin);
        } else {
          rows.push({ yMax: l.yMax, coverage, xMin: l.xMin });
        }
      }
      // Running text is justified against the column margin; text inside a
      // figure (labels, boxes) almost never is.
      const isBodyText = (row) => row.coverage > 0.55 && Math.abs(row.xMin - column.left) < 8;
      const bottom = caption.yMin - 3;
      let top = page.height * 0.05;
      // On the first page never reach into the author block: start below the
      // last e-mail address that sits above the caption.
      for (const l of above) {
        if (l.words.some((w) => w.includes("@"))) top = Math.max(top, l.yMax + 6);
      }
      for (let i = 0; i < rows.length - 1; i += 1) {
        if (rows[i].yMax <= top) break;
        if (isBodyText(rows[i]) && isBodyText(rows[i + 1]) && bottom - rows[i].yMax >= page.height * 0.08) {
          top = rows[i].yMax + 4;
          break;
        }
      }
      if (bottom - top < page.height * 0.08) continue;

      return { page: page.number, left: column.left, right: column.right, top, bottom };
    }
  }
  return null;
}

async function cropFigureRegion(pdfPath, region, workDir) {
  const prefix = join(workDir, `fig-p${region.page}`);
  run("pdftoppm", ["-f", String(region.page), "-l", String(region.page), "-png", "-r", String(RENDER_DPI), "-singlefile", pdfPath, prefix]);
  const file = `${prefix}.png`;
  const scale = RENDER_DPI / 72;
  const { width, height } = await sharp(file).metadata();
  const left = Math.max(0, Math.round(region.left * scale) - 4);
  const top = Math.max(0, Math.round(region.top * scale));
  const cropWidth = Math.min(width - left, Math.round((region.right - region.left) * scale) + 8);
  const cropHeight = Math.min(height - top, Math.round((region.bottom - region.top) * scale));
  const crop = sharp(file).extract({ left, top, width: cropWidth, height: cropHeight });

  // Make sure the region actually has ink (not a blank column gap).
  const stats = await crop.clone().stats();
  const stdLuma = stats.channels.slice(0, 3).reduce((sum, c) => sum + c.stdev, 0) / 3;
  if (stdLuma < 12) return null;
  return crop;
}

// Fallback: the top of the first page (title, authors, abstract, first figure).
async function renderFirstPage(pdfPath, workDir) {
  const prefix = join(workDir, "page");
  run("pdftoppm", ["-f", "1", "-l", "1", "-png", "-r", "150", "-singlefile", pdfPath, prefix]);
  const file = `${prefix}.png`;
  const { width, height } = await sharp(file).metadata();
  const left = Math.round(width * 0.07);
  const cropWidth = Math.round(width * 0.86);
  const cropHeight = Math.min(Math.round(cropWidth * 0.75), height);
  return sharp(file).extract({ left, top: Math.round(height * 0.05), width: cropWidth, height: cropHeight });
}

// Hosted PDFs live in public/papers/; linked ones are cached in .cache/papers/
// (downloaded on demand from arXiv / ACL Anthology / …).
async function resolvePdf(pub) {
  if (pub.pdf.startsWith("/")) {
    const hosted = join(PUBLIC_DIR, pub.pdf);
    return existsSync(hosted) ? hosted : null;
  }
  const cached = join(CACHE_DIR, `${publicationSlug(pub)}.pdf`);
  if (existsSync(cached)) return cached;
  try {
    const res = await fetch(pub.pdf, { headers: { "User-Agent": "hcclab-website/1.0" }, signal: AbortSignal.timeout(90_000) });
    if (!res.ok) return null;
    const buffer = Buffer.from(await res.arrayBuffer());
    if (buffer.subarray(0, 5).toString() !== "%PDF-") return null;
    writeFileSync(cached, buffer);
    return cached;
  } catch {
    return null;
  }
}

async function writeTeaser(source, dest) {
  const image = typeof source === "string" ? sharp(source) : source;
  await image
    .flatten({ background: "#ffffff" })
    .resize(OUT_WIDTH, OUT_HEIGHT, { fit: "inside", withoutEnlargement: false })
    .webp({ quality: 82 })
    .toFile(dest);
}

async function main() {
  for (const tool of ["pdfimages", "pdftoppm", "pdftotext"]) {
    try {
      run(tool, ["-v"]);
    } catch {
      console.error(`${tool} not found — install poppler first.`);
      process.exit(1);
    }
  }

  const data = JSON.parse(readFileSync(DATA_PATH, "utf-8"));
  mkdirSync(OUT_DIR, { recursive: true });

  mkdirSync(CACHE_DIR, { recursive: true });

  const targets = data.publications.filter((pub) => {
    if (!pub.pdf || BLOCKED_HOSTS.test(pub.pdf)) return false;
    if (pub.teaserImage && !force) return false;
    if (yearArg) return pub.year === yearArg;
    return allYears || pub.year >= MIN_YEAR;
  });
  console.log(`Generating teasers for ${targets.length} publication(s)...`);

  let generated = 0;
  for (const pub of targets) {
    const pdfPath = await resolvePdf(pub);
    if (!pdfPath) {
      console.log(`  ! no local PDF for ${pub.title.slice(0, 70)} (${pub.pdf})`);
      continue;
    }
    const name = `${publicationSlug(pub)}.webp`;
    const dest = join(OUT_DIR, name);
    const workDir = mkdtempSync(join(tmpdir(), "teaser-"));

    try {
      const region = findFirstFigure(layoutPages(pdfPath));
      const regionCrop = region ? await cropFigureRegion(pdfPath, region, workDir) : null;
      const figure = regionCrop ? null : pickFigure(listImages(pdfPath));
      const figureFile = figure ? await extractFigure(pdfPath, figure, workDir) : null;
      if (regionCrop) {
        await writeTeaser(regionCrop, dest);
        console.log(`  + ${name}  (figure region on p.${region.page})`);
      } else if (figureFile) {
        await writeTeaser(figureFile, dest);
        console.log(`  + ${name}  (raster figure ${figure.width}×${figure.height} on p.${figure.page})`);
      } else if (allowFallback) {
        await writeTeaser(await renderFirstPage(pdfPath, workDir), dest);
        console.log(`  + ${name}  (first-page fallback)`);
      } else {
        console.log(`  - ${pub.title.slice(0, 70)}: no figure found (will show "Coming soon")`);
        if (existsSync(dest)) rmSync(dest);
        delete pub.teaserImage;
        delete pub.teaserAlt;
        continue;
      }
      pub.teaserImage = `/images/publications/${name}`;
      pub.teaserAlt = `Teaser figure from "${pub.title}"`;
      generated += 1;
    } catch (error) {
      console.log(`  ! failed for ${pub.title}: ${error.message}`);
    } finally {
      rmSync(workDir, { recursive: true, force: true });
    }
  }

  writeFileSync(DATA_PATH, JSON.stringify(data, null, 2));
  console.log(`\nGenerated ${generated} teaser(s); saved to ${DATA_PATH}.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
