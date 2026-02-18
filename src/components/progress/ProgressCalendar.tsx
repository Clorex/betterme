'use client';

import React, { useMemo } from 'react';
import Card from '@/components/ui/Card';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';
import { format, subDays, isSameDay } from 'date-fns';

type Props = {
  /**
   * Optional list of YYYY-MM-DD strings to mark as completed.
   * If not provided, we fall back to streaks.lastActiveDate and streaks.current.
   */
  activeDates?: string[];
  days?: number; // default 28
};

function toDateSafe(d?: string) {
  if (!d) return null;
  const dt = new Date(d);
  return isNaN(dt.getTime()) ? null : dt;
}

export default function ProgressCalendar({ activeDates, days = 28 }: Props) {
  const { userProfile } = useAuthStore();

  const computedActiveDates = useMemo(() => {
    // If caller passed activeDates, use them
    if (activeDates && activeDates.length) return activeDates;

    // Else compute from streak
    const last = toDateSafe(userProfile?.streaks?.lastActiveDate);
    const current = userProfile?.streaks?.current || 0;
    if (!last || current <= 0) return [];

    const arr: string[] = [];
    for (let i = 0; i < current; i++) {
      arr.push(format(subDays(last, i), 'yyyy-MM-dd'));
    }
    return arr;
  }, [activeDates, userProfile?.streaks?.lastActiveDate, userProfile?.streaks?.current]);

  const dates = useMemo(() => {
    const list: Date[] = [];
    for (let i = days - 1; i >= 0; i--) list.push(subDays(new Date(), i));
    return list;
  }, [days]);

  const activeDateObjs = useMemo(() => {
    return computedActiveDates
      .map((d) => toDateSafe(d))
      .filter(Boolean) as Date[];
  }, [computedActiveDates]);

  return (
    <Card>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-brand-dark dark:text-brand-white">
          Consistency Calendar
        </h3>
        <p className="text-xs text-gray-400">
          Last {days} days
        </p>
      </div>

      <div className="mt-3 grid grid-cols-7 gap-1.5">
        {dates.map((d) => {
          const isActive = activeDateObjs.some((a) => isSameDay(a, d));
          const isToday = isSameDay(d, new Date());

          return (
            <div
              key={d.toISOString()}
              className={cn(
                'flex h-9 items-center justify-center rounded-xl text-[11px] font-semibold',
                isActive
                  ? 'bg-brand-purple text-white dark:bg-brand-lavender dark:text-brand-dark'
                  : 'bg-gray-100 text-gray-500 dark:bg-brand-surface dark:text-gray-400',
                isToday && 'ring-2 ring-brand-lavender dark:ring-brand-purple'
              )}
              title={format(d, 'MMM d, yyyy')}
            >
              {format(d, 'd')}
            </div>
          );
        })}
      </div>

      <div className="mt-3 flex items-center gap-2 text-[11px] text-gray-500 dark:text-gray-400">
        <span className="inline-block h-3 w-3 rounded bg-brand-purple dark:bg-brand-lavender" />
        Completed
        <span className="ml-3 inline-block h-3 w-3 rounded bg-gray-100 dark:bg-brand-surface" />
        Not completed
      </div>
    </Card>
  );
}
