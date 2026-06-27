// app/api/reminders/route.js
// GET /api/reminders — Retrieve all reminders for user ordered by time ASC
// POST /api/reminders — Add a new study reminder
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

// ─── GET: List reminders ────────────────────────────────────────

export async function GET(request) {
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

    // 2. Fetch all reminders with joined subject details
    const { data: remindersData, error: fetchError } = await supabaseAdmin
      .from('reminders')
      .select(`
        id,
        user_id,
        reminder_time,
        label,
        is_active,
        created_at,
        subject_id,
        subjects (
          name
        )
      `)
      .eq('user_id', userId)
      .order('reminder_time', { ascending: true });

    if (fetchError) {
      console.error('[reminders] Fetch error:', fetchError);
      return NextResponse.json(
        { success: false, error: 'Database error while fetching reminders' },
        { status: 500 }
      );
    }

    // 3. Format result (flatten subject name)
    const reminders = (remindersData || []).map((rem) => ({
      id: rem.id,
      user_id: rem.user_id,
      reminder_time: rem.reminder_time,
      label: rem.label,
      is_active: rem.is_active,
      created_at: rem.created_at,
      subject_id: rem.subject_id,
      subject_name: rem.subjects ? rem.subjects.name : null,
    }));

    // 4. Return success
    return NextResponse.json({
      success: true,
      data: {
        reminders,
      },
    });

  } catch (error) {
    console.error('[reminders] Unexpected error in GET:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// ─── POST: Add reminder ──────────────────────────────────────────

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

    const { reminder_time, label, subject_id } = body;

    // 3. Validate inputs
    // Expected reminder_time format: HH:MM or HH:MM:SS
    if (!reminder_time || !/^\d{2}:\d{2}(:\d{2})?$/.test(reminder_time)) {
      return NextResponse.json(
        { success: false, error: 'reminder_time is required and must be in HH:MM format' },
        { status: 400 }
      );
    }

    if (label !== undefined && typeof label !== 'string') {
      return NextResponse.json(
        { success: false, error: 'label must be a string' },
        { status: 400 }
      );
    }

    const cleanLabel = label ? label.trim() : null;
    const parsedSubjectId = subject_id && subject_id !== '' ? parseInt(subject_id, 10) : null;

    // 4. If subject_id provided, verify it belongs to this user
    if (parsedSubjectId) {
      const { data: subjectCheck, error: subjectError } = await supabaseAdmin
        .from('subjects')
        .select('id')
        .eq('id', parsedSubjectId)
        .eq('user_id', userId)
        .single();

      if (subjectError || !subjectCheck) {
        return NextResponse.json(
          { success: false, error: 'Linked subject not found or unauthorized' },
          { status: 404 }
        );
      }
    }

    // 5. INSERT new reminder
    const { data: newReminder, error: insertError } = await supabaseAdmin
      .from('reminders')
      .insert({
        user_id: userId,
        reminder_time,
        label: cleanLabel,
        subject_id: parsedSubjectId,
        is_active: true, // Default active
      })
      .select(`
        id,
        user_id,
        reminder_time,
        label,
        is_active,
        created_at,
        subject_id,
        subjects (
          name
        )
      `)
      .single();

    if (insertError) {
      console.error('[reminders] Insert error:', insertError);
      return NextResponse.json(
        { success: false, error: 'Database error while creating reminder' },
        { status: 500 }
      );
    }

    // 6. Format result for output
    const reminder = {
      id: newReminder.id,
      user_id: newReminder.user_id,
      reminder_time: newReminder.reminder_time,
      label: newReminder.label,
      is_active: newReminder.is_active,
      created_at: newReminder.created_at,
      subject_id: newReminder.subject_id,
      subject_name: newReminder.subjects ? newReminder.subjects.name : null,
    };

    // 7. Return success
    return NextResponse.json({
      success: true,
      data: {
        reminder,
      },
    });

  } catch (error) {
    console.error('[reminders] Unexpected error in POST:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
