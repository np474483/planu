// app/api/auth/upload-avatar/route.js
// POST /api/auth/upload-avatar — Server-side avatar photo upload to Supabase Storage and database update
// Expects: Authorization: Bearer <firebaseIdToken>
// Request body: FormData with key 'file' containing the image file

import { NextResponse } from 'next/server';
import { verifyFirebaseToken } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/db';

export async function POST(request) {
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

    // 2. Parse request body as FormData
    let formData;
    try {
      formData = await request.formData();
    } catch (err) {
      return NextResponse.json(
        { success: false, error: 'Failed to parse request form data' },
        { status: 400 }
      );
    }

    const file = formData.get('file');

    // 3. Validate file exists and is an image
    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided in form data key "file"' },
        { status: 400 }
      );
    }

    if (!file.type || !file.type.startsWith('image/')) {
      return NextResponse.json(
        { success: false, error: 'Uploaded file must be a valid image' },
        { status: 400 }
      );
    }

    // 4. Convert file to buffer
    let buffer;
    try {
      const arrayBuffer = await file.arrayBuffer();
      buffer = Buffer.from(arrayBuffer);
    } catch (bufferErr) {
      console.error('[avatar-upload] Buffer conversion error:', bufferErr);
      return NextResponse.json(
        { success: false, error: 'Failed to read image file data' },
        { status: 500 }
      );
    }

    // 5. Generate file path
    const ext = file.name.split('.').pop() || 'jpg';
    const filePath = `${firebase_uid}/${Date.now()}.${ext}`;

    // 6. Upload using supabaseAdmin.storage (bypasses RLS)
    const { error: uploadError } = await supabaseAdmin
      .storage
      .from('avatars')
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: true,
      });

    if (uploadError) {
      console.error('[avatar-upload] Supabase storage upload error:', uploadError);
      return NextResponse.json(
        { success: false, error: `Storage upload failed: ${uploadError.message}` },
        { status: 500 }
      );
    }

    // 7. Get public URL
    const { data: urlData } = supabaseAdmin
      .storage
      .from('avatars')
      .getPublicUrl(filePath);

    if (!urlData || !urlData.publicUrl) {
      return NextResponse.json(
        { success: false, error: 'Failed to retrieve public URL for uploaded photo' },
        { status: 500 }
      );
    }

    const profilePhotoUrl = urlData.publicUrl;

    // 8. Update profile_photo_url in PostgreSQL users table
    const { error: dbError } = await supabaseAdmin
      .from('users')
      .update({ profile_photo_url: profilePhotoUrl })
      .eq('firebase_uid', firebase_uid);

    if (dbError) {
      console.error('[avatar-upload] Database update error:', dbError);
      return NextResponse.json(
        { success: false, error: 'Storage uploaded but database profile update failed' },
        { status: 500 }
      );
    }

    // 9. Return success with public URL
    return NextResponse.json({
      success: true,
      data: {
        profile_photo_url: profilePhotoUrl,
      },
    });

  } catch (error) {
    console.error('[avatar-upload] Unexpected error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
