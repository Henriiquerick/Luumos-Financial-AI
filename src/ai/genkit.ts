import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

export const ai = genkit({
  plugins: [googleAI()],
  // ATUALIZAÇÃO: Usando a série 2.5 conforme sua documentação oficial.
  // O prefixo 'googleai/' continua necessário para o plugin.
  model: 'googleai/gemini-2.5-flash', 
});