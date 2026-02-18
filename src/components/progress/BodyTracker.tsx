// src/components/progress/BodyTracker.tsx
'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import WeightTracker from '@/components/progress/WeightTracker';
import MeasurementTracker from '@/components/progress/MeasurementTracker';
import PhotoJournal from '@/components/progress/PhotoJournal';

const sections = [
  { id: 'weight', label: '⚖️ Weight' },
  { id: 'measurements', label: '📏 Measurements' },
  { id: 'photos', label: '📸 Photos' },
];

export default function BodyTracker() {
  const [active, setActive] = useState('weight');

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {sections.map((s) => (
          <button
            key={s.id}
            onClick={() => setActive(s.id)}
            className={cn(
              'flex-1 rounded-xl py-2.5 text-xs font-semibold transition-all',
              active === s.id
                ? 'bg-brand-purple text-white dark:bg-brand-lavender dark:text-brand-dark'
                : 'bg-gray-100 text-gray-500 dark:bg-brand-surface dark:text-gray-400'
            )}
          >
            {s.label}
          </button>
        ))}
      </div>

      {active === 'weight' && <WeightTracker />}
      {active === 'measurements' && <MeasurementTracker />}
      {active === 'photos' && <PhotoJournal />}
    </div>
  );
}