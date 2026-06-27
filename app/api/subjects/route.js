// app/api/subjects/route.js
// GET /api/subjects
// Retrieves all subjects for the authenticated user, ordered by exam_date ASC.
// Returns: { success: true, data: { subjects } }

import { NextResponse } from 'next/server';
import { verifyFirebaseToken } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/db';

export async function GET(request) {
  try {
    // 1. Verify Firebase ID token from Authorization header
    let decodedToken;
    try {
      decodedToken = await verifyFirebaseToken(request);
    } catch (authError) {
      return NextResponse.json(
        { success: false, error: authError.message },
        { status: authError.status || 401 }
      );
    }

    const firebase_uid = decodedToken.uid;
    if (!firebase_uid) {
      return NextResponse.json(
        { success: false, error: 'Invalid token: missing uid' },
        { status: 400 }
      );
    }

    // 2. Look up the internal user ID from the database using firebase_uid
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('firebase_uid', firebase_uid)
      .single();

    if (userError || !user) {
      console.error('[subjects] User lookup error:', userError);
      return NextResponse.json(
        { success: false, error: 'User not found in database' },
        { status: 404 }
      );
    }

    // 3. Retrieve all subjects for the user along with their topic list
    const { data: subjectsData, error: subjectsError } = await supabaseAdmin
      .from('subjects')
      .select(`
        id,
        name,
        exam_date,
        created_at,
        topics (
          id,
          status
        )
      `)
      .eq('user_id', user.id)
      .order('exam_date', { ascending: true });

    if (subjectsError) {
      console.error('[subjects] Fetch subjects error:', subjectsError);
      return NextResponse.json(
        { success: false, error: 'Database error while fetching subjects' },
        { status: 500 }
      );
    }

    // 4. Map the subjects to include topic count, completed topic count,
    // and preserve the topics array so the frontend bindings do not break.
    const subjects = (subjectsData || []).map((subject) => {
      const topicsList = subject.topics || [];
      const topic_count = topicsList.length;
      const completed_count = topicsList.filter((t) => t.status === 'completed').length;

      return {
        id: subject.id,
        name: subject.name,
        exam_date: subject.exam_date,
        created_at: subject.created_at,
        topics: topicsList,
        topic_count,
        completed_count,
      };
    });

    // 5. Return success response
    return NextResponse.json({
      success: true,
      data: {
        subjects,
      },
    });

  } catch (error) {
    console.error('[subjects] Unexpected server error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    // 1. Verify Firebase ID token from Authorization header
    let decodedToken;
    try {
      decodedToken = await verifyFirebaseToken(request);
    } catch (authError) {
      return NextResponse.json(
        { success: false, error: authError.message },
        { status: authError.status || 401 }
      );
    }

    const firebase_uid = decodedToken.uid;
    if (!firebase_uid) {
      return NextResponse.json(
        { success: false, error: 'Invalid token: missing uid' },
        { status: 400 }
      );
    }

    // 2. Look up user.id from PostgreSQL by firebase_uid
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('firebase_uid', firebase_uid)
      .single();

    if (userError || !user) {
      console.error('[subjects] User lookup error during creation:', userError);
      return NextResponse.json(
        { success: false, error: 'User not found in database' },
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

    const { name, exam_date } = body;

    // 4. Validate fields are present and not empty
    if (!name || typeof name !== 'string' || name.trim() === '') {
      return NextResponse.json(
        { success: false, error: 'Subject name is required and cannot be empty' },
        { status: 400 }
      );
    }

    if (!exam_date || typeof exam_date !== 'string' || exam_date.trim() === '') {
      return NextResponse.json(
        { success: false, error: 'Exam date is required and cannot be empty' },
        { status: 400 }
      );
    }

    // 5. Validate exam_date is a valid future date (allowing today)
    const parsedDate = new Date(exam_date);
    if (isNaN(parsedDate.getTime())) {
      return NextResponse.json(
        { success: false, error: 'Exam date must be a valid date' },
        { status: 400 }
      );
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (parsedDate < today) {
      return NextResponse.json(
        { success: false, error: 'Exam date must be today or a future date' },
        { status: 400 }
      );
    }

    // 6. INSERT into subjects table
    const { data: subject, error: insertError } = await supabaseAdmin
      .from('subjects')
      .insert({
        user_id: user.id,
        name: name.trim(),
        exam_date: exam_date.trim(),
      })
      .select()
      .single();

    if (insertError) {
      console.error('[subjects] Insert subject error:', insertError);
      return NextResponse.json(
        { success: false, error: 'Database error while creating subject' },
        { status: 500 }
      );
    }

    // 7. Return success and new subject
    // Initialize empty topics array to align with frontend schema expectation
    return NextResponse.json({
      success: true,
      data: {
        subject: {
          ...subject,
          topics: [],
          topic_count: 0,
          completed_count: 0,
        },
      },
    });

  } catch (error) {
    console.error('[subjects] Unexpected server error during creation:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
