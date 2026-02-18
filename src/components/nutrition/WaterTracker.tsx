// src/components/nutrition/WaterTracker.tsx
'use client';

import { useState, useEffect } from 'react';
import { Droplets, Plus, Minus, Trophy, GlassWater } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useNutrition } from '@/hooks/useNutrition';
import { useAuthStore } from '@/store/authStore';
import { calculateWaterIntake, cn } from '@/lib/utils';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

export default function WaterTracker() {
  const { user, userProfile } = useAuthStore();
  const { dailyLog, logWater } = useNutrition();
  const [weekHistory, setWeekHistory] = useState<{ date: string; glasses: number }[]>([]);
  const [showCelebration, setShowCelebration] = useState(false);

  const weight = userProfile?.metrics?.currentWeight || 70;
  const activityLevel = userProfile?.profile?.activityLevel || 'moderately_active';
  const totalMl = calculateWaterIntake(weight, activityLevel);
  const goalGlasses = Math.ceil(totalMl / 250);
  const currentGlasses = dailyLog.waterIntake?.glasses || 0;
  const percentage = Math.min((currentGlasses / goalGlasses) * 100, 100);

  useEffect(() => {
    fetchWeekHistory();
  }, [user]);

  const fetchWeekHistory = async () => {
    if (!user) return;
    try {
      const logsRef = collection(db, 'users', user.uid, 'foodLogs');
      const q = query(logsRef, orderBy('date', 'desc'), limit(7));
      const snap = await getDocs(q);
      const data = snap.docs.map((d) => ({
        date: d.data().date,
        glasses: d.data().waterIntake?.glasses || 0,
      })).reverse();
      setWeekHistory(data);
    } catch (err) {
      console.error('Error fetching water history:', err);
    }
  };

  const handleAdd = async (amount: number) => {
    const newCount = Math.max(0, currentGlasses + amount);
    await logWater(newCount);

    if (amount > 0 && newCount >= goalGlasses && currentGlasses < goalGlasses) {
      setShowCelebration(true);
      toast.success('🎉 Water goal reached! Great job staying hydrated!');
      setTimeout(() => setShowCelebration(false), 3000);
    }
  };

  const maxBarGlasses = Math.max(...weekHistory.map((d) => d.glasses), goalGlasses);

  return (
    <div className="space-y-4">
      {/* Main Water Card */}
      <Card>
        <div className="relative text-center">
          {/* Celebration */}
          {showCelebration && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className="absolute -top-2 left-1/2 z-10 -translate-x-1/2"
            >
              <div className="rounded-full bg-green-100 px-4 py-2 dark:bg-green-900/30">
                <Trophy className="inline h-5 w-5 text-yellow-500" />
                <span className="ml-1 text-sm font-bold text-green-600 dark:text-green-400">
                  Goal Reached!
                </span>
              </div>
            </motion.div>
          )}

          <div className="mb-4">
            <Droplets className="mx-auto mb-2 h-8 w-8 text-blue-500" />
            <h2 className="font-heading text-2xl font-bold text-brand-dark dark:text-brand-white">
              {currentGlasses}
              <span className="text-base font-normal text-gray-400">
                {' '}/ {goalGlasses}
              </span>
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {(currentGlasses * 250 / 1000).toFixed(1)}L / {(totalMl / 1000).toFixed(1)}L
            </p>
          </div>

          {/* Progress bar */}
          <div className="mx-auto mb-4 h-4 w-full max-w-[280px] overflow-hidden rounded-full bg-blue-100 dark:bg-blue-900/30">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-blue-400 to-blue-500"
              initial={{ width: 0 }}
              animate={{ width: `${percentage}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>

          {/* Water drop indicators */}
          <div className="mb-6 flex flex-wrap justify-center gap-2">
            {Array.from({ length: goalGlasses }).map((_, i) => (
              <motion.div
                key={i}
                initial={false}
                animate={{
                  scale: i < currentGlasses ? 1 : 0.85,
                  opacity: i < currentGlasses ? 1 : 0.4,
                }}
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-full transition-colors',
                  i < currentGlasses
                    ? 'bg-blue-500 text-white'
                    : 'border-2 border-blue-200 bg-transparent dark:border-blue-800'
                )}
              >
                <Droplets className="h-4 w-4" />
              </motion.div>
            ))}
          </div>

          {/* Quick Add Buttons */}
          <div className="flex justify-center gap-3">
            <button
              onClick={() => handleAdd(-1)}
              disabled={currentGlasses === 0}
              className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-500 transition-all active:scale-90 disabled:opacity-30 dark:bg-brand-surface"
            >
              <Minus className="h-5 w-5" />
            </button>

            <button
              onClick={() => handleAdd(1)}
              className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-500 text-white shadow-lg shadow-blue-500/30 transition-all active:scale-90"
            >
              <Plus className="h-6 w-6" />
            </button>

            <button
              onClick={() => handleAdd(2)}
              className="flex h-12 items-center gap-1 rounded-full bg-blue-100 px-4 text-blue-600 transition-all active:scale-90 dark:bg-blue-900/30 dark:text-blue-400"
            >
              <GlassWater className="h-4 w-4" />
              <span className="text-xs font-bold">500ml</span>
            </button>
          </div>
        </div>
      </Card>

      {/* Weekly History */}
      <Card>
        <h3 className="mb-3 text-sm font-bold text-gray-500 dark:text-gray-400">
          Last 7 Days
        </h3>
        <div className="flex items-end justify-between gap-1.5">
          {weekHistory.length > 0 ? (
            weekHistory.map((day, i) => {
              const heightPct = (day.glasses / maxBarGlasses) * 100;
              const metGoal = day.glasses >= goalGlasses;
              const dayLabel = new Date(day.date).toLocaleDateString('en', { weekday: 'short' }).slice(0, 2);

              return (
                <div key={i} className="flex flex-1 flex-col items-center gap-1">
                  <span className="text-[9px] font-medium text-gray-400">
                    {day.glasses}
                  </span>
                  <div className="flex h-20 w-full items-end">
                    <div
                      className={cn(
                        'w-full rounded-t-lg transition-all',
                        metGoal
                          ? 'bg-blue-500'
                          : 'bg-blue-200 dark:bg-blue-900/40'
                      )}
                      style={{ height: `${Math.max(heightPct, 5)}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-gray-400">{dayLabel}</span>
                </div>
              );
            })
          ) : (
            <p className="w-full text-center text-sm text-gray-400 py-4">
              No water history yet. Start tracking today!
            </p>
          )}
        </div>

        {/* Goal indicator line */}
        {weekHistory.length > 0 && (
          <div className="mt-2 flex items-center gap-2">
            <div className="h-px flex-1 bg-blue-300 dark:bg-blue-800" />
            <span className="text-[10px] text-blue-400">Goal: {goalGlasses} glasses</span>
            <div className="h-px flex-1 bg-blue-300 dark:bg-blue-800" />
          </div>
        )}
      </Card>

      {/* Tips */}
      <Card>
        <h3 className="mb-2 text-sm font-bold text-gray-500 dark:text-gray-400">
          💡 Hydration Tips
        </h3>
        <ul className="space-y-2 text-xs leading-relaxed text-gray-600 dark:text-gray-300">
          <li>• Drink a glass of water first thing in the morning</li>
          <li>• Keep a water bottle at your desk or with you</li>
          <li>• Drink a glass before each meal to aid digestion</li>
          <li>• If you feel hungry, try water first — thirst is often mistaken for hunger</li>
          <li>• Add lemon, cucumber, or mint for flavor variety</li>
        </ul>
      </Card>
    </div>
  );
}