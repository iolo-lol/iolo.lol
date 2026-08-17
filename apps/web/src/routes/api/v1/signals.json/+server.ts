import { DEFAULT_SIGNALS_DIR, signalIds } from "$lib/signals";

export const prerender = true;

export function GET(): Response {
	return new Response(
		`${JSON.stringify({ signals: signalIds(DEFAULT_SIGNALS_DIR) }, null, 2)}\n`,
		{ headers: { "content-type": "application/json; charset=utf-8" } },
	);
}
