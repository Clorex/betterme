// src/components/workout/ProgramList.tsx
'use client';

import { useState } from 'react';
import { Clock, Calendar, Dumbbell, Users, ChevronRight, Play } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { programs, ProgramData } from '@/data/programs';
import { cn } from '@/lib/utils';
import { useWorkoutStore } from '@/store/workoutStore';
import toast from 'react-hot-toast';

export default function ProgramList() {
  const [selectedProgram, setSelectedProgram] = useState<ProgramData | null>(null);
  const { setActiveProgram } = useWorkoutStore();

  const handleStartProgram = (program: ProgramData) => {
    setActiveProgram(program.id);
    toast.success(`${program.name} started! Your daily workouts will follow this program.`);
    setSelectedProgram(null);
  };

  return (
    <div className="space-y-4">
      <h2 className="font-heading text-lg font-bold text-brand-dark dark:text-brand-white">
        Training Programs
      </h2>
      <p className="text-xs text-gray-500 dark:text-gray-400">
        Structured plans designed by experts for specific goals
      </p>

      <div className="space-y-3">
        {programs.map((program) => (
          <Card
            key={program.id}
            onClick={() => setSelectedProgram(program)}
            clickable
          >
            <div className="flex items-start gap-3">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-brand-lavender/20 text-2xl">
                {program.emoji}
              </div>
              <div className="flex-1">
                <h3 className="font-heading text-sm font-bold text-brand-dark dark:text-brand-white">
                  {program.name}
                </h3>
                <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                  {program.description}
                </p>
                <div className="mt-2 flex flex-wrap gap-2 text-[10px] text-gray-400">
                  <span className="flex items-center gap-0.5">
                    <Calendar className="h-3 w-3" /> {program.duration}
                  </span>
                  <span className="flex items-center gap-0.5">
                    <Clock className="h-3 w-3" /> {program.timePerSession}
                  </span>
                  <span className="flex items-center gap-0.5">
                    <Dumbbell className="h-3 w-3" /> {program.daysPerWeek}x/week
                  </span>
                  <span className={cn(
                    'rounded-full px-1.5 py-0.5 font-bold',
                    program.difficulty === 'Beginner' ? 'bg-green-100 text-green-600 dark:bg-green-900/30' :
                    program.difficulty === 'Advanced' ? 'bg-red-100 text-red-600 dark:bg-red-900/30' :
                    'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30'
                  )}>
                    {program.difficulty}
                  </span>
                </div>
              </div>
              <ChevronRight className="mt-1 h-4 w-4 text-gray-400" />
            </div>
          </Card>
        ))}
      </div>

      {/* Program Detail Modal */}
      <Modal
        isOpen={!!selectedProgram}
        onClose={() => setSelectedProgram(null)}
        title={selectedProgram?.name || ''}
      >
        {selectedProgram && (
          <div className="space-y-4 pb-4">
            <p className="text-sm text-gray-600 dark:text-gray-300">{selectedProgram.description}</p>

            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-xl bg-gray-50 p-3 dark:bg-brand-surface/50">
                <p className="text-xs text-gray-400">Duration</p>
                <p className="font-bold text-brand-dark dark:text-brand-white">{selectedProgram.duration}</p>
              </div>
              <div className="rounded-xl bg-gray-50 p-3 dark:bg-brand-surface/50">
                <p className="text-xs text-gray-400">Frequency</p>
                <p className="font-bold text-brand-dark dark:text-brand-white">{selectedProgram.daysPerWeek}x/week</p>
              </div>
              <div className="rounded-xl bg-gray-50 p-3 dark:bg-brand-surface/50">
                <p className="text-xs text-gray-400">Session</p>
                <p className="font-bold text-brand-dark dark:text-brand-white">{selectedProgram.timePerSession}</p>
              </div>
              <div className="rounded-xl bg-gray-50 p-3 dark:bg-brand-surface/50">
                <p className="text-xs text-gray-400">Equipment</p>
                <p className="text-xs font-bold text-brand-dark dark:text-brand-white">{selectedProgram.equipment}</p>
              </div>
            </div>

            <div>
              <h4 className="mb-2 text-sm font-bold text-brand-dark dark:text-brand-white">Program Overview</h4>
              <ul className="space-y-1.5">
                {selectedProgram.overview.map((item, i) => (
                  <li key={i} className="flex gap-2 text-xs text-gray-600 dark:text-gray-400">
                    <span className="flex-shrink-0 text-brand-purple dark:text-brand-lavender">•</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <Button onClick={() => handleStartProgram(selectedProgram)} variant="primary" fullWidth size="lg">
              <Play className="mr-2 h-5 w-5" />
              Start Program
            </Button>
          </div>
        )}
      </Modal>
    </div>
  );
}