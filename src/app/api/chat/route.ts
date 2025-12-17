import { contextualChatFlow } from '@/ai/flows/contextual-chat';
import { NextResponse } from 'next/server';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // LOG IMPORTANTE: Vamos ver no terminal o que está chegando
    console.log("📨 Payload recebido:", JSON.stringify(body).substring(0, 100));

    // --- O TRADUTOR ---
    // O frontend manda { messages: [...] }, mas o fluxo quer { message: string }
    let messageText = "";

    if (body.messages && Array.isArray(body.messages)) {
      // Pega a última mensagem do array
      const lastMessage = body.messages[body.messages.length - 1];
      messageText = lastMessage.content || "";
    } else if (body.message) {
      messageText = body.message;
    }

    // Se não achou texto, avisa
    if (!messageText) {
      console.error("❌ Nenhuma mensagem de texto encontrada no payload");
      return NextResponse.json({ error: "Mensagem vazia" }, { status: 400, headers: corsHeaders });
    }

    console.log("🗣️ Enviando para IA:", messageText);

    // Agora chamamos o fluxo com o dado LIMPO
    const responseText = await contextualChatFlow({ message: messageText });
    
    return NextResponse.json({ text: responseText }, { headers: corsHeaders });

  } catch (error: any) {
    console.error("🔥 ERRO NO SERVIDOR:", error);
    // Retornamos o erro JSON para o frontend não ficar tentando adivinhar
    return NextResponse.json(
      { error: error.message || 'Erro interno' }, 
      { status: 500, headers: corsHeaders }
    );
  }
}