export type FoodItem = {
  id: string;
  name: string;
  brand?: string;
  serving?: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  category?: string;
};

export const foods: FoodItem[] = [
  { id: 'chicken_breast', name: 'Chicken Breast (cooked)', serving: '100g', calories: 165, protein: 31, carbs: 0, fat: 3.6, category: 'protein' },
  { id: 'egg', name: 'Egg', serving: '1 large', calories: 72, protein: 6.3, carbs: 0.4, fat: 4.8, category: 'protein' },
  { id: 'rice_white', name: 'White Rice (cooked)', serving: '1 cup', calories: 205, protein: 4.3, carbs: 44.5, fat: 0.4, category: 'carb' },
  { id: 'oats', name: 'Oats', serving: '40g', calories: 150, protein: 5, carbs: 27, fat: 3, category: 'carb' },
  { id: 'banana', name: 'Banana', serving: '1 medium', calories: 105, protein: 1.3, carbs: 27, fat: 0.3, category: 'fruit' },
  { id: 'apple', name: 'Apple', serving: '1 medium', calories: 95, protein: 0.5, carbs: 25, fat: 0.3, category: 'fruit' },
  { id: 'milk_2', name: 'Milk (2%)', serving: '1 cup', calories: 122, protein: 8, carbs: 12, fat: 5, category: 'dairy' },
  { id: 'greek_yogurt', name: 'Greek Yogurt (plain)', serving: '170g', calories: 100, protein: 17, carbs: 6, fat: 0, category: 'dairy' },
  { id: 'olive_oil', name: 'Olive Oil', serving: '1 tbsp', calories: 119, protein: 0, carbs: 0, fat: 13.5, category: 'fat' },
  { id: 'peanut_butter', name: 'Peanut Butter', serving: '1 tbsp', calories: 95, protein: 4, carbs: 3, fat: 8, category: 'fat' },
];

export const FOODS = foods;
export const foodDatabase = foods;

/**
 * Simple local search helper.
 * (If you later integrate Nutritionix, you can keep this as a fallback.)
 */
export function searchFoods(query: string, limit: number = 20): FoodItem[] {
  const q = (query || '').trim().toLowerCase();
  if (!q) return foods.slice(0, limit);
  return foods
    .filter((f) => f.name.toLowerCase().includes(q) || (f.brand || '').toLowerCase().includes(q))
    .slice(0, limit);
}
