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
    const { message } = body;

    console.log("📨 Recebendo:", message);

    // CORREÇÃO FINAL: Chamada direta como função
    // Não usamos mais runFlow, pois ai.defineFlow cria uma função executável
    const responseText = await contextualChatFlow({ message });
    
    console.log("✅ Resposta:", responseText);

    return NextResponse.json({ text: responseText }, { headers: corsHeaders });

  } catch (error: any) {
    console.error("🔥 ERRO NO SERVIDOR:", error);
    return NextResponse.json(
      { error: error.message || 'Erro ao processar IA' }, 
      { status: 500, headers: corsHeaders }
    );
  }
}