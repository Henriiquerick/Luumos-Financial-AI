import { z } from 'genkit';
import { ai } from './genkit'; 

// 1. Schema (O que precisamos para criar um cartão)
export const CreateCardSchema = z.object({
  name: z.string().describe('O nome do cartão (ex: Nubank, Vale Refeição)'),
  balance: z.number().describe('O limite ou saldo inicial'),
  type: z.enum(['credit', 'debit', 'voucher']).describe('Tipo: credit, debit ou voucher'),
});

// 2. A Ferramenta em si
export const createCardTool = ai.defineTool(
  {
    name: 'createCard',
    description: 'Cria um cartão financeiro para o usuário quando ele solicitar explicitamente.',
    inputSchema: CreateCardSchema,
    outputSchema: z.string(),
  },
  async (input) => {
    // SIMULAÇÃO: Veremos isso no terminal
    console.log("🛠️ AÇÃO EXECUTADA: Criar Cartão", input);
    return `Cartão ${input.name} (${input.type}) criado com sucesso com saldo de ${input.balance}.`;
  }
);