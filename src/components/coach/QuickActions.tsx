// src/components/coach/QuickActions.tsx
'use client';

import { cn } from '@/lib/utils';

const quickQuestions = [
  { emoji: '🍽️', text: 'What should I eat next?' },
  { emoji: '📊', text: 'Am I on track today?' },
  { emoji: '🤔', text: "Why am I not losing weight?" },
  { emoji: '🏋️', text: 'What workout should I do?' },
  { emoji: '🍟', text: "I'm craving junk food, help!" },
  { emoji: '🥩', text: 'How can I hit my protein goal?' },
  { emoji: '😴', text: 'Can I skip my workout today?' },
  { emoji: '🍕', text: "I'm eating out tonight, tips?" },
];

interface QuickActionsProps {
  onSelect: (message: string) => void;
  compact?: boolean;
}

export default function QuickActions({ onSelect, compact = false }: QuickActionsProps) {
  if (compact) {
    return (
      <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4">
        {quickQuestions.slice(0, 5).map((q, i) => (
          <button
            key={i}
            onClick={() => onSelect(q.text)}
            className="flex flex-shrink-0 items-center gap-1 rounded-full bg-gray-100 px-3 py-1.5 text-[11px] font-medium text-gray-600 transition-all active:scale-95 dark:bg-brand-surface dark:text-gray-300"
          >
            <span>{q.emoji}</span>
            <span className="max-w-[120px] truncate">{q.text}</span>
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-2">
      {quickQuestions.map((q, i) => (
        <button
          key={i}
          onClick={() => onSelect(q.text)}
          className={cn(
            'flex items-center gap-2 rounded-2xl bg-white px-3 py-3 text-left text-xs font-medium shadow-sm transition-all active:scale-[0.97]',
            'text-gray-600 dark:bg-brand-surface dark:text-gray-300'
          )}
        >
          <span className="text-lg">{q.emoji}</span>
          <span>{q.text}</span>
        </button>
      ))}
    </div>
  );
}