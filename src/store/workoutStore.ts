// src/store/workoutStore.ts
import { create } from 'zustand';
import { doc, setDoc, collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { format } from 'date-fns';

export interface WorkoutExercise {
  name: string;
  muscleGroup: string;
  sets: number;
  reps: string;
  suggestedWeight: string;
  restSeconds: number;
  instructions: string;
  tips: string;
  alternatives: string[];
  completedSets: { reps: number; weight: number; completed: boolean }[];
}

export interface WorkoutData {
  workoutName: string;
  targetMuscles: string[];
  estimatedDuration: number;
  estimatedCaloriesBurned: number;
  warmup: { name: string; duration: string }[];
  exercises: WorkoutExercise[];
  cooldown: { name: string; duration: string }[];
  coachNote: string;
}

interface WorkoutState {
  todayWorkout: WorkoutData | null;
  activeWorkout: boolean;
  currentExerciseIndex: number;
  currentSetIndex: number;
  workoutStartTime: Date | null;
  restTimerActive: boolean;
  restTimeRemaining: number;
  workoutHistory: any[];
  activeProgram: string | null;

  setTodayWorkout: (w: WorkoutData) => void;
  startWorkout: (w: WorkoutData) => void;
  logSet: (exerciseIdx: number, set: { reps: number; weight: number }) => void;
  skipSet: (exerciseIdx: number) => void;
  nextExercise: () => void;
  prevExercise: () => void;
  setCurrentExercise: (idx: number) => void;
  startRestTimer: (seconds: number) => void;
  stopRestTimer: () => void;
  completeWorkout: (userId: string, rating: number, note: string) => Promise<any>;
  cancelWorkout: () => void;
  fetchHistory: (userId: string) => Promise<void>;
  setActiveProgram: (id: string | null) => void;
}

export const useWorkoutStore = create<WorkoutState>((set, get) => ({
  todayWorkout: null,
  activeWorkout: false,
  currentExerciseIndex: 0,
  currentSetIndex: 0,
  workoutStartTime: null,
  restTimerActive: false,
  restTimeRemaining: 0,
  workoutHistory: [],
  activeProgram: null,

  setTodayWorkout: (w) => set({ todayWorkout: w }),

  startWorkout: (w) => {
    // Initialize completedSets for each exercise
    const exercises = w.exercises.map((ex) => ({
      ...ex,
      completedSets: Array.from({ length: ex.sets }, () => ({
        reps: 0,
        weight: 0,
        completed: false,
      })),
    }));

    set({
      todayWorkout: { ...w, exercises },
      activeWorkout: true,
      currentExerciseIndex: 0,
      currentSetIndex: 0,
      workoutStartTime: new Date(),
      restTimerActive: false,
      restTimeRemaining: 0,
    });
  },

  logSet: (exerciseIdx, setData) => {
    const { todayWorkout, currentSetIndex } = get();
    if (!todayWorkout) return;

    const exercises = [...todayWorkout.exercises];
    const exercise = { ...exercises[exerciseIdx] };
    const completedSets = [...exercise.completedSets];

    completedSets[currentSetIndex] = {
      reps: setData.reps,
      weight: setData.weight,
      completed: true,
    };

    exercise.completedSets = completedSets;
    exercises[exerciseIdx] = exercise;

    const nextSetIdx = currentSetIndex + 1;

    set({
      todayWorkout: { ...todayWorkout, exercises },
      currentSetIndex: nextSetIdx < exercise.sets ? nextSetIdx : 0,
    });

    // Auto start rest timer if more sets remaining
    if (nextSetIdx < exercise.sets) {
      get().startRestTimer(exercise.restSeconds || 60);
    }
  },

  skipSet: (exerciseIdx) => {
    const { todayWorkout, currentSetIndex } = get();
    if (!todayWorkout) return;

    const exercises = [...todayWorkout.exercises];
    const exercise = exercises[exerciseIdx];
    const nextSetIdx = currentSetIndex + 1;

    set({
      currentSetIndex: nextSetIdx < exercise.sets ? nextSetIdx : 0,
    });
  },

  nextExercise: () => {
    const { todayWorkout, currentExerciseIndex } = get();
    if (!todayWorkout) return;
    if (currentExerciseIndex < todayWorkout.exercises.length - 1) {
      set({
        currentExerciseIndex: currentExerciseIndex + 1,
        currentSetIndex: 0,
        restTimerActive: false,
        restTimeRemaining: 0,
      });
    }
  },

  prevExercise: () => {
    const { currentExerciseIndex } = get();
    if (currentExerciseIndex > 0) {
      set({
        currentExerciseIndex: currentExerciseIndex - 1,
        currentSetIndex: 0,
        restTimerActive: false,
        restTimeRemaining: 0,
      });
    }
  },

  setCurrentExercise: (idx) => set({
    currentExerciseIndex: idx,
    currentSetIndex: 0,
    restTimerActive: false,
    restTimeRemaining: 0,
  }),

  startRestTimer: (seconds) => set({
    restTimerActive: true,
    restTimeRemaining: seconds,
  }),

  stopRestTimer: () => set({
    restTimerActive: false,
    restTimeRemaining: 0,
  }),

  completeWorkout: async (userId, rating, note) => {
    const { todayWorkout, workoutStartTime } = get();
    if (!todayWorkout || !workoutStartTime) return null;

    const endTime = new Date();
    const durationMin = Math.round((endTime.getTime() - workoutStartTime.getTime()) / 60000);

    let totalVolume = 0;
    let completedExercises = 0;
    let totalSets = 0;
    let completedSetsCount = 0;

    todayWorkout.exercises.forEach((ex) => {
      let exCompleted = false;
      ex.completedSets.forEach((s) => {
        totalSets++;
        if (s.completed) {
          completedSetsCount++;
          totalVolume += s.reps * s.weight;
          exCompleted = true;
        }
      });
      if (exCompleted) completedExercises++;
    });

    const logData = {
      date: format(new Date(), 'yyyy-MM-dd'),
      workoutName: todayWorkout.workoutName,
      targetMuscles: todayWorkout.targetMuscles,
      exercises: todayWorkout.exercises.map((ex) => ({
        name: ex.name,
        muscleGroup: ex.muscleGroup,
        sets: ex.completedSets,
      })),
      duration: durationMin,
      totalVolume,
      completedExercises,
      totalSets,
      completedSetsCount,
      caloriesBurned: todayWorkout.estimatedCaloriesBurned || Math.round(durationMin * 7),
      rating,
      note,
      startTime: workoutStartTime.toISOString(),
      endTime: endTime.toISOString(),
      createdAt: new Date().toISOString(),
    };

    try {
      const today = format(new Date(), 'yyyy-MM-dd');
      await setDoc(doc(db, 'users', userId, 'workoutLogs', today), logData);
    } catch (err) {
      console.error('Error saving workout:', err);
    }

    set({
      activeWorkout: false,
      currentExerciseIndex: 0,
      currentSetIndex: 0,
      workoutStartTime: null,
      restTimerActive: false,
      restTimeRemaining: 0,
    });

    return logData;
  },

  cancelWorkout: () => set({
    activeWorkout: false,
    currentExerciseIndex: 0,
    currentSetIndex: 0,
    workoutStartTime: null,
    restTimerActive: false,
    restTimeRemaining: 0,
  }),

  fetchHistory: async (userId) => {
    try {
      const logsRef = collection(db, 'users', userId, 'workoutLogs');
      const q = query(logsRef, orderBy('date', 'desc'), limit(30));
      const snap = await getDocs(q);
      const history = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      set({ workoutHistory: history });
    } catch (err) {
      console.error('Error fetching history:', err);
    }
  },

  setActiveProgram: (id) => set({ activeProgram: id }),
}));