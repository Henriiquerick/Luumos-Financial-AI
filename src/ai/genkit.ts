// This file is no longer used for core AI logic,
// which has been migrated to serverless API routes
// using the Google Generative AI SDK directly.
// You can remove this file or repurpose it for other Genkit flows.

import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

export const ai = genkit({
  plugins: [googleAI()],
  model: 'googleai/gemini-2.0-flash', 
});
