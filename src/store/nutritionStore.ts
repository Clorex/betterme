// src/store/nutritionStore.ts
import { create } from 'zustand';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { format } from 'date-fns';

export interface FoodItem {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar: number;
  sodium: number;
  quantity: number;
  unit: string;
  servingSize: string;
  photos?: string[];
  note?: string;
  aiAnalysis?: boolean;
  confidence?: number;
}

export interface Meal {
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  foods: FoodItem[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
}

export interface DailyLog {
  meals: Meal[];
  waterIntake: { glasses: number; goal: number };
  date: string;
  createdAt?: string;
}

interface NutritionState {
  dailyLog: DailyLog;
  calorieGoal: number;
  macroGoals: { protein: number; carbs: number; fat: number };
  recentFoods: FoodItem[];
  favorites: FoodItem[];
  loading: boolean;

  setDailyLog: (log: DailyLog) => void;
  setCalorieGoal: (goal: number) => void;
  setMacroGoals: (goals: { protein: number; carbs: number; fat: number }) => void;
  addFood: (mealType: string, food: FoodItem) => void;
  removeFood: (mealType: string, foodIndex: number) => void;
  updateWater: (glasses: number) => void;
  addToRecent: (food: FoodItem) => void;
  toggleFavorite: (food: FoodItem) => void;
  fetchDailyLog: (userId: string, date?: string) => Promise<void>;
  saveDailyLog: (userId: string) => Promise<void>;
  getTotals: () => {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
  };
}

const emptyLog: DailyLog = {
  meals: [
    { type: 'breakfast', foods: [], totalCalories: 0, totalProtein: 0, totalCarbs: 0, totalFat: 0 },
    { type: 'lunch', foods: [], totalCalories: 0, totalProtein: 0, totalCarbs: 0, totalFat: 0 },
    { type: 'dinner', foods: [], totalCalories: 0, totalProtein: 0, totalCarbs: 0, totalFat: 0 },
    { type: 'snack', foods: [], totalCalories: 0, totalProtein: 0, totalCarbs: 0, totalFat: 0 },
  ],
  waterIntake: { glasses: 0, goal: 8 },
  date: format(new Date(), 'yyyy-MM-dd'),
};

export const useNutritionStore = create<NutritionState>((set, get) => ({
  dailyLog: { ...emptyLog },
  calorieGoal: 2000,
  macroGoals: { protein: 150, carbs: 200, fat: 67 },
  recentFoods: [],
  favorites: [],
  loading: false,

  setDailyLog: (log) => set({ dailyLog: log }),
  setCalorieGoal: (goal) => set({ calorieGoal: goal }),
  setMacroGoals: (goals) => set({ macroGoals: goals }),

  addFood: (mealType, food) => {
    const { dailyLog, recentFoods } = get();
    const updated = {
      ...dailyLog,
      meals: dailyLog.meals.map((meal) => {
        if (meal.type === mealType) {
          const updatedFoods = [...meal.foods, food];
          return {
            ...meal,
            foods: updatedFoods,
            totalCalories: updatedFoods.reduce((s, f) => s + f.calories, 0),
            totalProtein: updatedFoods.reduce((s, f) => s + f.protein, 0),
            totalCarbs: updatedFoods.reduce((s, f) => s + f.carbs, 0),
            totalFat: updatedFoods.reduce((s, f) => s + f.fat, 0),
          };
        }
        return meal;
      }),
    };
    // Add to recent (keep last 20, no duplicates by name)
    const filteredRecent = recentFoods.filter((f) => f.name !== food.name);
    const newRecent = [food, ...filteredRecent].slice(0, 20);

    set({ dailyLog: updated, recentFoods: newRecent });
  },

  removeFood: (mealType, foodIndex) => {
    const { dailyLog } = get();
    const updated = {
      ...dailyLog,
      meals: dailyLog.meals.map((meal) => {
        if (meal.type === mealType) {
          const updatedFoods = meal.foods.filter((_, i) => i !== foodIndex);
          return {
            ...meal,
            foods: updatedFoods,
            totalCalories: updatedFoods.reduce((s, f) => s + f.calories, 0),
            totalProtein: updatedFoods.reduce((s, f) => s + f.protein, 0),
            totalCarbs: updatedFoods.reduce((s, f) => s + f.carbs, 0),
            totalFat: updatedFoods.reduce((s, f) => s + f.fat, 0),
          };
        }
        return meal;
      }),
    };
    set({ dailyLog: updated });
  },

  updateWater: (glasses) => {
    const { dailyLog } = get();
    set({
      dailyLog: {
        ...dailyLog,
        waterIntake: { ...dailyLog.waterIntake, glasses },
      },
    });
  },

  addToRecent: (food) => {
    const { recentFoods } = get();
    const filtered = recentFoods.filter((f) => f.name !== food.name);
    set({ recentFoods: [food, ...filtered].slice(0, 20) });
  },

  toggleFavorite: (food) => {
    const { favorites } = get();
    const exists = favorites.some((f) => f.id === food.id);
    if (exists) {
      set({ favorites: favorites.filter((f) => f.id !== food.id) });
    } else {
      set({ favorites: [...favorites, food] });
    }
  },

  fetchDailyLog: async (userId, date) => {
    const targetDate = date || format(new Date(), 'yyyy-MM-dd');
    set({ loading: true });
    try {
      const logDoc = await getDoc(doc(db, 'users', userId, 'foodLogs', targetDate));
      if (logDoc.exists()) {
        const data = logDoc.data() as DailyLog;
        set({
          dailyLog: {
            meals: data.meals || emptyLog.meals,
            waterIntake: data.waterIntake || emptyLog.waterIntake,
            date: targetDate,
          },
          loading: false,
        });
      } else {
        set({ dailyLog: { ...emptyLog, date: targetDate }, loading: false });
      }
    } catch (err) {
      console.error('Error fetching daily log:', err);
      set({ loading: false });
    }
  },

  saveDailyLog: async (userId) => {
    const { dailyLog } = get();
    try {
      await setDoc(
        doc(db, 'users', userId, 'foodLogs', dailyLog.date),
        {
          ...dailyLog,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
    } catch (err) {
      console.error('Error saving daily log:', err);
    }
  },

  getTotals: () => {
    const { dailyLog } = get();
    let calories = 0, protein = 0, carbs = 0, fat = 0, fiber = 0;
    dailyLog.meals.forEach((meal) => {
      meal.foods.forEach((food) => {
        calories += food.calories;
        protein += food.protein;
        carbs += food.carbs;
        fat += food.fat;
        fiber += food.fiber || 0;
      });
    });
    return { calories, protein, carbs, fat, fiber };
  },
}));