// src/components/layout/TopBar.tsx
'use client';

import { useRouter } from 'next/navigation';
import { Bell, Flame, LogOut, User, Settings } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useAuth } from '@/hooks/useAuth';
import { useMemo, useState } from 'react';
import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
}

export default function TopBar() {
  const router = useRouter();
  const { userProfile, user } = useAuthStore();
  const { logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const firstName = useMemo(() => {
    const name = userProfile?.displayName || user?.displayName || 'Friend';
    return name.split(' ')[0];
  }, [userProfile?.displayName, user?.displayName]);

  const streak = userProfile?.streaks?.current || 0;

  return (
    <header className="fixed left-0 right-0 top-0 z-50 pt-safe">
      <div className="mx-auto max-w-[480px]">
        <div
          className={cn(
            'flex h-14 items-center justify-between px-4',
            'bg-white/80 backdrop-blur-xl',
            'dark:bg-brand-dark/80',
            'transition-colors duration-300'
          )}
        >
          {/* Greeting */}
          <div className="flex flex-col">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {getGreeting()}
            </span>
            <span className="font-heading text-base font-bold text-brand-dark dark:text-brand-white">
              {firstName}! 👋
            </span>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2 relative">

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

            {/* Notifications */}
            <button
              className={cn(
                'relative flex h-10 w-10 items-center justify-center rounded-full',
                'transition-colors hover:bg-gray-100 active:scale-95',
                'dark:hover:bg-brand-surface'
              )}
              aria-label="Notifications"
            >
              <Bell className="h-5 w-5 text-gray-600 dark:text-gray-300" />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500" />
            </button>

            {/* Avatar */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="h-9 w-9 overflow-hidden rounded-full bg-brand-lavender/30 active:scale-95"
              aria-label="Profile menu"
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

            {/* Dropdown */}
            <AnimatePresence>
              {menuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute right-0 top-12 w-44 bg-white dark:bg-brand-surface rounded-xl shadow-xl border border-gray-200 dark:border-brand-surface-light overflow-hidden z-50"
                >
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      router.push('/profile');
                    }}
                    className="w-full flex items-center gap-2 px-4 py-3 text-sm hover:bg-gray-100 dark:hover:bg-brand-surface-light"
                  >
                    <User className="w-4 h-4" />
                    Profile
                  </button>

                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      router.push('/settings');
                    }}
                    className="w-full flex items-center gap-2 px-4 py-3 text-sm hover:bg-gray-100 dark:hover:bg-brand-surface-light"
                  >
                    <Settings className="w-4 h-4" />
                    Settings
                  </button>

                  <button
                    onClick={logout}
                    className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

          </div>
        </div>
      </div>
    </header>
  );
}