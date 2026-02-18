'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Trophy, Dumbbell, Target, Footprints,
  Flame, TrendingDown, Loader2, Medal
} from 'lucide-react';
import { useLeaderboards } from '@/hooks/useCommunity';
import { useAuthStore } from '@/store/authStore';

const categories = [
  { id: 'workouts', label: 'Workouts', icon: Dumbbell, emoji: '🏋️' },
  { id: 'streaks', label: 'Streaks', icon: Flame, emoji: '🔥' },
  { id: 'steps', label: 'Steps', icon: Footprints, emoji: '👟' },
  { id: 'calories', label: 'Cal Adherence', icon: Target, emoji: '🎯' },
  { id: 'weightLoss', label: 'Weight Loss', icon: TrendingDown, emoji: '⚖️' },
];

const rankMedals = ['🥇', '🥈', '🥉'];

export default function Leaderboards() {
  const { user } = useAuthStore();
  const { leaderboards, loading, fetchLeaderboards } = useLeaderboards();
  const [activeCategory, setActiveCategory] = useState('workouts');

  useEffect(() => {
    fetchLeaderboards();
  }, []);

  const currentLeaderboard =
    leaderboards[activeCategory as keyof typeof leaderboards] || [];

  const myRank = currentLeaderboard.findIndex(
    (entry) => entry.userId === user?.uid
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 size={32} className="animate-spin text-brand-purple" />
      </div>
    );
  }

  return (
    <div className="p-4 pb-8">
      {/* Header */}
      <div className="text-center mb-4">
        <h2 className="text-lg font-bold text-brand-dark dark:text-brand-white">
          Weekly Rankings
        </h2>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Resets every Monday. Compete with the community!
        </p>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide mb-6 pb-1">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
              activeCategory === cat.id
                ? 'bg-brand-purple text-white'
                : 'bg-gray-100 dark:bg-brand-surface text-gray-600 dark:text-gray-400'
            }`}
          >
            <span>{cat.emoji}</span>
            {cat.label}
          </button>
        ))}
      </div>

      {/* Top 3 Podium */}
      {currentLeaderboard.length >= 3 ? (
        <div className="flex items-end justify-center gap-3 mb-6 h-36">
          {/* 2nd place */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="flex flex-col items-center"
          >
            <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden mb-1 border-2 border-gray-300">
              {currentLeaderboard[1]?.userPhoto ? (
                <img
                  src={currentLeaderboard[1].userPhoto}
                  alt=""
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-sm font-bold text-gray-500">
                  {currentLeaderboard[1]?.userName?.charAt(0)}
                </div>
              )}
            </div>
            <p className="text-xs font-medium text-brand-dark dark:text-brand-white truncate max-w-[70px]">
              {currentLeaderboard[1]?.userName}
            </p>
            <p className="text-xs text-gray-500">{currentLeaderboard[1]?.value}</p>
            <div className="w-16 h-20 bg-gray-200 dark:bg-gray-700 rounded-t-xl flex items-center justify-center mt-1">
              <span className="text-2xl">🥈</span>
            </div>
          </motion.div>

          {/* 1st place */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="flex flex-col items-center"
          >
            <div className="w-14 h-14 rounded-full bg-yellow-100 dark:bg-yellow-900/30 overflow-hidden mb-1 border-2 border-yellow-400">
              {currentLeaderboard[0]?.userPhoto ? (
                <img
                  src={currentLeaderboard[0].userPhoto}
                  alt=""
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-sm font-bold text-yellow-600">
                  {currentLeaderboard[0]?.userName?.charAt(0)}
                </div>
              )}
            </div>
            <p className="text-xs font-semibold text-brand-dark dark:text-brand-white truncate max-w-[70px]">
              {currentLeaderboard[0]?.userName}
            </p>
            <p className="text-xs text-gray-500">{currentLeaderboard[0]?.value}</p>
            <div className="w-16 h-28 bg-yellow-200 dark:bg-yellow-900/40 rounded-t-xl flex items-center justify-center mt-1">
              <span className="text-3xl">🥇</span>
            </div>
          </motion.div>

          {/* 3rd place */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col items-center"
          >
            <div className="w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-900/30 overflow-hidden mb-1 border-2 border-orange-300">
              {currentLeaderboard[2]?.userPhoto ? (
                <img
                  src={currentLeaderboard[2].userPhoto}
                  alt=""
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-sm font-bold text-orange-500">
                  {currentLeaderboard[2]?.userName?.charAt(0)}
                </div>
              )}
            </div>
            <p className="text-xs font-medium text-brand-dark dark:text-brand-white truncate max-w-[70px]">
              {currentLeaderboard[2]?.userName}
            </p>
            <p className="text-xs text-gray-500">{currentLeaderboard[2]?.value}</p>
            <div className="w-16 h-14 bg-orange-200 dark:bg-orange-900/30 rounded-t-xl flex items-center justify-center mt-1">
              <span className="text-2xl">🥉</span>
            </div>
          </motion.div>
        </div>
      ) : null}

      {/* My Rank */}
      {myRank >= 0 && (
        <div className="bg-brand-lavender/20 dark:bg-brand-purple/20 rounded-2xl p-4 mb-4 border border-brand-lavender/30">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-brand-purple rounded-full flex items-center justify-center text-white font-bold text-sm">
              {myRank + 1}
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-brand-dark dark:text-brand-white">
                Your Rank
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {currentLeaderboard[myRank]?.value}{' '}
                {activeCategory === 'workouts'
                  ? 'workouts'
                  : activeCategory === 'streaks'
                  ? 'day streak'
                  : activeCategory === 'steps'
                  ? 'steps'
                  : ''}
              </p>
            </div>
            <Medal size={24} className="text-brand-purple" />
          </div>
        </div>
      )}

      {/* Full List */}
      <div className="space-y-2">
        {currentLeaderboard.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-5xl mb-3">🏆</div>
            <h3 className="font-semibold text-brand-dark dark:text-brand-white mb-1">
              No rankings yet
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Start working out and tracking to appear on the leaderboard!
            </p>
          </div>
        ) : (
          currentLeaderboard.slice(3).map((entry, index) => {
            const rank = index + 4;
            const isMe = entry.userId === user?.uid;

            return (
              <motion.div
                key={entry.userId}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.03 }}
                className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${
                  isMe
                    ? 'bg-brand-lavender/10 dark:bg-brand-purple/10 border border-brand-lavender/20'
                    : 'bg-white dark:bg-brand-surface border border-gray-100 dark:border-gray-800'
                }`}
              >
                <span className="w-6 text-center text-sm font-bold text-gray-400">
                  {rank}
                </span>
                <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden flex-shrink-0">
                  {entry.userPhoto ? (
                    <img
                      src={entry.userPhoto}
                      alt={entry.userName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs font-bold text-gray-400">
                      {entry.userName?.charAt(0)}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm font-medium truncate ${
                      isMe
                        ? 'text-brand-purple'
                        : 'text-brand-dark dark:text-brand-white'
                    }`}
                  >
                    {entry.userName} {isMe && '(You)'}
                  </p>
                </div>
                <span className="text-sm font-semibold text-gray-600 dark:text-gray-300">
                  {entry.value}
                </span>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Opt-in notice */}
      <div className="mt-6 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
        <p className="text-[11px] text-gray-500 dark:text-gray-400 text-center">
          🔒 Leaderboards are opt-in. Update your privacy settings to show/hide your ranking.
        </p>
      </div>
    </div>
  );
}