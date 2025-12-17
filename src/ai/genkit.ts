import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

export const ai = genkit({
  plugins: [googleAI()],
  // MUDANÇA: Adicionamos '-001' ao final. 
  // Isso aponta para a versão específica e evita o erro 404 do alias.
  model: 'googleai/gemini-1.5-flash-001', 
});
