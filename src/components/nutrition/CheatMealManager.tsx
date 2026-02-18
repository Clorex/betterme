// src/components/nutrition/CheatMealManager.tsx
'use client';

import { useState } from 'react';
import { Pizza, Calendar, TrendingUp, Lightbulb, Heart } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useNutrition } from '@/hooks/useNutrition';
import { cn } from '@/lib/utils';

export default function CheatMealManager() {
  const { calorieGoal, remainingCalories, totals } = useNutrition();
  const [cheatDay, setCheatDay] = useState<string | null>(null);

  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const bankCalories = Math.round(calorieGoal * 0.1); // Save 10% per day = bank for cheat
  const cheatBudget = calorieGoal + bankCalories * 6; // Normal + banked

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card>
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-100 dark:bg-orange-900/30">
            <Pizza className="h-6 w-6 text-orange-500" />
          </div>
          <div>
            <h2 className="font-heading text-base font-bold text-brand-dark dark:text-brand-white">
              Cheat Meal Strategy
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Plan smart, enjoy guilt-free
            </p>
          </div>
        </div>
      </Card>

      {/* Schedule Cheat Day */}
      <Card>
        <h3 className="mb-3 text-sm font-bold text-gray-500 dark:text-gray-400">
          <Calendar className="mr-1 inline h-4 w-4" />
          Schedule Your Cheat Meal
        </h3>
        <p className="mb-3 text-xs text-gray-500 dark:text-gray-400">
          Pick 1 day this week for a planned indulgence
        </p>
        <div className="grid grid-cols-7 gap-1.5">
          {weekDays.map((day) => (
            <button
              key={day}
              onClick={() => setCheatDay(cheatDay === day ? null : day)}
              className={cn(
                'rounded-xl py-2.5 text-xs font-bold transition-all',
                cheatDay === day
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-100 text-gray-500 dark:bg-brand-surface dark:text-gray-400'
              )}
            >
              {day}
            </button>
          ))}
        </div>
        {cheatDay && (
          <p className="mt-2 text-center text-xs text-orange-500">
            🍕 Cheat meal planned for {cheatDay}!
          </p>
        )}
      </Card>

      {/* Pre-Cheat Strategy */}
      <Card>
        <h3 className="mb-3 text-sm font-bold text-gray-500 dark:text-gray-400">
          <TrendingUp className="mr-1 inline h-4 w-4" />
          Before Your Cheat Meal
        </h3>
        <div className="space-y-3">
          <StrategyItem
            emoji="🏦"
            title="Bank Calories"
            desc={`Eat ${bankCalories} fewer calories on other days to save up for your cheat meal.`}
          />
          <StrategyItem
            emoji="🏋️"
            title="Train Hard"
            desc="Schedule your toughest workout on cheat day. Your muscles will use the extra fuel."
          />
          <StrategyItem
            emoji="🥗"
            title="Eat Light Earlier"
            desc="Have a protein-rich breakfast and light lunch to save room for dinner."
          />
          <StrategyItem
            emoji="💧"
            title="Hydrate Extra"
            desc="Drink extra water. Cheat meals are usually higher in sodium."
          />
        </div>
      </Card>

      {/* During Cheat Meal */}
      <Card>
        <h3 className="mb-3 text-sm font-bold text-gray-500 dark:text-gray-400">
          <Pizza className="mr-1 inline h-4 w-4" />
          During Your Cheat Meal
        </h3>
        <div className="space-y-3">
          <StrategyItem
            emoji="📸"
            title="Still Log It"
            desc="Snap a photo and log your cheat meal. Awareness is key, not perfection."
          />
          <StrategyItem
            emoji="😊"
            title="Enjoy Without Guilt"
            desc="Planned indulgences are part of a sustainable lifestyle. Savor every bite."
          />
          <StrategyItem
            emoji="🛑"
            title="One Meal, Not One Day"
            desc="Keep it to one meal. Don't let it spiral into a full cheat day."
          />
          <StrategyItem
            emoji="🍽️"
            title="Eat Slowly"
            desc="Take your time. You'll enjoy it more and feel satisfied with less."
          />
        </div>
      </Card>

      {/* After Cheat */}
      <Card>
        <h3 className="mb-3 text-sm font-bold text-gray-500 dark:text-gray-400">
          <Heart className="mr-1 inline h-4 w-4" />
          After Your Cheat Meal
        </h3>
        <div className="rounded-xl bg-green-50 p-4 dark:bg-green-900/20">
          <p className="text-sm font-medium text-green-700 dark:text-green-400">
            🌟 &ldquo;One meal doesn&apos;t ruin your progress!&rdquo;
          </p>
          <p className="mt-2 text-xs text-green-600 dark:text-green-400/80">
            Your weight may temporarily increase 1-3 lbs from water retention
            (sodium + carbs hold water). This is NOT fat gain. It&apos;ll normalize
            in 2-3 days of normal eating.
          </p>
        </div>

        <div className="mt-3 space-y-2">
          <StrategyItem
            emoji="↩️"
            title="Resume Normal Eating"
            desc="Go right back to your regular plan the next meal. Don't try to 'make up' by starving."
          />
          <StrategyItem
            emoji="🚶"
            title="Stay Active"
            desc="A walk after your cheat meal helps with digestion and blood sugar."
          />
          <StrategyItem
            emoji="📊"
            title="Check Weekly Average"
            desc="One high day barely affects your weekly calorie average. Focus on the big picture."
          />
        </div>
      </Card>

      {/* Smart Cheat Ideas */}
      <Card>
        <h3 className="mb-3 text-sm font-bold text-gray-500 dark:text-gray-400">
          <Lightbulb className="mr-1 inline h-4 w-4" />
          Smart Cheat Swaps
        </h3>
        <div className="space-y-2 text-sm">
          <SwapItem from="Large pizza (2400 cal)" to="2 slices + big salad (700 cal)" />
          <SwapItem from="Large fries (500 cal)" to="Small fries (230 cal)" />
          <SwapItem from="Milkshake (800 cal)" to="Protein shake blended with ice cream (400 cal)" />
          <SwapItem from="Full burger meal (1400 cal)" to="Burger + water, skip fries (600 cal)" />
          <SwapItem from="Pasta alfredo (1200 cal)" to="Pasta marinara with chicken (550 cal)" />
        </div>
      </Card>
    </div>
  );
}

function StrategyItem({ emoji, title, desc }: { emoji: string; title: string; desc: string }) {
  return (
    <div className="flex gap-3 rounded-xl bg-gray-50 p-3 dark:bg-brand-surface/50">
      <span className="text-lg">{emoji}</span>
      <div>
        <p className="text-sm font-semibold text-brand-dark dark:text-brand-white">{title}</p>
        <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">{desc}</p>
      </div>
    </div>
  );
}

function SwapItem({ from, to }: { from: string; to: string }) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="flex-1 rounded-lg bg-red-50 p-2 text-red-600 line-through dark:bg-red-900/20 dark:text-red-400">
        {from}
      </span>
      <span className="text-gray-400">→</span>
      <span className="flex-1 rounded-lg bg-green-50 p-2 font-medium text-green-600 dark:bg-green-900/20 dark:text-green-400">
        {to}
      </span>
    </div>
  );
}