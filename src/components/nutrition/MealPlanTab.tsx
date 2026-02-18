// src/components/nutrition/MealPlanView.tsx
'use client';

import { useState, useEffect } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Check,
  Clock,
  Flame,
  Sparkles,
  Loader2,
  ArrowRight,
} from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { cn, generateId } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';
import { useNutrition } from '@/hooks/useNutrition';
import { generateMealPlan } from '@/lib/gemini';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { format, startOfWeek, addDays } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import RecipeDetail from '@/components/nutrition/RecipeDetail';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

interface MealData {
  name: string;
  description?: string;
  prepTime: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  ingredients: string[];
  instructions: string[];
}

interface DayPlan {
  day: string;
  meals: {
    breakfast: MealData;
    lunch: MealData;
    dinner: MealData;
    snacks: MealData[];
  };
  totalCalories: number;
}

interface WeeklyPlan {
  days: DayPlan[];
  groceryList: { item: string; quantity: string; unit: string; category: string }[];
  weeklyNotes?: string;
}

export default function MealPlanView() {
  const { user, userProfile } = useAuthStore();
  const { logFood, calorieGoal } = useNutrition();
  const [plan, setPlan] = useState<WeeklyPlan | null>(null);
  const [selectedDay, setSelectedDay] = useState(0);
  const [generating, setGenerating] = useState(false);
  const [swappingMeal, setSwappingMeal] = useState<string | null>(null);
  const [selectedRecipe, setSelectedRecipe] = useState<MealData | null>(null);
  const [showRecipeModal, setShowRecipeModal] = useState(false);

  useEffect(() => {
    if (user) loadPlan();
  }, [user]);

  const loadPlan = async () => {
    if (!user) return;
    const weekStart = format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd');
    try {
      const planDoc = await getDoc(doc(db, 'mealPlans', `${user.uid}_${weekStart}`));
      if (planDoc.exists()) {
        setPlan(planDoc.data() as WeeklyPlan);
      }
    } catch (err) {
      console.error('Error loading plan:', err);
    }
  };

  const handleGenerate = async () => {
    if (!user || !userProfile) return;
    setGenerating(true);
    try {
      const result = await generateMealPlan(userProfile);
      setPlan(result);

      const weekStart = format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd');
      await setDoc(doc(db, 'mealPlans', `${user.uid}_${weekStart}`), {
        ...result,
        userId: user.uid,
        weekStartDate: weekStart,
        createdAt: new Date().toISOString(),
      });

      toast.success('Meal plan generated! 🎉');
    } catch (err: any) {
      toast.error(err.message || 'Failed to generate meal plan');
    }
    setGenerating(false);
  };

  const handleSwapMeal = async (mealType: string) => {
    if (!user || !userProfile || !plan) return;
    setSwappingMeal(mealType);

    try {
      const { chatWithCoach } = await import('@/lib/gemini');
      const response = await chatWithCoach(
        `Generate a single alternative ${mealType} meal with about ${Math.round(calorieGoal / 4)} calories that fits my dietary preferences. Return ONLY JSON: {"name":"...","description":"...","prepTime":15,"calories":400,"protein":30,"carbs":45,"fat":12,"ingredients":["..."],"instructions":["..."]}`,
        {
          userProfile,
          todayData: {},
          chatHistory: [],
        }
      );

      // Try to parse meal from response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const newMeal = JSON.parse(jsonMatch[0]);
        const updatedPlan = { ...plan };
        const dayPlan = updatedPlan.days[selectedDay];

        if (mealType === 'breakfast') dayPlan.meals.breakfast = newMeal;
        else if (mealType === 'lunch') dayPlan.meals.lunch = newMeal;
        else if (mealType === 'dinner') dayPlan.meals.dinner = newMeal;

        dayPlan.totalCalories =
          dayPlan.meals.breakfast.calories +
          dayPlan.meals.lunch.calories +
          dayPlan.meals.dinner.calories +
          (dayPlan.meals.snacks || []).reduce((s: number, sn: MealData) => s + sn.calories, 0);

        setPlan(updatedPlan);

        const weekStart = format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd');
        await setDoc(doc(db, 'mealPlans', `${user.uid}_${weekStart}`), updatedPlan, { merge: true });
        toast.success('Meal swapped!');
      }
    } catch (err) {
      toast.error('Failed to swap meal');
    }
    setSwappingMeal(null);
  };

  const handleLogMeal = async (meal: MealData, mealType: string) => {
    await logFood(mealType, {
      id: generateId(),
      name: meal.name,
      calories: meal.calories,
      protein: meal.protein,
      carbs: meal.carbs,
      fat: meal.fat,
      fiber: 0,
      sugar: 0,
      sodium: 0,
      quantity: 1,
      unit: 'serving',
      servingSize: '1 serving',
    });
    toast.success(`${meal.name} logged to ${mealType}!`);
  };

  if (!plan) {
    return (
      <Card>
        <div className="py-8 text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-brand-lavender/20">
            <Sparkles className="h-10 w-10 text-brand-purple dark:text-brand-lavender" />
          </div>
          <h2 className="font-heading text-lg font-bold text-brand-dark dark:text-brand-white">
            AI Meal Plan
          </h2>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Get a personalized 7-day meal plan based on your goals, diet, and preferences
          </p>
          <Button
            onClick={handleGenerate}
            variant="primary"
            loading={generating}
            className="mt-4"
          >
            <Sparkles className="mr-2 h-4 w-4" />
            Generate My Plan
          </Button>
        </div>
      </Card>
    );
  }

  const currentDay = plan.days[selectedDay];
  if (!currentDay) return null;

  return (
    <div className="space-y-4">
      {/* Day Selector */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setSelectedDay(Math.max(0, selectedDay - 1))}
          disabled={selectedDay === 0}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 disabled:opacity-30 dark:bg-brand-surface"
        >
          <ChevronLeft className="h-5 w-5 text-gray-600 dark:text-gray-300" />
        </button>

        <div className="no-scrollbar flex gap-1 overflow-x-auto">
          {DAYS.map((day, idx) => (
            <button
              key={day}
              onClick={() => setSelectedDay(idx)}
              className={cn(
                'flex-shrink-0 rounded-xl px-3 py-2 text-xs font-semibold transition-all',
                selectedDay === idx
                  ? 'bg-brand-purple text-white dark:bg-brand-lavender dark:text-brand-dark'
                  : 'text-gray-400'
              )}
            >
              {day.slice(0, 3)}
            </button>
          ))}
        </div>

        <button
          onClick={() => setSelectedDay(Math.min(6, selectedDay + 1))}
          disabled={selectedDay === 6}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 disabled:opacity-30 dark:bg-brand-surface"
        >
          <ChevronRight className="h-5 w-5 text-gray-600 dark:text-gray-300" />
        </button>
      </div>

      {/* Day Total */}
      <Card padding="sm">
        <div className="flex items-center justify-between px-2 py-1">
          <span className="text-sm font-bold text-brand-dark dark:text-brand-white">
            {currentDay.day} Total
          </span>
          <span
            className={cn(
              'text-sm font-bold',
              Math.abs(currentDay.totalCalories - calorieGoal) < 100
                ? 'text-green-500'
                : 'text-orange-500'
            )}
          >
            {currentDay.totalCalories} / {calorieGoal} cal
          </span>
        </div>
      </Card>

      {/* Meals */}
      {['breakfast', 'lunch', 'dinner'].map((mealType) => {
        const meal = currentDay.meals[mealType as keyof typeof currentDay.meals];
        if (!meal || Array.isArray(meal)) return null;
        const mealData = meal as MealData;

        return (
          <MealPlanCard
            key={mealType}
            mealType={mealType}
            meal={mealData}
            onSwap={() => handleSwapMeal(mealType)}
            onLog={() => handleLogMeal(mealData, mealType)}
            onViewRecipe={() => {
              setSelectedRecipe(mealData);
              setShowRecipeModal(true);
            }}
            isSwapping={swappingMeal === mealType}
          />
        );
      })}

      {/* Snacks */}
      {currentDay.meals.snacks && currentDay.meals.snacks.length > 0 && (
        <Card>
          <h3 className="mb-3 text-sm font-bold text-gray-500 dark:text-gray-400">
            🍿 Snacks
          </h3>
          <div className="space-y-2">
            {currentDay.meals.snacks.map((snack, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between rounded-xl bg-gray-50 px-3 py-2.5 dark:bg-brand-surface/50"
              >
                <div>
                  <p className="text-sm font-medium text-brand-dark dark:text-brand-white">
                    {snack.name}
                  </p>
                  <p className="text-xs text-gray-400">{snack.calories} cal</p>
                </div>
                <button
                  onClick={() => handleLogMeal(snack, 'snack')}
                  className="rounded-lg bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-600 active:scale-95 dark:bg-green-900/30 dark:text-green-400"
                >
                  Log ✓
                </button>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Regenerate */}
      <Button
        onClick={handleGenerate}
        variant="outline"
        fullWidth
        loading={generating}
      >
        <RefreshCw className="mr-2 h-4 w-4" />
        Regenerate Entire Plan
      </Button>

      {/* Recipe Detail Modal */}
      {selectedRecipe && (
        <Modal
          isOpen={showRecipeModal}
          onClose={() => {
            setShowRecipeModal(false);
            setSelectedRecipe(null);
          }}
          title={selectedRecipe.name}
        >
          <RecipeDetail
            recipe={{
              id: generateId(),
              name: selectedRecipe.name,
              description: selectedRecipe.description || '',
              cuisine: '',
              category: '',
              prepTime: selectedRecipe.prepTime,
              cookTime: 0,
              totalTime: selectedRecipe.prepTime,
              servings: 1,
              difficulty: 'easy' as const,
              dietary: [],
              ingredients: selectedRecipe.ingredients.map((ing) => ({
                name: ing,
                quantity: '',
                unit: '',
              })),
              instructions: selectedRecipe.instructions,
              nutrition: {
                calories: selectedRecipe.calories,
                protein: selectedRecipe.protein,
                carbs: selectedRecipe.carbs,
                fat: selectedRecipe.fat,
                fiber: 0,
              },
              image: '',
              tags: [],
              rating: 0,
              reviewCount: 0,
            }}
            onLog={() => {
              handleLogMeal(selectedRecipe, 'lunch');
              setShowRecipeModal(false);
            }}
          />
        </Modal>
      )}
    </div>
  );
}

function MealPlanCard({
  mealType,
  meal,
  onSwap,
  onLog,
  onViewRecipe,
  isSwapping,
}: {
  mealType: string;
  meal: MealData;
  onSwap: () => void;
  onLog: () => void;
  onViewRecipe: () => void;
  isSwapping: boolean;
}) {
  const mealIcons: Record<string, string> = {
    breakfast: '🌅',
    lunch: '☀️',
    dinner: '🌙',
  };

  return (
    <Card>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <span className="text-xs font-semibold uppercase text-gray-400">
            {mealIcons[mealType]} {mealType}
          </span>
          <h3 className="mt-1 font-heading text-base font-bold text-brand-dark dark:text-brand-white">
            {meal.name}
          </h3>
          {meal.description && (
            <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
              {meal.description}
            </p>
          )}
        </div>
      </div>

      {/* Nutrition */}
      <div className="mt-3 grid grid-cols-4 gap-2">
        <div className="rounded-lg bg-gray-50 p-2 text-center dark:bg-brand-surface/50">
          <p className="text-sm font-bold text-brand-purple dark:text-brand-lavender">
            {meal.calories}
          </p>
          <p className="text-[9px] text-gray-400">cal</p>
        </div>
        <div className="rounded-lg bg-gray-50 p-2 text-center dark:bg-brand-surface/50">
          <p className="text-sm font-bold text-blue-500">{meal.protein}g</p>
          <p className="text-[9px] text-gray-400">protein</p>
        </div>
        <div className="rounded-lg bg-gray-50 p-2 text-center dark:bg-brand-surface/50">
          <p className="text-sm font-bold text-orange-500">{meal.carbs}g</p>
          <p className="text-[9px] text-gray-400">carbs</p>
        </div>
        <div className="rounded-lg bg-gray-50 p-2 text-center dark:bg-brand-surface/50">
          <p className="text-sm font-bold text-yellow-500">{meal.fat}g</p>
          <p className="text-[9px] text-gray-400">fat</p>
        </div>
      </div>

      {/* Meta */}
      <div className="mt-3 flex items-center gap-3 text-xs text-gray-400">
        <span className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {meal.prepTime} min prep
        </span>
      </div>

      {/* Actions */}
      <div className="mt-3 flex gap-2">
        <button
          onClick={onViewRecipe}
          className="flex-1 rounded-xl bg-gray-100 py-2 text-xs font-semibold text-gray-600 transition-all active:scale-95 dark:bg-brand-surface dark:text-gray-300"
        >
          View Recipe
        </button>
        <button
          onClick={onSwap}
          disabled={isSwapping}
          className="flex items-center justify-center gap-1 rounded-xl bg-brand-lavender/20 px-3 py-2 text-xs font-semibold text-brand-purple transition-all active:scale-95 dark:bg-brand-lavender/10 dark:text-brand-lavender"
        >
          {isSwapping ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <RefreshCw className="h-3.5 w-3.5" />
          )}
          Swap
        </button>
        <button
          onClick={onLog}
          className="flex items-center justify-center gap-1 rounded-xl bg-green-100 px-3 py-2 text-xs font-semibold text-green-600 transition-all active:scale-95 dark:bg-green-900/30 dark:text-green-400"
        >
          <Check className="h-3.5 w-3.5" />
          Log
        </button>
      </div>
    </Card>
  );
}