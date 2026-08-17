/**
 * Product-owned exact-model identity and provider-offer metadata (M10,
 * model-offers.v1 contract).
 *
 * This is a small curated mapping, NOT a universal model registry or
 * ontology: every canonical Signal is represented by exactly one identity
 * (model developer + exact model) carrying one or more provider offers (the
 * API provider/host and a provider-specific offer label). Exact equivalence
 * is recorded only where authoritative source identifiers support it — never
 * inferred from name similarity, family membership, or generation. In
 * particular, DeepSeek V4 Flash resolves to ONE identity with TWO offers
 * because the exact model identifier appears on both the DeepSeek first-party
 * pricing source and the DeepInfra pricing page; the dated
 * `DeepSeek-V4-Flash-0731` variant and all Flash/Pro/Max/family siblings are
 * deliberately NOT grouped (recorded in SPEC-11). M12 adds the same two-offer
 * shape to the four Claude identities (Fable 5, Opus 5, Sonnet 5, Haiku 4.5):
 * each exact model appears on both the Anthropic first-party source and the
 * DeepInfra pricing page; the `claude-sonnet-4-6` / `claude-opus-4-7` /
 * `claude-opus-4-8` variants are NOT grouped (same SPEC-11 exact-model rule).
 *
 * Canonical Signals remain the sole pricing truth source; this mapping only
 * carries identity/offer presentation state, and the derived offers document
 * is computed from canonical data at generation time.
 */

export interface ModelOfferMeta {
  /** The canonical Signal id that prices this offer. */
  signalId: string;
  /** API provider/host, e.g. "DeepSeek" or "DeepInfra". */
  provider: string;
  /** Provider-specific offer label, e.g. "DeepSeek first-party API". */
  offer: string;
}

export interface ModelIdentityMeta {
  /** Stable exact-model identity id (authoritative model identifier). */
  id: string;
  /** Display name of the exact model. */
  name: string;
  /** Model developer; differs from the provider for hosted models. */
  developer: string;
  offers: ModelOfferMeta[];
}

export const MODEL_IDENTITIES: ModelIdentityMeta[] = [
  {
    id: "gemini-3.7-flash",
    name: "Gemini 3.7 Flash",
    developer: "Google",
    offers: [
      {
        signalId: "gemini-3.7-flash-usage-rates",
        provider: "Google",
        offer: "Google AI Studio / Gemini API",
      },
    ],
  },
  {
    id: "deepseek-v4-flash",
    name: "DeepSeek V4 Flash",
    developer: "DeepSeek",
    offers: [
      {
        signalId: "deepseek-v4-flash-usage-rates",
        provider: "DeepSeek",
        offer: "DeepSeek first-party API",
      },
      {
        signalId: "deepinfra-deepseek-v4-flash-usage-rates",
        provider: "DeepInfra",
        offer: "DeepInfra hosted",
      },
    ],
  },
  {
    id: "grok-4.6",
    name: "Grok 4.6",
    developer: "xAI",
    offers: [
      { signalId: "xai-grok-4.6-usage-rates", provider: "xAI", offer: "xAI API" },
    ],
  },
  {
    id: "command-r-plus-08-2024",
    name: "Command R+ 08-2024",
    developer: "Cohere",
    offers: [
      {
        signalId: "cohere-command-r-plus-08-2024-usage-rates",
        provider: "Cohere",
        offer: "Cohere API",
      },
    ],
  },
  {
    id: "qwen3.8-2.4t-a95b",
    name: "Qwen3.8-2.4T-A95B",
    developer: "Alibaba Cloud Qwen",
    offers: [
      {
        signalId: "together-qwen3.8-2.4t-a95b-usage-rates",
        provider: "Together AI",
        offer: "Together AI hosted",
      },
    ],
  },
  {
    id: "gpt-5.6-sol",
    name: "GPT-5.6 Sol",
    developer: "OpenAI",
    offers: [
      {
        signalId: "openai-gpt-5.6-sol-usage-rates",
        provider: "OpenAI",
        offer: "OpenAI API",
      },
    ],
  },
  {
    id: "gpt-5.6-terra",
    name: "GPT-5.6 Terra",
    developer: "OpenAI",
    offers: [
      {
        signalId: "openai-gpt-5.6-terra-usage-rates",
        provider: "OpenAI",
        offer: "OpenAI API",
      },
    ],
  },
  {
    id: "gpt-5.6-luna",
    name: "GPT-5.6 Luna",
    developer: "OpenAI",
    offers: [
      {
        signalId: "openai-gpt-5.6-luna-usage-rates",
        provider: "OpenAI",
        offer: "OpenAI API",
      },
    ],
  },
  {
    id: "kimi-k3",
    name: "Kimi-K3",
    developer: "Moonshot AI",
    offers: [
      {
        signalId: "deepinfra-kimi-k3-usage-rates",
        provider: "DeepInfra",
        offer: "DeepInfra hosted",
      },
    ],
  },
  {
    id: "deepseek-v4-pro",
    name: "DeepSeek-V4-Pro",
    developer: "DeepSeek",
    offers: [
      {
        signalId: "deepinfra-deepseek-v4-pro-usage-rates",
        provider: "DeepInfra",
        offer: "DeepInfra hosted",
      },
    ],
  },
  {
    id: "qwen3.8-max",
    name: "Qwen3.8-Max",
    developer: "Alibaba Cloud Qwen",
    offers: [
      {
        signalId: "deepinfra-qwen3.8-max-usage-rates",
        provider: "DeepInfra",
        offer: "DeepInfra hosted",
      },
    ],
  },
  {
    id: "fable-5",
    name: "Fable 5",
    developer: "Anthropic",
    offers: [
      {
        signalId: "anthropic-fable-5-usage-rates",
        provider: "Anthropic",
        offer: "Anthropic API",
      },
      {
        signalId: "deepinfra-claude-fable-5-usage-rates",
        provider: "DeepInfra",
        offer: "DeepInfra hosted",
      },
    ],
  },
  {
    id: "opus-5",
    name: "Opus 5",
    developer: "Anthropic",
    offers: [
      {
        signalId: "anthropic-opus-5-usage-rates",
        provider: "Anthropic",
        offer: "Anthropic API",
      },
      {
        signalId: "deepinfra-claude-opus-5-usage-rates",
        provider: "DeepInfra",
        offer: "DeepInfra hosted",
      },
    ],
  },
  {
    id: "sonnet-5",
    name: "Sonnet 5",
    developer: "Anthropic",
    offers: [
      {
        signalId: "anthropic-sonnet-5-usage-rates",
        provider: "Anthropic",
        offer: "Anthropic API",
      },
      {
        signalId: "deepinfra-claude-sonnet-5-usage-rates",
        provider: "DeepInfra",
        offer: "DeepInfra hosted",
      },
    ],
  },
  {
    id: "haiku-4.5",
    name: "Haiku 4.5",
    developer: "Anthropic",
    offers: [
      {
        signalId: "anthropic-haiku-4.5-usage-rates",
        provider: "Anthropic",
        offer: "Anthropic API",
      },
      {
        signalId: "deepinfra-claude-haiku-4-5-usage-rates",
        provider: "DeepInfra",
        offer: "DeepInfra hosted",
      },
    ],
  },
  {
    id: "sonar",
    name: "Sonar",
    developer: "Perplexity",
    offers: [
      {
        signalId: "perplexity-sonar-usage-rates",
        provider: "Perplexity",
        offer: "Perplexity API",
      },
    ],
  },
  {
    id: "sonar-pro",
    name: "Sonar Pro",
    developer: "Perplexity",
    offers: [
      {
        signalId: "perplexity-sonar-pro-usage-rates",
        provider: "Perplexity",
        offer: "Perplexity API",
      },
    ],
  },
  {
    id: "sonar-reasoning-pro",
    name: "Sonar Reasoning Pro",
    developer: "Perplexity",
    offers: [
      {
        signalId: "perplexity-sonar-reasoning-pro-usage-rates",
        provider: "Perplexity",
        offer: "Perplexity API",
      },
    ],
  },
  {
    id: "sonar-deep-research",
    name: "Sonar Deep Research",
    developer: "Perplexity",
    offers: [
      {
        signalId: "perplexity-sonar-deep-research-usage-rates",
        provider: "Perplexity",
        offer: "Perplexity API",
      },
    ],
  },
];

const IDENTITY_BY_SIGNAL: Record<string, ModelIdentityMeta> = Object.fromEntries(
  MODEL_IDENTITIES.flatMap((identity) =>
    identity.offers.map((offer) => [offer.signalId, identity]),
  ),
);

/** The exact-model identity a canonical Signal belongs to. */
export function identityForSignal(signalId: string): ModelIdentityMeta {
  const identity = IDENTITY_BY_SIGNAL[signalId];
  if (!identity) {
    throw new Error(`model-offers: no identity mapping for signal ${signalId}`);
  }
  return identity;
}

/** True when every current canonical Signal has exactly one identity mapping. */
export function identityForEverySignal(signalIds: string[]): boolean {
  return signalIds.every((id) => IDENTITY_BY_SIGNAL[id] !== undefined);
}
