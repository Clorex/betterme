// src/app/(main)/layout.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { useAuthStore } from '@/store/authStore';
import TopBar from '@/components/layout/TopBar';
import BottomNav from '@/components/layout/BottomNav';
import Loading from '@/components/ui/Loading';
import PaywallModal from '@/components/ui/PaywallModal';
import { AnimatePresence, motion } from 'framer-motion';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, userProfile, setUser, setProfile, loading: storeLoading } = useAuthStore();
  const [initializing, setInitializing] = useState(true);
  const [showPaywall, setShowPaywall] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        setUser(null);
        setProfile(null);
        router.replace('/login');
        return;
      }

      if (!firebaseUser.emailVerified) {
        router.replace('/verify-email');
        return;
      }

      setUser(firebaseUser);

      // Fetch profile
      try {
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        if (userDoc.exists()) {
          const profileData = userDoc.data() as any;
          setProfile(profileData);

          // Check if onboarding completed
          if (!profileData.onboardingCompleted) {
            router.replace('/onboarding');
            return;
          }

          // Check subscription/trial
          checkSubscriptionStatus(profileData);
        } else {
          router.replace('/onboarding');
          return;
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      }

      setInitializing(false);
    });

    return () => unsubscribe();
  }, []);

  const checkSubscriptionStatus = (profile: any) => {
    const subscription = profile.subscription;
    if (!subscription) {
      setShowPaywall(true);
      return;
    }

    if (subscription.status === 'active') {
      setShowPaywall(false);
      return;
    }

    // Check trial
    if (subscription.plan === 'trial' && subscription.endDate) {
      const trialEnd = subscription.endDate.toDate
        ? subscription.endDate.toDate()
        : new Date(subscription.endDate);
      if (new Date() > trialEnd) {
        setShowPaywall(true);
      }
      return;
    }

    // Check subscription expiry
    if (subscription.endDate) {
      const endDate = subscription.endDate.toDate
        ? subscription.endDate.toDate()
        : new Date(subscription.endDate);
      if (new Date() > endDate) {
        setShowPaywall(true);
      }
    }
  };

  if (initializing) {
    return <Loading fullScreen />;
  }

  return (
    <div className="relative mx-auto min-h-screen max-w-[480px] bg-brand-white dark:bg-brand-dark">
      <TopBar />

      <main className="px-4 pb-24 pt-16">
        <AnimatePresence mode="wait">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      <BottomNav />

      {showPaywall && (
        <PaywallModal
          onClose={() => {}}
          trialEndsAt={
            userProfile?.subscription?.endDate
              ? new Date(
                  userProfile.subscription.endDate.toDate
                    ? userProfile.subscription.endDate.toDate()
                    : userProfile.subscription.endDate
                )
              : undefined
          }
        />
      )}
    </div>
  );
}