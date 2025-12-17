'use server';
import { z } from 'genkit';
import { ai } from './genkit';
import { createCard as createCardInDb } from '@/firebase/mutations';
import { initializeFirebase } from '@/firebase';

// 1. Schema (O que precisamos para criar um cartão)
export const CreateCardSchema = z.object({
  name: z.string().describe('O nome do cartão (ex: Nubank)'),
  totalLimit: z.number().describe('O limite total do cartão (ex: 5000)'),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, 'A cor deve estar em formato hexadecimal (ex: #820AD1)').describe('A cor principal do cartão em formato hexadecimal.'),
  closingDay: z.number().int().min(1).max(31).describe('O dia de fechamento da fatura (de 1 a 31).'),
  userId: z.string().describe("O ID do usuário para associar o cartão. Este ID é fornecido no prompt do sistema.")
});

// 2. A Ferramenta em si
export const createCardTool = ai.defineTool(
  {
    name: 'createCard',
    description: 'Cria um novo cartão de crédito ou débito para o usuário no banco de dados, quando todas as informações (nome, limite, cor, dia de fechamento) forem fornecidas.',
    inputSchema: CreateCardSchema,
    outputSchema: z.string(),
  },
  async (input) => {
    try {
      // Como estamos em um ambiente de servidor, inicializamos o Firebase para obter a instância do DB.
      const { firestore } = initializeFirebase();
      
      const { userId, ...cardData } = input;

      // Chama a função de mutação que salva os dados no Firestore.
      createCardInDb(firestore, userId, cardData);

      console.log("✅ [TOOL] Ação Real Executada: createCard. Dados enviados para o Firestore:", cardData);
      
      // Retorna uma mensagem de sucesso para o LLM.
      return `O cartão '${input.name}' foi criado com sucesso no banco de dados. Avise o usuário.`;

    } catch (error) {
      console.error("🔥 [TOOL ERROR] Falha ao criar cartão no banco de dados:", error);
      // Informa ao LLM que houve um erro para que ele possa comunicar ao usuário.
      return "Ocorreu um erro técnico ao tentar salvar o cartão. Por favor, informe ao usuário que não foi possível completar a ação.";
    }
  }
);
