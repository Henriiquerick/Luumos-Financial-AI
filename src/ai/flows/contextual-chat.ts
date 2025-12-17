import { z } from 'zod';
import { ai } from '../genkit';

export const contextualChatFlow = ai.defineFlow(
  {
    name: 'contextualChat',
    inputSchema: z.object({
      message: z.string(),
      data: z.any().optional(),
    }),
    outputSchema: z.string(),
  },
  async (input) => {
    // 1. Descobrimos quem a IA deve ser
    const persona = input.data?.persona || "Lumos (Consultor Financeiro Padrão)";
    
    // 2. Formatamos os dados financeiros para a IA entender (se existirem)
    const contextData = input.data ? JSON.stringify(input.data, null, 2) : "Sem dados financeiros disponíveis.";

    const { text } = await ai.generate({
      // 3. Prompt Inteligente: Injetamos a Personalidade e o Contexto
      prompt: `
      SUA PERSONALIDADE: "${persona}". Adote estritamente o tom de voz e estilo desta personalidade.

      DADOS FINANCEIROS DO USUÁRIO:
      ${contextData}

      MENSAGEM DO USUÁRIO: "${input.message}"
      
      COMO AGIR:
      - Converse com o usuário, mantendo sua personalidade e usando os dados financeiros para dar respostas mais ricas.
      `,
      config: {
        temperature: 0.7,
      },
    });

    return text;
  }
);
