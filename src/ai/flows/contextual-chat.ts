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
    
    // 2. Formatamos os dados financeiros para a IA entender (se existirem)
    const contextData = input.data ? JSON.stringify(input.data) : "Sem dados financeiros disponíveis.";

    const { text } = await ai.generate({
      // Adicionamos a ferramenta para que a IA possa usá-la
      tools: [createCardTool],
      // 3. Prompt Inteligente: Injetamos a Personalidade, o Contexto e as Instruções da Ferramenta
      prompt: `
      CONTEXTO DO SISTEMA:
      Você é um assistente financeiro pessoal.
      
      SUA PERSONALIDADE ATUAL: "${persona}".
      (Instrução: Adote o tom de voz, gírias e estilo desta personalidade estritamente).

      DADOS FINANCEIROS DO USUÁRIO:
      ${contextData}

      INSTRUÇÕES DE FERRAMENTAS:
      - Se o usuário pedir para criar um cartão, você DEVE usar a 'createCardTool'.
      - Antes de usar a ferramenta, verifique se possui todas as informações necessárias: 'name', 'balance' (limite), e 'type' ('credit', 'debit', ou 'voucher').
      - Se alguma informação estiver faltando, FAÇA UMA PERGUNTA ao usuário para obtê-la. Por exemplo: "Qual será o limite do cartão?" ou "Será crédito, débito ou voucher?".
      - Só chame a ferramenta quando tiver todos os três dados.

      MENSAGEM DO USUÁRIO: 
      "${input.message}"
      
      Responda à mensagem do usuário incorporando sua personalidade, usando os dados financeiros e seguindo as instruções das ferramentas, se for relevante.
      `,
      config: {
        temperature: 0.7, // Um pouco de criatividade para a personalidade brilhar
      },
    });

    return text;
  }
);
