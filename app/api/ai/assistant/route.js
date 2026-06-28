// app/api/ai/assistant/route.js
// POST /api/ai/assistant — App Assistant chatbot route utilizing Gemini AI
// Expects: Authorization: Bearer <firebaseIdToken>

import { NextResponse } from 'next/server';
import { verifyFirebaseToken } from '@/lib/auth';
import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  throw new Error('Missing GEMINI_API_KEY environment variable. Set it in .env.local');
}

const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

export async function POST(request) {
  try {
    // 1. Authenticate user
    try {
      await verifyFirebaseToken(request);
    } catch (authError) {
      return NextResponse.json(
        { success: false, error: authError.message },
        { status: authError.status || 401 }
      );
    }

    // 2. Parse request body
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, error: 'Malformed JSON in request body' },
        { status: 400 }
      );
    }

    const { message, history } = body;

    // 3. Validate message not empty
    if (!message || !message.trim()) {
      return NextResponse.json(
        { success: false, error: 'message is required and cannot be empty' },
        { status: 400 }
      );
    }

    // 4. Build prompt
    const systemPrompt = `You are PlanU Assistant — a helpful guide for the PlanU study planner app.

About PlanU:
PlanU is an AI-powered study planner for students from School to Master's level.

Features:
- Dashboard: See all subjects and overall progress
- Study Plan: AI generates a day-by-day study schedule
- AI Chat: Ask any academic topic question
- Progress: Track topic completion per subject
- Quiz: Take a 5-question MCQ quiz on any topic
- Reminders: Set study reminders with push notifications
- Profile: Manage your account and education level

How to use:
- Add subject: Dashboard → tap + → enter name and exam date
- Add topics: Open any subject → tap + → enter topic name
- Generate plan: Go to Study Plan tab → tap Generate My Plan
- Chat with AI: Go to AI Chat tab → select subject → ask question
- Take quiz: Open any topic → tap Take Quiz
- Set reminder: Go to Reminders → tap + → set time and label

Rules:
- Only answer questions about PlanU and studying
- If asked anything unrelated say: I can only help with PlanU and your studies
- Keep answers short and mobile-friendly
- Be encouraging and positive`;

    const formattedHistory = (history || [])
      .slice(-6)
      .map(m => (m.role === 'user' ? 'User' : 'Assistant') + ': ' + m.text)
      .join('\n');

    const fullPrompt = systemPrompt + 
      "\n\nConversation history:\n" +
      formattedHistory +
      '\n\nUser: ' + message.trim() + 
      '\n\nAssistant:';

    // 5. Call Gemini
    let reply;
    try {
      const result = await model.generateContent(fullPrompt);
      reply = result.response.text();
    } catch (geminiError) {
      console.error('[ai-assistant] Gemini error:', geminiError);

      const errMsg = geminiError.message || '';
      const isRateLimit = errMsg.includes('429') || 
                          errMsg.toLowerCase().includes('quota') ||
                          errMsg.toLowerCase().includes('rate limit');
                          
      if (isRateLimit) {
        return NextResponse.json(
          { success: false, error: 'AI is busy right now, please try again in a moment' },
          { status: 429 }
        );
      }

      return NextResponse.json(
        { success: false, error: 'AI response failed, please try again' },
        { status: 500 }
      );
    }

    // 6. Return success
    return NextResponse.json({
      success: true,
      data: {
        reply,
      },
    });

  } catch (error) {
    console.error('[ai-assistant] Unexpected error in POST:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
