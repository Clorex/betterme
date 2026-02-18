'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Wallet, DollarSign, TrendingUp, ArrowDownToLine,
  ArrowUpRight, Clock, CheckCircle, XCircle,
  RefreshCw, Download, Filter, Search, Loader2,
  CreditCard, Building2, Smartphone
} from 'lucide-react';
import {
  collection, doc, getDoc, getDocs, setDoc,
  addDoc, updateDoc, query, orderBy, limit, serverTimestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, BarChart, Bar
} from 'recharts';
import { format, subDays } from 'date-fns';
import toast from 'react-hot-toast';

interface Transaction {
  id: string;
  type: 'subscription' | 'renewal' | 'refund' | 'withdrawal';
  amount: number;
  currency: string;
  userId?: string;
  userName?: string;
  userEmail?: string;
  plan?: string;
  status: 'completed' | 'pending' | 'failed' | 'refunded';
  reference: string;
  date: any;
}

interface WalletData {
  totalRevenue: number;
  availableBalance: number;
  pendingWithdrawals: number;
  monthlyRevenue: number;
  lastMonthRevenue: number;
}

export default function AdminWalletPage() {
  const [wallet, setWallet] = useState<WalletData>({
    totalRevenue: 0,
    availableBalance: 0,
    pendingWithdrawals: 0,
    monthlyRevenue: 0,
    lastMonthRevenue: 0,
  });
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [revenueChart, setRevenueChart] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawMethod, setWithdrawMethod] = useState('bank');
  const [withdrawing, setWithdrawing] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    loadWalletData();
  }, []);

  const loadWalletData = async () => {
    try {
      // Load wallet summary
      const walletRef = doc(db, 'admin', 'wallet');
      const walletSnap = await getDoc(walletRef);

      if (walletSnap.exists()) {
        setWallet(walletSnap.data() as WalletData);
      } else {
        // Initialize wallet if doesn't exist
        const initialWallet: WalletData = {
          totalRevenue: 0,
          availableBalance: 0,
          pendingWithdrawals: 0,
          monthlyRevenue: 0,
          lastMonthRevenue: 0,
        };
        await setDoc(walletRef, initialWallet);
        setWallet(initialWallet);
      }

      // Load transactions
      const transQuery = query(
        collection(db, 'transactions'),
        orderBy('date', 'desc'),
        limit(100)
      );
      const transSnap = await getDocs(transQuery);
      setTransactions(
        transSnap.docs.map((d) => ({ id: d.id, ...d.data() })) as Transaction[]
      );

      // Generate chart data
      const chartData = Array.from({ length: 30 }, (_, i) => ({
        date: format(subDays(new Date(), 29 - i), 'MMM d'),
        revenue: Math.floor(Math.random() * 200 + 50),
      }));
      setRevenueChart(chartData);
    } catch (error) {
      console.error('Error loading wallet:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async () => {
    const amount = parseFloat(withdrawAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Enter a valid amount');
      return;
    }
    if (amount > wallet.availableBalance) {
      toast.error('Insufficient balance');
      return;
    }

    setWithdrawing(true);
    try {
      // Record withdrawal
      await addDoc(collection(db, 'transactions'), {
        type: 'withdrawal',
        amount: -amount,
        currency: 'USD',
        status: 'pending',
        reference: `WDR-${Date.now()}`,
        method: withdrawMethod,
        date: serverTimestamp(),
      });

      // Update wallet
      await updateDoc(doc(db, 'admin', 'wallet'), {
        availableBalance: wallet.availableBalance - amount,
        pendingWithdrawals: wallet.pendingWithdrawals + amount,
      });

      setWallet((prev) => ({
        ...prev,
        availableBalance: prev.availableBalance - amount,
        pendingWithdrawals: prev.pendingWithdrawals + amount,
      }));

      toast.success(`Withdrawal of $${amount} initiated`);
      setShowWithdrawModal(false);
      setWithdrawAmount('');
      loadWalletData();
    } catch (error) {
      toast.error('Withdrawal failed');
    } finally {
      setWithdrawing(false);
    }
  };

  const exportTransactions = () => {
    const headers = 'Date,Type,Amount,Currency,User,Status,Reference\n';
    const rows = filteredTransactions
      .map(
        (t) =>
          `"${t.date?.toDate ? format(t.date.toDate(), 'yyyy-MM-dd HH:mm') : ''}","${t.type}","${
            t.amount
          }","${t.currency || 'USD'}","${t.userEmail || ''}","${t.status}","${t.reference}"`
      )
      .join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `transactions-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Transactions exported');
  };

  const filteredTransactions = transactions.filter((t) => {
    if (filterStatus !== 'all' && t.status !== filterStatus) return false;
    if (filterType !== 'all' && t.type !== filterType) return false;
    return true;
  });

  const revenueGrowth =
    wallet.lastMonthRevenue > 0
      ? (((wallet.monthlyRevenue - wallet.lastMonthRevenue) / wallet.lastMonthRevenue) * 100).toFixed(1)
      : '0';

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={32} className="animate-spin text-brand-purple" />
      </div>
    );
  }

  const statusIcons = {
    completed: <CheckCircle size={14} className="text-green-400" />,
    pending: <Clock size={14} className="text-yellow-400" />,
    failed: <XCircle size={14} className="text-red-400" />,
    refunded: <RefreshCw size={14} className="text-blue-400" />,
  };

  const statusColors = {
    completed: 'text-green-400',
    pending: 'text-yellow-400',
    failed: 'text-red-400',
    refunded: 'text-blue-400',
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-montserrat font-bold">Wallet & Revenue</h1>
          <p className="text-gray-400 text-sm mt-1">Manage your earnings and withdrawals</p>
        </div>
        <button
          onClick={() => setShowWithdrawModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-brand-purple hover:bg-brand-purple/90 rounded-xl text-sm font-semibold transition-colors"
        >
          <ArrowDownToLine size={16} />
          Withdraw Funds
        </button>
      </div>

      {/* Wallet Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: 'Total Revenue',
            value: `$${wallet.totalRevenue.toLocaleString()}`,
            icon: TrendingUp,
            color: 'from-green-500 to-green-600',
          },
          {
            label: 'Available Balance',
            value: `$${wallet.availableBalance.toLocaleString()}`,
            icon: Wallet,
            color: 'from-purple-500 to-purple-600',
          },
          {
            label: 'This Month',
            value: `$${wallet.monthlyRevenue.toLocaleString()}`,
            icon: DollarSign,
            color: 'from-blue-500 to-blue-600',
            change: `${Number(revenueGrowth) >= 0 ? '+' : ''}${revenueGrowth}%`,
          },
          {
            label: 'Pending',
            value: `$${wallet.pendingWithdrawals.toLocaleString()}`,
            icon: Clock,
            color: 'from-amber-500 to-amber-600',
          },
        ].map((card, i) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-gray-900 rounded-2xl p-4 border border-gray-800"
            >
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center mb-3`}>
                <Icon size={18} className="text-white" />
              </div>
              <p className="text-2xl font-bold">{card.value}</p>
              <div className="flex items-center justify-between mt-1">
                <p className="text-xs text-gray-400">{card.label}</p>
                {card.change && (
                  <span className="text-xs text-green-400 flex items-center gap-0.5">
                    <ArrowUpRight size={10} />
                    {card.change}
                  </span>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Revenue Chart */}
      <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
        <h3 className="font-semibold mb-4">Daily Revenue (30 Days)</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={revenueChart}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
            <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#6b7280' }} />
            <YAxis tick={{ fontSize: 10, fill: '#6b7280' }} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#111827',
                border: '1px solid #374151',
                borderRadius: '12px',
                fontSize: '12px',
              }}formatter={(value?: number) => [`$${value ?? 0}`, 'Revenue']}
              
            />
            <Bar dataKey="revenue" fill="#4C0585" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Transactions */}
      <div className="bg-gray-900 rounded-2xl border border-gray-800">
        <div className="p-6 border-b border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="font-semibold">Transaction History</h3>
          <div className="flex items-center gap-2">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-1.5 bg-gray-800 border border-gray-700 rounded-lg text-xs"
            >
              <option value="all">All Types</option>
              <option value="subscription">Subscription</option>
              <option value="renewal">Renewal</option>
              <option value="refund">Refund</option>
              <option value="withdrawal">Withdrawal</option>
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-1.5 bg-gray-800 border border-gray-700 rounded-lg text-xs"
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
            </select>
            <button
              onClick={exportTransactions}
              className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700"
            >
              <Download size={14} />
            </button>
          </div>
        </div>

        <div className="divide-y divide-gray-800">
          {filteredTransactions.length === 0 ? (
            <div className="p-8 text-center">
              <DollarSign size={32} className="text-gray-600 mx-auto mb-2" />
              <p className="text-sm text-gray-500">No transactions found</p>
            </div>
          ) : (
            filteredTransactions.map((trans) => (
              <div key={trans.id} className="px-6 py-4 flex items-center gap-4">
                <div className="w-9 h-9 rounded-full bg-gray-800 flex items-center justify-center">
                  {trans.type === 'withdrawal' ? (
                    <ArrowDownToLine size={16} className="text-orange-400" />
                  ) : trans.type === 'refund' ? (
                    <RefreshCw size={16} className="text-blue-400" />
                  ) : (
                    <CreditCard size={16} className="text-green-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium capitalize">
                    {trans.type} {trans.plan && `- ${trans.plan}`}
                  </p>
                  <p className="text-xs text-gray-500">
                    {trans.userEmail || trans.reference}
                  </p>
                </div>
                <div className="text-right">
                  <p
                    className={`text-sm font-semibold ${
                      trans.amount >= 0 ? 'text-green-400' : 'text-red-400'
                    }`}
                  >
                    {trans.amount >= 0 ? '+' : ''}${Math.abs(trans.amount).toFixed(2)}
                  </p>
                  <div className="flex items-center gap-1 justify-end mt-0.5">
                    {statusIcons[trans.status]}
                    <span className={`text-[10px] capitalize ${statusColors[trans.status]}`}>
                      {trans.status}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Withdraw Modal */}
      {showWithdrawModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="bg-gray-900 rounded-2xl p-6 max-w-sm w-full border border-gray-800"
          >
            <h3 className="text-lg font-bold mb-4">Withdraw Funds</h3>

            <div className="mb-4">
              <p className="text-xs text-gray-400 mb-1">Available Balance</p>
              <p className="text-2xl font-bold text-green-400">
                ${wallet.availableBalance.toLocaleString()}
              </p>
            </div>

            <div className="mb-4">
              <label className="text-xs text-gray-400 mb-1 block">Amount (USD)</label>
              <input
                type="number"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                placeholder="0.00"
                max={wallet.availableBalance}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-brand-purple/50"
              />
            </div>

            <div className="mb-6">
              <label className="text-xs text-gray-400 mb-2 block">Method</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'bank', label: 'Bank Transfer', icon: Building2 },
                  { id: 'mobile', label: 'Mobile Money', icon: Smartphone },
                ].map((method) => {
                  const Icon = method.icon;
                  return (
                    <button
                      key={method.id}
                      onClick={() => setWithdrawMethod(method.id)}
                      className={`flex items-center gap-2 px-3 py-3 rounded-xl text-sm font-medium border transition-all ${
                        withdrawMethod === method.id
                          ? 'border-brand-purple bg-brand-purple/10 text-brand-purple'
                          : 'border-gray-700 hover:border-gray-600'
                      }`}
                    >
                      <Icon size={16} />
                      {method.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowWithdrawModal(false)}
                className="flex-1 py-3 bg-gray-800 rounded-xl text-sm font-medium hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleWithdraw}
                disabled={withdrawing || !withdrawAmount}
                className="flex-1 py-3 bg-brand-purple rounded-xl text-sm font-semibold hover:bg-brand-purple/90 disabled:opacity-50"
              >
                {withdrawing ? (
                  <Loader2 size={16} className="animate-spin mx-auto" />
                ) : (
                  'Withdraw'
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}