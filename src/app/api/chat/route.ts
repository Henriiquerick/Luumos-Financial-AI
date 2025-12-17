import { contextualChatFlow } from '@/ai/flows/contextual-chat';

export const maxDuration = 60; // Timeout estendido para a IA pensar

export async function POST(req: Request) {
  try {
    const { messages, data } = await req.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response("Formato de 'messages' inválido.", { status: 400 });
    }

    const lastMessage = messages[messages.length - 1].content;

    // Em Genkit 1.0, o fluxo exportado pode ser chamado diretamente como uma função assíncrona
    const responseText = await contextualChatFlow({
      userMessage: lastMessage,
      history: messages.slice(0, -1),
      userData: data // Passamos os dados de saldo/cartões aqui
    });

    // Retorna a resposta (seja texto plano ou o JSON da ação)
    return new Response(responseText, { status: 200, headers: {'Content-Type': 'text/plain'} });

  } catch (e: any) {
    console.error("Erro no fluxo do Genkit:", e);
    // Para erros de validação do Zod, o erro já é bem descritivo
    const errorMessage = e.message.includes("Parse Errors") 
      ? e.message 
      : "Erro interno na IA";
    return new Response(errorMessage, { status: 500 });
  }
}
