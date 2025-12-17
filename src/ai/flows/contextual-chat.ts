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
    // SEGREDO DO SUCESSO: Removemos a linha 'model: ...'.
    // Agora o Chat vai usar EXATAMENTE o mesmo modelo que o daily-insight usa (o padrão).
    const { text } = await ai.generate({
      prompt: `Atue como Lumos, um consultor financeiro. O usuário disse: "${input.message}". Responda em português do Brasil.`,
      config: {
        temperature: 0.7,
      },
    });

    return text;
  }
);
