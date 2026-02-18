'use client';

import { useState, useEffect } from 'react';
import { BookOpen, Check, ChevronRight, Award, ChevronDown, ChevronUp, Lock } from 'lucide-react';
import { Card, Button } from '@/components/ui/enhanced';
import { useAuthStore } from '@/store/authStore';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { StaggerContainer, StaggerItem } from '@/components/layout/PageTransition';

interface Lesson {
  id: string;
  title: string;
  readTime: number;
  content: string;
  keyTakeaways: string[];
  quiz: { question: string; options: string[]; correct: number }[];
}

interface Module {
  id: string;
  title: string;
  badge: string;
  lessons: Lesson[];
}

const modules: Module[] = [
  {
    id: 'mod1', 
    title: 'Nutrition Basics', 
    badge: 'Nutrition Literate',
    lessons: [
      {
        id: 'l1', 
        title: 'How Calories Actually Work', 
        readTime: 3,
        content: `Calories are simply a unit of energy. Your body needs energy to breathe, think, move, and digest food. This is your Total Daily Energy Expenditure (TDEE).

Energy Balance:
- Eat MORE than you burn → Weight GAIN (calorie surplus)
- Eat LESS than you burn → Weight LOSS (calorie deficit)
- Eat EQUAL to what you burn → Weight MAINTENANCE

Your TDEE consists of:
1. BMR (60-70%) → Basal Metabolic Rate. Calories burned just being alive.
2. NEAT (15-30%) → Non-Exercise Activity. Walking, fidgeting, standing.
3. TEF (10%) → Thermic Effect of Food. Energy to digest food.
4. EAT (5-10%) → Exercise Activity. Your actual workouts.

Key insight: Your BMR + NEAT burns WAY more than exercise. That's why nutrition is 80% of the equation.`,
        keyTakeaways: ['Calories in vs calories out determines weight change', 'BMR + NEAT burns more than exercise', '500 cal/day deficit = 1 lb/week loss', "Don't go too low → it backfires"],
        quiz: [
          { question: 'What burns the most calories daily?', options: ['Exercise', 'BMR (just being alive)', 'Digesting food', 'Walking'], correct: 1 },
          { question: 'How many calories = 1 pound of fat?', options: ['1,000', '2,500', '3,500', '5,000'], correct: 2 },
        ],
      },
      {
        id: 'l2', 
        title: 'Understanding Macros', 
        readTime: 4,
        content: `Macronutrients ("macros") are the three types of nutrients that provide calories:

PROTEIN (4 cal/gram)
- Builds and repairs muscle
- Most filling macro (keeps you full longer)
- Highest thermic effect (burns 20-30% of its calories during digestion)
- Aim for: 0.7-1g per pound of bodyweight

CARBOHYDRATES (4 cal/gram)
- Primary energy source for brain and muscles
- Not the enemy! Your body NEEDS them
- Choose complex carbs (oats, rice, potatoes) over simple (sugar, candy)

FAT (9 cal/gram)
- Essential for hormones, brain health, vitamin absorption
- Most calorie-dense macro (9 cal vs 4 cal per gram)
- Healthy sources: avocado, nuts, olive oil, fatty fish`,
        keyTakeaways: ['Protein is king for body transformation', 'Carbs are energy, not the enemy', 'Fat is essential but calorie-dense', 'All three macros are important'],
        quiz: [
          { question: 'Which macro has the highest thermic effect?', options: ['Carbs', 'Fat', 'Protein', 'They\'re equal'], correct: 2 },
          { question: 'How many calories per gram of fat?', options: ['4', '7', '9', '12'], correct: 2 },
        ],
      },
    ],
  },
  {
    id: 'mod2', 
    title: 'Training Fundamentals', 
    badge: 'Training Expert',
    lessons: [
      {
        id: 'l5', 
        title: 'Why Muscle Matters', 
        readTime: 3,
        content: `Many people, especially those wanting to lose weight, avoid building muscle. This is a HUGE mistake.

Muscle burns calories 24/7. Each pound of muscle burns ~6-10 calories per day at rest. Each pound of fat burns only ~2 calories.

Muscle gives you the "toned" look. That lean, defined physique everyone wants? That's muscle with low body fat.

You WON'T get "bulky." Building significant muscle takes YEARS of dedicated training.`,
        keyTakeaways: ['Muscle increases metabolism 24/7', 'You cannot tone → only build muscle and lose fat', "You won't accidentally get bulky", 'Resistance training is essential'],
        quiz: [
          { question: 'How many calories does 1 lb of muscle burn daily at rest?', options: ['1-2', '6-10', '20-30', '50+'], correct: 1 },
        ],
      },
    ],
  },
];

export default function EducationHub() {
  const { user } = useAuthStore();
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [expandedModule, setExpandedModule] = useState<string | null>(modules[0].id);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    if (user) loadProgress();
  }, [user]);

  const loadProgress = async () => {
    if (!user) return;
    try {
      const progressDoc = await getDoc(doc(db, 'users', user.uid, 'education', 'progress'));
      if (progressDoc.exists()) {
        setCompletedLessons(new Set(progressDoc.data().completedLessons || []));
      }
    } catch (err) { console.error(err); }
  };

  const completeLesson = async (lessonId: string) => {
    if (!user) return;
    const updated = new Set(completedLessons);
    updated.add(lessonId);
    setCompletedLessons(updated);

    try {
      await setDoc(doc(db, 'users', user.uid, 'education', 'progress'), {
        completedLessons: Array.from(updated),
        updatedAt: new Date().toISOString(),
      });
      toast.success('Lesson completed!');
    } catch (err) { console.error(err); }
  };

  const totalLessons = modules.reduce((s, m) => s + m.lessons.length, 0);
  const completedCount = completedLessons.size;
  const progress = totalLessons > 0 ? (completedCount / totalLessons) * 100 : 0;

  return (
    <div className="p-4 pb-24 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-brand-dark dark:text-white">Education Hub</h1>
          <p className="text-sm text-gray-500">Learn the science of fitness</p>
        </div>
        <div className="w-12 h-12 rounded-xl bg-brand-lavender/20 flex items-center justify-center">
          <BookOpen className="w-6 h-6 text-brand-purple" />
        </div>
      </div>

      {/* Progress Card */}
      <Card>
        <div className="p-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm text-gray-500">Your Progress</p>
              <p className="text-2xl font-bold text-brand-dark dark:text-white">
                {completedCount}/{totalLessons} <span className="text-sm font-normal text-gray-400">lessons</span>
              </p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-black text-brand-purple">{Math.round(progress)}%</p>
            </div>
          </div>
          <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              className="h-full bg-gradient-to-r from-brand-purple to-brand-lavender rounded-full"
            />
          </div>
        </div>
      </Card>

      {/* Modules */}
      <StaggerContainer className="space-y-3">
        {modules.map((mod) => {
          const modCompleted = mod.lessons.filter((l) => completedLessons.has(l.id)).length;
          const allDone = modCompleted === mod.lessons.length;
          const isExpanded = expandedModule === mod.id;

          return (
            <StaggerItem key={mod.id}>
              <Card>
                <button
                  onClick={() => setExpandedModule(isExpanded ? null : mod.id)}
                  className="w-full p-4 text-left"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        'w-10 h-10 rounded-lg flex items-center justify-center',
                        allDone ? 'bg-green-100 text-green-600' : 'bg-brand-lavender/20 text-brand-purple'
                      )}>
                        {allDone ? <Award className="w-5 h-5" /> : <BookOpen className="w-5 h-5" />}
                      </div>
                      <div>
                        <h3 className="font-bold text-brand-dark dark:text-white">{mod.title}</h3>
                        <p className="text-xs text-gray-400">{modCompleted}/{mod.lessons.length} lessons</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {allDone && (
                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">
                          {mod.badge}
                        </span>
                      )}
                      {isExpanded ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                    </div>
                  </div>
                </button>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-4 space-y-2 border-t border-gray-100 dark:border-gray-800 pt-3">
                        {mod.lessons.map((lesson) => {
                          const isDone = completedLessons.has(lesson.id);
                          return (
                            <button
                              key={lesson.id}
                              onClick={() => {
                                setSelectedLesson(lesson);
                                setQuizAnswers({});
                                setShowResults(false);
                              }}
                              className={cn(
                                'w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all',
                                isDone ? 'bg-green-50 dark:bg-green-900/10' : 'bg-gray-50 dark:bg-brand-surface/30 hover:bg-gray-100'
                              )}
                            >
                              <div className={cn(
                                'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0',
                                isDone ? 'bg-green-500 text-white' : 'bg-gray-200 dark:bg-gray-600'
                              )}>
                                {isDone ? <Check className="w-4 h-4" /> : <span className="text-xs font-bold text-gray-500">{lesson.readTime}m</span>}
                              </div>
                              <span className={cn('text-sm font-medium', isDone ? 'text-green-700 dark:text-green-400' : 'text-gray-700 dark:text-gray-300')}>
                                {lesson.title}
                              </span>
                              <ChevronRight className="w-4 h-4 text-gray-300 ml-auto" />
                            </button>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            </StaggerItem>
          );
        })}
      </StaggerContainer>

      {/* Lesson Modal */}
      <AnimatePresence>
        {selectedLesson && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-0 sm:p-4"
            onClick={() => setSelectedLesson(null)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="bg-white dark:bg-brand-surface w-full max-w-lg max-h-[90vh] rounded-t-3xl sm:rounded-3xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 overflow-y-auto max-h-[90vh]">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-brand-dark dark:text-white">{selectedLesson.title}</h2>
                  <button onClick={() => setSelectedLesson(null)} className="p-2 hover:bg-gray-100 rounded-full">
                    <ChevronDown className="w-5 h-5" />
                  </button>
                </div>

                <p className="text-xs text-gray-400 mb-4">{selectedLesson.readTime} min read</p>

                <div className="prose prose-sm max-w-none text-sm leading-relaxed text-gray-700 dark:text-gray-300 mb-6">
                  {selectedLesson.content.split('\n\n').map((p, i) => (
                    <p key={i} className="mb-3">{p}</p>
                  ))}
                </div>

                {/* Key Takeaways */}
                <div className="bg-brand-lavender/10 rounded-xl p-4 mb-6">
                  <h4 className="font-bold text-brand-purple dark:text-brand-lavender mb-2">Key Takeaways</h4>
                  <ul className="space-y-1">
                    {selectedLesson.keyTakeaways.map((t, i) => (
                      <li key={i} className="flex gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                        {t}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Quiz */}
                {selectedLesson.quiz.length > 0 && (
                  <div className="mb-6">
                    <h4 className="font-bold text-brand-dark dark:text-white mb-3">Quick Quiz</h4>
                    {selectedLesson.quiz.map((q, qi) => (
                      <div key={qi} className="mb-4">
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{q.question}</p>
                        <div className="space-y-2">
                          {q.options.map((opt, oi) => {
                            const selected = quizAnswers[qi] === oi;
                            const isCorrect = showResults && oi === q.correct;
                            const isWrong = showResults && selected && oi !== q.correct;

                            return (
                              <button
                                key={oi}
                                onClick={() => !showResults && setQuizAnswers({ ...quizAnswers, [qi]: oi })}
                                className={cn(
                                  'w-full p-3 rounded-xl text-left text-sm font-medium transition-all',
                                  isCorrect ? 'bg-green-100 text-green-700 ring-2 ring-green-500' :
                                  isWrong ? 'bg-red-100 text-red-700 ring-2 ring-red-500' :
                                  selected ? 'bg-brand-lavender/20 ring-2 ring-brand-purple' :
                                  'bg-gray-50 text-gray-600 hover:bg-gray-100'
                                )}
                              >
                                {opt}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}

                    {!showResults && Object.keys(quizAnswers).length === selectedLesson.quiz.length && (
                      <Button onClick={() => setShowResults(true)} variant="outline" fullWidth size="sm">
                        Check Answers
                      </Button>
                    )}
                  </div>
                )}

                <Button
                  onClick={() => {
                    completeLesson(selectedLesson.id);
                    setSelectedLesson(null);
                  }}
                  variant="primary"
                  fullWidth
                  leftIcon={<Check className="w-4 h-4" />}
                >
                  {completedLessons.has(selectedLesson.id) ? 'Read Again' : 'Mark as Complete'}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}