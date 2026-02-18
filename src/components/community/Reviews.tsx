'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Star, Send, Loader2, ThumbsUp } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import {
  collection, addDoc, getDocs, query,
  orderBy, limit, serverTimestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';

interface Review {
  id: string;
  userId: string;
  userName: string;
  userPhoto: string;
  rating: number;
  content: string;
  helpful: number;
  createdAt: any;
}

interface ReviewsSectionProps {
  type: 'app' | 'program' | 'recipe';
  targetId?: string;
}

export default function ReviewsSection({ type, targetId }: ReviewsSectionProps) {
  const { user, userProfile } = useAuthStore();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const collectionPath = type === 'app'
    ? 'reviews'
    : `${type}Reviews`;

  useEffect(() => {
    loadReviews();
  }, [type, targetId]);

  const loadReviews = async () => {
    try {
      const q = query(
        collection(db, collectionPath),
        orderBy('createdAt', 'desc'),
        limit(20)
      );
      const snapshot = await getDocs(q);
      setReviews(
        snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Review[]
      );
    } catch (error) {
      console.error('Error loading reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const submitReview = async () => {
    if (rating === 0 || !content.trim() || !user) return;

    setSubmitting(true);
    try {
      await addDoc(collection(db, collectionPath), {
        userId: user.uid,
        userName: userProfile?.displayName || 'Anonymous',
        userPhoto: userProfile?.photoURL || '',
        rating,
        content: content.trim(),
        targetId: targetId || 'app',
        helpful: 0,
        createdAt: serverTimestamp(),
      });

      toast.success('Review submitted! Thank you! 🙏');
      setRating(0);
      setContent('');
      setShowForm(false);
      loadReviews();
    } catch (error) {
      toast.error('Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const averageRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="bg-white dark:bg-brand-surface rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-4">
        <div className="flex items-center gap-4">
          <div className="text-center">
            <p className="text-3xl font-bold text-brand-dark dark:text-brand-white">
              {averageRating.toFixed(1)}
            </p>
            <div className="flex gap-0.5 mt-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={14}
                  className={
                    star <= Math.round(averageRating)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300'
                  }
                />
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-1">{reviews.length} reviews</p>
          </div>

          <div className="flex-1 space-y-1">
            {[5, 4, 3, 2, 1].map((stars) => {
              const count = reviews.filter((r) => r.rating === stars).length;
              const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
              return (
                <div key={stars} className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 w-3">{stars}</span>
                  <Star size={10} className="text-yellow-400 fill-yellow-400" />
                  <div className="flex-1 h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full">
                    <div
                      className="h-full bg-yellow-400 rounded-full"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-gray-400 w-6">{count}</span>
                </div>
              );
            })}
          </div>
        </div>

        <button
          onClick={() => setShowForm(!showForm)}
          className="w-full mt-4 py-2.5 bg-brand-purple text-white rounded-xl text-sm font-semibold"
        >
          Write a Review
        </button>
      </div>

      {/* Review Form */}
      {showForm && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="bg-white dark:bg-brand-surface rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-4"
        >
          <h4 className="font-semibold text-sm text-brand-dark dark:text-brand-white mb-3">
            Your Review
          </h4>

          {/* Star rating */}
          <div className="flex gap-1 mb-3">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setRating(star)}
              >
                <Star
                  size={28}
                  className={`transition-colors ${
                    star <= (hoverRating || rating)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300 dark:text-gray-600'
                  }`}
                />
              </button>
            ))}
          </div>

          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Share your experience..."
            rows={3}
            className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 rounded-xl text-sm text-brand-dark dark:text-brand-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-purple/30 resize-none mb-3"
            maxLength={500}
          />

          <div className="flex gap-2">
            <button
              onClick={() => setShowForm(false)}
              className="flex-1 py-2.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-xl text-sm"
            >
              Cancel
            </button>
            <button
              onClick={submitReview}
              disabled={rating === 0 || !content.trim() || submitting}
              className="flex-1 py-2.5 bg-brand-purple text-white rounded-xl text-sm font-semibold disabled:opacity-50 flex items-center justify-center gap-1"
            >
              {submitting ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <>
                  <Send size={14} />
                  Submit
                </>
              )}
            </button>
          </div>
        </motion.div>
      )}

      {/* Reviews List */}
      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 size={24} className="animate-spin text-brand-purple" />
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-3xl mb-2">📝</p>
          <p className="text-sm text-gray-500">No reviews yet. Be the first!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="bg-white dark:bg-brand-surface rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-4"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-full bg-brand-lavender/30 dark:bg-brand-purple/30 overflow-hidden flex items-center justify-center">
                  {review.userPhoto ? (
                    <img src={review.userPhoto} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xs font-bold text-brand-purple">
                      {review.userName.charAt(0)}
                    </span>
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-brand-dark dark:text-brand-white">
                    {review.userName}
                  </p>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={10}
                        className={
                          star <= review.rating
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                        }
                      />
                    ))}
                    <span className="text-[10px] text-gray-400 ml-1">
                      {review.createdAt?.toDate
                        ? formatDistanceToNow(review.createdAt.toDate(), { addSuffix: true })
                        : ''}
                    </span>
                  </div>
                </div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                {review.content}
              </p>
              <button className="flex items-center gap-1 mt-2 text-xs text-gray-400 hover:text-brand-purple">
                <ThumbsUp size={12} />
                Helpful ({review.helpful})
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}