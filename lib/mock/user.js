// lib/mock/user.js
// Mock authenticated student profile

export const mockUser = {
  id: 'user_001',
  firebase_uid: 'mock-firebase-uid-001',
  name: 'Nikhil Uttam Patil',
  email: 'nikhil.patil@gmail.com',
  profile_photo_url: null, // null = show initials avatar
  education_level: 'postgraduate', // 'school' | 'undergraduate' | 'postgraduate'
  class_or_year: 'Second Year MCA',
  is_new_user: false,
  created_at: '2026-06-01T00:00:00Z',
};

// Helper: get user initials for avatar
export function getUserInitials(name) {
  return name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0].toUpperCase())
    .join('');
}

// Helper: get greeting based on time
export function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
}
