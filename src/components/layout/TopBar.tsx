// src/components/layout/TopBar.tsx
'use client';

import { useRouter } from 'next/navigation';
import { Bell, Flame } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useMemo } from 'react';
import { cn } from '@/lib/utils';

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
}

export default function TopBar() {
  const router = useRouter();
  const { userProfile, user } = useAuthStore();

  const firstName = useMemo(() => {
    const name = userProfile?.displayName || user?.displayName || 'Friend';
    return name.split(' ')[0];
  }, [userProfile?.displayName, user?.displayName]);

  const streak = userProfile?.streaks?.current || 0;

  return (
    <header
      className={cn(
        'fixed left-0 right-0 top-0 z-50 pt-safe',
      )}
    >
      <div className="mx-auto max-w-[480px]">
        <div
          className={cn(
            'flex h-14 items-center justify-between px-4',
            'bg-white/80 backdrop-blur-xl',
            'dark:bg-brand-dark/80',
            'transition-colors duration-300'
          )}
        >
          {/* Left: Greeting */}
          <div className="flex flex-col">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {getGreeting()}
            </span>
            <span className="font-heading text-base font-bold text-brand-dark dark:text-brand-white">
              {firstName}! 👋
            </span>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            {/* Streak */}
            {streak > 0 && (
              <div
                className={cn(
                  'flex items-center gap-1 rounded-full',
                  'bg-orange-100 px-2.5 py-1',
                  'dark:bg-orange-900/30'
                )}
              >
                <Flame className="h-4 w-4 text-orange-500" />
                <span className="text-xs font-bold text-orange-600 dark:text-orange-400">
                  {streak}
                </span>
              </div>
            )}

            {/* Notification Bell */}
            <button
              onClick={() => {/* TODO: notifications panel */}}
              className={cn(
                'relative flex h-10 w-10 items-center justify-center rounded-full',
                'transition-colors hover:bg-gray-100 active:scale-95',
                'dark:hover:bg-brand-surface'
              )}
              aria-label="Notifications"
            >
              <Bell className="h-5 w-5 text-gray-600 dark:text-gray-300" />
              {/* Badge dot */}
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500" />
            </button>

            {/* Avatar */}
            <button
              onClick={() => router.push('/settings')}
              className="h-9 w-9 overflow-hidden rounded-full bg-brand-lavender/30 active:scale-95"
              aria-label="Settings"
            >
              {user?.photoURL ? (
                <img
                  src={user.photoURL}
                  alt="Profile"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-brand-purple text-sm font-bold text-white">
                  {firstName.charAt(0).toUpperCase()}
                </div>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}