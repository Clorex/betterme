// src/components/dashboard/WeightTrend.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Scale, TrendingDown, TrendingUp, Minus, Plus } from 'lucide-react';
import Card from '@/components/ui/Card';
import { useAuthStore } from '@/store/authStore';
import { collection, query, orderBy, limit, getDocs, doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { format, subDays } from 'date-fns';
import { cn } from '@/lib/utils';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import toast from 'react-hot-toast';

export default function WeightTrend() {
  const router = useRouter();
  const { user, userProfile } = useAuthStore();
  const [recentWeights, setRecentWeights] = useState<{ date: string; weight: number }[]>([]);
  const [showLogModal, setShowLogModal] = useState(false);
  const [newWeight, setNewWeight] = useState('');
  const [saving, setSaving] = useState(false);

  const currentWeight = userProfile?.metrics?.currentWeight || 0;
  const startWeight = userProfile?.profile?.currentWeight || currentWeight;
  const change = currentWeight - startWeight;

  useEffect(() => {
    if (!user) return;
    fetchRecentWeights();
  }, [user]);

  const fetchRecentWeights = async () => {
    if (!user) return;
    try {
      const measureRef = collection(db, 'users', user.uid, 'measurements');
      const q = query(measureRef, orderBy('date', 'desc'), limit(7));
      const snap = await getDocs(q);
      const data = snap.docs
        .map((d) => ({ date: d.data().date, weight: d.data().weight }))
        .reverse();
      setRecentWeights(data);
    } catch (err) {
      console.error('Error fetching weights:', err);
    }
  };

  const handleLogWeight = async () => {
    if (!user || !newWeight) return;
    setSaving(true);
    const today = format(new Date(), 'yyyy-MM-dd');
    const weightNum = parseFloat(newWeight);

    try {
      await setDoc(doc(db, 'users', user.uid, 'measurements', today), {
        weight: weightNum,
        date: today,
        createdAt: new Date().toISOString(),
      }, { merge: true });

      // Update user metrics
      await setDoc(doc(db, 'users', user.uid), {
        metrics: { currentWeight: weightNum },
        updatedAt: new Date().toISOString(),
      }, { merge: true });

      toast.success('Weight logged! ⚖️');
      setShowLogModal(false);
      setNewWeight('');
      fetchRecentWeights();
    } catch (err) {
      toast.error('Failed to log weight');
    }
    setSaving(false);
  };

  // Mini sparkline
  const maxW = Math.max(...recentWeights.map((w) => w.weight), 1);
  const minW = Math.min(...recentWeights.map((w) => w.weight), 0);
  const range = maxW - minW || 1;

  return (
    <>
      <Card onClick={() => router.push('/progress')} clickable>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-purple-100 dark:bg-purple-900/30">
              <Scale className="h-5 w-5 text-brand-purple dark:text-brand-lavender" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-brand-dark dark:text-brand-white">
                Weight Trend
              </h3>
              <div className="flex items-center gap-1 text-xs">
                {change < 0 ? (
                  <TrendingDown className="h-3.5 w-3.5 text-green-500" />
                ) : change > 0 ? (
                  <TrendingUp className="h-3.5 w-3.5 text-red-500" />
                ) : (
                  <Minus className="h-3.5 w-3.5 text-gray-400" />
                )}
                <span
                  className={cn(
                    'font-medium',
                    change < 0 ? 'text-green-500' : change > 0 ? 'text-red-500' : 'text-gray-400'
                  )}
                >
                  {change > 0 ? '+' : ''}
                  {change.toFixed(1)} kg
                </span>
              </div>
            </div>
          </div>

          <div className="text-right">
            <p className="text-lg font-bold text-brand-dark dark:text-brand-white">
              {currentWeight} <span className="text-xs font-normal text-gray-400">kg</span>
            </p>
          </div>
        </div>

        {/* Mini sparkline */}
        {recentWeights.length > 1 && (
          <div className="mt-3 flex h-12 items-end gap-1">
            {recentWeights.map((w, i) => {
              const heightPct = ((w.weight - minW) / range) * 100;
              return (
                <div
                  key={i}
                  className="flex-1 rounded-t bg-brand-lavender/40 transition-all dark:bg-brand-lavender/20"
                  style={{
                    height: `${Math.max(heightPct, 10)}%`,
                  }}
                />
              );
            })}
          </div>
        )}

        <Button
          onClick={(e) => {
            e.stopPropagation();
            setShowLogModal(true);
          }}
          variant="outline"
          size="sm"
          fullWidth
          className="mt-3"
        >
          <Scale className="mr-1.5 h-4 w-4" />
          Log Weight
        </Button>
      </Card>

      {/* Log Weight Modal */}
      <Modal
        isOpen={showLogModal}
        onClose={() => setShowLogModal(false)}
        title="Log Weight"
      >
        <div className="space-y-4">
          <Input
            label="Weight (kg)"
            type="number"
            step="0.1"
            value={newWeight}
            onChange={(e) => setNewWeight(e.target.value)}
            placeholder={String(currentWeight)}
          />
          <Button
            onClick={handleLogWeight}
            variant="primary"
            fullWidth
            loading={saving}
          >
            Save Weight
          </Button>
        </div>
      </Modal>
    </>
  );
}