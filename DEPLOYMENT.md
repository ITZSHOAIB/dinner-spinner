# Cloudflare Pages deployment

This project deploys through Cloudflare Pages Git integration. Cloudflare builds the
`main` branch and publishes the `dist` directory; no GitHub Actions deployment or
Wrangler command is required.

## Cloudflare dashboard

1. Open **Workers & Pages** and select **Create application** -> **Pages** ->
   **Import an existing Git repository**.
2. Choose this repository and use `dinner-spinner` as the Pages project name.
3. Set the production branch to `main` and use these build settings:

| Setting | Value |
| --- | --- |
| Framework preset | `Vite` |
| Build command | `yarn build` |
| Build output directory | `dist` |
| Root directory | `/` |
| Node.js version | `24` |

4. Under **Custom domains**, add `dinner-spinner.sohab.dev` and complete the DNS
   verification shown by Cloudflare.
5. Under **Settings** -> **Environment variables**, add `VITE_SITE_URL` with
   `https://dinner-spinner.sohab.dev` for the production environment.
6. Deploy and submit `https://dinner-spinner.sohab.dev/sitemap.xml` in Search
   Console. Cloudflare also creates preview deployments for pull requests.

`VITE_SITE_URL` sets canonical URLs, Open Graph image URLs, the generated sitemap,
structured data, and the LLM indexes.

## Migration from GitHub Pages

The repository no longer contains a GitHub Pages workflow or the `gh-pages`
dependency. After the first Cloudflare deployment succeeds, disable GitHub Pages in
the repository's **Settings** -> **Pages** to avoid serving the retired site.

There is intentionally no top-level `404.html`. Cloudflare Pages then uses its
native SPA fallback for unknown client-side routes, while prerendered recipe pages,
`robots.txt`, `sitemap.xml`, and other static SEO files are still served directly.
