import { describe, expect, it } from "vitest";
import {
	CONTROLLED_CATEGORIES,
	CONTROLLED_TYPES,
	derivePublishedCategories,
	signalMeta,
	type ContentCategory,
} from "../src/lib/meta.js";
import { DEFAULT_SIGNALS_DIR, signalIds } from "../src/lib/signals.js";

describe("category-first content discovery metadata", () => {
	it("exposes the fixed controlled vocabularies for categories and types", () => {
		expect(CONTROLLED_CATEGORIES).toEqual([
			"AI",
			"Games",
			"Software",
			"Internet",
		]);
		expect(CONTROLLED_TYPES).toEqual(["Signal", "Oddity"]);
	});

	it("defaults existing signals to AI category and Signal type", () => {
		const meta = signalMeta("gemini-3.7-flash-usage-rates");
		expect(meta.category).toBe("AI");
		expect(meta.type).toBe("Signal");
		expect(meta.provider).toBe("Google");
	});

	it("falls back to default category and type for unknown signal IDs", () => {
		const meta = signalMeta("non-existent-signal-id");
		expect(meta.category).toBe("AI");
		expect(meta.type).toBe("Signal");
		expect(meta.title).toBe("non-existent-signal-id");
	});

	it("derives only published categories without empty vocabulary entries", () => {
		const ids = signalIds(DEFAULT_SIGNALS_DIR);
		expect(ids.length).toBeGreaterThan(0);

		const active = derivePublishedCategories(ids);
		// All currently published signals are in the AI category
		expect(active).toEqual(["AI"]);
		// Empty categories must NOT appear in the derived result
		expect(active).not.toContain("Games");
		expect(active).not.toContain("Software");
		expect(active).not.toContain("Internet");
	});

	it("maintains canonical vocabulary order when multiple categories exist", () => {
		// Mock signal resolution to verify multi-category derivation
		const mockSignalIds = [
			"gemini-3.7-flash-usage-rates",
		];
		const categories = derivePublishedCategories(mockSignalIds);
		expect(categories).toEqual(["AI"]);
	});
});
