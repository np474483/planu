// lib/mock/quiz.js
// Mock AI-generated MCQ quizzes per topic

// Keyed by topic_id
export const mockQuizzes = {
  top_003: {
    topic_id: 'top_003',
    topic_name: 'Dynamic Programming',
    subject_name: 'Advanced Algorithms',
    questions: [
      {
        id: 'q1',
        question: 'What is the key principle behind Dynamic Programming?',
        options: [
          'Divide and conquer without overlapping subproblems',
          'Storing solutions to overlapping subproblems to avoid recomputation',
          'Using greedy choice at each step',
          'Exhaustive search with pruning',
        ],
        correct_index: 1,
        explanation: 'DP stores results of overlapping subproblems (memoization/tabulation) to avoid redundant computation.',
      },
      {
        id: 'q2',
        question: 'Which technique does bottom-up DP use?',
        options: ['Recursion', 'Memoization', 'Tabulation', 'Backtracking'],
        correct_index: 2,
        explanation: 'Bottom-up DP uses tabulation — filling a table iteratively from smallest subproblems.',
      },
      {
        id: 'q3',
        question: 'The 0/1 Knapsack problem has a time complexity of:',
        options: ['O(n)', 'O(n log n)', 'O(n × W)', 'O(2ⁿ)'],
        correct_index: 2,
        explanation: 'The DP solution has O(n × W) time where n = items, W = capacity.',
      },
      {
        id: 'q4',
        question: 'Longest Common Subsequence (LCS) of "ABCBDAB" and "BDCAB" has length:',
        options: ['3', '4', '5', '6'],
        correct_index: 1,
        explanation: 'The LCS is "BCAB" or "BDAB" with length 4.',
      },
      {
        id: 'q5',
        question: 'Which of these problems is NOT typically solved with DP?',
        options: [
          'Matrix Chain Multiplication',
          'Shortest Path in DAG',
          'Finding Maximum Flow in a Network',
          'Edit Distance',
        ],
        correct_index: 2,
        explanation: 'Max Flow uses algorithms like Ford-Fulkerson, not DP. The others are classic DP problems.',
      },
    ],
  },
  top_011: {
    topic_id: 'top_011',
    topic_name: 'Support Vector Machines',
    subject_name: 'Machine Learning',
    questions: [
      {
        id: 'q1',
        question: 'What does SVM try to maximize?',
        options: [
          'The number of support vectors',
          'The margin between the two classes',
          'The accuracy on training data',
          'The dimensionality of the feature space',
        ],
        correct_index: 1,
        explanation: 'SVM finds the hyperplane that maximizes the margin between the closest points (support vectors) of two classes.',
      },
      {
        id: 'q2',
        question: 'The "kernel trick" in SVM allows:',
        options: [
          'Faster training on large datasets',
          'Mapping data to a higher-dimensional space without explicit computation',
          'Reducing overfitting by regularization',
          'Handling imbalanced classes',
        ],
        correct_index: 1,
        explanation: 'The kernel function computes dot products in a higher-dimensional space implicitly, enabling non-linear classification.',
      },
      {
        id: 'q3',
        question: 'Which kernel is best for linearly separable data?',
        options: ['RBF Kernel', 'Polynomial Kernel', 'Linear Kernel', 'Sigmoid Kernel'],
        correct_index: 2,
        explanation: 'Linear kernel is ideal when data is already linearly separable — it\'s simpler and faster.',
      },
      {
        id: 'q4',
        question: 'Support vectors are:',
        options: [
          'All data points in the training set',
          'Data points closest to the decision boundary',
          'Data points that are misclassified',
          'Feature vectors with highest variance',
        ],
        correct_index: 1,
        explanation: 'Support vectors are the critical training examples that define the margin. Removing them would change the decision boundary.',
      },
      {
        id: 'q5',
        question: 'The C parameter in SVM controls:',
        options: [
          'Learning rate',
          'Number of support vectors',
          'Trade-off between maximizing margin and misclassification',
          'Kernel width',
        ],
        correct_index: 2,
        explanation: 'High C = less regularization (more complex boundary), Low C = larger margin (more misclassifications allowed).',
      },
    ],
  },
};

// Fallback quiz for any topic without specific questions
export const defaultQuiz = {
  questions: [
    {
      id: 'q1',
      question: 'What is the primary goal of studying this topic?',
      options: [
        'To memorize formulas',
        'To understand core concepts and apply them',
        'To pass the exam only',
        'To write code faster',
      ],
      correct_index: 1,
      explanation: 'Deep conceptual understanding leads to better application in real problems.',
    },
    {
      id: 'q2',
      question: 'Which study strategy is most effective for complex topics?',
      options: [
        'Reading notes once before the exam',
        'Passive re-reading',
        'Active recall and spaced repetition',
        'Highlighting text',
      ],
      correct_index: 2,
      explanation: 'Active recall forces your brain to retrieve information, strengthening memory significantly.',
    },
    {
      id: 'q3',
      question: 'Practice problems in technical subjects help with:',
      options: [
        'Pattern recognition and problem-solving speed',
        'Understanding theory only',
        'Memorizing solutions',
        'Reading comprehension',
      ],
      correct_index: 0,
      explanation: 'Regular practice builds pattern recognition — you start seeing problem structures you\'ve solved before.',
    },
    {
      id: 'q4',
      question: 'When should you revisit a topic you\'ve marked "In Progress"?',
      options: [
        'Never — it\'s already started',
        'Only on exam day',
        'After completing it, for spaced review',
        'Once per semester',
      ],
      correct_index: 2,
      explanation: 'Spaced repetition — revisiting completed topics at intervals — is scientifically proven to improve long-term retention.',
    },
    {
      id: 'q5',
      question: 'The best time to take a quiz on a topic is:',
      options: [
        'Before studying it',
        'Right after your first study session',
        'Only at the end of the semester',
        'During the exam',
      ],
      correct_index: 1,
      explanation: 'Quizzing immediately after studying exploits the "testing effect" — retrieval practice right after encoding boosts retention.',
    },
  ],
};

// ─── Helpers ────────────────────────────────────────────────────

export function getQuizByTopicId(topicId) {
  return mockQuizzes[topicId] ?? null;
}

export function getQuizOrDefault(topicId, topicName, subjectName) {
  const quiz = mockQuizzes[topicId];
  if (quiz) return quiz;
  return {
    topic_id: topicId,
    topic_name: topicName,
    subject_name: subjectName,
    questions: defaultQuiz.questions,
  };
}

// Mock quiz score history (per topic)
export const mockQuizScores = {
  top_003: [
    { id: 'sc_001', topic_id: 'top_003', score: 3, total: 5, taken_at: '2026-06-24T14:20:00Z' },
    { id: 'sc_002', topic_id: 'top_003', score: 4, total: 5, taken_at: '2026-06-25T09:15:00Z' },
    { id: 'sc_003', topic_id: 'top_003', score: 5, total: 5, taken_at: '2026-06-26T11:00:00Z' },
  ],
  top_011: [
    { id: 'sc_004', topic_id: 'top_011', score: 2, total: 5, taken_at: '2026-06-25T16:00:00Z' },
    { id: 'sc_005', topic_id: 'top_011', score: 4, total: 5, taken_at: '2026-06-26T10:30:00Z' },
  ],
};

export function getScoresByTopicId(topicId) {
  return mockQuizScores[topicId] ?? [];
}

export function getAverageScore(topicId) {
  const scores = getScoresByTopicId(topicId);
  if (scores.length === 0) return null;
  const avg = scores.reduce((sum, s) => sum + (s.score / s.total) * 100, 0) / scores.length;
  return Math.round(avg);
}

// Overall average across all scored topics
export function getOverallAverageScore() {
  const allScores = Object.values(mockQuizScores).flat();
  if (allScores.length === 0) return 0;
  const avg = allScores.reduce((sum, s) => sum + (s.score / s.total) * 100, 0) / allScores.length;
  return Math.round(avg);
}

export function getTotalQuizzesTaken() {
  return Object.values(mockQuizScores).flat().length;
}
