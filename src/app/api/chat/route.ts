import { contextualChatFlow } from '@/ai/flows/contextual-chat';
import { NextResponse } from 'next/server';

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    let finalMessage = "";
    
    if (body.messages && Array.isArray(body.messages)) {
        const lastMsg = body.messages[body.messages.length - 1];
        finalMessage = lastMsg.content || "";
    } 
    else if (body.message) {
        finalMessage = body.message;
    }

    if (!finalMessage) throw new Error("Mensagem vazia recebida.");

    const responseText = await contextualChatFlow({ message: finalMessage });
    
    return NextResponse.json({ text: responseText });

  } catch (error: any) {
    console.error("🔥 ERRO DETALHADO:", error);
    return NextResponse.json({ error: "Erro interno na IA" }, { status: 500 });
  }
}
