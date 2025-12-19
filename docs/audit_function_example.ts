
/**
 * @fileoverview This file contains example Cloud Functions for creating audit trails.
 * Its purpose is to log all creation, update, and deletion events for user transactions.
 *
 * HOW TO USE THIS:
 * 1. Ensure you have a Firebase Functions environment: `firebase init functions`.
 * 2. Choose TypeScript when prompted.
 * 3. Copy the code from this file into `functions/src/index.ts`.
 * 4. Install dependencies in the `functions` directory: `npm install firebase-functions firebase-admin`.
 * 5. Deploy with `firebase deploy --only functions`.
 *
 * NOTE: This file is for architectural guidance and is NOT executed by the Next.js app.
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

// Initialize the Firebase Admin SDK to access Firestore.
admin.initializeApp();
const db = admin.firestore();

/**
 * A Cloud Function that triggers whenever a document in a user's `transactions`
 * subcollection is created, updated, or deleted.
 */
export const auditTransaction = functions.firestore
  .document('/users/{userId}/transactions/{transactionId}')
  .onWrite(async (change, context) => {
    const { userId, transactionId } = context.params;
    const logRef = db.collection('users').doc(userId).collection('audit_logs').doc();

    const auditData = {
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      transactionId: transactionId,
      // Placeholder for real metadata
      metadata: {
        user_agent: 'cloud-function', 
        ip_address: 'N/A',
      },
    };

    // Case 1: A document was CREATED.
    if (!change.before.exists && change.after.exists) {
      return logRef.set({
        ...auditData,
        actionType: 'CREATE',
        newData: change.after.data(),
      });
    }

    // Case 2: A document was DELETED.
    if (change.before.exists && !change.after.exists) {
      return logRef.set({
        ...auditData,
        actionType: 'DELETE',
        previousData: change.before.data(),
      });
    }

    // Case 3: A document was UPDATED.
    if (change.before.exists && change.after.exists) {
      return logRef.set({
        ...auditData,
        actionType: 'UPDATE',
        previousData: change.before.data(),
        newData: change.after.data(),
      });
    }

    return null; // Should not happen with onWrite, but good practice.
  });

