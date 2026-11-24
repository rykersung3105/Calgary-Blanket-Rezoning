/**
 * Resolves a public static asset path relative to the current Vite base URL,
 * ensuring GeoJSON, GeoTIFF, JSON, and image assets load reliably on both
 * root domains and GitHub Pages repository subpaths (e.g. /repo-name/).
 */
export function assetUrl(path: string): string {
  const cleanPath = path.replace(/^\/+/, '');
  const base = import.meta.env.BASE_URL || './';
  return base.endsWith('/') ? `${base}${cleanPath}` : `${base}/${cleanPath}`;
}
