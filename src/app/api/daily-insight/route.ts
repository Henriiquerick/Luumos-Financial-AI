import { getDailyInsight } from '@/ai/flows/get-daily-insight';
import { generateInsightAnalysis } from '@/lib/finance-utils';
import type { Transaction, AIPersonality } from '@/lib/types';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // 🕵️‍♂️ Log do Nerd: Vamos ver o que DIABOS está chegando do front
    console.log("Recebido no Backend:", JSON.stringify(body.personality, null, 2));

    const { transactions, balance, personality } = body as { 
      transactions: Transaction[], 
      balance: number, 
      personality: AIPersonality | undefined // Pode vir undefined!
    };

    const analysis = generateInsightAnalysis(transactions, balance);

    // 🛡️ A Blindagem: Se não tiver personalidade ou instrução, usa o Jorgin.
    // Isso garante que NUNCA passamos 'undefined' pro Genkit.
    const safeSystemInstruction = personality?.systemInstruction || 
      "You are Jorgin, a Gen Z financial assistant. You are funny, uses slang (pt-BR), and gives direct advice.";

    const result = await getDailyInsight({
        analysis,
        systemInstruction: safeSystemInstruction,
    });

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e: any) {
    console.error('Error in /api/daily-insight:', e);
    // Dica: Retornar o erro exato ajuda a debugar no front
    return new Response(JSON.stringify({ 
      error: e.message || 'An internal error occurred.',
      details: e.toString() 
    }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}