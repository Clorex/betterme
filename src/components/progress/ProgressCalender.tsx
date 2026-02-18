// src/components/progress/ProgressCalendar.tsx
'use client';

import { useState, useEffect, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Dumbbell, UtensilsCrossed, Droplets, Footprints, Scale } from 'lucide-react';
import Card from '@/components/ui/Card';
import { useAuthStore } from '@/store/authStore';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
  addMonths,
  subMonths,
  isSameDay,
  isToday,
} from 'date-fns';
import { cn } from '@/lib/utils';
import Modal from '@/components/ui/Modal';

interface DayData {
  workout: boolean;
  nutrition: boolean;
  water: boolean;
  steps: boolean;
  weight: boolean;
  details?: any;
}

export default function ProgressCalendar() {
  const { user } = useAuthStore();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [monthData, setMonthData] = useState<Record<string, DayData>>({});
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  useEffect(() => {
    if (user) fetchMonthData();
  }, [user, currentMonth]);

  const fetchMonthData = async () => {
    if (!user) return;
    const start = format(startOfMonth(currentMonth), 'yyyy-MM-dd');
    const end = format(endOfMonth(currentMonth), 'yyyy-MM-dd');

    const data: Record<string, DayData> = {};

    try {
      // Workout logs
      const workoutSnap = await getDocs(collection(db, 'users', user.uid, 'workoutLogs'));
      workoutSnap.docs.forEach((d) => {
        const date = d.data().date;
        if (date >= start && date <= end) {
          if (!data[date]) data[date] = { workout: false, nutrition: false, water: false, steps: false, weight: false };
          data[date].workout = true;
          data[date].details = { ...data[date].details, workout: d.data() };
        }
      });

      // Food logs
      const foodSnap = await getDocs(collection(db, 'users', user.uid, 'foodLogs'));
      foodSnap.docs.forEach((d) => {
        const date = d.data().date;
        if (date >= start && date <= end) {
          if (!data[date]) data[date] = { workout: false, nutrition: false, water: false, steps: false, weight: false };
          const meals = d.data().meals || [];
          data[date].nutrition = meals.some((m: any) => m.foods && m.foods.length > 0);
          data[date].water = (d.data().waterIntake?.glasses || 0) >= 8;
          data[date].details = { ...data[date].details, food: d.data() };
        }
      });

      // Steps
      const stepsSnap = await getDocs(collection(db, 'users', user.uid, 'steps'));
      stepsSnap.docs.forEach((d) => {
        const date = d.data().date;
        if (date >= start && date <= end) {
          if (!data[date]) data[date] = { workout: false, nutrition: false, water: false, steps: false, weight: false };
          data[date].steps = (d.data().steps || 0) >= 10000;
          data[date].details = { ...data[date].details, steps: d.data() };
        }
      });

      // Weight
      const weightSnap = await getDocs(collection(db, 'users', user.uid, 'measurements'));
      weightSnap.docs.forEach((d) => {
        const date = d.data().date;
        if (date >= start && date <= end && d.data().weight) {
          if (!data[date]) data[date] = { workout: false, nutrition: false, water: false, steps: false, weight: false };
          data[date].weight = true;
        }
      });
    } catch (err) {
      console.error('Error fetching calendar data:', err);
    }

    setMonthData(data);
  };

  const days = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  });

  const startDay = getDay(startOfMonth(currentMonth));
  const paddingDays = startDay === 0 ? 6 : startDay - 1; // Start from Monday

  const dayNames = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

  const getCompletionLevel = (dayData: DayData) => {
    const scores = [dayData.workout, dayData.nutrition, dayData.water, dayData.steps].filter(Boolean).length;
    return scores;
  };

  const selectedDayData = selectedDay ? monthData[selectedDay] : null;

  return (
    <div className="space-y-4">
      {/* Month Navigation */}
      <div className="flex items-center justify-between">
        <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 dark:bg-brand-surface">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <h2 className="font-heading text-base font-bold text-brand-dark dark:text-brand-white">
          {format(currentMonth, 'MMMM yyyy')}
        </h2>
        <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 dark:bg-brand-surface">
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* Calendar Grid */}
      <Card>
        {/* Day Names */}
        <div className="mb-2 grid grid-cols-7 gap-1">
          {dayNames.map((name) => (
            <div key={name} className="text-center text-[10px] font-bold text-gray-400">
              {name}
            </div>
          ))}
        </div>

        {/* Day Grid */}
        <div className="grid grid-cols-7 gap-1">
          {/* Padding */}
          {Array.from({ length: paddingDays }).map((_, i) => (
            <div key={`pad-${i}`} className="aspect-square" />
          ))}

          {days.map((day) => {
            const dateStr = format(day, 'yyyy-MM-dd');
            const dayData = monthData[dateStr];
            const level = dayData ? getCompletionLevel(dayData) : 0;
            const today = isToday(day);

            return (
              <button
                key={dateStr}
                onClick={() => setSelectedDay(dateStr)}
                className={cn(
                  'relative flex aspect-square flex-col items-center justify-center rounded-lg text-xs transition-all',
                  today && 'ring-2 ring-brand-purple dark:ring-brand-lavender',
                  level === 0 && 'bg-gray-50 dark:bg-brand-surface/30',
                  level === 1 && 'bg-brand-lavender/20',
                  level === 2 && 'bg-brand-lavender/40',
                  level === 3 && 'bg-brand-lavender/60',
                  level >= 4 && 'bg-brand-purple text-white dark:bg-brand-lavender dark:text-brand-dark'
                )}
              >
                <span className={cn(
                  'font-semibold',
                  level >= 4 ? 'text-white dark:text-brand-dark' : 'text-gray-700 dark:text-gray-300'
                )}>
                  {format(day, 'd')}
                </span>

                {/* Activity dots */}
                {dayData && (
                  <div className="mt-0.5 flex gap-0.5">
                    {dayData.workout && <span className="h-1 w-1 rounded-full bg-blue-500" />}
                    {dayData.nutrition && <span className="h-1 w-1 rounded-full bg-green-500" />}
                    {dayData.water && <span className="h-1 w-1 rounded-full bg-cyan-400" />}
                    {dayData.steps && <span className="h-1 w-1 rounded-full bg-orange-400" />}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-3 flex flex-wrap items-center justify-center gap-3 text-[10px] text-gray-400">
          <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-blue-500" /> Workout</span>
          <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-green-500" /> Nutrition</span>
          <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-cyan-400" /> Water</span>
          <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-orange-400" /> Steps</span>
        </div>
      </Card>

      {/* Current streak */}
      <Card padding="sm">
        <div className="flex items-center justify-between px-2">
          <span className="text-xs text-gray-500">Active days this month</span>
          <span className="text-sm font-bold text-brand-purple dark:text-brand-lavender">
            {Object.keys(monthData).length} days
          </span>
        </div>
      </Card>

      {/* Day Detail Modal */}
      <Modal isOpen={!!selectedDay} onClose={() => setSelectedDay(null)} title={selectedDay ? format(new Date(selectedDay), 'EEEE, MMMM d') : ''}>
        {selectedDayData ? (
          <div className="space-y-3 pb-4">
            <DayDetailRow icon={<Dumbbell className="h-4 w-4" />} label="Workout" done={selectedDayData.workout} detail={selectedDayData.details?.workout?.workoutName} />
            <DayDetailRow icon={<UtensilsCrossed className="h-4 w-4" />} label="Nutrition Logged" done={selectedDayData.nutrition} />
            <DayDetailRow icon={<Droplets className="h-4 w-4" />} label="Water Goal" done={selectedDayData.water} detail={selectedDayData.details?.food?.waterIntake ? `${selectedDayData.details.food.waterIntake.glasses} glasses` : undefined} />
            <DayDetailRow icon={<Footprints className="h-4 w-4" />} label="Step Goal" done={selectedDayData.steps} detail={selectedDayData.details?.steps?.steps ? `${selectedDayData.details.steps.steps.toLocaleString()} steps` : undefined} />
            <DayDetailRow icon={<Scale className="h-4 w-4" />} label="Weight Logged" done={selectedDayData.weight} />
          </div>
        ) : (
          <p className="py-4 text-center text-sm text-gray-400">No activity on this day</p>
        )}
      </Modal>
    </div>
  );
}

function DayDetailRow({ icon, label, done, detail }: { icon: React.ReactNode; label: string; done: boolean; detail?: string }) {
  return (
    <div className={cn('flex items-center gap-3 rounded-xl px-3 py-2.5', done ? 'bg-green-50 dark:bg-green-900/10' : 'bg-gray-50 dark:bg-brand-surface/30')}>
      <div className={cn(done ? 'text-green-500' : 'text-gray-300')}>{icon}</div>
      <div className="flex-1">
        <p className={cn('text-sm font-medium', done ? 'text-green-700 dark:text-green-400' : 'text-gray-400')}>
          {label}
        </p>
        {detail && <p className="text-[10px] text-gray-400">{detail}</p>}
      </div>
      {done && <span className="text-green-500">✓</span>}
    </div>
  );
}