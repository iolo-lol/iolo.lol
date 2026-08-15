import { signalMeta, valueLabel } from "./meta.js";
import { loadSignal, signalIds, type SignalResult } from "./server.js";

/**
 * Comparison projection contract (`comparison.v1`, see
 * `packages/contracts/schemas/comparison.v1.schema.json`).
 *
 * The projection is a pure, deterministic function of the canonical
 * SignalResult set plus static product-owned labels: entries are sorted by
 * signalId, dimensions by name, statements are preserved verbatim in
 * canonical reading order, and no timestamp is added. Two runs over the same
 * canonical data therefore produce byte-identical documents, and conditional
 * pricing (cache hit/miss, peak/off-peak, temporary/future-effective rates)
 * is never flattened to a single unqualified value.
 */

export interface ComparisonStatement {
  value: number;
  note: string;
}

export interface ComparisonDimension {
  name: string;
  label: string;
  unit: string;
  currency: string;
  statements: ComparisonStatement[];
}

export interface ComparisonEntry {
  signalId: string;
  provider: string;
  model: string;
  source: { url: string; fetchedAt: string; contentHash: string };
  observedAt: string;
  dimensions: ComparisonDimension[];
}

export interface ComparisonDocument {
  schemaVersion: 1;
  entries: ComparisonEntry[];
}

export function buildComparison(signals: SignalResult[]): ComparisonDocument {
  const entries: ComparisonEntry[] = [...signals]
    .sort((a, b) => a.signalId.localeCompare(b.signalId))
    .map((signal) => {
      const meta = signalMeta(signal.signalId);
      return {
        signalId: signal.signalId,
        provider: meta.provider,
        model: meta.model,
        source: {
          url: signal.source.url,
          fetchedAt: signal.source.fetchedAt,
          contentHash: signal.source.contentHash,
        },
        observedAt: signal.observedAt,
        dimensions: [...signal.values]
          .sort((a, b) => a.name.localeCompare(b.name))
          .map((value) => ({
            name: value.name,
            label: valueLabel(signal.signalId, value.name),
            unit: value.unit,
            currency: value.currency,
            statements: value.statements.map((statement) => ({
              value: statement.value,
              note: statement.note,
            })),
          })),
      };
    });
  return { schemaVersion: 1, entries };
}

/** Load every canonical Signal from a signals directory and project it. */
export function comparisonFromSignalsDir(signalsDir: string): ComparisonDocument {
  const ids = signalIds(signalsDir);
  const signals = ids.map((id) => loadSignal(signalsDir, id) as SignalResult);
  return buildComparison(signals);
}
