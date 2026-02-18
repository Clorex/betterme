// src/components/progress/AnalyticsDashboard.tsx
'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  TrendingUp,
  Target,
  Dumbbell,
  Droplets,
  Footprints,
  Moon,
  Flame,
  Award,
} from 'lucide-react';
import Card from '@/components/ui/Card';
import { useAuthStore } from '@/store/authStore';
import { useWorkoutStore } from '@/store/workoutStore';
import { collection, query, orderBy, limit, getDocs, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { format, subDays, startOfWeek, endOfWeek } from 'date-fns';
import { cn } from '@/lib/utils';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, ResponsiveContainer, Tooltip,
} from 'recharts';

export default function AnalyticsDashboard() {
  const { user, userProfile } = useAuthStore();
  const { workoutHistory, fetchHistory } = useWorkoutStore();
  const [foodLogs, setFoodLogs] = useState<any[]>([]);
  const [stepLogs, setStepLogs] = useState<any[]>([]);
  const [waterData, setWaterData] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      fetchHistory(user.uid);
      fetchFoodLogs();
      fetchStepLogs();
    }
  }, [user]);

  const fetchFoodLogs = async () => {
    if (!user) return;
    try {
      const ref = collection(db, 'users', user.uid, 'foodLogs');
      const q = query(ref, orderBy('date', 'desc'), limit(30));
      const snap = await getDocs(q);
      const logs = snap.docs.map((d) => d.data());
      setFoodLogs(logs);

      // Extract water data
      const water = logs.map((l) => ({
        date: format(new Date(l.date), 'M/d'),
        glasses: l.waterIntake?.glasses || 0,
      }));
      setWaterData(water.reverse());
    } catch (err) { console.error(err); }
  };

  const fetchStepLogs = async () => {
    if (!user) return;
    try {
      const ref = collection(db, 'users', user.uid, 'steps');
      const q = query(ref, orderBy('date', 'desc'), limit(30));
      const snap = await getDocs(q);
      setStepLogs(snap.docs.map((d) => d.data()).reverse());
    } catch (err) { console.error(err); }
  };

  // Calculate metrics
  const calorieGoal = userProfile?.metrics?.tdee || 2000;

  const weeklyReport = useMemo(() => {
    const now = new Date();
    const weekStart = startOfWeek(now, { weekStartsOn: 1 });

    const thisWeekFood = foodLogs.filter((l) => new Date(l.date) >= weekStart);
    const thisWeekWorkouts = workoutHistory.filter((w: any) => new Date(w.date) >= weekStart);

    let totalCals = 0;
    let totalProtein = 0;
    let daysOnTarget = 0;
    let waterDaysOnTarget = 0;

    thisWeekFood.forEach((log) => {
      let dayCals = 0;
      (log.meals || []).forEach((meal: any) => {
        dayCals += meal.totalCalories || 0;
        totalProtein += meal.totalProtein || 0;
      });
      totalCals += dayCals;
      if (Math.abs(dayCals - calorieGoal) < calorieGoal * 0.15) daysOnTarget++;
      if ((log.waterIntake?.glasses || 0) >= 8) waterDaysOnTarget++;
    });

    const daysLogged = thisWeekFood.length || 1;
    const avgCalories = Math.round(totalCals / daysLogged);
    const avgProtein = Math.round(totalProtein / daysLogged);

    const stepDaysOnTarget = stepLogs
      .filter((s) => new Date(s.date) >= weekStart && s.steps >= 10000)
      .length;

    return {
      nutritionAdherence: daysOnTarget,
      workoutsCompleted: thisWeekWorkouts.length,
      waterGoalHit: waterDaysOnTarget,
      stepGoalHit: stepDaysOnTarget,
      avgCalories,
      avgProtein,
      daysLogged,
    };
  }, [foodLogs, workoutHistory, stepLogs, calorieGoal]);

  // Overall score (0-100)
  const overallScore = useMemo(() => {
    const nutritionScore = (weeklyReport.nutritionAdherence / 7) * 25;
    const workoutScore = Math.min((weeklyReport.workoutsCompleted / 4) * 25, 25);
    const waterScore = (weeklyReport.waterGoalHit / 7) * 25;
    const stepScore = (weeklyReport.stepGoalHit / 7) * 25;
    return Math.round(nutritionScore + workoutScore + waterScore + stepScore);
  }, [weeklyReport]);

  // Calorie chart data
  const calorieChartData = useMemo(() => {
    return foodLogs.slice(0, 14).reverse().map((log) => {
      let total = 0;
      (log.meals || []).forEach((m: any) => { total += m.totalCalories || 0; });
      return {
        date: format(new Date(log.date), 'M/d'),
        calories: total,
        goal: calorieGoal,
      };
    });
  }, [foodLogs, calorieGoal]);

  // Workout frequency chart
  const workoutChartData = useMemo(() => {
    const weekMap: Record<string, number> = {};
    workoutHistory.slice(0, 30).forEach((w: any) => {
      const weekLabel = format(startOfWeek(new Date(w.date), { weekStartsOn: 1 }), 'M/d');
      weekMap[weekLabel] = (weekMap[weekLabel] || 0) + 1;
    });
    return Object.entries(weekMap).map(([week, count]) => ({ week, workouts: count })).reverse().slice(0, 6);
  }, [workoutHistory]);

  // Steps chart
  const stepsChartData = useMemo(() => {
    return stepLogs.slice(-14).map((s) => ({
      date: format(new Date(s.date), 'M/d'),
      steps: s.steps || 0,
    }));
  }, [stepLogs]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    if (score >= 40) return 'text-orange-500';
    return 'text-red-500';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent! 🌟';
    if (score >= 60) return 'Good! 👍';
    if (score >= 40) return 'Keep Going 💪';
    return 'Room to Grow 🌱';
  };

  return (
    <div className="space-y-4">
      {/* Overall Score */}
      <Card>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Transformation Score</p>
            <p className={cn('text-4xl font-extrabold', getScoreColor(overallScore))}>
              {overallScore}
              <span className="text-lg font-normal text-gray-400">/100</span>
            </p>
            <p className="text-sm text-gray-500">{getScoreLabel(overallScore)}</p>
          </div>
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-brand-purple to-brand-lavender">
            <Award className="h-8 w-8 text-white" />
          </div>
        </div>
      </Card>

      {/* Weekly Report Card */}
      <Card>
        <h3 className="mb-3 text-sm font-bold text-gray-500 dark:text-gray-400">
          📊 This Week
        </h3>
        <div className="grid grid-cols-2 gap-2">
          <StatCard
            icon={<Target className="h-4 w-4 text-green-500" />}
            label="Nutrition on target"
            value={`${weeklyReport.nutritionAdherence}/7 days`}
          />
          <StatCard
            icon={<Dumbbell className="h-4 w-4 text-blue-500" />}
            label="Workouts"
            value={`${weeklyReport.workoutsCompleted} completed`}
          />
          <StatCard
            icon={<Droplets className="h-4 w-4 text-cyan-500" />}
            label="Water goal hit"
            value={`${weeklyReport.waterGoalHit}/7 days`}
          />
          <StatCard
            icon={<Footprints className="h-4 w-4 text-emerald-500" />}
            label="Step goal hit"
            value={`${weeklyReport.stepGoalHit}/7 days`}
          />
          <StatCard
            icon={<Flame className="h-4 w-4 text-orange-500" />}
            label="Avg daily calories"
            value={`${weeklyReport.avgCalories} cal`}
          />
          <StatCard
            icon={<TrendingUp className="h-4 w-4 text-purple-500" />}
            label="Avg daily protein"
            value={`${weeklyReport.avgProtein}g`}
          />
        </div>
      </Card>

      {/* Calorie Chart */}
      {calorieChartData.length > 2 && (
        <Card>
          <h3 className="mb-3 text-xs font-bold text-gray-500 dark:text-gray-400">
            Calories: Intake vs Goal
          </h3>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={calorieChartData}>
                <XAxis dataKey="date" tick={{ fontSize: 9 }} />
                <YAxis tick={{ fontSize: 9 }} width={35} />
                <Tooltip contentStyle={{ borderRadius: 12, fontSize: 11, border: 'none' }} />
                <Bar dataKey="calories" fill="#DBB5EE" radius={[4, 4, 0, 0]} />
                <Bar dataKey="goal" fill="#E5E7EB" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-1 flex justify-center gap-4 text-[10px] text-gray-400">
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded bg-brand-lavender" /> Intake</span>
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded bg-gray-200" /> Goal</span>
          </div>
        </Card>
      )}

      {/* Workout Frequency */}
      {workoutChartData.length > 1 && (
        <Card>
          <h3 className="mb-3 text-xs font-bold text-gray-500 dark:text-gray-400">
            Weekly Workout Frequency
          </h3>
          <div className="h-32">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={workoutChartData}>
                <XAxis dataKey="week" tick={{ fontSize: 9 }} />
                <YAxis tick={{ fontSize: 9 }} width={20} allowDecimals={false} />
                <Tooltip contentStyle={{ borderRadius: 12, fontSize: 11, border: 'none' }} />
                <Bar dataKey="workouts" fill="#4C0585" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}

      {/* Steps Chart */}
      {stepsChartData.length > 2 && (
        <Card>
          <h3 className="mb-3 text-xs font-bold text-gray-500 dark:text-gray-400">
            Daily Steps
          </h3>
          <div className="h-32">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stepsChartData}>
                <XAxis dataKey="date" tick={{ fontSize: 9 }} />
                <YAxis tick={{ fontSize: 9 }} width={35} />
                <Tooltip contentStyle={{ borderRadius: 12, fontSize: 11, border: 'none' }} />
                <Bar dataKey="steps" fill="#22C55E" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-xl bg-gray-50 p-3 dark:bg-brand-surface/50">
      <div className="mb-1 flex items-center gap-1.5">
        {icon}
        <span className="text-[10px] text-gray-400">{label}</span>
      </div>
      <p className="text-sm font-bold text-brand-dark dark:text-brand-white">{value}</p>
    </div>
  );
}