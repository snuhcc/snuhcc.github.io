# HCC Lab Website

Official website for the Human Centered Computing Lab (HCC Lab), Seoul National University.

## Stack

- Next.js 16
- TypeScript
- Tailwind CSS
- GitHub Pages via GitHub Actions

## Main Routes

| Route | Description |
| --- | --- |
| `/` | Homepage |
| `/people` | Current members and alumni |
| `/bongwon` | Faculty profile page for Prof. Bongwon Suh |
| `/publications` | Publications list |
| `/seminar` | Lab seminar archive |
| `/news` | News archive |
| `/memories` | Lab memories gallery |

## Contribution Workflow

All lab members should work through a fork and pull request.

Workflow:

```text
Fork -> Clone -> Create branch -> Edit -> Push to your fork -> Open PR -> Homepage manager reviews -> Merge
```

### 1. Fork the repository

On GitHub, click **Fork** on:

[`snuhcc/snuhcc.github.io`](https://github.com/snuhcc/snuhcc.github.io)

### 2. Clone your fork

```bash
git clone https://github.com/<your-github-id>/snuhcc.github.io.git
cd snuhcc.github.io
npm install
```

Optional but recommended:

```bash
git remote add upstream https://github.com/snuhcc/snuhcc.github.io.git
git fetch upstream
```

### 3. Create a branch

```bash
git checkout -b update/short-description
```

Examples:

- `update/hana-profile`
- `update/seminar-2026-07`
- `fix/news-typo`

### 4. Run locally

```bash
npm run dev
```

Open:

[`http://localhost:3000`](http://localhost:3000)

### 5. Commit and push

```bash
git add .
git commit -m "update: short description"
git push origin update/short-description
```

### 6. Open a pull request

Open a PR from your forked branch to:

- base repository: `snuhcc/snuhcc.github.io`
- base branch: `master`

### 7. Review and merge

The homepage manager / maintainer reviews the PR and decides whether to merge it into `master`.

Lab members should not push directly to `master`.

## Common Edit Locations

### 1. Member Profile

Edit:

- `src/data/members.json`

Photos:

- `public/images/people/`

Main fields:

| Field | Meaning |
| --- | --- |
| `name` | Full name |
| `email` | SNU email |
| `title` | e.g. `Professor`, `Ph.D. Student`, `Master's Student` |
| `photo` | Profile image path |
| `url` | Personal website, GitHub, Google Scholar, LinkedIn, etc. |

If a member wants to link their GitHub profile, put it in `url`.

Example:

```json
{
  "name": "[ name ]",
  "email": "[ email ]",
  "title": "Ph.D. Student",
  "photo": "/images/people/[ file-name ].jpeg",
  "url": "https://github.com/[ github-id ]"
}
```

Photo recommendation:

- square crop
- around 400x400 or larger
- `.jpg`, `.jpeg`, or `.png`

### 2. Faculty Profile Page

Professor profile page data is stored in:

- `src/data/facultyProfiles.json`

Current route:

- `/bongwon`

If you need to update the professor page contents, edit that JSON file.

### 3. Seminar

Edit:

- `src/data/seminars.json`

Slides:

- `public/seminars/`

Main fields:

| Field | Meaning |
| --- | --- |
| `date` | Seminar date in `YYYY-MM-DD` |
| `title` | Seminar title |
| `presenter` | Presenter name |
| `tags` | Topic tags shown on the page |
| `semester` | Internal grouping info from previous data |
| `slides` | PDF path or `null` |

Example:

```json
{
  "date": "2026-07-15",
  "title": "[ seminar title ]",
  "presenter": "[ presenter name ]",
  "tags": ["LLM", "HAI"],
  "semester": "2026 Summer",
  "slides": "/seminars/[ file-name ].pdf"
}
```

If you add a PDF:

1. put the file in `public/seminars/`
2. reference it as `/seminars/file-name.pdf`

### 4. Publications

Publication data lives in:

- `src/data/publications.json`

This file is mostly auto-synced from OpenAlex.

OpenAlex fields from the crawler:

- `title`
- `year`
- `venue`
- `authors`
- `doi`
- `type`

Manual fields that are preserved across sync:

- `areas` (kept in the data, currently not shown on the page)
- `pdf`
- `teaserImage`
- `teaserAlt`

Each entry renders as: teaser on the left (or a "Coming soon" box), then the
title (links to the DOI), authors, a short venue line such as `CHI 2026 ·
Extended Abstract`, and `DOI | PDF` links.

#### PDFs

```bash
node scripts/fetch-pdfs.mjs --year 2026   # or --all, or no flag for 2014+
```

- looks up an open-access PDF (ACL Anthology, arXiv, OpenAlex OA locations,
  Semantic Scholar) and saves it to `public/papers/<year>-<slug>.pdf`
- files above 10 MB are linked to their source URL instead of being committed
- ACM DL blocks scripted downloads; for ACM open-access papers `pdf` is set to
  `https://dl.acm.org/doi/pdf/<doi>` so the PDF button still opens the paper
- the script never overwrites an existing `pdf` value — to host a paper the
  script could not fetch, drop the author version into `public/papers/` and
  set `"pdf": "/papers/<file>.pdf"` by hand

#### Teaser images

```bash
node scripts/generate-teasers.mjs --year 2026   # needs poppler + the pdf field
```

- crops the first figure out of the PDF (via its "Figure 1" caption), falls
  back to the largest raster image on the first pages
- writes `public/images/publications/<year>-<slug>.webp` (max 800×500) and
  sets `teaserImage` / `teaserAlt`
- when no figure can be found the entry is left without a teaser and the page
  shows "Coming soon" — add an image by hand in that case
  (`--fallback` uses a first-page crop instead)
- hand-picked `teaserImage` values are never overwritten unless `--force`
- requires poppler: `brew install poppler` (macOS) / `apt-get install poppler-utils`

Manual teaser example:

```json
{
  "id": "https://openalex.org/W7167931870",
  "pdf": "/papers/2026-who-is-shopping-with-you.pdf",
  "teaserImage": "/images/publications/2026-who-is-shopping-with-you.webp",
  "teaserAlt": "Teaser figure of the shopping agents paper"
}
```

Important:

- the crawler is append-only for publications
- existing publication entries are kept as-is
- only brand new OpenAlex records are added during sync
- this means manual fixes to metadata, PDFs, teaser images, and other local edits are preserved

### 5. News

Edit:

- `src/data/news.json`

If a lab member wants to promote an award, talk, press mention, graduation, or other update, add a manual item to the `news` array.

Example:

```json
{
  "id": "[ short-id ]",
  "date": "2026-07",
  "type": "talk",
  "text": "[ short news text ]",
  "url": "https://example.com"
}
```

Notes:

- use `YYYY-MM` format for `date`
- add new items near the top
- items with `"source": "publications"` are auto-generated from the publication sync
  and are refreshed by it (paper counts / links) — see "Publication Auto Sync" below
- manual news items without `"source": "publications"` are never modified by the sync

### 6. Homepage Research Snapshot / Word Cloud

The homepage word cloud content comes from:

- `src/data/keywords.json`

So yes, the word cloud data is stored in a JSON file.

But there is one important detail:

- `keywords.json` is auto-generated from the publication sync script
- if you manually edit `keywords.json`, a future publication sync can overwrite your changes

Generation source:

- `scripts/fetch-publications.mjs`

In short:

- quick temporary edit: change `keywords.json`
- persistent logic change: update `fetch-publications.mjs`

## Publication Auto Sync

Publication sync source: OpenAlex.

- canonical author ID: `A5027548665` (Bongwon Suh)
- **plus** a raw-author-name search for `Bongwon Suh`

OpenAlex keeps splitting the PI across many author profiles (a dozen at the
time of writing), so querying the canonical ID alone silently misses papers.
The script unions both queries and keeps only works that really list
"Bongwon Suh" as an author.

Automatic schedule:

- GitHub Actions runs the crawl on the **1st day of every month at 02:00 UTC**
- it can also be triggered manually from **Actions -> Sync Publications -> Run workflow**
- when the crawl commits new data it also triggers the Pages deploy
  (commits made by `GITHUB_TOKEN` do not trigger `deploy.yml` on their own)

Sync command:

```bash
node scripts/fetch-publications.mjs
```

Environment variables (all optional):

| Variable | Purpose |
| --- | --- |
| `OPENALEX_API_KEY` | Free API key from <https://openalex.org/rest-api>. Removes the anonymous rate limit (`429`). Add it as a repository **secret** with the same name so the Action uses it. |
| `OPENALEX_MAILTO` | Contact email sent to OpenAlex (polite pool). Defaults to the lab manager's address; can be set as a repository **variable**. |
| `SYNC_ALL_COAUTHORED=1` | Also add papers where the PI is the only lab author (see below). |

Without an API key the script still works: it retries `429` / `5xx`
responses with the back-off OpenAlex asks for.

This updates:

- `src/data/publications.json`
- `src/data/keywords.json`
- `src/data/news.json`

### Which papers get added

A fetched record is appended only when all of the following hold:

1. its OpenAlex ID is not already stored
2. no same-title entry exists yet — or the new record is a *better* version
   (e.g. the proceedings paper of an already-listed arXiv preprint). Talk
   recordings, datasets and duplicate preprints are skipped.
3. at least one author besides the PI is a lab member listed in
   `src/data/members.json` (`current` or `alumni`)

Rule 3 keeps collaborations where Prof. Suh is the only lab author (clinical
studies, other labs' papers) out of the list. The workflow log prints every
skipped record, so if a lab paper is missing:

- add the student to `members.json` (name in the same romanisation OpenAlex uses), or
- run once with `SYNC_ALL_COAUTHORED=1`, or
- paste the entry into `publications.json` by hand

### How `publications.json` behaves during sync

- existing publication entries stay as-is
- new OpenAlex publications are appended (newest first within a year)
- the script does not rewrite or refresh existing publication entries automatically

This is intentional so that local fixes such as:

- corrected metadata
- custom PDF links
- teaser images
- teaser alt text
- area labels

are not lost during future crawls.

Because the file is append-only it can still hold the same paper twice
(preprint + proceedings). `src/lib/publications.ts` collapses same-title
entries for display and merges `areas` / `pdf` / `teaserImage` / `teaserAlt`
from every copy, so you can put manual fields on whichever copy you like.

### How `news.json` behaves during sync

Venue rules live in `src/lib/paperNewsRules.mjs` (ACL / EMNLP / NAACL / CHI /
UIST / IUI / CSCW / DIS / ASSETS / SIGIR / CIKM / RecSys / ICWSM / CogSci).
Each `(venue, year)` group becomes a news item with id `<venue><year>-papers`.

- manual news you add yourself stays in `src/data/news.json`
- items with `"source": "publications"` are owned by the script: when more
  papers of the same venue-year show up, their text and paper list are
  refreshed (the original `date` is kept)
- a new generated item is only created for the current year, so late-indexed
  older papers do not produce stale announcements
- if a **manual** item uses a generated id (e.g. `chi2026-papers`) the script
  never touches it, but logs a warning when the paper counts no longer match

So:

- safe to manually add your own news item
- to freeze the wording of a generated item, remove its `"source"` field and it becomes manual

## Deployment

Pushing to `master` triggers GitHub Actions deployment to GitHub Pages.

GitHub Pages should be configured to deploy from GitHub Actions, not from committed static export files.

## PR Guidelines

- keep PRs focused on one task
- do not reformat unrelated files
- preview locally before opening a PR
- use clear commit messages
- use clear PR titles such as:
  - `update: member profile`
  - `update: add seminar entry`
  - `fix: revise publication teaser image paths`

## Contact

Graduate School of Convergence Science and Technology, Seoul National University  
Prof. Bongwon Suh — bongwon@snu.ac.kr
