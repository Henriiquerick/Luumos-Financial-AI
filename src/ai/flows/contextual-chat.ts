/**
 * @fileOverview This file defines a Genkit flow for a contextual financial chat agent
 * that can understand user intent and return a structured JSON object for actions.
 *
 * - `contextualChat`: A function that takes user messages and financial data to generate a response.
 * - `ContextualChatInput`: The input type for the function.
 * - `ContextualChatOutput`: The return type for the function.
 */
'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const MessageSchema = z.object({
  role: z.enum(['user', 'model']),
  content: z.string(),
});

// Definimos o formato exato que a API Route vai enviar
export const ContextualChatInputSchema = z.object({
  messages: z.array(MessageSchema),
  userId: z.string(), // Mantido para futuras implementações, se necessário
  data: z.object({
    balance: z.number(),
    cards: z.array(z.any()),
    transactions: z.array(z.any()).optional(),
    persona: z.any(),
  }),
});
export type ContextualChatInput = z.infer<typeof ContextualChatInputSchema>;

export const ContextualChatOutputSchema = z.object({
  response: z.string(),
});
export type ContextualChatOutput = z.infer<typeof ContextualChatOutputSchema>;


export async function contextualChat(
  input: ContextualChatInput
): Promise<ContextualChatOutput> {
  return contextualChatFlow(input);
}


const contextualChatFlow = ai.defineFlow(
  {
    name: 'contextualChatFlow',
    inputSchema: ContextualChatInputSchema,
    outputSchema: ContextualChatOutputSchema,
  },
  async ({ messages, data }) => {
    const lastUserMessage = messages.findLast((m) => m.role === 'user');

    if (!lastUserMessage) {
        return { response: "Não consigo responder sem uma pergunta." };
    }

    // Montamos o Contexto Financeiro em Texto para a IA ler
    const financialContext = `
      DADOS DO USUÁRIO (Para uso interno. Não exponha números brutos a menos que perguntado):
      - Saldo em Conta: ${data.balance.toFixed(2)}
      - Cartões: ${JSON.stringify(data.cards.map((c: any) => ({ name: c.name, limit: c.totalLimit })))}
      - Últimas 5 Transações: ${JSON.stringify(data.transactions.slice(0, 5).map((t: any) => ({ description: t.description, amount: t.amount, type: t.type, date: t.date.toISOString().split('T')[0] })))}
      - Data de Hoje: ${new Date().toLocaleDateString()}

      INSTRUÇÃO DE AGENTE:
      Sua principal função é ser um assistente. Se o usuário quiser realizar uma ação (como "criar um cartão" ou "adicionar uma despesa"), sua resposta DEVE ser EXCLUSIVAMENTE um objeto JSON cru (sem markdown ou texto adicional) no seguinte formato:
      { "action": "create_card" | "add_transaction", "data": { ...dados extraídos... } }

      - Para "create_card", os dados são: { "name": string, "totalLimit": number, "closingDay": number, "color": string (hex, opcional) }.
      - Para "add_transaction", os dados são: { "description": string, "amount": number, "category": string, "installments": number (padrão 1), "cardName": string (opcional) }.

      - Se o usuário disser 'Cartão Mercado Pago', infira a cor #009EE3. Se 'Nubank', #820AD1. Se 'Inter', #FF7A00. Se não souber a cor, não inclua o campo.
      - Se a informação for insuficiente para o JSON, peça os dados que faltam.
      - Se for uma conversa normal ou uma pergunta, apenas responda em texto plano como a persona solicitada.
    `;

    const systemPrompt = `${data.persona.systemInstruction}\n\n${financialContext}`;

    // Chamada ao Modelo
    const llmResponse = await ai.generate({
      model: 'googleai/gemini-1.5-flash',
      system: systemPrompt,
      prompt: lastUserMessage.content,
      history: messages.slice(0, -1).map(m => ({ role: m.role, content: [{text: m.content}] })),
      config: {
        temperature: 0.5,
      },
    });

    const responseText = llmResponse.text;

    return { response: responseText };
  }
);
