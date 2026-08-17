import {
	DEFAULT_SIGNALS_DIR,
	loadSignal,
	signalIds,
	type SignalResult,
} from "$lib/signals";
import { historyExists, recentChangeRecords } from "$lib/page-data";
import { derivePublishedCategories, type ContentCategory } from "$lib/meta";
import type { ChangeRecord } from "$lib/changes";

export const prerender = true;

export function load(): {
	signals: { signal: SignalResult; hasHistory: boolean }[];
	recent: ChangeRecord[];
	categories: ContentCategory[];
} {
	const ids = signalIds(DEFAULT_SIGNALS_DIR);
	const signals = ids.map((id) => ({
		signal: loadSignal(DEFAULT_SIGNALS_DIR, id),
		hasHistory: historyExists(DEFAULT_SIGNALS_DIR, id),
	}));
	const recent = recentChangeRecords(DEFAULT_SIGNALS_DIR, 5);
	const categories = derivePublishedCategories(ids);
	return { signals, recent, categories };
}
