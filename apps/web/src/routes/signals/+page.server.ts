import {
	DEFAULT_SIGNALS_DIR,
	loadSignal,
	signalIds,
	type SignalResult,
} from "$lib/signals";
import { historyExists } from "$lib/page-data";
import { derivePublishedCategories, type ContentCategory } from "$lib/meta";

export const prerender = true;

export function load(): {
	signals: { signal: SignalResult; hasHistory: boolean }[];
	categories: ContentCategory[];
} {
	const ids = signalIds(DEFAULT_SIGNALS_DIR);
	const signals = ids.map((id) => ({
		signal: loadSignal(DEFAULT_SIGNALS_DIR, id),
		hasHistory: historyExists(DEFAULT_SIGNALS_DIR, id),
	}));
	const categories = derivePublishedCategories(ids);
	return { signals, categories };
}
