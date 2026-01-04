import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const { messages, context } = await req.json();

        if (!messages || !Array.isArray(messages)) {
            return NextResponse.json(
                { message: 'Invalid messages format' },
                { status: 400 }
            );
        }

        // Get the latest query
        const latestMessage = messages[messages.length - 1];

        if (!process.env.OPENAI_API_KEY) {
            return NextResponse.json(
                { message: 'OpenAI API key not configured' },
                { status: 500 }
            );
        }

        const systemPrompt = `You are Chie, a personal finance assistant. 
    The user is currently viewing a page with the following text content:
    ---
    ${context}
    ---
    
    Answer the user's questions based on this context and your general knowledge of personal finance. 
    Be helpful, concise, and friendly. 
    If the user asks about specific numbers (like net worth), look for them in the context provided above.
    Do not invent numbers if they are not in the context.`;

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
            },
            body: JSON.stringify({
                model: 'gpt-4o',
                messages: [
                    { role: 'system', content: systemPrompt },
                    ...messages
                ],
                temperature: 0.7,
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error("OpenAI API Error:", errorData);
            throw new Error(`OpenAI API error: ${response.statusText}`);
        }

        const data = await response.json();
        const reply = data.choices[0].message.content;

        return NextResponse.json({ message: reply });
    } catch (error) {
        console.error('Error processing chat request:', error);
        return NextResponse.json(
            { message: 'Internal server error processing your request.' },
            { status: 500 }
        );
    }
}
