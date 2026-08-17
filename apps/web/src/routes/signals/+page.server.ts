import {
	DEFAULT_SIGNALS_DIR,
	loadSignal,
	signalIds,
	type SignalResult,
} from "$lib/signals";
import { historyExists } from "$lib/page-data";

export const prerender = true;

export function load(): {
	signals: { signal: SignalResult; hasHistory: boolean }[];
} {
	const signals = signalIds(DEFAULT_SIGNALS_DIR).map((id) => ({
		signal: loadSignal(DEFAULT_SIGNALS_DIR, id),
		hasHistory: historyExists(DEFAULT_SIGNALS_DIR, id),
	}));
	return { signals };
}
