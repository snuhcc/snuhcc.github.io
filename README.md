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

- `areas`
- `pdf`
- `teaserImage`
- `teaserAlt`

Teaser images should go in:

- `public/images/publications/`

Local paper PDFs can go in:

- `public/papers/`

Example:

```json
{
  "id": "https://openalex.org/W7167931870",
  "areas": ["human-ai"],
  "pdf": "/papers/shopping-agents.pdf",
  "teaserImage": "/images/publications/shopping-agents-teaser.jpg",
  "teaserAlt": "Teaser image for the shopping agents paper"
}
```

Important:

- `teaserImage` is what shows the small paper image on the left
- if `teaserImage` is missing, the publication is shown without an image
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
- manual news items without `"source": "publications"` are preserved on future syncs
- existing generated publication news items are now also preserved
- the sync only appends new generated publication news when a new publication-news id appears

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

Publication sync source:

- OpenAlex author ID: `A5027548665` (Bongwon Suh)

Automatic schedule:

- GitHub Actions runs the crawl on the **1st day of every month at 02:00 UTC**
- it can also be triggered manually from **Actions -> Sync Publications -> Run workflow**

Sync command:

```bash
node scripts/fetch-publications.mjs
```

This updates:

- `src/data/publications.json`
- `src/data/keywords.json`
- `src/data/news.json`

The GitHub Action also runs this automatically on schedule.

### How `news.json` behaves during sync

The publication sync script is append-only for publication-derived news.

In practice:

- manual news you add yourself stays in `src/data/news.json`
- existing generated news with `"source": "publications"` also stays as-is
- new publication news gets added automatically only when a new generated news id appears
- the script does not rewrite older publication news entries anymore

### How `publications.json` behaves during sync

- existing publication entries stay as-is
- new OpenAlex publications are appended
- the script does not rewrite or refresh existing publication entries automatically

This is intentional so that local fixes such as:

- corrected metadata
- custom PDF links
- teaser images
- teaser alt text
- area labels

are not lost during future crawls

So:

- safe to manually add your own news item
- not safe to manually rewrite generated publication news items if you want those exact edits to persist forever

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
