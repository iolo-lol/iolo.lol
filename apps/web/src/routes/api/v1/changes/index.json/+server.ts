import { DEFAULT_SIGNALS_DIR } from "$lib/signals";
import { changesFromSignalsDir } from "$lib/changes";

export const prerender = true;

export function GET(): Response {
	return new Response(
		`${JSON.stringify(changesFromSignalsDir(DEFAULT_SIGNALS_DIR), null, 2)}\n`,
		{ headers: { "content-type": "application/json; charset=utf-8" } },
	);
}
