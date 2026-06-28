// lib/auth.js
// Firebase Admin SDK — server-side only.
// Used to verify Firebase ID tokens sent from the client in Authorization headers.
// This file must NEVER be imported in client components.

async function getAdminAuth() {
  const { default: admin } = await import('firebase-admin');
  
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n');
  
  console.log('PRIVATE KEY STARTS WITH:', privateKey?.substring(0, 27));
  console.log('HAS NEWLINES:', privateKey?.includes('\n'));
  console.log('CLIENT EMAIL EXISTS:', !!process.env.FIREBASE_ADMIN_CLIENT_EMAIL);
  
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
        privateKey: privateKey,
      }),
    });
  }
  
  return admin.auth();
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
    console.log('TOKEN VERIFY ERROR:', err.message);
    console.log('TOKEN VERIFY ERROR CODE:', err.code);
    const error = new Error('Invalid or expired token');
    error.status = 401;
    throw error;
  }
}
