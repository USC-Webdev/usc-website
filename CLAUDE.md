# USC website

Rebuild of unitedspaceconfederation.org as a static Astro site with Keystatic, deployed on Vercel Hobby.

- **Read first:** `docs/build-plan.md` (the plan; its section 2 decisions are closed) and `docs/usc-mockup-a-reference.html` (visual source of truth for the Media Network page).
- **Stack:** Astro 7, TypeScript strict, React (Keystatic admin only), Markdoc, Keystatic, `@astrojs/vercel`. Do not add other dependencies without asking Noel.
- **Rendering:** public pages are prerendered. Only the Keystatic routes run as Vercel functions.
- **Content:** all entries are YAML; long text fields are Markdoc strings rendered by `src/lib/markdoc.ts`. Every Keystatic schema in `keystatic.config.ts` has a matching schema in `src/content.config.ts`. Change both together.
- **Org chart:** the Ministries page shows an interactive column explorer (`OrgExplorer.astro`) built from the `orgChart` singleton (`src/content/pages/org-chart.yaml`); the v4 draw.io SVG is linked as "the original chart".
- **Alt text** is optional (Noel, 24.11.2026); the migrated images have none yet. **Credits** have a Citizen/Resident status ("Resident" is the pre-citizen term).
- **Application form:** `https://forms.gle/LEw1K2o1JVU1cjLo6`, set once in Site settings.
- **Images:** Keystatic image fields store under `src/assets/images/<collection>/<slug>/<field path>/image.<ext>` (singletons: `src/assets/images/pages/<page>/...`), referenced from YAML as `../../assets/images/...`; render with `astro:assets`. Keystatic renames files to this layout on save, so keep migrated files in it too. `npm run check-images` enforces 1.5 MB and 3840px limits.
- **Workflow:** one pull request per phase; merge commits only, never squash (Vercel Hobby deploys only commits authored by the account owner). Squash and rebase merges are disabled in the repo settings.
- **`main` is protected:** pull requests need an approving review from USC-Webdev (code owner, `.github/CODEOWNERS`); no force pushes. USC-Webdev is exempt as admin, so its own pull requests merge with `gh pr merge --merge --admin`. Editors cannot merge their own work.
- **The repo is public** (decided 23 Nov 2026) because GitHub Free only protects branches on public repos. Everything committed is world-readable, including commit author emails. The pre-publication history lives in the private `USC-Webdev/usc-website-private-archive`; do not make that repo public.
- **Accounts:** the repo and Vercel project belong to the USC webdev account. Commits in this repo must be authored with that account's email.
- **Hosting:** Vercel project `usc-website` (team `usc-webdev`), connected to `USC-Webdev/usc-website`. Temporary production URL: https://usc-website-nine.vercel.app. The four Keystatic variables are set for Production and Preview.
- **Latest Updates feed** (Home): `src/lib/feed.ts` merges the `updates` collection, newsletters and YouTube channel RSS (channels in Site settings) at build time; in-universe dates are real + 930 years. Remote pictures are limited to the hosts in `image.remotePatterns`. `.github/workflows/daily-rebuild.yml` calls the Vercel deploy hook `daily-feed-refresh` (repo secret `VERCEL_DEPLOY_HOOK`) at 06:17 UTC daily.
- **Brand files:** the org's logo package (Illustrator files and large PNG exports) sits git-ignored in the project root. `node scripts/make-brand-assets.mjs` builds the web files from it: white header logo, ministry marks, favicon, touch icon, social image. The USC Navy uses the State Affairs mark (Noel's choice; its own copy, so Keystatic can manage it per entry).
- **Placeholders:** any missing asset renders through `Placeholder.astro` or a `.ph-badge` and carries `data-placeholder`. Only the Ministries org chart is still a placeholder. Before launch, `grep -r data-placeholder dist/` must come back empty.
- **Design system:** components in `src/components/`, shown on `/styleguide` (noindex). Tokens in `src/styles/tokens.css`. Fonts self-hosted through Astro's `fonts` config: Orbitron for display, Exo 2 for body text (Noel's choice, replacing the brand guide's Sitka/Source Serif 4).
- **Never commit `.env`.** Required variables are listed in `README.md`.
- **Ask Noel before** creating accounts, changing DNS, or changing repo visibility.

## Commands

- `PUBLIC_KEYSTATIC_LOCAL=true npm run dev` – Keystatic edits local files instead of GitHub. Keystatic keeps unsaved drafts in the browser's IndexedDB; a stale draft can override the file on disk.

- `npm run dev` – dev server at http://localhost:4321, admin at `/keystatic`
- `npm run check` – `astro check`
- `npm run build` – production build
- `npm run check-images` – image size guard
- `npm run check-names` – fails if an old media team name (CBN, Confederation Broadcast/Broadcasting Network) appears; the team is the Confederation Media Network (CMN)

## Phase 1 collaboration test (run 23 Nov 2026)

Owner account: USC-Webdev. Editor account: nwalling (write access). Run on the repo while it was private and unprotected.

- **Owner merge commit deploys.** An editor's commit on a `content/` branch, merged by USC-Webdev with a merge commit, deployed to production.
- **Editor commits do not deploy on their own** while the repo was private: the editor's branch got no preview ("Deployment was blocked"). After the repo went public, an editor's `content/` branch did get a Vercel preview. Production only changes on owner merges.
- **Keystatic only forces a branch when `main` is protected.** `branchPrefix` just prefixes the names of branches created in the branch picker. On an unprotected `main`, a save commits to `main`. With protection, GitHub rejects the commit and Keystatic prompts the editor to create a new branch. This is why the repo is public and protected.
- **Keystatic login works on the deployed site** for both accounts.
