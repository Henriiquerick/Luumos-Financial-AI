import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

export const ai = genkit({
  plugins: [googleAI()],
  // Alterado para o modelo Flash para ter uma cota mais permissiva durante o desenvolvimento.
  model: 'googleai/gemini-1.5-flash', 
});
