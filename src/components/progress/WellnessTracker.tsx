// src/components/progress/WellnessTracker.tsx
'use client';

import { useState, useEffect } from 'react';
import { Moon, Smile, Zap, Brain, Save } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useAuthStore } from '@/store/authStore';
import { doc, getDoc, setDoc, collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { format, subDays } from 'date-fns';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';
import {
  LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip,
} from 'recharts';

const moodEmojis = ['😢', '😕', '😐', '🙂', '😄'];
const energyLevels = ['🪫', '🔋', '🔋🔋', '🔋🔋🔋', '⚡'];
const stressLevels = ['😌', '😊', '😐', '😰', '🤯'];

export default function WellnessTracker() {
  const { user } = useAuthStore();
  const [mood, setMood] = useState(3);
  const [energy, setEnergy] = useState(3);
  const [stress, setStress] = useState(2);
  const [sleepHours, setSleepHours] = useState('7.5');
  const [sleepQuality, setSleepQuality] = useState(3);
  const [bedtime, setBedtime] = useState('23:00');
  const [wakeTime, setWakeTime] = useState('06:30');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [todayLogged, setTodayLogged] = useState(false);
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      checkToday();
      fetchHistory();
    }
  }, [user]);

  const checkToday = async () => {
    if (!user) return;
    const today = format(new Date(), 'yyyy-MM-dd');
    try {
      const moodDoc = await getDoc(doc(db, 'users', user.uid, 'mood', today));
      if (moodDoc.exists()) {
        const data = moodDoc.data();
        setMood(data.mood || 3);
        setEnergy(data.energy || 3);
        setStress(data.stress || 2);
        setNote(data.note || '');
        setTodayLogged(true);
      }
      const sleepDoc = await getDoc(doc(db, 'users', user.uid, 'sleep', today));
      if (sleepDoc.exists()) {
        const data = sleepDoc.data();
        setSleepHours(String(data.duration || '7.5'));
        setSleepQuality(data.quality || 3);
        setBedtime(data.bedtime || '23:00');
        setWakeTime(data.wakeTime || '06:30');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchHistory = async () => {
    if (!user) return;
    try {
      const moodRef = collection(db, 'users', user.uid, 'mood');
      const q = query(moodRef, orderBy('date', 'desc'), limit(30));
      const snap = await getDocs(q);
      setHistory(snap.docs.map((d) => d.data()).reverse());
    } catch (err) {
      console.error(err);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const today = format(new Date(), 'yyyy-MM-dd');

    try {
      await setDoc(doc(db, 'users', user.uid, 'mood', today), {
        mood, energy, stress, note, date: today, createdAt: new Date().toISOString(),
      });
      await setDoc(doc(db, 'users', user.uid, 'sleep', today), {
        duration: parseFloat(sleepHours),
        quality: sleepQuality,
        bedtime, wakeTime,
        date: today,
        createdAt: new Date().toISOString(),
      });

      toast.success('Wellness check-in saved! ✨');
      setTodayLogged(true);
      fetchHistory();
    } catch (err) {
      toast.error('Failed to save');
    }
    setSaving(false);
  };

  // Correlations (simple)
  const getInsights = () => {
    if (history.length < 7) return [];
    const insights: string[] = [];

    const highMoodDays = history.filter((h) => h.mood >= 4);
    const lowMoodDays = history.filter((h) => h.mood <= 2);

    if (highMoodDays.length > lowMoodDays.length * 2) {
      insights.push('🎉 Your mood has been mostly positive recently. Keep it up!');
    }

    const highEnergyAvg = history.filter((h) => h.energy >= 4).length / history.length;
    if (highEnergyAvg < 0.3) {
      insights.push('⚡ Your energy has been low. Check your sleep and nutrition.');
    }

    const highStressDays = history.filter((h) => h.stress >= 4).length;
    if (highStressDays > history.length * 0.4) {
      insights.push('😰 Stress levels are elevated. Consider meditation or walks.');
    }

    return insights;
  };

  const chartData = history.map((h) => ({
    date: format(new Date(h.date), 'M/d'),
    mood: h.mood,
    energy: h.energy,
    stress: h.stress,
  }));

  return (
    <div className="space-y-4">
      {/* Quick Check-in */}
      <Card>
        <h3 className="mb-1 text-sm font-bold text-brand-dark dark:text-brand-white">
          {todayLogged ? '✅ Today\'s Check-in' : '📋 Daily Check-in'}
        </h3>
        <p className="mb-4 text-xs text-gray-400">Takes 10 seconds</p>

        {/* Mood */}
        <div className="mb-4">
          <p className="mb-2 text-xs font-semibold text-gray-500">How&apos;s your mood?</p>
          <div className="flex justify-between">
            {moodEmojis.map((emoji, i) => (
              <button
                key={i}
                onClick={() => setMood(i + 1)}
                className={cn(
                  'flex h-12 w-12 items-center justify-center rounded-xl text-2xl transition-all',
                  mood === i + 1
                    ? 'scale-110 bg-brand-lavender/20 ring-2 ring-brand-purple dark:ring-brand-lavender'
                    : 'bg-gray-50 dark:bg-brand-surface/50'
                )}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>

        {/* Energy */}
        <div className="mb-4">
          <p className="mb-2 text-xs font-semibold text-gray-500">Energy level?</p>
          <div className="flex justify-between">
            {energyLevels.map((level, i) => (
              <button
                key={i}
                onClick={() => setEnergy(i + 1)}
                className={cn(
                  'flex h-12 w-12 items-center justify-center rounded-xl text-lg transition-all',
                  energy === i + 1
                    ? 'scale-110 bg-yellow-100 ring-2 ring-yellow-500 dark:bg-yellow-900/30'
                    : 'bg-gray-50 dark:bg-brand-surface/50'
                )}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        {/* Stress */}
        <div className="mb-4">
          <p className="mb-2 text-xs font-semibold text-gray-500">Stress level?</p>
          <div className="flex justify-between">
            {stressLevels.map((level, i) => (
              <button
                key={i}
                onClick={() => setStress(i + 1)}
                className={cn(
                  'flex h-12 w-12 items-center justify-center rounded-xl text-2xl transition-all',
                  stress === i + 1
                    ? 'scale-110 bg-red-50 ring-2 ring-red-400 dark:bg-red-900/30'
                    : 'bg-gray-50 dark:bg-brand-surface/50'
                )}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        {/* Note */}
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Quick note (optional)"
          rows={2}
          className="w-full rounded-xl border border-gray-200 bg-white p-3 text-sm focus:border-brand-purple focus:outline-none dark:border-gray-700 dark:bg-brand-surface dark:text-brand-white"
        />
      </Card>

      {/* Sleep */}
      <Card>
        <h3 className="mb-3 text-sm font-bold text-brand-dark dark:text-brand-white">
          <Moon className="mr-1 inline h-4 w-4" /> Sleep
        </h3>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-xs text-gray-500">Bedtime</label>
            <input
              type="time"
              value={bedtime}
              onChange={(e) => setBedtime(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-brand-surface dark:text-brand-white"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-gray-500">Wake time</label>
            <input
              type="time"
              value={wakeTime}
              onChange={(e) => setWakeTime(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-brand-surface dark:text-brand-white"
            />
          </div>
        </div>

        <div className="mt-3">
          <label className="mb-1 block text-xs text-gray-500">Hours slept</label>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min="3"
              max="12"
              step="0.5"
              value={sleepHours}
              onChange={(e) => setSleepHours(e.target.value)}
              className="flex-1 accent-brand-purple"
            />
            <span className="min-w-[40px] text-center text-sm font-bold text-brand-dark dark:text-brand-white">
              {sleepHours}h
            </span>
          </div>
        </div>

        <div className="mt-3">
          <p className="mb-2 text-xs text-gray-500">Sleep quality</p>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((q) => (
              <button
                key={q}
                onClick={() => setSleepQuality(q)}
                className={cn(
                  'flex-1 rounded-xl py-2 text-xs font-bold transition-all',
                  sleepQuality === q
                    ? 'bg-indigo-500 text-white'
                    : 'bg-gray-100 text-gray-400 dark:bg-brand-surface'
                )}
              >
                {'⭐'.repeat(q)}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Save */}
      <Button onClick={handleSave} variant="primary" fullWidth loading={saving}>
        <Save className="mr-2 h-4 w-4" />
        {todayLogged ? 'Update Check-in' : 'Save Check-in'}
      </Button>

      {/* Trend Chart */}
      {chartData.length > 3 && (
        <Card>
          <h3 className="mb-3 text-xs font-bold text-gray-500 dark:text-gray-400">
            30-Day Trends
          </h3>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <XAxis dataKey="date" tick={{ fontSize: 9 }} interval="preserveStartEnd" />
                <YAxis domain={[0, 6]} tick={{ fontSize: 9 }} width={20} />
                <Tooltip contentStyle={{ borderRadius: 12, fontSize: 11, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                <Line type="monotone" dataKey="mood" stroke="#22C55E" strokeWidth={2} dot={false} name="Mood" />
                <Line type="monotone" dataKey="energy" stroke="#F59E0B" strokeWidth={2} dot={false} name="Energy" />
                <Line type="monotone" dataKey="stress" stroke="#EF4444" strokeWidth={2} dot={false} name="Stress" />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 flex justify-center gap-4 text-[10px]">
            <span className="flex items-center gap-1"><span className="h-0.5 w-3 rounded bg-green-500" /> Mood</span>
            <span className="flex items-center gap-1"><span className="h-0.5 w-3 rounded bg-yellow-500" /> Energy</span>
            <span className="flex items-center gap-1"><span className="h-0.5 w-3 rounded bg-red-500" /> Stress</span>
          </div>
        </Card>
      )}

      {/* Insights */}
      {getInsights().length > 0 && (
        <Card>
          <h3 className="mb-2 text-xs font-bold text-gray-500 dark:text-gray-400">
            <Brain className="mr-1 inline h-3.5 w-3.5" /> Insights
          </h3>
          <div className="space-y-2">
            {getInsights().map((insight, i) => (
              <p key={i} className="text-xs leading-relaxed text-gray-600 dark:text-gray-300">
                {insight}
              </p>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}