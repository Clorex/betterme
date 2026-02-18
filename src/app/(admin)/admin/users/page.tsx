'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Filter, MoreVertical, Eye, Edit2,
  Trash2, Shield, Ban, Gift, Bell, Download,
  ChevronLeft, ChevronRight, X, Loader2,
  Mail, Calendar, Target, Crown
} from 'lucide-react';
import {
  collection, getDocs, doc, updateDoc, deleteDoc,
  query, orderBy, limit, startAfter, where
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

interface AdminUser {
  id: string;
  email: string;
  displayName: string;
  photoURL: string;
  role: string;
  profile: any;
  subscription: any;
  streaks: any;
  createdAt: any;
  lastActive: any;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPlan, setFilterPlan] = useState('all');
  const [filterGoal, setFilterGoal] = useState('all');
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [showUserDetail, setShowUserDetail] = useState(false);
  const [actionMenuId, setActionMenuId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 20;

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    let filtered = users;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (u) =>
          u.displayName?.toLowerCase().includes(term) ||
          u.email?.toLowerCase().includes(term)
      );
    }

    if (filterPlan !== 'all') {
      filtered = filtered.filter(
        (u) => u.subscription?.plan === filterPlan || u.subscription?.status === filterPlan
      );
    }

    if (filterGoal !== 'all') {
      filtered = filtered.filter((u) => u.profile?.goal === filterGoal);
    }

    setFilteredUsers(filtered);
    setCurrentPage(1);
  }, [searchTerm, filterPlan, filterGoal, users]);

  const loadUsers = async () => {
    try {
      const usersSnap = await getDocs(
        query(collection(db, 'users'), orderBy('createdAt', 'desc'))
      );
      const usersData = usersSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as AdminUser[];
      setUsers(usersData);
      setFilteredUsers(usersData);
    } catch (error) {
      console.error('Error loading users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleBanUser = async (userId: string, banned: boolean) => {
    try {
      await updateDoc(doc(db, 'users', userId), {
        banned: !banned,
        bannedAt: !banned ? new Date() : null,
      });
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, banned: !banned } as any : u))
      );
      toast.success(banned ? 'User unbanned' : 'User banned');
    } catch (error) {
      toast.error('Failed to update user');
    }
    setActionMenuId(null);
  };

  const handleGrantPremium = async (userId: string) => {
    try {
      await updateDoc(doc(db, 'users', userId), {
        subscription: {
          plan: 'premium',
          status: 'active',
          startDate: new Date(),
          endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
          grantedBy: 'admin',
        },
      });
      toast.success('Premium access granted');
      loadUsers();
    } catch (error) {
      toast.error('Failed to grant premium');
    }
    setActionMenuId(null);
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure? This action cannot be undone.')) return;

    try {
      await deleteDoc(doc(db, 'users', userId));
      setUsers((prev) => prev.filter((u) => u.id !== userId));
      toast.success('User deleted');
    } catch (error) {
      toast.error('Failed to delete user');
    }
    setActionMenuId(null);
  };

  const exportCSV = () => {
    const headers = 'Name,Email,Plan,Goal,Joined,Streak\n';
    const rows = filteredUsers
      .map(
        (u) =>
          `"${u.displayName || ''}","${u.email}","${u.subscription?.plan || 'free'}","${
            u.profile?.goal || ''
          }","${u.createdAt?.toDate ? format(u.createdAt.toDate(), 'yyyy-MM-dd') : ''}","${
            u.streaks?.current || 0
          }"`
      )
      .join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `betterme-users-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('CSV exported');
  };

  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * usersPerPage,
    currentPage * usersPerPage
  );

  const getSubscriptionBadge = (sub: any) => {
    if (!sub) return { label: 'Free', color: 'bg-gray-700 text-gray-300' };
    switch (sub.status) {
      case 'active':
        return sub.plan === 'premium'
          ? { label: 'Premium', color: 'bg-purple-900 text-purple-300' }
          : { label: 'Pro', color: 'bg-blue-900 text-blue-300' };
      case 'trial':
        return { label: 'Trial', color: 'bg-yellow-900 text-yellow-300' };
      default:
        return { label: 'Free', color: 'bg-gray-700 text-gray-300' };
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={32} className="animate-spin text-brand-purple" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-montserrat font-bold">User Management</h1>
          <p className="text-gray-400 text-sm mt-1">
            {filteredUsers.length} users total
          </p>
        </div>
        <button
          onClick={exportCSV}
          className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-xl text-sm font-medium transition-colors"
        >
          <Download size={16} />
          Export CSV
        </button>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full pl-10 pr-4 py-2.5 bg-gray-900 border border-gray-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-purple/50"
          />
        </div>
        <select
          value={filterPlan}
          onChange={(e) => setFilterPlan(e.target.value)}
          className="px-4 py-2.5 bg-gray-900 border border-gray-800 rounded-xl text-sm focus:outline-none"
        >
          <option value="all">All Plans</option>
          <option value="free">Free</option>
          <option value="trial">Trial</option>
          <option value="pro">Pro</option>
          <option value="premium">Premium</option>
        </select>
        <select
          value={filterGoal}
          onChange={(e) => setFilterGoal(e.target.value)}
          className="px-4 py-2.5 bg-gray-900 border border-gray-800 rounded-xl text-sm focus:outline-none"
        >
          <option value="all">All Goals</option>
          <option value="lose_fat">Lose Fat</option>
          <option value="build_muscle">Build Muscle</option>
          <option value="get_lean">Get Lean</option>
          <option value="body_recomp">Body Recomp</option>
          <option value="get_stronger">Get Stronger</option>
          <option value="general_fitness">General Fitness</option>
        </select>
      </div>

      {/* Users List */}
      <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
        {/* Desktop Table Header */}
        <div className="hidden lg:grid grid-cols-12 gap-4 px-6 py-3 border-b border-gray-800 text-xs text-gray-500 font-medium uppercase">
          <div className="col-span-4">User</div>
          <div className="col-span-2">Plan</div>
          <div className="col-span-2">Goal</div>
          <div className="col-span-2">Joined</div>
          <div className="col-span-1">Streak</div>
          <div className="col-span-1 text-right">Actions</div>
        </div>

        {/* Users */}
        <div className="divide-y divide-gray-800">
          {paginatedUsers.map((user) => {
            const badge = getSubscriptionBadge(user.subscription);
            return (
              <div
                key={user.id}
                className="px-4 lg:px-6 py-4 hover:bg-gray-800/50 transition-colors"
              >
                <div className="lg:grid lg:grid-cols-12 lg:gap-4 lg:items-center flex flex-col gap-2">
                  {/* User Info */}
                  <div className="col-span-4 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gray-700 flex-shrink-0 flex items-center justify-center overflow-hidden">
                      {user.photoURL ? (
                        <img src={user.photoURL} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-xs font-bold text-gray-400">
                          {user.displayName?.charAt(0)?.toUpperCase() || '?'}
                        </span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate flex items-center gap-1">
                        {user.displayName || 'Unnamed'}
                        {user.role === 'admin' && <Crown size={12} className="text-yellow-500" />}
                      </p>
                      <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    </div>
                  </div>

                  {/* Plan */}
                  <div className="col-span-2">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${badge.color}`}>
                      {badge.label}
                    </span>
                  </div>

                  {/* Goal */}
                  <div className="col-span-2">
                    <span className="text-xs text-gray-400">
                      {user.profile?.goal?.replace(/_/g, ' ') || 'Not set'}
                    </span>
                  </div>

                  {/* Joined */}
                  <div className="col-span-2">
                    <span className="text-xs text-gray-400">
                      {user.createdAt?.toDate
                        ? format(user.createdAt.toDate(), 'MMM d, yyyy')
                        : 'Unknown'}
                    </span>
                  </div>

                  {/* Streak */}
                  <div className="col-span-1">
                    <span className="text-xs">🔥 {user.streaks?.current || 0}</span>
                  </div>

                  {/* Actions */}
                  <div className="col-span-1 flex justify-end relative">
                    <button
                      onClick={() => setActionMenuId(actionMenuId === user.id ? null : user.id)}
                      className="p-1.5 rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      <MoreVertical size={16} className="text-gray-400" />
                    </button>

                    <AnimatePresence>
                      {actionMenuId === user.id && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          className="absolute right-0 top-8 bg-gray-800 rounded-xl shadow-xl border border-gray-700 py-1 z-20 min-w-[180px]"
                        >
                          <button
                            onClick={() => {
                              setSelectedUser(user);
                              setShowUserDetail(true);
                              setActionMenuId(null);
                            }}
                            className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-gray-700 w-full text-left"
                          >
                            <Eye size={14} />
                            View Details
                          </button>
                          <button
                            onClick={() => handleGrantPremium(user.id)}
                            className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-gray-700 w-full text-left text-yellow-400"
                          >
                            <Gift size={14} />
                            Grant Premium
                          </button>
                          <button
                            onClick={() => handleBanUser(user.id, (user as any).banned)}
                            className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-gray-700 w-full text-left text-orange-400"
                          >
                            <Ban size={14} />
                            {(user as any).banned ? 'Unban User' : 'Ban User'}
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-gray-700 w-full text-left text-red-400"
                          >
                            <Trash2 size={14} />
                            Delete User
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-800 flex items-center justify-between">
            <p className="text-xs text-gray-500">
              Showing {(currentPage - 1) * usersPerPage + 1}-
              {Math.min(currentPage * usersPerPage, filteredUsers.length)} of{' '}
              {filteredUsers.length}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg hover:bg-gray-800 disabled:opacity-30"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="text-sm">
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg hover:bg-gray-800 disabled:opacity-30"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* User Detail Modal */}
      <AnimatePresence>
        {showUserDetail && selectedUser && (
          <UserDetailModal
            user={selectedUser}
            onClose={() => {
              setShowUserDetail(false);
              setSelectedUser(null);
            }}
          />
        )}
      </AnimatePresence>

      {actionMenuId && (
        <div className="fixed inset-0 z-10" onClick={() => setActionMenuId(null)} />
      )}
    </div>
  );
}

function UserDetailModal({
  user,
  onClose,
}: {
  user: AdminUser;
  onClose: () => void;
}) {
  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 z-50"
        onClick={onClose}
      />
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-gray-900 z-50 overflow-y-auto border-l border-gray-800"
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold">User Details</h2>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-800">
              <X size={18} />
            </button>
          </div>

          {/* Profile */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 rounded-full bg-gray-700 mx-auto mb-3 flex items-center justify-center overflow-hidden">
              {user.photoURL ? (
                <img src={user.photoURL} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="text-xl font-bold text-gray-400">
                  {user.displayName?.charAt(0)?.toUpperCase()}
                </span>
              )}
            </div>
            <h3 className="font-semibold text-lg">{user.displayName || 'Unnamed'}</h3>
            <p className="text-sm text-gray-400">{user.email}</p>
          </div>

          {/* Info sections */}
          <div className="space-y-4">
            <DetailSection title="Subscription">
              <DetailRow label="Plan" value={user.subscription?.plan || 'Free'} />
              <DetailRow label="Status" value={user.subscription?.status || 'None'} />
              <DetailRow
                label="Since"
                value={
                  user.subscription?.startDate?.toDate
                    ? format(user.subscription.startDate.toDate(), 'MMM d, yyyy')
                    : 'N/A'
                }
              />
            </DetailSection>

            <DetailSection title="Profile">
              <DetailRow label="Goal" value={user.profile?.goal?.replace(/_/g, ' ') || 'Not set'} />
              <DetailRow label="Age" value={user.profile?.age || 'N/A'} />
              <DetailRow label="Gender" value={user.profile?.gender || 'N/A'} />
              <DetailRow label="Weight" value={user.profile?.weight ? `${user.profile.weight} kg` : 'N/A'} />
              <DetailRow label="Height" value={user.profile?.height ? `${user.profile.height} cm` : 'N/A'} />
              <DetailRow label="Activity" value={user.profile?.activityLevel || 'N/A'} />
              <DetailRow label="Experience" value={user.profile?.experience || 'N/A'} />
            </DetailSection>

            <DetailSection title="Activity">
              <DetailRow label="Streak" value={`🔥 ${user.streaks?.current || 0} days`} />
              <DetailRow label="Longest Streak" value={`${user.streaks?.longest || 0} days`} />
              <DetailRow
                label="Joined"
                value={
                  user.createdAt?.toDate
                    ? format(user.createdAt.toDate(), 'MMM d, yyyy')
                    : 'Unknown'
                }
              />
            </DetailSection>
          </div>
        </div>
      </motion.div>
    </>
  );
}

function DetailSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-gray-800/50 rounded-xl p-4">
      <h4 className="text-xs font-medium text-gray-500 uppercase mb-3">{title}</h4>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-gray-400">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  );
}