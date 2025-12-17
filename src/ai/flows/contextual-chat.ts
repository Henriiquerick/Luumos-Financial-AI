import { z } from 'zod';
import { ai } from '../genkit';
import { createCardTool } from '../tools'; 

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
    const persona = input.data?.persona || "Lumos";
    const contextData = input.data ? JSON.stringify(input.data, null, 2) : "Sem dados financeiros.";
    const userId = input.data?.userId; // Extraindo o userId

    const { text } = await ai.generate({
      tools: [createCardTool],
      prompt: `
      Sua Personalidade: "${persona}".

      DADOS FINANCEIROS DO USUÁRIO:
      ${contextData}

      MENSAGEM DO USUÁRIO: "${input.message}"
      
      SEU OBJETIVO: Ajudar o usuário a gerenciar suas finanças. Se ele pedir para criar um cartão, você TEM que coletar TODAS as informações abaixo antes de chamar a ferramenta:
      1. 'name': Nome do Cartão (ex: Nubank)
      2. 'totalLimit': Limite total (ex: 5000)
      3. 'color': Cor em hexadecimal (ex: #820AD1)
      4. 'closingDay': Dia do fechamento da fatura (ex: 15)

      IMPORTANTE: O 'userId' para a ferramenta é '${userId}'. Você já tem essa informação, não precisa perguntar.

      COMO AGIR:
      - Se o usuário pedir para criar um cartão e já der todas as 4 informações, chame a ferramenta 'createCard' imediatamente.
      - Se faltar QUALQUER uma das 4 informações, pergunte educadamente pela informação que falta. NÃO chame a ferramenta.
      - Para qualquer outro assunto, converse normalmente, mantendo sua personalidade.
      `,
    });

    return text;
  }
);
