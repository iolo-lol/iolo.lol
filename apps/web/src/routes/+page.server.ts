import {
	DEFAULT_SIGNALS_DIR,
	loadSignal,
	signalIds,
	type SignalResult,
} from "$lib/signals";
import { historyExists, recentChangeRecords } from "$lib/page-data";
import type { ChangeRecord } from "$lib/changes";

export const prerender = true;

export function load(): {
	signals: { signal: SignalResult; hasHistory: boolean }[];
	recent: ChangeRecord[];
} {
	const signals = signalIds(DEFAULT_SIGNALS_DIR).map((id) => ({
		signal: loadSignal(DEFAULT_SIGNALS_DIR, id),
		hasHistory: historyExists(DEFAULT_SIGNALS_DIR, id),
	}));
	const recent = recentChangeRecords(DEFAULT_SIGNALS_DIR, 5);
	return { signals, recent };
}
