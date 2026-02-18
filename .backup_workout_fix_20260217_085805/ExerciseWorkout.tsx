// src/components/workout/ExerciseLibrary.tsx
'use client';

import { useState, useMemo } from 'react';
import { Search, Filter, X, ChevronDown, ChevronUp } from 'lucide-react';
import Card from '@/components/ui/Card';
import { exercises, ExerciseData } from '@/data/exercises';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

const muscleGroups = ['All', 'chest', 'back', 'shoulders', 'biceps', 'triceps', 'quads', 'hamstrings', 'glutes', 'core', 'calves', 'full body'];
const equipmentTypes = ['All', 'bodyweight', 'dumbbell', 'barbell', 'cable', 'machine', 'kettlebell', 'resistance band'];

export default function ExerciseLibrary() {
  const [query, setQuery] = useState('');
  const [selectedMuscle, setSelectedMuscle] = useState('All');
  const [selectedEquipment, setSelectedEquipment] = useState('All');
  const [expandedExercise, setExpandedExercise] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let result = [...exercises];
    if (query) {
      const q = query.toLowerCase();
      result = result.filter((e) =>
        e.name.toLowerCase().includes(q) || e.muscleGroup.toLowerCase().includes(q)
      );
    }
    if (selectedMuscle !== 'All') {
      result = result.filter((e) => e.muscleGroup === selectedMuscle);
    }
    if (selectedEquipment !== 'All') {
      result = result.filter((e) => e.equipment === selectedEquipment);
    }
    return result;
  }, [query, selectedMuscle, selectedEquipment]);

  return (
    <div className="space-y-4">
      <h2 className="font-heading text-lg font-bold text-brand-dark dark:text-brand-white">
        Exercise Library
      </h2>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search exercises..."
          className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm focus:border-brand-purple focus:outline-none dark:border-gray-700 dark:bg-brand-surface dark:text-brand-white"
        />
      </div>

      {/* Muscle Group Filter */}
      <div className="no-scrollbar -mx-4 flex gap-1.5 overflow-x-auto px-4">
        {muscleGroups.map((mg) => (
          <button
            key={mg}
            onClick={() => setSelectedMuscle(mg)}
            className={cn(
              'flex-shrink-0 rounded-full px-3 py-1.5 text-[10px] font-semibold capitalize transition-all',
              selectedMuscle === mg
                ? 'bg-brand-purple text-white dark:bg-brand-lavender dark:text-brand-dark'
                : 'bg-gray-100 text-gray-500 dark:bg-brand-surface dark:text-gray-400'
            )}
          >
            {mg}
          </button>
        ))}
      </div>

      {/* Equipment Filter */}
      <div className="no-scrollbar -mx-4 flex gap-1.5 overflow-x-auto px-4">
        {equipmentTypes.map((eq) => (
          <button
            key={eq}
            onClick={() => setSelectedEquipment(eq)}
            className={cn(
              'flex-shrink-0 rounded-full px-3 py-1.5 text-[10px] font-semibold capitalize transition-all',
              selectedEquipment === eq
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-500 dark:bg-brand-surface dark:text-gray-400'
            )}
          >
            {eq}
          </button>
        ))}
      </div>

      <p className="text-xs text-gray-400">{filtered.length} exercises</p>

      {/* Exercise List */}
      <div className="space-y-2">
        {filtered.map((ex) => (
          <ExerciseCard
            key={ex.id}
            exercise={ex}
            expanded={expandedExercise === ex.id}
            onToggle={() => setExpandedExercise(expandedExercise === ex.id ? null : ex.id)}
          />
        ))}
      </div>
    </div>
  );
}

function ExerciseCard({ exercise, expanded, onToggle }: { exercise: ExerciseData; expanded: boolean; onToggle: () => void }) {
  const diffColors = {
    beginner: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    intermediate: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    advanced: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  };

  return (
    <Card padding="sm">
      <button onClick={onToggle} className="flex w-full items-center justify-between px-2 py-1">
        <div className="text-left">
          <h3 className="text-sm font-bold text-brand-dark dark:text-brand-white">{exercise.name}</h3>
          <div className="mt-1 flex items-center gap-2">
            <span className="rounded-full bg-brand-lavender/20 px-2 py-0.5 text-[9px] font-semibold capitalize text-brand-purple dark:bg-brand-lavender/10 dark:text-brand-lavender">
              {exercise.muscleGroup}
            </span>
            <span className="text-[10px] capitalize text-gray-400">{exercise.equipment}</span>
            <span className={cn('rounded-full px-2 py-0.5 text-[9px] font-bold', diffColors[exercise.difficulty])}>
              {exercise.difficulty}
            </span>
          </div>
        </div>
        {expanded ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-2 space-y-3 px-2">
              <div>
                <p className="text-xs font-bold text-gray-500">Instructions:</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">{exercise.instructions}</p>
              </div>
              {exercise.tips.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-green-600">Tips:</p>
                  <ul className="list-disc pl-4 text-xs text-gray-600 dark:text-gray-400">
                    {exercise.tips.map((t, i) => <li key={i}>{t}</li>)}
                  </ul>
                </div>
              )}
              {exercise.commonMistakes.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-red-500">Common Mistakes:</p>
                  <ul className="list-disc pl-4 text-xs text-gray-600 dark:text-gray-400">
                    {exercise.commonMistakes.map((m, i) => <li key={i}>{m}</li>)}
                  </ul>
                </div>
              )}
              {exercise.alternatives.length > 0 && (
                <p className="text-[10px] text-gray-400">
                  Alternatives: {exercise.alternatives.join(', ')}
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}