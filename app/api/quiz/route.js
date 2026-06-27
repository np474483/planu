// app/api/quiz/route.js
// POST /api/quiz — Save a quiz score to PostgreSQL database
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

export async function POST(request) {
  try {
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

    const { topic_id, score, total } = body;

    // 3. Validate all fields are present
    if (topic_id === undefined || score === undefined || total === undefined) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: topic_id, score, total' },
        { status: 400 }
      );
    }

    const parsedTopicId = parseInt(topic_id, 10);
    const parsedScore = parseInt(score, 10);
    const parsedTotal = parseInt(total, 10);

    if (isNaN(parsedTopicId) || isNaN(parsedScore) || isNaN(parsedTotal)) {
      return NextResponse.json(
        { success: false, error: 'topic_id, score, and total must be integers' },
        { status: 400 }
      );
    }

    // 4. Validate score logic (between 0 and total)
    if (parsedScore < 0 || parsedScore > parsedTotal) {
      return NextResponse.json(
        { success: false, error: 'Score must be between 0 and total' },
        { status: 400 }
      );
    }

    // 5. Validate total is 5 for v1
    if (parsedTotal !== 5) {
      return NextResponse.json(
        { success: false, error: 'Total questions must be 5 for version 1' },
        { status: 400 }
      );
    }

    // Verify topic exists
    const { data: topicCheck, error: topicCheckError } = await supabaseAdmin
      .from('topics')
      .select('id')
      .eq('id', parsedTopicId)
      .maybeSingle();

    if (topicCheckError || !topicCheck) {
      return NextResponse.json(
        { success: false, error: 'Target topic not found' },
        { status: 404 }
      );
    }

    // 6. INSERT into quiz_scores table
    const { data: scoreRecord, error: insertError } = await supabaseAdmin
      .from('quiz_scores')
      .insert({
        user_id: userId,
        topic_id: parsedTopicId,
        score: parsedScore,
        total: parsedTotal,
      })
      .select()
      .single();

    if (insertError) {
      console.error('[quiz-score] Insert error:', insertError);
      return NextResponse.json(
        { success: false, error: 'Database error while saving quiz score' },
        { status: 500 }
      );
    }

    // 7. Return success
    return NextResponse.json({
      success: true,
      data: {
        score_record: scoreRecord,
      },
    });

  } catch (error) {
    console.error('[quiz-score] Unexpected error in POST:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
