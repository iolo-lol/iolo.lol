import { loadHistory, loadSignal, signalIds } from "./server.js";
import { signalMeta } from "./meta.js";

export const DEFAULT_SITE_BASE = "https://iolo.lol";

function xmlEscape(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

/** Stable Atom identifier for one published change. */
function entryId(signalId: string, publishedAt: string): string {
  const stamp = publishedAt.replaceAll(/[^A-Za-z0-9]/g, "-");
  return `tag:iolo.lol,2026:signal/${signalId}/${stamp}`;
}

interface HistoryEntry {
  publishedAt: string;
  result: {
    observedAt: string;
    source: { url: string; contentHash: string };
    values: {
      name: string;
      currency: string;
      statements: { value: number; note: string }[];
    }[];
  };
}

function valueSummary(entry: HistoryEntry["result"]): string {
  return entry.values
    .map(
      (v) =>
        `${v.name} ${v.statements
          .map((s) => `${s.value} ${v.currency} (${s.note})`)
          .join(", ")}`,
    )
    .join("; ");
}

/**
 * Atom feed of published canonical changes, one entry per history entry
 * (never per observation), newest first. Entries link to the human-readable
 * change-history page on the canonical origin.
 */
export function generateFeed(
  signalsDir: string,
  siteBase: string = DEFAULT_SITE_BASE,
): string {
  const entries: { publishedAt: string; xml: string }[] = [];
  for (const id of signalIds(signalsDir)) {
    let history: { entries: HistoryEntry[] } | undefined;
    try {
      history = loadHistory(signalsDir, id) as { entries: HistoryEntry[] };
    } catch {
      continue;
    }
    const meta = signalMeta(id);
    for (const entry of history.entries) {
      const link = `${siteBase}/signals/${id}/history/`;
      entries.push({
        publishedAt: entry.publishedAt,
        xml: `  <entry>
    <id>${xmlEscape(entryId(id, entry.publishedAt))}</id>
    <title>${xmlEscape(meta.title)} — published change</title>
    <published>${xmlEscape(entry.publishedAt)}</published>
    <updated>${xmlEscape(entry.publishedAt)}</updated>
    <link href="${xmlEscape(link)}"/>
    <summary>Observed ${xmlEscape(
      entry.result.observedAt,
    )}. Values: ${xmlEscape(
      valueSummary(entry.result),
    )}. Source: ${xmlEscape(
      entry.result.source.url,
    )} (content ${xmlEscape(entry.result.source.contentHash)}).</summary>
  </entry>`,
      });
    }
  }
  entries.sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1));
  const latest = entries[0]?.publishedAt ?? new Date().toISOString();
  return `<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>iolo.lol Signals</title>
  <id>tag:iolo.lol,2026:signals</id>
  <updated>${xmlEscape(latest)}</updated>
  <author><name>iolo.lol</name></author>
  <link href="${xmlEscape(siteBase)}/feed.xml" rel="self"/>
${entries.map((e) => e.xml).join("\n")}
</feed>
`;
}

/**
 * Sitemap of the intended public human-facing and machine surfaces, with the
 * latest published change as lastmod.
 */
export function generateSitemap(
  signalsDir: string,
  siteBase: string = DEFAULT_SITE_BASE,
): string {
  const urls: { loc: string; lastmod: string }[] = [
    { loc: `${siteBase}/`, lastmod: "" },
    { loc: `${siteBase}/signals/`, lastmod: "" },
    { loc: `${siteBase}/compare/`, lastmod: "" },
    { loc: `${siteBase}/changes/`, lastmod: "" },
    { loc: `${siteBase}/api/v1/signals.json`, lastmod: "" },
    { loc: `${siteBase}/api/v1/comparisons/index.json`, lastmod: "" },
  ];
  for (const id of signalIds(signalsDir)) {
    urls.push({ loc: `${siteBase}/signals/${id}/`, lastmod: "" });
    urls.push({ loc: `${siteBase}/api/v1/signals/${id}.json`, lastmod: "" });
    try {
      const result = loadSignal(signalsDir, id) as {
        observedAt?: string;
      };
      const history = loadHistory(signalsDir, id) as {
        entries?: { publishedAt: string }[];
      };
      const lastPublished =
        history.entries?.[history.entries.length - 1]?.publishedAt;
      const lastmod = lastPublished ?? result.observedAt ?? "";
      urls.push({
        loc: `${siteBase}/signals/${id}/history/`,
        lastmod,
      });
      urls.push({
        loc: `${siteBase}/api/v1/signals/${id}.history.json`,
        lastmod,
      });
    } catch {
      // no history endpoint for this signal
    }
  }
  const latest = urls
    .map((u) => u.lastmod)
    .filter((d): d is string => d.length > 0)
    .sort()
    .at(-1);
  for (const u of urls) {
    if (u.lastmod === "") u.lastmod = latest ?? "";
  }
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) =>
      `  <url>\n    <loc>${xmlEscape(u.loc)}</loc>\n    <lastmod>${xmlEscape(
        u.lastmod.slice(0, 10),
      )}</lastmod>\n  </url>`,
  )
  .join("\n")}
</urlset>
`;
}
