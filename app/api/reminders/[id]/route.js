// app/api/reminders/[id]/route.js
// PUT /api/reminders/[id] — Update an existing reminder (e.g. toggle active, change time)
// DELETE /api/reminders/[id] — Delete a reminder
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

// ─── PUT: Update Reminder ────────────────────────────────────────

export async function PUT(request, { params }) {
  try {
    const { id: reminderId } = await params;

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

    // 2. Verify reminder exists and belongs to the authenticated user
    const { data: reminderCheck, error: checkError } = await supabaseAdmin
      .from('reminders')
      .select('id')
      .eq('id', reminderId)
      .eq('user_id', userId)
      .maybeSingle();

    if (checkError) {
      console.error('[reminders-id] Check ownership error:', checkError);
      return NextResponse.json(
        { success: false, error: 'Database error checking reminder ownership' },
        { status: 500 }
      );
    }

    if (!reminderCheck) {
      return NextResponse.json(
        { success: false, error: 'Reminder not found or unauthorized' },
        { status: 404 }
      );
    }

    // 3. Parse and validate body fields
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, error: 'Malformed JSON in request body' },
        { status: 400 }
      );
    }

    const { is_active, reminder_time, label } = body;
    const updateData = {};

    if (is_active !== undefined) {
      if (typeof is_active !== 'boolean') {
        return NextResponse.json(
          { success: false, error: 'is_active must be a boolean' },
          { status: 400 }
        );
      }
      updateData.is_active = is_active;
    }

    if (reminder_time !== undefined) {
      if (!reminder_time || !/^\d{2}:\d{2}(:\d{2})?$/.test(reminder_time)) {
        return NextResponse.json(
          { success: false, error: 'reminder_time must be in HH:MM format' },
          { status: 400 }
        );
      }
      updateData.reminder_time = reminder_time;
    }

    if (label !== undefined) {
      if (typeof label !== 'string') {
        return NextResponse.json(
          { success: false, error: 'label must be a string' },
          { status: 400 }
        );
      }
      updateData.label = label.trim();
    }

    // If no fields to update, return the reminder
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { success: false, error: 'No fields provided for update' },
        { status: 400 }
      );
    }

    // 4. Update the reminder
    const { data: updatedReminder, error: updateError } = await supabaseAdmin
      .from('reminders')
      .update(updateData)
      .eq('id', reminderId)
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

    if (updateError) {
      console.error('[reminders-id] Update error:', updateError);
      return NextResponse.json(
        { success: false, error: 'Database error while updating reminder' },
        { status: 500 }
      );
    }

    // 5. Format response to include joined subject name
    const reminder = {
      id: updatedReminder.id,
      user_id: updatedReminder.user_id,
      reminder_time: updatedReminder.reminder_time,
      label: updatedReminder.label,
      is_active: updatedReminder.is_active,
      created_at: updatedReminder.created_at,
      subject_id: updatedReminder.subject_id,
      subject_name: updatedReminder.subjects ? updatedReminder.subjects.name : null,
    };

    return NextResponse.json({
      success: true,
      data: {
        reminder,
      },
    });

  } catch (error) {
    console.error('[reminders-id] Unexpected error in PUT:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// ─── DELETE: Delete Reminder ─────────────────────────────────────

export async function DELETE(request, { params }) {
  try {
    const { id: reminderId } = await params;

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

    // 2. Verify ownership of the reminder before deletion
    const { data: reminderCheck, error: checkError } = await supabaseAdmin
      .from('reminders')
      .select('id')
      .eq('id', reminderId)
      .eq('user_id', userId)
      .maybeSingle();

    if (checkError) {
      console.error('[reminders-id] Check ownership for delete error:', checkError);
      return NextResponse.json(
        { success: false, error: 'Database error checking reminder ownership' },
        { status: 500 }
      );
    }

    if (!reminderCheck) {
      return NextResponse.json(
        { success: false, error: 'Reminder not found or unauthorized' },
        { status: 404 }
      );
    }

    // 3. Perform delete
    const { error: deleteError } = await supabaseAdmin
      .from('reminders')
      .delete()
      .eq('id', reminderId);

    if (deleteError) {
      console.error('[reminders-id] Delete error:', deleteError);
      return NextResponse.json(
        { success: false, error: 'Database error while deleting reminder' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
    });

  } catch (error) {
    console.error('[reminders-id] Unexpected error in DELETE:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
