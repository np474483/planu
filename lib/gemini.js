// lib/gemini.js
// Google Generative AI (Gemini) — server-side only.
// Provides three AI functions: study plan generation, chat tutoring, and quiz generation.
// All functions are meant to be called from API routes (server context), never from client components.

import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  throw new Error(
    'Missing GEMINI_API_KEY environment variable. Set it in .env.local'
  );
}

const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

// ─── Education level prompt fragments ───────────────────────────

function getLevelInstruction(educationLevel) {
  switch (educationLevel) {
    case 'school':
      return 'The student is in school (Class 6–12). Use simple language with relatable, everyday examples. Avoid jargon.';
    case 'undergraduate':
      return 'The student is an undergraduate (Diploma/B.E./B.Sc./BCA). Use intermediate-level language. Explain technical terms when first introduced.';
    case 'postgraduate':
      return 'The student is a postgraduate (MCA/MBA/M.Sc./M.Tech). Use advanced, domain-specific language with depth and nuance.';
    default:
      return 'Adapt your language to a general college student.';
  }
}

// ─── 1. Generate Study Plan ─────────────────────────────────────

/**
 * Generates a 7-day study plan based on the student's subjects and topics.
 *
 * @param {string} educationLevel - 'school' | 'undergraduate' | 'postgraduate'
 * @param {string} classYear - e.g. "Second Year MCA"
 * @param {Array<{id: string, name: string, topics: string[]}>} subjects
 * @returns {Promise<Array>} Array of day objects matching the mock plan shape:
 *   [{ date, day_label, sessions: [{ subject, subject_id, topics, duration_mins, note }] }]
 */
export async function generateStudyPlan(educationLevel, classYear, subjects) {
  const subjectList = subjects
    .map((s) => `- ${s.name} (id: ${s.id}, Exam: ${s.exam_date || 'N/A'}): Topics — ${s.topics.join(', ')}`)
    .join('\n');

  const todayStr = new Date().toISOString().split('T')[0];

  const prompt = `You are an expert academic study planner.
${getLevelInstruction(educationLevel)}
The student is in: ${classYear}.
Today's date is: ${todayStr}.

Their subjects and topics:
${subjectList}

Create a realistic 7-day study plan starting from tomorrow (which is the day after today's date ${todayStr}). Rules:
1. Each day has 1–3 sessions. Each session covers 1 subject and 1–2 topics.
2. Distribute subjects evenly across the week.
3. Give harder/larger topics more time (60–120 mins). Lighter ones 30–60 mins.
4. Add a practical "note" for each session — a specific study tip or action item.
5. Use realistic date strings starting from tomorrow (YYYY-MM-DD format).
6. Day labels: "Tomorrow", then weekday names ("Saturday", "Sunday", etc.)

Return ONLY valid JSON — no markdown, no explanation, no code fences.
Return an array of objects with this exact shape:
[
  {
    "date": "YYYY-MM-DD",
    "day_label": "string",
    "sessions": [
      {
        "subject": "Subject Name",
        "subject_id": "sub_xxx",
        "topics": ["Topic 1"],
        "duration_mins": 60,
        "note": "Specific study tip here"
      }
    ]
  }
]`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();

  try {
    return JSON.parse(text);
  } catch {
    // Gemini sometimes wraps JSON in markdown code fences — strip them
    const cleaned = text.replace(/```json?\s*/gi, '').replace(/```\s*/g, '').trim();
    try {
      return JSON.parse(cleaned);
    } catch (parseError) {
      console.error('[gemini] Failed to parse study plan JSON:', parseError.message);
      console.error('[gemini] Raw response:', text);
      throw new Error('AI returned an invalid study plan format. Please try again.');
    }
  }
}

// ─── 2. Generate Chat Response ──────────────────────────────────

/**
 * AI tutor chat — answers student questions about a specific subject/topic.
 *
 * @param {string} educationLevel
 * @param {string} classYear
 * @param {string} subjectName - e.g. "Advanced Algorithms"
 * @param {string} topicName - e.g. "Dynamic Programming" (can be empty for general questions)
 * @param {string} message - the student's current message
 * @param {Array<{role: string, text: string}>} history - previous messages [{role: 'user'|'ai', text}]
 * @returns {Promise<string>} AI response text
 */
export async function generateChatResponse(
  educationLevel,
  classYear,
  subjectName,
  topicName,
  message,
  history = []
) {
  const topicContext = topicName
    ? `The current topic is "${topicName}" under "${subjectName}".`
    : `The subject is "${subjectName}".`;

  const historyBlock = history.length
    ? history
        .slice(-10) // keep last 10 messages to stay within token limits
        .map((msg) => `${msg.role === 'user' ? 'Student' : 'Tutor'}: ${msg.text}`)
        .join('\n')
    : '';

  const prompt = `You are PlanU AI Tutor — a friendly, encouraging academic tutor.
${getLevelInstruction(educationLevel)}
The student is in: ${classYear}.
${topicContext}

Rules:
1. Give clear, structured explanations.
2. Use analogies and examples appropriate for the student's level.
3. If the student seems confused, simplify further.
4. Keep responses concise but thorough — aim for 100–300 words.
5. Use bullet points or numbered steps when explaining processes.
6. If the question is off-topic, gently redirect to study-related topics.

${historyBlock ? `Previous conversation:\n${historyBlock}\n` : ''}
Student: ${message}

Tutor:`;

  const result = await model.generateContent(prompt);
  return result.response.text();
}

// ─── 3. Generate Quiz ───────────────────────────────────────────

/**
 * Generates 5 MCQ questions for a specific topic.
 *
 * @param {string} educationLevel
 * @param {string} subjectName
 * @param {string} topicName
 * @returns {Promise<Array>} Array of question objects matching the mock quiz shape:
 *   [{ id, question, options, correct_index, explanation }]
 */
export async function generateQuiz(educationLevel, subjectName, topicName) {
  const prompt = `You are an expert exam question creator.
${getLevelInstruction(educationLevel)}

Create exactly 5 multiple-choice questions about "${topicName}" from the subject "${subjectName}".

Rules:
1. Each question has exactly 4 options (one correct, three plausible distractors).
2. Questions should test understanding, not just memorization.
3. Progress from easier to harder across the 5 questions.
4. Each explanation should be 1–2 sentences explaining WHY the answer is correct.
5. correct_index is 0-based (0 = first option, 3 = last option).

Return ONLY valid JSON — no markdown, no explanation, no code fences.
Return an array with this exact shape:
[
  {
    "id": "q1",
    "question": "Question text here?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correct_index": 0,
    "explanation": "Brief explanation of the correct answer."
  }
]`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();

  try {
    return JSON.parse(text);
  } catch {
    // Strip markdown code fences if Gemini wraps the JSON
    const cleaned = text.replace(/```json?\s*/gi, '').replace(/```\s*/g, '').trim();
    try {
      return JSON.parse(cleaned);
    } catch (parseError) {
      console.error('[gemini] Failed to parse quiz JSON:', parseError.message);
      console.error('[gemini] Raw response:', text);
      throw new Error('AI returned an invalid quiz format. Please try again.');
    }
  }
}
