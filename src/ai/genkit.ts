'use server';
import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

export const ai = genkit({
  plugins: [googleAI()],
  // ATUALIZAÇÃO: Usando a geração 1.5 Flash para garantir estabilidade
  model: 'googleai/gemini-1.5-flash', 
});
