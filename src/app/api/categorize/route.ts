import { categorizeTransaction } from '@/ai/flows/categorize-transaction';

export async function POST(req: Request) {
  try {
    const { description, userHistory } = await req.json();

    const result = await categorizeTransaction({
      description,
      userHistory: JSON.stringify(userHistory),
    });

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e: any) {
    console.error('Error in /api/categorize:', e);
    return new Response(JSON.stringify({ error: e.message || 'An internal error occurred.' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
