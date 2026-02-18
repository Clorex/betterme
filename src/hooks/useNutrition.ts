// src/hooks/useNutrition.ts
'use client';

import { useEffect, useCallback } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useNutritionStore, FoodItem } from '@/store/nutritionStore';
import { calculateMacros, calculateWaterIntake } from '@/lib/utils';

export function useNutrition() {
  const { user, userProfile } = useAuthStore();
  const store = useNutritionStore();

  // Initialize goals from profile
  useEffect(() => {
    if (!userProfile) return;

    const tdee = userProfile.metrics?.tdee || 2000;
    const goal = userProfile.profile?.goal || 'general_fitness';
    const macros = calculateMacros(tdee, goal);

    store.setCalorieGoal(macros.calories ?? 0);
    store.setMacroGoals({
      protein: macros.protein,
      carbs: macros.carbs,
      fat: macros.fat,
    });
  }, [userProfile]);

  // Fetch today's log
  useEffect(() => {
    if (user) {
      store.fetchDailyLog(user.uid);
    }
  }, [user]);

  const getRemainingCalories = useCallback(() => {
    const totals = store.getTotals();
    return Math.max(store.calorieGoal - totals.calories, 0);
  }, [store]);

  const getRemainingMacros = useCallback(() => {
    const totals = store.getTotals();
    return {
      protein: Math.max(store.macroGoals.protein - totals.protein, 0),
      carbs: Math.max(store.macroGoals.carbs - totals.carbs, 0),
      fat: Math.max(store.macroGoals.fat - totals.fat, 0),
    };
  }, [store]);

  const logFood = useCallback(
    async (mealType: string, food: FoodItem) => {
      store.addFood(mealType, food);
      if (user) {
        await store.saveDailyLog(user.uid);
      }
    },
    [user, store]
  );

  const removeFood = useCallback(
    async (mealType: string, index: number) => {
      store.removeFood(mealType, index);
      if (user) {
        await store.saveDailyLog(user.uid);
      }
    },
    [user, store]
  );

  const logWater = useCallback(
    async (glasses: number) => {
      store.updateWater(glasses);
      if (user) {
        await store.saveDailyLog(user.uid);
      }
    },
    [user, store]
  );

  return {
    dailyLog: store.dailyLog,
    calorieGoal: store.calorieGoal,
    macroGoals: store.macroGoals,
    recentFoods: store.recentFoods,
    favorites: store.favorites,
    loading: store.loading,
    totals: store.getTotals(),
    remainingCalories: getRemainingCalories(),
    remainingMacros: getRemainingMacros(),
    logFood,
    removeFood,
    logWater,
    toggleFavorite: store.toggleFavorite,
  };
}
