'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';

/**
 * Schema for the input of the createCardTool.
 * Defines the necessary information to create a new card.
 */
export const CreateCardSchema = z.object({
  name: z.string().describe('The name for the new card, e.g., "Nubank", "iFood Card"'),
  balance: z.number().describe('The total limit for a credit card, or initial balance for debit/voucher cards.'),
  type: z.enum(['credit', 'debit', 'voucher']).describe("The type of the card."),
});

/**
 * A Genkit tool that allows the AI agent to create a new virtual card.
 * Currently, it simulates the creation by logging to the console.
 */
export const createCardTool = ai.defineTool(
  {
    name: 'createCardTool',
    description: 'Use this tool to create a new virtual card for the user. It can be a credit, debit, or voucher card.',
    input: { schema: CreateCardSchema },
    output: { schema: z.string() },
  },
  async (input) => {
    // For now, we just log the action and simulate success.
    // In the future, this could be connected to Firestore.
    console.log('🛠️ [TOOL] Creating Card:', input);
    return `Card "${input.name}" of type "${input.type}" with a balance/limit of ${input.balance} created successfully.`;
  }
);
