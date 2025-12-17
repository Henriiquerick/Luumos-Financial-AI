import { genkit, configureGenkit } from 'genkit';
import { openAI } from 'genkitx-openai';

configureGenkit({
  plugins: [
    openAI({
      apiKey: process.env.GROQ_API_KEY,
      baseURL: 'https://api.groq.com/openai/v1',
    }),
  ],
  logLevel: 'debug',
  enableTracingAndMetrics: true,
});

export const ai = genkit({
  model: 'openai/llama3-8b-8192',
});
