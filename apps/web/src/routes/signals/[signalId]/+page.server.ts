import { error } from "@sveltejs/kit";
import { DEFAULT_SIGNALS_DIR, loadSignal, type SignalResult } from "$lib/signals";
import { historyExists, lastPublishedAt } from "$lib/page-data";

export const prerender = true;

export function load({
	params,
}: {
	params: Record<string, string>;
}): {
	signalId: string;
	signal: SignalResult;
	last: string | undefined;
	hasHistory: boolean;
} {
	const signalId = params.signalId!;
	try {
		return {
			signalId,
			signal: loadSignal(DEFAULT_SIGNALS_DIR, signalId),
			last: lastPublishedAt(DEFAULT_SIGNALS_DIR, signalId),
			hasHistory: historyExists(DEFAULT_SIGNALS_DIR, signalId),
		};
	} catch {
		throw error(404, "signal not found");
	}
}
