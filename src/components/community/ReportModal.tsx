'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle, Loader2 } from 'lucide-react';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReport: (reason: string) => void;
}

const reportReasons = [
  { id: 'spam', label: '🔁 Spam or repetitive' },
  { id: 'offensive', label: '🤬 Offensive language' },
  { id: 'harassment', label: '😡 Harassment or bullying' },
  { id: 'inappropriate', label: '🚫 Inappropriate content' },
  { id: 'misinformation', label: '❌ Health misinformation' },
  { id: 'other', label: '📝 Other' },
];

export default function ReportModal({ isOpen, onClose, onReport }: ReportModalProps) {
  const [selectedReason, setSelectedReason] = useState('');
  const [otherText, setOtherText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!selectedReason) return;

    setSubmitting(true);
    const reason = selectedReason === 'other' ? otherText || 'Other' : selectedReason;
    onReport(reason);
    setSelectedReason('');
    setOtherText('');
    setSubmitting(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-[60]"
            onClick={onClose}
          />

          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-[60] bg-white dark:bg-brand-surface rounded-t-3xl"
          >
            <div className="flex justify-center pt-2 pb-1">
              <div className="w-10 h-1 bg-gray-300 dark:bg-gray-600 rounded-full" />
            </div>

            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <AlertTriangle size={20} className="text-red-500" />
                  <h3 className="font-semibold text-brand-dark dark:text-brand-white">
                    Report Content
                  </h3>
                </div>
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <X size={18} className="text-gray-500" />
                </button>
              </div>

              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Why are you reporting this content?
              </p>

              <div className="space-y-2 mb-4">
                {reportReasons.map((reason) => (
                  <button
                    key={reason.id}
                    onClick={() => setSelectedReason(reason.id)}
                    className={`w-full text-left px-4 py-3 rounded-xl text-sm transition-all ${
                      selectedReason === reason.id
                        ? 'bg-brand-purple text-white'
                        : 'bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    {reason.label}
                  </button>
                ))}
              </div>

              {selectedReason === 'other' && (
                <textarea
                  value={otherText}
                  onChange={(e) => setOtherText(e.target.value)}
                  placeholder="Please describe the issue..."
                  className="w-full p-3 bg-gray-50 dark:bg-gray-800 rounded-xl text-sm text-brand-dark dark:text-brand-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-purple/30 mb-4 resize-none min-h-[80px]"
                  maxLength={500}
                />
              )}

              <button
                onClick={handleSubmit}
                disabled={!selectedReason || submitting}
                className={`w-full py-3 rounded-xl font-semibold text-sm transition-all ${
                  selectedReason && !submitting
                    ? 'bg-red-500 text-white hover:bg-red-600'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                }`}
              >
                {submitting ? (
                  <Loader2 size={18} className="animate-spin mx-auto" />
                ) : (
                  'Submit Report'
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