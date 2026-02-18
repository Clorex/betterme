'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Users, UserPlus, Mail, Check, X,
  Trophy, ShoppingCart, Loader2, Heart,
  ChevronRight, Crown
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import {
  collection, doc, getDoc, getDocs, addDoc, updateDoc,
  deleteDoc, query, where, serverTimestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import toast from 'react-hot-toast';

interface FamilyMember {
  userId: string;
  name: string;
  photo: string;
  goal: string;
  role: 'owner' | 'member';
  todayCalories: number;
  todayWorkout: boolean;
  streak: number;
}

export default function FamilyMode() {
  const { user, userProfile } = useAuthStore();
  const [familyId, setFamilyId] = useState<string | null>(null);
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [inviteEmail, setInviteEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [inviting, setInviting] = useState(false);
  const [showInviteForm, setShowInviteForm] = useState(false);

  useEffect(() => {
    loadFamily();
  }, [user]);

  const loadFamily = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      // Check if user belongs to a family
      const q = query(
        collection(db, 'families'),
        where('memberIds', 'array-contains', user.uid)
      );
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        const familyDoc = snapshot.docs[0];
        setFamilyId(familyDoc.id);
        const familyData = familyDoc.data();

        // Fetch member profiles
        const memberProfiles: FamilyMember[] = [];
        for (const memberId of familyData.memberIds) {
          const memberDoc = await getDoc(doc(db, 'users', memberId));
          if (memberDoc.exists()) {
            const memberData = memberDoc.data();
            memberProfiles.push({
              userId: memberId,
              name: memberData.displayName || 'Member',
              photo: memberData.photoURL || '',
              goal: memberData.profile?.goal || 'general',
              role: memberId === familyData.ownerId ? 'owner' : 'member',
              todayCalories: memberData.todayCalories || 0,
              todayWorkout: memberData.todayWorkout || false,
              streak: memberData.streaks?.current || 0,
            });
          }
        }
        setMembers(memberProfiles);
      }
    } catch (error) {
      console.error('Error loading family:', error);
    } finally {
      setLoading(false);
    }
  };

  const createFamily = async () => {
    if (!user) return;

    try {
      const familyRef = await addDoc(collection(db, 'families'), {
        ownerId: user.uid,
        memberIds: [user.uid],
        name: `${userProfile?.displayName || 'My'}'s Family`,
        createdAt: serverTimestamp(),
      });
      setFamilyId(familyRef.id);
      setMembers([
        {
          userId: user.uid,
          name: userProfile?.displayName || 'You',
          photo: userProfile?.photoURL || '',
          goal: userProfile?.profile?.goal || 'general',
          role: 'owner',
          todayCalories: 0,
          todayWorkout: false,
          streak: 0,
        },
      ]);
      toast.success('Family group created! 👨‍👩‍👧‍👦');
    } catch (error) {
      toast.error('Failed to create family group');
    }
  };

  const inviteMember = async () => {
    if (!inviteEmail.trim() || !familyId) return;

    setInviting(true);
    try {
      await addDoc(collection(db, 'familyInvites'), {
        familyId,
        email: inviteEmail.trim().toLowerCase(),
        invitedBy: user?.uid,
        status: 'pending',
        createdAt: serverTimestamp(),
      });

      toast.success(`Invitation sent to ${inviteEmail}!`);
      setInviteEmail('');
      setShowInviteForm(false);
    } catch (error) {
      toast.error('Failed to send invitation');
    } finally {
      setInviting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 size={32} className="animate-spin text-brand-purple" />
      </div>
    );
  }

  // No family yet
  if (!familyId) {
    return (
      <div className="p-4 pb-8">
        <div className="text-center py-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring' }}
            className="w-32 h-32 bg-brand-lavender/20 dark:bg-brand-purple/20 rounded-full mx-auto mb-6 flex items-center justify-center"
          >
            <Heart size={48} className="text-brand-purple" />
          </motion.div>

          <h2 className="text-xl font-bold text-brand-dark dark:text-brand-white mb-2">
            Family & Couples Mode
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs mx-auto mb-6">
            Transform together! Share meal plans, grocery lists, and track progress as a family.
          </p>

          <div className="space-y-3 mb-8 max-w-xs mx-auto text-left">
            {[
              '📊 See each other\'s daily progress',
              '🍽️ Shared meal plans with adjusted portions',
              '🛒 Combined grocery list',
              '🏆 Family challenges & competitions',
            ].map((feature, i) => (
              <div
                key={i}
                className="flex items-center gap-3 bg-gray-50 dark:bg-brand-surface rounded-xl p-3"
              >
                <p className="text-sm text-gray-700 dark:text-gray-300">{feature}</p>
              </div>
            ))}
          </div>

          <button
            onClick={createFamily}
            className="px-8 py-3 bg-brand-purple text-white rounded-2xl font-semibold text-sm flex items-center gap-2 mx-auto"
          >
            <Users size={18} />
            Create Family Group
          </button>
        </div>
      </div>
    );
  }

  // Family dashboard
  return (
    <div className="p-4 pb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-brand-dark dark:text-brand-white">
          My Family
        </h2>
        <button
          onClick={() => setShowInviteForm(true)}
          className="flex items-center gap-1 px-3 py-2 bg-brand-purple text-white rounded-full text-xs font-medium"
        >
          <UserPlus size={14} />
          Invite
        </button>
      </div>

      {/* Members */}
      <div className="space-y-3 mb-6">
        {members.map((member) => (
          <div
            key={member.userId}
            className="bg-white dark:bg-brand-surface rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-brand-lavender/30 dark:bg-brand-purple/30 overflow-hidden flex-shrink-0 flex items-center justify-center">
                {member.photo ? (
                  <img src={member.photo} alt={member.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-brand-purple font-bold">{member.name.charAt(0)}</span>
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold text-sm text-brand-dark dark:text-brand-white">
                    {member.name}
                  </h4>
                  {member.role === 'owner' && (
                    <Crown size={12} className="text-yellow-500" />
                  )}
                  {member.userId === user?.uid && (
                    <span className="text-[10px] text-brand-purple bg-brand-lavender/20 px-1.5 py-0.5 rounded-full">
                      You
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  🎯 {member.goal?.replace(/_/g, ' ')} • 🔥 {member.streak} streak
                </p>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-2">
                  {member.todayWorkout && (
                    <span className="w-6 h-6 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                      <Check size={12} className="text-green-600" />
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3">
        <button className="bg-white dark:bg-brand-surface rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-4 text-left">
          <ShoppingCart size={20} className="text-brand-purple mb-2" />
          <h4 className="text-sm font-semibold text-brand-dark dark:text-brand-white">
            Family Groceries
          </h4>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Combined list
          </p>
        </button>
        <button className="bg-white dark:bg-brand-surface rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-4 text-left">
          <Trophy size={20} className="text-brand-purple mb-2" />
          <h4 className="text-sm font-semibold text-brand-dark dark:text-brand-white">
            Family Challenge
          </h4>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Compete together
          </p>
        </button>
      </div>

      {/* Invite Form Modal */}
      {showInviteForm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="bg-white dark:bg-brand-surface rounded-2xl p-6 max-w-sm w-full"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-brand-dark dark:text-brand-white">
                Invite Family Member
              </h3>
              <button
                onClick={() => setShowInviteForm(false)}
                className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <X size={18} className="text-gray-500" />
              </button>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Enter their email address. They&apos;ll need their own BetterME account.
            </p>
            <div className="flex gap-2">
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="email@example.com"
                className="flex-1 px-4 py-2.5 bg-gray-50 dark:bg-gray-800 rounded-xl text-sm text-brand-dark dark:text-brand-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-purple/30"
              />
              <button
                onClick={inviteMember}
                disabled={!inviteEmail.trim() || inviting}
                className="px-4 py-2.5 bg-brand-purple text-white rounded-xl text-sm font-semibold disabled:opacity-50"
              >
                {inviting ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Mail size={16} />
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}