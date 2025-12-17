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

    console.log("🗣️ Enviando para o Fluxo:", finalMessage);

    // 2. A CORREÇÃO MÁGICA:
    // Enviamos um objeto com a chave 'message', EXATAMENTE como definimos no passo 1.
    const responseText = await contextualChatFlow({ message: finalMessage });
    
    return NextResponse.json({ text: responseText });

  } catch (error: any) {
    // Isso vai mostrar o erro REAL no seu terminal (VS Code), olhe lá se der erro de novo!
    console.error("🔥 ERRO DETALHADO:", error);
    return NextResponse.json({ error: "Erro interno na IA" }, { status: 500 });
  }
}