
'use server';

import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';
import { ALL_CATEGORIES } from '@/lib/constants';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

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

    const completion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { 
          role: 'user', 
          content: `Transaction Description: "${description}"\n\nUser History (for context): ${historyString}` 
        }
      ],
      model: 'llama-3.1-8b-instant',
      temperature: 0,
    });

    const category = completion.choices[0]?.message?.content?.trim() || 'Other';

    // Garante que a IA não "inventou" uma categoria
    const finalCategory = ALL_CATEGORIES.includes(category as any) ? category : 'Other';

    return NextResponse.json({ category: finalCategory });

  } catch (e: any) {
    console.error('Error in /api/categorize:', e);
    return new Response(JSON.stringify({ error: e.message || 'An internal error occurred.' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
