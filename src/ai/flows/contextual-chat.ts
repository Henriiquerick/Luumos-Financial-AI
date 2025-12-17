import { z } from 'genkit';
import { ai } from '../genkit';

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
      // 3. Prompt Inteligente: Injetamos a Personalidade e o Contexto
      prompt: `
      CONTEXTO DO SISTEMA:
      Você é um assistente financeiro pessoal.
      
      SUA PERSONALIDADE ATUAL: "${persona}".
      (Instrução: Adote o tom de voz, gírias e estilo desta personalidade estritamente).

      DADOS FINANCEIROS DO USUÁRIO:
      ${contextData}

      MENSAGEM DO USUÁRIO: 
      "${input.message}"
      
      Responda à mensagem do usuário incorporando sua personalidade e usando os dados financeiros acima se for relevante.
      `,
      config: {
        temperature: 0.7, // Um pouco de criatividade para a personalidade brilhar
      },
    });

    return text;
  }
);
