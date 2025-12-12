/**
 * LLM Provider Service
 * Supports both local Mistral (via Ollama) and Claude API
 */

export interface LLMMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface LLMResponse {
  content: string;
  model: string;
  provider: "ollama" | "claude";
}

export interface LLMConfig {
  provider: "ollama" | "claude";
  model: string;
  apiKey?: string; // Only for Claude
  baseUrl?: string; // For Ollama, defaults to localhost:11434
}

// Default configurations
export const DEFAULT_CONFIGS = {
  ollama: {
    provider: "ollama" as const,
    model: "mistral:latest",
    baseUrl: "http://localhost:11434",
  },
  claude: {
    provider: "claude" as const,
    model: "claude-sonnet-4-20250514",
  },
};

/**
 * Ollama provider for local LLM (Mistral, etc)
 */
async function callOllama(
  messages: LLMMessage[],
  config: LLMConfig
): Promise<LLMResponse> {
  const baseUrl = config.baseUrl || "http://localhost:11434";

  // Convert messages to Ollama format
  const prompt = messages
    .map((m) => {
      if (m.role === "system") return `System: ${m.content}`;
      if (m.role === "user") return `User: ${m.content}`;
      return `Assistant: ${m.content}`;
    })
    .join("\n\n");

  const response = await fetch(`${baseUrl}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: config.model,
      prompt,
      stream: false,
    }),
  });

  if (!response.ok) {
    throw new Error(`Ollama error: ${response.statusText}`);
  }

  const data = await response.json();

  return {
    content: data.response,
    model: config.model,
    provider: "ollama",
  };
}

/**
 * Claude provider for Anthropic API
 */
async function callClaude(
  messages: LLMMessage[],
  config: LLMConfig
): Promise<LLMResponse> {
  if (!config.apiKey) {
    throw new Error("Claude API key required");
  }

  // Extract system message
  const systemMessage = messages.find((m) => m.role === "system");
  const chatMessages = messages
    .filter((m) => m.role !== "system")
    .map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    }));

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": config.apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: config.model,
      max_tokens: 4096,
      system: systemMessage?.content,
      messages: chatMessages,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Claude error: ${error}`);
  }

  const data = await response.json();

  return {
    content: data.content[0].text,
    model: config.model,
    provider: "claude",
  };
}

/**
 * Main LLM completion function
 */
export async function complete(
  messages: LLMMessage[],
  config: LLMConfig
): Promise<LLMResponse> {
  if (config.provider === "ollama") {
    return callOllama(messages, config);
  } else {
    return callClaude(messages, config);
  }
}

/**
 * Check if Ollama is running locally
 */
export async function checkOllamaHealth(
  baseUrl = "http://localhost:11434"
): Promise<boolean> {
  try {
    const response = await fetch(`${baseUrl}/api/tags`);
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * List available Ollama models
 */
export async function listOllamaModels(
  baseUrl = "http://localhost:11434"
): Promise<string[]> {
  try {
    const response = await fetch(`${baseUrl}/api/tags`);
    if (!response.ok) return [];
    const data = await response.json();
    return data.models?.map((m: { name: string }) => m.name) || [];
  } catch {
    return [];
  }
}

// ===========================================
// LEGAL-SPECIFIC PROMPTS
// ===========================================

export const LEGAL_PROMPTS = {
  analyzeDocument: `You are a legal document analyst. Analyze the following legal document and extract:
1. All factual claims with specific dates
2. Legal arguments being made
3. Weaknesses or contradictions
4. Timeline of events mentioned
5. Key exhibits referenced

Be precise and cite specific paragraphs where relevant.`,

  generateAffirmation: `You are a legal document drafter. Create a professional affirmation/affidavit based on the provided facts. Follow proper legal formatting with:
- Numbered paragraphs
- Proper legal terminology
- Clear chronological structure
- Exhibit references where appropriate`,

  extractTimeline: `Extract all dates and events from this legal document. Format as:
DATE | EVENT | SOURCE (paragraph/exhibit)

Sort chronologically.`,

  identifyArguments: `Identify all legal arguments in this document. For each argument:
1. State the claim
2. Identify supporting evidence
3. Rate strength (strong/medium/weak)
4. Suggest counter-arguments`,

  generateSubmission: `You are drafting written submissions for court. Structure as:
1. Introduction (brief overview)
2. Facts (key facts only)
3. Legal Framework (relevant law)
4. Arguments (numbered, clear)
5. Conclusion (specific relief sought)

Be persuasive but objective.`,
};

/**
 * Analyze a legal document
 */
export async function analyzeDocument(
  documentText: string,
  config: LLMConfig
): Promise<LLMResponse> {
  return complete(
    [
      { role: "system", content: LEGAL_PROMPTS.analyzeDocument },
      { role: "user", content: documentText },
    ],
    config
  );
}

/**
 * Generate an affirmation/affidavit
 */
export async function generateAffirmation(
  facts: string,
  caseDetails: string,
  config: LLMConfig
): Promise<LLMResponse> {
  return complete(
    [
      { role: "system", content: LEGAL_PROMPTS.generateAffirmation },
      {
        role: "user",
        content: `Case Details:\n${caseDetails}\n\nFacts to include:\n${facts}`,
      },
    ],
    config
  );
}

/**
 * Extract timeline from document
 */
export async function extractTimeline(
  documentText: string,
  config: LLMConfig
): Promise<LLMResponse> {
  return complete(
    [
      { role: "system", content: LEGAL_PROMPTS.extractTimeline },
      { role: "user", content: documentText },
    ],
    config
  );
}
