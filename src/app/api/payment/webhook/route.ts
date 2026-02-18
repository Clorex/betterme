import { NextRequest, NextResponse } from 'next/server';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import crypto from 'crypto';

// Initialize Firebase Admin (for server-side operations)
if (!getApps().length) {
  try {
    initializeApp({
      credential: cert({
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    });
  } catch (error) {
    console.error('Firebase Admin init error:', error);
  }
}

export async function POST(req: NextRequest) {
  try {
    // Verify webhook signature
    const secretHash = process.env.FLUTTERWAVE_WEBHOOK_SECRET;
    const signature = req.headers.get('verif-hash');

    if (!secretHash || signature !== secretHash) {
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    const payload = await req.json();
    const { event, data } = payload;

    const db = getFirestore();

    switch (event) {
      case 'charge.completed': {
        if (data.status === 'successful') {
          const txRef = data.tx_ref;

          // Find user by tx_ref pattern: BM-{timestamp}-{random}
          // The tx_ref should be stored when payment was initiated

          // Record transaction
          await db.collection('transactions').add({
            type: 'subscription',
            amount: data.amount,
            currency: data.currency,
            status: 'completed',
            reference: data.flw_ref,
            txRef: data.tx_ref,
            transactionId: data.id,
            customerEmail: data.customer?.email,
            date: FieldValue.serverTimestamp(),
          });

          // Update admin wallet
          const walletRef = db.doc('admin/wallet');
          await walletRef.update({
            totalRevenue: FieldValue.increment(data.amount),
            availableBalance: FieldValue.increment(data.amount),
            monthlyRevenue: FieldValue.increment(data.amount),
          });

          // Log activity
          await db.collection('adminActivity').add({
            type: 'subscription',
            message: `New payment: $${data.amount} from ${data.customer?.email}`,
            timestamp: FieldValue.serverTimestamp(),
          });
        }
        break;
      }

      case 'subscription.cancelled': {
        // Handle subscription cancellation
        const email = data.customer?.email;
        if (email) {
          const usersSnapshot = await db
            .collection('users')
            .where('email', '==', email)
            .limit(1)
            .get();

          if (!usersSnapshot.empty) {
            const userDoc = usersSnapshot.docs[0];
            await userDoc.ref.update({
              'subscription.status': 'cancelled',
              'subscription.cancelledAt': FieldValue.serverTimestamp(),
            });
          }
        }
        break;
      }

      case 'transfer.completed': {
        // Withdrawal completed
        await db.collection('transactions').add({
          type: 'withdrawal',
          amount: -data.amount,
          currency: data.currency,
          status: 'completed',
          reference: data.reference,
          date: FieldValue.serverTimestamp(),
        });

        const walletRef = db.doc('admin/wallet');
        await walletRef.update({
          pendingWithdrawals: FieldValue.increment(-data.amount),
        });
        break;
      }

      default:
        console.log('Unhandled webhook event:', event);
    }

    return NextResponse.json({ status: 'ok' });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}