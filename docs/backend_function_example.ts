/**
 * @fileoverview This file contains an example of a Google Cloud Function that would be deployed
 * to your Firebase project. Its purpose is to pre-calculate monthly transaction summaries
 * to optimize frontend performance and reduce Firestore costs.
 *
 * HOW TO USE THIS:
 * 1. Set up a Firebase Functions environment in your project: `firebase init functions`.
 * 2. Choose TypeScript when prompted.
 * 3. Copy the code from this file into the `index.ts` file inside the newly created `functions/src` directory.
 * 4. Install any necessary dependencies inside the `functions` directory (e.g., `npm install firebase-functions firebase-admin date-fns`).
 * 5. Deploy the function using `firebase deploy --only functions`.
 *
 * NOTE: This file is for architectural guidance and is NOT executed as part of the Next.js application.
 */

// Import Firebase Admin and Functions SDKs
import * as functions from 'firebase-functions';
import *s admin from 'firebase-admin';
import { getMonth, getYear } from 'date-fns';

// Initialize the Firebase Admin SDK
admin.initializeApp();
const db = admin.firestore();

/**
 * A Cloud Function that triggers on any create, update, or delete event
 * in the user's transactions subcollection.
 *
 * It recalculates the summary for the month affected by the change and
 * stores it in a separate `monthly_summaries` collection.
 */
export const updateMonthlySummary = functions.firestore
  .document('/users/{userId}/transactions/{transactionId}')
  .onWrite(async (change, context) => {
    const { userId } = context.params;

    // Determine the date of the transaction to identify which month to update.
    // If it's a deletion, use the data from `before`. Otherwise, use `after`.
    const transactionData = change.after.exists ? change.after.data() : change.before.data();
    if (!transactionData) {
      console.log('No transaction data found. Exiting function.');
      return null;
    }

    const transactionDate = transactionData.date.toDate(); // Firestore Timestamps need to be converted to JS Date
    const year = getYear(transactionDate);
    const month = getMonth(transactionDate) + 1; // getMonth() is 0-indexed

    // Define the start and end of the month for the query
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    console.log(`Recalculating summary for user ${userId}, month ${year}-${month}`);

    // Reference to the user's transactions collection
    const transactionsRef = db.collection('users').doc(userId).collection('transactions');

    // Query for all transactions within the affected month
    const snapshot = await transactionsRef
      .where('date', '>=', startDate)
      .where('date', '<=', endDate)
      .get();

    let totalIncome = 0;
    let totalExpense = 0;

    // Calculate totals
    snapshot.forEach(doc => {
      const data = doc.data();
      if (data.type === 'income') {
        totalIncome += data.amount;
      } else {
        totalExpense += data.amount;
      }
    });

    const netBalance = totalIncome - totalExpense;
    const transactionCount = snapshot.size;

    // Define the document ID for the monthly summary (e.g., '2024_07')
    const summaryDocId = `${year}_${String(month).padStart(2, '0')}`;
    const summaryRef = db.collection('users').doc(userId).collection('monthly_summaries').doc(summaryDocId);
    
    // Data to be saved
    const summaryData = {
      year,
      month,
      totalIncome,
      totalExpense,
      netBalance,
      transactionCount,
      lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
    };

    // Save the recalculated summary to the new document
    console.log(`Updating summary for ${summaryDocId}:`, summaryData);
    return summaryRef.set(summaryData, { merge: true });
  });
