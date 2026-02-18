// src/components/progress/WeightTracker.tsx
'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Scale,
  TrendingDown,
  TrendingUp,
  Minus,
  Plus,
  Target,
  Calendar,
} from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from "@/components/ui/Button";
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import { useAuthStore } from '@/store/authStore';
import { detectPlateau } from '@/lib/plateauDetector';
import {
  collection,
  query,
  orderBy,
  limit,
  getDocs,
  doc,
  setDoc,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { format, subDays, differenceInDays } from 'date-fns';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';

interface WeightEntry {
  date: string;
  weight: number;
  note?: string;
}

export default function WeightTracker() {
  const { user, userProfile } = useAuthStore();
  const [entries, setEntries] = useState<WeightEntry[]>([]);
  const [showLogModal, setShowLogModal] = useState(false);
  const [newWeight, setNewWeight] = useState('');
  const [newNote, setNewNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [timeRange, setTimeRange] = useState<'1W' | '1M' | '3M' | '6M' | '1Y' | 'ALL'>('1M');

  const startWeight = userProfile?.profile?.currentWeight || 0;
  const targetWeight = userProfile?.profile?.targetWeight || 0;
  const currentWeight = entries.length > 0 ? entries[entries.length - 1].weight : startWeight;
  const totalChange = currentWeight - startWeight;

  useEffect(() => {
    if (user) fetchEntries();
  }, [user]);

  const fetchEntries = async () => {
    if (!user) return;
    try {
      const ref = collection(db, 'users', user.uid, 'measurements');
      const q = query(ref, orderBy('date', 'asc'), limit(365));
      const snap = await getDocs(q);
      const data = snap.docs
        .filter((d) => d.data().weight)
        .map((d) => ({
          date: d.data().date,
          weight: d.data().weight,
          note: d.data().note,
        }));
      setEntries(data);
    } catch (err) {
      console.error('Error fetching weights:', err);
    }
  };

  const handleLog = async () => {
    if (!user || !newWeight) return;
    setSaving(true);
    const today = format(new Date(), 'yyyy-MM-dd');
    const weightNum = parseFloat(newWeight);

    try {
      await setDoc(
        doc(db, 'users', user.uid, 'measurements', today),
        {
          weight: weightNum,
          note: newNote || null,
          date: today,
          createdAt: new Date().toISOString(),
        },
        { merge: true }
      );

      await setDoc(
        doc(db, 'users', user.uid),
        { metrics: { currentWeight: weightNum }, updatedAt: new Date().toISOString() },
        { merge: true }
      );

      toast.success('Weight logged! ⚖️');
      setShowLogModal(false);
      setNewWeight('');
      setNewNote('');
      fetchEntries();
    } catch (err) {
      toast.error('Failed to log weight');
    }
    setSaving(false);
  };

  // Filter by time range
  const filteredEntries = useMemo(() => {
    const now = new Date();
    const cutoff: Record<string, Date | null> = {
      '1W': subDays(now, 7),
      '1M': subDays(now, 30),
      '3M': subDays(now, 90),
      '6M': subDays(now, 180),
      '1Y': subDays(now, 365),
      ALL: null,
    };
    const start = cutoff[timeRange];
    if (!start) return entries;
    return entries.filter((e) => new Date(e.date) >= start);
  }, [entries, timeRange]);

  // 7-day moving average
  const chartData = useMemo(() => {
    return filteredEntries.map((entry, idx) => {
      const window = filteredEntries.slice(Math.max(0, idx - 6), idx + 1);
      const avg = window.reduce((s, e) => s + e.weight, 0) / window.length;
      return {
        date: format(new Date(entry.date), 'MMM d'),
        weight: entry.weight,
        average: parseFloat(avg.toFixed(1)),
      };
    });
  }, [filteredEntries]);

  // Weekly avg change
  const weeklyChange = useMemo(() => {
    if (entries.length < 7) return 0;
    const recent = entries.slice(-7);
    const prior = entries.slice(-14, -7);
    if (prior.length === 0) return 0;
    const recentAvg = recent.reduce((s, e) => s + e.weight, 0) / recent.length;
    const priorAvg = prior.reduce((s, e) => s + e.weight, 0) / prior.length;
    return parseFloat((recentAvg - priorAvg).toFixed(1));
  }, [entries]);

  // Goal date estimate
  const estimatedGoalDate = useMemo(() => {
    if (!targetWeight || !weeklyChange || weeklyChange === 0) return null;
    const remaining = targetWeight - currentWeight;
    if ((remaining > 0 && weeklyChange < 0) || (remaining < 0 && weeklyChange > 0)) return null;
    const weeksLeft = Math.abs(remaining / weeklyChange);
    if (weeksLeft > 104) return null; // more than 2 years
    const date = new Date();
    date.setDate(date.getDate() + weeksLeft * 7);
    return format(date, 'MMM d, yyyy');
  }, [currentWeight, targetWeight, weeklyChange]);

  return (
    <div className="space-y-4">
      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-2">
        <Card padding="sm">
          <p className="text-[10px] text-gray-400">Current</p>
          <p className="text-lg font-bold text-brand-dark dark:text-brand-white">
            {currentWeight}<span className="text-xs font-normal text-gray-400"> kg</span>
          </p>
        </Card>
        <Card padding="sm">
          <p className="text-[10px] text-gray-400">Change</p>
          <div className="flex items-center gap-1">
            {totalChange < 0 ? (
              <TrendingDown className="h-3.5 w-3.5 text-green-500" />
            ) : totalChange > 0 ? (
              <TrendingUp className="h-3.5 w-3.5 text-red-500" />
            ) : (
              <Minus className="h-3.5 w-3.5 text-gray-400" />
            )}
            <p
              className={cn(
                'text-lg font-bold',
                totalChange < 0 ? 'text-green-500' : totalChange > 0 ? 'text-red-500' : 'text-gray-400'
              )}
            >
              {totalChange > 0 ? '+' : ''}
              {totalChange.toFixed(1)}
            </p>
          </div>
        </Card>
        <Card padding="sm">
          <p className="text-[10px] text-gray-400">Target</p>
          <p className="text-lg font-bold text-brand-purple dark:text-brand-lavender">
            {targetWeight}<span className="text-xs font-normal text-gray-400"> kg</span>
          </p>
        </Card>
      </div>

      {/* Weekly Rate & Goal Estimate */}
      <Card padding="sm">
        <div className="flex items-center justify-between px-1">
          <div>
            <p className="text-[10px] text-gray-400">Weekly avg change</p>
            <p className={cn('text-sm font-bold', weeklyChange < 0 ? 'text-green-500' : weeklyChange > 0 ? 'text-red-500' : 'text-gray-400')}>
              {weeklyChange > 0 ? '+' : ''}{weeklyChange} kg/week
            </p>
          </div>
          {estimatedGoalDate && (
            <div className="text-right">
              <p className="text-[10px] text-gray-400">Estimated goal date</p>
              <p className="text-sm font-bold text-brand-purple dark:text-brand-lavender">
                {estimatedGoalDate}
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* Chart */}
      <Card>
        {/* Time Range Selector */}
        <div className="mb-3 flex gap-1">
          {(['1W', '1M', '3M', '6M', '1Y', 'ALL'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setTimeRange(r)}
              className={cn(
                'flex-1 rounded-lg py-1.5 text-[10px] font-bold transition-all',
                timeRange === r
                  ? 'bg-brand-purple text-white dark:bg-brand-lavender dark:text-brand-dark'
                  : 'text-gray-400'
              )}
            >
              {r}
            </button>
          ))}
        </div>

        {chartData.length > 1 ? (
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 10 }}
                  interval="preserveStartEnd"
                  tickLine={false}
                />
                <YAxis
                  domain={['dataMin - 1', 'dataMax + 1']}
                  tick={{ fontSize: 10 }}
                  tickLine={false}
                  width={35}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    fontSize: 12,
                    border: 'none',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  }}
                />
                {targetWeight > 0 && (
                  <ReferenceLine
                    y={targetWeight}
                    stroke="#22C55E"
                    strokeDasharray="5 5"
                    label={{ value: 'Goal', fontSize: 10, fill: '#22C55E' }}
                  />
                )}
                <Line
                  type="monotone"
                  dataKey="weight"
                  stroke="#DBB5EE"
                  strokeWidth={2}
                  dot={{ r: 3, fill: '#DBB5EE' }}
                  activeDot={{ r: 5 }}
                />
                <Line
                  type="monotone"
                  dataKey="average"
                  stroke="#4C0585"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="flex h-48 items-center justify-center">
            <p className="text-sm text-gray-400">Log more weights to see your trend</p>
          </div>
        )}

        <div className="mt-2 flex items-center justify-center gap-4 text-[10px] text-gray-400">
          <span className="flex items-center gap-1">
            <span className="h-0.5 w-4 rounded bg-brand-lavender" /> Daily
          </span>
          <span className="flex items-center gap-1">
            <span className="h-0.5 w-4 rounded border-b border-dashed border-brand-purple" /> 7-day avg
          </span>
          {targetWeight > 0 && (
            <span className="flex items-center gap-1">
              <span className="h-0.5 w-4 rounded border-b border-dashed border-green-500" /> Goal
            </span>
          )}
        </div>
      </Card>

      {/* Plateau Detection Alert */}
      {(() => {
        const goal =
          userProfile?.profile?.goal?.includes('lose') ||
          userProfile?.profile?.goal?.includes('lean')
            ? ('lose' as const)
            : ('gain' as const);
        const plateau = detectPlateau(entries, goal);

        if (!plateau.isPlateaued) return null;

        return (
          <Card>
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900/30">
                <span className="text-xl">⚠️</span>
              </div>
              <div>
                <h3 className="text-sm font-bold text-yellow-700 dark:text-yellow-400">
                  Plateau Detected
                </h3>
                <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                  {plateau.message}
                </p>
              </div>
            </div>

            <div className="mt-3 rounded-xl bg-yellow-50 p-3 dark:bg-yellow-900/10">
              <p className="mb-2 text-xs font-bold text-yellow-700 dark:text-yellow-400">
                Strategies to break through:
              </p>
              <ul className="space-y-2 text-xs text-gray-600 dark:text-gray-400">
                {plateau.strategies.slice(0, 4).map((s, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="text-yellow-500">•</span>
                    <span
                      dangerouslySetInnerHTML={{
                        __html: s.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>'),
                      }}
                    />
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-3 rounded-xl bg-green-50 p-3 dark:bg-green-900/10">
              <p className="text-xs font-medium text-green-700 dark:text-green-400">
                💪 Remember: Plateaus are NORMAL and TEMPORARY. They mean your body is adapting.
                Stay consistent and try one strategy at a time.
              </p>
            </div>
          </Card>
        );
      })()}

      {/* Log Button */}
      <Button
        onClick={() => {
          setNewWeight(String(currentWeight));
          setShowLogModal(true);
        }}
        variant="primary"
        fullWidth
        size="lg"
      >
        <Scale className="mr-2 h-5 w-5" />
        Log Today&apos;s Weight
      </Button>

      {/* Recent Entries */}
      {entries.length > 0 && (
        <Card>
          <h3 className="mb-2 text-xs font-bold text-gray-500 dark:text-gray-400">Recent Entries</h3>
          <div className="space-y-1.5">
            {entries.slice(-7).reverse().map((e, i) => (
              <div key={i} className="flex items-center justify-between rounded-lg px-2 py-1.5 text-xs odd:bg-gray-50 dark:odd:bg-brand-surface/30">
                <span className="text-gray-500">{format(new Date(e.date), 'MMM d, yyyy')}</span>
                <span className="font-bold text-brand-dark dark:text-brand-white">{e.weight} kg</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Log Modal */}
      <Modal isOpen={showLogModal} onClose={() => setShowLogModal(false)} title="Log Weight">
        <div className="space-y-4">
          <Input
            label="Weight (kg)"
            type="number"
            step="0.1"
            value={newWeight}
            onChange={(e) => setNewWeight(e.target.value)}
            placeholder="70.5"
          />
          <Input
            label="Note (optional)"
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="Morning, fasted..."
          />
          <Button onClick={handleLog} variant="primary" fullWidth loading={saving}>
            Save
          </Button>
        </div>
      </Modal>
    </div>
  );
}