// App-wide static generation with the canonical trailing-slash form for every
// human route (SvelteKit `+server` routes default to `never`, so the
// `api/v1/...json` and `feed.xml`/`sitemap.xml` file paths stay untouched).
export const prerender = true;
export const trailingSlash = "always";
