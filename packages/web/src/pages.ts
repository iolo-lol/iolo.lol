import {
  formatDate,
  formatDateShort,
  formatNumber,
  signalMeta,
  unitLabel,
  valueLabel,
} from "./meta.js";
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
  --ink: #1a1a1a;
  --muted: #6b6b6b;
  --line: #e5e5e5;
  --paper: #ffffff;
  --accent: #1d4ed8;
  --accent-ink: #ffffff;
  --code-bg: #f4f4f4;
}
* { box-sizing: border-box; }
html { -webkit-text-size-adjust: 100%; }
body {
  margin: 0;
  color: var(--ink);
  background: var(--paper);
  font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  font-size: 16px;
  line-height: 1.6;
}
a { color: var(--accent); text-decoration: none; }
a:hover { text-decoration: underline; }
header.site {
  border-bottom: 1px solid var(--line);
  background: #fafafa;
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
.brand { font-weight: 700; font-size: 1.05rem; letter-spacing: -0.01em; }
.brand a { color: var(--ink); text-decoration: none; }
.brand small { color: var(--muted); font-weight: 400; margin-left: 0.35rem; }
nav a.nav { color: var(--ink); font-size: 0.95rem; }
nav a.nav:hover { color: var(--accent); text-decoration: none; }
main { max-width: 60rem; margin: 0 auto; padding: 2.25rem 1.25rem 3rem; }
footer {
  max-width: 60rem;
  margin: 0 auto;
  padding: 1.25rem 1.25rem 2.5rem;
  border-top: 1px solid var(--line);
  color: var(--muted);
  font-size: 0.875rem;
}
footer p { margin: 0.25rem 0; }
h1 { font-size: 1.9rem; line-height: 1.25; letter-spacing: -0.02em; margin: 0 0 0.25rem; }
h2 { font-size: 1.35rem; letter-spacing: -0.01em; margin: 2rem 0 0.75rem; }
h3 { font-size: 1.05rem; margin: 1.25rem 0 0.5rem; }
p { margin: 0.5rem 0; }
.lead { color: var(--muted); font-size: 1.1rem; max-width: 46rem; }
.section-label {
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-size: 0.75rem;
  color: var(--muted);
  margin: 2.25rem 0 0.5rem;
}
.card {
  border: 1px solid var(--line);
  border-radius: 0.5rem;
  padding: 1.1rem 1.25rem;
  margin: 0.75rem 0;
}
.card h3 { margin: 0 0 0.2rem; }
.card h3 a { color: var(--ink); }
.card .provider { color: var(--muted); font-size: 0.85rem; margin: 0; }
.card .desc { margin: 0.4rem 0; }
.meta-line { color: var(--muted); font-size: 0.875rem; margin: 0.35rem 0; }
.current-values { margin: 0.5rem 0 0; display: grid; gap: 0.35rem; }
.current-values .cv {
  display: flex; flex-wrap: wrap; gap: 0.25rem 0.75rem; align-items: baseline;
}
.cv .value { font-weight: 600; white-space: nowrap; }
.cv .qualifier { color: var(--muted); font-size: 0.875rem; }
.badge {
  display: inline-block;
  background: var(--accent);
  color: var(--accent-ink);
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 600;
  padding: 0.1rem 0.55rem;
  letter-spacing: 0.03em;
}
table { border-collapse: collapse; width: 100%; margin: 0.75rem 0; }
th, td { text-align: left; padding: 0.5rem 0.75rem; border-bottom: 1px solid var(--line); vertical-align: top; }
th { font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--muted); }
td.value-cell { font-weight: 600; white-space: nowrap; }
code {
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 0.85em;
  background: var(--code-bg);
  padding: 0.1em 0.35em;
  border-radius: 0.25em;
  word-break: break-all;
}
details { margin: 0.5rem 0; }
details summary { cursor: pointer; color: var(--muted); font-size: 0.9rem; }
ul.changes { list-style: none; padding: 0; margin: 0; }
ul.changes li { padding: 0.9rem 0; border-bottom: 1px solid var(--line); }
ul.changes li:last-child { border-bottom: none; }
ol.history { list-style: none; padding: 0; margin: 0; counter-reset: hist; }
ol.history li { padding: 1rem 0; border-bottom: 1px solid var(--line); counter-increment: hist; }
ol.history li:last-child { border-bottom: none; }
ol.history .num {
  font-size: 0.8rem; color: var(--muted); font-weight: 600;
}
.notfound { text-align: center; padding: 4rem 1rem; }
.notfound h1 { font-size: 3rem; margin-bottom: 0.5rem; }
@media (max-width: 480px) {
  body { font-size: 15.5px; }
  main { padding: 1.5rem 1rem 2.5rem; }
  h1 { font-size: 1.6rem; }
  .cv { flex-direction: column; gap: 0; }
}
</style>
</head>
<body>
<header class="site">
<nav>
<span class="brand"><a href="/">iolo.lol<small>Signals</small></a></span>
<a class="nav" href="/signals/">Signals</a>
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
<h3><a href="/signals/${htmlEscape(signalId)}/">${htmlEscape(meta.title)}</a></h3>
${meta.provider ? `<p class="provider">${htmlEscape(meta.provider)}</p>` : ""}
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
