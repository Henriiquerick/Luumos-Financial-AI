import { contextualChat } from '@/ai/flows/contextual-chat';

export const maxDuration = 60; // Extend timeout for complex agent actions

export async function POST(req: Request) {
  try {
    // We also need to pass the user ID to the flow so it can perform actions on their behalf.
    const { messages, data, userId } = await req.json();

    // Execute the Genkit flow
    const result = await contextualChat({
      messages,
      data,
      userId,
    });

    // Return the text part of the response
    return new Response(result.response, {
      status: 200,
      headers: { 'Content-Type': 'text/plain' },
    });
  } catch (e: any) {
    console.error('Error in /api/chat:', e);
    return new Response(e.message || 'An internal error occurred.', { status: 500 });
  }
}
