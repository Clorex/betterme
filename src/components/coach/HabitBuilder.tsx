// src/components/coach/HabitBuilder.tsx
'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Target,
  Check,
  Flame,
  Lock,
  ChevronRight,
  Star,
  TrendingUp,
} from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useAuthStore } from '@/store/authStore';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { format, differenceInDays, subDays } from 'date-fns';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

interface Habit {
  id: string;
  name: string;
  emoji: string;
  description: string;
  unlockWeek: number;
  daysToMaster: number;
}

const allHabits: Habit[] = [
  { id: 'h1', name: 'Drink 8 Glasses of Water', emoji: '💧', description: 'Hydration is the foundation of health and performance.', unlockWeek: 1, daysToMaster: 21 },
  { id: 'h2', name: 'Log Every Meal', emoji: '📝', description: 'Awareness is the first step. You can\'t manage what you don\'t measure.', unlockWeek: 3, daysToMaster: 21 },
  { id: 'h3', name: 'Complete All Planned Workouts', emoji: '🏋️', description: 'Consistency in training is what builds results.', unlockWeek: 5, daysToMaster: 21 },
  { id: 'h4', name: 'Hit Your Protein Goal', emoji: '🥩', description: 'Protein is the #1 macro for body transformation.', unlockWeek: 7, daysToMaster: 21 },
  { id: 'h5', name: 'Take 10,000 Steps Daily', emoji: '👟', description: 'NEAT (daily movement) burns more than formal exercise.', unlockWeek: 9, daysToMaster: 21 },
  { id: 'h6', name: 'Sleep 7+ Hours', emoji: '😴', description: 'Sleep is when your body repairs muscle and burns fat.', unlockWeek: 11, daysToMaster: 21 },
  { id: 'h7', name: '5-Min Daily Stretch', emoji: '🧘', description: 'Flexibility prevents injury and improves recovery.', unlockWeek: 13, daysToMaster: 21 },
  { id: 'h8', name: 'No Screens Before Bed', emoji: '📵', description: 'Blue light disrupts melatonin. Better sleep = better results.', unlockWeek: 15, daysToMaster: 21 },
];

interface HabitProgress {
  habitId: string;
  streak: number;
  longestStreak: number;
  mastered: boolean;
  completedDates: string[];
}

export default function HabitBuilder() {
  const { user, userProfile } = useAuthStore();
  const [progress, setProgress] = useState<Record<string, HabitProgress>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) loadProgress();
  }, [user]);

  const loadProgress = async () => {
    if (!user) return;
    setLoading(false);
    try {
      const progressDoc = await getDoc(doc(db, 'users', user.uid, 'habits', 'habitBuilder'));
      if (progressDoc.exists()) {
        setProgress(progressDoc.data().habits || {});
      }
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const saveProgress = async (updated: Record<string, HabitProgress>) => {
    if (!user) return;
    try {
      await setDoc(doc(db, 'users', user.uid, 'habits', 'habitBuilder'), {
        habits: updated,
        updatedAt: new Date().toISOString(),
      });
    } catch (err) { console.error(err); }
  };

  const toggleHabitToday = (habitId: string) => {
    const today = format(new Date(), 'yyyy-MM-dd');
    const current = progress[habitId] || {
      habitId,
      streak: 0,
      longestStreak: 0,
      mastered: false,
      completedDates: [],
    };

    const alreadyDone = current.completedDates.includes(today);

    let updatedDates: string[];
    let newStreak: number;

    if (alreadyDone) {
      updatedDates = current.completedDates.filter((d) => d !== today);
      newStreak = Math.max(0, current.streak - 1);
    } else {
      updatedDates = [...current.completedDates, today];

      // Calculate streak
      newStreak = 1;
      let checkDate = subDays(new Date(), 1);
      while (updatedDates.includes(format(checkDate, 'yyyy-MM-dd'))) {
        newStreak++;
        checkDate = subDays(checkDate, 1);
      }
    }

    const updatedProgress: HabitProgress = {
      ...current,
      completedDates: updatedDates,
      streak: newStreak,
      longestStreak: Math.max(current.longestStreak, newStreak),
      mastered: newStreak >= 21,
    };

    const updated = { ...progress, [habitId]: updatedProgress };
    setProgress(updated);
    saveProgress(updated);

    if (updatedProgress.mastered && !current.mastered) {
      toast.success(`🏆 Habit mastered: ${allHabits.find((h) => h.id === habitId)?.name}!`);
    }
  };

  // Current level
  const masteredCount = Object.values(progress).filter((p) => p.mastered).length;
  const level = masteredCount <= 2 ? 1 : masteredCount <= 4 ? 2 : masteredCount <= 6 ? 3 : masteredCount <= 7 ? 4 : 5;
  const levelLabels = ['Beginner', 'Building', 'Consistent', 'Lifestyle', 'Master'];
  const levelEmojis = ['🌱', '📈', '💪', '🏆', '👑'];

  // Determine which habits are unlocked
  const daysSinceJoin = userProfile?.createdAt
    ? differenceInDays(new Date(), new Date(userProfile.createdAt))
    : 0;
  const weeksSinceJoin = Math.floor(daysSinceJoin / 7) + 1;

  const today = format(new Date(), 'yyyy-MM-dd');

  // Habit Score
  const activeHabits = allHabits.filter((h) => weeksSinceJoin >= h.unlockWeek);
  const todayCompleted = activeHabits.filter((h) => progress[h.id]?.completedDates.includes(today)).length;
  const habitScore = activeHabits.length > 0 ? Math.round((todayCompleted / activeHabits.length) * 100) : 0;

  return (
    <div className="space-y-4">
      {/* Level Card */}
      <Card>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500">Your Level</p>
            <h2 className="font-heading text-lg font-bold text-brand-dark dark:text-brand-white">
              {levelEmojis[level - 1]} Level {level}: {levelLabels[level - 1]}
            </h2>
            <p className="text-xs text-gray-400">
              {masteredCount} habits mastered · Score: {habitScore}%
            </p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-extrabold text-brand-purple dark:text-brand-lavender">
              {habitScore}
            </p>
            <p className="text-[10px] text-gray-400">today</p>
          </div>
        </div>
      </Card>

      {/* Habit Cards */}
      {allHabits.map((habit) => {
        const isUnlocked = weeksSinceJoin >= habit.unlockWeek;
        const hp = progress[habit.id];
        const isMastered = hp?.mastered || false;
        const streak = hp?.streak || 0;
        const isDoneToday = hp?.completedDates.includes(today) || false;

        // Chain visualization (last 7 days)
        const last7 = Array.from({ length: 7 }, (_, i) => {
          const d = format(subDays(new Date(), 6 - i), 'yyyy-MM-dd');
          return hp?.completedDates.includes(d) || false;
        });

        return (
          <Card key={habit.id} padding="sm" className={cn(!isUnlocked && 'opacity-50')}>
            <div className="flex items-center gap-3 px-1">
              <button
                onClick={() => isUnlocked && !isMastered && toggleHabitToday(habit.id)}
                disabled={!isUnlocked || isMastered}
                className={cn(
                  'flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-lg transition-all active:scale-90',
                  isDoneToday || isMastered
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-100 dark:bg-brand-surface'
                )}
              >
                {isMastered ? '🏆' : isDoneToday ? <Check className="h-5 w-5" /> : habit.emoji}
              </button>

              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className={cn(
                    'text-sm font-bold',
                    isMastered ? 'text-green-600 dark:text-green-400' : 'text-brand-dark dark:text-brand-white'
                  )}>
                    {habit.name}
                  </h3>
                  {!isUnlocked && <Lock className="h-3.5 w-3.5 text-gray-400" />}
                </div>
                <p className="text-[10px] text-gray-400">
                  {isMastered
                    ? '✅ Mastered!'
                    : isUnlocked
                    ? `🔥 ${streak} day streak · ${21 - streak} days to master`
                    : `Unlocks week ${habit.unlockWeek}`}
                </p>

                {/* Chain visualization */}
                {isUnlocked && (
                  <div className="mt-1.5 flex gap-1">
                    {last7.map((done, i) => (
                      <div
                        key={i}
                        className={cn(
                          'h-4 w-4 rounded-sm transition-all',
                          done
                            ? 'bg-green-500'
                            : 'bg-gray-200 dark:bg-gray-700'
                        )}
                      />
                    ))}
                  </div>
                )}
              </div>

              {isUnlocked && streak > 0 && (
                <div className="flex items-center gap-0.5 text-orange-500">
                  <Flame className="h-4 w-4" />
                  <span className="text-xs font-bold">{streak}</span>
                </div>
              )}
            </div>
          </Card>
        );
      })}

      {/* Info */}
      <Card padding="sm">
        <p className="px-1 text-xs text-gray-500 dark:text-gray-400">
          💡 <strong>How it works:</strong> Focus on ONE habit at a time. Complete it for 21 consecutive days to &ldquo;master&rdquo; it. New habits unlock every 2 weeks. Don&apos;t break the chain!
        </p>
      </Card>
    </div>
  );
}