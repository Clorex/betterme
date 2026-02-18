// src/components/dashboard/QuickActions.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Camera, Scale, Droplets, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuthStore } from '@/store/authStore';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const actions = [
  {
    id: 'snap',
    label: 'Snap Food',
    emoji: '📸',
    icon: Camera,
    color: 'bg-pink-100 dark:bg-pink-900/30',
    iconColor: 'text-pink-500',
  },
  {
    id: 'weight',
    label: 'Log Weight',
    emoji: '⚖️',
    icon: Scale,
    color: 'bg-purple-100 dark:bg-purple-900/30',
    iconColor: 'text-purple-500',
  },
  {
    id: 'water',
    label: 'Add Water',
    emoji: '💧',
    icon: Droplets,
    color: 'bg-blue-100 dark:bg-blue-900/30',
    iconColor: 'text-blue-500',
  },
  {
    id: 'coach',
    label: 'Quick Note',
    emoji: '📝',
    icon: MessageSquare,
    color: 'bg-green-100 dark:bg-green-900/30',
    iconColor: 'text-green-500',
  },
];

export default function QuickActions() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [showWeightModal, setShowWeightModal] = useState(false);
  const [weightVal, setWeightVal] = useState('');
  const [saving, setSaving] = useState(false);

  const handleAction = (id: string) => {
    switch (id) {
      case 'snap':
        router.push('/nutrition?tab=snap');
        break;
      case 'weight':
        setShowWeightModal(true);
        break;
      case 'water':
        handleAddWater();
        break;
      case 'coach':
        router.push('/coach');
        break;
    }
  };

  const handleAddWater = async () => {
    if (!user) return;
    const today = format(new Date(), 'yyyy-MM-dd');
    try {
      const logRef = doc(db, 'users', user.uid, 'foodLogs', today);
      // We'll increment - simplified version
      await setDoc(
        logRef,
        {
          waterIntake: { glasses: (await import('firebase/firestore')).increment(1) },
          date: today,
        },
        { merge: true }
      );
      toast.success('💧 +1 glass of water!');
    } catch (err) {
      toast.error('Failed to log water');
    }
  };

  const handleSaveWeight = async () => {
    if (!user || !weightVal) return;
    setSaving(true);
    const today = format(new Date(), 'yyyy-MM-dd');
    try {
      await setDoc(
        doc(db, 'users', user.uid, 'measurements', today),
        {
          weight: parseFloat(weightVal),
          date: today,
          createdAt: new Date().toISOString(),
        },
        { merge: true }
      );
      await setDoc(
        doc(db, 'users', user.uid),
        {
          metrics: { currentWeight: parseFloat(weightVal) },
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
      toast.success('Weight logged! ⚖️');
      setShowWeightModal(false);
      setWeightVal('');
    } catch (err) {
      toast.error('Failed to save');
    }
    setSaving(false);
  };

  return (
    <>
      <div>
        <h3 className="mb-3 text-sm font-bold text-gray-500 dark:text-gray-400">
          Quick Actions
        </h3>
        <div className="grid grid-cols-4 gap-3">
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.id}
                onClick={() => handleAction(action.id)}
                className={cn(
                  'flex flex-col items-center gap-2 rounded-2xl p-3 transition-all active:scale-95',
                  action.color
                )}
              >
                <Icon className={cn('h-6 w-6', action.iconColor)} />
                <span className="text-[10px] font-medium text-gray-700 dark:text-gray-300">
                  {action.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <Modal
        isOpen={showWeightModal}
        onClose={() => setShowWeightModal(false)}
        title="Log Weight"
      >
        <div className="space-y-4">
          <Input
            label="Weight (kg)"
            type="number"
            step="0.1"
            value={weightVal}
            onChange={(e) => setWeightVal(e.target.value)}
            placeholder="70.5"
          />
          <Button onClick={handleSaveWeight} variant="primary" fullWidth loading={saving}>
            Save
          </Button>
        </div>
      </Modal>
    </>
  );
}