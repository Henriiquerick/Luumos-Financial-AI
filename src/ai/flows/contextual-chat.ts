import { defineFlow } from '@genkit-ai/flow';
import { z } from 'zod';
import { ai } from '../genkit'; // <--- Importamos nossa instância criada no Passo 1

export const contextualChatFlow = defineFlow(
  {
    name: 'contextualChat',
    inputSchema: z.object({
      message: z.string(),
    }),
    outputSchema: z.string(),
  },
  async (input) => {
    // Agora usamos ai.generate()
    // Ele aceita apenas 1 argumento (as opções) porque o registry já está configurado dentro do 'ai'
    const llmResponse = await ai.generate({
      // Como definimos o modelo padrão no genkit.ts, nem precisaria repetir aqui, mas é bom ser explícito:
      model: 'gemini-1.5-flash', 
      prompt: `Atue como Lumos, um consultor financeiro. O usuário disse: "${input.message}". Responda em português do Brasil.`,
      config: {
        temperature: 0.7,
      },
    });

    // Na versão nova, .text é uma propriedade (sem parênteses)
    return llmResponse.text; 
  }
);