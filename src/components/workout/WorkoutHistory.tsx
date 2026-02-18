// src/components/workout/WorkoutHistory.tsx
'use client';

import { useEffect } from 'react';
import { Calendar, Clock, Dumbbell, Flame, Star, ChevronRight } from 'lucide-react';
import Card from '@/components/ui/Card';
import { useWorkoutStore } from '@/store/workoutStore';
import { useAuthStore } from '@/store/authStore';
import { cn } from '@/lib/utils';

export default function WorkoutHistory() {
  const { user } = useAuthStore();
  const { workoutHistory, fetchHistory } = useWorkoutStore();

  useEffect(() => {
    if (user) fetchHistory(user.uid);
  }, [user]);

  if (workoutHistory.length === 0) {
    return (
      <div className="space-y-4">
        <h2 className="font-heading text-lg font-bold text-brand-dark dark:text-brand-white">Workout History</h2>
        <Card>
          <div className="py-8 text-center">
            <Dumbbell className="mx-auto mb-3 h-10 w-10 text-gray-300" />
            <p className="text-sm text-gray-500">No workouts yet. Start training!</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="font-heading text-lg font-bold text-brand-dark dark:text-brand-white">
        Workout History
      </h2>
      <p className="text-xs text-gray-500">{workoutHistory.length} workouts logged</p>

      <div className="space-y-2">
        {workoutHistory.map((log: any) => (
          <Card key={log.id} padding="sm">
            <div className="flex items-center justify-between px-2 py-1">
              <div>
                <h3 className="text-sm font-bold text-brand-dark dark:text-brand-white">
                  {log.workoutName}
                </h3>
                <div className="mt-1 flex items-center gap-2 text-[10px] text-gray-400">
                  <span className="flex items-center gap-0.5"><Calendar className="h-3 w-3" />{log.date}</span>
                  <span className="flex items-center gap-0.5"><Clock className="h-3 w-3" />{log.duration}min</span>
                  <span className="flex items-center gap-0.5"><Flame className="h-3 w-3" />{log.caloriesBurned}cal</span>
                  {log.rating && (
                    <span className="flex items-center gap-0.5">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />{log.rating}
                    </span>
                  )}
                </div>
                {log.targetMuscles && (
                  <div className="mt-1 flex gap-1">
                    {(Array.isArray(log.targetMuscles) ? log.targetMuscles : [log.targetMuscles]).map((m: string, i: number) => (
                      <span key={i} className="rounded-full bg-brand-lavender/10 px-1.5 py-0.5 text-[9px] font-semibold text-brand-purple dark:text-brand-lavender">
                        {m}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="text-right">
                <p className="text-xs font-bold text-brand-dark dark:text-brand-white">
                  {log.completedExercises} exercises
                </p>
                {log.totalVolume > 0 && (
                  <p className="text-[10px] text-gray-400">{log.totalVolume.toLocaleString()} lbs vol</p>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}