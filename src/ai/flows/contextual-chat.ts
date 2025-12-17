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
      // CORREÇÃO: Removemos a especificação do modelo aqui.
      // Ele agora usará o modelo padrão definido em `src/ai/genkit.ts`.
      prompt: `Atue como Lumos, um consultor financeiro especialista. O usuário disse: "${input.message}". Responda em português do Brasil de forma útil e direta.`,
      config: {
        temperature: 0.7,
      },
    });

    return text;
  }
);
