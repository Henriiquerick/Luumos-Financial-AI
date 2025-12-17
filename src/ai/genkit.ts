import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

export const ai = genkit({
  plugins: [googleAI()],
  // TRUQUE DE MESTRE: Usamos o nome completo com prefixo.
  // O plugin 'google-genai' registra os modelos com o prefixo 'googleai'.
  model: 'googleai/gemini-1.5-flash', 
});