# USC website

The United Space Confederation site: Astro, Keystatic and Vercel. The build plan is in [docs/build-plan.md](docs/build-plan.md).

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

Vercel runs functions on Node 24, so use Node 24 locally where possible.

## Environment variables

Needed once Keystatic is in GitHub mode. Keystatic writes them to `.env` when the GitHub App is created; copy all four to the Vercel project. Never commit `.env`.

- `KEYSTATIC_GITHUB_CLIENT_ID`
- `KEYSTATIC_GITHUB_CLIENT_SECRET`
- `KEYSTATIC_SECRET`
- `PUBLIC_KEYSTATIC_GITHUB_APP_SLUG`

## Contributing

`main` is protected. Work on a branch, open a pull request, and merge with a merge commit (not squash).
