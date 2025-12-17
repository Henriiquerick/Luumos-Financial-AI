import { z } from 'zod';
import { ai } from '../genkit';

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

export const contextualChatFlow = ai.defineFlow(
  {
    name: 'contextualChatFlow',
    inputSchema: InputSchema,
    outputSchema: z.string(),
  },
  async (input) => {
    const { userMessage, userData } = input;

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

    const { text } = await ai.generate({
      prompt: `${financialContext}\n\nPERGUNTA DO USUÁRIO: ${userMessage}`,
      config: {
        temperature: 0.7,
      },
    });

    return text;
  }
);
