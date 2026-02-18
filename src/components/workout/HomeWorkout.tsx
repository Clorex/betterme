// src/components/workout/HomeWorkout.tsx
'use client';

import { useState } from 'react';
import { Home, Clock, Flame, Play, Volume2, VolumeX } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { WorkoutData } from '@/store/workoutStore';

const homeWorkouts = [
  { id: 'hw1', name: 'Full Body Blast', duration: 20, calories: 200, muscles: 'Full Body', level: 'All', noJump: false },
  { id: 'hw2', name: 'Upper Body Strength', duration: 15, calories: 120, muscles: 'Chest, Arms, Core', level: 'All', noJump: true },
  { id: 'hw3', name: 'Lower Body Burn', duration: 20, calories: 180, muscles: 'Legs, Glutes', level: 'All', noJump: false },
  { id: 'hw4', name: 'Core Crusher', duration: 10, calories: 80, muscles: 'Core, Abs', level: 'All', noJump: true },
  { id: 'hw5', name: 'HIIT Cardio (No Equipment)', duration: 15, calories: 200, muscles: 'Full Body', level: 'Intermediate', noJump: false },
  { id: 'hw6', name: 'Apartment Friendly', duration: 20, calories: 150, muscles: 'Full Body', level: 'All', noJump: true },
  { id: 'hw7', name: 'Yoga Flow', duration: 30, calories: 100, muscles: 'Flexibility', level: 'All', noJump: true },
  { id: 'hw8', name: 'Quick Morning Stretch', duration: 10, calories: 40, muscles: 'Full Body', level: 'All', noJump: true },
];

export default function HomeWorkout({ onStart }: { onStart: (w: WorkoutData) => void }) {
  const [noJumpOnly, setNoJumpOnly] = useState(false);

  const filtered = noJumpOnly ? homeWorkouts.filter(w => w.noJump) : homeWorkouts;

  const handleStart = (hw: typeof homeWorkouts[0]) => {
    const workout: WorkoutData = {
      workoutName: hw.name,
      targetMuscles: [hw.muscles],
      estimatedDuration: hw.duration,
      estimatedCaloriesBurned: hw.calories,
      warmup: [{ name: 'Arm Circles', duration: '30 seconds' }, { name: 'Jumping Jacks', duration: '30 seconds' }],
      exercises: [
        { name: 'Push-ups', muscleGroup: 'chest', sets: 3, reps: '12-15', suggestedWeight: 'bodyweight', restSeconds: 30, instructions: 'Hands shoulder width', tips: 'Keep core tight', alternatives: ['Knee Push-ups'], completedSets: [] },
        { name: 'Squats', muscleGroup: 'legs', sets: 3, reps: '15-20', suggestedWeight: 'bodyweight', restSeconds: 30, instructions: 'Feet shoulder width apart', tips: 'Knees track over toes', alternatives: ['Wall Sit'], completedSets: [] },
        { name: 'Plank', muscleGroup: 'core', sets: 3, reps: '30-45 sec', suggestedWeight: 'bodyweight', restSeconds: 30, instructions: 'Hold position, keep body straight', tips: 'Don\'t let hips sag', alternatives: ['Dead Bug'], completedSets: [] },
      ],
      cooldown: [{ name: 'Stretch', duration: '2 minutes' }],
      coachNote: 'No equipment needed! Focus on form over speed.',
    };
    onStart(workout);
  };

  return (
    <div className="space-y-4">
      <h2 className="font-heading text-lg font-bold text-brand-dark dark:text-brand-white">
        🏠 Home Workouts
      </h2>

      <div className="flex items-center gap-2">
        <button
          onClick={() => setNoJumpOnly(!noJumpOnly)}
          className={cn(
            'flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-all',
            noJumpOnly ? 'bg-brand-purple text-white dark:bg-brand-lavender dark:text-brand-dark' : 'bg-gray-100 text-gray-500 dark:bg-brand-surface'
          )}
        >
          {noJumpOnly ? <VolumeX className="h-3 w-3" /> : <Volume2 className="h-3 w-3" />}
          Apartment Friendly
        </button>
      </div>

      <div className="space-y-3">
        {filtered.map((hw) => (
          <Card key={hw.id}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-brand-dark dark:text-brand-white">{hw.name}</h3>
                <div className="mt-1 flex items-center gap-2 text-xs text-gray-400">
                  <span className="flex items-center gap-0.5"><Clock className="h-3 w-3" />{hw.duration}min</span>
                  <span className="flex items-center gap-0.5"><Flame className="h-3 w-3" />~{hw.calories}cal</span>
                  <span>{hw.muscles}</span>
                  {hw.noJump && <span className="rounded-full bg-green-100 px-1.5 py-0.5 text-[9px] font-bold text-green-600">🔇 No Jump</span>}
                </div>
              </div>
              <Button onClick={() => handleStart(hw)} variant="primary" size="sm">
                <Play className="mr-1 h-3 w-3" />
                Start
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}