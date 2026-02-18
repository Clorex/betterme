// src/components/nutrition/FoodSearch.tsx
'use client';

import { useState, useMemo, useCallback } from 'react';
import {
  Search as SearchIcon,
  Star,
  StarOff,
  Plus,
  Clock,
  Heart,
  X,
} from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import { cn, generateId } from '@/lib/utils';
import { foods as foodDatabase, FoodData } from '@/data/foods';
import { useNutrition } from '@/hooks/useNutrition';
import { FoodItem } from '@/store/nutritionStore';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

export default function FoodSearch() {
  const [query, setQuery] = useState('');
  const [activeSection, setActiveSection] = useState<'search' | 'recent' | 'favorites'>('search');
  const [selectedFood, setSelectedFood] = useState<FoodData | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedMeal, setSelectedMeal] = useState<string>('lunch');
  const [showAddModal, setShowAddModal] = useState(false);

  const { logFood, recentFoods, favorites, toggleFavorite } = useNutrition();

  // Debounced search
  const searchResults = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return foodDatabase
      .filter(
        (food) =>
          food.name.toLowerCase().includes(q) ||
          (food.category ?? '').toLowerCase().includes(q)
      )
      .slice(0, 30);
  }, [query]);

  const handleSelectFood = (food: FoodData) => {
    setSelectedFood(food);
    setQuantity(1);
    setShowAddModal(true);
  };

  const handleAddFood = async () => {
    if (!selectedFood) return;

    const foodItem: FoodItem = {
      id: generateId(),
      name: selectedFood.name,
      calories: Math.round(selectedFood.calories * quantity),
      protein: Math.round(selectedFood.protein * quantity),
      carbs: Math.round(selectedFood.carbs * quantity),
      fat: Math.round(selectedFood.fat * quantity),
      fiber: Math.round((selectedFood.fiber ?? 0) * quantity),
      sugar: Math.round((selectedFood.sugar ?? 0) * quantity),
      sodium: Math.round((selectedFood.sodium ?? 0) * quantity),
      quantity,
      unit: 'serving',
      servingSize: `${quantity} × ${selectedFood.servingSize}`,
    };

    await logFood(selectedMeal, foodItem);
    toast.success(`${selectedFood.name} added to ${selectedMeal}!`);
    setShowAddModal(false);
    setSelectedFood(null);
    setQuery('');
  };

  const isFavorite = useCallback(
    (id: string) => favorites.some((f) => f.id === id),
    [favorites]
  );

  // Categories for browsing
  const categories = useMemo<string[]>(() => {
    const cats = new Set<string>(
      foodDatabase
        .map((f) => f.category)
        .filter((c): c is string => typeof c === 'string')
    );
    return Array.from(cats);
  }, []);

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categoryFoods = useMemo(() => {
    if (!selectedCategory) return [];
    return foodDatabase.filter((f) => f.category === selectedCategory);
  }, [selectedCategory]);

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <SearchIcon className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setSelectedCategory(null);
          }}
          placeholder="Search foods..."
          className={cn(
            'w-full rounded-2xl border border-gray-200 bg-white py-3.5 pl-12 pr-10 text-sm',
            'placeholder:text-gray-400 focus:border-brand-purple focus:outline-none focus:ring-2 focus:ring-brand-purple/20',
            'dark:border-gray-700 dark:bg-brand-surface dark:text-brand-white',
            'dark:focus:border-brand-lavender dark:focus:ring-brand-lavender/20'
          )}
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Section Tabs */}
      <div className="flex gap-2">
        {[
          { id: 'search', label: 'Browse', icon: SearchIcon },
          { id: 'recent', label: 'Recent', icon: Clock },
          { id: 'favorites', label: 'Favorites', icon: Heart },
        ].map((section) => {
          const Icon = section.icon;
          const isActive = activeSection === section.id;
          return (
            <button
              key={section.id}
              onClick={() => {
                setActiveSection(section.id as 'search' | 'recent' | 'favorites');
                setQuery('');
                setSelectedCategory(null);
              }}
              className={cn(
                'flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition-all',
                isActive
                  ? 'bg-brand-purple text-white dark:bg-brand-lavender dark:text-brand-dark'
                  : 'bg-gray-100 text-gray-500 dark:bg-brand-surface dark:text-gray-400'
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {section.label}
            </button>
          );
        })}
      </div>

      {/* Search Results */}
      {query && searchResults.length > 0 && (
        <Card padding="sm">
          <h3 className="mb-2 px-2 text-xs font-bold text-gray-500 dark:text-gray-400">
            Results ({searchResults.length})
          </h3>
          <div className="max-h-[400px] space-y-0.5 overflow-y-auto">
            {searchResults.map((food) => (
              <FoodListItem
                key={food.id}
                food={food}
                onSelect={() => handleSelectFood(food)}
                isFavorite={isFavorite(food.id)}
                onToggleFavorite={() =>
                  toggleFavorite({
                    id: food.id,
                    name: food.name,
                    calories: food.calories,
                    protein: food.protein,
                    carbs: food.carbs,
                    fat: food.fat,
                    fiber: food.fiber ?? 0,
                    sugar: food.sugar ?? 0,
                    sodium: food.sodium ?? 0,
                    quantity: 1,
                    unit: 'serving',
                    servingSize: food.servingSize ?? '',
                  })
                }
              />
            ))}
          </div>
        </Card>
      )}

      {query && searchResults.length === 0 && (
        <Card>
          <div className="py-6 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              No foods found for &ldquo;{query}&rdquo;
            </p>
            <p className="mt-1 text-xs text-gray-400">Try a different search term</p>
          </div>
        </Card>
      )}

      {/* Browse Categories */}
      {!query && activeSection === 'search' && !selectedCategory && (
        <div className="grid grid-cols-2 gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className="rounded-2xl bg-white p-4 text-left shadow-sm transition-all active:scale-[0.98] dark:bg-brand-surface"
            >
              <span className="text-lg">{getCategoryEmoji(cat)}</span>
              <p className="mt-1 text-sm font-semibold capitalize text-brand-dark dark:text-brand-white">
                {cat}
              </p>
              <p className="text-xs text-gray-400">
                {foodDatabase.filter((f) => f.category === cat).length} items
              </p>
            </button>
          ))}
        </div>
      )}

      {/* Category Foods */}
      {selectedCategory && !query && (
        <Card padding="sm">
          <div className="mb-2 flex items-center justify-between px-2">
            <h3 className="text-sm font-bold capitalize text-brand-dark dark:text-brand-white">
              {getCategoryEmoji(selectedCategory)} {selectedCategory}
            </h3>
            <button
              onClick={() => setSelectedCategory(null)}
              className="text-xs text-brand-purple dark:text-brand-lavender"
            >
              Back
            </button>
          </div>
          <div className="max-h-[400px] space-y-0.5 overflow-y-auto">
            {categoryFoods.map((food) => (
              <FoodListItem
                key={food.id}
                food={food}
                onSelect={() => handleSelectFood(food)}
                isFavorite={isFavorite(food.id)}
                onToggleFavorite={() =>
                  toggleFavorite({
                    id: food.id,
                    name: food.name,
                    calories: food.calories,
                    protein: food.protein,
                    carbs: food.carbs,
                    fat: food.fat,
                    fiber: food.fiber ?? 0,
                    sugar: food.sugar ?? 0,
                    sodium: food.sodium ?? 0,
                    quantity: 1,
                    unit: 'serving',
                    servingSize: food.servingSize ?? '',
                  })
                }
              />
            ))}
          </div>
        </Card>
      )}

      {/* Recent Foods */}
      {activeSection === 'recent' && (
        <Card padding="sm">
          <h3 className="mb-2 px-2 text-xs font-bold text-gray-500 dark:text-gray-400">
            Recently Logged
          </h3>
          {recentFoods.length > 0 ? (
            <div className="space-y-0.5">
              {recentFoods.map((food, i) => (
                <button
                  key={i}
                  onClick={() =>
                    handleSelectFood({
                      id: food.id,
                      name: food.name,
                      category: '',
                      servingSize: food.servingSize ?? '',
                      calories: food.calories,
                      protein: food.protein,
                      carbs: food.carbs,
                      fat: food.fat,
                      fiber: food.fiber ?? 0,
                      sugar: food.sugar ?? 0,
                      sodium: food.sodium ?? 0,
                    })
                  }
                  className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left transition-colors active:bg-gray-50 dark:active:bg-brand-surface"
                >
                  <div>
                    <p className="text-sm font-medium text-brand-dark dark:text-brand-white">
                      {food.name}
                    </p>
                    <p className="text-xs text-gray-400">{food.servingSize}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">{food.calories} cal</span>
                    <Plus className="h-4 w-4 text-brand-purple dark:text-brand-lavender" />
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <p className="py-6 text-center text-sm text-gray-400">
              No recent foods yet. Start logging!
            </p>
          )}
        </Card>
      )}

      {/* Favorites */}
      {activeSection === 'favorites' && (
        <Card padding="sm">
          <h3 className="mb-2 px-2 text-xs font-bold text-gray-500 dark:text-gray-400">
            Your Favorites
          </h3>
          {favorites.length > 0 ? (
            <div className="space-y-0.5">
              {favorites.map((food) => (
                <button
                  key={food.id}
                  onClick={() =>
                    handleSelectFood({
                      id: food.id,
                      name: food.name,
                      category: '',
                      servingSize: food.servingSize ?? '',
                      calories: food.calories,
                      protein: food.protein,
                      carbs: food.carbs,
                      fat: food.fat,
                      fiber: food.fiber ?? 0,
                      sugar: food.sugar ?? 0,
                      sodium: food.sodium ?? 0,
                    })
                  }
                  className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left transition-colors active:bg-gray-50 dark:active:bg-brand-surface"
                >
                  <div>
                    <p className="text-sm font-medium text-brand-dark dark:text-brand-white">
                      {food.name}
                    </p>
                    <p className="text-xs text-gray-400">{food.servingSize}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">{food.calories} cal</span>
                    <Heart className="h-4 w-4 fill-red-500 text-red-500" />
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <p className="py-6 text-center text-sm text-gray-400">
              No favorites yet. Tap ⭐ on any food to save it.
            </p>
          )}
        </Card>
      )}

      {/* Add Food Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add Food"
      >
        {selectedFood && (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-bold text-brand-dark dark:text-brand-white">
                {selectedFood.name}
              </h3>
              <p className="text-sm text-gray-500">{selectedFood.servingSize} per serving</p>
            </div>

            {/* Quantity */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Servings
              </label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQuantity(Math.max(0.5, quantity - 0.5))}
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-lg font-bold dark:bg-brand-surface"
                >
                  -
                </button>
                <span className="min-w-[40px] text-center text-xl font-bold text-brand-dark dark:text-brand-white">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 0.5)}
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-lg font-bold dark:bg-brand-surface"
                >
                  +
                </button>
              </div>
            </div>

            {/* Nutrition Preview */}
            <div className="grid grid-cols-4 gap-2 rounded-xl bg-gray-50 p-3 dark:bg-brand-surface/50">
              <div className="text-center">
                <p className="text-lg font-bold text-brand-purple dark:text-brand-lavender">
                  {Math.round(selectedFood.calories * quantity)}
                </p>
                <p className="text-[10px] text-gray-400">Calories</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-blue-500">
                  {Math.round(selectedFood.protein * quantity)}g
                </p>
                <p className="text-[10px] text-gray-400">Protein</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-orange-500">
                  {Math.round(selectedFood.carbs * quantity)}g
                </p>
                <p className="text-[10px] text-gray-400">Carbs</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-yellow-500">
                  {Math.round(selectedFood.fat * quantity)}g
                </p>
                <p className="text-[10px] text-gray-400">Fat</p>
              </div>
            </div>

            {/* Meal Selection */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Add to
              </label>
              <div className="grid grid-cols-4 gap-2">
                {(['breakfast', 'lunch', 'dinner', 'snack'] as const).map((meal) => (
                  <button
                    key={meal}
                    onClick={() => setSelectedMeal(meal)}
                    className={cn(
                      'rounded-xl py-2 text-xs font-semibold capitalize transition-all',
                      selectedMeal === meal
                        ? 'bg-brand-purple text-white dark:bg-brand-lavender dark:text-brand-dark'
                        : 'bg-gray-100 text-gray-500 dark:bg-brand-surface dark:text-gray-400'
                    )}
                  >
                    {meal}
                  </button>
                ))}
              </div>
            </div>

            <Button onClick={handleAddFood} variant="primary" fullWidth>
              <Plus className="mr-2 h-4 w-4" />
              Add to {selectedMeal}
            </Button>
          </div>
        )}
      </Modal>
    </div>
  );
}

function FoodListItem({
  food,
  onSelect,
  isFavorite,
  onToggleFavorite,
}: {
  food: FoodData;
  onSelect: () => void;
  isFavorite: boolean;
  onToggleFavorite: () => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={onSelect}
        className="flex flex-1 items-center justify-between rounded-xl px-3 py-2.5 text-left transition-colors active:bg-gray-50 dark:active:bg-brand-surface"
      >
        <div className="flex-1">
          <p className="text-sm font-medium text-brand-dark dark:text-brand-white">
            {food.name}
          </p>
          <p className="text-xs text-gray-400">
            {food.servingSize} · P:{food.protein}g C:{food.carbs}g F:{food.fat}g
          </p>
        </div>
        <span className="ml-2 text-sm font-semibold text-gray-600 dark:text-gray-300">
          {food.calories} cal
        </span>
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggleFavorite();
        }}
        className="flex h-8 w-8 items-center justify-center"
      >
        {isFavorite ? (
          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
        ) : (
          <Star className="h-4 w-4 text-gray-300" />
        )}
      </button>
    </div>
  );
}

function getCategoryEmoji(category: string): string {
  const emojis: Record<string, string> = {
    proteins: '🥩',
    grains: '🌾',
    fruits: '🍎',
    vegetables: '🥬',
    dairy: '🥛',
    snacks: '🍿',
    drinks: '🥤',
    fast_food: '🍔',
    meals: '🍲',
    nuts_seeds: '🥜',
    condiments: '🧂',
    desserts: '🍰',
  };
  return emojis[category] || '🍽️';
}

