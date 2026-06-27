// app/api/quiz/scores/[topic_id]/route.js
// GET /api/quiz/scores/[topic_id] — Retrieve all quiz scores for a specific topic
// Expects: Authorization: Bearer <firebaseIdToken>

import { NextResponse } from 'next/server';
import { verifyFirebaseToken } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/db';

// helper to authenticate request and return user.id
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
    .select('id')
    .eq('firebase_uid', firebase_uid)
    .single();

  if (userError || !user) {
    const error = new Error('User not found in database');
    error.status = 404;
    throw error;
  }

  return user.id;
}

export async function GET(request, { params }) {
  try {
    const { topic_id: topicId } = await params;

    // 1. Authenticate user
    let userId;
    try {
      userId = await authenticateUser(request);
    } catch (authError) {
      return NextResponse.json(
        { success: false, error: authError.message },
        { status: authError.status || 401 }
      );
    }

    if (!topicId) {
      return NextResponse.json(
        { success: false, error: 'topic_id is required' },
        { status: 400 }
      );
    }

    const parsedTopicId = parseInt(topicId, 10);
    if (isNaN(parsedTopicId)) {
      return NextResponse.json(
        { success: false, error: 'topic_id must be an integer' },
        { status: 400 }
      );
    }

    // 2. Fetch all scores for this topic and user ordered by taken_at DESC
    const { data: scores, error: fetchError } = await supabaseAdmin
      .from('quiz_scores')
      .select('id, topic_id, score, total, taken_at')
      .eq('topic_id', parsedTopicId)
      .eq('user_id', userId)
      .order('taken_at', { ascending: false });

    if (fetchError) {
      console.error('[quiz-scores-list] Fetch error:', fetchError);
      return NextResponse.json(
        { success: false, error: 'Database error while retrieving scores' },
        { status: 500 }
      );
    }

    // 3. Return success response
    return NextResponse.json({
      success: true,
      data: {
        scores: scores || [],
      },
    });

  } catch (error) {
    console.error('[quiz-scores-list] Unexpected error in GET:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
