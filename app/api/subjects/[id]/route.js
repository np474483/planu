// app/api/subjects/[id]/route.js
// PUT /api/subjects/[id] — Update subject name and/or exam date
// DELETE /api/subjects/[id] — Delete subject (cascades to topics)
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

// ─── PUT: Update Subject ────────────────────────────────────────

export async function PUT(request, { params }) {
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

    // 2. Verify ownership of the subject
    const { data: existingSubject, error: checkError } = await supabaseAdmin
      .from('subjects')
      .select('id')
      .eq('id', subjectId)
      .eq('user_id', userId)
      .single();

    if (checkError || !existingSubject) {
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

    const { name, exam_date } = body;
    const updateData = {};

    // 4. Validate and sanitize parameters if provided
    if (name !== undefined) {
      if (typeof name !== 'string' || name.trim() === '') {
        return NextResponse.json(
          { success: false, error: 'Subject name cannot be empty' },
          { status: 400 }
        );
      }
      updateData.name = name.trim();
    }

    if (exam_date !== undefined) {
      if (typeof exam_date !== 'string' || exam_date.trim() === '') {
        return NextResponse.json(
          { success: false, error: 'Exam date cannot be empty' },
          { status: 400 }
        );
      }

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
      updateData.exam_date = exam_date.trim();
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { success: false, error: 'No fields provided for update' },
        { status: 400 }
      );
    }

    // 5. UPDATE subject
    const { data: updatedSubject, error: updateError } = await supabaseAdmin
      .from('subjects')
      .update(updateData)
      .eq('id', subjectId)
      .select()
      .single();

    if (updateError) {
      console.error('[subjects] Update error:', updateError);
      return NextResponse.json(
        { success: false, error: 'Database error while updating subject' },
        { status: 500 }
      );
    }

    // 6. Return success
    return NextResponse.json({
      success: true,
      data: {
        subject: updatedSubject,
      },
    });

  } catch (error) {
    console.error('[subjects] Unexpected error in PUT:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// ─── DELETE: Delete Subject ─────────────────────────────────────

export async function DELETE(request, { params }) {
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

    // 2. Verify ownership of the subject
    const { data: existingSubject, error: checkError } = await supabaseAdmin
      .from('subjects')
      .select('id')
      .eq('id', subjectId)
      .eq('user_id', userId)
      .single();

    if (checkError || !existingSubject) {
      return NextResponse.json(
        { success: false, error: 'Subject not found or unauthorized' },
        { status: 404 }
      );
    }

    // 3. DELETE subject
    const { error: deleteError } = await supabaseAdmin
      .from('subjects')
      .delete()
      .eq('id', subjectId);

    if (deleteError) {
      console.error('[subjects] Delete error:', deleteError);
      return NextResponse.json(
        { success: false, error: 'Database error while deleting subject' },
        { status: 500 }
      );
    }

    // 4. Return success
    return NextResponse.json({
      success: true,
    });

  } catch (error) {
    console.error('[subjects] Unexpected error in DELETE:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
