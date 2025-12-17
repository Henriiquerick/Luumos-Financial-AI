
import { contextualChatFlow } from '@/ai/flows/contextual-chat';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // 1. Extração da Mensagem (Mantemos a lógica que já funciona)
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

    // 2. Extração dos Dados (A NOVIDADE)
    // O frontend envia { messages: [...], data: { ... } }
    // Vamos pegar esse 'data' e passar para frente.
    const contextData = body.data || {};

    console.log("🎭 Personalidade solicitada:", contextData.persona || "Padrão");

    // 3. Enviamos Mensagem + Dados para o Fluxo
    const responseText = await contextualChatFlow({ 
      message: messageText,
      data: contextData 
    });
    
    return NextResponse.json({ text: responseText });

  } catch (error: any) {
    console.error("🔥 ERRO:", error);
    return NextResponse.json(
      { error: error.message || 'Erro interno na IA' }, 
      { status: 500 }
    );
  }
}
