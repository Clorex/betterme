// src/app/(main)/dashboard/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import DailyMotivation from '@/components/dashboard/DailyMotivation';
import CalorieSummaryRing from '@/components/dashboard/CalorieSummaryRing';
import TodaysWorkout from '@/components/dashboard/TodaysWorkout';
import WaterTrackerCard from '@/components/dashboard/WaterTrackerCard';
import StepsCard from '@/components/dashboard/StepsCard';
import WeightTrend from '@/components/dashboard/WeightTrend';
import StreakHabits from '@/components/dashboard/StreakHabits';
import CoachTipCard from '@/components/dashboard/CoachTipCard';
import QuickActions from '@/components/dashboard/QuickActions';
import { motion } from 'framer-motion';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function DashboardPage() {
  const { userProfile } = useAuthStore();
  const [refreshing, setRefreshing] = useState(false);
  const [touchStart, setTouchStart] = useState(0);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    // Simulate refresh delay
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setRefreshing(false);
  }, []);

  // Pull to refresh
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientY);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const touchEnd = e.changedTouches[0].clientY;
    const diff = touchEnd - touchStart;
    if (diff > 100 && window.scrollY === 0) {
      handleRefresh();
    }
  };

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="space-y-4"
    >
      {/* Pull to refresh indicator */}
      {refreshing && (
        <div className="flex items-center justify-center py-2">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-purple border-t-transparent" />
        </div>
      )}

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-4"
      >
        <motion.div variants={itemVariants}>
          <DailyMotivation />
        </motion.div>

        <motion.div variants={itemVariants}>
          <CalorieSummaryRing />
        </motion.div>

        <motion.div variants={itemVariants}>
          <TodaysWorkout />
        </motion.div>

        <motion.div variants={itemVariants}>
          <WaterTrackerCard />
        </motion.div>

        <motion.div variants={itemVariants}>
          <StepsCard />
        </motion.div>

        <motion.div variants={itemVariants}>
          <WeightTrend />
        </motion.div>

        <motion.div variants={itemVariants}>
          <StreakHabits />
        </motion.div>

        <motion.div variants={itemVariants}>
          <CoachTipCard />
        </motion.div>

        <motion.div variants={itemVariants}>
          <QuickActions />
        </motion.div>
      </motion.div>
    </div>
  );
}