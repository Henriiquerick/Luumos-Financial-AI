'use server';

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
      model: 'googleai/gemini-1.5-flash',
      prompt: `Atue como Lumos, um consultor financeiro. O usuário disse: "${input.message}". Responda em português.`,
    });

    return text;
  }
);
