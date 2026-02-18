// src/components/coach/SupplementGuide.tsx
'use client';

import { useState } from 'react';
import { Pill, ChevronDown, ChevronUp, AlertTriangle } from 'lucide-react';
import Card from '@/components/ui/Card';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';

interface Supplement {
  name: string;
  emoji: string;
  whatItDoes: string;
  whoNeeds: string;
  dosage: string;
  when: string;
  safety: string;
  priority: 'essential' | 'recommended' | 'optional';
}

const supplements: Supplement[] = [
  { name: 'Whey Protein', emoji: '🥤', whatItDoes: 'Convenient way to hit your protein target. Fast-absorbing, ideal post-workout.', whoNeeds: 'Anyone struggling to hit protein goals through food alone.', dosage: '20-40g per serving, 1-2 scoops daily.', when: 'Post-workout or as a snack. Any time you need protein.', safety: 'Very safe. Avoid if you have dairy allergy (use plant protein instead).', priority: 'essential' },
  { name: 'Creatine Monohydrate', emoji: '💪', whatItDoes: 'Increases strength, power, and muscle size. Most researched supplement in history. Helps your muscles produce more energy during heavy lifting.', whoNeeds: 'Anyone doing resistance training, especially for strength or muscle building.', dosage: '3-5g daily. No loading phase needed.', when: 'Any time of day, with or without food. Consistency matters more than timing.', safety: 'Extremely safe. 30+ years of research. May cause minor water retention initially.', priority: 'essential' },
  { name: 'Vitamin D3', emoji: '☀️', whatItDoes: 'Supports bone health, immune function, mood, and testosterone levels. Most people are deficient, especially those indoors or in northern climates.', whoNeeds: 'Almost everyone, especially if you get less than 30min of daily sun exposure.', dosage: '2,000-5,000 IU daily.', when: 'With a meal containing fat (improves absorption).', safety: 'Very safe at recommended doses. Get levels tested if unsure.', priority: 'essential' },
  { name: 'Fish Oil (Omega-3)', emoji: '🐟', whatItDoes: 'Reduces inflammation, supports heart and brain health, may aid recovery from workouts.', whoNeeds: 'Anyone not eating fatty fish 2-3 times per week.', dosage: '1-3g of combined EPA/DHA daily.', when: 'With meals to reduce fishy burps.', safety: 'Very safe. Buy quality brands to avoid mercury contamination.', priority: 'recommended' },
  { name: 'Magnesium', emoji: '🧲', whatItDoes: 'Supports sleep quality, muscle recovery, stress reduction. Involved in 300+ bodily processes. Most people are deficient.', whoNeeds: 'Anyone with poor sleep, muscle cramps, or high stress.', dosage: '200-400mg daily (magnesium glycinate or citrate).', when: '30-60 minutes before bed for sleep benefits.', safety: 'Very safe. High doses may cause digestive issues (reduce dose).', priority: 'recommended' },
  { name: 'Caffeine', emoji: '☕', whatItDoes: 'Increases alertness, focus, and workout performance. Can boost metabolic rate by 3-11%.', whoNeeds: 'Anyone looking for an energy/performance boost. Already in coffee and tea.', dosage: '100-400mg per day. Start low to assess tolerance.', when: '30-60 min before workout. Avoid after 2pm (disrupts sleep).', safety: 'Safe for most. Can cause anxiety, insomnia if overconsumed. Build tolerance.', priority: 'optional' },
  { name: 'Multivitamin', emoji: '💊', whatItDoes: 'Insurance policy for micronutrient gaps. Doesn\'t replace real food but covers bases.', whoNeeds: 'Anyone with a restricted diet or limited food variety.', dosage: '1 daily as directed on label.', when: 'With breakfast or lunch (with food).', safety: 'Safe. Don\'t mega-dose individual vitamins without medical advice.', priority: 'optional' },
];

export default function SupplementGuide() {
  const { userProfile } = useAuthStore();
  const [expanded, setExpanded] = useState<string | null>(null);

  const goal = userProfile?.profile?.goal || '';
  const personalizedNote = goal.includes('muscle')
    ? 'Based on your muscle-building goal, Creatine and Protein are especially important for you.'
    : goal.includes('lose') || goal.includes('lean')
    ? 'Based on your fat loss goal, Protein powder can help you stay full while keeping calories low.'
    : 'Based on your goals, focus on the essentials first before adding optional supplements.';

  return (
    <div className="space-y-4">
      <Card>
        <div className="flex items-center gap-3">
          <Pill className="h-6 w-6 text-brand-purple dark:text-brand-lavender" />
          <div>
            <h2 className="font-heading text-base font-bold text-brand-dark dark:text-brand-white">
              Supplement Guide
            </h2>
            <p className="text-xs text-gray-500">Evidence-based recommendations</p>
          </div>
        </div>
        <div className="mt-3 rounded-xl bg-brand-lavender/10 p-3 dark:bg-brand-lavender/5">
          <p className="text-xs text-brand-purple dark:text-brand-lavender">
            💡 {personalizedNote}
          </p>
        </div>
      </Card>

      {/* Disclaimer */}
      <Card padding="sm">
        <div className="flex items-start gap-2 px-1">
          <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-yellow-500" />
          <p className="text-[10px] text-gray-500">
            Supplements are NOT replacements for real food. A good diet covers 90% of your needs.
            Consult a doctor before starting any supplement, especially if on medication.
          </p>
        </div>
      </Card>

      {/* Priority labels */}
      <div className="flex gap-2 text-[10px]">
        <span className="rounded-full bg-green-100 px-2 py-0.5 font-bold text-green-700 dark:bg-green-900/30 dark:text-green-400">Essential</span>
        <span className="rounded-full bg-blue-100 px-2 py-0.5 font-bold text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">Recommended</span>
        <span className="rounded-full bg-gray-100 px-2 py-0.5 font-bold text-gray-600 dark:bg-gray-800 dark:text-gray-400">Optional</span>
      </div>

      {/* Supplements */}
      {supplements.map((supp) => {
        const isExpanded = expanded === supp.name;
        const priorityColors = {
          essential: 'border-l-green-500',
          recommended: 'border-l-blue-500',
          optional: 'border-l-gray-400',
        };

        return (
          <Card key={supp.name} padding="sm" className={cn('border-l-4', priorityColors[supp.priority])}>
            <button
              onClick={() => setExpanded(isExpanded ? null : supp.name)}
              className="flex w-full items-center justify-between px-2 py-1"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{supp.emoji}</span>
                <div className="text-left">
                  <h3 className="text-sm font-bold text-brand-dark dark:text-brand-white">{supp.name}</h3>
                  <span className={cn(
                    'text-[9px] font-bold capitalize',
                    supp.priority === 'essential' ? 'text-green-600' : supp.priority === 'recommended' ? 'text-blue-600' : 'text-gray-500'
                  )}>
                    {supp.priority}
                  </span>
                </div>
              </div>
              {isExpanded ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
            </button>

            {isExpanded && (
              <div className="mt-2 space-y-3 px-2">
                <Detail label="What it does" content={supp.whatItDoes} />
                <Detail label="Who needs it" content={supp.whoNeeds} />
                <Detail label="Dosage" content={supp.dosage} />
                <Detail label="When to take" content={supp.when} />
                <Detail label="Safety" content={supp.safety} />
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}

function Detail({ label, content }: { label: string; content: string }) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase text-gray-400">{label}</p>
      <p className="text-xs text-gray-600 dark:text-gray-400">{content}</p>
    </div>
  );
}