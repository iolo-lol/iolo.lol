import { valueLabel } from "./meta.js";
import {
  MODEL_IDENTITIES,
  identityForSignal,
  type ModelIdentityMeta,
} from "./model-identity.js";
import {
  loadSignal,
  signalIds,
  type SignalResult,
} from "./server.js";

/**
 * Exact-model provider-offer projection (`model-offers.v1`, see
 * `packages/contracts/schemas/model-offers.v1.schema.json`).
 *
 * A pure, deterministic function of the canonical Signal set plus the
 * product-owned identity metadata: one `group` per exact model identity
 * (identityId, name, developer) with every authoritative provider offer
 * (provider, offer label, source provenance, observedAt, and the offer's
 * pricing dimensions with conditional statements preserved verbatim).
 * Offers whose canonical Signal is absent are skipped, so the document is
 * always consistent with the published canonical set. Canonical Signals
 * remain the sole pricing truth source; this document is derived at
 * generation time and is never a copied price datastore.
 */

export interface OfferDimension {
  name: string;
  label: string;
  unit: string;
  currency: string;
  statements: { value: number; note: string }[];
}

export interface ModelOffer {
  signalId: string;
  provider: string;
  offer: string;
  source: { url: string; fetchedAt: string; contentHash: string };
  observedAt: string;
  dimensions: OfferDimension[];
}

export interface ModelOfferGroup {
  identityId: string;
  name: string;
  developer: string;
  offers: ModelOffer[];
}

export interface ModelOffersDocument {
  schemaVersion: 1;
  groups: ModelOfferGroup[];
}

function offerDimensions(signal: SignalResult): OfferDimension[] {
  return [...signal.values]
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((value) => ({
      name: value.name,
      label: valueLabel(signal.signalId, value.name),
      unit: value.unit,
      currency: value.currency,
      statements: value.statements.map((s) => ({ value: s.value, note: s.note })),
    }));
}

function buildOffer(signal: SignalResult, meta: ModelIdentityMeta): ModelOffer {
  const offerMeta = meta.offers.find((o) => o.signalId === signal.signalId);
  if (!offerMeta) {
    throw new Error(
      `model-offers: signal ${signal.signalId} not listed in identity ${meta.id}`,
    );
  }
  return {
    signalId: signal.signalId,
    provider: offerMeta.provider,
    offer: offerMeta.offer,
    source: {
      url: signal.source.url,
      fetchedAt: signal.source.fetchedAt,
      contentHash: signal.source.contentHash,
    },
    observedAt: signal.observedAt,
    dimensions: offerDimensions(signal),
  };
}

/**
 * Pure projection: group the given canonical Signals by exact model identity
 * (identity-mapping order, which is deterministic) and attach every
 * authoritative offer whose canonical Signal is present.
 */
export function buildModelOffers(signals: SignalResult[]): ModelOffersDocument {
  const byId = new Map(signals.map((s) => [s.signalId, s]));
  const groups: ModelOfferGroup[] = [];
  for (const identity of MODEL_IDENTITIES) {
    const offers: ModelOffer[] = [];
    for (const offerMeta of identity.offers) {
      const signal = byId.get(offerMeta.signalId);
      if (!signal) continue; // offer's canonical Signal not published yet
      offers.push(buildOffer(signal, identity));
    }
    if (offers.length === 0) continue;
    groups.push({
      identityId: identity.id,
      name: identity.name,
      developer: identity.developer,
      offers,
    });
  }
  return { schemaVersion: 1, groups };
}

/** Load every canonical Signal from a signals directory and project it. */
export function offersFromSignalsDir(signalsDir: string): ModelOffersDocument {
  const signals = signalIds(signalsDir).map(
    (id) => loadSignal(signalsDir, id) as SignalResult,
  );
  return buildModelOffers(signals);
}

export { identityForSignal };
