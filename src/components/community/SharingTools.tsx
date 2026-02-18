'use client';

import { useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Download, Copy, Share2,
  MessageCircle, Instagram, Twitter
} from 'lucide-react';
import toast from 'react-hot-toast';

interface ShareCardData {
  type: 'workout' | 'milestone' | 'weekly' | 'challenge';
  title: string;
  stats: { label: string; value: string }[];
  streak?: number;
  message?: string;
}

interface SharingToolsProps {
  isOpen: boolean;
  onClose: () => void;
  data: ShareCardData;
}

export default function SharingTools({ isOpen, onClose, data }: SharingToolsProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const generateShareText = () => {
    let text = '';

    switch (data.type) {
      case 'workout':
        text = `💪 I just completed ${data.title}!\n`;
        data.stats.forEach((s) => (text += `${s.label}: ${s.value}\n`));
        if (data.streak) text += `🔥 ${data.streak} day streak\n`;
        text += '\n#BetterME #Fitness';
        break;

      case 'milestone':
        text = `🎉 Milestone achieved: ${data.title}!\n`;
        data.stats.forEach((s) => (text += `${s.label}: ${s.value}\n`));
        text += '\n#BetterME #Transformation';
        break;

      case 'weekly':
        text = `📊 My week with BetterME:\n`;
        data.stats.forEach((s) => (text += `${s.label}: ${s.value}\n`));
        text += '\n#BetterME #WeeklyReport';
        break;

      case 'challenge':
        text = `🏆 I completed the ${data.title}!\n`;
        data.stats.forEach((s) => (text += `${s.label}: ${s.value}\n`));
        text += '\n#BetterME #Challenge';
        break;
    }

    return text;
  };

  const generateShareImage = useCallback(async (): Promise<Blob | null> => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    canvas.width = 600;
    canvas.height = 400;

    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, 600, 400);
    gradient.addColorStop(0, '#4C0585');
    gradient.addColorStop(1, '#1A0A2E');
    ctx.fillStyle = gradient;
    ctx.roundRect(0, 0, 600, 400, 20);
    ctx.fill();

    // Card overlay
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.roundRect(20, 20, 560, 360, 16);
    ctx.fill();

    // Title
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 28px Montserrat, Arial, sans-serif';
    ctx.textAlign = 'center';

    const typeEmoji = {
      workout: '💪',
      milestone: '🎉',
      weekly: '📊',
      challenge: '🏆',
    };

    ctx.fillText(
      `${typeEmoji[data.type]} ${data.title}`,
      300,
      80
    );

    // Stats
    ctx.font = '18px Inter, Arial, sans-serif';
    ctx.fillStyle = '#DBB5EE';

    data.stats.forEach((stat, i) => {
      ctx.fillStyle = '#DBB5EE';
      ctx.textAlign = 'left';
      ctx.fillText(stat.label, 60, 140 + i * 40);

      ctx.fillStyle = '#FFFFFF';
      ctx.textAlign = 'right';
      ctx.font = 'bold 20px Inter, Arial, sans-serif';
      ctx.fillText(stat.value, 540, 140 + i * 40);
      ctx.font = '18px Inter, Arial, sans-serif';
    });

    // Streak
    if (data.streak) {
      ctx.fillStyle = '#FFD700';
      ctx.font = 'bold 24px Inter, Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`🔥 ${data.streak} Day Streak`, 300, 330);
    }

    // Brand
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.font = 'bold 14px Montserrat, Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('BetterME - AI Body Transformation', 300, 380);

    return new Promise((resolve) => {
      canvas.toBlob(resolve, 'image/png');
    });
  }, [data]);

  const handleCopyText = async () => {
    const text = generateShareText();
    await navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const handleDownloadImage = async () => {
    const blob = await generateShareImage();
    if (!blob) return;

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `betterme-${data.type}-${Date.now()}.png`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Image downloaded!');
  };

  const handleNativeShare = async () => {
    const text = generateShareText();

    if (navigator.share) {
      const blob = await generateShareImage();
      const shareData: ShareData = {
        title: `BetterME - ${data.title}`,
        text,
      };

      if (blob) {
        const file = new File([blob], 'betterme-share.png', {
          type: 'image/png',
        });
        if (navigator.canShare({ files: [file] })) {
          shareData.files = [file];
        }
      }

      try {
        await navigator.share(shareData);
      } catch {
        // User cancelled
      }
    } else {
      handleCopyText();
    }
  };

  const handleShareToWhatsApp = () => {
    const text = encodeURIComponent(generateShareText());
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const handleShareToTwitter = () => {
    const text = encodeURIComponent(generateShareText());
    window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank');
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
            className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-brand-surface rounded-t-3xl"
          >
            <div className="flex justify-center pt-2 pb-1">
              <div className="w-10 h-1 bg-gray-300 dark:bg-gray-600 rounded-full" />
            </div>

            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-brand-dark dark:text-brand-white">
                  Share Your Achievement 🎉
                </h3>
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <X size={18} className="text-gray-500" />
                </button>
              </div>

              {/* Preview Card */}
              <div className="bg-gradient-to-br from-brand-purple to-purple-900 rounded-2xl p-4 mb-4 text-white">
                <p className="text-lg font-bold mb-2">
                  {data.type === 'workout' && '💪'}
                  {data.type === 'milestone' && '🎉'}
                  {data.type === 'weekly' && '📊'}
                  {data.type === 'challenge' && '🏆'}{' '}
                  {data.title}
                </p>
                <div className="space-y-1">
                  {data.stats.map((stat, i) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span className="text-brand-lavender">{stat.label}</span>
                      <span className="font-semibold">{stat.value}</span>
                    </div>
                  ))}
                </div>
                {data.streak && (
                  <p className="text-center mt-3 text-yellow-300 font-bold">
                    🔥 {data.streak} Day Streak
                  </p>
                )}
                <p className="text-center text-[10px] opacity-50 mt-2">
                  BetterME - AI Body Transformation
                </p>
              </div>

              {/* Share Options */}
              <div className="grid grid-cols-4 gap-3 mb-4">
                <button
                  onClick={handleNativeShare}
                  className="flex flex-col items-center gap-1.5 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl"
                >
                  <Share2 size={22} className="text-brand-purple" />
                  <span className="text-[10px] text-gray-600 dark:text-gray-400">Share</span>
                </button>
                <button
                  onClick={handleShareToWhatsApp}
                  className="flex flex-col items-center gap-1.5 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl"
                >
                  <MessageCircle size={22} className="text-green-500" />
                  <span className="text-[10px] text-gray-600 dark:text-gray-400">WhatsApp</span>
                </button>
                <button
                  onClick={handleShareToTwitter}
                  className="flex flex-col items-center gap-1.5 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl"
                >
                  <Twitter size={22} className="text-blue-400" />
                  <span className="text-[10px] text-gray-600 dark:text-gray-400">Twitter</span>
                </button>
                <button
                  onClick={handleCopyText}
                  className="flex flex-col items-center gap-1.5 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl"
                >
                  <Copy size={22} className="text-gray-500" />
                  <span className="text-[10px] text-gray-600 dark:text-gray-400">Copy</span>
                </button>
              </div>

              <button
                onClick={handleDownloadImage}
                className="w-full flex items-center justify-center gap-2 py-3 bg-brand-purple text-white rounded-xl font-semibold text-sm"
              >
                <Download size={16} />
                Download Image
              </button>
            </div>

            {/* Hidden canvas for image generation */}
            <canvas ref={canvasRef} className="hidden" />

            <div className="h-8" />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}