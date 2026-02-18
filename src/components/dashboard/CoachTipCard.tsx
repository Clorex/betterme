// src/components/dashboard/CoachTipCard.tsx
'use client';

import { useRouter } from 'next/navigation';
import { Bot, ArrowRight } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';

const fallbackTips = [
  "You've been consistent this week! Keep up the momentum. 🔥",
  "Try adding more vegetables to your meals today for extra fiber and nutrients. 🥗",
  "Remember to stretch after your workout. Recovery is key to progress! 🧘",
  "Drinking water before meals can help control hunger. Stay hydrated! 💧",
  "Getting enough sleep? Poor sleep can slow your progress. Aim for 7-9 hours. 😴",
  "Don't skip your protein! It helps muscle recovery and keeps you full longer. 💪",
  "Try taking a 10-minute walk after meals. It aids digestion and burns extra calories. 🚶",
  "You're stronger than you think. Push through that last set! 🏋️",
];

export default function CoachTipCard() {
  const router = useRouter();
  const { userProfile } = useAuthStore();
  const [tip, setTip] = useState('');

  useEffect(() => {
    // Use day of year for consistent daily tip
    const dayOfYear = Math.floor(
      (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
    );
    setTip(fallbackTips[dayOfYear % fallbackTips.length]);
  }, []);

  return (
    <Card>
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl bg-brand-lavender/20 dark:bg-brand-lavender/10">
          <Bot className="h-5 w-5 text-brand-purple dark:text-brand-lavender" />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-bold text-brand-dark dark:text-brand-white">
            AI Coach Tip
          </h3>
          <p className="mt-1 text-sm leading-relaxed text-gray-600 dark:text-gray-300">
            {tip}
          </p>
        </div>
      </div>

      <Button
        onClick={() => router.push('/coach')}
        variant="ghost"
        size="sm"
        className="mt-3 w-full justify-center"
      >
        Chat with Coach
        <ArrowRight className="ml-1.5 h-4 w-4" />
      </Button>
    </Card>
  );
}