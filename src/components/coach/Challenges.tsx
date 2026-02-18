// src/components/coach/Challenges.tsx
'use client';

import { useState, useEffect } from 'react';
import {
  Trophy,
  Calendar,
  Play,
  Check,
  Flame,
  Users,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useAuthStore } from '@/store/authStore';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { format, differenceInDays, addDays } from 'date-fns';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

interface Challenge {
  id: string;
  name: string;
  emoji: string;
  description: string;
  duration: number;
  category: string;
  dailyTargets: string[];
  rules: string[];
}

const challenges: Challenge[] = [
  {
    id: 'c1', name: '30-Day Push-Up Challenge', emoji: '💪', description: 'Progressive push-up challenge. Start easy, end strong.', duration: 30, category: 'Strength',
    dailyTargets: ['Day 1-5: 10 push-ups', 'Day 6-10: 15 push-ups', 'Day 11-15: 20 push-ups', 'Day 16-20: 25 push-ups', 'Day 21-25: 30 push-ups', 'Day 26-30: 35+ push-ups'],
    rules: ['Complete the target number daily', 'Can be split into sets', 'Any push-up variation counts', 'Rest day = still do minimum 10'],
  },
  {
    id: 'c2', name: '30-Day Ab Challenge', emoji: '🔥', description: 'Build core strength and definition with daily ab work.', duration: 30, category: 'Core',
    dailyTargets: ['Week 1: 3 exercises × 15 reps', 'Week 2: 3 exercises × 20 reps', 'Week 3: 4 exercises × 20 reps', 'Week 4: 4 exercises × 25 reps'],
    rules: ['Mix of crunches, planks, leg raises', 'Hold planks for progressively longer', 'Core work after main workout or standalone'],
  },
  {
    id: 'c3', name: '7-Day Step Challenge', emoji: '👟', description: 'Hit increasing step targets each day for a full week.', duration: 7, category: 'Cardio',
    dailyTargets: ['Day 1: 8,000 steps', 'Day 2: 9,000 steps', 'Day 3: 10,000 steps', 'Day 4: 11,000 steps', 'Day 5: 12,000 steps', 'Day 6: 13,000 steps', 'Day 7: 15,000 steps'],
    rules: ['All steps count — walks, errands, etc.', 'Track with your phone or watch', 'Take the stairs whenever possible'],
  },
  {
    id: 'c4', name: '14-Day Clean Eating', emoji: '🥗', description: 'No processed food for 2 weeks. Whole foods only.', duration: 14, category: 'Nutrition',
    dailyTargets: ['Eat only whole, unprocessed foods', 'No added sugar', 'No fast food or takeout', 'Cook at least 2 meals daily'],
    rules: ['Whole foods: meat, fish, eggs, vegetables, fruits, grains, nuts', 'No: chips, cookies, candy, soda, fast food', 'Allowed: minimal condiments and seasonings', '1 slip-up = restart the day count'],
  },
  {
    id: 'c5', name: '7-Day Water Challenge', emoji: '💧', description: 'Drink at least 10 glasses of water every day for a week.', duration: 7, category: 'Hydration',
    dailyTargets: ['Drink 10+ glasses (2.5L) daily', 'Start with a glass upon waking', 'Drink before every meal', 'Carry a water bottle all day'],
    rules: ['Water, sparkling water, and herbal tea count', 'Coffee/tea count for half', 'Track every glass in the app'],
  },
  {
    id: 'c6', name: '30-Day Consistency Challenge', emoji: '📊', description: 'Log EVERYTHING for 30 days straight. Build the tracking habit.', duration: 30, category: 'Consistency',
    dailyTargets: ['Log all meals', 'Log water intake', 'Complete planned workout', 'Log weight (weekly)', 'Do daily wellness check-in'],
    rules: ['Must log at least 3/5 daily tasks', 'Streak breaks if you miss a full day', 'Use the app for all tracking'],
  },
];

interface ChallengeProgress {
  challengeId: string;
  startDate: string;
  completedDays: string[];
  status: 'active' | 'completed' | 'abandoned';
}

export default function Challenges() {
  const { user } = useAuthStore();
  const [activeChallenge, setActiveChallenge] = useState<ChallengeProgress | null>(null);
  const [completedChallenges, setCompletedChallenges] = useState<string[]>([]);
  const [expandedChallenge, setExpandedChallenge] = useState<string | null>(null);

  useEffect(() => {
    if (user) loadChallenges();
  }, [user]);

  const loadChallenges = async () => {
    if (!user) return;
    try {
      const challengeDoc = await getDoc(doc(db, 'users', user.uid, 'challenges', 'current'));
      if (challengeDoc.exists()) {
        const data = challengeDoc.data();
        if (data.active) setActiveChallenge(data.active);
        if (data.completed) setCompletedChallenges(data.completed);
      }
    } catch (err) { console.error(err); }
  };

  const joinChallenge = async (challengeId: string) => {
    if (!user) return;
    const progress: ChallengeProgress = {
      challengeId,
      startDate: format(new Date(), 'yyyy-MM-dd'),
      completedDays: [],
      status: 'active',
    };

    setActiveChallenge(progress);

    try {
      await setDoc(doc(db, 'users', user.uid, 'challenges', 'current'), {
        active: progress,
        completed: completedChallenges,
      }, { merge: true });
      toast.success('Challenge joined! Let\'s go! 🚀');
    } catch (err) { console.error(err); }
  };

  const checkInToday = async () => {
    if (!user || !activeChallenge) return;
    const today = format(new Date(), 'yyyy-MM-dd');

    if (activeChallenge.completedDays.includes(today)) return;

    const updated = {
      ...activeChallenge,
      completedDays: [...activeChallenge.completedDays, today],
    };

    const challenge = challenges.find((c) => c.id === activeChallenge.challengeId);
    if (challenge && updated.completedDays.length >= challenge.duration) {
      updated.status = 'completed';
      const newCompleted = [...completedChallenges, activeChallenge.challengeId];
      setCompletedChallenges(newCompleted);
      setActiveChallenge(null);

      await setDoc(doc(db, 'users', user.uid, 'challenges', 'current'), {
        active: null,
        completed: newCompleted,
      });

      toast.success(`🏆 Challenge completed: ${challenge.name}!`);
      return;
    }

    setActiveChallenge(updated);

    await setDoc(doc(db, 'users', user.uid, 'challenges', 'current'), {
      active: updated,
      completed: completedChallenges,
    }, { merge: true });

    toast.success('Day checked in! ✅');
  };

  const today = format(new Date(), 'yyyy-MM-dd');
  const activeChallengeData = activeChallenge
    ? challenges.find((c) => c.id === activeChallenge.challengeId)
    : null;

  const daysCompleted = activeChallenge?.completedDays.length || 0;
  const totalDays = activeChallengeData?.duration || 0;
  const isDoneToday = activeChallenge?.completedDays.includes(today) || false;

  return (
    <div className="space-y-4">
      {/* Active Challenge */}
      {activeChallenge && activeChallengeData && (
        <Card className="border-2 border-brand-purple dark:border-brand-lavender">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase text-brand-purple dark:text-brand-lavender">
                Active Challenge
              </span>
              <h3 className="mt-1 font-heading text-base font-bold text-brand-dark dark:text-brand-white">
                {activeChallengeData.emoji} {activeChallengeData.name}
              </h3>
            </div>
            <div className="text-right">
              <p className="text-2xl font-extrabold text-brand-purple dark:text-brand-lavender">
                {daysCompleted}/{totalDays}
              </p>
              <p className="text-[10px] text-gray-400">days</p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-3 h-3 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
            <div
              className="h-full rounded-full bg-brand-purple transition-all dark:bg-brand-lavender"
              style={{ width: `${(daysCompleted / totalDays) * 100}%` }}
            />
          </div>

          {/* Day chain */}
          <div className="mt-3 flex flex-wrap gap-1">
            {Array.from({ length: totalDays }).map((_, i) => {
              const dayDate = format(addDays(new Date(activeChallenge.startDate), i), 'yyyy-MM-dd');
              const done = activeChallenge.completedDays.includes(dayDate);
              const isToday = dayDate === today;

              return (
                <div
                  key={i}
                  className={cn(
                    'flex h-6 w-6 items-center justify-center rounded text-[8px] font-bold',
                    done ? 'bg-green-500 text-white' :
                    isToday ? 'bg-brand-purple/20 text-brand-purple ring-1 ring-brand-purple dark:ring-brand-lavender' :
                    'bg-gray-100 text-gray-400 dark:bg-gray-700'
                  )}
                >
                  {done ? '✓' : i + 1}
                </div>
              );
            })}
          </div>

          <Button
            onClick={checkInToday}
            variant="primary"
            fullWidth
            className="mt-4"
            disabled={isDoneToday}
          >
            {isDoneToday ? (
              <>
                <Check className="mr-2 h-4 w-4" />
                Done for Today!
              </>
            ) : (
              <>
                <Flame className="mr-2 h-4 w-4" />
                Check In Today
              </>
            )}
          </Button>
        </Card>
      )}

      {/* Available Challenges */}
      <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400">
        {activeChallenge ? 'Other Challenges' : 'Choose a Challenge'}
      </h3>

      {challenges.map((challenge) => {
        const isActive = activeChallenge?.challengeId === challenge.id;
        const isCompleted = completedChallenges.includes(challenge.id);
        const isExpanded = expandedChallenge === challenge.id;

        if (isActive) return null;

        return (
          <Card key={challenge.id} padding="sm">
            <button
              onClick={() => setExpandedChallenge(isExpanded ? null : challenge.id)}
              className="flex w-full items-center justify-between px-1 py-1"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{challenge.emoji}</span>
                <div className="text-left">
                  <h3 className="text-sm font-bold text-brand-dark dark:text-brand-white">
                    {challenge.name}
                  </h3>
                  <div className="flex items-center gap-2 text-[10px] text-gray-400">
                    <span><Calendar className="mr-0.5 inline h-3 w-3" />{challenge.duration} days</span>
                    <span>{challenge.category}</span>
                    {isCompleted && (
                      <span className="rounded-full bg-green-100 px-1.5 py-0.5 font-bold text-green-600 dark:bg-green-900/30 dark:text-green-400">
                        ✅ Done
                      </span>
                    )}
                  </div>
                </div>
              </div>
              {isExpanded ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
            </button>

            {isExpanded && (
              <div className="mt-3 space-y-3 px-1">
                <p className="text-xs text-gray-600 dark:text-gray-400">{challenge.description}</p>

                <div>
                  <p className="mb-1 text-[10px] font-bold uppercase text-gray-400">Daily Targets</p>
                  <ul className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
                    {challenge.dailyTargets.map((t, i) => (
                      <li key={i} className="flex gap-2">
                        <span className="text-brand-purple dark:text-brand-lavender">•</span> {t}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <p className="mb-1 text-[10px] font-bold uppercase text-gray-400">Rules</p>
                  <ul className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
                    {challenge.rules.map((r, i) => (
                      <li key={i} className="flex gap-2">
                        <span className="text-gray-400">•</span> {r}
                      </li>
                    ))}
                  </ul>
                </div>

                {!activeChallenge && !isCompleted && (
                  <Button
                    onClick={() => joinChallenge(challenge.id)}
                    variant="primary"
                    fullWidth
                    size="sm"
                  >
                    <Play className="mr-2 h-4 w-4" />
                    Join Challenge
                  </Button>
                )}

                {isCompleted && (
                  <Button
                    onClick={() => joinChallenge(challenge.id)}
                    variant="outline"
                    fullWidth
                    size="sm"
                  >
                    <Trophy className="mr-2 h-4 w-4" />
                    Do It Again
                  </Button>
                )}

                {activeChallenge && !isActive && (
                  <p className="text-center text-[10px] text-gray-400">
                    Finish your current challenge first
                  </p>
                )}
              </div>
            )}
          </Card>
        );
      })}

      {/* Completed Count */}
      {completedChallenges.length > 0 && (
        <Card padding="sm">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs text-gray-500">Challenges Completed</span>
            <span className="flex items-center gap-1 text-sm font-bold text-brand-purple dark:text-brand-lavender">
              <Trophy className="h-4 w-4" /> {completedChallenges.length}
            </span>
          </div>
        </Card>
      )}
    </div>
  );
}