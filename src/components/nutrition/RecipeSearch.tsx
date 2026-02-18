// src/components/nutrition/RecipeSearch.tsx
'use client';

import { useState, useMemo } from 'react';
import { Search, Filter, Clock, Star, X, ChevronDown } from 'lucide-react';
import Card from '@/components/ui/Card';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import RecipeDetail from '@/components/nutrition/RecipeDetail';
import { recipes, RecipeData } from '@/data/recipes';
import { cn, generateId } from '@/lib/utils';
import { useNutrition } from '@/hooks/useNutrition';
import toast from 'react-hot-toast';

const categories = ['All', 'breakfast', 'lunch', 'dinner', 'snack', 'smoothie', 'meal_prep'];
const difficulties = ['All', 'easy', 'medium', 'hard'];
const dietaryOptions = ['vegetarian', 'vegan', 'gluten-free', 'keto', 'pescatarian'];

export default function RecipeSearch() {
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [selectedDietary, setSelectedDietary] = useState<string[]>([]);
  const [maxPrepTime, setMaxPrepTime] = useState<number | null>(null);
  const [maxCalories, setMaxCalories] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<'rating' | 'time' | 'calories'>('rating');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<RecipeData | null>(null);

  const { logFood } = useNutrition();

  const filteredRecipes = useMemo(() => {
    let result = [...recipes];

    // Search
    if (query) {
      const q = query.toLowerCase();
      result = result.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.description.toLowerCase().includes(q) ||
          r.tags.some((t) => t.includes(q)) ||
          r.cuisine.toLowerCase().includes(q) ||
          r.ingredients.some((ing) => ing.name.toLowerCase().includes(q))
      );
    }

    // Category
    if (selectedCategory !== 'All') {
      result = result.filter((r) => r.category === selectedCategory);
    }

    // Difficulty
    if (selectedDifficulty !== 'All') {
      result = result.filter((r) => r.difficulty === selectedDifficulty);
    }

    // Dietary
    if (selectedDietary.length > 0) {
      result = result.filter((r) =>
        selectedDietary.every((d) => r.dietary.includes(d))
      );
    }

    // Max prep time
    if (maxPrepTime) {
      result = result.filter((r) => r.totalTime <= maxPrepTime);
    }

    // Max calories
    if (maxCalories) {
      result = result.filter((r) => r.nutrition.calories <= maxCalories);
    }

    // Sort
    if (sortBy === 'rating') result.sort((a, b) => b.rating - a.rating);
    else if (sortBy === 'time') result.sort((a, b) => a.totalTime - b.totalTime);
    else if (sortBy === 'calories') result.sort((a, b) => a.nutrition.calories - b.nutrition.calories);

    return result;
  }, [query, selectedCategory, selectedDifficulty, selectedDietary, maxPrepTime, maxCalories, sortBy]);

  const handleLogRecipe = (recipe: RecipeData) => {
    const mealType = recipe.category === 'breakfast' ? 'breakfast' :
                     recipe.category === 'lunch' ? 'lunch' :
                     recipe.category === 'dinner' ? 'dinner' : 'snack';

    logFood(mealType, {
      id: generateId(),
      name: recipe.name,
      calories: recipe.nutrition.calories,
      protein: recipe.nutrition.protein,
      carbs: recipe.nutrition.carbs,
      fat: recipe.nutrition.fat,
      fiber: recipe.nutrition.fiber,
      sugar: 0,
      sodium: 0,
      quantity: 1,
      unit: 'serving',
      servingSize: `1 serving (${recipe.servings} total)`,
    });
    toast.success(`${recipe.name} logged!`);
  };

  const activeFiltersCount =
    (selectedCategory !== 'All' ? 1 : 0) +
    (selectedDifficulty !== 'All' ? 1 : 0) +
    selectedDietary.length +
    (maxPrepTime ? 1 : 0) +
    (maxCalories ? 1 : 0);

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search recipes, ingredients..."
            className={cn(
              'w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm',
              'focus:border-brand-purple focus:outline-none focus:ring-2 focus:ring-brand-purple/20',
              'dark:border-gray-700 dark:bg-brand-surface dark:text-brand-white'
            )}
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >
              <X className="h-4 w-4 text-gray-400" />
            </button>
          )}
        </div>
        <button
          onClick={() => setShowFilters(true)}
          className={cn(
            'relative flex h-10 w-10 items-center justify-center rounded-xl border transition-all',
            activeFiltersCount > 0
              ? 'border-brand-purple bg-brand-purple/5 dark:border-brand-lavender'
              : 'border-gray-200 dark:border-gray-700'
          )}
        >
          <Filter className="h-4 w-4 text-gray-600 dark:text-gray-300" />
          {activeFiltersCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-brand-purple text-[9px] font-bold text-white">
              {activeFiltersCount}
            </span>
          )}
        </button>
      </div>

      {/* Category pills */}
      <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={cn(
              'flex-shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold capitalize transition-all',
              selectedCategory === cat
                ? 'bg-brand-purple text-white dark:bg-brand-lavender dark:text-brand-dark'
                : 'bg-gray-100 text-gray-500 dark:bg-brand-surface dark:text-gray-400'
            )}
          >
            {cat === 'All' ? '🍽️ All' : cat === 'meal_prep' ? '📦 Meal Prep' : cat}
          </button>
        ))}
      </div>

      {/* Sort */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {filteredRecipes.length} recipes
        </span>
        <div className="flex gap-1">
          {[
            { id: 'rating' as const, label: '⭐ Rating' },
            { id: 'time' as const, label: '⏱️ Quick' },
            { id: 'calories' as const, label: '🔥 Low Cal' },
          ].map((s) => (
            <button
              key={s.id}
              onClick={() => setSortBy(s.id)}
              className={cn(
                'rounded-lg px-2 py-1 text-[10px] font-semibold transition-all',
                sortBy === s.id
                  ? 'bg-brand-purple/10 text-brand-purple dark:bg-brand-lavender/10 dark:text-brand-lavender'
                  : 'text-gray-400'
              )}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Recipe Grid */}
      <div className="grid grid-cols-1 gap-3">
        {filteredRecipes.map((recipe) => (
          <RecipeCard
            key={recipe.id}
            recipe={recipe}
            onSelect={() => setSelectedRecipe(recipe)}
          />
        ))}
      </div>

      {filteredRecipes.length === 0 && (
        <div className="py-12 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No recipes found. Try adjusting your filters.
          </p>
        </div>
      )}

      {/* Filter Modal */}
      <Modal
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
        title="Filter Recipes"
      >
        <div className="space-y-5 pb-4">
          {/* Difficulty */}
          <div>
            <h4 className="mb-2 text-sm font-semibold text-brand-dark dark:text-brand-white">
              Difficulty
            </h4>
            <div className="flex gap-2">
              {difficulties.map((d) => (
                <button
                  key={d}
                  onClick={() => setSelectedDifficulty(d)}
                  className={cn(
                    'flex-1 rounded-xl py-2 text-xs font-semibold capitalize transition-all',
                    selectedDifficulty === d
                      ? 'bg-brand-purple text-white dark:bg-brand-lavender dark:text-brand-dark'
                      : 'bg-gray-100 text-gray-500 dark:bg-brand-surface dark:text-gray-400'
                  )}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* Dietary */}
          <div>
            <h4 className="mb-2 text-sm font-semibold text-brand-dark dark:text-brand-white">
              Dietary
            </h4>
            <div className="flex flex-wrap gap-2">
              {dietaryOptions.map((d) => (
                <button
                  key={d}
                  onClick={() => {
                    setSelectedDietary((prev) =>
                      prev.includes(d)
                        ? prev.filter((x) => x !== d)
                        : [...prev, d]
                    );
                  }}
                  className={cn(
                    'rounded-full px-3 py-1.5 text-xs font-semibold capitalize transition-all',
                    selectedDietary.includes(d)
                      ? 'bg-brand-purple text-white dark:bg-brand-lavender dark:text-brand-dark'
                      : 'bg-gray-100 text-gray-500 dark:bg-brand-surface dark:text-gray-400'
                  )}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* Max Prep Time */}
          <div>
            <h4 className="mb-2 text-sm font-semibold text-brand-dark dark:text-brand-white">
              Max Prep Time
            </h4>
            <div className="flex gap-2">
              {[null, 15, 30, 45, 60].map((t) => (
                <button
                  key={String(t)}
                  onClick={() => setMaxPrepTime(t)}
                  className={cn(
                    'flex-1 rounded-xl py-2 text-xs font-semibold transition-all',
                    maxPrepTime === t
                      ? 'bg-brand-purple text-white dark:bg-brand-lavender dark:text-brand-dark'
                      : 'bg-gray-100 text-gray-500 dark:bg-brand-surface dark:text-gray-400'
                  )}
                >
                  {t ? `${t}m` : 'Any'}
                </button>
              ))}
            </div>
          </div>

          {/* Max Calories */}
          <div>
            <h4 className="mb-2 text-sm font-semibold text-brand-dark dark:text-brand-white">
              Max Calories
            </h4>
            <div className="flex gap-2">
              {[null, 300, 400, 500, 600].map((c) => (
                <button
                  key={String(c)}
                  onClick={() => setMaxCalories(c)}
                  className={cn(
                    'flex-1 rounded-xl py-2 text-xs font-semibold transition-all',
                    maxCalories === c
                      ? 'bg-brand-purple text-white dark:bg-brand-lavender dark:text-brand-dark'
                      : 'bg-gray-100 text-gray-500 dark:bg-brand-surface dark:text-gray-400'
                  )}
                >
                  {c ? `<${c}` : 'Any'}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={() => {
                setSelectedCategory('All');
                setSelectedDifficulty('All');
                setSelectedDietary([]);
                setMaxPrepTime(null);
                setMaxCalories(null);
              }}
              variant="outline"
              className="flex-1"
            >
              Clear All
            </Button>
            <Button
              onClick={() => setShowFilters(false)}
              variant="primary"
              className="flex-1"
            >
              Apply
            </Button>
          </div>
        </div>
      </Modal>

      {/* Recipe Detail Modal */}
      <Modal
        isOpen={!!selectedRecipe}
        onClose={() => setSelectedRecipe(null)}
        title={selectedRecipe?.name || ''}
      >
        {selectedRecipe && (
          <RecipeDetail
            recipe={selectedRecipe}
            onLog={() => {
              handleLogRecipe(selectedRecipe);
              setSelectedRecipe(null);
            }}
          />
        )}
      </Modal>
    </div>
  );
}

function RecipeCard({
  recipe,
  onSelect,
}: {
  recipe: RecipeData;
  onSelect: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      className="flex w-full gap-3 rounded-2xl bg-white p-3 text-left shadow-sm transition-all active:scale-[0.98] dark:bg-brand-surface"
    >
      {/* Image placeholder */}
      <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-lavender/20 to-brand-purple/10 text-2xl">
        {recipe.category === 'breakfast' ? '🌅' :
         recipe.category === 'lunch' ? '🥗' :
         recipe.category === 'dinner' ? '🍽️' :
         recipe.category === 'snack' ? '🍿' :
         recipe.category === 'smoothie' ? '🥤' : '📦'}
      </div>

      <div className="flex-1 overflow-hidden">
        <h3 className="truncate text-sm font-bold text-brand-dark dark:text-brand-white">
          {recipe.name}
        </h3>
        <p className="mt-0.5 line-clamp-2 text-xs text-gray-500 dark:text-gray-400">
          {recipe.description}
        </p>
        <div className="mt-2 flex items-center gap-3 text-[10px] text-gray-400">
          <span className="flex items-center gap-0.5">
            <Clock className="h-3 w-3" />
            {recipe.totalTime}m
          </span>
          <span className="flex items-center gap-0.5">
            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
            {recipe.rating}
          </span>
          <span className="font-semibold text-brand-purple dark:text-brand-lavender">
            {recipe.nutrition.calories} cal
          </span>
          <span>{recipe.nutrition.protein}g protein</span>
        </div>
      </div>
    </button>
  );
}