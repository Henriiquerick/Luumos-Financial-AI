import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { adminDb } from '@/lib/firebase-admin';
import { FieldValue, Timestamp } from 'firebase-admin/firestore';
import { PLAN_LIMITS } from '@/lib/constants';
import { isBefore, startOfToday } from 'date-fns';
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENAI_API_KEY || '');

// IDs dos Admins (Você não gasta créditos) 
const ADMIN_IDS = [ "S5f4IWY1eFTKIIjE2tJH5o5EUwv1", "rickson.henrique2018@gmail.com" ];

const getDateFromTimestamp = (date: any): Date | null => { 
    if (date instanceof Timestamp) return date.toDate(); 
    if (date && date.seconds) return new Date(date.seconds * 1000); 
    if (date instanceof Date) return date; return null; 
};

export async function POST(req: Request) { 
    try { 
        const { userId, messages, data } = await req.json();

        if (!userId) return NextResponse.json({ error: 'User ID required' }, { status: 400 });
        // 1. Busca Usuário no Banco
        const userRef = adminDb.collection('users').doc(userId);
        const userDoc = await userRef.get();
        if (!userDoc.exists) return NextResponse.json({ error: 'User not found' }, { status: 404 });
        const userData = userDoc.data();
        // Verifica se é Admin 
        const isAdmin = ADMIN_IDS.includes(userId) || userData?.isAdmin === true || userData?.email === ADMIN_IDS[1];

        // 2. Lógica de Reset Diário (Se não for Admin)
        if (!isAdmin) {
        const today = startOfToday();
        const lastReset = getDateFromTimestamp(userData?.lastCreditReset);
        // Se nunca resetou ou resetou antes de hoje, renova os créditos
        if (!lastReset || isBefore(lastReset, today)) {
            const planLimit = PLAN_LIMITS.free; // Agora vale 5
            await userRef.update({
            dailyCredits: planLimit,
            lastCreditReset: FieldValue.serverTimestamp()
            });
            
            // Atualiza localmente para não bloquear a requisição atual
            if (userData) userData.dailyCredits = planLimit;
            console.log('♻️ Créditos renovados:', planLimit);
        }
        }
        // 3. Verificação de Saldo
        if (!isAdmin) {
        const daily = userData?.dailyCredits || 0;
        const extra = userData?.credits || 0;
        const total = daily + extra;
        if (total <= 0) {
            return NextResponse.json(
            { error: 'Sem créditos diários. Assista um anúncio!', code: '403_INSUFFICIENT_CREDITS' },
            { status: 403 }
            );
        }
        }
        // 4. Gera Resposta com Gemini
        const systemInstruction = `
        Atue como um consultor financeiro.
        Contexto Financeiro: ${JSON.stringify(data || {})}
        Seja direto e útil.
        `;
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const chat = model.startChat({
        history: [
            { role: "user", parts: [{ text: systemInstruction }] },
            { role: "model", parts: [{ text: "Ok. Analisarei os dados." }] },
        ],
        });
        const lastMsgContent = messages[messages.length - 1]?.content || "Olá";
        const result = await chat.sendMessage(lastMsgContent);
        const textResponse = result.response.text();
        // 5. Desconta Créditos (Primeiro do diário, depois do extra)
        if (!isAdmin) {
            if ((userData?.dailyCredits || 0) > 0) {
                await userRef.update({ dailyCredits: FieldValue.increment(-1) });
            } else {
                await userRef.update({ credits: FieldValue.increment(-1) });
            }
        }
        return NextResponse.json({ text: textResponse });
    } catch (error: any) { 
        console.error('API Error:', error); 
        return NextResponse.json({ error: error.message }, { status: 500 }); 
    } 
}
