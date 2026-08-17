import { error } from "@sveltejs/kit";
import {
	DEFAULT_SIGNALS_DIR,
	loadHistory,
	loadSignal,
	type HistoryDocument,
	type SignalResult,
} from "$lib/signals";

export const prerender = true;

export function load({
	params,
}: {
	params: Record<string, string>;
}): {
	signalId: string;
	signal: SignalResult;
	history: HistoryDocument;
} {
	const signalId = params.signalId!;
	try {
		return {
			signalId,
			signal: loadSignal(DEFAULT_SIGNALS_DIR, signalId),
			history: loadHistory(DEFAULT_SIGNALS_DIR, signalId),
		};
	} catch {
		throw error(404, "signal history not found");
	}
}
