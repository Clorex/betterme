// src/components/dashboard/TodaysWorkout.tsx
'use client';

import { useRouter } from 'next/navigation';
import { Dumbbell, Clock, ChevronRight, CheckCircle2 } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useAuthStore } from '@/store/authStore';
import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { format } from 'date-fns';

export default function TodaysWorkout() {
  const router = useRouter();
  const { user, userProfile } = useAuthStore();
  const [todayWorkout, setTodayWorkout] = useState<any>(null);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    if (!user) return;

    const checkWorkout = async () => {
      const today = format(new Date(), 'yyyy-MM-dd');
      try {
        const workoutDoc = await getDoc(
          doc(db, 'users', user.uid, 'workoutLogs', today)
        );
        if (workoutDoc.exists()) {
          setTodayWorkout(workoutDoc.data());
          setCompleted(true);
        } else {
          // Generate a placeholder workout based on profile
          const goal = userProfile?.profile?.goal || 'general_fitness';
          setTodayWorkout({
            workoutName: getDefaultWorkoutName(goal),
            targetMuscles: getDefaultMuscles(goal),
            estimatedDuration: userProfile?.profile?.schedule?.timePerWorkout || 45,
          });
        }
      } catch (err) {
        console.error('Error checking workout:', err);
      }
    };

    checkWorkout();
  }, [user, userProfile]);

  return (
    <Card onClick={() => router.push('/workout')} clickable>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
              completed
                ? 'bg-green-100 dark:bg-green-900/30'
                : 'bg-brand-lavender/20 dark:bg-brand-lavender/10'
            }`}
          >
            {completed ? (
              <CheckCircle2 className="h-6 w-6 text-green-500" />
            ) : (
              <Dumbbell className="h-6 w-6 text-brand-purple dark:text-brand-lavender" />
            )}
          </div>

          <div>
            <h3 className="font-heading text-sm font-bold text-brand-dark dark:text-brand-white">
              {todayWorkout?.workoutName || "Today's Workout"}
            </h3>
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              {todayWorkout?.targetMuscles && (
                <span>
                  {Array.isArray(todayWorkout.targetMuscles)
                    ? todayWorkout.targetMuscles.join(' • ')
                    : todayWorkout.targetMuscles}
                </span>
              )}
              {todayWorkout?.estimatedDuration && (
                <>
                  <span>·</span>
                  <span className="flex items-center gap-0.5">
                    <Clock className="h-3 w-3" />
                    {todayWorkout.estimatedDuration} min
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        <ChevronRight className="h-5 w-5 text-gray-400" />
      </div>

      {!completed && (
        <Button
          onClick={(e) => {
            e.stopPropagation();
            router.push('/workout');
          }}
          variant="primary"
          size="sm"
          fullWidth
          className="mt-3"
        >
          Start Workout
        </Button>
      )}

      {completed && (
        <div className="mt-3 flex items-center gap-2 rounded-xl bg-green-50 px-3 py-2 dark:bg-green-900/20">
          <CheckCircle2 className="h-4 w-4 text-green-500" />
          <span className="text-sm font-medium text-green-600 dark:text-green-400">
            Completed! Great job! 💪
          </span>
        </div>
      )}
    </Card>
  );
}

function getDefaultWorkoutName(goal: string): string {
  const names: Record<string, string> = {
    lose_fat: 'Fat Burn HIIT Circuit',
    build_muscle: 'Upper Body Strength',
    get_lean: 'Full Body Lean',
    body_recomp: 'Strength & Conditioning',
    get_stronger: 'Power Building',
    general_fitness: 'Full Body Fitness',
  };
  return names[goal] || 'Full Body Workout';
}

function getDefaultMuscles(goal: string): string[] {
  const muscles: Record<string, string[]> = {
    lose_fat: ['Full Body', 'Cardio'],
    build_muscle: ['Chest', 'Shoulders', 'Triceps'],
    get_lean: ['Full Body'],
    body_recomp: ['Legs', 'Core'],
    get_stronger: ['Back', 'Biceps'],
    general_fitness: ['Full Body'],
  };
  return muscles[goal] || ['Full Body'];
}