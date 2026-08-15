import { loadHistory, loadSignal, signalIds } from "./server.js";
import { signalMeta } from "./meta.js";
import { changesFromSignalsDir } from "./changes.js";

export const DEFAULT_SITE_BASE = "https://iolo.lol";

function xmlEscape(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

/** Stable Atom identifier for one projected change record. */
function entryId(
  signalId: string,
  dimension: string,
  stamp: string,
): string {
  const clean = stamp.replaceAll(/[^A-Za-z0-9]/g, "-");
  return `tag:iolo.lol,2026:change/${signalId}/${dimension}/${clean}`;
}

function statementSummary(
  dimension: { currency: string },
  statements: { value: number; note: string }[],
): string {
  if (statements.length === 0) return "not offered";
  return statements
    .map(
      (s) =>
        `${s.value} ${dimension.currency} per 1M tokens${s.note ? ` (${s.note})` : ""}`,
    )
    .join("; ");
}

/**
 * Atom feed of projected pricing changes — one entry per change record from
 * the shared changes projection, never per unchanged snapshot. Observed
 * entries use the publication time of the later snapshot; upcoming entries
 * use the observation time of the current state (both deterministic from
 * canonical data). Entries link to the Signal history drill-down page.
 */
export function generateFeed(
  signalsDir: string,
  siteBase: string = DEFAULT_SITE_BASE,
): string {
  const doc = changesFromSignalsDir(signalsDir);
  const entries: { updated: string; xml: string }[] = [];
  for (const record of doc.records) {
    const meta = signalMeta(record.signalId);
    const d = record.dimension;
    const updated =
      record.kind === "observed"
        ? record.publishedAt ?? record.observedAt ?? ""
        : record.observedAt ?? "";
    const timeText =
      record.kind === "observed"
        ? `Observed ${record.observedAt ?? ""}`
        : record.effectiveAt
          ? `Effective ${record.effectiveAt}`
          : "Effective date stated by the source";
    const link = `${siteBase}/signals/${record.signalId}/history/`;
    entries.push({
      updated,
      xml: `  <entry>
    <id>${xmlEscape(
      entryId(record.signalId, d.name, updated || "pending"),
    )}</id>
    <title>${xmlEscape(
      `${meta.title} — ${d.label} ${record.kind === "upcoming" ? "upcoming change" : "change"}`,
    )}</title>
    <published>${xmlEscape(updated)}</published>
    <updated>${xmlEscape(updated)}</updated>
    <link href="${xmlEscape(link)}"/>
    <summary>${xmlEscape(
      `${record.kind === "upcoming" ? "Upcoming" : "Observed"} change — ${d.label}: ${statementSummary(d, d.before)} → ${statementSummary(d, d.after)}. ${timeText}. Source: ${record.source.url} (content ${record.source.contentHash}). See https://iolo.lol/changes/ and ${link}.`,
    )}</summary>
  </entry>`,
    });
  }
  entries.sort((a, b) => (a.updated < b.updated ? 1 : -1));
  const latest = entries[0]?.updated ?? "";
  return `<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>iolo.lol Signal pricing changes</title>
  <id>tag:iolo.lol,2026:changes</id>
  <updated>${xmlEscape(latest)}</updated>
  <author><name>iolo.lol</name></author>
  <link href="${xmlEscape(siteBase)}/feed.xml" rel="self"/>
${entries.map((e) => e.xml).join("\n")}
</feed>
`;
}

/**
 * Sitemap of the intended public human-facing and machine surfaces, with the
 * latest change timestamp as lastmod.
 */
export function generateSitemap(
  signalsDir: string,
  siteBase: string = DEFAULT_SITE_BASE,
): string {
  const urls: { loc: string; lastmod: string }[] = [
    { loc: `${siteBase}/`, lastmod: "" },
    { loc: `${siteBase}/signals/`, lastmod: "" },
    { loc: `${siteBase}/compare/`, lastmod: "" },
    { loc: `${siteBase}/offers/`, lastmod: "" },
    { loc: `${siteBase}/changes/`, lastmod: "" },
    { loc: `${siteBase}/api/v1/signals.json`, lastmod: "" },
    { loc: `${siteBase}/api/v1/comparisons/index.json`, lastmod: "" },
    { loc: `${siteBase}/api/v1/changes/index.json`, lastmod: "" },
    { loc: `${siteBase}/api/v1/model-offers/index.json`, lastmod: "" },
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
