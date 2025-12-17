
import { contextualChatFlow } from '@/ai/flows/contextual-chat';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
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

    const contextData = body.data || {};
    const knowledgeId = contextData.knowledgeId;
    const personalityId = contextData.personalityId;

    const responseText = await contextualChatFlow({ 
      message: messageText,
      data: contextData,
      knowledgeId,
      personalityId,
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
