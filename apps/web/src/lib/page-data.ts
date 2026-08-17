import { loadHistory, type HistoryDocument } from "./signals.js";
import { changesFromSignalsDir, type ChangeRecord } from "./changes.js";

/** True when a canonical history document exists for the signal. */
export function historyExists(signalsDir: string, signalId: string): boolean {
  try {
    loadHistory(signalsDir, signalId);
    return true;
  } catch {
    return false;
  }
}

/** The most recent publishedAt across the signal's history, if any. */
export function lastPublishedAt(
  signalsDir: string,
  signalId: string,
): string | undefined {
  try {
    const doc = loadHistory(signalsDir, signalId) as HistoryDocument;
    return doc.entries.at(-1)?.publishedAt;
  } catch {
    return undefined;
  }
}

/**
 * Most recent change records from the shared changes projection: observed
 * records newest-first, then upcoming records (which have no publication
 * time), capped at `limit`.
 */
export function recentChangeRecords(
  signalsDir: string,
  limit: number,
): ChangeRecord[] {
  const doc = changesFromSignalsDir(signalsDir);
  const observed = doc.records
    .filter((r) => r.kind === "observed")
    .sort((a, b) =>
      (a.publishedAt ?? "") < (b.publishedAt ?? "") ? 1 : -1,
    );
  const upcoming = doc.records.filter((r) => r.kind === "upcoming");
  return [...observed, ...upcoming].slice(0, limit);
}
