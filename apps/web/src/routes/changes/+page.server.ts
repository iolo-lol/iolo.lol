import { DEFAULT_SIGNALS_DIR } from "$lib/signals";
import { changesFromSignalsDir, type ChangeRecord } from "$lib/changes";

export const prerender = true;

export function load(): {
	observed: ChangeRecord[];
	upcoming: ChangeRecord[];
} {
	const doc = changesFromSignalsDir(DEFAULT_SIGNALS_DIR);
	const observed = doc.records
		.filter((r) => r.kind === "observed")
		.sort((a, b) => ((a.publishedAt ?? "") < (b.publishedAt ?? "") ? 1 : -1));
	const upcoming = doc.records.filter((r) => r.kind === "upcoming");
	return { observed, upcoming };
}
