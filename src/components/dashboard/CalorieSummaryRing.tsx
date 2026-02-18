// src/components/dashboard/CalorieSummaryRing.tsx
'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuthStore } from '@/store/authStore';
import Card from '@/components/ui/Card';
import ProgressRing from '@/components/ui/ProgressRing';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

export default function CalorieSummaryRing() {
  const router = useRouter();
  const { user, userProfile } = useAuthStore();
  const [consumed, setConsumed] = useState(0);
  const [macros, setMacros] = useState({ protein: 0, carbs: 0, fat: 0 });

  const calorieGoal = userProfile?.metrics?.tdee || 2000;
  const macroGoals = {
    protein: Math.round((calorieGoal * 0.3) / 4),
    carbs: Math.round((calorieGoal * 0.4) / 4),
    fat: Math.round((calorieGoal * 0.3) / 9),
  };

  useEffect(() => {
    if (!user) return;

    const fetchTodayLog = async () => {
      const today = format(new Date(), 'yyyy-MM-dd');
      try {
        const logDoc = await getDoc(doc(db, 'users', user.uid, 'foodLogs', today));
        if (logDoc.exists()) {
          const data = logDoc.data();
          let totalCal = 0;
          let totalP = 0;
          let totalC = 0;
          let totalF = 0;

          (data.meals || []).forEach((meal: any) => {
            totalCal += meal.totalCalories || 0;
            totalP += meal.totalProtein || 0;
            totalC += meal.totalCarbs || 0;
            totalF += meal.totalFat || 0;
          });

          setConsumed(totalCal);
          setMacros({ protein: totalP, carbs: totalC, fat: totalF });
        }
      } catch (err) {
        console.error('Error fetching food log:', err);
      }
    };

    fetchTodayLog();
  }, [user]);

  const percentage = Math.min((consumed / calorieGoal) * 100, 100);
  const remaining = Math.max(calorieGoal - consumed, 0);

  const getCalorieColor = () => {
    if (percentage < 75) return '#22C55E';
    if (percentage < 95) return '#F59E0B';
    return '#EF4444';
  };

  return (
    <Card onClick={() => router.push('/nutrition')} clickable>
      <div className="flex flex-col items-center py-2">
        <h3 className="mb-4 text-sm font-semibold text-gray-500 dark:text-gray-400">
          Today&apos;s Calories
        </h3>

        <ProgressRing
          value={consumed}
          max={calorieGoal}
          size={160}
          strokeWidth={12}
          color={getCalorieColor()}
        >
          <div className="text-center">
            <div className="text-3xl font-bold text-brand-dark dark:text-brand-white">
              {consumed.toLocaleString()}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              of {calorieGoal.toLocaleString()} cal
            </div>
          </div>
        </ProgressRing>

        <p className="mt-2 text-sm font-medium text-gray-600 dark:text-gray-300">
          {remaining > 0 ? `${remaining} cal remaining` : 'Goal reached!'}
        </p>

        {/* Macro bars */}
        <div className="mt-4 grid w-full grid-cols-3 gap-3">
          <MacroBar
            label="Protein"
            current={macros.protein}
            goal={macroGoals.protein}
            color="bg-blue-500"
            unit="g"
          />
          <MacroBar
            label="Carbs"
            current={macros.carbs}
            goal={macroGoals.carbs}
            color="bg-orange-500"
            unit="g"
          />
          <MacroBar
            label="Fat"
            current={macros.fat}
            goal={macroGoals.fat}
            color="bg-yellow-500"
            unit="g"
          />
        </div>
      </div>
    </Card>
  );
}

function MacroBar({
  label,
  current,
  goal,
  color,
  unit,
}: {
  label: string;
  current: number;
  goal: number;
  color: string;
  unit: string;
}) {
  const pct = Math.min((current / goal) * 100, 100);

  return (
    <div className="text-center">
      <p className="text-xs font-medium text-gray-500 dark:text-gray-400">{label}</p>
      <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
        <div
          className={cn('h-full rounded-full transition-all duration-500', color)}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="mt-1 text-xs text-gray-600 dark:text-gray-300">
        {current}/{goal}
        {unit}
      </p>
    </div>
  );
}