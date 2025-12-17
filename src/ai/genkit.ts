import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

export const ai = genkit({
  plugins: [googleAI()],
  // REVERTIDO: Usando a versão estável que estava funcionando.
  model: 'googleai/gemini-2.5-flash',
});
