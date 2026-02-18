'use client';

import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export type SubscriptionPlan = 'free' | 'trial' | 'pro' | 'premium';

export interface SubscriptionStatus {
  isTrialActive: boolean;
  isSubscribed: boolean;
  plan: SubscriptionPlan;
  trialEndsAt: Date | null;
  subscriptionEndsAt: Date | null;
  daysRemaining: number;
  isExpired: boolean;
}

export async function checkSubscription(userId: string): Promise<SubscriptionStatus> {
  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      return {
        isTrialActive: false,
        isSubscribed: false,
        plan: 'free',
        trialEndsAt: null,
        subscriptionEndsAt: null,
        daysRemaining: 0,
        isExpired: true,
      };
    }

    const userData = userSnap.data();
    const subscription = userData.subscription;

    if (!subscription) {
      return {
        isTrialActive: false,
        isSubscribed: false,
        plan: 'free',
        trialEndsAt: null,
        subscriptionEndsAt: null,
        daysRemaining: 0,
        isExpired: true,
      };
    }

    const now = new Date();

    // Check trial
    if (subscription.status === 'trial') {
      const trialEnd = subscription.trialEndsAt?.toDate
        ? subscription.trialEndsAt.toDate()
        : subscription.trialEndsAt
        ? new Date(subscription.trialEndsAt)
        : null;

      if (trialEnd && trialEnd > now) {
        const remaining = Math.ceil(
          (trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60)
        ); // hours remaining
        return {
          isTrialActive: true,
          isSubscribed: false,
          plan: 'trial',
          trialEndsAt: trialEnd,
          subscriptionEndsAt: null,
          daysRemaining: Math.ceil(remaining / 24),
          isExpired: false,
        };
      } else {
        // Trial expired
        await updateDoc(userRef, {
          'subscription.status': 'expired',
        });
        return {
          isTrialActive: false,
          isSubscribed: false,
          plan: 'free',
          trialEndsAt: trialEnd,
          subscriptionEndsAt: null,
          daysRemaining: 0,
          isExpired: true,
        };
      }
    }

    // Check active subscription
    if (subscription.status === 'active') {
      const subEnd = subscription.endDate?.toDate
        ? subscription.endDate.toDate()
        : subscription.endDate
        ? new Date(subscription.endDate)
        : null;

      if (subEnd && subEnd > now) {
        const daysRemaining = Math.ceil(
          (subEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        );
        return {
          isTrialActive: false,
          isSubscribed: true,
          plan: (subscription.plan as SubscriptionPlan) || 'pro',
          trialEndsAt: null,
          subscriptionEndsAt: subEnd,
          daysRemaining,
          isExpired: false,
        };
      } else {
        // Subscription expired - give 3 day grace period
        const gracePeriodEnd = new Date(subEnd!.getTime() + 3 * 24 * 60 * 60 * 1000);

        if (now < gracePeriodEnd) {
          return {
            isTrialActive: false,
            isSubscribed: true,
            plan: (subscription.plan as SubscriptionPlan) || 'pro',
            trialEndsAt: null,
            subscriptionEndsAt: subEnd,
            daysRemaining: 0,
            isExpired: false, // grace period
          };
        }

        // Grace period ended
        await updateDoc(userRef, {
          'subscription.status': 'expired',
        });
        return {
          isTrialActive: false,
          isSubscribed: false,
          plan: 'free',
          trialEndsAt: null,
          subscriptionEndsAt: subEnd,
          daysRemaining: 0,
          isExpired: true,
        };
      }
    }

    // Expired or cancelled
    return {
      isTrialActive: false,
      isSubscribed: false,
      plan: 'free',
      trialEndsAt: null,
      subscriptionEndsAt: null,
      daysRemaining: 0,
      isExpired: true,
    };
  } catch (error) {
    console.error('Error checking subscription:', error);
    return {
      isTrialActive: false,
      isSubscribed: false,
      plan: 'free',
      trialEndsAt: null,
      subscriptionEndsAt: null,
      daysRemaining: 0,
      isExpired: true,
    };
  }
}

// Feature gating utility
export function canAccessFeature(
  plan: SubscriptionPlan,
  feature: string
): boolean {
  const FREE_FEATURES = [
    'basic_calorie_logging',
    'basic_workout_view',
    'community_view',
    'settings',
    'profile',
  ];

  const PRO_FEATURES = [
    ...FREE_FEATURES,
    'ai_food_analyzer',
    'ai_meal_plans',
    'ai_workout_generator',
    'ai_coach_chat',
    'full_tracking',
    'community_posting',
    'progress_photos',
    'barcode_scanner',
    'fasting_timer',
    'challenges',
    'accountability_partner',
  ];

  const PREMIUM_FEATURES = [
    ...PRO_FEATURES,
    'advanced_analytics',
    'family_mode',
    'priority_ai',
    'custom_programs',
    'export_reports',
    'early_access',
  ];

  switch (plan) {
    case 'premium':
      return PREMIUM_FEATURES.includes(feature);
    case 'pro':
    case 'trial':
      return PRO_FEATURES.includes(feature);
    case 'free':
    default:
      return FREE_FEATURES.includes(feature);
  }
}