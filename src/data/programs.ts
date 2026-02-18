// src/data/programs.ts
export interface ProgramData {
  id: string;
  name: string;
  description: string;
  goal: string;
  duration: string;
  difficulty: string;
  daysPerWeek: number;
  timePerSession: string;
  equipment: string;
  targetAudience: string;
  overview: string[];
  emoji: string;
}

export const programs: ProgramData[] = [
  {
    id: 'prog001', name: 'COUCH TO FIT', description: 'Complete beginner to basic fitness in 12 weeks',
    goal: 'General Fitness', duration: '12 weeks', difficulty: 'Beginner', daysPerWeek: 3, timePerSession: '30 min', equipment: 'Bodyweight → light weights', targetAudience: 'Complete beginners',
    overview: ['Weeks 1-4: Basic movement patterns, flexibility, light cardio', 'Weeks 5-8: Introduce resistance training, increase intensity', 'Weeks 9-12: Full body workouts, progressive overload'], emoji: '🌱',
  },
  {
    id: 'prog002', name: 'SHRED 30', description: 'Rapid fat loss in 4 intense weeks',
    goal: 'Fat Loss', duration: '4 weeks', difficulty: 'Intermediate', daysPerWeek: 5, timePerSession: '45 min', equipment: 'Dumbbells, gym access', targetAudience: 'Intermediate with fat loss goals',
    overview: ['5 training days: 3 strength, 2 HIIT', 'Supersets and circuits for max calorie burn', 'Progressive difficulty each week', 'Includes cardio finishers'], emoji: '🔥',
  },
  {
    id: 'prog003', name: 'MASS BUILDER', description: 'Maximum muscle growth for serious gains',
    goal: 'Build Muscle', duration: '16 weeks', difficulty: 'Intermediate', daysPerWeek: 4, timePerSession: '60 min', equipment: 'Full gym access', targetAudience: 'Intermediate lifters seeking size',
    overview: ['Push/Pull/Legs/Upper split', 'Focus on compound movements', 'Progressive overload tracking', 'Hypertrophy rep ranges (8-12)'], emoji: '💪',
  },
  {
    id: 'prog004', name: 'STRENGTH FOUNDATION', description: 'Build raw strength with proven methods',
    goal: 'Strength', duration: '12 weeks', difficulty: 'All Levels', daysPerWeek: 3, timePerSession: '60 min', equipment: 'Barbell, rack, bench', targetAudience: 'Anyone seeking strength',
    overview: ['Focus: Squat, Bench, Deadlift, OHP', 'Low reps, heavy weights (3-5 reps)', 'Linear progression model', 'Deload every 4th week'], emoji: '🏋️',
  },
  {
    id: 'prog005', name: 'HOME WARRIOR', description: 'Full body fitness with zero equipment',
    goal: 'Home Fitness', duration: '8 weeks', difficulty: 'All Levels', daysPerWeek: 4, timePerSession: '30 min', equipment: 'None (bodyweight only)', targetAudience: 'Home exercisers',
    overview: ['No equipment needed, no excuses', '4-day upper/lower/full/HIIT split', 'Progressive difficulty with harder variations', 'Apartment-friendly (no jumping option)'], emoji: '🏠',
  },
  {
    id: 'prog006', name: 'LEAN & TONE', description: 'Slim down and define muscles',
    goal: 'Toning', duration: '8 weeks', difficulty: 'Beginner-Intermediate', daysPerWeek: 4, timePerSession: '40 min', equipment: 'Dumbbells, resistance bands', targetAudience: 'Those wanting definition',
    overview: ['Mix of strength and cardio circuits', 'Full body and targeted workouts', 'Light weights, higher reps (12-20)', 'Includes yoga/stretch days'], emoji: '✨',
  },
  {
    id: 'prog007', name: 'OVER 50 VITALITY', description: 'Safe, age-appropriate fitness for longevity',
    goal: 'Health & Longevity', duration: 'Ongoing', difficulty: 'Beginner', daysPerWeek: 3, timePerSession: '30 min', equipment: 'Light dumbbells, chair', targetAudience: 'Adults 50+',
    overview: ['Joint-friendly exercises', 'Balance and stability focus', 'Flexibility and mobility work', 'Gradual, safe progression'], emoji: '🌟',
  },
  {
    id: 'prog008', name: 'ATHLETE PERFORMANCE', description: 'Peak performance for competitive athletes',
    goal: 'Athletic Performance', duration: '12 weeks', difficulty: 'Advanced', daysPerWeek: 5, timePerSession: '60-90 min', equipment: 'Full gym + plyometrics', targetAudience: 'Advanced athletes',
    overview: ['Periodized training phases', 'Speed, power, and agility drills', 'Sport-specific conditioning', 'Recovery and mobility protocols'], emoji: '🏆',
  },
];