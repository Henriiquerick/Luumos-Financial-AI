
'use server';

import { NextResponse } from 'next/server';
import { ALL_CATEGORIES } from '@/lib/constants';
// A função de categorização agora é local e não depende mais de um serviço externo de IA.
// Isso a torna mais rápida, mais barata e mais previsível.

// Uma função simples baseada em palavras-chave. Pode ser expandida com mais lógica.
function categorizeTransactionLocally(description: string): string {
    const lowerDesc = description.toLowerCase();

    // Mapeamento de palavras-chave para categorias. A ordem importa.
    const keywordMap: { [key: string]: string[] } = {
        'Groceries': ['supermercado', 'mercado', 'hortifruti', 'sacolão', 'pão de açúcar', 'carrefour'],
        'Dining': ['restaurante', 'ifood', 'rappi', 'lanche', 'bar', 'café', 'padaria'],
        'Transport': ['uber', '99', 'metrô', 'onibus', 'gasolina', 'combustível', 'estacionamento'],
        'Shopping': ['roupa', 'vestuário', 'calçado', 'loja', 'shopping', 'amazon', 'mercado livre'],
        'Entertainment': ['cinema', 'show', 'teatro', 'streaming', 'netflix', 'spotify', 'jogo'],
        'Utilities': ['luz', 'água', 'gás', 'internet', 'telefone', 'celular', 'conta de'],
        'Rent': ['aluguel', 'condomínio'],
        'Salary': ['salário', 'pagamento', 'adiantamento'],
        'Investments': ['investimento', 'corretora', 'ações', 'fundo'],
    };

    for (const category in keywordMap) {
        for (const keyword of keywordMap[category]) {
            if (lowerDesc.includes(keyword)) {
                return category;
            }
        }
    }

    return 'Other'; // Categoria padrão
}


export async function POST(req: Request) {
  try {
    const { description } = await req.json();

    if (!description) {
      return NextResponse.json({ error: 'Description is required' }, { status: 400 });
    }
    
    // Usa a nova função local para categorizar
    const category = categorizeTransactionLocally(description);

    // Garante que a categoria é válida antes de retornar
    const finalCategory = ALL_CATEGORIES.includes(category as any) ? category : 'Other';

    return NextResponse.json({ category: finalCategory });

  } catch (e: any) {
    console.error('Error in /api/categorize:', e);
    return new Response(JSON.stringify({ error: e.message || 'An internal error occurred.' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
