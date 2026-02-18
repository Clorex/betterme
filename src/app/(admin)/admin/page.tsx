'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Users, CreditCard, Wallet, TrendingUp,
  Activity, Clock, UserPlus, AlertTriangle,
  ArrowUpRight, ArrowDownRight, DollarSign, Loader2
} from 'lucide-react';
import {
  collection, getDocs, query, where, orderBy, limit,
  Timestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Area, AreaChart
} from 'recharts';
import { format, subDays, startOfDay } from 'date-fns';

interface DashboardStats {
  totalUsers: number;
  activeSubscribers: number;
  monthlyRevenue: number;
  walletBalance: number;
  activeTrials: number;
  churnRate: number;
  userGrowth: number;
  revenueGrowth: number;
}

interface RecentActivity {
  id: string;
  type: 'signup' | 'subscription' | 'payment_failed' | 'report';
  message: string;
  timestamp: any;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    activeSubscribers: 0,
    monthlyRevenue: 0,
    walletBalance: 0,
    activeTrials: 0,
    churnRate: 0,
    userGrowth: 12.5,
    revenueGrowth: 8.3,
  });
  const [userGrowthData, setUserGrowthData] = useState<any[]>([]);
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [planDistribution, setPlanDistribution] = useState<any[]>([]);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Fetch total users
      const usersSnap = await getDocs(collection(db, 'users'));
      const totalUsers = usersSnap.size;

      // Count subscribers and trials
      let activeSubscribers = 0;
      let activeTrials = 0;
      let proCount = 0;
      let premiumCount = 0;
      let freeCount = 0;

      usersSnap.docs.forEach((doc) => {
        const data = doc.data();
        const sub = data.subscription;
        if (sub?.status === 'active') {
          activeSubscribers++;
          if (sub.plan === 'pro') proCount++;
          if (sub.plan === 'premium') premiumCount++;
        } else if (sub?.status === 'trial') {
          activeTrials++;
        } else {
          freeCount++;
        }
      });

      // Fetch wallet data
      let walletBalance = 0;
      let monthlyRevenue = 0;
      try {
        const walletSnap = await getDocs(collection(db, 'admin'));
        walletSnap.docs.forEach((doc) => {
          if (doc.id === 'wallet') {
            const data = doc.data();
            walletBalance = data.availableBalance || 0;
            monthlyRevenue = data.monthlyRevenue || 0;
          }
        });
      } catch {
        // Wallet collection may not exist yet
      }

      setStats({
        totalUsers,
        activeSubscribers,
        monthlyRevenue,
        walletBalance,
        activeTrials,
        churnRate: totalUsers > 0 ? Math.round((freeCount / totalUsers) * 100) : 0,
        userGrowth: 12.5,
        revenueGrowth: 8.3,
      });

      setPlanDistribution([
        { name: 'Free', value: freeCount, color: '#94a3b8' },
        { name: 'Trial', value: activeTrials, color: '#f59e0b' },
        { name: 'Pro', value: proCount, color: '#8b5cf6' },
        { name: 'Premium', value: premiumCount, color: '#4C0585' },
      ]);

      // Generate sample growth data (in production, aggregate from real data)
      const growthData = Array.from({ length: 30 }, (_, i) => ({
        date: format(subDays(new Date(), 29 - i), 'MMM d'),
        users: Math.floor(totalUsers * (0.5 + (i / 30) * 0.5) + Math.random() * 5),
        activeUsers: Math.floor(totalUsers * (0.3 + (i / 30) * 0.3) + Math.random() * 3),
      }));
      setUserGrowthData(growthData);

      const revData = Array.from({ length: 6 }, (_, i) => ({
        month: format(subDays(new Date(), (5 - i) * 30), 'MMM'),
        revenue: Math.floor(monthlyRevenue * (0.4 + (i / 6) * 0.6) + Math.random() * 100),
      }));
      setRevenueData(revData);

      // Fetch recent activity
      try {
        const activityQuery = query(
          collection(db, 'adminActivity'),
          orderBy('timestamp', 'desc'),
          limit(10)
        );
        const activitySnap = await getDocs(activityQuery);
        setRecentActivity(
          activitySnap.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as RecentActivity[]
        );
      } catch {
        // Activity collection may not exist yet
        setRecentActivity([]);
      }
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={32} className="animate-spin text-brand-purple" />
      </div>
    );
  }

  const statCards = [
    {
      label: 'Total Users',
      value: stats.totalUsers.toLocaleString(),
      change: `+${stats.userGrowth}%`,
      positive: true,
      icon: Users,
      color: 'from-blue-500 to-blue-600',
    },
    {
      label: 'Active Subscribers',
      value: stats.activeSubscribers.toLocaleString(),
      change: `${stats.activeSubscribers}`,
      positive: true,
      icon: CreditCard,
      color: 'from-purple-500 to-purple-600',
    },
    {
      label: 'Monthly Revenue',
      value: `$${stats.monthlyRevenue.toLocaleString()}`,
      change: `+${stats.revenueGrowth}%`,
      positive: true,
      icon: DollarSign,
      color: 'from-green-500 to-green-600',
    },
    {
      label: 'Wallet Balance',
      value: `$${stats.walletBalance.toLocaleString()}`,
      change: 'Available',
      positive: true,
      icon: Wallet,
      color: 'from-amber-500 to-amber-600',
    },
    {
      label: 'Active Trials',
      value: stats.activeTrials.toLocaleString(),
      change: '24hr trials',
      positive: true,
      icon: Clock,
      color: 'from-cyan-500 to-cyan-600',
    },
    {
      label: 'Churn Rate',
      value: `${stats.churnRate}%`,
      change: 'inactive users',
      positive: false,
      icon: AlertTriangle,
      color: 'from-red-500 to-red-600',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-montserrat font-bold">Dashboard</h1>
        <p className="text-gray-400 text-sm mt-1">
          Welcome back, Admin. Here&apos;s your overview.
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-gray-900 rounded-2xl p-4 border border-gray-800"
            >
              <div className="flex items-start justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center`}>
                  <Icon size={18} className="text-white" />
                </div>
                <span className={`flex items-center gap-0.5 text-xs font-medium ${
                  card.positive ? 'text-green-400' : 'text-red-400'
                }`}>
                  {card.positive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                  {card.change}
                </span>
              </div>
              <p className="text-2xl font-bold">{card.value}</p>
              <p className="text-xs text-gray-400 mt-1">{card.label}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth Chart */}
        <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
          <h3 className="font-semibold mb-4">User Growth (30 Days)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={userGrowthData}>
              <defs>
                <linearGradient id="userGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#6b7280' }} />
              <YAxis tick={{ fontSize: 10, fill: '#6b7280' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#111827',
                  border: '1px solid #374151',
                  borderRadius: '12px',
                  fontSize: '12px',
                }}
              />
              <Area
                type="monotone"
                dataKey="users"
                stroke="#8b5cf6"
                fill="url(#userGrad)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Revenue Chart */}
        <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
          <h3 className="font-semibold mb-4">Revenue (6 Months)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#6b7280' }} />
              <YAxis tick={{ fontSize: 10, fill: '#6b7280' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#111827',
                  border: '1px solid #374151',
                  borderRadius: '12px',
                  fontSize: '12px',
                }}
              />
              <Bar dataKey="revenue" fill="#4C0585" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Plan Distribution & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pie Chart */}
        <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
          <h3 className="font-semibold mb-4">Plan Distribution</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={planDistribution}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={4}
                dataKey="value"
              >
                {planDistribution.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#111827',
                  border: '1px solid #374151',
                  borderRadius: '12px',
                  fontSize: '12px',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-3 mt-2 justify-center">
            {planDistribution.map((entry) => (
              <div key={entry.name} className="flex items-center gap-1.5 text-xs">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                <span className="text-gray-400">{entry.name}</span>
                <span className="text-white font-medium">{entry.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-gray-900 rounded-2xl p-6 border border-gray-800">
          <h3 className="font-semibold mb-4">Recent Activity</h3>
          {recentActivity.length === 0 ? (
            <div className="text-center py-8">
              <Activity size={32} className="text-gray-600 mx-auto mb-2" />
              <p className="text-sm text-gray-500">No recent activity</p>
              <p className="text-xs text-gray-600 mt-1">
                Activity will appear here as users interact with the app
              </p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[300px] overflow-y-auto">
              {recentActivity.map((activity) => {
                const iconMap = {
                  signup: <UserPlus size={14} className="text-blue-400" />,
                  subscription: <CreditCard size={14} className="text-green-400" />,
                  payment_failed: <AlertTriangle size={14} className="text-red-400" />,
                  report: <AlertTriangle size={14} className="text-yellow-400" />,
                };
                return (
                  <div
                    key={activity.id}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-gray-800/50"
                  >
                    <div className="w-7 h-7 rounded-full bg-gray-800 flex items-center justify-center">
                      {iconMap[activity.type]}
                    </div>
                    <p className="text-sm text-gray-300 flex-1">{activity.message}</p>
                    <span className="text-[10px] text-gray-500">
                      {activity.timestamp?.toDate
                        ? format(activity.timestamp.toDate(), 'HH:mm')
                        : ''}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}