import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

// Instanciamos o Genkit (o "ai" será nosso objeto principal)
export const ai = genkit({
  plugins: [googleAI()],
  model: 'googleai/gemini-1.5-flash', // Define o modelo padrão
});
