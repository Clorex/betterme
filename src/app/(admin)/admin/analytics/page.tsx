"use client";

import { useState, useEffect } from "react";
import { BarChart3, Activity, Target, Users, Loader2, TrendingUp } from "lucide-react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import { format, subDays } from "date-fns";

export default function AdminAnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [goalData, setGoalData] = useState<any[]>([]);
  const [dailyActiveData, setDailyActiveData] = useState<any[]>([]);
  const [retentionData, setRetentionData] = useState<any[]>([]);
  const [featureUsage, setFeatureUsage] = useState<any[]>([]);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      const usersSnap = await getDocs(collection(db, "users"));
      const users = usersSnap.docs.map((d) => d.data() as any);

      // Goal distribution
      const goals: Record<string, number> = {};
      users.forEach((u) => {
        // supports both shapes: u.profile.goal OR u.goal
        const goal = u.profile?.goal || u.goal || "not_set";
        goals[goal] = (goals[goal] || 0) + 1;
      });

      const goalArr = Object.entries(goals).map(([name, value]) => ({
        name: String(name).replace(/_/g, " "),
        value,
      }));
      setGoalData(goalArr);

      // Simulated daily active users (replace with real tracking later)
      const dau = Array.from({ length: 30 }, (_, i) => ({
        date: format(subDays(new Date(), 29 - i), "MMM d"),
        users: Math.floor(users.length * (0.2 + Math.random() * 0.3)),
      }));
      setDailyActiveData(dau);

      // Simulated retention
      setRetentionData([
        { period: "Day 1", retention: 85 },
        { period: "Day 3", retention: 62 },
        { period: "Day 7", retention: 45 },
        { period: "Day 14", retention: 32 },
        { period: "Day 30", retention: 22 },
        { period: "Day 60", retention: 15 },
        { period: "Day 90", retention: 12 },
      ]);

      // Simulated feature usage
      setFeatureUsage([
        { feature: "Food Tracker", usage: 78 },
        { feature: "AI Analyzer", usage: 65 },
        { feature: "Workouts", usage: 72 },
        { feature: "AI Coach", usage: 54 },
        { feature: "Meal Plans", usage: 48 },
        { feature: "Steps", usage: 42 },
        { feature: "Progress Photos", usage: 35 },
        { feature: "Community", usage: 28 },
      ]);
    } catch (error) {
      console.error("Error loading analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ["#4C0585", "#8b5cf6", "#DBB5EE", "#22C55E", "#F59E0B", "#EF4444", "#06B6D4"];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={32} className="animate-spin text-brand-purple" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-montserrat font-bold flex items-center gap-2">
          <BarChart3 size={24} className="text-brand-purple" />
          Analytics
        </h1>
        <p className="text-gray-400 text-sm mt-1">Detailed insights into app usage and user behavior</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Active Users */}
        <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Activity size={16} className="text-brand-purple" />
            Daily Active Users
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={dailyActiveData}>
              <defs>
                <linearGradient id="dauGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4C0585" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#4C0585" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#6b7280" }} />
              <YAxis tick={{ fontSize: 10, fill: "#6b7280" }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#111827",
                  border: "1px solid #374151",
                  borderRadius: "12px",
                  fontSize: "12px",
                }}
              />
              <Area type="monotone" dataKey="users" stroke="#4C0585" fill="url(#dauGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Goal Distribution */}
        <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Target size={16} className="text-brand-purple" />
            Goal Distribution
          </h3>

          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={goalData}
                cx="50%"
                cy="50%"
                outerRadius={90}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(((percent ?? 0) * 100).toFixed(0))}%`}
              >
                {goalData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "#111827",
                  border: "1px solid #374151",
                  borderRadius: "12px",
                  fontSize: "12px",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Retention */}
        <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <TrendingUp size={16} className="text-brand-purple" />
            Retention
          </h3>

          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={retentionData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
              <XAxis dataKey="period" tick={{ fontSize: 10, fill: "#6b7280" }} />
              <YAxis tick={{ fontSize: 10, fill: "#6b7280" }} unit="%" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#111827",
                  border: "1px solid #374151",
                  borderRadius: "12px",
                  fontSize: "12px",
                }}
                formatter={(value: any) => [`${value}%`, "Retention"]}
              />
              <Line type="monotone" dataKey="retention" stroke="#22C55E" strokeWidth={2} dot={{ fill: "#22C55E" }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Feature Usage */}
        <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Users size={16} className="text-brand-purple" />
            Feature Popularity (% of active users)
          </h3>

          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={featureUsage} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
              <XAxis type="number" tick={{ fontSize: 10, fill: "#6b7280" }} unit="%" />
              <YAxis type="category" dataKey="feature" tick={{ fontSize: 10, fill: "#6b7280" }} width={110} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#111827",
                  border: "1px solid #374151",
                  borderRadius: "12px",
                  fontSize: "12px",
                }}
                formatter={(value: any) => [`${value}%`, "Usage"]}
              />
              <Bar dataKey="usage" fill="#8b5cf6" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
