// `/404.html` is the static 404 artifact served by Cloudflare Workers Static
// Assets (`not_found_handling: "404-page"`). It must stay a bare `.html` file
// in the build root, so this route overrides the app-wide trailing-slash
// behavior (the root layout's `always` would otherwise emit `404.html/`).
export const prerender = true;
export const trailingSlash = "ignore";
