// Pollinations.ai — free text generation, no API key required
// Docs: https://text.pollinations.ai/

const POLLINATIONS_API = "https://text.pollinations.ai/";

export interface PollinationsMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface PollinationsOptions {
  model?: "openai" | "mistral" | "llama" | "gemini";
  temperature?: number;
  stream?: boolean;
  system?: string;
}

/** Stream response as async generator — yields text chunks */
export async function* streamText(
  messages: PollinationsMessage[],
  options: PollinationsOptions = {}
): AsyncGenerator<string> {
  const { model = "openai", temperature = 0.7, system } = options;

  const body: Record<string, unknown> = {
    messages,
    model,
    temperature,
    stream: true,
  };
  if (system) body.system = system;

  const res = await fetch(POLLINATIONS_API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok || !res.body) {
    throw new Error(`Pollinations API error: ${res.status} ${res.statusText}`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const chunk = decoder.decode(value, { stream: true });
    // Parse SSE lines
    const lines = chunk.split("\n");
    for (const line of lines) {
      if (!line.startsWith("data: ")) continue;
      const data = line.slice(6).trim();
      if (data === "[DONE]") return;
      try {
        const json = JSON.parse(data);
        const text = json?.choices?.[0]?.delta?.content;
        if (text) yield text;
      } catch {
        // Some chunks are plain text, not JSON — yield directly
        if (data && data !== "[DONE]") yield data;
      }
    }
  }
}

/** Get full response as a string (non-streaming) */
export async function generateText(
  prompt: string,
  options: PollinationsOptions & { system?: string } = {}
): Promise<string> {
  const messages: PollinationsMessage[] = [{ role: "user", content: prompt }];
  let result = "";
  for await (const chunk of streamText(messages, options)) {
    result += chunk;
  }
  return result;
}
