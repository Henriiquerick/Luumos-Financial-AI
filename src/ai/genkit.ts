import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

export const ai = genkit({
  plugins: [googleAI()],
  // MUDANÇA: Voltamos para a versão específica e estável.
  model: 'googleai/gemini-1.5-flash-001', 
});
