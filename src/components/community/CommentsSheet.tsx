'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, MoreVertical, Flag, Trash2, Loader2 } from 'lucide-react';
import { useCommunity, Comment } from '@/hooks/useCommunity';
import { useAuthStore } from '@/store/authStore';
import { formatDistanceToNow } from 'date-fns';

interface CommentsSheetProps {
  isOpen: boolean;
  postId: string;
  onClose: () => void;
}

export default function CommentsSheet({ isOpen, postId, onClose }: CommentsSheetProps) {
  const { user } = useAuthStore();
  const { fetchComments, addComment, deleteComment, reportComment } = useCommunity();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && postId) {
      loadComments();
    }
  }, [isOpen, postId]);

  const loadComments = async () => {
    setLoading(true);
    const data = await fetchComments(postId);
    setComments(data);
    setLoading(false);

    // Scroll to bottom
    setTimeout(() => {
      scrollRef.current?.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }, 100);
  };

  const handleSend = async () => {
    if (!newComment.trim() || sending) return;

    setSending(true);
    await addComment(postId, newComment.trim());
    setNewComment('');
    await loadComments();
    setSending(false);
  };

  const handleDelete = async (commentId: string) => {
    await deleteComment(postId, commentId);
    setComments((prev) => prev.filter((c) => c.id !== commentId));
    setMenuOpenId(null);
  };

  const handleReport = async (commentId: string) => {
    await reportComment(postId, commentId, 'Inappropriate content');
    setMenuOpenId(null);
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
            className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-brand-surface rounded-t-3xl max-h-[75vh] flex flex-col"
          >
            {/* Handle */}
            <div className="flex justify-center pt-2 pb-1">
              <div className="w-10 h-1 bg-gray-300 dark:bg-gray-600 rounded-full" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800">
              <h3 className="font-semibold text-brand-dark dark:text-brand-white">
                Comments ({comments.length})
              </h3>
              <button
                onClick={onClose}
                className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            {/* Comments List */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
              {loading ? (
                <div className="flex justify-center py-8">
                  <Loader2 size={24} className="animate-spin text-brand-purple" />
                </div>
              ) : comments.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-3xl mb-2">💬</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    No comments yet. Be the first!
                  </p>
                </div>
              ) : (
                comments.map((comment) => (
                  <div key={comment.id} className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-brand-lavender/30 dark:bg-brand-purple/30 flex-shrink-0 flex items-center justify-center overflow-hidden">
                      {comment.userPhoto ? (
                        <img
                          src={comment.userPhoto}
                          alt={comment.userName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-brand-purple font-bold text-xs">
                          {comment.userName.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl rounded-tl-md px-3 py-2">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-semibold text-brand-dark dark:text-brand-white">
                            {comment.userName}
                          </p>
                          <div className="relative">
                            <button
                              onClick={() =>
                                setMenuOpenId(
                                  menuOpenId === comment.id ? null : comment.id
                                )
                              }
                              className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
                            >
                              <MoreVertical size={12} className="text-gray-400" />
                            </button>
                            <AnimatePresence>
                              {menuOpenId === comment.id && (
                                <motion.div
                                  initial={{ opacity: 0, scale: 0.9 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  exit={{ opacity: 0, scale: 0.9 }}
                                  className="absolute right-0 top-6 bg-white dark:bg-brand-surface rounded-lg shadow-lg border border-gray-100 dark:border-gray-700 py-1 z-20 min-w-[130px]"
                                >
                                  {user?.uid === comment.userId ? (
                                    <button
                                      onClick={() => handleDelete(comment.id)}
                                      className="flex items-center gap-2 px-3 py-2 text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 w-full"
                                    >
                                      <Trash2 size={12} />
                                      Delete
                                    </button>
                                  ) : (
                                    <button
                                      onClick={() => handleReport(comment.id)}
                                      className="flex items-center gap-2 px-3 py-2 text-xs text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 w-full"
                                    >
                                      <Flag size={12} />
                                      Report
                                    </button>
                                  )}
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        </div>
                        <p className="text-sm text-gray-700 dark:text-gray-300 mt-0.5">
                          {comment.content}
                        </p>
                      </div>
                      <p className="text-[10px] text-gray-400 mt-1 ml-1">
                        {comment.createdAt?.toDate
                          ? formatDistanceToNow(comment.createdAt.toDate(), {
                              addSuffix: true,
                            })
                          : 'Just now'}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Input */}
            <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-800 flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Write a comment..."
                className="flex-1 px-4 py-2.5 bg-gray-100 dark:bg-gray-800 rounded-full text-sm text-brand-dark dark:text-brand-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-purple/30"
              />
              <button
                onClick={handleSend}
                disabled={!newComment.trim() || sending}
                className={`p-2.5 rounded-full transition-all ${
                  newComment.trim() && !sending
                    ? 'bg-brand-purple text-white hover:bg-brand-purple/90'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-400'
                }`}
              >
                {sending ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Send size={18} />
                )}
              </button>
            </div>

            {/* Safe area */}
            <div className="h-4" />
          </motion.div>

          {/* Click outside to close menus */}
          {menuOpenId && (
            <div
              className="fixed inset-0 z-40"
              onClick={() => setMenuOpenId(null)}
            />
          )}
        </>
      )}
    </AnimatePresence>
  );
}