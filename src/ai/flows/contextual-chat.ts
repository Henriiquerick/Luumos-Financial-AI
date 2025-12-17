import { z } from 'genkit';
import { ai } from '../genkit';
// IMPORTANTE: O caminho '../tools' busca o arquivo na pasta 'src/ai'
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
    const contextData = input.data ? JSON.stringify(input.data) : "Sem dados financeiros.";

    const { text } = await ai.generate({
      // Adicionamos a ferramenta aqui
      tools: [createCardTool],
      
      prompt: `
      Você é um assistente financeiro com a personalidade: "${persona}".
      
      DADOS DO USUÁRIO: ${contextData}
      MENSAGEM ATUAL: "${input.message}"
      
      INSTRUÇÕES:
      1. Se o usuário pedir para criar um cartão, verifique se tem Nome, Saldo e Tipo.
      2. Se tiver tudo, chame a ferramenta 'createCard'.
      3. Se faltar algo, pergunte.
      4. Se não for sobre cartões, apenas responda amigavelmente.
      `,
    });

    return text;
  }
);