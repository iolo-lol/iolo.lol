/**
 * Product-owned presentation metadata: human-readable names for Signals and
 * their value fields. This is presentation state only — it never enters
 * canonical data or public contracts. The renderer applies labels
 * generically; a Signal without an entry falls back to its id.
 */
export interface SignalMeta {
  /** Human-readable title, for example "Gemini 3.7 Flash usage rates". */
  title: string;
  /** Provider/product label, for example "Google". */
  provider: string;
  /** Human-readable model label, for example "Gemini 3.7 Flash". */
  model: string;
  /** One-sentence description for index and detail pages. */
  description: string;
  /** Human-readable label per normalized value name. */
  valueLabels: Record<string, string>;
}

export const SIGNAL_META: Record<string, SignalMeta> = {
  "gemini-3.7-flash-usage-rates": {
    title: "Gemini 3.7 Flash usage rates",
    provider: "Google",
    model: "Gemini 3.7 Flash",
    description:
      "Usage rates for the Gemini 3.7 Flash model from Google AI Studio, per 1 million tokens.",
    valueLabels: {
      "input-price": "Input price",
      "output-price": "Output price",
    },
  },
  "deepseek-v4-flash-usage-rates": {
    title: "DeepSeek V4 Flash usage rates",
    provider: "DeepSeek",
    model: "DeepSeek V4 Flash",
    description:
      "Usage rates for the DeepSeek V4 Flash model from the DeepSeek API, per 1 million tokens.",
    valueLabels: {
      "input-price-cache-hit": "Input price (cache hit)",
      "input-price-cache-miss": "Input price (cache miss)",
      "output-price": "Output price",
    },
  },
  "xai-grok-4.6-usage-rates": {
    title: "Grok 4.6 usage rates",
    provider: "xAI",
    model: "Grok 4.6",
    description:
      "Usage rates for the Grok 4.6 model from the xAI API, per 1 million tokens.",
    valueLabels: {
      "input-price": "Input price",
      "output-price": "Output price",
    },
  },
  "cohere-command-r-plus-08-2024-usage-rates": {
    title: "Command R+ 08-2024 usage rates",
    provider: "Cohere",
    model: "Command R+ 08-2024",
    description:
      "Usage rates for the Command R+ 08-2024 model from the Cohere API, per 1 million tokens.",
    valueLabels: {
      "input-price": "Input price",
      "output-price": "Output price",
    },
  },
  "together-qwen3.8-2.4t-a95b-usage-rates": {
    title: "Qwen3.8-2.4T-A95B usage rates",
    provider: "Together AI",
    model: "Qwen3.8-2.4T-A95B",
    description:
      "Usage rates for the Qwen3.8-2.4T-A95B model from the Together AI API, per 1 million tokens.",
    valueLabels: {
      "input-price": "Input price",
      "input-price-cache-hit": "Input price (cache hit)",
      "output-price": "Output price",
    },
  },
  "openai-gpt-5.6-sol-usage-rates": {
    title: "GPT-5.6 Sol usage rates",
    provider: "OpenAI",
    model: "GPT-5.6 Sol",
    description:
      "Usage rates for the GPT-5.6 Sol model from the OpenAI API, per 1 million tokens.",
    valueLabels: {
      "input-price": "Input price",
      "input-price-cache-hit": "Input price (cache hit)",
      "cache-writes": "Cache writes",
      "output-price": "Output price",
      "input-price-long-context": "Input price (long context)",
      "input-price-long-context-cache-hit": "Input price (cache hit, long context)",
      "cache-writes-long-context": "Cache writes (long context)",
      "output-price-long-context": "Output price (long context)",
    },
  },
  "deepinfra-kimi-k3-usage-rates": {
    title: "Kimi-K3 usage rates",
    provider: "DeepInfra",
    model: "Kimi-K3",
    description:
      "Usage rates for the Kimi-K3 model (Moonshot AI) from the DeepInfra API, per 1 million tokens.",
    valueLabels: {
      "input-price": "Input price",
      "input-price-cache-hit": "Input price (cache hit)",
      "output-price": "Output price",
    },
  },
};

export function signalMeta(signalId: string): SignalMeta {
  return (
    SIGNAL_META[signalId] ?? {
      title: signalId,
      provider: "",
      model: signalId,
      description: "",
      valueLabels: {},
    }
  );
}

export function valueLabel(signalId: string, name: string): string {
  return signalMeta(signalId).valueLabels[name] ?? name;
}

export function unitLabel(unit: string): string {
  switch (unit) {
    case "per-1m-tokens":
      return "per 1M tokens";
    default:
      return unit;
  }
}

/** Readable fixed-width UTC rendering, deterministic across machines. */
export function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  const pad = (n: number) => String(n).padStart(2, "0");
  const month = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ][date.getUTCMonth()];
  return `${date.getUTCDate()} ${month} ${date.getUTCFullYear()}, ${pad(
    date.getUTCHours(),
  )}:${pad(date.getUTCMinutes())} UTC`;
}

export function formatDateShort(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  const month = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ][date.getUTCMonth()];
  return `${date.getUTCDate()} ${month} ${date.getUTCFullYear()}`;
}

/** Rate number without forced precision or trailing zeros. */
export function formatNumber(value: number): string {
  if (Number.isInteger(value)) return String(value);
  return String(Number(value.toPrecision(4)));
}
