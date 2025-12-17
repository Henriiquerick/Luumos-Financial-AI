
// src/ai/flows/contextual-chat.ts

import { z } from 'zod';
import { ai } from '../genkit'; 

// Definimos o formato exato que a API Route vai enviar
const InputSchema = z.object({
  userMessage: z.string(),
  history: z.array(z.any()).optional(),
  userData: z.object({
    balance: z.number(),
    cards: z.array(z.any()),
    persona: z.string().optional(),
    transactions: z.array(z.any()).optional()
  }).optional()
});

// USAMOS ai.defineFlow AGORA
export const contextualChatFlow = ai.defineFlow(
  {
    name: 'contextualChatFlow',
    inputSchema: InputSchema,
    // O output será uma string (texto ou JSON)
    outputSchema: z.string(), 
  },
  async (input) => {
    const { userMessage, userData } = input;

    // Montamos o Contexto Financeiro em Texto para a IA ler
    const financialContext = userData ? `
      DADOS DO USUÁRIO:
      - Saldo: R$ ${userData.balance}
      - Cartões: ${JSON.stringify(userData.cards)}
      - Transações Recentes: ${JSON.stringify(userData.transactions || [])}
      
      INSTRUÇÃO DE AGENTE:
      Se o usuário quiser realizar uma ação (criar cartão ou transação), responda EXCLUSIVAMENTE com um JSON cru (sem markdown):
      { "action": "create_card" | "add_transaction", "data": { ... } }
      Caso contrário, responda normalmente em texto.
    ` : '';

    // USAMOS ai.generate AGORA
    // Nota: O modelo é pego automaticamente da configuração do 'ai' (genkit.ts)
    const llmResponse = await ai.generate({
      prompt: `${financialContext}\n\nPERGUNTA DO USUÁRIO: ${userMessage}`,
      config: {
        temperature: 0.7,
      },
    });

    // Em Genkit 1.x, a resposta está na propriedade .text
    return llmResponse.text; 
  }
);
