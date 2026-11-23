# USC website

Rebuild of unitedspaceconfederation.org as a static Astro site with Keystatic, deployed on Vercel Hobby.

- **Read first:** `docs/build-plan.md` (the plan; its section 2 decisions are closed) and `docs/usc-mockup-a-reference.html` (visual source of truth for the Media Network page).
- **Stack:** Astro 7, TypeScript strict, React (Keystatic admin only), Markdoc, Keystatic, `@astrojs/vercel`. Do not add other dependencies without asking Noel.
- **Rendering:** public pages are prerendered. Only the Keystatic routes run as Vercel functions.
- **Content:** every Keystatic schema in `keystatic.config.ts` has a matching schema in `src/content.config.ts`. Change both together.
- **Images:** Keystatic image fields store under `src/assets/images/<collection>`; render with `astro:assets`. `npm run check-images` enforces 1.5 MB and 3840px limits.
- **Workflow:** one pull request per phase; merge commits only, never squash (Vercel Hobby deploys only commits authored by the account owner). Squash and rebase merges are disabled in the repo settings.
- **`main` is not protected.** GitHub Free does not allow branch protection on a private repo, and Noel chose on 23 Nov 2026 to keep the repo private and unprotected. Never push to `main` directly; always go through a pull request.
- **Accounts:** the repo and Vercel project belong to the USC webdev account. Commits in this repo must be authored with that account's email.
- **Hosting:** Vercel project `usc-website` (team `usc-webdev`), connected to `USC-Webdev/usc-website`. Temporary production URL: https://usc-website-nine.vercel.app. The four Keystatic variables are set for Production and Preview.
- **Never commit `.env`.** Required variables are listed in `README.md`.
- **Ask Noel before** creating accounts, changing DNS, or changing repo visibility.

## Commands

- `npm run dev` – dev server at http://localhost:4321, admin at `/keystatic`
- `npm run check` – `astro check`
- `npm run build` – production build
- `npm run check-images` – image size guard

## Phase 1 collaboration test

Not run yet. Record the result here (does a merge commit by the owner of an editor's Keystatic pull request deploy to production?).
