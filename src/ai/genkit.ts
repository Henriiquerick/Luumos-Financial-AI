'use server';
import { genkit, type ModelAction } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

export const ai = genkit({
  plugins: [
    googleAI(),
  ],
  logLevel: 'debug',
  enableTracingAndMetrics: true,
});

export const model: ModelAction = ai.model('googleai/gemini-1.5-flash');
