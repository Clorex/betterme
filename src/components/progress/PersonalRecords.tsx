// src/components/progress/PersonalRecords.tsx
'use client';

import { useState, useEffect, useMemo } from 'react';
import { Trophy, Dumbbell, Footprints, Scale, Flame, Award } from 'lucide-react';
import Card from '@/components/ui/Card';
import { useAuthStore } from '@/store/authStore';
import { useWorkoutStore } from '@/store/workoutStore';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { cn } from '@/lib/utils';
import { format, differenceInDays } from 'date-fns';
import { motion } from 'framer-motion';

interface PR {
  label: string;
  value: string;
  date: string;
  icon: any;
  category: string;
  isRecent: boolean;
}

export default function PersonalRecords() {
  const { user, userProfile } = useAuthStore();
  const { workoutHistory, fetchHistory } = useWorkoutStore();
  const [weightHistory, setWeightHistory] = useState<any[]>([]);
  const [stepHistory, setStepHistory] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      fetchHistory(user.uid);
      fetchWeightHistory();
      fetchStepHistory();
    }
  }, [user]);

  const fetchWeightHistory = async () => {
    if (!user) return;
    try {
      const ref = collection(db, 'users', user.uid, 'measurements');
      const q = query(ref, orderBy('date', 'asc'));
      const snap = await getDocs(q);
      setWeightHistory(snap.docs.filter((d) => d.data().weight).map((d) => d.data()));
    } catch (err) { console.error(err); }
  };

  const fetchStepHistory = async () => {
    if (!user) return;
    try {
      const ref = collection(db, 'users', user.uid, 'steps');
      const q = query(ref, orderBy('date', 'desc'));
      const snap = await getDocs(q);
      setStepHistory(snap.docs.map((d) => d.data()));
    } catch (err) { console.error(err); }
  };

  const records = useMemo(() => {
    const prs: PR[] = [];
    const isRecent = (date: string) => differenceInDays(new Date(), new Date(date)) <= 7;

    // STRENGTH RECORDS
    const exerciseMaxes: Record<string, { weight: number; date: string }> = {};
    const exerciseMaxReps: Record<string, { reps: number; date: string }> = {};

    workoutHistory.forEach((log: any) => {
      (log.exercises || []).forEach((ex: any) => {
        (ex.sets || []).forEach((set: any) => {
          if (set.completed && set.weight > 0) {
            const key = ex.name;
            if (!exerciseMaxes[key] || set.weight > exerciseMaxes[key].weight) {
              exerciseMaxes[key] = { weight: set.weight, date: log.date };
            }
          }
          if (set.completed && set.reps > 0 && (!set.weight || set.weight === 0)) {
            const key = ex.name;
            if (!exerciseMaxReps[key] || set.reps > exerciseMaxReps[key].reps) {
              exerciseMaxReps[key] = { reps: set.reps, date: log.date };
            }
          }
        });
      });
    });

    // Top 5 strength PRs by weight
    const topLifts = Object.entries(exerciseMaxes)
      .sort(([, a], [, b]) => b.weight - a.weight)
      .slice(0, 5);

    topLifts.forEach(([name, data]) => {
      prs.push({
        label: `${name}`,
        value: `${data.weight} lbs`,
        date: data.date,
        icon: Dumbbell,
        category: 'strength',
        isRecent: isRecent(data.date),
      });
    });

    // Bodyweight PRs (push-ups, pull-ups etc)
    Object.entries(exerciseMaxReps).slice(0, 3).forEach(([name, data]) => {
      prs.push({
        label: `Most ${name}`,
        value: `${data.reps} reps`,
        date: data.date,
        icon: Dumbbell,
        category: 'strength',
        isRecent: isRecent(data.date),
      });
    });

    // CARDIO RECORDS
    if (stepHistory.length > 0) {
      const maxSteps = stepHistory.reduce((max, s) => s.steps > max.steps ? s : max, stepHistory[0]);
      prs.push({
        label: 'Most Steps in a Day',
        value: `${maxSteps.steps?.toLocaleString()} steps`,
        date: maxSteps.date,
        icon: Footprints,
        category: 'cardio',
        isRecent: isRecent(maxSteps.date),
      });
    }

    // Longest workout
    if (workoutHistory.length > 0) {
      const longest = workoutHistory.reduce((max: any, w: any) =>
        (w.duration || 0) > (max.duration || 0) ? w : max,
        workoutHistory[0]
      );
      if (longest.duration) {
        prs.push({
          label: 'Longest Workout',
          value: `${longest.duration} min`,
          date: longest.date,
          icon: Flame,
          category: 'cardio',
          isRecent: isRecent(longest.date),
        });
      }
    }

    // BODY RECORDS
    if (weightHistory.length > 0) {
      const startW = weightHistory[0].weight;
      const lowestW = weightHistory.reduce((min: any, w: any) => w.weight < min.weight ? w : min, weightHistory[0]);
      const totalLost = startW - lowestW.weight;

      prs.push({
        label: 'Lowest Weight',
        value: `${lowestW.weight} kg`,
        date: lowestW.date,
        icon: Scale,
        category: 'body',
        isRecent: isRecent(lowestW.date),
      });

      if (totalLost > 0) {
        prs.push({
          label: 'Total Weight Lost',
          value: `${totalLost.toFixed(1)} kg`,
          date: lowestW.date,
          icon: Scale,
          category: 'body',
          isRecent: isRecent(lowestW.date),
        });
      }
    }

    // CONSISTENCY RECORDS
    const streak = userProfile?.streaks?.longest || userProfile?.streaks?.current || 0;
    if (streak > 0) {
      prs.push({
        label: 'Longest Streak',
        value: `${streak} days`,
        date: '',
        icon: Flame,
        category: 'consistency',
        isRecent: false,
      });
    }

    if (workoutHistory.length > 0) {
      prs.push({
        label: 'Total Workouts',
        value: `${workoutHistory.length}`,
        date: '',
        icon: Trophy,
        category: 'consistency',
        isRecent: false,
      });
    }

    return prs;
  }, [workoutHistory, weightHistory, stepHistory, userProfile]);

  const categories = [
    { id: 'strength', label: '🏋️ Strength', color: 'border-l-blue-500' },
    { id: 'cardio', label: '🏃 Cardio', color: 'border-l-orange-500' },
    { id: 'body', label: '⚖️ Body', color: 'border-l-green-500' },
    { id: 'consistency', label: '🔥 Consistency', color: 'border-l-purple-500' },
  ];

  return (
    <div className="space-y-4">
      {categories.map((cat) => {
        const catRecords = records.filter((r) => r.category === cat.id);
        if (catRecords.length === 0) return null;

        return (
          <div key={cat.id}>
            <h3 className="mb-2 text-sm font-bold text-gray-500 dark:text-gray-400">
              {cat.label}
            </h3>
            <div className="space-y-2">
              {catRecords.map((pr, i) => {
                const Icon = pr.icon;
                const trophyEmoji = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '';

                return (
                  <motion.div
                    key={pr.label}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Card padding="sm" className={cn('border-l-4', cat.color)}>
                      <div className="flex items-center justify-between px-1">
                        <div className="flex items-center gap-3">
                          <Icon className="h-5 w-5 text-gray-400" />
                          <div>
                            <p className="text-sm font-medium text-brand-dark dark:text-brand-white">
                              {pr.label} {trophyEmoji}
                            </p>
                            {pr.date && (
                              <p className="text-[10px] text-gray-400">
                                {format(new Date(pr.date), 'MMM d, yyyy')}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-brand-dark dark:text-brand-white">
                            {pr.value}
                          </span>
                          {pr.isRecent && (
                            <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-[9px] font-bold text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
                              NEW!
                            </span>
                          )}
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </div>
        );
      })}

      {records.length === 0 && (
        <Card>
          <div className="py-8 text-center">
            <Trophy className="mx-auto mb-3 h-10 w-10 text-gray-300" />
            <p className="text-sm text-gray-500">No records yet</p>
            <p className="text-xs text-gray-400">Start working out to set your first PRs!</p>
          </div>
        </Card>
      )}
    </div>
  );
}