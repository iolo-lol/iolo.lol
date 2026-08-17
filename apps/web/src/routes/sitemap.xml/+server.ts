import { DEFAULT_SIGNALS_DIR } from "$lib/signals";
import { generateSitemap } from "$lib/feed";

export const prerender = true;

export function GET(): Response {
	return new Response(generateSitemap(DEFAULT_SIGNALS_DIR), {
		headers: { "content-type": "application/xml; charset=utf-8" },
	});
}
