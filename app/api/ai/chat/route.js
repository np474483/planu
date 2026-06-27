// app/api/ai/chat/route.js
// POST /api/ai/chat — Get a conversational tutoring response from Gemini AI
// Expects: Authorization: Bearer <firebaseIdToken>

import { NextResponse } from 'next/server';
import { verifyFirebaseToken } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/db';
import { generateChatResponse } from '@/lib/gemini';

// helper to authenticate request and return full user info
async function authenticateUser(request) {
  const decodedToken = await verifyFirebaseToken(request);
  const firebase_uid = decodedToken.uid;
  if (!firebase_uid) {
    const error = new Error('Invalid token: missing uid');
    error.status = 400;
    throw error;
  }

  const { data: user, error: userError } = await supabaseAdmin
    .from('users')
    .select('id, education_level, class_or_year')
    .eq('firebase_uid', firebase_uid)
    .single();

  if (userError || !user) {
    const error = new Error('User not found in database');
    error.status = 404;
    throw error;
  }

  return user;
}

export async function POST(request) {
  try {
    // 1. Authenticate user
    let user;
    try {
      user = await authenticateUser(request);
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

    const { message, subjectName, topicName, history } = body;

    // 3. Validate input message
    if (!message || !message.trim()) {
      return NextResponse.json(
        { success: false, error: 'message is required and cannot be empty' },
        { status: 400 }
      );
    }

    // 4. Call Gemini AI to get tutor response
    let reply;
    try {
      reply = await generateChatResponse(
        user.education_level || 'school',
        user.class_or_year || 'Class 10',
        subjectName || 'General Studies',
        topicName || '',
        message.trim(),
        history || []
      );
    } catch (geminiError) {
      console.error('[ai-chat] Gemini error:', geminiError);
      
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

    // 5. Return success response
    return NextResponse.json({
      success: true,
      data: {
        reply,
      },
    });

  } catch (error) {
    console.error('[ai-chat] Unexpected error in POST:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
