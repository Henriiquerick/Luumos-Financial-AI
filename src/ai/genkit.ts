'use server';
import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

export const ai = genkit({
  plugins: [googleAI()],
  // ATUALIZAÇÃO: Usando a geração 2.0 Flash (compatível com sua lista)
  model: 'googleai/gemini-2.0-flash', 
});