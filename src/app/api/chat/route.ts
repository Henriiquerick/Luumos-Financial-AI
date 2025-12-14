import { contextualChat } from '@/ai/flows/contextual-chat';

export async function POST(req: Request) {
  try {
    const { messages, data } = await req.json();

    // Executa o fluxo do Genkit
    const result = await contextualChat({
      messages,
      data,
    });

    // Retorna apenas o texto da resposta
    return new Response(result.response, {
      status: 200,
      headers: { 'Content-Type': 'text/plain' },
    });
  } catch (e: any) {
    console.error('Error in /api/chat:', e);
    return new Response(e.message || 'An internal error occurred.', { status: 500 });
  }
}
