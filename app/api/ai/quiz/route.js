// app/api/ai/quiz/route.js
// POST /api/ai/quiz — Generate 5 MCQ questions for a topic using Gemini AI
// Expects: Authorization: Bearer <firebaseIdToken>

import { NextResponse } from 'next/server';
import { verifyFirebaseToken } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/db';
import { generateQuiz } from '@/lib/gemini';

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

    const { topic_id } = body;

    // 3. Validate input
    if (!topic_id) {
      return NextResponse.json(
        { success: false, error: 'topic_id is required' },
        { status: 400 }
      );
    }

    // 4. Fetch topic & subject details and verify ownership
    const { data: topicData, error: dbError } = await supabaseAdmin
      .from('topics')
      .select(`
        name,
        subjects!inner (
          id,
          name,
          user_id
        )
      `)
      .eq('id', topic_id)
      .eq('subjects.user_id', user.id)
      .maybeSingle();

    if (dbError) {
      console.error('[ai-quiz] Fetch topic error:', dbError);
      return NextResponse.json(
        { success: false, error: 'Database error while fetching topic details' },
        { status: 500 }
      );
    }

    if (!topicData) {
      return NextResponse.json(
        { success: false, error: 'Topic not found or unauthorized' },
        { status: 404 }
      );
    }

    const topicName = topicData.name;
    const subjectName = topicData.subjects?.name || 'General';

    // 5. Call Gemini to generate the 5 MCQ questions
    let questions;
    try {
      questions = await generateQuiz(
        user.education_level || 'school',
        subjectName,
        topicName
      );
    } catch (geminiError) {
      console.error('[ai-quiz] Gemini error:', geminiError);
      
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

    // 6. Return the generated questions list
    return NextResponse.json({
      success: true,
      data: {
        questions,
        topic_name: topicName,
        subject_id: topicData.subjects?.id,
      },
    });

  } catch (error) {
    console.error('[ai-quiz] Unexpected error in POST:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
