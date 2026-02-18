// src/components/nutrition/MacroTracker.tsx
'use client';

import Card from '@/components/ui/Card';
import { useNutrition } from '@/hooks/useNutrition';
import { cn } from '@/lib/utils';

export default function MacroTracker() {
  const { totals, macroGoals, remainingMacros } = useNutrition();

  const macros = [
    {
      label: 'Protein',
      current: totals.protein,
      goal: macroGoals.protein,
      remaining: remainingMacros.protein,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-100 dark:bg-blue-900/30',
      emoji: '🥩',
    },
    {
      label: 'Carbs',
      current: totals.carbs,
      goal: macroGoals.carbs,
      remaining: remainingMacros.carbs,
      color: 'bg-orange-500',
      bgColor: 'bg-orange-100 dark:bg-orange-900/30',
      emoji: '🍞',
    },
    {
      label: 'Fat',
      current: totals.fat,
      goal: macroGoals.fat,
      remaining: remainingMacros.fat,
      color: 'bg-yellow-500',
      bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
      emoji: '🧈',
    },
  ];

  // AI suggestion
  const getInsight = () => {
    if (remainingMacros.protein > macroGoals.protein * 0.5 && totals.calories > 0) {
      return "You're low on protein. Try adding chicken, eggs, or a protein shake to your next meal.";
    }
    if (totals.fat > macroGoals.fat) {
      return 'You\'ve exceeded your fat goal. Consider leaner protein sources for your remaining meals.';
    }
    if (totals.carbs > macroGoals.carbs * 0.9 && remainingMacros.protein > 30) {
      return "Carbs are almost maxed but protein is low. Focus on lean protein for remaining meals.";
    }
    return null;
  };

  const insight = getInsight();

  return (
    <Card>
      <h3 className="mb-3 text-sm font-bold text-gray-500 dark:text-gray-400">
        Macros
      </h3>

      <div className="space-y-3">
        {macros.map((macro) => {
          const pct = Math.min((macro.current / macro.goal) * 100, 100);
          return (
            <div key={macro.label}>
              <div className="mb-1 flex items-center justify-between">
                <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
                  {macro.emoji} {macro.label}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {macro.current}g / {macro.goal}g
                  <span className="ml-1 text-gray-400">
                    ({macro.remaining}g left)
                  </span>
                </span>
              </div>
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                <div
                  className={cn(
                    'h-full rounded-full transition-all duration-500',
                    pct > 100 ? 'bg-red-500' : macro.color
                  )}
                  style={{ width: `${Math.min(pct, 100)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {insight && (
        <div className="mt-3 rounded-xl bg-brand-lavender/10 px-3 py-2.5 dark:bg-brand-lavender/5">
          <p className="text-xs leading-relaxed text-brand-purple dark:text-brand-lavender">
            💡 {insight}
          </p>
        </div>
      )}
    </Card>
  );
}