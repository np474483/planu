// app/api/ai/plan/route.js
// POST /api/ai/plan — Generate and save a new AI study plan
// GET /api/ai/plan — Retrieve the currently active study plan
// Expects: Authorization: Bearer <firebaseIdToken>

import { NextResponse } from 'next/server';
import { verifyFirebaseToken } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/db';
import { generateStudyPlan } from '@/lib/gemini';

// helper to authenticate request and return full user info
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
    .select('id, education_level, class_or_year')
    .eq('firebase_uid', firebase_uid)
    .single();

  if (userError || !user) {
    const error = new Error('User not found in database');
    error.status = 404;
    throw error;
  }

  return user;
}

// ─── POST: Generate New AI Study Plan ───────────────────────────

export async function POST(request) {
  try {
    // 1. Authenticate user and get user profiles
    let user;
    try {
      user = await authenticateUser(request);
    } catch (authError) {
      return NextResponse.json(
        { success: false, error: authError.message },
        { status: authError.status || 401 }
      );
    }

    // 2. Fetch all subjects with their topics for this user
    const { data: subjectsData, error: subjectsError } = await supabaseAdmin
      .from('subjects')
      .select(`
        id,
        name,
        exam_date,
        topics (
          id,
          name,
          status
        )
      `)
      .eq('user_id', user.id);

    if (subjectsError) {
      console.error('[ai-plan] Fetch subjects error:', subjectsError);
      return NextResponse.json(
        { success: false, error: 'Database error while fetching subjects' },
        { status: 500 }
      );
    }

    // 3. Validate user has subjects
    if (!subjectsData || subjectsData.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Please add subjects before generating a study plan' },
        { status: 400 }
      );
    }

    // 4. Format subjects list for Gemini API (convert nested topics objects to string arrays)
    const subjectsForAI = subjectsData.map((s) => ({
      id: s.id,
      name: s.name,
      exam_date: s.exam_date,
      topics: (s.topics || []).map((t) => t.name),
    }));

    // 5. Call Gemini AI to generate plan
    let plan;
    try {
      plan = await generateStudyPlan(
        user.education_level || 'school',
        user.class_or_year || 'Class 10',
        subjectsForAI
      );
    } catch (geminiError) {
      console.error('[ai-plan] Gemini generation error:', geminiError);
      return NextResponse.json(
        { success: false, error: `AI Plan generation failed: ${geminiError.message}` },
        { status: 502 } // Bad Gateway (external service error)
      );
    }

    // 6. Save the plan to study_plans table
    // Set is_active = false on all existing plans for this user first
    const { error: deactivateError } = await supabaseAdmin
      .from('study_plans')
      .update({ is_active: false })
      .eq('user_id', user.id);

    if (deactivateError) {
      console.error('[ai-plan] Deactivate existing plans error:', deactivateError);
      return NextResponse.json(
        { success: false, error: 'Database error while deactivating old plans' },
        { status: 500 }
      );
    }

    // Insert new plan as active
    const { data: newPlan, error: insertError } = await supabaseAdmin
      .from('study_plans')
      .insert({
        user_id: user.id,
        plan_json: JSON.stringify(plan),
        is_active: true,
      })
      .select('generated_at')
      .single();

    if (insertError) {
      console.error('[ai-plan] Insert new plan error:', insertError);
      return NextResponse.json(
        { success: false, error: 'Database error while saving study plan' },
        { status: 500 }
      );
    }

    // 7. Return success with the newly generated plan object
    return NextResponse.json({
      success: true,
      data: {
        plan: {
          generated_at: newPlan ? newPlan.generated_at : new Date().toISOString(),
          days: plan,
        },
      },
    });

  } catch (error) {
    console.error('[ai-plan] Unexpected error in POST:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// ─── GET: Retrieve Active Study Plan ────────────────────────────

export async function GET(request) {
  try {
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

    // 2. Fetch the active plan for this user (ordered by generated_at DESC limit 1)
    const { data: activePlan, error: fetchError } = await supabaseAdmin
      .from('study_plans')
      .select('plan_json, generated_at')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .order('generated_at', { ascending: false })
      .limit(1)
      .maybeSingle(); // Returns null instead of code 'PGRST116' if no rows match

    if (fetchError) {
      console.error('[ai-plan] Fetch active plan error:', fetchError);
      return NextResponse.json(
        { success: false, error: 'Database error while retrieving active plan' },
        { status: 500 }
      );
    }

    // 3. Return null if no plan exists yet
    if (!activePlan) {
      return NextResponse.json({
        success: true,
        data: {
          plan: null,
        },
      });
    }

    // 4. Parse the plan_json and return
    let parsedPlan;
    try {
      parsedPlan = JSON.parse(activePlan.plan_json);
    } catch (parseError) {
      console.error('[ai-plan] JSON parse error on stored plan:', parseError);
      return NextResponse.json(
        { success: false, error: 'Failed to parse stored plan' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        plan: {
          generated_at: activePlan.generated_at,
          days: parsedPlan,
        },
      },
    });

  } catch (error) {
    console.error('[ai-plan] Unexpected error in GET:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
