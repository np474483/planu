// lib/auth.js
// Firebase Admin SDK — server-side only.
// Used to verify Firebase ID tokens sent from the client in Authorization headers.
// This file must NEVER be imported in client components.

import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

// Firebase Admin requires service account credentials.
// These are different from the NEXT_PUBLIC_ client-side config.
// Download from: Firebase Console → Project Settings → Service Accounts → Generate New Private Key
const adminConfig = {
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
  // Private keys in env vars have literal "\n" — replace with actual newlines
  privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
};

// Initialize Firebase Admin (once)
if (!getApps().length) {
  if (!adminConfig.clientEmail || !adminConfig.privateKey) {
    console.warn(
      '[auth] Firebase Admin credentials missing. ' +
      'Set FIREBASE_ADMIN_CLIENT_EMAIL and FIREBASE_ADMIN_PRIVATE_KEY in .env.local. ' +
      'Token verification will fail until these are configured.'
    );
  }

  initializeApp({
    credential: cert(adminConfig),
  });
}

const adminAuth = getAuth();

/**
 * Verifies a Firebase ID token from the Authorization header.
 *
 * Expected header format: "Authorization: Bearer <firebaseIdToken>"
 *
 * @param {Request} request — the incoming Next.js request object
 * @returns {Promise<import('firebase-admin/auth').DecodedIdToken>} decoded token with uid, email, name, etc.
 * @throws {Error} if token is missing, malformed, or invalid
 */
export async function verifyFirebaseToken(request) {
  const authHeader = request.headers.get('Authorization');

  if (!authHeader) {
    const error = new Error('Missing Authorization header');
    error.status = 401;
    throw error;
  }

  if (!authHeader.startsWith('Bearer ')) {
    const error = new Error('Authorization header must use Bearer scheme');
    error.status = 401;
    throw error;
  }

  const idToken = authHeader.split('Bearer ')[1];

  if (!idToken || idToken.trim() === '') {
    const error = new Error('Empty Bearer token');
    error.status = 401;
    throw error;
  }

  try {
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    return decodedToken;
  } catch (firebaseError) {
    console.error('[auth] Token verification failed:', firebaseError.message);
    const error = new Error('Invalid or expired authentication token');
    error.status = 401;
    throw error;
  }
}
