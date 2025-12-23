
'use server';

import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { ALL_CATEGORIES } from '@/lib/constants';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENAI_API_KEY || '');

export async function POST(req: Request) {
  try {
    const { description, userHistory } = await req.json();

    if (!description) {
      return NextResponse.json({ error: 'Description is required' }, { status: 400 });
    }

    const categoryList = ALL_CATEGORIES.join(', ');
    const historyString = userHistory ? JSON.stringify(userHistory) : "Nenhum histórico disponível.";

    const systemPrompt = `
        You are a personal finance expert. Your task is to suggest ONE category for a transaction based on its description.
        You MUST choose one of the following categories: ${categoryList}.
        Do not invent new categories.
        Analyze the user's transaction history to make a more accurate suggestion if available.
        Respond with ONLY the category name and nothing else.
    `;
    
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const prompt = `Transaction Description: "${description}"\n\nUser History (for context): ${historyString}`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let category = response.text().trim();


    // Garante que a IA não "inventou" uma categoria
    const finalCategory = ALL_CATEGORIES.includes(category as any) ? category : 'Other';

    return NextResponse.json({ category: finalCategory });

  } catch (e: any) {
    console.error('Error in /api/categorize:', e);
    return new Response(JSON.stringify({ error: e.message || 'An internal error occurred.' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
