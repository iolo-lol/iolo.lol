import { createServer, type Server } from "node:http";
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  renderChanges,
  renderCompare,
  renderHome,
  renderNotFound,
  renderOffers,
  renderSignalDetail,
  renderSignalHistory,
  renderSignalsIndex,
} from "./pages.js";
import { comparisonFromSignalsDir } from "./compare.js";
import { changesFromSignalsDir } from "./changes.js";
import { offersFromSignalsDir } from "./model-offers.js";
import { generateFeed, generateSitemap } from "./feed.js";

export const DEFAULT_SIGNALS_DIR = fileURLToPath(
  new URL("../../../data/signals", import.meta.url),
);

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

export interface HistoryEntry {
  publishedAt: string;
  result: SignalResult;
}

export interface HistoryDocument {
  schemaVersion: number;
  signalId: string;
  entries: HistoryEntry[];
}

export function signalIds(signalsDir: string): string[] {
  return readdirSync(signalsDir)
    .filter(
      (name) => name.endsWith(".json") && !name.endsWith(".history.json"),
    )
    .map((name) => name.replace(/\.json$/, ""))
    .sort();
}

export function loadSignal(signalsDir: string, signalId: string): SignalResult {
  const file = path.join(signalsDir, `${signalId}.json`);
  return JSON.parse(readFileSync(file, "utf8")) as SignalResult;
}

export function loadHistory(
  signalsDir: string,
  signalId: string,
): HistoryDocument {
  const file = path.join(signalsDir, `${signalId}.history.json`);
  return JSON.parse(readFileSync(file, "utf8")) as HistoryDocument;
}

function sendJson(
  res: {
    statusCode: number;
    setHeader(name: string, value: string): void;
    end(body: string): void;
  },
  status: number,
  body: unknown,
): void {
  const payload = JSON.stringify(body, null, 2);
  res.statusCode = status;
  res.setHeader("content-type", "application/json; charset=utf-8");
  res.end(payload);
}

function sendHtml(
  res: {
    statusCode: number;
    setHeader(name: string, value: string): void;
    end(body: string): void;
  },
  status: number,
  html: string,
): void {
  res.statusCode = status;
  res.setHeader("content-type", "text/html; charset=utf-8");
  res.end(html);
}

function sendText(
  res: {
    statusCode: number;
    setHeader(name: string, value: string): void;
    end(body: string): void;
  },
  status: number,
  body: string,
  contentType: string,
): void {
  res.statusCode = status;
  res.setHeader("content-type", contentType);
  res.end(body);
}

export function createApp(signalsDir: string): Server {
  return createServer((req, res) => {
    const url = new URL(req.url ?? "/", "http://localhost");
    const pathname = url.pathname;
    if (req.method !== "GET") {
      sendJson(res, 404, { error: `not found: ${req.method} ${pathname}` });
      return;
    }

    // Human-facing pages
    if (pathname === "/" || pathname === "/index.html") {
      sendHtml(res, 200, renderHome(signalsDir));
      return;
    }
    if (pathname === "/signals/" || pathname === "/signals/index.html") {
      sendHtml(res, 200, renderSignalsIndex(signalsDir));
      return;
    }
    if (pathname === "/changes/" || pathname === "/changes/index.html") {
      sendHtml(res, 200, renderChanges(signalsDir));
      return;
    }
    if (pathname === "/compare/" || pathname === "/compare/index.html") {
      sendHtml(res, 200, renderCompare(signalsDir));
      return;
    }
    if (pathname === "/offers/" || pathname === "/offers/index.html") {
      sendHtml(res, 200, renderOffers(signalsDir));
      return;
    }
    if (pathname === "/feed.xml") {
      sendText(
        res,
        200,
        generateFeed(signalsDir),
        "application/atom+xml; charset=utf-8",
      );
      return;
    }
    if (pathname === "/sitemap.xml") {
      sendText(
        res,
        200,
        generateSitemap(signalsDir),
        "application/xml; charset=utf-8",
      );
      return;
    }
    const detailMatch = pathname.match(/^\/signals\/([^/]+)\/$/);
    if (detailMatch) {
      const html = renderSignalDetail(signalsDir, detailMatch[1] ?? "");
      if (html) {
        sendHtml(res, 200, html);
      } else {
        sendHtml(res, 404, renderNotFound());
      }
      return;
    }
    const historyMatch = pathname.match(/^\/signals\/([^/]+)\/history\/$/);
    if (historyMatch) {
      const html = renderSignalHistory(signalsDir, historyMatch[1] ?? "");
      if (html) {
        sendHtml(res, 200, html);
      } else {
        sendHtml(res, 404, renderNotFound());
      }
      return;
    }

    // Machine API (unchanged)
    const signalMatch = pathname.match(/^\/api\/v1\/signals\/([^/]+)$/);
    const historyApiMatch = pathname.match(
      /^\/api\/v1\/signals\/([^/]+)\/history$/,
    );
    if (pathname === "/api/v1/comparisons/index.json") {
      sendJson(res, 200, comparisonFromSignalsDir(signalsDir));
      return;
    }
    if (pathname === "/api/v1/changes/index.json") {
      sendJson(res, 200, changesFromSignalsDir(signalsDir));
      return;
    }
    if (pathname === "/api/v1/model-offers/index.json") {
      sendJson(res, 200, offersFromSignalsDir(signalsDir));
      return;
    }
    if (pathname === "/api/v1/signals" || pathname === "/api/v1/signals.json") {
      sendJson(res, 200, { signals: signalIds(signalsDir) });
      return;
    }
    if (historyApiMatch) {
      const signalId = historyApiMatch[1] ?? "";
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
    sendHtml(res, 404, renderNotFound());
  });
}

export function start(signalsDir = DEFAULT_SIGNALS_DIR, port = 3000): Server {
  return createApp(signalsDir).listen(port, () => {
    console.log(`iolo.lol web listening on http://localhost:${port}`);
    console.log(`serving canonical signals from ${signalsDir}`);
  });
}

if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  const port = Number(process.env.PORT ?? 3000);
  start(DEFAULT_SIGNALS_DIR, port);
}
