import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

export const ai = genkit({
  plugins: [googleAI()],
  // Define o modelo padrão globalmente usando a string correta
  model: 'googleai/gemini-1.5-flash', 
});