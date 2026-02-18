// src/components/nutrition/RecipeDetail.tsx
'use client';

import { useState } from 'react';
import {
  Clock,
  Users,
  Flame,
  ChefHat,
  Check,
  ShoppingCart,
  Heart,
  Share2,
  Minus,
  Plus,
  Sparkles,
} from 'lucide-react';
import Button from '@/components/ui/Button';
import { RecipeData } from '@/data/recipes';
import { cn } from '@/lib/utils';

interface RecipeDetailProps {
  recipe: RecipeData;
  onLog?: () => void;
  onAddToGrocery?: () => void;
}

export default function RecipeDetail({
  recipe,
  onLog,
  onAddToGrocery,
}: RecipeDetailProps) {
  const [servings, setServings] = useState(recipe.servings);
  const [checkedIngredients, setCheckedIngredients] = useState<Set<number>>(new Set());
  const [checkedSteps, setCheckedSteps] = useState<Set<number>>(new Set());
  const [isFavorite, setIsFavorite] = useState(false);

  const multiplier = servings / recipe.servings;

  const scaledNutrition = {
    calories: Math.round(recipe.nutrition.calories * multiplier),
    protein: Math.round(recipe.nutrition.protein * multiplier),
    carbs: Math.round(recipe.nutrition.carbs * multiplier),
    fat: Math.round(recipe.nutrition.fat * multiplier),
    fiber: Math.round(recipe.nutrition.fiber * multiplier),
  };

  const toggleIngredient = (idx: number) => {
    const next = new Set(checkedIngredients);
    if (next.has(idx)) next.delete(idx);
    else next.add(idx);
    setCheckedIngredients(next);
  };

  const toggleStep = (idx: number) => {
    const next = new Set(checkedSteps);
    if (next.has(idx)) next.delete(idx);
    else next.add(idx);
    setCheckedSteps(next);
  };

  const getDifficultyColor = (d: string) => {
    if (d === 'easy') return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
    if (d === 'medium') return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
    return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
  };

  return (
    <div className="space-y-4 pb-4">
      {/* Header */}
      <div>
        {recipe.cuisine && (
          <span className="text-xs font-semibold text-brand-purple dark:text-brand-lavender">
            {recipe.cuisine}
          </span>
        )}

        <div className="mt-2 flex flex-wrap gap-2">
          <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-bold', getDifficultyColor(recipe.difficulty))}>
            {recipe.difficulty}
          </span>
          {recipe.dietary.map((d) => (
            <span
              key={d}
              className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium capitalize text-gray-600 dark:bg-brand-surface dark:text-gray-300"
            >
              {d}
            </span>
          ))}
        </div>
      </div>

      {/* Meta row */}
      <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
        <span className="flex items-center gap-1">
          <Clock className="h-3.5 w-3.5" />
          {recipe.prepTime > 0 ? `${recipe.prepTime}m prep` : ''}
          {recipe.cookTime > 0 ? ` · ${recipe.cookTime}m cook` : ''}
        </span>
        <span className="flex items-center gap-1">
          <Users className="h-3.5 w-3.5" />
          {servings} servings
        </span>
      </div>

      {/* Nutrition per serving */}
      <div className="grid grid-cols-5 gap-1.5">
        {[
          { label: 'Cal', value: scaledNutrition.calories, unit: '', color: 'text-brand-purple dark:text-brand-lavender' },
          { label: 'Protein', value: scaledNutrition.protein, unit: 'g', color: 'text-blue-500' },
          { label: 'Carbs', value: scaledNutrition.carbs, unit: 'g', color: 'text-orange-500' },
          { label: 'Fat', value: scaledNutrition.fat, unit: 'g', color: 'text-yellow-500' },
          { label: 'Fiber', value: scaledNutrition.fiber, unit: 'g', color: 'text-green-500' },
        ].map((n) => (
          <div key={n.label} className="rounded-xl bg-gray-50 p-2 text-center dark:bg-brand-surface/50">
            <p className={cn('text-sm font-bold', n.color)}>
              {n.value}{n.unit}
            </p>
            <p className="text-[9px] text-gray-400">{n.label}</p>
          </div>
        ))}
      </div>

      {/* Servings adjuster */}
      <div className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3 dark:bg-brand-surface/50">
        <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
          Servings
        </span>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setServings(Math.max(1, servings - 1))}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-sm dark:bg-brand-surface"
          >
            <Minus className="h-4 w-4" />
          </button>
          <span className="min-w-[24px] text-center text-lg font-bold text-brand-dark dark:text-brand-white">
            {servings}
          </span>
          <button
            onClick={() => setServings(servings + 1)}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-sm dark:bg-brand-surface"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Ingredients */}
      <div>
        <h3 className="mb-2 text-sm font-bold text-brand-dark dark:text-brand-white">
          Ingredients
        </h3>
        <div className="space-y-1">
          {recipe.ingredients.map((ing, idx) => {
            const isChecked = checkedIngredients.has(idx);
            return (
              <button
                key={idx}
                onClick={() => toggleIngredient(idx)}
                className={cn(
                  'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all active:scale-[0.98]',
                  isChecked ? 'bg-green-50 dark:bg-green-900/10' : 'bg-gray-50 dark:bg-brand-surface/30'
                )}
              >
                <div
                  className={cn(
                    'flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border-2 transition-all',
                    isChecked
                      ? 'border-green-500 bg-green-500'
                      : 'border-gray-300 dark:border-gray-600'
                  )}
                >
                  {isChecked && <Check className="h-3 w-3 text-white" />}
                </div>
                <span
                  className={cn(
                    'text-sm',
                    isChecked
                      ? 'text-gray-400 line-through'
                      : 'text-gray-700 dark:text-gray-300'
                  )}
                >
                  {ing.quantity && <strong>{scaleQuantity(ing.quantity, multiplier)} {ing.unit} </strong>}
                  {ing.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Instructions */}
      <div>
        <h3 className="mb-2 text-sm font-bold text-brand-dark dark:text-brand-white">
          Instructions
        </h3>
        <div className="space-y-2">
          {recipe.instructions.map((step, idx) => {
            const isChecked = checkedSteps.has(idx);
            return (
              <button
                key={idx}
                onClick={() => toggleStep(idx)}
                className={cn(
                  'flex w-full gap-3 rounded-xl px-3 py-3 text-left transition-all',
                  isChecked ? 'bg-green-50 dark:bg-green-900/10' : 'bg-gray-50 dark:bg-brand-surface/30'
                )}
              >
                <span
                  className={cn(
                    'flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold',
                    isChecked
                      ? 'bg-green-500 text-white'
                      : 'bg-brand-purple/10 text-brand-purple dark:bg-brand-lavender/10 dark:text-brand-lavender'
                  )}
                >
                  {isChecked ? <Check className="h-3.5 w-3.5" /> : idx + 1}
                </span>
                <span
                  className={cn(
                    'text-sm leading-relaxed',
                    isChecked
                      ? 'text-gray-400 line-through'
                      : 'text-gray-700 dark:text-gray-300'
                  )}
                >
                  {step}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-2">
        {onLog && (
          <Button onClick={onLog} variant="primary" fullWidth>
            <Flame className="mr-2 h-4 w-4" />
            Log This Meal
          </Button>
        )}
        {onAddToGrocery && (
          <Button onClick={onAddToGrocery} variant="outline" fullWidth>
            <ShoppingCart className="mr-2 h-4 w-4" />
            Add to Grocery List
          </Button>
        )}
        <div className="flex gap-2">
          <Button
            onClick={() => setIsFavorite(!isFavorite)}
            variant="ghost"
            className="flex-1"
          >
            <Heart
              className={cn('mr-1.5 h-4 w-4', isFavorite && 'fill-red-500 text-red-500')}
            />
            {isFavorite ? 'Saved' : 'Save'}
          </Button>
          <Button
            onClick={() => {
              if (navigator.share) {
                navigator.share({ text: `Check out this recipe: ${recipe.name}` });
              }
            }}
            variant="ghost"
            className="flex-1"
          >
            <Share2 className="mr-1.5 h-4 w-4" />
            Share
          </Button>
        </div>
      </div>
    </div>
  );
}

function scaleQuantity(quantity: string, multiplier: number): string {
  const num = parseFloat(quantity);
  if (isNaN(num)) return quantity;
  const scaled = num * multiplier;
  if (scaled === Math.floor(scaled)) return String(scaled);
  return scaled.toFixed(1);
}