// src/components/dashboard/StreakHabits.tsx
'use client';

import { useState, useEffect } from 'react';
import { Flame, CheckCircle2, Circle } from 'lucide-react';
import Card from '@/components/ui/Card';
import { useAuthStore } from '@/store/authStore';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface Habit {
  id: string;
  label: string;
  emoji: string;
  completed: boolean;
}

const defaultHabits: Habit[] = [
  { id: 'breakfast', label: 'Log breakfast', emoji: '🌅', completed: false },
  { id: 'workout', label: 'Complete workout', emoji: '🏋️', completed: false },
  { id: 'water', label: 'Drink 8 glasses water', emoji: '💧', completed: false },
  { id: 'meals', label: 'Log all meals', emoji: '🍽️', completed: false },
  { id: 'steps', label: 'Take 10,000 steps', emoji: '👟', completed: false },
];

export default function StreakHabits() {
  const { user, userProfile } = useAuthStore();
  const [habits, setHabits] = useState<Habit[]>(defaultHabits);

  const streak = userProfile?.streaks?.current || 0;
  const completedCount = habits.filter((h) => h.completed).length;
  const totalCount = habits.length;

  useEffect(() => {
    if (!user) return;
    fetchHabits();
  }, [user]);

  const fetchHabits = async () => {
    if (!user) return;
    const today = format(new Date(), 'yyyy-MM-dd');
    try {
      const habitDoc = await getDoc(doc(db, 'users', user.uid, 'habits', today));
      if (habitDoc.exists()) {
        const data = habitDoc.data();
        setHabits(
          defaultHabits.map((h) => ({
            ...h,
            completed: data[h.id] || false,
          }))
        );
      }
    } catch (err) {
      console.error('Error fetching habits:', err);
    }
  };

  const toggleHabit = async (habitId: string) => {
    if (!user) return;
    const today = format(new Date(), 'yyyy-MM-dd');

    const updated = habits.map((h) =>
      h.id === habitId ? { ...h, completed: !h.completed } : h
    );
    setHabits(updated);

    try {
      const habitData: Record<string, boolean> = {};
      updated.forEach((h) => {
        habitData[h.id] = h.completed;
      });

      await setDoc(
        doc(db, 'users', user.uid, 'habits', today),
        { ...habitData, date: today },
        { merge: true }
      );
    } catch (err) {
      console.error('Error toggling habit:', err);
      fetchHabits(); // Revert on error
    }
  };

  return (
    <Card>
      {/* Streak */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Flame className="h-5 w-5 text-orange-500" />
          <h3 className="text-sm font-bold text-brand-dark dark:text-brand-white">
            {streak} Day Streak
          </h3>
        </div>
        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
          {completedCount}/{totalCount} done
        </span>
      </div>

      {/* Progress bar */}
      <div className="mb-4 h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
        <div
          className="h-full rounded-full bg-brand-purple transition-all duration-500 dark:bg-brand-lavender"
          style={{ width: `${(completedCount / totalCount) * 100}%` }}
        />
      </div>

      {/* Habits list */}
      <div className="space-y-2">
        {habits.map((habit) => (
          <button
            key={habit.id}
            onClick={() => toggleHabit(habit.id)}
            className={cn(
              'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all active:scale-[0.98]',
              habit.completed
                ? 'bg-green-50 dark:bg-green-900/20'
                : 'bg-gray-50 dark:bg-brand-surface/50'
            )}
          >
            {habit.completed ? (
              <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-green-500" />
            ) : (
              <Circle className="h-5 w-5 flex-shrink-0 text-gray-300 dark:text-gray-600" />
            )}
            <span
              className={cn(
                'text-sm',
                habit.completed
                  ? 'text-green-700 line-through dark:text-green-400'
                  : 'text-gray-700 dark:text-gray-300'
              )}
            >
              {habit.emoji} {habit.label}
            </span>
          </button>
        ))}
      </div>
    </Card>
  );
}