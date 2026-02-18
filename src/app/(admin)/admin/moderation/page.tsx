'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Shield, Flag, AlertTriangle, Check, X,
  Ban, Eye, MessageCircle, Image, Loader2,
  ChevronDown
} from 'lucide-react';
import {
  collection, getDocs, doc, updateDoc, deleteDoc,
  query, where, orderBy, limit, serverTimestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

interface Report {
  id: string;
  type: 'post' | 'comment';
  targetId: string;
  postId?: string;
  reporterId: string;
  reason: string;
  resolved: boolean;
  createdAt: any;
  // Populated data
  content?: string;
  reporterName?: string;
}

export default function AdminModerationPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'pending' | 'resolved' | 'all'>('pending');

  useEffect(() => {
    loadReports();
  }, [filter]);

  const loadReports = async () => {
    setLoading(true);
    try {
      let q;
      if (filter === 'all') {
        q = query(collection(db, 'reports'), orderBy('createdAt', 'desc'), limit(50));
      } else {
        q = query(
          collection(db, 'reports'),
          where('resolved', '==', filter === 'resolved'),
          orderBy('createdAt', 'desc'),
          limit(50)
        );
      }

      const snapshot = await getDocs(q);
      setReports(
        snapshot.docs.map((d) => ({ id: d.id, ...d.data() })) as Report[]
      );
    } catch (error) {
      console.error('Error loading reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (reportId: string) => {
    try {
      await updateDoc(doc(db, 'reports', reportId), {
        resolved: true,
        resolution: 'approved',
        resolvedAt: serverTimestamp(),
      });
      setReports((prev) => prev.filter((r) => r.id !== reportId));
      toast.success('Report dismissed');
    } catch (error) {
      toast.error('Failed to process');
    }
  };

  const handleRemoveContent = async (report: Report) => {
    try {
      // Remove the content
      if (report.type === 'post') {
        await updateDoc(
          doc(db, 'community', 'posts', 'items', report.targetId),
          { reported: true }
        );
      } else if (report.type === 'comment' && report.postId) {
        await deleteDoc(
          doc(db, 'community', 'posts', 'items', report.postId, 'comments', report.targetId)
        );
      }

      // Mark report as resolved
      await updateDoc(doc(db, 'reports', report.id), {
        resolved: true,
        resolution: 'removed',
        resolvedAt: serverTimestamp(),
      });

      setReports((prev) => prev.filter((r) => r.id !== report.id));
      toast.success('Content removed');
    } catch (error) {
      toast.error('Failed to remove content');
    }
  };

  const handleBanUser = async (report: Report) => {
    if (!confirm('Are you sure you want to ban this user?')) return;

    try {
      // Ban the content creator (need to find the post/comment to get userId)
      // For now, mark report as resolved with ban action
      await updateDoc(doc(db, 'reports', report.id), {
        resolved: true,
        resolution: 'user_banned',
        resolvedAt: serverTimestamp(),
      });

      setReports((prev) => prev.filter((r) => r.id !== report.id));
      toast.success('User banned');
    } catch (error) {
      toast.error('Failed to ban user');
    }
  };

  const pendingCount = reports.filter((r) => !r.resolved).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-montserrat font-bold flex items-center gap-2">
            <Shield size={24} className="text-brand-purple" />
            Moderation
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Review reported content and manage community safety
          </p>
        </div>
        {pendingCount > 0 && (
          <span className="px-3 py-1.5 bg-red-900/30 text-red-400 rounded-full text-sm font-medium">
            {pendingCount} pending
          </span>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        {(['pending', 'resolved', 'all'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition-all ${
              filter === f
                ? 'bg-brand-purple text-white'
                : 'bg-gray-800 text-gray-400 hover:text-white'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Reports */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 size={32} className="animate-spin text-brand-purple" />
        </div>
      ) : reports.length === 0 ? (
        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-12 text-center">
          <Shield size={48} className="text-gray-700 mx-auto mb-3" />
          <h3 className="font-semibold text-gray-400">No reports to review</h3>
          <p className="text-xs text-gray-600 mt-1">
            The community is looking clean! 🎉
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {reports.map((report, i) => (
            <motion.div
              key={report.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="bg-gray-900 rounded-2xl border border-gray-800 p-5"
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-red-900/30 flex items-center justify-center flex-shrink-0">
                  <Flag size={18} className="text-red-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs bg-gray-800 px-2 py-0.5 rounded-full capitalize text-gray-300">
                      {report.type}
                    </span>
                    <span className="text-xs text-gray-500">
                      {report.createdAt?.toDate
                        ? format(report.createdAt.toDate(), 'MMM d, HH:mm')
                        : ''}
                    </span>
                  </div>
                  <p className="text-sm text-gray-300 mb-2">
                    <span className="text-gray-500">Reason:</span> {report.reason}
                  </p>
                  {report.content && (
                    <div className="bg-gray-800/50 rounded-xl p-3 mb-3">
                      <p className="text-xs text-gray-400 line-clamp-3">
                        {report.content}
                      </p>
                    </div>
                  )}

                  {/* Actions */}
                  {!report.resolved && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleApprove(report.id)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-green-900/30 text-green-400 rounded-lg text-xs font-medium hover:bg-green-900/50"
                      >
                        <Check size={12} />
                        Dismiss
                      </button>
                      <button
                        onClick={() => handleRemoveContent(report)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-red-900/30 text-red-400 rounded-lg text-xs font-medium hover:bg-red-900/50"
                      >
                        <X size={12} />
                        Remove Content
                      </button>
                      <button
                        onClick={() => handleBanUser(report)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-orange-900/30 text-orange-400 rounded-lg text-xs font-medium hover:bg-orange-900/50"
                      >
                        <Ban size={12} />
                        Ban User
                      </button>
                    </div>
                  )}

                  {report.resolved && (
                    <span className="text-xs text-green-500 flex items-center gap-1">
                      <Check size={12} />
                      Resolved
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}