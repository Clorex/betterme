export type PlateauGoal = 'lose' | 'gain';

export interface PlateauResult {
  isPlateaued: boolean;
  message: string;
  strategies: string[];
  windowDays: number;
  avgPrev: number;
  avgLast: number;
  delta: number; // avgLast - avgPrev (kg)
}

type WeightEntryLike = { date: string; weight: number };

function avg(nums: number[]) {
  return nums.reduce((s, n) => s + n, 0) / (nums.length || 1);
}

export function detectPlateau(
  entries: WeightEntryLike[],
  goal: PlateauGoal,
  windowDays: number = 14
): PlateauResult {
  const cleaned = (entries || [])
    .filter((e) => e && typeof e.weight === 'number' && e.date)
    .map((e) => ({ date: e.date, weight: e.weight }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  if (cleaned.length < windowDays * 2) {
    return {
      isPlateaued: false,
      message: '',
      strategies: [],
      windowDays,
      avgPrev: 0,
      avgLast: 0,
      delta: 0,
    };
  }

  const last = cleaned.slice(-windowDays);
  const prev = cleaned.slice(-(windowDays * 2), -windowDays);

  const avgLast = Number(avg(last.map((x) => x.weight)).toFixed(2));
  const avgPrev = Number(avg(prev.map((x) => x.weight)).toFixed(2));
  const delta = Number((avgLast - avgPrev).toFixed(2));

  const loseThreshold = -0.2;
  const gainThreshold = 0.2;

  const isPlateaued = goal === 'lose' ? delta > loseThreshold : delta < gainThreshold;

  if (!isPlateaued) {
    return {
      isPlateaued: false,
      message: '',
      strategies: [],
      windowDays,
      avgPrev,
      avgLast,
      delta,
    };
  }

  const directionText =
    goal === 'lose' ? 'not trending down as expected' : 'not trending up as expected';

  const message =
    `Your last ${windowDays} days averaged **${avgLast} kg** vs the previous ${windowDays} days at **${avgPrev} kg** ` +
    `(Δ ${delta > 0 ? '+' : ''}${delta} kg). This suggests your weight is ${directionText}.`;

  const strategiesLose = [
    '**Track intake for 7 days**: hidden calories (oils, snacks, drinks) add up fast.',
    '**Increase NEAT**: add 2–4k steps/day for the next 10–14 days.',
    '**Tighten weekends**: keep calories consistent Fri–Sun.',
    '**Protein + fiber**: prioritize lean protein and high-fiber foods for satiety.',
    '**Deload 1 week**: reduce training stress to lower water retention.',
    '**Sleep & stress**: aim 7–9h; high stress can mask fat loss via water.',
  ];

  const strategiesGain = [
    '**Add calories**: +150–250 kcal/day for the next 2 weeks.',
    '**Improve consistency**: hit your calorie/protein targets every day.',
    '**Progressive overload**: ensure weights or reps increase weekly.',
    '**Reduce excess cardio** (if needed): too much can cancel the surplus.',
    '**Sleep**: 7–9h improves recovery and growth.',
    '**Check weigh-in method**: same time, similar hydration each weigh-in.',
  ];

  return {
    isPlateaued: true,
    message,
    strategies: goal === 'lose' ? strategiesLose : strategiesGain,
    windowDays,
    avgPrev,
    avgLast,
    delta,
  };
}
