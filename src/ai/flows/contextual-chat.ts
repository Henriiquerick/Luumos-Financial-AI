import { z } from 'zod';
import { ai } from '../genkit';
import { createCardTool } from '../tools'; 

export const contextualChatFlow = ai.defineFlow(
  {
    name: 'contextualChat',
    inputSchema: z.object({
      message: z.string(),
      // ADIÇÃO: Agora aceitamos um objeto de dados opcional
      data: z.any().optional(), 
    }),
    outputSchema: z.string(),
  },
  async (input) => {
    // 1. Descobrimos quem a IA deve ser
    const persona = input.data?.persona || "Lumos (Consultor Financeiro Padrão)";
    const userId = input.data?.userId; // Extraindo o userId para o prompt
    
    // 2. Formatamos os dados financeiros para a IA entender (se existirem)
    const contextData = input.data ? JSON.stringify(input.data, null, 2) : "Sem dados financeiros disponíveis.";

    const { text } = await ai.generate({
      tools: [createCardTool],
      // 3. Prompt Inteligente: Injetamos a Personalidade, o Contexto e o userId
      prompt: `
      SUA PERSONALIDADE: "${persona}". Adote estritamente o tom de voz e estilo desta personalidade.

      DADOS FINANCEIROS DO USUÁRIO:
      ${contextData}

      MENSAGEM DO USUÁRIO: "${input.message}"
      
      SEU OBJETIVO: Ajudar o usuário a gerenciar suas finanças. Se ele pedir para criar um cartão, você TEM que coletar TODAS as 4 informações abaixo antes de chamar a ferramenta 'createCard':
      1. 'name': Nome do Cartão (ex: Nubank)
      2. 'totalLimit': Limite total (ex: 5000)
      3. 'color': Cor em hexadecimal (ex: #820AD1)
      4. 'closingDay': Dia do fechamento da fatura (ex: 15)

      INSTRUÇÃO CRÍTICA: O 'userId' para a ferramenta é '${userId}'. Você já tem essa informação, não precisa perguntar ao usuário. Use-a ao chamar a ferramenta.

      COMO AGIR:
      - Se o usuário pedir para criar um cartão e JÁ fornecer todas as 4 informações, chame a ferramenta 'createCard' imediatamente, passando também o 'userId' que você já conhece.
      - Se faltar QUALQUER uma das 4 informações, faça perguntas para obter o que falta. NÃO chame a ferramenta ainda.
      - Para qualquer outro assunto, converse normalmente, mantendo sua personalidade e usando os dados financeiros para dar respostas mais ricas.
      `,
      config: {
        temperature: 0.7,
      },
    });

    return text;
  }
);
