import { DEFAULT_SIGNALS_DIR } from "$lib/signals";
import { comparisonFromSignalsDir } from "$lib/compare";

export const prerender = true;

export function GET(): Response {
	return new Response(
		`${JSON.stringify(comparisonFromSignalsDir(DEFAULT_SIGNALS_DIR), null, 2)}\n`,
		{ headers: { "content-type": "application/json; charset=utf-8" } },
	);
}
