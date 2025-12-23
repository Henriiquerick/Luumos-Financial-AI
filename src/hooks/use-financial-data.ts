'use client';

import { useQuery } from '@tanstack/react-query';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { useUser, useFirestore } from '@/firebase';
import type { Transaction, CreditCard, CustomCategory, FinancialGoal } from '@/lib/types';
import { getDateFromTimestamp } from '@/lib/finance-utils';

// Tipagem para o retorno da query
interface FinancialData {
  transactions: Transaction[];
  visibleTransactions: Transaction[]; // Nova lista filtrada
  creditCards: CreditCard[];
  customCategories: CustomCategory[];
  goals: FinancialGoal[];
}

/**
 * Hook customizado para buscar todos os dados financeiros essenciais do usuário
 * com cache gerenciado pelo TanStack Query.
 */
export function useFinancialData() {
  const { user } = useUser();
  const firestore = useFirestore();

  return useQuery<FinancialData>({
    // A chave da query inclui o UID do usuário para garantir que o cache é por usuário.
    queryKey: ['financial-data', user?.uid],
    queryFn: async () => {
      // Se não houver usuário ou firestore, não faz nada.
      if (!user?.uid || !firestore) {
        return {
          transactions: [],
          visibleTransactions: [],
          creditCards: [],
          customCategories: [],
          goals: [],
        };
      }

      // Cria referências para todas as coleções necessárias
      const transactionsRef = collection(firestore, 'users', user.uid, 'transactions');
      const cardsRef = collection(firestore, 'users', user.uid, 'cards');
      const categoriesRef = collection(firestore, 'users', user.uid, 'custom_categories');
      const goalsRef = collection(firestore, 'users', user.uid, 'goals');
      
      // Define a ordenação para as transações
      const transactionsQuery = query(transactionsRef, orderBy('date', 'desc'));

      // Executa todas as buscas em paralelo para otimizar o tempo de carregamento
      const [
        transactionsSnapshot,
        cardsSnapshot,
        categoriesSnapshot,
        goalsSnapshot,
      ] = await Promise.all([
        getDocs(transactionsQuery),
        getDocs(cardsRef),
        getDocs(categoriesRef),
        getDocs(goalsRef),
      ]);

      // Mapeia os resultados dos snapshots para os tipos de dados da aplicação
      const transactions = transactionsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: getDateFromTimestamp(doc.data().date) // Converte Timestamps para Dates
      } as Transaction));
      
      // FILTRO: Esconde as parcelas futuras (cuja descrição termina com (X/Y))
      const visibleTransactions = transactions.filter(t => !/\(\d+\/\d+\)$/.test(t.description));

      const creditCards = cardsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as CreditCard));

      const customCategories = categoriesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as CustomCategory));

      const goals = goalsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as FinancialGoal));
      
      // Retorna um objeto único com todos os dados
      return { transactions, visibleTransactions, creditCards, customCategories, goals };
    },
    // A query só será executada se o 'enabled' for true.
    enabled: !!user?.uid && !!firestore,
  });
}
