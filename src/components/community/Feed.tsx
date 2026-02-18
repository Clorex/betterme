'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart, MessageCircle, Share2, MoreHorizontal,
  Flag, Trash2, Clock, Flame, Target, HelpCircle,
  Lightbulb, Trophy, Image as ImageIcon, X
} from 'lucide-react';
import { useCommunity, CommunityPost } from '@/hooks/useCommunity';
import { useAuthStore } from '@/store/authStore';
import { formatDistanceToNow } from 'date-fns';
import CommentsSheet from './CommentsSheet';
import ReportModal from './ReportModal';

const postTypeConfig: Record<string, { icon: any; label: string; color: string }> = {
  progress: { icon: Target, label: 'Progress', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
  question: { icon: HelpCircle, label: 'Question', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  tip: { icon: Lightbulb, label: 'Tip', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' },
  milestone: { icon: Trophy, label: 'Milestone', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' },
  transformation: { icon: Flame, label: 'Transformation', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
};

export default function Feed() {
  const { user } = useAuthStore();
  const { posts, loading, hasMore, fetchPosts, toggleLike, deletePost, reportPost } = useCommunity();
  const [selectedPost, setSelectedPost] = useState<string | null>(null);
  const [showComments, setShowComments] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportingPostId, setReportingPostId] = useState<string | null>(null);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    fetchPosts(true);
  }, []);

  // Infinite scroll
  const lastPostRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (loading) return;
      if (observerRef.current) observerRef.current.disconnect();

      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          fetchPosts(false);
        }
      });

      if (node) observerRef.current.observe(node);
    },
    [loading, hasMore, fetchPosts]
  );

  const handleLike = async (postId: string) => {
    await toggleLike(postId);
  };

  const handleOpenComments = (postId: string) => {
    setSelectedPost(postId);
    setShowComments(true);
  };

  const handleReport = (postId: string) => {
    setReportingPostId(postId);
    setShowReportModal(true);
    setMenuOpenId(null);
  };

  const handleDelete = async (postId: string) => {
    if (confirm('Are you sure you want to delete this post?')) {
      await deletePost(postId);
    }
    setMenuOpenId(null);
  };

  const handleShare = async (post: CommunityPost) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'BetterME Community',
          text: post.content.substring(0, 100),
          url: window.location.href,
        });
      } catch (err) {
        // User cancelled
      }
    } else {
      navigator.clipboard.writeText(post.content.substring(0, 200));
      const toast = (await import('react-hot-toast')).default;
      toast.success('Post copied to clipboard!');
    }
    setMenuOpenId(null);
  };

  if (loading && posts.length === 0) {
    return (
      <div className="p-4 space-y-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-white dark:bg-brand-surface rounded-2xl p-4 animate-pulse"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700" />
              <div className="space-y-1.5">
                <div className="w-24 h-3 bg-gray-200 dark:bg-gray-700 rounded" />
                <div className="w-16 h-2 bg-gray-200 dark:bg-gray-700 rounded" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded" />
              <div className="w-3/4 h-3 bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (posts.length === 0 && !loading) {
    return (
      <div className="p-8 text-center">
        <div className="text-6xl mb-4">🌟</div>
        <h3 className="text-lg font-semibold text-brand-dark dark:text-brand-white mb-2">
          No posts yet
        </h3>
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          Be the first to share your journey with the community!
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="p-4 space-y-4">
        {posts.map((post, index) => {
          const isLast = index === posts.length - 1;
          const typeConfig = postTypeConfig[post.type] || postTypeConfig.progress;
          const TypeIcon = typeConfig.icon;
          const isLiked = user ? post.likes.includes(user.uid) : false;
          const isOwner = user?.uid === post.userId;

          return (
            <motion.div
              key={post.id}
              ref={isLast ? lastPostRef : null}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(index * 0.05, 0.3) }}
              className="bg-white dark:bg-brand-surface rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden"
            >
              {/* Header */}
              <div className="p-4 pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-brand-lavender/30 dark:bg-brand-purple/30 flex items-center justify-center overflow-hidden">
                      {post.userPhoto ? (
                        <img
                          src={post.userPhoto}
                          alt={post.userName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-brand-purple font-bold text-sm">
                          {post.userName.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-sm text-brand-dark dark:text-brand-white">
                          {post.userName}
                        </h4>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${typeConfig.color}`}
                        >
                          <TypeIcon size={10} className="inline mr-0.5" />
                          {typeConfig.label}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                        <Clock size={10} />
                        {post.createdAt?.toDate
                          ? formatDistanceToNow(post.createdAt.toDate(), { addSuffix: true })
                          : 'Just now'}
                      </p>
                    </div>
                  </div>

                  <div className="relative">
                    <button
                      onClick={() => setMenuOpenId(menuOpenId === post.id ? null : post.id)}
                      className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                      <MoreHorizontal size={18} className="text-gray-400" />
                    </button>

                    <AnimatePresence>
                      {menuOpenId === post.id && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          className="absolute right-0 top-8 bg-white dark:bg-brand-surface rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 py-1 z-20 min-w-[160px]"
                        >
                          {isOwner && (
                            <button
                              onClick={() => handleDelete(post.id)}
                              className="flex items-center gap-2 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 w-full text-left"
                            >
                              <Trash2 size={14} />
                              Delete Post
                            </button>
                          )}
                          {!isOwner && (
                            <button
                              onClick={() => handleReport(post.id)}
                              className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 w-full text-left"
                            >
                              <Flag size={14} />
                              Report Post
                            </button>
                          )}
                          <button
                            onClick={() => handleShare(post)}
                            className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 w-full text-left"
                          >
                            <Share2 size={14} />
                            Share
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="px-4 pb-3">
                <p className="text-sm text-brand-dark dark:text-gray-200 leading-relaxed whitespace-pre-wrap">
                  {post.content}
                </p>
              </div>

              {/* Images */}
              {post.images && post.images.length > 0 && (
                <div
                  className={`px-4 pb-3 grid gap-2 ${
                    post.images.length === 1
                      ? 'grid-cols-1'
                      : post.images.length === 2
                      ? 'grid-cols-2'
                      : 'grid-cols-2'
                  }`}
                >
                  {post.images.slice(0, 4).map((img, imgIndex) => (
                    <button
                      key={imgIndex}
                      onClick={() => setSelectedImage(img)}
                      className={`relative rounded-xl overflow-hidden ${
                        post.images.length === 1
                          ? 'aspect-video'
                          : post.images.length === 3 && imgIndex === 0
                          ? 'col-span-2 aspect-video'
                          : 'aspect-square'
                      }`}
                    >
                      <img
                        src={img}
                        alt={`Post image ${imgIndex + 1}`}
                        className="w-full h-full object-cover"
                      />
                      {imgIndex === 3 && post.images.length > 4 && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <span className="text-white text-lg font-bold">
                            +{post.images.length - 4}
                          </span>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}

              {/* Goal badge */}
              {post.userGoal && (
                <div className="px-4 pb-2">
                  <span className="text-[10px] px-2 py-0.5 bg-brand-lavender/20 text-brand-purple dark:bg-brand-purple/20 dark:text-brand-lavender rounded-full">
                    🎯 {post.userGoal.replace(/_/g, ' ')}
                  </span>
                </div>
              )}

              {/* Actions */}
              <div className="px-4 py-3 border-t border-gray-50 dark:border-gray-800 flex items-center gap-6">
                <button
                  onClick={() => handleLike(post.id)}
                  className="flex items-center gap-1.5 group"
                >
                  <motion.div
                    whileTap={{ scale: 1.3 }}
                    transition={{ type: 'spring', stiffness: 400 }}
                  >
                    <Heart
                      size={20}
                      className={`transition-colors ${
                        isLiked
                          ? 'fill-red-500 text-red-500'
                          : 'text-gray-400 group-hover:text-red-400'
                      }`}
                    />
                  </motion.div>
                  <span
                    className={`text-sm font-medium ${
                      isLiked ? 'text-red-500' : 'text-gray-500 dark:text-gray-400'
                    }`}
                  >
                    {post.likeCount || 0}
                  </span>
                </button>

                <button
                  onClick={() => handleOpenComments(post.id)}
                  className="flex items-center gap-1.5 group"
                >
                  <MessageCircle
                    size={20}
                    className="text-gray-400 group-hover:text-brand-purple transition-colors"
                  />
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    {post.commentCount || 0}
                  </span>
                </button>

                <button
                  onClick={() => handleShare(post)}
                  className="flex items-center gap-1.5 group ml-auto"
                >
                  <Share2
                    size={18}
                    className="text-gray-400 group-hover:text-brand-purple transition-colors"
                  />
                </button>
              </div>
            </motion.div>
          );
        })}

        {/* Loading indicator */}
        {loading && (
          <div className="flex justify-center py-4">
            <div className="w-6 h-6 border-2 border-brand-purple border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* End of feed */}
        {!hasMore && posts.length > 0 && (
          <p className="text-center text-sm text-gray-400 py-4">
            You&apos;ve seen all posts! 🎉
          </p>
        )}
      </div>

      {/* Comments Sheet */}
      <CommentsSheet
        isOpen={showComments}
        postId={selectedPost || ''}
        onClose={() => {
          setShowComments(false);
          setSelectedPost(null);
        }}
      />

      {/* Report Modal */}
      <ReportModal
        isOpen={showReportModal}
        onClose={() => {
          setShowReportModal(false);
          setReportingPostId(null);
        }}
        onReport={(reason) => {
          if (reportingPostId) {
            reportPost(reportingPostId, reason);
          }
          setShowReportModal(false);
          setReportingPostId(null);
        }}
      />

      {/* Image Viewer */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
            onClick={() => setSelectedImage(null)}
          >
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 p-2 bg-white/10 rounded-full text-white"
            >
              <X size={24} />
            </button>
            <img
              src={selectedImage}
              alt="Full size"
              className="max-w-full max-h-full object-contain rounded-lg"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Click outside to close menus */}
      {menuOpenId && (
        <div
          className="fixed inset-0 z-10"
          onClick={() => setMenuOpenId(null)}
        />
      )}
    </>
  );
}