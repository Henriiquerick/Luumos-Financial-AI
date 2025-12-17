import { contextualChatFlow } from '@/ai/flows/contextual-chat';
import { NextResponse } from 'next/server';

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // 1. Extração Inteligente do Texto
    let finalMessage = "";
    
    // Se o frontend mandar array de mensagens (padrão Vercel AI SDK)
    if (body.messages && Array.isArray(body.messages)) {
        const lastMsg = body.messages[body.messages.length - 1];
        finalMessage = lastMsg.content || "";
    } 
    // Se o frontend mandar objeto simples
    else if (body.message) {
        finalMessage = body.message;
    }

    if (!finalMessage) throw new Error("Mensagem vazia recebida.");

    // 2. Chamada do Fluxo com o formato correto
    const responseText = await contextualChatFlow({ message: finalMessage });
    
    return NextResponse.json({ text: responseText });

  } catch (error: any) {
    console.error("🔥 ERRO DETALHADO NA API /api/chat:", error);
    return NextResponse.json({ error: "Erro interno na IA: " + error.message }, { status: 500 });
  }
}
