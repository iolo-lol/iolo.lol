import { signalMeta, valueLabel } from "./meta.js";
import {
  loadHistory,
  loadSignal,
  signalIds,
  type HistoryDocument,
  type SignalResult,
} from "./server.js";

/**
 * Pricing-change projection contract (`changes.v1`, see
 * `packages/contracts/schemas/changes.v1.schema.json`).
 *
 * A pure, deterministic function of the canonical Signal current/history data
 * plus static product-owned labels. Two rules bound every emitted record:
 *
 * - **Observed records** exist only where consecutive published snapshots
 *   differ *materially* — compared per dimension as a multiset of
 *   (value, note) pairs, so identical snapshots and statement/order-only
 *   serialization differences emit nothing.
 * - **Upcoming records** exist only where a source statement's verbatim note
 *   explicitly declares a future-effective time ("starting January 1, 2027.",
 *   "from 16:00 UTC on August 16, 2026"). A concurrent condition such as
 *   Together's "cached" rate is never a change. `effectiveAt` is included
 *   only when the note normalizes safely to a full UTC instant; otherwise the
 *   verbatim note is kept without a parsed timestamp.
 *
 * No generated timestamp is added; records are sorted deterministically
 * (observed first by publishedAt, then upcoming by signalId), so two runs
 * over the same canonical data produce byte-identical documents.
 */

export interface ChangeStatement {
  value: number;
  note: string;
}

export type ChangeKind = "observed" | "upcoming";

export interface ChangeDimension {
  name: string;
  label: string;
  unit: string;
  currency: string;
  /** Statements before the change, in canonical order. */
  before: ChangeStatement[];
  /** Statements after the change, in canonical order (conditional values are never flattened). */
  after: ChangeStatement[];
}

export interface ChangeRecord {
  signalId: string;
  provider: string;
  model: string;
  kind: ChangeKind;
  /** When the later snapshot of an observed change was observed. */
  observedAt?: string;
  /** When the later snapshot of an observed change was published. */
  publishedAt?: string;
  /** Effective time of an upcoming change, only when it normalizes safely from the verbatim source note. */
  effectiveAt?: string;
  source: { url: string; fetchedAt: string; contentHash: string };
  dimension: ChangeDimension;
}

export interface ChangesDocument {
  schemaVersion: 1;
  records: ChangeRecord[];
}

interface SignalInput {
  signal: SignalResult;
  history?: HistoryDocument;
}

/** Notes that explicitly declare a future-effective time in the source wording. */
const FUTURE_EFFECTIVE_PATTERNS: RegExp[] = [
  // "starting January 1, 2027."
  /starting\s+[A-Z][a-z]+\s+\d{1,2},\s+\d{4}\.?/,
  // "... from 16:00 UTC on August 16, 2026"
  /from\s+\d{1,2}:\d{2}\s+UTC\s+on\s+[A-Z][a-z]+\s+\d{1,2},\s+\d{4}/,
];

export function isFutureEffectiveNote(note: string): boolean {
  return FUTURE_EFFECTIVE_PATTERNS.some((pattern) => pattern.test(note));
}

const MONTHS: Record<string, number> = {
  january: 1, february: 2, march: 3, april: 4, may: 5, june: 6,
  july: 7, august: 8, september: 9, october: 10, november: 11, december: 12,
};

const EFFECTIVE_FROM_PATTERN =
  /from\s+(\d{1,2}):(\d{2})\s+UTC\s+on\s+([A-Z][a-z]+)\s+(\d{1,2}),\s+(\d{4})/;

/**
 * Normalize an explicit "… from HH:MM UTC on <Month> <D>, <YYYY>" note to a
 * full UTC instant. Date-only future notes ("starting January 1, 2027.")
 * carry no safe instant and yield undefined — the verbatim note keeps them
 * unambiguous.
 */
export function parseEffectiveAt(note: string): string | undefined {
  const match = note.match(EFFECTIVE_FROM_PATTERN);
  if (!match) return undefined;
  const hours = match[1]!;
  const minutes = match[2]!;
  const monthName = match[3]!;
  const day = match[4]!;
  const year = match[5]!;
  const month = MONTHS[monthName.toLowerCase()];
  if (!month) return undefined;
  const h = Number(hours);
  const m = Number(minutes);
  const d = Number(day);
  const y = Number(year);
  if (h > 23 || m > 59 || d < 1 || d > 31 || y < 2000) return undefined;
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${y}-${pad(month)}-${pad(d)}T${pad(h)}:${pad(m)}:00Z`;
}

/** Canonical multiset key of a statement list; order-insensitive. */
function materialKey(statements: ChangeStatement[]): string {
  return [...statements]
    .sort((a, b) =>
      a.value !== b.value
        ? a.value - b.value
        : a.note < b.note
          ? -1
          : a.note > b.note
            ? 1
            : 0,
    )
    .map((s) => `${s.value}||${s.note}`)
    .join("\n");
}

function upcomingRecords(signal: SignalResult): ChangeRecord[] {
  const meta = signalMeta(signal.signalId);
  const records: ChangeRecord[] = [];
  for (const value of signal.values) {
    const before = value.statements.filter((s) => !isFutureEffectiveNote(s.note));
    const after = value.statements.filter((s) => isFutureEffectiveNote(s.note));
    if (after.length === 0) continue;
    records.push({
      signalId: signal.signalId,
      provider: meta.provider,
      model: meta.model,
      kind: "upcoming",
      effectiveAt: parseEffectiveAt(after[0]!.note),
      source: signal.source,
      dimension: {
        name: value.name,
        label: valueLabel(signal.signalId, value.name),
        unit: value.unit,
        currency: value.currency,
        before,
        after,
      },
    });
  }
  return records;
}

function observedRecords(
  signal: SignalResult,
  history: HistoryDocument,
): ChangeRecord[] {
  const meta = signalMeta(signal.signalId);
  const chronological = [...history.entries].sort((a, b) =>
    a.publishedAt < b.publishedAt ? -1 : a.publishedAt > b.publishedAt ? 1 : 0,
  );
  const records: ChangeRecord[] = [];
  for (let i = 1; i < chronological.length; i++) {
    const prev = chronological[i - 1]!;
    const next = chronological[i]!;
    const prevValues = new Map(prev.result.values.map((v) => [v.name, v]));
    const nextValues = new Map(next.result.values.map((v) => [v.name, v]));
    const dimensionNames = [
      ...new Set([...prevValues.keys(), ...nextValues.keys()]),
    ].sort();
    for (const name of dimensionNames) {
      const prevValue = prevValues.get(name);
      const nextValue = nextValues.get(name);
      const before = prevValue ? prevValue.statements : [];
      const after = nextValue ? nextValue.statements : [];
      if (materialKey(before) === materialKey(after)) continue;
      records.push({
        signalId: signal.signalId,
        provider: meta.provider,
        model: meta.model,
        kind: "observed",
        observedAt: next.result.observedAt,
        publishedAt: next.publishedAt,
        source: next.result.source,
        dimension: {
          name,
          label: valueLabel(signal.signalId, name),
          unit: nextValue?.unit ?? prevValue?.unit ?? "per-1m-tokens",
          currency: nextValue?.currency ?? prevValue?.currency ?? "USD",
          before,
          after,
        },
      });
    }
  }
  return records;
}

const KIND_RANK: Record<ChangeKind, number> = { observed: 0, upcoming: 1 };

function compareRecords(a: ChangeRecord, b: ChangeRecord): number {
  if (a.kind !== b.kind) return KIND_RANK[a.kind] - KIND_RANK[b.kind];
  if (a.kind === "observed") {
    const pa = a.publishedAt ?? "";
    const pb = b.publishedAt ?? "";
    if (pa !== pb) return pa < pb ? -1 : 1;
  }
  if (a.signalId !== b.signalId) {
    return a.signalId < b.signalId ? -1 : 1;
  }
  const da = a.dimension.name;
  const db = b.dimension.name;
  return da < db ? -1 : da > db ? 1 : 0;
}

/**
 * Pure projection: observed records from material snapshot diffs, upcoming
 * records from future-effective statements, deterministically ordered.
 */
export function buildChanges(inputs: SignalInput[]): ChangesDocument {
  const records: ChangeRecord[] = [];
  for (const { signal, history } of inputs) {
    records.push(...upcomingRecords(signal));
    if (history) records.push(...observedRecords(signal, history));
  }
  records.sort(compareRecords);
  return { schemaVersion: 1, records };
}

/** Load every canonical Signal (current + history) and project it. */
export function changesFromSignalsDir(signalsDir: string): ChangesDocument {
  const ids = signalIds(signalsDir);
  const inputs: SignalInput[] = ids.map((id) => {
    let history: HistoryDocument | undefined;
    try {
      history = loadHistory(signalsDir, id) as HistoryDocument;
    } catch {
      history = undefined;
    }
    return { signal: loadSignal(signalsDir, id) as SignalResult, history };
  });
  return buildChanges(inputs);
}
