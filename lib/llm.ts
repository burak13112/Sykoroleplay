import { Message } from '../types';

interface CompletionParams {
  apiKey: string;
  provider: 'openai' | 'openrouter';
  model: string;
  messages: { role: string; content: string }[];
  systemPrompt?: string;
  onUpdate: (chunk: string) => void;
  onFinish: (fullText: string) => void;
  onError: (error: Error) => void;
}

export const streamCompletion = async ({
  apiKey,
  provider,
  model,
  messages,
  systemPrompt,
  onUpdate,
  onFinish,
  onError,
}: CompletionParams) => {
  
  let baseUrl = 'https://api.openai.com/v1/chat/completions';
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${apiKey}`,
  };

  if (provider === 'openrouter') {
    baseUrl = 'https://openrouter.ai/api/v1/chat/completions';
    headers['HTTP-Referer'] = 'https://velvet-app.com'; // Required by OpenRouter
    headers['X-Title'] = 'Velvet';
  }

  // Prepend system prompt if it exists
  const finalMessages = systemPrompt 
    ? [{ role: 'system', content: systemPrompt }, ...messages]
    : messages;

  try {
    const response = await fetch(baseUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model: model,
        messages: finalMessages,
        stream: true, // Enable streaming
        temperature: 0.7, // Good default for RP
      }),
    });

    if (!response.ok) {
      const errData = await response.json();
      throw new Error(errData?.error?.message || `API Error: ${response.status}`);
    }

    if (!response.body) throw new Error("No response body");

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let fullText = '';
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      buffer += chunk;
      
      const lines = buffer.split('\n');
      // Keep the last line in the buffer in case it's incomplete
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.trim() === '') continue;
        if (line.trim() === 'data: [DONE]') continue;
        if (!line.startsWith('data: ')) continue;

        try {
          const jsonStr = line.replace('data: ', '');
          const json = JSON.parse(jsonStr);
          const content = json.choices[0]?.delta?.content || '';
          
          if (content) {
            fullText += content;
            onUpdate(fullText);
          }
        } catch (e) {
          console.warn("Error parsing stream chunk", e);
        }
      }
    }

    onFinish(fullText);

  } catch (error) {
    onError(error instanceof Error ? error : new Error("Unknown error"));
  }
};
