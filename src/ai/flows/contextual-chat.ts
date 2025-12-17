/**
 * @fileOverview This file defines a Genkit flow for a contextual financial chat agent
 * that can understand user intent and execute actions (tools) like creating transactions or credit cards.
 *
 * - `contextualChat`: A function that takes user messages and financial data to generate a response or execute a tool.
 * - `ContextualChatInput`: The input type for the function.
 * - `ContextualChatOutput`: The return type for the function.
 */
'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import {
  getFirestore,
  collection,
  addDoc,
  query,
  where,
  getDocs,
  Timestamp,
} from 'firebase/firestore';
import { initializeFirebase } from '@/firebase/index';
import { CATEGORIES } from '@/lib/constants';

// Initialize Firebase Admin SDK
const { firestore } = initializeFirebase();

// Schemas for Chat History and Financial Data
const MessageSchema = z.object({
  role: z.enum(['user', 'model']),
  content: z.string(),
});

export const ContextualChatInputSchema = z.object({
  messages: z.array(MessageSchema),
  userId: z.string(),
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

// Tool: Create Credit Card
const createCreditCardTool = ai.defineTool(
  {
    name: 'createCreditCard',
    description:
      'Use this tool when the user wants to register a new credit card. Infer color from name if not provided (e.g., Nubank is purple, Inter is orange).',
    inputSchema: z.object({
      name: z.string().describe('The name of the credit card.'),
      totalLimit: z.number().describe('The total credit limit.'),
      closingDay: z
        .number()
        .describe(
          'The day of the month the credit card bill closes. Defaults to 1 if not provided.'
        ),
      color: z
        .string()
        .optional()
        .describe('The hex color code for the card. Infer if possible.'),
      userId: z.string().describe('The UID of the user.'),
    }),
    outputSchema: z.string(),
  },
  async (input) => {
    try {
      const cardsRef = collection(firestore, 'users', input.userId, 'cards');
      
      // Simple color inference
      let color = input.color;
      if (!color) {
        if (input.name.toLowerCase().includes('nubank')) color = '#820AD1';
        else if (input.name.toLowerCase().includes('inter')) color = '#FF7A00';
        else if (input.name.toLowerCase().includes('mercado pago')) color = '#009EE3';
        else color = '#111111'; // Default black
      }

      const cardData = {
        name: input.name,
        totalLimit: input.totalLimit,
        closingDay: input.closingDay,
        color: color,
      };

      await addDoc(cardsRef, cardData);
      return `Credit card "${input.name}" was created successfully.`;
    } catch (e: any) {
      return `Error creating credit card: ${e.message}`;
    }
  }
);

// Tool: Add Transaction
const addTransactionTool = ai.defineTool(
  {
    name: 'addTransaction',
    description: 'Use this tool to add a new expense or income transaction.',
    inputSchema: z.object({
      description: z.string(),
      amount: z.number(),
      category: z.enum(CATEGORIES),
      installments: z
        .number()
        .optional()
        .describe('Number of installments. Defaults to 1.'),
      cardName: z
        .string()
        .optional()
        .describe(
          "The name of the credit card used. If not provided, it's a cash/debit transaction."
        ),
      userId: z.string().describe('The UID of the user.'),
    }),
    outputSchema: z.string(),
  },
  async (input) => {
    try {
      const transactionsRef = collection(firestore, 'users', input.userId, 'transactions');
      let cardId: string | undefined = undefined;

      // If a card name is provided, find its ID
      if (input.cardName) {
        const cardsRef = collection(firestore, 'users', input.userId, 'cards');
        const q = query(cardsRef, where('name', '==', input.cardName));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          cardId = querySnapshot.docs[0].id;
        } else {
          return `Could not find a credit card named "${input.cardName}". The transaction was not added.`;
        }
      }

      const transactionData = {
        description: input.description,
        amount: input.amount,
        category: input.category,
        date: Timestamp.now(),
        type: 'expense' as const, // For now, agent only adds expenses
        installments: input.installments || 1,
        cardId: cardId,
      };
      
      await addDoc(transactionsRef, transactionData);

      return `Transaction "${input.description}" for ${input.amount} was added successfully.`;
    } catch (e: any) {
      return `Error adding transaction: ${e.message}`;
    }
  }
);

// Main Chat Flow
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
  async ({ messages, data, userId }) => {
    const contextText = `
FINANCIAL DATA (For internal use. Do not expose raw numbers unless asked):
- Account Balance: ${data.balance.toFixed(2)}
- Cards: ${JSON.stringify(data.cards.map((c: any) => ({ name: c.name, limit: c.totalLimit })))}
- Last 5 Transactions: ${JSON.stringify(data.transactions.slice(0, 5).map((t: any) => ({ description: t.description, amount: t.amount, type: t.type, date: t.date.toISOString().split('T')[0] })))}
- Today's Date: ${new Date().toLocaleDateString()}
`;

    const systemPrompt = `You are a financial assistant capable of executing actions. If the user asks to add data (e.g., 'I bought a sofa'), DO NOT just reply. USE the available tools to record the data. If information is missing (e.g., closing day), assume a safe default (day 1) or ask, but prefer to act if you have enough information. After executing an action, respond by confirming what was done (e.g., 'Mercado Pago card created and Sofa purchase registered'). If the user is just asking a question, answer it using the provided financial context.
    
    ${data.persona.systemInstruction}
    
    USER CONTEXT:
    ${contextText}`;

    const history = messages.map((msg) => ({
      role: msg.role,
      content: [{ text: msg.content }],
    }));

    const lastUserMessage = messages.findLast((m) => m.role === 'user');

    if (!lastUserMessage) {
      return { response: "I can't respond without a question." };
    }

    const result = await ai.generate({
      model: 'googleai/gemini-1.5-flash',
      system: systemPrompt,
      prompt: `${lastUserMessage.content}\n\n(User ID for tools: ${userId})`,
      history: history.slice(0, -1),
      tools: [createCreditCardTool, addTransactionTool],
      toolChoice: 'auto',
    });

    const outputText = result.text;
    
    return { response: outputText };
  }
);
