// app/api/auth/profile/route.js
// PUT /api/auth/profile
// Updates the student's profile (education level and class/year) in PostgreSQL.
// Expects: Authorization: Bearer <firebaseIdToken>
// Request body: { education_level, class_or_year }
// Returns: { success: true, data: { user } }

import { NextResponse } from 'next/server';
import { verifyFirebaseToken } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/db';

export async function PUT(request) {
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

    const { education_level, class_or_year } = body;

    // 3. Validate inputs
    if (typeof class_or_year !== 'string' || class_or_year.trim() === '') {
      return NextResponse.json(
        { success: false, error: 'class_or_year is required and must be a string' },
        { status: 400 }
      );
    }

    const validLevels = ['school', 'ug', 'pg'];
    if (!validLevels.includes(education_level)) {
      return NextResponse.json(
        {
          success: false,
          error: `education_level must be one of: ${validLevels.join(', ')}`,
        },
        { status: 400 }
      );
    }

    if (class_or_year.length > 50) {
      return NextResponse.json(
        { success: false, error: 'class_or_year cannot exceed 50 characters' },
        { status: 400 }
      );
    }

    // 4. Update the user record in PostgreSQL via Supabase Admin
    const { data: updatedUser, error: updateError } = await supabaseAdmin
      .from('users')
      .update({
        education_level,
        class_or_year: class_or_year.trim(),
      })
      .eq('firebase_uid', firebase_uid)
      .select()
      .single();

    if (updateError) {
      console.error('[profile] Database update error:', updateError);
      return NextResponse.json(
        { success: false, error: 'Database error while updating profile' },
        { status: 500 }
      );
    }

    // 5. Return success and updated user data
    return NextResponse.json({
      success: true,
      data: {
        user: updatedUser,
      },
    });

  } catch (error) {
    console.error('[profile] Unexpected error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
