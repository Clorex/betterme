// src/app/(main)/nutrition/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart3, Camera, Search, Droplets, ChefHat } from 'lucide-react';
import { cn } from '@/lib/utils';
import DailyFoodLog from '@/components/nutrition/DailyFoodLog';
import FoodAnalyzer from '@/components/nutrition/FoodAnalyzer';
import FoodSearch from '@/components/nutrition/FoodSearch';
import WaterTracker from '@/components/nutrition/WaterTracker';
import MealPlanTab from '@/components/nutrition/MealPlanTab';

const tabs = [
  { id: 'today', label: 'Today', icon: BarChart3 },
  { id: 'snap', label: 'Snap', icon: Camera },
  { id: 'search', label: 'Search', icon: Search },
  { id: 'plans', label: 'Plans', icon: ChefHat },
  { id: 'water', label: 'Water', icon: Droplets },
];

export default function NutritionPage() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab') || 'today';
  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && tabs.some((t) => t.id === tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  return (
    <div className="space-y-4">
      <h1 className="font-heading text-xl font-bold text-brand-dark dark:text-brand-white">
        Nutrition
      </h1>

      {/* Tab Navigation */}
      <div className="no-scrollbar -mx-4 flex gap-1 overflow-x-auto px-4">
        <div className="flex min-w-full gap-1 rounded-2xl bg-gray-100 p-1 dark:bg-brand-surface">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'relative flex flex-1 items-center justify-center gap-1 rounded-xl py-2.5 text-[11px] font-semibold transition-all',
                  isActive
                    ? 'text-white'
                    : 'text-gray-500 dark:text-gray-400'
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="nutritionTab"
                    className="absolute inset-0 rounded-xl bg-brand-purple dark:bg-brand-lavender"
                    transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                  />
                )}
                <Icon className={cn('relative z-10 h-3.5 w-3.5', isActive && 'dark:text-brand-dark')} />
                <span className={cn('relative z-10', isActive && 'dark:text-brand-dark')}>
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'today' && <DailyFoodLog />}
          {activeTab === 'snap' && <FoodAnalyzer />}
          {activeTab === 'search' && <FoodSearch />}
          {activeTab === 'plans' && <MealPlanTab />}
          {activeTab === 'water' && <WaterTracker />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}