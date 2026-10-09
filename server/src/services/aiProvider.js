import axios from 'axios';
import { config } from '../config/env.js';

/**
 * Provider-independent AI call. Currently supports OpenAI-compatible chat
 * endpoints (OpenAI, Azure-style gateways, local LLM servers like Ollama
 * with --api openai, LM Studio, Groq, Together, etc.) via AI_BASE_URL.
 */
export async function callLLM(message, dataContext) {
  const baseUrl = (config.ai.baseUrl || 'https://api.openai.com/v1').replace(/\/$/, '');
  const systemPrompt = [
    'You are Buildora Copilot, an assistant for a construction & interior business platform.',
    'Answer using ONLY the business data provided. If data is missing, say what is missing.',
    'Never invent numbers. Keep answers concise. Do not claim to have taken any action —',
    'you are read-only: you cannot approve POs, change permissions, or move money.',
    dataContext.demo
      ? 'No live business data is available: describe what you would do with it, without fabricating figures.'
      : `Business data (JSON):\n${JSON.stringify(dataContext).slice(0, 12000)}`,
  ].join('\n');

  const { data } = await axios.post(
    `${baseUrl}/chat/completions`,
    {
      model: config.ai.model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message },
      ],
      max_tokens: 800,
      temperature: 0.3,
    },
    {
      headers: { Authorization: `Bearer ${config.ai.apiKey}` },
      timeout: 30000,
    }
  );
  return data?.choices?.[0]?.message?.content || 'No response from AI provider.';
}
