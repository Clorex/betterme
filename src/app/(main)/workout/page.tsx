// src/app/(main)/workout/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Dumbbell,
  Zap,
  Home,
  Timer,
  Sparkles,
  BookOpen,
  History,
  Trophy,
  ChevronRight,
  Play,
  Clock,
  Flame,
} from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';
import { useWorkoutStore } from '@/store/workoutStore';
import ActiveWorkout from '@/components/workout/ActiveWorkout';
import ExerciseLibrary from '@/components/workout/ExerciseLibrary';
import ProgramList from '@/components/workout/ProgramList';
import HomeWorkout from '@/components/workout/HomeWorkout';
import CardioTimer from '@/components/workout/CardioTimer';
import WarmupCooldown from '@/components/workout/WarmupCooldown';
import WorkoutHistory from '@/components/workout/WorkoutHistory';
import { generateWorkout } from '@/lib/gemini';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export default function WorkoutPage() {
  const { user, userProfile } = useAuthStore();
  const {
    todayWorkout,
    activeWorkout,
    setTodayWorkout,
    startWorkout,
  } = useWorkoutStore();
  const [generating, setGenerating] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [todayCompleted, setTodayCompleted] = useState(false);

  useEffect(() => {
    if (user) checkTodayWorkout();
  }, [user]);

  const checkTodayWorkout = async () => {
    if (!user) return;
    const today = format(new Date(), 'yyyy-MM-dd');
    try {
      const logDoc = await getDoc(doc(db, 'users', user.uid, 'workoutLogs', today));
      if (logDoc.exists()) {
        setTodayCompleted(true);
        setTodayWorkout(logDoc.data() as any);
      }
    } catch (err) {
      console.error('Error checking workout:', err);
    }
  };

  const handleGenerateWorkout = async () => {
    if (!userProfile) return;
    setGenerating(true);
    try {
      const workout = await generateWorkout(userProfile);
      setTodayWorkout(workout);
      toast.success('Workout generated! 💪');
    } catch (err: any) {
      toast.error(err.message || 'Failed to generate workout');
    }
    setGenerating(false);
  };

  const handleStartWorkout = () => {
    if (todayWorkout) {
      startWorkout(todayWorkout);
    }
  };

  // If active workout is in progress, show full screen workout
  if (activeWorkout) {
    return <ActiveWorkout />;
  }

  // If a section is opened
  if (activeSection) {
    return (
      <div className="space-y-4">
        <button
          onClick={() => setActiveSection(null)}
          className="text-sm font-semibold text-brand-purple dark:text-brand-lavender"
        >
          ← Back to Workout
        </button>
        {activeSection === 'exercises' && <ExerciseLibrary />}
        {activeSection === 'programs' && <ProgramList />}
        {activeSection === 'home' && <HomeWorkout onStart={(w) => { setTodayWorkout(w); startWorkout(w); }} />}
        {activeSection === 'cardio' && <CardioTimer />}
        {activeSection === 'warmup' && <WarmupCooldown />}
        {activeSection === 'history' && <WorkoutHistory />}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="font-heading text-xl font-bold text-brand-dark dark:text-brand-white">
        Workout
      </h1>

      {/* Today's Workout Card */}
      <Card>
        {todayWorkout && !todayCompleted ? (
          <div>
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold uppercase text-brand-purple dark:text-brand-lavender">
                  Today&apos;s Workout
                </span>
                <h2 className="mt-1 font-heading text-lg font-bold text-brand-dark dark:text-brand-white">
                  {todayWorkout.workoutName}
                </h2>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-lavender/20">
                <Dumbbell className="h-6 w-6 text-brand-purple dark:text-brand-lavender" />
              </div>
            </div>

            <div className="mt-3 flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
              {todayWorkout.targetMuscles && (
                <span className="flex items-center gap-1">
                  <Dumbbell className="h-3 w-3" />
                  {Array.isArray(todayWorkout.targetMuscles)
                    ? todayWorkout.targetMuscles.join(', ')
                    : todayWorkout.targetMuscles}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {todayWorkout.estimatedDuration || 45} min
              </span>
              {todayWorkout.estimatedCaloriesBurned && (
                <span className="flex items-center gap-1">
                  <Flame className="h-3 w-3" />
                  ~{todayWorkout.estimatedCaloriesBurned} cal
                </span>
              )}
            </div>

            {/* Exercise preview */}
            {todayWorkout.exercises && todayWorkout.exercises.length > 0 && (
              <div className="mt-3 space-y-1">
                {todayWorkout.exercises.slice(0, 3).map((ex: any, i: number) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-purple/10 text-[10px] font-bold text-brand-purple dark:bg-brand-lavender/10 dark:text-brand-lavender">
                      {i + 1}
                    </span>
                    <span>{ex.name}</span>
                    <span className="text-gray-400">·</span>
                    <span>{ex.sets} × {ex.reps}</span>
                  </div>
                ))}
                {todayWorkout.exercises.length > 3 && (
                  <p className="text-xs text-gray-400">
                    +{todayWorkout.exercises.length - 3} more exercises
                  </p>
                )}
              </div>
            )}

            {todayWorkout.coachNote && (
              <div className="mt-3 rounded-xl bg-brand-lavender/10 p-3 dark:bg-brand-lavender/5">
                <p className="text-xs text-brand-purple dark:text-brand-lavender">
                  🗣️ {todayWorkout.coachNote}
                </p>
              </div>
            )}

            <Button
              onClick={handleStartWorkout}
              variant="primary"
              fullWidth
              size="lg"
              className="mt-4"
            >
              <Play className="mr-2 h-5 w-5" />
              Start Workout
            </Button>
          </div>
        ) : todayCompleted ? (
          <div className="py-4 text-center">
            <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
              <Trophy className="h-8 w-8 text-green-500" />
            </div>
            <h2 className="font-heading text-lg font-bold text-brand-dark dark:text-brand-white">
              Workout Complete! 🎉
            </h2>
            <p className="mt-1 text-sm text-gray-500">Great job today. Rest and recover.</p>
            <Button
              onClick={handleGenerateWorkout}
              variant="outline"
              className="mt-3"
              loading={generating}
            >
              Generate Another Workout
            </Button>
          </div>
        ) : (
          <div className="py-6 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-brand-lavender/20">
              <Sparkles className="h-8 w-8 text-brand-purple dark:text-brand-lavender" />
            </div>
            <h2 className="font-heading text-lg font-bold text-brand-dark dark:text-brand-white">
              Generate Today&apos;s Workout
            </h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              AI creates a personalized workout based on your goals
            </p>
            <Button
              onClick={handleGenerateWorkout}
              variant="primary"
              size="lg"
              className="mt-4"
              loading={generating}
            >
              <Sparkles className="mr-2 h-5 w-5" />
              Generate Workout
            </Button>
          </div>
        )}
      </Card>

      {/* Quick Access Sections */}
      <div className="grid grid-cols-2 gap-3">
        <SectionCard
          icon={BookOpen}
          label="Programs"
          desc="8 pre-built plans"
          color="bg-blue-100 dark:bg-blue-900/30"
          iconColor="text-blue-500"
          onClick={() => setActiveSection('programs')}
        />
        <SectionCard
          icon={Home}
          label="Home Workout"
          desc="No equipment needed"
          color="bg-green-100 dark:bg-green-900/30"
          iconColor="text-green-500"
          onClick={() => setActiveSection('home')}
        />
        <SectionCard
          icon={Timer}
          label="Cardio / HIIT"
          desc="Timers & trackers"
          color="bg-orange-100 dark:bg-orange-900/30"
          iconColor="text-orange-500"
          onClick={() => setActiveSection('cardio')}
        />
        <SectionCard
          icon={Zap}
          label="Warm-up"
          desc="Stretches & prep"
          color="bg-purple-100 dark:bg-purple-900/30"
          iconColor="text-purple-500"
          onClick={() => setActiveSection('warmup')}
        />
      </div>

      {/* Exercise Library */}
      <Card onClick={() => setActiveSection('exercises')} clickable>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-lavender/20">
              <Dumbbell className="h-5 w-5 text-brand-purple dark:text-brand-lavender" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-brand-dark dark:text-brand-white">
                Exercise Library
              </h3>
              <p className="text-xs text-gray-500">300+ exercises with instructions</p>
            </div>
          </div>
          <ChevronRight className="h-5 w-5 text-gray-400" />
        </div>
      </Card>

      {/* Workout History */}
      <Card onClick={() => setActiveSection('history')} clickable>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-yellow-100 dark:bg-yellow-900/30">
              <History className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-brand-dark dark:text-brand-white">
                Workout History
              </h3>
              <p className="text-xs text-gray-500">View past workouts & progress</p>
            </div>
          </div>
          <ChevronRight className="h-5 w-5 text-gray-400" />
        </div>
      </Card>
    </div>
  );
}

function SectionCard({
  icon: Icon,
  label,
  desc,
  color,
  iconColor,
  onClick,
}: {
  icon: any;
  label: string;
  desc: string;
  color: string;
  iconColor: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-start rounded-2xl bg-white p-4 shadow-sm transition-all active:scale-[0.97] dark:bg-brand-surface"
    >
      <div className={cn('flex h-10 w-10 items-center justify-center rounded-2xl', color)}>
        <Icon className={cn('h-5 w-5', iconColor)} />
      </div>
      <h3 className="mt-2 text-sm font-bold text-brand-dark dark:text-brand-white">{label}</h3>
      <p className="text-[10px] text-gray-500 dark:text-gray-400">{desc}</p>
    </button>
  );
}