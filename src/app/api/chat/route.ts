import { contextualChatFlow } from '@/ai/flows/contextual-chat'; // Verifique se o caminho está correto
import { runFlow } from '@genkit-ai/flow';
import { NextResponse } from 'next/server';

// 1. Configuração para permitir CORS (Evita o bloqueio entre porta 9000 e 6000)
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// 2. Manipula a requisição OPTIONS (o "aperto de mão" do navegador)
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { message } = body;

    console.log("Recebendo mensagem na API:", message);

    if (!message) {
      return NextResponse.json(
        { error: 'Mensagem é obrigatória' }, 
        { status: 400, headers: corsHeaders }
      );
    }
    const response = await contextualChatFlow({ 
      userMessage: message 
    });
    
    console.log("Resposta do Genkit:", response);

    return NextResponse.json({ text: response }, { headers: corsHeaders });

  } catch (error: any) {
    console.error("ERRO CRÍTICO NA API:", error);
    return NextResponse.json(
      { error: error.message || 'Erro interno no processamento da IA' }, 
      { status: 500, headers: corsHeaders }
    );
  }
}