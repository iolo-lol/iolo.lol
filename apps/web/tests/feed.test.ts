import { describe, expect, it } from "vitest";
import { DEFAULT_SIGNALS_DIR } from "../src/lib/signals.js";
import { changesFromSignalsDir } from "../src/lib/changes.js";
import { generateFeed, generateSitemap } from "../src/lib/feed.js";

describe("Atom change feed", () => {
  it("contains one entry per projected change record and never an unchanged snapshot", () => {
    const feed = generateFeed(DEFAULT_SIGNALS_DIR);
    const entries = feed.match(/<entry>/g) ?? [];
    const expected = changesFromSignalsDir(DEFAULT_SIGNALS_DIR).records.length;
    expect(entries.length).toBe(expected);
    // a concurrent condition (Together "cached") is not a change -> no entry
    expect(feed).not.toContain("Qwen3.8-2.4T-A95B");
  });

  it("uses stable tag ids, meaningful timestamps, and provenance", () => {
    const feed = generateFeed(DEFAULT_SIGNALS_DIR);
    expect(feed).toContain("tag:iolo.lol,2026:change/");
    expect(feed).toContain("<published>");
    expect(feed).toContain("content sha256:");
    expect(feed).toContain("ai.google.dev/gemini-api/docs/pricing");
    expect(feed).toContain("api-docs.deepseek.com/quick_start/pricing/");
    expect(feed).toContain(
      "https://iolo.lol/signals/gemini-3.7-flash-usage-rates/history/",
    );
    expect(feed).toContain("Gemini 3.7 Flash usage rates");
    expect(feed).toContain("DeepSeek V4 Flash usage rates");
    // upcoming records carry their effective-time text and verbatim notes
    expect(feed).toContain("starting January 1, 2027.");
    expect(feed).toContain("Effective 2026-08-16T16:00:00Z");
    expect(feed).toContain("off-peak from 16:00 UTC on August 16, 2026");
  });

  it("orders entries newest first and never duplicates", () => {
    const feed = generateFeed(DEFAULT_SIGNALS_DIR);
    const ids = [...feed.matchAll(/<id>([^<]+)<\/id>/g)].map((m) => m[1]);
    const unique = new Set(ids);
    expect(unique.size).toBe(ids.length);
    const published = [
      ...feed.matchAll(/<published>([^<]+)<\/published>/g),
    ].map((m) => m[1] ?? "");
    const sorted = [...published].sort((a, b) => (a < b ? 1 : -1));
    expect(published).toEqual(sorted);
  });

  it("escapes XML in notes", () => {
    const feed = generateFeed(DEFAULT_SIGNALS_DIR);
    expect(feed).not.toContain("<script>");
  });
});

describe("sitemap", () => {
  it("lists the human-facing and machine surfaces with lastmod", () => {
    const sitemap = generateSitemap(DEFAULT_SIGNALS_DIR);
    expect(sitemap).toContain("<loc>https://iolo.lol/</loc>");
    expect(sitemap).toContain("<loc>https://iolo.lol/signals/</loc>");
    expect(sitemap).toContain("<loc>https://iolo.lol/changes/</loc>");
    expect(sitemap).toContain("<loc>https://iolo.lol/offers/</loc>");
    expect(sitemap).toContain(
      "<loc>https://iolo.lol/api/v1/signals.json</loc>",
    );
    expect(sitemap).toContain(
      "<loc>https://iolo.lol/api/v1/changes/index.json</loc>",
    );
    expect(sitemap).toContain(
      "<loc>https://iolo.lol/api/v1/model-offers/index.json</loc>",
    );
    expect(sitemap).toContain(
      "<loc>https://iolo.lol/signals/gemini-3.7-flash-usage-rates/</loc>",
    );
    expect(sitemap).toContain(
      "<loc>https://iolo.lol/signals/gemini-3.7-flash-usage-rates/history/</loc>",
    );
    expect(sitemap).toContain(
      "<loc>https://iolo.lol/api/v1/signals/deepseek-v4-flash-usage-rates.json</loc>",
    );
    expect(sitemap).toMatch(/<lastmod>\d{4}-\d{2}-\d{2}<\/lastmod>/);
  });
});
