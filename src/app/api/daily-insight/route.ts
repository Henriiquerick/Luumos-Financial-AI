import { getDailyInsight } from '@/ai/flows/get-daily-insight';
import { generateInsightAnalysis } from '@/lib/finance-utils';
import type { Transaction, AIPersonality } from '@/lib/types';

export async function POST(req: Request) {
  try {
    const { transactions, balance, personality } = await req.json() as { transactions: Transaction[], balance: number, personality: AIPersonality };

    const analysis = generateInsightAnalysis(transactions, balance);

    const result = await getDailyInsight({
        analysis,
        systemInstruction: personality.systemInstruction,
    });

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e: any) {
    console.error('Error in /api/daily-insight:', e);
    return new Response(JSON.stringify({ error: e.message || 'An internal error occurred.' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
