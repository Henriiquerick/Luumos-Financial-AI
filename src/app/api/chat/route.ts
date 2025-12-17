import { contextualChatFlow } from '@/ai/flows/contextual-chat';
import { runFlow } from '@genkit-ai/flow'; // <--- Trazemos de volta o executor
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
    if (!process.env.GOOGLE_GENAI_API_KEY) {
      return NextResponse.json({ error: 'API Key missing' }, { status: 500, headers: corsHeaders });
    }

    const body = await req.json();
    const { message } = body;

    console.log("📨 Recebendo:", message);

    // CORREÇÃO CRUCIAL AQUI:
    // Usamos runFlow porque seu Genkit define o fluxo como um objeto, não uma função.
    const response = await runFlow(contextualChatFlow, { message });
    
    console.log("✅ Resposta:", response);

    return NextResponse.json({ text: response }, { headers: corsHeaders });

  } catch (error: any) {
    console.error("🔥 ERRO NO SERVIDOR:", error);
    return NextResponse.json(
      { error: error.message || 'Erro ao processar IA' }, 
      { status: 500, headers: corsHeaders }
    );
  }
}