import { genkit } from 'genkit';
import { openAI } from 'genkitx-openai';

export const ai = genkit({
  plugins: [
    openAI({
      apiKey: process.env.GROQ_API_KEY,
      baseURL: 'https://api.groq.com/openai/v1',
    }),
  ],
  logLevel: 'debug',
  enableTracingAndMetrics: true,
  model: 'llama3-8b-8192', // Correção: Removido o prefixo 'openai/'
});
