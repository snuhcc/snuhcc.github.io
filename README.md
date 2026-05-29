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

## Contact

Graduate School of Convergence Science and Technology, Seoul National University  
Prof. Bongwon Suh — bongwon@snu.ac.kr
