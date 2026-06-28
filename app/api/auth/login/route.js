// app/api/auth/login/route.js
// POST /api/auth/login
// Verifies Firebase ID token, checks/creates user in PostgreSQL.
// Returns: { success: true, data: { user, isNewUser } }

import { NextResponse } from 'next/server';
import { verifyFirebaseToken } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/db';

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

    // 2. Extract user info from the verified token
    const firebase_uid = decodedToken.uid;
    const name = decodedToken.name || decodedToken.displayName || '';
    const email = decodedToken.email || '';
    const profile_photo_url = decodedToken.picture || null;

    if (!firebase_uid || !email) {
      return NextResponse.json(
        { success: false, error: 'Invalid token: missing uid or email' },
        { status: 400 }
      );
    }

    // 3. Check if user already exists in PostgreSQL
    const { data: existingUser, error: selectError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('firebase_uid', firebase_uid)
      .single();

    if (selectError && selectError.code !== 'PGRST116') {
      // PGRST116 = "JSON object requested, multiple (or no) rows returned"
      // This means no user found — which is fine, we'll create one.
      // Any OTHER error is a real database problem.
      console.error('[login] Database select error:', selectError);
      return NextResponse.json(
        { success: false, error: 'Database error while checking user' },
        { status: 500 }
      );
    }

    // 4a. User exists — return their data
    if (existingUser) {
      return NextResponse.json({
        success: true,
        data: {
          user: existingUser,
          isNewUser: false,
        },
      });
    }

    // 4b. New user — INSERT into users table
    // Set a default education_level to satisfy check constraints (e.g. 'school').
    // Onboarding will overwrite this later via PUT /api/auth/profile.
    const { data: newUser, error: insertError } = await supabaseAdmin
      .from('users')
      .insert({
        firebase_uid,
        name,
        email,
        education_level: 'school',
        class_or_year: '',
        profile_photo_url,
      })
      .select()
      .single();

    if (insertError) {
      console.log('SUPABASE INSERT ERROR:', JSON.stringify(insertError, null, 2))
      console.error('[login] Database insert error:', insertError);

      // Handle duplicate email (race condition — user created between SELECT and INSERT)
      if (insertError.code === '23505') {
        // Unique violation — user was created by a concurrent request
        const { data: raceUser } = await supabaseAdmin
          .from('users')
          .select('*')
          .eq('firebase_uid', firebase_uid)
          .single();

        if (raceUser) {
          return NextResponse.json({
            success: true,
            data: {
              user: raceUser,
              isNewUser: false,
            },
          });
        }
      }

      return NextResponse.json(
        { success: false, error: 'Database error while creating user' },
        { status: 500 }
      );
    }

    // 5. Return the newly created user
    return NextResponse.json({
      success: true,
      data: {
        user: newUser,
        isNewUser: true,
      },
    });

  } catch (error) {
    console.error('[login] Unexpected error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
