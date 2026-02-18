// src/components/nutrition/DailyFoodLog.tsx
'use client';

import { useState } from 'react';
import {
  Sunrise,
  Sun,
  Moon,
  Cookie,
  Plus,
  ChevronDown,
  ChevronUp,
  Trash2,
  Info,
} from 'lucide-react';
import Card from '@/components/ui/Card';
import ProgressRing from '@/components/ui/ProgressRing';
import { useNutrition } from '@/hooks/useNutrition';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import MacroTracker from '@/components/nutrition/MacroTracker';
import { FoodItem } from '@/store/nutritionStore';

const mealConfig = {
  breakfast: { label: 'Breakfast', icon: Sunrise, color: 'text-orange-500', bg: 'bg-orange-100 dark:bg-orange-900/30' },
  lunch: { label: 'Lunch', icon: Sun, color: 'text-yellow-500', bg: 'bg-yellow-100 dark:bg-yellow-900/30' },
  dinner: { label: 'Dinner', icon: Moon, color: 'text-indigo-500', bg: 'bg-indigo-100 dark:bg-indigo-900/30' },
  snack: { label: 'Snacks', icon: Cookie, color: 'text-pink-500', bg: 'bg-pink-100 dark:bg-pink-900/30' },
};

export default function DailyFoodLog() {
  const {
    dailyLog,
    calorieGoal,
    totals,
    remainingCalories,
    removeFood,
  } = useNutrition();

  const percentage = Math.min((totals.calories / calorieGoal) * 100, 100);
  const getCalorieColor = () => {
    if (percentage < 75) return '#22C55E';
    if (percentage < 95) return '#F59E0B';
    return '#EF4444';
  };

  return (
    <div className="space-y-4">
      {/* Calorie Summary */}
      <Card>
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <ProgressRing
              value={totals.calories}
              max={calorieGoal}
              size={120}
              strokeWidth={10}
              color={getCalorieColor()}
            >
              <div className="text-center">
                <div className="text-2xl font-bold text-brand-dark dark:text-brand-white">
                  {totals.calories.toLocaleString()}
                </div>
                <div className="text-[10px] text-gray-500 dark:text-gray-400">
                  of {calorieGoal.toLocaleString()}
                </div>
              </div>
            </ProgressRing>
          </div>

          <div className="flex-1 space-y-3 pl-4">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Consumed</p>
              <p className="text-lg font-bold text-brand-dark dark:text-brand-white">
                {totals.calories.toLocaleString()} cal
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Remaining</p>
              <p className={cn(
                'text-lg font-bold',
                remainingCalories > 0
                  ? 'text-green-500'
                  : 'text-red-500'
              )}>
                {remainingCalories.toLocaleString()} cal
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Macro Tracker */}
      <MacroTracker />

      {/* Meal Sections */}
      {dailyLog.meals.map((meal) => (
        <MealSection
          key={meal.type}
          meal={meal}
          config={mealConfig[meal.type as keyof typeof mealConfig]}
          onRemoveFood={(index) => removeFood(meal.type, index)}
        />
      ))}
    </div>
  );
}

function MealSection({
  meal,
  config,
  onRemoveFood,
}: {
  meal: { type: string; foods: FoodItem[]; totalCalories: number };
  config: { label: string; icon: any; color: string; bg: string };
  onRemoveFood: (index: number) => void;
}) {
  const [expanded, setExpanded] = useState(true);
  const [expandedFood, setExpandedFood] = useState<number | null>(null);
  const Icon = config.icon;

  return (
    <Card padding="sm">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between p-2"
      >
        <div className="flex items-center gap-3">
          <div className={cn('flex h-10 w-10 items-center justify-center rounded-2xl', config.bg)}>
            <Icon className={cn('h-5 w-5', config.color)} />
          </div>
          <div className="text-left">
            <h3 className="text-sm font-bold text-brand-dark dark:text-brand-white">
              {config.label}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {meal.foods.length} items · {meal.totalCalories} cal
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-brand-dark dark:text-brand-white">
            {meal.totalCalories} cal
          </span>
          {expanded ? (
            <ChevronUp className="h-4 w-4 text-gray-400" />
          ) : (
            <ChevronDown className="h-4 w-4 text-gray-400" />
          )}
        </div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            {/* Food Items */}
            {meal.foods.length > 0 ? (
              <div className="mt-1 space-y-1 px-2">
                {meal.foods.map((food, idx) => (
                  <div key={idx}>
                    <button
                      onClick={() => setExpandedFood(expandedFood === idx ? null : idx)}
                      className="flex w-full items-center justify-between rounded-xl px-2 py-2 transition-colors active:bg-gray-50 dark:active:bg-brand-surface"
                    >
                      <div className="flex-1 text-left">
                        <p className="text-sm font-medium text-brand-dark dark:text-brand-white">
                          {food.name}
                        </p>
                        <p className="text-xs text-gray-400">
                          {food.quantity} {food.unit} · {food.servingSize}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600 dark:text-gray-300">
                          {food.calories} cal
                        </span>
                        <Info className="h-3.5 w-3.5 text-gray-300" />
                      </div>
                    </button>

                    {/* Expanded nutrition */}
                    <AnimatePresence>
                      {expandedFood === idx && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="mx-2 mb-2 rounded-xl bg-gray-50 p-3 dark:bg-brand-surface/50">
                            <div className="grid grid-cols-4 gap-2 text-center text-xs">
                              <div>
                                <p className="font-bold text-blue-500">{food.protein}g</p>
                                <p className="text-gray-400">Protein</p>
                              </div>
                              <div>
                                <p className="font-bold text-orange-500">{food.carbs}g</p>
                                <p className="text-gray-400">Carbs</p>
                              </div>
                              <div>
                                <p className="font-bold text-yellow-500">{food.fat}g</p>
                                <p className="text-gray-400">Fat</p>
                              </div>
                              <div>
                                <p className="font-bold text-green-500">{food.fiber}g</p>
                                <p className="text-gray-400">Fiber</p>
                              </div>
                            </div>
                            {food.sugar > 0 && (
                              <p className="mt-2 text-xs text-gray-400">
                                Sugar: {food.sugar}g · Sodium: {food.sodium}mg
                              </p>
                            )}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onRemoveFood(idx);
                              }}
                              className="mt-2 flex items-center gap-1 text-xs text-red-500 active:text-red-700"
                            >
                              <Trash2 className="h-3 w-3" />
                              Remove
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            ) : (
              <p className="px-4 py-3 text-center text-xs text-gray-400">
                No foods logged yet
              </p>
            )}

            {/* Add Food Button */}
            <button
              onClick={() => {
                // Switch to search tab
                const tabBtn = document.querySelector('[data-tab="search"]');
                if (tabBtn) (tabBtn as HTMLElement).click();
              }}
              className="mx-2 mt-2 mb-1 flex w-[calc(100%-16px)] items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-gray-200 py-2.5 text-xs font-medium text-gray-400 transition-colors active:border-brand-purple active:text-brand-purple dark:border-gray-700 dark:active:border-brand-lavender dark:active:text-brand-lavender"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Food
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}