import { contextualChatFlow } from '@/ai/flows/contextual-chat';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Lógica robusta para extrair texto de diferentes formatos
    let messageText = "";

    if (body.messages && Array.isArray(body.messages)) {
      const lastMessage = body.messages[body.messages.length - 1];
      messageText = lastMessage.content || "";
    } else if (body.message) {
      messageText = body.message;
    }

    if (!messageText) {
      return NextResponse.json({ error: "Mensagem vazia" }, { status: 400 });
    }

    // Chama o fluxo passando o objeto EXATO que o Zod espera
    const responseText = await contextualChatFlow({ message: messageText });
    
    return NextResponse.json({ text: responseText });

  } catch (error: any) {
    console.error("🔥 ERRO:", error);
    // Retorna JSON mesmo em caso de erro, evitando o erro '<' no frontend
    return NextResponse.json(
      { error: error.message || 'Erro interno na IA' }, 
      { status: 500 }
    );
  }
}