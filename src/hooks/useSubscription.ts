'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '@/store/authStore';
import {
  checkSubscription,
  canAccessFeature,
  SubscriptionStatus,
  SubscriptionPlan,
} from '@/lib/subscriptionManager';

export function useSubscription() {
  const { user } = useAuthStore();
  const [status, setStatus] = useState<SubscriptionStatus>({
    isTrialActive: false,
    isSubscribed: false,
    plan: 'free',
    trialEndsAt: null,
    subscriptionEndsAt: null,
    daysRemaining: 0,
    isExpired: true,
  });
  const [loading, setLoading] = useState(true);
  const [showPaywall, setShowPaywall] = useState(false);

  const check = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const subStatus = await checkSubscription(user.uid);
      setStatus(subStatus);

      if (subStatus.isExpired && !subStatus.isTrialActive && !subStatus.isSubscribed) {
        setShowPaywall(true);
      } else {
        setShowPaywall(false);
      }
    } catch (error) {
      console.error('Subscription check error:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    check();

    // Re-check every 5 minutes
    const interval = setInterval(check, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [check]);

  const hasAccess = useCallback(
    (feature: string): boolean => {
      return canAccessFeature(status.plan, feature);
    },
    [status.plan]
  );

  const requireFeature = useCallback(
    (feature: string): boolean => {
      if (canAccessFeature(status.plan, feature)) {
        return true;
      }
      setShowPaywall(true);
      return false;
    },
    [status.plan]
  );

  return {
    ...status,
    loading,
    showPaywall,
    setShowPaywall,
    hasAccess,
    requireFeature,
    refresh: check,
  };
}