// src/components/nutrition/FastingTimer.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Play, Pause, RotateCcw, Clock, Zap, Brain, Flame } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { motion } from 'framer-motion';

const protocols = [
  { id: '16:8', fastHours: 16, eatHours: 8, label: '16:8', desc: '16hr fast, 8hr eat' },
  { id: '18:6', fastHours: 18, eatHours: 6, label: '18:6', desc: '18hr fast, 6hr eat' },
  { id: '20:4', fastHours: 20, eatHours: 4, label: '20:4', desc: '20hr fast, 4hr eat' },
  { id: 'omad', fastHours: 23, eatHours: 1, label: 'OMAD', desc: '23hr fast, 1hr eat' },
];

const stages = [
  { minHours: 0, maxHours: 4, label: 'Fed State', emoji: '🍽️', color: 'text-green-500', desc: 'Digesting food, insulin elevated' },
  { minHours: 4, maxHours: 8, label: 'Fat Burning Begins', emoji: '🔥', color: 'text-orange-500', desc: 'Blood sugar drops, body starts using fat' },
  { minHours: 8, maxHours: 12, label: 'Fat Burning Zone', emoji: '🔥🔥', color: 'text-orange-600', desc: 'Actively burning fat stores' },
  { minHours: 12, maxHours: 16, label: 'Ketosis Begins', emoji: '⚡', color: 'text-yellow-500', desc: 'Body producing ketones for fuel' },
  { minHours: 16, maxHours: 24, label: 'Autophagy', emoji: '🧬', color: 'text-purple-500', desc: 'Cells cleaning damaged components' },
  { minHours: 24, maxHours: 999, label: 'Deep Autophagy', emoji: '🧬🧬', color: 'text-brand-purple', desc: 'Deeper cellular renewal' },
];

export default function FastingTimer() {
  const { user } = useAuthStore();
  const [selectedProtocol, setSelectedProtocol] = useState(protocols[0]);
  const [isFasting, setIsFasting] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [elapsed, setElapsed] = useState(0); // seconds
  const [fastHistory, setFastHistory] = useState<{ start: string; end: string; hours: number }[]>([]);

  const totalFastSeconds = selectedProtocol.fastHours * 3600;
  const fastProgress = Math.min((elapsed / totalFastSeconds) * 100, 100);
  const elapsedHours = elapsed / 3600;

  const currentStage = stages.find(
    (s) => elapsedHours >= s.minHours && elapsedHours < s.maxHours
  ) || stages[0];

  // Load fasting state
  useEffect(() => {
    if (!user) return;
    loadFastState();
  }, [user]);

  // Timer
  useEffect(() => {
    if (!isFasting || !startTime) return;
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime.getTime()) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [isFasting, startTime]);

  const loadFastState = async () => {
    if (!user) return;
    try {
      const fastDoc = await getDoc(doc(db, 'users', user.uid, 'fasting', 'current'));
      if (fastDoc.exists()) {
        const data = fastDoc.data();
        if (data.isFasting && data.startTime) {
          const start = new Date(data.startTime);
          setStartTime(start);
          setIsFasting(true);
          setElapsed(Math.floor((Date.now() - start.getTime()) / 1000));
        }
        if (data.protocol) {
          const p = protocols.find((pr) => pr.id === data.protocol);
          if (p) setSelectedProtocol(p);
        }
        if (data.history) setFastHistory(data.history.slice(-10));
      }
    } catch (err) {
      console.error('Error loading fast state:', err);
    }
  };

  const saveFastState = async (fasting: boolean, start: Date | null) => {
    if (!user) return;
    try {
      await setDoc(doc(db, 'users', user.uid, 'fasting', 'current'), {
        isFasting: fasting,
        startTime: start?.toISOString() || null,
        protocol: selectedProtocol.id,
        history: fastHistory,
        updatedAt: new Date().toISOString(),
      }, { merge: true });
    } catch (err) {
      console.error('Error saving fast state:', err);
    }
  };

  const startFast = () => {
    const now = new Date();
    setStartTime(now);
    setIsFasting(true);
    setElapsed(0);
    saveFastState(true, now);
  };

  const stopFast = () => {
    const hours = elapsed / 3600;
    const newHistory = [
      ...fastHistory,
      {
        start: startTime!.toISOString(),
        end: new Date().toISOString(),
        hours: parseFloat(hours.toFixed(1)),
      },
    ].slice(-10);

    setFastHistory(newHistory);
    setIsFasting(false);
    setStartTime(null);
    setElapsed(0);
    saveFastState(false, null);
  };

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const remaining = Math.max(totalFastSeconds - elapsed, 0);

  return (
    <div className="space-y-4">
      {/* Protocol Selector */}
      {!isFasting && (
        <Card>
          <h3 className="mb-3 text-sm font-bold text-gray-500 dark:text-gray-400">
            Fasting Protocol
          </h3>
          <div className="grid grid-cols-4 gap-2">
            {protocols.map((p) => (
              <button
                key={p.id}
                onClick={() => setSelectedProtocol(p)}
                className={cn(
                  'rounded-xl py-3 text-center transition-all',
                  selectedProtocol.id === p.id
                    ? 'bg-brand-purple text-white dark:bg-brand-lavender dark:text-brand-dark'
                    : 'bg-gray-100 text-gray-600 dark:bg-brand-surface dark:text-gray-400'
                )}
              >
                <p className="text-sm font-bold">{p.label}</p>
                <p className="mt-0.5 text-[9px] opacity-70">{p.desc}</p>
              </button>
            ))}
          </div>
        </Card>
      )}

      {/* Timer Display */}
      <Card>
        <div className="py-4 text-center">
          {/* Status */}
          <div
            className={cn(
              'mx-auto mb-4 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-bold',
              isFasting
                ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                : 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
            )}
          >
            <span className={cn('h-2 w-2 rounded-full', isFasting ? 'bg-red-500 animate-pulse' : 'bg-green-500')}>
            </span>
            {isFasting ? '🔴 FASTING' : '🟢 EATING WINDOW'}
          </div>

          {/* Circular Timer */}
          <div className="relative mx-auto mb-4 h-48 w-48">
            <svg className="h-full w-full -rotate-90" viewBox="0 0 200 200">
              <circle cx="100" cy="100" r="88" fill="none" stroke="currentColor" strokeWidth="8" className="text-gray-200 dark:text-gray-700" />
              <circle
                cx="100"
                cy="100"
                r="88"
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={553}
                strokeDashoffset={553 - (553 * fastProgress) / 100}
                className={cn(
                  'transition-all duration-1000',
                  isFasting ? 'text-brand-purple dark:text-brand-lavender' : 'text-green-500'
                )}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold tabular-nums text-brand-dark dark:text-brand-white">
                {formatTime(isFasting ? elapsed : 0)}
              </span>
              <span className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {isFasting ? `${formatTime(remaining)} remaining` : 'Ready to start'}
              </span>
            </div>
          </div>

          {/* Control Button */}
          {isFasting ? (
            <Button onClick={stopFast} variant="danger" size="lg">
              <Pause className="mr-2 h-5 w-5" />
              End Fast
            </Button>
          ) : (
            <Button onClick={startFast} variant="primary" size="lg">
              <Play className="mr-2 h-5 w-5" />
              Start {selectedProtocol.label} Fast
            </Button>
          )}
        </div>
      </Card>

      {/* Current Stage */}
      {isFasting && (
        <Card>
          <h3 className="mb-3 text-sm font-bold text-gray-500 dark:text-gray-400">
            Current Stage
          </h3>
          <div className="flex items-center gap-3">
            <span className="text-3xl">{currentStage.emoji}</span>
            <div>
              <p className={cn('text-sm font-bold', currentStage.color)}>
                {currentStage.label}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {currentStage.desc}
              </p>
            </div>
          </div>

          {/* Stages timeline */}
          <div className="mt-4 space-y-2">
            {stages.slice(0, 5).map((stage, idx) => {
              const isReached = elapsedHours >= stage.minHours;
              const isCurrent = elapsedHours >= stage.minHours && elapsedHours < stage.maxHours;
              return (
                <div
                  key={idx}
                  className={cn(
                    'flex items-center gap-3 rounded-xl px-3 py-2 transition-all',
                    isCurrent
                      ? 'bg-brand-lavender/10 dark:bg-brand-lavender/5'
                      : ''
                  )}
                >
                  <span className={cn('text-lg', !isReached && 'grayscale opacity-40')}>
                    {stage.emoji}
                  </span>
                  <div className="flex-1">
                    <p className={cn(
                      'text-xs font-semibold',
                      isReached ? 'text-brand-dark dark:text-brand-white' : 'text-gray-400'
                    )}>
                      {stage.label}
                    </p>
                    <p className="text-[10px] text-gray-400">{stage.minHours}h+</p>
                  </div>
                  {isReached && (
                    <span className="text-xs font-bold text-green-500">✓</span>
                  )}
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* History */}
      {fastHistory.length > 0 && (
        <Card>
          <h3 className="mb-3 text-sm font-bold text-gray-500 dark:text-gray-400">
            Recent Fasts
          </h3>
          <div className="space-y-2">
            {fastHistory.slice().reverse().slice(0, 5).map((fast, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between rounded-xl bg-gray-50 px-3 py-2.5 dark:bg-brand-surface/50"
              >
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(fast.start).toLocaleDateString()}
                  </p>
                </div>
                <span className={cn(
                  'rounded-full px-2 py-0.5 text-xs font-bold',
                  fast.hours >= selectedProtocol.fastHours
                    ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
                    : 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400'
                )}>
                  {fast.hours}h
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}