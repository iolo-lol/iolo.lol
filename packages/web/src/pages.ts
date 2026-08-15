import {
  formatDate,
  formatDateShort,
  formatNumber,
  signalMeta,
  unitLabel,
  valueLabel,
} from "./meta.js";
import {
  buildComparison,
  comparisonFromSignalsDir,
  type ComparisonDimension,
  type ComparisonDocument,
  type ComparisonEntry,
} from "./compare.js";
import { loadHistory, loadSignal, signalIds, type HistoryEntry } from "./server.js";
import { htmlEscape } from "./escape.js";

export const CANONICAL_ORIGIN = "https://iolo.lol";

export interface Statement {
  value: number;
  note: string;
}

export interface ResultValue {
  name: string;
  unit: string;
  currency: string;
  statements: Statement[];
}

export interface SignalResult {
  schemaVersion: number;
  signalId: string;
  observedAt: string;
  source: { url: string; fetchedAt: string; contentHash: string };
  values: ResultValue[];
}

export interface HistoryDocument {
  schemaVersion: number;
  signalId: string;
  entries: HistoryEntry[];
}

interface PageOptions {
  title: string;
  description: string;
  canonicalPath: string;
  body: string;
}

function layout({ title, description, canonicalPath, body }: PageOptions): string {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${htmlEscape(title)}</title>
<meta name="description" content="${htmlEscape(description)}">
<link rel="canonical" href="${htmlEscape(CANONICAL_ORIGIN + canonicalPath)}">
<link rel="alternate" type="application/atom+xml" title="iolo.lol Signal changes" href="${htmlEscape(CANONICAL_ORIGIN)}/feed.xml">
<style>
:root {
  color-scheme: light dark;
  --paper: #fbfbfd;
  --surface: #ffffff;
  --surface-raised: #f5f5f7;
  --surface-subtle: #fbfbfd;
  --ink: #1d1d1f;
  --muted: #6e6e73;
  --quiet: #86868b;
  --line: rgba(0, 0, 0, 0.08);
  --line-strong: rgba(0, 0, 0, 0.16);
  --accent: #0066cc;
  --accent-hover: #0077ed;
  --accent-surface: rgba(0, 102, 204, 0.08);
  --accent-ink: #ffffff;
  --code-bg: #f5f5f7;
  --header-bg: rgba(251, 251, 253, 0.82);
  --shadow-card: 0 1px 3px rgba(0, 0, 0, 0.04), 0 0 0 1px var(--line);
  --shadow-card-hover: 0 6px 20px -4px rgba(0, 0, 0, 0.08), 0 0 0 1px var(--line-strong);
}

@media (prefers-color-scheme: dark) {
  :root {
    --paper: #000000;
    --surface: #141416;
    --surface-raised: #1c1c1e;
    --surface-subtle: #161618;
    --ink: #f5f5f7;
    --muted: #a1a1a6;
    --quiet: #6e6e73;
    --line: rgba(255, 255, 255, 0.1);
    --line-strong: rgba(255, 255, 255, 0.2);
    --accent: #2997ff;
    --accent-hover: #47a6ff;
    --accent-surface: rgba(41, 151, 255, 0.14);
    --accent-ink: #ffffff;
    --code-bg: #1c1c1e;
    --header-bg: rgba(18, 18, 20, 0.82);
    --shadow-card: 0 2px 10px rgba(0, 0, 0, 0.4), 0 0 0 1px var(--line), 0 1px 0 inset rgba(255, 255, 255, 0.06);
    --shadow-card-hover: 0 8px 28px -2px rgba(0, 0, 0, 0.65), 0 0 0 1px var(--line-strong), 0 1px 0 inset rgba(255, 255, 255, 0.1);
  }
}

* { box-sizing: border-box; }
html { -webkit-text-size-adjust: 100%; }
body {
  margin: 0;
  color: var(--ink);
  background: var(--paper);
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display", "PingFang SC", "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  font-size: 16px;
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

a { color: var(--accent); text-decoration: none; transition: color 140ms ease; }
a:hover { color: var(--accent-hover); text-decoration: underline; }

header.site {
  position: sticky;
  top: 0;
  z-index: 100;
  border-bottom: 1px solid var(--line);
  background: var(--header-bg);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
}

nav {
  max-width: 60rem;
  margin: 0 auto;
  padding: 0.75rem 1.25rem;
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem 1.5rem;
  align-items: baseline;
}

.brand { font-weight: 700; font-size: 1.05rem; letter-spacing: -0.02em; }
.brand a { color: var(--ink); text-decoration: none; display: inline-flex; align-items: baseline; }
.brand a:hover { text-decoration: none; }
.brand small {
  color: var(--muted);
  font-weight: 500;
  font-size: 0.8rem;
  margin-left: 0.45rem;
  background: var(--surface-raised);
  padding: 0.1rem 0.45rem;
  border-radius: 6px;
  border: 1px solid var(--line);
}

nav a.nav {
  color: var(--ink);
  font-size: 0.92rem;
  font-weight: 500;
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
  transition: background-color 140ms ease, color 140ms ease;
}
nav a.nav:hover {
  background: var(--accent-surface);
  color: var(--accent);
  text-decoration: none;
}
nav a.nav:active {
  transform: scale(0.97);
}

main { max-width: 60rem; margin: 0 auto; padding: 2.5rem 1.25rem 3.5rem; }

footer {
  max-width: 60rem;
  margin: 0 auto;
  padding: 1.75rem 1.25rem 3rem;
  border-top: 1px solid var(--line);
  color: var(--muted);
  font-size: 0.875rem;
}
footer p { margin: 0.35rem 0; }

h1 {
  font-size: clamp(1.85rem, 4vw, 2.4rem);
  line-height: 1.15;
  letter-spacing: -0.035em;
  font-weight: 700;
  margin: 0 0 0.5rem;
}

h2 {
  font-size: 1.35rem;
  font-weight: 650;
  letter-spacing: -0.022em;
  margin: 2.25rem 0 0.85rem;
}

h3 {
  font-size: 1.1rem;
  font-weight: 650;
  letter-spacing: -0.015em;
  margin: 0 0 0.35rem;
}

p { margin: 0.5rem 0; }
.lead { color: var(--muted); font-size: 1.08rem; line-height: 1.55; max-width: 46rem; margin-bottom: 1.25rem; }

.section-label {
  font-size: 1.2rem;
  font-weight: 650;
  letter-spacing: -0.018em;
  color: var(--ink);
  margin: 2.5rem 0 0.75rem;
}

.card {
  border: 1px solid var(--line);
  border-radius: 14px;
  background: var(--surface);
  box-shadow: var(--shadow-card);
  padding: 1.25rem 1.35rem;
  margin: 0.85rem 0;
  transition: box-shadow 180ms ease, border-color 180ms ease, transform 140ms ease;
}
.card:hover {
  border-color: var(--line-strong);
  box-shadow: var(--shadow-card-hover);
}
.card:active {
  transform: scale(0.995);
}

.card h3 { margin: 0 0 0.25rem; }
.card h3 a { color: var(--ink); }
.card h3 a:hover { color: var(--accent); }

.card .provider-tag {
  display: inline-flex;
  align-items: center;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--muted);
  background: var(--surface-raised);
  border: 1px solid var(--line);
  border-radius: 999px;
  padding: 0.15rem 0.55rem;
  margin: 0 0 0.5rem;
  letter-spacing: 0.01em;
}
.card .provider {
  color: var(--muted);
  font-size: 0.85rem;
  margin: 0 0 0.35rem;
  font-weight: 500;
}
.card .desc { color: var(--muted); font-size: 0.92rem; margin: 0.4rem 0 0.75rem; }
.meta-line { color: var(--muted); font-size: 0.875rem; margin: 0.45rem 0; font-variant-numeric: tabular-nums; }

.current-values {
  margin: 0.75rem 0;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 0.65rem;
}
.current-values .cv {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  background: var(--surface-raised);
  border: 1px solid var(--line);
  border-radius: 10px;
  padding: 0.7rem 0.9rem;
}
.cv .value {
  font-weight: 650;
  font-size: 1.02rem;
  color: var(--ink);
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}
.cv .qualifier { color: var(--muted); font-size: 0.82rem; line-height: 1.4; }

.badge {
  display: inline-block;
  background: var(--accent-surface);
  color: var(--accent);
  border: 1px solid color-mix(in srgb, var(--accent) 30%, transparent);
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 600;
  padding: 0.1rem 0.5rem;
  letter-spacing: 0.02em;
}

table {
  border-collapse: separate;
  border-spacing: 0;
  width: 100%;
  margin: 0.85rem 0;
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: var(--shadow-card);
}
th, td {
  text-align: left;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid var(--line);
  vertical-align: top;
}
th {
  font-size: 0.8rem;
  font-weight: 650;
  letter-spacing: 0.02em;
  color: var(--muted);
  background: var(--surface-raised);
}
tr:last-child td { border-bottom: none; }
td.value-cell { font-weight: 650; white-space: nowrap; font-variant-numeric: tabular-nums; }

code {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 0.85em;
  background: var(--code-bg);
  color: var(--ink);
  padding: 0.15em 0.4em;
  border-radius: 6px;
  border: 1px solid var(--line);
  word-break: break-all;
  font-variant-numeric: tabular-nums;
}

details {
  margin: 1.25rem 0;
  background: var(--surface-raised);
  border: 1px solid var(--line);
  border-radius: 12px;
  padding: 0.85rem 1.1rem;
  transition: border-color 150ms ease;
}
details[open] {
  border-color: var(--line-strong);
}
details summary {
  cursor: pointer;
  color: var(--ink);
  font-size: 0.92rem;
  font-weight: 600;
  user-select: none;
  outline: none;
}
details summary:hover {
  color: var(--accent);
}
details[open] summary {
  margin-bottom: 0.65rem;
}

ul.changes { list-style: none; padding: 0; margin: 0; }
ul.changes li {
  padding: 1rem 0;
  border-bottom: 1px solid var(--line);
}
ul.changes li:last-child { border-bottom: none; }

ol.history { list-style: none; padding: 0; margin: 0; counter-reset: hist; }
ol.history li {
  padding: 1.25rem 0;
  border-bottom: 1px solid var(--line);
  counter-increment: hist;
}
ol.history li:last-child { border-bottom: none; }
ol.history .num {
  display: inline-block;
  font-size: 0.78rem;
  color: var(--muted);
  font-weight: 600;
  background: var(--surface-raised);
  border: 1px solid var(--line);
  border-radius: 6px;
  padding: 0.15rem 0.5rem;
  margin-bottom: 0.35rem;
  font-variant-numeric: tabular-nums;
}

.notfound { text-align: center; padding: 5rem 1rem; }
.notfound h1 { font-size: 3.5rem; margin-bottom: 0.5rem; letter-spacing: -0.04em; }

@media (max-width: 600px) {
  body { font-size: 15.5px; }
  main { padding: 1.75rem 1rem 3rem; }
  h1 { font-size: 1.75rem; }
  .current-values { grid-template-columns: 1fr; }
  nav { padding: 0.65rem 1rem; }
}

@media (prefers-reduced-motion: reduce) {
  * {
    transition: none !important;
    transform: none !important;
    animation: none !important;
  }
}

@media (prefers-reduced-transparency: reduce) {
  header.site {
    background: var(--paper);
    backdrop-filter: none;
    -webkit-backdrop-filter: none;
  }
}

@media (prefers-contrast: more) {
  :root {
    --line: rgba(0, 0, 0, 0.28);
    --line-strong: rgba(0, 0, 0, 0.45);
  }
  @media (prefers-color-scheme: dark) {
    :root {
      --line: rgba(255, 255, 255, 0.32);
      --line-strong: rgba(255, 255, 255, 0.55);
    }
  }
}

/* Comparison page */
.compare-wrap { overflow-x: auto; margin: 1.25rem 0; }
table.compare { min-width: 48rem; }
table.compare th, table.compare td { border-bottom: 1px solid var(--line); }
th.cmp-provider-col { min-width: 11.5rem; }
.cmp-provider { font-weight: 650; color: var(--ink); font-size: 0.95rem; }
.cmp-model { color: var(--muted); font-weight: 500; font-size: 0.85rem; margin-top: 0.15rem; }
.cmp-fresh { color: var(--quiet); font-size: 0.75rem; margin-top: 0.4rem; line-height: 1.45; }
.cmp-fresh a { color: var(--accent); }
.cmp-cell .cmp-value, .cmp-cell .cmp-note { display: block; }
.cmp-value { font-weight: 650; color: var(--ink); font-variant-numeric: tabular-nums; white-space: nowrap; }
.cmp-value.cmp-alt { font-weight: 500; color: var(--muted); font-size: 0.85rem; margin-top: 0.3rem; }
.cmp-note { color: var(--muted); font-size: 0.78rem; line-height: 1.45; }
.cmp-na { color: var(--quiet); text-align: center; }
.cmp-legend { color: var(--muted); font-size: 0.875rem; max-width: 52rem; }
</style>
</head>
<body>
<header class="site">
<nav>
<span class="brand"><a href="/">iolo.lol<small>Signals</small></a></span>
<a class="nav" href="/signals/">Signals</a>
<a class="nav" href="/compare/">Compare</a>
<a class="nav" href="/changes/">Recent changes</a>
<a class="nav" href="/feed.xml">Feed</a>
</nav>
</header>
<main>
${body}
</main>
<footer>
<p>iolo.lol tracks structured facts — Signals — directly from official sources, with the source recorded for every observation.</p>
<p>Machine-readable data: <a href="/api/v1/signals.json">signal list</a>, <a href="/feed.xml">Atom feed</a>, <a href="/sitemap.xml">sitemap</a>.</p>
</footer>
</body>
</html>
`;
}

function statementsHtml(signalId: string, values: ResultValue[]): string {
  return `<div class="current-values">
${values
  .map(
    (v) => `<div class="cv">
  <span class="value">${htmlEscape(
    v.statements[0]
      ? `${formatNumber(v.statements[0].value)} ${v.currency} ${unitLabel(v.unit)}`
      : "",
  )}</span>
  <span class="qualifier">${htmlEscape(
    v.statements[0]?.note ?? "",
  )}</span>
</div>`,
  )
  .join("\n")}
</div>`;
}

function verificationHtml(result: SignalResult): string {
  return `<details>
<summary>Verification details</summary>
<p class="meta-line">Signal id: <code>${htmlEscape(result.signalId)}</code></p>
<p class="meta-line">Schema: <code>result.v1 / v${htmlEscape(
    String(result.schemaVersion),
  )}</code></p>
<p class="meta-line">Observed at: <time datetime="${htmlEscape(
    result.observedAt,
  )}">${htmlEscape(formatDate(result.observedAt))}</time></p>
<p class="meta-line">Source: <a href="${htmlEscape(result.source.url)}">${htmlEscape(
    result.source.url,
  )}</a> (fetched <time datetime="${htmlEscape(
    result.source.fetchedAt,
  )}">${htmlEscape(formatDate(result.source.fetchedAt))}</time>)</p>
<p class="meta-line">Content hash: <code>${htmlEscape(
    result.source.contentHash,
  )}</code></p>
</details>`;
}

function signalCard(signalsDir: string, signalId: string): string {
  const result = loadSignal(signalsDir, signalId) as SignalResult;
  const meta = signalMeta(signalId);
  return `<section class="card">
${meta.provider ? `<div class="provider-tag">${htmlEscape(meta.provider)}</div>` : ""}
<h3><a href="/signals/${htmlEscape(signalId)}/">${htmlEscape(meta.title)}</a></h3>
${meta.description ? `<p class="desc">${htmlEscape(meta.description)}</p>` : ""}
${statementsHtml(signalId, result.values)}
<p class="meta-line">Last checked <time datetime="${htmlEscape(
    result.observedAt,
  )}">${htmlEscape(formatDateShort(result.observedAt))}</time> · <a href="/signals/${htmlEscape(
    signalId,
  )}/">View details</a>${historyExists(signalsDir, signalId) ? ` · <a href="/signals/${htmlEscape(signalId)}/history/">History</a>` : ""}</p>
</section>`;
}

function historyExists(signalsDir: string, signalId: string): boolean {
  try {
    loadHistory(signalsDir, signalId);
    return true;
  } catch {
    return false;
  }
}

function lastPublishedAt(signalsDir: string, signalId: string): string | undefined {
  try {
    const doc = loadHistory(signalsDir, signalId) as HistoryDocument;
    return doc.entries.at(-1)?.publishedAt;
  } catch {
    return undefined;
  }
}

export function renderHome(signalsDir: string): string {
  const ids = signalIds(signalsDir);
  const recent = recentChanges(signalsDir, 5);
  const body = `<h1>iolo.lol</h1>
<p class="lead">Current facts about AI services — usage rates and pricing from official sources — checked continuously, with the source of every observation recorded.</p>

<section>
<h2 class="section-label">What are Signals?</h2>
<p>Signals are structured facts iolo.lol tracks over time: a provider's stated price for a model, directly from the provider's official page. Each Signal shows today's value, what changed recently, when it was last checked, and the authoritative source behind it.</p>
</section>

<section>
<h2 class="section-label">Signals</h2>
${ids.map((id) => signalCard(signalsDir, id)).join("\n") || "<p>No signals published yet.</p>"}
<p><a href="/signals/">All signals</a></p>
</section>

<section>
<h2 class="section-label">Recent changes</h2>
${recent.length === 0 ? "<p>No changes published yet.</p>" : `<ul class="changes">
${recent
  .map((c) => changeItemHtml(c))
  .join("\n")}
</ul>`}
<p><a href="/changes/">All changes</a></p>
</section>`;
  return layout({
    title: "iolo.lol — Signals from official sources",
    description:
      "iolo.lol tracks current facts about AI services — usage rates and pricing — from official sources, with provenance for every observation.",
    canonicalPath: "/",
    body,
  });
}

interface ChangeItem {
  signalId: string;
  publishedAt: string;
  result: SignalResult;
}

function recentChanges(signalsDir: string, limit: number): ChangeItem[] {
  const items: ChangeItem[] = [];
  for (const id of signalIds(signalsDir)) {
    let doc: HistoryDocument;
    try {
      doc = loadHistory(signalsDir, id) as HistoryDocument;
    } catch {
      continue;
    }
    for (const entry of doc.entries) {
      items.push({ signalId: id, publishedAt: entry.publishedAt, result: entry.result });
    }
  }
  items.sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1));
  return items.slice(0, limit);
}

function changeItemHtml(c: ChangeItem): string {
  const meta = signalMeta(c.signalId);
  return `<li>
<time datetime="${htmlEscape(c.publishedAt)}"><strong>${htmlEscape(
    formatDate(c.publishedAt),
  )}</strong></time> — ${htmlEscape(meta.title)}
<div class="current-values">
${c.result.values
  .map(
    (v) => `<div class="cv">
  <span class="value">${htmlEscape(
    v.statements[0]
      ? `${formatNumber(v.statements[0].value)} ${v.currency} ${unitLabel(v.unit)}`
      : "",
  )}</span>
  <span class="qualifier">${htmlEscape(v.statements[0]?.note ?? "")}</span>
</div>`,
  )
  .join("\n")}
</div>
<p class="meta-line">Source: <a href="${htmlEscape(c.result.source.url)}">${htmlEscape(
    c.result.source.url,
  )}</a> · <a href="/signals/${htmlEscape(c.signalId)}/">Details</a></p>
</li>`;
}

export function renderSignalsIndex(signalsDir: string): string {
  const ids = signalIds(signalsDir);
  const body = `<h1>Signals</h1>
<p class="lead">Every fact iolo.lol tracks. Each Signal is derived from one official source and shows its current value, freshness, and change history.</p>
${ids.map((id) => signalCard(signalsDir, id)).join("\n") || "<p>No signals published yet.</p>"}`;
  return layout({
    title: "Signals — iolo.lol",
    description:
      "The Signals iolo.lol tracks: current values, freshness, and change history from official sources.",
    canonicalPath: "/signals/",
    body,
  });
}

function compareHeaderCellHtml(entry: ComparisonEntry): string {
  return `<th scope="col" class="cmp-provider-col">
<div class="cmp-provider">${htmlEscape(entry.provider)}</div>
<div class="cmp-model">${htmlEscape(entry.model)}</div>
<div class="cmp-fresh">checked <time datetime="${htmlEscape(
    entry.observedAt,
  )}">${htmlEscape(formatDateShort(entry.observedAt))}</time><br><a href="/signals/${htmlEscape(
    entry.signalId,
  )}/">details &amp; source</a></div>
</th>`;
}

function compareCellHtml(dimension: ComparisonDimension | undefined): string {
  if (!dimension) {
    return '<td class="cmp-na" aria-label="not offered">—</td>';
  }
  const lines = dimension.statements
    .map((statement, index) => {
      const value = `${formatNumber(statement.value)} ${dimension.currency} ${unitLabel(
        dimension.unit,
      )}`;
      const note = statement.note
        ? `<span class="cmp-note">${htmlEscape(statement.note)}</span>`
        : "";
      return `<span class="cmp-value${index === 0 ? "" : " cmp-alt"}">${htmlEscape(
        value,
      )}</span>${note}`;
    })
    .join("\n");
  return `<td class="cmp-cell">${lines}</td>`;
}

export function renderCompare(signalsDir: string): string {
  const doc: ComparisonDocument = comparisonFromSignalsDir(signalsDir);
  if (doc.entries.length === 0) {
    return layout({
      title: "Compare — iolo.lol",
      description: "Compare AI usage rates across the tracked Signals.",
      canonicalPath: "/compare/",
      body: "<h1>Compare</h1><p>No Signals published yet.</p>",
    });
  }
  const dimensionNames = [
    ...new Set(doc.entries.flatMap((entry) => entry.dimensions.map((d) => d.name))),
  ].sort();
  const labelFor = (name: string): string => {
    for (const entry of doc.entries) {
      const dim = entry.dimensions.find((d) => d.name === name);
      if (dim) return dim.label;
    }
    return name;
  };
  const body = `<h1>Compare AI pricing</h1>
<p class="lead">Usage rates across the five tracked AI models, projected from the same canonical Signal data as the detail pages. Rates are USD per 1 million tokens.</p>
<div class="compare-wrap">
<table class="compare">
<thead>
<tr>
<th scope="col">Rate</th>
${doc.entries.map((entry) => compareHeaderCellHtml(entry)).join("\n")}
</tr>
</thead>
<tbody>
${dimensionNames
    .map(
      (name) => `<tr>
<th scope="row">${htmlEscape(labelFor(name))}</th>
${doc.entries
        .map((entry) => compareCellHtml(entry.dimensions.find((d) => d.name === name)))
        .join("\n")}
</tr>`,
    )
    .join("\n")}
</tbody>
</table>
</div>
<p class="cmp-legend">Where a rate has more than one statement, the first is the currently applicable value; the rest are the provider's stated conditions — temporary pricing, peak/off-peak windows, or cache hit/miss — preserved verbatim. Open a provider's <em>details &amp; source</em> for the full provenance of every value. The same projection is available machine-readable at <a href="/api/v1/comparisons/index.json">/api/v1/comparisons/index.json</a>.</p>`;
  return layout({
    title: "Compare AI pricing — iolo.lol",
    description:
      "Compare the tracked AI usage rates side by side: all five providers, conditional pricing kept visible, with source and freshness for every value.",
    canonicalPath: "/compare/",
    body,
  });
}

export function renderSignalDetail(
  signalsDir: string,
  signalId: string,
): string | undefined {
  let result: SignalResult;
  try {
    result = loadSignal(signalsDir, signalId) as SignalResult;
  } catch {
    return undefined;
  }
  const meta = signalMeta(signalId);
  const last = lastPublishedAt(signalsDir, signalId);
  const body = `<h1>${htmlEscape(meta.title)}</h1>
${meta.provider ? `<p class="provider">${htmlEscape(meta.provider)}</p>` : ""}
${meta.description ? `<p class="lead">${htmlEscape(meta.description)}</p>` : ""}

<section>
<h2>Current state</h2>
<table>
<thead><tr><th>Rate</th><th>Statement</th></tr></thead>
<tbody>
${result.values
  .map(
    (v) => `<tr>
<td>${htmlEscape(valueLabel(signalId, v.name))}</td>
<td>${v.statements
      .map(
        (s, i) =>
          `<div><span class="value-cell">${htmlEscape(
            `${formatNumber(s.value)} ${v.currency} ${unitLabel(v.unit)}`,
          )}</span>${i === 0 ? ` <span class="badge">current</span>` : ""} <span class="qualifier">${htmlEscape(
            s.note,
          )}</span></div>`,
      )
      .join("")}</td>
</tr>`,
  )
  .join("\n")}
</tbody>
</table>
</section>

<section>
<h2>Freshness and source</h2>
<p class="meta-line">Last checked: <time datetime="${htmlEscape(
    result.observedAt,
  )}">${htmlEscape(formatDate(result.observedAt))}</time></p>
<p class="meta-line">Source fetched: <time datetime="${htmlEscape(
    result.source.fetchedAt,
  )}">${htmlEscape(formatDate(result.source.fetchedAt))}</time></p>
<p class="meta-line">Authoritative source: <a href="${htmlEscape(
    result.source.url,
  )}">${htmlEscape(result.source.url)}</a></p>
${last ? `<p class="meta-line">Last meaningful change: <time datetime="${htmlEscape(last)}">${htmlEscape(formatDate(last))}</time></p>` : ""}
</section>

<section>
<h2>Change history</h2>
${historyExists(signalsDir, signalId)
    ? `<p class="meta-line"><a href="/signals/${htmlEscape(signalId)}/history/">Read the full change history</a></p>`
    : "<p class=\"meta-line\">No changes published yet.</p>"}
</section>

${verificationHtml(result)}`;
  return layout({
    title: `${meta.title} — iolo.lol`,
    description: meta.description || `${meta.title} — current value, freshness, and change history from the official source.`,
    canonicalPath: `/signals/${signalId}/`,
    body,
  });
}

export function renderSignalHistory(
  signalsDir: string,
  signalId: string,
): string | undefined {
  let result: SignalResult;
  let doc: HistoryDocument;
  try {
    result = loadSignal(signalsDir, signalId) as SignalResult;
    doc = loadHistory(signalsDir, signalId) as HistoryDocument;
  } catch {
    return undefined;
  }
  const meta = signalMeta(signalId);
  const entries = [...doc.entries].reverse();
  const body = `<h1>${htmlEscape(meta.title)} — change history</h1>
<p class="lead">Every published change for this Signal, newest first. Each entry records the values at publication time and the source they came from.</p>
<p class="meta-line">Current state: <a href="/signals/${htmlEscape(signalId)}/">${htmlEscape(
    meta.title,
  )}</a></p>
<ol class="history">
${entries
    .map(
      (entry, index) => `<li>
<div class="num">Change ${String(entries.length - index)} of ${entries.length}</div>
<p><time datetime="${htmlEscape(entry.publishedAt)}"><strong>${htmlEscape(
        formatDate(entry.publishedAt),
      )}</strong></time></p>
${statementsHtml(signalId, entry.result.values)}
${verificationHtml(entry.result)}
</li>`,
    )
    .join("\n")}
</ol>`;
  return layout({
    title: `${meta.title} — change history — iolo.lol`,
    description: `Change history for ${meta.title}: every published change with values and source provenance.`,
    canonicalPath: `/signals/${signalId}/history/`,
    body,
  });
}

export function renderChanges(signalsDir: string): string {
  const items = recentChanges(signalsDir, 50);
  const body = `<h1>Recent changes</h1>
<p class="lead">Published changes across all Signals, newest first.</p>
${items.length === 0 ? "<p>No changes published yet.</p>" : `<ul class="changes">
${items
      .map((c) => changeItemHtml(c))
      .join("\n")}
</ul>`}`;
  return layout({
    title: "Recent changes — iolo.lol",
    description:
      "Recently published Signal changes at iolo.lol: what changed, when, and from which official source.",
    canonicalPath: "/changes/",
    body,
  });
}

export function renderNotFound(): string {
  const body = `<div class="notfound">
<h1>404</h1>
<p>That page does not exist.</p>
<p><a href="/">Back to iolo.lol</a></p>
</div>`;
  return layout({
    title: "Page not found — iolo.lol",
    description: "The requested page does not exist.",
    canonicalPath: "/404",
    body,
  });
}
