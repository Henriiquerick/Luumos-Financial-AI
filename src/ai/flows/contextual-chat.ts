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
    // Note: NÃO TEM 'model:' aqui. Ele usa o padrão do genkit.ts
    const { text } = await ai.generate({
      prompt: `Atue como Lumos... O usuário disse: "${input.message}"...`,
      config: {
        temperature: 0.7,
      },
    });

    return text;
  }
);