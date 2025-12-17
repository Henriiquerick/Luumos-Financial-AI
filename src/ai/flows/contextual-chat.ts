import { z } from 'zod';
import { ai } from '../genkit';

export const contextualChatFlow = ai.defineFlow(
  {
    name: 'contextualChat',
    inputSchema: z.object({
      message: z.string(),
    }),
    outputSchema: z.string(),
  },
  async (input) => {
    const { text } = await ai.generate({
      // FORÇAMOS O MODELO AQUI TAMBÉM:
      model: 'googleai/gemini-2.5-flash-preview',
      prompt: `Atue como Lumos, um consultor financeiro especialista. O usuário disse: "${input.message}". Responda em português do Brasil de forma útil e direta.`,
      config: {
        temperature: 0.7,
      },
    });

    return text;
  }
);
