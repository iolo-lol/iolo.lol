import { createServer, type Server } from "node:http";
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const DEFAULT_SIGNALS_DIR = fileURLToPath(
  new URL("../../../data/signals", import.meta.url),
);

export function signalIds(signalsDir: string): string[] {
  return readdirSync(signalsDir)
    .filter(
      (name) => name.endsWith(".json") && !name.endsWith(".history.json"),
    )
    .map((name) => name.replace(/\.json$/, ""))
    .sort();
}

export function loadSignal(signalsDir: string, signalId: string): unknown {
  const file = path.join(signalsDir, `${signalId}.json`);
  return JSON.parse(readFileSync(file, "utf8"));
}

export function loadHistory(signalsDir: string, signalId: string): unknown {
  const file = path.join(signalsDir, `${signalId}.history.json`);
  return JSON.parse(readFileSync(file, "utf8"));
}

function htmlEscape(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export function renderPage(signalsDir: string): string {
  const ids = signalIds(signalsDir);
  const cards = ids
    .map((id) => {
      const result = loadSignal(signalsDir, id) as {
        signalId: string;
        observedAt: string;
        source: { url: string; fetchedAt: string; contentHash: string };
        values: {
          name: string;
          unit: string;
          currency: string;
          statements: { value: number; note: string }[];
        }[];
      };
      const rows = result.values
        .map(
          (v) => `<tr>
  <td>${htmlEscape(v.name)}</td>
  <td>${v.statements
    .map(
      (s) =>
        `${htmlEscape(s.value.toFixed(2))} ${htmlEscape(
          v.currency,
        )} / ${htmlEscape(v.unit)} <small>(${htmlEscape(s.note)})</small>`,
    )
    .join("<br>")}</td>
</tr>`,
        )
        .join("\n");
      let history = "";
      try {
        const doc = loadHistory(signalsDir, id) as {
          entries: {
            publishedAt: string;
            result: {
              source: { url: string; fetchedAt: string; contentHash: string };
              values: {
                name: string;
                unit: string;
                currency: string;
                statements: { value: number; note: string }[];
              }[];
            };
          }[];
        };
        history = `<section>
<h3>Change history</h3>
<ol>
${doc.entries
  .map(
    (entry) => `<li>
<p>Published <time>${htmlEscape(
      entry.publishedAt,
    )}</time>. Observed values: ${entry.result.values
      .map(
        (v) =>
          `${htmlEscape(v.name)} ${v.statements
            .map((s) => `${htmlEscape(s.value.toFixed(2))} ${htmlEscape(v.currency)} (${htmlEscape(s.note)})`)
            .join(", ")}`,
      )
      .join("; ")}.</p>
<p>Source: ${htmlEscape(entry.result.source.url)} (fetched <time>${htmlEscape(
      entry.result.source.fetchedAt,
    )}</time>, content <code>${htmlEscape(
      entry.result.source.contentHash,
    )}</code>)</p>
</li>`,
  )
  .join("\n")}
</ol>
</section>`;
      } catch {
        history = "";
      }
      return `<section>
<h2>${htmlEscape(result.signalId)}</h2>
<p>Observed at <time>${htmlEscape(result.observedAt)}</time>.</p>
<table>
<thead><tr><th>Field</th><th>Rate</th></tr></thead>
<tbody>${rows}</tbody>
</table>
<p>Source: <a href="${htmlEscape(result.source.url)}">${htmlEscape(
        result.source.url,
      )}</a> (fetched <time>${htmlEscape(
        result.source.fetchedAt,
      )}</time>, content <code>${htmlEscape(result.source.contentHash)}</code>)</p>
${history}
</section>`;
    })
    .join("\n");
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>iolo.lol — Signals</title>
</head>
<body>
<h1>iolo.lol Signals</h1>
${cards || "<p>No signals published yet.</p>"}
</body>
</html>
`;
}

function sendJson(res: {
  statusCode: number;
  setHeader(name: string, value: string): void;
  end(body: string): void;
}, status: number, body: unknown): void {
  const payload = JSON.stringify(body, null, 2);
  res.statusCode = status;
  res.setHeader("content-type", "application/json; charset=utf-8");
  res.end(payload);
}

export function createApp(signalsDir: string): Server {
  return createServer((req, res) => {
    const url = new URL(req.url ?? "/", "http://localhost");
    const pathname = url.pathname;
    if (pathname === "/" && req.method === "GET") {
      res.statusCode = 200;
      res.setHeader("content-type", "text/html; charset=utf-8");
      res.end(renderPage(signalsDir));
      return;
    }
    const signalsMatch = pathname.match(/^\/api\/v1\/signals$/);
    const signalMatch = pathname.match(/^\/api\/v1\/signals\/([^/]+)$/);
    const historyMatch = pathname.match(
      /^\/api\/v1\/signals\/([^/]+)\/history$/,
    );
    if (req.method === "GET") {
      if (signalsMatch) {
        sendJson(res, 200, { signals: signalIds(signalsDir) });
        return;
      }
      if (historyMatch) {
        const signalId = historyMatch[1] ?? "";
        try {
          sendJson(res, 200, loadHistory(signalsDir, signalId));
          return;
        } catch {
          sendJson(res, 404, {
            error: `signal history not found: ${signalId}`,
          });
          return;
        }
      }
      if (signalMatch) {
        const signalId = signalMatch[1] ?? "";
        try {
          sendJson(res, 200, loadSignal(signalsDir, signalId));
          return;
        } catch {
          sendJson(res, 404, { error: `signal not found: ${signalId}` });
          return;
        }
      }
    }
    sendJson(res, 404, { error: `not found: ${req.method} ${pathname}` });
  });
}

export function start(signalsDir = DEFAULT_SIGNALS_DIR, port = 3000): Server {
  return createApp(signalsDir).listen(port, () => {
    console.log(`iolo.lol web listening on http://localhost:${port}`);
    console.log(`serving canonical signals from ${signalsDir}`);
  });
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const port = Number(process.env.PORT ?? 3000);
  start(DEFAULT_SIGNALS_DIR, port);
}
