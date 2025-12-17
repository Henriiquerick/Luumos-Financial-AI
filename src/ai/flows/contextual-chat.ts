import { z } from 'zod';
import { ai } from '../genkit'; // Importamos o cérebro que criamos

// Usamos ai.defineFlow para criar um fluxo já conectado
export const contextualChatFlow = ai.defineFlow(
  {
    name: 'contextualChat',
    inputSchema: z.object({
      message: z.string(),
    }),
    outputSchema: z.string(),
  },
  async (input) => {
    // Agora a chamada é simples e direta
    const { text } = await ai.generate({
      prompt: `Atue como Lumos, um consultor financeiro. O usuário disse: "${input.message}". Responda em português do Brasil.`,
      config: {
        temperature: 0.7,
      },
    });

    return text;
  }
);