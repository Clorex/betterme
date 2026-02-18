// src/lib/plateauDetector.ts
import { differenceInDays } from 'date-fns';

interface WeightEntry {
  date: string;
  weight: number;
}

interface PlateauResult {
  isPlateaued: boolean;
  daysSinceChange: number;
  strategies: string[];
  message: string;
}

export function detectPlateau(entries: WeightEntry[], goal: 'lose' | 'gain'): PlateauResult {
  if (entries.length < 14) {
    return { isPlateaued: false, daysSinceChange: 0, strategies: [], message: '' };
  }

  const recent14 = entries.slice(-14);
  const weights = recent14.map((e) => e.weight);

  const maxWeight = Math.max(...weights);
  const minWeight = Math.min(...weights);
  const range = maxWeight - minWeight;

  // Plateau = weight variance less than 0.5kg over 14 days
  const isPlateaued = range < 0.5;

  if (!isPlateaued) {
    return { isPlateaued: false, daysSinceChange: 0, strategies: [], message: '' };
  }

  const daysSinceChange = differenceInDays(
    new Date(recent14[recent14.length - 1].date),
    new Date(recent14[0].date)
  );

  const strategies = [
    {
      title: 'Diet Break',
      desc: 'Eat at maintenance calories for 1 week. This can reset hormones and metabolism.',
    },
    {
      title: 'Refeed Day',
      desc: 'Have 1 high-carb day (maintenance calories). Carbs boost leptin, which regulates hunger.',
    },
    {
      title: 'Recalculate TDEE',
      desc: 'Your body may have adapted. Recalculate your calorie target based on current weight.',
    },
    {
      title: 'Change Workout Program',
      desc: 'Your muscles may have adapted. Try a new training stimulus — different exercises, rep ranges, or split.',
    },
    {
      title: 'Check Sleep & Stress',
      desc: 'Poor sleep and high stress elevate cortisol, which causes water retention and stalls fat loss.',
    },
    {
      title: 'Increase NEAT',
      desc: 'Add more non-exercise movement: walk more, take stairs, stand at desk. This can burn 200-400 extra calories daily.',
    },
  ];

  return {
    isPlateaued: true,
    daysSinceChange,
    strategies: strategies.map((s) => `**${s.title}**: ${s.desc}`),
    message: `Your weight hasn't changed significantly in ${daysSinceChange} days. This is a normal plateau — your body is adapting. Here are strategies to break through it.`,
  };
}