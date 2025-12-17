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
    // CORREÇÃO CRUCIAL: Chamamos ai.generate direto.
    // Ele usa o modelo padrão definido no genkit.ts automaticamente.
    const { text } = await ai.generate({
      prompt: `Atue como Lumos, um consultor financeiro especialista. O usuário disse: "${input.message}". Responda em português do Brasil de forma útil e direta.`,
      config: {
        temperature: 0.7,
      },
    });

    return text;
  }
);