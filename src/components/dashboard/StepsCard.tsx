// src/components/dashboard/StepsCard.tsx
'use client';

import { Footprints, TrendingUp } from 'lucide-react';
import Card from '@/components/ui/Card';
import { useSteps } from '@/hooks/useSteps';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

export default function StepsCard() {
  const router = useRouter();
  const { steps, goal, distance, caloriesBurned, isSupported } = useSteps();

  const percentage = Math.min((steps / goal) * 100, 100);

  return (
    <Card onClick={() => router.push('/progress')} clickable>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-100 dark:bg-emerald-900/30">
            <Footprints className="h-5 w-5 text-emerald-500" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-brand-dark dark:text-brand-white">
              Steps Today
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {steps.toLocaleString()} / {goal.toLocaleString()}
            </p>
          </div>
        </div>

        <div className="text-right">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {distance.toFixed(1)} km
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {caloriesBurned} cal
          </p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
        <div
          className={cn(
            'h-full rounded-full transition-all duration-700',
            percentage >= 100
              ? 'bg-emerald-500'
              : percentage >= 60
              ? 'bg-emerald-400'
              : 'bg-brand-lavender'
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {!isSupported && (
        <p className="mt-2 text-xs text-gray-400 dark:text-gray-500">
          Manual entry mode - sensor not available
        </p>
      )}
    </Card>
  );
}