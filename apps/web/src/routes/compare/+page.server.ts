import { DEFAULT_SIGNALS_DIR } from "$lib/signals";
import {
	comparisonFromSignalsDir,
	type ComparisonDocument,
} from "$lib/compare";

export const prerender = true;

export function load(): {
	doc: ComparisonDocument;
	dimensionNames: string[];
	labelByDimension: Record<string, string>;
} {
	const doc: ComparisonDocument = comparisonFromSignalsDir(DEFAULT_SIGNALS_DIR);
	const dimensionNames = [
		...new Set(doc.entries.flatMap((entry) => entry.dimensions.map((d) => d.name))),
	].sort();
	const labelByDimension: Record<string, string> = {};
	for (const entry of doc.entries) {
		for (const dim of entry.dimensions) {
			if (!(dim.name in labelByDimension)) labelByDimension[dim.name] = dim.label;
		}
	}
	return { doc, dimensionNames, labelByDimension };
}
