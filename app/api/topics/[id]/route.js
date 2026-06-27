// app/api/topics/[id]/route.js
// PUT /api/topics/[id] — Update topic name and/or status
// DELETE /api/topics/[id] — Delete topic
// Expects: Authorization: Bearer <firebaseIdToken>

import { NextResponse } from 'next/server';
import { verifyFirebaseToken } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/db';
import { firestore } from '@/lib/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

// helper to authenticate request and return user object
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

  return { id: user.id, firebase_uid };
}

// helper to verify topic ownership
async function checkTopicOwnership(topicId, userId) {
  const { data: topic, error: checkError } = await supabaseAdmin
    .from('topics')
    .select(`
      id,
      subjects!inner (
        user_id
      )
    `)
    .eq('id', topicId)
    .eq('subjects.user_id', userId)
    .single();

  if (checkError || !topic) {
    return false;
  }
  return true;
}

// ─── PUT: Update Topic ──────────────────────────────────────────

export async function PUT(request, { params }) {
  try {
    const { id: topicId } = await params;

    // 1. Authenticate user
    let user;
    try {
      user = await authenticateUser(request);
    } catch (authError) {
      return NextResponse.json(
        { success: false, error: authError.message },
        { status: authError.status || 401 }
      );
    }

    // 2. Verify ownership of the parent subject
    const isOwned = await checkTopicOwnership(topicId, user.id);
    if (!isOwned) {
      return NextResponse.json(
        { success: false, error: 'Topic not found or unauthorized' },
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

    const { name, status } = body;
    const updateData = {};

    // 4. Validate fields
    if (name !== undefined) {
      if (typeof name !== 'string' || name.trim() === '') {
        return NextResponse.json(
          { success: false, error: 'Topic name cannot be empty' },
          { status: 400 }
        );
      }
      updateData.name = name.trim();
    }

    if (status !== undefined) {
      const validStatuses = ['not_started', 'in_progress', 'completed'];
      if (!validStatuses.includes(status)) {
        return NextResponse.json(
          { success: false, error: `Status must be one of: ${validStatuses.join(', ')}` },
          { status: 400 }
        );
      }
      updateData.status = status;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { success: false, error: 'No fields provided for update' },
        { status: 400 }
      );
    }

    // 5. UPDATE topic in PostgreSQL
    const { data: updatedTopic, error: updateError } = await supabaseAdmin
      .from('topics')
      .update(updateData)
      .eq('id', topicId)
      .select()
      .single();

    if (updateError) {
      console.error('[topics] Update error:', updateError);
      return NextResponse.json(
        { success: false, error: 'Database error while updating topic' },
        { status: 500 }
      );
    }

    // 6. If status was updated, also update Firebase Firestore
    if (status !== undefined) {
      try {
        const topicDocRef = doc(firestore, 'users', user.firebase_uid, 'topics', String(topicId));
        await setDoc(topicDocRef, {
          status,
          updated_at: serverTimestamp(),
        }, { merge: true });
      } catch (firestoreError) {
        console.error('[topics] Firestore sync warning (continuing):', firestoreError.message);
      }
    }

    // 7. Return success and updated topic
    return NextResponse.json({
      success: true,
      data: {
        topic: updatedTopic,
      },
    });

  } catch (error) {
    console.error('[topics] Unexpected error in PUT:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// ─── DELETE: Delete Topic ───────────────────────────────────────

export async function DELETE(request, { params }) {
  try {
    const { id: topicId } = await params;

    // 1. Authenticate user
    let user;
    try {
      user = await authenticateUser(request);
    } catch (authError) {
      return NextResponse.json(
        { success: false, error: authError.message },
        { status: authError.status || 401 }
      );
    }

    // 2. Verify ownership
    const isOwned = await checkTopicOwnership(topicId, user.id);
    if (!isOwned) {
      return NextResponse.json(
        { success: false, error: 'Topic not found or unauthorized' },
        { status: 404 }
      );
    }

    // 3. DELETE topic
    const { error: deleteError } = await supabaseAdmin
      .from('topics')
      .delete()
      .eq('id', topicId);

    if (deleteError) {
      console.error('[topics] Delete error:', deleteError);
      return NextResponse.json(
        { success: false, error: 'Database error while deleting topic' },
        { status: 500 }
      );
    }

    // 4. Return success
    return NextResponse.json({
      success: true,
    });

  } catch (error) {
    console.error('[topics] Unexpected error in DELETE:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
