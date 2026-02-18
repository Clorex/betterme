// src/app/(main)/progress/page.tsx
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart3, Scale, Trophy, Calendar, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';
import AnalyticsDashboard from '@/components/progress/AnalyticsDashboard';
import BodyTracker from '@/components/progress/BodyTracker';
import PersonalRecords from '@/components/progress/PersonalRecords';
import ProgressCalendar from '@/components/progress/ProgressCalendar';
import WellnessTracker from '@/components/progress/WellnessTracker';

const tabs = [
  { id: 'overview', label: 'Overview', icon: BarChart3 },
  { id: 'body', label: 'Body', icon: Scale },
  { id: 'records', label: 'Records', icon: Trophy },
  { id: 'calendar', label: 'Calendar', icon: Calendar },
  { id: 'wellness', label: 'Wellness', icon: Heart },
];

export default function ProgressPage() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="space-y-4">
      <h1 className="font-heading text-xl font-bold text-brand-dark dark:text-brand-white">
        Progress
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
                  isActive ? 'text-white' : 'text-gray-500 dark:text-gray-400'
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="progressTab"
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
          {activeTab === 'overview' && <AnalyticsDashboard />}
          {activeTab === 'body' && <BodyTracker />}
          {activeTab === 'records' && <PersonalRecords />}
          {activeTab === 'calendar' && <ProgressCalendar />}
          {activeTab === 'wellness' && <WellnessTracker />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}