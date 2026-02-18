// src/components/workout/CalorieCounter.tsx
'use client';

import { Flame } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CalorieCounterProps {
  elapsed: number; // seconds
  intensity: 'low' | 'moderate' | 'high';
  weight: number; // kg
}

export default function CalorieCounter({ elapsed, intensity, weight }: CalorieCounterProps) {
  const mets: Record<string, number> = {
    low: 3.5,
    moderate: 6,
    high: 9,
  };

  const met = mets[intensity];
  const hours = elapsed / 3600;
  const caloriesBurned = Math.round(met * weight * hours);

  return (
    <div className="flex items-center gap-1.5 rounded-full bg-orange-100 px-3 py-1.5 dark:bg-orange-900/30">
      <Flame className="h-4 w-4 text-orange-500" />
      <span className="text-sm font-bold text-orange-600 dark:text-orange-400">
        {caloriesBurned} cal
      </span>
    </div>
  );
}