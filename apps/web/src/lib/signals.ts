import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";

/**
 * Absolute path of the canonical published signal state (repo-root
 * `data/signals`), injected at build time by `svelte.config.js` /
 * `vitest.config.ts` (`__IOLO_SIGNALS_DIR__`). Resolved in the unbundled
 * config module so dev, build, preview, and tests all read the same
 * directory regardless of how the app modules are bundled.
 */
declare const __IOLO_SIGNALS_DIR__: string;

export const DEFAULT_SIGNALS_DIR: string = __IOLO_SIGNALS_DIR__;

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
