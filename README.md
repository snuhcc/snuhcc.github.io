# HCC Lab — Official Website

Source code for the **Human Centered Computing Lab (HCC Lab)** homepage at Seoul National University, hosted via GitHub Pages.

## Tech Stack

- **Next.js 16** — React framework with static export
- **TypeScript** — type safety
- **Tailwind CSS** — styling
- **GitHub Actions** — automated build & deploy

## Pages

| Route | Description |
|-------|-------------|
| `/` | Lab overview, research areas, contact |
| `/people` | Current members and alumni |
| `/publications` | Full publication list with research area filters |
| `/seminar` | Lab seminar history with slide downloads |
| `/memories` | Lab events photo gallery |

## Publications Auto-Sync

Publications are automatically fetched from [OpenAlex](https://openalex.org) (Prof. Bongwon Suh, `A5027548665`) and saved to `src/data/publications.json`.

The sync runs every Monday at 2AM UTC via GitHub Actions. To trigger manually:

> **Actions** → **Sync Publications** → **Run workflow**

## Local Development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Deployment

Pushing to `master` automatically builds and deploys via GitHub Actions.

> **Settings → Pages → Source** must be set to **GitHub Actions**.

## Contributing

Lab members can update the website (e.g. their own profile) by submitting a pull request. No special permissions required — just fork the repo.

### Workflow

```
Fork → Edit → Push to your fork → Open PR → Review → Merge
```

1. **Fork** this repository (top-right button on GitHub)
2. **Clone** your fork locally
   ```bash
   git clone https://github.com/<your-username>/snuhcc.github.io.git
   cd snuhcc.github.io
   npm install
   ```
3. **Create a branch** with a short descriptive name
   ```bash
   git checkout -b update/your-name-profile
   ```
4. **Make your changes** (see sections below)
5. **Preview** locally with `npm run dev` → open `http://localhost:3000`
6. **Commit and push** to your fork
   ```bash
   git add .
   git commit -m "update: Your Name profile"
   git push origin update/your-name-profile
   ```
7. **Open a pull request** on GitHub from your fork to `snuhcc/snuhcc.github.io:master`

A maintainer will review and merge your PR.

---

### Updating Your Profile

All member data lives in **`src/data/members.json`** under the `current` or `alumni` array.

**Fields:**

| Field | Required | Description |
|-------|----------|-------------|
| `name` | ✓ | Full name |
| `title` | ✓ | Role — e.g. `"PhD Student"`, `"MS Student"`, `"Researcher"` |
| `email` | | SNU email address |
| `fields` | | Research area tags — e.g. `["HAI", "HCI"]` |
| `bio` | | One-line description of your research interest |
| `photo` | | Path to your photo (see below) |
| `url` | | Link to your personal page or Google Scholar profile |

**Example entry:**
```json
{
  "name": "Gildong Hong",
  "email": "gildong@snu.ac.kr",
  "title": "PhD Student",
  "fields": ["HAI", "HCI"],
  "bio": "Conversational agents and user trust",
  "photo": "/images/people/gildong-hong.jpeg",
  "url": "https://scholar.google.com/citations?user=XXXXXX"
}
```

### Adding a Profile Photo

- Place your photo in **`public/images/people/`**
- File name: `firstname-lastname.jpeg` (lowercase, hyphen-separated)
- Recommended: **400×400 px**, square crop, JPG or PNG
- Reference it in `members.json` as `/images/people/firstname-lastname.jpeg`

### PR Guidelines

- **Title format:** `update: Your Name profile` or `fix: typo in members`
- **Description:** briefly note what you changed (1–2 lines is enough)
- Only modify files relevant to your change — avoid reformatting unrelated JSON entries
- Do not push directly to `master` — always go through a PR

---

## Contact

Graduate School of Convergence Science and Technology, Seoul National University  
Prof. Bongwon Suh — bongwon@snu.ac.kr
