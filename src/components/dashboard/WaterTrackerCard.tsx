// src/components/dashboard/WaterTrackerCard.tsx
'use client';

import { useState, useEffect } from 'react';
import { Droplets, Plus } from 'lucide-react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuthStore } from '@/store/authStore';
import Card from '@/components/ui/Card';
import { cn, calculateWaterIntake } from '@/lib/utils';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export default function WaterTrackerCard() {
  const { user, userProfile } = useAuthStore();
  const [glasses, setGlasses] = useState(0);

  const weight = userProfile?.metrics?.currentWeight || 70;
  const activityLevel = userProfile?.profile?.activityLevel || 'moderately_active';
  const waterGoal = calculateWaterIntake(weight, activityLevel);
  const goalGlasses = Math.ceil(waterGoal / 250); // 250ml per glass

  useEffect(() => {
    if (!user) return;
    const fetchWater = async () => {
      const today = format(new Date(), 'yyyy-MM-dd');
      try {
        const logDoc = await getDoc(doc(db, 'users', user.uid, 'foodLogs', today));
        if (logDoc.exists()) {
          setGlasses(logDoc.data().waterIntake?.glasses || 0);
        }
      } catch (err) {
        console.error('Error fetching water:', err);
      }
    };
    fetchWater();
  }, [user]);

  const addGlass = async () => {
    if (!user) return;
    const newCount = glasses + 1;
    setGlasses(newCount);

    const today = format(new Date(), 'yyyy-MM-dd');
    try {
      await setDoc(
        doc(db, 'users', user.uid, 'foodLogs', today),
        {
          waterIntake: { glasses: newCount, goal: goalGlasses },
          date: today,
        },
        { merge: true }
      );

      if (newCount === goalGlasses) {
        toast.success('💧 Water goal reached! Great job!');
      }
    } catch (err) {
      console.error('Error saving water:', err);
      setGlasses(glasses); // Revert
    }
  };

  return (
    <Card>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-100 dark:bg-blue-900/30">
            <Droplets className="h-5 w-5 text-blue-500" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-brand-dark dark:text-brand-white">
              Water Intake
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {glasses}/{goalGlasses} glasses
            </p>
          </div>
        </div>

        <button
          onClick={addGlass}
          disabled={glasses >= goalGlasses}
          className={cn(
            'flex h-10 w-10 items-center justify-center rounded-full transition-all active:scale-90',
            glasses >= goalGlasses
              ? 'bg-green-100 text-green-500 dark:bg-green-900/30'
              : 'bg-blue-500 text-white hover:bg-blue-600'
          )}
          aria-label="Add glass of water"
        >
          {glasses >= goalGlasses ? '✓' : <Plus className="h-5 w-5" />}
        </button>
      </div>

      {/* Water drops visualization */}
      <div className="mt-3 flex gap-1.5">
        {Array.from({ length: goalGlasses }).map((_, i) => (
          <div
            key={i}
            className={cn(
              'h-6 w-6 rounded-full border-2 transition-all duration-300',
              i < glasses
                ? 'scale-100 border-blue-400 bg-blue-400 dark:border-blue-500 dark:bg-blue-500'
                : 'scale-90 border-gray-300 bg-transparent dark:border-gray-600'
            )}
          />
        ))}
      </div>
    </Card>
  );
}