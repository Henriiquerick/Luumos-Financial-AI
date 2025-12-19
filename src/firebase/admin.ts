
import { initializeApp, getApps, App } from 'firebase-admin/app';
import { credential } from 'firebase-admin';

// IMPORTANT: Do not enable this in a production environment.
// This is a security risk and should only be used for local development.
// process.env.FIREBASE_AUTH_EMULATOR_HOST = "127.0.0.1:9099";

const serviceAccount = process.env.FIREBASE_ADMIN_PRIVATE_KEY
  ? JSON.parse(process.env.FIREBASE_ADMIN_PRIVATE_KEY)
  : null;

export function initAdmin(): App {
  if (getApps().length > 0) {
    return getApps()[0];
  }

  if (!serviceAccount) {
    throw new Error('Firebase service account key is not set. Check your environment variables.');
  }

  return initializeApp({
    credential: credential.cert(serviceAccount),
    projectId: serviceAccount.project_id,
  });
}
