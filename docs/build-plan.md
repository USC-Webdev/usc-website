# USC site rebuild: build plan for Claude Code

Written 23 Nov 2026 for a Claude Code session. Read this whole file before writing code. A second project doc, `usc-mockup-a-reference.html`, holds the markup of the approved design and is the visual source of truth.

## 1. Goal

Rebuild https://www.unitedspaceconfederation.org (currently Google Sites, 19 pages) as a static site that:

- matches Mockup A ("Cover") and the USC Brand Guidelines,
- lets non-developer editors post through Keystatic at `/keystatic`,
- keeps every existing URL path working,
- lives in GitHub and deploys on Vercel.

The United Space Confederation (USC) is a Star Citizen player organization. The Confederation Media Network (CMN) is its media team and the main group of editors.

## 2. Decisions already made (do not reopen)

| Topic | Decision |
|---|---|
| Design | Mockup A, "Cover". See section 6 and the reference doc. |
| Framework | Astro (latest stable), TypeScript |
| CMS | Keystatic, self-managed GitHub mode (own GitHub App, no Keystatic Cloud) |
| Content format | Markdoc + YAML in the repo |
| Version control | GitHub, `main` protected, pull requests only |
| Hosting | Vercel, Hobby plan |
| Images | In the repo, optimized at build. See section 8. |

## 3. Constraints that shape the setup

These come from the Hobby plan plus GitHub mode. Design the workflow around them from day one.

1. **Repo owner.** Vercel Hobby does not deploy private repos owned by a GitHub organization. Create the repo under Noel's personal GitHub account, or make it public.
2. **Commit author.** On Hobby, Vercel's docs say the commit author must be the owner of the Hobby team, and that Hobby does not support collaboration on private repos. Keystatic commits are authored by whichever editor is logged in. So a commit by any editor other than Noel may be blocked from deploying.
   - Planned workflow: editors never commit to `main`. Keystatic is configured with a branch prefix; editors save to a `content/...` branch and open a pull request; Noel merges.
   - Use **"Create a merge commit"**, not squash. A squash commit keeps the pull request author as author; a merge commit is authored by the person merging.
   - Editor branches will probably not get Vercel preview builds. Accept this, or see the fallback below.
   - **Test this in Phase 1** with a second GitHub account before building anything else on it. If merges by Noel still fail to deploy, fallbacks in order: (a) make the repo public and retest, (b) a GitHub Action on push to `main` that calls a Vercel Deploy Hook, (c) upgrade to Pro.
3. **Keystatic admin needs a server.** The public pages are prerendered. The Keystatic routes run as Vercel functions through the Astro Vercel adapter.
4. **No Keystatic Cloud features.** No Cloud Images, no multiplayer editing.
5. **Editors need GitHub accounts** with write access to the repo.

## 4. Verify before relying on it

Tooling in this area changes often. Check current docs for each of these at the start, and prefer the docs over this file where they differ.

- Astro: current major version, how `output` and the adapter combine for mixed static and server routes, content collections API (`getCollection`, `render`), `astro:assets` Image component.
- Keystatic Astro guide: https://docs.astro.build/en/guides/cms/keystatic/ and https://keystatic.com/docs/installation-astro
- Keystatic GitHub mode: https://keystatic.com/docs/github-mode
- Keystatic image fields with Astro Image: https://keystatic.com/docs/recipes/astro-images
- Vercel collaboration rules: https://vercel.com/docs/deployments/troubleshoot-project-collaboration

Facts confirmed on 23 Nov 2026:

- Install: `npx astro add react markdoc`, then `npm install @keystatic/core @keystatic/astro`. Add `keystatic()` to `integrations`. An adapter is required.
- `keystatic.config.ts` sits in the project root. Admin UI is at `/keystatic`.
- GitHub mode storage config: `storage: { kind: 'github', repo: 'OWNER/NAME', branchPrefix: 'content/' }`.
- Visiting `/keystatic` locally in GitHub mode walks through creating the GitHub App and writes these to `.env`: `KEYSTATIC_GITHUB_CLIENT_ID`, `KEYSTATIC_GITHUB_CLIENT_SECRET`, `KEYSTATIC_SECRET`, `PUBLIC_KEYSTATIC_GITHUB_APP_SLUG`. Copy all four to Vercel.
- If GitHub reports a `redirect_uri` mismatch after deploy, add the deployed URL as a Callback URL in the GitHub App settings.
- For Astro's Image component to optimize an uploaded image, the Keystatic image field must store it under `src/` (for example `src/assets/images/...`).

## 5. Repo layout

```
/
├─ astro.config.mjs
├─ keystatic.config.ts
├─ CLAUDE.md                  # short project rules for future sessions
├─ docs/
│  ├─ build-plan.md           # this file
│  └─ posting-guide.md        # one page for editors (Phase 6)
├─ public/                    # favicon, fonts if self-hosted, robots.txt
├─ scripts/
│  └─ check-images.mjs        # CI guard, section 8
├─ src/
│  ├─ assets/
│  │  ├─ brand/               # logo files, ministry marks
│  │  └─ images/              # all Keystatic uploads, by collection
│  ├─ components/             # section 7
│  ├─ content/                # Keystatic-managed entries
│  ├─ layouts/BaseLayout.astro
│  ├─ pages/
│  └─ styles/tokens.css
└─ .github/workflows/ci.yml
```

## 6. Design system (from the brand guide and Mockup A)

### Tokens

```css
:root {
  --blue-zodiac: #1B2E59;  --robot-white: #E1DDDF;  --white: #FFFFFF;
  --ruby-red: #EE302A;  --topaz: #00B1B8;  --clover-green: #38A648;
  --sunshade: #F8991D;  --steel-grey: #718396;
  --font-display: 'Orbitron', sans-serif;
  --font-body: 'Sitka Text', 'Sitka Small', Sitka, 'Source Serif 4', Georgia, serif;
  --track-display: 0.04em;  --track-action: 0.08em;  --track-label: 0.16em;
  --rule: 1px solid var(--blue-zodiac);  --rail: 220px;
  --r-control: 999px;  --r-panel: 0;
  --page-max: 1392px;  --gutter: 24px;
  --section: clamp(72px, 9vw, 130px);  --target-min: 48px;
}
```

### Colour rules

- Pages are Blue Zodiac and Robot White first. Display type on Blue Zodiac is pure white; body text on Blue Zodiac is Robot White.
- Ruby Red: one primary action per page plus small non-text markers. White text on it must be bold and at least 19px.
- Topaz and Sunshade: whole-object fills (the Time and Talent cards) with Blue Zodiac text only.
- Clover Green: pattern capsules and marks. No small text on it.
- Steel Grey: section numerals and hairlines on Blue Zodiac, image placeholders. Large text only.
- No gradients, no shadows, no tints of the accent colours.

### Type

- Orbitron (Google Fonts, self-host it): 900 for H1 to H3, 700 for buttons and labels, 500 for section titles.
- Body is Sitka per the brand guide. Sitka is not a web font, so the stack falls back to Source Serif 4 (self-host). Do not try to ship Sitka files.
- H1 hero: `clamp(2.5rem, 12.2vw, 11.2rem)`, uppercase, tracking 0.04em, white with a Blue Zodiac outline (`-webkit-text-stroke: 0.05em; paint-order: stroke fill`).
- Section head: bold numeral + medium title, for example **1.0** Notable News Updates, at `clamp(1.9rem, 4.8vw, 4.2rem)`.
- H3 and index titles: `clamp(1.4rem, 3.1vw, 2.8rem)`, weight 900.
- Buttons and dock: 13 to 20px, weight 700, uppercase, tracking 0.08em.
- Body: 17 to 21px, line height 1.6, max 65 characters a line.
- Labels: body font, 12px, uppercase, tracking 0.16em.

### Logo

- Use the original logo files from the brand package. Never redraw, recolour or distort.
- Only on Blue Zodiac or the white brand colour. On dark, the blue turns white and any red stays red.
- Clearspace equals the height of the icon's top arrow.
- Header: Format 1, 64px high, on Blue Zodiac. Footer: Format 1, 96px high, on Robot White, with `EQUALITY.PROSPERITY.FREEDOM` in Orbitron 400 beneath.
- Never on a photo, the capsule pattern or an accent colour. Never animated.
- The five ministry marks appear only in the menu, on Robot White, 52px wide.

### Layout motifs

- **Cover hero:** Blue Zodiac ground, one upright image centred, white outlined title across it. Section links go in the dock, not under the hero (team feedback, 24.11.2026).
- **Rail and hairline:** 220px label rail, 1px vertical rule, then content. All dividers are 1px Blue Zodiac lines. Square corners on every panel.
- **Capsule band:** full-width Blue Zodiac strip of diagonal rounded capsules in the brand colours, drifting slowly. One per page, between a light and a dark section.
- **Numbering:** sections are 1.0, 2.0; items are 1.1, 1.2.
- **Hexagon arrow:** link arrows sit in a hexagon outline.
- **Capsule controls:** buttons and chips are fully rounded.

### Motion

- Rise: text blocks fade up 80px on entering the viewport (CSS scroll-driven animation, with a no-animation fallback).
- Stack: the three donation cards are `position: sticky` 20px apart and pile up on scroll.
- Slide: capsule rows drift 160px, alternating direction, 40 to 80s.
- Invert: index rows flip to Blue Zodiac on hover, 300ms.
- Drift: card objects bob 14px over 4 to 6s; the clock hands turn.
- Everything stops under `prefers-reduced-motion`. The page must read the same with motion off.

### Accessibility floor

- Text contrast 4.5:1 (3:1 for text 24px and up).
- Real `<a>`, `<button>`, `<nav>`; visible focus ring (2px, 3px offset); 48px minimum targets.
- Alt text field required on every image field.
- Pages work at 360px wide: rails stack, rows wrap, nothing scrolls sideways.

## 7. Components to build

Port each from `usc-mockup-a-reference.html`. That file is a design-canvas export: ignore `support.js`, the `<x-dc>` wrapper, the `sc-if` tag and the `{{ }}` bindings, and move the inline styles into component CSS that uses the tokens.

| Component | Notes |
|---|---|
| `SiteHeader` | Logo, Menu button, "Application + Discord" button. On Blue Zodiac. |
| `MenuPanel` | Opens under the header. Robot White panel: page links in Orbitron 900, ministries with their marks, Media Network sub-pages. Needs a small client script; must work with keyboard and close on Escape. |
| `CoverHero` | Props: kicker, title lines, image, credit. |
| `SectionHead` | Numeral + title, optional aside. Light and dark variants. |
| `RailBlock` | Label rail + content. |
| `IndexRow` | Number, title, sentence, hexagon arrow. Whole row is the link. |
| `PillLink`, `Button` | Variants: primary (Ruby), solid, outline; light and dark. |
| `CapsuleBand` | Decorative, `aria-hidden`. Generate rows from a seeded list so it is stable. |
| `VideoCard` | YouTube ID, title, poster. Click loads the embed (no iframe until click). |
| `ExhibitCard` | Sticky stacking card: number, word, body, colour, object slot. |
| `Notice` | 2px border, Ruby bar, Orbitron statement, body. |
| `Dock` | Floating quick links, bottom centre: one per numbered section, full section titles, scrolls sideways when long. |
| `SiteFooter` | Logo, tagline, channels, contact email, outlined marquee. |
| `Prose` | Markdoc body styles for long pages and newsletters. |
| `Figure` | Astro Image + caption + credit line "In game image by USC-Citizen: NAME". |

## 8. Images

All images live in the repo and are optimized at build time.

- Every Keystatic image field uses `directory: 'src/assets/images/<collection>'` and a matching `publicPath`, so Astro's Image component can process it.
- Each image field is paired with a required alt text field and an optional credit field.
- Render with `<Image>` or `<Picture>`: WebP/AVIF, responsive widths, lazy loading below the fold.
- `scripts/check-images.mjs` runs in CI and fails the build if any file under `src/assets/images` is over 1.5 MB or wider than 3840px. Print the offending paths.
- Tell editors in the posting guide: export screenshots as JPEG, 2560px wide at most.
- Escape hatch, not for now: if the repo passes about 500 MB, move newsletter galleries to Cloudinary or Vercel Blob behind a custom field.
- Check which Vercel image optimization quota applies on Hobby. Prefer build-time optimization through `astro:assets` so the runtime image service is not needed.

## 9. Content model (Keystatic)

Singletons:

| Singleton | Fields |
|---|---|
| `siteSettings` | Application form URL, contact email, social links (YouTube, Instagram, X, Patreon, Swag Store, Galactic Senate), tagline, footer text |
| `home` | Hero, intro, philosophy items (repeatable), community sections, body |
| `ourVision` | Sections (repeatable heading + Markdoc), creed items |
| `leadership` | Sections (repeatable), roles (repeatable name + description) |
| `ministriesIndex` | Heading, sections, org chart image |
| `policies` | Sections grouped as internal and external |
| `citizenship` | Intro, rules body, video ID, CTA label |
| `mediaNetwork` | Hero image + credit, statement, donation pool text (time, talent, treasure in-game, treasure out-of-game), notice text, closing text |
| `citizenCompass` | Banner, overview body, external site URL, contact email |

Collections:

| Collection | Path | Fields |
|---|---|---|
| `ministries` | `src/content/ministries/*` | Title, menu label, full name, abbreviation, mark image, order, work-in-progress flag, offices (repeatable name + body), body, gallery |
| `newsletters` | `src/content/newsletters/*` | Title, quarter, year, issue number, cover image, published date, sections (repeatable: heading, Markdoc body, gallery), body |
| `newsUpdates` | `src/content/news/*` | Title, kicker, summary, link (internal or external), order, visible flag |
| `videos` | `src/content/videos/*` | Title, YouTube ID, presenter line, poster image, month |

Rules:

- Slugs must reproduce the existing paths (section 10).
- Newsletter sections use a repeatable block so editors add "Profiles in Courage", "Senate Votes" and so on without a developer.
- The Media Network page reads the newest newsletter, all visible `newsUpdates` and the two newest `videos` automatically.
- Read content through Astro content collections with schemas that match the Keystatic config exactly.

## 10. Pages and routes

Keep these 19 paths. Add a redirect from `/home` to `/` only if the canonical home becomes `/`; otherwise keep `/home` serving the home page.

| Path | Template |
|---|---|
| `/home` | Home |
| `/our-vision` | Long-form |
| `/leadership` | Long-form |
| `/ministries` | Ministries index |
| `/ministries/usc-navy` | Ministry |
| `/ministries/security` | Ministry |
| `/ministries/exploration` | Ministry |
| `/ministries/commerce` | Ministry |
| `/ministries/engineering` | Ministry |
| `/ministries/state-affairs` | Ministry |
| `/policies` | Long-form |
| `/citizenship` | Citizenship |
| `/media-network` | Media Network (Mockup A) |
| `/media-network/the-citizen-compass` | Compass |
| `/media-network/newsletter-q3-2956` | Newsletter |
| `/media-network/newsletter-q2-2956` | Newsletter |
| `/media-network/newsletter-q1-2956` | Newsletter |
| `/media-network/newsletter-q4-2955` | Newsletter |
| `/media-network/newsletter-q3-2955` | Newsletter |

Seven templates:

1. **Media Network** – exactly Mockup A: header, cover hero, statement with rail, 1.0 news index + back issues, capsule band, 2.0 videos, 3.0 donation pool (three stacking cards + notice), 4.0 contact, dock, footer.
2. **Home** – cover hero with the org name, philosophy as index rows, community sections as rail blocks, CTA to apply.
3. **Long-form** (Our Vision, Leadership, Policies) – small cover hero, numbered sections in rail blocks, `Prose` body.
4. **Ministries index** – section heads, the six ministries as index rows with marks, org chart figure.
5. **Ministry** – hero with the ministry mark on Robot White, offices as numbered rail blocks, gallery, work-in-progress notice when flagged.
6. **Newsletter** – cover hero with quarter and year, sticky section list in the rail, sections as `Prose` with galleries, previous/next issue links.
7. **Citizenship and Compass** – small hero, body, one primary action.

Mockup A only covers template 1. Build the other six from the same components and rules; do not invent new patterns.

## 11. Phases and acceptance checks

### Phase 0 – Inputs from Noel (blockers marked *)

- * GitHub account that will own the repo, and the Vercel account.
- * Original logo files (vector) and the five ministry marks from the brand package.
- Confirm the media team's name: site pages say "Confederation Media Network (CMN)", newsletters say "Confederation Broadcast Network". Default to CMN.
- Titles for the two Videos of the Month (YouTube IDs `tG4SH-YrN3k`, `Eurqia0gXkM`).
- Photo credit names for the ten screenshots, and which image is the Media Network hero.
- List of editors' GitHub usernames.

### Phase 1 – Foundation and the deploy test

1. Create the repo under the personal account. Scaffold Astro + TypeScript. Add React, Markdoc, Keystatic, the Vercel adapter.
2. Keystatic in `local` mode first with one throwaway collection. Confirm `/keystatic` works locally.
3. Connect the repo to Vercel. Confirm a push to `main` by Noel deploys.
4. Switch to GitHub mode with `branchPrefix: 'content/'`. Create the GitHub App through `/keystatic`. Add the four env vars to Vercel. Add the production callback URL to the app.
5. Protect `main`: pull requests required, merge commits allowed, squash disabled.
6. **Run the collaboration test** (section 3, item 2) with a second GitHub account: edit in Keystatic, open a PR, Noel merges, production deploys.
7. Add `ci.yml`: install, `astro check`, build, `check-images`.

Done when: production URL serves the scaffold, Keystatic login works on the deployed site, and the collaboration test result is written into `CLAUDE.md`.

### Phase 2 – Design system

Tokens, fonts, `BaseLayout`, and every component in section 7, shown on a `/styleguide` page (excluded from the sitemap).

Done when: `/styleguide` matches the reference at 1440px and 390px, passes an axe check with no serious issues, and motion stops under reduced motion.

### Phase 3 – Content model

Write `keystatic.config.ts` and the matching content collection schemas. Seed one entry per collection.

Done when: an editor can create a newsletter with three sections and a gallery entirely in Keystatic, and the build reads it.

### Phase 4 – Templates

Build template 1 first and compare it with the reference section by section. Then templates 2 to 7.

Done when: all 19 routes render from content, with no hard-coded copy in templates.

### Phase 5 – Migration

Move the text and images of all 19 pages from the live site. Newsletters are the bulk (25 to 40 sections each); do them last, newest first. Fix while migrating:

- Citizenship: links to Vision and Policies point at `sites.google.com/view/united-space-confederation/...`. Make them internal.
- Media Network: the in-text newsletter link reads "Q3 2025". It should be Q3 2956.
- Media Network: one "CBN" abbreviation. Apply the Phase 0 naming decision everywhere.
- Ministry pages: all six carry work-in-progress notes; three have no headings. Keep the text, set the flag.
- Ministries: the org chart image is dated 01-17-2022. Ask Noel whether a newer one exists.
- Leadership: "USC Membership is:" and "three other important roles" are followed by nothing in the page text. The content is probably an image; transcribe it.
- Menu labels (Security, Exploration, Commerce, Engineering) differ from the full ministry names. Store both.

Keep outbound links as they are: application form `https://forms.gle/zfYYm6SCNMQfhEMWA` (replaced 24.11.2026 by `https://forms.gle/LEw1K2o1JVU1cjLo6`, set in Site settings), Consul of Peace `consulofpeace@unitedspaceconfederation.org`, YouTube channel `UCR7NViQANVRSMB84wMFCS-A`, Instagram `theunitedspaceconfederation`, X `usc_starcitizen`, Patreon `UnitedSpaceConfederation`, Swag Store `redbubble.com/people/LandscaperUSC/explore`, Galactic Senate `robertsspaceindustries.com/orgs/SENATE`, The Citizen Compass `thecitizencompass.com`.

Done when: a page-by-page checklist in the PR shows each of the 19 pages compared against the live site.

### Phase 6 – Editor workflow

Write `docs/posting-guide.md`: log in, create a branch, post a newsletter, add images with alt text and credit, open a pull request, what happens after merge. Walk one editor through it.

### Phase 7 – Launch

- Lighthouse on Home, Media Network and the newest newsletter: performance 90+, accessibility 95+.
- `sitemap.xml`, `robots.txt`, Open Graph image, favicon from the logo icon.
- Add the domain in Vercel, then switch DNS. Keep the Google Site unpublished but intact for two weeks.
- Check all 19 paths return 200 on the new host.

## 12. Copy rules

- Fact first, dry aside second. The sentence must stand without the aside.
- No jokes in anything about donations, payment, policy, conduct or reports to the Consul of Peace.
- This sentence appears wherever donations are mentioned: "Membership never requires payment. Donations are voluntary and confidential. Anyone asking for donations on the USC's behalf should be reported to the Consul of Peace."
- Dates are `DD.MM.YYYY` in the in-universe year. Issues are "Newsletter Q3 2956".
- Full name once, then "the USC" and "the CMN". Members are citizens.
- Image credit format: "In game image by USC-Citizen: NAME".

## 13. Working rules for the Claude Code session

- Work phase by phase. Open one pull request per phase, with the acceptance checks ticked in the description.
- Do not add dependencies beyond Astro, the Vercel adapter, React, Markdoc, Keystatic and a linter without asking.
- Never commit `.env`. List required env vars in `README.md`.
- When a doc contradicts this plan, follow the doc and note the change in the PR.
- Ask Noel before any step that creates accounts, changes DNS, or changes repo visibility.
