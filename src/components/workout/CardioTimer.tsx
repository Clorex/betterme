// src/components/workout/CardioTimer.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Timer, Flame } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { cn } from '@/lib/utils';

type Mode = 'hiit' | 'tabata' | 'cardio';

export default function CardioTimer() {
  const [mode, setMode] = useState<Mode>('hiit');
  const [workTime, setWorkTime] = useState(30);
  const [restTime, setRestTime] = useState(15);
  const [rounds, setRounds] = useState(10);
  const [currentRound, setCurrentRound] = useState(0);
  const [isWork, setIsWork] = useState(true);
  const [timeLeft, setTimeLeft] = useState(0);
  const [running, setRunning] = useState(false);
  const [totalElapsed, setTotalElapsed] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Tabata preset
  useEffect(() => {
    if (mode === 'tabata') { setWorkTime(20); setRestTime(10); setRounds(8); }
  }, [mode]);

  useEffect(() => {
    if (!running) { if (intervalRef.current) clearInterval(intervalRef.current); return; }

    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (isWork) {
            setIsWork(false);
            if (navigator.vibrate) navigator.vibrate(200);
            return restTime;
          } else {
            const nextRound = currentRound + 1;
            if (nextRound >= rounds) {
              setRunning(false);
              if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
              return 0;
            }
            setCurrentRound(nextRound);
            setIsWork(true);
            if (navigator.vibrate) navigator.vibrate(100);
            return workTime;
          }
        }
        return prev - 1;
      });
      setTotalElapsed((prev) => prev + 1);
    }, 1000);

    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [running, isWork, workTime, restTime, currentRound, rounds]);

  const start = () => {
    setCurrentRound(0);
    setIsWork(true);
    setTimeLeft(workTime);
    setTotalElapsed(0);
    setRunning(true);
  };

  const toggle = () => setRunning(!running);

  const reset = () => {
    setRunning(false);
    setCurrentRound(0);
    setIsWork(true);
    setTimeLeft(0);
    setTotalElapsed(0);
  };

  const estCalories = Math.round(totalElapsed * 0.2);

  return (
    <div className="space-y-4">
      <h2 className="font-heading text-lg font-bold text-brand-dark dark:text-brand-white">Cardio & HIIT Timer</h2>

      {/* Mode Selection */}
      <div className="flex gap-2">
        {[
          { id: 'hiit' as const, label: 'HIIT' },
          { id: 'tabata' as const, label: 'Tabata' },
          { id: 'cardio' as const, label: 'Cardio' },
        ].map((m) => (
          <button key={m.id} onClick={() => { setMode(m.id); reset(); }}
            className={cn('flex-1 rounded-xl py-2.5 text-xs font-bold transition-all',
              mode === m.id ? 'bg-brand-purple text-white dark:bg-brand-lavender dark:text-brand-dark' : 'bg-gray-100 text-gray-500 dark:bg-brand-surface'
            )}>
            {m.label}
          </button>
        ))}
      </div>

      {/* Settings (when not running) */}
      {!running && timeLeft === 0 && mode !== 'cardio' && (
        <Card>
          <div className="space-y-3">
            <SettingRow label="Work" value={workTime} unit="sec" onChange={setWorkTime} step={5} min={5} max={120} />
            <SettingRow label="Rest" value={restTime} unit="sec" onChange={setRestTime} step={5} min={5} max={120} />
            <SettingRow label="Rounds" value={rounds} unit="" onChange={setRounds} step={1} min={1} max={30} />
            <p className="text-center text-xs text-gray-400">
              Total: {Math.round((workTime + restTime) * rounds / 60)} minutes
            </p>
          </div>
        </Card>
      )}

      {/* Timer Display */}
      <Card>
        <div className="py-6 text-center">
          {mode !== 'cardio' && (
            <div className={cn(
              'mx-auto mb-3 inline-block rounded-full px-4 py-1 text-sm font-bold',
              isWork ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
            )}>
              {timeLeft > 0 ? (isWork ? '🔥 WORK' : '😮‍💨 REST') : 'READY'}
            </div>
          )}

          <p className="font-mono text-6xl font-bold text-brand-dark dark:text-brand-white">
            {mode === 'cardio'
              ? `${Math.floor(totalElapsed / 60).toString().padStart(2, '0')}:${(totalElapsed % 60).toString().padStart(2, '0')}`
              : timeLeft.toString().padStart(2, '0')
            }
          </p>

          {mode !== 'cardio' && (
            <p className="mt-2 text-sm text-gray-500">
              Round {currentRound + 1} / {rounds}
            </p>
          )}

          <div className="mt-2 flex items-center justify-center gap-3 text-xs text-gray-400">
            <span className="flex items-center gap-1"><Timer className="h-3 w-3" />{Math.floor(totalElapsed / 60)}m</span>
            <span className="flex items-center gap-1"><Flame className="h-3 w-3" />~{estCalories} cal</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex justify-center gap-3">
          {timeLeft === 0 && !running ? (
            <Button onClick={start} variant="primary" size="lg">
              <Play className="mr-2 h-5 w-5" />
              {mode === 'cardio' ? 'Start' : `Start ${mode.toUpperCase()}`}
            </Button>
          ) : (
            <>
              <button onClick={toggle} className={cn('flex h-14 w-14 items-center justify-center rounded-full text-white', running ? 'bg-yellow-500' : 'bg-green-500')}>
                {running ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
              </button>
              <button onClick={reset} className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-200 dark:bg-brand-surface">
                <RotateCcw className="h-6 w-6 text-gray-600" />
              </button>
            </>
          )}
        </div>
      </Card>
    </div>
  );
}

function SettingRow({ label, value, unit, onChange, step, min, max }: {
  label: string; value: number; unit: string; onChange: (v: number) => void; step: number; min: number; max: number;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm font-medium text-gray-600 dark:text-gray-300">{label}</span>
      <div className="flex items-center gap-2">
        <button onClick={() => onChange(Math.max(min, value - step))} className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 text-sm font-bold dark:bg-brand-surface">-</button>
        <span className="min-w-[50px] text-center text-lg font-bold text-brand-dark dark:text-brand-white">{value}{unit && <span className="text-xs text-gray-400">{unit}</span>}</span>
        <button onClick={() => onChange(Math.min(max, value + step))} className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 text-sm font-bold dark:bg-brand-surface">+</button>
      </div>
    </div>
  );
}