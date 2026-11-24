# Calgary Blanket Rezoning

A standalone, zero-dependency geospatial editorial web application examining Calgary's 2024 Land-Use Blanket Rezoning Policy. All geospatial layers (**313** Community Districts as GeoJSON and **309,746** rezoned land parcels as a DEFLATE-compressed EPSG:3857 GeoTIFF), statistical chart datasets, and thematic map images are bundled locally—no ArcGIS Online or cloud feature services required.

## Publishing Free on GitHub Pages (GitHub Actions)

This repository is pre-configured with relative asset paths (`base: './'`), a `.nojekyll` marker, and an automated workflow at `.github/workflows/deploy.yml`.

1. **Create a public GitHub repository** and push this project to the `main` branch:
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Calgary Blanket Rezoning standalone app"
   git branch -M main
   git remote add origin https://github.com/<your-username>/<repo-name>.git
   git push -u origin main
   ```
2. **Enable GitHub Pages via GitHub Actions**:
   - Open your repository on GitHub and go to **Settings → Pages**.
   - Under **Build and deployment → Source**, choose **GitHub Actions**.
3. **Wait for the workflow to complete**:
   - Open the **Actions** tab to watch **Deploy to GitHub Pages** finish (~1 minute).
   - Your site will be live at `https://<your-username>.github.io/<repo-name>/` with zero fees.

## Embedding in Another Static Site (e.g., GitHub Pages Portfolio)

Append `?embed=true` to your published URL to activate **compact embed mode** (hides the top navigation bar so your host site's header stays primary, aligns the sticky sidecar to the top of the iframe, and adds a subtle *Open Full Story* link):

```html
<iframe
  src="https://<your-username>.github.io/<repo-name>/?embed=true"
  title="Calgary Blanket Rezoning — Interactive Geospatial Story"
  width="100%"
  height="850px"
  style="border: 1px solid #e7e5e4; border-radius: 6px; display: block;"
  loading="lazy"
  allowfullscreen
></iframe>
```

You can also customize and copy this snippet directly from the **Embed on Another Static Site** panel at the bottom of the live page.

## Local Development

```bash
npm install
npm run dev
```

To build the static production bundle into `dist/`:

```bash
npm run build
```
