
import { initializeApp, getApps, App } from 'firebase-admin/app';
import { credential } from 'firebase-admin';

// IMPORTANT: Do not enable this in a production environment.
// This is a security risk and should only be used for local development.
// process.env.FIREBASE_AUTH_EMULATOR_HOST = "127.0.0.1:9099";

let serviceAccount: any = null;

if (process.env.FIREBASE_ADMIN_PRIVATE_KEY) {
    try {
        serviceAccount = JSON.parse(process.env.FIREBASE_ADMIN_PRIVATE_KEY);
    } catch (error) {
        console.error("Error parsing FIREBASE_ADMIN_PRIVATE_KEY:", error);
        // Set serviceAccount to null if parsing fails to prevent further errors
        serviceAccount = null; 
    }
}


export function initAdmin(): App {
  if (getApps().length > 0) {
    return getApps()[0];
  }

  // This check now happens at runtime when initAdmin is called, not at build time.
  if (!serviceAccount) {
    // Log a more informative message for developers
    console.error("Firebase Admin SDK is not initialized. The service account key is missing or invalid. Check your FIREBASE_ADMIN_PRIVATE_KEY environment variable.");
    throw new Error('Firebase Admin initialization failed.');
  }

  return initializeApp({
    credential: credential.cert(serviceAccount),
    projectId: serviceAccount.project_id,
  });
}
