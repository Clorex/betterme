// src/components/workout/ActiveWorkout.tsx
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Check,
  SkipForward,
  Minus,
  Plus,
  Timer,
  Dumbbell,
  Trophy,
  Star,
  Pause,
  Play,
} from 'lucide-react';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Card from '@/components/ui/Card';
import { useWorkoutStore } from '@/store/workoutStore';
import { useAuthStore } from '@/store/authStore';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import confetti from 'canvas-confetti' ;

export default function ActiveWorkout() {
  const { user } = useAuthStore();
  const {
    todayWorkout,
    currentExerciseIndex,
    currentSetIndex,
    workoutStartTime,
    restTimerActive,
    restTimeRemaining,
    logSet,
    skipSet,
    nextExercise,
    prevExercise,
    setCurrentExercise,
    startRestTimer,
    stopRestTimer,
    completeWorkout,
    cancelWorkout,
  } = useWorkoutStore();

  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [weight, setWeight] = useState(0);
  const [reps, setReps] = useState(10);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [rating, setRating] = useState(4);
  const [workoutNote, setWorkoutNote] = useState('');
  const [completionData, setCompletionData] = useState<any>(null);
  const [restSeconds, setRestSeconds] = useState(0);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const restRef = useRef<NodeJS.Timeout | null>(null);

  if (!todayWorkout) return null;

  const exercise = todayWorkout.exercises[currentExerciseIndex];
  const totalExercises = todayWorkout.exercises.length;
  const allSetsCompleted = exercise?.completedSets?.every((s) => s.completed) || false;

  const isLastExercise = currentExerciseIndex === totalExercises - 1;
  const allExercisesDone = todayWorkout.exercises.every(
    (ex) => ex.completedSets?.every((s) => s.completed)
  );

  // Elapsed timer
  useEffect(() => {
    timerRef.current = setInterval(() => {
      if (workoutStartTime) {
        setElapsedSeconds(Math.floor((Date.now() - workoutStartTime.getTime()) / 1000));
      }
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [workoutStartTime]);

  // Rest timer
  useEffect(() => {
    if (restTimerActive && restTimeRemaining > 0) {
      setRestSeconds(restTimeRemaining);
      restRef.current = setInterval(() => {
        setRestSeconds((prev) => {
          if (prev <= 1) {
            stopRestTimer();
            if (restRef.current) clearInterval(restRef.current);
            // Vibrate if available
            if (navigator.vibrate) navigator.vibrate(200);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => { if (restRef.current) clearInterval(restRef.current); };
  }, [restTimerActive, restTimeRemaining]);

  // Set default weight from suggestion
  useEffect(() => {
    if (exercise?.suggestedWeight) {
      const num = parseFloat(exercise.suggestedWeight);
      if (!isNaN(num)) setWeight(num);
    }
    if (exercise?.reps) {
      const num = parseInt(exercise.reps);
      if (!isNaN(num)) setReps(num);
    }
  }, [currentExerciseIndex, exercise]);

  const formatTimer = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  const handleCompleteSet = () => {
    logSet(currentExerciseIndex, { reps, weight });
    toast.success(`Set ${currentSetIndex + 1} ✓`);
  };

  const handleFinishWorkout = async () => {
    if (!user) return;
    const data = await completeWorkout(user.uid, rating, workoutNote);
    setCompletionData(data);
    setShowCompleteModal(false);

    // Confetti!
    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#4C0585', '#DBB5EE', '#22C55E'],
      });
    } catch {}
  };

  // COMPLETION SCREEN
  if (completionData) {
    return (
      <div className="flex min-h-[80vh] flex-col items-center justify-center px-4 text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
          className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30"
        >
          <Trophy className="h-12 w-12 text-green-500" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="font-heading text-2xl font-extrabold text-brand-dark dark:text-brand-white"
        >
          Workout Complete! 🎉
        </motion.h1>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-6 grid w-full max-w-sm grid-cols-3 gap-3"
        >
          <div className="rounded-2xl bg-white p-3 shadow-sm dark:bg-brand-surface">
            <p className="text-xl font-bold text-brand-purple dark:text-brand-lavender">
              {completionData.duration}
            </p>
            <p className="text-[10px] text-gray-400">minutes</p>
          </div>
          <div className="rounded-2xl bg-white p-3 shadow-sm dark:bg-brand-surface">
            <p className="text-xl font-bold text-blue-500">
              {completionData.completedExercises}
            </p>
            <p className="text-[10px] text-gray-400">exercises</p>
          </div>
          <div className="rounded-2xl bg-white p-3 shadow-sm dark:bg-brand-surface">
            <p className="text-xl font-bold text-orange-500">
              {completionData.caloriesBurned}
            </p>
            <p className="text-[10px] text-gray-400">calories</p>
          </div>
        </motion.div>

        {completionData.totalVolume > 0 && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-3 text-sm text-gray-500"
          >
            Total volume: {completionData.totalVolume.toLocaleString()} lbs
          </motion.p>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-6"
        >
          <Button onClick={() => setCompletionData(null)} variant="primary" size="lg">
            Back to Workout
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-brand-white pb-32 dark:bg-brand-dark">
      {/* Top Bar */}
      <div className="sticky top-0 z-20 bg-brand-white/90 backdrop-blur-md dark:bg-brand-dark/90">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={() => setShowCancelModal(true)}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 dark:bg-brand-surface"
          >
            <X className="h-5 w-5 text-gray-600 dark:text-gray-300" />
          </button>

          <div className="text-center">
            <p className="text-xs text-gray-500">{todayWorkout.workoutName}</p>
            <p className="font-mono text-lg font-bold text-brand-dark dark:text-brand-white">
              {formatTimer(elapsedSeconds)}
            </p>
          </div>

          <div className="text-right text-xs text-gray-500">
            {currentExerciseIndex + 1}/{totalExercises}
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-1 w-full bg-gray-200 dark:bg-gray-700">
          <div
            className="h-full bg-brand-purple transition-all duration-300 dark:bg-brand-lavender"
            style={{
              width: `${((currentExerciseIndex + (allSetsCompleted ? 1 : 0)) / totalExercises) * 100}%`,
            }}
          />
        </div>
      </div>

      {/* REST TIMER OVERLAY */}
      <AnimatePresence>
        {restTimerActive && restSeconds > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-30 flex flex-col items-center justify-center bg-brand-dark/95"
          >
            <p className="mb-2 text-sm font-semibold text-gray-400">REST</p>
            <p className="font-mono text-7xl font-bold text-brand-white">
              {restSeconds}
            </p>
            <p className="mt-4 text-sm text-gray-400">
              Next: Set {currentSetIndex + 1} of {exercise.sets}
            </p>

            <button
              onClick={() => {
                stopRestTimer();
                if (restRef.current) clearInterval(restRef.current);
                setRestSeconds(0);
              }}
              className="mt-8 rounded-full bg-brand-purple px-8 py-3 font-semibold text-white active:scale-95 dark:bg-brand-lavender dark:text-brand-dark"
            >
              Skip Rest
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Exercise Display */}
      <div className="px-4 pt-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentExerciseIndex}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.2 }}
          >
            {exercise && (
              <>
                {/* Exercise Info */}
                <Card>
                  <div className="text-center">
                    <span className="inline-block rounded-full bg-brand-lavender/20 px-3 py-1 text-xs font-semibold capitalize text-brand-purple dark:bg-brand-lavender/10 dark:text-brand-lavender">
                      {exercise.muscleGroup}
                    </span>
                    <h2 className="mt-2 font-heading text-xl font-bold text-brand-dark dark:text-brand-white">
                      {exercise.name}
                    </h2>
                    <p className="mt-1 text-sm text-gray-500">
                      Set {currentSetIndex + 1} of {exercise.sets} · {exercise.reps} reps
                    </p>
                    {exercise.suggestedWeight && exercise.suggestedWeight !== 'bodyweight' && (
                      <p className="text-xs text-gray-400">
                        Suggested: {exercise.suggestedWeight}
                      </p>
                    )}
                  </div>

                  {/* Set indicators */}
                  <div className="mt-4 flex justify-center gap-2">
                    {exercise.completedSets.map((s, i) => (
                      <div
                        key={i}
                        className={cn(
                          'flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all',
                          s.completed
                            ? 'bg-green-500 text-white'
                            : i === currentSetIndex
                            ? 'border-2 border-brand-purple text-brand-purple dark:border-brand-lavender dark:text-brand-lavender'
                            : 'border-2 border-gray-200 text-gray-400 dark:border-gray-600'
                        )}
                      >
                        {s.completed ? <Check className="h-4 w-4" /> : i + 1}
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Weight & Reps Input */}
                <Card className="mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    {/* Weight */}
                    <div>
                      <label className="mb-2 block text-center text-xs font-semibold text-gray-500">
                        Weight (lbs)
                      </label>
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => setWeight(Math.max(0, weight - 5))}
                          className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 active:scale-90 dark:bg-brand-surface"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <input
                          type="number"
                          value={weight}
                          onChange={(e) => setWeight(Number(e.target.value))}
                          className="w-20 rounded-xl border-0 bg-gray-50 py-2 text-center text-2xl font-bold text-brand-dark dark:bg-brand-surface dark:text-brand-white"
                        />
                        <button
                          onClick={() => setWeight(weight + 5)}
                          className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 active:scale-90 dark:bg-brand-surface"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {/* Reps */}
                    <div>
                      <label className="mb-2 block text-center text-xs font-semibold text-gray-500">
                        Reps
                      </label>
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => setReps(Math.max(1, reps - 1))}
                          className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 active:scale-90 dark:bg-brand-surface"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <input
                          type="number"
                          value={reps}
                          onChange={(e) => setReps(Number(e.target.value))}
                          className="w-20 rounded-xl border-0 bg-gray-50 py-2 text-center text-2xl font-bold text-brand-dark dark:bg-brand-surface dark:text-brand-white"
                        />
                        <button
                          onClick={() => setReps(reps + 1)}
                          className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 active:scale-90 dark:bg-brand-surface"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={handleCompleteSet}
                    variant="primary"
                    fullWidth
                    size="lg"
                    className="mt-4"
                    disabled={exercise.completedSets[currentSetIndex]?.completed}
                  >
                    <Check className="mr-2 h-5 w-5" />
                    Complete Set
                  </Button>

                  <button
                    onClick={() => skipSet(currentExerciseIndex)}
                    className="mt-2 w-full py-2 text-center text-xs text-gray-400 active:text-gray-600"
                  >
                    <SkipForward className="mr-1 inline h-3 w-3" />
                    Skip Set
                  </button>
                </Card>

                {/* Tips */}
                {(exercise.instructions || exercise.tips) && (
                  <Card className="mt-4">
                    {exercise.instructions && (
                      <div className="mb-2">
                        <p className="text-xs font-bold text-gray-500">Form:</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {exercise.instructions}
                        </p>
                      </div>
                    )}
                    {exercise.tips && (
                      <div>
                        <p className="text-xs font-bold text-gray-500">Tip:</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {exercise.tips}
                        </p>
                      </div>
                    )}
                    {exercise.alternatives && exercise.alternatives.length > 0 && (
                      <p className="mt-2 text-[10px] text-gray-400">
                        Alternatives: {exercise.alternatives.join(', ')}
                      </p>
                    )}
                  </Card>
                )}
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-20 mx-auto max-w-[480px] bg-white/90 px-4 py-3 backdrop-blur-md dark:bg-brand-dark/90">
        <div className="flex items-center justify-between gap-3">
          <button
            onClick={prevExercise}
            disabled={currentExerciseIndex === 0}
            className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 disabled:opacity-30 dark:bg-brand-surface"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          {/* Exercise dots */}
          <div className="flex flex-1 items-center justify-center gap-1">
            {todayWorkout.exercises.map((ex, i) => {
              const done = ex.completedSets?.every((s) => s.completed);
              return (
                <button
                  key={i}
                  onClick={() => setCurrentExercise(i)}
                  className={cn(
                    'h-2 rounded-full transition-all',
                    i === currentExerciseIndex ? 'w-6 bg-brand-purple dark:bg-brand-lavender' :
                    done ? 'w-2 bg-green-500' : 'w-2 bg-gray-300 dark:bg-gray-600'
                  )}
                />
              );
            })}
          </div>

          {isLastExercise && allSetsCompleted ? (
            <Button
              onClick={() => setShowCompleteModal(true)}
              variant="primary"
              className="h-12 px-6"
            >
              <Trophy className="mr-1 h-4 w-4" />
              Finish
            </Button>
          ) : (
            <button
              onClick={nextExercise}
              disabled={isLastExercise}
              className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 disabled:opacity-30 dark:bg-brand-surface"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>

      {/* Cancel Modal */}
      <Modal isOpen={showCancelModal} onClose={() => setShowCancelModal(false)} title="End Workout?">
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Your progress will be lost. Are you sure?
        </p>
        <div className="mt-4 flex gap-3">
          <Button onClick={() => setShowCancelModal(false)} variant="outline" className="flex-1">
            Continue
          </Button>
          <Button
            onClick={() => { cancelWorkout(); setShowCancelModal(false); }}
            variant="danger"
            className="flex-1"
          >
            End Workout
          </Button>
        </div>
      </Modal>

      {/* Complete Modal */}
      <Modal isOpen={showCompleteModal} onClose={() => setShowCompleteModal(false)} title="How was your workout?">
        <div className="space-y-4">
          <div className="flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map((r) => (
              <button
                key={r}
                onClick={() => setRating(r)}
                className="p-1"
              >
                <Star
                  className={cn(
                    'h-8 w-8 transition-all',
                    r <= rating
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300 dark:text-gray-600'
                  )}
                />
              </button>
            ))}
          </div>
          <textarea
            value={workoutNote}
            onChange={(e) => setWorkoutNote(e.target.value)}
            placeholder="Any notes? (optional)"
            rows={3}
            className="w-full rounded-2xl border border-gray-200 bg-white p-3 text-sm focus:border-brand-purple focus:outline-none dark:border-gray-700 dark:bg-brand-surface dark:text-brand-white"
          />
          <Button onClick={handleFinishWorkout} variant="primary" fullWidth size="lg">
            <Trophy className="mr-2 h-5 w-5" />
            Save Workout
          </Button>
        </div>
      </Modal>
    </div>
  );
}