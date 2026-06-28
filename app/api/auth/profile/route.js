// app/api/auth/profile/route.js
// GET /api/auth/profile — Returns full student profile details
// PUT /api/auth/profile — Updates student profile settings (e.g. education level, photo URL)
// Expects: Authorization: Bearer <firebaseIdToken>

import { NextResponse } from 'next/server';
import { verifyFirebaseToken } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/db';

// ─── GET: Retrieve Profile ──────────────────────────────────────

export async function GET(request) {
  try {
    // 1. Verify Firebase token
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

    // 2. Fetch user from PostgreSQL by firebase_uid
    const { data: user, error: fetchError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('firebase_uid', firebase_uid)
      .single();

    if (fetchError || !user) {
      console.error('[profile] Fetch user error:', fetchError);
      return NextResponse.json(
        { success: false, error: 'User not found in database' },
        { status: 404 }
      );
    }

    // 3. Return success and user data
    return NextResponse.json({
      success: true,
      data: {
        user,
      },
    });

  } catch (error) {
    console.error('[profile] Unexpected error in GET:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// ─── PUT: Update Profile ────────────────────────────────────────

export async function PUT(request) {
  try {
    // 1. Verify Firebase ID token
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

    const { education_level, class_or_year, profile_photo_url } = body;
    const updateData = {};

    // 3. Validate and map inputs
    if (education_level !== undefined) {
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
      updateData.education_level = education_level;
    }

    if (class_or_year !== undefined) {
      if (typeof class_or_year !== 'string' || class_or_year.trim() === '') {
        return NextResponse.json(
          { success: false, error: 'class_or_year must be a non-empty string' },
          { status: 400 }
        );
      }
      if (class_or_year.length > 50) {
        return NextResponse.json(
          { success: false, error: 'class_or_year cannot exceed 50 characters' },
          { status: 400 }
        );
      }
      updateData.class_or_year = class_or_year.trim();
    }

    if (profile_photo_url !== undefined) {
      if (typeof profile_photo_url !== 'string') {
        return NextResponse.json(
          { success: false, error: 'profile_photo_url must be a string' },
          { status: 400 }
        );
      }
      updateData.profile_photo_url = profile_photo_url.trim();
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { success: false, error: 'No fields provided for update' },
        { status: 400 }
      );
    }

    // 4. Update the user record in PostgreSQL via Supabase Admin
    const { data: updatedUser, error: updateError } = await supabaseAdmin
      .from('users')
      .update(updateData)
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
    console.error('[profile] Unexpected error in PUT:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
