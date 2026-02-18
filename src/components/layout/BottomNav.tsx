// src/components/layout/BottomNav.tsx
'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Home, UtensilsCrossed, Dumbbell, BarChart3, Bot } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const tabs = [
  { id: 'dashboard', label: 'Home', icon: Home, path: '/dashboard' },
  { id: 'nutrition', label: 'Nutrition', icon: UtensilsCrossed, path: '/nutrition' },
  { id: 'workout', label: 'Workout', icon: Dumbbell, path: '/workout' },
  { id: 'progress', label: 'Progress', icon: BarChart3, path: '/progress' },
  { id: 'coach', label: 'Coach', icon: Bot, path: '/coach' },
];

export default function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 pb-safe">
      <div className="mx-auto max-w-[480px]">
        <div
          className={cn(
            'flex items-center justify-around',
            'border-t border-gray-200 bg-white/80 backdrop-blur-xl',
            'dark:border-brand-surface dark:bg-brand-dark/80',
            'px-2 pb-2 pt-1',
            'transition-colors duration-300'
          )}
        >
          {tabs.map((tab) => {
            const isActive = pathname === tab.path || pathname?.startsWith(tab.path + '/');
            const Icon = tab.icon;

            return (
              <button
                key={tab.id}
                onClick={() => router.push(tab.path)}
                className={cn(
                  'relative flex min-h-[44px] min-w-[44px] flex-col items-center justify-center',
                  'rounded-xl px-3 py-1 transition-all duration-200',
                  'active:scale-95',
                  isActive
                    ? 'text-brand-purple dark:text-brand-lavender'
                    : 'text-gray-400 dark:text-gray-500'
                )}
                aria-label={tab.label}
              >
                {isActive && (
                  <motion.div
                    layoutId="bottomNavIndicator"
                    className="absolute inset-0 rounded-xl bg-brand-purple/10 dark:bg-brand-lavender/10"
                    transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                  />
                )}
                <Icon
                  className={cn(
                    'relative z-10 h-5 w-5 transition-all duration-200',
                    isActive && 'scale-110'
                  )}
                  strokeWidth={isActive ? 2.5 : 2}
                />
                <span
                  className={cn(
                    'relative z-10 mt-0.5 text-[10px] transition-all duration-200',
                    isActive ? 'font-semibold' : 'font-medium'
                  )}
                >
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

/**
 * CommunityLink - Standalone component for linking to the Community page.
 *
 * Usage options:
 * 1. Add to TopBar next to the notification bell
 * 2. Add to Settings/Profile page
 * 3. Add to a "More" menu
 *
 * Example in TopBar:
 *   import { CommunityLink } from '@/components/layout/BottomNav';
 *   <CommunityLink />
 *
 * Example in Settings page as a menu item:
 *   import { CommunityLink } from '@/components/layout/BottomNav';
 *   <div className="space-y-2">
 *     <CommunityLink />
 *   </div>
 */
export function CommunityLink() {
  const router = useRouter();

  return (
    <button
      onClick={() => router.push('/community')}
      className="flex w-full items-center gap-3 rounded-xl px-4 py-3 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800"
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-lavender/20 dark:bg-brand-purple/20">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-brand-purple dark:text-brand-lavender"
        >
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      </div>
      <div className="text-left">
        <p className="text-sm font-medium text-brand-dark dark:text-brand-white">Community</p>
        <p className="text-xs text-gray-500 dark:text-gray-400">Connect with others</p>
      </div>
    </button>
  );
}