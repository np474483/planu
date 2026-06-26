// lib/mock/subjects.js
// Mock subjects and topics with progress data

export const mockSubjects = [
  {
    id: 'sub_001',
    user_id: 'user_001',
    name: 'Advanced Algorithms',
    exam_date: '2026-07-15',
    created_at: '2026-06-01T00:00:00Z',
    topics: [
      { id: 'top_001', subject_id: 'sub_001', name: 'Time & Space Complexity',      status: 'completed'   },
      { id: 'top_002', subject_id: 'sub_001', name: 'Divide and Conquer',            status: 'completed'   },
      { id: 'top_003', subject_id: 'sub_001', name: 'Dynamic Programming',           status: 'in_progress' },
      { id: 'top_004', subject_id: 'sub_001', name: 'Greedy Algorithms',             status: 'in_progress' },
      { id: 'top_005', subject_id: 'sub_001', name: 'Graph Algorithms (BFS/DFS)',    status: 'not_started' },
      { id: 'top_006', subject_id: 'sub_001', name: 'Shortest Path Algorithms',      status: 'not_started' },
      { id: 'top_007', subject_id: 'sub_001', name: 'NP-Completeness & Reductions',  status: 'not_started' },
    ],
  },
  {
    id: 'sub_002',
    user_id: 'user_001',
    name: 'Machine Learning',
    exam_date: '2026-07-22',
    created_at: '2026-06-02T00:00:00Z',
    topics: [
      { id: 'top_008', subject_id: 'sub_002', name: 'Linear Regression',             status: 'completed'   },
      { id: 'top_009', subject_id: 'sub_002', name: 'Logistic Regression',           status: 'completed'   },
      { id: 'top_010', subject_id: 'sub_002', name: 'Decision Trees & Random Forests',status: 'completed'  },
      { id: 'top_011', subject_id: 'sub_002', name: 'Support Vector Machines',       status: 'in_progress' },
      { id: 'top_012', subject_id: 'sub_002', name: 'Neural Networks & Backprop',    status: 'not_started' },
      { id: 'top_013', subject_id: 'sub_002', name: 'CNN & RNN Architectures',       status: 'not_started' },
    ],
  },
  {
    id: 'sub_003',
    user_id: 'user_001',
    name: 'Database Systems',
    exam_date: '2026-07-10',
    created_at: '2026-06-03T00:00:00Z',
    topics: [
      { id: 'top_014', subject_id: 'sub_003', name: 'ER Modeling & Normalization',    status: 'completed'   },
      { id: 'top_015', subject_id: 'sub_003', name: 'SQL & Query Optimization',       status: 'completed'   },
      { id: 'top_016', subject_id: 'sub_003', name: 'Transactions & ACID Properties', status: 'completed'   },
      { id: 'top_017', subject_id: 'sub_003', name: 'Indexing & B-Trees',             status: 'completed'   },
      { id: 'top_018', subject_id: 'sub_003', name: 'NoSQL Databases',                status: 'in_progress' },
    ],
  },
  {
    id: 'sub_004',
    user_id: 'user_001',
    name: 'Software Engineering',
    exam_date: '2026-07-28',
    created_at: '2026-06-04T00:00:00Z',
    topics: [
      { id: 'top_019', subject_id: 'sub_004', name: 'SDLC Models',                   status: 'completed'   },
      { id: 'top_020', subject_id: 'sub_004', name: 'Agile & Scrum',                 status: 'in_progress' },
      { id: 'top_021', subject_id: 'sub_004', name: 'Requirements Engineering',       status: 'not_started' },
      { id: 'top_022', subject_id: 'sub_004', name: 'Design Patterns',               status: 'not_started' },
      { id: 'top_023', subject_id: 'sub_004', name: 'Testing Strategies',            status: 'not_started' },
      { id: 'top_024', subject_id: 'sub_004', name: 'Software Metrics & Quality',    status: 'not_started' },
    ],
  },
  {
    id: 'sub_005',
    user_id: 'user_001',
    name: 'Computer Networks',
    exam_date: '2026-08-05',
    created_at: '2026-06-05T00:00:00Z',
    topics: [
      { id: 'top_025', subject_id: 'sub_005', name: 'OSI & TCP/IP Model',            status: 'not_started' },
      { id: 'top_026', subject_id: 'sub_005', name: 'IP Addressing & Subnetting',    status: 'not_started' },
      { id: 'top_027', subject_id: 'sub_005', name: 'Routing Protocols',             status: 'not_started' },
      { id: 'top_028', subject_id: 'sub_005', name: 'Transport Layer & TCP/UDP',     status: 'not_started' },
      { id: 'top_029', subject_id: 'sub_005', name: 'Application Layer Protocols',   status: 'not_started' },
    ],
  },
];

// ─── Helpers ──────────────────────────────────────────────────────

/**
 * Get all subjects for the current user.
 */
export function getSubjects() {
  return mockSubjects;
}

/**
 * Get a single subject by ID (with topics).
 */
export function getSubjectById(id) {
  return mockSubjects.find((s) => s.id === id) ?? null;
}

/**
 * Get topics for a subject.
 */
export function getTopicsBySubjectId(subjectId) {
  const subject = getSubjectById(subjectId);
  return subject?.topics ?? [];
}

/**
 * Get a single topic by ID.
 */
export function getTopicById(topicId) {
  for (const subject of mockSubjects) {
    const found = subject.topics.find((t) => t.id === topicId);
    if (found) return { ...found, subjectName: subject.name };
  }
  return null;
}

/**
 * Calculate progress % for a subject (completed topics / total topics).
 */
export function getSubjectProgress(subjectId) {
  const topics = getTopicsBySubjectId(subjectId);
  if (topics.length === 0) return 0;
  const done = topics.filter((t) => t.status === 'completed').length;
  return Math.round((done / topics.length) * 100);
}

/**
 * Calculate overall progress across all subjects.
 */
export function getOverallProgress() {
  const allTopics = mockSubjects.flatMap((s) => s.topics);
  if (allTopics.length === 0) return 0;
  const done = allTopics.filter((t) => t.status === 'completed').length;
  return Math.round((done / allTopics.length) * 100);
}

/**
 * Get total stats for the dashboard.
 */
export function getDashboardStats() {
  const allTopics = mockSubjects.flatMap((s) => s.topics);
  const completed = allTopics.filter((t) => t.status === 'completed').length;

  const now = new Date();
  const upcomingExams = mockSubjects
    .map((s) => ({ name: s.name, date: new Date(s.exam_date) }))
    .filter((s) => s.date > now)
    .sort((a, b) => a.date - b.date);

  const daysToNearestExam = upcomingExams.length > 0
    ? Math.ceil((upcomingExams[0].date - now) / (1000 * 60 * 60 * 24))
    : null;

  return {
    totalSubjects: mockSubjects.length,
    totalTopics: allTopics.length,
    topicsDone: completed,
    daysToNearestExam,
    nearestExamName: upcomingExams[0]?.name ?? null,
  };
}

/**
 * Format exam date for display: "Jul 15 · 19 days left"
 */
export function formatExamDate(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const days = Math.ceil((date - now) / (1000 * 60 * 60 * 24));
  const formatted = date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  if (days < 0) return `${formatted} · Exam over`;
  if (days === 0) return `${formatted} · Today!`;
  return `${formatted} · ${days} days left`;
}

/**
 * Status cycle helper: not_started → in_progress → completed → not_started
 */
export function cycleStatus(current) {
  const cycle = { not_started: 'in_progress', in_progress: 'completed', completed: 'not_started' };
  return cycle[current] ?? 'not_started';
}
