export type FoodItem = {
  id: string;
  name: string;
  brand?: string;
  serving?: string;
  servingSize?: string;

  calories: number;
  protein: number;
  carbs: number;
  fat: number;

  fiber?: number;
  sugar?: number;
  sodium?: number;

  category?: string;
};

// Backwards-compatible alias
export type FoodData = FoodItem;

export const foods: FoodItem[] = [
  {
    id: 'chicken_breast',
    name: 'Chicken Breast (cooked)',
    servingSize: '100g',
    calories: 165,
    protein: 31,
    carbs: 0,
    fat: 3.6,
    fiber: 0,
    sugar: 0,
    sodium: 74,
    category: 'protein'
  },
  {
    id: 'egg',
    name: 'Egg',
    servingSize: '1 large',
    calories: 72,
    protein: 6.3,
    carbs: 0.4,
    fat: 4.8,
    fiber: 0,
    sugar: 0.2,
    sodium: 71,
    category: 'protein'
  }
];

export const FOODS = foods;
export const foodDatabase = foods;

export function searchFoods(query: string, limit: number = 20): FoodItem[] {
  const q = (query || '').trim().toLowerCase();
  if (!q) return foods.slice(0, limit);
  return foods
    .filter((f) =>
      f.name.toLowerCase().includes(q) ||
      (f.category ?? '').toLowerCase().includes(q)
    )
    .slice(0, limit);
}
