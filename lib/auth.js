// lib/auth.js
// Firebase Admin SDK — server-side only.
// Used to verify Firebase ID tokens sent from the client in Authorization headers.
// This file must NEVER be imported in client components.

let adminAuth;

async function getAdminAuth() {
  if (adminAuth) return adminAuth;
  
  const { default: admin } = await import('firebase-admin');
  
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    });
  }
  
  adminAuth = admin.auth();
  return adminAuth;
}

export async function verifyFirebaseToken(request) {
  const authHeader = request.headers.get('authorization') || 
                     request.headers.get('Authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    const error = new Error('Missing or invalid Authorization header');
    error.status = 401;
    throw error;
  }
  
  const token = authHeader.split('Bearer ')[1];
  
  if (!token) {
    const error = new Error('No token provided');
    error.status = 401;
    throw error;
  }
  
  try {
    const auth = await getAdminAuth();
    const decodedToken = await auth.verifyIdToken(token);
    return decodedToken;
  } catch (err) {
    const error = new Error('Invalid or expired token');
    error.status = 401;
    throw error;
  }
}
