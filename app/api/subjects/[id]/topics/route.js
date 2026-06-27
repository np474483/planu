// app/api/subjects/[id]/topics/route.js
// GET /api/subjects/[id]/topics — Get all topics for a subject
// POST /api/subjects/[id]/topics — Add a new topic to a subject
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

// helper to check if a subject belongs to a user
async function checkSubjectOwnership(subjectId, userId) {
  const { data: subject, error: checkError } = await supabaseAdmin
    .from('subjects')
    .select('id')
    .eq('id', subjectId)
    .eq('user_id', userId)
    .single();

  if (checkError || !subject) {
    return false;
  }
  return true;
}

// ─── GET: List all topics under subject ──────────────────────────

export async function GET(request, { params }) {
  try {
    const { id: subjectId } = await params;

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

    // 2. Verify subject ownership
    const isOwned = await checkSubjectOwnership(subjectId, userId);
    if (!isOwned) {
      return NextResponse.json(
        { success: false, error: 'Subject not found or unauthorized' },
        { status: 404 }
      );
    }

    // 3. Fetch topics ordered by created_at ASC
    const { data: topics, error: fetchError } = await supabaseAdmin
      .from('topics')
      .select('*')
      .eq('subject_id', subjectId)
      .order('created_at', { ascending: true });

    if (fetchError) {
      console.error('[topics] Fetch error:', fetchError);
      return NextResponse.json(
        { success: false, error: 'Database error while fetching topics' },
        { status: 500 }
      );
    }

    // 4. Return success
    return NextResponse.json({
      success: true,
      data: {
        topics: topics || [],
      },
    });

  } catch (error) {
    console.error('[topics] Unexpected error in GET:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// ─── POST: Add Topic to Subject ─────────────────────────────────

export async function POST(request, { params }) {
  try {
    const { id: subjectId } = await params;

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

    // 2. Verify subject ownership
    const isOwned = await checkSubjectOwnership(subjectId, userId);
    if (!isOwned) {
      return NextResponse.json(
        { success: false, error: 'Subject not found or unauthorized' },
        { status: 404 }
      );
    }

    // 3. Parse request body
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, error: 'Malformed JSON in request body' },
        { status: 400 }
      );
    }

    const { name } = body;

    // 4. Validate inputs
    if (!name || typeof name !== 'string' || name.trim() === '') {
      return NextResponse.json(
        { success: false, error: 'Topic name is required and cannot be empty' },
        { status: 400 }
      );
    }

    // 5. INSERT new topic
    const { data: topic, error: insertError } = await supabaseAdmin
      .from('topics')
      .insert({
        subject_id: subjectId,
        name: name.trim(),
        status: 'not_started', // default status
      })
      .select()
      .single();

    if (insertError) {
      console.error('[topics] Insert error:', insertError);
      return NextResponse.json(
        { success: false, error: 'Database error while creating topic' },
        { status: 500 }
      );
    }

    // 6. Return success
    return NextResponse.json({
      success: true,
      data: {
        topic,
      },
    });

  } catch (error) {
    console.error('[topics] Unexpected error in POST:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
