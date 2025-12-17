import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

export const ai = genkit({
  plugins: [googleAI()],
  // MUDANÇA: Atualizado para o modelo gemini-2.5-flash.
  model: 'googleai/gemini-2.5-flash-preview', 
});
