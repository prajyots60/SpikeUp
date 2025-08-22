// Provider and Model Configuration for AI Assistants

export type ProviderType = "openai" | "anthropic" | "google" | "groq";

export interface ModelOption {
  value: string;
  label: string;
  description?: string;
}

export interface ProviderConfig {
  value: ProviderType;
  label: string;
  models: ModelOption[];
  description?: string;
}

export const PROVIDERS_CONFIG: ProviderConfig[] = [
  {
    value: "openai",
    label: "OpenAI",
    models: [
      {
        value: "gpt-4o",
        label: "GPT-4o",
        description: "500ms • $0.05",
      },
      {
        value: "gpt-3.5-turbo",
        label: "GPT 3.5 Turbo",
        description: "350ms • $0.01",
      },
      {
        value: "gpt-4.1",
        label: "GPT 4.1",
        description: "700ms • $0.06",
      },
      {
        value: "gpt-4.1-mini",
        label: "GPT 4.1 Mini",
        description: "770ms • $0.01",
      },
      {
        value: "gpt-4.1-nano",
        label: "GPT 4.1 Nano",
        description: "510ms • $0.01 • Cheapest",
      },
      {
        value: "gpt-4o-mini",
        label: "GPT 4o Mini",
        description: "390ms • $0.01 • Fastest",
      },
    ],
  },
  {
    value: "anthropic",
    label: "Anthropic",
    models: [
      {
        value: "claude-sonnet-4-20250514",
        label: "Claude Sonnet 4",
        description: "1000ms • $0.10",
      },
      {
        value: "claude-opus-4-20250514",
        label: "Claude Opus 4",
        description: "1000ms • $0.10",
      },
      {
        value: "claude-3-7-sonnet-20250219",
        label: "Claude 3.7 Sonnet",
        description: "1000ms • $0.10",
      },
      {
        value: "claude-3-5-sonnet-20241022",
        label: "Claude 3.5 Sonnet",
        description: "1000ms • $0.10",
      },
      {
        value: "claude-3-5-haiku-20241022",
        label: "Claude 3.5 Haiku",
        description: "1000ms • $0.10",
      },
      {
        value: "claude-3-opus-20240229",
        label: "Claude 3 Opus",
        description: "1000ms • $0.10",
      },
    ],
  },
  {
    value: "google",
    label: "Google",
    models: [
      {
        value: "gemini-2.5-pro",
        label: "Gemini 2.5 Pro",
        description: "1000ms • $0.10",
      },
      {
        value: "gemini-2.5-flash",
        label: "Gemini 2.5 Flash",
        description: "1000ms • $0.10",
      },
      {
        value: "gemini-2.5-flash-lite",
        label: "Gemini 2.5 Flash Lite",
        description: "1000ms • $0.10",
      },
      {
        value: "gemini-2.0-flash",
        label: "Gemini 2.0 Flash",
        description: "1000ms • $0.10",
      },
    ],
  },
  {
    value: "groq",
    label: "Groq",
    models: [
      {
        value: "openai/gpt-oss-20b",
        label: "GPT OSS 20B",
        description: "280ms • $0.01",
      },
      {
        value: "openai/gpt-oss-120b",
        label: "GPT OSS 120B",
        description: "280ms • $0.03",
      },
      {
        value: "deepseek-r1-distill-llama-70b",
        label: "deepseek-r1-distill-llama-70b",
        description: "600ms • $0.02",
      },
      {
        value: "llama-3.3-70b-versatile",
        label: "llama-3.3-70b-versatile",
        description: "600ms • $0.02",
      },
      {
        value: "llama-3.1-8b-instant",
        label: "llama-3.1-8b-Instant",
        description: "300ms • $0.00 • Fastest • Cheapest",
      },
      {
        value: "llama3-8b-8192",
        label: "llama3-8b-8192",
        description: "300ms • $0.00 • Fastest • Cheapest",
      },
    ],
  },
];

// Helper function to get models for a specific provider
export const getModelsForProvider = (provider: ProviderType): ModelOption[] => {
  const providerConfig = PROVIDERS_CONFIG.find((p) => p.value === provider);
  return providerConfig?.models || [];
};

// Helper function to get provider config
export const getProviderConfig = (
  provider: ProviderType
): ProviderConfig | undefined => {
  return PROVIDERS_CONFIG.find((p) => p.value === provider);
};

// Default selections
export const DEFAULT_PROVIDER: ProviderType = "openai";
export const DEFAULT_MODEL = "gpt-4o";
