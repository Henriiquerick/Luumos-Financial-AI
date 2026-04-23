
'use server';

import { NextResponse } from 'next/server';
import { initAdmin } from '@/firebase/admin';
import { getFirestore, Timestamp, FieldValue, WriteBatch } from 'firebase-admin/firestore';
import type { RecurringExpense } from '@/lib/types';
import { addMonths, addWeeks, addYears, isAfter } from 'date-fns';

const app = initAdmin();
const db = getFirestore(app);

// Função para converter data do Firestore (Timestamp ou Date) para um objeto Date do JS
const getDateFromFirestore = (date: any): Date => {
  if (date instanceof Timestamp) return date.toDate();
  if (date instanceof Date) return date;
  // Fallback para strings de data, embora o ideal seja sempre usar Timestamps
  return new Date(date);
};

export async function GET(req: Request) {
  // --- Camada de Segurança ---
  const cronSecret = process.env.CRON_SECRET;
  const authorizationHeader = req.headers.get('authorization');

  if (!cronSecret || authorizationHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!app) {
    return NextResponse.json({ error: "Server configuration missing" }, { status: 500 });
  }

  const now = new Date();
  let processedCount = 0;

  try {
    // 1. Buscar todas as despesas recorrentes que precisam ser processadas
    const recurringExpensesRef = db.collectionGroup('recurring_expenses');
    const querySnapshot = await recurringExpensesRef
      .where('isActive', '==', true)
      .where('nextTriggerDate', '<=', Timestamp.fromDate(now))
      .get();

    if (querySnapshot.empty) {
      return NextResponse.json({ message: 'No pending recurring expenses to process.' });
    }

    // Usar um WriteBatch para eficiência
    const batch = db.batch();

    // 2. Loop para processar cada despesa encontrada
    for (const doc of querySnapshot.docs) {
      const expense = { id: doc.id, ...doc.data() } as RecurringExpense;
      const userPath = doc.ref.parent.parent; // A referência para o documento do usuário (ex: /users/{userId})
      
      if (!userPath) continue;

      // --- Lógica de Criação da Transação ---
      const transactionRef = db.collection(userPath.path).doc('transactions').collection('transactions').doc();
      batch.set(transactionRef, {
        description: expense.description,
        amount: expense.amount,
        category: expense.category,
        date: Timestamp.fromDate(now), // A transação é registrada no dia que o cron rodou
        type: 'expense',
        installments: 1,
        recurringId: expense.id,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });

      // --- Lógica de Atualização da Recorrência ---
      const currentNextDate = getDateFromFirestore(expense.nextTriggerDate);
      let newNextTriggerDate: Date;

      switch (expense.frequency) {
        case 'weekly':
          newNextTriggerDate = addWeeks(currentNextDate, 1);
          break;
        case 'yearly':
          newNextTriggerDate = addYears(currentNextDate, 1);
          break;
        case 'monthly':
        default:
          newNextTriggerDate = addMonths(currentNextDate, 1);
          break;
      }

      const updates: { nextTriggerDate: Timestamp, isActive?: boolean } = {
        nextTriggerDate: Timestamp.fromDate(newNextTriggerDate),
      };

      // Se houver uma data final e a nova data de cobrança for depois dela, desativa a recorrência
      if (expense.endDate && isAfter(newNextTriggerDate, getDateFromFirestore(expense.endDate))) {
        updates.isActive = false;
      }

      batch.update(doc.ref, updates);
      processedCount++;
    }

    // 3. Comitar todas as operações atômicas
    await batch.commit();

    return NextResponse.json({
      message: `Successfully processed ${processedCount} recurring expenses.`,
      processedCount: processedCount
    });

  } catch (error: any) {
    console.error("Error processing recurring expenses:", error);
    return NextResponse.json(
      { error: 'An internal error occurred', details: error.message },
      { status: 500 }
    );
  }
}
