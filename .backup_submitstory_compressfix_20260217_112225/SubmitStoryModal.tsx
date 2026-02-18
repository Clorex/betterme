'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Camera, Loader2 } from 'lucide-react';
import { useTransformationStories } from '@/hooks/useCommunity';
import { useAuthStore } from '@/store/authStore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '@/lib/firebase';
import { compressImage } from '@/lib/utils';
import toast from 'react-hot-toast';

interface SubmitStoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SubmitStoryModal({ isOpen, onClose }: SubmitStoryModalProps) {
  const { user, userProfile } = useAuthStore();
  const { submitStory } = useTransformationStories();
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    age: userProfile?.profile?.age || 25,
    gender: userProfile?.profile?.gender || 'male',
    startWeight: 0,
    endWeight: 0,
    duration: '',
    goal: userProfile?.profile?.goal || 'lose_fat',
    story: '',
    routine: '',
    diet: '',
  });

  const [beforePhoto, setBeforePhoto] = useState<File | null>(null);
  const [afterPhoto, setAfterPhoto] = useState<File | null>(null);
  const [beforePreview, setBeforePreview] = useState<string>('');
  const [afterPreview, setAfterPreview] = useState<string>('');

  const beforeRef = useRef<HTMLInputElement>(null);
  const afterRef = useRef<HTMLInputElement>(null);

  const handlePhotoSelect = async (
    type: 'before' | 'after',
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const compressed = await compressImage(file, 600);
    const preview = URL.createObjectURL(compressed);

    if (type === 'before') {
      setBeforePhoto(compressed);
      setBeforePreview(preview);
    } else {
      setAfterPhoto(compressed);
      setAfterPreview(preview);
    }
  };

  const handleSubmit = async () => {
    if (!formData.story.trim() || !formData.duration || !formData.startWeight || !formData.endWeight) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!user) return;

    setSubmitting(true);
    try {
      let beforePhotoURL = '';
      let afterPhotoURL = '';

      if (beforePhoto) {
        const imgRef = ref(storage, `transformations/${user.uid}/before_${Date.now()}`);
        const snap = await uploadBytes(imgRef, beforePhoto);
        beforePhotoURL = await getDownloadURL(snap.ref);
      }

      if (afterPhoto) {
        const imgRef = ref(storage, `transformations/${user.uid}/after_${Date.now()}`);
        const snap = await uploadBytes(imgRef, afterPhoto);
        afterPhotoURL = await getDownloadURL(snap.ref);
      }

      await submitStory({
        ...formData,
        beforePhoto: beforePhotoURL,
        afterPhoto: afterPhotoURL,
      });

      onClose();
      setFormData({
        age: 25,
        gender: 'male',
        startWeight: 0,
        endWeight: 0,
        duration: '',
        goal: 'lose_fat',
        story: '',
        routine: '',
        diet: '',
      });
      setBeforePhoto(null);
      setAfterPhoto(null);
      setBeforePreview('');
      setAfterPreview('');
    } catch (error) {
      toast.error('Failed to submit story');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50"
            onClick={onClose}
          />

          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-brand-surface rounded-t-3xl max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-center pt-2 pb-1">
              <div className="w-10 h-1 bg-gray-300 dark:bg-gray-600 rounded-full" />
            </div>

            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg text-brand-dark dark:text-brand-white">
                  Share Your Transformation
                </h3>
                <button onClick={onClose} className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
                  <X size={20} className="text-gray-500" />
                </button>
              </div>

              {/* Photos */}
              <div className="flex gap-3 mb-4">
                <div className="flex-1">
                  <p className="text-xs font-medium text-gray-500 mb-1.5">Before Photo</p>
                  <input ref={beforeRef} type="file" accept="image/*" onChange={(e) => handlePhotoSelect('before', e)} className="hidden" />
                  <button
                    onClick={() => beforeRef.current?.click()}
                    className="w-full aspect-[3/4] rounded-xl bg-gray-100 dark:bg-gray-800 overflow-hidden flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600"
                  >
                    {beforePreview ? (
                      <img src={beforePreview} alt="Before" className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-center">
                        <Camera size={24} className="text-gray-400 mx-auto mb-1" />
                        <p className="text-xs text-gray-400">Before</p>
                      </div>
                    )}
                  </button>
                </div>
                <div className="flex-1">
                  <p className="text-xs font-medium text-gray-500 mb-1.5">After Photo</p>
                  <input ref={afterRef} type="file" accept="image/*" onChange={(e) => handlePhotoSelect('after', e)} className="hidden" />
                  <button
                    onClick={() => afterRef.current?.click()}
                    className="w-full aspect-[3/4] rounded-xl bg-gray-100 dark:bg-gray-800 overflow-hidden flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600"
                  >
                    {afterPreview ? (
                      <img src={afterPreview} alt="After" className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-center">
                        <Camera size={24} className="text-gray-400 mx-auto mb-1" />
                        <p className="text-xs text-gray-400">After</p>
                      </div>
                    )}
                  </button>
                </div>
              </div>

              {/* Form */}
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Start Weight (lbs)*</label>
                    <input
                      type="number"
                      value={formData.startWeight || ''}
                      onChange={(e) => setFormData({ ...formData, startWeight: Number(e.target.value) })}
                      className="w-full mt-1 px-3 py-2 bg-gray-50 dark:bg-gray-800 rounded-xl text-sm text-brand-dark dark:text-brand-white focus:outline-none focus:ring-2 focus:ring-brand-purple/30"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 dark:text-gray-400">End Weight (lbs)*</label>
                    <input
                      type="number"
                      value={formData.endWeight || ''}
                      onChange={(e) => setFormData({ ...formData, endWeight: Number(e.target.value) })}
                      className="w-full mt-1 px-3 py-2 bg-gray-50 dark:bg-gray-800 rounded-xl text-sm text-brand-dark dark:text-brand-white focus:outline-none focus:ring-2 focus:ring-brand-purple/30"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Duration*</label>
                  <input
                    type="text"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    placeholder="e.g., 6 months, 1 year"
                    className="w-full mt-1 px-3 py-2 bg-gray-50 dark:bg-gray-800 rounded-xl text-sm text-brand-dark dark:text-brand-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-purple/30"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Your Story*</label>
                  <textarea
                    value={formData.story}
                    onChange={(e) => setFormData({ ...formData, story: e.target.value })}
                    placeholder="Tell us about your journey..."
                    rows={4}
                    className="w-full mt-1 px-3 py-2 bg-gray-50 dark:bg-gray-800 rounded-xl text-sm text-brand-dark dark:text-brand-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-purple/30 resize-none"
                    maxLength={2000}
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Your Routine (optional)</label>
                  <textarea
                    value={formData.routine}
                    onChange={(e) => setFormData({ ...formData, routine: e.target.value })}
                    placeholder="What was your workout routine?"
                    rows={2}
                    className="w-full mt-1 px-3 py-2 bg-gray-50 dark:bg-gray-800 rounded-xl text-sm text-brand-dark dark:text-brand-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-purple/30 resize-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Your Diet (optional)</label>
                  <textarea
                    value={formData.diet}
                    onChange={(e) => setFormData({ ...formData, diet: e.target.value })}
                    placeholder="What was your diet approach?"
                    rows={2}
                    className="w-full mt-1 px-3 py-2 bg-gray-50 dark:bg-gray-800 rounded-xl text-sm text-brand-dark dark:text-brand-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-purple/30 resize-none"
                  />
                </div>
              </div>

              <p className="text-[10px] text-gray-400 mt-3">
                Your story will be reviewed before publishing. This usually takes 1-2 days.
              </p>

              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="w-full mt-4 py-3 bg-brand-purple text-white rounded-xl font-semibold text-sm hover:bg-brand-purple/90 transition-colors disabled:opacity-50"
              >
                {submitting ? (
                  <Loader2 size={18} className="animate-spin mx-auto" />
                ) : (
                  'Submit My Story'
                )}
              </button>
            </div>

            <div className="h-8" />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}