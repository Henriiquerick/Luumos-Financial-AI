import { contextualChatFlow } from '@/ai/flows/contextual-chat';

export const maxDuration = 60; // Extend timeout for complex agent actions

export async function POST(req: Request) {
  try {
    // We also need to pass the user ID to the flow so it can perform actions on their behalf.
    const { messages, data, userId } = await req.json();
    const lastMessage = messages[messages.length - 1]?.content;


    // Execute the Genkit flow
    const response = await contextualChatFlow({
        userMessage: lastMessage,
        history: messages.slice(0, -1),
        userData: data,
    });

    // Return the text part of the response
    return new Response(response, {
      status: 200,
      headers: { 'Content-Type': 'text/plain' },
    });
  } catch (e: any) {
    console.error('Error in /api/chat:', e);
    return new Response(e.message || 'An internal error occurred.', { status: 500 });
  }
}
