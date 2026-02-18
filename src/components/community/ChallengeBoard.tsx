'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Trophy, Clock, Users, CheckCircle2,
  ChevronRight, Flame, Loader2, Target
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import {
  collection, doc, getDoc, getDocs, setDoc,
  updateDoc, query, where, serverTimestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import toast from 'react-hot-toast';

interface Challenge {
  id: string;
  name: string;
  description: string;
  emoji: string;
  type: 'abs' | 'pushup' | 'squat' | 'steps' | 'clean_eating' | 'water' | 'consistency';
  duration: number; // days
  dailyTargets: number[];
  unit: string;
  difficulty: 'easy' | 'medium' | 'hard';
  participants: number;
}

const challenges: Challenge[] = [
  {
    id: 'abs-30',
    name: '30-Day Ab Challenge',
    description: 'Build a stronger core in 30 days with progressive difficulty',
    emoji: '🏆',
    type: 'abs',
    duration: 30,
    dailyTargets: Array.from({ length: 30 }, (_, i) => 20 + i * 5),
    unit: 'crunches',
    difficulty: 'medium',
    participants: 0,
  },
  {
    id: 'pushup-30',
    name: '30-Day Push-up Challenge',
    description: 'From 10 to 100 push-ups. Can you do it?',
    emoji: '💪',
    type: 'pushup',
    duration: 30,
    dailyTargets: Array.from({ length: 30 }, (_, i) => 10 + i * 3),
    unit: 'push-ups',
    difficulty: 'hard',
    participants: 0,
  },
  {
    id: 'squat-30',
    name: '30-Day Squat Challenge',
    description: 'Build stronger legs with daily squats',
    emoji: '🦵',
    type: 'squat',
    duration: 30,
    dailyTargets: Array.from({ length: 30 }, (_, i) => 30 + i * 5),
    unit: 'squats',
    difficulty: 'medium',
    participants: 0,
  },
  {
    id: 'steps-7',
    name: '7-Day Step Challenge',
    description: 'Walk more each day. Start at 5K, end at 15K steps!',
    emoji: '👟',
    type: 'steps',
    duration: 7,
    dailyTargets: [5000, 6500, 8000, 9500, 11000, 13000, 15000],
    unit: 'steps',
    difficulty: 'easy',
    participants: 0,
  },
  {
    id: 'clean-14',
    name: '14-Day Clean Eating',
    description: 'Two weeks of whole foods, no processed junk',
    emoji: '🥗',
    type: 'clean_eating',
    duration: 14,
    dailyTargets: Array(14).fill(1),
    unit: 'day completed',
    difficulty: 'medium',
    participants: 0,
  },
  {
    id: 'water-7',
    name: '7-Day Water Challenge',
    description: 'Hit your water goal every day for a week',
    emoji: '💧',
    type: 'water',
    duration: 7,
    dailyTargets: Array(7).fill(8),
    unit: 'glasses',
    difficulty: 'easy',
    participants: 0,
  },
  {
    id: 'consistency-30',
    name: '30-Day Consistency',
    description: 'Log everything for 30 days straight. No excuses!',
    emoji: '🔥',
    type: 'consistency',
    duration: 30,
    dailyTargets: Array(30).fill(1),
    unit: 'day tracked',
    difficulty: 'hard',
    participants: 0,
  },
];

const difficultyColors = {
  easy: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  hard: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

export default function ChallengeBoard() {
  const { user } = useAuthStore();
  const [activeChallenges, setActiveChallenges] = useState<
    { challengeId: string; startDate: any; completedDays: number[]; }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);

  useEffect(() => {
    loadActiveChallenges();
  }, [user]);

  const loadActiveChallenges = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const q = query(
        collection(db, 'users', user.uid, 'challenges'),
        where('status', '==', 'active')
      );
      const snapshot = await getDocs(q);
      setActiveChallenges(
        snapshot.docs.map((doc) => ({
          challengeId: doc.id,
          ...doc.data(),
        })) as any[]
      );
    } catch (error) {
      console.error('Error loading challenges:', error);
    } finally {
      setLoading(false);
    }
  };

  const joinChallenge = async (challenge: Challenge) => {
    if (!user) return;

    try {
      await setDoc(doc(db, 'users', user.uid, 'challenges', challenge.id), {
        challengeId: challenge.id,
        startDate: serverTimestamp(),
        completedDays: [],
        status: 'active',
      });

      setActiveChallenges((prev) => [
        ...prev,
        { challengeId: challenge.id, startDate: new Date(), completedDays: [] },
      ]);

      toast.success(`Joined "${challenge.name}"! Let\'s go! 🎉`);
    } catch (error) {
      toast.error('Failed to join challenge');
    }
  };

  const completeDay = async (challengeId: string, dayNum: number) => {
    if (!user) return;

    try {
      const challengeRef = doc(db, 'users', user.uid, 'challenges', challengeId);
      const challengeSnap = await getDoc(challengeRef);

      if (challengeSnap.exists()) {
        const data = challengeSnap.data();
        const completedDays = data.completedDays || [];

        if (!completedDays.includes(dayNum)) {
          completedDays.push(dayNum);
          await updateDoc(challengeRef, { completedDays });

          // Check if challenge is complete
          const challenge = challenges.find((c) => c.id === challengeId);
          if (challenge && completedDays.length >= challenge.duration) {
            await updateDoc(challengeRef, { status: 'completed' });
            toast.success(`🏆 Challenge complete! Amazing job!`);
          } else {
            toast.success(`Day ${dayNum} complete! 💪`);
          }

          setActiveChallenges((prev) =>
            prev.map((ac) =>
              ac.challengeId === challengeId
                ? { ...ac, completedDays }
                : ac
            )
          );
        }
      }
    } catch (error) {
      toast.error('Failed to update challenge');
    }
  };

  const isJoined = (challengeId: string) =>
    activeChallenges.some((ac) => ac.challengeId === challengeId);

  const getProgress = (challengeId: string) => {
    const active = activeChallenges.find((ac) => ac.challengeId === challengeId);
    if (!active) return 0;
    const challenge = challenges.find((c) => c.id === challengeId);
    if (!challenge) return 0;
    return Math.round((active.completedDays.length / challenge.duration) * 100);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 size={32} className="animate-spin text-brand-purple" />
      </div>
    );
  }

  return (
    <div className="p-4 pb-8">
      {/* Active Challenges */}
      {activeChallenges.length > 0 && (
        <div className="mb-6">
          <h3 className="font-bold text-brand-dark dark:text-brand-white mb-3 flex items-center gap-2">
            <Flame size={18} className="text-orange-500" />
            Active Challenges
          </h3>
          <div className="space-y-3">
            {activeChallenges.map((ac) => {
              const challenge = challenges.find((c) => c.id === ac.challengeId);
              if (!challenge) return null;

              const progress = getProgress(challenge.id);
              const currentDay = ac.completedDays.length + 1;
              const todayTarget = challenge.dailyTargets[currentDay - 1] || 0;

              return (
                <motion.div
                  key={ac.challengeId}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-gradient-to-r from-brand-purple/10 to-brand-lavender/10 dark:from-brand-purple/20 dark:to-brand-lavender/20 rounded-2xl p-4 border border-brand-lavender/20"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{challenge.emoji}</span>
                      <div>
                        <h4 className="font-semibold text-sm text-brand-dark dark:text-brand-white">
                          {challenge.name}
                        </h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Day {currentDay} of {challenge.duration}
                        </p>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-brand-purple">
                      {progress}%
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full h-2 bg-white/50 dark:bg-gray-800 rounded-full mb-3">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      className="h-full bg-brand-purple rounded-full"
                    />
                  </div>

                  {/* Today's target */}
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-600 dark:text-gray-300">
                      Today: <span className="font-semibold">{todayTarget} {challenge.unit}</span>
                    </p>
                    {!ac.completedDays.includes(currentDay) ? (
                      <button
                        onClick={() => completeDay(challenge.id, currentDay)}
                        className="px-3 py-1.5 bg-brand-purple text-white rounded-full text-xs font-semibold"
                      >
                        Complete Day ✓
                      </button>
                    ) : (
                      <span className="flex items-center gap-1 text-xs text-green-600 font-medium">
                        <CheckCircle2 size={14} />
                        Done!
                      </span>
                    )}
                  </div>

                  {/* Day dots */}
                  <div className="flex flex-wrap gap-1 mt-3">
                    {Array.from({ length: Math.min(challenge.duration, 30) }, (_, i) => i + 1).map(
                      (day) => (
                        <div
                          key={day}
                          className={`w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold ${
                            ac.completedDays.includes(day)
                              ? 'bg-brand-purple text-white'
                              : day === currentDay
                              ? 'bg-brand-lavender/30 text-brand-purple border border-brand-purple'
                              : 'bg-gray-100 dark:bg-gray-800 text-gray-400'
                          }`}
                        >
                          {ac.completedDays.includes(day) ? '✓' : day}
                        </div>
                      )
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* Available Challenges */}
      <h3 className="font-bold text-brand-dark dark:text-brand-white mb-3 flex items-center gap-2">
        <Trophy size={18} className="text-brand-purple" />
        Available Challenges
      </h3>

      <div className="space-y-3">
        {challenges.map((challenge, index) => {
          const joined = isJoined(challenge.id);

          return (
            <motion.div
              key={challenge.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white dark:bg-brand-surface rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-4"
            >
              <div className="flex items-start gap-3">
                <div className="text-3xl">{challenge.emoji}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-sm text-brand-dark dark:text-brand-white">
                      {challenge.name}
                    </h4>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                        difficultyColors[challenge.difficulty]
                      }`}
                    >
                      {challenge.difficulty}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                    {challenge.description}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                      <Clock size={12} />
                      {challenge.duration} days
                    </span>
                    <span className="flex items-center gap-1">
                      <Users size={12} />
                      {challenge.participants} joined
                    </span>
                  </div>
                </div>

                {joined ? (
                  <span className="flex items-center gap-1 text-xs text-green-600 bg-green-50 dark:bg-green-900/20 px-3 py-1.5 rounded-full font-medium">
                    <CheckCircle2 size={12} />
                    Joined
                  </span>
                ) : (
                  <button
                    onClick={() => joinChallenge(challenge)}
                    className="px-4 py-2 bg-brand-purple text-white rounded-full text-xs font-semibold hover:bg-brand-purple/90 transition-colors"
                  >
                    Join
                  </button>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}