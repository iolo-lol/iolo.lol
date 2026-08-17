import { DEFAULT_SIGNALS_DIR } from "$lib/signals";
import { generateFeed } from "$lib/feed";

export const prerender = true;

export function GET(): Response {
	return new Response(generateFeed(DEFAULT_SIGNALS_DIR), {
		headers: { "content-type": "application/atom+xml; charset=utf-8" },
	});
}
