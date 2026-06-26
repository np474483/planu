// lib/mock/reminders.js
// Mock study reminders

export const mockReminders = [
  {
    id: 'rem_001',
    user_id: 'user_001',
    label: 'Morning Study Session',
    reminder_time: '07:00',
    subject_id: null,
    subject_name: null,
    is_active: true,
    created_at: '2026-06-10T00:00:00Z',
  },
  {
    id: 'rem_002',
    user_id: 'user_001',
    label: 'ML Practice Problems',
    reminder_time: '15:30',
    subject_id: 'sub_002',
    subject_name: 'Machine Learning',
    is_active: true,
    created_at: '2026-06-12T00:00:00Z',
  },
  {
    id: 'rem_003',
    user_id: 'user_001',
    label: 'Algorithm Revision',
    reminder_time: '20:00',
    subject_id: 'sub_001',
    subject_name: 'Advanced Algorithms',
    is_active: false,
    created_at: '2026-06-15T00:00:00Z',
  },
  {
    id: 'rem_004',
    user_id: 'user_001',
    label: 'Database Exam Prep',
    reminder_time: '09:00',
    subject_id: 'sub_003',
    subject_name: 'Database Systems',
    is_active: true,
    created_at: '2026-06-20T00:00:00Z',
  },
];

// ─── Helpers ────────────────────────────────────────────────────

export function getReminders() {
  return mockReminders;
}

/**
 * Format time: "07:00" → "7:00 AM"
 */
export function formatReminderTime(timeString) {
  const [h, m] = timeString.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, '0')} ${period}`;
}
