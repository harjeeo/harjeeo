const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000';

export type ApiUser = {
  id: string;
  email: string;
  role: 'user' | 'admin';
};

async function parseOrThrow(res: Response) {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `Request failed: ${res.status}`);
  }
  return res.json();
}

export async function register(email: string, password: string) {
  const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  return parseOrThrow(res) as Promise<{ token: string; user: ApiUser }>;
}

export async function login(email: string, password: string) {
  const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  return parseOrThrow(res) as Promise<{ token: string; user: ApiUser }>;
}

type StreamCallbacks = {
  onConversationId: (id: string) => void;
  onDelta: (text: string) => void;
  onDone: () => void;
  onError: (message: string) => void;
};

/** Extracts assistant text from OpenRouter's raw SSE chunk (one or more "data: {...}" lines). */
function extractDeltaText(raw: string): string {
  let text = '';
  for (const line of raw.split('\n')) {
    if (!line.startsWith('data: ')) continue;
    const payload = line.slice(6).trim();
    if (payload === '[DONE]') continue;
    try {
      const json = JSON.parse(payload);
      text += json.choices?.[0]?.delta?.content ?? '';
    } catch {
      // partial chunk, ignore
    }
  }
  return text;
}

export async function sendMessageStream(
  token: string,
  params: { conversationId?: string; modelId: string; message: string },
  callbacks: StreamCallbacks,
) {
  const res = await fetch(`${API_BASE_URL}/api/chat/send`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(params),
  });

  if (!res.ok || !res.body) {
    const body = await res.json().catch(() => ({}));
    callbacks.onError(body.error ?? `Request failed: ${res.status}`);
    return;
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    let boundary: number;
    while ((boundary = buffer.indexOf('\n\n')) !== -1) {
      const block = buffer.slice(0, boundary);
      buffer = buffer.slice(boundary + 2);

      const eventMatch = block.match(/^event: (.+)$/m);
      const dataMatch = block.match(/^data: (.+)$/m);
      const eventName = eventMatch?.[1];
      const data = dataMatch?.[1] ? JSON.parse(dataMatch[1]) : {};

      if (eventName === 'conversation') {
        callbacks.onConversationId(data.conversationId);
      } else if (eventName === 'error') {
        callbacks.onError(data.error ?? 'Stream error');
      } else if (eventName === 'done') {
        callbacks.onDone();
      } else if (typeof data.delta === 'string') {
        const text = extractDeltaText(data.delta);
        if (text) callbacks.onDelta(text);
      }
    }
  }
}
