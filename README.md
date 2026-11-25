# USC website

The United Space Confederation site: Astro, Keystatic and Vercel. The build plan is in [docs/build-plan.md](docs/build-plan.md). Editors' step-by-step instructions are in [docs/posting-guide.md](docs/posting-guide.md).

- Live site (until the domain moves): https://usc-website-nine.vercel.app
- Editor: `/keystatic` on the live site
- Code: https://github.com/USC-Webdev/usc-website (public)

## How it fits together

| Piece | What it does | Who controls it |
|---|---|---|
| GitHub repo `USC-Webdev/usc-website` | Holds the code and all content (YAML files and images). Every change is a commit. | USC-Webdev (admin) |
| Keystatic (`/keystatic`) | A web editor for the content. Logging in uses GitHub; saving writes a commit to the repo. | Anyone with write access to the repo |
| GitHub App `usc-webdev-keystatic` | Lets Keystatic log people in and commit for them. Owned by the USC-Webdev account. | USC-Webdev |
| Vercel project `usc-website` (team `usc-webdev`) | Builds the site from `main` and serves it. Builds a preview for each pull request. | USC-Webdev only (Vercel Hobby has one member) |
| GitHub Actions | `ci.yml` checks every pull request. `daily-rebuild.yml` rebuilds the site at 06:17 UTC so new videos and posts appear in Latest Updates. | USC-Webdev |

The public pages are built ahead of time. Only the Keystatic routes run as Vercel functions.

## Who can update what

| | Public | Editor (write access) | USC-Webdev (owner) |
|---|---|---|---|
| Read the site and the code | Yes | Yes | Yes |
| Log in to Keystatic | No | Yes | Yes |
| Edit content in Keystatic | No | Yes, on a `content/` branch | Yes, straight on `main` |
| Open a pull request | Fork only | Yes | Yes |
| See a preview of their change | No | Yes (Vercel link on the pull request) | Yes |
| Put a change on the live site | No | No: USC-Webdev approves and merges it | Yes |
| Merge pull requests | No | No | Yes |
| Add or remove editors | No | No | Yes |
| Vercel settings, domain, environment variables, deploy hook | No | No | Yes |
| GitHub App and repo settings | No | No | Yes |

Why it works this way:

- `main` is protected. A pull request needs an approving review from USC-Webdev (the code owner in `.github/CODEOWNERS`), and nobody can force-push. USC-Webdev is exempt as admin, so its own saves and pull requests go through without a review.
- When an editor saves on `main` in Keystatic, GitHub rejects the commit and Keystatic asks them to create a branch. Keystatic names the branch `content/<name>`.
- Vercel Hobby only deploys to production for commits authored by the account owner. A merge commit made by USC-Webdev counts, so editors' work goes live when USC-Webdev merges it. Always merge with **Create a merge commit**. Squash and rebase merges are turned off because they would put the editor's name on the commit and Vercel would skip it.
- Editors cannot merge their own work.

### What each part of Keystatic changes

The left menu in Keystatic has three groups:

- **Media Network**: Latest updates (written posts for the Home carousel), Screenshot pool (USC in the 'Verse), Newsletters, News updates, Videos, the Media Network page and The Citizen Compass page.
- **Pages**: Home, Our Vision, Leadership, Policies, Citizenship, the Ministries index, the interactive organization chart and each ministry.
- **Settings**: Site settings, which holds the application form link, social links, the YouTube channels and RSS feeds that fill Latest Updates, and how many items it shows.

The posting guide has a fuller table.

## Adding a new editor

1. The new editor creates a GitHub account at https://github.com/signup if they don't have one.
2. They hide their email. In GitHub, under **Settings → Emails**, they turn on **Keep my email addresses private** and **Block command line pushes that expose my email**. The repo is public, so every commit shows its author's email unless it's hidden.
3. They send their GitHub username to the webdev team.
4. Signed in to GitHub as **USC-Webdev**, open https://github.com/USC-Webdev/usc-website/settings/access and click **Add people**. Enter the username and send the invitation. (The repo belongs to a personal account, so a collaborator always gets write access; there is no separate role to pick.)
5. The editor accepts the invitation from the email or from https://github.com/USC-Webdev/usc-website/invitations.
6. The editor goes to `/keystatic` on the live site, clicks **Log in with GitHub** and approves the `usc-webdev-keystatic` app the first time. They then follow [docs/posting-guide.md](docs/posting-guide.md).

Editors don't need a Vercel account. Preview links on pull requests are public.

### Removing an editor

On the same access page, signed in as USC-Webdev, click **Remove** next to their name. They lose Keystatic access at once. Their open branches and pull requests stay, so merge or close those as needed.

### Current editors

Check https://github.com/USC-Webdev/usc-website/settings/access for the up-to-date list.

## Reviewing and publishing an editor's change (USC-Webdev)

1. Open the pull request and wait for the checks to pass. A failure is usually an oversized image; the details name the file.
2. Open the **Vercel** preview link and check the change.
3. Click **Review changes → Approve**, then **Merge pull request** with **Create a merge commit**.
4. Production updates about two minutes later. Delete the branch when GitHub offers to.

## Moving the domain to Vercel

The site is built for `https://www.unitedspaceconfederation.org` (set as `site` in `astro.config.mjs`). That address becomes the main one, and the bare `unitedspaceconfederation.org` redirects to it. Within the site, `/` already redirects to `/home`, and every old Google Sites page path is kept, so no other redirects are needed.

Do this signed in as USC-Webdev. You also need login access to the domain's DNS, wherever the domain is registered. Domains registered with Google Domains moved to Squarespace Domains, so look there first.

### 1. Write down the current DNS

At the DNS provider, take a screenshot of every record before changing anything. **Leave the email records alone**: `MX`, and `TXT` records for SPF (`v=spf1…`), DKIM and `google-site-verification`. Addresses such as consulofpeace@unitedspaceconfederation.org depend on them.

### 2. Add the domains in Vercel

1. Open https://vercel.com, then the `usc-webdev` team, the `usc-website` project, **Settings → Domains**.
2. Click **Add Domain**, enter `www.unitedspaceconfederation.org` and connect it to **Production**.
3. Click **Add Domain** again and enter `unitedspaceconfederation.org`. Choose **Redirect to `www.unitedspaceconfederation.org`** with status **308 Permanent Redirect**.
4. Vercel now lists both domains as **Invalid Configuration** and shows the DNS records each one needs. Keep this page open.

### 3. Change the DNS records

At the DNS provider, use the exact values Vercel shows. They are usually:

| Type | Name (host) | Value | Replaces |
|---|---|---|---|
| `A` | `@` (the bare domain) | `76.76.21.21` | Any existing `A` and `AAAA` records on `@`, for example Google's `216.239.32.21`–`216.239.38.21` |
| `CNAME` | `www` | `cname.vercel-dns.com` (or the project-specific name Vercel shows) | The Google Sites record `ghs.googlehosted.com` |

If the provider has a "forward" or "redirect" setting for the bare domain, turn it off; Vercel handles the redirect now.

### 4. Wait for Vercel to confirm

Within minutes to a few hours, both domains in Vercel show **Valid Configuration**, and Vercel issues the HTTPS certificates itself. Then check:

```bash
curl -sI https://unitedspaceconfederation.org | grep -iE "^(HTTP|location)"
```

It should show `308` and `location: https://www.unitedspaceconfederation.org/`.

```bash
curl -sI https://www.unitedspaceconfederation.org/home | head -1
```

It should show `200`. Spot-check a few other pages too.

### 5. Let Keystatic log in on the new address

1. Open https://github.com/settings/apps/usc-webdev-keystatic (signed in as USC-Webdev).
2. Under **Callback URL**, click **Add Callback URL** and enter `https://www.unitedspaceconfederation.org/api/keystatic/github/oauth/callback`. Keep the existing `usc-website-nine.vercel.app` one.
3. Set **Homepage URL** to `https://www.unitedspaceconfederation.org`.
4. Click **Save changes**, then log in at https://www.unitedspaceconfederation.org/keystatic to check it.

If login shows a `redirect_uri` error, the callback URL doesn't match the address in the browser exactly.

### 6. Retire the Google Site

In Google Sites, open the old site, go to **Settings → Custom domains** and remove `www.unitedspaceconfederation.org`. Then unpublish the site. Keep it, unpublished, for two weeks in case something is missing.

### After the move

- Editors use https://www.unitedspaceconfederation.org/keystatic. The posting guide already uses this address.
- The `usc-website-nine.vercel.app` address keeps working.
- Update the "Temporary production URL" note in `CLAUDE.md`.

## Develop

```bash
npm install
npm run dev
```

The site runs at http://localhost:4321 and the editor at http://localhost:4321/keystatic.

| Command | What it does |
|---|---|
| `npm run dev` | Dev server |
| `npm run check` | Type and template check |
| `npm run build` | Production build |
| `npm run check-images` | Fails if an image under `src/assets/images` is over 1.5 MB or wider than 3840px |
| `npm run check-names` | Fails if an old media team name (CBN) appears |

Locally, Keystatic edits GitHub by default. To edit the files on disk instead (for example to test a schema change), run:

```bash
PUBLIC_KEYSTATIC_LOCAL=true npm run dev
```

Keystatic keeps unsaved drafts in the browser, and a stale draft can override the file on disk.

Every Keystatic schema in `keystatic.config.ts` has a matching schema in `src/content.config.ts`. Change both together.

Vercel runs functions on Node 24, so use Node 24 locally where possible.

## Environment variables and secrets

Keystatic in GitHub mode needs these four. Keystatic wrote them to `.env` when the GitHub App was created, and they are set in Vercel (**Settings → Environment Variables**) for Production and Preview. Never commit `.env`.

- `KEYSTATIC_GITHUB_CLIENT_ID`
- `KEYSTATIC_GITHUB_CLIENT_SECRET`
- `KEYSTATIC_SECRET`
- `PUBLIC_KEYSTATIC_GITHUB_APP_SLUG` (`usc-webdev-keystatic`)

The client ID and secret come from the GitHub App page. If the secret is ever regenerated there, update it in Vercel and redeploy.

The repo secret `VERCEL_DEPLOY_HOOK` (GitHub: **Settings → Secrets and variables → Actions**) holds the URL of the Vercel deploy hook `daily-feed-refresh` (Vercel: **Settings → Git → Deploy Hooks**). The daily rebuild calls it. You can also run it by hand from the repo's **Actions** tab.

## Contributing code

Work on a branch, open a pull request and merge with a merge commit (never squash). Commits must be authored with the USC webdev account's email so Vercel deploys them.
