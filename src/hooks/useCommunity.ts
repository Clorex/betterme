'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  onSnapshot,
  increment,
  arrayUnion,
  arrayRemove,
  serverTimestamp,
  Timestamp,
  DocumentSnapshot,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';

export interface CommunityPost {
  id: string;
  userId: string;
  userName: string;
  userPhoto: string;
  userGoal: string;
  content: string;
  images: string[];
  type: 'progress' | 'question' | 'tip' | 'milestone' | 'transformation';
  likes: string[];
  likeCount: number;
  commentCount: number;
  createdAt: any;
  reported: boolean;
  reportCount: number;
}

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  userPhoto: string;
  content: string;
  likes: string[];
  createdAt: any;
}

export interface TransformationStory {
  id: string;
  userId: string;
  userName: string;
  userPhoto: string;
  age: number;
  gender: string;
  beforePhoto: string;
  afterPhoto: string;
  startWeight: number;
  endWeight: number;
  duration: string;
  goal: string;
  story: string;
  routine: string;
  diet: string;
  approved: boolean;
  featured: boolean;
  createdAt: any;
}

export interface PartnerMatch {
  id: string;
  partnerUserId: string;
  partnerName: string;
  partnerPhoto: string;
  partnerGoal: string;
  matchedAt: any;
  status: 'pending' | 'active' | 'ended';
  lastCheckIn: any;
}

export interface PartnerMessage {
  id: string;
  senderId: string;
  content: string;
  timestamp: any;
}

export function useCommunity() {
  const { user, userProfile } = useAuthStore();
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastDoc, setLastDoc] = useState<DocumentSnapshot | null>(null);
  const [hasMore, setHasMore] = useState(true);

  const POSTS_PER_PAGE = 15;

  // Fetch posts with pagination
  const fetchPosts = useCallback(async (refresh = false) => {
    if (loading) return;
    if (!refresh && !hasMore) return;

    setLoading(true);
    try {
      let q;
      if (refresh || !lastDoc) {
        q = query(
          collection(db, 'community', 'posts', 'items'),
          where('reported', '==', false),
          orderBy('createdAt', 'desc'),
          limit(POSTS_PER_PAGE)
        );
      } else {
        q = query(
          collection(db, 'community', 'posts', 'items'),
          where('reported', '==', false),
          orderBy('createdAt', 'desc'),
          startAfter(lastDoc),
          limit(POSTS_PER_PAGE)
        );
      }

      const snapshot = await getDocs(q);
      const newPosts = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as CommunityPost[];

      if (refresh) {
        setPosts(newPosts);
      } else {
        setPosts((prev) => [...prev, ...newPosts]);
      }

      setLastDoc(snapshot.docs[snapshot.docs.length - 1] || null);
      setHasMore(snapshot.docs.length === POSTS_PER_PAGE);
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast.error('Failed to load posts');
    } finally {
      setLoading(false);
    }
  }, [loading, hasMore, lastDoc]);

  // Create a post
  const createPost = async (
    content: string,
    type: CommunityPost['type'],
    images: File[]
  ) => {
    if (!user || !userProfile) {
      toast.error('Please login first');
      return;
    }

    try {
      // Upload images
      const imageUrls: string[] = [];
      for (const image of images) {
        const imageRef = ref(
          storage,
          `community/${user.uid}/${Date.now()}_${image.name}`
        );
        const snapshot = await uploadBytes(imageRef, image);
        const url = await getDownloadURL(snapshot.ref);
        imageUrls.push(url);
      }

      const postData = {
        userId: user.uid,
        userName: userProfile.displayName || 'Anonymous',
        userPhoto: userProfile.photoURL || '',
        userGoal: userProfile.profile?.goal || 'general',
        content,
        images: imageUrls,
        type,
        likes: [],
        likeCount: 0,
        commentCount: 0,
        reported: false,
        reportCount: 0,
        createdAt: serverTimestamp(),
      };

      await addDoc(collection(db, 'community', 'posts', 'items'), postData);
      toast.success('Post published! 🎉');

      // Refresh feed
      fetchPosts(true);
    } catch (error) {
      console.error('Error creating post:', error);
      toast.error('Failed to create post');
    }
  };

  // Like / Unlike a post
  const toggleLike = async (postId: string) => {
    if (!user) return;

    try {
      const postRef = doc(db, 'community', 'posts', 'items', postId);
      const postSnap = await getDoc(postRef);

      if (!postSnap.exists()) return;

      const postData = postSnap.data();
      const likes: string[] = postData.likes || [];
      const alreadyLiked = likes.includes(user.uid);

      if (alreadyLiked) {
        await updateDoc(postRef, {
          likes: arrayRemove(user.uid),
          likeCount: increment(-1),
        });
      } else {
        await updateDoc(postRef, {
          likes: arrayUnion(user.uid),
          likeCount: increment(1),
        });
      }

      // Update local state
      setPosts((prev) =>
        prev.map((p) => {
          if (p.id === postId) {
            const newLikes = alreadyLiked
              ? p.likes.filter((id) => id !== user.uid)
              : [...p.likes, user.uid];
            return {
              ...p,
              likes: newLikes,
              likeCount: newLikes.length,
            };
          }
          return p;
        })
      );
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  // Add comment
  const addComment = async (postId: string, content: string) => {
    if (!user || !userProfile) return;

    try {
      const commentData = {
        userId: user.uid,
        userName: userProfile.displayName || 'Anonymous',
        userPhoto: userProfile.photoURL || '',
        content,
        likes: [],
        createdAt: serverTimestamp(),
      };

      await addDoc(
        collection(db, 'community', 'posts', 'items', postId, 'comments'),
        commentData
      );

      // Update comment count
      const postRef = doc(db, 'community', 'posts', 'items', postId);
      await updateDoc(postRef, {
        commentCount: increment(1),
      });

      // Update local state
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId ? { ...p, commentCount: p.commentCount + 1 } : p
        )
      );

      toast.success('Comment added!');
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error('Failed to add comment');
    }
  };

  // Fetch comments for a post
  const fetchComments = async (postId: string): Promise<Comment[]> => {
    try {
      const q = query(
        collection(db, 'community', 'posts', 'items', postId, 'comments'),
        orderBy('createdAt', 'asc')
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Comment[];
    } catch (error) {
      console.error('Error fetching comments:', error);
      return [];
    }
  };

  // Delete comment
  const deleteComment = async (postId: string, commentId: string) => {
    if (!user) return;

    try {
      await deleteDoc(
        doc(db, 'community', 'posts', 'items', postId, 'comments', commentId)
      );
      const postRef = doc(db, 'community', 'posts', 'items', postId);
      await updateDoc(postRef, {
        commentCount: increment(-1),
      });

      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId ? { ...p, commentCount: p.commentCount - 1 } : p
        )
      );

      toast.success('Comment deleted');
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast.error('Failed to delete comment');
    }
  };

  // Delete post
  const deletePost = async (postId: string) => {
    if (!user) return;

    try {
      await deleteDoc(doc(db, 'community', 'posts', 'items', postId));
      setPosts((prev) => prev.filter((p) => p.id !== postId));
      toast.success('Post deleted');
    } catch (error) {
      console.error('Error deleting post:', error);
      toast.error('Failed to delete post');
    }
  };

  // Report post
  const reportPost = async (
    postId: string,
    reason: string
  ) => {
    if (!user) return;

    try {
      // Add report record
      await addDoc(collection(db, 'reports'), {
        type: 'post',
        targetId: postId,
        reporterId: user.uid,
        reason,
        createdAt: serverTimestamp(),
        resolved: false,
      });

      // Increment report count
      const postRef = doc(db, 'community', 'posts', 'items', postId);
      await updateDoc(postRef, {
        reportCount: increment(1),
      });

      // Auto-hide if 3+ reports
      const postSnap = await getDoc(postRef);
      if (postSnap.exists() && (postSnap.data().reportCount || 0) >= 3) {
        await updateDoc(postRef, { reported: true });
        setPosts((prev) => prev.filter((p) => p.id !== postId));
      }

      toast.success('Report submitted. Thank you for keeping our community safe.');
    } catch (error) {
      console.error('Error reporting post:', error);
      toast.error('Failed to submit report');
    }
  };

  // Report comment
  const reportComment = async (
    postId: string,
    commentId: string,
    reason: string
  ) => {
    if (!user) return;

    try {
      await addDoc(collection(db, 'reports'), {
        type: 'comment',
        targetId: commentId,
        postId,
        reporterId: user.uid,
        reason,
        createdAt: serverTimestamp(),
        resolved: false,
      });
      toast.success('Report submitted.');
    } catch (error) {
      console.error('Error reporting comment:', error);
    }
  };

  return {
    posts,
    loading,
    hasMore,
    fetchPosts,
    createPost,
    toggleLike,
    addComment,
    fetchComments,
    deleteComment,
    deletePost,
    reportPost,
    reportComment,
  };
}

// Separate hook for transformation stories
export function useTransformationStories() {
  const { user, userProfile } = useAuthStore();
  const [stories, setStories] = useState<TransformationStory[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchStories = async () => {
    setLoading(true);
    try {
      const q = query(
        collection(db, 'transformationStories'),
        where('approved', '==', true),
        orderBy('createdAt', 'desc'),
        limit(20)
      );
      const snapshot = await getDocs(q);
      setStories(
        snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as TransformationStory[]
      );
    } catch (error) {
      console.error('Error fetching stories:', error);
    } finally {
      setLoading(false);
    }
  };

  const submitStory = async (storyData: Omit<TransformationStory, 'id' | 'userId' | 'userName' | 'userPhoto' | 'approved' | 'featured' | 'createdAt'>) => {
    if (!user || !userProfile) return;

    try {
      await addDoc(collection(db, 'transformationStories'), {
        ...storyData,
        userId: user.uid,
        userName: userProfile.displayName || 'Anonymous',
        userPhoto: userProfile.photoURL || '',
        approved: false,
        featured: false,
        createdAt: serverTimestamp(),
      });
      toast.success('Story submitted! It will be published after review.');
    } catch (error) {
      console.error('Error submitting story:', error);
      toast.error('Failed to submit story');
    }
  };

  return { stories, loading, fetchStories, submitStory };
}

// Separate hook for accountability partners
export function useAccountabilityPartner() {
  const { user, userProfile } = useAuthStore();
  const [partner, setPartner] = useState<PartnerMatch | null>(null);
  const [messages, setMessages] = useState<PartnerMessage[]>([]);
  const [searching, setSearching] = useState(false);

  const fetchPartner = async () => {
    if (!user) return;

    try {
      const q = query(
        collection(db, 'partners'),
        where('userIds', 'array-contains', user.uid),
        where('status', '==', 'active'),
        limit(1)
      );
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        const partnerDoc = snapshot.docs[0];
        const data = partnerDoc.data();
        const partnerUserId = data.userIds.find((id: string) => id !== user.uid);

        // Fetch partner profile
        const partnerProfileSnap = await getDoc(doc(db, 'users', partnerUserId));
        const partnerProfile = partnerProfileSnap.data();

        setPartner({
          id: partnerDoc.id,
          partnerUserId,
          partnerName: partnerProfile?.displayName || 'Partner',
          partnerPhoto: partnerProfile?.photoURL || '',
          partnerGoal: partnerProfile?.profile?.goal || 'general',
          matchedAt: data.matchedAt,
          status: data.status,
          lastCheckIn: data.lastCheckIn,
        });
      }
    } catch (error) {
      console.error('Error fetching partner:', error);
    }
  };

  const findPartner = async () => {
    if (!user || !userProfile) return;
    setSearching(true);

    try {
      // Look for someone with similar goal looking for a partner
      const q = query(
        collection(db, 'partnerQueue'),
        where('goal', '==', userProfile.profile?.goal || 'general'),
        where('userId', '!=', user.uid),
        limit(5)
      );
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        // Found a match
        const matchDoc = snapshot.docs[0];
        const matchData = matchDoc.data();

        // Create partnership
        const partnershipRef = await addDoc(collection(db, 'partners'), {
          userIds: [user.uid, matchData.userId],
          status: 'active',
          matchedAt: serverTimestamp(),
          lastCheckIn: null,
        });

        // Remove both from queue
        await deleteDoc(doc(db, 'partnerQueue', matchDoc.id));

        // Remove self from queue if exists
        const selfQ = query(
          collection(db, 'partnerQueue'),
          where('userId', '==', user.uid)
        );
        const selfSnap = await getDocs(selfQ);
        selfSnap.docs.forEach(async (d) => {
          await deleteDoc(doc(db, 'partnerQueue', d.id));
        });

        // Fetch partner data
        const partnerProfileSnap = await getDoc(doc(db, 'users', matchData.userId));
        const partnerProfile = partnerProfileSnap.data();

        setPartner({
          id: partnershipRef.id,
          partnerUserId: matchData.userId,
          partnerName: partnerProfile?.displayName || 'Partner',
          partnerPhoto: partnerProfile?.photoURL || '',
          partnerGoal: partnerProfile?.profile?.goal || 'general',
          matchedAt: Timestamp.now(),
          status: 'active',
          lastCheckIn: null,
        });

        toast.success('Partner found! 🎉');
      } else {
        // No match found, add to queue
        await addDoc(collection(db, 'partnerQueue'), {
          userId: user.uid,
          userName: userProfile.displayName || 'Anonymous',
          goal: userProfile.profile?.goal || 'general',
          age: userProfile.profile?.age || 25,
          gender: userProfile.profile?.gender || 'other',
          experience: userProfile.profile?.experience || 'beginner',
          createdAt: serverTimestamp(),
        });

        toast('No match found yet. You\'re in the queue! We\'ll notify you when someone matches.', {
          icon: '⏳',
          duration: 5000,
        });
      }
    } catch (error) {
      console.error('Error finding partner:', error);
      toast.error('Failed to find partner');
    } finally {
      setSearching(false);
    }
  };

  const sendMessage = async (content: string) => {
    if (!user || !partner) return;

    try {
      await addDoc(
        collection(db, 'partners', partner.id, 'messages'),
        {
          senderId: user.uid,
          content,
          timestamp: serverTimestamp(),
        }
      );
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    }
  };

  const fetchMessages = async () => {
    if (!partner) return;

    try {
      const q = query(
        collection(db, 'partners', partner.id, 'messages'),
        orderBy('timestamp', 'asc'),
        limit(100)
      );
      const snapshot = await getDocs(q);
      setMessages(
        snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as PartnerMessage[]
      );
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const nudgePartner = async () => {
    if (!partner) return;

    try {
      await addDoc(
        collection(db, 'partners', partner.id, 'messages'),
        {
          senderId: user?.uid,
          content: '👊 Hey! Time to check in! How are you doing today?',
          timestamp: serverTimestamp(),
        }
      );
      toast.success('Nudge sent! 👊');
    } catch (error) {
      toast.error('Failed to send nudge');
    }
  };

  const endPartnership = async () => {
    if (!partner) return;

    try {
      await updateDoc(doc(db, 'partners', partner.id), {
        status: 'ended',
        endedAt: serverTimestamp(),
      });
      setPartner(null);
      setMessages([]);
      toast.success('Partnership ended');
    } catch (error) {
      toast.error('Failed to end partnership');
    }
  };

  return {
    partner,
    messages,
    searching,
    fetchPartner,
    findPartner,
    sendMessage,
    fetchMessages,
    nudgePartner,
    endPartnership,
  };
}

// Leaderboard hook
export function useLeaderboards() {
  const { user } = useAuthStore();
  const [leaderboards, setLeaderboards] = useState<{
    workouts: LeaderboardEntry[];
    calories: LeaderboardEntry[];
    steps: LeaderboardEntry[];
    streaks: LeaderboardEntry[];
    weightLoss: LeaderboardEntry[];
  }>({
    workouts: [],
    calories: [],
    steps: [],
    streaks: [],
    weightLoss: [],
  });
  const [loading, setLoading] = useState(false);

  interface LeaderboardEntry {
    userId: string;
    userName: string;
    userPhoto: string;
    value: number;
    rank: number;
  }

  const fetchLeaderboards = async () => {
    setLoading(true);
    try {
      // Fetch from leaderboard collection (updated weekly by cloud function or client)
      const weekId = getWeekId();
      const leaderboardRef = doc(db, 'leaderboards', weekId);
      const snap = await getDoc(leaderboardRef);

      if (snap.exists()) {
        const data = snap.data();
        setLeaderboards({
          workouts: data.workouts || [],
          calories: data.calories || [],
          steps: data.steps || [],
          streaks: data.streaks || [],
          weightLoss: data.weightLoss || [],
        });
      } else {
        // Generate leaderboards from user data
        await generateLeaderboards(weekId);
      }
    } catch (error) {
      console.error('Error fetching leaderboards:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateLeaderboards = async (weekId: string) => {
    try {
      // Fetch all users who opted in to leaderboards
      const usersQuery = query(
        collection(db, 'users'),
        where('showOnLeaderboard', '==', true),
        limit(100)
      );
      const usersSnap = await getDocs(usersQuery);

      const entries: {
        userId: string;
        userName: string;
        userPhoto: string;
        workouts: number;
        streak: number;
      }[] = [];

      for (const userDoc of usersSnap.docs) {
        const userData = userDoc.data();
        entries.push({
          userId: userDoc.id,
          userName: userData.displayName || 'Anonymous',
          userPhoto: userData.photoURL || '',
          workouts: userData.weeklyWorkouts || 0,
          streak: userData.streaks?.current || 0,
        });
      }

      // Sort by different metrics
      const workouts = entries
        .sort((a, b) => b.workouts - a.workouts)
        .slice(0, 20)
        .map((e, i) => ({ ...e, value: e.workouts, rank: i + 1 }));

      const streaks = entries
        .sort((a, b) => b.streak - a.streak)
        .slice(0, 20)
        .map((e, i) => ({ ...e, value: e.streak, rank: i + 1 }));

      const leaderboardData = {
        workouts,
        calories: [],
        steps: [],
        streaks,
        weightLoss: [],
        updatedAt: serverTimestamp(),
      };

      // Save to Firestore
      const { setDoc } = await import('firebase/firestore');
      await setDoc(doc(db, 'leaderboards', weekId), leaderboardData);
      setLeaderboards(leaderboardData);
    } catch (error) {
      console.error('Error generating leaderboards:', error);
    }
  };

  const getWeekId = () => {
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const weekNum = Math.ceil(
      ((now.getTime() - startOfYear.getTime()) / 86400000 + startOfYear.getDay() + 1) / 7
    );
    return `${now.getFullYear()}-W${weekNum.toString().padStart(2, '0')}`;
  };

  return { leaderboards, loading, fetchLeaderboards };
}