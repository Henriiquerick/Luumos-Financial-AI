/**
 * @fileOverview This file defines a Genkit flow for a contextual financial chat.
 *
 * - `contextualChat`: A function that takes user messages and financial data to generate a response.
 * - `ContextualChatInput`: The input type for the function.
 * - `ContextualChatOutput`: The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const MessageSchema = z.object({
  role: z.enum(['user', 'model']),
  content: z.string(),
});

export const ContextualChatInputSchema = z.object({
  messages: z.array(MessageSchema),
  data: z.object({
    balance: z.number(),
    cards: z.any(),
    transactions: z.any(),
    persona: z.any(),
  }),
});
export type ContextualChatInput = z.infer<typeof ContextualChatInputSchema>;

export const ContextualChatOutputSchema = z.object({
  response: z.string(),
});
export type ContextualChatOutput = z.infer<typeof ContextualChatOutputSchema>;

export async function contextualChat(input: ContextualChatInput): Promise<ContextualChatOutput> {
  return contextualChatFlow(input);
}

const contextualChatFlow = ai.defineFlow(
  {
    name: 'contextualChatFlow',
    inputSchema: ContextualChatInputSchema,
    outputSchema: ContextualChatOutputSchema,
  },
  async ({ messages, data }) => {
    
    const contextText = `
DADOS FINANCEIROS ATUAIS (Uso interno, não exponha números brutos a menos que perguntado):
- Saldo em Conta: ${data.balance.toFixed(2)}
- Cartões: ${JSON.stringify(data.cards.map((c: any) => ({name: c.name, limit: c.totalLimit})))}
- Últimas 10 Transações: ${JSON.stringify(data.transactions.slice(0, 10).map((t: any) => ({description: t.description, amount: t.amount, type: t.type, date: t.date.toISOString().split('T')[0]})))}
- Data Hoje: ${new Date().toLocaleDateString()}
`;

    const systemPrompt = `${data.persona.systemInstruction}\n\nCONTEXTO DO USUÁRIO:\n${contextText}`;

    const history = messages.map(msg => ({
      role: msg.role,
      content: [{ text: msg.content }],
    }));

    const lastUserMessage = messages.findLast(m => m.role === 'user');

    if (!lastUserMessage) {
        return { response: "Não consigo responder sem uma pergunta." };
    }

    const { output } = await ai.generate({
        model: 'googleai/gemini-1.5-flash',
        system: systemPrompt,
        prompt: lastUserMessage.content,
        history: history.slice(0, -1), // Send all but the last message as history
    });

    return { response: output.text };
  }
);
