'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Image as ImageIcon, Camera, Target,
  HelpCircle, Lightbulb, Trophy, Flame, Trash2, Loader2
} from 'lucide-react';
import { useCommunity } from '@/hooks/useCommunity';
import { compressImageToFile } from '@/lib/utils';

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const postTypes = [
  { id: 'progress', label: 'Progress', icon: Target, emoji: 'ðŸ’ª' },
  { id: 'question', label: 'Question', icon: HelpCircle, emoji: 'â“' },
  { id: 'tip', label: 'Tip', icon: Lightbulb, emoji: 'ðŸ’¡' },
  { id: 'milestone', label: 'Milestone', icon: Trophy, emoji: 'ðŸŽ‰' },
  { id: 'transformation', label: 'Transformation', icon: Flame, emoji: 'ðŸ”¥' },
] as const;

export default function CreatePostModal({ isOpen, onClose }: CreatePostModalProps) {
  const { createPost } = useCommunity();
  const [content, setContent] = useState('');
  const [type, setType] = useState<string>('progress');
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [posting, setPosting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (images.length + files.length > 3) {
      const toast = (await import('react-hot-toast')).default;
      toast.error('Maximum 3 images allowed');
      return;
    }

    const compressed: File[] = [];
    const previews: string[] = [];

    for (const file of files) {
      const compressedFile = await compressImageToFile(file, 800);
      compressed.push(compressedFile);
      previews.push(URL.createObjectURL(compressedFile));
    }

    setImages((prev) => [...prev, ...compressed]);
    setImagePreviews((prev) => [...prev, ...previews]);
  };

  const removeImage = (index: number) => {
    URL.revokeObjectURL(imagePreviews[index]);
    setImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handlePost = async () => {
    if (!content.trim()) return;

    setPosting(true);
    try {
      await createPost(content.trim(), type as any, images);
      resetForm();
      onClose();
    } catch (error) {
      console.error('Error posting:', error);
    } finally {
      setPosting(false);
    }
  };

  const resetForm = () => {
    setContent('');
    setType('progress');
    imagePreviews.forEach((url) => URL.revokeObjectURL(url));
    setImages([]);
    setImagePreviews([]);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50"
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-brand-surface rounded-t-3xl max-h-[90vh] overflow-y-auto"
          >
            {/* Handle */}
            <div className="flex justify-center pt-2 pb-1">
              <div className="w-10 h-1 bg-gray-300 dark:bg-gray-600 rounded-full" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800">
              <button
                onClick={handleClose}
                className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <X size={20} className="text-gray-500" />
              </button>
              <h3 className="font-semibold text-brand-dark dark:text-brand-white">
                Create Post
              </h3>
              <button
                onClick={handlePost}
                disabled={!content.trim() || posting}
                className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${
                  content.trim() && !posting
                    ? 'bg-brand-purple text-white hover:bg-brand-purple/90'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                }`}
              >
                {posting ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  'Post'
                )}
              </button>
            </div>

            {/* Post Type */}
            <div className="px-4 py-3">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 font-medium">
                POST TYPE
              </p>
              <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
                {postTypes.map((pt) => (
                  <button
                    key={pt.id}
                    onClick={() => setType(pt.id)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                      type === pt.id
                        ? 'bg-brand-purple text-white shadow-md'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    <span>{pt.emoji}</span>
                    {pt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Content */}
            <div className="px-4">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={
                  type === 'question'
                    ? 'Ask the community anything...'
                    : type === 'tip'
                    ? 'Share a helpful tip...'
                    : type === 'milestone'
                    ? 'Celebrate your achievement! ðŸŽ‰'
                    : 'Share your progress with the community...'
                }
                className="w-full min-h-[120px] resize-none border-0 bg-transparent text-brand-dark dark:text-brand-white placeholder:text-gray-400 text-sm leading-relaxed focus:outline-none focus:ring-0"
                maxLength={1000}
                autoFocus
              />
              <div className="flex justify-end">
                <span
                  className={`text-xs ${
                    content.length > 900
                      ? 'text-red-500'
                      : 'text-gray-400'
                  }`}
                >
                  {content.length}/1000
                </span>
              </div>
            </div>

            {/* Image Previews */}
            {imagePreviews.length > 0 && (
              <div className="px-4 py-2">
                <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative flex-shrink-0">
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        className="w-20 h-20 object-cover rounded-xl"
                      />
                      <button
                        onClick={() => removeImage(index)}
                        className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center"
                      >
                        <X size={12} className="text-white" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="px-4 py-4 border-t border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageSelect}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={images.length >= 3}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm ${
                    images.length >= 3
                      ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
                      : 'bg-brand-lavender/20 text-brand-purple hover:bg-brand-lavender/30'
                  }`}
                >
                  <ImageIcon size={16} />
                  Photo ({images.length}/3)
                </button>
              </div>
            </div>

            {/* Safe area */}
            <div className="h-8" />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
