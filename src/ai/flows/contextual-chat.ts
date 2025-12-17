import { defineFlow } from '@genkit-ai/flow';
import { generate } from '@genkit-ai/ai';
import { z } from 'zod';

export const contextualChatFlow = defineFlow(
  {
    name: 'contextualChat',
    inputSchema: z.object({
      message: z.string(),
    }),
    outputSchema: z.string(),
  },
  async (input) => {
    const llmResponse = await generate({
      model: 'gemini-1.5-flash',
      prompt: `Atue como Lumos, um consultor financeiro. O usuário disse: "${input.message}". Responda em português do Brasil de forma útil e direta.`,
      config: {
        temperature: 0.7,
      },
    });
    return llmResponse.text; 
  }
);