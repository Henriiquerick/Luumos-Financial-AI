import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { adminDb } from '@/lib/firebase-admin';
import { FieldValue, Timestamp } from 'firebase-admin/firestore';
import { PLAN_LIMITS } from '@/lib/constants';
import { isBefore, startOfToday } from 'date-fns';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENAI_API_KEY || '');

const ADMIN_IDS = [ "S5f4IWY1eFTKIIjE2tJH5o5EUwv1", "rickson.henrique2018@gmail.com" ];

const getDateFromTimestamp = (date: any): Date | null => { 
    if (!date) return null;
    if (date instanceof Timestamp) return date.toDate(); 
    if (date._seconds) return new Date(date._seconds * 1000); // Formato interno as vezes
    if (date instanceof Date) return date; 
    return null; 
};

export async function POST(req: Request) { 
    try { 
        const { userId, messages, data } = await req.json();

        if (!userId) return NextResponse.json({ error: 'User ID required' }, { status: 400 });
        // --- 1. Busca Usuário (Sem Auth, só Firestore) ---
        const userRef = adminDb.collection('users').doc(userId);
        const userDoc = await userRef.get();
        if (!userDoc.exists) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }
        const userData = userDoc.data();
        // Verifica Admin (Hardcoded IDs + Flag no banco)
        const isAdmin = ADMIN_IDS.includes(userId) || userData?.isAdmin === true;

        // --- 2. Lógica de Reset Diário (5 Créditos) ---
        if (!isAdmin) {
            const today = startOfToday();
            const lastReset = getDateFromTimestamp(userData?.lastCreditReset);
            if (!lastReset || isBefore(lastReset, today)) {
                const planLimit = PLAN_LIMITS.free; // 5
                await userRef.update({
                    dailyCredits: planLimit,
                    lastCreditReset: FieldValue.serverTimestamp()
                });
                
                if (userData) userData.dailyCredits = planLimit;
            }
        }
        // --- 3. Verifica Saldo ---
        if (!isAdmin) {
            const total = (userData?.dailyCredits || 0) + (userData?.credits || 0);
            if (total <= 0) {
                return NextResponse.json(
                    { error: 'Sem créditos.', code: '403_INSUFFICIENT_CREDITS' },
                    { status: 403 }
                );
            }
        }
        // --- 4. Gera Resposta (Gemini) ---
        const systemInstruction = `
          Atue como consultor financeiro.
          Contexto: ${JSON.stringify(data || {})}
        `;
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const chat = model.startChat({
            history: [
                { role: "user", parts: [{ text: systemInstruction }] },
                { role: "model", parts: [{ text: "Ok." }] },
            ],
        });
        const result = await chat.sendMessage(messages[messages.length - 1]?.content || "Olá");
        const textResponse = result.response.text();
        // --- 5. Desconta Crédito ---
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
