import { env } from '../config/env.js';

export type ChatMessage = {
  role: 'user' | 'assistant' | 'system';
  content: string;
};

export type OpenRouterModel = {
  id: string;
  name: string;
  context_length: number;
  pricing: { prompt: string; completion: string };
  architecture?: { modality?: string };
  supported_parameters?: string[];
};

function authHeaders() {
  return {
    Authorization: `Bearer ${env.openRouterApiKey}`,
    'Content-Type': 'application/json',
    'HTTP-Referer': env.corsOrigin,
    'X-Title': 'Jeeo',
  };
}

export async function listModels(): Promise<OpenRouterModel[]> {
  const res = await fetch(`${env.openRouterBaseUrl}/models`, {
    headers: authHeaders(),
  });
  if (!res.ok) {
    throw new Error(`OpenRouter models request failed: ${res.status}`);
  }
  const data = (await res.json()) as { data: OpenRouterModel[] };
  return data.data;
}

/**
 * Streams a chat completion from OpenRouter and forwards each SSE chunk
 * verbatim to onChunk, so the caller can relay it straight to the client.
 */
export async function streamChatCompletion(
  model: string,
  messages: ChatMessage[],
  onChunk: (raw: string) => void,
): Promise<void> {
  const res = await fetch(`${env.openRouterBaseUrl}/chat/completions`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ model, messages, stream: true }),
  });

  if (!res.ok || !res.body) {
    const text = await res.text().catch(() => '');
    throw new Error(`OpenRouter chat request failed: ${res.status} ${text}`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    onChunk(decoder.decode(value, { stream: true }));
  }
}
