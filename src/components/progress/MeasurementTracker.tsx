// src/components/progress/MeasurementTracker.tsx
'use client';

import { useState, useEffect } from 'react';
import { Ruler, TrendingDown, TrendingUp, Minus } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import { useAuthStore } from '@/store/authStore';
import { doc, getDoc, setDoc, collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

const measurementFields = [
  { key: 'chest', label: 'Chest', emoji: '👕' },
  { key: 'waist', label: 'Waist', emoji: '👖' },
  { key: 'hips', label: 'Hips', emoji: '🍑' },
  { key: 'leftArm', label: 'Left Arm', emoji: '💪' },
  { key: 'rightArm', label: 'Right Arm', emoji: '💪' },
  { key: 'leftThigh', label: 'Left Thigh', emoji: '🦵' },
  { key: 'rightThigh', label: 'Right Thigh', emoji: '🦵' },
  { key: 'neck', label: 'Neck', emoji: '🧣' },
];

interface MeasurementEntry {
  date: string;
  [key: string]: any;
}

export default function MeasurementTracker() {
  const { user } = useAuthStore();
  const [entries, setEntries] = useState<MeasurementEntry[]>([]);
  const [showLogModal, setShowLogModal] = useState(false);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) fetchEntries();
  }, [user]);

  const fetchEntries = async () => {
    if (!user) return;
    try {
      const ref = collection(db, 'users', user.uid, 'measurements');
      const q = query(ref, orderBy('date', 'desc'), limit(20));
      const snap = await getDocs(q);
      const data = snap.docs
        .filter((d) => {
          const dd = d.data();
          return measurementFields.some((f) => dd[f.key]);
        })
        .map((d) => ({ date: d.data().date, ...d.data() }));
      setEntries(data);
    } catch (err) {
      console.error('Error fetching measurements:', err);
    }
  };

  const handleLog = async () => {
    if (!user) return;
    const hasData = Object.values(formData).some((v) => v && parseFloat(v) > 0);
    if (!hasData) {
      toast.error('Please enter at least one measurement');
      return;
    }

    setSaving(true);
    const today = format(new Date(), 'yyyy-MM-dd');
    const data: Record<string, any> = { date: today, createdAt: new Date().toISOString() };

    measurementFields.forEach((f) => {
      if (formData[f.key] && parseFloat(formData[f.key]) > 0) {
        data[f.key] = parseFloat(formData[f.key]);
      }
    });

    try {
      await setDoc(doc(db, 'users', user.uid, 'measurements', today), data, { merge: true });
      toast.success('Measurements logged! 📏');
      setShowLogModal(false);
      setFormData({});
      fetchEntries();
    } catch (err) {
      toast.error('Failed to save');
    }
    setSaving(false);
  };

  const getChange = (key: string) => {
    const withKey = entries.filter((e) => e[key]);
    if (withKey.length < 2) return null;
    return parseFloat((withKey[0][key] - withKey[withKey.length - 1][key]).toFixed(1));
  };

  const getLatest = (key: string) => {
    const withKey = entries.filter((e) => e[key]);
    return withKey.length > 0 ? withKey[0][key] : null;
  };

  return (
    <div className="space-y-4">
      {/* Body Silhouette Guide */}
      <Card>
        <div className="text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Measure every 2 weeks for best results. Use a flexible tape measure.
          </p>
        </div>
      </Card>

      {/* Current Measurements */}
      <div className="grid grid-cols-2 gap-2">
        {measurementFields.map((field) => {
          const latest = getLatest(field.key);
          const change = getChange(field.key);

          return (
            <Card key={field.key} padding="sm">
              <p className="text-xs text-gray-400">
                {field.emoji} {field.label}
              </p>
              {latest ? (
                <div className="mt-1 flex items-end justify-between">
                  <p className="text-lg font-bold text-brand-dark dark:text-brand-white">
                    {latest}<span className="text-xs font-normal text-gray-400"> cm</span>
                  </p>
                  {change !== null && change !== 0 && (
                    <span
                      className={cn(
                        'flex items-center gap-0.5 text-[10px] font-bold',
                        change < 0 ? 'text-green-500' : 'text-red-500'
                      )}
                    >
                      {change < 0 ? <TrendingDown className="h-3 w-3" /> : <TrendingUp className="h-3 w-3" />}
                      {Math.abs(change)}
                    </span>
                  )}
                </div>
              ) : (
                <p className="mt-1 text-sm text-gray-300">—</p>
              )}
            </Card>
          );
        })}
      </div>

      <Button onClick={() => setShowLogModal(true)} variant="primary" fullWidth>
        <Ruler className="mr-2 h-4 w-4" />
        Log Measurements
      </Button>

      {/* Log Modal */}
      <Modal isOpen={showLogModal} onClose={() => setShowLogModal(false)} title="Log Measurements">
        <div className="max-h-[60vh] space-y-3 overflow-y-auto pb-4">
          <p className="text-xs text-gray-500">Enter measurements in cm. Leave blank to skip.</p>
          {measurementFields.map((field) => (
            <Input
              key={field.key}
              label={`${field.emoji} ${field.label} (cm)`}
              type="number"
              step="0.1"
              value={formData[field.key] || ''}
              onChange={(e) =>
                setFormData({ ...formData, [field.key]: e.target.value })
              }
              placeholder={getLatest(field.key) ? String(getLatest(field.key)) : ''}
            />
          ))}
          <Button onClick={handleLog} variant="primary" fullWidth loading={saving}>
            Save Measurements
          </Button>
        </div>
      </Modal>
    </div>
  );
}