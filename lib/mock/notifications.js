// lib/mock/notifications.js
// Mock push notification history

export const mockNotifications = [
  {
    id: 'notif_001',
    title: '⏰ Time to study!',
    message: 'Your Morning Study Session reminder is here. Let\'s go!',
    type: 'reminder',
    related_route: '/reminders',
    is_read: false,
    created_at: '2026-06-26T07:00:00Z',
  },
  {
    id: 'notif_002',
    title: '📅 Exam in 14 days!',
    message: 'Database Systems exam is on July 10. You\'ve completed 80% — great progress!',
    type: 'exam_alert',
    related_route: '/subjects/sub_003',
    is_read: false,
    created_at: '2026-06-26T08:00:00Z',
  },
  {
    id: 'notif_003',
    title: '🎯 Study Plan Ready',
    message: 'Your AI-generated study plan for 7 days is ready. Check it out!',
    type: 'plan',
    related_route: '/plan',
    is_read: true,
    created_at: '2026-06-25T10:30:00Z',
  },
  {
    id: 'notif_004',
    title: '🏆 Quiz Milestone!',
    message: 'You scored 5/5 on Dynamic Programming. You\'re crushing it!',
    type: 'quiz',
    related_route: '/quiz/top_003/history',
    is_read: true,
    created_at: '2026-06-26T11:00:00Z',
  },
  {
    id: 'notif_005',
    title: '📚 ML Practice Problems',
    message: 'Time to practice your Machine Learning problems. 15:30 reminder!',
    type: 'reminder',
    related_route: '/reminders',
    is_read: true,
    created_at: '2026-06-25T15:30:00Z',
  },
];

// ─── Helpers ────────────────────────────────────────────────────

export function getNotifications() {
  return mockNotifications;
}

export function getUnreadCount() {
  return mockNotifications.filter((n) => !n.is_read).length;
}

/**
 * Format relative time: "2 hours ago", "Yesterday"
 */
export function formatRelativeTime(isoString) {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1)  return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  return `${diffDays} days ago`;
}

export const NOTIF_ICONS = {
  reminder:   '⏰',
  exam_alert: '📅',
  plan:       '🎯',
  quiz:       '🏆',
  general:    '🔔',
};
