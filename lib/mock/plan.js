// lib/mock/plan.js
// Mock AI-generated day-by-day study plan

export const mockStudyPlan = {
  generated_at: '2026-06-26T10:30:00Z',
  days: [
    {
      date: '2026-06-27',
      day_label: 'Tomorrow',
      sessions: [
        {
          subject: 'Database Systems',
          subject_id: 'sub_003',
          topics: ['NoSQL Databases'],
          duration_mins: 60,
          note: 'Focus on MongoDB and Redis. Compare with relational DBs.',
        },
      ],
    },
    {
      date: '2026-06-28',
      day_label: 'Saturday',
      sessions: [
        {
          subject: 'Advanced Algorithms',
          subject_id: 'sub_001',
          topics: ['Dynamic Programming'],
          duration_mins: 90,
          note: 'Practice DP on LeetCode. Do 5 problems: Knapsack, LCS, LIS.',
        },
        {
          subject: 'Advanced Algorithms',
          subject_id: 'sub_001',
          topics: ['Greedy Algorithms'],
          duration_mins: 45,
          note: 'Activity Selection, Huffman Coding.',
        },
      ],
    },
    {
      date: '2026-06-29',
      day_label: 'Sunday',
      sessions: [
        {
          subject: 'Machine Learning',
          subject_id: 'sub_002',
          topics: ['Support Vector Machines'],
          duration_mins: 90,
          note: 'Understand the margin maximization and kernel trick.',
        },
      ],
    },
    {
      date: '2026-06-30',
      day_label: 'Monday',
      sessions: [
        {
          subject: 'Software Engineering',
          subject_id: 'sub_004',
          topics: ['Agile & Scrum'],
          duration_mins: 60,
          note: 'Review Scrum ceremonies: Sprint Planning, Daily Stand-up, Review, Retrospective.',
        },
        {
          subject: 'Advanced Algorithms',
          subject_id: 'sub_001',
          topics: ['Graph Algorithms (BFS/DFS)'],
          duration_mins: 75,
          note: 'Implement BFS and DFS from scratch. Practice on graph problems.',
        },
      ],
    },
    {
      date: '2026-07-01',
      day_label: 'Tuesday',
      sessions: [
        {
          subject: 'Machine Learning',
          subject_id: 'sub_002',
          topics: ['Neural Networks & Backprop'],
          duration_mins: 120,
          note: 'This is deep — take it slow. Draw out the forward and backward pass.',
        },
      ],
    },
    {
      date: '2026-07-02',
      day_label: 'Wednesday',
      sessions: [
        {
          subject: 'Software Engineering',
          subject_id: 'sub_004',
          topics: ['Requirements Engineering'],
          duration_mins: 60,
          note: 'Functional vs non-functional requirements. Use case diagrams.',
        },
        {
          subject: 'Computer Networks',
          subject_id: 'sub_005',
          topics: ['OSI & TCP/IP Model'],
          duration_mins: 60,
          note: 'Memorize all 7 OSI layers and their functions.',
        },
      ],
    },
    {
      date: '2026-07-03',
      day_label: 'Thursday',
      sessions: [
        {
          subject: 'Advanced Algorithms',
          subject_id: 'sub_001',
          topics: ['Shortest Path Algorithms'],
          duration_mins: 90,
          note: "Dijkstra, Bellman-Ford, Floyd-Warshall. Know when to use each.",
        },
      ],
    },
  ],
};

// ─── Helpers ────────────────────────────────────────────────────

/**
 * Get the full study plan.
 */
export function getStudyPlan() {
  return mockStudyPlan;
}

/**
 * Get total study time in hours from the plan.
 */
export function getPlanTotalHours() {
  const totalMins = mockStudyPlan.days
    .flatMap((d) => d.sessions)
    .reduce((sum, s) => sum + s.duration_mins, 0);
  return Math.round(totalMins / 60);
}

/**
 * Format date for plan card header: "Fri, Jun 27"
 */
export function formatPlanDate(dateString) {
  return new Date(dateString).toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
}
