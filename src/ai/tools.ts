import { z } from 'genkit';
import { ai } from './genkit';
import { getFirestore, useFirestore } from '@/firebase'; // Firebase não é um hook, então não precisa de 'use'
import { createCard as createCardInDb } from '@/firebase/mutations';
import { initializeFirebase } from '@/firebase';

// 1. Schema (O que precisamos para criar um cartão)
export const CreateCardSchema = z.object({
  name: z.string().describe('O nome do cartão (ex: Nubank, Vale Refeição)'),
  totalLimit: z.number().describe('O limite ou saldo inicial do cartão'),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, 'A cor em formato hexadecimal (ex: #820AD1)').describe('A cor principal do cartão em formato hexadecimal.'),
  closingDay: z.number().int().min(1).max(31).describe('O dia de fechamento da fatura (de 1 a 31).'),
  userId: z.string().describe("O ID do usuário autenticado para associar o cartão.")
});

// 2. A Ferramenta em si
export const createCardTool = ai.defineTool(
  {
    name: 'createCard',
    description: 'Cria um novo cartão de crédito ou débito para o usuário no banco de dados.',
    inputSchema: CreateCardSchema,
    outputSchema: z.string(),
  },
  async (input) => {
    try {
      // Ponto crucial: Obtenha a instância do Firestore.
      // Como estamos em um ambiente de servidor, precisamos inicializar.
      const { firestore } = initializeFirebase();
      
      const { userId, ...cardData } = input;

      // Chama a função de mutação que acabamos de criar
      createCardInDb(firestore, userId, cardData);

      console.log("✅ [TOOL] Ação executada: createCard. Dados enviados para o Firestore:", cardData);
      
      // Retorna uma mensagem de sucesso para o LLM.
      return `O cartão '${input.name}' foi criado com sucesso no banco de dados.`;

    } catch (error) {
      console.error("🔥 [TOOL ERROR] Falha ao criar cartão:", error);
      // Informa ao LLM que houve um erro.
      return "Ocorreu um erro ao tentar salvar o cartão no banco de dados. Por favor, informe ao usuário.";
    }
  }
);
