// src/components/workout/WarmupCooldown.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipForward, Check } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { cn } from '@/lib/utils';

const warmupExercises = [
  { name: 'Arm Circles', duration: 30, instructions: 'Small circles forward, then backward' },
  { name: 'Neck Rolls', duration: 20, instructions: 'Slowly roll head in circles' },
  { name: 'Leg Swings', duration: 30, instructions: 'Swing each leg forward and back' },
  { name: 'Hip Circles', duration: 30, instructions: 'Hands on hips, rotate in circles' },
  { name: 'Bodyweight Squats', duration: 30, instructions: 'Slow controlled squats, full depth' },
  { name: 'High Knees', duration: 30, instructions: 'Drive knees up alternately at moderate pace' },
  { name: 'Torso Twists', duration: 20, instructions: 'Rotate upper body left and right' },
  { name: 'Cat-Cow Stretch', duration: 30, instructions: 'On all fours, arch and round your back' },
];

const cooldownExercises = [
  { name: 'Quad Stretch', duration: 30, instructions: 'Hold each leg 15 seconds' },
  { name: 'Hamstring Stretch', duration: 30, instructions: 'Straight leg, reach for toes' },
  { name: 'Chest Doorway Stretch', duration: 30, instructions: 'Arms on doorframe, lean forward' },
  { name: 'Shoulder Cross-Body Stretch', duration: 30, instructions: 'Pull arm across body, hold' },
  { name: 'Child\'s Pose', duration: 30, instructions: 'Kneel, reach arms forward, relax' },
  { name: 'Deep Breathing', duration: 30, instructions: '4 count inhale, 4 count hold, 4 count exhale' },
];

export default function WarmupCooldown() {
  const [mode, setMode] = useState<'warmup' | 'cooldown'>('warmup');
  const [currentIdx, setCurrentIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const exercises = mode === 'warmup' ? warmupExercises : cooldownExercises;
  const current = exercises[currentIdx];

  useEffect(() => {
    if (!running) { if (intervalRef.current) clearInterval(intervalRef.current); return; }
    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (currentIdx < exercises.length - 1) {
            setCurrentIdx((i) => i + 1);
            return exercises[currentIdx + 1]?.duration || 30;
          }
          setRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [running, currentIdx, exercises]);

  const start = () => {
    setCurrentIdx(0);
    setTimeLeft(exercises[0].duration);
    setRunning(true);
  };

  const skip = () => {
    if (currentIdx < exercises.length - 1) {
      const next = currentIdx + 1;
      setCurrentIdx(next);
      setTimeLeft(exercises[next].duration);
    } else {
      setRunning(false);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="font-heading text-lg font-bold text-brand-dark dark:text-brand-white">
        {mode === 'warmup' ? '🔥 Warm-up' : '🧊 Cool-down'}
      </h2>

      <div className="flex gap-2">
        <button onClick={() => { setMode('warmup'); setRunning(false); setCurrentIdx(0); }}
          className={cn('flex-1 rounded-xl py-2.5 text-xs font-bold transition-all', mode === 'warmup' ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-500 dark:bg-brand-surface')}>
          🔥 Warm-up
        </button>
        <button onClick={() => { setMode('cooldown'); setRunning(false); setCurrentIdx(0); }}
          className={cn('flex-1 rounded-xl py-2.5 text-xs font-bold transition-all', mode === 'cooldown' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-500 dark:bg-brand-surface')}>
          🧊 Cool-down
        </button>
      </div>

      {running && current ? (
        <Card>
          <div className="py-4 text-center">
            <p className="text-xs text-gray-400">{currentIdx + 1} / {exercises.length}</p>
            <h3 className="mt-1 font-heading text-xl font-bold text-brand-dark dark:text-brand-white">{current.name}</h3>
            <p className="mt-1 text-sm text-gray-500">{current.instructions}</p>
            <p className="mt-4 font-mono text-5xl font-bold text-brand-dark dark:text-brand-white">{timeLeft}</p>
            <div className="mt-4 flex justify-center gap-3">
              <button onClick={() => setRunning(!running)} className={cn('flex h-12 w-12 items-center justify-center rounded-full', running ? 'bg-yellow-500 text-white' : 'bg-green-500 text-white')}>
                {running ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
              </button>
              <button onClick={skip} className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-200 dark:bg-brand-surface">
                <SkipForward className="h-5 w-5 text-gray-600" />
              </button>
            </div>
          </div>
        </Card>
      ) : (
        <>
          <div className="space-y-2">
            {exercises.map((ex, i) => (
              <div key={i} className="flex items-center gap-3 rounded-xl bg-white px-3 py-2.5 shadow-sm dark:bg-brand-surface">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-100 text-xs font-bold text-gray-500 dark:bg-brand-dark">{i + 1}</span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-brand-dark dark:text-brand-white">{ex.name}</p>
                  <p className="text-[10px] text-gray-400">{ex.duration}s · {ex.instructions}</p>
                </div>
              </div>
            ))}
          </div>
          <Button onClick={start} variant="primary" fullWidth>
            <Play className="mr-2 h-4 w-4" />
            Start {mode === 'warmup' ? 'Warm-up' : 'Cool-down'} ({exercises.reduce((s, e) => s + e.duration, 0 / 60)} min)
          </Button>
        </>
      )}
    </div>
  );
}