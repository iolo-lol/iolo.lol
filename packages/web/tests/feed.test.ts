import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { DEFAULT_SIGNALS_DIR } from "../src/server.js";
import { generateFeed, generateSitemap } from "../src/feed.js";
import { generateSite } from "../src/static.js";

describe("Atom change feed", () => {
  it("contains one entry per published canonical change", () => {
    const feed = generateFeed(DEFAULT_SIGNALS_DIR);
    const entries = feed.match(/<entry>/g) ?? [];
    const geminiHistory = JSON.parse(
      readFileSync(
        path.join(
          DEFAULT_SIGNALS_DIR,
          "gemini-3.7-flash-usage-rates.history.json",
        ),
        "utf8",
      ),
    ) as { entries: unknown[] };
    const deepseekHistory = JSON.parse(
      readFileSync(
        path.join(
          DEFAULT_SIGNALS_DIR,
          "deepseek-v4-flash-usage-rates.history.json",
        ),
        "utf8",
      ),
    ) as { entries: unknown[] };
    expect(entries.length).toBe(
      geminiHistory.entries.length + deepseekHistory.entries.length,
    );
  });

  it("uses stable tag ids, meaningful timestamps, and provenance", () => {
    const feed = generateFeed(DEFAULT_SIGNALS_DIR);
    expect(feed).toContain("tag:iolo.lol,2026:signal/");
    expect(feed).toContain("<published>");
    expect(feed).toContain("content sha256:");
    expect(feed).toContain("ai.google.dev/gemini-api/docs/pricing");
    expect(feed).toContain("api-docs.deepseek.com/quick_start/pricing/");
    expect(feed).toContain(
      "https://iolo-lol.github.io/iolo.lol/api/v1/signals/",
    );
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
    expect(published).toEqual(sorted);  });

  it("escapes XML in notes", () => {
    const feed = generateFeed(DEFAULT_SIGNALS_DIR);
    expect(feed).not.toContain("<script>");
  });
});

describe("sitemap", () => {
  it("lists the intended public surfaces with lastmod", () => {
    const sitemap = generateSitemap(DEFAULT_SIGNALS_DIR);
    expect(sitemap).toContain(
      "<loc>https://iolo-lol.github.io/iolo.lol/</loc>",
    );
    expect(sitemap).toContain(
      "<loc>https://iolo-lol.github.io/iolo.lol/api/v1/signals.json</loc>",
    );
    expect(sitemap).toContain(
      "<loc>https://iolo-lol.github.io/iolo.lol/api/v1/signals/gemini-3.7-flash-usage-rates.history.json</loc>",
    );
    expect(sitemap).toContain(
      "<loc>https://iolo-lol.github.io/iolo.lol/api/v1/signals/deepseek-v4-flash-usage-rates.json</loc>",
    );
    expect(sitemap).toMatch(/<lastmod>\d{4}-\d{2}-\d{2}<\/lastmod>/);
  });
});

describe("static site with feed and sitemap", () => {
  it("generates feed.xml and sitemap.xml alongside the API files", () => {
    const outDir = mkdtempSync(path.join(tmpdir(), "iolo-static-"));
    const files = generateSite(DEFAULT_SIGNALS_DIR, outDir);
    expect(files).toContain("feed.xml");
    expect(files).toContain("sitemap.xml");
    expect(readFileSync(path.join(outDir, "feed.xml"), "utf8")).toContain(
      "<feed xmlns=\"http://www.w3.org/2005/Atom\">",
    );
    expect(readFileSync(path.join(outDir, "sitemap.xml"), "utf8")).toContain(
      "<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">",
    );
  });
});
