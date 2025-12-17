
'use server';

import { z } from 'genkit';
import { ai } from '../genkit';
import { KNOWLEDGE_LEVELS, PERSONALITIES } from '@/lib/agent-config';

export const contextualChatFlow = ai.defineFlow(
  {
    name: 'contextualChatFlow',
    inputSchema: z.object({
      message: z.string(),
      data: z.any().optional(),
      knowledgeId: z.string().optional(),
      personalityId: z.string().optional(),
    }),
    outputSchema: z.string(),
  },
  async (input) => {
    // 1. Encontrar as instruções de conhecimento e personalidade
    const knowledge = KNOWLEDGE_LEVELS.find(k => k.id === input.knowledgeId) || KNOWLEDGE_LEVELS.find(k => k.id === 'lumos-five')!;
    const personality = PERSONALITIES.find(p => p.id === input.personalityId) || PERSONALITIES.find(p => p.id === 'neytan')!;

    const knowledgeInstruction = knowledge.instruction;
    const personalityInstruction = personality.instruction;

    // 2. Determinar o idioma
    const userLang = input.data?.language || 'pt';
    const langInstruction = 
        userLang === 'pt' ? 'Responda estritamente em Português do Brasil.' :
        userLang === 'es' ? 'Responda estritamente em Espanhol.' :
        'Answer strictly in English.';

    // 3. Formatar os dados do usuário
    const contextData = input.data ? JSON.stringify(input.data, null, 2) : "Nenhum dado financeiro disponível.";

    // 4. Montar o prompt final
    const { text } = await ai.generate({
      prompt: input.message,
      system: `
--- DIRETRIZ DE IDIOMA ---
${langInstruction}

--- DIRETRIZES DE CONHECIMENTO (O CÉREBRO) ---
${knowledgeInstruction}

--- DIRETRIZES DE PERSONALIDADE (A VOZ) ---
${personalityInstruction}

--- DADOS DO USUÁRIO ---
${contextData}

--- INSTRUÇÃO FINAL ---
Responda à mensagem do usuário usando APENAS o conhecimento do seu Nível e estritamente o tom da sua Personalidade, no idioma solicitado.
      `,
      config: {
        temperature: 0.7, // Um pouco de criatividade para a personalidade brilhar
      },
    });

    return text;
  }
);
